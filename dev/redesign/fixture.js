/* Development-only in-memory UI adapter. Not an Auth/RLS/backend simulator. */
(() => {
  'use strict';
  if (location.protocol !== 'http:' || location.hostname !== '127.0.0.1') throw new Error('Preview requires loopback HTTP');
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = '00000000-0000-4000-8000-000000000001';
  const user = { id: uid, email: 'john@northstone.example', email_confirmed_at: '2026-09-01T09:00:00Z' };
  const customer = { id: '00000000-0000-4000-8000-000000000002', name: 'Willow & Pine Studio (fictional)', email: 'hello@willowpine.example', address: 'Example address — demonstration only' };
  const item = { name: 'Website maintenance', qty: 1, unit: 'service', price: 200, discount: 0, tax: 20 };
  const tables = {
    company_settings: [{ user_id: uid, name: 'North & Stone (fictional)', email: user.email, default_currency: 'GBP', invoice_prefix: 'INV-', payment_details: 'Bank transfer instructions — fictional preview only', brand_color: '#4f46e5' }],
    customers: [customer], saved_items: [{ id: '00000000-0000-4000-8000-000000000003', name: item.name, price: 200, description: 'Monthly maintenance service' }],
    invoices: [
      { id: '00000000-0000-4000-8000-000000000042', number: '1042', status: 'Sent', doc_type: 'invoice', issue_date: '2026-09-01', due_date: '2026-09-04', currency: 'GBP', customer_snapshot: customer, items: [item], payments: [], grand_total: 240 },
      { id: '00000000-0000-4000-8000-000000000037', number: '1037', status: 'Paid', doc_type: 'invoice', issue_date: '2026-09-01', due_date: '2026-09-08', currency: 'GBP', customer_snapshot: customer, items: [item], payments: [{ amount: 240, date: '2026-09-08', note: 'Fictional manual payment' }], grand_total: 240 },
      { id: '00000000-0000-4000-8000-000000000217', number: '0217', status: 'Sent', doc_type: 'quote', issue_date: '2026-09-10', due_date: '2026-09-25', currency: 'GBP', customer_snapshot: customer, items: [{ ...item, name: 'Design project', price: 800 }], payments: [], grand_total: 960 },
    ], recurring_templates: [], audit_events: [],
  };
  Object.values(tables).forEach(rows => rows.forEach(row => { row.user_id = uid; row.created_at = '2026-09-01T09:00:00Z'; row.updated_at = row.created_at; }));
  const blocked = () => ({ data: null, error: { message: 'Unavailable in this fictional preview. No email, payment or account action was performed.' } });
  // Deny all transports as defence in depth in addition to the server CSP.
  window.fetch = async () => { throw new Error('Preview blocks network requests'); };
  window.XMLHttpRequest = class { constructor() { throw new Error('Preview blocks network requests'); } };
  window.WebSocket = class { constructor() { throw new Error('Preview blocks network requests'); } };
  window.EventSource = class { constructor() { throw new Error('Preview blocks network requests'); } };
  window.open = () => null;
  if (navigator.sendBeacon) navigator.sendBeacon = () => false;
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a');
    if (anchor && !anchor.download && !String(anchor.getAttribute('href') || '').startsWith('#')) event.preventDefault();
  }, true);
  document.addEventListener('submit', event => event.preventDefault(), true);
  window.SUPABASE_URL = 'http://127.0.0.1';
  window.SUPABASE_ANON_KEY = 'fictional-preview-not-a-key';
  window.STRIPE_LIVE_MODE = false;
  window.TALLYO_GA4_ENABLED = false;
  function query(table) {
    if (!Object.hasOwn(tables, table)) throw new Error(`Unsupported preview table: ${table}`);
    let filters = [], order = [], start = 0, end = Infinity, one = false, action = 'read', payload;
    const api = {
      select() { return api; }, eq(key, value) { filters.push(row => row[key] === value); return api; },
      in(key, values) { filters.push(row => values.includes(row[key])); return api; },
      order(key, options = {}) { order.push([key, options.ascending !== false]); return api; },
      range(a, b) { start = a; end = b + 1; return api; }, limit(n) { end = n; return api; },
      single() { one = true; return api; }, maybeSingle() { one = true; return api; },
      insert(value) { action = 'insert'; payload = value; return api; },
      update(value) { action = 'update'; payload = value; return api; },
      delete() { action = 'delete'; return api; },
      then(onFulfilled, onRejected) {
        return Promise.resolve().then(() => {
          let rows = tables[table].filter(row => filters.every(filter => filter(row)));
          if (action === 'insert') {
            rows = (Array.isArray(payload) ? payload : [payload]).map(row => ({ ...clone(row), id: crypto.randomUUID(), user_id: uid, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
            tables[table].push(...rows);
          } else if (action === 'update' || action === 'delete') {
            if (!filters.length) throw new Error('Preview mutations require an explicit filter');
            if (action === 'update') rows.forEach(row => Object.assign(row, clone(payload)));
            else tables[table] = tables[table].filter(row => !rows.includes(row));
          }
          rows.sort((a, b) => { for (const [key, ascending] of order) { const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? '')); if (cmp) return ascending ? cmp : -cmp; } return 0; });
          rows = clone(rows.slice(start, end));
          return { data: one ? rows[0] || null : rows, error: null };
        }).then(onFulfilled, onRejected);
      },
    };
    return api;
  }
  const auth = new Proxy({
    getUser: async () => ({ data: { user: clone(user) }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  }, { get: (target, key) => key in target ? target[key] : async () => blocked() });
  window.supabase = { createClient: () => ({ from: query, auth, rpc: async () => blocked(), functions: { invoke: async () => blocked() } }) };
  const createApp = Vue.createApp;
  Vue.createApp = options => {
    // The real sign-in lifecycle is intentionally NOT exercised by this UI fixture.
    options.mounted = async function () {
      this.currentUser = clone(user);
      this.userProfileEmail = user.email;
      this.isLoggedIn = true;
      await this.loadAllData();
      this.bindAccessibleLabels();
      this.accessibleLabelObserver = new MutationObserver(() => this.bindAccessibleLabels());
      this.accessibleLabelObserver.observe(document.getElementById('app'), { childList: true, subtree: true });
      window.addEventListener('hashchange', this.handleHashChange);
      this.handleHashChange();
      const banner = document.createElement('aside');
      banner.id = 'preview-warning'; banner.setAttribute('role', 'note');
      banner.textContent = 'FICTIONAL PREVIEW · No emails, payments or live accounts · Changes reset on refresh · Use sample data only';
      banner.style.cssText = 'padding:10px 16px;background:#fef3c7;color:#78350f;font:600 13px/1.4 system-ui;text-align:center;position:relative;z-index:100';
      document.body.prepend(banner);
    };
    return createApp(options);
  };
})();
