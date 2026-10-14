import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { apiScopes, msal } from './msal.js'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const isApiConfigured = Boolean(apiBaseUrl)

async function getAccessToken() {
  const account = msal?.getActiveAccount()
  if (!account) return null

  try {
    const result = await msal.acquireTokenSilent({ account, scopes: apiScopes })
    return result.accessToken
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msal.acquireTokenRedirect({ account, scopes: apiScopes })
    }
    throw error
  }
}

// Calls the Azure Functions API. Resolves to { data, error } so pages can
// handle failures the same way they did with the previous client.
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  if (!isApiConfigured) {
    return { data: null, error: { message: 'The API is not configured yet.' } }
  }

  try {
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (auth) {
      const token = await getAccessToken()
      if (!token) return { data: null, error: { message: 'You need to sign in first.', status: 401 } }
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    const payload = response.status === 204 ? null : await response.json().catch(() => null)

    if (!response.ok) {
      return {
        data: null,
        error: { message: payload?.error ?? `Request failed (${response.status}).`, status: response.status },
      }
    }

    return { data: payload, error: null }
  } catch (error) {
    console.error(`API error (${method} ${path}):`, error)
    return { data: null, error: { message: error.message ?? 'Network error. Please try again.' } }
  }
}
