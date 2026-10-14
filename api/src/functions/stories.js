import { app } from '@azure/functions'
import { query } from '../lib/db.js'
import { HttpError, handler, json, noContent, readJson, requireUuid } from '../lib/http.js'

const MAX_POINTS_BYTES = 500_000
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function readPoints(value) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new HttpError(400, 'Story points must be a list.')
  const serialised = JSON.stringify(value)
  if (serialised.length > MAX_POINTS_BYTES) throw new HttpError(413, 'This story is too large to save.')
  return serialised
}

function readText(value, field, maxLength) {
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text.`)
  const trimmed = value.trim()
  if (trimmed.length > maxLength) throw new HttpError(400, `${field} is too long.`)
  return trimmed
}

// Public: a single published story by its share slug.
app.http('storiesPublic', {
  route: 'public/stories/{slug}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: handler('public', async (request) => {
    const result = await query(
      `select id, slug, title, description, points, is_published, created_at, updated_at
       from stories where slug = $1 and is_published = true`,
      [request.params.slug],
    )
    if (!result.rowCount) throw new HttpError(404, 'This story is not available.')
    return json(200, result.rows[0])
  }),
})

// Signed-in users: list and create their own stories.
app.http('storiesCollection', {
  route: 'stories',
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: handler('user', async (request, context, user) => {
    if (request.method === 'GET') {
      const result = await query(
        'select * from stories where owner_id = $1 order by updated_at desc',
        [user.id],
      )
      return json(200, result.rows)
    }

    const body = await readJson(request)
    const title = readText(body.title, 'Title', 200) || 'Untitled story'
    const slug = typeof body.slug === 'string' ? body.slug : ''
    if (!SLUG_PATTERN.test(slug) || slug.length > 120) throw new HttpError(400, 'Invalid story slug.')

    try {
      const result = await query(
        `insert into stories (owner_id, slug, title, points)
         values ($1, $2, $3, $4::jsonb) returning *`,
        [user.id, slug, title, readPoints(body.points) ?? '[]'],
      )
      return json(201, result.rows[0])
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'A story with this link already exists. Please try again.')
      throw error
    }
  }),
})

// Signed-in users: read, update, or delete one of their own stories.
app.http('storiesItem', {
  route: 'stories/{id}',
  methods: ['GET', 'PATCH', 'DELETE'],
  authLevel: 'anonymous',
  handler: handler('user', async (request, context, user) => {
    const id = requireUuid(request.params.id)

    if (request.method === 'GET') {
      const result = await query('select * from stories where id = $1 and owner_id = $2', [id, user.id])
      if (!result.rowCount) throw new HttpError(404, 'Story not found.')
      return json(200, result.rows[0])
    }

    if (request.method === 'DELETE') {
      const result = await query('delete from stories where id = $1 and owner_id = $2', [id, user.id])
      if (!result.rowCount) throw new HttpError(404, 'Story not found.')
      return noContent()
    }

    const body = await readJson(request)
    const title = readText(body.title, 'Title', 200)
    const description = readText(body.description, 'Description', 4000)
    const points = readPoints(body.points)
    const isPublished = typeof body.is_published === 'boolean' ? body.is_published : null

    const result = await query(
      `update stories set
         title = coalesce(nullif($3, ''), title),
         description = coalesce($4, description),
         points = coalesce($5::jsonb, points),
         is_published = coalesce($6, is_published)
       where id = $1 and owner_id = $2
       returning *`,
      [id, user.id, title ?? null, description ?? null, points ?? null, isPublished],
    )
    if (!result.rowCount) throw new HttpError(404, 'Story not found.')
    return json(200, result.rows[0])
  }),
})
