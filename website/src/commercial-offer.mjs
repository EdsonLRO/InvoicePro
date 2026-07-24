export const commercialOffer = Object.freeze({
  free: Object.freeze({
    name: "Free Invoice Maker",
    price: "£0",
    audience: "No account required",
    privacy: "The Free Invoice Maker works in your browser. Tallyo does not automatically save the document to an account.",
    features: Object.freeze([
      "Create an invoice or quote",
      "Add business and customer details",
      "Add line items, discounts and tax fields",
      "Upload a local logo",
      "Preview, print or save as PDF"
    ]),
    exclusions: Object.freeze([
      "No saved customer or service records",
      "No document history or Tallyo email sending",
      "No payment tracking, recurring invoices or reminders",
      "No cloud account storage, credit notes or online payments"
    ])
  }),
  pro: Object.freeze({
    name: "Tallyo Pro",
    monthlyPrice: "£8",
    annualPrice: "£80",
    annualEquivalent: "Approximately £6.67 per month when paid annually",
    annualSaving: "Save £16 compared with paying monthly for twelve months.",
    audience: "One business · One user",
    availability: "Subscriptions are being prepared",
    features: Object.freeze([
      "Invoices, quotes and credit notes",
      "Saved customers, products and services",
      "Branded PDFs and document email",
      "Payment-status tracking and manual payment records",
      "Paid, due and overdue balances",
      "Recurring invoices and optional automatic recurring email",
      "Opt-in overdue reminders",
      "Document activity history",
      "Spreadsheet and account-data exports",
      "Installation on supported devices",
      "Optional authenticator-app MFA",
      "Standard support"
    ]),
    reasonableUse: "No monthly document limit for normal business use. Reasonable rate and abuse controls may apply."
  }),
  billing: Object.freeze({
    setupFee: "No setup fee. No complicated packages.",
    sameFeatures: "Monthly and annual subscriptions include the same Tallyo Pro features.",
    noTrial: "Tallyo does not currently offer a full-feature free trial.",
    evaluation: "Use the Free Invoice Maker without an account, or choose the monthly subscription as the low-commitment evaluation route.",
    cancellation: "You can cancel future renewal at any time. Your paid access will normally continue until the end of the billing period you have already paid for.",
    annualRefund: "Annual subscriptions are paid upfront for twelve months of access. Cancelling future renewal does not normally create an automatic partial refund for unused time. This does not affect rights or refunds required by applicable law."
  }),
  paymentAvailability: "Online card payments for independent business accounts are being prepared and are not included in the launch subscription yet."
});

export const pricingFaqs = Object.freeze([
  Object.freeze({
    question: "Is there a free trial?",
    answer: "Tallyo does not currently offer a full-feature free trial. You can use the Free Invoice Maker without an account before deciding whether the saved Tallyo Pro workspace is suitable for your business. The monthly subscription is the low-commitment evaluation route."
  }),
  Object.freeze({
    question: "Do monthly and annual plans have different features?",
    answer: "No. Both billing options include the same Tallyo Pro features. Annual billing costs £80 upfront and saves £16 compared with twelve monthly payments."
  }),
  Object.freeze({
    question: "What happens when I cancel?",
    answer: "Cancelling stops future renewal. Paid access will normally continue until the end of the billing period already paid for. Existing records are not immediately deleted."
  }),
  Object.freeze({
    question: "Can I get a refund for unused annual time?",
    answer: "Cancelling an annual subscription does not normally create an automatic partial refund for unused time. Incorrect or duplicate charges and qualifying service failures can be reviewed. Rights and refunds required by applicable law are unaffected."
  }),
  Object.freeze({
    question: "Are online card payments included?",
    answer: "Not for independent business accounts at launch. Tallyo is preparing a separate Stripe Connect path so each participating business can connect its own payment account."
  })
]);
