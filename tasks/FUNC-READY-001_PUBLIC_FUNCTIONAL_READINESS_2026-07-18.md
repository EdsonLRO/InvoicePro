# FUNC-READY-001 â€” Functional Public-Use Readiness

Task ID: FUNC-READY-001
Title: Verify and close functional gaps for public self-service use
Objective: Determine whether a clean synthetic user can complete the full Tallyo invoicing journey safely and reliably, implement focused reversible gaps, and issue the required evidence-backed functional verdict.
Risk level: High
Status: In Progress
Phase: Work package 7 / PR 3 â€” dispute lifecycle and operator visibility
Owner role: Master Orchestrator
Assigned specialist: Product Agent and QA Agent, with Frontend, Backend/Supabase, Security, Payments, Documentation and Release roles engaged sequentially when their work package is active
Required reviewers: Security and Payments for critical boundaries; Backend/Supabase for Auth, RLS and privileged functions; QA for each implementation; Release for final verification
Affected files: `index.html`; `service-worker.js`; `supabase/functions/stripe-webhook/index.ts`; `tests/dispute-lifecycle-visibility-harness.cjs`; `tests/pwa-update-harness.cjs`; `.github/workflows/security-checks.yml`; this task record; the FUNC-READY-001 queue row in `PRODUCT_COMPLETION_LEDGER.md`; authoritative payment/release evidence only when the verified state changes
Files or paths locked: `index.html`; `service-worker.js`; `supabase/functions/stripe-webhook/`; `tests/dispute-lifecycle-visibility-harness.cjs`; `tests/pwa-update-harness.cjs`; `.github/workflows/security-checks.yml`; `tasks/FUNC-READY-001_PUBLIC_FUNCTIONAL_READINESS_2026-07-18.md`; the FUNC-READY-001 queue row in `PRODUCT_COMPLETION_LEDGER.md`
Lock acquired: 2026-07-18 for the stacked dispute-lifecycle work package after PR #59 passed its required check
Expected release condition: out-of-order-safe privacy-minimised dispute state is visible with amount, funds signal, deadline and next action; focused tests and the required check pass; Edge Function deployment and frontend publication receive action-time Owner approval
Documents read: `AGENTS.md`; `APP_STATUS.md`; `docs/INDEX.md`; `RELEASE_READINESS.md`; `PRODUCT_COMPLETION_LEDGER.md`; `PAYMENT_OPERATIONS_RUNBOOK.md`; `tasks/PAY-LIVE-002_LIVE_ACTIVATION_2026-07-18.md`; full orchestration, autonomous-permission, security, legal-boundary and computer-use policies; `SUPABASE_HANDOFF.md`; `ROADMAP_EMAIL_PAYMENTS.md`; current focused release, Stripe, Turnstile, MFA recovery, restore, PDF/PWA and release evidence
Documents explicitly not required: future SaaS website, subscription billing, plan, workspace, team, RBAC or AI-assistant planning; archived material not needed to resolve current evidence
Dependencies: `main` at `1cbb420`; PR #58 merged; controlled live payment/refund capability active; existing legal/public-launch block retained
Acceptance criteria: complete the required gap and release matrices; reuse direct current evidence; run fresh tests only for changed or unproven behaviour; implement focused reversible gaps; preserve Auth, MFA, RLS, tenant isolation, signed webhooks, financial integrity, audit minimisation and rollback; complete a clean synthetic end-to-end journey; issue exactly one permitted functional verdict
Required tests: defined per matrix row and focused work package; no repeated live GBP 1 payment/refund, restore, MFA recovery or broad regression without a relevant source/configuration change
Security boundary: never request, inspect, display, store or commit passwords, MFA values, recovery codes, JWTs, secrets, private emails, customer data, card data, bank/identity data, provider payloads or reusable Checkout URLs; preserve fail-closed Auth/AAL, RLS, service-role custody, one-time recovery, signed raw-body verification, mode matching, idempotency, amount/currency/user/invoice binding and append-only evidence
Privacy/legal materiality: UK public self-service and customer communication are legally material, but legal drafting and conclusions are outside this functional task. The existing `Blocked` public-launch disposition and external-review requirement are inherited unchanged; any new legally material behaviour must still follow the repository's mandatory Legal Agent trigger rather than bypass it.
Jurisdictions: United Kingdom initially
Affected user/data-subject types: account holders, sole traders/business users and their customer contacts; synthetic data only during acceptance
Applicable requirements: existing repository security, payment, privacy and release gates; no new legal conclusion is made
Required legal documents: unchanged and outside this task
Mandatory controls: evidence reuse, synthetic accounts/data, accurate communication states, public Auth abuse protection before a public-self-service verdict, no cross-account leakage, predictable payment/refund/dispute state, visible critical automation failure, usable rollback and monitoring
Required evidence: current-state matrix, focused test/fix evidence per PR, final synthetic acceptance, final functional release matrix and exact verdict
Legal disposition: Existing public-launch `Blocked` disposition inherited; no override
External review required: Remains required by existing repository policy for public launch, outside this functional task
Payment impact: sandbox replay and UX work may proceed; any live payment/refund or payment-provider change remains exact action-time Owner approval
Production impact: PR 3 prepares one existing Edge Function update and the matching frontend; no deployment, provider subscription or database change occurs before approval
Owner permission required: not for safe local/sandbox work, commit, push or PR preparation; exact approval before the high-risk PR merges/publication, production Edge Function deployment, live money, real customer/test-address communication where required by policy, production CAPTCHA activation, provider subscription changes, secrets or destructive production actions
Approval boundary: stop only at the exact action listed above and continue other safe work
Implementation result: PR #58 merged as `1cbb420`. PR #59 contains the tested refund consequence preview, PWA build `2026.07.18.1`, and has passed required `verify`; its merge/publication remains gated. The stacked PR-3 implementation adds privacy-minimised dispute timing/deadline metadata to the existing signed webhook audit, orders lifecycle state by provider event time rather than delivery order, and presents status, affected amount, funds-withdrawn/reinstated signal, reason, evidence deadline and a status-specific next action without mutating invoice payment or status state. PWA build/cache advances to `2026.07.18.2`.
Review result: PR #59 sequential Product/Frontend/Payments/Security/QA review and required check passed. PR-3 sequential Payments/Backend/Security/Frontend/QA review found no invoice-state mutation, no provider identifier rendered, and no new secret or RLS path. Eleven focused Node harnesses, frozen Stripe-webhook type-check, `git diff --check`, and a no-data local browser smoke at 320 px pass with build `2026.07.18.2`, no horizontal overflow and no warning/error signal. Official Stripe dispute lifecycle/object documentation and current Supabase Edge Function/RLS guidance were checked on 2026-07-18; required PR check remains pending.
Evidence: `tests/refund-consequence-preview-harness.cjs` covers the refund projection; `tests/dispute-lifecycle-visibility-harness.cjs` covers out-of-order lifecycle delivery, partial dispute amounts, funds signals, deadlines, known-payment binding, duplicate markers and preservation of invoice payment/status state
Branch: `codex/dispute-lifecycle-visibility` stacked on PR #59
Commit: pending for PR 3
Blocked reason: PR #59 merge/publication and the later PR-3 Edge Function deployment/merge/publication remain action-time Owner gates; local implementation is not blocked
Next action: complete focused PR-3 validation and publish the stacked draft PR; continue safe work packages while leaving all production actions unperformed
