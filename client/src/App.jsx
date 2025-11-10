import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import './index.css'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Setup2FA from './pages/Setup2FA'
import Dashboard from './pages/Dashboard'
import LoginPhone from './pages/LoginPhone'
import { login, register, setToken } from './api'

function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-neon-green)' }}>
            <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
            <circle cx="15.5" cy="12" r="5" stroke="currentColor" strokeWidth="2" opacity="0.7" />
            <circle cx="15.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          </svg>
          <span className="neon-title-green">RunaWayLa84</span>
        </Link>
        <nav className="flex gap-4 text-sm text-white/90">
          <Link to="/" className="hover:text-white">Inicio</Link>
          <Link to="/login" className="hover:text-white">Acceso Taller</Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-sm">
        <span className="neon-text text-neon-green">Servicios web, sistemas e informática</span>
        <div className="flex items-center gap-4">
          <a href="mailto:irtelc01@gmail.com" className="neon-text text-neon-cyan hover:underline">irtelc01@gmail.com</a>
          <a href="https://wa.me/573027383350?text=Hola%20vi%20tu%20contacto%20en%20RunaWayLa84" target="_blank" rel="noreferrer" className="neon-text text-neon-green hover:underline">WhatsApp 302 738 3350</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  // Auto-login global: si no hay token, intenta admin/runaway123 y registra si hace falta
  useEffect(() => {
    const run = async () => {
      // En producción sólo auto-login si está habilitado explícitamente
      if (import.meta.env.PROD && String(import.meta.env.VITE_OPEN_ACCESS) !== 'true') return
      const hasToken = !!localStorage.getItem('runaway_token')
      if (hasToken) return
      try {
        let r = await login('admin', 'runaway123', '')
        if (!r.token) { await register('admin', 'runaway123'); r = await login('admin', 'runaway123', '') }
        if (r.token) { setToken(r.token) }
      } catch {}
    }
    run()
  }, [])

  function RequireAuth({ children }) {
    const openAccess = String(import.meta.env.VITE_OPEN_ACCESS) === 'true'
    const token = localStorage.getItem('runaway_token')
    if (!openAccess && !token) return <Navigate to="/login" replace />
    return children
  }
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-future text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-phone" element={<LoginPhone />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-2fa" element={<Setup2FA />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Routes>
        <Footer />
        {/* Botón flotante de WhatsApp: número real del taller */}
        <a
          href="https://wa.me/573107206150?text=Hola%20quiero%20cotizar"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-16 right-4 px-4 py-2 rounded-full bg-green-500/80 hover:bg-green-500 shadow-lg border border-white/10"
        >
          WhatsApp
        </a>
      </div>
    </BrowserRouter>
  )
}
