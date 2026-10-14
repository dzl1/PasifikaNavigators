import { PublicClientApplication } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID
const authority = import.meta.env.VITE_ENTRA_AUTHORITY
const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE

export const isAuthConfigured = Boolean(clientId && authority && apiScope)

// Scopes requested at sign-in. The API scope is included so the first token
// request after login can be served silently from the cache.
export const loginScopes = ['openid', 'profile', 'email', ...(apiScope ? [apiScope] : [])]
export const apiScopes = apiScope ? [apiScope] : []

export const msal = isAuthConfigured
  ? new PublicClientApplication({
    auth: {
      clientId,
      authority,
      knownAuthorities: [new URL(authority).host],
      redirectUri: `${window.location.origin}/`,
      postLogoutRedirectUri: `${window.location.origin}/`,
    },
    cache: { cacheLocation: 'localStorage' },
  })
  : null

// Must finish before React renders so the redirect response in the URL is
// consumed before the router can rewrite it.
export async function initializeMsal() {
  if (!msal) return
  await msal.initialize()
  const result = await msal.handleRedirectPromise()
  const account = result?.account ?? msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null
  if (account) msal.setActiveAccount(account)
}
