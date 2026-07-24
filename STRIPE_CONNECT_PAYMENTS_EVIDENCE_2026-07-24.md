# Stripe Connect payment-path repository evidence

Date: 2026-07-24
Task: COMM-001
Branch: `codex/stripe-connect-payments`
Scope: Unapplied, undeployed and disabled direct-charge Checkout, connected refunds and signed connected-account reconciliation

## Delivered

- private service-only Checkout attempt claims with immutable account, owner, invoice, amount, currency and mode binding;
- one active claim per invoice with bounded abandoned-claim recovery and request idempotency;
- atomic signed-event mutation of invoice, private Connect event evidence, privacy-minimised audit and Checkout terminal state;
- disabled direct-charge Checkout with fresh provider capability/responsibility checks;
- disabled connected-account refund with current PaymentIntent, Charge, currency and refundable-balance verification;
- separate disabled raw-body-signed Connect webhook for payment, expiry, refund and dispute events;
- app and document-email selection of the connected route from server-derived mapping state;
- exact server-side Owner user allowlisting for the existing platform-account Checkout, refund and email-link sources;
- no browser-supplied connected-account identifier, destination, transfer, `on_behalf_of` or application fee.

## Local PostgreSQL acceptance

PostgreSQL image: `postgres:17.6`
Disposable container: `tallyo-connect-payments-pg-20260724`
Network: disabled
Published ports: none
Final state: removed

The foundation and payment migrations applied from a clean synthetic Supabase role/Auth bootstrap. Probes passed:

- cross-tenant connected-account claims are rejected;
- simultaneous Checkout claims for one invoice are serialized;
- claim completion binds the provider Session and expiry;
- invoice, audit, private Connect event and claim terminal state update atomically;
- duplicate provider events are idempotent;
- browser roles cannot read claims or execute service-only claim RPCs;
- Checkout owner/account/invoice binding cannot be reassigned;
- service-only tables retain RLS with no browser policies or privileges.

The first probe exposed that duplicate replay was checked after terminal claim state. The RPC was corrected to return an already-recorded event before re-validating the now-completed claim; the clean rerun then passed without weakening claim validation for new events.

## Focused validation

- `node tests/stripe-connect-payments-harness.cjs`
- `node tests/stripe-connect-foundation-harness.cjs`
- `node tests/stripe-payment-integrity-harness.cjs`
- `node tests/financial-action-audit-harness.cjs`
- `node tests/tenant-isolation-attribution-harness.cjs`
- `node tests/email-status-accuracy-harness.cjs`
- `node tests/core-lifecycle-harness.cjs`
- frozen-lock Deno checks for the three new functions and three affected existing functions
- clean PostgreSQL 17.6 migration/probe run
- `git diff --check`

All passed.

## Boundary

No Supabase migration was applied outside the disposable local database. No Edge Function was deployed. No Stripe or Supabase setting, secret, account, event destination, Checkout Session, payment, refund, dispute, subscription, AI setting, DNS record or public claim was changed.

The payment implementation remains fail-closed behind separate onboarding, Checkout, refund, webhook and live-release gates. Test-provider application and synthetic multi-account acceptance require a new exact Owner approval after this high-risk PR is reviewed and merged.
