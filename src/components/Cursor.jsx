import { useEffect, useRef } from 'react'

// Small contextual label that follows the pointer ONLY over interactive
// project areas. The real cursor is never hidden. Desktop/mouse only.
const TARGETS = [
  ['.proj', 'View →'],
  ['.soon', 'Coming soon'],
]

export default function Cursor() {
  const el = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const node = el.current
    let raf = 0
    let x = 0
    let y = 0

    const paint = () => {
      raf = 0
      node.style.transform = `translate3d(${x + 16}px, ${y + 18}px, 0)`
    }
    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      let label = ''
      if (e.target instanceof Element) {
        for (const [selector, text] of TARGETS) {
          if (e.target.closest(selector)) { label = text; break }
        }
      }
      if (label) {
        if (node.textContent !== label) node.textContent = label
        node.classList.add('is-on')
      } else {
        node.classList.remove('is-on')
      }
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const onLeave = () => node.classList.remove('is-on')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={el} className="cursor" aria-hidden="true" />
}
