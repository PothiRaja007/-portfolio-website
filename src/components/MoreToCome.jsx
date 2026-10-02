import Reveal from './Reveal'

// A breathing space. No placeholder projects on purpose.
export default function MoreToCome() {
  return (
    <section className="more" aria-labelledby="more-h">
      <Reveal>
        <h2 id="more-h" className="label">More to come</h2>
        <p className="display more__line">More ideas are already in progress.</p>
      </Reveal>
    </section>
  )
}
