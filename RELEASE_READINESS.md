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
| Supabase Auth + email verification | Implemented | Needs current Auth settings review before release. |
| TOTP MFA | In Progress | Primary/backup enrolment and sign-in, wrong-code sign-in and recovery rejection, email-only bypass rejection, protected backup removal, one-factor preservation, restoration to two verified factors, one enrolled-factor-gated masked password-recovery path, and privacy-safe account-audit review passed on 2026-07-14. Complete factor-specific recovery, lookup-error simulation, and the all-factors-lost support process. |
| RLS / tenant isolation | Implemented | Previously break-tested; re-run before release. |
| CSP/SRI/self-hosted Tailwind | Implemented | Recheck final deployed HTML before release. |
| Email sending and webhooks | Implemented | Need final test delivery evidence. |
| Overdue reminder automation | Implemented | Job is active and Vault-authenticated; confirm the first post-hardening scheduled run and opt-in behaviour before release. |
| Recurring invoice automation | Implemented | Endpoint rejects unsigned calls, job is Vault-authenticated, and per-occurrence uniqueness/conditional claiming passed rolled-back live verification. Confirm the first v13 scheduled run and service-role attribution before release. |
| Stripe payments | In Progress | Sandbox implemented; signature rejection and payment/refund duplicate replay passed. Remaining positive lifecycle tests and live-mode setup are still gated. |
| Refund/dispute/chargeback handling | In Progress | Unknown disputes are rejected and refund replay is idempotent; known-payment dispute, genuine failed-refund evidence, and operational policy remain. |
| Backups and restore | In Progress | Pro daily backups were verified through 2026-07-13; an Owner-approved timed non-production restore test remains. |
| Audit events | In Progress | Provider and selected app actions covered; not a full SIEM/compliance system. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention, export/delete, breach process. |
| Legal, privacy and regulatory review | Blocked | The active Legal, Privacy and Regulatory Agent must review every legally material release change, verify mandatory conditions, and record any required external professional review. Required launch documents and privacy operations are unfinished. |
| Mobile regression | Planned | Test key workflows on phone widths. |
| PDF regression | Planned | Test mobile PDF download and long multi-page invoices. |
| PWA/service-worker regression | Planned | Confirm cache behaviour and update instructions. |
| Documentation accuracy | In Progress | Keep status/handoff/security docs synced with real implementation. |
| Supabase Auth provider policy | In Progress | Live settings were recorded without secrets. Email confirmation, MFA, refresh rotation, and leaked-password protection are active; remaining owner decisions are centralised in `DEFERRED_MANUAL_CONFIGURATION.md`. |
| Agent governance documentation | Verified | The corrected hierarchy contains nine specialists and ten AI functional roles including the Orchestrator. Counts, legal triggers/workflow, task fields, work modes, release gate, code fences, headings, secret/PII scope, and documentation-only file scope passed validation. Owner merge remains separate. |

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
