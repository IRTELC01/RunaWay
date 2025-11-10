const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const accountingRoutes = require('./routes/accounting');
const whatsappWebhook = require('./routes/whatsapp');
const db = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const OPEN_ACCESS = String(process.env.OPEN_ACCESS || 'false') === 'true';

// Permitir frontend en la nube y desarrollo local (5173/5174)
// Soporta múltiples orígenes vía FRONTEND_ORIGIN separados por comas.
const envOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // En modo OPEN_ACCESS permitir cualquier origen (trial / demostración)
    if (OPEN_ACCESS) return callback(null, true);
    // Permitir peticiones internas (sin origin) y orígenes declarados
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin no permitido'));
  },
  credentials: true,
}));
// Preflight explícito para asegurar respuesta de CORS en Render
// Nota: evitar '*' porque path-to-regexp en algunas versiones lo rechaza.
// Usamos un RegExp que matchea cualquier ruta para OPTIONS.
app.options(/.*/, cors({
  origin: (origin, callback) => {
    if (OPEN_ACCESS) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin no permitido'));
  },
  credentials: true,
}));
// Fallback: incluir encabezados CORS y responder OPTIONS si alguna capa interfiere
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = OPEN_ACCESS || !origin || allowedOrigins.includes(origin);
  if (allowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
// Aplicar limitador solo a rutas de API para no afectar health checks
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'RunaWay API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/accounting', accountingRoutes);
// Webhook de WhatsApp (ruta pública)
app.use('/', whatsappWebhook);

// Asegurar usuario admin con contraseña por defecto
(() => {
  try {
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'runaway123';
    const RESET_ON_START = String(process.env.RESET_ADMIN_PASSWORD_ON_START || 'false') === 'true';
    const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!admin) {
      const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
      console.log('Usuario admin creado con contraseña por defecto.');
    } else if (RESET_ON_START) {
      const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, admin.id);
      console.log('Contraseña del usuario admin reiniciada por configuración al valor por defecto.');
    } else {
      console.log('Usuario admin existente; contraseña no modificada.');
    }
  } catch (e) {
    console.warn('No se pudo garantizar usuario admin por defecto:', e?.message || e);
  }
})();

app.listen(PORT, () => {
  console.log(`RunaWay API escuchando en http://localhost:${PORT}`);
});