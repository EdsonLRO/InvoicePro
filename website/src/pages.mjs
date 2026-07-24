import {
  faqs,
  featureGroups,
  helpArticles,
  industries,
  installationSteps,
  plans,
  productFacts,
  productScenes,
  publishedIndustrySlugs,
  workflowSteps
} from "./content.mjs";
import { finalCta, helpArticlePage, industryLandingPage, list, productDemo, workflow } from "./components.mjs";

const icon = (symbol) => `<span class="feature-icon" aria-hidden="true">${symbol}</span>`;
const industryHref = (industry) => publishedIndustrySlugs.includes(industry.slug) ? `/industries/${industry.slug}/` : "/features/";

const home = `
  <section class="hero" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="eyebrow">Straightforward invoicing for UK small businesses</p>
      <h1 id="home-title">${productFacts.positioning}</h1>
      <p class="hero-lead">${productFacts.supporting}</p>
      <div class="cta-row">
        <a class="button button-primary" id="cta_hero_create_account" data-analytics-placement="hero" data-signup-link href="#">Create account</a>
        <a class="button button-secondary" id="cta_hero_free_invoice" href="/free-invoice-generator/">Make a free invoice</a>
      </div>
      <ul class="trust-list" aria-label="Tallyo product highlights">
        <li>Stripe-hosted card payments</li>
        <li>Optional two-factor authentication</li>
        <li>Installable on supported devices</li>
      </ul>
    </div>
    <div class="product-frame" aria-label="Fictional Tallyo dashboard preview">
      <div class="frame-bar"><span></span><span></span><span></span><strong>Tallyo</strong></div>
      <div class="frame-body">
        <div class="mini-sidebar" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="mini-content">
          <p class="mini-kicker">Good morning, Northstar Home Services</p>
          <h2>Keep today’s invoices moving</h2>
          <div class="metric-grid">
            <article><span>Outstanding</span><strong>£2,460</strong><small>4 invoices</small></article>
            <article><span>Paid this month</span><strong>£4,820</strong><small>8 payments</small></article>
          </div>
          <div class="mini-table"><div><span>INV-DEMO-1042</span><b>Willow &amp; Pine Studio</b><em>Due</em></div><div><span>INV-DEMO-1041</span><b>Fictional client</b><em class="paid">Paid</em></div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="benefits-title">
    <div class="section-heading"><p class="eyebrow">From quote to paid</p><h2 id="benefits-title">The essentials, connected.</h2><p>Keep the customer, document, payment and follow-up in one place.</p></div>
    <div class="benefit-grid">
      <article>${icon("01")}<h3>Create with confidence</h3><p>Build branded quotes, invoices and credit notes that are clear for your customers.</p></article>
      <article>${icon("02")}<h3>Know what is due</h3><p>See paid, outstanding and overdue balances without rebuilding your records elsewhere.</p></article>
      <article>${icon("03")}<h3>Make repeat work easier</h3><p>Reuse customers and services, then automate recurring invoices when the schedule suits you.</p></article>
    </div>
  </section>

  <section class="section section-soft" aria-labelledby="how-title">
    <div class="section-heading"><p class="eyebrow">How it works</p><h2 id="how-title">A simple path through the work.</h2></div>
    ${workflow(workflowSteps)}
  </section>

  <section class="section" aria-labelledby="product-preview-title">
    <div class="section-heading"><p class="eyebrow">See the workflow</p><h2 id="product-preview-title">Familiar screens for the job in front of you.</h2><p>These simplified product views use fictional data and demonstrate supported Tallyo workflows.</p></div>
    <div class="product-tour-preview">${productScenes.slice(0, 3).map(productDemo).join("")}</div>
    <p class="section-link"><a href="/product-tour/">Explore the complete product tour →</a></p>
  </section>

  <section class="section" aria-labelledby="feature-preview-title">
    <div class="section-heading"><p class="eyebrow">Built around real invoicing work</p><h2 id="feature-preview-title">Useful tools without accounting-suite complexity.</h2></div>
    <div class="feature-grid">${featureGroups.map((group, index) => `<article class="feature-card">${icon(String(index + 1).padStart(2, "0"))}<p class="card-label">${group.label}</p><h3>${group.title}</h3><p>${group.description}</p>${list(group.items)}</article>`).join("")}</div>
    <p class="section-link"><a href="/features/">See all Tallyo features →</a></p>
  </section>

  <section class="section section-dark" aria-labelledby="security-preview-title">
    <div><p class="eyebrow">Account protection</p><h2 id="security-preview-title">Built with account and customer-data protection in mind.</h2><p>Tallyo uses confirmed accounts, optional authenticator-app MFA, database-enforced row-level access and server-side handling for sensitive email and payment work.</p><a class="text-link-light" href="/security/">Read how Tallyo approaches security →</a></div>
    <div class="security-points"><p><strong>Card entry stays with Stripe</strong><span>Customers enter card details on Stripe-hosted pages.</span></p><p><strong>Access is scoped per account</strong><span>Database rules restrict each signed-in account to its own workspace.</span></p><p><strong>Honest limitations</strong><span>Security controls reduce risk; they are not a guarantee or certification.</span></p></div>
  </section>

  <section class="section" id="industries" aria-labelledby="industry-title"><div class="section-heading"><p class="eyebrow">Made for independent work</p><h2 id="industry-title">A flexible fit for different small businesses.</h2><p>Each example uses the same supported invoicing tools; Tallyo does not claim specialist trade features.</p></div><div class="industry-grid">${industries.map((industry) => `<article><h3>${industry.name}</h3><p>${industry.summary}</p><a href="${industryHref(industry)}">See the useful workflow <span aria-hidden="true">→</span></a></article>`).join("")}</div></section>

  <section class="section section-soft split" id="install" aria-labelledby="install-title"><div><p class="eyebrow">Use Tallyo your way</p><h2 id="install-title">In the browser or installed for quick access.</h2><p>Use Tallyo on a supported phone, tablet or computer. An internet connection is required to access and update authenticated business records.</p><a class="button button-secondary" href="/help/install-tallyo/">See installation instructions</a></div><div class="device-stack" aria-hidden="true"><span class="device desktop"></span><span class="device tablet"></span><span class="device phone"></span></div></section>

  <section class="section" aria-labelledby="pricing-preview-title"><div class="section-heading"><p class="eyebrow">Pricing</p><h2 id="pricing-preview-title">Plans designed around how much you invoice.</h2><p>Plans, prices and limits are being finalised. No subscription checkout is available yet.</p></div><div class="pricing-preview"><strong>Free</strong><span>Getting started</span><strong>Essentials</strong><span>Regular invoicing</span><strong>Automate</strong><span>Recurring work</span></div><p class="section-link"><a href="/pricing/">See the current plan direction →</a></p></section>

  <section class="section section-soft" aria-labelledby="faq-preview-title"><div class="section-heading"><p class="eyebrow">Questions, answered</p><h2 id="faq-preview-title">Understand the product before you start.</h2><p>Read factual answers about installation, payments, refunds, recurring work, exports and account protection.</p></div><p class="section-link"><a href="/faq/">Browse frequently asked questions →</a></p></section>

  ${finalCta()}`;

