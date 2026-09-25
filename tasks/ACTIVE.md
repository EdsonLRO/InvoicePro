# Active programme: COMM-001 commercial launch integration

## BILLING-TRIAL-001 — Seven-day Tallyo Pro trial

Task ID: BILLING-TRIAL-001
Title: Add one seven-day full-access trial before the monthly subscription
Priority: High
Status: Released
Phase: Complete
Owner role: Product owner
Risk level: High because this changes Stripe subscriptions, entitlements, renewal and cancellation expectations
Branch: `codex/tallyo-trial`
Scope: keep the Free Invoice Maker unchanged; add one card-required seven-day trial per account for the £8 monthly Tallyo Pro plan; grant full access while Stripe reports `trialing`; convert automatically to the monthly subscription unless cancelled; preserve online cancellation and account data; reconcile Stripe's three-day trial-ending event; add fail-closed server and browser release gates; update authoritative decisions and architecture
Files locked: `supabase/functions/create-billing-checkout/index.ts`, `supabase/functions/stripe-billing-webhook/index.ts`, the additive trial migration, `index.html`, `config.js`, `scripts/build-app-pages.mjs`, focused Billing tests, `docs/legal/TRIAL_SUBSCRIPTION_REVIEW.md`, `docs/architecture/STRIPE_BILLING.md`, `DECISIONS.md`, `ROADMAP.md`, `APP_STATUS.md`, `SUPABASE_HANDOFF.md`, `RELEASE_READINESS.md`, `tasks/ACTIVE.md`
Legal disposition: the Owner explicitly accepted the remaining legal and commercial risk, elected to proceed without external professional review and approved the bounded live release; see `docs/legal/TRIAL_SUBSCRIPTION_REVIEW.md` and `docs/legal/TRIAL_SUBSCRIPTION_OWNER_RISK_ACCEPTANCE_2026-09-25.md`
Security boundary: browser cannot select duration; monthly price remains server-allowlisted; one-trial usage is recorded atomically; signed raw-body webhook, provider-mode isolation, RLS, grants, ownership, idempotency, event ordering and service-role-only writes must remain intact
Excluded: creating a real live trial or charge during release validation, sending a synthetic customer reminder, consumer/international expansion, refunds, bank-debit trial collection and unrelated work
Acceptance: monthly Checkout uses a fixed seven-day card-required trial only when the server gate is enabled; annual Checkout remains directly paid; an account cannot receive a second created trial; `trialing` grants full access through the trial end; signed `trial_will_end` is recorded; UI wording is fail-closed behind separate app and website build gates; the free maker is unchanged; relevant security, function, migration, client and build tests pass
Validation: focused trial, Billing foundation/client, subscription guidance, app/PWA, full Node security-harness and complete website suites passed; both changed Edge Functions passed frozen-lock Deno type-check and formatting; app build `2026.09.25.1` passed fail-closed and approved-live builds; the production rollback-only SQL probe passed; Stripe sandbox acceptance covered reminder, conversion and cancellation; live function, migration, webhook, gate and public HTTP readbacks passed; no real trial, charge or customer reminder was created during validation
Approval boundary: completed under the Owner's explicit live-release approval; later changes to price, duration, reminder timing, territory, cancellation behavior, payment method or refund handling require a new approval
Pull request: #190 (`codex/tallyo-trial`), merged as `acbfc8616f687adcfca12c0e1e27508e6d0bd92f`
Next action: monitor trial lifecycle and reminder delivery through privacy-minimised provider/application evidence

## HELPER-CONVERSATION-001 — Session-based public Helper conversation

Task ID: HELPER-CONVERSATION-001
Title: Replace the one-question lookup flow with a bounded multi-turn AI chat
Priority: Medium
Status: Implementation Complete
Phase: Review
Owner role: Product owner
Risk level: Medium implementation with the existing high-risk public-AI release boundary unchanged
Branch: `codex/helper-friendly-conversation`
Scope: route every safe enabled-Helper turn through OpenAI; hold up to six recent exchanges only in page memory; provide the compact 44-topic reviewed catalogue on every provider turn so meaning is resolved across the full Tallyo knowledge set rather than browser keyword selection; let follow-up wording, greetings and spelling mistakes share one conversational path; allow general conversational reasoning for intent, context and plain-language explanation while keeping the reviewed catalogue as the sole source for Tallyo product claims and as the disabled/provider-failure fallback; update transparent public privacy wording and focused regression coverage
Files locked: `website/src/helper-core.mjs`, `website/src/helper.js`, `website/functions/lib/public-helper.mjs`, `website/src/layout.mjs`, `website/src/legal-content.mjs`, `website/content/helper-knowledge.json`, `website/content/helper-ai-adapter.md`, `website/content/storage-inventory.md`, `website/scripts/test.mjs`, `website/scripts/test-public-helper.mjs`, `tasks/ACTIVE.md`
Security and privacy boundary: preserve exact-origin and rate-limit controls, reviewed-only provider facts, strict output, `store: false`, no application prompt/answer logging, no persistent browser storage, no account/private-record access and no tools. Send at most six recent completed exchanges; validate roles, order, size and safety server-side; treat history as untrusted context rather than factual guidance.
Legal disposition: the same provider and product-question purpose remain, but recent-turn transmission changes the disclosed data flow. Repository implementation may proceed; production publication of the updated Privacy Notice and Helper wording remains an Owner release boundary.
Acceptance: “hi” receives a natural AI chat response in an enabled build; “how does recurrinng invoices work with tallyo” is understood; arbitrary short, incomplete, referential, misspelled or reaction-based follow-ups are resolved semantically from recent context rather than a fixed phrase list; a genuinely ambiguous message receives one conversational clarifying question; general conversational reasoning improves comprehension but does not become a source for Tallyo product claims; reset/reload/navigation clears the page-memory context; disabled and provider-failure paths retain useful local answers, including greetings and ordinary reactions such as “that sounds interesting”; safety boundaries and fail-closed behaviour remain intact; every reply keeps the short 1–1.6 second minimum cadence.
Validation: complete website suite passes for 26 routes plus 404. Mock-provider coverage proves exact questions and greetings use the AI path, all 44 reviewed topics reach the provider for semantic selection, recent history resolves “Can I pause it?” against recurring-invoice guidance, more than six exchanges and malformed/unsafe history are rejected, `store: false` and strict output remain, and provider/rate-limit failures stay bounded. Local browser verification confirms the typoed recurring-invoice question reaches the reviewed fallback after the intended pause and Clear conversation removes the page-memory exchange. No live OpenAI request or provider/configuration change was made.
Next action: update PR #189, then obtain one bundled approval for merge and normal website publication

## HELPER-GROUNDING-001 — Broader grounded public product answers

Task ID: HELPER-GROUNDING-001
Title: Let Tallyo Helper answer more current product questions without gaining account access
Priority: Medium
Status: Released and verified
Phase: Complete
Owner role: Product owner
Risk level: High release boundary because the public feature sends an unmatched visitor question to an existing paid OpenAI API path; implementation itself is a bounded website and same-origin Function refinement
Branch: `codex/helper-grounded-knowledge`
Scope: expand the reviewed public knowledge catalogue from 18 to 44 current product and workflow topics; select the most relevant reviewed entries locally before each provider request; allow friendly paraphrased or combined answers only from those entries; distinguish insufficient knowledge, rate limiting and temporary unavailability; keep a focused suggestion list; update the public Helper explanation and focused mock-provider evaluations
Privacy and security boundary: preserve the exact-origin gate, service-bound rate limiter, 240-character question limit, provider timeout, strict structured output, reviewed link allowlist, `store: false`, no application prompt/answer logging and no account, Supabase, Stripe, Resend, payment or other tools. Questions and answers are not added to analytics; the existing property-free answer-found/not-found events remain unchanged.
Legal review: UK public website users and business users remain the affected groups. The existing current-question data flow to OpenAI is unchanged; relevance selection reduces the reviewed context sent with a question and adds no new vendor, data category, retention promise, automated decision, account access or private-record processing. Public wording continues to identify OpenAI, intentional non-storage by Tallyo and the no-account-access boundary. Disposition: Approved with conditions for repository implementation; release requires the published Privacy Notice and provider/budget controls to remain unchanged and a reviewed PR. No external professional review is required for this bounded refinement.
Product accuracy: answers are grounded in released public behavior for quote acceptance and optional automatic invoice email, recurring invoices, opt-in reminders, deposits and balances, activity history, templates and branding, CSV customer import, percentage/fixed discounts, tax modes, installation, exports, subscription choices and account protection. Unreleased connected-card-payment wording still follows the existing commercial publication gate.
Validation: the complete website suite passes for 26 routes plus 404; Helper fail-closed and mock-provider tests cover exact local answers, relevant-context selection, insufficient knowledge, rate limiting, provider failure, boundaries, prompt injection, strict output and link validation; Analytics gates and Free Invoice Maker conversion/consent checks pass. PR #187 merged as `89a48e9394cde477c4c1828adc70f9a50ce1883e`; main Security and Pages workflows passed. Production website deployment `50ee8b48-da6b-44fb-bca7-8b1354924c81` serves asset revision `e5a2a6c426b9`; public Helper, Privacy, CSP, live asset markers and the unsupported-method 405 boundary passed. The normal workflow republished the unchanged app at deployment `535ded20-87ea-4057-8b29-ef57923a472d`, still build `2026.09.24.1`. No paid OpenAI request or live provider/configuration change was made.
Excluded: new OpenAI project/model/key, provider dashboard or budget change, real paid request, account or private-record access, tools, conversation memory, question/answer logging, Auth, database, migration, Supabase or Stripe change, email, payment, refund and unrelated website work
Approval boundary: completed. The Owner approved using the existing OpenAI key and then approved the reviewed PR merge and normal website publication. No additional paid request, provider or security change was used during release validation.
Rollback: website deployment `3f10a974-8349-4bb9-9116-08984abfcda6` and unchanged app deployment `35d6f8ba-8d01-432a-a57c-a65efc4e0c02`, both from source `7e2528b`; no backend rollback is required because this task changed no backend provider configuration, database or Edge Function.
Next action: routine production monitoring only; any model, key, budget, provider, privacy, account-access or tool expansion requires a new reviewed task and approval

## WEBSITE-NAV-001 — Refine the website navigation and footer

Task ID: WEBSITE-NAV-001
Title: Refine the installation link, homepage wording and footer layout
Priority: Low
Status: Released and publicly verified on 2026-09-24
Phase: Complete
Owner role: Product owner
Risk level: Low; public website layout, copy and static tests only
Branch: `codex/center-install-nav`
Scope: keep the installation icon and text link, move it into the centred desktop navigation immediately after Help and before the account actions, preserve the existing mobile installation shortcut and collapsed-menu order, align Create account directly below Log in in the collapsed menu and match its plain text styling without an underline, remove the persistent installation-button treatment, remove the remaining homepage hero dash, preserve the standard section gap before the footer, contain shared blue CTA shadows within their rounded silhouette, and reorganise the footer into evenly spaced Account, Product, Learn and Legal columns followed by the Tallyo brand block
Excluded: authenticated app source/runtime, installation behavior, website content beyond the exact homepage and footer edits above, database, migration, Edge Function, Auth, provider configuration, secret, email, payment, refund and unrelated change
Validation: complete 26-route-plus-404 website suite, Helper/Analytics/Free Invoice Maker release gates, desktop and condensed navigation review, desktop footer and shared blue CTA visual review, and navigation browser geometry checks passed; the original Features-to-Help position is preserved, the Help-to-Install and Install-to-Log-in gaps match in both normal and condensed states, Create account shares the desktop links' exact height and vertical centre, the Free Invoice Maker keeps a measured 20px gap before the footer despite its trailing hidden dialog, blue CTA shadows no longer form a square bottom strip, the mobile page has no horizontal overflow, and the collapsed Create account action remains directly below Log in at 390px with matching computed font and colour and no underline
Release approval: On 2026-09-24 the Owner approved the reviewed app and website changes for production publication.
Release: PR #182 merged as `ef7d9122cb31d45c6b58065819938545bb33392e`; website deployment `131e7366-51c3-4314-a23a-b5241e56fc98`; asset revision `642f9f9f2588`; protected and bounded public checks passed
Rollback: website deployment `12413216-58b6-45c7-95dd-958686d49aeb`, retaining the app release while restoring the previous website presentation
Next action: routine bounded monitoring only

