export const productFacts = Object.freeze({
  positioning: "Professional invoices. Clearer payment tracking. Less admin.",
  supporting:
    "Create quotes and invoices, record payments, automate recurring work and keep customer transactions organised in one straightforward workspace.",
  limitations: [
    "An internet connection is required to access and update authenticated business records.",
    "Tallyo is not a full accounting suite and does not prepare tax returns.",
    "Tallyo does not provide legal, tax or accounting advice.",
    "Online card payments for independent business accounts are being prepared and are not included in the launch subscription yet."
  ]
});

export const workflowSteps = Object.freeze([
  ["Set up your business", "Add the details and branding you want on your documents."],
  ["Add a customer", "Save the people and businesses you invoice regularly."],
  ["Create a quote or invoice", "Add services, prices, dates and payment details."],
  ["Send or download the document", "Email a saved document to the customer or download its PDF for another agreed delivery route."],
  ["Track payment and follow up", "See what is paid, due or overdue and choose when reminders are sent."],
  ["Automate recurring work", "Schedule future invoices and decide whether each schedule emails automatically."]
]);

export const featureGroups = Object.freeze([
  {
    label: "Create and send",
    title: "Documents that look professional",
    description: "Create invoices, quotes and credit notes, add your branding, export polished PDFs and send documents from one workspace.",
    items: ["Invoices, quotes and credit notes", "Branded PDF documents", "Email sending and delivery updates", "Excel list export"]
  },
  {
    label: "Track payments",
    title: "Keep payment progress with the invoice",
    description: "Record full or partial payments and see the outstanding balance against the right invoice.",
    items: ["Full and partial payment records", "Outstanding balances", "Payment notes and dates", "Online card payments being prepared"]
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
  },
  {
    label: "Protect access",
    title: "Practical account controls",
    description: "Confirm account ownership, add authenticator-app protection and use recovery and sign-out controls when needed.",
    items: ["Email confirmation", "Optional authenticator-app MFA", "One-time recovery codes", "Device and all-device sign-out"]
  }
]);

export const productScenes = Object.freeze([
  { id: "dashboard", label: "Dashboard", title: "See what needs attention", caption: "Outstanding, paid and overdue work is brought together for a quick start to the day.", variant: "dashboard" },
  { id: "invoice-editor", label: "Invoice editor", title: "Build a clear customer invoice", caption: "Add the customer, dates, line items and payment details in one focused editor.", variant: "document" },
  { id: "quote", label: "Quotes", title: "Start with an agreed quote", caption: "Prepare a quote, keep its status visible and convert it to an invoice when the work is agreed.", variant: "quote" },
  { id: "customers", label: "Customers and saved items", title: "Reuse the details you need", caption: "Keep repeat customers and commonly used products or services ready for the next document.", variant: "customers" },
  { id: "recurring", label: "Recurring invoices", title: "Plan repeat invoicing", caption: "Choose the next run and decide whether a saved schedule should email each generated invoice.", variant: "recurring" },
  { id: "overdue", label: "Overdue work", title: "Follow up by choice", caption: "Review overdue balances and enable reminders only for the invoices you want Tallyo to follow up.", variant: "overdue" },
  { id: "payments", label: "Payments", title: "Keep payment status with the invoice", caption: "See recorded payments and the remaining balance together with the relevant invoice.", variant: "payments" },
  { id: "activity", label: "Activity history", title: "Understand what happened", caption: "Document, email, payment and refund activity stays attached to the relevant record.", variant: "activity" },
  { id: "branding", label: "Branding", title: "Make documents recognisably yours", caption: "Add business details, a logo and document styling that carry through to customer PDFs.", variant: "branding" },
  { id: "security", label: "Account security", title: "Choose stronger sign-in protection", caption: "Manage authenticator-app MFA, recovery codes and sign-out controls from Account Security.", variant: "security" },
  { id: "mobile", label: "Mobile", title: "Work from a supported phone", caption: "The core document and account flows adapt to smaller screens and can be installed for quick access.", variant: "mobile" }
]);

