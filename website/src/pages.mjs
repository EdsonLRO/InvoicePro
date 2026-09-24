import {
  faqs,
  featureGroups,
  helpArticles,
  productFacts,
  productScenes,
  workflowSteps
} from "./content.mjs";
import { finalCta, helpArticlePage, list, productDemo, workflow } from "./components.mjs";
import { commercialOffer, connectPaymentPlaceholders, pricingFaqs } from "./commercial-offer.mjs";
import { siteConfig } from "./config.mjs";
import { cookieNotice, dataProcessingTerms, privacyNotice } from "./legal-content.mjs";
import { serviceTerms } from "./service-terms-content.mjs";

const icon = (symbol) => `<span class="feature-icon" aria-hidden="true">${symbol}</span>`;
const subscriptionAvailability = siteConfig.subscriptionCheckoutEnabled
  ? "Choose monthly or annual billing after you create your Tallyo account."
  : "Subscriptions are being prepared and checkout is not active yet.";
const subscriptionCta = siteConfig.subscriptionCheckoutEnabled
  ? '<a class="button button-primary" id="cta_pricing_create_account" data-analytics-placement="pricing" data-signup-link data-subscription-link href="#">Choose Tallyo Pro</a>'
  : `<button class="button button-primary" type="button" disabled>${commercialOffer.pro.availability}</button>`;
const helperCardCopy = siteConfig.aiHelperEnabled
  ? "Ask questions in your own words and get answers grounded in reviewed public Tallyo guidance, without account access."
  : "Get answers from reviewed public product guidance, without account access.";
const pricingDescription = siteConfig.subscriptionCheckoutEnabled
  ? "Use the Free Invoice Maker without an account, or choose Tallyo Pro at £8 monthly or £80 annually."
  : "Use the Free Invoice Maker without an account, or see Tallyo Pro at £8 monthly or £80 annually. Subscription checkout is not active yet.";

const home = `
  <section class="hero home-hero" aria-labelledby="home-title" data-home-hero>
    <div class="hero-copy" data-hero-copy>
      <p class="hero-badge"><span aria-hidden="true"></span>Invoicing built around your business</p>
      <h1 id="home-title"><span>Professional invoices.</span><span class="hero-title-accent">Clearer payment tracking.</span><span>Less admin.</span></h1>
      <p class="hero-lead">Create, send and follow up from one calm workspace with quotes, repeat invoices, reminders and payment updates kept together.</p>
      <div class="cta-row">
        <a class="button button-primary hero-primary-action" id="cta_hero_create_account" data-analytics-placement="hero" data-signup-link href="#">Start with Tallyo <span aria-hidden="true">→</span></a>
        <a class="button button-secondary" id="cta_hero_free_invoice" href="/free-invoice-generator/">Make a free invoice</a>
      </div>
      <p class="hero-pricing"><strong>£8 monthly · £80 annually</strong><span>One business, one user. Cancel through your account.</span></p>
    </div>
    <div class="hero-visual" aria-label="Fictional Tallyo overview showing work that needs attention" data-product-stage>
      <div class="hero-orbit hero-orbit-one" aria-hidden="true"></div>
      <div class="hero-orbit hero-orbit-two" aria-hidden="true"></div>
      <div class="product-frame hero-product-frame">
        <div class="frame-bar"><span></span><span></span><span></span><strong>Overview</strong></div>
        <div class="frame-body">
          <aside class="mini-sidebar" aria-hidden="true">
            <b>T</b><i class="active"></i><i></i><i></i><i></i><i></i>
          </aside>
          <div class="mini-content">
            <div class="mini-heading-row"><div><p class="mini-kicker">Good morning, Northstar Home Services</p><h2>What needs your attention</h2></div><span class="mini-new">+ New</span></div>
            <div class="metric-grid">
              <article><span>Outstanding</span><strong>£2,460</strong><small>4 invoices</small></article>
              <article class="metric-overdue"><span>Overdue</span><strong>£840</strong><small>2 invoices</small></article>
              <article><span>Paid this month</span><strong>£4,820</strong><small>8 payments</small></article>
            </div>
            <div class="attention-panel">
              <div class="attention-heading"><strong>Needs your attention</strong><span>2 items</span></div>
              <div class="attention-row"><span class="attention-icon">!</span><p><b>INV-1042 · Willow &amp; Pine Studio</b><small>£320 outstanding · 8 days overdue</small></p><button type="button" tabindex="-1">Send reminder</button></div>
              <div class="attention-row"><span class="attention-icon attention-icon-calendar">↻</span><p><b>Recurring invoice due tomorrow</b><small>Monthly maintenance · £240</small></p><button type="button" tabindex="-1">Review</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-event-card hero-event-accepted" data-float-depth="0.75"><span aria-hidden="true">✓</span><p><strong>Quote accepted</strong><small>Invoice INV-1048 is ready</small></p></div>
      <div class="hero-event-card hero-event-paid" data-float-depth="-0.55"><span aria-hidden="true">£</span><p><strong>Payment received</strong><small>£560.00 · just now</small></p></div>
    </div>
  </section>

  <section class="home-capability-strip" aria-label="Tallyo workflow highlights">
    <div class="capability-marquee">
      <div class="capability-marquee-group"><p><span>01</span> Accepted quotes become invoices</p><p><span>02</span> Regular invoices created on schedule</p><p><span>03</span> Deposits and payments recorded</p><p><span>04</span> Reminders you choose to send</p></div>
      <div class="capability-marquee-group" aria-hidden="true"><p><span>01</span> Accepted quotes become invoices</p><p><span>02</span> Regular invoices created on schedule</p><p><span>03</span> Deposits and payments recorded</p><p><span>04</span> Reminders you choose to send</p></div>
    </div>
  </section>

  <section class="section home-benefits" aria-labelledby="benefits-title">
    <div class="section-heading"><p class="eyebrow">From quote to payment</p><h2 id="benefits-title">See the whole invoicing journey.</h2><p>Keep the customer, document, payments and reminders in one place.</p></div>
    <div class="benefit-grid">
      <article>${icon("01")}<h3>Create with confidence</h3><p>Build branded quotes, invoices and credit notes that are clear for your customers.</p></article>
      <article>${icon("02")}<h3>Know what is still to pay</h3><p>Record deposits, part-payments and final payments, then see which invoices are late.</p></article>
      <article>${icon("03")}<h3>Make regular work easier</h3><p>Reuse customers and services, then let Tallyo create new invoices on the schedule you choose.</p></article>
    </div>
  </section>

  <section class="section section-soft home-how" aria-labelledby="how-title">
    <div class="section-heading"><p class="eyebrow">How it works</p><h2 id="how-title">A simple path through the work.</h2></div>
    ${workflow(workflowSteps)}
  </section>

  <section class="section home-decision-panel" aria-labelledby="home-decision-title">
    <div><p class="eyebrow">A clear next step</p><h2 id="home-decision-title">Try one document free, or keep the whole workflow together.</h2><p>The Free Invoice Maker works without an account. Tallyo Pro saves customers, products and services, documents, payment records and repeat work.</p></div>
    <div class="home-decision-actions"><p><strong>${commercialOffer.free.price}</strong><span>Free Invoice Maker</span><a href="/free-invoice-generator/">Create an invoice</a></p><p><strong>${commercialOffer.pro.monthlyPrice}</strong><span>per month · ${commercialOffer.pro.annualPrice} annually</span><a href="/pricing/">Compare plans</a></p></div>
    <p class="home-decision-trust"><a href="/invoice-guide/">Read the simple invoice guide</a><span aria-hidden="true">·</span><a href="/product-tour/">See the product in use</a></p>
  </section>

  <section class="section section-soft faq-preview" aria-labelledby="faq-preview-title"><div class="section-heading"><p class="eyebrow">Before you start</p><h2 id="faq-preview-title">Three useful answers.</h2></div><div class="faq-list home-faq-list">${faqs.slice(0, 3).map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("")}</div><p class="section-link"><a href="/faq/">Read all product questions →</a></p></section>

  ${finalCta({ title: "Ready to make invoicing feel more manageable?", copy: "Start with the free maker or create a Tallyo account when you want your work saved and connected.", secondaryLabel: "Make a free invoice", secondaryHref: "/free-invoice-generator/" })}`;

