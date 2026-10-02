import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Cursor from './components/Cursor'
import Navigation from './components/Navigation'
import ScrollManager from './components/ScrollManager'
import Home from './pages/Home'
import { CountWise } from './routes/lazyPages'
import { TakeoverProvider } from './context/TakeoverContext'

export default function App() {
  return (
    <TakeoverProvider>
      <a href="#work" className="skip-link">Skip to work</a>
      <ScrollManager />
      <Navigation />
      {/* Paper-colored fallback: a direct visit to /countwise never flashes dark. */}
      <Suspense fallback={<div className="cw-fallback" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countwise" element={<CountWise />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Cursor />
    </TakeoverProvider>
  )
}
