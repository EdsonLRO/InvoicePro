# MFA Recovery Acceptance - 2026-07-16

## Scope

This record covers the candidate all-factors-lost recovery implementation on `codex/mfa-recovery-codes`. It contains privacy-safe pass/fail evidence only. Passwords, TOTP values, QR secrets, raw recovery codes, account email addresses, user IDs, JWTs, and server secrets must never be added here.

## Current Disposition

**Implemented and locally verified; not deployed or production-accepted.**

Production continues to use the approved deny-by-default process in `MFA_RECOVERY_RUNBOOK.md`. The candidate must not be described as live until every production item below passes.

## Local Evidence

| Control | Result | Evidence |
|---|---|---|
| Edge Function type safety | Passed | `deno check --frozen --lock=deno.lock index.ts` passed for `mfa-recovery`. |
| Dependency integrity | Passed | Exact `@supabase/supabase-js@2.110.1` pin and committed v4 lock pass the repository dependency harness. |
| Raw-code handling | Passed by static inspection | Codes are returned once to the AAL2 browser flow; SQL stores HMAC-SHA256 hex only; email/audit templates do not interpolate codes. |
| Privileged function access | Passed by static inspection | `SECURITY DEFINER` RPC execution is revoked from `PUBLIC`, `anon`, and `authenticated`, then granted only to `service_role`; each function has a fixed empty search path. |
| AAL gates | Passed by harness | Generation and completion require AAL2; recovery requires an AAL1 password session plus a saved code. |
| Attempt control | Passed by harness | Five failed attempts trigger a 15-minute lock. |
| One-time semantics | Passed by harness | Claiming one valid code deletes the complete generation before factor cleanup. |
| Recovery lock | Passed by harness | Restrictive policies cover all six tenant-data tables and deny access while recovery is pending. |
| Browser state clearing | Passed by harness | Raw code and recovery-entry state clear on sign-out; recovery routing checks state before business-data initialisation. |
| Pre-deployment shell regression | Passed | Local build `2026.07.16.2` rendered at desktop, 390 px, and 320 px with no page-level horizontal overflow or captured browser warning/error. Recovery-specific screens remain pending because the backend is intentionally not deployed. |
| Regression suite | Passed | All repository security harnesses passed after implementation. |
| Legal/privacy/security review | Conditional | `LEGAL_MFA_RECOVERY_REVIEW_2026-07-16.md` permits implementation/testing but blocks production until its conditions and this live matrix are closed. |

Static checks do not prove hosted database behaviour, global session invalidation, provider factor deletion, or email delivery. Those require the live tests below.

## Approval-Gated Deployment Evidence

Record only dates, versions, counts, HTTP status classes, and pass/fail outcomes.

- [ ] Migration applied successfully; tables, policies, grants, and RPC signatures read back as expected.
- [ ] `MFA_RECOVERY_PEPPER` installed without display, logging, or repository storage.
- [ ] `mfa-recovery` deployed with JWT verification enabled; deployed source/version read back.
- [ ] No-credential request rejected with HTTP 401.
- [ ] Unapproved browser origin rejected with HTTP 403.
- [ ] AAL1 code generation rejected; AAL2 generation accepted.
- [ ] Exactly ten HMAC rows exist and no raw-code-shaped value exists in either recovery table or recent audit metadata.
- [ ] Replacing a set invalidates the previous generation.
- [ ] Wrong codes are rejected without account-data access; the fifth failed attempt locks recovery for 15 minutes.
- [ ] A valid code works once, invalidates its complete set, removes old factors, and signs out existing sessions.
- [ ] While recovery is pending, SELECT and rolled-back write probes fail across `company_settings`, `customers`, `saved_items`, `invoices`, `recurring_templates`, and `audit_events`.
- [ ] A second account cannot read or alter the recovering account's state or tenant data.
- [ ] New TOTP enrolment is forced; business access returns only after verification at AAL2 and recovery completion.
- [ ] Generation, recovery-started, and recovery-completed notices arrive and contain no secrets or codes.
- [ ] Audit events contain only approved event types and minimal count/phase/notice metadata.
- [ ] Desktop, 390 px, 320 px, and real-phone flows have no clipping, horizontal overflow, or inaccessible controls.
- [ ] Legal Agent mandatory conditions are marked resolved or explicitly deferred by the Owner before paid/public onboarding.

## Rollback Rule

If migration or function probes fail, do not publish the frontend. If a failure is found after publication, restore the deny-by-default UI first. Do not create an email-only or administrator factor-removal bypass as a temporary workaround.
