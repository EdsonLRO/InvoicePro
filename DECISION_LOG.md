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
| 2026-07-13 | Stay on Supabase free tier for now; upgrade to Pro when backup/restore/live-readiness work requires it. | Accepted | Free tier is acceptable for development but not enough for real customer readiness. |

## Pending Decisions

| Decision needed | Why it matters | Approval boundary |
|---|---|---|
| Supabase Pro upgrade timing | Needed for stronger backup/logging/Auth posture and live readiness. | Owner must approve spend. |
| Stripe live-mode activation | Enables real customer card payments. | Owner must approve live payment activation. |
| Refund/chargeback support policy | Required before real customer payments. | Owner/legal/business decision. |
| Privacy policy and terms wording | Required before onboarding real customers. | Owner/legal review. |
| MFA recovery process | Needed before real users rely on TOTP. | Security/product decision. |
