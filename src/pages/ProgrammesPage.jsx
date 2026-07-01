import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import TechOrbField from '../components/TechOrbField.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import './ProgrammesPage.css'

const programmeStats = [
  { label: 'Programmes', value: 'Learning, culture, tech' },
  { label: 'Based in', value: 'Te Hiku, Aotearoa' },
  { label: 'Built with', value: 'Community partners' },
]

const programmes = [
  {
    title: 'Curious Minds',
    tag: 'STEM learning',
    description:
      'Hands-on learning that helps tamariki and rangatahi explore science, technology, creativity, and problem solving through a Pasifika lens.',
    accent: '#238ca3',
  },
  {
    title: 'Pasifika Tech',
    tag: 'Classes for Pasifika kids',
    description:
      'A practical pathway into digital tools, coding, AI, storytelling, and creative technology for Pasifika children and young people.',
    accent: '#c94f3d',
    href: '/tech',
  },
  {
    title: 'Digital Storytelling',
    tag: 'Culture and media',
    description:
      'Projects that help people capture stories, identity, language, and local knowledge through media, mapping, and creative digital tools.',
    accent: '#f0b64a',
  },
  {
    title: 'Community Innovation',
    tag: 'Support and delivery',
    description:
      'Community-led design, one-on-one support, workshops, and digital confidence building for families, groups, and organisations.',
    accent: '#8f11a8',
  },
]

const communityProgrammes = [
  {
    title: 'Community Sharing',
    tag: 'Navigation and advocacy',
    description: 'Culturally grounded practical support using Pasifika knowledge in Kaitaia.',
    accent: '#238ca3',
  },
  {
    title: 'Pacific Language Weeks',
    tag: 'Language resources',
    description: 'Celebration dates, learning links, and resources that help families keep language visible through the year.',
    accent: '#8f11a8',
    href: '/pasifika',
  },
  {
    title: 'Pasifika Tech',
    tag: 'Creative innovation',
    description: 'Digital tools, AI, storytelling, mapping, and creative innovation grounded in culture and connection.',
    accent: '#c94f3d',
    href: '/tech',
  },
]

const partnerOrganisations = [
  {
    name: 'Far North District Council',
    shortName: 'FNDC',
    logoUrl: 'https://www.fndc.govt.nz/__data/assets/image/0014/23333/FNDC_Logo_2024_RGB_White_Large-01.png',
    website: 'https://www.fndc.govt.nz/',
    logoClass: 'fndc',
  },
  {
    name: 'Kaitaia Digital Hub',
    shortName: 'Kaitaia Digital Hub',
    logoUrl: 'https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D768%2Cfit%3Dcrop/mePJ4gEj08UlooJr/kdh-dOqDBQx56vCJxLXm.jpg',
    website: 'https://kaitaiadigitalhub.co.nz/',
    logoClass: 'kdh',
  },
  {
    name: 'Te Rarawa',
    shortName: 'Te Rarawa',
    logoUrl: 'https://static.wixstatic.com/media/561893_3aa37a07a14f4310912b8181a110543e~mv2.png/v1/fill/w_500,h_500,al_c,q_85,enc_avif,quality_auto/TeRarawa.png',
    website: 'https://www.terarawa.co.nz/',
    logoClass: 'te-rarawa',
  },
  {
    name: 'Northland Regional Council',
    shortName: 'NRC',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2H1Blv79GH91SLr-RXO3HQU1uKw1RzNzSPp7lh29Q_KLtC54N8k9GNqQb&s=10',
    website: 'https://www.nrc.govt.nz/',
    logoClass: 'nrc',
  },
]

const carouselOrganisations = [...partnerOrganisations, ...partnerOrganisations]

const deliveryAreas = [
  'Digital skills workshops',
  'Creative technology classes',
  'Storytelling and media projects',
  'Mapping and place-based learning',
  'AI and emerging technology support',
  'Culturally grounded programme design',
]

function ProgrammeFeatureCard({ programme }) {
  const content = (
    <>
      <span className="programmes-card__tag">{programme.tag}</span>
      <h3>{programme.title}</h3>
      <p>{programme.description}</p>
      <span className="programmes-card__action">{programme.href ? 'Explore tech' : 'Programme focus'}</span>
    </>
  )

  if (programme.href) {
    return (
      <Link className="programmes-card" to={programme.href} style={{ '--programme-accent': programme.accent }}>
        {content}
      </Link>
    )
  }

  return (
    <article className="programmes-card" style={{ '--programme-accent': programme.accent }}>
      {content}
    </article>
  )
}

