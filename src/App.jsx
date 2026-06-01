import { Routes, Route, Link } from 'react-router-dom'
import PasifikaPage from './pages/PasifikaPage.jsx'
import HeroHoverEffect from './components/HeroHoverEffect.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import logoWhite from './data/images/logo_white.png'
import './App.css'

const programmes = [
  {
    title: 'Community Support',
    description: 'Culturally grounded navigation, advocacy, and practical support for Pasifika families in Kaitaia.',
    accent: '#238ca3',
  },
  {
    title: 'Pacific Language Weeks',
    description: 'Celebration dates, learning links, and resources that help families keep language visible through the year.',
    accent: '#8f11a8',
    href: '/pasifika',
  },
  {
    title: 'Connection Events',
    description: 'Local gatherings that bring people together through faith, culture, food, music, and shared service.',
    accent: '#c94f3d',
  },
]

const stats = [
  { label: 'Based in', value: 'Kaitaia, Aotearoa NZ' },
  { label: 'Led by', value: 'Pasifika community' },
  { label: 'Focused on', value: 'Culture, wellbeing, connection' },
]

function ProgrammeCard({ programme }) {
  const content = (
    <>
      <span className="programme-card__mark" aria-hidden="true" />
      <h3>{programme.title}</h3>
      <p>{programme.description}</p>
      <span className="programme-card__action">{programme.href ? 'Explore resources' : 'Learn more'}</span>
    </>
  )

  if (programme.href) {
    return (
      <Link className="programme-card" to={programme.href} style={{ '--accent': programme.accent }}>
        {content}
      </Link>
    )
  }

  return (
    <article className="programme-card" style={{ '--accent': programme.accent }}>
      {content}
    </article>
  )
}

function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="home-hero" id="home" aria-labelledby="home-title">
          <video
            className="home-hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/bg.jpg"
            aria-hidden="true"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <HeroHoverEffect imageUrl="/bg.jpg" videoUrl="/hero-video.mp4" />
          <div className="home-hero__content">
            <p className="section-kicker" id="home-title">Pasifika-Led in Te Hiku</p>
            <p className="home-hero__lede">
              Empowering our community through cultural innovation, practical support, and spaces where we can build the future.</p>
            <div className="home-hero__actions">
              <a className="button button--primary" href="#programmes">Our programmes</a>
              <a className="button button--ghost" href="#contact">Contact us</a>
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
              Pasifika Navigators walks alongside individuals and families — helping them stay connected to who they are, where they come from, and where they are going.
            </p>
            <p>
              We meet people through many pathways: talanoa around the table, generational stories passed from grandparents to grandchildren, digital tools that bridge distance, community gatherings, and one-on-one conversations that honour each person's journey. However connection happens, we show up for it.
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

        <section className="content-section" id="programmes">
          <div className="section-heading">
            <p className="section-kicker">Programmes</p>
            <h2>Support shaped for our people.</h2>
          </div>
          <div className="programme-grid">
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.title} programme={programme} />
            ))}
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

      <footer className="site-footer" id="contact">
        <div className="site-footer__intro">
          <img src={logoWhite} alt="Pasifika Navigators" />
        </div>
        <div className="site-footer__details">
          <div>
            <span>Email</span>
            <a href="mailto:office@pasifikanavigators.nz">office@pasifikanavigators.nz</a>
          </div>
          <div>
            <span>Phone</span>
            <a href="tel:+64212178028">+64 21 2178028</a>
          </div>
        </div>
        <p className="site-footer__copyright">© {new Date().getFullYear()} Pasifika Navigators. All rights reserved.</p>
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
