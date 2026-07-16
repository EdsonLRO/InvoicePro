# Tallyo MFA Recovery Runbook

This runbook records how Tallyo handles multi-factor authentication (MFA) recovery. It is an operational guide, not a claim that account recovery is risk-free.

## Current Production Recovery Model

Tallyo uses time-based one-time password (TOTP) authenticators through Supabase Auth. Supabase Auth did not provide native recovery codes when rechecked on 2026-07-16.

The supported recovery method is therefore a second verified authenticator:

1. The user enables MFA with a primary authenticator.
2. While still signed in, the user adds one backup authenticator from Account Security.
3. Either verified authenticator can complete sign-in or password recovery.
4. Removing either authenticator is allowed only while another verified factor remains and requires a fresh code from that remaining authenticator.
5. Turning MFA off requires a fresh authenticator code and removes the enrolled factors.

Tallyo does not use email, SMS, security questions, or a browser-stored code as an MFA bypass.

The production user experience still uses this model. The recovery database controls, server-only pepper, and JWT-protected Edge Function were deployed on 2026-07-16, but the browser UI remains unpublished until authenticated lifecycle and real-device acceptance pass. The feature is therefore not yet described as fully live.

## Recovery-Code Candidate

The candidate design adds ten one-time codes that are shown once to an already AAL2-verified user. Each code contains 100 bits of randomness. Raw codes are not stored, emailed, logged, or sent to audit history. Postgres stores only HMAC-SHA256 values made with a server-only `MFA_RECOVERY_PEPPER`.

Recovery requires both the account password session at AAL1 and one saved recovery code. A successful claim atomically invalidates the complete code set, removes the old TOTP factors through the server-side Supabase Admin API, globally signs out existing sessions, and places the account in a database-enforced recovery state. Restrictive RLS policies deny the six tenant-data tables until a new TOTP factor is verified at AAL2 and the recovery state is completed.

The function sends security notices when codes are replaced, when recovery starts, and when recovery completes. Notices contain no password, TOTP secret, or recovery code. Five failed attempts within the active window cause a 15-minute lock. This is a risk-assessed Tallyo control; it is not a claim of NIST conformance or legal compliance.

## Password Recovery

The password-reset email proves access to the registered mailbox, but it does not replace the second factor.

- The reset page uses masked new-password and confirmation fields.
- The app must successfully load the account's MFA requirements before enabling the password update.
- If verified TOTP factors exist, a valid code from the selected primary or backup authenticator is required.
- If factor discovery or assurance verification fails, recovery stops and asks the user to reopen the reset link.
- Successful recovery writes an allowlisted `account_password_recovered` audit event without storing the password, email address, TOTP code, or recovery token.

## Lost-Factor Scenarios

| Situation | Supported action |
|---|---|
| Primary authenticator unavailable, backup available | Use the backup authenticator, then replace the lost factor while signed in. |
| Backup authenticator unavailable, primary available | Use the primary authenticator and remove/re-enrol the backup. |
| Password forgotten, at least one authenticator available | Use the password-reset email and complete the TOTP challenge. |
| All authenticators lost | Production currently has no self-service bypass. After the candidate is deployed and accepted, use the password plus one saved one-time recovery code, then enrol a new authenticator before business data is unlocked. |

## All Factors Lost

The Owner accepted the following interim deny-by-default process on 2026-07-14 for the current portfolio build:

1. Support must not disable MFA, remove factors, transfer account data, or treat control of the registered email address as sufficient identity proof.
2. Support must not collect passports, driving licences, selfies, banking records, or other identity evidence because Tallyo has no approved identity-proofing, evidence-retention, or secure-review process.
3. Support explains that access cannot currently be restored without a verified authenticator and directs the user to use a separately enrolled backup authenticator if one remains available.
4. A support case may record only the date, a non-sensitive case reference, the category `all_factors_lost`, and the outcome `recovery_unavailable`. It must not contain passwords, TOTP codes, QR secrets, recovery tokens, invoice/customer content, or identity documents.
5. The account and its data remain subject to the normal retention and deletion rules. Support must not migrate data to a replacement account or disclose account contents through another channel.
6. A suspicious, coercive, or disputed request is escalated as a security incident; it does not create an exception to the policy.

This defines what support does today without creating an administrator bypass. Keep it in force until the recovery-code candidate passes live acceptance. No support or administrator exception is introduced by the candidate.

Security and privacy basis checked on 2026-07-14:

- NIST SP 800-63B describes saved/issued recovery codes, recovery contacts, or repeated identity proofing as recovery classes and requires recovery to be based on documented risk analysis: https://pages.nist.gov/800-63-4/sp800-63b.html
- Tallyo does not identity-proof account holders, so an informal document check or email-only reset would not reliably reassociate a claimant with an account.
- The ICO data-minimisation principle supports not collecting identity documents without a defined, necessary purpose and controlled lifecycle: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/

These sources inform the design; Tallyo does not claim NIST certification or legal compliance.

## Security Checks

For each release that changes Auth or MFA:

