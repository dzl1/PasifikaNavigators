import { getUser } from './auth.js'

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const json = (status, body) => ({ status, jsonBody: body })
export const noContent = () => ({ status: 204 })

export async function readJson(request) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
    return body
  } catch {
    throw new HttpError(400, 'Request body must be a JSON object.')
  }
}

export function requireUuid(value) {
  if (!UUID_PATTERN.test(value ?? '')) throw new HttpError(404, 'Not found.')
  return value
}

// Wraps a handler with authentication and consistent error responses.
// access: 'public' | 'user' | 'admin'
export function handler(access, fn) {
  return async (request, context) => {
    try {
      let user = null
      if (access !== 'public') {
        user = await getUser(request)
        if (!user) throw new HttpError(401, 'You need to sign in first.')
        if (access === 'admin' && !user.isAdmin) throw new HttpError(403, 'You do not have permission to do that.')
      }
      return await fn(request, context, user)
    } catch (error) {
      if (error instanceof HttpError) return json(error.status, { error: error.message })
      context.error(error)
      return json(500, { error: 'Something went wrong. Please try again.' })
    }
  }
}
