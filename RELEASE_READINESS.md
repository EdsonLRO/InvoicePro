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
| TOTP MFA | Implemented | Recovery process still missing. |
| RLS / tenant isolation | Implemented | Previously break-tested; re-run before release. |
| CSP/SRI/self-hosted Tailwind | Implemented | Recheck final deployed HTML before release. |
| Email sending and webhooks | Implemented | Need final test delivery evidence. |
| Overdue reminder automation | Implemented | Verify cron and opt-in behaviour before release. |
| Recurring invoice automation | Implemented | Verify cron and service-role attribution before release. |
| Stripe payments | In Progress | Sandbox implemented; replay testing and live-mode setup remain. |
| Refund/dispute/chargeback handling | In Progress | Logic exists; needs replay evidence and operational policy. |
| Backups and restore | Planned | Free-tier runbook needed now; Pro restore test needed before real customers. |
| Audit events | In Progress | Provider and selected app actions covered; not a full SIEM/compliance system. |
| Privacy/legal groundwork | Planned | Privacy policy, terms, retention, export/delete, breach process. |
| Mobile regression | Planned | Test key workflows on phone widths. |
| PDF regression | Planned | Test mobile PDF download and long multi-page invoices. |
| PWA/service-worker regression | Planned | Confirm cache behaviour and update instructions. |
| Documentation accuracy | In Progress | Keep status/handoff/security docs synced with real implementation. |

## Manual Approval Boundaries

Stop before:

- Supabase paid upgrade;
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
- Backup/restore evidence.
- Mobile/PDF/PWA screenshots or notes.
- Open risks accepted by owner.
