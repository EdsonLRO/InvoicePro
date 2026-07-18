# FUNC-READY-001 â€” Functional Public-Use Readiness

Task ID: FUNC-READY-001
Title: Verify and close functional gaps for public self-service use
Objective: Determine whether a clean synthetic user can complete the full Tallyo invoicing journey safely and reliably, implement focused reversible gaps, and issue the required evidence-backed functional verdict.
Risk level: High
Status: In Progress
Phase: Work package 1 â€” current-state functional gap analysis
Owner role: Master Orchestrator
Assigned specialist: Product Agent and QA Agent, with Frontend, Backend/Supabase, Security, Payments, Documentation and Release roles engaged sequentially when their work package is active
Required reviewers: Security and Payments for critical boundaries; Backend/Supabase for Auth, RLS and privileged functions; QA for each implementation; Release for final verification
Affected files: `FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`, this task record and `PRODUCT_COMPLETION_LEDGER.md` for PR 1; later source and test paths will be locked per focused work package
Files or paths locked: `FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`, `tasks/FUNC-READY-001_PUBLIC_FUNCTIONAL_READINESS_2026-07-18.md`, and the FUNC-READY-001 queue row in `PRODUCT_COMPLETION_LEDGER.md`
Lock acquired: 2026-07-18
Expected release condition: PR 1 merged and matrix scope handed to the first implementation work package
Documents read: `AGENTS.md`; `APP_STATUS.md`; `docs/INDEX.md`; `RELEASE_READINESS.md`; `PRODUCT_COMPLETION_LEDGER.md`; `PAYMENT_OPERATIONS_RUNBOOK.md`; `tasks/PAY-LIVE-002_LIVE_ACTIVATION_2026-07-18.md`; full orchestration, autonomous-permission, security, legal-boundary and computer-use policies; `SUPABASE_HANDOFF.md`; `ROADMAP_EMAIL_PAYMENTS.md`; current focused release, Stripe, Turnstile, MFA recovery, restore, PDF/PWA and release evidence
Documents explicitly not required: future SaaS website, subscription billing, plan, workspace, team, RBAC or AI-assistant planning; archived material not needed to resolve current evidence
Dependencies: `main` at `9a514fd`; controlled live payment/refund capability active; PRs #56 and #57 merged; existing legal/public-launch block retained
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
Production impact: none in PR 1; production Auth/CAPTCHA, provider settings, deployed functions and public release changes remain separately gated
Owner permission required: not for PR 1 or safe local/sandbox work; exact approval before live money, real customer/test-address communication where required by policy, production CAPTCHA activation, provider subscription changes, secrets, destructive production actions or deployment requiring approval
Approval boundary: stop only at the exact action listed above and continue other safe work
Implementation result: current evidence and source-change inventory started; initial classification is recorded in `FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`
Review result: pending PR-1 verification
Evidence: the matrix maps each capability to current proof, source-change state, fresh-test need, implementation need and Owner boundary
Branch: `codex/functional-public-readiness-matrix`
Commit: pending
Blocked reason: none for work package 1; later gated actions are listed separately in the matrix
Next action: validate the matrix against current tests/source, publish focused PR 1, then begin the highest-value safe gap without repeating verified live acceptance
