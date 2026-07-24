# Tallyo subscription architecture

## Current boundary

This is a design-only website record. It does not enable subscription checkout,
create a Stripe customer, configure Stripe products or prices, alter secrets,
grant entitlements or change the existing invoice-payment flow.

The approved commercial content has two offers:

- **Free Invoice Maker:** £0, no account, one browser-local document workflow.
- **Tallyo Pro:** one business and one user, £8 monthly or £80 annually, with
  the same product features for either billing interval.

Tallyo does not currently offer a full-feature free trial. The annual option
saves £16 compared with twelve monthly payments. These approved display values
are not Stripe price identifiers and do not activate billing.

## Authoritative architecture

The durable Stripe Billing design, lifecycle states, entitlement boundary,
security requirements, testing gates and later implementation sequence are in
`docs/architecture/STRIPE_BILLING.md`.

Customer invoice payments are a separate commercial and technical system. The
required multi-business merchant path and Stripe Connect preparation are in
`docs/architecture/STRIPE_CONNECT.md`.

## Remaining Owner gates

Before any runtime or production work:

1. approve tax presentation and final contractual cancellation/refund wording;
2. review the Billing schema, RLS, webhooks and server-enforced entitlements;
3. approve Stripe products and allowlisted Price IDs;
4. approve production secrets, webhook destinations and provider changes;
5. approve controlled test and live acceptance payments;
6. approve public pricing checkout and production release.

Until those gates are passed, subscription controls must remain non-transactional
and clearly state that subscriptions are being prepared.
