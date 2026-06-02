import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { session } = useAuth()
  const location = useLocation()

  // Still loading session
  if (session === undefined) {
    return (
      <div className="admin-loading" aria-live="polite" aria-busy="true">
        <span className="admin-spinner" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
