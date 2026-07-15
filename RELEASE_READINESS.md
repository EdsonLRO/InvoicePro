# Tallyo Release Readiness Checklist

This checklist tracks whether the current app is ready for real customer use. It is not a public-launch checklist for the future SaaS website.

Statuses: Planned, In Progress, Implemented, Verified, Blocked, Deferred, Not Applicable.

## Current Verdict

**Status:** In Progress.

Tallyo is a real working app and strong portfolio project, but it is not yet live-customer-ready. Stripe remains test/development unless live mode is explicitly approved and configured.

## Release Gates

| Gate | Status | Evidence / next action |
|---|---|---|
| Core invoicing workflows | Implemented | Needs final regression evidence. |
| Supabase Auth + email verification | Implemented | Email verification, leaked-password protection, and the 12-character provider minimum are active; remaining provider decisions are tracked below. |
| TOTP MFA | Verified | Primary/backup enrolment and sign-in, protected factor lifecycle, primary-specific and backup-specific password recovery, wrong-code sign-in/recovery rejection, email-only bypass rejection, privacy-safe account-audit review, fail-closed lookup simulation, and provider leaked-password rejection passed on 2026-07-14. |
| All-factors-lost account recovery | Blocked | The approved interim response is deny-by-default and does not restore access. Implement and review a robust recovery method before paid/public onboarding. |
| RLS / tenant isolation | Verified | On 2026-07-14, two authenticated account contexts passed 12 table-visibility checks across all six tenant tables plus five rolled-back customer write-path checks; no cross-tenant row was visible or mutable. |
| CSP/SRI/self-hosted Tailwind | Verified | The deployed GitHub Pages shell was rechecked on 2026-07-14: CSP remained active, all five CDN scripts were version-pinned with SRI/crossorigin, and Tailwind remained local. |
| Email sending and webhooks | Verified | Seven-day privacy-safe evidence on 2026-07-14 showed 31 sent and 31 delivered Resend events with no failed/bounced/complained signal. Signed webhook handling remains active. |
| Overdue reminder automation | Verified | The active Vault-authenticated job returned HTTP 200 on 2026-07-14; the dry-run candidate check found no message due and no opt-in violation. The deployed privacy-safe logging update does not change send rules. |
| Recurring invoice automation | In Progress | The protected v13 function returned HTTP 200 on 2026-07-14 and created no duplicate/unattributed occurrence, but pg_net exhausted its former short response timeout. The job now has a 30-second timeout and v14 is active; confirm the next natural run. |
| Stripe payments | Verified | The implemented sandbox lifecycle passed signature rejection, trusted Checkout binding, successful payment/refund processing, genuine failed-refund reversal, known-payment dispute awareness, and duplicate replay checks. Live activation remains a separate approval-gated release action. |
| Refund/dispute/chargeback handling | In Progress | Technical sandbox handling is verified and the internal procedure is recorded in `PAYMENT_OPERATIONS_RUNBOOK.md`. Customer-facing policy and legal review remain blocked. |
| Backups and restore | Verified | A selected daily backup restored to an isolated project on 2026-07-15. Exact data/structure counts matched, copied automation was disabled, and restored tenant isolation passed. The temporary project was deleted after approval and production remained healthy. Evidence: `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`. |
| Audit events | In Progress | Provider and selected app actions covered; failed-email audits were minimised and four functions deployed on 2026-07-14. This is not a full SIEM/compliance system. |
| Privacy/legal groundwork | In Progress | Internal data flow, provisional role matrix, working ROPA, vendor/transfer and retention registers, case templates, DPIA screening, rights/incident procedures, claims controls, and a fictional tabletop are recorded. The tabletop found blocking operational gaps; public notices, final decisions, restricted case tooling, verified live operations and professional review remain unfinished. |
| Legal, privacy and regulatory review | Blocked | The active Legal, Privacy and Regulatory Agent must review every legally material release change, verify mandatory conditions, and record any required external professional review. Required launch documents and privacy operations are unfinished. |
| Mobile regression | In Progress | The public deployed shell passed a 390x844 overflow/off-screen-control check on 2026-07-14. Authenticated workflows still need final device acceptance. |
| PDF regression | Planned | Test mobile PDF download and long multi-page invoices. |
| PWA/service-worker regression | In Progress | Deployed manifest/service-worker contents match the repository and required icon assets exist. Install/offline/update behaviour still needs a real-browser/device check. |
| Documentation accuracy | In Progress | Keep status/handoff/security docs synced with real implementation. |
| Supabase Auth provider policy | In Progress | Live settings were recorded without secrets. Email confirmation, MFA, refresh rotation, leaked-password protection, and a verified 12-character minimum are active; remaining owner decisions are centralised in `DEFERRED_MANUAL_CONFIGURATION.md`. |
| Agent governance documentation | Verified | The corrected hierarchy and active Legal Agent governance are merged. Counts, legal triggers/workflow, task fields, work modes, release gate, code fences, headings, and secret/PII scope passed validation. |

Public launch remains blocked when required legal documents are unfinished, material privacy flows are undocumented, legally required notices are missing, unresolved legal blocks exist, mandatory external professional review is incomplete, or product claims exceed verified evidence.

## Manual Approval Boundaries

Stop before:

- Additional billed Supabase projects/add-ons, including PITR;
- Stripe live mode;
- real customer emails or payment links;
- public launch;
- legal/terms publication;
- irreversible production migrations;
- production data deletion;
- secret rotation requiring owner action.

## Final Release Evidence Required

Current pass evidence is consolidated in `RELEASE_EVIDENCE_2026-07-15.md`.

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
