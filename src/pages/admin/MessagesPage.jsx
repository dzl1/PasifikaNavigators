import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

const PAGE_SIZE = 20

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchMessages = async (currentPage = 0) => {
    setLoading(true)
    setError('')

    const from = currentPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    setLoading(false)

    if (fetchError) {
      setError('Failed to load messages.')
      return
    }

    setMessages(data ?? [])
    setTotal(count ?? 0)
  }

  useEffect(() => {
    fetchMessages(page)
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

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
          <p className="admin-page__sub">{total} message{total !== 1 ? 's' : ''} received</p>
        </div>
        <button className="button button--ghost-dark" onClick={() => fetchMessages(page)} type="button">
          Refresh
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading && !messages.length ? (
        <div className="admin-loading"><span className="admin-spinner" /></div>
      ) : messages.length === 0 ? (
        <p className="admin-empty">No messages yet.</p>
      ) : (
        <div className="messages-layout">
          {/* List */}
          <ul className="messages-list" role="list">
            {messages.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  className={`messages-list__item${selected?.id === msg.id ? ' messages-list__item--active' : ''}`}
                  onClick={() => setSelected(msg)}
                >
                  <div className="messages-list__meta">
                    <strong>{msg.name || 'Unknown'}</strong>
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
                  <h2>{selected.name || 'Unknown sender'}</h2>
                  <time dateTime={selected.created_at} className="messages-detail__date">
                    {formatDate(selected.created_at)}
                  </time>
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
                <a
                  className="button button--primary"
                  href={`mailto:${selected.email}?subject=Re: Your message to Pasifika Navigators`}
                >
                  Reply by email
                </a>
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
    </div>
  )
}
