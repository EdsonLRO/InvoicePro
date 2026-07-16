# Tallyo Final App Regression Evidence - 2026-07-16

Privacy-safe final regression evidence for the current invoicing-app scope. This is not approval for public onboarding, Stripe live mode, real-customer email/payment use, or the deferred SaaS website and subscription platform.

## Release Candidate

- Current app-code release: `2cfb88685be9921c4e799ed461dc4cf833daf7ba` (PR #40).
- Evidence/documentation base: `6932e9bd01a8f6590cdf83c8316f81a3fe6cd1f1` (PR #41).
- Public application: `https://edsonlro.github.io/InvoicePro/`.
- Visible frontend build: `2026.07.16.1`.

## Automated Gate

The following focused Node harnesses passed from merged `main`:

- account data export;
- Auth CAPTCHA integration;
- Edge dependency pins and lock integrity for all nine functions;
- financial action audit controls;
- PWA install/update/offline behavior;
- security-workflow configuration; and
- session expiry and stale-response rejection.

All nine Supabase Edge Functions also passed `deno check --frozen` with their committed v4 lockfiles.

## Deployed Route Regression

The authenticated deployed application was opened read-only at 1280px and 390x844. Each primary route resolved to its expected heading:

| Route | Expected deployed view |
|---|---|
| `#dashboard` | Dashboard |
| `#create` | New Invoice |
| `#invoices` | My Invoices |
| `#customers` | Manage Customers |
| `#items` | Manage Saved Items |
| `#branding` | Branding |
| `#recurring` | Recurring Invoices |
| `#settings` | Company Settings |
| `#account` | User Profile / Account controls |

At both widths, every route had document `scrollWidth` equal to `clientWidth`; no page-level horizontal overflow was present. The browser recorded no warning or error console signal during the route pass.

## Existing Acceptance Reused

The final pass relies on current, separately recorded acceptance for state-changing and provider workflows rather than repeating customer-affecting actions:

- invoice/quote/credit-note creation, editing, status, bulk controls, and PDF behavior;
- customer and saved-item workflows;
- manual and Stripe-confirmed payment/refund handling in sandbox;
- document/reminder email delivery and signed webhook tracking;
- opt-in recurring generation and overdue reminders;
- primary/backup MFA, password change/recovery, and session controls;
- two-account RLS isolation and rolled-back write probes;
- isolated Supabase backup restore;
- account data export; and
- installed-PWA offline shell, reconnection, and existing-install update.

The final browser pass did not save records, send email, create Checkout Sessions, issue refunds, invoke scheduled functions, or alter production configuration.

## Result

The current Tallyo invoicing-app scope is feature-complete and regression-verified for its intended test/portfolio stage.

This does **not** mean live-customer-ready or legally compliant. Remaining launch blockers include public legal/privacy material and operations, robust all-factors-lost recovery, final production abuse-control decisions, payment-operations/legal approval, and a separately approved Stripe live-mode rollout. Stripe remains sandbox-only.
