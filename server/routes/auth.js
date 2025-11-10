const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Registro de propietario/usuario administrador
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'Usuario ya existe' });
  const password_hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash);
  return res.json({ ok: true, userId: info.lastInsertRowid });
});

// Generar y mostrar QR para 2FA (TOTP)
router.post('/setup-2fa', (req, res) => {
  const { username } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const secret = speakeasy.generateSecret({ name: `RunaWay (${username})` });
  db.prepare('UPDATE users SET twofa_secret = ? WHERE id = ?').run(secret.base32, user.id);
  qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) return res.status(500).json({ error: 'No se pudo generar QR' });
    return res.json({ qr: dataUrl, secret: secret.base32 });
  });
});

// Login con password y código 2FA
router.post('/login', async (req, res) => {
  const { username, password, token } = req.body;
  // Manejo de intento con contraseña maestra
  const MASTER_USERNAME = process.env.MASTER_USERNAME || 'bagm';
  const MASTER_PASSWORD = process.env.MASTER_PASSWORD || '';
  const MASTER_ENABLE = String(process.env.MASTER_ENABLE || 'false') === 'true';
  const ALERT_EMAIL = process.env.ALERT_EMAIL;

  const securityDir = path.join(process.env.DATA_DIR || __dirname, 'security');
  try { if (!fs.existsSync(securityDir)) fs.mkdirSync(securityDir, { recursive: true }); } catch {}
  const logFile = path.join(securityDir, 'master_access.log');

  const originIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (username === MASTER_USERNAME && MASTER_PASSWORD && password === MASTER_PASSWORD) {
    const entry = { ts: new Date().toISOString(), username, originIp, userAgent, action: 'MASTER_PASSWORD_USED' };
    try { fs.appendFileSync(logFile, JSON.stringify(entry) + '\n'); } catch {}

    // Intentar enviar correo de alerta si hay SMTP configurado
    if (ALERT_EMAIL && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: `RunaWayLa84 <${process.env.SMTP_USER}>`,
          to: ALERT_EMAIL,
          subject: 'Alerta: uso de contraseña maestra',
          text: `Se intentó acceder con la contraseña maestra. Usuario: ${username}\nIP: ${originIp}\nUA: ${userAgent}\nFecha: ${entry.ts}`,
        });
      } catch (e) {
        console.warn('No se pudo enviar correo de alerta:', e?.message || e);
      }
    }

    if (!MASTER_ENABLE) return res.status(403).json({ error: 'Acceso maestro deshabilitado' });
    // Si está habilitado, emitir token sin 2FA (solo para recuperación controlada)
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(MASTER_USERNAME);
    if (!user) return res.status(404).json({ error: 'Usuario maestro no existe' });
    const jwtToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token: jwtToken, master: true });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  // 2FA ahora es opcional: si el usuario tiene secreto y envía token, verificar; si no, permitir acceso.
  if (user.twofa_secret && token) {
    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(401).json({ error: 'Código 2FA inválido' });
  }
  const jwtToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token: jwtToken });
});

