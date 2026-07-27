import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './ProfilePage.css'

const MIN_PASSWORD_LENGTH = 8

export default function ProfilePage() {
  const { session, updateProfile, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const metadata = session?.user?.user_metadata ?? {}

  const [displayName, setDisplayName] = useState(metadata.display_name ?? metadata.full_name ?? '')
  const [profileVisible, setProfileVisible] = useState(metadata.profile_visible ?? false)
  const [productUpdates, setProductUpdates] = useState(metadata.product_updates ?? true)
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    setDisplayName(metadata.display_name ?? metadata.full_name ?? '')
    setProfileVisible(metadata.profile_visible ?? false)
    setProductUpdates(metadata.product_updates ?? true)
  }, [session?.user?.updated_at])

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileStatus({ type: '', message: '' })
    setSavingProfile(true)

    const { error } = await updateProfile({
      display_name: displayName.trim(),
      profile_visible: profileVisible,
      product_updates: productUpdates,
    })

    setSavingProfile(false)
    setProfileStatus(error
      ? { type: 'error', message: error.message ?? 'Could not save your settings.' }
      : { type: 'success', message: 'Your profile and privacy settings have been saved.' })
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setPasswordStatus({ type: '', message: '' })

    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordStatus({ type: 'error', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` })
      return
    }
    if (password !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setSavingPassword(true)
    const { error } = await updatePassword(password)
    setSavingPassword(false)

    if (error) {
      setPasswordStatus({ type: 'error', message: error.message ?? 'Could not update your password.' })
      return
    }

    setPassword('')
    setConfirmPassword('')
    setPasswordStatus({ type: 'success', message: 'Your password has been updated.' })
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
                  disabled={savingProfile}
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
                  disabled={savingProfile}
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
                  disabled={savingProfile}
                />
              </label>

              {profileStatus.message && (
                <p className={`settings-status settings-status--${profileStatus.type}`} role="status">
                  {profileStatus.message}
                </p>
              )}
              <button className="button button--primary settings-submit" type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save settings'}
              </button>
            </form>
          </section>

          <section className="settings-card" aria-labelledby="security-heading">
            <div className="settings-card__heading">
              <h2 id="security-heading">Security</h2>
              <p>Use a unique password with at least {MIN_PASSWORD_LENGTH} characters.</p>
            </div>
            <form className="settings-form" onSubmit={handlePasswordSave}>
              <div className="form-field">
                <label htmlFor="profile-password">New password</label>
                <input
                  id="profile-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={savingPassword}
                />
              </div>
              <div className="form-field">
                <label htmlFor="profile-password-confirm">Confirm new password</label>
                <input
                  id="profile-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={savingPassword}
                />
              </div>
              {passwordStatus.message && (
                <p className={`settings-status settings-status--${passwordStatus.type}`} role="status">
                  {passwordStatus.message}
                </p>
              )}
              <button
                className="button button--primary settings-submit"
                type="submit"
                disabled={savingPassword || !password || !confirmPassword}
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
            </form>

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
