/**
 * dashboard-auth.js
 * ─────────────────────────────────────────────────────────
 * CarGo — Role-Based Dashboard Controller
 *
 * Drop this <script> tag at the bottom of your existing
 * dashboard HTML (after all existing scripts):
 *
 *   <script src="dashboard-auth.js"></script>
 *
 * Then add these data-role attributes to the nav links /
 * sidebar sections that should be shown per role:
 *
 *   data-role="ADMIN"      → visible only to Admins
 *   data-role="CAR_OWNER"  → visible only to Car Owners
 *   data-role="USER"       → visible only to Renters
 *   data-role="ALL"        → visible to everyone
 *
 * Section containers in the main area should use:
 *   <section id="section-cars"     data-section="cars">
 *   <section id="section-clients"  data-section="clients">
 *   … etc.
 *
 * ─────────────────────────────────────────────────────────
 */


const API_BASE = 'http://127.0.0.1:8000/api';


// ─────────────────────────────────────────────────────────
//  SESSION HELPERS
// ─────────────────────────────────────────────────────────
const Auth = {
  getToken: () => sessionStorage.getItem('cargo_token'),
  getUser:  () => JSON.parse(sessionStorage.getItem('cargo_user') || 'null'),


  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.getToken()}`,
    };
  },


  logout() {
    fetch(`${API_BASE}/auth/logout/`, { method: 'POST', headers: this.headers() })
      .finally(() => {
        sessionStorage.clear();
        window.location.href = 'login.html';
      });
  },


  requireAuth() {
    if (!this.getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
};


// ─────────────────────────────────────────────────────────
//  API FETCH WRAPPER
// ─────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: Auth.headers(),
    ...options,
  });


  if (res.status === 401) {
    sessionStorage.clear();
    window.location.href = 'login.html';
    return null;
  }


  if (res.status === 204) return null;   // No Content (DELETE)
  return res.json();
}


// ─────────────────────────────────────────────────────────
//  ROLE-BASED UI CONTROL
// ─────────────────────────────────────────────────────────
function applyRoleVisibility(role) {
  // Show/hide nav items
  document.querySelectorAll('[data-role]').forEach(el => {
    const allowed = el.dataset.role.split(',').map(r => r.trim());
    const visible = allowed.includes('ALL') || allowed.includes(role);
    el.style.display = visible ? '' : 'none';
  });


  // Set a body attribute for CSS targeting
  document.body.dataset.userRole = role;
}


// ─────────────────────────────────────────────────────────
//  USER HEADER — inject name + role badge into existing header
// ─────────────────────────────────────────────────────────
function renderUserHeader(user) {
  const ROLE_LABELS = {
    ADMIN:     { label: 'Admin',     color: '#f97316' },
    CAR_OWNER: { label: 'Car Owner', color: '#60a5fa' },
    USER:      { label: 'Renter',    color: '#34d399' },
  };
  const meta = ROLE_LABELS[user.role] || { label: user.role, color: '#8888a8' };


  // Try to inject into element with id="userInfo" or class="user-info"
  const target = document.getElementById('userInfo') || document.querySelector('.user-info');
  if (target) {
    target.innerHTML = `
      <span style="font-family:'DM Mono',monospace;font-size:11px;color:#8888a8;">
        ${user.first_name || ''} ${user.last_name || ''}
      </span>
      <span style="
        font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.5px;
        text-transform:uppercase;padding:2px 8px;border-radius:12px;
        background:${meta.color}22;color:${meta.color};
        border:1px solid ${meta.color}44;margin-left:8px;
      ">${meta.label}</span>
      <button onclick="Auth.logout()" style="
        margin-left:12px;background:transparent;border:1px solid #ffffff18;
        color:#5a5a78;font-family:'DM Mono',monospace;font-size:10px;
        letter-spacing:1px;padding:4px 10px;border-radius:6px;cursor:pointer;
      ">Sign out</button>
    `;
  }
}


// ─────────────────────────────────────────────────────────
//  DASHBOARD DATA LOADER
// ─────────────────────────────────────────────────────────
async function loadDashboard() {
  const data = await apiFetch('/dashboard/');
  if (!data) return;


  const role = data.role;


  if (role === 'ADMIN')     renderAdminDashboard(data);
  if (role === 'CAR_OWNER') renderOwnerDashboard(data);
  if (role === 'USER')      renderRenterDashboard(data);
}


// ─────────────────────────────────────────────────────────
//  ① ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────
function renderAdminDashboard(data) {
  const { stats, cars, clients, rentals, returns, users } = data;


  /* ── STAT CARDS ── */
  setStatCard('stat-total-cars',    stats.total_cars);
  setStatCard('stat-available',     stats.available);
  setStatCard('stat-rented',        stats.rented);
  setStatCard('stat-maintenance',   stats.maintenance);
  setStatCard('stat-total-clients', stats.total_clients);
  setStatCard('stat-active-rentals',stats.active_rentals);
  setStatCard('stat-late-returns',  stats.late_returns);


  /* ── TABLES ── */
  renderCarsTable(cars,       'carsTableBody',    { showOwner: true, editable: true });
  renderClientsTable(clients, 'clientsTableBody', { editable: true });
  renderRentalsTable(rentals, 'rentalsTableBody', { editable: true });
  renderReturnsTable(returns, 'returnsTableBody');
  renderUsersTable(users,     'usersTableBody');
}


// ─────────────────────────────────────────────────────────
//  ② CAR OWNER DASHBOARD
// ─────────────────────────────────────────────────────────
function renderOwnerDashboard(data) {
  const { fleet_stats, cars, rentals, returns } = data;


  setStatCard('stat-total-cars',  fleet_stats.total);
  setStatCard('stat-available',   fleet_stats.available);
  setStatCard('stat-rented',      fleet_stats.rented);
  setStatCard('stat-maintenance', fleet_stats.maintenance);


  renderCarsTable(cars,       'carsTableBody',    { showOwner: false, editable: true });
  renderRentalsTable(rentals, 'rentalsTableBody', { editable: false });
  renderReturnsTable(returns, 'returnsTableBody');
}


// ─────────────────────────────────────────────────────────
//  ③ RENTER DASHBOARD
// ─────────────────────────────────────────────────────────
function renderRenterDashboard(data) {
  const { available_cars, my_rentals, my_returns } = data;


  setStatCard('stat-available-cars', available_cars.length);
  setStatCard('stat-my-rentals',     my_rentals.length);
  setStatCard('stat-my-returns',     my_returns.length);


  renderCarsTable(available_cars, 'carsTableBody',   { showOwner: false, editable: false, rentable: true });
  renderRentalsTable(my_rentals,  'myRentalsTableBody', { editable: false });
}


// ─────────────────────────────────────────────────────────
//  TABLE RENDERERS
// ─────────────────────────────────────────────────────────


function setStatCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
}


function statusBadge(s) {
  const map = {
    available:   ['badge-available',   s],
    rented:      ['badge-rented',      s],
    maintenance: ['badge-maintenance', 'maintenance'],
  };
  const [cls, label] = map[s] || ['badge', s];
  return `<span class="badge ${cls}">${label}</span>`;
}


function conditionBadge(c) {
  const map = {
    good:         'badge-good',
    minor_damage: 'badge-minor',
    major_damage: 'badge-major',
  };
  return `<span class="badge ${map[c] || 'badge'}">${c.replace('_', ' ')}</span>`;
}


function roleBadge(role) {
  const map = {
    ADMIN:     '#f97316',
    CAR_OWNER: '#60a5fa',
    USER:      '#34d399',
  };
  const c = map[role] || '#8888a8';
  return `<span style="font-family:'DM Mono',monospace;font-size:10px;padding:2px 8px;
    border-radius:12px;background:${c}22;color:${c};border:1px solid ${c}44;">${role}</span>`;
}


