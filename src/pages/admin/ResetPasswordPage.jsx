import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'
import logoColor from '../../data/images/logo.png'
import './admin.css'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet.')
      return
    }

    setLoading(true)
    const { error: updateError } = await updatePassword(password)

    if (updateError) {
      setLoading(false)
      setError(updateError.message ?? 'Could not update your password. Please request a new reset link.')
      return
    }

    await signOut()
    setLoading(false)
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
            <h1>Password updated</h1>
            <p>Your password has been changed. You can now sign in with your new password.</p>
          </div>
          <div className="register-done">
            <Link className="button button--primary login-form__submit" to="/login">
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
          <h1>Choose new password</h1>
          <p>Enter a new password for your Pasifika Navigators account.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="reset-password">
              New password
              <span className="form-field__hint"> (min. {MIN_PASSWORD_LENGTH} characters)</span>
            </label>
            <input
              id="reset-password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reset-confirm-password">Confirm new password</label>
            <input
              id="reset-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Updating password…' : 'Update password'}
          </button>
        </form>

        <p className="login-card__back">
          Need a new link? <Link to="/login">Request another reset email</Link>
        </p>
      </div>
    </div>
  )
}