export const industries = Object.freeze([
  { slug: "freelancers", name: "Freelancers", summary: "Create clear project invoices and keep repeat customers ready for next time.", focus: ["Project quotes and invoices", "Reusable customer details", "Clear paid and outstanding status"] },
  { slug: "consultants", name: "Consultants", summary: "Move from quote to invoice and keep professional records for ongoing client work.", focus: ["Quote-to-invoice workflow", "Clear payment tracking", "Recurring client invoicing"] },
  { slug: "cleaners", name: "Cleaners", summary: "Schedule repeat invoices and choose whether each recurring run emails automatically.", focus: ["Recurring service invoices", "Saved service items", "Opt-in overdue reminders"] },
  { slug: "electricians", name: "Electricians", summary: "Prepare itemised quotes, convert agreed work and follow the final invoice status.", focus: ["Itemised quotes", "Quote conversion", "Phone-friendly invoice updates"] },
  { slug: "plumbers", name: "Plumbers", summary: "Keep customer, service and payment details organised from estimate to settled invoice.", focus: ["Saved customers", "Reusable service items", "Payment status"] },
  { slug: "decorators", name: "Decorators", summary: "Share professional quotes and invoice completed work clearly.", focus: ["Branded quotes", "Payment records", "Invoice PDFs"] },
  { slug: "tutors", name: "Tutors", summary: "Create repeat invoices for regular sessions and see what remains due.", focus: ["Recurring invoices", "Customer history", "Outstanding balances"] },
  { slug: "photographers", name: "Photographers", summary: "Add branding and share polished customer documents.", focus: ["Branded documents", "Payment tracking", "Quote-to-invoice conversion"] },
  { slug: "designers", name: "Designers", summary: "Keep proposals, invoices and project payment activity in one straightforward flow.", focus: ["Professional quotes", "Saved services", "Payment activity"] },
  { slug: "custom-order-businesses", name: "Custom-order businesses", summary: "Keep quotes, invoices and payment status together for made-to-order work.", focus: ["Detailed quote items", "Payment records", "Credit notes"] },
  { slug: "sole-traders", name: "Independent service companies", summary: "Use one focused workspace for customers, documents, payments and repeat work.", focus: ["Customer records", "Document statuses", "Account export"] }
]);

export const publishedIndustrySlugs = Object.freeze(["freelancers", "consultants", "cleaners", "electricians", "photographers", "sole-traders"]);

export const helpArticles = Object.freeze([
  {
    slug: "create-invoices-quotes-and-credit-notes",
    title: "Create invoices, quotes and credit notes",
    description: "Choose the right document, add customer and line-item details, then send or download it.",
    steps: [
      ["Choose the document type", "Use a quote before work is agreed, an invoice when payment is due, or a credit note to reduce an issued invoice."],
      ["Add the customer and dates", "Select a saved customer or enter the details needed on the document, then set the issue and due dates."],
      ["Add products or services", "Use saved items or enter a clear description, quantity, unit price and applicable tax."],
      ["Review and share", "Save the document, check its PDF, then email or download it when it is ready for the customer."]
    ],
    note: "A quote can be converted to an invoice when the work is agreed. A credit note records a reduction; it is not the same as deleting the original invoice."
  },
  {
    slug: "payment-links-and-deposits",
    title: "Online card-payment availability",
    description: "Understand what is available now and what is still being prepared for independent business accounts.",
    steps: [
      ["Record payments today", "Use the invoice Payments section to record money received through an agreed route."],
      ["Track part-payments", "Add each payment amount and date so the outstanding balance stays clear."],
      ["Keep customer notes", "Use the payment note to identify the route or reference used."],
      ["Check availability later", "Tallyo will announce online card-payment availability only when independent business accounts are supported."]
    ],
    note: "Online card payments are being prepared and are not included in the launch subscription yet."
  },
  {
    slug: "recurring-invoices",
    title: "Set up recurring invoices",
    description: "Choose when repeat invoices are created and whether a saved schedule emails automatically.",
    steps: [
      ["Prepare the source invoice", "Save the customer, items and terms you want future invoices to use."],
      ["Choose a schedule", "Set the frequency, next run and any end condition that suits the work."],
      ["Choose email behaviour", "Enable automatic email only when you want each generated invoice sent without another review."],
      ["Review the recurring list", "Check the next run and pause or change the schedule when the work changes."]
    ],
    note: "Recurring invoices require a connection to Tallyo's scheduled service. Installing the app does not make recurring work run offline."
  },
  {
    slug: "overdue-reminders",
    title: "Choose when overdue reminders are sent",
    description: "Review overdue invoices and opt in only the documents you want Tallyo to follow up.",
    steps: [
      ["Save the invoice", "The invoice must have a customer email, due date and outstanding balance."],
      ["Enable reminders for that invoice", "Turn on the overdue reminder option only when you want follow-up for this document."],
      ["Review overdue work", "Use the overdue view to see balances that need attention."],
      ["Check activity", "Delivery and reminder activity appears with the document when a send is processed."]
    ],
    note: "Tallyo does not send an overdue reminder merely because an invoice has passed its due date; you choose the invoices that use reminders."
  },
  {
    slug: "refunds-and-payment-status",
    title: "Understand payment status",
    description: "See recorded payments and the remaining balance against the relevant invoice.",
    steps: [
      ["Open the invoice", "The Payments section shows recorded entries and the amount still due."],
      ["Review the payment", "Check the amount, date and note against your own payment records."],
      ["Correct mistakes carefully", "Use a balancing entry and a clear note when a manually recorded payment needs correcting."],
      ["Check the balance", "Confirm that the paid amount and remaining balance match your records."]
    ],
    note: "Tallyo payment tracking does not itself move money or issue a bank or card refund."
  },
  {
    slug: "account-security",
    title: "Protect your Tallyo account",
    description: "Add authenticator-app protection, keep recovery codes safe and choose the right sign-out option.",
    steps: [
      ["Confirm your email", "Email confirmation establishes access to the account before business records are used."],
      ["Add an authenticator app", "Optional multi-factor authentication asks for a current authenticator code at protected sign-ins."],
      ["Store recovery codes safely", "Keep the one-time codes away from the device you normally use to sign in."],
      ["Sign out appropriately", "Sign out this device for everyday use, or choose all devices if account access may be at risk."]
    ],
    note: "Tallyo support should never ask for your password, authenticator secret, current authenticator code or recovery codes."
  },
  {
    slug: "email-delivery-status",
    title: "Check document email delivery",
    description: "Understand what Tallyo records when a document email is accepted, delivered or cannot be sent.",
    steps: [
      ["Send a saved document", "Choose the customer email and review the document before sending."],
      ["Check the document status", "Tallyo records the result returned by the email service for that send."],
      ["Review activity history", "Use the document activity to understand the latest recorded delivery event."],
      ["Follow up when needed", "If delivery cannot be confirmed, check the address with the customer and use another agreed route."]
    ],
    note: "An accepted or delivered provider event helps with follow-up, but it cannot guarantee that a person read the message."
  },
  {
    slug: "activity-history",
    title: "Use activity history",
    description: "Follow document, email, payment and refund events without treating the history as a certified audit log.",
    steps: [
      ["Open the relevant document", "Activity is shown in the context of the invoice, quote or credit note it belongs to."],
      ["Read the latest event first", "Use timestamps and plain-language descriptions to understand recent changes."],
      ["Compare with payment and email sections", "Provider-confirmed payments and delivery results also appear in their dedicated areas."],
      ["Export when useful", "Use the account export for a structured copy of the records currently associated with your account."]
    ],
    note: "Activity history is a useful product record, not a tamper-proof compliance audit log."
  },
  {
    slug: "install-tallyo",
    title: "Install Tallyo on a supported device",
    description: "Add Tallyo to a phone, tablet or computer for quick access while keeping the internet requirement clear.",
    steps: [
      ["Open Tallyo in a supported browser", "Sign in through the current Tallyo application URL."],
      ["Choose the browser install action", "Use Install app, Add to Home Screen or the browser's Apps menu, depending on the device."],
      ["Confirm the installation", "Tallyo appears with your other applications or on the home screen."],
      ["Open and sign in", "Use the installed app as a quick route to Tallyo. Authenticated business records still need an internet connection."]
    ],
    note: "Installation does not download your authenticated business records for offline use."
  }
]);

