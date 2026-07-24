# PAY-LIVE-003 — Minimum live refund-receipt acceptance

Task ID: PAY-LIVE-003\
Objective: Prove the minimum GBP 1 live payment/refund lifecycle and Stripe
automatic refund-receipt outcome without recording private payment, inbox, Auth,
provider or customer values.\
Priority: High\
Status: Complete\
Phase: Closed\
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
`tests/stripe-payment-integrity-harness.cjs`; `APP_STATUS.md`;
`PAYMENT_OPERATIONS_RUNBOOK.md`\
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
Remediation approval recorded: On 2026-07-18 the Owner explicitly approved
marking PR #70 ready, merging it, deploying only `create-stripe-checkout` and
`send-document-email` with Stripe Customer creation, and one additional GBP 1.00
live payment retest. After that payment was verified, the Owner separately
approved one full GBP 1.00 refund and acknowledged the foreseeable Stripe
receipt.\
Approval boundary: Codex may prepare the fictional invoice and Checkout handoff,
but the Owner enters private payment details. Stop for separate exact refund
approval after the payment is verified. The initial payment/refund approvals did
not authorise remediation deployment or a repeat cycle; those actions received
the separate approval recorded above.\
Implementation result: Fictional invoice #0004 completed two separately approved
GBP 1.00 live payment/full-refund cycles. The first cycle reconciled correctly but
produced no refund receipt. PR #70 added `customer_creation=always` to both
Checkout paths without requesting future card saving and included the reconciled
invoice `stripe_event_version` in both deterministic Checkout keys. This preserves
same-state retry idempotency while allowing a fresh Checkout after a confirmed
payment/refund lifecycle. PR #70 passed its required check, merged as `31829e1`,
and the two reviewed functions were deployed active with JWT verification
preserved.\
Review result: The post-refund stale-session reproduction took no second payment.
After deployment, a fresh Checkout opened and the second payment reconciled once.
The separately approved second refund also reconciled once. Invoice #0004 ended
`Sent` with GBP 0.00 paid and GBP 1.00 balance due, with exactly two confirmed
GBP 1.00 payments and two confirmed negative GBP 1.00 refunds. No duplicate
financial record was observed. The Owner confirmed the automatic Stripe refund
receipt arrived and displayed a customer-facing reference.\
Evidence: Value-free browser and Owner confirmation only: final selected status
`Sent`; `Paid: GBP 0.00`; `Balance: GBP 1.00`; two `Stripe card payment confirmed`
entries; two `Stripe refund confirmed` entries; receipt outcome `yes`; reference
outcome `yes`. No card, payer email, Auth value, secret, token, provider identifier,
reference value, webhook payload or inbox content was inspected or recorded.\
Branch: `codex/refund-receipt-closeout`\
Commit: PR #70 merged as `31829e1`; closeout commit recorded in Git history\
Blocked reason: None.\
Next action: None for PAY-LIVE-003. Every future live refund retains its own exact
Owner approval boundary. Locks released at task closure.
