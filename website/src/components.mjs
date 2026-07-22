const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export const list = (items) => `<ul class="check-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

export const finalCta = ({ secondary = true } = {}) => `
  <section class="section section-cta" aria-labelledby="final-cta-title">
    <div>
      <p class="eyebrow">Ready when you are</p>
      <h2 id="final-cta-title">Bring your invoicing work into one clear workspace.</h2>
      <p>Create professional documents, track payments and spend less time repeating the same setup.</p>
    </div>
    <div class="cta-row">
      <a class="button button-light" id="cta_footer_create_account" data-analytics-placement="footer" data-signup-link href="#">Create account</a>
      ${secondary ? '<a class="button button-ghost-light" href="/features/">Explore features</a>' : ""}
    </div>
  </section>`;

export const breadcrumbs = (items) => `
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>${items.map((item, index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a>`}</li>`).join("")}</ol>
  </nav>`;

export const workflow = (steps) => `
  <ol class="steps workflow-steps">
    ${steps.map(([title, copy], index) => `<li id="step-${index + 1}"><span>${index + 1}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></div></li>`).join("")}
  </ol>`;

const demoContents = Object.freeze({
  dashboard: `<div class="demo-metrics"><p><span>Outstanding</span><strong>£2,460</strong><small>4 invoices</small></p><p><span>Paid this month</span><strong>£4,820</strong><small>8 payments</small></p></div><div class="demo-list"><p><b>INV-DEMO-1042</b><span>Willow &amp; Pine Studio</span><em>Due</em></p><p><b>INV-DEMO-1041</b><span>Fictional client</span><em class="is-paid">Paid</em></p></div>`,
  document: `<div class="demo-form"><p><span>Customer</span><strong>Willow &amp; Pine Studio</strong></p><p><span>Invoice number</span><strong>INV-DEMO-1042</strong></p><p class="wide"><span>Service</span><strong>Property maintenance visit</strong></p></div><div class="demo-total"><span>Total</span><strong>£240.00</strong></div>`,
  quote: `<div class="demo-document"><p class="demo-doc-type">Quote</p><h3>Willow &amp; Pine Studio</h3><p>Prepared by Northstar Home Services</p><div><span>Site preparation</span><strong>£180.00</strong></div><div><span>Finishing work</span><strong>£120.00</strong></div><footer><em>Accepted</em><span>Convert to invoice</span></footer></div>`,
  customers: `<div class="demo-search">Search customers and saved items</div><div class="demo-list"><p><b>Willow &amp; Pine Studio</b><span>2 documents</span><em>Customer</em></p><p><b>Property maintenance visit</b><span>£240.00</span><em class="is-neutral">Service</em></p><p><b>Site preparation</b><span>£180.00</span><em class="is-neutral">Service</em></p></div>`,
  recurring: `<div class="demo-schedule"><p><span>Schedule</span><strong>Monthly</strong></p><p><span>Next invoice</span><strong>1 August</strong></p><p><span>Email automatically</span><strong>On</strong></p></div><div class="demo-callout">Next run is ready for review</div>`,
  overdue: `<div class="demo-list"><p><b>INV-DEMO-1038</b><span>£320.00 · 8 days overdue</span><em class="is-overdue">Reminder on</em></p><p><b>INV-DEMO-1036</b><span>£145.00 · 3 days overdue</span><em class="is-neutral">Reminder off</em></p></div><div class="demo-callout">You choose which invoices receive reminders.</div>`,
  payments: `<div class="demo-balance"><span>Balance</span><strong>£0.00</strong><em>Paid</em></div><div class="demo-list"><p><b>£240.00</b><span>Stripe card payment confirmed</span><em class="is-paid">Confirmed</em></p><p><b>−£40.00</b><span>Partial refund confirmed</span><em class="is-neutral">Refund</em></p></div>`,
  activity: `<div class="demo-timeline"><p><i></i><span><strong>Invoice emailed</strong><small>Delivered · 09:42</small></span></p><p><i></i><span><strong>Card payment confirmed</strong><small>£240.00 · 10:18</small></span></p><p><i></i><span><strong>Invoice marked paid</strong><small>10:18</small></span></p></div>`,
  branding: `<div class="demo-brand"><div class="demo-logo">N</div><div><strong>Northstar Home Services</strong><span>Fictional demonstration business</span></div></div><div class="demo-swatches"><i></i><i></i><i></i></div><div class="demo-document-line"></div><div class="demo-document-line short"></div>`,
  security: `<div class="demo-security"><p><span>Authenticator app</span><strong>Enabled</strong></p><p><span>Recovery codes</span><strong>Stored safely</strong></p><p><span>Signed-in devices</span><strong>Review</strong></p></div><div class="demo-callout">Account protection can be managed at any time.</div>`,
  mobile: `<div class="demo-phone"><div class="demo-phone-bar">Tallyo <span>Menu</span></div><p class="card-label">Invoice</p><h3>INV-DEMO-1042</h3><div class="demo-balance"><span>Balance</span><strong>£240.00</strong><em>Due</em></div><button type="button" tabindex="-1">View invoice</button></div>`
});

export const productDemo = (scene, index) => `
  <figure class="product-demo product-demo-${escapeHtml(scene.variant)}${index % 2 ? " product-demo-reverse" : ""}" id="${escapeHtml(scene.id)}">
    <div class="demo-copy">
      <p class="card-label">${escapeHtml(scene.label)}</p>
      <h2>${escapeHtml(scene.title)}</h2>
      <p>${escapeHtml(scene.caption)}</p>
    </div>
    <div class="demo-window" role="img" aria-label="Fictional-data illustration of Tallyo ${escapeHtml(scene.label.toLowerCase())}">
      <div class="demo-window-bar"><i></i><i></i><i></i><strong>Tallyo</strong><span>Fictional demonstration</span></div>
      <div class="demo-window-body">${demoContents[scene.variant]}</div>
    </div>
    <figcaption>Illustrated product view using fictional data. The layout is simplified for this tour.</figcaption>
  </figure>`;

export const helpArticlePage = (article) => `
  ${breadcrumbs([{ label: "Home", href: "/" }, { label: "Help", href: "/help/" }, { label: article.title }])}
  <article class="article-shell">
    <header class="article-header"><p class="eyebrow">Tallyo guide</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.description)}</p></header>
    <div class="article-layout">
      <div>
        <h2>Step by step</h2>
        ${workflow(article.steps)}
      </div>
      <aside class="article-note" aria-labelledby="guide-note-${escapeHtml(article.slug)}"><p class="card-label">Good to know</p><h2 id="guide-note-${escapeHtml(article.slug)}">Keep this in mind</h2><p>${escapeHtml(article.note)}</p><a href="/faq/">Read common questions</a></aside>
    </div>
  </article>
  ${finalCta()}`;

export const industryLandingPage = (industry) => `
  ${breadcrumbs([{ label: "Home", href: "/" }, { label: "Industries", href: "/#industries" }, { label: industry.name }])}
  <section class="page-hero industry-hero"><p class="eyebrow">Tallyo for ${escapeHtml(industry.name)}</p><h1>Keep invoicing work clear from first document to payment.</h1><p>${escapeHtml(industry.summary)}</p><p><a class="button button-primary" data-analytics-placement="hero" data-signup-link href="#">Create account</a> <a class="button button-secondary" href="/product-tour/">See the product tour</a></p></section>
  <section class="section split" aria-labelledby="industry-focus-${escapeHtml(industry.slug)}"><div><p class="eyebrow">A focused workflow</p><h2 id="industry-focus-${escapeHtml(industry.slug)}">Useful invoicing tools for the way you work.</h2><p>Tallyo connects customers, documents, payment status and repeat work without claiming to replace specialist trade or accounting software.</p></div>${list(industry.focus)}</section>
  <section class="section section-soft" aria-labelledby="industry-outcome-${escapeHtml(industry.slug)}"><div class="section-heading"><p class="eyebrow">The connected outcome</p><h2 id="industry-outcome-${escapeHtml(industry.slug)}">Quote → Invoice → Payment → Follow-up</h2><p>Use the parts that fit your work: prepare a quote, convert agreed work, request payment and keep the result with the document.</p></div><p class="section-link"><a href="/features/">Explore every supported feature →</a></p></section>
  ${finalCta()}`;