function OrganisationCard({ organisation, isDuplicate = false }) {
  return (
    <a
      className="programmes-logo-card"
      href={organisation.website}
      target="_blank"
      rel="noreferrer"
      aria-hidden={isDuplicate ? 'true' : undefined}
      tabIndex={isDuplicate ? -1 : undefined}
    >
      <img
        className={organisation.logoClass ? `programmes-logo-card__image--${organisation.logoClass}` : undefined}
        src={organisation.logoUrl}
        alt={`${organisation.name} logo`}
        loading="lazy"
      />
      <span>{organisation.shortName}</span>
    </a>
  )
}

export default function ProgrammesPage() {
  return (
    <div className="site-shell programmes-page">
      <SiteHeader />

      <main>
        <section className="programmes-hero" aria-labelledby="programmes-title">
          <TechOrbField className="programmes-hex-field" shape="hexagon" />
          <div className="programmes-hero__content">
            <p className="section-kicker">Programmes</p>
            <h1 id="programmes-title">Innovation, Culture, Connection</h1>
            <p>
              Pasifika Navigators runs learning and innovation programmes for youth and families, working with community partners across Te Hiku.
            </p>
            <div className="programmes-hero__actions">
              <a className="button button--primary" href="#programme-list">View programmes</a>
              <Link className="button button--ghost" to="/contact">Work with us</Link>
            </div>
          </div>
        </section>

        <section className="programmes-strip" aria-label="Programmes snapshot">
          {programmeStats.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="programmes-intro">
          <div className="programmes-intro__heading">
            <p className="section-kicker">What We Run</p>
            <h2>Create. Deliver.</h2>
          </div>
          <div className="programmes-intro__copy">
            <p>
              Our work brings together technology, storytelling, learning, culture, and community support. Each programme is designed to help people use modern tools while staying connected to identity, place, and purpose.
            </p>
            <p>
              We create spaces where Pasifika children and families can learn by doing, ask questions, build confidence, and see themselves reflected in the future they are helping to shape.
            </p>
          </div>
        </section>

        <section className="programmes-section" id="community-programmes">
          <div className="programmes-section__heading">
            <p className="section-kicker">Programmes</p>
            <h2>Build knowledge.</h2>
          </div>
          <div className="programmes-grid">
            {communityProgrammes.map((programme) => (
              <ProgrammeFeatureCard key={programme.title} programme={programme} />
            ))}
          </div>
        </section>

        <section className="programmes-section programmes-section--featured" id="programme-list">
          <div className="programmes-section__heading">
            <p className="section-kicker">Featured Programmes</p>
            <h2>From Curious Minds to Pasifika Tech.</h2>
          </div>
          <div className="programmes-grid">
            {programmes.map((programme) => (
              <ProgrammeFeatureCard key={programme.title} programme={programme} />
            ))}
          </div>
        </section>

        <section className="gradient-feature programmes-feature">
          <div className="gradient-feature__inner programmes-feature__inner">
            <p className="section-kicker">How We Deliver</p>
            <h2>Learning that is hands-on, culturally grounded, and community led.</h2>
            <p>
              We support workshops, classes, community projects, and client work that turn ideas into practical outcomes. The focus is always on confidence, access, creativity, and connection.
            </p>
            <div className="programmes-feature__list" aria-label="Programme delivery areas">
              {deliveryAreas.map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="programmes-section programmes-section--partners" id="organisations">
          <div className="programmes-section__heading">
            <p className="section-kicker">Clients and Partners</p>
            <h2>Trusted local partners.</h2>
          </div>
          <div
            className="programmes-logo-carousel"
            style={{ '--organisation-count': partnerOrganisations.length }}
            aria-label="Organisations Pasifika Navigators has worked with"
          >
            <div className="programmes-logo-carousel__track">
              {carouselOrganisations.map((organisation, index) => (
                <OrganisationCard
                  key={`${organisation.shortName}-${index}`}
                  organisation={organisation}
                  isDuplicate={index >= partnerOrganisations.length}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="programmes-cta">
          <div>
            <p className="section-kicker">Start a Talanoa</p>
            <h2>Have a programme, class, or community project in mind?</h2>
          </div>
          <Link className="button button--primary" to="/contact">Contact Pasifika Navigators</Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