const features = `
  <section class="page-hero"><p class="eyebrow">Features</p><h1>Everything you need to move from quote to paid.</h1><p>Tallyo keeps documents, customers, payments and recurring work together in one focused workspace.</p></section>
  <section class="section feature-detail-list" aria-label="Tallyo feature groups">${featureGroups.map((group, index) => `<article><div class="feature-number">${String(index + 1).padStart(2, "0")}</div><div><p class="card-label">${group.label}</p><h2>${group.title}</h2><p>${group.description}</p>${list(group.items)}</div></article>`).join("")}</section>
  <section class="section section-soft" aria-labelledby="workflow-title"><div class="section-heading"><p class="eyebrow">One connected outcome</p><h2 id="workflow-title">Customer → Quote → Invoice → Payment → Status → Follow-up</h2><p>Convert a quote when work is agreed, record or collect payment, then keep the status and activity with the document.</p></div><p class="section-link"><a href="/product-tour/">See each supported workflow →</a></p></section>
  <section class="section limitations" aria-labelledby="limitations-title"><div><p class="eyebrow">Clear boundaries</p><h2 id="limitations-title">Focused invoicing, not full accounting software.</h2></div>${list(productFacts.limitations)}</section>
  ${finalCta()}`;

const productTour = `
  <section class="page-hero"><p class="eyebrow">Product tour</p><h1>See how Tallyo connects everyday invoicing work.</h1><p>Every view below represents a supported workflow and uses only consistent fictional demonstration data.</p></section>
  <section class="section product-tour" aria-label="Tallyo product tour">${productScenes.map(productDemo).join("")}</section>
  <section class="section section-soft limitations" aria-labelledby="tour-boundaries"><div><p class="eyebrow">About these views</p><h2 id="tour-boundaries">Accurate workflow, simplified presentation.</h2></div>${list(["No real customer, business, payment or account data is shown.", "The illustrations simplify the live interface for a public product tour.", "Only currently supported Tallyo workflows are represented.", "Authenticated records still require an internet connection."])}</section>
  ${finalCta()}`;