const productTourChapters = Object.freeze([
  { id: "overview", label: "Overview", title: "Know what needs attention", copy: "Start with money still to come in, invoices that are late and the next useful action.", scenes: ["dashboard"] },
  { id: "create", label: "Create & send", title: "Move from customer details to a clear document", copy: "Reuse customers and services, prepare an invoice or quote, then review it before sending.", scenes: ["invoice-editor", "quote", "customers"] },
  { id: "automate", label: "Repeat & remind", title: "Create regular invoices and chosen reminders", copy: "Set when Tallyo creates each new invoice, choose whether it emails automatically and turn reminders on only for the overdue invoices you want followed up.", scenes: ["recurring", "overdue"] },
  { id: "track", label: "Payments & history", title: "See what has been paid and what happened", copy: "Record deposits, part-payments and final payments, see what is left, and read the document history in one place.", scenes: ["payments", "activity"] },
  { id: "personalise", label: "Personalise & access", title: "Present your business and protect access", copy: "Apply your branding, manage account protection and use core workflows on a supported phone.", scenes: ["branding", "security", "mobile"] }
]);

const productTourChapter = (chapter, chapterIndex) => {
  const scenes = chapter.scenes.map((sceneId) => productScenes.find((scene) => scene.id === sceneId)).filter(Boolean);
  return `<section class="tour-chapter" id="tour-${chapter.id}" role="tabpanel" tabindex="0" aria-labelledby="tour-tab-${chapter.id}" data-tour-panel${chapterIndex ? " hidden" : ""}>
    <header><p class="card-label">${String(chapterIndex + 1).padStart(2, "0")} · ${chapter.label}</p><h2>${chapter.title}</h2><p>${chapter.copy}</p></header>
    <div class="tour-chapter-scenes">${scenes.map((scene, index) => productDemo(scene, index)).join("")}</div>
  </section>`;
};

const connectedOutcomeSteps = Object.freeze([
  ["01", "Send the quote", "Email the quote with a secure link so the customer can review the work, price and next step."],
  ["02", "Quote accepted", "The customer enters their name and accepts the quote. Tallyo records who accepted it and when."],
  ["03", "Invoice created", "Tallyo keeps the accepted quote and creates one linked invoice. If you chose automatic sending before emailing the quote, it sends the invoice too; otherwise the invoice stays ready for your review."],
  ["04", "Payment tracked", "Record a deposit, part-payment or final payment on the invoice and see the amount still left to pay."],
  ["05", "Follow-up stays clear", "See when the invoice was sent, when reminders went out and when payments were recorded in one activity history."]
]);

