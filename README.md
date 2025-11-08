# RunaWay — Montallantas Futurista

Aplicación web full‑stack para un taller de barrio (montallantas) con estilo futurista Norte Americano. Incluye:

- Landing pública con tarjetas flotantes y badges de vehículos.
- Acceso de administrador con registro y 2FA (TOTP).
- Gestión de facturas y contabilidad básica (ingresos, gastos, activos y pasivos).
- Backend Express + SQLite local.
- Frontend React + Vite + Tailwind.
 - Enlaces a marcas oficiales y a marketplaces (OTRAS) desde la landing.
 - Integración inicial de WhatsApp: botón flotante y webhook básico de chatbot.

## Requisitos

- Node.js 18+

## Puesta en marcha (local)

1. Backend:
   - `cd server`
   - Copia `.env.example` a `.env` y ajusta `JWT_SECRET`.
   - `npm run dev`
   - API en `http://localhost:3001/`.
   - Webhook de WhatsApp: `GET/POST http://localhost:3001/webhooks/whatsapp` (requiere exposición pública para Meta).
   - Autenticación por teléfono (OTP):
     - `POST /api/auth/register-phone` (username, password, phone)
     - `POST /api/auth/request-otp` (phone)
     - `POST /api/auth/login-phone` (phone, code)

2. Frontend:
   - `cd client`
   - `npm run dev`
   - Abre `http://localhost:5173/`.
   - Botón flotante de WhatsApp en la UI. Ajusta el número en `client/src/App.jsx`.

## Flujo de autenticación 2FA

1. Registra el usuario en `/register`.
2. Configura 2FA en `/setup-2fa` y escanea el QR con Google Authenticator/Authy.
3. Inicia sesión en `/login` con usuario, contraseña y código 2FA.

## Facturación y contabilidad

- En el dashboard:
  - Crear facturas con ítems, método de pago y notas.
  - Ver listado de facturas y totales.
  - Añadir transacciones manuales (income/expense/asset/liability).
  - Ver resumen: ingresos, gastos, activos, pasivos y utilidad.

## Estructura

- `server/` Express + SQLite (Better‑SQLite3). Rutas: `auth`, `invoices`, `accounting`.
- `server/routes/whatsapp.js` Webhook de WhatsApp (verificación y respuesta básica).
- `client/` React + Tailwind. Páginas: Landing, Register, Setup2FA, Login, Dashboard.
  - `LoginPhone.jsx`: Acceso por teléfono (OTP) y solicitud de código.

## Despliegue y GitHub

- Inicializa git en el root:
  - `git init`
  - `git add .`
  - `git commit -m "RunaWay: primera versión"`
  - `git branch -M main`
  - `git remote add origin https://github.com/<tu_usuario>/RunaWay.git`
  - `git push -u origin main`

Si necesitas pipeline de despliegue o empaquetado, se recomienda Dockerizar en una siguiente etapa.
## Enlaces útiles (marketplace y distribuidores)

- Landing incluye:
  - Marcas oficiales (Carros): Renault, Hyundai, Honda, Nissan, y OTRAS → `https://listado.mercadolibre.com.co/repuestos-autos/`
  - Marcas oficiales (Motos): Yamaha, Suzuki, Honda Motos, Bajaj (Pulsar/Discover), AKT, y OTRAS → `https://listado.mercadolibre.com.co/repuestos-motos/`
  - Directorio regional (Bogotá, Medellín, Cali) con búsquedas prefiltradas a mayoristas de autopartes, repuestos de motos y distribuidores de llantas.

- Distribuidores de Llantas:
  - Michelin (localizador): `https://www.michelin.com.co/auto/dealer-locator`
  - Bridgestone (red de tiendas): `https://www.bridgestone.com.co/llantera/`

- Mayoristas Motos:
  - KTO Partes: `https://www.ktopartes.com/`
  - ELPO SAS: `https://elposas.com/`
  - Mundimotos: `https://mundimotos.com/`
  - Motozone Colombia: `https://motozonecolombia.com/`

## Integración WhatsApp (Chatbot básico)

- Requisitos en `server/.env` (ver ejemplo en `.env.example`):
  - `WHATSAPP_TOKEN`: token de acceso de Meta (WhatsApp Cloud API).
  - `WHATSAPP_PHONE_NUMBER_ID`: ID del número de WhatsApp Business.
  - `WHATSAPP_VERIFY_TOKEN`: cadena propia para verificar el webhook.

- Pasos:
  1. Crear App en Facebook Developers y habilitar WhatsApp Cloud.
  2. Obtener `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`.
  3. Configurar `WHATSAPP_VERIFY_TOKEN` tanto en `.env` como en el panel de Meta.
  4. Exponer públicamente `GET/POST /webhooks/whatsapp` (ngrok o similar) y registrar el endpoint en Meta.
  5. Probar enviando mensajes al número: el bot contesta a “hola”, “llanta”, “aceite”, “mecánica”.

- Botón de WhatsApp en el frontend:
  - Edita `client/src/App.jsx` y reemplaza `573001234567` por tu número real.
  - Puedes prellenar mensajes: `https://wa.me/57NUMERO?text=Hola%20quiero%20cotizar`.
## Instalación local de datos

- Soporte de `DATA_DIR` en backend para ubicar la base de datos y archivos en directorio local preferido.
- En Windows, se sugiere: `C:\Users\TU_USUARIO\Documents\RunaWay`.
- Configura `DATA_DIR` en `server/.env` (copiar desde `.env.example`).
- Opcional: usaremos un script PowerShell `scripts/setup-local.ps1` para crear carpetas y configurar `.env` automáticamente.