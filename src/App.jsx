import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ContactPage from './pages/ContactPage.jsx'
import PasifikaPage from './pages/PasifikaPage.jsx'
import ProgrammesPage from './pages/ProgrammesPage.jsx'
import TechPage from './pages/TechPage.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import TechOrbField from './components/TechOrbField.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import MessagesPage from './pages/admin/MessagesPage.jsx'
import PathwaysPage from './pages/admin/PathwaysPage.jsx'
import RegisterPage from './pages/admin/RegisterPage.jsx'
import ResetPasswordPage from './pages/admin/ResetPasswordPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './App.css'

const stats = [
  { label: 'Based in', value: 'Kaitaia, Aotearoa NZ' },
  { label: 'Led by', value: 'Pasifika community' },
  { label: 'Focused on', value: 'Culture, wellbeing, connection' },
]

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pasifika" element={<PasifikaPage />} />
        <Route path="/programmes" element={<ProgrammesPage />} />
        <Route path="/tech" element={<TechPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
