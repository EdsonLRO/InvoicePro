# Active programme

Objective: Simplify repository authority and prepare Tallyo's approved commercial launch direction without activating subscriptions, Stripe Connect, public AI, DNS, legal publication or production release.
Branch: `codex/repository-simplification-commercial-launch`
Risk: Medium for repository, content, SEO, accessibility and architecture documentation. High-risk runtime/provider actions are excluded.
Current scope: Compact authoritative documents; archive completed task records; Free Invoice Maker and one Tallyo Pro offer; payment-claim qualification; design-only Stripe Billing and Connect architecture; proportionate launch checklist; disabled analytics measurement plan.
Completed: AI Helper implementation preserved separately in draft PR #91 at the exact Owner merge-approval boundary. This branch starts from `origin/main` commit `c0ebf10` and does not edit PR #91's Helper source. Compact authority, task archives, approved commercial decisions, Billing/Connect architecture, the proportionate launch checklist, disabled market-evidence plan and a tested commercial-offer module are prepared.
Remaining: After PR #91 merges, update this branch from `main`, wire the commercial offer into the public pages that PR #91 also changes, qualify public payment claims, run focused responsive/accessibility/build checks, review the full diff, commit, push and open one reviewable pull request.
Validation already completed: Current invoicing app build `2026.07.23.2`; PR #91 focused Helper suite and protected-preview acceptance. On this branch, the existing 26-route website build and commercial-offer assertions pass. Unchanged high-risk regressions will not be repeated.
Owner-only actions: PR #91 ready/merge approval; any public AI activation; live Stripe Billing or Connect configuration; provider secrets; DNS; legal publication; production release.
Next action: Obtain exact Owner approval to mark PR #91 ready and merge its disabled-by-default capability. Then update this branch from merged `main` before editing the overlapping public-page files.

## Lock

- Assigned role: Master Orchestrator, with Documentation, Product, Frontend and QA responsibilities performed sequentially.
- Files or paths locked: `AGENTS.md`, `APP_STATUS.md`, `ROADMAP.md`, `DECISIONS.md`, `docs/`, `tasks/`, `README.md`, and public website content/configuration/tests excluding the AI Helper implementation owned by PR #91.
- Lock acquired: 2026-07-24.
- Release condition: Focused PR is pushed and handed to the Owner, or the branch is rolled back.

## Boundaries

- Security: Preserve Auth, MFA, sessions, recovery, RLS, secrets, CSP, SRI, provider verification and current payment integrity. No authenticated-app runtime or backend change.
- Privacy/legal: Prepare internal launch conditions and fair explanatory copy only. Do not publish final legal terms or claim compliance.
- Payments: Pricing and architecture documentation only. No Stripe products, prices, customers, Checkout, Connect accounts, webhooks, migrations, secrets or live-mode changes.
- Production: No merge, deployment, DNS change or public release.
