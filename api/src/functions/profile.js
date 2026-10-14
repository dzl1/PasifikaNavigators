import { app } from '@azure/functions'
import { query } from '../lib/db.js'
import { HttpError, handler, json, readJson } from '../lib/http.js'

const DEFAULT_PROFILE = { display_name: '', profile_visible: false, product_updates: true }

// Signed-in users: profile and privacy settings.
app.http('profile', {
  route: 'profile',
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  handler: handler('user', async (request, context, user) => {
    if (request.method === 'GET') {
      const result = await query(
        'select display_name, profile_visible, product_updates from profiles where user_id = $1',
        [user.id],
      )
      return json(200, result.rows[0] ?? DEFAULT_PROFILE)
    }

    const body = await readJson(request)
    const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''
    if (displayName.length > 80) throw new HttpError(400, 'Display name must be 80 characters or fewer.')

    const result = await query(
      `insert into profiles (user_id, email, display_name, profile_visible, product_updates)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id) do update set
         email = excluded.email,
         display_name = excluded.display_name,
         profile_visible = excluded.profile_visible,
         product_updates = excluded.product_updates
       returning display_name, profile_visible, product_updates`,
      [user.id, user.email || null, displayName, body.profile_visible === true, body.product_updates !== false],
    )
    return json(200, result.rows[0])
  }),
})
