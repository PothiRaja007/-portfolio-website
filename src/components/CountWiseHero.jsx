import { Link } from 'react-router-dom'

// The CountWise landing hero. Rendered in two places with identical layout:
//   1. inside the takeover overlay (non-interactive)
//   2. on the /countwise page (interactive)
// Identical markup is what makes the hand-off invisible.
export default function CountWiseHero({ interactive = true, onBack }) {
  const handleBack = (e) => {
    if (!onBack || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onBack() // reverse transition; plain link still works as a fallback
  }

  return (
    <div className="cw">
      <p className="cw__mono" data-t="eyebrow">COUNTWISE</p>
      <h1 className="cw__title" data-t="title">Every expense counts.</h1>
      <p className="cw__copy" data-t="copy">Personal finance, built around clarity.</p>
      {interactive ? (
        <Link to="/" className="cw__back" data-t="back" onClick={handleBack}>
          Return to portfolio
        </Link>
      ) : (
        <span className="cw__back" data-t="back">Return to portfolio</span>
      )}
    </div>
  )
}
