(() => {
  'use strict';
  const app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  let state = params.get('state') || (location.pathname.startsWith('/owner') ? 'accepted' : 'pending');
  let invoiceOpen = false;
  let declineConfirm = false;
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const quote = {
    number: 'QUO-0217', customer: 'Sarah Jones', business: 'North & Stone', project: 'Bathroom refurbishment',
    validUntil: '25 September 2026', total: 6800,
    items: [['Preparation and plumbing', 3200], ['Fitting and finishing', 2400], ['Fixtures and materials', 1200]],
    acceptedAt: '11 September 2026 · 19:42 BST', invoice: 'INV-1048'
  };
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const wordmark = '<img src="/tallyo-wordmark-white.png" alt="Tallyo">';
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const node = document.createElement('div'); node.className = 'toast'; node.setAttribute('role', 'status'); node.textContent = message; document.body.append(node);
    setTimeout(() => node.remove(), 2600);
  }
  function scopeRows() { return quote.items.map(([name, amount]) => `<div class="scope-row"><span>${escapeHtml(name)}</span><strong>${money.format(amount)}</strong></div>`).join(''); }
  function acceptedContent() {
    return `<section class="success-card" aria-labelledby="accepted-title"><div class="success-icon" aria-hidden="true">✓</div><h2 id="accepted-title" tabindex="-1">Quote accepted</h2><p>Accepted by <strong>${escapeHtml(quote.customer)}</strong></p><p>${escapeHtml(quote.acceptedAt)}</p><p class="invoice-created">Invoice ${escapeHtml(quote.invoice)} has been created as a draft for ${money.format(quote.total)}.</p><div class="invoice-card"><div><span class="label">Linked invoice</span><strong>${escapeHtml(quote.invoice)}</strong></div><button id="view-invoice" type="button">View invoice</button></div><p>No payment has been taken and no invoice has been emailed.</p>${invoiceOpen ? `<section class="invoice-readonly" aria-label="Linked invoice preview"><h3>${escapeHtml(quote.invoice)}</h3><dl><div><dt>Status</dt><dd>Draft</dd></div><div><dt>Total</dt><dd>${money.format(quote.total)}</dd></div><div><dt>Balance</dt><dd>${money.format(quote.total)}</dd></div></dl></section>` : ''}</section>`;
  }
  function unavailableContent(kind) {
    const copy = {
      expired: ['This quote link has expired', 'Ask North & Stone for a new link if you still need to respond.'],
      revoked: ['This quote link is no longer available', 'Ask North & Stone for a new link if you still need to respond.'],
      changed: ['This quote has been updated', 'Ask North & Stone for a new link so you can review the latest version.'],
      missing: ['This quote is unavailable', 'Check the link or contact North & Stone.'],
    }[kind] || ['This quote is unavailable', 'Contact North & Stone for help.'];
    return `<section class="unavailable-card" role="status"><h2>${copy[0]}</h2><p>${copy[1]}</p></section>`;
  }
  function responseContent() {
    if (state === 'accepted') return acceptedContent();
    if (state === 'declined') return '<section class="unavailable-card" role="status"><h2>Quote declined</h2><p>North & Stone can see that you declined this quote. No invoice has been created.</p></section>';
    if (['expired','revoked','changed','missing'].includes(state)) return unavailableContent(state);
    if (declineConfirm) return '<section class="action-card" role="alertdialog" aria-labelledby="decline-title" aria-describedby="decline-copy"><h2 id="decline-title" tabindex="-1">Decline this quote?</h2><p id="decline-copy">North & Stone will see that you declined. No invoice will be created.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="secondary" style="margin-top:0" id="keep-quote" type="button">Keep quote</button><button class="secondary" style="margin-top:0;color:#b42318;border-color:#f1b8b4" id="confirm-decline" type="button">Confirm decline</button></div></section>';
    return `<section class="action-card" aria-labelledby="respond-title"><h2 id="respond-title">Respond to this quote</h2><p>By selecting Accept quote, you confirm that you approve this quote.</p><form id="accept-form" novalidate><label class="field-label" for="confirmed-name">Your name</label><input class="name-input" id="confirmed-name" name="confirmed-name" autocomplete="name" value="Sarah Jones" maxlength="100" aria-describedby="name-error"><div class="field-error" id="name-error" aria-live="polite"></div><button class="primary" type="submit">Accept quote</button><button class="secondary" id="decline" type="button">Decline quote</button></form></section>`;
  }
  function renderCustomer() {
    const status = state === 'accepted' ? 'Accepted' : state === 'declined' ? 'Declined' : 'Quote';
    app.innerHTML = `<div class="customer-shell"><main class="customer-page"><header class="business-head"><div class="business-mark" aria-hidden="true">N&amp;S</div><div><strong>${escapeHtml(quote.business)}</strong><span>Home renovation specialists</span></div></header><div class="quote-body"><span class="eyebrow">Quote ${escapeHtml(quote.number)}</span><div class="quote-title-row"><h1>${escapeHtml(quote.project)}</h1><span class="status-pill ${state === 'accepted' ? 'accepted' : state === 'declined' ? 'declined' : ''}">${status}</span></div><section class="prepared" aria-label="Quote parties"><div><span class="label">Prepared for</span><strong>${escapeHtml(quote.customer)}</strong></div><div><span class="label">Prepared by</span><strong>${escapeHtml(quote.business)}</strong></div></section><section class="project"><h2>Quote summary</h2><p>Supply and fit as agreed during the site visit.</p></section><section class="scope" aria-label="Quote items">${scopeRows()}</section><section class="total-box"><div><span class="label">Total</span><small>GBP</small></div><strong>${money.format(quote.total)}</strong></section><p class="validity">Valid until <strong>${escapeHtml(quote.validUntil)}</strong></p>${responseContent()}<div class="download-row"><button class="link-button" id="download" type="button">Download PDF</button></div><nav class="preview-links" aria-label="Preview states"><a href="/customer">Pending</a><a href="/customer?state=accepted">Accepted</a><a href="/customer?state=expired">Expired</a><a href="/customer?state=revoked">Revoked</a></nav></div><footer class="customer-footer"><span>Powered by</span>${wordmark}</footer></main></div>`;
    document.getElementById('accept-form')?.addEventListener('submit', event => {
      event.preventDefault(); const input = document.getElementById('confirmed-name'); const name = input.value.trim();
      if (name.length < 2) { document.getElementById('name-error').textContent = 'Enter your name before accepting.'; input.focus(); return; }
      quote.customer = name; state = 'accepted'; renderCustomer(); document.getElementById('accepted-title')?.focus?.();
    });
    document.getElementById('decline')?.addEventListener('click', () => { declineConfirm = true; renderCustomer(); document.getElementById('decline-title')?.focus(); });
    document.getElementById('keep-quote')?.addEventListener('click', () => { declineConfirm = false; renderCustomer(); document.getElementById('decline')?.focus(); });
    document.getElementById('confirm-decline')?.addEventListener('click', () => { state = 'declined'; declineConfirm = false; renderCustomer(); });
    document.getElementById('view-invoice')?.addEventListener('click', () => { invoiceOpen = true; renderCustomer(); document.querySelector('.invoice-readonly')?.scrollIntoView({ block: 'nearest' }); });
    document.getElementById('download')?.addEventListener('click', () => toast('Prototype only — the production PDF action is not connected.'));
  }
  function renderOwner() {
    app.innerHTML = `<div class="owner-shell"><header class="owner-topbar">${wordmark}<nav class="owner-nav" aria-label="Main navigation"><span>Overview</span><span class="active">Invoices</span><span>Customers</span><span>Automation</span><span>Settings</span></nav><button class="owner-new" type="button">+ New</button></header><main class="owner-main"><button class="back" type="button">← All invoices</button><div class="owner-heading"><div><span class="eyebrow">Accepted quote</span><h1>Quote ${escapeHtml(quote.number)}</h1><p>${escapeHtml(quote.customer)} · ${money.format(quote.total)}</p></div><div class="owner-actions"><button type="button">Download quote</button><button type="button">Send copy</button></div></div><div class="owner-grid"><div><section class="panel panel-pad"><h2>Quote summary</h2><div class="quote-summary"><div class="summary-cell"><span class="label">Customer</span><strong>${escapeHtml(quote.customer)}</strong></div><div class="summary-cell"><span class="label">Total</span><strong>${money.format(quote.total)}</strong></div><div class="summary-cell"><span class="label">Status</span><strong class="status-pill accepted">Accepted</strong></div></div></section><section class="panel panel-pad" style="margin-top:22px"><h2>Related documents</h2><div class="relation"><article class="document-chip"><span>Quote</span><strong>${escapeHtml(quote.number)}</strong><small>Accepted · preserved</small></article><div class="relation-arrow" aria-hidden="true">→</div><article class="document-chip"><span>Invoice</span><strong>${escapeHtml(quote.invoice)}</strong><small>Draft · automatically created</small><button class="view-invoice" type="button">View invoice</button></article></div><p class="owner-note">The quote is preserved exactly as accepted. Review the draft invoice’s due date and payment option before sending it.</p></section></div><aside><section class="panel panel-pad"><h2>Acceptance</h2><dl class="acceptance-list"><div><dt>Accepted by</dt><dd>${escapeHtml(quote.customer)}</dd></div><div><dt>Accepted</dt><dd>${escapeHtml(quote.acceptedAt)}</dd></div><div><dt>Invoice created</dt><dd>${escapeHtml(quote.invoice)}</dd></div></dl></section><section class="panel panel-pad" style="margin-top:22px"><h2>Activity history</h2><ol class="activity"><li><span class="dot"></span><span><strong>Quote created</strong><small>Saved in Tallyo</small></span><time>4 Sep · 10:12</time></li><li><span class="dot"></span><span><strong>Quote emailed</strong><small>Delivery accepted</small></span><time>4 Sep · 10:18</time></li><li><span class="dot"></span><span><strong>Quote viewed</strong><small>First customer view</small></span><time>11 Sep · 19:39</time></li><li><span class="dot"></span><span><strong>Quote accepted by ${escapeHtml(quote.customer)}</strong><small>Customer-confirmed name</small></span><time>11 Sep · 19:42</time></li><li><span class="dot"></span><span><strong>${escapeHtml(quote.invoice)} automatically created</strong><small>Draft invoice</small></span><time>11 Sep · 19:42</time></li></ol></section></aside></div></main></div>`;
  }
  if (location.pathname.startsWith('/owner')) renderOwner(); else renderCustomer();
})();
