# Tallyo Security Remediation, SaaS Conversion and Agent Governance Plan

**Project:** Tallyo (`EdsonLRO/InvoicePro`)
**Repository baseline:** `main` through commit `24015a3a48b5ecf0a2e8e5e6c6ef96b37c4f614c`, reviewed 12 July 2026
**Status:** Living governance document. Update whenever implementation, vendors, architecture, risks or launch scope change.

## 1. Purpose

This document governs security remediation, future SaaS conversion, Codex reporting, documentation maintenance, agent responsibilities and controlled skill development.

Tallyo is currently a single-user-per-account invoicing workspace backed by Supabase. It is not yet a public paid SaaS. The future phase will add a public website, subscription tiers, workspaces, teams, RBAC and server-enforced entitlements only after the present application and its launch controls are complete.

## 2. Repository-reconciled current state

Confirmed implemented on the reviewed `main` branch:

- invoices, quotes, credit notes, customers and saved items;
- manual and Stripe-confirmed invoice payments;
- Stripe Checkout links for full balances and seller-approved deposits;
- server-side Stripe refund requests;
- server-side scheduled recurring invoice generation;
- Resend document email and overdue reminders;
- signed Stripe and Resend webhooks;
- provider-backed `audit_events` and selected authenticated app-action audit events;
- Supabase Auth, email confirmation, optional TOTP MFA and RLS;
- CSP, SRI, self-hosted Tailwind and server-side secret custody;
- Stripe failed-payment, refund, refund-failure and dispute lifecycle awareness.

Confirmed unfinished before customer-ready or live-payment use:

- remaining Stripe sandbox replay testing and an operational refund/chargeback process;
- formal backup/restore plan and at least one restore test;
- broader append-only audit coverage and alerting;
- MFA recovery or documented recovery procedures;
- verified server-side “log out from all devices” flow;
- password-strength and breached-password controls where supported;
- privacy, terms, retention, rights-request and breach-response operations;
- final mobile and PDF regression testing;
- continuously synchronised security and portfolio documentation.

## 3. Non-negotiable rule: report before repair

Codex must not silently patch a meaningful security finding when first identified. It must first record a pre-remediation report and classify the finding as one of:

- `validated — approved to fix`;
- `validated — defer with accepted risk`;
- `duplicate`;
- `not reproducible`;
- `false positive`;
- `blocked — missing evidence or decision`.

The report must include:

1. finding ID, title, severity and status;
2. affected files, functions, tables, policies, roles and data;
3. trust boundary and violated security invariant;
4. concrete source-to-control-to-sensitive-operation path;
5. attacker prerequisites and realistic impact;
6. code, SQL, runtime and test evidence;
7. existing mitigating controls;
8. narrowest complete fix and alternatives considered;
9. legitimate behaviour and compatibility that must remain;
10. regression tests required;
11. documents that must be updated;
12. recommendation and unresolved decisions.

This rule is intended for material security findings, architectural risk decisions and high-impact remediations. It should not block routine safe fixes, formatting cleanup, documentation corrections, test updates or reversible hardening already covered by explicit autonomous execution permission.

When approval is required by the current operating permission or project owner, Codex must stop before the blocked action. The current standing permission is recorded in `AUTONOMOUS_EXECUTION_PERMISSION.md`. Otherwise, after recording the assessment, Codex may implement the narrowest complete fix, add regression coverage, rerun the original failure and at least one bypass variant where practical, prove legitimate behaviour remains, update every affected document and issue a post-remediation report with exact commands and results.

A finding is not `fixed` while any material security or compatibility check is unknown.

## 4. Reconciled security register

### SEC-001 — MFA assurance checks must fail closed

**Status:** Revalidate against current code.
If the Supabase Authenticator Assurance Level check errors or returns an unknown state, the app must remain restricted or sign out. Full application initialisation must occur only after the required assurance level is proven. Test fresh login, restored sessions, API/network failure, expired sessions, wrong TOTP, valid TOTP and non-enrolled accounts.

### SEC-002 — Sensitive operations need trusted AAL2 enforcement

**Status:** Open design requirement.
RLS ownership checks do not automatically prove MFA assurance. Define operations that require AAL2 and enforce them through trusted database functions, policies or Edge Functions. Candidates include MFA removal, account recovery, session revocation, bulk export, destructive account actions, future team/role administration and high-risk billing changes.

### SEC-003 — CSP remains transitional

**Status:** Known limitation.
The single-file Vue architecture still requires a permissive CSP setting. Move toward compiled assets and the Vue runtime build, remove unsafe directives where practical, restrict exact production origins, use response headers on a suitable host and test the policy in report-only mode before enforcement.

### SEC-004 — Recurring generation is server-side but concurrency guarantees need proof

