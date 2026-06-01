import logo from '../data/images/logo.png'

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Programmes', href: '/#programmes' },
  { label: 'Contact', href: '/#contact' },
]

export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__brand" href="/#home" aria-label="Pasifika Navigators home">
        <img src={logo} alt="Pasifika Navigators" />
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </header>
  )
}
