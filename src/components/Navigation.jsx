import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_LINKS, SITE } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import { INTRO_DONE_EVENT } from './Hero'

// Floating navigation. Hidden during the opening; reveals on the first
// scroll / touch / key press or when the intro ends. Not rendered inside
// project worlds. The mobile menu makes the page behind it inert so
// keyboard focus cannot escape the open menu.
export default function Navigation() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [revealed, setRevealed] = useState(false)
  const [open, setOpen] = useState(false)
  const headerRef = useRef(null)
  const menuButton = useRef(null)
  const firstLink = useRef(null)

  const onHome = pathname === '/'

  useEffect(() => {
    if (!onHome || revealed) return
    const reveal = () => setRevealed(true)
    const events = ['wheel', 'touchstart', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, reveal, { passive: true, once: true }))
    window.addEventListener(INTRO_DONE_EVENT, reveal, { once: true })
    if (window.scrollY > 24) reveal()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reveal))
      window.removeEventListener(INTRO_DONE_EVENT, reveal)
    }
  }, [onHome, revealed])

  const close = useCallback(() => {
    setOpen(false)
    // wait for the header to become interactive again before refocusing
    requestAnimationFrame(() => menuButton.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return
    const main = document.querySelector('main')
    const header = headerRef.current
    document.body.style.overflow = 'hidden'
    if (main) main.inert = true
    if (header) header.inert = true
    firstLink.current?.focus()

    const onKey = (e) => e.key === 'Escape' && close()
    const onResize = () => window.innerWidth >= 720 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      if (main) main.inert = false
      if (header) header.inert = false
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open, close])

  const goTo = (e, target) => {
    e.preventDefault()
    setOpen(false)
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const toTop = (e) => {
    e.preventDefault()
    setOpen(false)
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (!onHome) return null

  return (
    <>
      <header
        ref={headerRef}
        className={`nav ${revealed ? 'nav--visible' : ''}`}
        aria-hidden={!revealed}
      >
        <a href="#top" className="nav__brand" onClick={toTop} tabIndex={revealed ? 0 : -1}>
          {SITE.name}
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.target}
              href={`#${l.target}`}
              onClick={(e) => goTo(e, l.target)}
              tabIndex={revealed ? 0 : -1}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          ref={menuButton}
          className="nav__menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
          tabIndex={revealed ? 0 : -1}
        >
          Menu
        </button>
      </header>

      <div
        id="mobile-menu"
        className="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <button className="menu__close" onClick={close}>
          Close
        </button>
        <ul>
          {NAV_LINKS.map((l, i) => (
            <li key={l.target}>
              <a
                ref={i === 0 ? firstLink : null}
                href={`#${l.target}`}
                onClick={(e) => goTo(e, l.target)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={SITE.github} target="_blank" rel="noreferrer">GitHub</a>
          </li>
          <li>
            <a href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </li>
        </ul>
      </div>
    </>
  )
}
