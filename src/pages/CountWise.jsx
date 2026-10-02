import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import CountWiseHero from '../components/CountWiseHero'
import { useTakeover } from '../context/TakeoverContext'

// Fades a block in once, when it first scrolls into view.
function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-in')
        io.disconnect()
      }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

function Section({ n, label, title, text, children }) {
  return (
    <section className="cwsec">
      <Reveal>
        <p className="cw__mono">{n} — {label}</p>
        <h2 className="cwsec__title">{title}</h2>
        <p className="cwsec__text">{text}</p>
      </Reveal>
      <Reveal className="cwsec__spec">{children}</Reveal>
    </section>
  )
}

export default function CountWise() {
  const { back } = useTakeover()

  useEffect(() => {
    const prev = document.title
    document.title = 'CountWise — Every expense counts'
    return () => { document.title = prev }
  }, [])

  return (
    <main className="cwpage">
      <CountWiseHero onBack={back} />

      <Section
        n="01" label="TRACK"
        title="Type it the way you'd say it."
        text="Write an entry like a message. CountWise reads the amount, picks a category from simple keyword rules, and files it. No black box."
      >
        <div className="spec">
          <p className="spec__input">spent 250 on lunch at canteen</p>
          <div className="spec__row"><span>Category</span><span>Food</span></div>
          <div className="spec__row"><span>Amount</span><span>−₹250</span></div>
          <div className="spec__row"><span>Account</span><span>Wallet</span></div>
          <p className="spec__note">Illustrative example</p>
        </div>
      </Section>

      <Section
        n="02" label="UNDERSTAND"
        title="Balances that can't drift."
        text="A balance is never stored. It is calculated from your transactions every time, so the number you see always matches the entries behind it."
      >
        <div className="spec">
          <div className="spec__row"><span>Income</span><span>₹32,000</span></div>
          <div className="spec__row"><span>Expenses</span><span>−₹1,620</span></div>
          <div className="spec__row"><span>Transfers (net)</span><span>₹0</span></div>
          <div className="spec__row spec__row--total"><span>Balance</span><span>₹30,380</span></div>
          <p className="spec__note">Illustrative example</p>
        </div>
      </Section>

      <Section
        n="03" label="PLAN"
        title="Set money aside without spending it."
        text="Goals are allocations, not expenses. Allocate to a goal and your real balance stays put; only what is available to spend changes."
      >
        <div className="spec">
          <div className="spec__row"><span>Real balance</span><span>₹20,000</span></div>
          <div className="spec__row"><span>Allocated to goals</span><span>₹5,000</span></div>
          <div className="spec__row spec__row--total"><span>Available</span><span>₹15,000</span></div>
          <p className="spec__note">Illustrative example</p>
        </div>
      </Section>

      <footer className="cwfoot">
        <p className="cw__mono">COUNTWISE · BUILT BY POTHI RAJA D</p>
        <Link
          to="/"
          className="cw__back"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
            e.preventDefault()
            back()
          }}
        >
          Return to portfolio
        </Link>
      </footer>
    </main>
  )
}
