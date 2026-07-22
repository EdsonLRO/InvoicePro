export const productFacts = Object.freeze({
  positioning: "Professional invoices. Faster payments. Less admin.",
  supporting:
    "Create quotes and invoices, accept card payments, automate recurring work and keep every customer transaction organised in one straightforward workspace.",
  limitations: [
    "An internet connection is required to access and update authenticated business records.",
    "Tallyo is not a full accounting suite and does not prepare tax returns.",
    "Tallyo does not provide legal, tax or accounting advice.",
    "Stripe handles card entry on Stripe-hosted pages; Tallyo does not store full card details."
  ]
});

export const featureGroups = Object.freeze([
  {
    label: "Create and send",
    title: "Documents that look professional",
    description: "Create invoices, quotes and credit notes, add your branding, export polished PDFs and send documents from one workspace.",
    items: ["Invoices, quotes and credit notes", "Branded PDF documents", "Email sending and delivery updates", "Excel list export"]
  },
  {
    label: "Get paid",
    title: "A clearer route from invoice to payment",
    description: "Share Stripe-hosted card-payment links, request a deposit and see confirmed payments against the right invoice.",
    items: ["Full-balance card links", "Seller-set deposits", "Manual and Stripe-confirmed payments", "Supported refund workflow"]
  },
  {
    label: "Save time",
    title: "Less repeated setup",
    description: "Reuse customers and services, schedule recurring invoices and choose when overdue reminders should be sent.",
    items: ["Saved customers", "Saved products and services", "Recurring invoices", "Opt-in overdue reminders"]
  },
  {
    label: "Stay organised",
    title: "Know what needs attention",
    description: "See paid, due and overdue balances alongside document and delivery activity, without hunting through separate tools.",
    items: ["Outstanding balances", "Document statuses", "Activity history", "Workspace export"]
  }
]);

export const industries = Object.freeze([
  ["Freelancers", "Create clear project invoices and keep repeat customers ready for next time."],
  ["Consultants", "Move from quote to invoice and keep professional records for ongoing client work."],
  ["Tradespeople", "Send invoices from phone, tablet or computer and track what remains due."],
  ["Cleaners and tutors", "Set up recurring work and choose whether each schedule emails automatically."],
  ["Photographers and designers", "Add branding, request deposits and share polished customer documents."],
  ["Custom-order businesses", "Keep quotes, deposits, invoices and payment status together for made-to-order work."]
]);

export const faqs = Object.freeze([
  {
    question: "What is Tallyo?",
    answer: "Tallyo is a straightforward invoicing and business-records workspace for small businesses and independent operators."
  },
  {
    question: "Who is Tallyo for?",
    answer: "It is designed for UK sole traders, freelancers, consultants, tradespeople and small service businesses that create quotes and invoices."
  },
  {
    question: "Can I use Tallyo in a browser?",
    answer: "Yes. Tallyo works in supported modern browsers on phone, tablet and computer."
  },
  {
    question: "Can I install Tallyo?",
    answer: "Yes. The app can be installed on supported devices for quick access. Authenticated business records still require an internet connection."
  },
  {
    question: "Does Tallyo work offline?",
    answer: "The app shell can open offline, but you need an internet connection to sign in and access or update authenticated business records."
  },
  {
    question: "Can I create quotes as well as invoices?",
    answer: "Yes. You can create quotes and convert a quote into an invoice when the work is agreed."
  },
  {
    question: "How do recurring invoices work?",
    answer: "You choose a schedule for an invoice. Tallyo can create future invoices and, when you enable it for that schedule, email them automatically."
  },
  {
    question: "Can Tallyo send overdue reminders?",
    answer: "Yes. Reminders are opt-in for each invoice, so they are only scheduled when you choose to enable them."
  },
  {
    question: "How are card payments handled?",
    answer: "Tallyo creates a payment link that opens a Stripe-hosted checkout page. Stripe handles the card entry and confirms the payment back to Tallyo."
  },
  {
    question: "Does Tallyo store full card details?",
    answer: "No. Card details are entered on Stripe-hosted pages and are not stored by Tallyo."
  },
  {
    question: "Does Tallyo replace accounting software?",
    answer: "No. Tallyo helps with invoicing and business records, but it is not a full accounting suite and does not prepare tax returns."
  }
]);

export const plans = Object.freeze([
  { name: "Free", audience: "Getting started", status: "Details being finalised", features: ["Create professional documents", "Keep essential records", "Explore Tallyo at your pace"] },
  { name: "Essentials", audience: "Regular invoicing", status: "Details being finalised", features: ["For consistent invoicing work", "Customer and service reuse", "Payment-status organisation"] },
  { name: "Automate", audience: "Recurring work and follow-up", status: "Details being finalised", features: ["For repeat invoicing", "Recurring schedules", "Payment follow-up tools"] },
  { name: "Teams", audience: "Growing businesses with staff", status: "Not currently available", features: ["Future multi-user direction", "No current workspace or team access", "Availability will be announced only when implemented"] }
]);

export const installationSteps = Object.freeze([
  ["Chrome on desktop", "Open Tallyo, choose the install icon in the address bar, then confirm Install."],
  ["Microsoft Edge", "Open Tallyo, choose Apps from the browser menu, then select Install Tallyo."],
  ["Android Chrome", "Open the browser menu and choose Install app or Add to Home screen."],
  ["iPhone or iPad Safari", "Tap Share, choose Add to Home Screen, then confirm Add."]
]);
