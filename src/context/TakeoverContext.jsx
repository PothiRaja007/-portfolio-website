import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CountWiseHero from '../components/CountWiseHero'
import { loadCountWise } from '../routes/lazyPages'
import useReducedMotion from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const TakeoverContext = createContext({ start: () => {}, back: () => {} })
export const useTakeover = () => useContext(TakeoverContext)

const frames = (n) =>
  new Promise((resolve) => {
    const tick = () => (--n <= 0 ? resolve() : requestAnimationFrame(tick))
    requestAnimationFrame(tick)
  })

// Two choreographies, same idea (compact <-> full world):
//  desktop: clip-path window grows from the clicked card (expo ease), the
//           portfolio recedes behind it.
//  mobile : "lift": a paper panel moves/scales from the card to full screen
//           using transform + opacity only (cheaper on phones), then the
//           hero text arrives.
// "enter" goes portfolio -> CountWise, "return" plays it in reverse.
export function TakeoverProvider({ children }) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [job, setJob] = useState(null)
  const rootRef = useRef(null)
  const faceRef = useRef(null)
  const panelRef = useRef(null)
  const busy = useRef(false)

  // Keep the latest navigate/reduced in refs. react-router gives us a NEW
  // navigate function every time the URL changes, so using it as an effect
  // dependency re-ran the whole animation right after navigating.
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const start = useCallback((el, to) => {
    if (busy.current || !el) return
    busy.current = true
    loadCountWise()
    const r = el.getBoundingClientRect()
    setJob({
      mode: 'enter', node: el, to, mobile: window.innerWidth < 720,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    })
  }, [])

  const back = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setJob({ mode: 'return', mobile: window.innerWidth < 720 })
  }, [])

  useLayoutEffect(() => {
    if (!job) return
    const reduced = reducedRef.current
    const root = rootRef.current
    const face = faceRef.current
    const panel = panelRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const lift = job.mobile && !reduced
    const q = (s) => root.querySelector(`[data-t="${s}"]`)
    const content = ['eyebrow', 'title', 'copy', 'back'].map(q)
    const full = 'inset(0px 0px 0px 0px round 0px)'
    const clipFor = (r) =>
      `inset(${r.top}px ${vw - r.left - r.width}px ${vh - r.top - r.height}px ${r.left}px round 16px)`
    const panelFor = (r) => ({ x: r.left, y: r.top, scaleX: r.width / vw, scaleY: r.height / vh })

    let tl = null
    let killed = false
    const end = () => {
      if (killed) return
      busy.current = false
      setJob(null)
    }

    // Copy of the card shown inside the overlay so the visitor sees the
    // same object they clicked (or are returning to).
    const showFace = (node, rect) => {
      const clone = node.cloneNode(true)
      clone.removeAttribute('href')
      clone.removeAttribute('style') // drop scroll-scene transform
      clone.setAttribute('tabindex', '-1')
      clone.setAttribute('aria-hidden', 'true')
      face.replaceChildren(clone)
      Object.assign(face.style, {
        top: `${rect.top}px`, left: `${rect.left}px`,
        width: `${rect.width}px`, height: `${rect.height}px`,
      })
    }

    document.body.style.overflow = 'hidden'

    // ---------- ENTER: portfolio -> CountWise ----------
    const enter = () => {
      const { rect } = job
      const finish = async () => {
        await loadCountWise()
        if (killed) return
        navigateRef.current(job.to)
        await frames(2) // let the real page paint underneath
        end()
      }
      tl = gsap.timeline({ onComplete: finish })

      if (reduced) {
        gsap.set(root, { clipPath: full, opacity: 0 })
        tl.to(root, { opacity: 1, duration: 0.3, ease: 'none' })
        return
      }

      showFace(job.node, rect)
      gsap.set(content, { opacity: 0, y: 28 })

      if (lift) {
        gsap.set(panel, { ...panelFor(rect), transformOrigin: '0 0' })
        tl.to(face, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
          .to(panel, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: 'power3.inOut' }, 0)
          .to(content, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.45)
        return
      }

      const dur = 1.15
      gsap.set(root, { clipPath: clipFor(rect) })
      tl.to(root, { clipPath: full, duration: dur, ease: 'expo.inOut' }, 0)
        .to(face, { opacity: 0, scale: 1.06, duration: 0.45, ease: 'power2.in' }, 0.1)
        .to(content[0], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, dur * 0.45)
        .to(content[1], { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, dur * 0.5)
        .to(content[2], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, dur * 0.65)
        .to(content[3], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, dur * 0.8)

      const main = document.querySelector('main')
      if (main) {
        gsap.set(main, {
          transformOrigin: `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2 + window.scrollY}px`,
        })
        tl.to(main, { scale: 0.94, opacity: 0.35, duration: dur, ease: 'expo.inOut' }, 0)
      }
    }

    // ---------- RETURN: CountWise -> portfolio ----------
    const leave = async () => {
      gsap.set(root, { clipPath: full })
      if (lift) gsap.set(panel, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' })

      await frames(1)
      if (killed) return
      navigateRef.current('/')
      await frames(3) // Home mounts, scroll position is restored
      if (killed) return

      // Snap the scroll scene to the restored position (no scrub lag).
      ScrollTrigger.refresh()
      ScrollTrigger.getAll().forEach((st) => st.animation && st.animation.progress(st.progress))

      const card = document.querySelector('.proj')
      const r = card && card.getBoundingClientRect()
      const visible = r && r.width > 0 && r.bottom > 0 && r.top < vh

      tl = gsap.timeline({ onComplete: end })
      if (reduced || !visible) {
        tl.to(root, { opacity: 0, duration: 0.35, ease: 'none' })
        return
      }

      const rect = { top: r.top, left: r.left, width: r.width, height: r.height }
      showFace(card, rect)
      gsap.set(face, { opacity: 0 })
      tl.to(content, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)

      if (lift) {
        tl.to(panel, { ...panelFor(rect), duration: 0.75, ease: 'power3.inOut' }, 0.15)
      } else {
        tl.to(root, { clipPath: clipFor(rect), duration: 1, ease: 'expo.inOut' }, 0.1)
        const main = document.querySelector('main')
        if (main) {
          gsap.set(main, {
            transformOrigin: `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2 + window.scrollY}px`,
          })
          tl.fromTo(main, { scale: 0.94, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.inOut' }, 0.1)
        }
      }
      tl.to(face, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5)
    }

    if (job.mode === 'enter') enter()
    else leave()

    return () => {
      killed = true
      if (tl) tl.kill()
      face.replaceChildren()
      document.body.style.overflow = ''
      const main = document.querySelector('main')
      if (main) gsap.set(main, { clearProps: 'all' })
    }
  }, [job]) // only a new takeover job should (re)start the animation

  return (
    <TakeoverContext.Provider value={{ start, back }}>
      {children}
      {job && (
        <div
          ref={rootRef}
          className={`takeover ${job.mobile && !reduced ? 'takeover--lift' : ''}`}
          aria-hidden="true"
        >
          <div ref={panelRef} className="takeover__panel" />
          <CountWiseHero interactive={false} />
          <div ref={faceRef} className="takeover__face" />
        </div>
      )}
    </TakeoverContext.Provider>
  )
}
