import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTakeover } from '../context/TakeoverContext'
import { loadCountWise } from '../routes/lazyPages'

gsap.registerPlugin(ScrollTrigger)

// ---- Showcase series: a NEW random growth curve on every full page load ----
const rand = (a, b) => a + Math.random() * (b - a)

function makeSeries(n = 30) {
  const start = rand(9000, 18000)
  const end = Math.round(rand(42000, 98000) / 10) * 10
  const amp = (end - start) * 0.07
  const out = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const trend = start + (end - start) * Math.pow(t, 1.15) // always trends upward
    const noise = i === 0 || i === n - 1 ? 0 : (Math.random() - 0.5) * 2 * amp * (1 - 0.3 * t)
    out.push(Math.max(trend + noise, start * 0.6))
  }
  return out
}

const DATA = makeSeries() // module scope: same curve if you return from CountWise
let drawn = false // the draw-in plays once per page load

const VB_W = 600
const VB_H = 240
const X_PAD = 6
const PAD_T = 24
const PAD_B = 20
const SPAN = Math.max(...DATA) - Math.min(...DATA)
const LO = Math.min(...DATA) - SPAN * 0.08
const HI = Math.max(...DATA) + SPAN * 0.08
const yOf = (v) => PAD_T + (1 - (v - LO) / (HI - LO)) * (VB_H - PAD_T - PAD_B)

// Smooth the curve (Catmull-Rom) into dense samples. The line AND the moving
// dot both use these samples, so the dot always sits exactly on the line.
const cr = (p0, p1, p2, p3, t) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
const STEPS = 10
const values = []
for (let i = 0; i < DATA.length - 1; i++) {
  const p0 = DATA[Math.max(i - 1, 0)]
  const p1 = DATA[i]
  const p2 = DATA[i + 1]
  const p3 = DATA[Math.min(i + 2, DATA.length - 1)]
  for (let s = 0; s < STEPS; s++) values.push(cr(p0, p1, p2, p3, s / STEPS))
}
values.push(DATA[DATA.length - 1])
const PTS = values.map((v, i) => ({
  v,
  x: X_PAD + (i / (values.length - 1)) * (VB_W - 2 * X_PAD),
  y: yOf(v),
}))
const LINE_D = 'M' + PTS.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')
const END = PTS[PTS.length - 1]
const AREA_D = `${LINE_D} L${END.x.toFixed(1)} ${VB_H} L${PTS[0].x.toFixed(1)} ${VB_H} Z`
const START_Y = PTS[0].y
const GRID_Y = [0.25, 0.5, 0.75].map((f) => PAD_T + f * (VB_H - PAD_T - PAD_B))
const fmt = (v) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(v / 10) * 10)
const FINAL_TEXT = fmt(END.v)

// CountWise scene. A tall track holds a sticky stage (CSS sticky, so normal
// scrolling is never hijacked). Scroll drives the card coming forward and the
// text beats; the chart draws itself once, by time, when the scene arrives.
// Layers: .proj (outer) = scroll transform, .proj__inner = hover zoom only.
export default function CountWiseProject() {
  const sceneRef = useRef(null)
  const cardRef = useRef(null)
  const plotRef = useRef(null)
  const dotRef = useRef(null)
  const readRef = useRef(null)
  const { start } = useTakeover()

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const plot = plotRef.current
    const dot = dotRef.current
    const read = readRef.current
    const mm = gsap.matchMedia()

    // p = 0..1: how much of the line is drawn. Moves the reveal edge, the dot
    // and the balance readout together, so they can never disagree.
    const render = (p) => {
      const idx = p * (PTS.length - 1)
      const i = Math.min(Math.floor(idx), PTS.length - 2)
      const f = idx - i
      const a = PTS[i]
      const b = PTS[i + 1]
      const x = a.x + (b.x - a.x) * f
      const y = a.y + (b.y - a.y) * f
      const v = a.v + (b.v - a.v) * f
      plot.style.clipPath = p >= 1 ? 'none' : `inset(0 ${(1 - x / VB_W) * 100}% 0 0)`
      dot.style.left = `${(x / VB_W) * 100}%`
      dot.style.top = `${(y / VB_H) * 100}%`
      read.textContent = fmt(v)
    }

    let tween = null

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 720px)',
        tall: '(min-height: 561px)', // short landscape screens get the static layout
      },
      (ctx) => {
        if (!ctx.conditions.motion || !ctx.conditions.tall) {
          render(1) // static: finished chart, no animation
          return
        }
        const { wide } = ctx.conditions
        const q = gsap.utils.selector(scene)

        // Scroll-linked part: card comes forward, text beats appear.
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        })
          .fromTo(q('.proj'),
            { scale: wide ? 0.78 : 0.86, y: wide ? 80 : 50 },
            { scale: 1, y: 0, duration: 0.45 }, 0)
          .fromTo(q('.cwscene__name'), { opacity: 1, y: 0 }, { opacity: 0.6, y: -14, duration: 0.45 }, 0.15)
          .fromTo(q('.cwscene__message'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.5)
          .fromTo(q('.cwscene__phrase'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, 0.62)
          .fromTo(q('.cwscene__cta'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.8)
          .to({}, { duration: 0.05 }, 0.95)

        // Time-based part: the line draws itself once when the scene arrives.
        if (drawn) {
          render(1)
        } else {
          render(0)
          const state = { p: 0 }
          ScrollTrigger.create({
            trigger: scene,
            start: 'top 45%',
            once: true,
            onEnter: () => {
              drawn = true
              tween = gsap.to(state, {
                p: 1, duration: 2.4, ease: 'power2.out',
                onUpdate: () => render(state.p),
              })
            },
          })
        }

        return () => {
          if (tween) tween.kill()
          render(1) // if motion is switched off later, show the finished chart
        }
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
              <span className="cwcard__mono">THIS MONTH</span>
            </div>
            <p className="cwcard__balance" ref={readRef}>{FINAL_TEXT}</p>

            <div className="cwcard__chart">
              <svg className="cwcard__layer" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
                {GRID_Y.map((y) => (
                  <line key={y} x1="0" x2={VB_W} y1={y} y2={y} className="cwcard__grid" />
                ))}
                <line x1="0" x2={VB_W} y1={START_Y} y2={START_Y} className="cwcard__base" />
                <path d={LINE_D} className="cwcard__ghost" />
              </svg>
              <div className="cwcard__layer" ref={plotRef}>
                <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
                  <path d={AREA_D} className="cwcard__area" />
                  <path d={LINE_D} className="cwcard__line" />
                </svg>
              </div>
              <span
                ref={dotRef}
                className="cwcard__dot"
                style={{ left: `${(END.x / VB_W) * 100}%`, top: `${(END.y / VB_H) * 100}%` }}
              />
            </div>
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
