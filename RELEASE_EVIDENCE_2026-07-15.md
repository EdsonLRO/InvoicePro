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
- A controlled session-expiry harness passed full in-memory state clearing, quiet intentional logout, failed-logout recovery, unexpected `SIGNED_OUT` notification, and rejection of delayed initial business-data, audit-event, and MFA responses.
- PR #17 was squash-merged as `3758775b3b1928523ef77216bc45cfa7af584db5`. The harness and inline-script syntax check passed again from merged `main`. The public GitHub Pages source contained the expected `SIGNED_OUT` handler, session-generation guard, and reauthentication message; the Tallyo sign-in shell rendered with its email/password fields and no captured browser-console errors. Session-policy activation was still Owner-gated and unchanged during that specific deployment-acceptance check.
- After that deployment acceptance, the Owner approved production session-policy activation. Supabase Auth was saved and independently reloaded/read back with a 168-hour maximum session duration, 24-hour inactivity timeout, refresh-token rotation enabled with the existing 10-second reuse interval, and single-session enforcement disabled. The established 3600-second JWT lifetime was not changed.
- After Owner approval, `send-overdue-reminders` version 8 was deployed to production without forcing an invocation. Deployed-source readback confirmed privacy-safe `payment_reminder_processing_failed` evidence for provider-request and invoice-history-update failures, continued processing of other eligible invoices, and a non-success HTTP response when any invoice fails. The custom `x-automation-secret` boundary remained in place, and the immediate post-deployment Edge Function log review found no error signal.
- After separate Owner approval, authenticated `log-app-event` version 5 was deployed. Deployed-source readback confirmed allowlisted `manual_payment_recorded` and `document_status_changed` events; the public GitHub Pages source contained both post-save calls, and an unauthenticated production request was rejected with HTTP 401 without writing an event. Metadata excludes payment notes and customer/contact/document-content fields.
- All nine Edge Function sources were changed from floating `@supabase/supabase-js@2` imports to exact `2.110.1`, the version already resolved by the current Deno checks. Three unused floating import-map aliases were removed. The dependency-pin harness and all nine `deno check` runs passed. This was a source reproducibility hardening change only; production functions were not redeployed.
- Per-function Deno lockfiles were generated with verified Deno `2.2.15` LTS in Supabase-compatible v4 format. Local frozen checks passed for all nine functions. A read-only GitHub Actions workflow was prepared with immutable `actions/checkout` and `denoland/setup-deno` commit SHAs, no secrets, disabled credential persistence, and the four focused Node security harnesses. The workflow's own static security harness passed locally before remote execution.
- PR #25 exercised the new gate against commit `d11cbe049ab59c30da4ed268173e4c8247d51a2d`. GitHub `Security checks` run `29417705148` completed successfully, providing the first remote evidence for the frozen checks and focused harnesses. The CI control is therefore Verified; this did not deploy or invoke any production Edge Function.
- After Owner approval, GitHub ruleset `18994100` (`Protect main with verified security checks`) was created and read back as Active. It targets default `main`, has an empty bypass list, blocks deletion and force pushes, requires pull requests with zero approvals, and requires the GitHub Actions `verify` check with the branch up to date before merge. PR #26 was initially not mergeable; run `29423597762`, job `verify` (`87380131589`), then completed successfully on its latest head commit and satisfied the gate.

Detailed PDF/PWA notes: `PDF_PWA_REGRESSION_EVIDENCE_2026-07-15.md`.

## Prepared But Not Operationally Verified

- `LEGAL_OPERATIONS_RECORDS.md` now contains a working ROPA, rights/incident/vendor/retention templates, and preliminary DPIA screening.
- `LEGAL_TABLETOP_EVIDENCE_2026-07-15.md` records fictional rights-request and cross-tenant breach exercises without real personal data. Both exercises passed as process-design walkthroughs but exposed blocking operational gaps.
- This evidence does not approve lawful bases, retention periods, controller/processor roles, public notices, live case handling, or legal compliance.

## Deployed Hardening

Failed Resend audit events no longer retain the recipient address or raw provider response. They keep only HTTP status, a stable generic reason, and non-personal workflow context.

Scheduled overdue-reminder processing failures now record only the affected invoice identifier plus a generic stage, reason, workflow category, and automation flag. Recipient addresses, customer fields, reminder text, and raw provider responses are deliberately excluded.

Active versions after deployment:

| Function | Version | Auth boundary |
|---|---:|---|
| `send-document-email` | 19 | Supabase JWT |
| `send-reminder-email` | 8 | Supabase JWT |
| `send-overdue-reminders` | 8 | `x-automation-secret` |
| `generate-recurring` | 14 | `x-automation-secret` |
| `log-app-event` | 5 | Supabase JWT |

## Informational Advisories

- `audit_events_actor_user_id_idx` and `invoices_customer_id_idx` are currently reported unused.
- Auth database allocation remains an absolute 10 connections rather than percentage-based.
- The project API reported PostgreSQL `17.6.1.127` and an active healthy project on 2026-07-15.
- The restore-specific dashboard showed `$0` additional monthly compute, `$0` additional monthly disk, and `$0` total for the selected backup; the approved non-production restore then completed.
- The restore dashboard confirmed that schema, data, indexes, roles, permissions, and users transfer; Storage objects/settings, Edge Functions, Auth settings/API keys, database extensions/settings, and read replicas require manual reconfiguration.

No change was made because current usage evidence does not justify index removal or an Auth allocation change.

## Pending Acceptance

- Observe PWA update behaviour across a later deployment. Phone PDF, installation, offline shell fallback, and reconnection are verified; offline authentication and customer-data access are intentionally unsupported.
- Complete the remaining custom SMTP/rate-limit, CAPTCHA/abuse-control, and connection-allocation decisions. The seven-day session timebox and 24-hour inactivity timeout are active and evidence-backed.
- Implement robust all-factors-lost recovery before paid/public onboarding.
- Resolve the tabletop gaps, complete and externally review the blocked legal/privacy/customer-policy work in `LEGAL_PRIVACY_READINESS.md`, `LEGAL_OPERATIONS_RECORDS.md`, and `PAYMENT_OPERATIONS_RUNBOOK.md`.
- Keep Stripe sandbox-only until a separately approved live release.

## Test Limitations

- The installed PWA has not yet observed a later published version, so update-across-deployment behaviour is not operationally claimed.
- The Edge Function tree is not uniformly `deno fmt` clean; bulk reformatting was deliberately avoided to keep this hardening diff focused. Type checking passed.
- `psql` is not on `PATH`; the verified platform restore used Supabase's restore-to-new-project flow rather than a local CLI restore.
