# WEB-003 — Cloudflare access-controlled preview

Task ID: WEB-003

Title: Cloudflare fail-closed private-preview preparation

Objective: Prepare website and app builds so Cloudflare projects can be created
without publishing content before access controls are verified.

Risk level: High because later stages change provider authorization, hosting and
production-adjacent configuration; this repository-only guard is reversible.

Phase: Repository guard and exact provider-scope review

Owner role: Master Orchestrator

Assigned specialist: Release, Security, QA, Legal and Cloudflare provider owner

Required reviewers: Independent Security/QA review before provider action

Affected files: Cloudflare build scripts, readiness tests and authoritative
Cloudflare readiness records

Files or paths locked: `scripts/build-app-pages.mjs`,
`scripts/cloudflare-access-build-guard.mjs`, `website/scripts/build.mjs`,
`website/scripts/test.mjs`, `deployment/cloudflare/`, focused readiness tests and
this record

Documents to read: `AGENTS.md`, `APP_STATUS.md`, `docs/INDEX.md`, this record,
`AUTONOMOUS_EXECUTION_PERMISSION.md`, `AUTOMATION_MODEL_ORCHESTRATION.md`,
`AGENT_HIERARCHY_AND_COMPUTER_USE.md`, `RELEASE_READINESS.md`,
`TALLYO_SECURITY_SAAS_MASTER_PLAN.md`, `TALLYO_LEGAL_COMPLIANCE_AGENT.md` and
the affected Cloudflare readiness files

Documents explicitly not required: Historical Auth, payment and closed-task
evidence; no Auth, MFA, RLS, Stripe or customer-data change is in scope

Dependencies: PR #84 merged at `a4d405c`; current GitHub Pages app remains the
rollback; the Cloudflare account currently has no Workers/Pages projects and its
GitHub integration is not connected

Acceptance criteria: Both builds fail before writing output when `CF_PAGES=1`
unless `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`; repository records state that
`noindex` is not access control; provider actions remain pending

Required tests: Website test suite, Cloudflare Pages readiness harness, preview
acceptance harness, workflow policy, secret scan and `git diff --check`

Security boundary: No provider mutation, GitHub authorization, deployment
variable, secret, Auth change, DNS, public release, tracking or real data

Privacy/legal materiality: UK technical preview intended only for the Owner and
approved reviewers. Cloudflare would host static public-product content and
GitHub would disclose the selected repository to the Cloudflare GitHub app. No
consumer service, real-customer data, tracking, legal publication or subscription
flow is approved. Legal disposition is Approved with conditions for the
repository guard and read-only provider inspection only: the eventual preview
must be access-controlled before content is served, use fictional or synthetic
data, remain unpromoted and obtain a fresh legal/Owner decision before public
launch. External professional review is not required for this isolated technical
preview but remains required for final public legal documents and paid terms.

Payment impact: None; live Stripe remains unchanged and disabled in preview

Production impact: None from this branch; current GitHub Pages stays live

Owner permission required: Exact approval before (1) authorizing the Cloudflare
GitHub app for `EdsonLRO/InvoicePro`, (2) creating either free Pages project, (3)
creating Access policies, or (4) setting any deployment variable/retrying builds

Approval boundary: Project creation is not approval for Access, variables,
successful deployment, Auth/MFA origins, Turnstile, Stripe/email links, custom
domains, DNS, legal publication or final release

Implementation result: Complete for repository scope. A shared guard now blocks
both Cloudflare builds before any output mutation until the required Access
confirmation variable is explicitly true.

Review result: Local focused review passed. Required GitHub Security `verify`
run `29927895060` passed on the first draft-PR commit.

Evidence: Read-only Cloudflare inspection on 2026-07-22 confirmed a signed-in
account with no Workers/Pages projects and an unconnected GitHub integration.
Cloudflare documentation current on 2026-07-22 states Pages URLs are public by
default and documents separate Access policies for the main and wildcard preview
hostnames. No private account identifier is recorded here.

Focused validation passed: all 26 website routes plus 404, fail-closed website
and app build behavior including preservation of existing output, Cloudflare
Pages packaging, preview acceptance state, security workflow policy,
`git diff --check` and a scoped secret-pattern scan.

Branch: `codex/cloudflare-private-preview`

Commit: `cb75e1a0d0025bc02724b944ad43366b0eb01226`; draft PR #85

Blocked reason: Provider authorization and project creation require exact Owner
approval after this fail-closed branch is reviewed and merged

Next action: Obtain exact Owner approval before marking PR #85 ready or merging
it. Cloudflare provider actions remain a separate later approval; do not change
Cloudflare state.
