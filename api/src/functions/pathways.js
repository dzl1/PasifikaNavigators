import { app } from '@azure/functions'
import { query } from '../lib/db.js'
import { HttpError, handler, json, noContent, readJson, requireUuid } from '../lib/http.js'

function toPathway(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const language = typeof body.language === 'string' ? body.language.trim() : ''
  const level = typeof body.level === 'string' ? body.level.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : null

  if (!title || !language || !level) throw new HttpError(400, 'Title, language, and level are required.')
  if (url && !/^https?:\/\//i.test(url)) throw new HttpError(400, 'URL must start with http:// or https://.')

  return [title, language, level, description, url, body.is_published === true]
}

// Public: published pathways for the website.
app.http('pathwaysPublic', {
  route: 'pathways',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: handler('public', async () => {
    const result = await query(
      'select * from learning_pathways where is_published = true order by language, title',
    )
    return json(200, result.rows)
  }),
})

app.http('pathwaysManage', {
  route: 'manage/pathways',
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: handler('admin', async (request) => {
    if (request.method === 'GET') {
      const result = await query('select * from learning_pathways order by language, title')
      return json(200, result.rows)
    }

    const result = await query(
      `insert into learning_pathways (title, language, level, description, url, is_published)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      toPathway(await readJson(request)),
    )
    return json(201, result.rows[0])
  }),
})

app.http('pathwaysManageItem', {
  route: 'manage/pathways/{id}',
  methods: ['PUT', 'DELETE'],
  authLevel: 'anonymous',
  handler: handler('admin', async (request) => {
    const id = requireUuid(request.params.id)

    if (request.method === 'DELETE') {
      const result = await query('delete from learning_pathways where id = $1', [id])
      if (!result.rowCount) throw new HttpError(404, 'Pathway not found.')
      return noContent()
    }

    const result = await query(
      `update learning_pathways
       set title = $2, language = $3, level = $4, description = $5, url = $6, is_published = $7
       where id = $1 returning *`,
      [id, ...toPathway(await readJson(request))],
    )
    if (!result.rowCount) throw new HttpError(404, 'Pathway not found.')
    return json(200, result.rows[0])
  }),
})
