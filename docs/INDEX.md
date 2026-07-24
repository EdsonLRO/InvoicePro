# Tallyo context routing index

Read the compact authority first: `AGENTS.md`, `APP_STATUS.md`, `ROADMAP.md`, `DECISIONS.md` and `tasks/ACTIVE.md`.

## Document classes

- **Authoritative:** current state, decisions, priorities, permissions and release gates.
- **Specialist:** detailed policy, architecture or operations material loaded only when its domain is triggered.
- **Historical/archive:** completed tasks, dated evidence and superseded prompts. Do not load these by default.

## Authoritative

| Subject | Source |
|---|---|
| Working rules | `AGENTS.md` |
| Current product/deployment state | `APP_STATUS.md` |
| Priorities | `ROADMAP.md` |
| Commercial and technical decisions | `DECISIONS.md` |
| Current programme and locks | `tasks/ACTIVE.md` |
| Standing autonomy and merge limits | `AUTONOMOUS_EXECUTION_PERMISSION.md` |
| Orchestration and approval boundaries | `AUTOMATION_MODEL_ORCHESTRATION.md` |
| Release gates | `RELEASE_READINESS.md` |

## Specialist routing

| Trigger | Read |
|---|---|
| Ordinary public website, copy, SEO or accessibility | `CODEX.md`, affected website source and tests |
| Auth, MFA, sessions, recovery, authorization or RLS | `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, `AUTOMATION_MODEL_ORCHESTRATION.md`, `SUPABASE_HANDOFF.md`, affected source/evidence and `RELEASE_READINESS.md` |
| Supabase backend, privileged functions or migrations | `SUPABASE_HANDOFF.md`, relevant schema/function files; add the security and orchestration policies for secrets, authorization or destructive work |
| Stripe invoice payments, refunds, Billing, Connect or entitlements | `ROADMAP_EMAIL_PAYMENTS.md`, `PAYMENT_OPERATIONS_RUNBOOK.md`, `docs/architecture/STRIPE_BILLING.md` or `docs/architecture/STRIPE_CONNECT.md`, security policy and release gates |
| Public AI Helper | `website/content/helper-ai-adapter.md`, `TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, legal policy, affected Helper source/tests and the active task |
| Privacy, analytics, pricing, cancellation, refunds or public claims | `TALLYO_LEGAL_COMPLIANCE_AGENT.md`, `docs/legal/LAUNCH_CHECKLIST.md`, affected content/data-flow records |
| Deployment, DNS or public release | `RELEASE_READINESS.md`, security policy, deployment/rollback evidence and relevant legal/payment review |
| Provider dashboard changes | `AGENT_HIERARCHY_AND_COMPUTER_USE.md`, `AUTONOMOUS_EXECUTION_PERMISSION.md` and the provider-owning specialist policy |

High-risk work reads each relevant specialist policy in full. Routine work does not inherit every specialist merely because the repository is large.

## Historical and archive

- `tasks/archive/`: completed task records and the former task template.
- `docs/archive/`: superseded programme prompts and other deliberately archived material.
- Dated evidence elsewhere remains historical unless an active investigation, regression, contradiction or explicit question requires it.

Verified code and current test evidence override stale narrative documents. Correct or archive contradictions instead of adding another explanation.

## Update and validation rules

- Update `APP_STATUS.md` only when current state changes.
- Update `ROADMAP.md` only when priority changes.
- Update `DECISIONS.md` only when a material decision changes.
- Update `tasks/ACTIVE.md` while the programme is active.
- Create separate evidence only for genuinely high-risk work.
- Use focused existing checks, `git diff --check`, a secret/private-data scan and full-diff review before commit.
