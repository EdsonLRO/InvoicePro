import { breadcrumbs, finalCta, list, productDemo, workflow } from "./components.mjs";
import { connectPaymentPlaceholders } from "./commercial-offer.mjs";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const renderFaqs = (items) => items
  .map(({ question, answer }) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`)
  .join("");

const renderRelatedLinks = (items) => items
  .map(({ label, href }) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
  .join('<span aria-hidden="true">·</span>');

const renderIntentPage = ({
  eyebrow,
  title,
  lead,
  secondaryLabel,
  secondaryHref,
  workflowTitle,
  workflowIntro,
  steps,
  screenshot,
  clarityTitle,
  clarityCopy,
  benefits,
  boundary,
  faqs,
  related,
  finalTitle,
  finalCopy
}) => `
  ${breadcrumbs([{ label: "Home", href: "/" }, { label: eyebrow }])}
  <section class="page-hero intent-hero">
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(lead)}</p>
    <div class="cta-row"><a class="button button-primary" data-analytics-placement="hero" data-signup-link href="#">Create account</a><a class="button button-secondary" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a></div>
  </section>
  <section class="section section-soft intent-workflow" aria-labelledby="intent-workflow-title">
    <div class="section-heading"><p class="eyebrow">How it works</p><h2 id="intent-workflow-title">${escapeHtml(workflowTitle)}</h2><p>${escapeHtml(workflowIntro)}</p></div>
    ${workflow(steps)}
  </section>
  <section class="section intent-proof" aria-label="Tallyo product screen">
    ${productDemo(screenshot, 0)}
  </section>
  <section class="section split intent-clarity" aria-labelledby="intent-clarity-title">
    <div><p class="eyebrow">What stays clear</p><h2 id="intent-clarity-title">${escapeHtml(clarityTitle)}</h2><p>${escapeHtml(clarityCopy)}</p><p class="feature-proof-note">${escapeHtml(boundary)}</p></div>
    ${list(benefits)}
  </section>
  <section class="section section-soft faq-preview" aria-labelledby="intent-faq-title">
    <div class="section-heading"><p class="eyebrow">Common questions</p><h2 id="intent-faq-title">Useful answers before you start.</h2></div>
    <div class="faq-list">${renderFaqs(faqs)}</div>
  </section>
  <section class="section intent-related" aria-labelledby="intent-related-title"><div class="section-heading"><p class="eyebrow">Keep exploring</p><h2 id="intent-related-title">See the feature in context.</h2></div><p class="home-decision-trust">${renderRelatedLinks(related)}</p></section>
  ${finalCta({ title: finalTitle, copy: finalCopy, secondaryLabel, secondaryHref })}`;

const definitions = Object.freeze([
  {
    route: "/quote-to-invoice-software/",
    output: "quote-to-invoice-software/index.html",
    pageTitle: "Quote-to-invoice software for clearer customer approval",
    description: "Create and send a quote, record customer acceptance and let Tallyo create one linked invoice without entering the work again.",
    eyebrow: "Quote-to-invoice software",
    title: "Quote-to-invoice software that keeps accepted work connected.",
    lead: "Prepare the quote, send the customer a clear acceptance link and keep the agreed work connected to the invoice Tallyo creates next.",
    secondaryLabel: "Create a free quote",
    secondaryHref: "/free-quote-generator/",
    workflowTitle: "One connected path from proposal to invoice.",
    workflowIntro: "The customer response, original quote and next invoice stay linked, so you can see what was agreed and what happened afterward.",
    steps: [
      ["Prepare the quote", "Add the customer, work, prices, dates and any notes the customer should understand before deciding."],
      ["Review before sending", "Check the recipient and decide whether the linked invoice should be emailed automatically after acceptance or left for your review."],
      ["Let the customer accept", "The customer opens the secure quote page, enters their name and accepts the quote."],
      ["Continue with the linked invoice", "Tallyo records who accepted the quote and when, keeps the original quote and creates one linked invoice."]
    ],
    screenshot: {
      id: "quote-to-invoice-proof",
      label: "Accepted quote",
      title: "See the accepted quote and linked invoice together",
      caption: "The quote keeps the customer response and the invoice created from it, using fictional demonstration data.",
      variant: "quote",
      image: "/assets/product/tallyo-quote-editor.jpg",
      imageAlt: "Current Tallyo accepted quote using fictional data, showing the customer acceptance and linked invoice"
    },
    clarityTitle: "Keep the agreement visible after the invoice exists.",
    clarityCopy: "The quote is not replaced or hidden. Tallyo keeps the response with the document, creates one linked invoice and records later sending, reminder and payment updates in the relevant history.",
    benefits: [
      "Original quote retained after acceptance",
      "Customer name and acceptance time recorded",
      "One linked invoice created from the accepted quote",
      "Automatic invoice email only when you choose it before sending"
    ],
    boundary: "A quote records what you propose and how the customer responded. It does not replace advice about contracts, tax or your legal obligations.",
    faqs: [
      { question: "What happens when a customer accepts a quote?", answer: "Tallyo records the customer's name and acceptance time, keeps the accepted quote and creates one linked invoice." },
      { question: "Does the original quote remain available?", answer: "Yes. The accepted quote remains part of the document history rather than being replaced by the invoice." },
      { question: "Can the new invoice be emailed automatically?", answer: "Yes, if you selected automatic invoice email before sending the quote. Otherwise the new invoice stays ready for your review." },
      { question: "Can I make a quote without creating an account?", answer: "Yes. The Free Quote Maker lets you prepare and download a quote in your browser. Customer acceptance and linked-invoice creation are Tallyo Pro features." }
    ],
    related: [
      { label: "Create a free quote", href: "/free-quote-generator/" },
      { label: "Read the quote and invoice guide", href: "/help/create-invoices-quotes-and-credit-notes/" },
      { label: "See the full product tour", href: "/product-tour/" }
    ],
    finalTitle: "Keep the quote and invoice connected.",
    finalCopy: "Create a Tallyo account when you want customer acceptance, linked invoices and later payment updates kept in one workspace."
  },
  {
    route: "/recurring-invoice-software/",
    output: "recurring-invoice-software/index.html",
    pageTitle: "Recurring invoice software for regular work",
    description: "Schedule weekly, monthly, quarterly or yearly invoices and choose whether each new invoice is emailed automatically or left for review.",
    eyebrow: "Recurring invoice software",
    title: "Recurring invoice software for work that follows a regular schedule.",
    lead: "Set up the customer, services and timing once, then let Tallyo create each new invoice while you stay in control of whether it is emailed automatically.",
    secondaryLabel: "Read the recurring invoice guide",
    secondaryHref: "/help/recurring-invoices/",
    workflowTitle: "Set the pattern once, then review what comes next.",
    workflowIntro: "Recurring schedules are useful when the same customer receives a similar invoice every week, month, quarter or year.",
    steps: [
      ["Prepare the source invoice", "Save the customer, line items, prices and terms you want future invoices to use."],
      ["Choose the schedule", "Set how often the invoice repeats, the next creation date and, when needed, when the schedule should end."],
      ["Choose the email option", "Send each new invoice automatically only when no further review is needed, or leave it ready for you to check."],
      ["Review and adjust", "See the next run and recurring history, then pause or change the schedule when the work changes."]
    ],
    screenshot: {
      id: "recurring-invoice-proof",
      label: "Recurring schedule",
      title: "Keep the timing and email choice visible",
      caption: "The schedule shows when the next invoice will be created and whether it will be emailed automatically, using fictional demonstration data.",
      variant: "recurring",
      image: "/assets/product/growth-studio/recurring-edit.png",
      imageAlt: "Current Tallyo recurring schedule editor using fictional data, showing a monthly invoice and automatic email choice"
    },
    clarityTitle: "Know what will repeat before the next invoice is created.",
    clarityCopy: "Each schedule keeps its customer, items, frequency, next date and email choice together. The recurring history helps you check what the schedule created previously.",
    benefits: [
      "Weekly, monthly, quarterly or yearly schedules",
      "A visible next invoice date",
      "Automatic email or review before sending",
      "Pause, update and recurring-history controls"
    ],
    boundary: "Recurring invoices need an internet connection to Tallyo's scheduled service. Installing Tallyo does not make recurring work run offline.",
    faqs: [
      { question: "How often can an invoice repeat?", answer: "A recurring schedule can run weekly, monthly, quarterly or yearly." },
      { question: "Does every recurring invoice have to be emailed automatically?", answer: "No. You choose whether each new invoice is emailed automatically or left ready for review." },
      { question: "Can I change a recurring schedule later?", answer: "Yes. You can review the next date and pause or update the schedule when the work changes." },
      { question: "Does the Free Invoice Maker include recurring invoices?", answer: "No. The free maker creates one browser-only document. Saved schedules and recurring history are Tallyo Pro features." }
    ],
    related: [
      { label: "Read the recurring invoice guide", href: "/help/recurring-invoices/" },
      { label: "Explore overdue reminders", href: "/invoice-reminder-software/" },
      { label: "See recurring work in the product tour", href: "/product-tour/" }
    ],
    finalTitle: "Spend less time rebuilding the same invoice.",
    finalCopy: "Create a Tallyo account to save the customer, set the schedule and choose how each new invoice should be handled."
  },
  {
    route: "/invoice-reminder-software/",
    output: "invoice-reminder-software/index.html",
    pageTitle: "Invoice reminder software for overdue follow-up",
    description: "See overdue invoices together and choose exactly which invoices receive automatic reminders, with every sent reminder kept in the activity history.",
    eyebrow: "Invoice reminder software",
    title: "Invoice reminder software that keeps overdue follow-up under your control.",
    lead: "Tallyo shows what is late and still unpaid, but sends reminders only for the invoices where you deliberately turn them on.",
    secondaryLabel: "Read the reminder guide",
    secondaryHref: "/help/overdue-reminders/",
    workflowTitle: "Choose the invoices that need follow-up.",
    workflowIntro: "The due date and remaining balance determine what is overdue. Your reminder choice determines what Tallyo follows up.",
    steps: [
      ["Save the invoice details", "Include the customer email, due date and the amount the customer needs to pay."],
      ["Turn reminders on for that invoice", "Enable overdue reminders only when you want automatic follow-up for this particular document."],
      ["See overdue invoices together", "Review the customer, due date, time overdue and amount still to pay from one focused view."],
      ["Check the activity history", "See when the invoice and each reminder were sent alongside later payment updates."]
    ],
    screenshot: {
      id: "invoice-reminder-proof",
      label: "Overdue reminders",
      title: "See what is overdue and what will be followed up",
      caption: "The reminders view keeps the invoice, due date, amount and reminder choice visible, using fictional demonstration data.",
      variant: "overdue",
      image: "/assets/product/tallyo-overdue.jpg",
      imageAlt: "Current Tallyo overdue reminders view using fictional data, showing an overdue invoice with reminders enabled"
    },
    clarityTitle: "Keep automatic follow-up deliberate.",
    clarityCopy: "An invoice can appear as overdue without receiving a reminder. This lets you keep special arrangements, disputed work or customers you want to contact personally out of the automatic flow.",
    benefits: [
      "Overdue customer, date and balance shown together",
      "Reminder choice made per invoice",
      "Automatic follow-up only after you enable it",
      "Sent reminders visible in activity history"
    ],
    boundary: "Tallyo does not send a reminder merely because an invoice has passed its due date. You choose the invoices that use reminders.",
    faqs: [
      { question: "When does Tallyo treat an invoice as overdue?", answer: "An invoice is overdue when its due date has passed and there is still money left to pay." },
      { question: "Are reminders sent for every overdue invoice?", answer: "No. Reminders are sent only for invoices where you turned the reminder option on." },
      { question: "Can I see whether a reminder was sent?", answer: "Yes. The invoice activity history shows when the invoice and each reminder were sent." },
      { question: "What information is needed before reminders can work?", answer: "The saved invoice needs a customer email, due date and an amount still to pay." }
    ],
    related: [
      { label: "Read the overdue reminder guide", href: "/help/overdue-reminders/" },
      { label: "Explore recurring invoices", href: "/recurring-invoice-software/" },
      { label: "See payment tracking", href: "/invoice-payment-tracking/" }
    ],
    finalTitle: "Make overdue follow-up easier to manage.",
    finalCopy: "Create a Tallyo account to keep due dates, reminder choices, sent emails and later payments with the invoice they belong to."
  },
  {
    route: "/invoice-payment-tracking/",
    output: "invoice-payment-tracking/index.html",
    pageTitle: "Invoice payment tracking for deposits and balances",
    description: "Record deposits, part-payments, final payments and refunds, then see what was paid, what remains due and what happened in the invoice history.",
    eyebrow: "Invoice payment tracking",
    title: "Invoice payment tracking for deposits, part-payments and balances.",
    lead: "Keep each payment with the invoice it belongs to, update the remaining balance and see when the invoice becomes fully paid.",
    secondaryLabel: "Read the payment guide",
    secondaryHref: "/help/payment-links-and-deposits/",
    workflowTitle: "Update the invoice as money is received.",
    workflowIntro: "Record the payment method you agreed with the customer, whether the money arrives all at once or in several stages.",
    steps: [
      ["Open the saved invoice", "Use the invoice Payments section so every update stays connected to the correct customer and document."],
      ["Record what arrived", "Add the amount, date and method for a deposit, part-payment or final payment."],
      ["Check the remaining balance", "Tallyo updates the paid amount and shows what is still left to pay."],
      ["Review the wider picture", "Use the activity history and Income Insights to understand payments recorded in Tallyo without mixing currencies."]
    ],
    screenshot: {
      id: "invoice-payment-proof",
      label: "Payment records",
      title: "See every recorded amount and the balance left",
      caption: "The invoice payment record shows a fictional deposit, remaining payment and paid balance.",
      variant: "payments",
      image: "/assets/product/tallyo-payments.jpg",
      imageAlt: "Current Tallyo payment record using fictional data, showing a deposit, remaining payment and paid balance"
    },
    clarityTitle: "Keep the balance understandable at every stage.",
    clarityCopy: "Manual records work for bank transfer, cash or another method you agreed with the customer. Tallyo then uses those records to show paid, outstanding and overdue invoice amounts.",
    benefits: [
      "Deposits, part-payments and final payments",
      "Payment date and method kept with the invoice",
      "Amount paid and amount still due",
      connectPaymentPlaceholders.feature
    ],
    boundary: "Income views use only invoices and payments recorded in Tallyo. They do not include expenses, unrecorded income, bank balances, tax calculations or HMRC filing.",
    faqs: [
      { question: "Can I record a deposit or part-payment?", answer: "Yes. Add each amount to the invoice and Tallyo updates the amount still left to pay." },
      { question: "Can I record a bank transfer or cash payment?", answer: "Yes. Add money received by bank transfer, cash or another agreed method to the invoice manually." },
      { question: "Does Tallyo import transactions from my bank?", answer: "No. Tallyo does not currently connect to a bank account or import bank transactions automatically." },
      { question: "Can a customer pay an invoice by card?", answer: connectPaymentPlaceholders.faq }
    ],
    related: [
      { label: "Read the deposits and payments guide", href: "/help/payment-links-and-deposits/" },
      { label: "Understand Income Insights", href: "/help/income-insights-and-income-pack/" },
      { label: "Explore overdue reminders", href: "/invoice-reminder-software/" }
    ],
    finalTitle: "Keep every payment update with the invoice.",
    finalCopy: "Create a Tallyo account when you want deposits, balances, status and activity kept together instead of updated in separate notes."
  }
]);

export const intentPages = Object.freeze(definitions.map((definition) => ({
  route: definition.route,
  output: definition.output,
  title: definition.pageTitle,
  description: definition.description,
  content: renderIntentPage(definition),
  schema: "webpage",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: definition.eyebrow, path: definition.route }
  ]
})));
