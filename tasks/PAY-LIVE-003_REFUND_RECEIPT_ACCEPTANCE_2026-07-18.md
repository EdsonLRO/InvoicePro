# PAY-LIVE-003 — Minimum live refund-receipt acceptance

Task ID: PAY-LIVE-003\
Objective: Prove the minimum GBP 1 live payment/refund lifecycle and Stripe
automatic refund-receipt outcome without recording private payment, inbox, Auth,
provider or customer values.\
Priority: High\
Status: Awaiting Owner Action\
Phase: Private refund-receipt confirmation\
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
Refund approval recorded: On 2026-07-18 the Owner explicitly approved one full
GBP 1.00 live refund of invoice #0004 through Tallyo and acknowledged that
Stripe may email the payer a refund receipt.\
Approval boundary: Codex may prepare the fictional invoice and Checkout handoff,
but the Owner enters private payment details. Stop for separate exact refund
approval after the payment is verified.\
Implementation result: Fictional invoice #0004 was created for exactly GBP 1.00
using the existing synthetic customer. It contains no real goods/services and
was not emailed. The Owner completed one live Stripe Checkout privately and,
after a separate approval, Codex submitted one full GBP 1.00 refund through
Tallyo.\
Review result: The payment and refund reconciliations completed successfully.
Invoice #0004 returned to `Sent`, records GBP 0.00 paid and GBP 1.00 balance due,
and exposes exactly one confirmed Stripe card payment and one confirmed Stripe
refund. No duplicate payment or refund was observed. The earlier unused Checkout
Session remains unconsumed and will expire normally.\
Evidence: Value-free browser observation only: selected status `Sent`; `Paid:
GBP 0.00`; `Balance: GBP 1.00`; exactly one `Stripe card payment confirmed`
entry; exactly one `Stripe refund confirmed` entry for GBP 1.00; no card, payer
email, Auth value, secret, token, provider identifier, webhook payload or inbox
content inspected.\
Branch: `codex/refund-receipt-acceptance`\
Commit: Pending\
Blocked reason: Codex cannot inspect the private payer inbox. The Owner must
confirm the receipt outcome without sharing the address, message content or any
customer-facing reference value.\
Next action: Owner privately checks whether Stripe's automatic refund receipt
arrived and reports only `yes` or `no`. If present, the Owner may also report
whether a customer-facing reference is shown, without sharing the reference
itself. Codex will then close the acceptance evidence and prepare the draft PR
for the required Owner merge/publish approval.
