import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/apiClient.js'
import './ProfilePage.css'

export default function ProfilePage() {
  const { session, signIn, signOut } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [profileVisible, setProfileVisible] = useState(false)
  const [productUpdates, setProductUpdates] = useState(true)
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    let active = true
    apiRequest('/profile').then(({ data, error }) => {
      if (!active) return
      if (error) {
        setProfileStatus({ type: 'error', message: error.message ?? 'Could not load your settings.' })
      } else {
        setDisplayName(data.display_name || session?.user?.name || '')
        setProfileVisible(data.profile_visible)
        setProductUpdates(data.product_updates)
      }
      setLoadingProfile(false)
    })
    return () => { active = false }
  }, [session?.user?.id])

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileStatus({ type: '', message: '' })
    setSavingProfile(true)

    const { error } = await apiRequest('/profile', {
      method: 'PUT',
      body: {
        display_name: displayName.trim(),
        profile_visible: profileVisible,
        product_updates: productUpdates,
      },
    })

    setSavingProfile(false)
    setProfileStatus(error
      ? { type: 'error', message: error.message ?? 'Could not save your settings.' }
      : { type: 'success', message: 'Your profile and privacy settings have been saved.' })
  }

  // Passwords are managed by Microsoft Entra; its sign-in page offers
  // "Forgot password?" which emails a one-time code.
  const handlePasswordReset = async () => {
    setResettingPassword(true)
    try {
      await signIn({ from: '/profile', loginHint: session?.user?.email || undefined })
    } catch (error) {
      console.error('Sign-in error:', error)
      setResettingPassword(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="site-shell profile-shell">
      <SiteHeader />
      <main className="profile-page">
        <header className="profile-heading">
          <p className="section-kicker">Your account</p>
          <h1>Profile & settings</h1>
          <p>Manage your account details, privacy preferences, and password.</p>
        </header>

        <div className="profile-grid">
          <section className="settings-card" aria-labelledby="profile-details-heading">
            <div className="settings-card__heading">
              <h2 id="profile-details-heading">Profile</h2>
              <p>Your basic account information.</p>
            </div>
            <form className="settings-form" onSubmit={handleProfileSave}>
              <div className="form-field">
                <label htmlFor="profile-email">Email address</label>
                <input id="profile-email" type="email" value={session?.user?.email ?? ''} disabled />
                <span className="settings-field-help">Your sign-in email is managed by your account provider.</span>
              </div>
              <div className="form-field">
                <label htmlFor="display-name">Display name</label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="How you would like to be known"
                  disabled={savingProfile || loadingProfile}
                />
              </div>

              <div className="settings-divider" />
              <div className="settings-card__heading settings-card__heading--compact">
                <h2>Privacy</h2>
                <p>Choose how your account information is used.</p>
              </div>
              <label className="settings-toggle">
                <span>
                  <strong>Public profile</strong>
                  <small>Allow your display name to appear in community areas.</small>
                </span>
                <input
                  type="checkbox"
                  checked={profileVisible}
                  onChange={(event) => setProfileVisible(event.target.checked)}
                  disabled={savingProfile || loadingProfile}
                />
              </label>
              <label className="settings-toggle">
                <span>
                  <strong>Product updates</strong>
                  <small>Receive occasional news about programmes and new features.</small>
                </span>
                <input
                  type="checkbox"
                  checked={productUpdates}
                  onChange={(event) => setProductUpdates(event.target.checked)}
                  disabled={savingProfile || loadingProfile}
                />
              </label>

              {profileStatus.message && (
                <p className={`settings-status settings-status--${profileStatus.type}`} role="status">
                  {profileStatus.message}
                </p>
              )}
              <button className="button button--primary settings-submit" type="submit" disabled={savingProfile || loadingProfile}>
                {savingProfile ? 'Saving…' : 'Save settings'}
              </button>
            </form>
          </section>

          <section className="settings-card" aria-labelledby="security-heading">
            <div className="settings-card__heading">
              <h2 id="security-heading">Security</h2>
              <p>Your password is managed by our secure Microsoft sign-in service.</p>
            </div>
            <div className="settings-form">
              <p className="settings-field-help">
                To change your password, continue to the sign-in page and choose “Forgot password?”.
                We will email you a code so you can set a new one.
              </p>
              <button
                className="button button--primary settings-submit"
                type="button"
                onClick={handlePasswordReset}
                disabled={resettingPassword}
              >
                {resettingPassword ? 'Opening sign-in…' : 'Change password'}
              </button>
            </div>

            <div className="settings-divider" />
            <div className="settings-signout">
              <div>
                <strong>Sign out</strong>
                <p>End your current session on this device.</p>
              </div>
              <button className="button button--ghost-dark" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
