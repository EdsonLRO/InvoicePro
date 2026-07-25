# Stripe Connect architecture decision record

Status: Launch model approved. The onboarding and payment-path foundations are implemented, their migrations are applied, and the four new functions are deployed at version 1 but disabled. No Stripe provider configuration or activation is authorised.

## Decision boundary

Stripe Connect is for an independent Tallyo business receiving invoice payments from its own customers. Stripe Billing is separately for that business paying Tallyo for the software.

The current live invoice-payment path uses the Owner's Stripe account and is verified only for that controlled account. It must not be used as the merchant path for unrelated public businesses.

## Approved direction

- each participating business connects its own Stripe account;
- the connected business remains the relevant merchant for its customer payments;
- customers use Stripe-hosted Checkout and Tallyo never stores full card details;
- funds go to the connected business account;
- Stripe processing fees apply separately;
- Tallyo does not add a percentage transaction fee at initial launch;
- a business without completed Connect onboarding can still invoice and record manual payments;
- public card-payment links stay unavailable until that business's capability and onboarding state are verified.

## Candidate flow

Business subscribes to Tallyo Pro → separately starts Stripe Connect onboarding → Stripe confirms the connected account and required capabilities → Tallyo creates account-bound Checkout → the customer pays on Stripe → signed platform/connected-account webhooks confirm the result → Tallyo records verified invoice status.

## Approved architecture

The Owner approved Accounts v2 Merchant connected accounts, direct charges, the connected business as merchant of record, Stripe collection of fees and losses, full Stripe Dashboard access when supported, Stripe-hosted onboarding and no Tallyo application fee.

The recommendation was selected because it keeps each independent business's customer payments, Stripe fees, refunds, disputes and negative-balance responsibility on that connected account instead of making Tallyo an intermediary for customer funds.

Accounts v2 responsibility fields are fixed when the Merchant configuration is added. The full rationale, controls, test matrix and continuing provider approval boundary are in `STRIPE_CONNECT_DECISION_PACK_2026-07-24.md`.

The review considered:

- who is merchant of record and who appears on receipts/statements;
- platform and connected-account liability;
- who owns payments, refunds, disputes, negative balances and customer support;
- payout responsibility and supported UK capabilities;
- application-fee implications even though Tallyo's initial direction is no percentage fee;
- webhook destination/event ownership and account-scoped idempotency;
- onboarding, capability checks, requirements due, restrictions and disconnection;
- data-controller/processor roles and provider data flows;
- provider fees and failure/rollback behaviour.

No provider account or configuration is created by this recommendation.

## Repository foundation

The first approved implementation slice is applied and deployed but remains disabled:

- `20260724174500_stripe_connect_foundation.sql` creates the tenant-bound connected-account state and private append-only event evidence;
- authenticated browser access is owner-scoped SELECT only; all provider-derived writes remain service-role-only;
- database constraints preserve Accounts v2, full Dashboard, Stripe fee collection and Stripe loss responsibility;
- `manage-stripe-connect` creates or refreshes only the authenticated owner's mapping, requires confirmed Auth and current MFA assurance, and creates Stripe-hosted onboarding/update links;
- one stable provider idempotency key per Tallyo owner prevents different browser request IDs from creating parallel connected accounts;
- the Account page shows connection and capability state without exposing a connected-account identifier;
- the function is gated off by default and contains no Checkout, payment, refund, transfer, application-fee or disconnection operation.

Local PostgreSQL 17 RLS, privilege, constraint, cross-tenant and append-only probes pass. Evidence: `STRIPE_CONNECT_FOUNDATION_EVIDENCE_2026-07-24.md`.

## Repository payment path

The second approved slice is applied and deployed but remains disabled:

