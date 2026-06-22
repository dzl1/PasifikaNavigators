import { useEffect, useState } from 'react'
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
  const isLoggedIn = Boolean(session)
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  const closeMenu = () => {
    setIsMenuOpen(false)
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
        {isAdmin && (
          <a className="site-nav__auth-btn site-nav__auth-btn--admin" href="/admin" onClick={closeMenu}>
            Admin
          </a>
        )}
        {isLoggedIn ? (
          <button
            type="button"
            className="site-nav__auth-btn"
            onClick={handleLogout}
          >
            Log out
          </button>
        ) : (
          <a className="site-nav__auth-btn" href="/login" onClick={closeMenu}>
            Login
          </a>
        )}
      </nav>
    </header>
  )
}
