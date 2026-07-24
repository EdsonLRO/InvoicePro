# Stripe Connect launch decision pack

Status: Recommendation awaiting Owner approval. Repository analysis only; no Stripe or Supabase change is authorised by this record.

## Product boundary

Stripe Billing charges a Tallyo business for Tallyo Pro. Stripe Connect lets that business receive invoice payments from its own customers. The two flows must use separate endpoints, mappings, webhooks, evidence and operational controls.

The existing Owner-account payment integration must remain unavailable to unrelated public businesses.

## Recommended launch model

| Decision | Recommendation | Reason |
|---|---|---|
| Connected-account API | Accounts v2 with the Merchant configuration for new connections | Current Stripe model for a connected business accepting customer payments; responsibilities are explicit and fixed at creation. |
| Charge type | Direct charges | The payment belongs to the connected business, which matches independent invoice collection. |
| Merchant of record | Connected business | Its customer, service, receipt, statement, refund and dispute relationship remains with that business. |
| Stripe fees | `fees_collector = stripe` | Stripe collects processing fees from the connected account; Tallyo does not intermediate those fees. |
| Negative-balance losses | `losses_collector = stripe` | Avoids making Tallyo responsible for connected-account payment losses at initial launch. |
| Tallyo application fee | None | Matches the approved initial pricing direction; Tallyo earns its software subscription only. |
| Dashboard | `full`, when supported for the selected configuration | Lets the business manage payments, refunds, payouts and disputes directly in Stripe. |
| Onboarding | Stripe-hosted onboarding | Lowest implementation and maintenance burden; Stripe handles changing verification requirements. |
| Requirement collection | Stripe-managed | Tallyo must not collect identity documents or banking details. |
| Customer payment UI | Stripe-hosted Checkout | Tallyo never receives full card data. |

Stripe documents that responsibility fields are selected when the Merchant configuration is added and cannot be changed later. This makes the approval a material payment-risk decision.

## Money and responsibility flow

1. The signed-in Tallyo owner starts Stripe onboarding.
2. A trusted server creates or resumes the account-specific Stripe-hosted onboarding flow.
3. Stripe collects identity, business and payout information directly.
4. Tallyo stores only the tenant-bound connected-account identifier and provider-derived status required to enable payments.
5. When capability and requirement checks pass, Tallyo may create a Checkout Session as that connected account for an invoice owned by the same Tallyo account.
6. The payer pays the connected business through Stripe-hosted Checkout.
7. Stripe deducts its fees from the connected account and pays out to that business.
8. Signed connected-account events update the matching Tallyo invoice idempotently.
9. Refunds and disputes remain scoped to the connected account. Tallyo provides safe links or controls but never substitutes platform funds.

## Required repository controls

### Tenant mapping

- one active Stripe connected account per Tallyo account at launch;
- immutable Tallyo owner binding;
- no browser-supplied connected-account identifier;
- owner-readable, service-role-written mapping;
- explicit onboarding, capability, restriction and disconnection state;
- no identity documents, bank details, secrets or unnecessary provider payloads stored.

### Onboarding

- confirmed Auth and current MFA assurance when MFA is enrolled;
- single-use, server-created Account Links;
- exact allowlisted return and refresh URLs;
- fresh provider state fetched after every return;
- public payment controls remain disabled unless required capabilities are active and no blocking requirements remain;
- reconnect and remediation never replace an existing tenant binding without a reviewed transition.

### Checkout

- direct charge created in the mapped connected-account context;
- server loads the invoice and derives owner, amount, currency and payer details;
- invoice must be payable, non-cancelled and have a positive outstanding balance;
- account mapping and capability state are revalidated for every request;
- tenant, invoice, connected account, amount, currency and mode are bound into server metadata and idempotency;
- no platform destination, transfer or application-fee parameter;
- one usable payment session per intended attempt, with safe regeneration after expiry, completion or refund;
- existing Owner-account payment configuration cannot be selected for another tenant.

### Webhooks

- separate Connect event destination and signing secret from Billing and the current Owner path;
- verify the raw body before parsing;
- require the connected-account context and map it to exactly one Tallyo tenant;
- reject or quarantine missing, unknown, disconnected or mismatched account context;
- verify livemode, object ownership, invoice metadata, amount and currency;
- process duplicate, delayed and out-of-order events idempotently;
- append privacy-minimised evidence without storing full provider payloads;
- payment, asynchronous payment, refund and dispute states cannot cross tenants.

### Refunds and disputes

- refund is created in the same connected-account context as the charge;
- server derives the refundable amount from verified provider and Tallyo state;
- insufficient connected-account balance may leave a refund pending and must not cause a platform-funded fallback;
- connected businesses use Stripe Dashboard for detailed dispute response at launch;
- Tallyo records provider-derived status and a safe customer-facing reference where available;
- disconnecting an account disables new Checkout but preserves historic reconciliation.

## Failure and rollback

1. Disable new onboarding, Checkout and refund entry points independently.
2. Keep signed event reconciliation active for already-created payments when safe.
3. Do not delete connected-account mappings, payment evidence or invoice history.
4. Manual invoice and payment-recording functionality remains available.
5. Never reroute an affected tenant through the Owner's Stripe account.
6. Reconcile with Stripe before retrying failed or ambiguous operations.
7. Provider secret, event destination or responsibility changes require a new exact approval.

## Focused acceptance matrix

- two Tallyo tenants mapped to two synthetic Stripe connected accounts;
- cross-tenant account, onboarding link, Checkout, refund and event injection rejected;
- incomplete, pending, restricted, enabled and disconnected account states;
- direct charge has no destination, transfer or application fee;
- successful, failed, asynchronous and expired Checkout;
- duplicate, delayed and out-of-order connected events;
- full and partial refunds, pending refund and failed refund;
- dispute opened, updated and closed;
- mode, amount, currency, invoice and connected-account mismatch rejection;
- provider outage, retry, kill switch and rollback;
- Owner-account payment path remains isolated;
- no secrets, identity documents, bank details or full provider payloads in browser state, logs or evidence.

## Official source basis

- Stripe, [Understand how charges work in a Connect integration](https://docs.stripe.com/connect/charges)
- Stripe, [Configure the behavior of connected accounts](https://docs.stripe.com/connect/accounts-v2/connected-account-configuration)
- Stripe, [Connect and the Accounts v2 API](https://docs.stripe.com/connect/accounts-v2)
- Stripe, [Choose your onboarding configuration](https://docs.stripe.com/connect/onboarding)
- Stripe, [Risk and liability management with Connect](https://docs.stripe.com/connect/risk-management)
- Stripe, [Disputes on Connect platforms](https://docs.stripe.com/connect/disputes)
- Stripe, [Handle refunds and disputes for SaaS platforms](https://docs.stripe.com/connect/saas/tasks/refunds-disputes)

Reviewed on 2026-07-24. Current provider documentation must be rechecked at test configuration and production activation.

## Exact approval requested

Approve the recommended model and a repository-only implementation stage:

- Accounts v2 Merchant connected accounts;
- direct charges;
- connected business as merchant of record;
- `fees_collector = stripe`;
- `losses_collector = stripe`;
- full Stripe Dashboard access when supported;
- Stripe-hosted onboarding and Stripe-managed requirements;
- no Tallyo application fee;
- unapplied migration, disabled Edge Functions, app UI states and focused tests only.

Approval would not authorise Stripe configuration, Supabase deployment, secret changes, connected-account creation, payments, refunds, public claims or release.
