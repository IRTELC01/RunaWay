const jwt = require('jsonwebtoken');
const db = require('../db');

function requireAuth(req, res, next) {
  // Modo de acceso libre temporal: si OPEN_ACCESS=true, omitir verificación
  const OPEN_ACCESS = String(process.env.OPEN_ACCESS || 'false') === 'true';
  if (OPEN_ACCESS) {
    try {
      const admin = db.prepare('SELECT id, username FROM users WHERE username = ?').get('admin');
      req.user = admin || { id: 0, username: 'guest' };
    } catch {
      req.user = { id: 0, username: 'guest' };
    }
    return next();
  }
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { requireAuth };