import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ContactPage from './pages/ContactPage.jsx'
import PasifikaPage from './pages/PasifikaPage.jsx'
import ProgrammesPage from './pages/ProgrammesPage.jsx'
import TechPage from './pages/TechPage.jsx'
import SiteHeader from './components/SiteHeader.jsx'
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

const focusAreas = [
  {
    title: 'Community Support',
    body: 'Strengthening whanau and supporting wellbeing through advocacy and service.',
  },
  {
    title: 'Digital Inclusion',
    body: 'Helping bridge the digital divide and building skills for a connected future.',
  },
  {
    title: 'Culture & Identity',
    body: 'Celebrating our heritage, language, and traditions for future generations.',
  },
  {
    title: 'Youth Opportunities',
    body: 'Creating pathways for rangatahi to thrive through education, mentoring and support.',
  },
]

const values = [
  {
    title: "Fa'atuatua",
    label: 'Trust',
    body: 'We act with integrity, honesty and accountability in all that we do.',
  },
  {
    title: "Fa'afesoota'i",
    label: 'Connect',
    body: 'We build strong relationships and partnerships across our communities.',
  },
  {
    title: "Fa'avave",
    label: 'Empower',
    body: 'We empower our people to lead, succeed and create change.',
  },
]

function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="home-hero" id="home" aria-labelledby="home-title">
          <div className="home-hero__inner">
            <div className="home-hero__content">
              <p className="section-kicker">Navigating pathways. Building futures.</p>
              <h1 id="home-title">Guiding our People. Strengthening our Community.</h1>
              <p className="home-hero__lede">
                Pasifika Navigators Charitable Trust empowers Pasifika and Maori communities in Te Hiku o Te Ika through connection, culture, education, digital inclusion, wellbeing and opportunity.
              </p>
              <div className="home-hero__actions">
                <Link className="button button--primary" to="/programmes">Our programmes <span aria-hidden="true">-&gt;</span></Link>
                <Link className="button button--ghost" to="/#about">About us <span aria-hidden="true">-&gt;</span></Link>
              </div>
            </div>
            <div className="home-hero__quote" aria-label="Voyage whakatauki">
              <p>O le folauga e le gata i le mea ua e i ai nei, ae le tofa so'o fo'i lea.</p>
              <span>The journey is not only about the voyage, but also about the hope.</span>
            </div>
            <div className="home-focus-grid" aria-label="Pasifika Navigators focus areas">
              {focusAreas.map((area) => (
                <article className="home-focus-card" key={area.title}>
                  <div>
                    <h2>{area.title}</h2>
                    <p>{area.body}</p>
                    <span aria-hidden="true" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-values" id="about" aria-labelledby="values-title">
          <div className="home-values__inner">
            <div className="home-values__intro">
              <p className="section-kicker">Who we are</p>
              <h2 id="values-title">E tu'u fa'atasi i tatou - together we rise.</h2>
            </div>
            <div className="home-values__list">
              {values.map((value) => (
                <article className="home-value" key={value.title}>
                  <div>
                    <h3>{value.title} <span>({value.label})</span></h3>
                    <p>{value.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="home-pattern-strip" aria-hidden="true" />
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
