import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import TechOrbField from '../components/TechOrbField.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import logoWhite from '../data/images/logo_white.png'
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
        const x = geometry.centerX + Math.cos(angle) * geometry.radiusX
        const y = geometry.centerY + Math.sin(angle) * geometry.radiusY

        element.style.left = `${x}px`
        element.style.top = `${y}px`
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

    if (!reduceMotion) {
      frameId = window.requestAnimationFrame(animate)
    }

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
