import { SITE } from '../data/site'
import Reveal from './Reveal'

export default function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-h">
      <Reveal>
        <h2 id="about-h" className="label">About</h2>
        <p className="display about__name">{SITE.name}</p>
        <p className="about__tag">{SITE.tagline}</p>
        <p className="muted about__intro">
          I build projects where finance, technology and AI meet — exploring ideas through
          software, data and product design.
        </p>
        <ul className="about__links">
          <li><a href={SITE.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
          <li><a href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
        </ul>
      </Reveal>
    </section>
  )
}