const features = `
  <section class="page-hero feature-hero">
    <div class="feature-hero-copy"><p class="eyebrow">Features</p><h1>Create invoices, follow payments and reduce repeat work.</h1><p>Tallyo keeps quotes, invoices, customers, payments and regular invoicing together, so you can see what to do next.</p><div class="cta-row"><a class="button button-primary" href="/product-tour/">Explore the product tour</a><a class="button button-secondary" href="/free-invoice-generator/">Make a free invoice</a></div></div>
    <div class="feature-hero-summary" aria-label="Tallyo workflow summary"><p><span>01</span><strong>Create</strong><small>Quotes, invoices and credit notes</small></p><p><span>02</span><strong>Follow</strong><small>Sends, reminders, deposits and payments</small></p><p><span>03</span><strong>Repeat</strong><small>Regular invoices on your chosen schedule</small></p></div>
  </section>
  <section class="section feature-detail-list" aria-label="Tallyo feature groups">${featureGroups.map((group, index) => `<article id="feature-${index + 1}"><div class="feature-number">${String(index + 1).padStart(2, "0")}</div><div><p class="card-label">${group.label}</p><h2>${group.title}</h2><p>${group.description}</p>${list(group.items)}</div></article>`).join("")}</section>
  <section class="section workflow-outcome" aria-labelledby="workflow-title" data-horizontal-flow>
    <div class="workflow-outcome-sticky">
      <div class="section-heading"><p class="eyebrow">From quote to payment</p><h2 id="workflow-title">See what happens at every step.</h2><p>Keep scrolling to follow a quote from sending and customer acceptance through to the invoice, payments and follow-up.</p></div>
      <div class="workflow-outcome-viewport" data-horizontal-viewport><div class="workflow-outcome-track" data-horizontal-track>${connectedOutcomeSteps.map(([number, title, copy]) => `<article class="workflow-outcome-step"><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div>
      <div class="workflow-outcome-progress" aria-hidden="true"><span data-horizontal-progress></span></div>
      <p class="section-link"><a href="/product-tour/">See each supported workflow →</a></p>
    </div>
  </section>
  <section class="section limitations" aria-labelledby="limitations-title"><div><p class="eyebrow">Clear boundaries</p><h2 id="limitations-title">Focused invoicing, not full accounting software.</h2></div>${list(productFacts.limitations)}</section>
  ${finalCta({ title: "See how the work fits together.", copy: "Tour the main workflows, then decide whether Tallyo suits the way you invoice.", secondaryLabel: "Open the product tour", secondaryHref: "/product-tour/" })}`;

const productTour = `
  <section class="page-hero tour-hero"><p class="eyebrow">Product tour</p><h1>See how Tallyo connects everyday invoicing work.</h1><p>Choose a workflow to explore. Every screen uses fictional demonstration data and shows currently supported Tallyo features.</p></section>
  <div class="tour-explorer" data-tour-chapters>
    <div class="tour-index" role="tablist" aria-label="Choose a product workflow">${productTourChapters.map((chapter, index) => `<button id="tour-tab-${chapter.id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="tour-${chapter.id}" tabindex="${index === 0 ? "0" : "-1"}" data-tour-tab="${chapter.id}">${chapter.label}</button>`).join("")}</div>
    <p class="tour-demo-note"><strong>Safe demonstration:</strong> no real customer, business, payment or account data is shown.</p>
    <div class="product-tour">${productTourChapters.map(productTourChapter).join("")}</div>
  </div>
  ${finalCta({ title: "Want to try the document experience?", copy: "Create a free invoice in your browser, with no account required.", secondaryLabel: "Explore all features", secondaryHref: "/features/" })}`;

const pricing = `
  <section class="page-hero"><p class="eyebrow">Simple pricing</p><h1>One free maker. One complete invoicing workspace.</h1><p>Use the browser-only Free Invoice Maker without an account, or choose Tallyo Pro for saved invoicing work. ${subscriptionAvailability}</p></section>
  <section class="section"><div class="plan-grid plan-grid-two">
    <article class="plan-card"><p class="card-label">${commercialOffer.free.audience}</p><h2>${commercialOffer.free.name}</h2><p class="plan-price">${commercialOffer.free.price}</p><p>${commercialOffer.free.privacy}</p>${list(commercialOffer.free.features)}<a class="button button-secondary" href="/free-invoice-generator/">Make a free invoice</a><h3>Not included</h3>${list(commercialOffer.free.exclusions)}</article>
    <article class="plan-card plan-card-featured"><p class="card-label">${commercialOffer.pro.audience}</p><h2>${commercialOffer.pro.name}</h2><p class="plan-price">${commercialOffer.pro.monthlyPrice}<span> per month</span></p><p class="plan-annual">or ${commercialOffer.pro.annualPrice} per year · ${commercialOffer.pro.annualEquivalent}. ${commercialOffer.pro.annualSaving}</p>${list(commercialOffer.pro.features)}${subscriptionCta}<p class="plan-note">By choosing Tallyo Pro, you agree to the <a href="/terms/">Terms of Service</a>. ${commercialOffer.pro.reasonableUse}</p></article>
  </div></section>
  <section class="section section-soft pricing-boundaries" aria-labelledby="pricing-boundaries-title"><div><p class="eyebrow">Before you choose</p><h2 id="pricing-boundaries-title">Straightforward billing, with clear limits.</h2></div>${list([commercialOffer.billing.setupFee, commercialOffer.billing.sameFeatures, commercialOffer.billing.noTrial, commercialOffer.billing.cancellation, commercialOffer.billing.annualRefund, commercialOffer.paymentAvailability])}</section>
  <section class="section faq-list" aria-labelledby="pricing-faq-title"><div class="section-heading"><p class="eyebrow">Pricing questions</p><h2 id="pricing-faq-title">What to expect.</h2></div>${pricingFaqs.map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("")}</section>
  ${finalCta({ title: "Choose the route that fits today.", copy: "Make one document free, or create an account for saved and connected invoicing work.", secondary: false })}`;

const security = `
  <section class="page-hero"><p class="eyebrow">Security</p><h1>Practical account protection, explained clearly.</h1><p>Tallyo confirms account email addresses, offers optional two-step sign-in and keeps sensitive operations on the server. No system can remove every risk, so this page explains both the protection and its limits.</p></section>
  <section class="section"><div class="security-grid security-grid-three"><article><p class="card-label">Your sign-in</p><h2>Add another sign-in check</h2><p>Confirm your email, then optionally use an authenticator app for two-step sign-in. One-time recovery codes and device sign-out controls help if access changes.</p></article><article><p class="card-label">Your account records</p><h2>Keep each account separate</h2><p>Database rules limit a signed-in account to its own records. Private email, payment and service credentials stay on the server.</p></article><article><p class="card-label">Your documents</p><h2>Protect files you download</h2><p>Tallyo reduces common browser risks, but you still need to protect downloaded PDFs, exports and the devices where you use them.</p></article></div></section>
  <section class="section section-dark security-boundary" aria-labelledby="limits-security-title"><div><p class="eyebrow">Clear boundary</p><h2 id="limits-security-title">Controls reduce risk; they do not remove it.</h2><p>Tallyo does not claim certification or complete security. Activity history supports everyday follow-up but is not a tamper-proof compliance audit log.</p></div><a class="button button-ghost-light" href="/help/account-security/">Set up account protection</a></section>
  ${finalCta({ title: "Review the product before creating an account.", copy: "See the real Tallyo workflows and decide whether the workspace suits your business.", secondaryLabel: "View the product tour", secondaryHref: "/product-tour/" })}`;

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
        <p>Do not enter passwords, authenticator codes, recovery codes, card information, bank details, secrets or private business information. Read the <a href="/privacy/">Privacy Notice</a>.</p>
      </form>
      <p class="sr-only" data-helper-status role="status" aria-live="polite"></p>
    </div>
  </section>
  <section class="section limitations" aria-labelledby="helper-limits-title"><div><p class="eyebrow">Clear limits</p><h2 id="helper-limits-title">A product guide, not an account assistant.</h2></div>${list(["The helper cannot authenticate, inspect or change an account.", "It never connects to Supabase, Stripe, Resend or private business records.", "__TALLYO_HELPER_PROVIDER_LIMIT__", "When reviewed knowledge does not answer a question, it says so and links to public help."])}</section>
  <section class="section article-next" aria-label="More help"><a href="/help/">Browse the Help Centre</a><a href="mailto:main@tallyo.co.uk">Contact support</a></section>`;

