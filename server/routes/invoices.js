const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Crear factura
router.post('/', requireAuth, (req, res) => {
  const { customer_name, address, phone, line_items, labor_cost, vat_percent, payment_method, notes } = req.body;
  if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
    return res.status(400).json({ error: 'Items inválidos' });
  }
  const items_total = line_items.reduce((sum, it) => sum + (Number(it.price) * Number(it.qty || 1)), 0);
  const labor = Number(labor_cost || 0);
  const subtotal = items_total + labor;
  const ivaP = Number(vat_percent || 0);
  const vat_amount = subtotal * (ivaP / 100);
  const total = subtotal + vat_amount;
  const info = db.prepare(`INSERT INTO invoices (customer_name, address, phone, line_items_json, subtotal, labor_cost, vat_percent, vat_amount, total, payment_method, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    customer_name || null,
    address || null,
    phone || null,
    JSON.stringify(line_items),
    subtotal,
    labor,
    ivaP,
    vat_amount,
    total,
    payment_method || null,
    notes || null,
    req.user.id
  );
  // Calcular consecutivo (0000-9999) en base al id
  const consecutive = ((info.lastInsertRowid - 1) % 10000);
  db.prepare('UPDATE invoices SET consecutive = ? WHERE id = ?').run(consecutive, info.lastInsertRowid);
  // Registrar transacción de ingreso y posiblemente inventario simple
  db.prepare(`INSERT INTO transactions (type, category, amount, reference) VALUES (?, ?, ?, ?)`)
    .run('income', 'services_and_sales', total, `invoice:${info.lastInsertRowid}`);
  return res.json({ ok: true, id: info.lastInsertRowid, total, consecutive });
});

// Listar facturas
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM invoices ORDER BY date DESC').all();
  return res.json(rows.map(r => ({
    ...r,
    line_items: JSON.parse(r.line_items_json),
  })));
});

// Obtener una factura
router.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  r.line_items = JSON.parse(r.line_items_json);
  return res.json(r);
});

module.exports = router;