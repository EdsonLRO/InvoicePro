# Tallyo Release Readiness Checklist

This checklist tracks whether the current app is ready for real customer use. It is not a public-launch checklist for the future SaaS website.

Statuses: Planned, In Progress, Implemented, Verified, Blocked, Deferred, Not Applicable.

## Current Verdict

**Status:** In Progress.

Tallyo's current invoicing-app scope is feature-complete and regression-verified, and its controlled live Stripe invoice-payment path is activated and acceptance-tested. Build `2026.07.23.2` is published after exact Owner approval, required and Access-protected preview checks, merged Auth PR #88 and UX PR #89, and direct GitHub Pages/Cloudflare build plus service-worker readback. The separate public website was not launched. The app is not approved for unrestricted live-customer onboarding because the separate legal, privacy and operational gates remain open.

## Release Gates

| Gate | Status | Evidence / next action |
|---|---|---|
| Core invoicing workflows | Verified | The final 2026-07-16 regression and later `FUNC-READY-002` fictional journey remain current. Public build `2026.07.23.2` retains that validated baseline; its focused routing/PDF/PWA and Auth regression checks plus required/preview checks and direct production readback pass. |
| Supabase Auth + email verification | Verified | Email verification, leaked-password protection, the 12-character provider minimum, and purpose-scoped custom Auth SMTP are active. Production Turnstile protects signup, password sign-in and password reset. AUTH-003 additionally restores a fresh one-time Turnstile challenge for sensitive current-password reauthentication while preserving MFA/AAL2 and global revocation; protected-preview acceptance, deterministic Change Password coverage, PR #88 checks and retained production build `2026.07.23.2` pass. The secret remains Owner-controlled in Supabase Auth and is not stored in Tallyo. |
| TOTP MFA | Verified | Primary/backup enrolment and sign-in, protected factor lifecycle, primary-specific and backup-specific password recovery, wrong-code sign-in/recovery rejection, email-only bypass rejection, privacy-safe account-audit review, fail-closed lookup simulation, and provider leaked-password rejection passed on 2026-07-14. |
| All-factors-lost account recovery | Verified | Backend deployment and all retained AUTH-002 acceptance gates are complete: boundary, privilege, AAL, rolled-back RLS, authenticated generation/replacement/recovery, audit-minimisation, two-account, rollback-only live-throttling, Owner-confirmed notification minimisation, and real-Android recovery/re-enrolment pass. The mobile dialog clipping correction passed focused and phone retesting. After explicit Owner approval, PR #44 merged as `8a22b5b`; post-merge security checks, Pages deployment, and a focused public-shell smoke check passed. External UK legal/privacy review remains required before paid/public onboarding. |
| RLS / tenant isolation | Verified | On 2026-07-14, two authenticated account contexts passed 12 table-visibility checks across all six tenant tables plus five rolled-back customer write-path checks; no cross-tenant row was visible or mutable. |
| CSP/SRI/self-hosted Tailwind | Verified | The deployed GitHub Pages shell was rechecked on 2026-07-14: CSP remained active, all five CDN scripts were version-pinned with SRI/crossorigin, and Tailwind remained local. |
| Edge Function dependency pinning | Verified | All ten function sources, including deployed `mfa-recovery` version 1, pin `@supabase/supabase-js` to exact version `2.110.1`; the repository harness rejects floating Supabase specifications and frozen checks pass. The original nine production functions were not redeployed for this source-only reproducibility control. |
| Automated Edge Function security gate | Verified | Read-only GitHub Actions configuration uses immutable action SHAs, exact Deno `2.2.15` LTS, frozen v4 lockfiles, no secrets, and all focused security harnesses. Local checks passed and PR #25 `Security checks` run `29417705148` completed successfully. |
| Enforced security gate on `main` | Verified | Active GitHub ruleset `18994100` targets default `main`, has no bypass actors, blocks deletion/force-push, requires pull requests with zero approvals, and requires `verify` against the latest branch state. PR #26 run `29423597762`, job `verify`, passed and satisfied the enforced gate. |
| Email sending and webhooks | Verified | Seven-day privacy-safe evidence on 2026-07-14 showed 31 sent and 31 delivered Resend events with no failed/bounced/complained signal. Signed webhook handling remains active. |
| Overdue reminder automation | Verified | The active Vault-authenticated job completed its natural 2026-07-15 09:00 UTC run and retained HTTP 200 without timeout. No reminder was due and no audit/email event was produced; the earlier candidate check found no opt-in violation. Version 8 is deployed with privacy-safe per-invoice processing-failure evidence and returns non-success when any eligible invoice fails. |
| Recurring invoice automation | Verified | The protected v14 function completed its natural 2026-07-15 06:00 UTC run. Cron succeeded, pg_net retained HTTP 200 without timeout, and database checks found zero duplicate recurring occurrence groups or generated-owner mismatches. No schedule was due, so no invoice/email was expected. |
| Stripe payments | Verified | The sandbox lifecycle passed signature rejection, trusted Checkout binding, payment/refund processing, failed-refund reversal, dispute awareness, and duplicate replay. PAY-LIVE-001's atomic transaction migration and matching Checkout v6, Refund v4 and Webhook v11 are deployed. PAY-LIVE-002 then completed the separately approved live account, webhook, configuration, minimum-payment and publication gates without exposing secret values or provider payloads. A dedicated fictional GBP 1.00 live Checkout settled exactly once to Paid with zero balance and one completion audit; PR #54's required check passed, it merged as `74de2ac`, and GitHub Pages serves the live public flag over HTTPS with no live-secret pattern. After later separate approval, Tallyo refunded that payment in full; one negative refund entry, one request audit and one success audit reopened the invoice to Sent with GBP 1.00 due. Future refunds, real-customer communications and legal/public onboarding remain separately gated. |
| Refund/dispute/chargeback handling | In Progress | Technical sandbox handling and the authenticated full live-refund path pass provider request, signed webhook reconciliation, single mutation, audit and balance restoration. `FUNC-READY-002` verifies the existing consequence preview and intent-scoped partial/sequential/excess/deposit/mixed-payment/overpayment/cancelled matrix. End-to-end refund-receipt delivery and the separate operational/legal work remain open; any new live refund requires exact Owner approval. |
| Backups and restore | Verified | A selected daily backup restored to an isolated project on 2026-07-15. Exact data/structure counts matched, copied automation was disabled, and restored tenant isolation passed. The temporary project was deleted after approval and production remained healthy. Evidence: `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`. |
| Audit events | In Progress | Provider and selected app actions covered; failed-email and overdue-reminder failure evidence is minimised. Authenticated `log-app-event` v7 adds manual payment recording, document-status changes, and format/version-only account-export success metadata. This is not a full SIEM or compliance system. |
| Account-holder data export | Verified | Authenticated RLS-scoped JSON export, stable pagination, limited Auth metadata, whole-export failure, session-change abort, trusted-device warning, local browser creation, and minimal audit metadata are implemented. Focused success/failure tests, Pages publication, desktop/real-phone acceptance, v7 source readback, and corrected production event metadata pass. This is not a complete third-party rights-request workflow. |
| Privacy/legal groundwork | In Progress | Internal data flow, role/retention proposals, working ROPA, vendor/transfer evidence, case templates, complaint procedure, fictional tabletop, fuller provisional DPIA/LIA/ICO preparation, a consolidated Owner-action list, and four visibly unpublished customer-document drafts are recorded. The Owner-selected Business Standard candidate remains unpurchased and optional alternatives remain possible. Private identity facts, final legal conclusions/wording, exact provider acceptance/configuration, correction/deletion/provider-assistance operations, synthetic acceptance, ICO fee outcome, and the focused one-off legal review remain unfinished. |
| Legal, privacy and regulatory review | Blocked | The internal draft package is prepared for review, but the active Legal, Privacy and Regulatory Agent must verify every legally material release change and a qualified UK adviser must resolve the recorded material uncertainties. No draft is approved or publishable, and live privacy operations have not passed synthetic acceptance. |
| Mobile regression | Verified | Existing real-phone PDF/PWA acceptance remains current. UX-001 adds a compact mobile delivery status label to prevent Actions overlap and publishes it in build `2026.07.23.2` after focused responsive and production checks. |
| PDF regression | Verified | Existing desktop/real-phone evidence remains current. UX-001 generated and visually inspected a fictional four-page A4 PDF: continuation headers repeated, no row was sliced, the complete notes/payment/totals block stayed together, the file retained a `.pdf` name and `application/pdf` type, and My Invoices remained visible. |
| PWA/service-worker regression | Verified | Manifest/icons, installation, offline shell, reconnection, network-first refresh and safe fallback remain verified. Build `2026.07.23.2` and cache marker `tallyo-shell-2026-07-23-2` were read back from the Access-protected Cloudflare production app. Offline authentication/data remain intentionally unsupported. |
| Documentation accuracy | Verified | Current status, AUTH-003 and UX-001 task evidence, and release readiness were reconciled through production build `2026.07.23.2`. Future material changes must update them again. |
| Supabase Auth provider policy | In Progress | Email confirmation, MFA, refresh rotation, leaked-password protection, the 12-character minimum, session timeouts and custom Auth SMTP remain active. Production Turnstile is active for the reviewed app origins; only its public Site Key is in frontend code and the secret remains private in Supabase Auth. AUTH-003's protected-preview global-sign-out acceptance and accepted shared-path Change Password disposition are published in build `2026.07.23.2`. The one-hour JWT lifetime and multi-device sessions remain unchanged. |
| Agent governance documentation | Verified | The corrected hierarchy and active Legal Agent governance are merged. Counts, legal triggers/workflow, task fields, work modes, release gate, code fences, headings, and secret/PII scope passed validation. |

