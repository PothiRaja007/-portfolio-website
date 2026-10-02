import Reveal from './Reveal'

// Pacify is not designed yet, so this is deliberately honest: hover zooms
// (global rule), click does nothing. Not a link, not focusable, no popup.
export default function PacifyProject() {
  return (
    <div className="soon-wrap">
      <Reveal>
        <article className="soon" aria-label="Pacify, coming soon">
          <div className="soon__inner">
            <h3 className="display soon__name">PACIFY</h3>
            <p className="label">Coming soon</p>
            <p className="muted">A new project is taking shape.</p>
          </div>
        </article>
      </Reveal>
    </div>
  )
}