## UX-BRANDING-001 — Curated invoice templates and row styling

Task ID: UX-BRANDING-001
Title: Let each business choose a clear document template and optional alternating item rows
Priority: Medium
Status: Released and publicly verified on 2026-09-24
Phase: Complete
Owner role: Product owner
Risk level: High release boundary because two owner-scoped `company_settings` preferences require an additive production migration and the transactional email PDF function must render the same selected layout
Branch: `codex/invoice-template-styles`
Scope: retain the existing Tallyo layout as the default; add Basic, Modern and Professional document templates; add an on-by-default alternating-item-row preference; provide accessible template choices and a live Branding preview; apply the saved choices to invoice, quote and credit-note previews, browser-downloaded PDFs and emailed PDF attachments
Research basis: reviewed current Xero and QuickBooks template guidance and Adobe invoice-layout guidance; the bounded design follows the established pattern of curated layouts combined with logo, colour and selected presentation controls rather than a free-form document designer
Data boundary: add only `invoice_template` and `alternate_item_rows` to the existing owner-scoped `company_settings` row; keep current RLS, grants, Auth, tenant ownership and account export behavior unchanged
Compatibility boundary: existing businesses default to `tallyo` with alternating rows enabled; invalid or missing values fail safely to those defaults; no invoice totals, tax, payment, reminder, recurring, quote-acceptance or email-recipient behavior changes
Excluded: free-form template building, custom fonts, per-document template overrides, new vendors or dependencies, Auth/RLS/grant changes, payment/refund/Stripe behavior, secrets, real email and unrelated website work
Approval boundary: repository and local fictional-data implementation may proceed; stop before applying the migration, deploying `send-document-email`, merging or publishing the app
Validation: focused static contract, desktop/mobile browser interaction, four distinct generated PDF attachments, alternating-row on/off behavior, unknown-value fallback, email/quote-send regressions, Edge Function frozen-lock type check, isolated preview transport protections and diff hygiene passed; no live database, provider or email action was used
Release approval: On 2026-09-24 the Owner approved the reviewed app and website changes for production publication.
Release: PR #183 merged as `46bcc9ac2ca8ad3679dcb8fd1f5dc81e2f03fb88`; migration `20260924112357_invoice_template_preferences.sql` applied; `send-document-email` v60 retains JWT verification; app build `2026.09.24.1` and cache `tallyo-shell-2026-09-24-1` were publicly verified at deployment `5f462120-7bdb-46ee-b0b8-ba2da7df2821`; protected CI and bounded public checks passed
Rollback: restore app deployment `3b710daf-3ad4-4741-8393-95643fcef8a3` / build `2026.09.23.1` and `send-document-email` v59 source from `3db4db9`; leave the additive migration dormant
Next action: routine bounded monitoring only

## WEBSITE-CONTENT-002 — Plain-language workflows and invoice guide

Task ID: WEBSITE-CONTENT-002
Title: Explain Tallyo's workflows clearly, add a concise invoice guide and make installation easy to find
Priority: Medium
Status: Released and publicly verified on 2026-09-24
Phase: Complete
Owner role: Product owner
Risk level: Medium; public website content, SEO metadata and layout only
Branch: `codex/website-plain-language-invoice-guide`
Scope: replace compressed finance and product terminology across the non-legal public website; expand the horizontal quote-to-payment guide to Send quote → Quote accepted → Invoice created → Payment tracked → Follow-up stays clear; explain optional automatic invoice sending accurately; clarify recurring invoices, overdue invoices and reminders, deposits, part-payments, final payments and activity history; add a concise `/invoice-guide/` page linked from Home, Help, the Free Invoice Maker and the footer; refine page titles and descriptions around real search intent; add a visible site-wide Install Tallyo navigation action and an illustrated `/help/install-tallyo/` guide showing the exact desktop, Android and iPhone/iPad browser controls
Product boundary: accepted quotes are preserved and create one linked invoice; automatic invoice email remains optional and must be selected before the quote is sent; overdue reminders remain opt-in; payment records do not themselves move money; activity history remains an everyday product record rather than a certified audit log
Excluded: legal-page copy, authenticated application source/runtime, database, migration, Edge Function, Auth, provider configuration, secret, email, payment, refund, Stripe object and unrelated website work
Validation: complete website suite for 26 routes plus 404; public Helper fail-closed and mock-provider checks; Analytics activation-gate checks; Free Invoice Maker conversion and one-email consent checks; desktop, 390×844 and 320px visual review of the installation guide and persistent install action; desktop and 390×844 visual review of the invoice guide; desktop and mobile review of the five-step Features workflow; verified mobile horizontal card movement; no browser console errors; plain-language residue scan and diff hygiene passed
Approval boundary: completed under the Owner's final review and approval on 2026-09-24. PR #180 merged through the protected workflow and normal publication completed without another approval request. No legal page, authenticated app source/runtime, database, migration, Edge Function, Auth, provider configuration, secret, email, payment, refund, Stripe object or unrelated change was included.
Release: merge `87b3c9fa5f87fc8a0bec00ca8e2f0fe9be9fca9b`; website deployment `eafe8293-1b1e-4f3b-83cf-0a663dc102c1`; production asset revision `9e17660c8d45`; normal unchanged-app deployment `ae316695-55eb-4d4c-9323-74981b7ac674`
Rollback: restore website deployment `ee154bf5-929d-4621-90f9-e05391d66802` from main source `03aab6c`; backend and provider state remain unchanged
Next action: routine bounded monitoring only

## WEBSITE-REDESIGN-001 — Public website redesign and content consolidation

Task ID: WEBSITE-REDESIGN-001
Title: Redesign the public Tallyo website and give each route a clear purpose
Priority: Medium
Status: Released and publicly verified on 2026-09-23; PR #177 merged as `d85e2e6`
Phase: Complete
Owner role: Product owner
Risk level: Medium; public marketing, SEO and interaction changes only
Branch: `codex/tallyo-website-redesign-phase1`
Scope: approved visual redesign; simplified homepage; workflow-based Product Tour with current fictional-data app captures for Overview, invoice editing, quote acceptance, customer context, recurring schedules, overdue reminders, deposits/full payment, activity, branding, account security and mobile quote acceptance; clearer Features, Help, FAQ and Security boundaries; open section-based Free Invoice Maker with a responsive no-horizontal-scroll preview; persistent site-wide Tallyo Helper access through a compact question panel; Cookie settings moved from the page footer into the navigation menu; intent-specific free invoice and quote guidance; retirement and redirect of six thin industry landing pages; responsive and accessibility coverage
Approval boundary: completed under the Owner's final review and approval on 2026-09-23. PR #177 was marked ready, merged through the protected pull-request workflow and published by the normal Pages workflows. No app source/runtime, database, migration, Edge Function, Auth, provider configuration, secret, email, payment, refund, Stripe object, legal page or unrelated change was included.
Validation: complete website suite; public Helper fail-closed and mock-provider checks; Analytics release-gate checks; free-generator conversion and one-email consent checks; deterministic loopback-only screenshot capture with external requests blocked and all records visibly fictional; professional 1280×720 desktop and 390×844 customer-mobile framing; desktop visual inspection of Home, Features, Product Tour, Pricing, Security, Help, FAQ and the revised Free Invoice Maker; 390px Free Invoice Maker geometry and live-calculation check with fictional data; no mobile horizontal overflow; compact Helper open, answer, close, keyboard and mobile geometry checks; site-wide Helper and navigation Cookie-settings markup checks; shared 20px top-level section and card-gap coverage across desktop and mobile; equal-height pricing cards; centred desktop navigation; diff hygiene
Release: merge `d85e2e671fba129e91b24ce88b0460b78dd03ce1`; website deployment `ee4e8833-04ca-41de-8622-87d461b8e5d3`; normal unchanged-app deployment `187fdefa-28ab-4317-9427-fb5863df1099`
Rollback: restore website deployment `a7197370-ace3-4ffd-8861-06d1349ccdcb` from main source `13dfb04` if a later production issue is found; backend, app source/runtime and provider state remain unchanged
Next action: routine bounded monitoring only; future website content or design work should start as a separately scoped objective

## UX-EDITOR-002 — Invoice editor usability and exact discounts

Task ID: UX-EDITOR-002
Title: Improve the invoice editor without expanding product scope
Priority: Medium
Status: Owner-approved release through PR #176 on 2026-09-23
Phase: Release
Owner role: Product owner
Risk level: High release boundary because document totals and production publication are involved; implementation remains a focused frontend change with regression coverage
Branch: `codex/invoice-editor-usability-fixes`
Scope: expand/collapse all editor sections; create and select a Product or service from the line-item selector; percentage or fixed-amount document discount; explicit inclusive/exclusive tax effect; larger item headings; contrast-safe light-brand PDF headings/totals; aligned Discount and Shipping controls; app build/cache `2026.09.23.1`
Compatibility boundary: the existing database percentage field remains unchanged. A fixed amount is converted to its precise equivalent percentage when persisted so the current document total is preserved without a migration. Existing invoice/quote/payment, Auth, RLS, entitlement and provider flows remain unchanged.
Approval boundary: the Owner reviewed the fictional local preview and approved commit, push, merge and publication. No database, migration, Edge Function, RLS, Auth, provider configuration, secret, email, payment, refund, Stripe object, website source or unrelated change is authorised or included.
Validation: complete repository release suite; focused editor static and desktop/mobile/keyboard browser suites; 320–1440 px layouts; exact fixed-discount and tax-mode calculations; quick Product or service creation; multi-page PDF generation; rendered light-brand PDF inspection; no external browser requests; diff hygiene and sensitive-value review
Rollback: restore Cloudflare deployment `c0441aea-ceec-4725-89a3-7c9e3ab3e635` / build `2026.09.20.4`; backend and provider state do not change
Next action: merge PR #176 after required checks, publish build `2026.09.23.1`, and run bounded public shell/build-report/service-worker/PWA checks

## UX-CUSTOMERS-001 — Simple customer CSV import

