import { Routes, Route, Link } from 'react-router-dom'
import PasifikaPage from './pages/PasifikaPage.jsx'
import logo from './data/images/logo.png'
import logoWhite from './data/images/logo_white.png'
import './App.css'

const apps = [
  {
    id: 1,
    name: 'Community Hub',
    description: 'Connect with Pasifika communities across the region.',
    color: '#0077b6',
    href: '#',
  },
  {
    id: 2,
    name: 'Language Learning',
    description: 'Explore and learn Pacific Island languages interactively.',
    color: '#2a9d8f',
    href: '/pasifika',
  },
  {
    id: 3,
    name: 'Cultural Stories',
    description: 'Discover myths, legends, and oral histories of the Pacific.',
    color: '#e76f51',
    href: '#',
  },
  {
    id: 4,
    name: 'Navigator Charts',
    description: 'Traditional wayfinding maps and star navigation guides.',
    color: '#264653',
    href: '#',
  },
  {
    id: 5,
    name: 'Events Calendar',
    description: 'Stay up-to-date with Pasifika festivals and gatherings.',
    color: '#e9c46a',
    href: '#',
  },
  {
    id: 6,
    name: 'Resource Directory',
    description: 'Find health, education, and support services for Pacific peoples.',
    color: '#6a4c93',
    href: '#',
  },
]

function AppCard({ app }) {
  const isInternal = app.href.startsWith('/')
  const cardProps = {
    className: 'app-card',
    style: { '--accent': app.color },
    'aria-label': app.name,
  }
  const inner = (
    <>
      <h2 className="app-card__name">{app.name}</h2>
      <p className="app-card__description">{app.description}</p>
      <span className="app-card__arrow">Explore →</span>
    </>
  )
  return isInternal
    ? <Link to={app.href} {...cardProps}>{inner}</Link>
    : <a href={app.href} {...cardProps}>{inner}</a>
}

function HomePage() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header__inner">
          <p className="header__kicker">Pacific Island communities</p>
          <div className="header__brand">
            <img src={logo} alt="Pasifika Navigators" className="header__logo" />
          </div>
          <p className="header__tagline">
            Your gateway to Pacific Island communities, culture, and resources.
          </p>
        </div>
      </header>

      <main className="main">
        <section className="apps-section">
          <p className="apps-section__kicker">Explore</p>
          <h1 className="apps-section__heading">Applications</h1>
          <div className="apps-grid">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <img src={logoWhite} alt="Pasifika Navigators" className="footer__logo" />
        <p>© {new Date().getFullYear()} Pasifika Navigators. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pasifika" element={<PasifikaPage />} />
    </Routes>
  )
}
