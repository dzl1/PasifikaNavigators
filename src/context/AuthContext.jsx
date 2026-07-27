import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

function hasRecoveryParams() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type') === 'recovery'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(hasRecoveryParams)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    setIsPasswordRecovery(false)
    return supabase.auth.signOut()
  }

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const resetPasswordForEmail = (email, redirectTo) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo })

  const updatePassword = (password) =>
    supabase.auth.updateUser({ password })

  const updateProfile = (profile) =>
    supabase.auth.updateUser({ data: profile })

  const finishPasswordRecovery = () => setIsPasswordRecovery(false)

  return (
    <AuthContext.Provider value={{
      session,
      isPasswordRecovery,
      signIn,
      signOut,
      signUp,
      resetPasswordForEmail,
      updatePassword,
      updateProfile,
      finishPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
