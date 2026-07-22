# WEB-002 — Privacy-first free document generator

Task ID: WEB-002  
Owner: Master Orchestrator  
Assigned roles: Product, Frontend, Payments, Legal/Privacy, Security, QA, Release  
Not triggered: Backend, Supabase/Auth, MFA, RLS, Stripe provider configuration, Resend, database migrations  
Risk: High — financial calculations, tax presentation and printable business documents  
Status: In progress  
Scope lock: `website/src/document-calculator.mjs`, `website/src/generator.js`, generator routes in `website/src/pages.mjs`, generator styles, website build/tests, and directly changed authoritative status records.

## Objective

Replace the public website's invoice/quote placeholders with one useful,
account-free Invoice, Quote and Estimate maker. It must calculate deterministically,
preview responsively and use the browser print dialog for printing or saving PDF.

## Preserved boundaries

- No authentication, private account data, Supabase, Stripe, Resend, provider
  settings, production secrets, database writes or new runtime dependency.
- No automatic draft, local storage, cookie, analytics event transport, upload or
  network request. A selected logo remains an in-memory browser object URL and is
  revoked when removed or the page is closed.
- No import into an authenticated account in this phase.
- No claim of legal, tax, accounting, VAT or regulatory compliance.
- Repository/private-preview implementation only. Public website publication,
  Cloudflare configuration, DNS and final release remain Owner-gated.

## Calculation contract

- Money accepts at most two decimal places and is stored as integer minor units.
- Quantity accepts at most three decimal places; percentage inputs accept at most
  two decimal places.
- Each line amount is rounded half up to the nearest minor unit.
- A line discount is applied before its tax. Tax is then rounded per line.
- Additional cost and its selected tax rate are calculated separately before
  joining document net, tax and total values.
- Inputs are non-negative and bounded; a document has at most 50 lines.
- Supported display currencies in this phase are GBP, EUR and USD. The tool blocks
  printing an invoice with a VAT number in a non-GBP currency because it does not
  calculate the separately required sterling VAT values.

## Official source check

Current GOV.UK guidance was checked on 2026-07-22:

- <https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include>
- <https://www.gov.uk/hmrc-internal-manuals/vat-trader-records/vatrec5010>
- <https://www.gov.uk/guidance/foreign-currency-transactions-vat-and-tour-operators>

The form includes reference, issue date, supply date, sender identity/address,
customer identity/address, description, quantity, unit price, discount, tax,
VAT number, totals and contact fields. Users are told to check the output against
their own position and are linked to the current GOV.UK requirements.

## Acceptance gates

- [x] Deterministic unit tests cover quantities, discounts, multiple tax rates,
  shipping/additional cost, zeros, decimal rounding, invalid inputs and bounds.
- [x] Invoice and quote routes share the reviewed engine and expose Invoice, Quote
  and Estimate modes without authentication.
- [x] Static checks prove the generator assets contain no network, tracking,
  cookies or browser-persistence APIs.
- [x] Desktop in-app-browser acceptance confirms live calculation of GBP 185.00
  net + GBP 37.00 tax = GBP 222.00 total for the reviewed synthetic scenario.
- [x] A 390 x 844 in-app-browser pass confirms no page-level horizontal
  overflow; the wide item table is confined to an explicit horizontal-scroll
  region and totals remain readable. The validated synthetic print action opens
  the browser print/save-PDF path and reveals the contextual account CTA.
- [x] Sequential High-risk review confirms integer-minor-unit calculation,
  bounded inputs, per-line rounding, browser-only privacy, text-only rendering of
  user values, SVG exclusion, accessible fieldsets/labels/status/table semantics,
  conservative tax wording, GOV.UK source links and the focused diff.
- [ ] Required GitHub check passes on the final branch state.
- [ ] Owner approves ready/merge and any later public website release separately.

## Legal disposition

Approved with conditions for repository implementation and private preview. The
calculator must remain an aid, not tax/accounting advice; foreign-currency VAT is
blocked as described above. External professional review remains required for
customer-facing legal/tax conclusions and final unrestricted public launch.
