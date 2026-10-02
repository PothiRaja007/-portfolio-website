import { EXPERIMENTS } from '../data/experiments'
import Reveal from './Reveal'

function Row({ item }) {
  const body = (
    <>
      <h3 className="exprow__name">{item.name}</h3>
      <div className="exprow__desc">
        <p>{item.title}</p>
        <p className="muted">{item.description}</p>
        <p className="exprow__stack">{item.stack}</p>
      </div>
      <span className="exprow__view label">{item.href ? 'View →' : item.status}</span>
    </>
  )

  return item.href ? (
    <a className="exprow exprow--link" href={item.href} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <div className="exprow">{body}</div>
  )
}

// Deliberately quieter than Selected Work: a list, not a gallery.
export default function Experiments() {
  return (
    <section id="experiments" className="exp" aria-labelledby="exp-h">
      <Reveal>
        <h2 id="exp-h" className="label">Experiments</h2>
        <p className="muted exp__intro">
          Small builds, experiments and tools created to solve specific problems.
        </p>
        <ul className="exp__list">
          {EXPERIMENTS.map((item) => (
            <li key={item.name}><Row item={item} /></li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
