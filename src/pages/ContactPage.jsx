import { useState } from 'react'
import HeroHoverEffect from '../components/HeroHoverEffect.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import logoWhite from '../data/images/logo_white.png'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const contactAddress = '50-64 Commerce Street, Kaitaia 0410'
const contactEmail = 'office@pasifikanavigators.nz'
const mapQuery = 'Kaitaia Digital Hub, 50-64 Commerce Street, Kaitaia 0410, New Zealand'
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`

export default function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitMessage = async (event) => {
    event.preventDefault()
    setFeedback('')

    if (!isSupabaseConfigured) {
      setStatus('error')
      setFeedback('Contact form storage is not configured yet.')
      return
    }

    setStatus('submitting')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
      source: 'website_contact_page',
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert([payload])

    if (error) {
      console.error('Supabase error (contact_messages insert):', error)
      setStatus('error')
      setFeedback('Something went wrong while sending your message. Please try again.')
      return
    }

    setForm(initialForm)
    setStatus('success')
    setFeedback('Thank you. Your message has been sent.')
  }

  return (
    <div className="site-shell contact-page">
      <SiteHeader />

      <main>
        <section className="contact-hero" aria-labelledby="contact-title">
          <HeroHoverEffect imageUrl="/pasifika-hero.png" />
          <div className="contact-hero__content">
            <p className="section-kicker">Contact Us</p>
            <h1 id="contact-title">Visit or message Pasifika Navigators.</h1>
            <p>
              Reach out for community support, programme enquiries, language week resources, or a talanoa about how we can walk alongside your family.
            </p>
          </div>
        </section>

        <section className="contact-layout" aria-label="Contact details and message form">
          <div className="contact-map" aria-label={`Map showing ${contactAddress}`}>
            <iframe
              title="Map to Pasifika Navigators"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="contact-map__details">
              <div>
                <span>Find us in the Kaitaia Digital Hub</span>
                <strong>{contactAddress}</strong>
                <a className="contact-map__email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
              <a className="button button--primary" href={mapDirectionsUrl} target="_blank" rel="noreferrer">Get directions</a>
            </div>
          </div>

          <form className="contact-form" onSubmit={submitMessage}>
            <div>
              <p className="section-kicker">Send a Message</p>
              <h2>How can we help?</h2>
            </div>

            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              required
              minLength="2"
            />

            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />

            <label htmlFor="contact-phone">Phone</label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              autoComplete="tel"
            />

            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={updateField}
              required
              minLength="10"
              rows="7"
            />

            {feedback && (
              <p className={`contact-form__feedback contact-form__feedback--${status}`} role="status">
                {feedback}
              </p>
            )}

            <button className="button button--primary" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
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
