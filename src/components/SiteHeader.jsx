import { useNavigate } from 'react-router-dom'
import logo from '../data/images/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { ADMIN_EMAIL } from '../lib/constants.js'

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Programmes', href: '/#programmes' },
  { label: 'Contact', href: '/contact' },
]

export default function SiteHeader() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const isLoggedIn = Boolean(session)
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <a className="site-header__brand" href="/#home" aria-label="Pasifika Navigators home">
        <img src={logo} alt="Pasifika Navigators" />
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
        {isAdmin && (
          <a className="site-nav__auth-btn site-nav__auth-btn--admin" href="/admin">
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
          <a className="site-nav__auth-btn" href="/admin/login">
            Login
          </a>
        )}
      </nav>
    </header>
  )
}
