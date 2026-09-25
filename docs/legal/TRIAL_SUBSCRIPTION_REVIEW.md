# Seven-day subscription trial legal and operational review

Status: The implementation review is complete. On 25 September 2026 the Owner explicitly accepted the remaining legal and commercial risk, elected to proceed without external professional review and authorised the bounded live release, subject to the technical gates in this document and `RELEASE_READINESS.md`. See `TRIAL_SUBSCRIPTION_OWNER_RISK_ACCEPTANCE_2026-09-25.md`.

## 1. Jurisdiction and intended launch territory

The current legal and operational baseline remains a United Kingdom business-user launch. The product may be visible internationally, but this review does not approve offering the trial in additional territories. International expansion requires a separate territory and contract review.

## 2. Affected users

The intended subscribers are sole traders, companies and their authorised employees using Tallyo for business. Customer contacts whose details appear in invoices are not parties to the Tallyo subscription. Consumer-grade clarity and cancellation safeguards are still used because an individual may subscribe and the legal classification can depend on the facts.

## 3. Feature, data and money flows

- The account owner chooses the seven-day Tallyo Pro trial for the monthly plan.
- Tallyo creates a Stripe-hosted Checkout Session. Stripe collects the card; Tallyo does not receive or store full card details.
- The Checkout page must disclose that the trial becomes an £8 monthly subscription after seven days unless cancelled before the trial ends.
- Signed Stripe lifecycle events update the owner-scoped subscription and entitlement records. `trialing` grants full product access.
- Stripe emits `customer.subscription.trial_will_end` approximately three days before the end. After signed reconciliation, Tallyo sends the account owner a transactional reminder through the existing Resend service. The request uses the Stripe event identifier as its provider idempotency key and records successful delivery submission on the Billing event.
- If the user cancels during the trial, access continues until the trial end and no first subscription charge should be taken. Cancellation does not delete account or document data.
- If the first charge fails, the existing bounded grace/read-only entitlement model applies. Refunds and disputes remain governed by the existing runbook.
- The account may use the introductory trial once. An expired, uncompleted Checkout does not consume it; a created trial subscription does.
- The account-free Free Invoice Maker remains unchanged and requires neither a card nor a trial.

## 4. Controller and processor roles

Tallyo remains controller for account, subscription-status and service records. Stripe acts as payment provider and processor for payment-method and transaction data under its contractual terms. Supabase processes account and entitlement records. No new vendor or controller/processor role is introduced.

## 5. Applicable law, guidance and platform rules

The design must follow the applicable UK unfair-commercial-practices rules under the Digital Markets, Competition and Consumers Act 2024, CMA guidance on subscription traps, UK GDPR and Data Protection Act 2018 transparency and minimisation duties, Stripe Checkout and Billing rules, and the existing Tallyo business terms. The future UK subscription-contract regime is expected to add prescriptive duties and must be reviewed before it takes effect or before any consumer launch.

## 6. Current product behaviour and evidence

Tallyo currently offers direct monthly (£8) and annual (£80) hosted Stripe Checkout with server-enforced entitlements, signed webhook reconciliation, an online Stripe Billing Portal and an unchanged account-free invoice maker. The authoritative product decision currently says no trial; this approved product decision supersedes that entry and must be reflected in the same branch.

## 7. Foreseeable failures and affected people

- A user could miss the renewal disclosure or reminder and be unexpectedly charged.
- Reminder delivery could fail or arrive late.
- Duplicate or replayed Checkout/webhook requests could create duplicate subscriptions or entitlements.
- A user could attempt repeated trials with the same account.
- A payment failure could incorrectly remove access or leave access enabled indefinitely.
- Cancellation could be confusing, unavailable or mistaken for account deletion.
- Provider test/live configuration could be mixed.
- Public wording could promise a trial before the backend and Stripe settings are ready.

These failures principally affect the subscribing account owner and may indirectly affect their business records and customer communications.

## 8. Mandatory controls and recommended safeguards

- Fix the trial at seven days on the server; the browser cannot choose its duration.
- Offer it only on the £8 monthly plan; the £80 annual plan remains a direct paid option.
- Require Stripe Checkout to collect a card and fail safely if no payment method is available.
- Disclose duration, post-trial price, automatic monthly renewal, warning timing and cancellation path before Checkout.
- Provide online cancellation through the existing Billing Portal and preserve access until the paid/trial period ends.
- Record trial use atomically against the owner mapping and reject a second trial for that account.
- Treat `trialing` as full access and preserve existing grace/read-only states after payment failure.
- Verify webhook signatures, mode, price allowlist, ownership, event ordering and idempotency.
- Keep separate server and public-build trial gates, both off by default, with additional explicit approval required in live mode.
- Keep the Free Invoice Maker outside subscription and card requirements.
- Do not delete business data when the trial or subscription ends.
- Monitor provider delivery and support users if a reminder is not delivered.

## 9. Required user-facing wording and notices

Before the user enters Checkout, use substantively equivalent wording:

> Start your 7-day free trial. A card is required. Unless you cancel before the trial ends, your Tallyo Pro subscription will start automatically at £8 per month. We will email you three days before the trial ends. If you cancel during the trial, you keep access until it ends and will not be charged. You can cancel online from Billing, and cancelling does not delete your Tallyo data.

Stripe Checkout and the confirmation record must show the trial end or first-charge date, amount, billing interval and cancellation route. Avoid “free” without the adjacent renewal conditions. Terms, Pricing, Privacy and support wording must be reviewed together before publication.

## 10. Retention, rights, vendor and transfer implications

Store only Stripe customer/subscription identifiers, plan/status dates, lifecycle evidence and `trial_used_at`; do not store full card data. Trial evidence follows the existing billing-record retention and access controls. Account export/deletion and data-subject rights remain unchanged, subject to lawful retention of billing evidence. Stripe and Supabase remain the relevant vendors and existing transfer documentation must stay current.

## 11. Testing and operational evidence required

- Migration tests for RLS, grants, one-trial enforcement and `trialing` entitlement mapping.
- Function tests for the fixed duration, monthly-only rule, card collection, live/test gates, allowlisted price, idempotency, pending-Session validation and signed `trial_will_end` handling.
- UI/build tests proving the offer is hidden unless explicitly enabled and that required disclosure is present.
- Stripe test-clock or equivalent sandbox evidence for trial creation, three-day event, cancellation before charge, conversion to active, payment failure and repeat-trial rejection, or a recorded release decision explaining which deterministic function/database tests and provider readbacks substitute for an unavailable isolated test environment.
- Billing Portal cancellation and support/runbook evidence.
- No live provider change, real charge or customer message during repository validation.

## 12. Uncertainty and external-advice triggers

External professional review was recommended because this change introduces an automatically renewing trial and cancellation obligations. The Owner explicitly elected to proceed without it for the bounded business-user release and accepted the residual risk in `TRIAL_SUBSCRIPTION_OWNER_RISK_ACCEPTANCE_2026-09-25.md`. Re-review is required for consumer-targeted availability, another territory, a different trial duration or price, bank-debit collection, in-app cancellation changes, refunds, reminder timing changes or the commencement of the UK subscription-contract regime.

## 13. Release disposition

**Owner authorised for the bounded live release on 25 September 2026 with the remaining legal risk explicitly accepted. Technical deployment, provider, reminder, security, build and production-readback gates remain mandatory.**
