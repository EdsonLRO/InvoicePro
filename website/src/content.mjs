import { connectPaymentPlaceholders } from "./commercial-offer.mjs";

export const productFacts = Object.freeze({
  positioning: "Professional invoices. Clear payment updates. Less admin.",
  supporting:
    "Create quotes and invoices, record deposits and payments, repeat regular invoices and keep every update in one straightforward workspace.",
  limitations: [
    "An internet connection is required to access and update authenticated business records.",
    "Tallyo is not a full accounting suite and does not prepare tax returns.",
    "Income views cover invoices and payments recorded in Tallyo. They do not include expenses, income received elsewhere, bank balances, tax calculations or HMRC filing.",
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
    label: "Create and agree",
    title: "Move from a clear quote to the invoice",
    description: "Create invoices, quotes and credit notes, review the recipient before sending and give customers a straightforward way to accept a quote.",
    items: ["Invoices, quotes and credit notes", "Secure customer quote acceptance", "One linked invoice created after acceptance", "Optional automatic invoice email or review first"],
    image: "/assets/product/growth-studio/quote-email-review.png",
    imageAlt: "Current Tallyo quote email review showing a fictional recipient, customer-response link and optional automatic invoice email",
    imageCaption: "Current Tallyo quote review using fictional demonstration data."
  },
  {
    label: "Reuse everyday details",
    title: "Keep customers and services ready for next time",
    description: "Save the details you use repeatedly, then bring them into a new document without typing the same information again.",
    items: ["Saved customers", "Reusable products and services", "Default descriptions and prices", "Customer documents, balances and recurring work together"],
    image: "/assets/product/growth-studio/products-services.png",
    imageAlt: "Current Tallyo products and services page showing three reusable fictional services and their default prices",
    imageCaption: "Current Tallyo products and services screen using fictional demonstration data."
  },
  {
    label: "Repeat and follow up",
    title: "Let regular invoicing follow your schedule",
    description: "Choose when Tallyo creates each recurring invoice, whether it should be emailed automatically and which overdue invoices receive reminders.",
    items: ["Weekly, monthly, quarterly or yearly schedules", "Automatic email or review before sending", "Opt-in overdue reminders", "Recurring history and next-run visibility"],
    image: "/assets/product/growth-studio/recurring-edit.png",
    imageAlt: "Current Tallyo recurring schedule editor showing a fictional monthly website maintenance invoice and automatic email choice",
    imageCaption: "Current Tallyo recurring schedule using fictional demonstration data."
  },
  {
    label: "Payments and income",
    title: "Understand the income recorded in Tallyo",
    description: "Record deposits, part-payments, final payments and refunds, then use accessible summaries to see what was invoiced, received, still due or overdue.",
    items: ["Manual payment records and amount still to pay", connectPaymentPlaceholders.feature, "Income Insights with clear charts and written values", "Income records, UK period organisation and a downloadable Income Pack"],
    note: "Income views use only invoices and payments recorded in Tallyo. They do not include expenses, income received elsewhere, bank balances, tax calculations or HMRC filing.",
    image: "/assets/product/growth-studio/income-insights.png",
    imageAlt: "Current Tallyo Finances overview showing fictional invoiced, received, outstanding and overdue values with accessible charts",
    imageCaption: "Current Tallyo Income Insights using fictional demonstration data."
  },
  {
    label: "Brand every document",
    title: "Choose the document style that suits your business",
    description: "Apply one consistent presentation to invoices, quotes, credit notes, downloaded PDFs and emailed PDF attachments.",
    items: ["Tallyo, Basic, Modern and Professional layouts", "Brand colour and logo position", "Optional alternating item-row colours", "Live preview before saving"],
    image: "/assets/product/growth-studio/document-layouts.png",
    imageAlt: "Current Tallyo Branding page showing Tallyo, Basic, Modern and Professional document layouts, colours and logo positions",
    imageCaption: "Current Tallyo branding controls using fictional demonstration data."
  },
  {
    label: "Sign in and stay in control",
    title: "Use familiar access with practical protection",
    description: "Sign in with Google or email and password, then add stronger account protection and review your account data when needed.",
    items: ["Google or email-and-password sign-in", "Optional authenticator-app MFA", "One-time recovery codes and session controls", "Account data export and installable app access"],
    image: "/assets/product/growth-studio/google-sign-in.png",
    imageAlt: "Current Tallyo sign-in page with Continue with Google and email-and-password options beside the Tallyo workspace introduction",
    imageCaption: "Current Tallyo sign-in screen. No customer or account data is shown."
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
  { id: "finances", label: "Income Insights", title: "See the income recorded in Tallyo", caption: "Compare invoiced, received, outstanding and overdue amounts with accessible charts and the exact written values behind them. Currencies remain separate.", variant: "finances", image: "/assets/product/growth-studio/income-insights.png", imageAlt: "Current Tallyo Finances overview showing fictional invoiced, received, outstanding and overdue values with accessible charts" },
  { id: "income-pack", label: "Income Pack", title: "Prepare clear income records", caption: "Download reconciled income files and a readable PDF summary prepared locally from the selected period and currency. The pack is not an HMRC submission and does not include expenses or income received elsewhere.", variant: "records", image: "/assets/product/growth-studio/income-pack.png", imageAlt: "Current Tallyo Prepare income records page showing fictional income files, record counts, currency and calculation version" },
  { id: "branding", label: "Branding", title: "Make documents recognisably yours", caption: "Choose the brand colour and logo position while a live invoice preview shows exactly how customer documents will feel.", variant: "branding", image: "/assets/product/tallyo-branding.jpg", imageAlt: "Updated Tallyo branding controls with a fictional North and Stone invoice preview" },
  { id: "layouts", label: "Document layouts", title: "Choose how customer documents feel", caption: "Select Tallyo, Basic, Modern or Professional, then choose your colour, logo position and whether item rows alternate.", variant: "layout", image: "/assets/product/growth-studio/document-layouts.png", imageAlt: "Current Tallyo Branding page showing Tallyo, Basic, Modern and Professional document layouts, colours and logo positions" },
  { id: "security", label: "Account security", title: "Choose stronger sign-in protection", caption: "Keep a primary and backup authenticator in view, and replace recovery codes from the same focused security area.", variant: "security", image: "/assets/product/tallyo-security.jpg", imageAlt: "Updated Tallyo two-factor authentication and recovery-code settings using fictional account data" },
  { id: "google-sign-in", label: "Sign in", title: "Continue with Google or your Tallyo password", caption: "Use the released Google sign-in option or continue with email and password. New social-only accounts set a backup password before business data loads.", variant: "access", image: "/assets/product/growth-studio/google-sign-in.png", imageAlt: "Current Tallyo sign-in page with Continue with Google and email-and-password options beside the Tallyo workspace introduction" },
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
    description: "Choose the right document, add customer and line-item details, then send, download or share a quote for acceptance.",
    steps: [
      ["Choose the document type", "Use a quote before work is agreed, an invoice when payment is due, or a credit note to reduce an issued invoice."],
      ["Add the customer and dates", "Select a saved customer or enter the details needed on the document, then set the issue and due dates."],
      ["Add products or services", "Use saved items or enter a clear description, quantity, unit price and applicable tax."],
      ["Review and share", "Save the document and check its PDF. For a quote, review the recipient and choose whether the linked invoice should be emailed automatically after acceptance before you send it."]
    ],
    note: "When a customer accepts through the secure quote page, Tallyo keeps the accepted quote and creates one linked invoice. A credit note records a reduction; it is not the same as deleting the original invoice."
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
    description: "Choose Google or email-and-password sign-in, add authenticator-app protection and keep recovery codes safe.",
    steps: [
      ["Choose how to sign in", "Continue with Google or use your confirmed email and password. Tallyo does not receive your Google password."],
      ["Confirm your email", "Email-and-password accounts complete email confirmation before business records are used."],
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
    slug: "income-insights-and-income-pack",
    title: "Review income recorded in Tallyo",
    description: "Use Income Insights to understand recorded invoice income, then prepare an Income Pack for a chosen period and currency.",
    steps: [
      ["Open Finances", "Choose the business-wide view or open a customer to focus on the income connected to that customer."],
      ["Choose a period and currency", "Tallyo keeps currencies separate and shows only the records that match your chosen view."],
      ["Review the figures", "Compare invoiced, received, outstanding and overdue amounts using the charts and the exact written values beside them."],
      ["Prepare an Income Pack", "Choose the period and currency, review the included record count, then download the reconciled files and readable PDF summary."]
    ],
    note: "These views cover only income recorded in Tallyo. They do not include expenses, income received elsewhere, bank balances, profit, tax calculations, VAT liability or HMRC submission."
  },
  {
    slug: "document-layouts-and-branding",
    title: "Choose a document layout and branding",
    description: "Choose how invoices, quotes and credit notes look, then preview your colour, logo and item-row preferences.",
    steps: [
      ["Open Branding", "Use the Branding area in Settings to see the document presentation controls and live preview."],
      ["Choose a layout", "Select Tallyo, Basic, Modern or Professional to find the structure that suits your business."],
      ["Add your visual details", "Choose the brand colour and logo position, and decide whether item rows should use alternating colours."],
      ["Preview and save", "Check the sample document at different preview sizes, save your choices and review a final PDF before sending it to a customer."]
    ],
    note: "The selected presentation is used consistently for invoices, quotes, credit notes, downloaded PDFs and emailed PDF attachments."
  },
  {
    slug: "install-tallyo",
    title: "Install Tallyo on your phone or computer",
    description: "Open the Tallyo app first, then use the browser action for your phone, tablet or computer.",
    steps: [
      ["Open the Tallyo app", "Choose Open Tallyo app on this guide, or visit app.tallyo.co.uk. The marketing website cannot be installed as Tallyo, and you do not need to sign in before using the browser's install action."],
      ["Find your device below", "With app.tallyo.co.uk open, use the illustrated card for your browser and device."],
      ["Choose Install or Add", "Confirm the browser message. Tallyo then appears with your other apps, on the desktop or on the home screen."],
      ["Open Tallyo from its new icon", "Use the installed icon for quicker access. Your saved business records still require an internet connection."]
    ],
    note: "Install Tallyo only while app.tallyo.co.uk is open. Installing adds a convenient app icon; it does not download your authenticated business records for offline use. Browser menu wording can vary slightly by version."
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
  { question: "What does Income Insights show?", answer: "Income Insights shows invoiced, received, outstanding and overdue amounts from records in Tallyo, with accessible charts and written values. Currencies remain separate." },
  { question: "What is the Income Pack?", answer: "The Income Pack prepares reconciled income files and a readable PDF summary for a period and currency you choose. It is not an HMRC submission and does not include expenses or income received elsewhere." },
  { question: "Can I choose how my documents look?", answer: "Yes. Choose the Tallyo, Basic, Modern or Professional layout, then set your colour, logo position and whether item rows use alternating colours." },
  { question: "Can I sign in with Google?", answer: "Yes. Continue with Google is available alongside email and password. Google provides the basic identity details needed to sign you in, and Tallyo does not receive your Google password." },
  { question: "Can customers pay an invoice by card?", answer: connectPaymentPlaceholders.faq },
  { question: "Can I export my records?", answer: "Yes. Tallyo can create a structured account export and offers Excel export for document lists." },
  { question: "Does Tallyo replace accounting software?", answer: "No. Tallyo helps with invoicing and income records connected to it, but it does not include expenses, income received elsewhere, profit, tax calculations, VAT liability or HMRC filing." },
  { question: "How do I get support?", answer: "Use the Help Centre for step-by-step guidance or email main@tallyo.co.uk for help with your Tallyo account or service." }
]);

export const installationSteps = Object.freeze([
  ["Chrome on a computer", "With app.tallyo.co.uk open, look at the right end of the address bar for the install symbol and choose Install. If it is not shown, open the three-dot menu and look for Install Tallyo or Install page as app."],
  ["Microsoft Edge on a computer", "With app.tallyo.co.uk open, look for the App available symbol at the right end of the address bar. Or open the three-dot menu, choose Apps, then Install Tallyo or Install this site as an app."],
  ["Chrome on an Android phone or tablet", "With app.tallyo.co.uk open, tap the three-dot menu beside the address bar. Choose Install app, Add to Home screen or Install and create shortcut, then confirm Install."],
  ["Safari on an iPhone or iPad", "With app.tallyo.co.uk open, tap Share. If Share is inside the Page Menu on your version of Safari, open that menu first. Choose Add to Home Screen, keep Open as Web App turned on if it is shown, then tap Add."]
]);
