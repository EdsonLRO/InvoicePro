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
- Chrome browser control reconnected successfully, and authenticated test-account `#account` and `#invoices` views loaded at 1280x631 without horizontal overflow.
- Deployed `manifest.json` and `service-worker.js` matched the repository; both PWA icons exist.
- Supabase Pro listed completed daily physical backups through 2026-07-14; WAL-G was enabled and PITR disabled.
- Supabase Auth minimum password length was raised from 6 to 12 with leaked-password protection kept enabled; the saved value was reopened and read back on 2026-07-15.
- No known Stripe, Resend, JWT, or webhook-secret pattern was found in tracked text/source files.
- An Owner-approved backup restored to a separate project at `$0` displayed incremental cost and was first observed healthy after approximately four minutes.
- Restored exact row counts, structural controls, and five migration records matched production; 12 tenant read checks and four rolled-back write probes passed.
- Both copied cron jobs were disabled, the `pg_net` queue was empty/cleared, and no Edge Functions or provider integrations were configured in the clone.
- The production recurring and overdue jobs then completed their next natural runs at 06:00 and 09:00 UTC. Both cron records succeeded; retained pg_net responses were HTTP 200 with no timeout or transport error.
- Post-run database checks found zero duplicate recurring occurrence groups, zero generated-owner mismatches, and no invoice or audit/email event in the acceptance window. No schedule or reminder was due, so no customer communication was expected.
- A dedicated authenticated test account produced a synthetic 24-row, three-page PDF. All rows remained complete, page gaps were clean, alternating row colours continued correctly, and notes, terms, payment details, and totals followed the last item without overlap.
- The previous PNG/RGBA export was 35,767,558 bytes. After merge commit `c48c60267bbb44e5257d2f258a0ffc92fb8f9ac9` deployed, the same authenticated synthetic invoice exported as a 689,481-byte, three-page A4 PDF: approximately 98.1% smaller.
- All deployed optimized PDF pages were rendered and visually rechecked. Complete-row pagination, continuation gaps, alternating colours, notes, terms, and totals remained correct. Pixel inspection found white page edges, and all pages referenced one shared 1600x5588 JPEG image object.
- The Owner completed real-phone acceptance: the authenticated long PDF downloaded without cuts, Tallyo installed successfully, the cached login shell opened in airplane mode, offline login remained unavailable as expected, and normal operation returned after reconnection.
- A controlled session-expiry harness passed full in-memory state clearing, quiet intentional logout, failed-logout recovery, unexpected `SIGNED_OUT` notification, and rejection of delayed initial business-data, audit-event, and MFA responses. Deployed browser acceptance and provider-policy activation remain pending.

Detailed PDF/PWA notes: `PDF_PWA_REGRESSION_EVIDENCE_2026-07-15.md`.

## Prepared But Not Operationally Verified

- `LEGAL_OPERATIONS_RECORDS.md` now contains a working ROPA, rights/incident/vendor/retention templates, and preliminary DPIA screening.
- `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md` records fictional rights-request and cross-tenant breach exercises without real personal data. Both exercises passed as process-design walkthroughs but exposed blocking operational gaps.
- This evidence does not approve lawful bases, retention periods, controller/processor roles, public notices, live case handling, or legal compliance.

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
- The project API reported PostgreSQL `17.6.1.127` and an active healthy project on 2026-07-15.
- The restore-specific dashboard showed `$0` additional monthly compute, `$0` additional monthly disk, and `$0` total for the selected backup; the approved non-production restore then completed.
- The restore dashboard confirmed that schema, data, indexes, roles, permissions, and users transfer; Storage objects/settings, Edge Functions, Auth settings/API keys, database extensions/settings, and read replicas require manual reconfiguration.

No change was made because current usage evidence does not justify index removal or an Auth allocation change.

## Pending Acceptance

- Observe PWA update behaviour across a later deployment. Phone PDF, installation, offline shell fallback, and reconnection are verified; offline authentication and customer-data access are intentionally unsupported.
- Deploy and accept the session-expiry client handling, then decide whether to enable the recommended seven-day session timebox and 24-hour inactivity timeout. Custom SMTP/rate limits, CAPTCHA/abuse controls, and connection allocation decisions remain separate gates.
- Implement robust all-factors-lost recovery before paid/public onboarding.
- Resolve the tabletop gaps, complete and externally review the blocked legal/privacy/customer-policy work in `LEGAL_PRIVACY_READINESS.md`, `LEGAL_OPERATIONS_RECORDS.md`, and `PAYMENT_OPERATIONS_RUNBOOK.md`.
- Keep Stripe sandbox-only until a separately approved live release.

## Test Limitations

- The installed PWA has not yet observed a later published version, so update-across-deployment behaviour is not operationally claimed.
- The Edge Function tree is not uniformly `deno fmt` clean; bulk reformatting was deliberately avoided to keep this hardening diff focused. Type checking passed.
- `psql` is not on `PATH`; the verified platform restore used Supabase's restore-to-new-project flow rather than a local CLI restore.
