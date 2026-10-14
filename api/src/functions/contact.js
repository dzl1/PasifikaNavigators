import { app } from '@azure/functions'
import { query } from '../lib/db.js'
import { HttpError, handler, json, noContent, readJson, requireUuid } from '../lib/http.js'

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Public: website contact form submission.
app.http('contactCreate', {
  route: 'contact',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: handler('public', async (request) => {
    const body = await readJson(request)
    const name = text(body.name)
    const email = text(body.email)
    const phone = text(body.phone) || null
    const message = text(body.message)

    if (name.length < 2 || name.length > 120) throw new HttpError(400, 'Please enter your name.')
    if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address.')
    if (phone && phone.length > 40) throw new HttpError(400, 'Phone number is too long.')
    if (message.length < 10 || message.length > 4000) throw new HttpError(400, 'Message must be between 10 and 4000 characters.')

    await query(
      `insert into contact_messages (name, email, phone, message, source)
       values ($1, $2, $3, $4, 'website_contact_page')`,
      [name, email, phone, message],
    )
    return json(201, { ok: true })
  }),
})

// Admin: paginated message list for the visible or hidden view.
app.http('messagesList', {
  route: 'manage/messages',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: handler('admin', async (request) => {
    const hidden = request.query.get('hidden') === 'true'
    const pageSize = Math.min(Math.max(Number.parseInt(request.query.get('pageSize'), 10) || 20, 1), 100)
    const page = Math.max(Number.parseInt(request.query.get('page'), 10) || 0, 0)

    const [items, count] = await Promise.all([
      query(
        `select * from contact_messages where is_hidden = $1
         order by created_at desc limit $2 offset $3`,
        [hidden, pageSize, page * pageSize],
      ),
      query('select count(*)::int as total from contact_messages where is_hidden = $1', [hidden]),
    ])

    return json(200, { items: items.rows, total: count.rows[0].total })
  }),
})

// Admin: flag/unflag or hide/restore a message.
app.http('messagesUpdate', {
  route: 'manage/messages/{id}',
  methods: ['PATCH', 'DELETE'],
  authLevel: 'anonymous',
  handler: handler('admin', async (request) => {
    const id = requireUuid(request.params.id)

    if (request.method === 'DELETE') {
      const result = await query('delete from contact_messages where id = $1', [id])
      if (!result.rowCount) throw new HttpError(404, 'Message not found.')
      return noContent()
    }

    const body = await readJson(request)
    const isFlagged = typeof body.is_flagged === 'boolean' ? body.is_flagged : null
    const isHidden = typeof body.is_hidden === 'boolean' ? body.is_hidden : null
    if (isFlagged === null && isHidden === null) throw new HttpError(400, 'Nothing to update.')

    const result = await query(
      `update contact_messages
       set is_flagged = coalesce($2, is_flagged), is_hidden = coalesce($3, is_hidden)
       where id = $1 returning *`,
      [id, isFlagged, isHidden],
    )
    if (!result.rowCount) throw new HttpError(404, 'Message not found.')
    return json(200, result.rows[0])
  }),
})

// Admin: dashboard counts.
app.http('manageStats', {
  route: 'manage/stats',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: handler('admin', async () => {
    const result = await query(
      `select (select count(*)::int from contact_messages) as messages,
              (select count(*)::int from learning_pathways) as pathways`,
    )
    return json(200, result.rows[0])
  }),
})
