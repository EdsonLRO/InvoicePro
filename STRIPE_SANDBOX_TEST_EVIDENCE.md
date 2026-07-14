# Tallyo Stripe Sandbox Test Evidence

This file records privacy-safe Stripe webhook test evidence. It must not contain customer details, provider payloads, secrets, payment method data, or reusable Checkout URLs.

## 2026-07-13 - Webhook hardening and replay pass

Environment:

- Stripe sandbox only; no live events, charges, refunds, or customer payment links.
- Supabase project `cuagwifetheefftleeup`.
- Deployed Edge Function `stripe-webhook` version 9 with `verify_jwt = false` because the function verifies Stripe's HMAC signature over the raw request body.
- The function defaults to `STRIPE_LIVE_MODE=false`; live events require an explicit server-side opt-in and remain an Owner-approval boundary.

Checks completed:

| Scenario | Expected result | Evidence | Result |
|---|---|---|---|
| Unsigned request | Reject before parsing or state change | Direct POST returned HTTP 401 | Pass |
| Unrelated asynchronous payment failure | Accept the signed delivery but ignore it because the Checkout Session was not created by Tallyo | Stripe CLI sandbox fixture returned success before and after the final hardening deploy; webhook version 9 returned HTTP 200; no Stripe audit row was created | Pass |
| Completed payment duplicate replay | Return success without adding another payment, history entry, or audit row | Existing sandbox event resent to the configured endpoint; counts remained one audit row, one payment marker, and two original history markers | Pass |
| Unrelated dispute | Ignore because the PaymentIntent is not linked to a known Tallyo payment | Stripe CLI sandbox fixture returned success; no Stripe audit row was created | Pass |
| Successful refund duplicate replay | Return success without changing invoice state | Existing sandbox refund event resent; audit count stayed at one and the payments/history hashes plus `updated_at` remained unchanged | Pass |
| Supabase audit constraints | Enforce provider-event uniqueness and append-only events | Live schema inspection confirmed the partial unique `(provider, provider_event_id)` index and update/delete prevention triggers | Pass |
| Checkout audit amount compatibility | Existing trusted Checkout rows contain a numeric expected amount before the verifier changes to fail closed | Live aggregate query found zero missing or non-numeric expected amounts | Pass |
| TypeScript validation | Edge Function type-checks | `C:\Users\Edson\.deno\bin\deno.exe check supabase/functions/stripe-webhook/index.ts` | Pass |

Not reproducible in the Stripe CLI fixture set during this pass:

- A real `refund.failed` lifecycle after an earlier successful/recorded refund. Stripe CLI 1.43.7 does not expose a `refund.failed` trigger fixture.
- A dispute tied to a Tallyo-created sandbox Checkout payment. The unrelated-dispute rejection path is verified, but the positive mapping path still needs a controlled sandbox payment that enters dispute state.
- Simultaneous distinct events writing the same invoice. Current handler-level markers and the audit unique index reduce duplicate risk, but JSON-array read-modify-write remains a concurrency limitation.

Live mode was deliberately not tested. It requires Owner approval, separate live credentials and endpoint secret, final operational policy, legal/privacy readiness, and release evidence.

## 2026-07-14 - Positive lifecycle and idempotency pass

Environment:

- Stripe sandbox only; all cards, payments, refunds, and disputes were provider-supplied test scenarios.
- Both payments started from genuine Tallyo-created Checkout Sessions for dedicated fictitious test invoices.
- No provider identifiers, Checkout URLs, payment method data, customer details, payloads, or secrets are retained in this evidence file.

Checks completed:

| Scenario | Expected result | Privacy-safe evidence | Result |
|---|---|---|---|
| Known-payment dispute | Bind the signed dispute only to the Tallyo payment it belongs to, add one dispute marker, and leave the recorded payment and paid status unchanged | A sandbox payment completed through Tallyo Checkout and then entered the provider's fraudulent-dispute test lifecycle. One mapped dispute audit/history marker appeared; invoice total, paid total, and status were unchanged | Pass |
| Known-payment dispute duplicate replay | A repeated delivery must not append another marker or mutate financial state | The same signed dispute event was resent. Audit count, history count and hashes, payment hash, invoice status, paid total, and `updated_at` remained unchanged | Pass |
| Genuine asynchronous refund failure | Reverse the provisional refund effect when the provider changes the refund to failed, restoring the original paid state without creating extra money movement | A separate Tallyo Checkout payment used the provider's asynchronous refund-failure test lifecycle. Tallyo recorded one locked negative refund entry and one locked positive reversal entry; the paid total and Paid status were restored | Pass |
| Failed-refund duplicate replay | A repeated `refund.failed` delivery must not add another reversal or history entry | The same signed failed-refund event was resent. Audit count, refund/reversal counts, history count and hashes, payment hash, invoice status, paid total, and `updated_at` remained unchanged | Pass |

Outcome:

- `PAY-TEST-001` is Verified for the implemented Stripe sandbox lifecycle.
- Known-payment binding, successful payment, successful refund, genuine failed-refund reversal, dispute awareness, unknown-event rejection, signature rejection, and duplicate-event idempotency now have recorded sandbox evidence.
- Live mode remains deliberately untested and disabled. Operational refund, dispute, chargeback, support, legal/privacy, backup/restore, and release gates still apply before real customer use.
- Distinct simultaneous events updating the same invoice remain a documented concurrency limitation because invoice payments and activity history are JSON arrays updated through read-modify-write operations.
