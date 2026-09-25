# Seven-day trial Owner risk acceptance

Date: 25 September 2026  
Decision owner: Tallyo Owner  
Status: Accepted for the bounded live release described below

## Decision

The Owner explicitly decided that an external professional legal review is not required before this release and instructed that the seven-day Tallyo Pro trial go live. This is an Owner acceptance of the remaining legal and commercial risk. It is not a professional legal opinion or a certification of compliance.

## Affected feature and users

- one card-required seven-day trial per Tallyo account;
- monthly Tallyo Pro only, continuing at £8 per month unless cancelled before the trial ends;
- business users in the current approved launch scope;
- no change to the account-free, card-free Free Invoice Maker;
- no bank-debit trial, annual-plan trial, consumer-specific offer or additional-territory approval.

## Evidence considered

- `docs/legal/TRIAL_SUBSCRIPTION_REVIEW.md`;
- `docs/architecture/STRIPE_BILLING.md`;
- fixed server-side duration and Price allowlist;
- signed Stripe webhook reconciliation and provider-derived entitlements;
- one-trial-per-account marker and concurrent Checkout claim;
- online cancellation through the existing Stripe Customer Portal;
- adjacent trial, renewal-price and cancellation wording in the app and website;
- a Tallyo transactional reminder sent from the signed three-day trial-ending event with provider idempotency and a durable sent marker;
- fail-closed server, app and website release gates;
- the current production backup and rollback controls recorded in `RELEASE_READINESS.md`.

## Retained controls and conditions

- The release must still pass technical deployment, provider, security, build and readback gates.
- Stripe Checkout must collect a card and show the trial and recurring price before confirmation.
- The reminder, cancellation route and signed webhook destination must be operational before public trial controls are enabled.
- No browser value may choose the trial duration, Price or entitlement.
- Existing subscription, payment, refund and privacy runbooks remain in force.
- A failed release must disable the public and server trial gates before any rollback of reconciliation code.

## Residual risk accepted

The Owner accepts that users may misunderstand or miss renewal disclosures, that an email can be delayed or fail despite operational controls, and that the legal classification of a subscriber can depend on the facts. The Owner also accepts the risk of proceeding without external professional review for this bounded business-user release.

## Re-review boundary

Review this decision no later than 25 December 2026, and earlier if the price, duration, reminder timing, cancellation flow, payment method, audience, territory, subscription law, provider behavior or customer complaints materially change. Consumer-targeted availability or a material expansion beyond the current business-user scope requires a fresh Owner decision and should obtain external professional advice.
