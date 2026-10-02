import Hero from '../components/Hero'
import SelectedWork from '../components/SelectedWork'
import MoreToCome from '../components/MoreToCome'
import Experiments from '../components/Experiments'
import About from '../components/About'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <SelectedWork />
      <MoreToCome />
      <Experiments />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
