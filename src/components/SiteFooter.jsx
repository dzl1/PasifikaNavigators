import { Link } from 'react-router-dom'
import logoWhite from '../data/images/logo_white.png'

export default function SiteFooter({ id }) {
  return (
    <footer className="site-footer" id={id}>
      <div className="site-footer__intro">
        <Link to="/" aria-label="Go to home page">
          <img src={logoWhite} alt="Pasifika Navigators" />
        </Link>
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
  )
}