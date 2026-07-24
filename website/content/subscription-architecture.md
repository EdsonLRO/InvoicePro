# Tallyo subscription architecture

## Purpose and current boundary

This is a design-only readiness record. It does not enable subscriptions,
publish prices, create a Stripe customer, or change the existing invoice-payment
flow.

Customer invoice payments are money paid to a Tallyo user by that user's
customer. Tallyo subscriptions would be money paid by a Tallyo account holder
to Tallyo for access to the software. They require separate Stripe products,
prices, customers, Checkout sessions, webhooks, accounting evidence and
operational procedures.

## Required flow

1. A signed-in account selects an approved plan and billing interval.
2. A trusted server validates an allowlisted Stripe Billing price identifier.
   The browser never supplies an arbitrary amount, product or entitlement.
3. The server finds or creates the account's Stripe customer mapping and creates
   a subscription Checkout session with approved success and cancellation URLs.
4. Stripe-hosted Checkout collects payment details. Tallyo does not receive full
   card details.
5. A separate signed webhook processes subscription events idempotently and
   updates a trusted subscription-state record atomically.
6. Server and database boundaries derive entitlements from verified state.
   Hiding a button in the browser is never the only enforcement.
7. The account can open the Stripe customer portal for billing details and
   cancellation when that path is approved.
8. Cancellation, failed renewal, grace, unpaid and provider-outage paths move the
   account through explicit states without deleting business records.

## Data model requirements

No migration is created in this task. A later reviewed migration needs, at
minimum:

- one immutable account or future workspace billing owner;
- a unique Stripe customer mapping;
- subscription and subscription-item identifiers;
- allowlisted internal plan and price keys, separate from display copy;
- Stripe status, current period end, cancellation flags and provider event time;
- a last-processed-event or equivalent idempotency boundary;
- an entitlement projection derived from verified subscription state;
- usage counters with atomic server-side enforcement where plans impose limits;
- append-only, privacy-minimised billing audit evidence;
- RLS and direct-API tests proving cross-account isolation.

## Entitlement states

- `incomplete`: Checkout or initial payment is not complete; no paid access.
- `trialing`: only if an approved trial exists; trial entitlements are explicit.
- `active`: paid entitlements are available.
- `past_due`: renewal failed; restricted behaviour follows the approved grace
  policy.
- `grace`: a time-bounded internal state, not an indefinite paid bypass.
- `cancel_at_period_end`: access continues only through the verified paid period.
- `cancelled`: paid entitlements end at the approved boundary.
- `unpaid`: paid entitlements are unavailable.
- `read_only`: business records remain retrievable while paid creation or
  automation features are restricted, subject to the approved product policy.

Every transition must come from a signed, idempotently processed provider event
or a tightly controlled reconciliation procedure. A success redirect alone must
never grant access.

## Unresolved product decisions

The current website shows the direction `Free`, `Essentials`, `Automate`, and a
future `Teams` plan. The security master plan separately suggests `Free`, `Pro`
and `Business`. This conflict is now explicit and must be resolved before plan
IDs or public copy are implemented.

The Owner must also decide:

- which current features belong to each plan;
- measurable usage limits;
- monthly and any annual GBP prices;
- whether displayed prices include or exclude tax;
- whether Tallyo offers a permanent free plan, a trial, both or neither;
- trial length and conversion behaviour if used;
- cancellation timing, grace and refund commitments;
- whether Teams remains out of scope until workspace/RBAC isolation exists.

These choices are product and customer commitments, so they cannot be inferred
from competitor pricing or filled with placeholders.

## Implementation sequence after decisions

1. Approve plan matrix, price presentation and lifecycle commitments.
2. Threat-model the separate Billing endpoints, webhook and entitlement model.
3. Add reviewed schema/RLS with cross-account tests.
4. Add server-created subscription Checkout using allowlisted price IDs.
5. Add separate signed webhook processing and reconciliation.
6. Add server-enforced entitlements and read-only/grace behaviour.
7. Add portal/cancellation UX and accessible failure states.
8. Run Stripe test-mode lifecycle, replay, duplicate-event, failure and
   cancellation acceptance.
9. Review public pricing, subscription and privacy wording.
10. Obtain exact approval before production products, secrets, webhook, live
    acceptance payment and public release.
