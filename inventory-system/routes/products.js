const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.get('/', requireLogin, (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name, s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(products);
});

router.post('/', requireLogin, (req, res) => {
  const { name, sku, category_id, supplier_id, quantity, min_stock, price, unit, description } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, sku, category_id, supplier_id, quantity, min_stock, price, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, sku, category_id || null, supplier_id || null, quantity || 0, min_stock || 10, price || 0, unit || 'pcs', description || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

router.put('/:id', requireLogin, (req, res) => {
  const { name, sku, category_id, supplier_id, min_stock, price, unit, description } = req.body;
  try {
    db.prepare(`
      UPDATE products SET name=?, sku=?, category_id=?, supplier_id=?, min_stock=?, price=?, unit=?, description=?
      WHERE id=?
    `).run(name, sku, category_id || null, supplier_id || null, min_stock || 10, price || 0, unit || 'pcs', description || '', req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// Stock In / Out
router.post('/:id/stock', requireLogin, (req, res) => {
  const { type, quantity, note } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!product) return res.json({ success: false, message: 'Product not found' });
  if (type === 'out' && product.quantity < quantity) {
    return res.json({ success: false, message: 'Insufficient stock' });
  }
  const newQty = type === 'in' ? product.quantity + parseInt(quantity) : product.quantity - parseInt(quantity);
  db.prepare('UPDATE products SET quantity=? WHERE id=?').run(newQty, req.params.id);
  db.prepare(`
    INSERT INTO stock_movements (product_id, type, quantity, note, user_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, type, quantity, note || '', req.session.user.id);
  res.json({ success: true, new_quantity: newQty });
});

module.exports = router;
