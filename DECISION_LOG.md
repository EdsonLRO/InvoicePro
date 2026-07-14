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
| 2026-07-13 | Use the initial governance hierarchy that omitted a dedicated legal/privacy/regulatory specialist. | Superseded | The structure incorrectly treated legal, privacy, and regulatory work as a consultation domain outside the active hierarchy. The Owner clarified that this must be an active specialist responsibility. |
| 2026-07-13 | Make computer use read-only by default and require explicit Owner approval at material production, financial, legal, identity, secret, or irreversible boundaries. | Accepted | Dashboard access must not silently expand standing repository permission. Safe reversible test-environment changes remain allowed only under the recorded policy. |
| 2026-07-13 | Use a second TOTP authenticator as the supported MFA backup and do not let email recovery bypass MFA. | Accepted | Supabase Auth does not provide recovery codes. A second verified factor preserves two-factor assurance; an all-factors-lost case remains blocked until a strong support recovery process is approved. |
| 2026-07-13 | Enable Supabase leaked-password protection on the Pro project. | Accepted | Server-side breach-corpus checking strengthens the client password rules and cannot be bypassed through direct Auth API use. The setting was read back as enabled and the advisor warning cleared. |
| 2026-07-13 | Remove direct API execution from internal trigger helpers and pin their search paths. | Accepted | Trigger-only functions do not need anonymous or authenticated RPC access. The least-privilege migration cleared all database advisor warnings without changing trigger business logic. |
| 2026-07-13 | Authenticate both database-scheduled functions with one dedicated Vault-backed automation secret. | Accepted | A public anon key is not caller authentication for a function with service-role effects. Both cron jobs now retrieve `automation_secret` at runtime, and privileged processing begins only after the custom header is verified. |
| 2026-07-13 | Preserve RLS ownership semantics while optimising identity evaluation and foreign-key lookups. | Accepted | Wrapping `auth.uid()` in a scalar subquery avoids per-row re-evaluation; narrow foreign-key indexes reduce scans without broadening access. |
| 2026-07-13 | Prefer at-most-once recurring invoice/email processing over duplicate customer contact after partial failure. | Accepted | Each schedule occurrence is unique and email starts only after a conditional schedule claim. A rare crash after the claim may miss email; eliminating both outcomes requires a future transactional outbox/queue. |
| 2026-07-14 | Use one Owner, one Master Orchestrator, nine specialist functional agents, and three model/work modes. The Legal, Privacy and Regulatory Agent is active. | Accepted | There are ten AI functional roles including the Orchestrator; the Owner is separate. The Legal Agent owns legal/privacy/regulatory analysis and release conditions but does not replace qualified external professional advice. This corrects the previous omission without claiming concurrent agents where the environment supports only sequential role transitions. |

## Pending Decisions

| Decision needed | Why it matters | Approval boundary |
|---|---|---|
| Supabase restore-test timing | A restore-to-new-project test creates a billable project and must be scheduled carefully to prevent cloned cron/email/payment side effects. | Owner must approve the displayed project cost and final restore action. |
| Stripe live-mode activation | Enables real customer card payments. | Owner must approve live payment activation. |
| Refund/chargeback support policy | Required before real customer payments. | Owner/legal/business decision. |
| Privacy policy and terms wording | Required before onboarding real customers. | Owner/legal review. |
| All-factors-lost MFA support process | Backup-authenticator recovery is implemented, but support still needs a strong identity-verification and escalation procedure for users who lose every factor. | Owner/security/product decision before real onboarding. |