Public launch remains blocked when required legal documents are unfinished, material privacy flows are undocumented, legally required notices are missing, unresolved legal blocks exist, mandatory external professional review is incomplete, or product claims exceed verified evidence.

## Manual Approval Boundaries

Stop before:

- Additional billed Supabase projects/add-ons, including PITR;
- changes to the approved Stripe live configuration or kill switch, and any live refund;
- real customer emails or payment links;
- public launch;
- legal/terms publication;
- irreversible production migrations;
- production data deletion;
- secret rotation requiring owner action.

## Final Release Evidence Required

Core regression evidence is consolidated in `RELEASE_EVIDENCE_2026-07-15.md`; the later controlled live-payment evidence is authoritative in `tasks/PAY-LIVE-002_LIVE_ACTIVATION_2026-07-18.md`.

- Git commit hash for release candidate.
- List of deployed Supabase Edge Functions and dates.
- Active cron jobs and latest successful runs.
- Stripe webhook endpoint, subscribed events, and successful signed test deliveries.
- Resend webhook endpoint and successful signed delivery events.
- RLS verification notes.
- Current backup evidence plus timed restore evidence.
- Mobile/PDF/PWA screenshots or notes.
- Open risks accepted by owner.
- Dated Legal Agent dispositions for all legally material release changes, including evidence that mandatory conditions and external professional review requirements were resolved or explicitly recorded.
