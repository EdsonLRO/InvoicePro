# Tallyo Deferred Manual Configuration

This is the single checklist for work that needs the Owner at the laptop, an identity factor, a provider decision, a paid action, or a deliberately observed scheduled run. Do not place passwords, TOTP codes, recovery tokens, API keys, Vault values, customer data, or screenshots containing secrets in this file.

## 1. Account and MFA acceptance

Use only the dedicated Tallyo test accounts. Enter passwords and authenticator codes directly in the browser; never paste them into chat or terminal logs.

- [x] Confirm a non-MFA control account can sign in normally.
- [x] Confirm a wrong primary TOTP code is rejected and a current primary code completes sign-in.
- [x] Confirm a backup authenticator enrolled in a separate authenticator app can independently complete a fresh sign-in.
- [x] Remove the backup using a fresh code from the remaining primary factor, confirm one verified factor remains, then restore a fresh backup and confirm two verified factors are present.
- [x] Complete the pending password-reset link on the local/test branch.
- [x] Confirm a wrong recovery TOTP leaves the password unchanged.
- [x] Confirm a correct enrolled TOTP permits the password update and the new password signs in.
- [ ] Confirm the backup authenticator can also complete password recovery.
- [x] Confirm email access alone cannot reset the password of an MFA-enabled account.
- [x] Simulate an assurance-level or factor-list lookup failure and confirm the app does not initialise signed-in data.
- [ ] Run one fresh signup and confirm the `company_settings` row is created automatically.
- [x] Run one safe known-compromised-password rejection test. Record only pass/fail, never the password used.
- [x] Approve the interim deny-by-default all-factors-lost support process for the current portfolio build.

The completed MFA sign-in, replacement-factor, factor-management, AAL2 Change Password, and enrolled-factor-gated password-recovery checks above were accepted on 2026-07-14. A wrong recovery TOTP was rejected, an email-only recovery submission was blocked, and the existing password remained valid. The primary authenticator completed the subsequent AAL2 sign-in through the neutral second option. The successfully updated password also completed a fresh AAL2 sign-in using the backup authenticator. The exact authenticator used during the successful recovery was not recorded, so the primary-specific and backup-specific recovery variants remain open. A controlled extraction test of the shipped `routeAfterAuth` method passed five scenarios, including fail-closed assurance lookup, factor lookup, and missing-factor paths that did not initialise signed-in data. Supabase also rejected a known-compromised password after current-password and MFA verification; only pass/fail was recorded. The Owner approved an interim all-factors-lost response that forbids email-only or administrator bypass and identity-document collection; robust recovery remains required before paid/public onboarding. A fresh sign-in after replacement restored the expected primary/backup labels and both factors independently completed AAL2. No password, TOTP code, QR secret, recovery token, account contact data, or identity evidence was recorded.

Detailed procedure: `MFA_RECOVERY_RUNBOOK.md`.

## 2. Supabase Auth policy decisions

Live settings were read without exposing credentials on 2026-07-13:

| Setting | Current value | Recommended owner action |
|---|---:|---|
| Provider minimum password length | 6 | Raise to 12 after the test accounts pass recovery/signup checks, matching Tallyo's client rule. |
| Required password character classes | None | Keep passphrase-friendly unless a documented policy requires character classes; length and breached-password rejection matter more than forced symbols. |
| Leaked-password protection | Enabled | Keep enabled; complete the rejection test above. |
| JWT lifetime | 3600 seconds | Keep unless a measured security/UX reason supports a change. |
| Refresh-token rotation | Enabled | Keep enabled. |
| Session timebox | Disabled | Decide before public onboarding whether a maximum session age is required. |
| Inactivity timeout | Disabled | Decide before public onboarding whether idle sessions should expire. |
| Single-session enforcement | Disabled | Keep unless product policy requires one session per account; Tallyo already provides global logout. |
| Email confirmation | Required | Keep enabled. |
| Email OTP expiry / length | 3600 seconds / 8 digits | Review with the final email/recovery UX; do not loosen without a reason. |
| CAPTCHA | Not configured | Add a supported CAPTCHA provider plus frontend integration before public signup if abuse risk warrants it. Do not enable only the dashboard half. |
| Built-in email send rate | 2 per hour | Configure and test custom SMTP before public onboarding or heavier acceptance testing. |
| Token refresh / verification limits | 150 / 30 | Revisit from observed traffic before launch; do not raise pre-emptively. |
| Auth database connections | Absolute 10 | Low urgency for the current load. Revisit the provider connection strategy before scaling or changing compute. |

These are configuration decisions, not invitations to weaken Auth, MFA, RLS, or rate limits.

## 3. Scheduled automation acceptance

The recurring and overdue jobs now retrieve `automation_secret` from Vault and send it as `x-automation-secret`. Their endpoints reject unsigned requests.

- After 2026-07-14 06:00 UTC, confirm `generate-recurring-daily` completed successfully on deployed v13.
- After 2026-07-14 09:00 UTC, confirm `send-overdue-reminders-daily` completed successfully.
- Confirm no duplicate invoice or unintended customer email was produced.
- For any due recurring schedule, confirm the generated invoice has source/occurrence attribution and one `recurring_invoice_generated` audit event.
- If either job fails, inspect redacted Edge Function/cron logs before retrying. Never print the secret.

## 4. Backup restore exercise

Current scheduled-backup evidence is verified. A timed restore is still required because a backup is not proven until recovery has been exercised.

- Choose a known backup and review the displayed cost of a separate restore project.
- Obtain explicit Owner approval for that exact billed project/action.
- Follow `BACKUP_RESTORE_RUNBOOK.md`, disabling cron and all email/Stripe side effects in the restored environment before testing.
- Measure RTO, validate row counts without copying customer content, and re-run Account A/Account B isolation tests.
- Record only operational evidence; do not record credentials or customer documents.

## 5. Remaining release acceptance

- Finish the known-payment dispute and genuine failed-refund Stripe sandbox tests.
- Keep Stripe in sandbox until live-mode configuration, policy/legal work, and explicit Owner approval are complete.
- Run final desktop/mobile/PDF/PWA regression checks.
- Complete privacy policy, terms, retention, export/deletion, refund/support, and breach-response groundwork before real customers.

## Completed non-manual evidence

- Supabase leaked-password protection is enabled and security advisors are clear.
- RLS performance hardening and foreign-key indexes were applied without changing tenant ownership rules.
- `generate-recurring` v13 rejects unsigned requests, enforces one invoice per schedule occurrence, and only emails after a conditional schedule claim; both cron commands are Vault-backed.
- `resend-webhook` v11 passes Deno type checking and rejects unsigned requests.
- Daily physical backups from 2026-07-06 through 2026-07-13 were listed as completed; WAL-G is enabled and PITR remains disabled/unapproved.
