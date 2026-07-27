import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthRecoveryRedirect() {
  const { isPasswordRecovery } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isPasswordRecovery && location.pathname !== '/reset-password') {
      // Keep the callback parameters intact until Supabase has exchanged them
      // for the short-lived recovery session.
      navigate({
        pathname: '/reset-password',
        search: location.search,
        hash: location.hash,
      }, { replace: true })
    }
  }, [isPasswordRecovery, location.hash, location.pathname, location.search, navigate])

  return null
}
