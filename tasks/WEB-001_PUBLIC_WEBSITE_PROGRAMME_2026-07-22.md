# WEB-001 — Public website, free tools and growth foundations

Task ID: WEB-001\
Objective: Execute `TALLYO_PUBLIC_WEBSITE_APP_GROWTH_MASTER_PROMPT.md` through
focused website, free-tool, helper, growth, app-integration and Cloudflare
readiness milestones without public launch or protected-provider changes.\
Priority: High\
Status: In Progress\
Phase: PR 1 ready; PR 2 product presentation and content system next\
Owner role: Master Orchestrator\
Assigned specialists: Product, Frontend, QA, Documentation, Security and Legal
responsibilities performed sequentially\
Risk level: Medium for repository-only website implementation; public launch,
legal publication, tracking activation, production domain/provider changes and
any live financial action remain high-risk Owner-only boundaries\
Affected files: `website/`; `.github/workflows/security-checks.yml`; the master
specification; focused website tests; this task record; milestone-only
authoritative documentation\
Files locked: `website/`, `.github/workflows/security-checks.yml`,
`TALLYO_PUBLIC_WEBSITE_APP_GROWTH_MASTER_PROMPT.md`, `tests/website-*`, and this
task record during PR 1\
Lock acquired: 2026-07-22 on branch `codex/tallyo-website-foundation`\
Dependencies: Existing app remains unchanged and deployed at the current GitHub
Pages URL; the final website and app domains require later Owner-approved
provider and DNS work.\
Security boundary: Public website has no Supabase client, Auth access, account
data, customer data, secrets, tracking, third-party scripts or contact backend.
Preview output is `noindex` by default and generated output is not committed.\
Legal materiality: UK public marketing, security claims and pricing presentation
are triggered. Intended audience is UK businesses, sole traders and visitors;
no consumer subscription or regulated workflow is offered in this milestone.\
Legal disposition: Approved with conditions for repository and private-preview
preparation only. Conditions: use only verified product facts; show no price,
trial, limit or Teams availability; publish no legal documents, private identity
or support address; make no compliance, guarantee or certification claim; keep
tracking inactive; and obtain a fresh Owner/legal release decision before public
launch. External professional review remains required for final legal documents
and any paid subscription terms.\
Acceptance criteria: Independent `website/` build; responsive header/footer;
Home, Features, neutral Pricing, Security, Help, FAQ, About, foundation free-tool
routes and 404; central metadata/configuration; preview noindex; sitemap/robots;
structured data; strict public-site headers; redirects; focused automated tests.\
Required tests: Website build, route/link/metadata/structured-data/security-header
checks, prohibited-claim/fake-proof checks, responsive browser QA at 320, 390,
tablet and 1280 widths, `git diff --check`, and focused secret/private-data scan.\
Required documentation: This compact active task record; milestone facts only in
authoritative status documents when their state materially changes.\
Approval boundary: Do not activate tracking, publish legal pages, merge a change
that would publicly launch the site, create Cloudflare projects, change provider
configuration/DNS, or perform production cutover without the required approval.\
Branch: `codex/tallyo-website-foundation`\
Evidence: Dependency-free static generator builds nine routes plus a real 404.
Preview and production-mode crawl directives passed; preview is the default.
Automated route, link, unique metadata, canonical, structured-data, CTA,
prohibited-claim, fake-proof, pricing, security-header, asset and external-script
checks passed. Browser QA passed at 320, 390, 768 and 1280 px with no horizontal
overflow, correct responsive navigation, mobile focus transfer, Escape close and
focus return. Pricing showed no amount or trial, Teams remained unavailable, FAQ
schema matched 11 visible questions, and the browser console had no errors.
Preview assets measured 15,900-byte CSS, 1,591-byte JavaScript and zero external
origins. The committed master specification exactly matches the Owner-supplied
file (SHA-256 `FD8AAA926F14D9DA312951238CF6B5B9B60533D736B3F2385F9BBEDBF4F94A8B`).
Implementation commit `2076fe4fbe468db235b8ee956c57af699cfafb96` is
published in draft PR #76; required `verify` run `29913823154` passed against
that commit.\
Pull request: #76 — https://github.com/EdsonLRO/InvoicePro/pull/76\
Blocked reason: PR #76 merge remains Owner-gated because the milestone contains
legally material public marketing/security claims and begins the public-website
release sequence. This does not block stacked repository implementation.\
Next action: Record the final PR 1 evidence, mark it ready without merging, then
branch PR 2 from the verified PR 1 head and continue safe implementation.
