import { connectPaymentPlaceholders } from "./commercial-offer.mjs";

export const productFacts = Object.freeze({
  positioning: "Professional invoices. Clear payment updates. Less admin.",
  supporting:
    "Create quotes and invoices, record deposits and payments, repeat regular invoices and keep every update in one straightforward workspace.",
  limitations: [
    "An internet connection is required to access and update authenticated business records.",
    "Tallyo is not a full accounting suite and does not prepare tax returns.",
    "Tallyo does not provide legal, tax or accounting advice.",
    connectPaymentPlaceholders.availability
  ]
});

export const workflowSteps = Object.freeze([
  ["Set up your business", "Add the details and branding you want on your documents."],
  ["Add a customer", "Save the people and businesses you invoice regularly."],
  ["Create a quote or invoice", "Add services, prices, dates and payment details."],
  ["Send or download the document", "Email a saved document to the customer or download its PDF for another agreed delivery route."],
  ["Record payments and follow up", "Add deposits, part-payments or final payments, see what is left, and choose when reminders are sent."],
  ["Repeat regular invoices", "Choose when Tallyo creates the next invoice and whether it should be emailed automatically."]
]);

export const featureGroups = Object.freeze([
  {
    label: "Create and send",
    title: "Documents that look professional",
    description: "Create invoices, quotes and credit notes, add your branding, export polished PDFs and send documents from one workspace.",
    items: ["Invoices, customer-accepted quotes and credit notes", "Branded PDF documents", "Email sending and delivery updates", "Excel list export"]
  },
  {
    label: "Track payments",
    title: "See what has been paid and what is left",
    description: "Record a deposit, part-payment or final payment on the invoice and Tallyo updates the amount still to pay.",
    items: ["Deposits, part-payments and final payments", "Amount still to pay", "Payment notes and dates", connectPaymentPlaceholders.feature]
  },
  {
    label: "Save time",
    title: "Repeat less work",
    description: "Reuse customers and services, create invoices on a regular schedule and choose which overdue invoices receive reminders.",
    items: ["Saved customers", "Saved products and services", "Recurring invoices", "Opt-in overdue reminders"]
  },
  {
    label: "Stay organised",
    title: "Know what needs attention",
    description: "See what is paid, what is still due and what is late, together with a simple history of sends, reminders and payments.",
    items: ["Amounts still to pay", "Clear document status", "Activity history", "Account export"]
  },
  {
    label: "Protect access",
    title: "Practical account controls",
    description: "Confirm account ownership, add authenticator-app protection and use recovery and sign-out controls when needed.",
    items: ["Email confirmation", "Optional authenticator-app MFA", "One-time recovery codes", "Device and all-device sign-out"]
  }
]);