const pricing = `
  <section class="page-hero"><p class="eyebrow">Pricing</p><h1>A clear plan direction, without made-up prices.</h1><p>Plans and pricing are being finalised. Tallyo is not offering subscriptions or trials through this website yet.</p></section>
  <section class="section"><div class="plan-grid">${plans.map((plan) => `<article class="plan-card${plan.name === "Teams" ? " unavailable" : ""}"><p class="card-label">${plan.audience}</p><h2>${plan.name}</h2><p class="plan-status">${plan.status}</p>${list(plan.features)}${plan.name === "Teams" ? '<span class="status-pill">Future direction</span>' : '<a class="button button-secondary" data-analytics-placement="pricing" data-signup-link href="#">Explore Tallyo</a>'}</article>`).join("")}</div></section>
  <section class="section section-soft" aria-labelledby="pricing-faq-title"><div class="section-heading"><p class="eyebrow">What happens next</p><h2 id="pricing-faq-title">Prices, limits and availability will be published only when approved.</h2><p>There is no pricing checkout on this site. Teams workspaces and multi-user access are not currently implemented.</p></div></section>
  ${finalCta({ secondary: false })}`;

const security = `
  <section class="page-hero"><p class="eyebrow">Security</p><h1>Practical controls, described honestly.</h1><p>Tallyo combines confirmed accounts, optional MFA, database access rules and server-side sensitive operations. No system can remove every risk, so this page explains both controls and limitations.</p></section>
  <section class="section"><div class="security-grid"><article><h2>Account access</h2><p>Email confirmation is required. Optional TOTP multi-factor authentication adds an authenticator-app code at sign-in.</p></article><article><h2>Workspace separation</h2><p>Supabase Row Level Security restricts database access so each signed-in account can access its own workspace records.</p></article><article><h2>Payment handling</h2><p>Card entry happens on Stripe-hosted checkout pages. Tallyo receives provider-confirmed payment updates and does not store full card details.</p></article><article><h2>Server-side secrets</h2><p>Private email, payment and service credentials stay in server-side provider environments rather than browser code.</p></article><article><h2>Browser protections</h2><p>The app uses a Content Security Policy, integrity-checked pinned libraries and a self-hosted stylesheet.</p></article><article><h2>Recovery and sessions</h2><p>Tallyo provides device and all-device sign-out controls, optional backup authenticators and one-time recovery-code support.</p></article></div></section>
  <section class="section section-dark" aria-labelledby="limits-security-title"><div><p class="eyebrow">What these controls do not mean</p><h2 id="limits-security-title">Security is an ongoing practice, not a badge.</h2></div><div>${list(["Tallyo does not claim to be fully secure or certified.", "Activity history is useful, but it is not a tamper-proof compliance audit log.", "Authenticated business records require an internet connection.", "Users remain responsible for protecting downloaded files and their devices."])}</div></section>
  <section class="section"><div class="section-heading"><p class="eyebrow">Account guide</p><h2>Set up protection in plain language.</h2><p>Follow the focused guide to authenticator-app MFA, recovery codes and the right sign-out choice.</p></div><p class="section-link"><a href="/help/account-security/">Read the account-security guide →</a></p></section>
  ${finalCta()}`;

