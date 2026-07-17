# AUTH-002 Thread Handoff - 2026-07-17

Task ID: AUTH-002
Title: Close one-time MFA recovery acceptance and PR #44
Objective: Finish the remaining evidence gates for Tallyo's all-factors-lost recovery flow, record the final Legal Agent disposition, and prepare PR #44 for an Owner-approved merge without weakening Auth, MFA, RLS, session revocation, notification minimisation, or secret handling.
Risk level: High
Phase: Live acceptance and release-gate closure
Source role: Master Orchestrator in the previous Codex task
Receiving role: Master Orchestrator in a fresh Codex task
Owner role: Security Agent
Assigned specialists: Backend/Supabase Agent, QA Agent, Legal/Privacy Agent
Required reviewers: Independent Security/QA verification and final Legal Agent disposition
Affected files: `index.html`, `supabase/functions/mfa-recovery/`, recovery migrations, `tests/mfa-recovery-harness.cjs`, and only the authoritative AUTH-002 status/evidence documents whose state changes
Files or paths locked: AUTH-002 implementation and evidence scope on `codex/mfa-recovery-codes` until PR #44 closes
Documents to read: `AGENTS.md`, `APP_STATUS.md`, `docs/INDEX.md`, this file, full `AUTOMATION_MODEL_ORCHESTRATION.md`, full `AUTONOMOUS_EXECUTION_PERMISSION.md`, full `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, full `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, `MFA_RECOVERY_RUNBOOK.md`, `MFA_RECOVERY_ACCEPTANCE_2026-07-16.md`, `LEGAL_MFA_RECOVERY_REVIEW_2026-07-16.md`, `RELEASE_READINESS.md`, and directly affected source/test files
Documents explicitly not required: payment operations, future SaaS website planning, marketing content, and unrelated historical evidence unless a contradiction or regression requires them
Dependencies: Supabase project `cuagwifetheefftleeup`; deployed `mfa-recovery` version 1 with JWT verification; migrations through `20260716161054`; server-only `MFA_RECOVERY_PEPPER`; GitHub PR #44
Acceptance criteria: Close the four remaining gates below with privacy-safe evidence, keep GitHub `verify` passing, obtain the required final legal disposition, then obtain Owner approval before marking the PR ready or merging
Required tests: Only the focused tests required by each remaining gate; rerun the recovery harness, all frozen Edge Function checks, secret scan, and GitHub `verify` after any source change
Security boundary: Never request, inspect, copy, log, store, or commit passwords, TOTP values, QR secrets, recovery codes, JWTs, provider secrets, email bodies, private identifiers, or customer data. Do not create an email-only/support/admin bypass. Do not weaken AAL, RLS, origin checks, global sign-out, one-time consumption, throttling, or forced re-enrolment.
Privacy/legal materiality: High; security notices and account recovery affect access to private business and customer data. Do not claim GDPR compliance, NIST conformance, guaranteed recovery, or complete security.
Payment impact: Not triggered
Production impact: Backend recovery controls are deployed. The recovery frontend exists only on the feature branch and must not reach `main` until the retained gates pass.
Owner permission required: Yes, before marking PR #44 ready/merging and therefore publishing the frontend through GitHub Pages
Approval boundary: Stop before merge, public frontend publication, any secret reveal/rotation, destructive production action, or change to provider enforcement.

## Current Result

Implementation result: The migration, server-only pepper, and JWT-protected Edge Function are deployed. Authenticated generation and replacement, one-time recovery, factor/session cleanup, forced re-enrolment, restrictive recovery-state RLS, two-account isolation, audit minimisation, and five-attempt/15-minute throttling have passed. The Owner completed a private recovery lifecycle and generated a fresh code set without sharing any secret value.

Review result: Local security harnesses and frozen Deno checks for all ten Edge Functions pass. GitHub PR #44 is open, draft, mergeable, and its required `verify` check passes on the latest pushed branch state. Confirm the live PR status before closure rather than relying on a frozen run number.

Evidence:

- `MFA_RECOVERY_ACCEPTANCE_2026-07-16.md`
- `MFA_RECOVERY_RUNBOOK.md`
- `LEGAL_MFA_RECOVERY_REVIEW_2026-07-16.md`
- `RELEASE_READINESS.md`
- Privacy-safe production readback confirmed ten HMAC-only hashes after fresh generation, no active recovery lock, and no failed-attempt state.
- A rollback-only live probe produced four `invalid` claims followed by `locked` on attempt five, then left no retained failed-attempt, lock, or recovery-required state.
- Resend API acceptance is recorded for generation, recovery-started, and recovery-completed notices. Inbox delivery and content minimisation are not yet confirmed.
- Read-only account-screen checks passed at 1280x800, 390x844, and 320x700 with no horizontal overflow or browser console warning/error. This is not a completed real-phone recovery-flow test.

Branch: `codex/mfa-recovery-codes`
Implementation/evidence baseline commit: `420c143`; use current Git `HEAD` for the later handoff-only documentation commits
Pull request: [PR #44](https://github.com/EdsonLRO/InvoicePro/pull/44), draft and mergeable as checked on 2026-07-17

## Remaining Gates

1. **Live AAL1 generation rejection:** with a dedicated test account stopped at AAL1, attempt only recovery-code generation and confirm it is rejected; then confirm AAL2 generation remains accepted. The user enters all passwords/TOTP values directly and shares only pass/fail.
2. **Notification inbox delivery and minimisation:** the Owner confirms receipt of the generation, recovery-started, and recovery-completed notices and confirms they contain no password, TOTP secret, recovery code, token, customer, invoice, or payment content. Do not ask the Owner to paste the messages.
3. **Real-phone recovery acceptance:** complete the actual recovery flow on a real phone without weakening the production origin allowlist. Confirm no clipping, horizontal overflow, inaccessible controls, exposed secret values, or business-data access before verified re-enrolment. A safe preview/publication plan may require separate Owner approval because the feature branch is not the GitHub Pages source.
4. **Final Legal Agent disposition:** after the evidence above, update the legal review with a final internal disposition and retain the external UK legal/privacy review requirement before paid/public onboarding.

Blocked reason: Gates 1-3 require controlled Owner interaction or a separately approved safe preview/publication path. Gate 4 depends on their evidence.

Next action: Verify notification receipt first because it requires no code or provider change. Then design the smallest safe method for the live AAL1 rejection and real-phone flow. Do not invent additional app work or broaden into the future SaaS website.

## Fresh-Thread Operating Rule

Treat the current invoicing app as functionally finished. Work only on the four AUTH-002 gates above. Do not restart repository-wide analysis, repeat already-passed tests without a relevant change, or begin optional hardening, live Stripe, public launch, legal publication, Turnstile activation, or SaaS website work.
