import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTakeover } from '../context/TakeoverContext'
import { loadCountWise } from '../routes/lazyPages'

gsap.registerPlugin(ScrollTrigger)

const BARS = [38, 52, 44, 66, 58, 80, 72, 64, 90]
const ACCOUNTS = [['Savings', '₹1,20,000'], ['Wallet', '₹4,300']]
const ROWS = [
  ['Groceries', '−₹1,240'],
  ['Salary', '+₹32,000'],
  ['Transport', '−₹380'],
]

// CountWise scene. A tall track holds a sticky stage (CSS sticky, so normal
// scrolling is never hijacked). Scroll progress drives four beats:
//   1 identity  2 product comes forward  3 message  4 invitation
// Layers: .proj (outer) = scroll transform, .proj__inner = hover zoom only.
export default function CountWiseProject() {
  const sceneRef = useRef(null)
  const cardRef = useRef(null)
  const { start } = useTakeover()

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const mm = gsap.matchMedia()

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 720px)',
        tall: '(min-height: 561px)', // short landscape screens get the static layout
      },
      (ctx) => {
        if (!ctx.conditions.motion || !ctx.conditions.tall) return // static, fully visible
        const { wide } = ctx.conditions
        const q = gsap.utils.selector(scene)

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        })

        tl
          // Beat 2: product comes forward; UI pieces converge ("assemble")
          .fromTo(q('.proj'),
            { scale: wide ? 0.74 : 0.82, y: wide ? 90 : 60, opacity: 0.35 },
            { scale: 1, y: 0, opacity: 1, duration: 0.5 }, 0)
          .fromTo(q('[data-depth]'),
            { y: (i, el) => Number(el.dataset.depth) * (wide ? 36 : 18) },
            { y: 0, duration: 0.55 }, 0)
          // Beat 1 -> 2: identity steps back a little
          .fromTo(q('.cwscene__name'), { opacity: 1, y: 0 }, { opacity: 0.45, y: -14, duration: 0.45 }, 0.15)
          // Beat 3: message
          .fromTo(q('.cwscene__message'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.5)
          .fromTo(q('.cwscene__phrase'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, 0.62)
          // Beat 4: invitation, then the composition settles
          .fromTo(q('.cwscene__cta'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.8)
          .to({}, { duration: 0.05 }, 0.95)
      }
    )

    // Fonts change layout height; re-measure once they are ready.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => mm.revert()
  }, [])

  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return // let new-tab clicks work
    e.preventDefault()
    start(cardRef.current, '/countwise')
  }

  return (
    <div ref={sceneRef} className="cwscene">
      <div className="cwscene__sticky">
        <div className="cwscene__head">
          <h3 className="display cwscene__name">COUNTWISE</h3>
          <p className="muted">Every expense counts.</p>
        </div>

        <a
          ref={cardRef}
          href="/countwise"
          className="proj"
          aria-label="Explore CountWise"
          onClick={open}
          onPointerEnter={loadCountWise}
          onFocus={loadCountWise}
        >
          <div className="proj__inner" aria-hidden="true">
            <div className="cwcard__top">
              <span className="cwcard__mono">NET BALANCE</span>
              <span className="cwcard__mono">OCT 2026</span>
            </div>
            <p className="cwcard__balance" data-depth="1">₹48,250</p>
            <div className="cwcard__accts" data-depth="2">
              {ACCOUNTS.map(([n, v]) => (
                <span key={n}><b>{n}</b> {v}</span>
              ))}
            </div>
            <div className="cwcard__bars" data-depth="-1.5">
              {BARS.map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <ul className="cwcard__rows" data-depth="2.5">
              {ROWS.map(([a, b]) => (
                <li key={a}><span>{a}</span><span>{b}</span></li>
              ))}
            </ul>
          </div>
        </a>

        <div className="cwscene__foot">
          <div className="cwscene__message">
            <p>Personal finance, built around clarity.</p>
            <p className="muted cwscene__phrase">Track. Understand. Plan.</p>
          </div>
          <a href="/countwise" className="cwscene__cta" onClick={open}>
            Explore CountWise →
          </a>
        </div>
      </div>
    </div>
  )
}
