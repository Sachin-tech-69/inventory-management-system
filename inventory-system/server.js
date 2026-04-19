const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const db = require('./db/database');

// Seed default admin if none exists
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
    .run('Admin', 'admin@inventory.com', bcrypt.hashSync('admin123', 10), 'admin');
  console.log('✅ Default admin created: admin@inventory.com / admin123');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'inventory_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Routes
app.use('/', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api', require('./routes/api'));

// Page routes (serve HTML)
const pages = ['dashboard', 'products', 'categories', 'suppliers', 'movements', 'users'];
const { requireLogin } = require('./middleware/auth');
pages.forEach(page => {
  app.get(`/${page}`, requireLogin, (req, res) => {
    res.sendFile(`${page}.html`, { root: './public/pages' });
  });
});

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Inventory System running at http://localhost:${PORT}`);
  console.log('📧 Login: admin@inventory.com  |  🔑 Password: admin123\n');
});
