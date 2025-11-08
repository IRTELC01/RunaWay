const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Agregar transacción manual (activo/pasivo/ingreso/gasto)
router.post('/transactions', requireAuth, (req, res) => {
  const { type, category, amount, reference } = req.body;
  if (!type || !category || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const info = db.prepare('INSERT INTO transactions (type, category, amount, reference) VALUES (?, ?, ?, ?)')
    .run(type, category, amount, reference || null);
  return res.json({ ok: true, id: info.lastInsertRowid });
});

// Resumen simple de contabilidad
router.get('/summary', requireAuth, (_req, res) => {
  const all = db.prepare('SELECT * FROM transactions').all();
  const sum = (type) => all.filter(t => t.type === type).reduce((s, t) => s + Number(t.amount), 0);
  const income = sum('income');
  const expense = sum('expense');
  const assets = sum('asset');
  const liabilities = sum('liability');
  const profit = income - expense;
  res.json({ income, expense, assets, liabilities, profit });
});

module.exports = router;