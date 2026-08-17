import React, { useEffect, useRef } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ContactPage from './pages/ContactPage.jsx'
import PasifikaPage from './pages/PasifikaPage.jsx'
import ProgrammesPage from './pages/ProgrammesPage.jsx'
import TechPage from './pages/TechPage.jsx'
import StorytellingPage from './pages/StorytellingPage.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import TechOrbField from './components/TechOrbField.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import logoWhite from './data/images/logo_white.png'
import LoginPage from './pages/admin/LoginPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import MessagesPage from './pages/admin/MessagesPage.jsx'
import PathwaysPage from './pages/admin/PathwaysPage.jsx'
import RegisterPage from './pages/admin/RegisterPage.jsx'
import ResetPasswordPage from './pages/admin/ResetPasswordPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthRecoveryRedirect from './components/AuthRecoveryRedirect.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './App.css'

const stats = [
  { label: 'Based in', value: 'Kaitaia, Aotearoa NZ' },
  { label: 'Led by', value: 'Pasifika community' },
  { label: 'Focused on', value: 'Culture, wellbeing, connection' },
]

const orbitNodes = [
  { label: 'AI', angle: -Math.PI / 2 },
  { label: 'Map', angle: 0 },
  { label: 'Story', angle: Math.PI / 2 },
  { label: 'Learn', angle: Math.PI },
]

function TechApproachVisual() {
  const visualRef = useRef(null)
  const orbitRef = useRef(null)
  const nodeRefs = useRef([])

  useEffect(() => {
    const visual = visualRef.current
    const orbit = orbitRef.current

    if (!visual || !orbit) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = 0
    let geometry = null

    const measure = () => {
      const visualRect = visual.getBoundingClientRect()
      const orbitRect = orbit.getBoundingClientRect()

      geometry = {
        centerX: orbitRect.left - visualRect.left + orbitRect.width / 2,
        centerY: orbitRect.top - visualRect.top + orbitRect.height / 2,
        radiusX: orbitRect.width / 2,
        radiusY: orbitRect.height / 2,
      }
    }

    const positionNodes = (elapsed = 0) => {
      if (!geometry) measure()
      const rotation = reduceMotion ? 0 : (elapsed / 30000) * Math.PI * 2

      orbitNodes.forEach((node, index) => {
        const element = nodeRefs.current[index]
        if (!element) return

        const angle = node.angle + rotation
        element.style.left = `${geometry.centerX + Math.cos(angle) * geometry.radiusX}px`
        element.style.top = `${geometry.centerY + Math.sin(angle) * geometry.radiusY}px`
      })
    }

    const animate = (time) => {
      positionNodes(time)
      frameId = window.requestAnimationFrame(animate)
    }

    const observer = new ResizeObserver(() => {
      measure()
      positionNodes()
    })
    observer.observe(visual)
    measure()
    positionNodes()

    if (!reduceMotion) frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="tech-feature__visual" ref={visualRef} aria-hidden="true">
      <div className="tech-orbit tech-orbit--one" ref={orbitRef} />
      <div className="tech-orbit tech-orbit--two" />
      <div className="tech-node tech-node--center">
        <img src={logoWhite} alt="" />
      </div>
      {orbitNodes.map((node, index) => (
        <div
          className="tech-node tech-node--orbit"
          key={node.label}
          ref={(element) => {
            nodeRefs.current[index] = element
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  )
}

function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="home-hero" id="home" aria-labelledby="home-title">
          <TechOrbField className="home-cube-field" shape="small-circle" />
          <div className="home-hero__content">
            <p className="section-kicker" id="home-title">Pasifika-Led in Te Hiku</p>
            <p className="home-hero__lede">
              Empowering our community through cultural innovation, practical support, and spaces where we can build the future.</p>
            <div className="home-hero__actions">
              <Link className="button button--primary" to="/programmes">Our programmes</Link>
              <Link className="button button--ghost" to="/contact">Contact us</Link>
            </div>
          </div>
        </section>

        <section className="snapshot-band" aria-label="Pasifika Navigators snapshot">
          {stats.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="content-section content-section--intro" id="about">
          <div className="section-heading">
            <p className="section-kicker">About</p>
            <h2>Connection through creative innovation.</h2>
          </div>
          <div className="intro-copy">
            <p>
              Pasifika Navigators uses technology and innovation to help individuals and families stay connected to who they are, where they come from, and where they are going.
            </p>
            <p>
              Through digital tools, storytelling, learning, AI, mapping, media, and community-led innovation, we create pathways that connect the past, present, and future. We honour the stories, knowledge, culture, and values passed down through generations, while helping our people use today's tools to build confidence, opportunity, and connection for tomorrow.
            </p>
            <p>
              We believe technology should strengthen identity, not replace it. Whether through talanoa, digital storytelling, online learning, creative projects, or one-on-one support, Pasifika Navigators walks alongside our communities as they navigate a changing world with culture, connection, and purpose.
            </p>
          </div>
        </section>

        <section className="tech-feature">
          <TechApproachVisual />
          <div className="tech-feature__copy">
            <p className="section-kicker">Our Approach</p>
            <h2>Innovation should bring people closer to themselves.</h2>
            <p>
              Technology is most powerful when it carries people, not replaces them. Pasifika Navigators uses today&apos;s tools to honour inherited knowledge, support everyday needs, and create new pathways for tomorrow.
            </p>
          </div>
        </section>

        <section className="gradient-feature">
          <div className="gradient-feature__inner">
            <p className="section-kicker">Our purpose</p>
            <h2>Helping families navigate support, culture, and belonging.</h2>
            <p>
              We walk alongside our people with respect for language, identity, and the shared strength of Pasifika communities.
            </p>
          </div>
        </section>

        <section className="join-section">
          <div>
            <p className="section-kicker">Join Our Journey</p>
            <h2>Stay connected with Pasifika Navigators news.</h2>
          </div>
          <form className="signup-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email">Your Email</label>
            <div className="signup-form__row">
              <input id="email" name="email" type="email" placeholder="Enter email" />
              <button className="button button--dark" type="submit">Send</button>
            </div>
          </form>
        </section>
      </main>

      <SiteFooter id="contact" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRecoveryRedirect />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pasifika" element={<PasifikaPage />} />
        <Route path="/programmes" element={<ProgrammesPage />} />
        <Route path="/tech" element={<TechPage />} />
        <Route path="/storytelling" element={<StorytellingPage />} />
        <Route path="/storytelling/:id" element={<StorytellingPage />} />
        <Route path="/stories/:slug" element={<StorytellingPage publicStory />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute adminOnly={false}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="pathways" element={<PathwaysPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