export const faqs = Object.freeze([
  { question: "What is Tallyo?", answer: "Tallyo is a straightforward invoicing and business-records workspace for small businesses and independent operators." },
  { question: "Who is Tallyo for?", answer: "It is designed for UK sole traders, freelancers, consultants, tradespeople and small service businesses that create quotes and invoices." },
  { question: "Can I use Tallyo in a browser?", answer: "Yes. Tallyo works in supported modern browsers on phone, tablet and computer." },
  { question: "Can I install Tallyo?", answer: "Yes. The app can be installed on supported devices for quick access. Authenticated business records still require an internet connection." },
  { question: "Does Tallyo work offline?", answer: "The app shell can open offline, but you need an internet connection to sign in and access or update authenticated business records." },
  { question: "Can I create quotes as well as invoices?", answer: "Yes. You can create quotes and convert a quote into an invoice when the work is agreed." },
  { question: "How do recurring invoices work?", answer: "You choose a schedule for an invoice. Tallyo can create future invoices and, when you enable it for that schedule, email them automatically." },
  { question: "Can Tallyo send overdue reminders?", answer: "Yes. Reminders are opt-in for each invoice, so they are only scheduled when you choose to enable them." },
  { question: "Can customers pay an invoice by card?", answer: "Not through the launch subscription yet. Online card payments for independent business accounts are being prepared." },
  { question: "How do I track payments?", answer: "Record full or partial payments against an invoice, including the date and an optional reference, so the remaining balance stays clear." },
  { question: "Is there a free trial?", answer: "No. The Free Invoice Maker can be used without an account, while Tallyo Pro is the paid invoicing workspace." },
  { question: "How much is Tallyo Pro?", answer: "Tallyo Pro is £8 per month or £80 per year. The annual option saves £16 compared with paying monthly for a year." },
  { question: "Can I use Tallyo on my phone?", answer: "Yes. The interface adapts to supported phone browsers and can be installed for quick access." },
  { question: "Can I export my records?", answer: "Yes. Tallyo can create a structured account export and offers Excel export for document lists." },
  { question: "How do I get support?", answer: "Use the reviewed Help Centre guidance for common tasks. A public support contact will be added only after the business contact is approved." },
  { question: "Does Tallyo replace accounting software?", answer: "No. Tallyo helps with invoicing and business records, but it is not a full accounting suite and does not prepare tax returns." }
]);

export const installationSteps = Object.freeze([
  ["Chrome on desktop", "Open Tallyo, choose the install icon in the address bar, then confirm Install."],
  ["Microsoft Edge", "Open Tallyo, choose Apps from the browser menu, then select Install Tallyo."],
  ["Android Chrome", "Open the browser menu and choose Install app or Add to Home screen."],
  ["iPhone Safari", "Tap Share, choose Add to Home Screen, then confirm Add."],
  ["iPad Safari", "Tap Share, choose Add to Home Screen, then confirm Add."]
]);
