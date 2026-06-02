import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'
import logoColor from '../../data/images/logo.png'
import './admin.css'

const MIN_PASSWORD_LENGTH = 8

export default function RegisterPage() {
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.'
    if (password.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    if (password !== confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email.trim(), password)
    setLoading(false)

    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in.')
      } else {
        setError(signUpError.message ?? 'Registration failed. Please try again.')
      }
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="login-card__brand">
            <img src={logoColor} alt="Pasifika Navigators" />
          </div>
          <div className="login-card__header">
            <h1>Check your email</h1>
            <p>
              We've sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account, then sign in.
            </p>
          </div>
          <div className="register-done">
            <Link className="button button--primary login-form__submit" to="/admin/login">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logoColor} alt="Pasifika Navigators" />
        </div>

        <div className="login-card__header">
          <h1>Create an account</h1>
          <p>Register to access Pasifika Navigators.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password">
              Password
              <span className="form-field__hint"> (min. {MIN_PASSWORD_LENGTH} characters)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="button button--primary login-form__submit"
            disabled={loading || !email || !password || !confirmPassword}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="login-card__back">
          Already have an account? <Link to="/admin/login">Sign in</Link>
        </p>
        <p className="login-card__back">
          <a href="/">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
