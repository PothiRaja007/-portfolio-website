import useReducedMotion from '../hooks/useReducedMotion'

export default function Footer() {
  const reduced = useReducedMotion()
  const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })

  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Pothi Raja D</p>
      <button onClick={toTop}>Back to top ↑</button>
    </footer>
  )
}