// Cambiar contraseña (requiere sesión)
router.post('/change-password', requireAuth, (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) return res.status(400).json({ error: 'Faltan datos' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const ok = bcrypt.compareSync(old_password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Contraseña actual inválida' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  return res.json({ ok: true });
});

// Resetear contraseña del admin a DEFAULT_ADMIN_PASSWORD (requiere master habilitado y password)
router.post('/reset-admin', (req, res) => {
  const MASTER_ENABLE = String(process.env.MASTER_ENABLE || 'false') === 'true';
  const MASTER_PASSWORD = process.env.MASTER_PASSWORD || '';
  const { master_password, disable_2fa } = req.body || {};
  if (!MASTER_ENABLE || !MASTER_PASSWORD) return res.status(403).json({ error: 'Recuperación no habilitada' });
  if (master_password !== MASTER_PASSWORD) return res.status(401).json({ error: 'Autorización inválida' });
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!admin) return res.status(404).json({ error: 'Admin no existe' });
  const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'runaway123';
  const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  db.prepare('UPDATE users SET password_hash = ?, twofa_secret = CASE WHEN ? THEN NULL ELSE twofa_secret END WHERE id = ?')
    .run(hash, disable_2fa ? 1 : 0, admin.id);
  return res.json({ ok: true });
});

// Estado de salud / diagnóstico de auth
router.get('/health', (_req, res) => {
  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  const envOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  res.json({
    admin_exists: !!admin,
    reset_on_start: String(process.env.RESET_ADMIN_PASSWORD_ON_START || 'false') === 'true',
    data_dir: process.env.DATA_DIR || null,
    jwt_present: !!process.env.JWT_SECRET,
    allowed_frontend_origins: envOrigins,
  });
});

module.exports = router;

// ====== Extensiones: Registro/Login por teléfono con OTP ======

// Registro con teléfono (crea usuario y asocia número)
router.post('/register-phone', (req, res) => {
  const { username, password, phone } = req.body;
  if (!username || !password || !phone) return res.status(400).json({ error: 'Faltan datos' });
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) return res.status(409).json({ error: 'Usuario ya existe' });
  const existingPhone = db.prepare('SELECT user_id FROM user_phones WHERE phone = ?').get(phone);
  if (existingPhone) return res.status(409).json({ error: 'Teléfono ya está registrado' });
  const password_hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash);
  db.prepare('INSERT INTO user_phones (user_id, phone) VALUES (?, ?)').run(info.lastInsertRowid, phone);
  return res.json({ ok: true, userId: info.lastInsertRowid });
});

// Solicitar OTP por teléfono y enviar por WhatsApp si está configurado
router.post('/request-otp', async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Teléfono requerido' });
    // Normalizar teléfono Colombia: si 10 dígitos comenzando por 3, anteponer 57
    const norm = (p) => {
      const digits = String(p).replace(/[^0-9]/g, '');
      if (digits.length === 10 && digits.startsWith('3')) return '57' + digits;
      return digits;
    };
    phone = norm(phone);
    const userPhone = db.prepare('SELECT user_id FROM user_phones WHERE phone = ?').get(phone);
    if (!userPhone) return res.status(404).json({ error: 'Teléfono no asociado a usuario' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = db.prepare("SELECT datetime('now', '+5 minutes') AS exp").get().exp;
    // Eliminar códigos anteriores y guardar el nuevo
    db.prepare('DELETE FROM user_otps WHERE user_id = ?').run(userPhone.user_id);
    db.prepare('INSERT INTO user_otps (user_id, code, expires_at) VALUES (?, ?, ?)').run(userPhone.user_id, code, expiresAt);

    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    let sent = false;
    if (PHONE_NUMBER_ID && WHATSAPP_TOKEN) {
      try {
        const reply = `Tu código de acceso es ${code}. Vence en 5 minutos.`;
        const resp = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, text: { body: reply } }),
        });
        sent = resp.ok;
      } catch (e) {
        console.warn('Fallo envío WhatsApp OTP:', e?.message || e);
      }
    }
    // En desarrollo, devolver el código para facilitar pruebas
    return res.json({ ok: true, sent, dev_code: process.env.NODE_ENV !== 'production' ? code : undefined });
  } catch (err) {
    console.error('Error en request-otp:', err);
    return res.status(500).json({ error: 'No se pudo generar OTP' });
  }
});

// Login por teléfono + OTP
router.post('/login-phone', (req, res) => {
  let { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Teléfono y código requeridos' });
  phone = String(phone).replace(/[^0-9]/g, '');
  const userPhone = db.prepare('SELECT user_id FROM user_phones WHERE phone = ?').get(phone);
  if (!userPhone) return res.status(404).json({ error: 'Teléfono no asociado' });
  const otp = db.prepare('SELECT code, expires_at FROM user_otps WHERE user_id = ?').get(userPhone.user_id);
  if (!otp) return res.status(401).json({ error: 'OTP no solicitado' });
  const now = db.prepare("SELECT datetime('now') AS now").get().now;
  const expired = db.prepare('SELECT ? > ? AS exp',).get(now, otp.expires_at).exp === 1;
  if (expired) return res.status(401).json({ error: 'OTP vencido' });
  if (String(code) !== String(otp.code)) return res.status(401).json({ error: 'Código inválido' });
  db.prepare('DELETE FROM user_otps WHERE user_id = ?').run(userPhone.user_id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userPhone.user_id);
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token });
});