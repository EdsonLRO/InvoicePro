# Active programme

Objective: Simplify repository authority and prepare Tallyo's approved commercial launch direction without activating subscriptions, Stripe Connect, public AI, DNS, legal publication or production release.
Branch: `codex/repository-simplification-commercial-launch`
Risk: Medium for repository, content, SEO, accessibility and architecture documentation. High-risk runtime/provider actions are excluded.
Current scope: Compact authoritative documents; archive completed task records; Free Invoice Maker and one Tallyo Pro offer; payment-claim qualification; design-only Stripe Billing and Connect architecture; proportionate launch checklist; disabled analytics measurement plan.
Completed: PR #91 is merged with the AI Helper disabled by default. This branch is updated from merged `main` and preserves the Helper implementation and gates. Compact authority, task archives, approved commercial decisions, Billing/Connect architecture, the proportionate launch checklist, disabled market-evidence plan and commercial-offer module are prepared. The approved two-offer pricing is wired into the public pages and general card-payment claims are qualified.
Remaining: Commit and push the reviewed diff, open one reviewable pull request, and hand it to the Owner without merging or publishing.
Validation already completed: Current invoicing app build `2026.07.23.2`; PR #91 focused Helper suite and protected-preview acceptance. On this branch, the 26-route website build, commercial-offer assertions, AI Helper fail-closed/mock-provider suite, pricing-page semantic review, focused contradiction scan and `git diff --check` pass. Unchanged high-risk regressions were not repeated.
Owner-only actions: Any public AI activation; live Stripe Billing or Connect configuration; provider secrets; DNS; legal publication; production release.
Next action: Commit, push and open the commercial-launch pull request for Owner review.

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
