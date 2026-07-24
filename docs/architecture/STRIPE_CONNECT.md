# Stripe Connect architecture decision record

Status: Preparation only. No connected-account model is selected and no provider configuration changes are authorised.

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

## Open architecture decision

A later High-risk programme must compare current Stripe-supported connected-account models and direct versus destination charge designs using official documentation. The review must determine:

- who is merchant of record and who appears on receipts/statements;
- platform and connected-account liability;
- who owns payments, refunds, disputes, negative balances and customer support;
- payout responsibility and supported UK capabilities;
- application-fee implications even though Tallyo's initial direction is no percentage fee;
- webhook destination/event ownership and account-scoped idempotency;
- onboarding, capability checks, requirements due, restrictions and disconnection;
- data-controller/processor roles and provider data flows;
- provider fees and failure/rollback behaviour.

No final model is chosen from memory or this preparation record.

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

No Connect activation, live configuration change, migration, secret or payment occurs in the repository-simplification programme.