1. Sign in without MFA and confirm normal access still works.
2. Sign in with MFA and confirm an incorrect code is rejected.
3. Simulate an assurance-level or factor-list error and confirm the app does not initialise signed-in data.
4. Add a backup authenticator and confirm either authenticator can sign in.
5. Confirm either authenticator can be retired only while another verified factor remains and only with a current code from that remaining factor.
6. Confirm password recovery uses masked fields and rejects weak or mismatched passwords.
7. Confirm an MFA account cannot reset its password with email access alone.
8. Confirm audit events contain no passwords, TOTP codes, tokens, or account contact data.
9. Generate a recovery-code set from an AAL2 session and confirm it is displayed once only.
10. Confirm the database contains ten 64-character HMAC values and no raw code.
11. Confirm a wrong code is rejected, five failures trigger the 15-minute lock, and no tenant data becomes accessible.
12. Confirm a valid code is one-time, deletes the complete set, removes old factors, and globally signs out existing sessions.
13. Confirm the recovery-state RLS lock denies all six tenant-data tables before new-factor verification.
14. Enrol and verify a new authenticator, complete recovery, and confirm tenant access returns only at AAL2.
15. Confirm generation, recovery-started, and recovery-completed notices arrive without sensitive values.
16. Confirm audit events contain only the allowlisted event type and minimal phase/count/notice status.
17. Repeat the isolation probes with two accounts and confirm neither can see or change the other's state or data.
18. Replace the recovery-code set and confirm every code from the previous generation is invalid.

## Current Evidence And Limits

- On 2026-07-14, the non-MFA control sign-in completed normally, an incorrect primary TOTP code was rejected, and a current primary TOTP code completed AAL2 sign-in.
- A backup authenticator was enrolled in a separate authenticator app and independently completed a fresh AAL2 sign-in.
- Removing the backup authenticator required a current code from the remaining primary factor. The live Auth factor list then showed one verified primary factor; a fresh backup was enrolled and the final read-back showed two verified factors again. After a complete sign-out, both the primary and replacement backup independently completed fresh AAL2 sign-ins.
- During replacement-factor verification, one in-progress sign-in briefly displayed two backup-style labels. A complete sign-out and fresh sign-in reloaded the factor metadata and restored the expected Primary authenticator and Backup authenticator labels. Both factors then matched their respective authenticator credentials. The signed-out UI now uses neutral option labels when pre-verification metadata is ambiguous and treats the authenticated Account Security factor list as authoritative. During later acceptance, the primary authenticator correctly completed AAL2 through neutral option 2, confirming why an unverified role name must not be inferred from list position.
- Fail-closed sign-in, masked recovery, backup-factor management, and new audit-event allowlisting are implemented under `AUTH-001`.
- Desktop and 390px local rendering passed without horizontal overflow or console errors. On 2026-07-14, the recovery form's clipped desktop viewport was corrected with a scrollable signed-out shell. Primary-specific and backup-specific reset flows each completed independently, and the resulting password completed sign-in. Passwords and TOTP codes were entered directly in the browser and were not pasted into chat or stored as evidence.
- `log-app-event` version 4 was deployed with JWT verification enabled; a no-credential request returned HTTP 401. A live 2026-07-14 review of recent account-security events found only the `user_agent` metadata key, no sensitive metadata keys, no password/TOTP/token terms, and no email-like values. The function also passed a Deno type check.
- MFA sign-in, backup-factor lifecycle, primary-specific and backup-specific masked password recovery, wrong-code recovery rejection, email-only bypass rejection, privacy-safe audit-content review, and fail-closed routing simulation passed. The actual shipped `routeAfterAuth` method passed five controlled scenarios: assurance lookup failure, factor lookup failure, and missing verified factors all forced local sign-out without initialising app data; valid MFA routing and an existing AAL2 session still followed their intended paths. Both rejected recovery attempts left the existing password valid. The interim all-factors-lost support process is defined and approved, while robust recoverability remains a paid/public-launch condition. The current `AUTH-001` implementation and acceptance scope is Verified.
- Supabase leaked-password protection was enabled on 2026-07-13 through the Auth Management API, its value was read back as enabled, and the live security advisor cleared the warning. On 2026-07-14, a known-compromised candidate passed Tallyo's local format checks, reached Supabase after current-password and MFA verification, and was rejected by the provider. Only the pass/fail result was recorded.
- On 2026-07-16, the recovery migration, server-only pepper, and `mfa-recovery` version 1 were deployed backend-first with JWT verification. Missing credentials returned 401, an unapproved origin returned 403, and a publishable key without a user session returned 401. Structural readback passed. A rolled-back live probe confirmed AAL1 denial, AAL2 own-data access, and recovery-lock denial across all six tenant tables without retaining test state.
- The first live policy probe exposed a permission failure when the documented optional-MFA template read `auth.mfa_factors` directly. Tallyo corrected this with a current-user-only security-definer helper in non-exposed schema `private`; no Auth-table grant was added. The repeated probe passed and the related security/performance advisor warnings cleared.
- Authenticated generation, replacement, throttling, one-time recovery, factor/session cleanup, notices, audit metadata, two-account isolation, and real-device browser acceptance remain required before the frontend is published.

## Approval-Gated Deployment Order

Do not merge or publish the frontend before its backend dependencies exist. The safe order is:

1. **Completed 2026-07-16:** apply the recovery migrations through `20260716161054`.
2. **Completed 2026-07-16:** generate and install a new server-only `MFA_RECOVERY_PEPPER` without displaying or committing it.
3. **Completed 2026-07-16:** deploy `mfa-recovery` version 1 with JWT verification enabled.
4. **In progress:** unauthorized, wrong-origin, and rolled-back AAL/RLS probes passed; authenticated generation, throttling, one-time-use, notification, audit, and two-account lifecycle probes remain.
5. Merge and publish the frontend only after the backend probes pass.
6. Complete desktop and phone acceptance, then record the release commit and function version.

If any backend step fails, leave the current deny-by-default production UI in place and do not publish the recovery-code frontend.