Task ID: UX-CUSTOMERS-001
Title: Import a small customer list from CSV with preview and skipped-row feedback
Priority: Medium
Status: Released and Owner-verified on 2026-09-21; PR #174 merged as `7d5566d`
Phase: Complete
Owner role: Product owner
Assigned specialists: Frontend, Backend/Supabase, Security, Privacy and QA performed sequentially by Codex
Model/work mode: Terra for implementation and QA; Sol-level review for private-data, tenant-isolation and release boundaries
Risk level: High review boundary because customer contact data is private, although the implementation reuses the existing owner-scoped browser insert and makes no RLS or backend change
Affected files: `index.html`, `customer-csv-import.js`, `app-user-messages.js`, app build/cache allowlists, focused tests, CI registration and this task record
Dependencies: released customer address book, existing `customers` RLS, existing paid/grace write-entitlement enforcement and existing Privacy Notice/Data Processing Terms
Security boundary: the selected file is parsed locally; only confirmed valid rows are sent to the existing `customers` insert; owner-scoped RLS and current entitlement policies remain authoritative; no service role, new grant, migration, Edge Function, storage bucket, vendor or background job is added
Legal materiality: Triggered because customer names and contact details may be personal data. Initial jurisdiction remains the approved UK-business scope. The Tallyo business user remains controller for imported customer/contact data and Tallyo remains processor under the existing terms. The importer must state that the user should import only details they are allowed to store, minimise supported fields, ignore unknown columns and preserve existing rights/export/deletion behaviour.
Authoritative review: ICO data-minimisation guidance and current Supabase bulk-insert documentation checked 2026-09-20. The reviewed design is limited to the seven existing customer fields and uses a single array insert followed by `.select()`.
Legal disposition: Approved with conditions for repository implementation. Conditions are local preview, explicit confirmation, data-minimised supported fields, no overwrite/upsert, no marketing reuse and no new vendor or retention promise. External professional review is not required for this bounded feature.
Acceptance criteria: upload a CSV; recognise the documented headers and reasonable aliases; preview valid rows; identify skipped rows with row numbers; skip existing/in-file duplicate emails; import valid rows in one owner-scoped request; keep existing customers unchanged; remain usable on mobile and by keyboard; show non-technical errors
Required tests: quoted CSV/BOM/CRLF/newline parsing; header/alias validation; invalid/missing values; duplicate handling; 1 MB/500-row bounds; no network/storage use in parser; app wiring; build/service-worker publication; existing customer validation, public-build, PWA and tenant-boundary regression
Required documentation: this active task record; update current product/release authorities only after Owner-approved release
Approval boundary: completed under explicit Owner approval. PR #174 was marked ready, merged and published as app build `2026.09.20.4`. No excluded backend, provider, communication, payment or website change was made.
Lock state: released 2026-09-21 after production validation
Branch: `codex/customer-csv-import`
Commit: feature `ffba867e24a3d0cb8dbf2fb61a85711c34062f09`; merge `7d5566d53ae9023fff4b291db2afef5da3d46602`
Evidence: the Owner confirmed the local import flow works. Parser, static integration, mobile/desktop browser, customer validation, public integration, PWA, Cloudflare Pages readiness, tenant-isolation, security-workflow and redesigned-customer regression checks passed. The browser preview made no external requests and used fictional data only. Main Security checks `35580335856` and Pages workflow `35580334221` passed. Cloudflare deployment `c0441aea-ceec-4725-89a3-7c9e3ab3e635` serves build `2026.09.20.4`; the public shell, 20-asset build report, service-worker cache and CSV helper passed bounded read-only checks.
Blocked reason: none
Next action: routine bounded monitoring only; retained app rollback is build `2026.09.20.3` at deployment `cb1cd9a0-8ca1-416c-b987-c1cb617b30eb`

## UX-QUOTE-005 — Accepted quote invoice follow-up

Task ID: UX-QUOTE-005
Title: Make the generated invoice actionable and optionally email it after quote acceptance
Priority: High
Status: Released and Owner-verified on 2026-09-20; PR #172 merged as `86d3581`
Phase: Controlled quote follow-up
Owner role: Product owner
Risk level: High because a signed-out acceptance may trigger a transactional email and service-role status update
Branch: `codex/quote-acceptance-followup`, from merged PR #171 (`e0c8059`)
Scope: add a default-off automatic-send choice and due-period selector to the authenticated quote-email dialog; store the choice on the quote; claim at most one post-acceptance attempt; set the linked invoice due date; send only to the saved customer snapshot address without a payment link; mark Sent only after provider acceptance; show Draft follow-up/failure in Needs your attention; add focused runtime and contract coverage; prepare app build `2026.09.20.3`
Security and privacy boundary: the public request cannot choose an email address, payment option or due period. The authenticated email function stores the exact recipient reviewed by the owner, and the public function can only use that stored value. Existing quote-token, origin, response, tenant and rate-limit controls remain. No Analytics or marketing data is added.
Failure boundary: quote acceptance and linked Draft creation commit before delivery. A missing/invalid customer email or provider failure keeps the invoice Draft and records the quote attempt as failed for manual review. No automatic retry loop is added.
Approval boundary: completed under exact Owner approval. Only migration `20260920110017`, `quote-public`, `send-document-email` and app build `2026.09.20.3` were released. Codex sent no email during bounded release validation, and no payment, refund, Stripe object, secret, Auth setting, provider configuration, website source or unrelated change occurred.
Release: migration `20260920110017_quote_acceptance_followup.sql` is applied; `quote-public` v2 retains JWT verification disabled; `send-document-email` v59 retains JWT verification enabled; app build `2026.09.20.3` and service-worker cache `tallyo-shell-2026-09-20-3` are active at Cloudflare deployment `2b9d901a-7567-432d-8d34-6ba3eb84273f`.
Validation: the full Node application/security harness set, focused automatic-delivery runtime tests, public website suite, frozen-lock checks, PR security checks and disposable PostgreSQL probes passed. Production migration/function inventories, fail-closed empty probes, public shell, quote route, service worker and 19-asset build report passed. The Owner confirmed the fictional automatic-delivery flow works.
Next action: routine bounded monitoring only; rollback remains build `2026.09.20.2` at deployment `08a69220-3035-43c4-b68f-eb03b7ed2f2e` plus `quote-public` v1 and `send-document-email` v58 sources from `e0c8059`.

## UX-QUOTE-004 — Include quote response action in sent quote emails

Task ID: UX-QUOTE-004
Title: Prepare and include the secure customer-response link when emailing a quote
Priority: High
Status: Released on 2026-09-20; PR #171 merged as `e0c8059`
Phase: Controlled email integration
Owner role: Product owner
Risk level: High because the transactional email function creates a signed-out quote token and issues a draft quote
Branch: `codex/quote-email-acceptance-link`, from released merge `c10c69d`
Scope: reuse the released quote-token model inside `send-document-email`; include one clear response button plus a plain-text URL; explain the behavior in the sender dialog; retain manual create/revoke controls; update build/cache markers; add focused regression coverage
Security boundary: the raw 256-bit token appears only in the customer URL returned to the email renderer and authenticated sender; only its SHA-256 hash is stored. Owner and document ownership checks remain in the JWT-protected email function. The response omits the hash, and a conditional post-send update cannot overwrite an accepted or declined quote.
Email boundary: this changes only a user-initiated transactional quote email. It does not send a test or live email during preparation, add marketing, reuse unrelated addresses, or alter Resend/provider configuration.
Validation: focused token/database/email/UI harness passes; quote runtime, public UI, payment-email, email-status, document-status, PWA and app-public harnesses pass; mobile/keyboard customer quote browser flow passes with no external requests; `send-document-email` passes frozen-lock Deno type-check; full Node security suite and website suite pass, with sandbox-only child-process/pipe restrictions rerun successfully outside the sandbox.
Approval boundary: completed under exact Owner approval. App build `2026.09.20.2` and `send-document-email` v58 were released without a migration, database, Auth, secret, payment, refund, Stripe object, other Edge Function, website or unrelated change.
Release: sent quote emails create the secure response link before delivery and include the clear customer response action in HTML and plain text. Manual replacement/revocation controls and concurrent-response protection remain.
Rollback: the later UX-QUOTE-005 release supersedes this build; the complete current rollback is recorded above and in `RELEASE_READINESS.md`.
Next action: complete; maintain regression coverage as part of the released quote workflow.

## UX-QUOTE-003 — Disabled quote acceptance UI slice

Task ID: UX-QUOTE-003
Title: Add the default-off customer quote page and minimal owner controls
Priority: High
Status: Released as part of PR #167 (`07180f5`) and app build `2026.09.19.6`
Phase: Controlled UI integration
Owner role: Product owner
Risk level: High because the UI exposes the signed-out token boundary prepared in `UX-QUOTE-002`
Branch: `codex/quote-acceptance-ui`, stacked on runtime commit `7f3d20c`
Scope: static `/quote/` customer page; gated owner link controls; Cloudflare build/header/redirect integration; customer-route service-worker exclusion; account-export token-hash redaction; focused static and browser tests; CI registration and this task record
Product boundary: customer actions are view, accept, decline and view linked invoice. Acceptance captures the entered name, uses the server timestamp and displays the automatically created invoice. Owner controls create/copy or revoke a link and open the linked invoice; they do not send an email.
Security boundary: the raw token remains in the URL fragment and request body only, is never logged or persisted by browser code, and is omitted from account exports. The public page has no signed-in app shell, Analytics, third-party script or service-worker cache/fallback. Owner actions still require the reviewed authenticated function.
Privacy boundary: no IP address, fingerprint, decline reason, marketing data, payment data or Analytics event is added. The public shell contains no customer data; all text is inserted with DOM `textContent`.
Release gate: production explicitly enables the two reviewed quote-acceptance settings; source remains fail-closed and the Pages build rejects an enabled feature without the separate public-release approval setting.
Validation: the focused source harness, Cloudflare fail-closed/approved build permutations, all direct Node CI harnesses, website suite, existing Deno runtime tests and both quote-function frozen-lock checks pass. Headless Chrome at 390 px passes keyboard validation, accept, linked invoice, decline, horizontal overflow and zero outside requests; the fictional-data capture was also visually inspected. The sandboxed Deno runner hit a Windows IPC-handle panic, then the same tests passed outside the sandbox; this is tooling evidence, not an application failure.
Approval boundary: completed under exact Owner approval in PR #167. No email, payment, refund, Stripe object, secret, Auth setting or unrelated provider change occurred.
Next action: complete; the later PRs #171 and #172 added the released email-link and optional invoice-delivery follow-ups.

## UX-QUOTE-002 — Quote acceptance runtime foundation

