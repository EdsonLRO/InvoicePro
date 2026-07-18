# PAY-LIVE-003 — Minimum live refund-receipt acceptance

Task ID: PAY-LIVE-003\
Objective: Prove the minimum GBP 1 live payment/refund lifecycle and Stripe
automatic refund-receipt outcome without recording private payment, inbox, Auth,
provider or customer values.\
Priority: High\
Status: Awaiting Owner Approval\
Phase: Receipt remediation release and re-acceptance gate\
Owner role: Master Orchestrator\
Assigned specialist: Payments and QA responsibilities performed sequentially\
Risk level: High — live money, Stripe, private payer details, customer
communication and production financial state\
Affected files: this task record; both Checkout-producing Edge Functions; the
focused Stripe integrity harness; milestone-only authoritative payment/readiness
evidence after verified outcomes\
Files locked: `tasks/PAY-LIVE-003_REFUND_RECEIPT_ACCEPTANCE_2026-07-18.md`;
`supabase/functions/create-stripe-checkout/index.ts`;
`supabase/functions/send-document-email/index.ts`;
`tests/stripe-payment-integrity-harness.cjs`; milestone-only payment/readiness
evidence updates\
Lock acquired: 2026-07-18 on branch `codex/refund-receipt-acceptance`\
Dependencies: merged PRs #68 and #69; public build `2026.07.18.9`; existing
PAY-LIVE-001/002 and live refund evidence; Stripe automatic refund emails
enabled\
Security boundary: never inspect or record card details, payer email, passwords,
MFA values, JWTs, provider secrets, webhook payloads or customer data; use a
fictional invoice and Owner-controlled private checkout/inbox actions\
Mandatory controls: exact approval before the GBP 1 payment; separate exact
approval immediately before the refund and its foreseeable Stripe receipt;
signed webhook reconciliation; idempotency; no manual paid/refund override;
privacy-minimised evidence\
Required evidence: one GBP 1 Checkout settlement; exactly one confirmed payment
and expected status/balance; separately approved full refund; exactly one signed
refund reconciliation; restored balance/status; Owner-confirmed receipt outcome
without message content or address\
Owner approval recorded: On 2026-07-18 the Owner requested “lets do a 1 pound
test”, authorising one GBP 1 live acceptance payment. This does not authorise
the later refund, private inbox inspection by Codex, repeat payment, customer
communication or configuration change.\
Refund approval recorded: On 2026-07-18 the Owner explicitly approved one full
GBP 1.00 live refund of invoice #0004 through Tallyo and acknowledged that
Stripe may email the payer a refund receipt.\
Approval boundary: Codex may prepare the fictional invoice and Checkout handoff,
but the Owner enters private payment details. Stop for separate exact refund
approval after the payment is verified. The completed approval does not authorise
production function deployment or another live payment/refund.\
Implementation result: Fictional invoice #0004 was created for exactly GBP 1.00
using the existing synthetic customer. It contains no real goods/services and
was not emailed. The Owner completed one live Stripe Checkout privately and,
after a separate approval, Codex submitted one full GBP 1.00 refund through
Tallyo. Stripe sent no automatic refund receipt. The local remediation adds
`customer_creation=always` to both Tallyo Checkout paths so future successful
Checkout Sessions attach the charge to a Stripe Customer with a stored Checkout
email. It does not request future-use setup or save the card. Both Checkout paths
also include the reconciled invoice `stripe_event_version` in their idempotency
key so a payment/refund lifecycle rotates the key while repeated clicks against
unchanged financial state continue to reuse one session.\
Review result: The payment and refund reconciliations completed successfully.
Invoice #0004 returned to `Sent`, records GBP 0.00 paid and GBP 1.00 balance due,
and exposes exactly one confirmed Stripe card payment and one confirmed Stripe
refund. No duplicate payment or refund was observed. The earlier unused Checkout
Session remains unconsumed and will expire normally. The Owner reported no email,
receipt or reference. Stripe's live `Refunds` customer-email switch is enabled,
but the prior Checkout source supplied only `customer_email` and did not create
or attach a Stripe Customer, which does not meet Stripe's documented automatic
refund-email condition. The focused integrity harness and Deno checks for both
changed Edge Functions pass. After the first refund, an Owner retry reached the
already-completed original Checkout Session and took no second payment. Static
review identified the omitted financial lifecycle version in the deterministic
Checkout key; the local remediation now covers this post-refund replay case.\
Evidence: Value-free browser observation only: selected status `Sent`; `Paid:
GBP 0.00`; `Balance: GBP 1.00`; exactly one `Stripe card payment confirmed`
entry; exactly one `Stripe refund confirmed` entry for GBP 1.00; no card, payer
email, Auth value, secret, token, provider identifier, webhook payload or inbox
content inspected. Owner receipt outcome: `no`; reference outcome: `no`.\
Branch: `codex/refund-receipt-acceptance`\
Commit: Pending\
Blocked reason: Deploying payment Edge Functions is a production change, and a
repeat live acceptance costs and refunds another GBP 1.00. Both require exact
Owner approval.\
Next action: After draft PR #70 passes required checks, the Owner approves marking
it ready, merging it, deploying `create-stripe-checkout` and
`send-document-email` to production, and one additional GBP 1.00 payment/full
refund receipt retest. Codex will otherwise leave production unchanged.