export const productScenes = Object.freeze([
  { id: "dashboard", label: "Overview", title: "Start with what needs attention", caption: "See money still to come in, invoices that are late, payments already recorded and the next useful action as soon as you open Tallyo.", variant: "dashboard", image: "/assets/product/tallyo-dashboard.jpg", imageAlt: "Updated Tallyo Overview using fictional data, with outstanding, overdue and paid totals plus attention and activity panels" },
  { id: "invoice-editor", label: "Invoice editor", title: "Build the invoice in clear sections", caption: "Reuse products or services, keep the totals visible and open only the part of the invoice you need to change.", variant: "document", image: "/assets/product/tallyo-invoice-editor.jpg", imageAlt: "Updated Tallyo invoice editor showing fictional line items and a live invoice summary" },
  { id: "quote", label: "Accepted quote", title: "Turn an accepted quote into an invoice", caption: "Tallyo keeps the original quote, records who accepted it and when, then creates one linked invoice. If automatic sending was chosen beforehand, Tallyo emails that invoice too.", variant: "quote", image: "/assets/product/tallyo-quote-editor.jpg", imageAlt: "Accepted fictional Tallyo quote showing Sarah Jones, the acceptance time and linked invoice INV-1048" },
  { id: "customers", label: "Customer details", title: "See the invoicing relationship", caption: "Review the customer’s balances, recent documents, recurring schedules and latest activity without turning Tallyo into a CRM.", variant: "customers", image: "/assets/product/tallyo-customers.jpg", imageAlt: "Updated Tallyo customer detail page using fictional Willow and Pine Studio documents, balances and recurring schedules" },
  { id: "recurring", label: "Recurring invoices", title: "Create regular invoices automatically", caption: "Choose how often Tallyo creates the next invoice, when the schedule starts and ends, and whether each new invoice is emailed automatically.", variant: "recurring", image: "/assets/product/tallyo-recurring.jpg", imageAlt: "Updated Tallyo recurring invoices list showing fictional monthly and quarterly schedules" },
  { id: "overdue", label: "Overdue reminders", title: "Follow up on late invoices", caption: "An invoice becomes overdue when its due date has passed and money is still owed. You decide which overdue invoices receive automatic reminders.", variant: "overdue", image: "/assets/product/tallyo-overdue.jpg", imageAlt: "Updated Tallyo reminders view showing a fictional overdue invoice with automatic reminders enabled" },
  { id: "payments", label: "Payment records", title: "Record deposits through to final payment", caption: "Add each deposit, part-payment or final payment to the same invoice. Tallyo shows what has been paid and the amount still left.", variant: "payments", image: "/assets/product/tallyo-payments.jpg", imageAlt: "Updated Tallyo payment records showing a fictional five hundred pound deposit, remaining payment and paid balance" },
  { id: "activity", label: "Activity history", title: "See what happened and when", caption: "The document history lists when an invoice was created or sent, when a reminder went out and when each payment was recorded.", variant: "activity", image: "/assets/product/tallyo-activity.jpg", imageAlt: "Updated Tallyo activity history showing fictional invoice delivery, reminder, deposit and full payment events" },
  { id: "branding", label: "Branding", title: "Make documents recognisably yours", caption: "Choose the brand colour and logo position while a live invoice preview shows exactly how customer documents will feel.", variant: "branding", image: "/assets/product/tallyo-branding.jpg", imageAlt: "Updated Tallyo branding controls with a fictional North and Stone invoice preview" },
  { id: "security", label: "Account security", title: "Choose stronger sign-in protection", caption: "Keep a primary and backup authenticator in view, and replace recovery codes from the same focused security area.", variant: "security", image: "/assets/product/tallyo-security.jpg", imageAlt: "Updated Tallyo two-factor authentication and recovery-code settings using fictional account data" },
  { id: "mobile", label: "Customer quote acceptance", title: "Make the customer’s next step obvious", caption: "The secure mobile page confirms who accepted the quote, when it happened and which invoice was created next.", variant: "mobile", image: "/assets/product/tallyo-mobile-quote.jpg", imageAlt: "Mobile Tallyo customer quote page showing a fictional accepted quote and linked invoice" }
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
    title: "Record deposits and payments",
    description: "Record money received, see the amount still to pay and understand when an optional card-payment link is available.",
    steps: [
      ["Open the invoice", "Use its Payments section to add money you have received by bank transfer, cash or another agreed method."],
      ["Record a deposit or part-payment", "Add the amount and date. Tallyo updates the amount still left to pay."],
      ["Record the final payment", "Add the remaining amount so the invoice clearly shows as paid."],
      ["Connect your payment account", connectPaymentPlaceholders.helpStep]
    ],
    note: connectPaymentPlaceholders.helpNote
  },
  {
    slug: "recurring-invoices",
    title: "Create repeat invoices automatically",
    description: "Use a recurring schedule when the same customer needs a new invoice every week, month, quarter or year.",
    steps: [
      ["Prepare the source invoice", "Save the customer, items and terms you want future invoices to use."],
      ["Choose when it repeats", "Set how often the invoice should be created, the next date and, if needed, when the schedule should stop."],
      ["Choose whether to send automatically", "Turn automatic email on only when each new invoice can go straight to the customer without another review."],
      ["Review the schedule", "See the next invoice date and pause or change the schedule when the work changes."]
    ],
    note: "Recurring invoices require a connection to Tallyo's scheduled service. Installing the app does not make recurring work run offline."
  },
  {
    slug: "overdue-reminders",
    title: "Choose when overdue reminders are sent",
    description: "An invoice is overdue when its due date has passed and there is still money to pay. You choose which invoices receive reminders.",
    steps: [
      ["Save the invoice", "The invoice must have a customer email, due date and an amount still to pay."],
      ["Enable reminders for that invoice", "Turn on the overdue reminder option only when you want follow-up for this document."],
      ["See late invoices together", "Use the overdue view to see the customer, due date and amount still to pay."],
      ["Check what was sent", "The activity history shows when the invoice and each reminder were sent."]
    ],
    note: "Tallyo does not send an overdue reminder merely because an invoice has passed its due date; you choose the invoices that use reminders."
  },
  {
    slug: "refunds-and-payment-status",
    title: "See what has been paid",
    description: "Record deposits, part-payments and final payments, then see the amount still left on the invoice.",
    steps: [
      ["Open the invoice", "The Payments section shows recorded entries and the amount still due."],
      ["Add money received", "Enter the amount, date and a short note, such as deposit or bank transfer."],
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
    title: "See what happened and when",
    description: "Read a simple timeline of document, email, reminder and payment updates.",
    steps: [
      ["Open the relevant document", "Activity is shown in the context of the invoice, quote or credit note it belongs to."],
      ["Read the latest event first", "Use timestamps and plain-language descriptions to understand recent changes."],
      ["Check payment and email details", "The Payments and email sections show the related amount or delivery result."],
      ["Export when useful", "Use the account export for a structured copy of the records currently associated with your account."]
    ],
    note: "Activity history is a useful product record, not a tamper-proof compliance audit log."
  },
  {
    slug: "install-tallyo",
    title: "Install Tallyo on your phone or computer",
    description: "See exactly which browser icon or menu to use, then add Tallyo to your desktop, taskbar or home screen.",
    steps: [
      ["Open the Tallyo app", "Visit app.tallyo.co.uk in Chrome, Microsoft Edge or Safari. Sign in if you already have an account."],
      ["Find your device below", "The illustrated cards show the exact install symbol, browser menu and wording to look for."],
      ["Choose Install or Add", "Confirm the browser message. Tallyo then appears with your other apps, on the desktop or on the home screen."],
      ["Open Tallyo from its new icon", "Use the installed icon for quicker access. Your saved business records still require an internet connection."]
    ],
    note: "Installing Tallyo adds a convenient app icon; it does not download your authenticated business records for offline use. Browser menu wording can vary slightly by version."
  }
]);