const helper = `
  <section class="page-hero"><p class="eyebrow">Tallyo Helper</p><h1>General product guidance, without guessing.</h1><p>__TALLYO_HELPER_HERO_COPY__</p></section>
  <section class="section helper-intro" aria-labelledby="helper-boundary-title"><div><p class="eyebrow">What the helper can see</p><h2 id="helper-boundary-title">Public guidance only.</h2><p>Tallyo Helper provides general product guidance and cannot see your account or business records.</p></div>${list(["No sign-in or account access", "No invoice, customer or payment data", "No passwords, MFA codes or recovery codes", "No legal, tax or accounting advice"])}</section>
  <section class="section section-soft helper-shell" data-helper data-ai-enabled="__TALLYO_AI_HELPER_ENABLED__" aria-labelledby="helper-panel-title">
    <div class="helper-suggestion-panel"><p class="card-label">Suggested questions</p><h2 id="helper-panel-title">What would you like to know?</h2><div class="helper-suggestions" data-helper-suggestions></div></div>
    <div class="helper-conversation-panel">
      <div class="helper-toolbar"><div><p class="card-label">Conversation</p><p>__TALLYO_HELPER_MODE_NOTE__</p></div><button class="button button-secondary button-small" type="button" data-helper-reset>Clear conversation</button></div>
      <ol class="helper-conversation" data-helper-conversation aria-label="Tallyo Helper conversation" aria-live="polite" aria-relevant="additions"></ol>
      <form class="helper-form" data-helper-form>
        <label for="helper-question">Ask a general question about Tallyo</label>
        <div><input id="helper-question" data-helper-input name="question" type="text" maxlength="240" autocomplete="off" spellcheck="true" required><button class="button button-primary" type="submit">Ask Tallyo Helper</button></div>
        <p>Do not enter passwords, authenticator codes, recovery codes, card information, bank details, secrets or private business information.</p>
      </form>
      <p class="sr-only" data-helper-status role="status" aria-live="polite"></p>
    </div>
    <script type="application/json" id="helper-knowledge">__TALLYO_HELPER_KNOWLEDGE__</script>
  </section>
  <section class="section limitations" aria-labelledby="helper-limits-title"><div><p class="eyebrow">Clear limits</p><h2 id="helper-limits-title">A product guide, not an account assistant.</h2></div>${list(["The helper cannot authenticate, inspect or change an account.", "It never connects to Supabase, Stripe, Resend or private business records.", "__TALLYO_HELPER_PROVIDER_LIMIT__", "When reviewed knowledge does not answer a question, it says so and links to public help."])}</section>
  ${finalCta()}`;

const help = `
  <section class="page-hero"><p class="eyebrow">Help Centre</p><h1>Clear guidance for the work you want to finish.</h1><p>Use focused, step-by-step guides based on the current Tallyo product.</p></section>
  <section class="section"><div class="help-grid"><a class="helper-help-card" href="/helper/"><span>Ask</span><h2>Use Tallyo Helper</h2><p>Get deterministic answers from reviewed public product guidance, without account access.</p></a>${helpArticles.map((article, index) => `<a href="/help/${article.slug}/"><span>${String(index + 1).padStart(2, "0")}</span><h2>${article.title}</h2><p>${article.description}</p></a>`).join("")}</div></section>
  <section class="section section-soft" id="install" aria-labelledby="install-help-title"><div class="section-heading"><p class="eyebrow">Install Tallyo</p><h2 id="install-help-title">Keep Tallyo close on supported devices.</h2><p>Installation adds a convenient app icon. It does not make authenticated business records available offline.</p></div><div class="install-grid">${installationSteps.map(([name, step]) => `<article><h3>${name}</h3><p>${step}</p></article>`).join("")}</div><p class="section-link"><a href="/help/install-tallyo/">Open the complete installation guide →</a></p></section>
  ${finalCta()}`;

