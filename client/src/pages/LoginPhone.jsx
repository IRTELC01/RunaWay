import { useState } from 'react'
import { requestOtp, loginPhone, setToken } from '../api'

export default function LoginPhone() {
  const [phone, setPhone] = useState('3001234567')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [devCode, setDevCode] = useState('')

  const onRequest = async (e) => {
    e.preventDefault()
    const r = await requestOtp(phone)
    if (r.ok) {
      setMsg('Código enviado')
      if (r.dev_code) setDevCode(r.dev_code)
    } else setMsg(r.error || 'Error solicitando OTP')
  }
  const onLogin = async (e) => {
    e.preventDefault()
    const r = await loginPhone(phone, code)
    if (r.token) { setToken(r.token); setMsg('Acceso concedido'); window.location.href = '/dashboard' }
    else setMsg(r.error || 'Error de acceso')
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Acceso por teléfono (OTP)</h2>
      <form className="card-float p-4 space-y-3" onSubmit={onLogin}>
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Teléfono (Colombia)"
               value={phone} onChange={e=>setPhone(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={onRequest} className="flex-1 px-3 py-2 rounded bg-neon-cyan/60 hover:bg-neon-cyan/80" type="button">Enviar código</button>
          <button className="flex-1 px-3 py-2 rounded bg-neon-pink/60 hover:bg-neon-pink/80" type="submit">Ingresar</button>
        </div>
        <input className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" placeholder="Código OTP"
               value={code} onChange={e=>setCode(e.target.value)} />
      </form>
      {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
      {devCode && <p className="mt-2 text-xs text-white/60">Código dev: {devCode}</p>}
      <div className="mt-3 text-xs text-white/60 flex gap-3">
        <a href="/login">Acceso con usuario + 2FA</a>
        <a href="/register">Registrar propietario</a>
      </div>
    </main>
  )
}