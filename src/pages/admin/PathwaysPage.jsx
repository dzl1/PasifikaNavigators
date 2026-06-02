import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

const LANGUAGES = [
  'Sāmoan', 'Tongan', 'Cook Islands Māori', 'Niuean', 'Tokelauan',
  'Fijian', 'Tuvaluan', 'Kiribati', 'Māori', 'Other',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All levels']

const emptyForm = {
  title: '',
  language: '',
  level: '',
  description: '',
  url: '',
  is_published: false,
}

export default function PathwaysPage() {
  const [pathways, setPathways] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = list, 'new' = new form, object = edit form
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchPathways = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('learning_pathways')
      .select('*')
      .order('language', { ascending: true })
      .order('title', { ascending: true })

    setLoading(false)
    if (fetchError) { setError('Failed to load pathways.'); return }
    setPathways(data ?? [])
  }

  useEffect(() => { fetchPathways() }, [])

  const openNew = () => {
    setForm(emptyForm)
    setSaveError('')
    setEditing('new')
  }

  const openEdit = (pathway) => {
    setForm({
      title: pathway.title ?? '',
      language: pathway.language ?? '',
      level: pathway.level ?? '',
      description: pathway.description ?? '',
      url: pathway.url ?? '',
      is_published: pathway.is_published ?? false,
    })
    setSaveError('')
    setEditing(pathway)
  }

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaveError('')
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      language: form.language,
      level: form.level,
      description: form.description.trim(),
      url: form.url.trim() || null,
      is_published: form.is_published,
    }

    let error

    if (editing === 'new') {
      ;({ error } = await supabase.from('learning_pathways').insert([payload]))
    } else {
      ;({ error } = await supabase.from('learning_pathways').update(payload).eq('id', editing.id))
    }

    setSaving(false)

    if (error) {
      setSaveError('Failed to save. Please try again.')
      return
    }

    setEditing(null)
    fetchPathways()
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('learning_pathways').delete().eq('id', deleteId)
    setDeleteId(null)
    if (!error) fetchPathways()
  }

  if (editing) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1>{editing === 'new' ? 'New Pathway' : 'Edit Pathway'}</h1>
            <p className="admin-page__sub">
              {editing === 'new' ? 'Add a new learning resource.' : `Editing: ${editing.title}`}
            </p>
          </div>
          <button type="button" className="button button--ghost-dark" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>

        <form className="pathway-form" onSubmit={handleSave}>
          <div className="pathway-form__grid">
            <div className="form-field">
              <label htmlFor="pf-title">Title <span aria-hidden="true">*</span></label>
              <input
                id="pf-title" name="title" type="text" required
                value={form.title} onChange={updateField} disabled={saving}
                placeholder="e.g. Introduction to Sāmoan"
              />
            </div>

            <div className="form-field">
              <label htmlFor="pf-language">Language <span aria-hidden="true">*</span></label>
              <select id="pf-language" name="language" required value={form.language} onChange={updateField} disabled={saving}>
                <option value="">Select language</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="pf-level">Level <span aria-hidden="true">*</span></label>
              <select id="pf-level" name="level" required value={form.level} onChange={updateField} disabled={saving}>
                <option value="">Select level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="pf-url">Resource URL</label>
              <input
                id="pf-url" name="url" type="url"
                value={form.url} onChange={updateField} disabled={saving}
                placeholder="https://example.com/resource"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="pf-description">Description</label>
            <textarea
              id="pf-description" name="description" rows={4}
              value={form.description} onChange={updateField} disabled={saving}
              placeholder="Briefly describe what learners will gain from this pathway."
            />
          </div>

          <div className="form-field form-field--checkbox">
            <input
              id="pf-published" name="is_published" type="checkbox"
              checked={form.is_published} onChange={updateField} disabled={saving}
            />
            <label htmlFor="pf-published">Published (visible on the website)</label>
          </div>

          {saveError && <p className="admin-error" role="alert">{saveError}</p>}

          <div className="pathway-form__actions">
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? 'Saving…' : editing === 'new' ? 'Create pathway' : 'Save changes'}
            </button>
            <button type="button" className="button button--ghost-dark" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Learning Pathways</h1>
          <p className="admin-page__sub">{pathways.length} pathway{pathways.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" className="button button--primary" onClick={openNew}>
          + New pathway
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <div className="admin-loading"><span className="admin-spinner" /></div>
      ) : pathways.length === 0 ? (
        <div className="admin-empty">
          <p>No learning pathways yet.</p>
          <button type="button" className="button button--primary" onClick={openNew}>Add the first one</button>
        </div>
      ) : (
        <div className="pathways-table-wrap">
          <table className="pathways-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Language</th>
                <th>Level</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pathways.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title}</strong>
                    {p.description && <p className="pathways-table__desc">{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>}
                  </td>
                  <td>{p.language}</td>
                  <td>{p.level}</td>
                  <td>
                    <span className={`status-badge${p.is_published ? ' status-badge--published' : ''}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="pathways-table__actions">
                    <button type="button" className="action-btn" onClick={() => openEdit(p)}>Edit</button>
                    <button type="button" className="action-btn action-btn--danger" onClick={() => setDeleteId(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="admin-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="admin-dialog">
            <h2 id="delete-dialog-title">Delete pathway?</h2>
            <p>This cannot be undone.</p>
            <div className="admin-dialog__actions">
              <button type="button" className="button button--danger" onClick={confirmDelete}>Delete</button>
              <button type="button" className="button button--ghost-dark" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
