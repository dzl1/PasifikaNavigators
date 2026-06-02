import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logoColor from '../../data/images/logo.png'
import '../../pages/admin/admin.css'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(location.state?.denied ? 'You do not have permission to access the admin panel.' : '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email.trim(), password)

    setLoading(false)

    if (authError) {
      setError('Invalid email or password. Please try again.')
      return
    }

    navigate(from, { replace: true })
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

        <form className="login-form" onSubmit={handleSubmit} noValidate>
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

          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="button button--primary login-form__submit"
            disabled={loading || !email || !password}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

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
