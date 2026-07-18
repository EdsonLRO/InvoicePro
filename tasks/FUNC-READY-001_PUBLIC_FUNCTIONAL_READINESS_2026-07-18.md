# FUNC-READY-001 â€” Functional Public-Use Readiness

Task ID: FUNC-READY-001
Title: Verify and close functional gaps for public self-service use
Objective: Determine whether a clean synthetic user can complete the full Tallyo invoicing journey safely and reliably, implement focused reversible gaps, and issue the required evidence-backed functional verdict.
Risk level: High
Status: Complete
Phase: Controlled-use functional verdict issued after production activation and Auth acceptance
Owner role: Master Orchestrator
Assigned specialist: Product Agent and QA Agent, with Frontend, Backend/Supabase, Security, Payments, Documentation and Release roles engaged sequentially when their work package is active
Required reviewers: Security and Payments for critical boundaries; Backend/Supabase for Auth, RLS and privileged functions; QA for each implementation; Release for final verification
Affected files: `index.html`; `service-worker.js`; the security workflow; focused core-lifecycle, recurring-calendar, scale, accessibility, destructive-safety, PWA and tenant-attribution harnesses; `FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`; this task record; the relevant completion-ledger rows
Files or paths locked: None
Lock released: 2026-07-18 after PR #66 production acceptance
Expected release condition: tenant-owned datasets load beyond the default 1,000-row response limit with stable pagination; simultaneous invoice edits fail visibly instead of silently overwriting; duplicate save actions are guarded; invalid financial inputs and manual overpayments are rejected; recurring date/retry controls have deterministic coverage; destructive actions explain consequences; keyboard focus, reduced motion, labels and loading announcements are present; the standalone-credit limitation is explicit; no production function or frontend publication occurs without action-time Owner approval
Documents read: `AGENTS.md`; `APP_STATUS.md`; `docs/INDEX.md`; `RELEASE_READINESS.md`; `PRODUCT_COMPLETION_LEDGER.md`; `PAYMENT_OPERATIONS_RUNBOOK.md`; `tasks/PAY-LIVE-002_LIVE_ACTIVATION_2026-07-18.md`; full orchestration, autonomous-permission, security, legal-boundary and computer-use policies; `SUPABASE_HANDOFF.md`; `ROADMAP_EMAIL_PAYMENTS.md`; current focused release, Stripe, Turnstile, MFA recovery, restore, PDF/PWA and release evidence
Documents explicitly not required: future SaaS website, subscription billing, plan, workspace, team, RBAC or AI-assistant planning; archived material not needed to resolve current evidence
Dependencies: consolidated PR #64 merged as `b410573`; Turnstile PR #65 merged as `dc666860`; lifecycle hotfix PR #66 merged as `42a4d3d`; existing legal/public-launch block retained
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
Production impact: PR 7 changes frontend, PWA cache metadata and focused CI tests on a dormant stacked branch only. It introduces no migration, runtime dependency, provider configuration or Edge Function source change. No production function deployment, secret, live transaction, customer communication or frontend publication occurs before approval.
Owner permission required: not for safe local/sandbox work, commit, push or PR preparation; exact approval before the high-risk PR merges/publication, production Edge Function deployment, live money, real customer/test-address communication where required by policy, production CAPTCHA activation, provider subscription changes, secrets or destructive production actions
Approval boundary: stop only at the exact action listed above and continue other safe work
Implementation result: PRs #59–#63 were closed as superseded by merged PR #64. Its reviewed Edge Functions were deployed and its consolidated frontend safeguards were published as build `2026.07.18.6`. PR #65 published the production Turnstile Site Key as build `2026.07.18.7`; PR #66 corrected same-tab widget restoration after sign-out and published build `2026.07.18.8`. Supabase CAPTCHA enforcement is active with the secret retained only in Supabase Auth.
Review result: Required checks passed on the consolidated release and both production Turnstile PRs. Live build `2026.07.18.8` passed provider-backed signup, email confirmation, password sign-in, local sign-out, same-tab fresh-challenge restoration and password-reset delivery without recording credentials, private addresses, MFA values, secrets or CAPTCHA tokens. Focused Auth CAPTCHA, PWA, session-expiry and security-workflow harnesses pass. Earlier RLS, payments/refunds, MFA recovery, restore, real-Android, PDF/PWA, scale, accessibility and destructive-safety evidence remains reusable because those boundaries did not materially change.
Evidence: `FUNCTIONAL_PUBLIC_USE_READINESS_MATRIX_2026-07-18.md`; `TURNSTILE_PRODUCTION_ACCEPTANCE_2026-07-18.md`; focused harnesses; PRs #64–#66; prior payment/refund, RLS, MFA recovery, restore, Android and PDF/PWA evidence
Branch: production evidence is on `main`; this closeout is documentation-only
Commit: production merge commits `b410573`, `dc666860`, and `42a4d3d`; all corresponding required checks and Pages deployments passed
Blocked reason: None for the controlled-use verdict. Unrestricted public self-service remains outside the achieved verdict because refund-receipt delivery, linked-credit allocation, unavailable Firefox/iPhone Safari evidence, the single-account downstream journey, and the existing legal/public-launch block remain.
Next action: use Tallyo with controlled users within the recorded limitations; handle each future live refund/customer communication/destructive production action under its retained Owner gate.

Production activation result: the approved sequence completed in order. The public Site Key was published before enforcement; the Owner entered the secret privately; Supabase shows Turnstile enabled; live signup, confirmation, sign-in, sign-out rerender and reset delivery passed. Deterministic tests retain missing/expired/reused-token and provider-failure coverage without extracting tokens. Rollback order remains mandatory: disable Supabase CAPTCHA enforcement first, then set `TURNSTILE_ENABLED=false` and publish the reviewed frontend.

Final functional verdict: **Functionally ready for controlled users**.
