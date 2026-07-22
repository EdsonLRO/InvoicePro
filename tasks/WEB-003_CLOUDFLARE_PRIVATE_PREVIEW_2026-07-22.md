# WEB-003 — Cloudflare access-controlled preview

Task ID: WEB-003

Title: Cloudflare fail-closed private-preview preparation

Objective: Prepare website and app builds so Cloudflare projects can be created
without publishing content before access controls are verified.

Risk level: High because later stages change provider authorization, hosting and
production-adjacent configuration; this repository-only guard is reversible.

Phase: Main and wildcard Access verified; stopped before variables and build retries

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

Security boundary: The approved provider mutation includes Zero Trust Free
activation performed privately by the Owner and four Owner-policy Access
applications covering both projects' main and wildcard `pages.dev` hostnames.
No deployment variable, secret, Auth change, DNS, successful deployment, public
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

Owner permission required: GitHub authorization, project creation and Owner-only
Access configuration were approved and completed. Fresh exact approval remains
required before setting any deployment variable or retrying builds

Approval boundary: Project creation is not approval for Access, variables,
successful deployment, Auth/MFA origins, Turnstile, Stripe/email links, custom
domains, DNS, legal publication or final release

Implementation result: The shared repository guard is merged. Cloudflare
projects `tallyo-website` and `tallyo-app` were created with the reviewed build
settings; both initial builds stopped at that guard and neither project has a
production deployment. Owner-policy Access applications protect the main and
wildcard hostnames for both projects. Unauthenticated requests to all four
destinations redirected to Cloudflare Access sign-in; no identity value is
recorded.

Review result: PR #85 required GitHub Security `verify` run `29927989825`,
post-merge Security run `29928624196` and post-merge GitHub Pages run
`29928621947` passed. Provider readback confirmed the exact project settings,
empty deployment-variable sections and no production deployment. PR #86 merged
the provider-project evidence as `ab3f7b81b865d23e2dd8f6dbf61d6253e9844b17`.

Evidence: Cloudflare documentation current on 2026-07-22 states Pages URLs are
public by default and documents separate Access policies for the main and
wildcard preview hostnames. The Owner authorized the GitHub app for the selected
repository only. Provider readback confirmed both named projects, their exact
build/root/output settings, both guard failures and no production deployment.
Both project settings subsequently reported wildcard previews restricted by an
Access policy. Main-host applications were duplicated from those Owner-policy
configurations without re-entering an identity. All four destinations redirected
unauthenticated requests to Access sign-in. No identity, private account
identifier or billing detail is recorded here.

Focused validation passed: all 26 website routes plus 404, fail-closed website
and app build behavior including preservation of existing output, Cloudflare
Pages packaging, preview acceptance state, security workflow policy,
`git diff --check` and a scoped secret-pattern scan.

Branch: `codex/cloudflare-access-partial-evidence`

Commit: This evidence branch records the completed Access action; the guard release
was merged as `ce5bccfb80b0cb4cc67e48e54aeb367c4658e47a` in PR #85

Blocked reason: Deployment variables and build retries remain outside the
completed Access approval

Next action: Review and merge the completed Access evidence, then obtain exact
Owner approval for the browser-publishable deployment variables, the Access
confirmation variable and a bounded retry of both builds.
