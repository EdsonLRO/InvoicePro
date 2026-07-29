# Active programme: COMM-001 commercial launch integration

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

Status: Owner Approval Required
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
Next action: Owner review of the focused draft PR before merge and publication
of app build `2026.07.29.2`

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