Task ID: UX-QUOTE-002
Title: Add the protected quote-link schema and narrow server runtime
Priority: High
Status: Released as part of PR #167 (`07180f5`); migration `20260919195917` is applied and both functions are active
Phase: Controlled runtime foundation
Owner role: Product owner
Assigned specialists: Backend/Supabase, Security, Privacy and QA performed sequentially by Codex
Risk level: High because this adds a signed-out token boundary and an atomic document-creation path
Affected files: one timestamped quote-acceptance migration; `manage-quote-access`; `quote-public`; their shared validation helper, focused tests, function configuration, CI registration and this task record
Dependencies: approved `UX-QUOTE-001` specification on `codex/quote-acceptance-spec`; released document-status rules in PR #166
Security boundary: raw 256-bit tokens are returned once and never stored; `anon` receives no table/RPC grant; owner access requires a valid user JWT and row ownership; public responses resolve only the hashed scoped token; the response and linked invoice are committed atomically
Privacy boundary: confirmed name is stored only on the quote response and owner-visible convenience history; no IP address, fingerprint, decline reason, analytics payload, email or payment side effect
Approval boundary: completed under exact Owner approval. `manage-quote-access` v1 retains JWT verification and `quote-public` was released with JWT verification disabled as reviewed; the later follow-up advanced only `quote-public` to v2.
Lock state: released after production validation on 2026-09-20
Branch: `codex/quote-acceptance-runtime`, stacked from `codex/quote-acceptance-spec`
Required validation: migration contract/privilege tests; protected-field and immutable-response tests; duplicate/concurrent acceptance; cross-owner denial; function method/origin/body/JWT/token/name validation; Deno frozen-lock checks; existing security workflow harness
Evidence: focused contract/helper tests, all existing Node regression harnesses, both frozen-lock Edge Function checks and the website suite pass locally. Draft PR #168 is stacked on the approved specification branch; branch workflow run `35467031469` passed the focused harnesses, website suite and frozen-lock checks for all 21 Edge Functions. Disposable PostgreSQL run `35468437526` applied the migration and passed protected-field, tenant-attribution, sequential replay, decline, forced rollback, privilege and overlapping-accept probes. Focused security scan `8a14a58e-f139-434b-9504-6077fffaa0e5` found one low-severity shared-isolate availability issue in the constant global limiter; the draft now uses a bounded token-hash shard plus the existing stricter per-token limits, without processing or retaining an IP address or fingerprint. The privacy review confirmed purpose-bound name/timestamp storage, hash-only token persistence and no analytics, email, payment, decline-reason or new network-identifier data. No Supabase project was contacted or changed.
Release prerequisites: satisfied. Account export omits the token hash, the bounded limiter and integrated UI were validated, and focused security plus disposable PostgreSQL checks passed before release.
Next action: complete; retain the token, ownership, origin, idempotency and atomic-conversion invariants in future changes.

## UX-QUOTE-001 — Customer quote acceptance specification and isolated preview

Task ID: UX-QUOTE-001
Title: Specify and prototype secure customer quote acceptance with automatic linked-invoice creation
Priority: High
Status: Complete and implemented through released PRs #167, #171 and #172
Phase: Product/security specification and isolated fictional-data preview
Owner role: Product
Assigned specialists: Product, Frontend, Backend/Supabase, Security, Legal/Privacy and QA performed sequentially by Codex
Model/work mode: Sol for the public-token, RLS, privacy and atomicity boundary; Terra for the isolated preview and routine tests
Risk level: High for the later runtime workflow; the current slice is repository-only design/prototype work
Affected files: `docs/design/tallyo-redesign/QUOTE_ACCEPTANCE_RULES.md`, `dev/quote-acceptance/`, `tests/quote-acceptance-preview-harness.cjs`, `tasks/ACTIVE.md`; frozen reference images and production application/backend files remain read-only
Dependencies: released document-status rules in PR #166; existing invoice snapshot/numbering/activity contracts; approved quote-acceptance design references
Security boundary: a future signed-out customer may access only one scoped quote through a high-entropy server-validated token. No direct `anon` table grants or policies; privileged writes must be atomic, tenant-attributed, idempotent and service-side. Tokens must not be stored in plaintext.
Legal materiality: Triggered. The flow processes customer-confirmed name, quote contents, acceptance timestamp and limited security evidence for a UK business user's customer contact. Treat the Tallyo business user as controller and Tallyo as processor for the quote/contact workflow, subject to the existing DPA and Privacy Notice. Do not describe the name as verified identity or the action as a qualified electronic signature.
Jurisdiction: initial UK-business scope only
Affected user/data-subject types: Tallyo business user; quote recipient/customer contact, including sole traders where identifiable
Mandatory controls: data minimisation; clear acceptance wording; server timestamp; scoped expiry/revocation; replay-safe exactly-once conversion; preserved quote snapshot; separate linked invoice; append-only trusted acceptance/conversion events; automatic invoice email only after explicit owner opt-in; no automatic payment or marketing; no Analytics personal data
Required evidence: current-source mapping; state/abuse matrix; isolated public and internal preview; keyboard/mobile checks; zero external requests; focused privacy/legal disposition; migration/function/test plan
Legal disposition: The specification and fictional-data preview were approved with conditions. The released runtime satisfied the documented minimisation, transparency, retention, secure-link and rights-handling controls without changing public legal text.
External review required: No for the isolated specification/preview. Review may be appropriate before making claims that acceptance forms a binding contract in every scenario or jurisdiction; the product must avoid that claim.
Acceptance criteria: the specification resolves product states and invariants; the preview shows pending, accepted and internal linked-document states; duplicate/retry/expired/revoked/declined paths are defined; no production source, schema, function, provider or configuration changes occur
Required tests: local-only server allowlist; no external requests; responsive/keyboard interaction; fictional data only; state transitions do not create real records; spec consistency assertions
Required documentation: this task record and `QUOTE_ACCEPTANCE_RULES.md`; update broader authorities only when a runtime or release state changes
Approval boundary: Owner authorised the specification and isolated preview. Stop before any production UI integration, migration creation/application, Edge Function implementation/deployment, email, public link activation, merge to `main` or production release.
Lock state: acquired 2026-09-19 for the files listed above; no production application, migration or function path is locked or edited
Branch: `codex/quote-acceptance-spec`, from released main merge `6fcf675`
Commit: `5b380bd` (`docs: specify quote acceptance workflow`); branch closeout record follows
Evidence: Current app `convertToInvoice` changes the quote row in place, reuses its ID and records a browser timestamp. The current schema has no quote-link or public-access-token fields. Supabase guidance checked 2026-09-19 requires explicit grants plus RLS for exposed tables and distinguishes public functions from authenticated user functions. ICO guidance checked 2026-09-19 supports purpose limitation, data minimisation and privacy by design. The focused contract harness and headless Chrome preview suite pass for pending, acceptance, linked draft invoice, deliberate decline confirmation, expired/revoked states, owner activity, keyboard submit, 390px/desktop overflow and zero external requests. Full-resolution customer and owner screenshots were reviewed and approved by the Owner on 2026-09-19.
Blocked reason: None for this slice
Next action: complete; the released workflow is now in bounded monitoring.

## UX-STATUS-001 — Document status rules

