# MFA Recovery Acceptance - 2026-07-16

## Scope

This record covers the candidate all-factors-lost recovery implementation on `codex/mfa-recovery-codes`. It contains privacy-safe pass/fail evidence only. Passwords, TOTP values, QR secrets, raw recovery codes, account email addresses, user IDs, JWTs, and server secrets must never be added here.

## Current Disposition

**Backend deployed and structurally verified; authenticated lifecycle passed, with selected release gates still open.**

The migration, server-only pepper, and JWT-protected Edge Function are deployed. Authenticated generation, replacement, one-time recovery, forced re-enrolment, audit-minimisation, recovery-lock behaviour, and live throttling logic have passed with privacy-safe evidence. Production continues to use the approved deny-by-default user process because notification delivery, final legal disposition, and real-device acceptance remain. The feature must not be described as fully live or accepted yet.

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
| Pre-deployment shell regression | Passed | Local build `2026.07.16.2` rendered at desktop, 390 px, and 320 px with no page-level horizontal overflow or captured browser warning/error. Later read-only authenticated Account-page checks at 1280x800, 390x844, and 320x700 also showed the Recovery Codes controls without horizontal overflow or browser warning/error. This does not replace a real-phone recovery-flow test. |
| Regression suite | Passed | All repository security harnesses passed after implementation. |
| Legal/privacy/security review | Conditional | `LEGAL_MFA_RECOVERY_REVIEW_2026-07-16.md` permits implementation/testing but blocks production until its conditions and this live matrix are closed. |

Static checks do not prove hosted database behaviour, global session invalidation, provider factor deletion, or email delivery. Those require the live tests below.

## Live Backend Evidence

| Control | Result | Privacy-safe evidence |
|---|---|---|
| Migration history | Passed | Production and repository history match through `20260716161054`; the initial recovery migration and two corrective helper migrations applied successfully. |
| Secret handling | Passed | `MFA_RECOVERY_PEPPER` was generated from 48 cryptographically random bytes and installed directly as an Edge secret without displaying or writing the value. |
| Function deployment | Passed | `mfa-recovery` version 1 is active with JWT verification enabled. |
| Network boundary | Passed | Missing credentials returned 401, an unapproved origin returned 403, and a publishable key without a user session returned 401. |
| Database privileges | Passed | Recovery tables have RLS; browser writes are denied; all four privileged RPCs are service-role-only security-definer functions with fixed empty search paths. |
| Tenant policy coverage | Passed | Both restrictive policies exist on all six tenant-data tables. A rolled-back probe confirmed AAL1 saw zero rows, AAL2 matched the account's own baseline, and pending recovery saw zero rows across all six tables. |
| Helper exposure | Passed after correction | Live probing found that direct policy access to `auth.mfa_factors` was denied. The final design uses a current-user-only security-definer helper in non-exposed schema `private`; the exposed helper was removed. Security and per-row JWT advisor warnings then cleared. |
| Probe cleanup | Passed | Rolled-back tests left zero recovery-state and zero recovery-code rows. |
| Advisor disposition | Accepted with documented INFO | `mfa_recovery_codes` intentionally has RLS with no browser policy. Unused-index and Auth connection-strategy notices are informational at current scale. |

## Authenticated Lifecycle Evidence

| Control | Result | Privacy-safe evidence |
|---|---|---|
| Browser generation UI | Passed after fix | The Account page showed Recovery Codes, generated a set, and closed the modal with zero code-shaped values visible. A missing `formatDateTime` helper caused an initial blank render after generation; this was fixed before continuing. |
| Recovery-code claim | Passed | The user used one saved code privately. The app reported that recovery was accepted and every device was signed out. The code value was never shared or inspected. |
| Forced recovery state | Passed | After signing in again, the app showed only the forced "Secure your recovered account" authenticator setup screen. Business navigation/data was not visible, the QR setup and restore button were visible, and no console errors appeared. |
| Recovery completion | Passed | The user verified a new authenticator privately. The app restored access to the invoice workspace and removed the recovery setup screen. |
| Fresh code set after recovery | Passed | The user generated and saved a fresh set after recovery. Production readback showed exactly ten stored hashes, one active generation, 64-character lowercase-hex hashes only, no malformed/non-hex hashes, no recovery lock, and no failed-attempt state. |
| Audit minimisation | Passed | Recent recovery audit events contained only approved recovery event types and no password, TOTP, secret, token, JWT, or recovery-code-shaped metadata. |
| Security-notice provider acceptance | Partial | Privacy-safe production evidence shows the generation, recovery-started, and recovery-completed notice calls were accepted by the Resend API. This does not prove inbox delivery or message-content minimisation; Owner confirmation remains required. |

## Approval-Gated Deployment Evidence

Record only dates, versions, counts, HTTP status classes, and pass/fail outcomes.

- [x] Migration applied successfully; tables, policies, grants, and RPC signatures read back as expected.
- [x] `MFA_RECOVERY_PEPPER` installed without display, logging, or repository storage.
- [x] `mfa-recovery` deployed with JWT verification enabled; deployed source/version read back.
- [x] No-credential request rejected with HTTP 401.
- [x] Unapproved browser origin rejected with HTTP 403.
- [ ] AAL1 code generation rejected; AAL2 generation accepted.
- [x] Exactly ten HMAC rows exist and no raw-code-shaped value exists in either recovery table or recent audit metadata.
- [x] Replacing a set invalidates the previous generation.
- [x] Wrong codes are rejected without account-data access; a rollback-only production probe returned `invalid` for attempts one through four and `locked` on attempt five with a 15-minute window. A follow-up read confirmed the rollback left zero failed attempts, active locks, or recovery-required rows. Existing AAL1/RLS probes confirm account data remains unavailable before MFA verification.
- [x] A valid code works once, invalidates its complete set, removes old factors, and signs out existing sessions.
- [x] While recovery is pending, SELECT and rolled-back write probes fail across `company_settings`, `customers`, `saved_items`, `invoices`, `recurring_templates`, and `audit_events`.
- [x] A second account cannot read or alter the recovering account's state or tenant data.
- [x] New TOTP enrolment is forced; business access returns only after verification at AAL2 and recovery completion.
- [ ] Generation, recovery-started, and recovery-completed notices arrive and contain no secrets or codes.
- [x] Audit events contain only approved event types and minimal count/phase/notice metadata.
- [ ] Desktop, 390 px, 320 px, and real-phone flows have no clipping, horizontal overflow, or inaccessible controls.
- [ ] Legal Agent mandatory conditions are marked resolved or explicitly deferred by the Owner before paid/public onboarding.

## Rollback Rule

If migration or function probes fail, do not publish the frontend. If a failure is found after publication, restore the deny-by-default UI first. Do not create an email-only or administrator factor-removal bypass as a temporary workaround.
