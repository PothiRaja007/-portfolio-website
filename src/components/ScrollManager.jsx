import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const KEY = 'portfolio:home-scroll'

// 1. Remembers the portfolio's scroll position so returning from a project
//    lands the visitor where they left, not at the top.
// 2. Moves keyboard/screen-reader focus to the new page after a route change
//    (otherwise focus is lost when the clicked link disappears).
export default function ScrollManager() {
  const { pathname } = useLocation()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo(0, 0)
      return
    }
    const saved = Number(sessionStorage.getItem(KEY) || 0)
    window.scrollTo(0, saved)

    const onScroll = () => sessionStorage.setItem(KEY, String(window.scrollY))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
  }, [pathname])

  return null
}