const faq = `
  <section class="page-hero"><p class="eyebrow">Frequently asked questions</p><h1>Direct answers about Tallyo.</h1><p>These answers describe the current product and avoid promises about unfinished plans, pricing or future features.</p></section>
  <section class="section faq-list" aria-label="Frequently asked questions">${faqs.map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("")}</section>
  ${finalCta()}`;

const about = `
  <section class="page-hero"><p class="eyebrow">About Tallyo</p><h1>Invoicing software shaped around everyday small-business work.</h1><p>Tallyo is built to make professional documents, payment follow-up and repeat invoicing feel more manageable for independent operators.</p></section>
  <section class="section split"><div><p class="eyebrow">Why Tallyo</p><h2>Small businesses need clarity, not another complicated system.</h2><p>Tallyo brings quotes, invoices, customers, payments and recurring work together while keeping the interface focused on the next useful action.</p></div><div class="principles"><p><strong>Straightforward</strong><span>Plain language and a focused workflow.</span></p><p><strong>Honest</strong><span>Real features and limitations, without invented proof.</span></p><p><strong>Protective</strong><span>Account and customer-data controls treated as product requirements.</span></p></div></section>
  <section class="section section-soft" aria-labelledby="audience-title"><div class="section-heading"><p class="eyebrow">Who it serves</p><h2 id="audience-title">Built broadly for UK small businesses.</h2><p>Freelancers, sole traders, consultants, tradespeople and independent service companies can adapt the same core workflow to their work.</p></div></section>
  ${finalCta()}`;