function renderCarsTable(cars, tbodyId, opts = {}) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;


  if (!cars.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;
      font-family:'DM Mono',monospace;font-size:11px;color:#5a5a78;">No cars found.</td></tr>`;
    return;
  }


  tbody.innerHTML = cars.map(c => `
    <tr>
      <td class="mono">#${c.id}</td>
      <td>${c.make} ${c.model}</td>
      <td class="plate">${c.plate_number}</td>
      <td>${c.year}</td>
      <td class="mono">₱${Number(c.daily_rate).toLocaleString()}/day</td>
      ${opts.showOwner ? `<td class="mono">${c.owner_name || '—'}</td>` : ''}
      <td>${statusBadge(c.status)}</td>
      <td>
        ${opts.editable
          ? `<button class="btn btn-ghost btn-sm" onclick="editCar(${c.id})">Edit</button>
             <button class="btn btn-danger btn-sm" onclick="deleteCar(${c.id})">Delete</button>`
          : ''}
        ${opts.rentable && c.status === 'available'
          ? `<button class="btn btn-primary btn-sm" onclick="rentCar(${c.id})">Rent</button>`
          : ''}
      </td>
    </tr>
  `).join('');
}


function renderClientsTable(clients, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;


  tbody.innerHTML = clients.map(c => `
    <tr>
      <td class="mono">#${c.id}</td>
      <td>${c.last_name}, ${c.first_name}</td>
      <td>${c.phone}</td>
      <td>${c.email || '—'}</td>
      <td class="plate">${c.license_id}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editClient(${c.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}


function renderRentalsTable(rentals, tbodyId, opts = {}) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;


  if (!rentals.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;
      font-family:'DM Mono',monospace;font-size:11px;color:#5a5a78;">No rentals found.</td></tr>`;
    return;
  }


  tbody.innerHTML = rentals.map(r => `
    <tr>
      <td class="mono">#${r.id}</td>
      <td>${r.car_display}</td>
      <td>${r.client_name}</td>
      <td class="mono">${r.start_date}</td>
      <td class="mono">${r.expected_return_date}</td>
      <td class="mono">₱${Number(r.total_cost || 0).toLocaleString()}</td>
      <td>${opts.editable
        ? `<button class="btn btn-ghost btn-sm" onclick="editRental(${r.id})">Edit</button>
           <button class="btn btn-danger btn-sm" onclick="deleteRental(${r.id})">Delete</button>`
        : ''}</td>
    </tr>
  `).join('');
}


