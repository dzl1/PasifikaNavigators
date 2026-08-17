import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import TechOrbField from '../components/TechOrbField.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import './TechPage.css'

const techFocus = [
  {
    title: 'Digital Storytelling',
    description: 'Tools and media projects that help families record, preserve, and share stories across generations.',
  },
  {
    title: 'AI and Learning',
    description: 'Practical AI support for language learning, confidence building, admin help, and guided digital skills.',
  },
  {
    title: 'Mapping and Memory',
    description: 'Interactive maps and place-based projects that connect people to homelands, migration, identity, and belonging.',
  },
  {
    title: 'Community Systems',
    description: 'Simple digital workflows that make it easier to organise support, programmes, messages, and local initiatives.',
  },
]

const techProjects = [
  {
    label: 'Culture',
    title: 'Language and identity tools',
    description: 'Digital resources that make Pasifika language weeks, learning links, phrases, themes, and events easier to discover.',
  },
  {
    label: 'Connection',
    title: 'Story-led media projects',
    description: 'Creative production, interviews, archives, and media pathways that help our people tell their own stories.',
  },
  {
    label: 'Navigation',
    title: 'Support through smarter systems',
    description: 'Admin tools, contact pathways, and community data practices designed around care, trust, and local leadership.',
  },
]

export default function TechPage() {
  return (
    <div className="site-shell tech-page">
      <SiteHeader />

      <main>
        <section className="tech-hero" aria-labelledby="tech-title">
          <TechOrbField />
          <div className="tech-hero__content">
            <p className="section-kicker">Pasifika Navigators Tech</p>
            <h1 id="tech-title">Technology through a Pasifika lens</h1>
            <p>
              We use digital tools, storytelling, learning, AI, mapping, media, and community-led innovation to help our people stay connected to who they are, where they come from, and where they are going.
            </p>
            <div className="tech-hero__actions">
              <a className="button button--primary" href="#tech-focus">Explore tech</a>
              <Link className="button button--ghost" to="/contact">Start a talanoa</Link>
            </div>
          </div>
        </section>

        <section className="tech-strip" aria-label="Pasifika Navigators tech principles">
          <div>
            <span>Built for</span>
            <strong>Families and communities</strong>
          </div>
          <div>
            <span>Guided by</span>
            <strong>Culture, care, and purpose</strong>
          </div>
          <div>
            <span>Powered by</span>
            <strong>Creative innovation</strong>
          </div>
        </section>

        <section className="tech-section" id="tech-focus">
          <div className="tech-section__heading">
            <p className="section-kicker">What We Build</p>
            <h2>Tools for connection, learning, and belonging.</h2>
          </div>
          <div className="tech-focus-grid">
            {techFocus.map((item) => (
              <article className="tech-focus-card" key={item.title}>
                <span className="tech-focus-card__mark" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tech-section">
          <div className="tech-section__heading">
            <p className="section-kicker">Showcase</p>
            <h2>Pasifika tech in action.</h2>
          </div>
          <div className="tech-project-grid">
            {techProjects.map((project) => (
              <article className="tech-project-card" key={project.title}>
                <span>{project.label}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
