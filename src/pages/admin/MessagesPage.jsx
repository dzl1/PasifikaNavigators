import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js'

const PAGE_SIZE = 20

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [view, setView] = useState('visible')
  const [processingId, setProcessingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchMessages = async (currentPage = 0, currentView = view) => {
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Authentication/database access is not configured yet.')
      return
    }

    const from = currentPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const showHidden = currentView === 'hidden'

    const { data, count, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .eq('is_hidden', showHidden)
      .order('created_at', { ascending: false })
      .range(from, to)

    setLoading(false)

    if (fetchError) {
      console.error('Supabase error (contact_messages select):', fetchError)
      const setupHint = fetchError.code === '42P01'
        ? ' The contact_messages table may not exist yet. Run supabase/contact_messages.sql in your Supabase SQL editor.'
        : ''
      const columnHint = fetchError.code === '42703'
        ? ' The message status columns may be missing. Re-run the updated supabase/contact_messages.sql file in your Supabase SQL editor.'
        : ''
      const permissionHint = fetchError.code === '42501'
        ? ' The admin read policy or table grant is missing. Re-run the updated supabase/contact_messages.sql file in your Supabase SQL editor.'
        : ''
      setError(`Failed to load messages: ${fetchError.message} (code: ${fetchError.code}).${setupHint}${columnHint}${permissionHint}`)
      return
    }

    const nextMessages = data ?? []
    setMessages(nextMessages)
    setTotal(count ?? 0)
    setSelected((current) => {
      if (current && nextMessages.some((message) => message.id === current.id)) {
        return current
      }
      return nextMessages[0] ?? null
    })
  }

  useEffect(() => {
    fetchMessages(page, view)
  }, [page, view])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const deleteTarget = messages.find((message) => message.id === deleteId) ?? (selected?.id === deleteId ? selected : null)

  const changeView = (nextView) => {
    setSelected(null)
    setPage(0)
    setView(nextView)
  }

  const patchMessage = async (message, values) => {
    setProcessingId(message.id)
    setError('')

    const { data, error: updateError } = await supabase
      .from('contact_messages')
      .update(values)
      .eq('id', message.id)
      .select()
      .single()

    setProcessingId(null)

    if (updateError) {
      console.error('Supabase error (contact_messages update):', updateError)
      setError(`Failed to update message: ${updateError.message} (code: ${updateError.code}). Re-run supabase/contact_messages.sql if admin update access is missing.`)
      return
    }

    const updated = data ?? { ...message, ...values }
    const movedOutOfView = Boolean(updated.is_hidden) !== (view === 'hidden')

    if (movedOutOfView) {
      await fetchMessages(page, view)
      return
    }

    setMessages((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setSelected((current) => (current?.id === updated.id ? updated : current))
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    setProcessingId(deleteId)
    setError('')

    const { error: deleteError } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', deleteId)

    setProcessingId(null)
    setDeleteId(null)

    if (deleteError) {
      console.error('Supabase error (contact_messages delete):', deleteError)
      setError(`Failed to delete message: ${deleteError.message} (code: ${deleteError.code}). Re-run supabase/contact_messages.sql if admin delete access is missing.`)
      return
    }

    if (selected?.id === deleteId) {
      setSelected(null)
    }

    const nextTotal = Math.max(total - 1, 0)
    const lastPage = Math.max(Math.ceil(nextTotal / PAGE_SIZE) - 1, 0)

    if (page > lastPage) {
      setPage(lastPage)
    } else {
      await fetchMessages(page, view)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-NZ', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Messages</h1>
          <p className="admin-page__sub">
            {total} {view === 'hidden' ? 'hidden' : 'visible'} message{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="button button--ghost-dark" onClick={() => fetchMessages(page)} type="button">
          Refresh
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="messages-toolbar" aria-label="Message views">
        <button
          type="button"
          className={`messages-toolbar__tab${view === 'visible' ? ' messages-toolbar__tab--active' : ''}`}
          onClick={() => changeView('visible')}
        >
          Visible messages
        </button>
        <button
          type="button"
          className={`messages-toolbar__tab${view === 'hidden' ? ' messages-toolbar__tab--active' : ''}`}
          onClick={() => changeView('hidden')}
        >
          Hidden messages
        </button>
      </div>

      {loading && !messages.length ? (
        <div className="admin-loading"><span className="admin-spinner" /></div>
      ) : messages.length === 0 ? (
        <p className="admin-empty">
          {view === 'hidden' ? 'No hidden messages.' : 'No visible messages yet.'}
        </p>
      ) : (
        <div className="messages-layout">
          {/* List */}
          <ul className="messages-list" role="list">
            {messages.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  className={[
                    'messages-list__item',
                    selected?.id === msg.id ? 'messages-list__item--active' : '',
                    msg.is_flagged ? 'messages-list__item--flagged' : '',
                    msg.is_hidden ? 'messages-list__item--hidden' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelected(msg)}
                >
                  <div className="messages-list__meta">
                    <strong>
                      {msg.name || 'Unknown'}
                      {msg.is_flagged && <span className="messages-list__status">Flagged</span>}
                    </strong>
                    <time dateTime={msg.created_at}>{formatDate(msg.created_at)}</time>
                  </div>
                  <p className="messages-list__preview">{msg.email}</p>
                  <p className="messages-list__preview">{msg.message?.slice(0, 80)}{msg.message?.length > 80 ? '…' : ''}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* Detail panel */}
          <div className="messages-detail">
            {selected ? (
              <>
                <div className="messages-detail__header">
                  <div>
                    <h2>{selected.name || 'Unknown sender'}</h2>
                    <time dateTime={selected.created_at} className="messages-detail__date">
                      {formatDate(selected.created_at)}
                    </time>
                  </div>
                  <div className="messages-detail__badges" aria-label="Message status">
                    {selected.is_flagged && <span className="status-badge status-badge--flagged">Flagged</span>}
                    {selected.is_hidden && <span className="status-badge">Hidden</span>}
                  </div>
                </div>
                <dl className="messages-detail__fields">
                  <dt>Email</dt>
                  <dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd>
                  {selected.phone && (
                    <>
                      <dt>Phone</dt>
                      <dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd>
                    </>
                  )}
                  {selected.source && (
                    <>
                      <dt>Source</dt>
                      <dd>{selected.source}</dd>
                    </>
                  )}
                </dl>
                <div className="messages-detail__body">
                  <h3>Message</h3>
                  <p>{selected.message}</p>
                </div>
                <div className="messages-detail__actions">
                  <a
                    className="button button--primary"
                    href={`mailto:${selected.email}?subject=Re: Your message to Pasifika Navigators`}
                  >
                    Reply by email
                  </a>
                  <button
                    type="button"
                    className="button button--ghost-dark"
                    disabled={processingId === selected.id}
                    onClick={() => patchMessage(selected, { is_flagged: !selected.is_flagged })}
                  >
                    {selected.is_flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button
                    type="button"
                    className="button button--ghost-dark"
                    disabled={processingId === selected.id}
                    onClick={() => patchMessage(selected, { is_hidden: !selected.is_hidden })}
                  >
                    {selected.is_hidden ? 'Restore' : 'Hide'}
                  </button>
                  <button
                    type="button"
                    className="button button--danger"
                    disabled={processingId === selected.id}
                    onClick={() => setDeleteId(selected.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <p className="messages-detail__placeholder">Select a message to read it.</p>
            )}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="button button--ghost-dark"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            type="button"
            className="button button--ghost-dark"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {deleteId && (
        <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-message-dialog-title">
          <div className="admin-dialog">
            <h2 id="delete-message-dialog-title">Delete message?</h2>
            <p>
              This will permanently delete {deleteTarget?.name ? `${deleteTarget.name}'s message` : 'this message'}.
              This cannot be undone.
            </p>
            <div className="admin-dialog__actions">
              <button type="button" className="button button--danger" onClick={confirmDelete} disabled={processingId === deleteId}>
                Delete
              </button>
              <button type="button" className="button button--ghost-dark" onClick={() => setDeleteId(null)} disabled={processingId === deleteId}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
