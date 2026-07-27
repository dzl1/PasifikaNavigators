import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ADMIN_EMAIL } from '../lib/constants.js'

export default function ProtectedRoute({ children, adminOnly = true }) {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const isDenied = Boolean(
    adminOnly
    && session
    && session.user?.email?.toLowerCase() !== ADMIN_EMAIL
  )

  useEffect(() => {
    if (isDenied) {
      signOut()
    }
  }, [isDenied, signOut])

  // Still loading session
  if (session === undefined) {
    return (
      <div className="admin-loading" aria-live="polite" aria-busy="true">
        <span className="admin-spinner" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Email-based super-admin guard
  if (isDenied) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, denied: true }}
        replace
      />
    )
  }

  return children
}
