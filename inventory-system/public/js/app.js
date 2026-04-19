// Apply theme immediately on load to prevent flash
(function() {
  if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
})();

// Shared sidebar layout renderer
async function renderLayout(pageTitle, activeNav) {
  const me = await fetch('/api/me').then(r => r.json()).catch(() => null);
  if (!me) { window.location = '/login'; return; }

  const navItems = [
    { href: '/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { href: '/products', icon: icons.products, label: 'Products' },
    { href: '/categories', icon: icons.categories, label: 'Categories' },
    { href: '/suppliers', icon: icons.suppliers, label: 'Suppliers' },
    { href: '/movements', icon: icons.movements, label: 'Stock Movements' },
    ...(me.role === 'admin' ? [{ href: '/users', icon: icons.users, label: 'Users' }] : [])
  ];

  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <h1>📦 InvenTrack</h1>
      <span>Stock Management System</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">Menu</div>
      ${navItems.map(n => `
        <a href="${n.href}" class="nav-item ${activeNav === n.href ? 'active' : ''}">
          ${n.icon} ${n.label}
        </a>
      `).join('')}
      <div class="nav-section" style="margin-top:12px">Account</div>
      <a href="/logout" class="nav-item">
        ${icons.logout} Logout
      </a>
    </nav>
    <div class="sidebar-footer">
      <strong>${me.name}</strong>
      ${me.role.charAt(0).toUpperCase() + me.role.slice(1)}
    </div>
  `;

  document.getElementById('topbar-title').textContent = pageTitle;
  window._me = me;

  // Inject theme toggle button
  const actions = document.querySelector('.topbar-actions');
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.onclick = toggleTheme;
  actions.prepend(toggleBtn);
  applyTheme();
}

function applyTheme() {
  const isLight = localStorage.getItem('theme') === 'light';
  document.body.classList.toggle('light-mode', isLight);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.innerHTML = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
}

function toggleTheme() {
  const isLight = localStorage.getItem('theme') === 'light';
  localStorage.setItem('theme', isLight ? 'dark' : 'light');
  applyTheme();
}

const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  products: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  categories: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h8m-8 6h16"/></svg>`,
  suppliers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
  movements: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
};

function showAlert(msg, type = 'success', container = document.body) {
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  container.prepend(el);
  setTimeout(() => el.remove(), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function formatDate(d) {
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
