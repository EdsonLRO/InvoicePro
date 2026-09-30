(() => {
  'use strict';

  const app = document.getElementById('quote-app');
  const live = document.getElementById('quote-live');
  const enabled = window.TALLYO_QUOTE_ACCEPTANCE_ENABLED === true;
  const endpoint = `${String(window.SUPABASE_URL || '').replace(/\/+$/, '')}/functions/v1/quote-public`;
  const publishableKey = String(window.SUPABASE_ANON_KEY || '');
  const token = String(window.location.hash || '').slice(1);
  let current = null;
  let busy = false;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  };

  const add = (parent, ...children) => {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
  };

  const currency = (value, code = 'GBP') => {
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code || 'GBP' }).format(Number(value) || 0);
    } catch {
      return `${code || 'GBP'} ${(Number(value) || 0).toFixed(2)}`;
    }
  };

  const date = (value, includeTime = false) => {
    if (!value) return 'Not provided';
    const parsed = new Date(includeTime ? value : `${value}T12:00:00Z`);
    if (!Number.isFinite(parsed.getTime())) return 'Not provided';
    return new Intl.DateTimeFormat('en-GB', includeTime
      ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }
      : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
  };

  const announce = (message) => { live.textContent = message; };

  const button = (label, className, handler) => {
    const control = node('button', `button${className ? ` ${className}` : ''}`, label);
    control.type = 'button';
    control.addEventListener('click', handler);
    return control;
  };

  const setState = (title, message, retry = false) => {
    app.replaceChildren();
    app.setAttribute('aria-busy', 'false');
    const card = node('section', 'state-card');
    const heading = node('h1', '', title);
    heading.id = 'state-title';
    add(card, heading, node('p', '', message));
    if (retry) {
      const actions = node('div', 'actions');
      actions.style.justifyContent = 'center';
      actions.style.marginTop = '22px';
      add(actions, button('Try again', 'primary', () => load('view')));
      add(card, actions);
    }
    add(app, card);
    announce(`${title}. ${message}`);
  };

  const request = async (action, name) => {
    if (!enabled || !endpoint.startsWith('https://') || !publishableKey || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return { ok: false, status: 404, data: { state: 'unavailable' } };
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: publishableKey },
      body: JSON.stringify({ action, token, ...(name ? { name } : {}) }),
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    });
    let data = {};
    try { data = await response.json(); } catch { data = {}; }
    return { ok: response.ok, status: response.status, data };
  };

  const renderDocument = (payload, documentKey = 'quote') => {
    const documentData = payload[documentKey];
    const business = payload.business || {};
    const shell = node('article', 'quote-shell');
    const head = node('header', 'business-head');
    if (business.logoUrl) {
      const logo = node('img', 'business-logo');
      logo.src = business.logoUrl;
      logo.alt = `${business.name || 'Business'} logo`;
      logo.referrerPolicy = 'no-referrer';
      add(head, logo);
    } else {
      add(head, node('div', 'business-mark', String(business.name || 'B').slice(0, 1).toUpperCase()));
    }
    const businessCopy = node('div');
    add(businessCopy, node('h1', '', business.name || 'Tallyo business'));
    const contact = [business.email, business.phone].filter(Boolean).join(' · ');
    add(businessCopy, node('p', '', contact || 'Quote prepared for you'));
    add(head, businessCopy);

    const documentBody = node('section', 'document');
    const title = node('div', 'quote-title');
    const titleCopy = node('div');
    add(titleCopy, node('span', 'eyebrow', documentKey === 'invoice' ? 'Invoice created from accepted quote' : 'Quote'));
    add(titleCopy, node('h2', '', documentKey === 'invoice' ? `Invoice ${documentData.number}` : `Quote ${documentData.number}`));
    const status = node('span', `status ${String(payload.state || '').toLowerCase()}`, documentData.status || payload.state || 'Active');
    add(title, titleCopy, status);

    const customer = documentData.customer || {};
    const meta = node('div', 'meta-grid');
    [['Prepared for', customer.name || 'Customer'], [documentKey === 'invoice' ? 'Issued' : 'Issued', date(documentData.issueDate)], [documentKey === 'invoice' ? 'Due' : 'Valid until', date(documentKey === 'invoice' ? documentData.dueDate : documentData.validUntil)]].forEach(([label, value]) => {
      const cell = node('div'); add(cell, node('span', '', label), node('strong', '', value)); add(meta, cell);
    });

    const items = node('div', 'items');
    (Array.isArray(documentData.items) ? documentData.items : []).forEach((item) => {
      const row = node('div', 'item');
      const copy = node('div');
      add(copy, node('strong', '', item.name || 'Item'));
      const detail = [item.qty ? `${item.qty} ${item.unit || ''}`.trim() : '', Number(item.tax) ? `${item.tax}% tax` : ''].filter(Boolean).join(' · ');
      add(copy, node('small', '', detail));
      add(row, copy, node('strong', 'item-price', currency((Number(item.qty) || 0) * (Number(item.price) || 0), documentData.currency)));
      add(items, row);
    });

    const total = node('div', 'total');
    add(total, node('span', '', 'Total'), node('strong', '', currency(documentData.total, documentData.currency)));
    add(documentBody, title, meta, items, total);
    if (documentData.notes) add(documentBody, node('p', 'message', documentData.notes));
    add(shell, head, documentBody);
    return shell;
  };

  const submitResponse = async (action, name, errorNode) => {
    if (busy) return;
    busy = true;
    errorNode.textContent = '';
    app.querySelectorAll('button').forEach((control) => { control.disabled = true; });
    try {
      const result = await request(action, name);
      if (!result.ok) {
        if (result.data.state === 'invalid_name') errorNode.textContent = 'Enter your name using 2 to 100 characters.';
        else if (result.status === 429) errorNode.textContent = 'Please wait a moment before trying again.';
        else errorNode.textContent = result.data.message || 'We could not update this quote. Please try again.';
        return;
      }
      current = result.data;
      render(current);
      announce(action === 'accept' ? 'Quote accepted. Your invoice has been created.' : 'Quote declined.');
    } catch {
      errorNode.textContent = 'This quote is temporarily unavailable. Please check your connection and try again.';
    } finally {
      busy = false;
      app.querySelectorAll('button').forEach((control) => { control.disabled = false; });
    }
  };

  const render = (payload) => {
    app.replaceChildren();
    app.setAttribute('aria-busy', 'false');
    const shell = renderDocument(payload, 'quote');
    const panel = node('section', 'response-panel');

    if (payload.state === 'accepted') {
      const accepted = node('div', 'success-panel');
      add(accepted, node('h3', '', 'Quote accepted'));
      add(accepted, node('p', '', `Accepted by ${payload.acceptance?.confirmedName || 'customer'}`));
      add(accepted, node('p', '', date(payload.acceptance?.respondedAt, true)));
      add(accepted, node('p', '', 'No payment has been taken.'));
      if (payload.invoice) {
        const invoice = node('div', 'invoice-card');
        const copy = node('div');
        add(copy, node('strong', '', `Invoice ${payload.invoice.number} has been created`), node('small', '', currency(payload.invoice.total, payload.invoice.currency)));
        const view = button('View invoice', 'primary', async () => {
          const result = await request('invoice');
          if (result.ok) {
            app.replaceChildren(renderDocument(result.data, 'invoice'));
            app.appendChild(button('Back to accepted quote', '', () => render(current)));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
        add(invoice, copy, view); add(accepted, invoice);
      }
      add(panel, accepted);
    } else if (payload.state === 'declined') {
      add(panel, node('h3', '', 'Quote declined'), node('p', '', 'The business has been told that you declined this quote. No invoice or payment has been created.'));
    } else {
      add(panel, node('h3', '', 'Ready to approve?'), node('p', '', 'By selecting Accept quote, you confirm that you approve this quote.'));
      const label = node('label', 'field', 'Your name');
      const input = node('input'); input.type = 'text'; input.autocomplete = 'name'; input.maxLength = 100; input.required = true; input.placeholder = 'Enter your full name';
      add(label, input);
      const error = node('p', 'error'); error.setAttribute('role', 'alert');
      const actions = node('div', 'actions');
      add(actions, button('Accept quote', 'primary', () => submitResponse('accept', input.value.trim(), error)));
      add(actions, button('Decline quote', 'danger', () => {
        if (window.confirm('Decline this quote? The business will be told you declined it.')) submitResponse('decline', '', error);
      }));
      add(actions, button('Download PDF', '', () => window.print()));
      add(panel, label, error, actions, node('p', 'action-note', 'Accepting creates an invoice automatically. Downloading does not accept the quote.'));
    }
    add(shell, panel); add(app, shell);
  };

  const load = async (action) => {
    app.setAttribute('aria-busy', 'true');
    try {
      const result = await request(action);
      const state = result.data.state;
      if (result.ok && ['active', 'accepted', 'declined'].includes(state)) {
        current = result.data;
        render(current);
        return;
      }
      const messages = {
        expired: ['This quote link has expired', 'Ask the business that sent the quote for a new secure link.'],
        revoked: ['This quote link is no longer active', 'Ask the business that sent the quote if you still need access.'],
        changed: ['This quote has changed', 'Ask the business for a new link so you can review the latest version.'],
        unavailable: ['Quote not available', 'Check the link or ask the business that sent it for help.']
      };
      const copy = messages[state] || (result.status === 429
        ? ['Please wait a moment', 'Too many requests were made. Try again shortly.']
        : ['Quote temporarily unavailable', 'Check your connection and try again.']);
      setState(copy[0], copy[1], !['expired', 'revoked', 'changed', 'unavailable'].includes(state));
    } catch {
      setState('Quote temporarily unavailable', 'Check your connection and try again.', true);
    }
  };

  load('view');
})();