const generatorPage = (defaultType) => {
  const lowerType = defaultType.toLowerCase();
  return `
  <section class="page-hero generator-hero"><p class="eyebrow">Free ${defaultType} Maker</p><h1>Create a professional ${lowerType}, free.</h1><p>No account needed. While you work, this page keeps your document details and selected logo in your browser and does not send them to Tallyo, analytics or another service.</p></section>
  <section class="generator-shell" data-generator data-default-type="${defaultType}">
    <div class="generator-editor">
      <div class="privacy-note" role="note"><strong>Private by default</strong><span>Tallyo does not save this document automatically. Refreshing the page clears the document draft.</span></div>
      <form data-generator-form novalidate>
        <fieldset><legend>Document details</legend><div class="generator-fields generator-fields-three">
          <label>Document type<select name="documentType"><option>Invoice</option><option>Quote</option><option>Estimate</option></select></label>
          <label>Currency<select name="currency"><option value="GBP">GBP — British pound</option><option value="EUR">EUR — Euro</option><option value="USD">USD — US dollar</option></select></label>
          <label>Reference number<input name="reference" maxlength="40" value="0001" autocomplete="off"></label>
          <label>Issue date<input name="issueDate" type="date"></label>
          <label>Supply date<input name="supplyDate" type="date"><span>Use for invoices when it differs from the issue date.</span></label>
          <label>Due or valid-until date<input name="dueDate" type="date"></label>
        </div></fieldset>
        <fieldset><legend>Your business</legend><div class="generator-fields generator-fields-two">
          <label>Business or trading name<input name="senderName" maxlength="100" autocomplete="organization"></label>
          <label>Your name <span>(sole traders)</span><input name="senderLegalName" maxlength="100" autocomplete="name"></label>
          <label class="wide">Business address<textarea name="senderAddress" rows="3" maxlength="300" autocomplete="street-address"></textarea></label>
          <label>Email or phone<input name="senderContact" maxlength="120" autocomplete="email"></label>
          <label>VAT number <span>(if registered)</span><input name="vatNumber" maxlength="30" autocomplete="off"></label>
          <label class="wide logo-field">Logo <span>(optional, stays in this browser)</span><input name="logo" type="file" accept="image/png,image/jpeg,image/webp"><button class="text-button" type="button" data-remove-logo hidden>Remove logo</button></label>
        </div></fieldset>
        <fieldset><legend>Customer</legend><div class="generator-fields generator-fields-two">
          <label>Customer or company name<input name="customerName" maxlength="100" autocomplete="organization"></label>
          <label class="wide">Customer address<textarea name="customerAddress" rows="3" maxlength="300" autocomplete="street-address"></textarea></label>
        </div></fieldset>
        <fieldset><legend>Items</legend><div class="generator-item-list" data-items></div><button class="button button-secondary button-small" type="button" data-add-item>Add another item</button></fieldset>
        <fieldset><legend>Additional cost</legend><div class="generator-fields generator-fields-two">
          <label>Shipping or other cost<input name="additionalCost" type="number" min="0" max="1000000" step="0.01" value="0.00" inputmode="decimal"></label>
          <label>Tax on additional cost (%)<input name="additionalTaxRate" type="number" min="0" max="100" step="0.01" value="0" inputmode="decimal"></label>
        </div></fieldset>
        <fieldset><legend>Finishing details</legend><div class="generator-fields generator-fields-two">
          <label class="wide">Notes<textarea name="notes" rows="3" maxlength="500"></textarea></label>
          <label class="wide">Payment instructions<textarea name="paymentInstructions" rows="3" maxlength="500"></textarea></label>
        </div></fieldset>
        <div class="generator-actions"><button class="button button-primary" type="button" data-print>Print or save PDF</button><button class="button button-secondary" type="reset">Clear everything</button></div>
        <p class="generator-status" data-generator-status role="status" aria-live="polite"></p>
      </form>
      <aside class="generator-guidance" aria-labelledby="generator-guidance-title"><h2 id="generator-guidance-title">Before you send it</h2><p>Prices are treated as excluding tax. Tax is rounded to the nearest penny for each line after its discount. Check that the document suits your business and tax position.</p><p>VAT-registered businesses may need extra invoice information. This free maker does not produce the required sterling VAT totals for foreign-currency VAT invoices.</p><p><a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include">Read the current GOV.UK invoice requirements</a>. Tallyo does not provide tax, legal or accounting advice.</p></aside>
    </div>
    <div class="generator-preview-wrap"><p class="preview-label">Live preview</p><article class="generator-preview" data-preview aria-label="Document preview">
      <header><img data-preview-logo alt="Business logo" hidden><div><p data-preview-type>${defaultType}</p><h2 data-preview-reference>${defaultType} 0001</h2><p data-preview-dates></p></div></header>
      <div class="preview-parties"><section><h3>From</h3><p data-preview-sender></p></section><section><h3>To</h3><p data-preview-customer></p></section></div>
      <div class="preview-table-wrap"><table><caption class="sr-only">Items and calculated amounts</caption><thead><tr><th>Description</th><th>Qty / unit</th><th>Unit price</th><th>Discount</th><th>Tax</th><th>Net</th><th>Total</th></tr></thead><tbody data-preview-items></tbody></table></div>
      <dl class="preview-totals"><div><dt>Items before discount</dt><dd data-preview-subtotal></dd></div><div data-preview-discount-row><dt>Discount</dt><dd data-preview-discount></dd></div><div data-preview-additional-row><dt>Additional cost</dt><dd data-preview-additional></dd></div><div><dt>Net total</dt><dd data-preview-net></dd></div><div><dt>Tax</dt><dd data-preview-tax></dd></div><div class="grand-total"><dt>Total</dt><dd data-preview-total></dd></div></dl>
      <div class="preview-notes"><section data-preview-notes-section><h3>Notes</h3><p data-preview-notes></p></section><section data-preview-payment-section><h3>Payment instructions</h3><p data-preview-payment></p></section></div>
      <footer>Created with Tallyo</footer>
    </article></div>
  </section>
  <section class="section section-cta generator-conversion" data-generator-conversion hidden><div><p class="eyebrow">Need to do more?</p><h2>Keep customers, track payments and repeat less admin.</h2><p>Create a Tallyo account when you want saved customers and services, card payments, recurring invoices and reminders.</p></div><a class="button button-light" id="cta_generator_create_account" data-analytics-placement="generator" data-signup-link href="#">Create account</a></section>`;
};

