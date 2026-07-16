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
- [x] Confirm the primary authenticator can complete password recovery and the new password signs in.
- [x] Confirm the backup authenticator can independently complete password recovery and the new password signs in.
- [x] Confirm email access alone cannot reset the password of an MFA-enabled account.
- [x] Simulate an assurance-level or factor-list lookup failure and confirm the app does not initialise signed-in data.
- [x] Run one fresh signup and confirm the `company_settings` row is created automatically.
- [x] Run one safe known-compromised-password rejection test. Record only pass/fail, never the password used.
- [x] Approve the interim deny-by-default all-factors-lost support process for the current portfolio build.

The completed MFA sign-in, replacement-factor, factor-management, AAL2 Change Password, and enrolled-factor-gated password-recovery checks above were accepted on 2026-07-14. Primary-specific and backup-specific reset flows each completed independently, and the resulting password completed sign-in. A wrong recovery TOTP was rejected, an email-only recovery submission was blocked, and the existing password remained valid after those rejected attempts. A controlled extraction test of the shipped `routeAfterAuth` method passed five scenarios, including fail-closed assurance lookup, factor lookup, and missing-factor paths that did not initialise signed-in data. Supabase also rejected a known-compromised password after current-password and MFA verification; only pass/fail was recorded. The Owner approved an interim all-factors-lost response that forbids email-only or administrator bypass and identity-document collection; robust recovery remains required before paid/public onboarding. A fresh sign-in after replacement restored the expected primary/backup labels and both factors independently completed AAL2. No password, TOTP code, QR secret, recovery token, account contact data, or identity evidence was recorded.

Detailed procedure: `MFA_RECOVERY_RUNBOOK.md`.

Fresh-signup provisioning passed on 2026-07-14. The confirmed test account had one matching `company_settings` row, total Auth/settings counts matched, and no missing or orphan settings rows were found. The test address and account identifier were not recorded.

## 2. Supabase Auth policy decisions

Live settings were read without exposing credentials on 2026-07-13:

| Setting | Current value | Recommended owner action |
|---|---:|---|
| Provider minimum password length | 12 | Raised from 6 to 12 and read back from the production Auth provider on 2026-07-15, matching Tallyo's client rule. |
| Required password character classes | None | Keep passphrase-friendly unless a documented policy requires character classes; length and breached-password rejection matter more than forced symbols. |
| Leaked-password protection | Enabled | Keep enabled; complete the rejection test above. |
| JWT lifetime | 3600 seconds | Keep unless a measured security/UX reason supports a change. |
| Refresh-token rotation | Enabled | Keep enabled. |
| Session timebox | 168 hours (7 days) | Enabled with Owner approval and read back from production on 2026-07-15 after client acceptance. |
| Inactivity timeout | 24 hours | Enabled with Owner approval and read back from production on 2026-07-15 after client acceptance. |
| Single-session enforcement | Disabled | Keep unless product policy requires one session per account; Tallyo already provides global logout. |
| Email confirmation | Required | Keep enabled. |
| Email OTP expiry / length | 3600 seconds / 8 digits | Review with the final email/recovery UX; do not loosen without a reason. |
| CAPTCHA | Pre-enforcement acceptance verified; app still not configured or enforced | The Owner approved the bounded Cloudflare Turnstile implementation, accepted the applicable account terms, and reported creating the Managed test widget for `edsonlro.github.io` with no pre-clearance on 2026-07-16. `TURNSTILE_BROWSER_ACCEPTANCE_2026-07-16.md` records successful desktop/390/320 frontend checks and a real hostname/site-key success. `TURNSTILE_SITE_KEY` remains blank and Supabase CAPTCHA remains off. Next: resolve legal/vendor decisions and the final app hostname, then create a separate production widget. Secret entry, enforcement, and immediate post-activation testing remain later Owner-controlled steps. Never enable only the dashboard half. |
| Auth email delivery | Verified | Resend SMTP is configured with sender `Tallyo <auth@mail.tallyo.co.uk>`, port 465, and a send-only API key restricted to `mail.tallyo.co.uk`. Supabase completed a dedicated-test-account recovery request with HTTP 200 on 2026-07-15, and receipt was confirmed in that test inbox. |
| Auth email send rate | 30 per hour | Supabase raised the limit from 2 to 30 when custom SMTP was enabled. Keep this initial limit and review provider evidence before any increase. |
| Token refresh / verification limits | 150 / 30 | Revisit from observed traffic before launch; do not raise pre-emptively. |
| Auth database connections | Absolute 10 | Low urgency for the current load. Revisit the provider connection strategy before scaling or changing compute. |

These are configuration decisions, not invitations to weaken Auth, MFA, RLS, or rate limits.

Custom SMTP was enabled and read back from the production dashboard on 2026-07-15. The Resend credential is purpose-specific, send-only, and restricted to the verified `mail.tallyo.co.uk` domain; its value was transferred directly into Supabase and was not displayed, logged, or committed. Non-secret readback confirmed the sender identity, `smtp.resend.com`, port 465, a 60-second per-user minimum interval, and the 30-emails-per-hour Auth limit. A separately approved recovery request to a dedicated Tallyo test account completed with HTTP 200 in Supabase Auth after the final credential was installed, and receipt was confirmed in the dedicated inbox. An immediate duplicate was correctly rate-limited. The Owner then approved revocation of the three superseded setup keys; readback showed only the final Auth key and the separate invoice-email key remaining. End-to-end Auth SMTP delivery is Verified.

