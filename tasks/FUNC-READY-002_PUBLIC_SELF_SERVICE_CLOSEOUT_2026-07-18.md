# FUNC-READY-002 — Public self-service functional closeout

Task ID: FUNC-READY-002\
Title: Close remaining app-only public self-service functional gates\
Objective: Complete every safe synthetic, sandbox, browser and source-level gate
remaining after the controlled-user verdict, then stop only for exact Owner
actions involving live money/refunds, private inbox or credentials, unavailable
iPhone Safari, destructive production cleanup, high-risk merge/publication, or a
material accounting decision.\
Priority: High\
Status: Approved for Release\
Phase: PR #68 merge and build `2026.07.18.9` publication\
Owner role: Master Orchestrator\
Assigned specialist: Product, Frontend, Backend/Supabase, Payments and QA
responsibilities performed sequentially\
Model/work mode: Sol for financial, RLS and release boundaries; Terra for scoped
implementation and QA\
Risk level: High — production Auth context, tenant isolation, financial state,
Stripe refunds and public-use release claims\
Required reviewers: Payments, Backend/Supabase, Security, QA and Release; Legal
block retained but legal drafting is explicitly outside this functional work
package\
Affected files: `index.html`; `service-worker.js` only if frontend behaviour
changes; focused core/refund/payment/recurring/scale/tenant harnesses; this task
record; only authoritative readiness/evidence documents whose state changes\
Files or paths locked: `index.html`; `service-worker.js`;
`tests/refund-consequence-preview-harness.cjs`; any new focused FUNC-READY-002
harness/evidence;
`tasks/FUNC-READY-002_PUBLIC_SELF_SERVICE_CLOSEOUT_2026-07-18.md`;
milestone-only updates to `PRODUCT_COMPLETION_LEDGER.md`,
`RELEASE_READINESS.md`, and
`FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`\
Lock acquired: 2026-07-18 on branch `codex/public-self-service-closeout`\
Expected release condition: focused implementation and evidence complete,
required checks/reviews pass, high-risk PR is prepared, exact Owner approval is
obtained before merge/publication, and locks are released at closure\
Documents read: `AGENTS.md`; `APP_STATUS.md`; `docs/INDEX.md`;
`FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`;
`AUTOMATION_MODEL_ORCHESTRATION.md`; `AUTONOMOUS_EXECUTION_PERMISSION.md`;
`AGENT_HIERARCHY_AND_COMPUTER_USE.md`; `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`;
`SUPABASE_HANDOFF.md`; `ROADMAP_EMAIL_PAYMENTS.md`;
`PAYMENT_OPERATIONS_RUNBOOK.md`; `RELEASE_READINESS.md`;
`TALLYO_LEGAL_COMPLIANCE_AGENT.md`; current Supabase changelog and official
RLS/Data API guidance\
Documents explicitly not required: future SaaS website, subscription plans,
teams/workspaces/RBAC, marketing, public legal documents, archived tasks
unrelated to a regression or contradictory claim\
Dependencies: `main` at `a51a1cde`; production build `2026.07.18.8`; PRs #64–#67
merged; controlled-use verdict and existing constituent RLS, payments/refunds,
MFA, restore, Android/PWA/PDF and scale evidence\
Security boundary: preserve Auth, MFA, sessions, recovery, RLS, tenant
ownership, service-role attribution, signed webhooks, idempotency, audit
minimisation, secret custody and fail-closed handling; use synthetic data only;
never inspect or record private Auth values, CAPTCHA tokens, provider secrets or
customer data\
Legal materiality: UK public launch, payments, refunds and communications are
legally material. Existing legal/public-launch block remains unchanged and
cannot be overridden by this app-only task. Legal drafting, publication and
compliance claims are out of scope.\
Jurisdictions: United Kingdom only for retained release context\
Affected user/data-subject types: synthetic account holder and fictional
customer records only during testing\
Applicable requirements: existing repository security, payment, release and
legal approval boundaries; no new legal conclusion is issued\
Required legal documents: None changed; existing unpublished drafts and
external-review requirement remain separate\
Mandatory controls: synthetic-only data, no unapproved communication, no
unapproved live money/refund, no destructive production cleanup, no secret
inspection, no RLS weakening, no silent accounting-semantic change\
Required evidence: focused deterministic harnesses; safe live browser
observations; sandbox payment/refund state matrix; clean-account integrated
journey; cross-engine evidence only where a genuine engine is available;
redacted task evidence\
Legal disposition: Existing `Blocked` public-launch disposition retained; this
task may only issue an app-functional verdict\
External review required: Unchanged and outside this task\
Legal review date: Existing repository review retained; no new legal review
performed\
Acceptance criteria: (1) complete the clean synthetic downstream journey without
real communication or live money; (2) close refund consequence UX and sandbox
state coverage without changing accounting semantics; (3) present the
linked-credit decision before any implementation; (4) complete clean-account
isolation integration without cross-tenant disclosure; (5) close focused
edge/scale/deployed recurring evidence; (6) add genuine Firefox evidence if
safely available and record iPhone Safari as Owner-only when unavailable; (7)
prepare the minimum live refund-receipt acceptance and stop for exact Owner
action; (8) issue an evidence-backed app-only verdict\
Required tests: affected focused Node harnesses; security workflow; diff/secret
checks; live synthetic browser smoke; sandbox/provider replay only where
non-billable and already configured; no repeated destructive MFA/restore or
broad regression without a relevant source change\
Payment impact: Sandbox refund/payment cases may run autonomously. Any new live
charge or refund, payer inbox check, Stripe live configuration change or real
communication requires exact Owner approval at action time.\
Production impact: Reversible fictional records may be created in the
Owner-approved synthetic account. No production deletion,
schema/provider/Auth/RLS change, Edge deployment or frontend publication without
the applicable gate.\
Owner permission required: Exact approval for live GBP 1 payment/refund and its
foreseeable Stripe receipt; private card/inbox actions; iPhone Safari
participation; destructive synthetic-account/record cleanup; linked-credit
accounting choice; high-risk merge/publication.\
Approval boundary: Continue all independent safe work and stop only immediately
before the exact gated action.\
Owner approval recorded: On 2026-07-18 the Owner explicitly approved marking PR
#68 ready, merging it, and publishing build `2026.07.18.9`. This approval does
not extend to a new live payment/refund, private receipt inspection, production
deletion, iPhone Safari participation or invoice-linked credit allocation.\
Implementation result: Build `2026.07.18.9` validates customer names and
optional email syntax before all customer-save paths, trims stored customer/item
strings, rejects non-finite or negative saved-item defaults, normalises item
defaults to two decimal places, and advances the PWA cache. The refund
consequence implementation was not changed; its existing intent-scoped model was
verified across the expanded state matrix.\
Review result: Focused manual Sol-level security review found no reportable
regression. All eighteen required Node harnesses pass, all ten Edge Functions
type-check with frozen locks, all changed/untracked files pass the focused
secret-pattern scan, and the branch is current with `origin/main`. Payment
integrity, tenant attribution, Auth/CAPTCHA/MFA/session, audit, dispute,
email-state, export, operational-health, PWA, scale and lifecycle boundaries
remain intact. Draft PR #68 is mergeable and its required `verify` check passed
against release-candidate commit `a202b92`.\
Evidence: A clean fictional downstream journey completed in the confirmed
synthetic production account without sending email, entering Checkout, moving
money or deleting data: customer and item creation; invoice creation,
edit/status, duplicate, PDF and XLSX; quote create/edit/convert; standalone
credit-note warning; recurring schedule create, pause, resume and edit. The
deterministic refund matrix passes partial, sequential, excess, deposit, mixed
manual/Stripe, overpayment, cancelled and unrelated-credit cases. Existing
direct two-account RLS evidence remains current because no
RLS/privileged-function source changed. Genuine Firefox is not installed and
iPhone Safari was not simulated.\
Branch: `codex/public-self-service-closeout`\
Commit: Branch head; PR #68 records the authoritative merge candidate\
Blocked reason: No blocker to the approved PR #68 release. Separate exact Owner
action remains required for any new live GBP 1 payment/refund and private
receipt check, destructive production cleanup, iPhone Safari participation, and
any decision to introduce invoice-linked credit allocation.\
Next action: Mark PR #68 ready, merge it, publish build `2026.07.18.9`, and
verify the public deployment before closing this task.