const foundationPages = [
  { route: "/", output: "index.html", title: "Professional invoices. Faster payments. Less admin.", description: "Tallyo helps UK small businesses create professional invoices and quotes, accept card payments and automate recurring invoicing work.", content: home, schema: "software" },
  { route: "/features/", output: "features/index.html", title: "Invoicing features for small businesses", description: "Explore Tallyo features for invoices, quotes, card payments, recurring work, reminders, customers and business records.", content: features, schema: "webpage" },
  { route: "/product-tour/", output: "product-tour/index.html", title: "Tallyo product tour", description: "Tour supported Tallyo workflows for documents, customers, payments, recurring invoices, activity, branding and account protection.", content: productTour, schema: "webpage" },
  { route: "/pricing/", output: "pricing/index.html", title: "Tallyo plans and pricing", description: "See the current Tallyo plan direction. Exact prices, limits and availability are being finalised and no subscription checkout is active.", content: pricing, schema: "webpage" },
  { route: "/security/", output: "security/index.html", title: "How Tallyo protects account access", description: "Learn about Tallyo account, data-access, payment and browser security controls, with honest limitations.", content: security, schema: "webpage" },
  { route: "/helper/", output: "helper/index.html", title: "Tallyo Helper", description: "Ask Tallyo Helper for reviewed public guidance about current product features, payments, documents, installation and account protection.", content: helper, schema: "webpage", helper: true, scripts: ["/assets/helper.js"] },
  { route: "/help/", output: "help/index.html", title: "Tallyo Help Centre", description: "Find step-by-step guidance for Tallyo documents, payments, recurring work, account protection, delivery and installation.", content: help, schema: "webpage" },
  { route: "/faq/", output: "faq/index.html", title: "Tallyo frequently asked questions", description: "Answers about Tallyo invoices, quotes, recurring work, card payments, refunds, security, installation and internet access.", content: faq, schema: "faq" },
  { route: "/about/", output: "about/index.html", title: "About Tallyo", description: "Learn why Tallyo is building a straightforward invoicing and business-records workspace for UK small businesses.", content: about, schema: "webpage" },
  { route: "/free-invoice-generator/", output: "free-invoice-generator/index.html", title: "Free invoice maker — Tallyo", description: "Create and print a privacy-first, browser-local invoice for your UK small business without making an account.", content: generatorPage("Invoice"), schema: "webpage", scripts: ["/assets/generator.js"] },
  { route: "/free-quote-generator/", output: "free-quote-generator/index.html", title: "Free quote maker — Tallyo", description: "Create and print a privacy-first, browser-local quote for your UK small business without making an account.", content: generatorPage("Quote"), schema: "webpage", scripts: ["/assets/generator.js"] }
];

const helpPages = helpArticles.map((article) => ({
  route: `/help/${article.slug}/`,
  output: `help/${article.slug}/index.html`,
  title: article.title,
  description: article.description,
  content: helpArticlePage(article),
  schema: "howto",
  steps: article.steps,
  breadcrumbs: [{ name: "Home", path: "/" }, { name: "Help", path: "/help/" }, { name: article.title, path: `/help/${article.slug}/` }]
}));

const industryPages = industries.filter((industry) => publishedIndustrySlugs.includes(industry.slug)).map((industry) => ({
  route: `/industries/${industry.slug}/`,
  output: `industries/${industry.slug}/index.html`,
  title: `Invoicing software for ${industry.name.toLowerCase()}`,
  description: `${industry.summary} Explore supported Tallyo invoicing workflows for ${industry.name.toLowerCase()}.`,
  content: industryLandingPage(industry),
  schema: "webpage",
  breadcrumbs: [{ name: "Home", path: "/" }, { name: industry.name, path: `/industries/${industry.slug}/` }]
}));

export const pages = Object.freeze([...foundationPages, ...helpPages, ...industryPages]);

export const notFoundPage = Object.freeze({
  route: "/404/",
  output: "404.html",
  title: "Page not found",
  description: "The page you requested could not be found.",
  content: '<section class="page-hero"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>Use the main navigation or return to the Tallyo homepage.</p><p><a class="button button-primary" href="/">Return home</a></p></section>',
  schema: "webpage"
});

export { faqs, helpArticles, industries, productScenes };
