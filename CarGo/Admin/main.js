/* ═══════════════════════════════════════════
   CarGo — Fleet Management
   main.js
═══════════════════════════════════════════ */


const API = 'http://127.0.0.1:8000/api';


// ════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════
function navigate(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  document.querySelector(`[data-section="${section}"]`).classList.add('active');
  loadSection(section);
}


document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.section));
});


function loadSection(section) {
  if (section === 'dashboard') loadDashboard();
  if (section === 'cars')      loadCars();
  if (section === 'clients')   loadClients();
  if (section === 'rentals')   loadRentals();
  if (section === 'returns')   loadReturns();
}


// ════════════════════════════════════════
// SERVER STATUS CHECK
// ════════════════════════════════════════
async function checkServer() {
  try {
    const res = await fetch(`${API}/cars/`);
    if (res.ok) {
      document.getElementById('serverDot').style.background = 'var(--success)';
      document.getElementById('serverLabel').textContent = 'API Connected';
    } else {
      throw new Error();
    }
  } catch {
    document.getElementById('serverDot').style.background = 'var(--danger)';
    document.getElementById('serverLabel').textContent = 'API Offline';
  }
}


// ════════════════════════════════════════
// MODAL HELPERS
// ════════════════════════════════════════
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
}


function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('open');
  clearMsgs();
}


function clearMsgs() {
  document.querySelectorAll('.msg').forEach(m => {
    m.className = 'msg';
    m.textContent = '';
  });
}


function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg ' + type;
}


// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});


// ════════════════════════════════════════
// TABLE SEARCH FILTER
// ════════════════════════════════════════
function filterTable(tbodyId, query) {
  const rows = document.querySelectorAll(`#${tbodyId} tr`);
  const q = query.toLowerCase();
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}


// ════════════════════════════════════════
// FORMAT HELPERS
// ════════════════════════════════════════
function fmt(n) {
  return new Intl.NumberFormat('en-PH').format(n);
}


function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}


function badgeCar(s) {
  const map = { available: 'available', rented: 'rented', maintenance: 'maintenance' };
  return `<span class="badge badge-${map[s] || 'rented'}">${s}</span>`;
}


function badgeCond(c) {
  const map = { good: 'good', minor_damage: 'minor', major_damage: 'major' };
  const lbl = { good: 'Good', minor_damage: 'Minor Dmg', major_damage: 'Major Dmg' };
  return `<span class="badge badge-${map[c] || 'good'}">${lbl[c] || c}</span>`;
}


function actionBtns(editFn, deleteFn) {
  return `
    <button class="btn btn-ghost btn-sm btn-icon" title="Edit" onclick="${editFn}">✎</button>
    <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="${deleteFn}">✕</button>
  `;
}


