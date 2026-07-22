# WEB-001 — Public website, free tools and growth foundations

Task ID: WEB-001\
Objective: Execute `TALLYO_PUBLIC_WEBSITE_APP_GROWTH_MASTER_PROMPT.md` through
focused website, free-tool, helper, growth, app-integration and Cloudflare
readiness milestones without public launch or protected-provider changes.\
Priority: High\
Status: In Progress\
Phase: PR 7 — Cloudflare Pages and custom-domain repository readiness\
Owner role: Master Orchestrator\
Assigned specialists: Product, Frontend, QA, Documentation, Security and Legal
responsibilities performed sequentially\
Risk level: Medium for repository-only website implementation; public launch,
legal publication, tracking activation, production domain/provider changes and
any live financial action remain high-risk Owner-only boundaries\
Affected files: `deployment/cloudflare/`; `scripts/build-app-pages.mjs`;
`.gitignore`; `website/README.md`; focused deployment tests;
`.github/workflows/security-checks.yml`; and this task record\
Files locked: The listed deployment-readiness files and this task record during
PR 7\
Lock acquired: 2026-07-22 on branch `codex/tallyo-cloudflare-readiness`\
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
Branch: `codex/tallyo-cloudflare-readiness`\
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
Implementation commit `2076fe4fbe468db235b8ee956c57af699cfafb96` and its
evidence follow-up are published in PR #76. The PR is ready, mergeable and clean;
required `verify` run `29913992436` passed against final head
`e296e254fd48e95b87f03bb8fecfda2f396e3808`. PR 2 builds 25 routes plus a real
404: a complete fictional-data product tour covering 11 supported workflows,
nine step-by-step help guides, six deliberately selected industry landing pages,
expanded factual FAQs and a planning-only 20-topic SEO map. Shared components
generate help and industry routes. HowTo and BreadcrumbList structured data match
visible content. A 1200×630, 35,612-byte WebP social card was generated with the
approved Tallyo palette and exact positioning line; it contains no price, rating,
provider logo or real data. Focused tests validate every route, product scene,
guide, schema, industry boundary, social asset and content-map entry. Browser QA
passed at 320, 390, 768, 1024 and 1280 px with no horizontal overflow. The mobile
menu remains active at 1024 px so navigation does not disappear between
breakpoints; open, Escape, focus return and scroll locking passed. Product-tour
and help-guide mobile views were visually inspected, and the browser console had
no errors. PR #77 contains that milestone, is ready, mergeable and clean, and
workflow-dispatch verification run `29915122978` passed against head
`da25f69dc5382e1975cd236105c3b30eb79f6719`. The PR is stacked on #76. PR 3 is
deferred before implementation because invoice/quote subtotal, discount,
tax/VAT, shipping, rounding and total calculations plus legally sensitive
document content require Sol High review. Unrelated Medium work continued with
PR 4. The deterministic Tallyo Helper uses an 18-entry reviewed public JSON
knowledge base, browser-local matching, explicit sensitive/private/advice/internal
boundaries, safe DOM rendering, useful public links, no-answer fallback, reset,
keyboard submission, screen-reader labels and a disabled provider-neutral future
AI adapter. It performs no network request or browser persistence and has no
account, Supabase, Stripe, Resend or AI-provider access. Focused tests validate
all answers, links, boundaries, fallback, CSP hash, disabled adapter and asset
budgets. Browser interaction QA passed suggestion, typed fallback, secret
omission, Enter submission, reset and responsive layouts at 320, 390, 768, 1024
and 1280 px with no console errors or external scripts/styles. PR #78 contains
that milestone, is ready, mergeable and clean, and workflow-dispatch verification
run `29915837793` passed against head
`ce107fa0056912e70bd250c2d5e0425445f5552e`. The PR is stacked on #77. PR 5 adds
an authoritative 29-event dictionary covering current disabled website events
and explicitly future-only application activation events. The provider-neutral
API is disabled by default, accepts only enumerated events/properties/values,
requires production plus granted analytics consent before a provider can run,
and swallows provider failures. Current provider and GA4/GTM/Ads identifiers are
empty. Consent defaults to necessary only. UTM values are recognised in page
memory only and never enter account links. Campaign, landing-page, negative-keyword,
testing, editorial and storage/consent readiness are documented without enabling
ads or tracking. Focused tests prove unknown events, free text, unapproved values,
denied consent, disabled state and provider errors cannot send; generated browser
policy equals the authoritative source; no transport, cookie, storage or provider
endpoint exists. Production/preview crawl tests pass. Browser QA confirmed one
local growth module, no provider scripts, no cookie banner, no placeholder account
links, canonical UTM exclusion, no UTM propagation into account links, continuing
Helper operation and no console errors.\
PR #79 contains that milestone, is ready, mergeable and clean, and
workflow-dispatch verification run `29916487362` passed against head
`2bfb8057e519c36f896ee08635f09bebca85decc`. The PR is stacked on #78. PR 6
adds an isolated, browser-local Help & install panel for signed-in users, with
platform-specific installation guidance, explicit user-initiated install
prompts, focus return, Escape/overlay close, an accurate online-data notice and
optional public Website, Help and Security links that remain hidden until a
validated HTTPS (or localhost development) base URL is configured. No production
URL, provider setting, Auth state, private business record, payment code,
analytics transport, storage or network request is added. The helper is included
in the network-first app shell and has a safe no-feature fallback if it is
unavailable. The app/worker build marker is `2026.07.22.1`; this is repository
evidence only and has not been published. All 19 app regression harnesses and the
complete 26-route public-website build/test suite pass. The local signed-out app
rendered build `2026.07.22.1` without horizontal overflow; only the expected
localhost Turnstile site-key warning appeared. Signed-in panel acceptance remains
for a later preview stage because no credentials or private session data were
requested or inspected.\
PR #80 contains that milestone as a draft, is mergeable, and manual required
verification run `29918114759` passed against head
`a5742e7c7804574484d75da6a5d89c8e8e73831a`. The PR is stacked on #79 and has
not been marked ready, merged or deployed.\
PR 7 adds machine-readable settings for two separate Cloudflare Pages projects,
a strict allowlist app build, generated browser-only configuration, app response
headers/SPA fallback, preview/rollback instructions and a domain migration map.
The app build requires explicit public deployment variables, rejects recognised
secret/service-role values without echoing them and excludes repository/docs/test
files from output. Both deployments remain noindex for preview. HSTS is
deliberately absent until accepted custom-domain HTTPS. The domain map classifies
Supabase Auth URLs, MFA origins, Stripe returns/links, Resend/Auth links,
Turnstile hostname configuration, DNS and retirement of GitHub Pages as deferred
High-risk actions. No provider project, variable, secret, DNS record or live
deployment was created or changed. The synthetic app Pages package rendered build
`2026.07.22.1` at 320, 390, 768 and 1280 px without horizontal overflow or
console errors. The deployment harness, PWA/workflow harnesses and complete
26-route website build/test suite pass.\
PR #81 contains that milestone as a draft, and manual required verification run
`29918689461` passed against head
`d94970b0b317d29c9af88f40700b13a6b69793d6`. The PR is stacked on #80 and has
not been marked ready, merged or deployed.\
Pull requests: #76 — https://github.com/EdsonLRO/InvoicePro/pull/76; #77 —
https://github.com/EdsonLRO/InvoicePro/pull/77; #78 —
https://github.com/EdsonLRO/InvoicePro/pull/78; #79 —
https://github.com/EdsonLRO/InvoicePro/pull/79; #80 —
https://github.com/EdsonLRO/InvoicePro/pull/80; #81 —
https://github.com/EdsonLRO/InvoicePro/pull/81\
Blocked reason: PR #76 merge remains Owner-gated because the milestone contains
legally material public marketing/security claims and begins the public-website
release sequence. This does not block stacked repository implementation.\
Next action: Prepare PR 8 preview-acceptance checklists and the exact Owner-only
action sequence without creating provider projects. First-use account-data
guidance, the free document generator, production configuration and final release
remain deferred for explicit Sol High review.