const help = `
  <section class="page-hero"><p class="eyebrow">Help Centre</p><h1>Clear guidance for the work you want to finish.</h1><p>Use focused, step-by-step guides based on the current Tallyo product.</p></section>
  <section class="section section-soft help-start" aria-labelledby="help-start-title"><div><p class="eyebrow">New to invoicing?</p><h2 id="help-start-title">Start with the essentials.</h2><p>Learn what an invoice does, what to include, and how quotes, regular invoices, reminders and payments fit together.</p></div><a class="button button-secondary" href="/invoice-guide/">Read the invoice guide</a></section>
  <section class="section"><div class="help-grid"><a class="helper-help-card" href="/helper/"><span>Ask</span><h2>Use Tallyo Helper</h2><p>${helperCardCopy}</p></a>${helpArticles.map((article, index) => `<a href="/help/${article.slug}/"><span>${String(index + 1).padStart(2, "0")}</span><h2>${article.title}</h2><p>${article.description}</p></a>`).join("")}</div></section>
  <section class="section support-contact" aria-labelledby="support-contact-title"><div class="section-heading"><p class="eyebrow">Contact support</p><h2 id="support-contact-title">Need help from a person?</h2><p>Email <a href="mailto:main@tallyo.co.uk">main@tallyo.co.uk</a> with a clear description of the problem. Never send your password, authenticator code, recovery codes, card details or bank details.</p></div></section>
  `;

const faq = `
  <section class="page-hero"><p class="eyebrow">Frequently asked questions</p><h1>Decide whether Tallyo is right for your business.</h1><p>For step-by-step instructions, use the <a href="/help/">Help Centre</a>. These answers focus on the product, access and what Tallyo is designed to do.</p></section>
  <section class="section faq-list" aria-label="Frequently asked questions">${faqs.map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("")}</section>
  <section class="section article-next" aria-label="Next steps"><a href="/pricing/">Compare pricing</a><a href="/help/">Open the Help Centre</a></section>`;

