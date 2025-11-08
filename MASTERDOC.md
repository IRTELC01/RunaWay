# MASTERDOC — RunaWay

## Visión
RunaWay es una app para un montallantas de barrio, con estética moderna futurista, que facilita:
- Difusión de servicios (landing bonita).
- Operación del taller (facturas locales y contabilidad básica).
- Acceso seguro del propietario con 2FA.

## Alcance de la primera etapa
- Backend local con Express + SQLite (Better‑SQLite3).
- Autenticación de administrador con 2FA TOTP.
- CRUD mínimo de facturas y registro contable simple.
- Frontend React (Vite) con Tailwind y UI futurista.
- Documentación y guías para GitHub.

## Plan de acción (Etapa 1)
1) Backend
- Estructura Express, CORS, rate limit.
- DB SQLite: tablas `users`, `invoices`, `transactions`.
- Rutas:
  - `POST /api/auth/register`
  - `POST /api/auth/setup-2fa` (QR TOTP)
  - `POST /api/auth/login` (JWT)
  - `POST /api/invoices` | `GET /api/invoices` | `GET /api/invoices/:id`
  - `POST /api/accounting/transactions` | `GET /api/accounting/summary`

2) Frontend
- Vite + React + Tailwind.
- Páginas: Landing, Registro, Setup 2FA, Login, Dashboard.
- Estado básico vía `localStorage` para el `token`.
- Formularios: factura y transacción.

3) Documentación
- README con pasos de ejecución.
- MASTERDOC con análisis y plan.

4) GitHub
- Instrucciones para `git init`, `remote add` y `push`.

## Probabilidad de éxito
Alta (80–90%) para operar localmente en Windows con Node y SQLite. Tecnología simple, sin dependencias externas complejas. Riesgos: manejo de datos sensibles en local, ausencia de respaldo, necesidad de buenas prácticas (backup DB, rotación de `JWT_SECRET`).

## Etapas futuras (sugeridas)
- Etapa 2: Inventario de llantas/aceites; reportes por período; exportación CSV.
- Etapa 3: Usuarios adicionales con roles; auditoría; impuestos y plantillas de factura.
- Etapa 4: Docker; despliegue en servidor; TLS y dominios.

## Decisiones clave
- SQLite para simplicidad y portabilidad.
- 2FA TOTP para seguridad sin servicios externos.
- UI Tailwind con toques neon/glow y tarjetas flotantes.

## Notas de seguridad
- Guardar `runaway.db` de forma segura y respaldarla.
- `.env` no debe versionarse con secretos.
- Limitar origen CORS al dominio real en producción.