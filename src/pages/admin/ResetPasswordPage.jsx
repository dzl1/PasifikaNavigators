import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logoColor from '../../data/images/logo.png'
import './admin.css'

// Password resets are handled by Microsoft Entra's hosted sign-in page. This
// route remains so older reset links and bookmarks land somewhere useful.
export default function ResetPasswordPage() {
  const { session, isAuthConfigured, signIn } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError('')

    if (!isAuthConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    try {
      await signIn({ from: '/profile', loginHint: session?.user?.email || undefined })
    } catch (authError) {
      console.error('Sign-in error:', authError)
      setLoading(false)
      setError('Could not open the sign-in page. Please try again.')
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logoColor} alt="Pasifika Navigators" />
        </div>

        <div className="login-card__header">
          <h1>Reset password</h1>
          <p>
            Continue to the sign-in page and choose “Forgot password?”. We will email you a code
            so you can choose a new password.
          </p>
        </div>

        <div className="login-form">
          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <button
            type="button"
            className="button button--primary login-form__submit"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Opening sign-in…' : 'Continue'}
          </button>
        </div>

        <p className="login-card__back">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