const about = `
  <section class="page-hero"><p class="eyebrow">About Tallyo</p><h1>Invoicing software shaped around your everyday work.</h1><p>Tallyo makes it easier to create professional documents, see what has been paid and handle regular invoices without repeating the same setup.</p></section>
  <section class="section split"><div><p class="eyebrow">Why Tallyo</p><h2>Your business needs clarity, not another complicated system.</h2><p>Tallyo brings quotes, invoices, customers, payments and recurring work together while keeping the interface focused on the next useful action.</p></div><div class="principles"><p><strong>Straightforward</strong><span>Plain language and a focused workflow.</span></p><p><strong>Honest</strong><span>Real features and limitations, without invented proof.</span></p><p><strong>Protective</strong><span>Account and customer-data controls treated as product requirements.</span></p></div></section>
  <section class="section section-soft" aria-labelledby="audience-title"><div class="section-heading"><p class="eyebrow">Who it serves</p><h2 id="audience-title">Built to fit your business.</h2><p>Freelancers, sole traders, consultants, tradespeople and service companies can adapt the same core workflow to their work.</p></div></section>
  ${finalCta({ title: "See whether Tallyo fits your day-to-day work.", copy: "Explore the real workflows or create one invoice free before opening an account.", secondaryLabel: "Make a free invoice", secondaryHref: "/free-invoice-generator/" })}`;

const invoiceGuide = `
  <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Invoice guide</li></ol></nav>
  <section class="page-hero invoice-guide-hero"><div><p class="eyebrow">A simple invoice guide</p><h1>What is an invoice, and how does it work?</h1><p>An invoice is a document that tells a customer what they bought, how much they owe, how to pay and when payment is due.</p></div><aside aria-label="Invoice at a glance"><p class="card-label">At a glance</p><p><strong>What</strong><span>The work, product or service supplied</span></p><p><strong>How much</strong><span>The total and any tax or discount</span></p><p><strong>When</strong><span>The issue date and payment due date</span></p><p><strong>How to pay</strong><span>Your payment instructions</span></p></aside></section>

  <section class="section section-soft" aria-labelledby="invoice-journey-title">
    <div class="section-heading"><p class="eyebrow">The basic journey</p><h2 id="invoice-journey-title">From agreed work to recorded payment.</h2><p>You may not need every step, but this is the usual flow for a small service business.</p></div>
    <div class="benefit-grid invoice-journey-grid">
      <article>${icon("01")}<h3>Agree the work</h3><p>Use a quote when the customer should approve the work and price before you invoice them.</p></article>
      <article>${icon("02")}<h3>Send the invoice</h3><p>List what you supplied, the price, important dates and clear payment instructions.</p></article>
      <article>${icon("03")}<h3>Record what arrives</h3><p>Add a deposit, part-payment or final payment so the amount still left is always clear.</p></article>
      <article>${icon("04")}<h3>Follow up if needed</h3><p>If the due date passes and money is still owed, the invoice is overdue. Send a reminder when appropriate.</p></article>
    </div>
  </section>

  <section class="section invoice-tool-guide" aria-labelledby="invoice-tools-title">
    <div class="section-heading"><p class="eyebrow">Tallyo tools in plain English</p><h2 id="invoice-tools-title">Use only what your work needs.</h2></div>
    <div class="invoice-tool-grid">
      <article><h3>Quotes</h3><p>Share the proposed work and price before the customer agrees. When they accept, Tallyo keeps the quote and creates one linked invoice.</p></article>
      <article><h3>Invoices</h3><p>Ask for payment with a clear record of the customer, items, amount, dates and how to pay.</p></article>
      <article><h3>Recurring invoices</h3><p>Tell Tallyo when to create the next invoice for regular work. Choose whether each one is emailed automatically or left for review.</p></article>
      <article><h3>Overdue reminders</h3><p>Choose which late invoices receive reminders. Passing the due date alone does not make Tallyo send one.</p></article>
      <article><h3>Deposits and part-payments</h3><p>Record money as it arrives. Tallyo updates the paid amount and shows what the customer still owes.</p></article>
      <article><h3>Activity history</h3><p>See when the document was created or sent, when reminders went out and when payments were recorded.</p></article>
    </div>
  </section>

  <section class="section split invoice-checklist" aria-labelledby="invoice-details-title">
    <div><p class="eyebrow">Before you send</p><h2 id="invoice-details-title">Include the details your customer needs.</h2><p>A clear invoice normally includes a unique invoice number, your business and customer details, the issue and due dates, a description of the work, the amounts and tax where relevant, and instructions for paying.</p></div>
    <div><p>Requirements can vary, especially for VAT-registered businesses. Check the <a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include">current GOV.UK invoice requirements</a> before relying on a template.</p><p>Tallyo provides invoicing tools, not legal, tax or accounting advice.</p></div>
  </section>

  ${finalCta({ title: "Ready to create a clear invoice?", copy: "Make one free in your browser, or explore how Tallyo keeps invoices, payments and reminders together.", secondaryLabel: "See the product tour", secondaryHref: "/product-tour/" })}`;

const marketingOverviewForm = siteConfig.marketingOverviewEnabled ? `
  <form class="generator-overview-form" data-overview-form novalidate>
    <p><strong>Not ready to sign up?</strong> Get one email introducing Tallyo's invoicing features.</p>
    <label>Email address <span>(optional)</span><input name="overviewEmail" type="email" maxlength="254" autocomplete="email" inputmode="email" data-overview-email></label>
    <label class="generator-consent"><input name="overviewConsent" type="checkbox" data-overview-consent><span>Yes, Tallyo may send me one promotional email about its invoicing features. This does not create an account or subscription.</span></label>
    <button class="button button-secondary" type="submit" data-overview-submit>Send me the overview</button>
    <p class="generator-overview-status" role="status" aria-live="polite" data-overview-status></p>
    <p class="generator-overview-privacy">Tallyo uses this address only for the one email you request. Read the <a href="/privacy/">Privacy Notice</a>.</p>
  </form>` : "";

