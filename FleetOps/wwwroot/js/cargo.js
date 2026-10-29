(function () {
  const MAX_KG = 13500, SLOT_KG = 1000;
  const ROWS = ['A', 'B', 'C'], COLS = 6;
  const PR = { Standard: '', Express: 'express', 'Same day': 'same' };
  const PR_CHIP = { Standard: 'violet', Express: 'yellow', 'Same day': 'cyan' };
  const PR_RANK = { 'Same day': 0, Express: 1, Standard: 2 };

  // Mock data (the backend phase will replace these with real shipments)
  const loaded = {
    A1: ['SHP-5839', 500, 'Standard'], A2: ['SHP-2212', 500, 'Standard'], A3: ['SHP-0080', 500, 'Standard'],
    B1: ['SHP-1233', 500, 'Standard'], B2: ['SHP-4434', 1000, 'Express'], B3: ['SHP-3324', 500, 'Standard'],
    C1: ['SHP-3030', 500, 'Standard'], C2: ['SHP-8893', 1000, 'Standard'], C3: ['SHP-0040', 1000, 'Same day'], C4: ['SHP-3320', 500, 'Standard']
  };
  let pending = [
    { id: 'SHP-9821', pr: 'Standard', from: 'New Cairo', to: 'Maadi', type: 'Pallet', qty: '10 pallets', kg: 500, dim: '0.8×0.6×1 m', method: 'Pickup' },
    { id: 'SHP-9822', pr: 'Express', from: 'New Cairo', to: 'Heliopolis', type: 'Box', qty: '15 boxes', kg: 1000, dim: '0.4×0.2×1 m', method: 'Pickup' },
    { id: 'SHP-9823', pr: 'Same day', from: 'Nasr City', to: '6th of October', type: 'Box', qty: '12 boxes', kg: 800, dim: '1.5×1.2×0.4 m', method: 'Pickup' },
    { id: 'SHP-9824', pr: 'Standard', from: 'New Cairo', to: 'Giza', type: 'Crate', qty: '4 crates', kg: 650, dim: '1×1×0.8 m', method: 'Delivery' },
    { id: 'SHP-9825', pr: 'Express', from: 'Maadi', to: '6th of October', type: 'Machinery', qty: '1 unit', kg: 1200, dim: '1.6×1.2×1.1 m', method: 'Pickup' }
  ];
  const slots = {};
  ROWS.forEach(r => { for (let c = 1; c <= COLS; c++) slots[r + c] = null; });
  Object.entries(loaded).forEach(([k, v]) => slots[k] = { id: v[0], kg: v[1], pr: v[2] });

  let selected = null, query = '', sort = 'pr', view = 'grid';
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-US');
  const clock = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const logEl = $('log');
  function log(text, fresh) {
    const li = document.createElement('li');
    if (fresh) li.className = 'new';
    li.innerHTML = '<span class="dot"><i data-lucide="' + (fresh ? 'package-plus' : 'clock-3') + '"></i></span><div><time>' + clock() + '</time><p></p></div>';
    li.querySelector('p').textContent = text;
    logEl.prepend(li);
    FleetOps.icons();
  }

  function totalKg() { return Object.values(slots).reduce((s, x) => s + (x ? x.kg : 0), 0); }

  function renderCapacity() {
    const kg = totalKg(), pct = Math.round(kg / MAX_KG * 100), C = 345.6;
    $('pct').textContent = pct + '%';
    $('curTons').textContent = (kg / 1000).toFixed(1).replace(/\.0$/, '.0');
    $('ringVal').style.strokeDashoffset = C * (1 - Math.min(kg / MAX_KG, 1));
    $('ring').classList.toggle('hot', pct >= 85);
  }

  function renderSlots(popId) {
    const el = $('slots'); el.innerHTML = '';
    Object.keys(slots).forEach(key => {
      const s = slots[key], b = document.createElement('button');
      b.type = 'button'; b.dataset.slot = key;
      if (s) {
        b.className = 'slot filled ' + PR[s.pr] + (popId === key ? ' pop' : '');
        b.innerHTML = '<span class="sid">' + key + '</span><span class="sdot"></span><span><span class="skg">' + fmt(s.kg) + 'kg</span><br><span class="sref">' + s.id + '</span></span>';
        const x = document.createElement('span');
        x.className = 'unload'; x.setAttribute('role', 'button'); x.setAttribute('aria-label', 'Unload ' + s.id); x.tabIndex = 0;
        x.innerHTML = '<i data-lucide="x"></i>';
        b.appendChild(x);
        b.title = s.id + ' · ' + s.pr + ' · click ✕ to unload';
      } else {
        b.className = 'slot empty' + (selected === key ? ' sel' : '');
        b.setAttribute('aria-label', 'Empty slot ' + key);
        b.innerHTML = '<span class="sid">' + key + '</span><span class="plus"><i data-lucide="' + (selected === key ? 'check' : 'plus') + '"></i></span>';
      }
      el.appendChild(b);
    });
    FleetOps.icons();
  }

  function renderShips() {
    const el = $('ships');
    el.className = 'ships' + (view === 'list' ? ' list' : '');
    let list = pending.filter(p => (p.id + p.from + p.to + p.pr).toLowerCase().includes(query.toLowerCase()));
    list.sort((a, b) => sort === 'kg' ? b.kg - a.kg : sort === 'id' ? a.id.localeCompare(b.id) : PR_RANK[a.pr] - PR_RANK[b.pr]);
    if (!list.length) { el.innerHTML = '<div class="empty-state">' + (pending.length ? 'No shipments match your search.' : 'All shipments are loaded. Ready to dispatch.') + '</div>'; return; }
    el.innerHTML = list.map(p => {
      const tooBig = p.kg > SLOT_KG;
      return '<article class="ship" data-id="' + p.id + '">' +
        '<div class="ship-top"><b><i data-lucide="package"></i>' + p.id + '</b><span class="chip ' + PR_CHIP[p.pr] + '">' + p.pr + '</span></div>' +
        '<div class="spec"><div class="wide"><small>Route</small><b>' + p.from + ' → ' + p.to + '</b></div><div><small>Type</small><b>' + p.type + '</b></div>' +
        '<div><small>Quantity</small><b>' + p.qty + '</b></div><div><small>Total weight</small><b>' + fmt(p.kg) + ' kg</b></div><div><small>Method</small><b>' + p.method + '</b></div>' +
        '<div class="wide"><small>Dimension</small><b>' + p.dim + '</b></div></div>' +
        (tooBig ? '<div class="warn"><i data-lucide="triangle-alert"></i>Over the ' + fmt(SLOT_KG) + ' kg slot limit</div>' : '') +
        '<button class="btn sm rect full" data-assign="' + p.id + '"' + (tooBig ? ' disabled' : '') + '><i data-lucide="plus"></i>Assign to truck</button></article>';
    }).join('');
    FleetOps.icons();
  }

  function renderTitle() {
    $('assignTitle').innerHTML = selected ? 'Assign shipment to <span>' + selected + '</span> slot' : 'Assign shipment to a slot';
  }

  function assign(id) {
    const p = pending.find(x => x.id === id); if (!p) return;
    if (!selected) {
      FleetOps.toast('Pick a free slot on the trailer first.');
      document.querySelectorAll('.slot.empty').forEach(s => { s.classList.add('hint'); setTimeout(() => s.classList.remove('hint'), 900); });
      return;
    }
    if (totalKg() + p.kg > MAX_KG) { FleetOps.toast('That would exceed the truck’s 13.5 t capacity.'); return; }
    const card = document.querySelector('.ship[data-id="' + id + '"]');
    const key = selected;
    slots[key] = { id: p.id, kg: p.kg, pr: p.pr };
    pending = pending.filter(x => x.id !== id);
    selected = null;
    log(p.id + ' assigned (' + p.qty + ', ' + fmt(p.kg) + 'kg) to ' + key, true);
    if (card) { card.classList.add('leaving'); setTimeout(renderShips, 220); } else renderShips();
    renderSlots(key); renderCapacity(); renderTitle();
  }

  function unload(key) {
    const s = slots[key]; if (!s) return;
    const origin = { 'SHP-5839': 'Giza' }; // demo-only
    pending.push({ id: s.id, pr: s.pr, from: 'New Cairo', to: origin[s.id] || 'Maadi', type: 'Box', qty: '—', kg: s.kg, dim: '—', method: 'Pickup' });
    slots[key] = null;
    log(s.id + ' unloaded from ' + key, false);
    renderSlots(); renderShips(); renderCapacity();
  }

  $('slots').addEventListener('click', e => {
    const unl = e.target.closest('.unload');
    const b = e.target.closest('.slot'); if (!b) return;
    const key = b.dataset.slot;
    if (unl) { unload(key); return; }
    if (slots[key]) return;
    selected = selected === key ? null : key;
    renderSlots(); renderTitle();
  });
  $('slots').addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('unload')) { e.preventDefault(); e.target.click(); }
  });
  $('ships').addEventListener('click', e => { const b = e.target.closest('[data-assign]'); if (b) assign(b.dataset.assign); });
  $('shipSearch').addEventListener('input', e => { query = e.target.value; renderShips(); });
  $('shipSort').addEventListener('change', e => { sort = e.target.value; renderShips(); });
  $('viewGrid').addEventListener('click', () => { view = 'grid'; $('viewGrid').classList.add('on'); $('viewList').classList.remove('on'); renderShips(); });
  $('viewList').addEventListener('click', () => { view = 'list'; $('viewList').classList.add('on'); $('viewGrid').classList.remove('on'); renderShips(); });
  $('dispatchBtn').addEventListener('click', () => {
    const kg = totalKg();
    FleetOps.toast(pending.length ? 'FL-204 dispatched with ' + (kg / 1000).toFixed(1) + ' t — ' + pending.length + ' shipment(s) left at the dock (demo).' : 'FL-204 dispatched fully loaded (demo).');
  });

  // Seed the activity log (oldest first so newest ends up on top)
  [['Driver Omar Hassan checked in', '08:34 AM'], ['Dock #3 assigned to FL-204', '08:41 AM'], ['SHP-5839 assigned (500kg) to A1', '08:52 AM'], ['SHP-4434 assigned (1,000kg) to B2', '09:05 AM']]
    .forEach(([t, time]) => { log(t, false); logEl.firstChild.querySelector('time').textContent = time; });

  renderSlots(); renderShips(); renderCapacity(); renderTitle();
})();
