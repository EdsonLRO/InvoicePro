# DRAFT - NOT APPROVED - DO NOT PUBLISH

Internal working copy for product, Payments, and qualified UK legal/privacy review. It must not be shown as approved customer wording.

# Tallyo Support, Complaints and Payment Wording

## Public Contact Block

- **Business and support:** `[APPROVED PUBLIC CONTACT ROUTE]`
- **Privacy requests and data-protection complaints:** `[APPROVED PUBLIC CONTACT ROUTE OR APPROVED LABEL FOR SAME ROUTE]`
- **Operator:** `[CONTRACTING SOLE-TRADER NAME AND APPROVED SERVICE/CONTACT ADDRESS]`
- **Support hours/target:** `[OWNER TO APPROVE; DO NOT PROMISE 24/7]`

Never ask a person to send a password, authenticator secret, recovery code, full card number, identity document, or unnecessary customer data through ordinary support.

## Support Wording

Tallyo provides support for use of the invoicing software and account operation. We do not provide legal, tax, accounting, regulated financial, debt-collection, or professional advice. Business users remain responsible for their documents, tax/VAT treatment, customer relationships, and record retention.

For account-security concerns, ask the user to change their password through the trusted application route and follow the approved recovery process. Do not request secret authentication material. For suspected personal-data incidents, immediately apply `PRIVACY_OPERATIONS_RUNBOOK.md` and keep case evidence out of ordinary Git/chat.

No response-time, resolution-time, availability, or data-recovery guarantee is approved. Any service target must state whether it is a target or binding commitment, its hours/time zone, exclusions, escalation path, and remedy.

## Service Complaints

1. Acknowledge through the controlled route and record a non-identifying case reference.
2. Confirm the issue, requested outcome, relevant account/business authority, and whether payment, privacy, security, accessibility, or legal escalation is triggered.
3. Investigate proportionately, keep the complainant informed, state the outcome and reasons, and record any corrective action.
4. Route invoice, goods/services, debt, refund-entitlement, or customer-contract disputes to the business user where Tallyo is not the seller or contracting party.

Final customer wording needs an approved acknowledgement target, escalation route, and any external dispute-resolution information legally required for the final business model.

## Data-Protection Complaints

A data-protection complaint is a complaint that Tallyo or a relevant business user may have infringed data-protection law in relation to the complainant's personal information. The controlled route must:

- make it clear how a person can submit a complaint;
- acknowledge receipt within 30 days;
- without undue delay, make appropriate enquiries and take appropriate steps to respond;
- keep the complainant informed; and
- communicate the outcome without undue delay.

The response should explain the decision, action taken, relevant controller/processor routing, and the person's ability to complain to the ICO. Contacting Tallyo must not be presented as removing any right to approach the ICO. Identity verification must be proportionate; do not collect an identity document by default.

## Invoice and Seller Responsibility

Tallyo supplies software to the business user. The business user, not Tallyo, supplies the invoiced goods or services, sets the price and payment terms, decides whether money is owed, and handles its customer dispute. Tallyo does not guarantee the legal, tax, accounting, or factual accuracy of an invoice.

The business user must ensure its invoice contains the information applicable to its legal form and tax status. GOV.UK currently states that a sole trader invoice must include the trader's name and any business name, and an address where legal documents can be delivered if a business name is used: <https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include>.

## Stripe Payment Status

Where the business user enables it, a payer is sent to a Stripe-hosted Checkout page. Card entry stays with Stripe. Tallyo records a successful payment only after trusted signed webhook evidence is validated and bound to the expected invoice/payment. A browser return page, screenshot, email claim, or unverified message is not proof of payment.

Payment processing may be unavailable, delayed, rejected, reversed, disputed, or subject to Stripe/financial-provider checks. Final wording must identify the contracting Stripe services and applicable provider terms without implying that Tallyo is a bank, payment institution, escrow service, or guarantor.

## Refunds

The business user decides whether a refund is due under its customer contract and applicable law. A Tallyo refund action submits the authorised request to Stripe. The in-app status must remain pending until trusted provider confirmation is received. A successful request does not guarantee when a payer's bank makes funds available, and a failed or reversed refund must be shown honestly.

Any customer-facing refund policy must define who can request/approve a refund, eligibility, partial refunds, fees, timing targets, failed refunds, duplicate requests, disputes/chargebacks, record retention, and the route for a payer to contact the seller. Do not promise `instant`, `guaranteed`, or universal refunds.

## Chargebacks and Disputes

Stripe or a financial institution may open, decide, or reverse a payment dispute. Tallyo may show provider status and support reconciliation but does not decide the card-scheme/bank outcome. The business user remains responsible for appropriate evidence, deadlines, customer communication, and professional advice. Security, fraud, legal and privacy cases must use restricted evidence handling.

## Cancellation and Account Closure

No public Tallyo SaaS price, trial, subscription, automatic renewal, minimum term, or cancellation model is approved. Final wording must match the actual offer and explain charges/taxes, renewal, cancellation method/effect, export, closure, refunds/credits, suspension, outstanding payment disputes, deletion, backups, and legal holds.

The initial eligibility rule is business use only. Do not rely on that label to remove a right or remedy that cannot lawfully be excluded, including where a user is legally treated as a consumer despite the intended scope.

## Approval Gate

Before publication, reconcile this wording with the final Terms, Privacy Notice, data-processing terms, Stripe production account, actual support route/hours, retention implementation, and qualified legal advice. Separate Owner approval is required for publication, live Stripe, real-customer communication, and launch.
