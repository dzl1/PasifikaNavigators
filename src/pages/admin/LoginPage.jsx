import { useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logoColor from '../../data/images/logo.png'
import '../../pages/admin/admin.css'

export default function LoginPage() {
  const { session, isAuthConfigured, signIn } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'
  const denied = Boolean(location.state?.denied)

  const [error, setError] = useState(denied ? 'You do not have permission to access the admin panel.' : '')
  const [loading, setLoading] = useState(false)

  if (session && !denied) {
    return <Navigate to={from} replace />
  }

  const handleSignIn = async () => {
    setError('')

    if (!isAuthConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    try {
      // Navigates to the Microsoft Entra sign-in page, which also offers
      // "Forgot password?" for resets.
      await signIn({ from })
    } catch (authError) {
      console.error('Sign-in error:', authError)
      setLoading(false)
      setError('Could not start sign-in. Please try again.')
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logoColor} alt="Pasifika Navigators" />
        </div>

        <div className="login-card__header">
          <h1>Sign in</h1>
          <p>Welcome back to Pasifika Navigators.</p>
        </div>

        <div className="login-form">
          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <button
            type="button"
            className="button button--primary login-form__submit"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? 'Opening sign-in…' : (session ? 'Sign in with a different account' : 'Sign in')}
          </button>
        </div>

        <p className="login-card__back">
          Forgot your password? Choose “Forgot password?” on the sign-in screen.
        </p>

        <p className="login-card__back">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <p className="login-card__back">
          <a href="/">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
