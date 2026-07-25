# Active programme: COMM-001 commercial launch integration

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: Billing and two-account Connect sandbox acceptance complete for the approved non-destructive scope; website commercial integration under review
Phase: Controlled provider preparation
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
- PR #103 merged the focused, unapplied entitlement RLS migration and server-side guards. Disposable PostgreSQL 17 RLS, privilege, tenant-isolation and service-role reconciliation probes pass; the migration remains unapplied.
- Under exact Owner approval, the four Connect sandbox gates were enabled while live mode remained disabled. The Owner privately configured the Connect key and webhook signing secret. PRs #104-#110 corrected and validated the Accounts v2 onboarding, Checkout/refund refresh and provider-unavailable paths. Two synthetic owners completed isolated onboarding; one fictional GBP 1 direct charge and full refund reconciled through signed webhooks, and one exact replay caused no duplicate mutation. Only the approved Connect functions were advanced, while existing live Owner-route functions remained unchanged.
- No existing Owner invoice-payment, refund or email function was redeployed.
- The AI Helper is merged, privately tested and disabled by default. Its existing encrypted Cloudflare secret is preserved.
- PR #108 merged the fail-closed website subscription signup CTA gate; subscriptions remain disabled by default.
- The website remains privately previewed and is not published on `tallyo.co.uk`.

## Current controlled-provider scope

- preserve the applied schema and disabled function boundary;
- complete the protected Billing acceptance integration, controlled subscription lifecycle probes and focused server-side entitlement enforcement under the Owner's 2026-07-25 approval;
- configure and run the approved synthetic multi-account Connect acceptance after Billing acceptance;
- keep the existing Owner invoice-payment route isolated and unchanged until its allowlist secret and source redeployment receive separate approval;
- continue non-provider website and AI readiness work that does not activate public services.

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

## Explicit exclusions until separately approved

- no live Stripe Billing or Connect configuration, live Price, live secret, real customer or real-money transaction;
- no function redeployment or migration change outside the exact approved sandbox-acceptance scope;
- no secret reveal or repository/browser storage;
- no existing Owner-route function redeployment without the exact pre-deployment approval;
- no unrestricted public AI activation or paid OpenAI request;
- no DNS cutover, legal publication or public production release;
- no deployment or production-provider change to the Owner-account invoice-payment path.

## Staged delivery

1. **Connect decision and implementation boundary** - completed.
2. **Repository implementation and PR review** - completed through PR #101.
3. **Disabled provider foundation** - completed: applied the three reviewed additive migrations, deployed seven new functions, verified RLS/grants/advisors/JWT settings and retained absent feature gates.
4. **Isolated test acceptance** - completed for the approved non-destructive sandbox scope: protected Billing Checkout, Portal, signed reconciliation and lifecycle probes pass. Connect sandbox secrets and gates are configured. PRs #104-#110 passed the payout-field, UK-country, indexed-retrieval, trusted Account Link-flow, shared Checkout/refund retrieval and provider-unavailable gates. Two isolated synthetic owners map to two separate fully ready sandbox accounts with zero live-mode rows. The first account's fictional GBP 1 direct charge and full refund reconciled through signed webhooks, and one exact `refund.updated` replay returned HTTP 200 without another Connect event or audit mutation. Destructive provider downgrade was not used because Stripe test-mode capability handling cannot provide a reliable reversible simulation; the server path instead has focused fail-closed source and harness evidence.
5. **AI release readiness** - preserve the existing secret and preview; separately approve public notice, budget, rate limits and activation.
6. **Production release** - separately approve live provider configuration, secrets, payment acceptance, DNS and publication.

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
