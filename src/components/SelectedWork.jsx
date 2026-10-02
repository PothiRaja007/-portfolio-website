import CountWiseProject from './CountWiseProject'
import PacifyProject from './PacifyProject'

// Selected Work: projects intentionally presented as portfolio pieces.
export default function SelectedWork() {
  return (
    <section id="work" className="work" aria-labelledby="work-h">
      <h2 id="work-h" className="label work__label">Selected work</h2>
      <CountWiseProject />
      <PacifyProject />
    </section>
  )
}
