const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// ── Categories ──────────────────────────────────────────────
router.get('/categories', requireLogin, (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});
router.post('/categories', requireLogin, (req, res) => {
  const { name, description } = req.body;
  try {
    const r = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || '');
    res.json({ success: true, id: r.lastInsertRowid });
  } catch (e) { res.json({ success: false, message: e.message }); }
});
router.delete('/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── Suppliers ──────────────────────────────────────────────
router.get('/suppliers', requireLogin, (req, res) => {
  res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all());
});
router.post('/suppliers', requireLogin, (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const r = db.prepare('INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)').run(name, email || '', phone || '', address || '');
    res.json({ success: true, id: r.lastInsertRowid });
  } catch (e) { res.json({ success: false, message: e.message }); }
});
router.delete('/suppliers/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM suppliers WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── Stock Movements ─────────────────────────────────────────
router.get('/movements', requireLogin, (req, res) => {
  const rows = db.prepare(`
    SELECT sm.*, p.name as product_name, u.name as user_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.id
    LEFT JOIN users u ON sm.user_id = u.id
    ORDER BY sm.created_at DESC LIMIT 200
  `).all();
  res.json(rows);
});

// ── Dashboard Stats ─────────────────────────────────────────
router.get('/dashboard', requireLogin, (req, res) => {
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const lowStock = db.prepare('SELECT COUNT(*) as c FROM products WHERE quantity <= min_stock').get().c;
  const totalCategories = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  const totalSuppliers = db.prepare('SELECT COUNT(*) as c FROM suppliers').get().c;
  const recentMovements = db.prepare(`
    SELECT sm.*, p.name as product_name, u.name as user_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.id
    LEFT JOIN users u ON sm.user_id = u.id
    ORDER BY sm.created_at DESC LIMIT 5
  `).all();
  const lowStockItems = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.quantity <= p.min_stock ORDER BY p.quantity ASC LIMIT 5
  `).all();
  res.json({ totalProducts, lowStock, totalCategories, totalSuppliers, recentMovements, lowStockItems });
});

// ── Users (Admin only) ──────────────────────────────────────
router.get('/users', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all());
});
router.post('/users', requireAdmin, (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const r = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role || 'staff');
    res.json({ success: true, id: r.lastInsertRowid });
  } catch (e) { res.json({ success: false, message: e.message }); }
});
router.delete('/users/:id', requireAdmin, (req, res) => {
  if (req.params.id == req.session.user.id) return res.json({ success: false, message: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── Session User ────────────────────────────────────────────
router.get('/me', requireLogin, (req, res) => {
  res.json(req.session.user);
});

module.exports = router;
