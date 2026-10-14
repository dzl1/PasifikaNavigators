import { createContext, useContext, useEffect, useState } from 'react'
import { EventType } from '@azure/msal-browser'
import { isAuthConfigured, loginScopes, msal } from '../lib/msal.js'

const AuthContext = createContext(null)

// Keeps the { user: { id, email } } shape the pages already rely on.
function toSession(account) {
  if (!account) return null
  const claims = account.idTokenClaims ?? {}
  return {
    account,
    user: {
      id: claims.oid ?? account.localAccountId,
      email: (claims.email ?? account.username ?? '').toLowerCase(),
      name: claims.name ?? '',
    },
  }
}

function startPage(from) {
  return new URL(from || '/', window.location.origin).href
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => toSession(msal?.getActiveAccount()))

  useEffect(() => {
    if (!msal) return undefined

    const callbackId = msal.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
        msal.setActiveAccount(event.payload.account)
      }
      if (
        event.eventType === EventType.LOGIN_SUCCESS
        || event.eventType === EventType.LOGOUT_SUCCESS
        || event.eventType === EventType.ACTIVE_ACCOUNT_CHANGED
      ) {
        setSession(toSession(msal.getActiveAccount()))
      }
    })

    return () => {
      if (callbackId) msal.removeEventCallback(callbackId)
    }
  }, [])

  // Sign-in, sign-up, and password reset all happen on the Entra External ID
  // hosted pages; the browser returns to `from` afterwards.
  const signIn = ({ from, loginHint } = {}) =>
    msal.loginRedirect({ scopes: loginScopes, redirectStartPage: startPage(from), loginHint, prompt: 'login' })

  const signUp = ({ from } = {}) =>
    msal.loginRedirect({ scopes: loginScopes, redirectStartPage: startPage(from), prompt: 'create' })

  const signOut = () =>
    msal.logoutRedirect({ account: msal.getActiveAccount() ?? undefined })

  return (
    <AuthContext.Provider value={{ session, isAuthConfigured, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
