# Active programme: COMM-001 commercial launch integration

Task ID: COMM-001
Title: Integrate subscriptions, independent-business customer payments and the public AI Helper for controlled commercial release
Priority: High
Status: First Connect foundation implementation complete; local verification passed and high-risk PR preparation is in progress
Phase: Repository-only implementation and verification
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
- The Billing migration remains unapplied, the Billing functions remain undeployed and Stripe Billing is not configured.
- The Connect account/onboarding foundation is implemented on the active branch, unapplied, undeployed and provider-disabled. Customer payment, refund and webhook paths are not implemented.
- The AI Helper is merged, privately tested and disabled by default. Its existing encrypted Cloudflare secret is preserved.
- The website remains privately previewed and is not published on `tallyo.co.uk`.

## Current repository-only scope

- reconcile the completed BILL-003 record;
- verify current official Stripe Connect, Stripe Billing, Supabase and OpenAI requirements;
- record the recommended Connect account, responsibility, onboarding and charge model;
- design the tenant-bound database, Edge Function, UI, webhook, entitlement and rollback boundaries;
- identify the smallest independently reviewable implementation stages;
- prepare focused tests and release evidence;
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

- no Stripe or Supabase provider configuration;
- no cloud migration application or Edge Function deployment;
- no secret reveal, replacement, rotation or new secret entry;
- no Stripe Product, Price, webhook, Customer Portal or connected-account creation;
- no test or live payment, refund, dispute or subscription;
- no unrestricted public AI activation or paid OpenAI request;
- no DNS cutover, legal publication or public production release;
- no change to the Owner-account invoice-payment path.

## Staged delivery

1. **Connect decision and implementation boundary** — select the recommended model using current official sources and stop for Owner approval.
2. **Repository implementation** — add unapplied schema, disabled functions, UI states and focused tests. Stop for high-risk PR approval.
3. **Isolated test acceptance** — separately approve Supabase test application, Stripe test configuration, synthetic connected accounts and test payments.
4. **Billing acceptance and entitlement integration** — separately approve test products/prices, deployment and subscription lifecycle tests.
5. **AI release readiness** — preserve the existing secret and preview; separately approve public notice, budget, rate limits and activation.
6. **Production release** — separately approve live provider configuration, secrets, payment acceptance, DNS and publication.

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

The first implementation slice now adds only the unapplied database foundation, disabled onboarding/status function, Account-page UI state and focused tests. It must stop for explicit Owner approval before the high-risk PR is marked ready or merged.

After that merge, a separate repository-only slice may implement direct-charge Checkout, connected refunds and signed connected-account webhooks under the approved model. Applying either migration, deploying any function, configuring Stripe/Supabase, creating a connected account or making a payment requires another exact Owner approval.
