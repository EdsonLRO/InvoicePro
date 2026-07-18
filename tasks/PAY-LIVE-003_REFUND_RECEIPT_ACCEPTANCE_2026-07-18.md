# PAY-LIVE-003 — Minimum live refund-receipt acceptance

Task ID: PAY-LIVE-003\
Objective: Prove the minimum GBP 1 live payment/refund lifecycle and Stripe
automatic refund-receipt outcome without recording private payment, inbox, Auth,
provider or customer values.\
Priority: High\
Status: Awaiting Owner Approval\
Phase: Full GBP 1 refund approval gate\
Owner role: Master Orchestrator\
Assigned specialist: Payments and QA responsibilities performed sequentially\
Risk level: High — live money, Stripe, private payer details, customer
communication and production financial state\
Affected files: this task record; milestone-only updates to authoritative
payment/readiness evidence after verified outcomes\
Files locked: `tasks/PAY-LIVE-003_REFUND_RECEIPT_ACCEPTANCE_2026-07-18.md`;
milestone-only payment/readiness evidence updates\
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
Approval boundary: Codex may prepare the fictional invoice and Checkout handoff,
but the Owner enters private payment details. Stop for separate exact refund
approval after the payment is verified.\
Implementation result: Fictional invoice #0004 was created for exactly GBP 1.00
using the existing synthetic customer. It contains no real goods/services and
was not emailed. The Owner completed one live Stripe Checkout privately.\
Review result: The signed payment reconciliation completed successfully. Invoice
#0004 is `Paid`, records GBP 1.00 paid, has GBP 0.00 balance due, and exposes one
confirmed Stripe card payment and one refund action. No duplicate payment was
observed. The earlier unused Checkout Session remains unconsumed and will expire
normally.\
Evidence: Value-free browser observation only: selected status `Paid`; `Paid:
GBP 1.00`; `Balance: GBP 0.00`; exactly one `Stripe card payment confirmed`
entry; no card, payer email, Auth value, secret, token, provider identifier,
webhook payload or inbox content inspected.\
Branch: `codex/refund-receipt-acceptance`\
Commit: Pending\
Blocked reason: Live refunds and their foreseeable customer communication require
separate exact Owner approval. The GBP 1 payment approval did not authorise a
refund.\
Next action: Owner provides exact approval for a full GBP 1.00 live refund of
invoice #0004 through Tallyo and acknowledges that Stripe may email the payer a
refund receipt. Codex will then submit one full refund, verify one signed refund
reconciliation and restored invoice balance/status, and ask the Owner only for a
value-free receipt outcome.