export const faqs = Object.freeze([
  { question: "What is Tallyo?", answer: "Tallyo is straightforward invoicing software built around your business. It keeps customers, quotes, invoices, payments and repeat invoicing together." },
  { question: "Who is Tallyo for?", answer: "It is designed for sole traders, freelancers, consultants, tradespeople and service companies that create quotes and invoices." },
  { question: "Can I use Tallyo on different devices?", answer: "Yes. Tallyo works in supported modern browsers on phone, tablet and computer and can be installed for quick access. Authenticated business records require an internet connection." },
  { question: "What documents can I create?", answer: "Tallyo supports invoices, quotes and credit notes. When a customer accepts a quote, Tallyo keeps that quote and creates one linked invoice. It can also email the invoice if you chose that option before sending the quote." },
  { question: "What is a recurring invoice?", answer: "A recurring invoice is a new invoice Tallyo creates on a schedule you choose, such as weekly or monthly. You decide whether each new invoice is emailed automatically or left for review." },
  { question: "What happens when an invoice is overdue?", answer: "An invoice is overdue when its due date has passed and money is still owed. Tallyo shows it in the overdue view, but sends reminders only for invoices where you turned reminders on." },
  { question: "Can I record a deposit or part-payment?", answer: "Yes. Add a deposit, part-payment or final payment to the invoice and Tallyo shows how much is still left to pay." },
  { question: "What does activity history show?", answer: "Activity history shows when a document was created or sent, when reminders went out and when payments were recorded." },
  { question: "Can customers pay an invoice by card?", answer: connectPaymentPlaceholders.faq },
  { question: "Can I export my records?", answer: "Yes. Tallyo can create a structured account export and offers Excel export for document lists." },
  { question: "Does Tallyo replace accounting software?", answer: "No. Tallyo helps with invoicing and business records, but it is not a full accounting suite and does not prepare tax returns." },
  { question: "How do I get support?", answer: "Use the Help Centre for step-by-step guidance or email main@tallyo.co.uk for help with your Tallyo account or service." }
]);

export const installationSteps = Object.freeze([
  ["Chrome on a computer", "Look at the right end of the address bar for the install symbol, then choose Install. If it is not shown, open the three-dot menu and look for Install Tallyo or Install page as app."],
  ["Microsoft Edge", "Look for the App available symbol at the right end of the address bar. Or open the three-dot menu, then choose More tools, Apps and Install this site as an app."],
  ["Android Chrome", "Tap the three-dot menu to the right of the address bar, choose Install and create shortcut, then choose Install."],
  ["iPhone or iPad Safari", "Tap the Page Menu or Share symbol, choose Share if needed, scroll to Add to Home Screen, turn on Open as Web App and tap Add."]
]);
