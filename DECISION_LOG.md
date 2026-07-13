# Tallyo Decision Log

This file records important product, security, architecture, and operations decisions. It should stay short and evidence-focused.

Statuses: Proposed, Accepted, Superseded, Deferred, Rejected.

| Date | Decision | Status | Reason / evidence |
|---|---|---|---|
| 2026-07-08 | Rebrand visible product from InvoicePro to Tallyo while keeping repo/URL unchanged. | Accepted | Avoids breaking GitHub Pages and Supabase Auth redirect URLs during active development. |
| 2026-07-08 | Keep customer-contact automation opt-in per invoice/schedule, not global by default. | Accepted | Reduces accidental customer emails and supports clear user intent. |
| 2026-07-09 | Use seller-controlled Stripe deposit amounts; customers cannot enter arbitrary partial-payment amounts. | Accepted | Reduces payment abuse, reconciliation ambiguity, and unexpected underpayment. |
| 2026-07-09 | Treat Stripe as sandbox/test until live mode is explicitly approved and configured. | Accepted | Prevents accidental real payments before refund/dispute/legal/backup readiness. |
| 2026-07-10 | Finish current app and security hardening before SaaS website/subscription work. | Accepted | Keeps risk low and preserves a clear portfolio/security story. |
| 2026-07-12 | Add explicit local logout and all-devices logout; keep email-code logout as future hardening. | Accepted | Current flow uses current-password reauth and MFA when required; email-code flow needs careful production design. |
| 2026-07-13 | Upgrade the Supabase organisation to Pro for current app hardening and recovery readiness. | Accepted | Owner completed the paid upgrade; Pro provides daily backups with seven days of retention and avoids Free-tier pausing. PITR remains a separate, unapproved paid add-on. |
| 2026-07-13 | Use one Owner, one Master Orchestrator, eight specialist functional agents, and three model/work modes. | Accepted | Functional roles define responsibility; Luna, Terra, and Sol define work mode. Actual concurrency depends on environment capability, so one Codex process may perform roles sequentially without claiming background agents are running. |
| 2026-07-13 | Make computer use read-only by default and require explicit Owner approval at material production, financial, legal, identity, secret, or irreversible boundaries. | Accepted | Dashboard access must not silently expand standing repository permission. Safe reversible test-environment changes remain allowed only under the recorded policy. |

## Pending Decisions

| Decision needed | Why it matters | Approval boundary |
|---|---|---|
| Supabase restore-test timing | A restore-to-new-project test creates a billable project and must be scheduled carefully to prevent cloned cron/email/payment side effects. | Owner must approve the displayed project cost and final restore action. |
| Stripe live-mode activation | Enables real customer card payments. | Owner must approve live payment activation. |
| Refund/chargeback support policy | Required before real customer payments. | Owner/legal/business decision. |
| Privacy policy and terms wording | Required before onboarding real customers. | Owner/legal review. |
| MFA recovery process | Needed before real users rely on TOTP. | Security/product decision. |
