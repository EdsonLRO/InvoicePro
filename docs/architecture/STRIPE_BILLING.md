# Stripe Billing architecture

Status: Repository foundation merged by PR #94. The migration is unapplied, the Edge Functions are undeployed, provider configuration is absent and public subscription checkout remains disabled.

## Boundary

Stripe Billing is for a business paying Tallyo for Tallyo Pro. It is separate from Stripe invoice payments collected by a Tallyo business from its own customer.

Approved offer:

- £8 monthly or £80 annually;
- identical features for both billing intervals;
- one business and one user;
- no full-feature trial or permanent free saved account at launch;
- cancellation stops future renewal and normally preserves access through the paid period.

No product, price, coupon, trial, Checkout Session, Customer Portal session, customer mapping, subscription or entitlement has been created in Stripe or Supabase.

## Repository foundation

The candidate implementation is isolated from customer invoice payments:

- `20260724111312_stripe_billing_test_foundation.sql` defines owner-scoped read RLS, service-role-only writes, atomic event reconciliation, delayed-event protection and provider-derived entitlements;
- `create-billing-checkout` maps only `monthly` or `annual` to server-configured Price identifiers and requires confirmed Auth, current MFA assurance when enrolled, an explicit kill switch and a Stripe test-mode key;
- `create-billing-portal` resolves the Stripe Customer only from the authenticated account mapping and uses the same disabled/test-mode gates;
- `stripe-billing-webhook` verifies the raw-body signature, rejects live events, refreshes current subscription state, checks the server Price allowlist and account mapping, then calls the atomic RPC;
- the existing `stripe-webhook` invoice-payment path does not reference Billing tables or entitlements.

The account entitlement helper is service-role-only. It is not yet attached to the app's write RLS policies, so the repository foundation must not be described as active subscription enforcement. That activation requires the unapplied migration, reviewed policy integration and controlled test-mode acceptance under a separate approval.

## Trusted flow

1. A confirmed signed-in account selects the approved billing interval.
2. A trusted server maps that choice to an allowlisted Stripe Price identifier. The browser cannot submit an arbitrary price or amount.
3. The server finds or creates a Stripe Customer mapped to the Tallyo account and creates a subscription Checkout Session.
4. Stripe-hosted Checkout collects payment details; Tallyo never receives full card details.
5. A separate endpoint verifies signed subscription webhooks and processes events idempotently.
6. An atomic database function updates subscription state and a privacy-minimised audit record.
7. Server/database boundaries derive entitlements from verified subscription state. A redirect or hidden button never grants access.
8. The Stripe Customer Portal manages payment method, billing invoices and cancellation after separate approval.

## Repository data model

The unapplied candidate migration adds:

- `billing_customers`: immutable Tallyo account owner, unique Stripe Customer identifier, created/updated timestamps;
- `billing_subscriptions`: internal plan key, billing interval, Stripe Subscription and Price identifiers, verified status, current-period end, cancel-at-period-end flag, provider event time and update timestamp;
- `billing_events`: unique Stripe event identifier, type, processing result, privacy-minimised correlation metadata and timestamp;
- `account_entitlements`: derived access state and effective date, never a browser-editable authority;
- optional atomic usage counters only where an approved reasonable-use boundary requires them.

RLS must keep every mapping account-scoped. Stripe identifiers must never substitute for the Tallyo ownership check. Service-role writes must use reviewed functions and grants.

## State machine

| State | Access |
|---|---|
| `incomplete` | No paid access. |
| `trialing` | Reserved for a possible future decision; unused at launch. |
| `active` | Full Tallyo Pro access. |
| `past_due` | Recommended seven-day grace period while Stripe retries and the user can update billing. |
| `unpaid` | Restricted/read-only state after grace. |
| `cancel_at_period_end` | Full access through the verified paid period. |
| `cancelled` | Restricted/read-only state after paid access ends. |
| `paused` | Used only if a later approved Stripe configuration requires it. |

Restricted/read-only means existing records remain viewable and exportable while new documents, recurring generation, automated email/reminders and new payment actions are paused. Records are not immediately deleted. Final retention remains a separate approved decision.

## Proposed webhook scope

The implementation review should select the smallest official event set needed for:

- completed and expired subscription Checkout;
- subscription created, updated, paused/resumed and deleted;
- invoice paid, payment failed and payment action required;
- trial events only if trials are later approved.

The exact Stripe event names and API version must be verified against current official Stripe documentation during the later High-risk implementation. Unknown or unrelated events must be acknowledged without mutating entitlement state.

## Required acceptance tests

- allowlisted monthly/annual price mapping and rejection of arbitrary identifiers;
- authenticated account/customer ownership and cross-account isolation;
- signed webhook rejection, test/live-mode consistency and known-event allowlist;
- duplicate, replayed, delayed and out-of-order events;
- atomic state/audit updates and rollback on partial failure;
- active, past-due/grace, unpaid, period-end cancellation, reactivation and provider-outage paths;
- Customer Portal ownership and safe return URLs;
- browser UI unable to grant paid access;
- invoice-payment webhooks unable to alter subscription entitlements;
- no card details, secrets or unnecessary personal data in logs/audit evidence.

## Rollback and containment

1. Disable creation of new subscription Checkout and Portal sessions.
2. Continue verified webhook reconciliation for already-created subscriptions when safe.
3. Preserve subscription and billing-event evidence; do not delete or downgrade records manually.
4. Place affected accounts in the safest truthful access state supported by verified provider evidence.
5. Reconcile with Stripe test mode before retrying a failed deployment.
6. Rotate secrets or change production provider configuration only with exact Owner approval.

## Later Owner actions

- approve the Stripe Billing product and two prices;
- approve tax presentation and final customer-facing subscription wording;
- approve the grace/restricted-state and retention policy;
- approve test-mode provider configuration and controlled acceptance;
- approve production secrets, webhook destination, Customer Portal and live activation;
- approve the production release separately.

The repository foundation passed High review and merged in PR #94. Applying it, configuring Stripe test objects/secrets, deploying it, connecting app write policies, making a test Checkout and enabling any public control remain separate Owner-gated actions.