// ════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════
async function loadDashboard() {
  // Stat cards
  try {
    const res = await fetch(`${API}/dashboard/`);
    const d = await res.json();
    document.getElementById('d-total-cars').textContent  = d.total_cars;
    document.getElementById('d-avail-cars').textContent  = d.available_cars;
    document.getElementById('d-rented-cars').textContent = d.rented_cars;
    document.getElementById('d-clients').textContent     = d.total_clients;
    document.getElementById('d-rentals').textContent     = d.active_rentals;
    document.getElementById('d-returns').textContent     = d.total_returns;
  } catch {
    ['d-total-cars', 'd-avail-cars', 'd-rented-cars', 'd-clients', 'd-rentals', 'd-returns']
      .forEach(id => document.getElementById(id).textContent = '!');
  }


  // Recent rentals table
  const tbody = document.getElementById('recent-rentals-body');
  try {
    const res = await fetch(`${API}/rentals/`);
    const data = await res.json();
    const recent = data.slice(0, 5);


    if (!recent.length) {
      tbody.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">NO RENTALS YET</div>
        </div>`;
      return;
    }


    tbody.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th><th>Vehicle</th><th>Client</th>
            <th>Start</th><th>Return</th><th>Cost</th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(r => `
            <tr>
              <td class="mono">${r.id}</td>
              <td>${r.car_display || '—'}</td>
              <td>${r.client_name || '—'}</td>
              <td class="mono">${fmtDate(r.start_date)}</td>
              <td class="mono">${fmtDate(r.expected_return_date)}</td>
              <td class="mono">₱${fmt(r.total_cost || 0)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch {
    tbody.innerHTML = `
      <div class="empty-state">
        <div class="empty-text">COULD NOT LOAD RENTALS</div>
      </div>`;
  }
}


// ════════════════════════════════════════
// CARS
// ════════════════════════════════════════
let allCars = [];


async function loadCars() {
  const tbody = document.getElementById('cars-tbody');
  try {
    const res = await fetch(`${API}/cars/`);
    allCars = await res.json();


    if (!allCars.length) {
      tbody.innerHTML = `
        <tr><td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">🚗</div>
            <div class="empty-text">NO VEHICLES ADDED YET</div>
          </div>
        </td></tr>`;
      return;
    }


    tbody.innerHTML = allCars.map(c => `
      <tr>
        <td class="mono">${c.id}</td>
        <td><span class="plate">${c.plate_number}</span></td>
        <td><strong>${c.make} ${c.model}</strong></td>
        <td class="mono">${c.year}</td>
        <td>${c.color || '—'}</td>
        <td class="mono">₱${fmt(c.daily_rate)}</td>
        <td>${badgeCar(c.status)}</td>
        <td>${actionBtns(
          `editCar(${c.id})`,
          `confirmDelete('car',${c.id},'${c.year} ${c.make} ${c.model} - ${c.plate_number}')`
        )}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-text">COULD NOT REACH API</div>
        </div>
      </td></tr>`;
  }
}


async function submitCar() {
  const body = {
    make:         document.getElementById('car-add-make').value.trim(),
    model:        document.getElementById('car-add-model').value.trim(),
    year:         document.getElementById('car-add-year').value,
    color:        document.getElementById('car-add-color').value.trim(),
    plate_number: document.getElementById('car-add-plate').value.trim(),
    daily_rate:   document.getElementById('car-add-rate').value,
    status:       document.getElementById('car-add-status').value,
  };


  if (!body.make || !body.model || !body.plate_number || !body.daily_rate) {
    return showMsg('car-add-msg', 'Please fill in all required fields.', 'error');
  }


  try {
    const res = await fetch(`${API}/cars/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('car-add-msg', JSON.stringify(err), 'error');
    }
    showMsg('car-add-msg', 'Vehicle added successfully!', 'success');
    ['car-add-make', 'car-add-model', 'car-add-year', 'car-add-color', 'car-add-plate', 'car-add-rate']
      .forEach(id => document.getElementById(id).value = '');
    await loadCars();
    setTimeout(() => closeModal('car-add'), 900);
  } catch {
    showMsg('car-add-msg', 'Failed to connect to API.', 'error');
  }
}


function editCar(id) {
  const car = allCars.find(c => c.id === id);
  if (!car) return;
  document.getElementById('car-edit-id').value     = car.id;
  document.getElementById('car-edit-make').value   = car.make;
  document.getElementById('car-edit-model').value  = car.model;
  document.getElementById('car-edit-year').value   = car.year;
  document.getElementById('car-edit-color').value  = car.color || '';
  document.getElementById('car-edit-plate').value  = car.plate_number;
  document.getElementById('car-edit-rate').value   = car.daily_rate;
  document.getElementById('car-edit-status').value = car.status;
  openModal('car-edit');
}


async function updateCar() {
  const id = document.getElementById('car-edit-id').value;
  const body = {
    make:         document.getElementById('car-edit-make').value.trim(),
    model:        document.getElementById('car-edit-model').value.trim(),
    year:         document.getElementById('car-edit-year').value,
    color:        document.getElementById('car-edit-color').value.trim(),
    plate_number: document.getElementById('car-edit-plate').value.trim(),
    daily_rate:   document.getElementById('car-edit-rate').value,
    status:       document.getElementById('car-edit-status').value,
  };


  try {
    const res = await fetch(`${API}/cars/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('car-edit-msg', JSON.stringify(err), 'error');
    }
    showMsg('car-edit-msg', 'Vehicle updated!', 'success');
    await loadCars();
    setTimeout(() => closeModal('car-edit'), 900);
  } catch {
    showMsg('car-edit-msg', 'Failed to connect to API.', 'error');
  }
}


// ════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════
let allClients = [];


async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  try {
    const res = await fetch(`${API}/clients/`);
    allClients = await res.json();


    if (!allClients.length) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">👤</div>
            <div class="empty-text">NO CLIENTS YET</div>
          </div>
        </td></tr>`;
      return;
    }


    tbody.innerHTML = allClients.map(c => `
      <tr>
        <td class="mono">${c.id}</td>
        <td><strong>${c.last_name}, ${c.first_name}</strong></td>
        <td class="mono">${c.phone}</td>
        <td>${c.email || '—'}</td>
        <td><span class="plate">${c.license_id}</span></td>
        <td class="mono">${fmtDate(c.created_at?.split('T')[0])}</td>
        <td>${actionBtns(
          `editClient(${c.id})`,
          `confirmDelete('client',${c.id},'${c.last_name}, ${c.first_name}')`
        )}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-text">COULD NOT REACH API</div>
        </div>
      </td></tr>`;
  }
}


async function submitClient() {
  const body = {
    first_name: document.getElementById('client-add-fname').value.trim(),
    last_name:  document.getElementById('client-add-lname').value.trim(),
    phone:      document.getElementById('client-add-phone').value.trim(),
    email:      document.getElementById('client-add-email').value.trim(),
    license_id: document.getElementById('client-add-license').value.trim(),
    address:    document.getElementById('client-add-address').value.trim(),
  };


  if (!body.first_name || !body.last_name || !body.phone || !body.license_id) {
    return showMsg('client-add-msg', 'Please fill in all required fields.', 'error');
  }


  try {
    const res = await fetch(`${API}/clients/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('client-add-msg', JSON.stringify(err), 'error');
    }
    showMsg('client-add-msg', 'Client added successfully!', 'success');
    ['client-add-fname', 'client-add-lname', 'client-add-phone',
     'client-add-email', 'client-add-license', 'client-add-address']
      .forEach(id => document.getElementById(id).value = '');
    await loadClients();
    setTimeout(() => closeModal('client-add'), 900);
  } catch {
    showMsg('client-add-msg', 'Failed to connect to API.', 'error');
  }
}


function editClient(id) {
  const c = allClients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('client-edit-id').value      = c.id;
  document.getElementById('client-edit-fname').value   = c.first_name;
  document.getElementById('client-edit-lname').value   = c.last_name;
  document.getElementById('client-edit-phone').value   = c.phone;
  document.getElementById('client-edit-email').value   = c.email || '';
  document.getElementById('client-edit-license').value = c.license_id;
  document.getElementById('client-edit-address').value = c.address || '';
  openModal('client-edit');
}


async function updateClient() {
  const id = document.getElementById('client-edit-id').value;
  const body = {
    first_name: document.getElementById('client-edit-fname').value.trim(),
    last_name:  document.getElementById('client-edit-lname').value.trim(),
    phone:      document.getElementById('client-edit-phone').value.trim(),
    email:      document.getElementById('client-edit-email').value.trim(),
    license_id: document.getElementById('client-edit-license').value.trim(),
    address:    document.getElementById('client-edit-address').value.trim(),
  };


  try {
    const res = await fetch(`${API}/clients/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('client-edit-msg', JSON.stringify(err), 'error');
    }
    showMsg('client-edit-msg', 'Client updated!', 'success');
    await loadClients();
    setTimeout(() => closeModal('client-edit'), 900);
  } catch {
    showMsg('client-edit-msg', 'Failed to connect to API.', 'error');
  }
}


// ════════════════════════════════════════
// RENTALS
// ════════════════════════════════════════
let allRentals = [];


async function loadRentals() {
  const tbody = document.getElementById('rentals-tbody');
  try {
    const res = await fetch(`${API}/rentals/`);
    allRentals = await res.json();


    if (!allRentals.length) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">NO RENTALS YET</div>
          </div>
        </td></tr>`;
      return;
    }


    tbody.innerHTML = allRentals.map(r => `
      <tr>
        <td class="mono">${r.id}</td>
        <td>${r.car_display || '—'}</td>
        <td>${r.client_name || '—'}</td>
        <td class="mono">${fmtDate(r.start_date)}</td>
        <td class="mono">${fmtDate(r.expected_return_date)}</td>
        <td class="mono">₱${fmt(r.total_cost || 0)}</td>
        <td>${actionBtns(
          '',
          `confirmDelete('rental',${r.id},'Rental #${r.id}')`
        )}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-text">COULD NOT REACH API</div>
        </div>
      </td></tr>`;
  }
}


async function openRentalModal() {
  const carsRes = await fetch(`${API}/cars/`);
  const cars = await carsRes.json();
  const availCars = cars.filter(c => c.status === 'available');


  const cliRes = await fetch(`${API}/clients/`);
  const clients = await cliRes.json();


  document.getElementById('rental-add-car').innerHTML = availCars.length
    ? availCars.map(c => `<option value="${c.id}">${c.year} ${c.make} ${c.model} — ${c.plate_number}</option>`).join('')
    : '<option value="">No available vehicles</option>';


  document.getElementById('rental-add-client').innerHTML = clients.length
    ? clients.map(c => `<option value="${c.id}">${c.last_name}, ${c.first_name}</option>`).join('')
    : '<option value="">No clients registered</option>';


  document.getElementById('rental-add-start').value = new Date().toISOString().split('T')[0];
  openModal('rental-add');
}


async function submitRental() {
  const body = {
    car:                  document.getElementById('rental-add-car').value,
    client:               document.getElementById('rental-add-client').value,
    start_date:           document.getElementById('rental-add-start').value,
    expected_return_date: document.getElementById('rental-add-end').value,
    notes:                document.getElementById('rental-add-notes').value.trim(),
  };


  if (!body.car || !body.client || !body.start_date || !body.expected_return_date) {
    return showMsg('rental-add-msg', 'Please fill in all required fields.', 'error');
  }
  if (body.expected_return_date <= body.start_date) {
    return showMsg('rental-add-msg', 'Return date must be after start date.', 'error');
  }


  try {
    const res = await fetch(`${API}/rentals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('rental-add-msg', JSON.stringify(err), 'error');
    }
    showMsg('rental-add-msg', 'Rental created!', 'success');
    await loadRentals();
    setTimeout(() => closeModal('rental-add'), 900);
  } catch {
    showMsg('rental-add-msg', 'Failed to connect to API.', 'error');
  }
}


// ════════════════════════════════════════
// RETURNS
// ════════════════════════════════════════
let allReturns = [];


async function loadReturns() {
  const tbody = document.getElementById('returns-tbody');
  try {
    const res = await fetch(`${API}/returns/`);
    allReturns = await res.json();


    if (!allReturns.length) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">↩</div>
            <div class="empty-text">NO RETURNS LOGGED YET</div>
          </div>
        </td></tr>`;
      return;
    }


    tbody.innerHTML = allReturns.map(r => `
      <tr>
        <td class="mono">${r.id}</td>
        <td class="mono">${r.rental_info || 'Rental #' + r.rental}</td>
        <td class="mono">${fmtDate(r.return_date)}</td>
        <td>${badgeCond(r.condition)}</td>
        <td>${r.is_late
          ? '<span class="badge badge-late">LATE</span>'
          : '<span class="badge badge-good">ON TIME</span>'}</td>
        <td>${r.remarks || '—'}</td>
        <td>${actionBtns(
          '',
          `confirmDelete('return',${r.id},'Return #${r.id}')`
        )}</td>
      </tr>`).join('');
  } catch {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-text">COULD NOT REACH API</div>
        </div>
      </td></tr>`;
  }
}


async function openReturnModal() {
  const res = await fetch(`${API}/rentals/`);
  const rentals = await res.json();


  document.getElementById('return-add-rental').innerHTML = rentals.length
    ? rentals.map(r => `<option value="${r.id}">Rental #${r.id} — ${r.car_display || 'Car'} (${r.client_name || 'Client'})</option>`).join('')
    : '<option value="">No rentals available</option>';


  document.getElementById('return-add-date').value = new Date().toISOString().split('T')[0];
  openModal('return-add');
}


async function submitReturn() {
  const body = {
    rental:      document.getElementById('return-add-rental').value,
    return_date: document.getElementById('return-add-date').value,
    condition:   document.getElementById('return-add-condition').value,
    remarks:     document.getElementById('return-add-remarks').value.trim(),
  };


  if (!body.rental || !body.return_date) {
    return showMsg('return-add-msg', 'Please fill in all required fields.', 'error');
  }


  try {
    const res = await fetch(`${API}/returns/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      return showMsg('return-add-msg', JSON.stringify(err), 'error');
    }
    showMsg('return-add-msg', 'Return logged!', 'success');
    await loadReturns();
    setTimeout(() => closeModal('return-add'), 900);
  } catch {
    showMsg('return-add-msg', 'Failed to connect to API.', 'error');
  }
}


// ════════════════════════════════════════
// DELETE
// ════════════════════════════════════════
let _deleteTarget = null;


function confirmDelete(type, id, label) {
  document.getElementById('delete-label').textContent = label;
  _deleteTarget = { type, id };
  document.getElementById('confirm-delete-btn').onclick = executeDelete;
  openModal('delete');
}


async function executeDelete() {
  if (!_deleteTarget) return;
  const { type, id } = _deleteTarget;
  const endpoints = { car: 'cars', client: 'clients', rental: 'rentals', return: 'returns' };
  const ep = endpoints[type];


  try {
    const res = await fetch(`${API}/${ep}/${id}/`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      showMsg('delete-msg', 'Deleted successfully.', 'success');
      if (type === 'car')    await loadCars();
      if (type === 'client') await loadClients();
      if (type === 'rental') await loadRentals();
      if (type === 'return') await loadReturns();
      setTimeout(() => closeModal('delete'), 900);
    } else {
      showMsg('delete-msg', 'Could not delete. It may be in use.', 'error');
    }
  } catch {
    showMsg('delete-msg', 'Failed to connect to API.', 'error');
  }
}


// ════════════════════════════════════════
// INIT — runs on page load
// ════════════════════════════════════════
checkServer();
loadDashboard();

