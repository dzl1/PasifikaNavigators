import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logoColor from '../../data/images/logo.png'
import './admin.css'

export default function RegisterPage() {
  const { session, isAuthConfigured, signUp } = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) {
    return <Navigate to="/profile" replace />
  }

  const handleSignUp = async () => {
    setError('')

    if (!isAuthConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    try {
      // Microsoft Entra handles the email verification code and password.
      await signUp({ from: '/profile' })
    } catch (authError) {
      console.error('Sign-up error:', authError)
      setLoading(false)
      setError('Could not start registration. Please try again.')
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logoColor} alt="Pasifika Navigators" />
        </div>

        <div className="login-card__header">
          <h1>Create an account</h1>
          <p>Register to access Pasifika Navigators. We will email you a code to verify your address.</p>
        </div>

        <div className="login-form">
          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <button
            type="button"
            className="button button--primary login-form__submit"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? 'Opening registration…' : 'Create account'}
          </button>
        </div>

        <p className="login-card__back">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="login-card__back">
          <a href="/">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