## Safe execution evidence

- Synthetic browser journey: Passed on the deployed build using fictional values
  only. No customer communication, private Auth value, payment detail or secret
  was inspected or recorded.
- Customer/item edge validation:
  `node tests/customer-item-validation-harness.cjs` passed.
- Core lifecycle: `node tests/core-lifecycle-harness.cjs` passed.
- Refund consequences and server guards:
  `node tests/refund-consequence-preview-harness.cjs` and
  `node tests/stripe-payment-integrity-harness.cjs` passed.
- Scale/accessibility/destructive safeguards:
  `node tests/scale-accessibility-safety-harness.cjs` passed with the existing
  isolated 1k/1k/2k/100-line/500-history matrix.
- Recurring calendar/retry coverage: existing deterministic evidence remains
  current; deployed create/pause/resume/edit passed during this task. Production
  delete and email were intentionally not performed.
- Cross-engine: Chrome/Edge are available Chromium engines; Firefox is not
  installed. Genuine iPhone Safari remains an Owner/device action if required.
- Tenant isolation: the current all-six-table two-account read/write evidence
  and authenticated function-attribution harness are reused. No tenant policy,
  schema or service-role boundary changed.

## Accounting decision retained

Tallyo credit notes remain standalone documents and explicitly state that they
do not reduce an invoice balance. Implementing invoice-linked allocation would
change financial state, reconciliation and likely schema semantics. It is not
silently added here. The safe default is to retain standalone credits for this
release and treat linked allocation as a separately approved future feature.
