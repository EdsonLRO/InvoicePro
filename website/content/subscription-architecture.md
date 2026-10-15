# Tallyo subscription architecture

## Current boundary

This is a public-content architecture record. It does not itself enable
subscription checkout, create a Stripe customer, configure Stripe products or
prices, alter secrets, grant entitlements or change the customer invoice-payment
flow. Runtime release remains controlled by the existing server and website
feature gates.

The approved commercial content has two offers:

- **Free Invoice Maker:** £0, no account, one browser-local document workflow.
- **Tallyo Pro:** one business and one user, £8 monthly or £80 annually, with
  the same product features for either billing interval.

The monthly plan includes one card-required seven-day trial per account. Unless
the customer cancels online first, it continues automatically at £8 per month.
Tallyo emails a reminder three days before the trial ends. The annual option
saves £16 compared with twelve monthly payments and does not include the trial.
These approved display values are not Stripe price identifiers and do not
activate billing.

## Authoritative architecture

The durable Stripe Billing design, lifecycle states, entitlement boundary,
security requirements, testing gates and later implementation sequence are in
`docs/architecture/STRIPE_BILLING.md`.

Customer invoice payments are a separate commercial and technical system. The
required multi-business merchant path and Stripe Connect preparation are in
`docs/architecture/STRIPE_CONNECT.md`.

## Current release boundary

Subscription Checkout, server-enforced entitlements, online cancellation and
the seven-day monthly-plan trial are released. Stripe-hosted Checkout and the
Customer Portal remain separate from customer invoice payments through a
connected business account.

The checked-in source stays fail-closed. A production website build can publish
the trial only when subscription Checkout and the separate trial release gates
are both enabled. Preview builds require their own reviewed preview approvals.

Any future change to prices, trial length, renewal, cancellation, refunds,
entitlements, provider configuration or live payment behaviour requires a new
focused review and the applicable Owner approval.