Status: Verified and released under exact Owner approval. PR #166 merged as `6fcf675`; app build `2026.09.19.5` and only `stripe-webhook` v44, `stripe-connect-webhook` v27 and `send-overdue-reminders` v43 are active. Public build/service-worker checks, deployed-source comparison and fail-closed unauthorised probes passed. No migration, database change, email, payment or refund occurred.
Owner: Codex, sequential product-rule implementation and QA. Risk: High because payment/refund-derived state spans browser and signed Stripe webhook paths.
Branch: `codex/document-status-rules`, from production merge `e900694`.
Scope/lock: browser editor/list status presentation and guards in `index.html`; one shared server lifecycle helper; the existing Owner and Connect signed webhook callers; the overdue-reminder lifecycle guard; focused status/runtime/payment/reminder tests; CI registration; the controlled-upgrade pointer and this active-task pointer. No SQL, provider action, payment/refund execution, email, Auth, subscription, entitlement or production change.
Release evidence: [PR #166](https://github.com/EdsonLRO/InvoicePro/pull/166#issuecomment-5744309486). Retained rollback is Cloudflare deployment `019a9e6e-19d4-4599-9628-baaa048cd2c9` / build `2026.09.19.4` plus merge `e900694` function sources corresponding to previous versions 43, 26 and 42.

## UX-REDESIGN-001 — Controlled redesign release and list-card follow-up

Status: PR #164 merged as `06d718d` and build `2026.09.19.3` is verified in production at Cloudflare deployment `9690dc1c-2ab5-42ae-a88f-bbb79cab46a7`. The Owner approved PR #165 and app build `2026.09.19.4` for the focused customer and Products & services list-card presentation; rollback is the retained `9690dc1c` deployment and build `2026.09.19.3`.
Owner: Codex, sequential implementation/QA. Risk: Medium frontend release preparation; all non-navigation handlers and the printable template remain hash-frozen in the accepted candidate.
Branch: `codex/customer-product-row-cards`, from production merge `06d718d`, in focused PR #165 to `main`.
Scope/lock: customer and Products & services list presentation, shared alternating row-card styling, build/cache markers, release records and focused responsive tests. No handler, persistence, dependency, printable-template, backend, provider, financial, email, Auth or data-model change.
Single working checklist: [Controlled upgrade](../docs/design/tallyo-redesign/UPGRADE.md).
Authority: the Owner approved marking PR #165 ready, merging it and publishing app build `2026.09.19.4`. Migration, secret, backend, website, real email, account mutation and payment changes remain unauthorised.
Both Pages projects include `*` and exclude only `codex/tallyo-redesign*` for previews. Main automatic deployment remains enabled; Access/runtime/Worker settings are unchanged. The local preview uses fictional data, blocks providers and resets edits on refresh; it does not validate live Auth/RLS/backend behaviour or installed-PWA update/rollback. Frozen references remain unchanged. Separate Step 7 and production approvals are still required.

## AUTH-004 — Recovery email canonical destination

Status: Verified under exact Owner approval; PR #154 merged as `bd8b754c75517a8c64655221fbf00a7423c2c6b8` and only the two approved functions were deployed. Active versions are `mfa-recovery` v35 and `owner-account-admin` v3; live source equals the merge, JWT gates return 401 without authorization, and main checks passed. No live email or account mutation was tested.
Owner: Backend/Supabase, with sequential QA/security review by the same Codex process. Risk: High (recovery runtime); no change to authentication or authorization rules. Branch: `codex/recovery-link-origin-fix`.
Finding: validated functional recovery failure. The deployed confirmation-link builder reads legacy shared `APP_BASE_URL` and returns only its origin, sending the user to the obsolete GitHub root (404). Owner password-reset/ready-email links use the same pattern. No account takeover or token disclosure is established by this report.
Fix: pin only these recovery destinations to the existing public `https://app.tallyo.co.uk` origin, leaving shared environment settings, Stripe, JWT/AAL gates, tokens, expiry, rate limits and recovery approval unchanged. No new data, provider, email wording, legal commitment or public notice change.
Locked scope: the two recovery functions, existing Owner runtime tests, and current status/release documentation; acquired 2026-09-11, released with the focused commit. No other agent edits this scope.
Evidence: two new actual-handler tests failed on the old GitHub origin before repair; all eight runtime tests now pass. Six base-setting variants cover legacy/current/empty/untrusted/localhost/lookalike values. HTML/text confirmation, reset redirect and ready-email links point only to the canonical app; tokens remain fragment-only and HMAC-only in storage. Owner/MFA security harnesses and both frozen Deno checks pass. QA/security review is sequential, not an independent-agent claim. No changes to Auth/Owner gates, token verification, SQL, shared payment settings or dependencies. No live email or user mutation. See `RELEASE_READINESS.md` for the exact approval/rollback boundary.

## AUTH-003 — Minimal Owner Console

Status: approved production release complete on 2026-09-11; live Owner AAL2 access and read-only lookup verified. PR #152 merge: `0e98392033895523eb4fb4e8fe85bab73a989211`. No real user mutation or recovery email was exercised.

Scope: exact-email account lookup, existing complimentary-access grant/revoke, registered-email password reset, account-holder-confirmed MFA recovery approval, forced new-authenticator enrolment and minimal action history. The console is restricted to the configured Owner user at AAL2 and excludes impersonation, bulk account browsing and all invoice/customer/payment/business-record access.

Release boundary completed under exact Owner approval: history-only migration reconciliation, migration `20260911170410`, protected `TALLYO_OWNER_USER_ID`, `mfa-recovery` v33 and `owner-account-admin` v1 with JWT verification, and app build `2026.09.11.1`. Real email, grant/revocation and factor/session-reset testing remain excluded. Release evidence and rollback are in `RELEASE_READINESS.md`.

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: Approved initial UK-business public release active
Phase: Post-release verification and monitoring
Owner role: Master Orchestrator
Assigned specialists: Payments, Backend/Supabase, Security, Website, AI, QA and Release; Legal is triggered only for claims, notices and final publication
Model/work mode: Sol / High
Risk level: High

## Objective

Prepare Tallyo so the public website and authenticated app can offer:

- Tallyo Pro subscriptions at the approved GBP 8 monthly or GBP 80 annual price;
- customer card payments received by each independent business through its own connected Stripe account;
- the already implemented public-information AI Helper;
- a controlled, reversible public release after separate provider and release approvals.

## Current baseline

- PR #98 merged the disabled Stripe Billing acceptance preparation into `main`.
- PR #100 merged the Connect account/onboarding foundation into `main`.
- PR #101 merged the disabled direct-charge Checkout, connected-refund, signed connected-account webhook and Owner-route isolation slice as `a0e87e0`.
- PR #102 merged the provider-foundation evidence and controlled sandbox-acceptance preparation.
- After a completed 2026-07-24 physical backup, the Owner-approved production-preparation stage applied the Billing and both Connect migrations and deployed the seven new functions at version 1.
- Stripe Billing sandbox now has the approved GBP 8 monthly and GBP 80 annual Tallyo Pro Prices, a separate signed Billing event destination and a configured Customer Portal.
- The Owner privately entered the rotated Stripe Billing test key and Billing webhook signing secret in Supabase. Their values were not requested, inspected or stored in the repository.
- Billing is enabled only for the protected non-live acceptance preview. One synthetic GBP 8 monthly test subscription and its provider-derived full entitlement are active; cancellation-at-period-end, Portal return, duplicate, stale-event, renewal, failed-payment, grace, read-only and recovery handling have been exercised without public release.
- PRs #103-#112 merged the focused entitlement RLS, server-side guards and live-Billing readiness controls. Disposable PostgreSQL 17 RLS, privilege, tenant-isolation, service-role reconciliation and live-session probes pass.
- Read-only production reconciliation on 2026-07-25 found eight accounts with business data, two active full entitlements and six accounts that would become read-only if enforcement were activated immediately. No account identifier, email or business record was read. The live-Billing release candidate therefore kept the server boundary behind one private database-owner-only rollout switch defaulting off; a missing switch fails closed.
- Under exact Owner approval, the four Connect sandbox gates were enabled while live mode remained disabled. The Owner privately configured the Connect key and webhook signing secret. PRs #104-#110 corrected and validated the Accounts v2 onboarding, Checkout/refund refresh and provider-unavailable paths. Two synthetic owners completed isolated onboarding; one fictional GBP 1 direct charge and full refund reconciled through signed webhooks, and one exact replay caused no duplicate mutation. Only the approved Connect functions were advanced, while existing live Owner-route functions remained unchanged.
- After exact Owner approval and a current physical backup, migrations `20260725014434` and `20260725160000` were applied. The private write-enforcement switch was initially left off and cannot be changed by browser or service roles. The eight approved Billing/entitlement functions are active from merge `2c313f0` with JWT settings preserved. The Owner allowlist was transferred privately before guarded Owner Checkout and document-email activation.
- The AI Helper is merged and disabled by default in source. Under exact Owner approval, the existing encrypted OpenAI secret, production Helper gates and Cloudflare rate-limiter service binding were configured on the Access-protected website. One synthetic question on the canonical protected hostname returned a bounded Tallyo-specific answer, and OpenAI attributed exactly one Responses request for 27 July UTC.
- PR #108 merged the fail-closed website subscription signup CTA gate.
- The production website is public at `https://tallyo.co.uk` and `https://www.tallyo.co.uk`; the Pages rollback hostname remains available.
- Under exact Owner approval on 2026-07-26, Stripe live mode now has the approved GBP 8 monthly and GBP 80 annual Tallyo Pro Prices, separate Billing and connected-account webhook destinations, and a configured Customer Portal returning to `https://app.tallyo.co.uk/#account`. The Owner privately entered the restricted Billing/Connect key and both webhook signing secrets in Supabase; their values were not requested, inspected or stored.
- Supabase has the approved live mode/approval settings, exact Price allowlist, app base URLs and five enabled Billing/Connect server gates. Empty unauthenticated requests to the five protected commercial actions and unsigned requests to both webhook functions returned HTTP 401 without creating a live provider object or transaction; focused Billing, Connect, entitlement and payment-integrity harnesses pass.
- Exact local production build permutations pass for subscriptions, connected payments and the AI Helper. PR #113 merged the app-hostname recovery origin, and `mfa-recovery` remains deployed with `https://app.tallyo.co.uk` plus the retained GitHub Pages and localhost rollback origins. The final hostname remains in Supabase Auth redirects and the Turnstile widget; the Supabase Site URL is now `https://app.tallyo.co.uk/`.
- `SEC-AUTH-006` is remediated. The Owner rotated the exposed Turnstile server secret and entered its replacement directly into Supabase Auth without Codex inspecting it. CAPTCHA-protected sign-in, custom-domain MFA, exact-origin CORS and lookalike-origin rejection pass.
- Authoritative DNS now uses Cloudflare with DNSSEC active. All 19 prior Squarespace records were preserved, the Squarespace website and Google Workspace/Resend DNS checks pass, and the four prior Squarespace nameservers are the documented rollback. `app.tallyo.co.uk` was protected by the existing default-deny Access application before it was attached to Pages; Pages reports Active with SSL, while anonymous requests are redirected to Access.
- Under exact Owner approval on 2026-07-27, the database-owner-only `subscription_write_enforcement` switch was enabled. Privacy-safe reconciliation found nine accounts with business data: three full/grace accounts remain write-enabled, six are read-only and an unknown account cannot write. Authenticated and service roles cannot change the switch, and the Supabase security advisor remains clear.
- The approved non-secret production variables are active in Cloudflare Pages. App build `2026.07.28.2` is public at `https://app.tallyo.co.uk` with the approved Billing and Connect interfaces and the corrected account-data export ordering. The production website contains merged PR #127, routes to the custom app domain and is public at the apex and `www` hostnames. The bounded AI Helper has the exact public-domain allowlist, rate-limiter binding and hard provider budget.

## Current controlled-provider scope

- preserve the applied schema and verified server-side function boundaries;
- preserve the verified Billing, Connect, entitlement and Owner-payment boundaries;
- monitor the public website, app, Auth and bounded AI Helper without inspecting private data;
- keep preview deployments protected by the retained wildcard Access applications;
- stop before any new live payment/refund, customer communication, analytics/marketing activation, secret change, destructive action or unrelated provider change.

## Focused task: COMM-001-AN-001 GA4 consent controls

Status: Completed and activated under exact Owner approval
Priority: High
Assigned roles: Website, QA, Security, Legal/Privacy and Documentation
Model/work mode: Sol High for Auth/subscription hooks, CSP, legal wording and final review; Medium for routine website UI and tests
Risk level: High because the scope adds production tracking, touches Auth/subscription lifecycle events, changes CSP and updates public legal commitments
Jurisdiction: United Kingdom
Affected people: public visitors and Tallyo business-account users
Legal disposition: Approved for the deployed consent-controlled scope
Review: `docs/legal/GA4_CONSENT_REVIEW.md`

Approved source scope:

- GA4 stream `G-PZFZKCWZ7M`;
- Basic Consent Mode with no Google load or transmission before affirmative consent;
- equally prominent accept, reject and manage controls plus persistent withdrawal;
- one preference-only consent record, separate from necessary service storage;
- eight property-free allowlisted events;
- Privacy Notice, Cookie Notice, storage inventory and provider-setting checklist;
- automated fail-closed, payload-minimisation, keyboard and responsive checks.

Files locked:

- `website/src/`;
- `website/content/analytics-events.json`;
- `website/content/storage-inventory.md`;
- `website/public/_headers.template`;
- `website/scripts/`;
- `website/README.md`;
- `docs/legal/GA4_CONSENT_REVIEW.md`;
- focused app Analytics source and its build/cache/tests;
- `index.html`;
- `tasks/ACTIVE.md`.

Lock acquired: 28 July 2026.

Release acceptance:

- source remains disabled by default and requires an exact production release gate;
- no static Google tag exists in rendered HTML;
- no Google script, cookie or event before consent or after rejection;
- withdrawal updates Consent Mode v2 and blocks future events;
- tag insertion is idempotent;
- event allowlist and payload tests reject personal, business, document, payment,
  Stripe, Auth, free-text and internal-ID data;
- notices match the implemented choice, cookie duration and provider role;
- Google property settings and processor/transfer evidence are verified;
- PR #134 merged at `331ace9` after the required checks passed;
- production website and app deployments succeeded on 28 July 2026;
- live reject, accept and withdrawal checks passed;
- GA4 Realtime received `view_pricing` without event properties;
- no approved Tallyo event is marked as a key event.

Branch: `codex/ga4-consent-controls`
Deployment: Active under exact Owner approval.

## Focused task: COMM-001-PAY-002 Optional invoice-email payments

Status: Completed in production on build `2026.07.29.1`
Priority: High
Assigned roles: Payments, Backend/Supabase, UI, QA and Security
Risk level: High because the change controls when invoice email sends create
connected-account Checkout Sessions

Approved source scope:

- default invoice email sends to no online payment option;
- allow one explicit full-outstanding or saved-deposit option only when Stripe
  Connect and the invoice are eligible;
- validate the exact requested amount on the client and server without fallback;
- preserve direct charges, connected-business merchant-of-record behaviour,
  webhook reconciliation, refunds, disputes and bank-transfer instructions;
- prove that opting out never calls the Checkout creator.

Branch: `codex/optional-invoice-email-payments`
Release boundary: the Owner approved build `2026.07.29.1`, merge and deployment
of only `create-connect-checkout` and `send-document-email` with JWT
verification retained. No email, Checkout object, payment, refund, secret,
configuration, migration or unrelated deployment is approved.

## Focused task: COMM-001-UX-003 Invoice email feedback

Status: Completed in production on build `2026.07.29.2`
Priority: Medium
Assigned roles: Frontend and QA
Model/work mode: Sol / Medium
Risk level: Medium; presentation and wording only, with no email, payment,
provider or data-state change
Affected files: `index.html`, app build/cache markers, focused frontend tests
and this active-task record
Acceptance criteria: hide provider-acceptance badges from the invoice table
while retaining delivery outcomes and Activity History; provide clearer
zero-deposit guidance; replace the native single/bulk email-success alert with
an accessible Tallyo notification
Approval boundary: repository implementation, validation, commit, push and
draft PR are authorised; merge and public app deployment remain Owner-gated
Lock state: `index.html`, focused tests, app build/cache markers and this task
record are locked to `codex/email-send-feedback-ux`
Branch: `codex/email-send-feedback-ux`
Validation: focused email-status, invoice-email payment-option, accessibility,
app-integration, PWA update, core document-lifecycle and dispute-visibility
harnesses pass; `git diff --check` passes
Completion: PR #137 merged after exact Owner approval and app build
`2026.07.29.2` was published. No Edge Function, email, Checkout, payment,
refund, secret, configuration, migration or unrelated deployment changed.

## Focused task: COMM-001-UX-004 Customer-facing notices

Status: Completed in production on build `2026.07.31.1`
Priority: High
Assigned roles: Frontend, QA and Security
Model/work mode: Sol / High for the authorization-error mapping review
Risk level: High only because server authorization failures are translated for
the user; RLS, entitlements, Auth, provider calls and data permissions are not
changed
Affected files: `index.html`, `app-user-messages.js`, app build/cache markers,
focused frontend tests and this active-task record
Acceptance criteria: replace native alert presentation with branded Tallyo
notices; give every notice a plain-language title and next action; prevent raw
database, RLS, Edge Function, JWT or provider wording reaching the user; retain
the exact existing authorization and subscription enforcement
Approval boundary: repository implementation, validation, commit, push and a
focused draft PR are authorised; merge and public app deployment remain
Owner-gated
Branch: `codex/user-friendly-alerts`
Completion: PR #138 merged as `4d86c13`. Its first automatic Pages build
omitted the new helper from the strict public-file package, so PR #139 added the
asset and regression allowlist before the release was accepted. Merge
`cbb2a96`, required main checks, HTTP 200 JavaScript readback and helper
execution now pass on public app build `2026.07.31.1`.

## Focused task: COMM-001-UX-005 First-sign-in subscription guidance

Status: Completed in production on build `2026.07.31.2`
Priority: High
Assigned roles: Frontend, QA and Security
Model/work mode: Sol / High for subscription-entitlement presentation review
Risk level: High only because the message depends on owner-scoped Billing
readback; entitlement enforcement, Stripe Checkout and payment logic are not
changed
Affected files: `index.html`, app build/cache markers, focused frontend tests,
CI coverage, current status and this active-task record
Acceptance criteria: after successful Billing readback, show a clear accessible
welcome dialog once per signed-in session only when no subscription and no
entitlement exist; explain that Tallyo Pro is required; show the approved GBP 8
monthly and GBP 80 annual choices; link directly to the Account subscription
section without starting Checkout; never show on readback failure, an existing
subscription, an entitlement or a Billing callback notice
Approval boundary: repository implementation, validation, commit, push and a
focused draft PR are authorised; merge and public app deployment remain
Owner-gated
Branch: `codex/first-signin-subscription-guidance`
Completion: PR #140 merged after exact Owner approval and app build
`2026.07.31.2` was published. No entitlement enforcement, Stripe Checkout,
payment, refund, Auth, RLS, database, Edge Function, provider configuration,
secret, migration, email or unrelated deployment changed.

## Focused task: GROWTH-001 Free-generator conversion panel

Status: Complete — production activation approved and validated
Priority: High
Assigned roles: Website, Backend/Supabase, Privacy/Legal, Security and QA
Model/work mode: Sol / High for the consent, personal-data and server-email
boundary; routine presentation remains focused
Risk level: High because an optional public form can collect an email address
and request one promotional communication
Affected scope: the free invoice generator, one public consent-gated Edge
Function, two applied consent-table/grant migrations, the public Privacy Notice,
focused website/server tests and this active-task record
Acceptance criteria: prepare and validate the current print-ready invoice before
the panel; preserve a clear no-account download on continue, close or Escape;
open registration separately without clearing the completed invoice; never reuse
invoice addresses; require the exact unticked consent; permit at most one
overview per normalised address; retain minimised consent/send/withdrawal
evidence; rate-limit by a protected network fingerprint; include Tallyo identity,
Privacy Notice and unsubscribe; send no personal data to GA4
Legal disposition: Approved with conditions for repository preparation. UK
electronic-mail marketing consent must remain separate, specific, informed and
affirmative; withdrawal must be recorded and easy; the Privacy Notice update
must be separately approved before publication.
Activation branch: `codex/activate-generator-overview-email`
Completion: exact Owner approval covered the migrations, protected settings,
function deployment, Privacy Notice publication and website release. Migrations
`20260731152423` and `20260731155610` are applied. The consent table has forced
RLS, no browser policy, zero activation rows and only service-role
read/insert/update privileges. `send-marketing-overview` version 1 is active
with JWT verification disabled by design because it is a public consent form;
the function enforces exact origins, versioned affirmative consent,
idempotency and rate limits. Production website gates are configured. Safe
smoke tests returned 204 for approved preflight, 403 for an unapproved origin
and 400 for an invalid payload. No promotional email was sent and no consent
row was created during activation.

## Focused task: GROWTH-002 One-off introductory email design

Status: Complete — production template refresh deployed; no live email sent
Priority: High
Assigned roles: Growth, Backend/Supabase, Privacy/Legal and QA
Model/work mode: Sol / High for the consent and server-email boundary; visual
layout and screenshot preparation are routine
Risk level: High because the template is used by the public consent-gated
server email flow, although this task makes no provider or production change
Affected scope: the shared one-off email builder, five privacy-safe compressed
product screenshots and the focused consent/send test harness
Acceptance criteria: exact approved subject and preheader; responsive
table-based HTML and plain text; no more than five real fictional-data product
screenshots; HTML buttons independent of images; accurate pricing, Stripe-fee
wording, identity, Privacy Notice and HTTPS unsubscribe route; no account,
newsletter or repeated-send implication; preserve affirmative versioned
consent, unique-address enforcement, provider idempotency and rate limiting
Branch: `codex/feature-email-and-free-pdf`
Completion: PR #185 merged at `4158b5b` after exact Owner approval. Website
deployment `1bf54acb-661e-4092-b167-0af9f84d0897` and unchanged app build
`2026.09.24.1` deployment `bfa6a7aa-ad81-462f-b82b-b6a75c6339ff` are active.
The refreshed overview uses five current fictional-data screenshots and clearer
feature wording. `send-marketing-overview` version 8 is active with JWT
verification disabled by design for the public consent form. Readback confirms
the exact function/version/configuration, approved-origin preflight returned
204, an unapproved origin returned 403, all five public images returned 200 and
the public generator stylesheet contains the invoice-only print rules. No
promotional email was sent; no database, migration, payment, Auth, secret or
unrelated provider setting changed.

## Focused task: COMM-001-ENT-003 Complimentary access by email

Status: Implementation complete — awaiting high-risk PR review and exact Owner production approval
Priority: Medium
Assigned roles: Backend/Supabase, Security, Frontend and QA
Model/work mode: Sol / High for Auth, RLS and entitlement changes
Risk level: High because the migration changes the server and database authority used to permit authenticated writes
Affected scope: one additive private grant table, owner-only grant/revoke functions, the two existing entitlement helpers, one identity-bound authenticated status function, Account-page presentation, app build markers, focused tests and authoritative documentation
Acceptance criteria: grant only an existing confirmed Auth account selected by email; store no duplicate email; prevent browser and service-role grant/revoke; preserve tenant isolation, owner-scoped reads, expiry, revocation and provider reconciliation; create no Stripe object or public voucher; show truthful complimentary-access status; suppress subscription prompts and Checkout choices for the granted account
Branch: `codex/complimentary-access-by-email`
Release boundary: commit, push and focused draft PR only. Applying migration `20260909115547`, publishing app build `2026.09.09.1`, granting or revoking any account and merging the high-risk PR require exact Owner approval.
Validation: the focused source harnesses and a disposable, network-isolated PostgreSQL 17.6 run pass owner-only function privileges, confirmed-account lookup, no copied email field, identity-bound status, tenant isolation, authenticated and server entitlement helpers, immediate revocation and expiry.

## Locks

- `tasks/ACTIVE.md`;
- `APP_STATUS.md`;
- `ROADMAP.md`;
- `DECISIONS.md`;
- `docs/architecture/STRIPE_CONNECT.md`;
- `docs/architecture/STRIPE_BILLING.md`;
- COMM-001 decision, implementation and evidence files;
- any new Connect migration, Edge Function, UI and focused test files after Owner scope approval;
- subscription and AI launch configuration only after its separate approval gate.
- complimentary-access migration, app UI, tests and authoritative records until PR handoff.

Lock acquired: 2026-07-24.

Current focused edit lock acquired 2026-07-25:

- `website/src/`;
- `website/content/helper-knowledge.json`;
- `website/functions/api/helper.js`;
- `website/scripts/`;
- `website/README.md`;
- `APP_STATUS.md`;
- `tasks/ACTIVE.md`.

Release condition: focused website tests, responsive browser QA, reviewed PR and retained disabled-by-default production gates.

Current live-Billing readiness edit lock acquired 2026-07-25:

- `supabase/functions/create-billing-checkout/`;
- `supabase/functions/create-billing-portal/`;
- `supabase/functions/stripe-billing-webhook/`;
- pending Billing/entitlement migrations;
- Billing client/build gates and focused Billing tests;
- `docs/architecture/STRIPE_BILLING.md`;
- `APP_STATUS.md`;
- `tasks/ACTIVE.md`.

Release condition: explicit mutually exclusive provider-mode gates, live/test key and event matching, fail-closed public build controls, private reversible entitlement rollout, disposable PostgreSQL 17 validation, focused Deno/client/build/security tests and reviewed Owner approval before merge or deployment.

Current app-domain Auth release-candidate lock acquired 2026-07-25:

- `supabase/functions/mfa-recovery/`;
- `tests/mfa-recovery-harness.cjs`;
- app build/cache markers and their focused tests;
- `APP_STATUS.md`;
- `tasks/ACTIVE.md`;
- `RELEASE_READINESS.md`;
- `SECURITY_FINDINGS_LEDGER.md`.

Release condition: completed for the protected app-domain stage. Every recovery origin and Auth/MFA invariant was retained; repository, provider, DNSSEC, Access, Pages, CORS and Owner-completed MFA acceptance passed. The later Access-removal, Supabase Site URL and public-release gates completed under the separate final-cutover approval recorded below.

Current Stripe Connect stale-claim remediation lock acquired 2026-07-26:

- the additive Checkout-claim constraint migration;
- focused Stripe Connect payment probes and harness;
- `SECURITY_FINDINGS_LEDGER.md`;
- `tasks/ACTIVE.md`.

Finding: `SEC-PAY-003`. A pre-session provider failure leaves a `claimed` reservation that the five-minute cleanup cannot mark `expired`, because the original table constraint requires Session fields for that state. Controlled live acceptance remains fail-closed: no new Checkout Session or payment was created.

Repository validation: PostgreSQL 17 reproduced the original constraint failure, then passed stale-claim recovery, replacement reservation, partial-field rejection, RLS and privilege probes after the additive repair. Focused Connect, payment-integrity, financial-audit, tenant-attribution and security workflow harnesses pass.

Release condition: additive migration and focused stale-claim recovery evidence; retained service-role-only privileges, RLS, tenant/payment binding and provider-created Session states; reviewed PR. Production migration application, live Checkout, payment, refund, function deployment and public release remain separate exact Owner boundaries.

PR #118 merged the additive repair, and migration `20260726172105` was the only pending migration applied to the linked Supabase project. Migration history, the validated replacement constraint, RLS and service-role-only access were verified afterward. The single approved protected live retry expired the stale pre-session reservation, created a replacement provider Session and persisted its exact `created` claim, but the function returned HTTP 502 before the browser received the URL. No payment, refund, deployment, configuration change or public release occurred.

Current Stripe Connect completion-readback remediation lock acquired 2026-07-26:

- `supabase/functions/create-connect-checkout/index.ts`;
- `tests/stripe-connect-payments-harness.cjs`;
- `SECURITY_FINDINGS_LEDGER.md`;
- `tasks/ACTIVE.md`.

Finding: `SEC-PAY-005`. An ambiguous completion RPC response can make Checkout return an error after the exact provider Session binding has already persisted. The focused source change accepts only an exact owner/request/session/expiry readback; every mismatch still fails closed.

Release condition: focused function, Connect/payment, dependency, workflow, formatting, diff and sensitive-value checks plus independent review. Function deployment, another live retry, payment, refund, configuration change and public release remain separate exact Owner boundaries.

Current Stripe Connect manage-details remediation lock acquired 2026-07-28:

- `supabase/functions/manage-stripe-connect/index.ts`;
- `tests/stripe-connect-foundation-harness.cjs`;
- `tasks/ACTIVE.md`.

Finding: `COMM-001-CN-002`. The public Account page correctly reports the live connected business as ready, but the Manage Stripe Details action asks Accounts v2 for an `account_update` Account Link. Stripe rejects that request for this approved full-Dashboard Merchant account and explicitly permits only `account_onboarding`, so Supabase returns HTTP 502 and the browser shows a generic non-success message. The request does not create a payment, refund or account and does not indicate an Auth, MFA, entitlement, CORS or secret-key failure.

Narrow remediation: retain the browser's onboard/update intent for return-flow and idempotency binding, while always requesting Stripe's supported `account_onboarding` hosted flow for this Accounts v2 Merchant model. Preserve account ownership, mode, responsibility, capability, entitlement, Auth/MFA, trusted-link and return-origin checks.

Repository validation: the Connect foundation, Connect payments and Stripe payment-integrity harnesses pass; the changed function passes formatting and frozen-lock Deno type-checking; diff hygiene and focused sensitive-value review pass. The original production failure cannot be retested until the corrected function is separately approved for deployment.

Release condition: focused Connect foundation and frozen-lock Deno checks, formatting, diff and sensitive-value review, plus a reviewed PR. Deployment of `manage-stripe-connect`, provider configuration, secrets, payment, refund or another public release remains a separate exact Owner boundary.

### COMM-001-BL-002 Billing Checkout recovery and entitlement copy

Finding: closing or losing an open Stripe Billing Checkout removes the browser's only copy of its hosted URL, while the existing one-session claim correctly prevents a second live subscription Checkout until the provider session expires. A repeated plan click therefore reported an active Checkout without giving the owner a way to resume it. Separately, a Connect onboarding attempt from an account without write entitlement surfaced the Supabase client's generic non-success text instead of the reviewed server subscription restriction.

Narrow remediation: on a repeated same-plan request, retrieve the exact claimed Stripe Checkout Session server-side and resume it only when its customer, Tallyo owner, plan, billing interval, subscription mode, live/test mode and Stripe-hosted URL all match. Clear and replace the claim only when Stripe authoritatively reports that exact Session as expired; completed, mismatched, cross-plan and unknown states remain fail closed. Preserve the existing subscription-existence check before both resume and replacement. In the browser, extract the reviewed function response and translate only the exact read-only entitlement message into a clear Tallyo Pro activation instruction; unrelated Connect failures retain their real response.

Repository validation: the Billing foundation, Billing client, server-entitlement, Connect foundation and payment-integrity harnesses pass; all repository harnesses except the unchanged Cloudflare Pages readiness harness pass locally. That unrelated harness and the website suite stop in their pre-existing Windows/Node 24 child-process assertion because `spawnSync` returns no stderr; neither failing test file is changed by this work. The affected Billing function passes formatting and frozen-lock Deno type-checking. Diff hygiene, full-diff review and focused sensitive-value review pass.

Release condition: reviewed focused PR and green required remote checks. Deploying `create-billing-checkout`, publishing the browser wording, retrying live Checkout, creating a subscription, changing Stripe/Supabase configuration or any other production action remains a separate exact Owner boundary.

### COMM-001-DATA-001 Account-data export ordering

Finding: the export paginator treated every non-`id` sort as requiring an `id` tie-breaker. The singleton `company_settings` table is keyed by `user_id` and has no `id` column, so the first export query failed before any file was created.

Narrow remediation: allow the paginator's tie-breaker to be disabled only for the singleton company-settings dataset. All datasets continue to use the signed-in Supabase client and existing owner-scoped RLS; account identity is revalidated before querying, session-change rejection remains in place, partial files remain prohibited and successful exports retain their audit event. Dataset failures now show customer-facing wording instead of a database table name.

Repository validation: the focused account-export harness proves company settings is ordered only by `user_id`, large multi-row datasets remain deterministically paginated, sensitive Auth metadata stays excluded, query failure creates no partial file or success audit, and the busy state resets. PWA build/cache validation and the complete relevant app harness suite pass.

Release condition: reviewed focused PR and green required remote checks. Publishing build `2026.07.28.2` and one bounded owner-confirmed download retest remain separate exact Owner boundaries; no export contents may be opened or inspected.

## Explicit exclusions until separately approved

- no live Stripe subscription, connected-account identity onboarding, payment, refund, real customer or real-money transaction without a separate exact acceptance approval;
- no function redeployment or migration change outside the exact approved sandbox-acceptance scope;
- no secret reveal or repository/browser storage;
- no existing Owner-route function redeployment without the exact pre-deployment approval;
- no additional paid OpenAI request or expansion beyond the bounded public-guidance Helper;
- no analytics or marketing activation, customer communication or expansion beyond the approved UK-business release;
- no deployment or production-provider change to the Owner-account invoice-payment path.

## Staged delivery

1. **Connect decision and implementation boundary** - completed.
2. **Repository implementation and PR review** - completed through PR #101.
3. **Disabled provider foundation** - completed: applied the three reviewed additive migrations, deployed seven new functions, verified RLS/grants/advisors/JWT settings and retained absent feature gates.
4. **Isolated test acceptance** - completed for the approved non-destructive sandbox scope: protected Billing Checkout, Portal, signed reconciliation and lifecycle probes pass. Connect sandbox secrets and gates are configured. PRs #104-#110 passed the payout-field, UK-country, indexed-retrieval, trusted Account Link-flow, shared Checkout/refund retrieval and provider-unavailable gates. Two isolated synthetic owners map to two separate fully ready sandbox accounts with zero live-mode rows. The first account's fictional GBP 1 direct charge and full refund reconciled through signed webhooks, and one exact `refund.updated` replay returned HTTP 200 without another Connect event or audit mutation. Destructive provider downgrade was not used because Stripe test-mode capability handling cannot provide a reliable reversible simulation; the server path instead has focused fail-closed source and harness evidence.
5. **AI release readiness** - completed: public-domain allowlisting, rate limiting, provider budget and alerts, public notice/provider evidence and one paid synthetic request are verified.
6. **Production release** - completed for the approved initial UK-business scope: authoritative DNS, SSL, public app and website domains, Site URL, subscription enforcement, commercial interfaces, bounded AI Helper and final smoke checks are active. Preview wildcard Access protection and rollback routes remain.

## Approved decision

The Owner approved the following repository-only model on 2026-07-24:

- Stripe Accounts v2 Merchant configuration for new connected businesses;
- direct charges on each connected account;
- the connected business is merchant of record;
- `fees_collector = stripe` and `losses_collector = stripe`;
- no Tallyo application fee at initial launch;
- Stripe-hosted onboarding and Stripe-managed requirement collection;
- full Stripe Dashboard access when the selected configuration supports it;
- repository-only implementation with all provider operations still disabled.

This approval does not authorise provider configuration, deployment, secrets, payments or public release.

## Current approval boundary

On 2026-07-25 the Owner approved the repository-only `app.tallyo.co.uk` MFA recovery origin change, focused tests, release build/version update, authoritative status, commit, push and PR creation. Release candidate `2026.07.25.1` contains only the new exact HTTPS origin plus retained GitHub Pages and localhost rollback origins. The MFA recovery harness asserts the complete exact origin set; PWA/public-integration, dependency-pin and frozen-lock Deno checks pass; the exact synthetic production app build reports `2026.07.25.1`. PR #113 later merged under exact Owner approval.

On 2026-07-26 the Owner separately approved the Access-protected app-domain migration. The final hostname was added to Supabase Auth redirects and the Turnstile widget; the exposed Turnstile secret was rotated and its replacement entered privately into Supabase Auth; only `mfa-recovery` was deployed from merge `41a2100` with JWT verification retained. All 19 Squarespace DNS records were copied and verified before the registrar moved from `nsd1`-`nsd4.squarespacedns.com` to `damien.ns.cloudflare.com` and `sureena.ns.cloudflare.com`. The old DS record was removed before cutover, the new Cloudflare DS was registered afterward, and Cloudflare reports DNSSEC protected. Apex and `www` return HTTP 200; Google Workspace and Resend MX, SPF, DKIM and recovery records resolve correctly. The existing default-deny Access application gained `app.tallyo.co.uk` before the hostname was proxied and attached to Pages. Anonymous requests receive the Access redirect; Pages reports Active with SSL. Exact-origin CORS and lookalike-origin rejection pass, and the Owner completed a fresh password-plus-MFA sign-in on the custom domain. No website publication, Access removal, Site URL switch, public AI, live Stripe change, legal publication or public launch occurred.

Later on 2026-07-26 the Owner approved the configuration-only live Stripe Billing and Connect stage. Stripe live mode now contains the approved Tallyo Pro Product with GBP 8 monthly and GBP 80 annual Prices, a separate 10-event Billing webhook destination, a separate 12-event connected-account webhook destination and a Customer Portal that returns to the protected app account page. The Owner entered the restricted live key and both signing secrets directly into Supabase without Codex inspecting their values. Billing/Connect live mode and approval settings, exact Price IDs, app base URLs and the five server gates were enabled; the website/app publication gates and `subscription_write_enforcement` were left off at that stage. Seven bounded empty-request probes returned HTTP 401, and focused Billing, Connect, entitlement and payment-integrity harnesses pass. No live subscription, connected account, Checkout Session, payment, refund, customer communication or public release occurred under that approval.

Under later separate exact approvals, one controlled live monthly subscription completed and provider-derived readback shows active full access. One isolated synthetic live connected business completed Stripe-hosted onboarding and identity verification. After PRs #118 and #119 repaired the stale-claim and completion-readback paths, one GBP 1 direct connected-account payment reconciled through the signed connected-account destination. One separately approved full GBP 1 refund then reconciled exactly once: synthetic invoice #0002 returned to Sent with GBP 1 outstanding, with one connected payment row, one connected refund row, zero connected net paid, one refund request audit and one refund success audit. No secret, identity document, bank detail or payment credential was inspected. No further transaction, deployment, configuration change, Access removal or public release is authorised by that acceptance.

On 2026-07-27 the Owner separately approved the protected commercial rollout. The database-owner-only subscription write-enforcement switch was enabled after a privacy-safe impact reconciliation; three full/grace accounts remain write-enabled, six business-data accounts are read-only and an unknown account cannot write. Authenticated and service roles cannot change the switch, and the Supabase security advisor remains clear. The documented non-secret production variables were then entered into both Cloudflare Pages projects and each was rebuilt once from merge `f34a8ae`. Build `2026.07.27.1` is active at the Access-protected app domain with live Billing enabled. The protected website is in production build mode with subscription and connected-payment navigation enabled, while its public AI provider path remains disabled. Anonymous requests to both endpoints still redirect to Access. No Access removal, Auth Site URL change, website-domain publication, public AI activation, DNS cutover, transaction or public release occurred.

Later on 2026-07-27 the Owner separately approved the Access-protected AI Helper production configuration and one synthetic paid request. The existing encrypted OpenAI secret was preserved, the production Helper gates and `AI_HELPER_RATE_LIMITER` service binding were configured, and the website was rebuilt once from merge `0865c5f`. A first request from an immutable deployment hostname correctly stayed outside the exact-origin provider path. The single approved request was then sent from the canonical protected Pages hostname and returned a bounded Tallyo-specific answer; OpenAI usage attributed one Responses request for 27 July UTC. No prompt or answer was opened in provider logs, no secret or private data was inspected, both app and website remained behind Access, and no DNS/Auth/legal/public-release change occurred.

On 2026-07-27 the Owner approved the minimum manual privacy-readiness model as the working public-launch scope. Account closure and deletion requests route to `privacy@tallyo.co.uk` for proportionate identity verification and manual review; Tallyo deletes or anonymises information when no longer necessary, records lawful retention exceptions and explains provider backup cycles without promising an exact closed-account deadline. No self-service closure, 30-day read-only/export window, deletion migration, destructive purge or scheduled retention job is required before launch, and a non-personal tabletop request passed the manual procedure. On 2026-07-28 the Owner approved the Privacy Notice, retention schedule, Article 28 terms and provider-register structure; confirmed the public sole-trader wording and `87 Coles Green Road, NW2 7JH, London, UK`; reported both mailbox tests passed; assigned Edson Oliveira as primary monitor and Claudia Duarte as backup with every-business-day review; limited initial launch to UK business users; confirmed Google Workspace as the official support/privacy record system; and elected to proceed without professional legal review at this stage. Focused account verification was completed afterward. The Owner then separately approved clean customer-facing publication of the Privacy Notice and Data Processing Terms, the related privacy links, focused commit and deployment. Unrestricted public release and all excluded product/provider changes remain separately gated.

Focused read-only provider verification on 2026-07-28 confirmed the Supabase Pro/London project and seven-day backup/log settings with PITR and Log Drains off; Resend Free plans, DPA-on-signup and 30-day email retention; Stripe's GB account and active Billing/Connect/payment role split; Cloudflare's self-serve DPA, Free plans and relevant Access/admin log periods; and GitHub Free/public-repository/Pages status without customer-DPA coverage. The Owner completed and privately retained the Tallyo-specific Supabase DPA dated 28 July 2026. OpenAI's Default project is Global with no project retention override or ZDR/MAM configuration shown; per-call API logging and the Helper's `store: false` behaviour were recorded. Google Workspace Business Starter is active with one assigned licence on the Flexible Plan; domain-administrator access, disabled Gmail auto-deletion, unavailable Vault and licence-limited Data Regions were verified, and the incorporated public CDPA/subprocessor routes were recorded. Focused launch-scope provider verification is complete. No provider setting, secret, customer record, publication or deployment changed.

Privacy-publication lock acquired 2026-07-28:

- `website/src/config.mjs`;
- `website/src/layout.mjs`;
- `website/src/pages.mjs`;
- `website/src/styles.css`;
- `website/scripts/test.mjs`;
- `index.html`;
- focused public legal content derived from the approved privacy pack;
- `APP_STATUS.md`, `DECISIONS.md` and `tasks/ACTIVE.md`.

The Owner explicitly approved publication of the reconciled Privacy Notice and Business-User Data Processing Terms, removal of draft/internal markings from public versions, clear privacy links at registration and genuine public personal-data forms, focused validation, commit and deployment. Public AI activation, marketing/analytics, unrelated application/database/Billing/Connect/provider work, deletion automation and other infrastructure changes remain excluded. Release condition: public pages contain only approved customer-facing content; the service address and mailboxes match the approved record; Data Processing Terms are incorporated into the applicable account agreement; desktop/mobile/keyboard/link checks pass; final diff is privacy-only; deployment succeeds; and final URLs, commit and smoke evidence are recorded.

Privacy-publication implementation lock released 2026-07-28 after the production-mode website/app builds, focused automated checks, desktop and keyboard browser checks, 320/390/768/1024/1440 responsive checks, mobile table-region checks and registration/form link checks passed without page-level overflow. The focused release remains covered by the Owner's exact publication/deployment approval; Access removal, unrestricted public launch and all excluded product/provider work remain out of scope.

Final public-cutover lock released 2026-07-28 after exact Owner approval. The existing website production Access application first gained `tallyo.co.uk` and `www.tallyo.co.uk`; cookie-free requests confirmed default-deny redirects before Pages attachment. Pages replaced only the four Squarespace apex A routes and the Squarespace `www` CNAME, then reported both website domains Active with SSL. Google Workspace and the retained public provider DNS records continued to resolve. The production Helper allowlist now contains the Pages rollback hostname, apex and `www`; the production website was built and deployed once from merged PR #127. One paid synthetic Helper request returned a bounded answer from reviewed public guidance, while the hard provider budget and 50%, 80% and 100% alerts remained active. The Supabase Site URL changed to `https://app.tallyo.co.uk/` with all five rollback redirect URLs retained. Only the website and app production Access applications were removed; both wildcard preview applications remain. Cookie-free requests then returned HTTP 200 for the website, `www` and app. Public legal routes, canonical metadata, registration/legal links, password-recovery UI, CAPTCHA script, retained MFA controls, Billing/Connect interface presence and keyboard skip-link behaviour passed bounded smoke checks. The previously accepted 320/390/768/1024/1440 responsive evidence remains current for the exact merged source. No Stripe transaction/refund, customer communication, analytics/marketing change, secret inspection or unrelated provider change occurred.

PR #102 passed its required checks and merged after exact Owner approval. The applied three commercial migrations and seven deployed functions were reconciled after merge; RLS, grants, JWT settings, migration history, security advisors and the zero-row commercial-table baseline remained correct. Evidence: `COMMERCIAL_PROVIDER_FOUNDATION_DEPLOYMENT_EVIDENCE_2026-07-24.md`.

The Owner approved the sandbox-only commercial acceptance stage on 2026-07-25. Billing Products/Prices, the separate Billing event destination, Customer Portal and private Supabase test settings are configured. Billing is enabled only in the protected non-live preview and Supabase test configuration. One synthetic monthly Checkout, signed entitlement activation, Customer Portal return, cancellation-at-period-end, duplicate replay and stale-event handling pass; rollback-only probes cover renewal, failed payment, seven-day grace, read-only transition and recovery.

The acceptance review recorded a material server-side enforcement gap before repair: the five core application tables still use ownership-only write RLS policies. PR #103 merged the focused, unapplied migration and server guards while preserving owner-scoped reads and service-role provider reconciliation; local PostgreSQL 17 and focused function checks pass.

On 2026-07-25 a separate Stripe sandbox destination was created for connected-account Checkout, refund and dispute events using the reviewed 12-event allowlist. Supabase holds the approved settings and Owner-private secret names. The four sandbox gates are enabled; live mode and live approval remain `false`; the sandbox API version is fixed; and the Access-protected app URL is isolated under `STRIPE_CONNECT_APP_BASE_URL`. The Owner privately completed the first synthetic account's Stripe-hosted onboarding, and Tallyo reports both card payments and payouts ready.

The first onboarding request reached Stripe but failed before account creation because the request explicitly nested `stripe_balance` under Merchant capabilities. PR #104 removed that obsolete field and only `manage-stripe-connect` was redeployed under exact approval. The second request progressed to Stripe's `identity_country_required` validation and still created no account. PR #105 supplied `identity.country = gb`, left legal entity type to Stripe-hosted onboarding and advanced only `manage-stripe-connect` to version 17. The next request created the sandbox account with HTTP 200, then failed on the follow-up GET because Accounts v2 requires indexed `include[0]`, `include[1]` query parameters instead of `include[]`. PR #106 corrected that encoding and only `manage-stripe-connect` was redeployed. The next protected request retrieved the account but requested `account_update`, which Stripe rejected for the not-yet-onboarded account. PR #107 made the server select `account_onboarding` for every non-active account, was merged as `71e92fa`, and only `manage-stripe-connect` advanced from version 18 to 19 with JWT verification retained. The single approved retry opened Stripe-hosted sandbox onboarding and Stripe recorded HTTP 200 for Account Links v2. The entitlement migration and existing live invoice-payment, refund and email functions remain outside any later redeployment. Live mode, public claims and release remain later gates.

After private onboarding completion, the first fictional GBP 1 direct-charge attempt reached deployed `create-connect-checkout` version 15 and returned a controlled HTTP 502 before Stripe Checkout creation. Source reconciliation found that its shared `refreshActiveAccount` helper still sent `include[]` while Accounts v2 requires indexed `include[0]`, `include[1]` and `include[2]`. The focused correction changes only those shared query names and adds a regression assertion. The same shared refresh protects both Connect Checkout and Connect refunds, so redeploying only `create-connect-checkout` and `create-connect-refund` is the exact Owner approval boundary. No payment or refund occurred.

PR #109 merged the indexed shared refresh correction as `c647746`. Only `create-connect-checkout` and `create-connect-refund` were redeployed from that merge; all other function versions and migration state remained unchanged. The fictional GBP 1 direct charge then completed once, the full refund restored the GBP 1 balance and reopened the invoice to Sent, both function invocations returned HTTP 200, and the signed Connect webhook recorded three distinct applied provider events with zero live-mode rows. Replaying the existing `refund.updated` event once returned HTTP 200 while `stripe_connect_events` remained at three and the four expected Connect audit records remained unchanged.

The Owner approved and completed a second synthetic GBP 8 monthly sandbox subscription and a second Stripe-hosted Connect onboarding. Aggregate reconciliation now reports two connected owners, two connected accounts and two fully ready accounts, with zero live-mode connected accounts, Checkout claims or provider events. The second tenant's empty invoice list did not expose the first tenant's invoice or payment history.

### COMM-001-CN-001 finding and remediation evidence

- **Status:** remediated, merged in PR #110 and deployed only to `create-connect-checkout` v17 and `create-connect-refund` v16 from merge `0e390eb`.
- **Severity:** Medium functional/payment-state integrity; payment operations still fail closed.
- **Affected boundary:** `refreshActiveAccount` in the shared Connect Checkout/refund guard.
- **Evidence:** when Stripe returns a valid mapped account whose card-payment or payout capability is no longer active, the helper throws before updating the service-owned mapping. Checkout/refund creation is blocked, but the stored account can remain `active` until a separate status refresh.
- **Invariant:** every server-side provider refresh must persist the normalised provider capability state before allowing or rejecting a new Checkout/refund operation.
- **Narrow fix:** persist only the mapped account's normalised `active`, `pending`, `restricted`, `inactive` or `unknown` capability state and derived onboarding state before returning success or throwing the existing fail-closed error.
- **Compatibility:** preserve tenant/account/mode/responsibility checks, active Checkout/refund behaviour, service-role-only writes, existing messages, Auth/MFA/entitlement gates and all live-mode blocks.
- **Validation:** Connect payment, Connect foundation and payment-integrity harnesses pass; both affected Edge Functions pass frozen-lock Deno checks; formatting, diff hygiene and focused sensitive-value scanning pass. Review confirms normalisation, exact owner/account update binding, persistence before rejection, indexed retrieval, unchanged active behaviour and no disconnected-state mutation.
- **Deployment evidence:** both functions remain active with JWT verification; existing live Checkout v26, refund v23 and document-email v41 were unchanged. Rollback source remains `c647746`.
- **Excluded:** no migration, provider account deletion, reconnection design, secret/configuration change, new payment/refund, live mode or public release. Stripe documents that stricter verification tokens cannot safely downgrade these already-completed sandbox accounts and that test mode might not enforce inactive capabilities, so destructive provider-state testing is not used.
