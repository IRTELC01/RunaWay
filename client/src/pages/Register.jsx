import { useState } from 'react'
import { register } from '../api'

export default function Register() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('runaway123')
  const [msg, setMsg] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const r = await register(username, password)
    setMsg(r.error ? r.error : 'Usuario creado. Ingrese con usuario y contraseña. Opcional: configurar 2FA más tarde.')
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Registro simple</h2>
      <form onSubmit={onSubmit} className="card-float p-4 space-y-3">
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Usuario"
               value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Contraseña"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full px-3 py-2 rounded bg-neon-pink/60 hover:bg-neon-pink/80">Registrar</button>
      </form>
      {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
      <p className="mt-2 text-xs text-white/60">Opcional: Configurar 2FA (TOTP) más tarde. Si deseas OTP por teléfono, puedes asociarlo luego en ajustes.</p>
    </main>
  )
}