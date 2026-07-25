# Active programme: COMM-001 commercial launch integration

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: Billing sandbox lifecycle accepted; server-side entitlement enforcement gap under review; Connect sandbox configuration pending
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
- The acceptance review found that the core application write RLS policies still enforce ownership only and do not yet require the verified Billing entitlement. The browser cannot grant entitlement, but restricted/read-only access is not yet a complete server-side application boundary. This finding must be corrected and independently verified before Billing acceptance can close.
- Connect remains fail-closed with no connected account or enabled release gate.
- No existing Owner invoice-payment, refund or email function was redeployed.
- The AI Helper is merged, privately tested and disabled by default. Its existing encrypted Cloudflare secret is preserved.
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
4. **Isolated test acceptance** - in progress under the 2026-07-25 Owner approval: protected Billing Checkout, Portal, signed reconciliation and lifecycle probes pass. Core write RLS remains ownership-only, so focused server-side entitlement enforcement and independent review are next, followed by Connect sandbox configuration and synthetic multi-account testing.
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

The acceptance review recorded a material server-side enforcement gap before repair: the five core application tables still use ownership-only write RLS policies. The next gate is a focused, unapplied migration and supporting tests that preserve owner-scoped reads while requiring verified `full` or `grace` entitlement for authenticated writes. Existing service-role provider reconciliation must remain available, and existing live invoice-payment, refund and email functions must not be redeployed without the exact pre-deployment approval required by this task. Live mode, Connect sandbox activity, public claims and release remain later gates.
