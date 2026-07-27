import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../data/images/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { ADMIN_EMAIL } from '../lib/constants.js'

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Tech', href: '/tech' },
  { label: 'Contact', href: '/contact' },
]

export default function SiteHeader() {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const isLoggedIn = Boolean(session)
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
        profileMenuRef.current?.querySelector('button')?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsProfileMenuOpen(false)
  }

  const handleLogout = async () => {
    closeMenu()
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <a className="site-header__brand" href="/#home" aria-label="Pasifika Navigators home">
        <img src={logo} alt="Pasifika Navigators" />
      </a>
      <button
        type="button"
        className="site-menu-toggle"
        aria-label={isMenuOpen ? 'Close primary navigation' : 'Open primary navigation'}
        aria-controls="site-primary-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <nav
        id="site-primary-navigation"
        className={`site-nav${isMenuOpen ? ' site-nav--open' : ''}`}
        aria-label="Primary navigation"
      >
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
        ))}
        {isLoggedIn ? (
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              type="button"
              className="profile-menu__trigger"
              aria-label="Open account menu"
              aria-controls="site-profile-menu"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <span className="profile-menu__label">Account</span>
            </button>
            <div
              id="site-profile-menu"
              className={`profile-menu__dropdown${isProfileMenuOpen ? ' profile-menu__dropdown--open' : ''}`}
              role="menu"
            >
              <div className="profile-menu__identity">
                <span>Signed in as</span>
                <strong>{session.user.email}</strong>
              </div>
              <a href="/profile" role="menuitem" onClick={closeMenu}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                Profile & settings
              </a>
              {isAdmin && (
                <a href="/admin" role="menuitem" onClick={closeMenu}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Admin
                </a>
              )}
              <button type="button" role="menuitem" onClick={handleLogout}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        ) : (
          <a className="site-nav__auth-btn" href="/login" onClick={closeMenu}>
            Login
          </a>
        )}
      </nav>
    </header>
  )
}
