import { useState } from 'react'
import { setup2fa } from '../api'

export default function Setup2FA() {
  const [username, setUsername] = useState('admin')
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [msg, setMsg] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const r = await setup2fa(username)
    if (r.qr) { setQr(r.qr); setSecret(r.secret); setMsg('Escanee con Google Authenticator o Authy') }
    else { setMsg(r.error || 'Error') }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Configurar 2FA (TOTP)</h2>
      <form onSubmit={onSubmit} className="card-float p-4 space-y-3">
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Usuario"
               value={username} onChange={e=>setUsername(e.target.value)} />
        <button className="w-full px-3 py-2 rounded bg-neon-cyan/60 hover:bg-neon-cyan/80">Generar QR</button>
      </form>
      {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
      {qr && (
        <div className="card-float p-4 mt-4 text-center">
          <img src={qr} alt="QR 2FA" className="mx-auto" />
          <p className="mt-2 text-xs text-white/60">Secreto: {secret}</p>
          <p className="mt-2 text-xs text-white/60">Tip: Al generar un nuevo QR se reemplaza el secreto anterior. Usa en el login el código de 6 dígitos de tu app (no el secreto).</p>
        </div>
      )}
    </main>
  )
}