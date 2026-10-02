import { SITE } from '../data/site'
import Reveal from './Reveal'

export default function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-h">
      <Reveal>
        <h2 id="contact-h" className="label">Contact</h2>
        <p className="display contact__q">Have an idea?</p>
        <a
          className="display contact__cta"
          href={`mailto:${SITE.email}`}
          aria-label="Send Pothi Raja D an email"
        >
          Let&rsquo;s talk. <span aria-hidden="true">→</span>
        </a>
      </Reveal>
    </section>
  )
}
