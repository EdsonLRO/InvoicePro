# Active programme: COMM-001 commercial launch integration

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: Billing and Connect provider foundations deployed but disabled; test-provider configuration pending
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
- After a completed 2026-07-24 physical backup, the Owner-approved production-preparation stage applied the Billing and both Connect migrations and deployed the seven new functions at version 1.
- All Billing and Connect functions remain fail-closed: no commercial feature flag, provider secret, Product, Price, event destination, connected account or live-release gate is configured.
- No existing Owner invoice-payment, refund or email function was redeployed.
- The AI Helper is merged, privately tested and disabled by default. Its existing encrypted Cloudflare secret is preserved.
- The website remains privately previewed and is not published on `tallyo.co.uk`.

## Current controlled-provider scope

- preserve the applied schema and disabled function boundary;
- prepare exact Stripe sandbox Products/Prices, event destinations, test key and feature-gate configuration;
- run synthetic subscription and multi-account Connect acceptance only after another exact Owner approval;
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

- no further Stripe or Supabase provider configuration;
- no function redeployment or migration change;
- no secret reveal, replacement, rotation or new secret entry;
- no Stripe Product, Price, webhook, Customer Portal or connected-account creation;
- no test or live payment, refund, dispute or subscription;
- no unrestricted public AI activation or paid OpenAI request;
- no DNS cutover, legal publication or public production release;
- no deployment or production-provider change to the Owner-account invoice-payment path.

## Staged delivery

1. **Connect decision and implementation boundary** - completed.
2. **Repository implementation and PR review** - completed through PR #101.
3. **Disabled provider foundation** - completed: applied the three reviewed additive migrations, deployed seven new functions, verified RLS/grants/advisors/JWT settings and retained absent feature gates.
4. **Isolated test acceptance** - separately approve Stripe sandbox Products/Prices, event destinations, protected settings, synthetic connected accounts, test subscriptions and test invoice payments/refunds.
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

PR #101 passed its required check and merged after exact Owner approval. The subsequent Owner-approved provider-foundation stage applied the three commercial migrations and deployed only the seven new disabled functions. Evidence: `COMMERCIAL_PROVIDER_FOUNDATION_DEPLOYMENT_EVIDENCE_2026-07-24.md`.

The next gate is Stripe sandbox configuration and synthetic acceptance. Entering any test key or webhook secret, creating Products/Prices or event destinations, enabling a Billing/Connect gate, creating a connected account, or making a test subscription/payment/refund requires another exact Owner approval. Live mode, existing Owner-route redeployment, public claims and release remain later separate gates.
