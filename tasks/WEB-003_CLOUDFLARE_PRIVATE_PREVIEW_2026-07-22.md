# WEB-003 — Cloudflare access-controlled preview

Task ID: WEB-003

Title: Cloudflare fail-closed private-preview preparation

Objective: Prepare website and app builds so Cloudflare projects can be created
without publishing content before access controls are verified.

Risk level: High because later stages change provider authorization, hosting and
production-adjacent configuration; this repository-only guard is reversible.

Phase: Provider projects created fail-closed; stopped before Access configuration

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

Dependencies: PR #85 merged at
`ce5bccfb80b0cb4cc67e48e54aeb367c4658e47a`; current GitHub Pages app remains
the rollback; Cloudflare GitHub access is limited to `EdsonLRO/InvoicePro`

Acceptance criteria: Both builds fail before writing output when `CF_PAGES=1`
unless `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`; repository records state that
`noindex` is not access control; Access, variables and successful deployments
remain pending

Required tests: Website test suite, Cloudflare Pages readiness harness, preview
acceptance harness, workflow policy, secret scan and `git diff --check`

Security boundary: The approved provider mutation was limited to the scoped
GitHub connection and creation of two free projects. No Access policy,
deployment variable, secret, Auth change, DNS, successful deployment, public
release, tracking or real data

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

Owner permission required: GitHub authorization and project creation were
exactly approved and completed. Fresh exact approval remains required before
creating Access policies, setting any deployment variable or retrying builds

Approval boundary: Project creation is not approval for Access, variables,
successful deployment, Auth/MFA origins, Turnstile, Stripe/email links, custom
domains, DNS, legal publication or final release

Implementation result: The shared repository guard is merged. Cloudflare
projects `tallyo-website` and `tallyo-app` were created with the reviewed build
settings; both initial builds stopped at that guard and neither project has a
production deployment.

Review result: PR #85 required GitHub Security `verify` run `29927989825`,
post-merge Security run `29928624196` and post-merge GitHub Pages run
`29928621947` passed. Provider readback confirmed the exact project settings,
empty deployment-variable sections and no production deployment.

Evidence: Cloudflare documentation current on 2026-07-22 states Pages URLs are
public by default and documents separate Access policies for the main and
wildcard preview hostnames. The Owner authorized the GitHub app for the selected
repository only. Provider readback confirmed both named projects, their exact
build/root/output settings, both guard failures and no production deployment.
No private account identifier is recorded here.

Focused validation passed: all 26 website routes plus 404, fail-closed website
and app build behavior including preservation of existing output, Cloudflare
Pages packaging, preview acceptance state, security workflow policy,
`git diff --check` and a scoped secret-pattern scan.

Branch: `codex/cloudflare-preview-projects-evidence`

Commit: This evidence branch records the provider action; the guard release was
merged as `ce5bccfb80b0cb4cc67e48e54aeb367c4658e47a` in PR #85

Blocked reason: Cloudflare Access policies and every deployment variable remain
outside the completed approval and require the next exact Owner approval

Next action: Review and merge the evidence PR, then obtain exact Owner approval
for the Access policies before entering variables or retrying either build.