**Status:** Implemented; verification/hardening required.
Prove that concurrent invocations and retries cannot generate duplicates. Confirm idempotency or uniqueness controls, consistent invoice creation and schedule advancement, safe tenant attribution, partial-failure handling, audit events for privileged failures and operational behaviour when the Supabase project pauses.

### SEC-005 — Audit coverage is partial

**Status:** Partially remediated.
Provider events and selected app actions are append-only, while document activity history remains intentionally mutable. Expand protected audit events to remaining sensitive actions, security settings, automation failures, session revocation, account recovery and backup/restore activity. Define retention, access, correlation IDs, alerting and safe metadata rules.

### SEC-006 — Financial integrity must be server-validated

**Status:** Revalidate current implementation.
The server must validate line items, quantities, discounts, tax, currency, payment amounts and status transitions. Stripe-confirmed state must remain provider-authoritative. Prevent inconsistent states such as `Paid` with an unexplained balance and preserve calculation-version evidence.

### SEC-007 — Tenant relationships must become workspace-bound before teams

**Status:** Future SaaS control.
When workspaces are introduced, invoices, customers, items, subscriptions and roles must reference a common workspace boundary. Use composite tenant keys or equivalent constraints and direct cross-workspace tests.

### SEC-008 — Schema changes must be migration-safe

**Status:** Open engineering-control requirement.
Use ordered Supabase migrations with repeatable environment setup, drift checks, rollback/forward-fix procedures and CI validation. One-time schema scripts must not be treated as the deployment system.

### SEC-009 — Password and abuse controls are incomplete

**Status:** Open.
Document and test signup/login/reset throttling, breached-password checks, password strength, bot controls, suspicious-login monitoring and email-delivery abuse protections. Do not imply that server-side password hashing alone solves account abuse.

### SEC-010 — MFA recovery and disablement require stronger controls

**Status:** Open.
Create recovery or a documented support process with strong identity verification. Require recent AAL2 or reauthentication for MFA removal. Log recovery and factor changes. Avoid insecure administrator shortcuts.

### SEC-011 — Backup and restoration are not proven

**Status:** Launch blocker.
Define backup scope, frequency, encryption, retention, access, regional considerations, recovery objectives and ownership. Perform and document a restore test. Include Edge Function configuration, migrations, secrets inventory and operational runbooks without storing secret values.

### SEC-012 — Future subscription entitlements must be server-enforced

**Status:** Future SaaS control.
Plan limits and paid features must be enforced in trusted backend/database boundaries, not only hidden in the UI. The entitlement source of truth must derive from verified subscription state and support grace, past-due, cancelled and read-only states.

### SEC-013 — Stripe invoice payments exist; Tallyo subscription billing is separate future work

**Status:** Partially remediated / future SaaS control.
Current invoice-payment flows use server-created Checkout, signed webhooks and server-side refunds, with failed-payment/refund/dispute awareness. Finish sandbox replay tests and define operational refund, dispute and chargeback policy before live use. Future Tallyo plan subscriptions require separate webhook idempotency, customer mapping, entitlement state and lifecycle rules.

### SEC-014 — Workspace and role architecture must precede team subscriptions

**Status:** Future SaaS control.
Model workspace ownership, membership, invitations, roles, least privilege, subscription ownership and removal behaviour before offering multi-user plans. RLS tests must cover every role and cross-tenant path.

### SEC-015 — Privacy and legal operations are unfinished

**Status:** Launch blocker.
Complete a data map, controller/processor role analysis, Privacy Notice, Terms, retention schedule, export/access/deletion process, vendor register, breach process, refund/dispute wording and evidence of operational execution. Never claim “GDPR compliant” without formal review.

### SEC-016 — Exports create unmanaged plaintext copies

**Status:** Residual risk requiring transparent controls.
Warn users that downloaded PDF/XLSX files are outside Tallyo’s technical control. Avoid unnecessary fields, log sensitive bulk exports where appropriate and document user responsibility and deletion limitations.

### SEC-017 — Supply-chain management needs an operational process

**Status:** Partially remediated.
Pinned dependencies, SRI and self-hosted Tailwind are strong controls. Add routine vulnerability scanning, update cadence, provenance review, lockfiles/build reproducibility and emergency dependency response.

### SEC-018 — Monitoring and incident response are incomplete

**Status:** Launch blocker.
Define monitored events, severity, owners, alert channels, evidence preservation, containment, communication, legal assessment and post-incident review. Logging without alerts and response ownership is not an operational detection system.

### SEC-019 — The single-file frontend limits assurance

**Status:** Known architectural debt.
Split the application into testable modules and a build pipeline. Separate authentication, data access, invoices, payments, recurring jobs, exports and account security. This supports stronger CSP, tests and reviewability.