const invoiceConversionDialog = `
  <dialog class="generator-conversion-dialog" data-generator-conversion data-overview-endpoint="__TALLYO_MARKETING_OVERVIEW_ENDPOINT__" aria-labelledby="generator-conversion-title">
    <button class="generator-dialog-close" type="button" data-conversion-dismiss aria-label="Close and continue download">&times;</button>
    <div class="generator-conversion-heading">
      <p class="eyebrow">Your invoice is ready</p>
      <h2 id="generator-conversion-title">Save time on the next one with Tallyo Pro.</h2>
      <p>Keep invoicing work together without blocking this free PDF.</p>
    </div>
    <ul class="generator-conversion-features">
      <li>Saved customers and items</li>
      <li>Recurring invoices</li>
      <li>Reminders for overdue invoices you choose</li>
      <li>Deposits, part-payments and final payments</li>
      <li>Online payments through your connected Stripe account</li>
    </ul>
    <p class="generator-conversion-price"><strong>&pound;8 monthly</strong><span>or &pound;80 annually</span></p>
    <a class="button button-primary" id="cta_generator_create_account" data-analytics-placement="generator" data-conversion-register data-signup-link href="#" target="_blank" rel="noopener">Create a free Tallyo account</a>
    ${marketingOverviewForm}
    <div class="generator-conversion-download">
      <button class="button button-secondary" type="button" data-conversion-continue>Continue download</button>
      <p>No account, email address, marketing consent, subscription or payment card is required. In the browser window, choose Save as PDF and switch off Headers and footers if that option is enabled.</p>
    </div>
  </dialog>`;

const emailPreferenceConfirmation = `
  <section class="page-hero"><p class="eyebrow">Email preferences</p><h1>Your email preference is saved.</h1><p>If you reached this page through the unsubscribe link in a Tallyo overview email, your preference has been recorded and Tallyo will not send another introductory overview to that address. If you need help, contact <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>.</p><p><a class="button button-primary" href="/">Return to Tallyo</a></p></section>`;