The active 7-day/24-hour policy balances customer-data protection with the repeated mobile use expected from a small-business invoicing app. The one-hour JWT lifetime and refresh-token rotation remain unchanged. Supabase enforces timebox and inactivity limits when the session next refreshes, so effective sign-out may occur up to the JWT lifetime later. Tallyo's deployed client handles unexpected `SIGNED_OUT` events by clearing all in-memory business data and returning to login. Single-session enforcement remains disabled because users may legitimately use a phone and computer, and Tallyo already offers local and all-devices logout.

Deployment acceptance passed on 2026-07-15 after PR #17 was squash-merged as `3758775b3b1928523ef77216bc45cfa7af584db5`. The focused session-expiry harness passed again from merged `main`; the public GitHub Pages source contained the `SIGNED_OUT` handler, session-generation guard, and reauthentication message; the unauthenticated Tallyo sign-in shell rendered normally with no captured browser-console errors. After that acceptance, the Owner approved production activation. The dashboard was saved and reloaded, then read back as a 168-hour timebox, 24-hour inactivity timeout, refresh rotation enabled with the existing 10-second reuse interval, and single-session enforcement disabled.

## 3. Scheduled automation acceptance

The recurring and overdue jobs now retrieve `automation_secret` from Vault and send it as `x-automation-secret`. Their endpoints reject unsigned requests.

- The 2026-07-14 protected functions both returned HTTP 200 and no duplicate invoice, owner mismatch, opt-in violation, or unintended email was found. The recurring pg_net caller exhausted its former short response timeout even though the Edge Function completed.
- Both cron commands now use an explicit 30-second pg_net timeout. `generate-recurring` v14 and `send-overdue-reminders` v8 are deployed; the latter adds minimised provider/history failure evidence and truthful non-success status without changing eligibility or opt-in rules.
- [x] Confirm the next natural 06:00 and 09:00 UTC runs and retained pg_net responses. Both cron runs succeeded on 2026-07-15; both responses were HTTP 200 with no timeout or transport error.
- [x] Confirm no duplicate invoice or unintended customer email was produced. Database checks found zero duplicate recurring occurrence groups, zero generated-owner mismatches, no newly generated recurring invoice, and no audit/email event in the acceptance window. No schedule or reminder was due.
- For any due recurring schedule, confirm the generated invoice has source/occurrence attribution and one `recurring_invoice_generated` audit event.
- If either job fails, inspect redacted Edge Function/cron logs before retrying. Never print the secret.

## 4. Backup restore exercise

The Owner-approved timed restore completed on 2026-07-15. Privacy-safe results are recorded in `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`.

- [x] Restore a known backup to a separate project after reviewing and approving the displayed `$0` incremental total.
- [x] Disable both copied cron jobs and clear the outbound `pg_net` queue before validation.
- [x] Confirm no Edge Functions or provider configuration could send email, generate invoices, or process payments.
- [x] Measure platform restore-to-healthy time at approximately four minutes.
- [x] Match exact row counts and structural controls without copying customer content.
- [x] Re-run two-context tenant read isolation and rolled-back write probes.
- [x] Permanently delete the temporary restore project after explicit Owner approval and verify production remains healthy.

## 5. Remaining release acceptance

- [x] Complete the known-payment dispute and genuine failed-refund Stripe sandbox tests, including duplicate replay checks. Privacy-safe evidence was recorded on 2026-07-14 in `STRIPE_SANDBOX_TEST_EVIDENCE.md`.
- Keep Stripe in sandbox until live-mode configuration, policy/legal work, and explicit Owner approval are complete.
- Observe PWA update behaviour across a later deployment. Public shell, deployed CSP/SRI, manifest/icons, optimized desktop and phone PDF, installation, offline login-shell fallback, and reconnection are verified. Offline authentication and customer-data access are intentionally unsupported.
- Account-export acceptance passed on 2026-07-16 using only a dedicated test account. Desktop warning/download/readability passed; dataset counts matched the database; 25 tenant-owned rows had zero ownership mismatches; and forbidden Auth/token fields were absent. Responsive checks at 390 px and 320 px had no page overflow or console issues, and real-phone warning, download, and local JSON readability passed. After PR #37 merged, `log-app-event` version 7 produced desktop and mobile events containing only `export_version` and `format`, with no `user_agent` or provider fields. Desktop/mobile acceptance and `SEC-LOG-006` are Verified; record only counts and pass/fail, never exported content.
- Complete the blocking actions in `LEGAL_PRIVACY_READINESS.md` and `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md`, then legally review `PAYMENT_OPERATIONS_RUNBOOK.md` before real customers.

## Completed non-manual evidence

- Supabase leaked-password protection is enabled, the provider minimum password length is 12, and security advisors are clear.
- RLS performance hardening and foreign-key indexes were applied without changing tenant ownership rules.
- `generate-recurring` v14 rejects unsigned requests, enforces one invoice per schedule occurrence, and only emails after a conditional schedule claim; both cron commands are Vault-backed and passed natural 2026-07-15 cron/pg_net acceptance.
- `resend-webhook` v11 passes Deno type checking and rejects unsigned requests.
- Daily physical backups from 2026-07-07 through 2026-07-14 were listed as completed in the current seven-day window; WAL-G is enabled and PITR remains disabled/unapproved.
- The `2026-07-15 00:44:45 UTC` backup restored successfully into an isolated project; exact data/structure counts matched and restored RLS checks passed.
- Two-account RLS read isolation passed across all six tenant tables on 2026-07-14. Five rolled-back customer write checks also passed: own update/insert allowed; foreign update/delete/insert blocked.
- Seven-day Resend audit evidence showed 31 sent and 31 delivered events with no failed, bounced, or complained signal.
