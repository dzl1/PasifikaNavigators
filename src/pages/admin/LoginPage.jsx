import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'
import logoColor from '../../data/images/logo.png'
import '../../pages/admin/admin.css'

const PRODUCTION_URL = 'https://www.localmapr.com'

export default function LoginPage() {
  const { signIn, resetPasswordForEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(location.state?.denied ? 'You do not have permission to access the admin panel.' : '')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)

    const { error: authError } = await signIn(email.trim(), password)

    setLoading(false)

    if (authError) {
      setError('Invalid email or password. Please try again.')
      return
    }

    navigate(from, { replace: true })
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    // Password-reset emails must always point at the deployed app. Using the
    // browser origin here makes emails requested during local testing contain
    // a localhost URL.
    const redirectTo = `${PRODUCTION_URL}/reset-password`
    const { error: resetError } = await resetPasswordForEmail(trimmedEmail, redirectTo)
    setLoading(false)

    if (resetError) {
      setError(resetError.message ?? 'Could not send a password reset email. Please try again.')
      return
    }

    setMessage(`Password reset instructions have been sent to ${trimmedEmail}.`)
  }

  const showResetMode = () => {
    setError('')
    setMessage('')
    setMode('reset')
  }

  const showSignInMode = () => {
    setError('')
    setMessage('')
    setMode('sign-in')
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logoColor} alt="Pasifika Navigators" />
        </div>

        <div className="login-card__header">
          <h1>{mode === 'reset' ? 'Reset password' : 'Sign in'}</h1>
          <p>
            {mode === 'reset'
              ? 'Enter your email and we will send you a password reset link.'
              : 'Welcome back to Pasifika Navigators.'}
          </p>
        </div>

        <form className="login-form" onSubmit={mode === 'reset' ? handleResetPassword : handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          {mode === 'sign-in' && (
            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}
          {message && (
            <p className="login-form__success" role="status">{message}</p>
          )}

          <button
            type="submit"
            className="button button--primary login-form__submit"
            disabled={loading || !email || (mode === 'sign-in' && !password)}
          >
            {loading
              ? (mode === 'reset' ? 'Sending reset link…' : 'Signing in…')
              : (mode === 'reset' ? 'Send reset link' : 'Sign in')}
          </button>
        </form>

        <p className="login-card__back">
          {mode === 'reset' ? (
            <button type="button" className="login-card__text-button" onClick={showSignInMode}>
              Back to sign in
            </button>
          ) : (
            <button type="button" className="login-card__text-button" onClick={showResetMode}>
              Forgot password?
            </button>
          )}
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
