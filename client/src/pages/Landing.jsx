export default function Landing() {
  const services = [
    { title: 'Cambio de Llantas', desc: 'Montaje, balanceo y alineación con equipos precisos.' },
    { title: 'Cambio de Aceite', desc: 'Aceites sintéticos y filtros de calidad, servicio rápido.' },
    { title: 'Mecánica Rápida', desc: 'Frenos, suspensión, empaques, correas y diagnósticos básicos.' },
    { title: 'Revisión de Empaques', desc: 'Detección de fugas y reemplazo de empaques y sellos.' },
    { title: 'Neumáticos', desc: 'Opciones económicas y confiables para uso diario.' },
  ];

  const carBrands = [
    { name: 'Renault', href: 'https://www.renault.com.co/' },
    { name: 'Hyundai', href: 'https://www.hyundai.com/co/es' },
    { name: 'Honda', href: 'https://www.honda.co/' },
    { name: 'Nissan', href: 'https://www.nissan.com.co/' },
    { name: 'OTRAS', href: 'https://listado.mercadolibre.com.co/repuestos-autos/' },
  ];

  const motoBrands = [
    { name: 'Yamaha', href: 'https://www.yamaha-motor.com.co/' },
    { name: 'Suzuki', href: 'https://www.suzuki.com.co/motos/' },
    { name: 'Honda Motos', href: 'https://www.honda-motos.com.co/' },
    { name: 'Bajaj (Pulsar/Discover)', href: 'https://grupouma.com/colombia/motos/pulsar/' },
    { name: 'AKT Motos', href: 'https://www.aktmotos.com/' },
    { name: 'OTRAS', href: 'https://listado.mercadolibre.com.co/repuestos-motos/' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 pt-10 pb-24">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold neon-title-green flex items-center justify-center gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-neon-green)' }}>
            <circle cx="8" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="12" r="6" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          </svg>
          <span>RunaWayLa84</span>
        </h1>
        <p className="mt-3 text-white/80">Montallantas y mecánica rápida en Medellín.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Marcas de Carros</h3>
            <div className="inline-flex flex-wrap gap-2">
              {carBrands.map((b) => (
                <a key={b.name} href={b.href} target="_blank" rel="noreferrer" className="badge-neon">
                  <span role="img" aria-label="car">🚗</span>
                  <span>{b.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Marcas de Motos</h3>
            <div className="inline-flex flex-wrap gap-2">
              {motoBrands.map((b) => (
                <a key={b.name} href={b.href} target="_blank" rel="noreferrer" className="badge-neon">
                  <span role="img" aria-label="moto">🏍️</span>
                  <span>{b.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 card-float p-6">
        <h3 className="text-lg font-semibold">Contacto del Taller</h3>
        <p className="mt-2 text-white/80 text-sm">Teléfonos: 3107206150, 3004043009</p>
        <p className="text-white/80 text-sm">Dirección: Calle 84 # 45A-20 (Medellín)</p>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Calle%2084%20%23%2045A-20%20Medell%C3%ADn"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded bg-neon-cyan/60 hover:bg-neon-cyan/80 border border-white/20"
        >
          <span role="img" aria-label="mapa">📍</span>
          <span>Ver en Google Maps</span>
        </a>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border border-white/20 bg-white/5">
            <iframe
              title="Mapa Taller"
              src="https://www.google.com/maps?q=Calle%2084%20%23%2045A-20%20Medell%C3%ADn&output=embed"
              width="100%"
              height="220"
              style={{ border: '0' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/20 bg-white/5">
            <img
              src="/montallantas.jpg"
              alt="Foto del negocio Montallantas RunaWayLa84"
              className="w-full h-[220px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <article key={s.title} className="card-float p-5">
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-white/80">{s.desc}</p>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30"
                 style={{ background: 'radial-gradient(circle, #ff3cac 0%, #2b86c5 100%)' }} />
          </article>
        ))}
      </section>

      <section className="mt-12 card-float p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Administrador</h2>
            <p className="text-white/80 text-sm">Acceda para registrar facturas y ver contabilidad.</p>
          </div>
          <a href="/login" className="px-4 py-2 rounded-md bg-neon-cyan/60 hover:bg-neon-cyan/80">Ir al acceso</a>
        </div>
      </section>

      <section className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="card-float p-6">
          <h3 className="text-lg font-semibold">Mayoristas de Autopartes (Autos)</h3>
          <ul className="mt-3 text-sm text-white/80 list-disc ml-4">
            <li><a className="hover:underline" href="https://www.mundialderepuestos.com/" target="_blank" rel="noreferrer">Mundial de Repuestos</a> — distribuidor nacional con amplio catálogo.</li>
          </ul>
        </div>
        <div className="card-float p-6">
          <h3 className="text-lg font-semibold">Mayoristas de Repuestos (Motos)</h3>
          <ul className="mt-3 text-sm text-white/80 list-disc ml-4">
            <li><a className="hover:underline" href="https://www.ktopartes.com/" target="_blank" rel="noreferrer">KTO Partes</a> — importadores y mayoristas.</li>
            <li><a className="hover:underline" href="https://elposas.com/" target="_blank" rel="noreferrer">ELPO SAS</a> — catálogo mayorista de accesorios y repuestos.</li>
            <li><a className="hover:underline" href="https://mundimotos.com/" target="_blank" rel="noreferrer">Mundimotos</a> — red nacional de tiendas y distribución.</li>
            <li><a className="hover:underline" href="https://motozonecolombia.com/" target="_blank" rel="noreferrer">Motozone Colombia</a> — repuestos y lubricantes al por mayor.</li>
          </ul>
        </div>
        <div className="card-float p-6">
          <h3 className="text-lg font-semibold">Distribuidores de Llantas</h3>
          <ul className="mt-3 text-sm text-white/80 list-disc ml-4">
            <li><a className="hover:underline" href="https://www.michelin.com.co/auto/dealer-locator" target="_blank" rel="noreferrer">Michelin Colombia</a> — localizador de distribuidores.</li>
            <li><a className="hover:underline" href="https://www.bridgestone.com.co/llantera/" target="_blank" rel="noreferrer">Bridgestone Colombia</a> — red de tiendas y distribuidores.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

// Botón flotante de WhatsApp (reemplaza el número por el de tu negocio)
// Ejemplo: 57 + número celular en Colombia (sin espacios)
// https://wa.me/573001234567
// Si quieres prellenar un mensaje: https://wa.me/573001234567?text=Hola%20quiero%20cotizar
      <section className="mt-12 card-float p-6">
        <h3 className="text-lg font-semibold">Directorio regional</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold">Bogotá</div>
            <ul className="mt-2 list-disc ml-4 text-white/80">
              <li><a className="hover:underline" href="https://www.google.com/maps/search/autopartes+mayoristas+Bogot%C3%A1/" target="_blank" rel="noreferrer">Autopartes mayoristas</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/repuestos+motos+mayoristas+Bogot%C3%A1/" target="_blank" rel="noreferrer">Repuestos de motos</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/distribuidores+llantas+Bogot%C3%A1/" target="_blank" rel="noreferrer">Distribuidores de llantas</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Medellín</div>
            <ul className="mt-2 list-disc ml-4 text-white/80">
              <li><a className="hover:underline" href="https://www.google.com/maps/search/autopartes+mayoristas+Medell%C3%ADn/" target="_blank" rel="noreferrer">Autopartes mayoristas</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/repuestos+motos+mayoristas+Medell%C3%ADn/" target="_blank" rel="noreferrer">Repuestos de motos</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/distribuidores+llantas+Medell%C3%ADn/" target="_blank" rel="noreferrer">Distribuidores de llantas</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Cali</div>
            <ul className="mt-2 list-disc ml-4 text-white/80">
              <li><a className="hover:underline" href="https://www.google.com/maps/search/autopartes+mayoristas+Cali/" target="_blank" rel="noreferrer">Autopartes mayoristas</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/repuestos+motos+mayoristas+Cali/" target="_blank" rel="noreferrer">Repuestos de motos</a></li>
              <li><a className="hover:underline" href="https://www.google.com/maps/search/distribuidores+llantas+Cali/" target="_blank" rel="noreferrer">Distribuidores de llantas</a></li>
            </ul>
          </div>
        </div>
      </section>