- `stripe_connect_checkout_claims` privately binds one active Checkout attempt to one owner, connected account, invoice, amount, currency and mode;
- service-only RPCs serialize claims, preserve immutable tenant binding and atomically apply signed invoice events with private Connect evidence;
- `create-connect-checkout` refreshes provider capabilities, derives invoice and amount server-side, and creates a direct charge only with the mapped connected-account header;
- `create-connect-refund` re-reads the connected PaymentIntent and Charge, derives the provider/Tallyo refundable balance and creates the refund in that same account context;
- `stripe-connect-webhook` uses a separate signing secret, requires the event's connected-account context and handles payment, expired Checkout, refund and dispute events idempotently;
- app and document-email routing select the connected path only from server-derived mapping state;
- the legacy Owner Checkout, refund and email-link source now requires an exact server-side Owner user allowlist, preventing unrelated accounts from selecting it;
- no destination, transfer, `on_behalf_of` or application-fee parameter exists in the Connect path.

Local PostgreSQL 17.6 atomic-claim, RLS, privilege, cross-tenant, replay and rebinding probes pass. Evidence: `STRIPE_CONNECT_PAYMENTS_EVIDENCE_2026-07-24.md`.

## Required trusted controls

- authenticated Tallyo account ↔ connected Stripe account mapping with RLS;
- server-created onboarding and account-management links with safe return URLs;
- server-side capability checks before every public payment-link operation;
- Checkout created only for a Tallyo-owned invoice and the mapped connected account;
- signed event handling that identifies both platform and connected account;
- amount, currency, invoice, user, session and mode verification;
- idempotent payment/refund/dispute processing with append-only audit evidence;
- no client-controlled connected-account identifier or destination;
- safe account disconnection that disables new links without erasing invoice history;
- manual-payment functionality when Connect is unavailable.

## Proposed test plan

- two independent Tallyo accounts with separate connected accounts and direct cross-account abuse attempts;
- incomplete, restricted, pending, active and disconnected onboarding states;
- arbitrary connected-account/session/destination injection rejection;
- successful and asynchronous Checkout;
- duplicate, delayed and out-of-order events;
- partial/full refunds, failed refunds, disputes and negative-balance scenarios;
- webhook signature and connected-account context rejection;
- disconnection with outstanding refunds/disputes;
- provider outage and rollback;
- reconciliation proving the Owner's current Stripe path cannot be selected for an unrelated account.

## Public product state before implementation

Online card payments for independent business accounts are being prepared and are not included in the launch subscription yet. Website pricing must not present card payments, deposits or payment links as a current Tallyo Pro benefit.

## Later Owner actions

- approve the selected Stripe Connect account and charge model after official-document review;
- approve provider onboarding configuration, platform profile and support responsibilities;
- approve test-mode deployment and synthetic multi-account acceptance;
- approve production webhook/secrets/configuration and any identity or banking steps;
- approve public payment claims and release.

The disabled foundation deployment applied the reviewed migrations and deployed only the new functions. No Connect activation, Stripe configuration, secret, account or payment occurred.

The 2026-07-25 sandbox-acceptance preparation created a separate test-mode connected-account webhook destination with the reviewed 12-event allowlist and saved non-live Supabase settings. The Owner privately configured the Connect key and webhook signing secret; the four sandbox gates are enabled while live mode and live approval remain `false`. Source supports a Connect-only `STRIPE_CONNECT_APP_BASE_URL`, falling back to `APP_BASE_URL`, so protected sandbox returns do not require changing the existing live invoice-payment return route.

The first sandbox onboarding request created no account because Stripe rejected an explicit `configuration.merchant.capabilities.stripe_balance` request as an unknown field. Current official Accounts v2 guidance states that applying the Merchant configuration automatically requests the payouts capability and its create example requests only `card_payments`. The focused correction removes only the obsolete request field; payout readiness remains verified from the returned Merchant capability state before Checkout is allowed.

PR #104 merged that payout-field correction and only `manage-stripe-connect` was redeployed. The second sandbox request progressed to Stripe's `identity_country_required` validation and still created no account. The focused follow-up supplies `identity.country = gb`, which is fixed by the approved UK-only release scope. It intentionally does not guess `identity.entity_type`; Stripe-hosted onboarding collects the accurate business type and remaining identity requirements directly from the business.
