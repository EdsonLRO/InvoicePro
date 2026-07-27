# Active programme: COMM-001 commercial launch integration

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: Protected commercial release candidate active; final public-release gates remain
Phase: Controlled public release preparation
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
- The AI Helper is merged, privately tested and disabled by default. Its existing encrypted Cloudflare secret is preserved.
- PR #108 merged the fail-closed website subscription signup CTA gate.
- The website remains protected by Access and is not published on `tallyo.co.uk`.
- Under exact Owner approval on 2026-07-26, Stripe live mode now has the approved GBP 8 monthly and GBP 80 annual Tallyo Pro Prices, separate Billing and connected-account webhook destinations, and a configured Customer Portal returning to `https://app.tallyo.co.uk/#account`. The Owner privately entered the restricted Billing/Connect key and both webhook signing secrets in Supabase; their values were not requested, inspected or stored.
- Supabase has the approved live mode/approval settings, exact Price allowlist, app base URLs and five enabled Billing/Connect server gates. Empty unauthenticated requests to the five protected commercial actions and unsigned requests to both webhook functions returned HTTP 401 without creating a live provider object or transaction; focused Billing, Connect, entitlement and payment-integrity harnesses pass.
- Exact local production build permutations pass for subscriptions, connected payments and the separately gated AI Helper. PR #113 merged release build `2026.07.25.1`, and `mfa-recovery` is deployed with `https://app.tallyo.co.uk` plus the retained GitHub Pages and localhost rollback origins. The final hostname is in Supabase Auth redirects and the Turnstile widget; the Supabase Site URL intentionally remains GitHub Pages.
- `SEC-AUTH-006` is remediated. The Owner rotated the exposed Turnstile server secret and entered its replacement directly into Supabase Auth without Codex inspecting it. CAPTCHA-protected sign-in, custom-domain MFA, exact-origin CORS and lookalike-origin rejection pass.
- Authoritative DNS now uses Cloudflare with DNSSEC active. All 19 prior Squarespace records were preserved, the Squarespace website and Google Workspace/Resend DNS checks pass, and the four prior Squarespace nameservers are the documented rollback. `app.tallyo.co.uk` was protected by the existing default-deny Access application before it was attached to Pages; Pages reports Active with SSL, while anonymous requests are redirected to Access.
- Under exact Owner approval on 2026-07-27, the database-owner-only `subscription_write_enforcement` switch was enabled. Privacy-safe reconciliation found nine accounts with business data: three full/grace accounts remain write-enabled, six are read-only and an unknown account cannot write. Authenticated and service roles cannot change the switch, and the Supabase security advisor remains clear.
- The approved non-secret production variables were entered directly into Cloudflare Pages and the app and website were each rebuilt once from merge `f34a8ae`. Build `2026.07.27.1` is active at the Access-protected app domain with live Billing UI enabled. The Access-protected website builds in production mode with subscription and connected-payment navigation enabled and correct `app.tallyo.co.uk` links. Anonymous requests to both endpoints still redirect to Access. Public AI remains disabled, the Supabase Auth Site URL remains unchanged and no DNS/publication cutover occurred.

## Current controlled-provider scope

- preserve the applied schema and verified server-side function boundaries;
- preserve the verified Billing, Connect, entitlement and Owner-payment boundaries;
- complete final protected smoke testing for the public-release candidate;
- keep the public AI Helper disabled until its separate production notice, budget, rate-limit and activation approval;
- stop before Access removal, Supabase Auth Site URL cutover, website-domain publication or final public release.

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

Release condition: completed for the protected app-domain stage. Every recovery origin and Auth/MFA invariant was retained; repository, provider, DNSSEC, Access, Pages, CORS and Owner-completed MFA acceptance passed. Access removal, Supabase Site URL cutover and public release remain separate gates.

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

## Explicit exclusions until separately approved

- no live Stripe subscription, connected-account identity onboarding, payment, refund, real customer or real-money transaction without a separate exact acceptance approval;
- no function redeployment or migration change outside the exact approved sandbox-acceptance scope;
- no secret reveal or repository/browser storage;
- no existing Owner-route function redeployment without the exact pre-deployment approval;
- no unrestricted public AI activation or paid OpenAI request;
- no Access removal, Supabase Site URL cutover, website-domain publication, legal publication or public production release;
- no deployment or production-provider change to the Owner-account invoice-payment path.

## Staged delivery

1. **Connect decision and implementation boundary** - completed.
2. **Repository implementation and PR review** - completed through PR #101.
3. **Disabled provider foundation** - completed: applied the three reviewed additive migrations, deployed seven new functions, verified RLS/grants/advisors/JWT settings and retained absent feature gates.
4. **Isolated test acceptance** - completed for the approved non-destructive sandbox scope: protected Billing Checkout, Portal, signed reconciliation and lifecycle probes pass. Connect sandbox secrets and gates are configured. PRs #104-#110 passed the payout-field, UK-country, indexed-retrieval, trusted Account Link-flow, shared Checkout/refund retrieval and provider-unavailable gates. Two isolated synthetic owners map to two separate fully ready sandbox accounts with zero live-mode rows. The first account's fictional GBP 1 direct charge and full refund reconciled through signed webhooks, and one exact `refund.updated` replay returned HTTP 200 without another Connect event or audit mutation. Destructive provider downgrade was not used because Stripe test-mode capability handling cannot provide a reliable reversible simulation; the server path instead has focused fail-closed source and harness evidence.
5. **AI release readiness** - preserve the existing secret and preview; separately approve public notice, budget, rate limits and activation.
6. **Production release** - authoritative DNS, the Access-protected app hostname, live Billing/Connect provider configuration and bounded live acceptance are complete. Subscription write enforcement, final app/website flags, Access removal, Site URL cutover, website publication and final public release remain separately approved gates.

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
