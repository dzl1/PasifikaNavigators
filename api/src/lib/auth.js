import { createRemoteJWKSet, jwtVerify } from 'jose'

let oidcConfigPromise
let jwks

async function getOidcConfig() {
  if (!oidcConfigPromise) {
    const authority = (process.env.ENTRA_AUTHORITY ?? '').replace(/\/$/, '')
    if (!authority) throw new Error('ENTRA_AUTHORITY is not configured.')

    oidcConfigPromise = fetch(`${authority}/v2.0/.well-known/openid-configuration`)
      .then((response) => {
        if (!response.ok) throw new Error(`OpenID configuration request failed (${response.status}).`)
        return response.json()
      })
      .catch((error) => {
        oidcConfigPromise = undefined
        throw error
      })
  }
  return oidcConfigPromise
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

// Verifies the Entra External ID access token on the request.
// Returns { id, email, isAdmin } or null when there is no valid token.
export async function getUser(request) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) return null

  const config = await getOidcConfig()
  jwks ??= createRemoteJWKSet(new URL(config.jwks_uri))

  const audience = process.env.ENTRA_API_AUDIENCE
  if (!audience) throw new Error('ENTRA_API_AUDIENCE is not configured.')

  try {
    const { payload } = await jwtVerify(match[1], jwks, {
      issuer: config.issuer,
      audience: [audience, `api://${audience}`],
    })

    const id = payload.oid ?? payload.sub
    // Only the `email` claim is used for admin checks; preferred_username is
    // not guaranteed to be a verified address.
    const email = String(payload.email ?? '').toLowerCase()
    const roles = Array.isArray(payload.roles) ? payload.roles : []

    return {
      id,
      email,
      isAdmin: roles.includes('Admin') || (Boolean(email) && adminEmails().includes(email)),
    }
  } catch {
    return null
  }
}
