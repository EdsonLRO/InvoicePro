# Stripe Billing architecture

Status: The foundation and live-readiness migrations are applied. Stripe sandbox Prices, the signed Billing destination and Customer Portal are configured, and protected synthetic acceptance passed on 2026-07-25. Public subscription checkout and live Billing remain disabled. The private write-enforcement switch remains off while live provider configuration and acceptance are pending.

## Boundary

Stripe Billing is for a business paying Tallyo for Tallyo Pro. It is separate from Stripe invoice payments collected by a Tallyo business from its own customer.

Approved offer:

- £8 monthly or £80 annually;
- identical features for both billing intervals;
- one business and one user;
- no full-feature trial or permanent free saved account at launch;
- cancellation stops future renewal and normally preserves access through the paid period.

The approved sandbox Product and GBP 8 monthly/GBP 80 annual Prices exist. One synthetic monthly subscription produced a signed provider-derived entitlement and is scheduled to cancel at its verified period end. No live Product/Price, coupon, trial, public Checkout or real customer subscription exists.

## Repository foundation

The disabled implementation is isolated from customer invoice payments:

- `20260724111312_stripe_billing_test_foundation.sql` defines owner-scoped read RLS, service-role-only writes, atomic event reconciliation, delayed-event protection and provider-derived entitlements;
- `create-billing-checkout` maps only `monthly` or `annual` to server-configured Price identifiers and requires confirmed Auth, current MFA assurance when enrolled, an explicit kill switch, exactly one test/live provider mode and a matching Stripe key;
- a service-role-only per-account Checkout claim serialises different browser request IDs before Stripe is called, while same-request retries retain Stripe idempotency;
- Checkout also lists the mapped Customer's current provider-mode subscriptions and fails closed when any non-terminal subscription exists;
- `create-billing-portal` resolves the Stripe Customer only from the authenticated account mapping and uses the same disabled and mutually exclusive provider-mode gates;
- `stripe-billing-webhook` verifies the raw-body signature, accepts only the configured test/live event mode, refreshes current subscription state, checks the server Price allowlist and account mapping, then calls the atomic RPC and clears only a mode-matching Checkout claim for signed completion/expiration events;
- the existing `stripe-webhook` invoice-payment path does not reference Billing tables or entitlements.

The deployed account entitlement helper remains service-role-only. PR #103 added a private identity-bound authenticated helper, core write RLS integration and service-side action guards. Migration `20260725014434` adds one private database-owner-controlled `subscription_write_enforcement` switch. It defaults off so guarded functions can be deployed without unexpectedly restricting existing accounts; a missing switch fails closed. Browser, authenticated and service roles cannot change it. Refunds and signed provider reconciliation intentionally remain available in restricted mode. The migration and eight approved Billing/entitlement function updates were applied from merge `2c313f0` under exact Owner approval; enforcement remains off.

Read-only aggregate reconciliation found eight accounts with business data, two active full entitlements and six accounts that would become read-only under immediate enforcement. No identity or business record was inspected. The private switch must stay off through controlled live Billing acceptance; enabling it is a separate production decision after the impact is accepted.

## Protected sandbox acceptance

The 2026-07-25 controlled run passed authenticated monthly Checkout, signed activation, Portal ownership/return, period-end cancellation, duplicate replay and older-event rejection. Rollback-only database probes passed renewal, failed payment, seven-day grace, `unpaid` read-only and recovery transitions without changing the accepted subscription's final state.

During cancellation testing, Stripe represented the Portal request with `cancel_at` equal to `current_period_end` while the boolean field was false. Webhook version 9 now reconciles either trusted representation. Full details and residual gates are in `STRIPE_BILLING_SANDBOX_ACCEPTANCE_EVIDENCE_2026-07-25.md`.

## Trusted flow

1. A confirmed signed-in account selects the approved billing interval.
2. A trusted server maps that choice to an allowlisted Stripe Price identifier. The browser cannot submit an arbitrary price or amount.
3. The server finds or creates a Stripe Customer mapped to the Tallyo account.
4. An atomic database claim permits one active Checkout attempt for that account; a second request fails closed.
5. The server verifies that Stripe has no non-terminal subscription for the mapped Customer, then creates one expiring subscription Checkout Session.
6. Stripe-hosted Checkout collects payment details; Tallyo never receives full card details.
7. A separate endpoint verifies signed subscription webhooks and processes events idempotently.
8. An atomic database function updates subscription state and a privacy-minimised audit record; signed Checkout lifecycle handling clears the matching claim.
9. Server/database boundaries derive entitlements from verified subscription state. A redirect or hidden button never grants access.
10. The Stripe Customer Portal manages payment method, billing invoices and cancellation after separate approval.

## Repository data model

The applied migration adds:

- `billing_customers`: immutable Tallyo account owner, unique Stripe Customer identifier, created/updated timestamps;
- `billing_subscriptions`: internal plan key, billing interval, Stripe Subscription and Price identifiers, verified status, current-period end, cancel-at-period-end flag, provider event time and update timestamp;
- `billing_checkout_claims`: private service-only per-account request/Session claim with fixed expiry, used only to prevent overlapping Checkout attempts;
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
- simultaneous different-request containment, same-request retry safety, claim expiry recovery and current-provider subscription rejection;
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

1. If subscription write enforcement is active, have the database owner set the private rollout switch back to `false`; browser and service roles cannot do this.
2. Disable creation of new subscription Checkout and Portal sessions.
3. Continue verified webhook reconciliation for already-created subscriptions when safe.
4. Preserve subscription and billing-event evidence; do not delete or downgrade records manually.
5. Place affected accounts in the safest truthful access state supported by verified provider evidence.
6. Reconcile with the configured Stripe provider mode before retrying a failed deployment.
7. Rotate secrets or change production provider configuration only with exact Owner approval.

## Later Owner actions

- approve the Stripe Billing product and two prices;
- approve tax presentation and final customer-facing subscription wording;
- approve the grace/restricted-state and retention policy;
- approve test-mode provider configuration and controlled acceptance;
- approve production secrets, webhook destination, Customer Portal and live activation;
- approve the production release separately.

The foundation passed High review, merged, and was applied/deployed in a later disabled-only stage. Configuring Stripe sandbox objects/secrets, connecting app write policies, making a test Checkout and enabling any public control remain separate Owner-gated actions.
