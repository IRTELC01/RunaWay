import { useEffect, useMemo, useState } from 'react'
import { createInvoice, listInvoices, getSummary, addTransaction } from '../api'
import { WORKSHOP_NAME, WORKSHOP_PHONES, WORKSHOP_ADDRESS, WORKSHOP_NIT_LABEL } from '../config'

function InvoiceForm({ onCreated }) {
  const [customer_name, setCustomer] = useState('Cliente barrio')
  const [address, setAddress] = useState('Calle 1 # 2-3')
  const [phone, setPhone] = useState('3001234567')
  const [service_type, setServiceType] = useState('revision')
  const [service_value, setServiceValue] = useState(50000)
  const [line_items, setItems] = useState([])
  const [labor_cost, setLabor] = useState(0)
  const [vat_enabled, setVatEnabled] = useState(false)
  const [vat_percent, setVatPercent] = useState(19)
  const [payment_method, setPay] = useState('efectivo')
  const [notes, setNotes] = useState('')

  const items_total = (service_value || 0) + line_items.reduce((s,i)=> s + Number(i.price) * Number(i.qty||1), 0)
  const subtotal = items_total + Number(labor_cost||0)
  const vat = vat_enabled ? subtotal * (Number(vat_percent||0)/100) : 0
  const total = subtotal + vat

  const addItem = () => setItems([...line_items, { name: 'Repuesto', qty: 1, price: 20000 }])
  const updateItem = (idx, key, val) => { const copy = [...line_items]; copy[idx] = { ...copy[idx], [key]: val }; setItems(copy) }
  const submit = async (e) => {
    e.preventDefault()
    const baseItemName = ({revision:'Revisión mecánica', mecanica:'Mecánica general', aceite:'Cambio de aceite', repuestos:'Repuestos de moto'})[service_type] || 'Servicio'
    const payloadItems = [ { name: baseItemName, qty: 1, price: Number(service_value||0) }, ...line_items ]
    const r = await createInvoice({ customer_name, address, phone, line_items: payloadItems, labor_cost, vat_percent: vat_enabled ? vat_percent : 0, payment_method, notes })
    if (r.ok) onCreated();
  }

  const clearForm = () => {
    setCustomer('')
    setAddress('')
    setPhone('')
    setServiceType('revision')
    setServiceValue(0)
    setItems([])
    setLabor(0)
    setVatEnabled(false)
    setVatPercent(19)
    setPay('efectivo')
    setNotes('')
  }

  return (
    <form onSubmit={submit} className="card-float p-4 space-y-3">
      <h3 className="font-semibold">Factura rápida</h3>
      <div className="grid md:grid-cols-2 gap-2">
        <input className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={customer_name} onChange={e=>setCustomer(e.target.value)} placeholder="Cliente" />
        <input className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Celular" />
        <input className="md:col-span-2 px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Dirección" />
      </div>
      <div className="grid md:grid-cols-4 gap-2">
        <select className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white" value={service_type} onChange={e=>setServiceType(e.target.value)}>
          <option value="revision">Revisión mecánica</option>
          <option value="mecanica">Mecánica general</option>
          <option value="aceite">Cambio de aceite</option>
          <option value="repuestos">Repuestos de moto</option>
        </select>
        <input type="number" className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={service_value} onChange={e=>setServiceValue(Number(e.target.value))} placeholder="Valor servicio" />
        <input type="number" className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={labor_cost} onChange={e=>setLabor(Number(e.target.value))} placeholder="Mano de obra" />
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={vat_enabled} onChange={e=>setVatEnabled(e.target.checked)} /> IVA</label>
          <input type="number" className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white" value={vat_percent} onChange={e=>setVatPercent(Number(e.target.value))} disabled={!vat_enabled} />
        </div>
      </div>

      {line_items.map((it, i) => (
        <div className="grid grid-cols-5 gap-2" key={i}>
          <input className="col-span-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={it.name} onChange={e=>updateItem(i,'name',e.target.value)} />
          <input type="number" className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white" value={it.qty} onChange={e=>updateItem(i,'qty',Number(e.target.value))} />
          <input type="number" className="col-span-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-white" value={it.price} onChange={e=>updateItem(i,'price',Number(e.target.value))} />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className="px-3 py-1 rounded bg-white/10 border border-white/20" onClick={addItem}>Añadir repuesto</button>
        <select className="px-3 py-1 rounded bg-white/10 border border-white/20 text-white" value={payment_method} onChange={e=>setPay(e.target.value)}>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>
      <textarea className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notas" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-white/80">Subtotal: ${subtotal.toLocaleString()} · IVA: ${vat.toLocaleString()} · Total: ${total.toLocaleString()}</span>
        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 rounded bg-white/10 border border-white/20" onClick={clearForm}>Limpiar</button>
          <button className="px-4 py-2 rounded bg-neon-cyan/60 hover:bg-neon-cyan/80">Guardar factura</button>
        </div>
      </div>
  </form>
  )
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [summary, setSummary] = useState({ income:0, expense:0, assets:0, liabilities:0, profit:0 })
  const [tx, setTx] = useState({ type:'expense', category:'insumos', amount: 10000, reference: 'compra de tornillos' })
  const [compactView, setCompactView] = useState(false)

  const invoiceSummary = useMemo(() => {
    const count = invoices.length
    const subtotal = invoices.reduce((s,i)=> s + Number(i.subtotal||0), 0)
    const vat = invoices.reduce((s,i)=> s + Number(i.vat_amount||0), 0)
    const total = invoices.reduce((s,i)=> s + Number(i.total||0), 0)
    return { count, subtotal, vat, total }
  }, [invoices])

  const refresh = async () => {
    const inv = await listInvoices(); setInvoices(inv || [])
    const sum = await getSummary(); setSummary(sum || summary)
  }

  useEffect(() => { refresh() }, [])

  const addTx = async (e) => {
    e.preventDefault(); const r = await addTransaction({ ...tx, amount: Number(tx.amount) }); if (r.ok) refresh()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <InvoiceForm onCreated={refresh} />
        <div className="card-float p-4">
          <h3 className="font-semibold">Resumen de facturación</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded bg-white/5 border border-white/10">Facturas: {invoiceSummary.count}</div>
            <div className="p-3 rounded bg-white/5 border border-white/10">Subtotal: ${invoiceSummary.subtotal.toLocaleString()}</div>
            <div className="p-3 rounded bg-white/5 border border-white/10">IVA: ${invoiceSummary.vat.toLocaleString()}</div>
            <div className="p-3 rounded bg-white/5 border border-white/10">Total: ${invoiceSummary.total.toLocaleString()}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-white/10 border border-white/20"
              onClick={() => {
                const now = new Date()
                const lines = [
                  `${WORKSHOP_NAME}`,
                  `Teléfonos: ${WORKSHOP_PHONES.join(', ')}`,
                  `${WORKSHOP_NIT_LABEL}`,
                  `Dirección: ${WORKSHOP_ADDRESS}`,
                  '',
                  'Resumen de facturación',
                  `Fecha de generación: ${now.toLocaleString()}`,
                  `Facturas: ${invoiceSummary.count}`,
                  `Subtotal: $${invoiceSummary.subtotal.toLocaleString()}`,
                  `IVA: $${invoiceSummary.vat.toLocaleString()}`,
                  `Total: $${invoiceSummary.total.toLocaleString()}`,
                  '',
                  'Fuente: listado de facturas actuales'
                ]
                const w = window.open('', '_blank', 'width=700,height=900')
                if (w) {
                  w.document.write(`<pre style="font-family:monospace; padding:16px; color:#fff; background:#111">${lines.join('\n')}</pre>`)
                  w.document.close(); w.focus(); w.print()
                }
              }}
            >Imprimir resumen</button>
            <button
              className="px-3 py-1 rounded bg-white/10 border border-white/20"
              onClick={() => {
                const now = new Date()
                const name = `Resumen_facturacion_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.txt`
                const lines = [
                  'Resumen de facturación',
                  `Fecha de generación: ${now.toLocaleString()}`,
                  `Facturas: ${invoiceSummary.count}`,
                  `Subtotal: $${invoiceSummary.subtotal.toLocaleString()}`,
                  `IVA: $${invoiceSummary.vat.toLocaleString()}`,
                  `Total: $${invoiceSummary.total.toLocaleString()}`,
                ]
                const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
              }}
            >Descargar .txt</button>
          </div>
        </div>
      </section>

      <section className="card-float p-4">
        <h3 className="font-semibold">Transacción manual</h3>
        <form className="mt-3 grid md:grid-cols-5 gap-2" onSubmit={addTx}>
          <select className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white" value={tx.type} onChange={e=>setTx(v=>({...v,type:e.target.value}))}>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
            <option value="asset">Activo</option>
            <option value="liability">Pasivo</option>
          </select>
          <input className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={tx.category} onChange={e=>setTx(v=>({...v,category:e.target.value}))} />
          <input type="number" className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={tx.amount} onChange={e=>setTx(v=>({...v,amount:e.target.value}))} />
          <input className="md:col-span-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-white placeholder-white/60" value={tx.reference} onChange={e=>setTx(v=>({...v,reference:e.target.value}))} />
          <button className="px-3 py-1 rounded bg-neon-pink/60 hover:bg-neon-pink/80">Añadir</button>
        </form>
      </section>

      <section className="card-float p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Facturas</h3>
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={compactView} onChange={e=>setCompactView(e.target.checked)} />
            Vista compacta
          </label>
        </div>
        <div className={`mt-3 grid ${compactView ? 'sm:grid-cols-2 md:grid-cols-3' : 'md:grid-cols-2'} gap-2`}>
          {invoices.map(inv => (
            <div key={inv.id} className={`${compactView ? 'p-2' : 'p-3'} rounded bg-white/5 border border-white/10`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`${compactView ? 'text-xs' : 'text-sm'}`}>#{String((inv.consecutive ?? (inv.id-1)%10000)).padStart(4,'0')} · {inv.customer_name || 'Sin nombre'}</div>
                  <div className={`${compactView ? 'text-[11px]' : 'text-xs'} text-white/60`}>{inv.date}</div>
                </div>
                <div className={`${compactView ? 'text-xs' : 'text-sm'} font-semibold`}>${Number(inv.total).toLocaleString()}</div>
              </div>
              {compactView ? (
                <div className="mt-1 text-[11px] text-white/70">
                  {inv.line_items?.[0] ? `${inv.line_items[0].name} x${inv.line_items[0].qty} — $${Number(inv.line_items[0].price).toLocaleString()}` : 'Sin detalle'}
                  {inv.line_items && inv.line_items.length > 1 ? ` · +${inv.line_items.length - 1} más` : ''}
                </div>
              ) : (
                <ul className="mt-2 text-xs text-white/80 list-disc ml-4">
                  {inv.line_items.map((li, idx) => (
                    <li key={idx}>{li.name} x{li.qty} — ${Number(li.price).toLocaleString()}</li>
                  ))}
                </ul>
              )}
              <button
                className={`mt-2 ${compactView ? 'px-2 py-1 text-[11px]' : 'px-3 py-1'} rounded bg-white/10 border border-white/20`}
                onClick={() => {
                  const consec = String((inv.consecutive ?? (inv.id-1)%10000)).padStart(4,'0')
                  const lines = [
                    `${WORKSHOP_NAME}`,
                    `Teléfonos: ${WORKSHOP_PHONES.join(', ')}`,
                    `${WORKSHOP_NIT_LABEL}`,
                    `Dirección: ${WORKSHOP_ADDRESS}`,
                    '',
                    `Factura #${consec}`,
                    `Fecha: ${inv.date}`,
                    `Cliente: ${inv.customer_name || ''}`,
                    `Dirección: ${inv.address || ''}`,
                    `Celular: ${inv.phone || ''}`,
                    '',
                    ...inv.line_items.map(li => `- ${li.name} x${li.qty} $${Number(li.price).toLocaleString()}`),
                    `Mano de obra: $${Number(inv.labor_cost||0).toLocaleString()}`,
                    `Subtotal: $${Number(inv.subtotal||0).toLocaleString()}`,
                    `IVA ${Number(inv.vat_percent||0)}%: $${Number(inv.vat_amount||0).toLocaleString()}`,
                    `Total: $${Number(inv.total||0).toLocaleString()}`,
                  ]
                  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = `Factura_${consec}.txt`; a.click(); URL.revokeObjectURL(url)
                }}
              >Descargar .txt</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}