### SEC-020 — Documentation must remain synchronised with implementation

**Status:** Continuous control.
Every material change must update `APP_STATUS.md`, `PROJECT_HANDOFF.md`, `README.md`, `SUPABASE_HANDOFF.md`, `SECURITY_STORY.md`, threat models, runbooks and this register as applicable. Claims must distinguish implemented, verified, partial, planned and unknown states.

## 5. Future SaaS architecture

Do not interrupt current hardening with premature SaaS conversion. After the present launch gates pass, use this target model:

```text
User
  -> workspace membership
  -> workspace
      -> customers / invoices / items / settings / audit events
      -> subscription
      -> entitlements and usage
```

Recommended components:

- Vue application with a real build pipeline;
- Supabase Auth, PostgreSQL, RLS, migrations and Edge Functions;
- Stripe Billing for Tallyo subscriptions and customer portal;
- verified webhook-driven subscription state;
- server-enforced entitlements and usage counters;
- scheduled server-side jobs with idempotency;
- Resend or equivalent transactional email;
- monitoring, audit events, backups and incident runbooks.

Suggested initial plans: Free, Pro and Business. Exact pricing and limits must be evidence-based and legally reviewed before publication.

## 6. Agent hierarchy

```text
Master Business Agent
├── Product and Strategy Agent
├── Engineering Architecture Agent
├── Security Lead Agent
├── Legal, Privacy and Compliance Lead Agent
├── Data and Database Agent
├── Payments and Subscription Agent
├── Reliability and Operations Agent
├── Quality and Release Agent
├── Documentation and Knowledge Agent
├── Customer Operations Agent
└── Growth and Analytics Agent
```

The master agent coordinates but cannot silently overrule a security or legal release block. Any accepted risk must record owner, reasoning, compensating controls, expiry/review date and required follow-up.

## 7. Controlled agent learning

Agents may propose new reusable skills when repeated work reveals a stable need. They may not silently rewrite their own governing instructions.

Every proposed skill must include:

- name, scope and trigger;
- inputs, outputs and required evidence;
- authoritative sources;
- permitted actions and prohibited actions;
- escalation conditions;
- tests or examples;
- version, owner and review date;
- conflicts with existing skills.

Security, legal, billing and destructive-operation skills require human review before activation. Learned instructions must be stored in version control and remain reversible.

Core skills for this project should include:

- repository orientation and architecture mapping;
- threat modelling, finding discovery, validation and attack-path analysis;
- secure finding remediation and regression testing;
- Supabase RLS and migration review;
- Stripe webhook and billing lifecycle review;
- recurring-job idempotency and failure analysis;
- privacy/data-flow mapping and legal issue spotting;
- data-rights, retention and breach workflow design;
- SaaS entitlement and workspace modelling;
- release gating, incident response and documentation synchronisation.

## 8. Documentation update protocol

For every material change, Codex must identify affected documents before editing and update them in the same branch/PR. Each document must state its source revision or review date where practical.

Minimum security-change set:

- finding report;
- code/tests/migration;
- post-remediation report;
- threat model or risk register;
- current status/handoff documentation;
- operational runbook if behaviour changes;
- legal/privacy review when data, money, users or communications change.

## 9. Release gates

### Private beta

Requires verified tenant isolation, fail-closed authentication, safe secrets, tested core workflows, error monitoring, backup plan, basic incident ownership and honest beta disclosures.

### Paid invoice-payment/live-customer use

Requires successful Stripe lifecycle tests, refund/dispute support process, verified webhook configuration, restore test, broader audit coverage, privacy/terms/retention/rights/breach processes, support route, final mobile/PDF regression and no unresolved critical/high findings without written acceptance.

### Public subscription SaaS

Additionally requires workspace/RBAC isolation, server-enforced entitlements, Stripe Billing lifecycle tests, cancellation and grace behaviour, customer portal, subscription-law review, production monitoring, operational backups and formal security/legal review of public claims.

## 10. Current execution order

1. Finish Stripe sandbox replay tests and operational refund/chargeback decisions.
2. Create and prove backup/restore.
3. Expand audit coverage and alerts.
4. Complete MFA recovery and session-revocation design.
5. Add password and abuse hardening.
6. Complete privacy, terms, retention, rights and breach operations.
7. Run final mobile/PDF regression and synchronise evidence.
8. Re-run security review and close/defer findings with proof.
9. Only then design workspaces, subscriptions, tiers and public SaaS billing.

## 11. Governing statement

Tallyo must prefer evidence over claims, trusted backend enforcement over UI restrictions, small verified changes over broad speculative rewrites, and honest documented limitations over unsupported assurances. Security, legal readiness and customer trust are release requirements, not marketing decorations.
