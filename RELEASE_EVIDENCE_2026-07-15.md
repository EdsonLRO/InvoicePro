# Tallyo Release Evidence - 2026-07-15

Privacy-safe evidence from the `codex/release-readiness-pass` review. This does not declare the app live-ready; unresolved gates are listed below.

## Verified In This Pass

- All nine Supabase Edge Functions passed `deno check`.
- Supabase security advisors returned no findings.
- Two authenticated account contexts passed read isolation across `customers`, `saved_items`, `invoices`, `recurring_templates`, `company_settings`, and `audit_events`.
- Five rolled-back write checks passed on `customers`: own update and default-owner insert succeeded; foreign update, delete, and insert were blocked.
- Current recurring data had no duplicate occurrence groups, generated owner mismatch, or recent generated-event anomaly.
- The overdue dry-run candidate check found no email due and no opt-in violation.
- Seven-day Resend audit evidence contained 31 sent and 31 delivered events and no failed, bounced, or complained signal.
- Deployed desktop app shell loaded without console errors, retained CSP, and loaded five pinned CDN scripts with SRI and `crossorigin`.
- The public shell had no horizontal overflow or off-screen controls at 390x844.
- Deployed `manifest.json` and `service-worker.js` matched the repository; both PWA icons exist.
- Supabase Pro listed completed daily physical backups through 2026-07-14; WAL-G was enabled and PITR disabled.
- No known Stripe, Resend, JWT, or webhook-secret pattern was found in tracked text/source files.

## Deployed Hardening

Failed Resend audit events no longer retain the recipient address or raw provider response. They keep only HTTP status, a stable generic reason, and non-personal workflow context.

Active versions after deployment:

| Function | Version | Auth boundary |
|---|---:|---|
| `send-document-email` | 19 | Supabase JWT |
| `send-reminder-email` | 8 | Supabase JWT |
| `send-overdue-reminders` | 7 | `x-automation-secret` |
| `generate-recurring` | 14 | `x-automation-secret` |

## Informational Advisories

- `audit_events_actor_user_id_idx` and `invoices_customer_id_idx` are currently reported unused.
- Auth database allocation remains an absolute 10 connections rather than percentage-based.

No change was made because current usage evidence does not justify index removal or an Auth allocation change.

## Pending Acceptance

- Confirm the next natural 06:00/09:00 UTC cron/pg_net responses under the corrected 30-second timeout. A one-time Codex follow-up is scheduled; the functions will not be forced merely to create evidence.
- Run authenticated mobile workflows, long/mobile PDF downloads, and real-browser PWA install/offline/update checks.
- Complete an Owner-approved timed restore into a separate non-production environment. This is billed/side-effect-sensitive and remains approval-gated.
- Resolve Auth provider minimum password length, session policy, custom SMTP/rate limits, CAPTCHA/abuse controls, and connection allocation decisions.
- Implement robust all-factors-lost recovery before paid/public onboarding.
- Complete and externally review the blocked legal/privacy/customer-policy work in `LEGAL_PRIVACY_READINESS.md` and `PAYMENT_OPERATIONS_RUNBOOK.md`.
- Keep Stripe sandbox-only until a separately approved live release.

## Test Limitations

- The in-app browser has no authenticated Tallyo session and does not expose Service Worker APIs, so authenticated/device PWA/PDF acceptance is not claimed.
- The Edge Function tree is not uniformly `deno fmt` clean; bulk reformatting was deliberately avoided to keep this hardening diff focused. Type checking passed.
- `psql` is not on `PATH`; the restore runbook correctly remains unproven.