const generatorPage = (defaultType) => {
  const lowerType = defaultType.toLowerCase();
  const isInvoice = defaultType === "Invoice";
  const guidance = isInvoice
    ? `<h2 id="generator-guidance-title">Before you send the invoice</h2><p>Check the invoice number, issue date, supply date when relevant, customer details, due date and payment instructions.</p><p>VAT-registered businesses may need additional information. This free maker does not produce the required sterling VAT totals for foreign-currency VAT invoices.</p><p><a href="/invoice-guide/">Read the simple invoice guide</a> or check the <a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include">current GOV.UK invoice requirements</a>. Tallyo does not provide tax, legal or accounting advice.</p>`
    : `<h2 id="generator-guidance-title">Before you send the quote</h2><p>Describe the work clearly, confirm the price and tax treatment, and set a realistic valid-until date.</p><p>Add any scope, exclusions or payment expectations the customer should understand before deciding.</p><p>A quote records what you propose. It does not replace advice about contracts, tax or your legal obligations.</p>`;
  const explainer = isInvoice
    ? `<section class="section generator-explainer" aria-labelledby="generator-explainer-title"><div class="section-heading"><p class="eyebrow">A clearer invoice</p><h2 id="generator-explainer-title">Include the details your customer needs to pay.</h2></div><div><article><h3>Use a unique number</h3><p>Give every invoice a reference you can identify later and keep the sequence consistent in your own records.</p></article><article><h3>Make the dates clear</h3><p>Show when the invoice was issued, when payment is due and, where relevant, when the goods or services were supplied.</p></article><article><h3>Check tax and payment details</h3><p>Confirm the applicable tax treatment and tell the customer how to pay before downloading the PDF.</p></article></div></section>`
    : `<section class="section generator-explainer" aria-labelledby="generator-explainer-title"><div class="section-heading"><p class="eyebrow">A clearer quote</p><h2 id="generator-explainer-title">Make the proposed work easy to understand.</h2></div><div><article><h3>Define the scope</h3><p>Use specific line items and notes so the customer can see what the price covers.</p></article><article><h3>Set a validity date</h3><p>A valid-until date makes it clear how long the proposed price and terms remain open.</p></article><article><h3>Record what happens next</h3><p>Explain how the customer should approve the quote and when an invoice or deposit will follow.</p></article></div></section>`;
  return `
  <section class="page-hero generator-hero"><p class="eyebrow">Free ${defaultType} Maker</p><h1>Create a professional ${lowerType}, free.</h1><p>No account needed. While you work, this page keeps your document details and selected logo in your browser and does not send them to Tallyo, analytics or another service.</p></section>
  <section class="generator-shell" data-generator data-default-type="${defaultType}">
    <div class="generator-editor">
      <div class="privacy-note" role="note"><strong>Private by default</strong><span>Tallyo does not save this document automatically. Refreshing the page clears the document draft. Read the <a href="/privacy/">Privacy Notice</a>.</span></div>
      <div class="generator-editor-heading">
        <div><p class="eyebrow">Document editor</p><h2>Build your ${lowerType}</h2><p>Work through each section. Your preview updates as you type.</p></div>
      </div>
      <form data-generator-form novalidate>
        <section class="generator-section"><header><strong>Document details</strong><small>Type, number and dates</small></header><fieldset><legend class="sr-only">Document details</legend><div class="generator-fields generator-fields-three">
          <label>Document type<select name="documentType"><option>Invoice</option><option>Quote</option><option>Estimate</option></select></label>
          <label>Currency<select name="currency"><option value="GBP">GBP — British pound</option><option value="EUR">EUR — Euro</option><option value="USD">USD — US dollar</option></select></label>
          <label>Reference number<input name="reference" maxlength="40" value="0001" autocomplete="off"></label>
          <label>Issue date<input name="issueDate" type="date"></label>
          <label>Supply date<input name="supplyDate" type="date"><span>Use for invoices when it differs from the issue date.</span></label>
          <label>${isInvoice ? "Due date" : "Valid until"}<input name="dueDate" type="date"></label>
        </div></fieldset></section>
        <section class="generator-section"><header><strong>Your business</strong><small>Name, contact details and logo</small></header><fieldset><legend class="sr-only">Your business</legend><div class="generator-fields generator-fields-two">
          <label>Business or trading name<input name="senderName" maxlength="100" autocomplete="organization"></label>
          <label>Your name <span>(sole traders)</span><input name="senderLegalName" maxlength="100" autocomplete="name"></label>
          <label class="wide">Business address<textarea name="senderAddress" rows="3" maxlength="300" autocomplete="street-address"></textarea></label>
          <label>Email or phone<input name="senderContact" maxlength="120" autocomplete="email"></label>
          <label>VAT number <span>(if registered)</span><input name="vatNumber" maxlength="30" autocomplete="off"></label>
          <label class="wide logo-field">Logo <span>(optional, stays in this browser)</span><input name="logo" type="file" accept="image/png,image/jpeg,image/webp"><button class="text-button" type="button" data-remove-logo hidden>Remove logo</button></label>
        </div></fieldset></section>
        <section class="generator-section"><header><strong>Customer</strong><small>Who this ${lowerType} is for</small></header><fieldset><legend class="sr-only">Customer</legend><div class="generator-fields generator-fields-two">
          <label>Customer or company name<input name="customerName" maxlength="100" autocomplete="organization"></label>
          <label class="wide">Customer address<textarea name="customerAddress" rows="3" maxlength="300" autocomplete="street-address"></textarea></label>
        </div></fieldset></section>
        <section class="generator-section"><header><strong>Items</strong><small>Work, products, prices and tax</small></header><fieldset><legend class="sr-only">Items</legend><div class="generator-item-list" data-items></div><button class="button button-secondary button-small" type="button" data-add-item>+ Add another item</button></fieldset></section>
        <section class="generator-section"><header><strong>Additional cost</strong><small>Optional shipping or other charges</small></header><fieldset><legend class="sr-only">Additional cost</legend><div class="generator-fields generator-fields-two">
          <label>Shipping or other cost<input name="additionalCost" type="number" min="0" max="1000000" step="0.01" value="0.00" inputmode="decimal"></label>
          <label>Tax on additional cost (%)<input name="additionalTaxRate" type="number" min="0" max="100" step="0.01" value="0" inputmode="decimal"></label>
        </div></fieldset></section>
        <section class="generator-section"><header><strong>Finishing details</strong><small>Notes and payment instructions</small></header><fieldset><legend class="sr-only">Finishing details</legend><div class="generator-fields generator-fields-two">
          <label class="wide">Notes<textarea name="notes" rows="3" maxlength="500"></textarea></label>
          <label class="wide">Payment instructions<textarea name="paymentInstructions" rows="3" maxlength="500"></textarea></label>
        </div></fieldset></section>
        <div class="generator-actions"><a class="button button-secondary" href="#document-preview">Preview</a><button class="button button-primary" type="button" data-print>Download PDF</button><button class="text-button generator-clear" type="reset">Clear everything</button></div>
        <p class="generator-status" data-generator-status role="status" aria-live="polite"></p>
      </form>
      <aside class="generator-guidance" aria-labelledby="generator-guidance-title">${guidance}</aside>
    </div>
    <div class="generator-preview-wrap" id="document-preview" role="region" aria-label="Live document preview" tabindex="0"><div class="generator-preview-heading"><div><p class="preview-label">Live preview</p><p>Updates automatically while you edit.</p></div><button class="button button-secondary button-small" type="button" data-print-preview>Download PDF</button></div><article class="generator-preview" data-preview aria-label="Document preview">
      <header><img data-preview-logo alt="Business logo" hidden><div><p data-preview-type>${defaultType}</p><h2 data-preview-reference>${defaultType} 0001</h2><p data-preview-dates></p></div></header>
      <div class="preview-parties"><section><h3>From</h3><p data-preview-sender></p></section><section><h3>To</h3><p data-preview-customer></p></section></div>
      <div class="preview-table-wrap"><table><caption class="sr-only">Items and calculated amounts</caption><thead><tr><th>Description</th><th>Qty / unit</th><th>Unit price</th><th>Discount</th><th>Tax</th><th>Net</th><th>Total</th></tr></thead><tbody data-preview-items></tbody></table></div>
      <dl class="preview-totals"><div><dt>Items before discount</dt><dd data-preview-subtotal></dd></div><div data-preview-discount-row><dt>Discount</dt><dd data-preview-discount></dd></div><div data-preview-additional-row><dt>Additional cost</dt><dd data-preview-additional></dd></div><div><dt>Net total</dt><dd data-preview-net></dd></div><div><dt>Tax</dt><dd data-preview-tax></dd></div><div class="grand-total"><dt>Total</dt><dd data-preview-total></dd></div></dl>
      <div class="preview-notes"><section data-preview-notes-section><h3>Notes</h3><p data-preview-notes></p></section><section data-preview-payment-section><h3>Payment instructions</h3><p data-preview-payment></p></section></div>
      <footer>Created with Tallyo</footer>
    </article></div>
  </section>
  ${explainer}
  ${defaultType === "Invoice" ? invoiceConversionDialog : ""}`;
};

