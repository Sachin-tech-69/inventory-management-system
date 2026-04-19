# 📦 InvenTrack – Inventory & Stock Management System

A simple, full-featured inventory management system built with Node.js, Express, and SQLite.

---

## ⚡ Quick Setup (3 Steps Only)

### Step 1 – Install Node.js
Download from: https://nodejs.org (choose LTS version)

### Step 2 – Install dependencies
Open terminal/command prompt in the project folder and run:
```
npm install
```

### Step 3 – Start the server
```
node server.js
```

Then open your browser and go to: **http://localhost:3000**

---

## 🔐 Default Login
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@inventory.com    |
| Password | admin123               |

> ⚠️ Change the password after first login by adding a new admin user.

---

## ✅ Features

### Dashboard
- Total products count
- Low stock alerts
- Recent stock movements
- Quick summary cards

### Products
- Add / Edit / Delete products
- SKU tracking
- Assign category & supplier
- Stock In / Stock Out with notes
- Low stock visual indicator

### Categories
- Organize products into categories
- Add / Delete categories

### Suppliers
- Manage supplier info (name, email, phone, address)

### Stock Movements
- Full history log of all stock changes
- Filter by type (In/Out) or search by product

### Users (Admin only)
- Add staff or admin users
- Role-based access (Admin vs Staff)
- Staff cannot delete products or users

---

## 📁 Project Structure
```
inventory-system/
├── server.js              ← Main entry point
├── package.json
├── db/
│   ├── database.js        ← SQLite setup & schema
│   └── inventory.db       ← Auto-created on first run
├── routes/
│   ├── auth.js            ← Login/Logout
│   ├── products.js        ← Products API
│   └── api.js             ← Categories, Suppliers, Users, Dashboard
├── middleware/
│   └── auth.js            ← Session protection
└── public/
    ├── css/style.css      ← All styles
    ├── js/app.js          ← Shared JS helpers
    └── pages/
        ├── login.html
        ├── dashboard.html
        ├── products.html
        ├── categories.html
        ├── suppliers.html
        ├── movements.html
        └── users.html
```

---

## 🛠️ Tech Stack
| Component  | Technology              |
|------------|-------------------------|
| Backend    | Node.js + Express       |
| Database   | SQLite (file-based)     |
| Frontend   | HTML + CSS + JavaScript |
| Auth       | Express Session + bcrypt|

No React, no MongoDB, no complex setup. Just install Node.js and run!
