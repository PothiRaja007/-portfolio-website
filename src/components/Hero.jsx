import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { SITE } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'

const SEEN_KEY = 'portfolio:intro-seen'
export const INTRO_DONE_EVENT = 'portfolio:intro-done'

// Plays once per session. Add ?intro to the URL to force a replay.
function shouldPlay(reduced) {
  if (reduced) return false
  if (new URLSearchParams(window.location.search).has('intro')) return true
  return sessionStorage.getItem(SEEN_KEY) !== '1'
}

const statementWords = SITE.statement.split(' ')
const taglineWords = SITE.tagline.split(' ')

export default function Hero() {
  const reduced = useReducedMotion()
  const root = useRef(null)
  const skipRef = useRef(() => {})
  const [play] = useState(() => shouldPlay(reduced))
  const [playing, setPlaying] = useState(play)

  useLayoutEffect(() => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      sessionStorage.setItem(SEEN_KEY, '1')
      setPlaying(false)
      window.dispatchEvent(new Event(INTRO_DONE_EVENT))
    }

    // Static states (returning visitor, reduced motion): no animation.
    if (!play) {
      const id = requestAnimationFrame(() => window.dispatchEvent(new Event(INTRO_DONE_EVENT)))
      return () => cancelAnimationFrame(id)
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)

      gsap.set(q('.hero__word'), { opacity: 0, y: 18 })
      gsap.set(q('.hero__name'), { opacity: 0, letterSpacing: '0.7em' })
      gsap.set(q('.hero__char'), { opacity: 0 })
      gsap.set(q('.hero__cue'), { opacity: 0 })

      const tl = gsap.timeline({ onComplete: finish })
      tl
        // subtle zoom-out runs underneath the whole sequence
        .fromTo(q('.hero__stage'), { scale: 1.14 }, { scale: 1, duration: 4, ease: 'power2.out' }, 0)
        // 0-2s: the statement
        .to(q('.hero__word'), { opacity: 1, y: 0, duration: 1, stagger: 0.18, ease: 'power3.out' }, 0.3)
        // 2-4s: the name emerges
        .to(q('.hero__name'), { opacity: 1, letterSpacing: '0.3em', duration: 1.6, ease: 'power3.out' }, 2.2)
        // 4-7s: tagline is revealed character by character
        .to(q('.hero__char'), { opacity: 1, duration: 0.01, stagger: 0.03 }, 4.2)
        // 7-10s: tagline fades slowly, name stays
        .to(q('.hero__tagline'), { opacity: 0, duration: 2.4, ease: 'power1.inOut' }, 7.4)
        // 10s+: the environment begins to show
        .to(q('.hero__cue'), { opacity: 1, duration: 1.2, ease: 'power1.out' }, 9.6)

      skipRef.current = () => {
        tl.progress(1)
        gsap.set(q('.hero__tagline'), { opacity: 0 })
        finish()
      }
    }, root)

    // Never trap the visitor: any scroll gesture or key skips the intro.
    const onKey = (e) => {
      if (['Escape', ' ', 'ArrowDown', 'PageDown', 'End'].includes(e.key)) skipRef.current()
    }
    const onGesture = () => skipRef.current()
    window.addEventListener('wheel', onGesture, { passive: true })
    window.addEventListener('touchmove', onGesture, { passive: true })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('touchmove', onGesture)
      window.removeEventListener('keydown', onKey)
      ctx.revert()
    }
  }, [play])

  const state = play ? '' : reduced ? 'hero--static' : 'hero--seen'

  return (
    <section ref={root} className={`hero ${state}`} aria-label="Introduction">
      <div className="hero__stage">
        <h1 className="display hero__statement" aria-label={SITE.statement}>
          {statementWords.map((w, i) => (
            <span key={i} aria-hidden="true">
              {i > 0 && ' '}
              <span className="hero__word">{w}</span>
            </span>
          ))}
        </h1>

        <p className="hero__name">{SITE.name}</p>

        <p className="hero__tagline" aria-label={SITE.tagline}>
          {taglineWords.map((w, i) => (
            <span key={i} aria-hidden="true">
              {i > 0 && ' '}
              <span className="hero__tw">
                {[...w].map((c, j) => (
                  <span key={j} className="hero__char">{c}</span>
                ))}
              </span>
            </span>
          ))}
        </p>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span className="label">Scroll</span>
        <i />
      </div>

      {playing && (
        <button className="hero__skip label" onClick={() => skipRef.current()}>
          Skip intro
        </button>
      )}
    </section>
  )
}