const foundationPages = [
  { route: "/", output: "index.html", title: "Invoice software built around your business", description: "Create professional invoices and quotes, record deposits and payments, repeat regular invoices and send chosen overdue reminders with Tallyo.", content: home, schema: "software" },
  { route: "/features/", output: "features/index.html", title: "Invoice, quote and payment tracking features", description: "Explore Tallyo tools for invoices, quotes, recurring invoices, overdue reminders, deposits, payment tracking and activity history.", content: features, schema: "webpage" },
  { route: "/product-tour/", output: "product-tour/index.html", title: "Tallyo invoice software product tour", description: "See how Tallyo creates invoices and quotes, repeats regular invoices, records deposits and payments, sends reminders and keeps activity history.", content: productTour, schema: "webpage" },
  { route: "/pricing/", output: "pricing/index.html", title: "Tallyo pricing — Free Invoice Maker and Tallyo Pro", description: pricingDescription, content: pricing, schema: "webpage" },
  { route: "/security/", output: "security/index.html", title: "How Tallyo protects account access", description: "Learn about Tallyo account, data-access, payment and browser security controls, with honest limitations.", content: security, schema: "webpage" },
  { route: "/helper/", output: "helper/index.html", title: "Tallyo Helper", description: "Ask Tallyo Helper for reviewed public guidance about current product features, payments, documents, installation and account protection.", content: helper, schema: "webpage", helper: true, scripts: ["/assets/helper.js"] },
  { route: "/help/", output: "help/index.html", title: "Tallyo Help Centre", description: "Find clear step-by-step guidance for invoices, quotes, recurring invoices, overdue reminders, deposits, payments and account access.", content: help, schema: "webpage" },
  { route: "/faq/", output: "faq/index.html", title: "Tallyo frequently asked questions", description: "Plain answers about invoices, quotes, recurring invoices, reminders, deposits, payment tracking, pricing, security and access.", content: faq, schema: "faq" },
  { route: "/about/", output: "about/index.html", title: "About Tallyo", description: "Learn why Tallyo is building straightforward invoice software around the everyday needs of freelancers, sole traders and service companies.", content: about, schema: "webpage" },
  { route: "/invoice-guide/", output: "invoice-guide/index.html", title: "What is an invoice? A simple business guide", description: "Learn what an invoice is, what to include, and how quotes, recurring invoices, reminders, deposits and payment tracking fit together.", content: invoiceGuide, schema: "webpage", breadcrumbs: [{ name: "Home", path: "/" }, { name: "Invoice guide", path: "/invoice-guide/" }] },
  { route: "/privacy/", output: "privacy/index.html", title: "Tallyo Privacy Notice", description: "Read how Tallyo uses, shares, protects and retains personal information and how to exercise your data-protection rights.", content: privacyNotice, schema: "webpage" },
  { route: "/cookies/", output: "cookies/index.html", title: "Tallyo Cookie Notice", description: "Read about Tallyo's necessary storage, optional Google Analytics and how to change your Analytics choice.", content: cookieNotice, schema: "webpage" },
  { route: "/data-processing-terms/", output: "data-processing-terms/index.html", title: "Tallyo Business-User Data Processing Terms", description: "Read the data-processing terms that form part of the Tallyo account agreement for UK business users.", content: dataProcessingTerms, schema: "webpage" },
  { route: "/terms/", output: "terms/index.html", title: "Tallyo Terms of Service", description: "Read the terms for Tallyo accounts, subscriptions and connected customer card payments for UK business users.", content: serviceTerms, schema: "webpage" },
  { route: "/email-preferences/", output: "email-preferences/index.html", title: "Tallyo email preferences", description: "Confirmation that an introductory Tallyo email preference has been recorded.", content: emailPreferenceConfirmation, schema: "webpage", noindex: true },
  { route: "/free-invoice-generator/", output: "free-invoice-generator/index.html", title: "Free invoice generator for your business", description: "Create, preview and download a professional invoice in your browser without an account. Add your logo, line items, tax and payment details.", content: generatorPage("Invoice"), schema: "webpage", scripts: ["/assets/generator.js"] },
  { route: "/free-quote-generator/", output: "free-quote-generator/index.html", title: "Free quote generator for your business", description: "Create, preview and download a professional customer quote in your browser without an account. Set scope, price, tax and a validity date.", content: generatorPage("Quote"), schema: "webpage", scripts: ["/assets/generator.js"] }
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

export const pages = Object.freeze([...foundationPages, ...helpPages]);

export const notFoundPage = Object.freeze({
  route: "/404/",
  output: "404.html",
  title: "Page not found",
  description: "The page you requested could not be found.",
  content: '<section class="page-hero"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>Use the main navigation or return to the Tallyo homepage.</p><p><a class="button button-primary" href="/">Return home</a></p></section>',
  schema: "webpage"
});

export { faqs, helpArticles, productScenes };
