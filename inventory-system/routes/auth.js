const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile('login.html', { root: './public/pages' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ success: false, message: 'Invalid email or password' });
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ success: true });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
