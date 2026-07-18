# PAY-LIVE-003 — Minimum live refund-receipt acceptance

Task ID: PAY-LIVE-003\
Objective: Prove the minimum GBP 1 live payment/refund lifecycle and Stripe
automatic refund-receipt outcome without recording private payment, inbox, Auth,
provider or customer values.\
Priority: High\
Status: Awaiting Owner Action\
Phase: Private Stripe Checkout handoff\
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
Implementation result: One fictional invoice was created for exactly GBP 1.00
using the existing synthetic customer. It contains no real goods/services, was
not emailed, remains unpaid, and exposes an enabled live `Pay by Card` action
with no test-mode banner.\
Review result: Invoice total, saved list row, live-mode UI and payment handoff
guard passed. The automated new-window handoff was blocked by the in-app browser
after one Checkout Session request; no payment or invoice mutation occurred. The
unused provider session will expire normally.\
Evidence: Value-free browser observation only: total GBP 1.00; one matching
saved invoice; payment section present; live Pay button enabled; zero test-mode
banners; no email action; no card, payer, Auth, secret, token or provider
payload inspected.\
Branch: `codex/refund-receipt-acceptance`\
Commit: Pending\
Blocked reason: Browser popup policy requires the Owner to click `Pay by Card`
in the prepared invoice and complete Stripe Checkout privately.\
Next action: Owner clicks `Pay by Card`, completes the GBP 1 payment, returns to
Tallyo and reports that the payment-success page appeared. Codex then verifies
value-free settlement evidence and stops for separate refund approval.
