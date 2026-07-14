# Tallyo MFA Recovery Runbook

This runbook records how Tallyo handles multi-factor authentication (MFA) recovery. It is an operational guide, not a claim that account recovery is risk-free.

## Current Recovery Model

Tallyo uses time-based one-time password (TOTP) authenticators through Supabase Auth. At the time this was checked on 2026-07-13, Supabase Auth did not provide recovery codes.

The supported recovery method is therefore a second verified authenticator:

1. The user enables MFA with a primary authenticator.
2. While still signed in, the user adds one backup authenticator from Account Security.
3. Either verified authenticator can complete sign-in or password recovery.
4. Removing either authenticator is allowed only while another verified factor remains and requires a fresh code from that remaining authenticator.
5. Turning MFA off requires a fresh authenticator code and removes the enrolled factors.

Tallyo does not use email, SMS, security questions, or a browser-stored code as an MFA bypass.

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
| All authenticators lost | No self-service bypass is currently available. Do not disable MFA solely because someone controls the email account. |

## All Factors Lost

This remains an operational release gap. Before real customer onboarding, Tallyo needs a documented support process that defines:

- what identity evidence is acceptable;
- who is authorised to approve recovery;
- how a recovery decision is recorded without putting sensitive evidence in ordinary app logs;
- how sessions are revoked before or during recovery;
- how the user is notified through an independently verified channel;
- how suspicious or disputed recovery requests are escalated.

Until that process exists, an all-factors-lost case must be treated as blocked. Do not create an informal administrator shortcut and do not claim that support can always restore access.

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

## Current Evidence And Limits

- On 2026-07-14, the non-MFA control sign-in completed normally, an incorrect primary TOTP code was rejected, and a current primary TOTP code completed AAL2 sign-in.
- A backup authenticator was enrolled in a separate authenticator app and independently completed a fresh AAL2 sign-in.
- Removing the backup authenticator required a current code from the remaining primary factor. The live Auth factor list then showed one verified primary factor; a fresh backup was enrolled and the final read-back showed two verified factors again. After a complete sign-out, both the primary and replacement backup independently completed fresh AAL2 sign-ins.
- During replacement-factor verification, one in-progress sign-in briefly displayed two backup-style labels. A complete sign-out and fresh sign-in reloaded the factor metadata and restored the expected Primary authenticator and Backup authenticator labels. Both factors then matched their respective authenticator credentials. Treat recurrence as a UI refresh defect; do not infer factor identity from list position alone.
- Fail-closed sign-in, masked recovery, backup-factor management, and new audit-event allowlisting are implemented under `AUTH-001`.
- Desktop and 390px local rendering passed without horizontal overflow or console errors. A real reset email was requested for test account A on 2026-07-13, but the complete password-update recovery path still needs acceptance testing. Passwords and TOTP codes must be entered directly in the browser and never pasted into chat.
- `log-app-event` version 4 was deployed with JWT verification enabled; a no-credential request returned HTTP 401.
- MFA sign-in and backup-factor lifecycle acceptance passed. Masked password recovery, email-only bypass rejection, simulated assurance/factor lookup failure, privacy-safe audit-content review, and the all-factors-lost support process remain required before this task can be marked Verified.
- Supabase leaked-password protection was enabled on 2026-07-13 through the Auth Management API, its value was read back as enabled, and the live security advisor cleared the warning. A safe known-compromised-password rejection test still remains.
