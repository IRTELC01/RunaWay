import { useEffect, useState } from 'react'
import { login, register, setToken } from '../api'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('runaway123')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const r = await login(username, password, code)
    if (r.token) { setToken(r.token); setMsg('Acceso concedido'); window.location.href = '/dashboard' }
    else setMsg(r.error || 'Error de acceso')
  }

  // Automatizar acceso: intenta login y, si falla, registra y vuelve a intentar
  const autoLogin = async () => {
    try {
      setMsg('Intentando acceso automático...')
      let r = await login(username, password, '')
      if (!r.token) {
        await register(username, password)
        r = await login(username, password, '')
      }
      if (r.token) { setToken(r.token); setMsg('Acceso automático concedido'); window.location.href = '/dashboard' }
      else setMsg(r.error || 'No se pudo acceder automáticamente')
    } catch (e) {
      setMsg('No se pudo acceder automáticamente')
    }
  }

  useEffect(() => {
    const isProd = import.meta.env.MODE === 'production'
    const hasToken = !!localStorage.getItem('runaway_token')
    if (!isProd && !hasToken) autoLogin()
  }, [])

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Acceso Administrador</h2>
      <form onSubmit={onSubmit} className="card-float p-4 space-y-3">
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Usuario"
               value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Contraseña"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Código 2FA (opcional)"
               value={code} onChange={e=>setCode(e.target.value)} />
        <p className="text-xs text-white/60">Déjalo vacío si no configuraste 2FA. Si lo tienes, usa el código de 6 dígitos generado por tu app.</p>
        <button className="w-full px-3 py-2 rounded bg-neon-pink/60 hover:bg-neon-pink/80">Ingresar</button>
        <button type="button" onClick={autoLogin} className="w-full px-3 py-2 rounded bg-neon-cyan/60 hover:bg-neon-cyan/80">Acceso automático</button>
      </form>
      {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
      <div className="mt-3 text-xs text-white/60 flex gap-3">
        <a href="/register">Registrar</a>
        <a href="/setup-2fa">Configurar 2FA</a>
      </div>
    </main>
  )
}