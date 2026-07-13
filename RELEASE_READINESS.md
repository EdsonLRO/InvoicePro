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
| TOTP MFA | In Progress | Fail-closed assurance checks, backup authenticator support, and MFA-gated password recovery are implemented. Complete the `MFA_RECOVERY_RUNBOOK.md` browser tests and define the all-factors-lost support process. |
| RLS / tenant isolation | Implemented | Previously break-tested; re-run before release. |
| CSP/SRI/self-hosted Tailwind | Implemented | Recheck final deployed HTML before release. |
| Email sending and webhooks | Implemented | Need final test delivery evidence. |
| Overdue reminder automation | Implemented | Job is active and Vault-authenticated; confirm the first post-hardening scheduled run and opt-in behaviour before release. |
| Recurring invoice automation | Implemented | Endpoint rejects unsigned calls and job is Vault-authenticated; confirm the first post-hardening run and service-role attribution before release. |
| Stripe payments | In Progress | Sandbox implemented; signature rejection and payment/refund duplicate replay passed. Remaining positive lifecycle tests and live-mode setup are still gated. |
| Refund/dispute/chargeback handling | In Progress | Unknown disputes are rejected and refund replay is idempotent; known-payment dispute, genuine failed-refund evidence, and operational policy remain. |
| Backups and restore | In Progress | Pro daily backups were verified through 2026-07-13; an Owner-approved timed non-production restore test remains. |
| Audit events | In Progress | Provider and selected app actions covered; not a full SIEM/compliance system. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention, export/delete, breach process. |
| Mobile regression | Planned | Test key workflows on phone widths. |
| PDF regression | Planned | Test mobile PDF download and long multi-page invoices. |
| PWA/service-worker regression | Planned | Confirm cache behaviour and update instructions. |
| Documentation accuracy | In Progress | Keep status/handoff/security docs synced with real implementation. |
| Supabase Auth provider policy | In Progress | Live settings were recorded without secrets. Email confirmation, MFA, refresh rotation, and leaked-password protection are active; remaining owner decisions are centralised in `DEFERRED_MANUAL_CONFIGURATION.md`. |
| Agent governance documentation | Verified | Hierarchy, queue, locks, handoffs, computer-use controls, provider restrictions, and approval boundaries are authoritative and cross-linked. Recheck consistency at each release candidate. |

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
