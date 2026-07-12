# SECURITY_FINDINGS_LEDGER.md - Tallyo

This is the working record for security findings, remediation decisions, verification, and residual risk.

It is not a formal compliance audit log. It is a practical engineering ledger so Tallyo's security work can be explained, reviewed, and followed up without relying on memory.

## How to use this ledger

For each meaningful security finding or hardening item, record:

- **Finding:** what was wrong or risky.
- **Impact:** what could go wrong if ignored.
- **Classification:** vulnerable, defense-in-depth, not vulnerable, or accepted risk.
- **Change:** what was changed.
- **Verification:** what was tested or checked.
- **Residual risk:** what still remains.
- **Evidence:** commit, file, SQL, deployment, or manual test reference.

Do not store secrets, tokens, customer PII, full exported invoices, or provider payloads here.

## Entries

### SEC-LOG-001 - Stripe test/development state was too easy to miss

- **Date:** 2026-07-12
- **Classification:** defense-in-depth / operational safety
- **Finding:** Stripe invoice payments were correctly documented as test/development, but the payment panel did not show a nearby operator-facing reminder.
- **Impact:** During testing, a user could mistake sandbox payment links for live-ready payment links.
- **Change:** Added a Stripe test-mode notice in the invoice payments panel and updated the email/payments roadmap.
- **Verification:** Ran `git diff --check`; reviewed the focused diff.
- **Residual risk:** Live Stripe mode still requires explicit approval, live secrets, replay testing, refund/dispute policy, backup/restore evidence, and legal/privacy groundwork.
- **Evidence:** Commit `f24df16` (`Polish Stripe payment readiness messaging`).

### SEC-LOG-002 - New-password checks were too weak locally

- **Date:** 2026-07-12
- **Classification:** defense-in-depth / account security
- **Finding:** The app only checked for 8-character passwords in signup/change-password/recovery flows.
- **Impact:** Weak passwords are easier to guess, reuse, or crack if compromised elsewhere.
- **Change:** Added local password checks for 12+ characters, obvious common terms, email-name inclusion, and weak short composition; updated user-facing hints and documentation.
- **Verification:** Ran `git diff --check`; searched for old `8 characters` wording; reviewed the focused diff.
- **Residual risk:** Client-side checks are not a replacement for Supabase Auth password policy, rate limiting, breached-password screening, MFA recovery planning, or monitoring.
- **Evidence:** Commit `02ee05e` (`Strengthen local password checks`).

### SEC-LOG-003 - MFA password change failed without AAL2 re-verification

- **Date:** 2026-07-12
- **Classification:** vulnerable / account security correctness
- **Finding:** Change Password rechecked the current password with `signInWithPassword`, but on MFA-enabled accounts that creates an AAL1 session. The app then called `updateUser` before completing a fresh MFA challenge, so Supabase rejected the password update with an AAL2-required error.
- **Impact:** MFA-protected users could not change their password from the app, and the failure was confusing.
- **Change:** Added an authenticator-code field when MFA is enabled and completed a Supabase MFA challenge/verify step after current-password reauth and before `updateUser`.
- **Verification:** Ran `git diff --check`; reviewed against Supabase MFA/AAL docs. Manual browser test still required on the deployed app.
- **Residual risk:** MFA recovery/backup flow is still not implemented; Auth-level password policy and breached-password protection still need dashboard confirmation.
- **Evidence:** This fix commit; manual browser test pending.

## Open Follow-Ups

- Confirm Supabase Auth password policy, JWT/session expiry, and rate-limit settings.
- Decide whether breached-password screening will be enabled through provider settings or a trusted server-side check.
- Add the future verified "log out from all devices" flow when account-safety work begins.
- Record Stripe replay-test results for failed payment, refund failure, dispute, and duplicate webhook scenarios.
- Record backup and restore test evidence once a non-production restore is performed.