function renderReturnsTable(returns, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;


  if (!returns.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;
      font-family:'DM Mono',monospace;font-size:11px;color:#5a5a78;">No returns found.</td></tr>`;
    return;
  }


  tbody.innerHTML = returns.map(r => `
    <tr>
      <td class="mono">#${r.id}</td>
      <td class="mono">${r.rental_info}</td>
      <td class="mono">${r.return_date}</td>
      <td>${conditionBadge(r.condition)}</td>
      <td>${r.is_late
        ? '<span class="badge badge-late">Late</span>'
        : '<span class="badge badge-good">On Time</span>'}</td>
      <td>${r.remarks || '—'}</td>
    </tr>
  `).join('');
}


function renderUsersTable(users, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;


  tbody.innerHTML = users.map(u => `
    <tr>
      <td class="mono">#${u.id}</td>
      <td>${u.username}</td>
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email || '—'}</td>
      <td>${roleBadge(u.role)}</td>
      <td class="mono">${new Date(u.date_joined).toLocaleDateString('en-PH')}</td>
    </tr>
  `).join('');
}


// ─────────────────────────────────────────────────────────
//  CRUD ACTION STUBS
//  These wire up to your existing modal/form system.
//  Replace the console.log calls with your modal opens.
// ─────────────────────────────────────────────────────────
async function deleteCar(id) {
  if (!confirm('Delete this car?')) return;
  await apiFetch(`/cars/${id}/`, { method: 'DELETE' });
  loadDashboard();
}


async function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  await apiFetch(`/clients/${id}/`, { method: 'DELETE' });
  loadDashboard();
}


async function deleteRental(id) {
  if (!confirm('Delete this rental?')) return;
  await apiFetch(`/rentals/${id}/`, { method: 'DELETE' });
  loadDashboard();
}


function editCar(id)     { console.log('Open edit-car modal for id:', id);    /* wire to your modal */ }
function editClient(id)  { console.log('Open edit-client modal for id:', id); /* wire to your modal */ }
function editRental(id)  { console.log('Open edit-rental modal for id:', id); /* wire to your modal */ }
function rentCar(id)     { console.log('Open rent-car modal for id:', id);    /* wire to your modal */ }


// ─────────────────────────────────────────────────────────
//  GENERIC SAVE HELPER  (for use inside your modal forms)
// ─────────────────────────────────────────────────────────
async function saveCar(payload, id = null) {
  const path   = id ? `/cars/${id}/` : '/cars/';
  const method = id ? 'PATCH' : 'POST';
  const data   = await apiFetch(path, { method, body: JSON.stringify(payload) });
  if (data) loadDashboard();
  return data;
}


async function saveClient(payload, id = null) {
  const path   = id ? `/clients/${id}/` : '/clients/';
  const method = id ? 'PATCH' : 'POST';
  const data   = await apiFetch(path, { method, body: JSON.stringify(payload) });
  if (data) loadDashboard();
  return data;
}


async function saveRental(payload, id = null) {
  const path   = id ? `/rentals/${id}/` : '/rentals/';
  const method = id ? 'PATCH' : 'POST';
  const data   = await apiFetch(path, { method, body: JSON.stringify(payload) });
  if (data) loadDashboard();
  return data;
}


async function saveReturn(payload, id = null) {
  const path   = id ? `/returns/${id}/` : '/returns/';
  const method = id ? 'PATCH' : 'POST';
  const data   = await apiFetch(path, { method, body: JSON.stringify(payload) });
  if (data) loadDashboard();
  return data;
}


// ─────────────────────────────────────────────────────────
//  INIT — runs on page load
// ─────────────────────────────────────────────────────────
(function init() {
  if (!Auth.requireAuth()) return;


  const user = Auth.getUser();
  if (!user) return;


  applyRoleVisibility(user.role);
  renderUserHeader(user);
  loadDashboard();


  // Attach logout button if it has id="logoutBtn"
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());
})();