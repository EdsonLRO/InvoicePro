# Income insights and MTD-supporting records plan

Status: Phase 0 design and Phase 1 shared calculations are approved and merged. Phase 2 customer financial visuals are implemented behind a fail-closed public-release gate for focused review; no public activation is approved.

Last reviewed: 6 October 2026.

## Objective

Use information Tallyo already records to give each business a clear visual view of its invoice income and to prepare useful income records for an accountant or compatible Making Tax Digital (MTD) workflow.

This scope does not add expenses, bank feeds, bookkeeping, tax calculation or HMRC submission. It must not imply that Tallyo knows the business's complete income, expenses, profit, tax liability or bank balance.

The customer-facing name is **Finances**. The page describes its figures as **income recorded in Tallyo**.

## Phase 1 implementation reference

`income-insights.js` is the single pure calculation module for the future Overview, Customer and Finances consumers. It accepts only the invoice documents already loaded for the authenticated owner and performs no database query, provider request, write, payment action, email, analytics or browser-storage access.

Its canonical result contains:

- calculation version, scope notice, selected period and customer filter;
- one independent report per currency, with no combined cross-currency total;
- issued value, positive dated payments, refunds, net received, outstanding, overdue and invoice tax context;
- exact monthly, customer and workflow-source breakdowns;
- payment/refund ledger rows with traceable invoice and customer references;
- payment-time context only where dated records establish full payment;
- records-organised readiness totals and explicit issue codes.

The module is UMD-compatible so focused Node tests and browser integration use the same source. During Phase 1 it was deliberately not loaded by `index.html`, so that phase left the released Overview and customer interface unchanged. `tests/income-insights-harness.cjs` covers the minimum financial fixture matrix and characterises compatibility with the released Overview semantics.

## Phase 2 implementation reference

The customer detail view now has a gated **Income recorded in Tallyo** area powered directly by the Phase 1 module. It adds six exact summary values, a native CSS monthly net-receipts chart with a keyboard-accessible written-value table, a payment-position doughnut with repeated labelled values, workflow-source context and recent payment/refund activity. It collects no new data and makes no database, provider, payment, email, analytics or storage request.

`TALLYO_INCOME_INSIGHTS_ENABLED` remains false in the checked-in public configuration and generated builds require `TALLYO_INCOME_INSIGHTS_PUBLIC_RELEASE_APPROVED=true` before the feature can be enabled. The isolated fictional redesign preview enables it for browser acceptance only. `tests/income-insights-customer-ui-harness.cjs` verifies exact customer-ID scope, retained snapshots, separate currencies, canonical totals, accessible equivalents and the fail-closed release boundary.

## Existing product baseline

Tallyo already stores or derives:

- invoices, quotes and standalone credit notes;
- invoice issue and due dates;
- document status and currency;
- customer ownership plus the customer snapshot retained on a document;
- line items, discounts, shipping and tax values shown on an invoice;
- dated manual payment records;
- signed Stripe-confirmed card payments and refund adjustments;
- deposits and part-payments as payment amounts against an invoice;
- outstanding and overdue balances;
- recurring-invoice origin;
- preserved quote-to-invoice linkage for accepted quotes;
- document and payment activity history.

The released Overview already shows Outstanding, Overdue and Paid this month, separated by currency. The released customer detail view already shows outstanding, payments recorded, linked documents, recurring schedules and recent activity. The planned work extends this verified baseline instead of creating a second reporting model.

## Product boundary

### Tallyo may show

- invoice value issued through Tallyo;
- money recorded as received against Tallyo invoices;
- refunds recorded against those payments;
- net recorded receipts after refunds;
- outstanding and overdue invoice balances;
- income by customer;
- income over time;
- payment speed where a reliable payment date exists;
- document source, such as one-off, recurring or accepted-quote invoice;
- invoice line-item or saved-product breakdown where the existing record supports it;
- tax shown on invoices, clearly separated from any tax calculation;
- MTD-supporting income records and period summaries.

### Tallyo must not show or claim

- complete business income;
- a live bank balance;
- expenses or profit;
- deductible expenses;
- VAT due or recoverable;
- estimated Income Tax or National Insurance;
- MTD compliance, HMRC recognition, filing or submission;
- accountant approval;
- tax advice.

Persistent wording on Finances and exports:

> These figures cover invoices and payments recorded in Tallyo. Income received elsewhere and business expenses are not included.

## Calculation contract

The calculation contract is the first implementation deliverable. UI work must consume one tested calculation module rather than independently recreating totals in each screen.

### Record inclusion

| Measure | Definition |
|---|---|
| Issued invoice value | Grand total of invoice documents that are no longer Draft or Cancelled, grouped by invoice issue date. |
| Money received | Sum of positive, dated payment entries attached to invoice documents, grouped by payment date. |
| Refunds | Absolute sum of negative, dated refund entries, grouped by refund date and shown separately. |
| Net received | Positive dated payments plus negative dated refund entries. |
| Outstanding | Invoice grand total less its net recorded payments, excluding Draft and Cancelled invoices. |
| Overdue | Positive outstanding balance where the due date is before the current business date. It is a subset of Outstanding. |
| Payment time | Days between invoice issue date and the date the invoice first becomes fully paid from dated payment entries. |
| Tax shown | Tax calculated from the issued invoice's saved line items and tax mode. It is invoice context, not tax due. |

### Required exclusions and qualifications

- Quotes never count as income.
- An accepted quote counts only through its linked invoice and only under the normal invoice/payment rules.
- Draft and Cancelled invoices do not count as issued invoice value or outstanding.
- A Paid status without dated payment records does not count as money received. It appears in **Needs review**.
- A payment without a valid date does not enter a period total. It appears in **Needs review**.
- Deposits and part-payments count only at the amount and date recorded.
- Refunds remain separate negative records; the interface shows gross received, refunds and net received without hiding the adjustment.
- Standalone credit notes are shown separately and do not automatically reduce receipts or an invoice balance because the current product does not link them to an invoice.
- Disputed payment information is informational and must not silently rewrite income totals outside the existing signed payment/refund lifecycle.
- Each currency is calculated and displayed separately. No exchange-rate conversion or cross-currency total is permitted.
- Values use saved document/payment data rather than inferred bank settlement or Stripe payout values.
- Tax must not be proportionally allocated to a part-payment without an expressly reviewed rule. The first release shows invoice tax context, not VAT collected per payment.

### Income category model

For the first release, invoice-derived receipts map to one plain-language category:

| Tallyo label | Export label | Basis |
|---|---|---|
| Sales from invoices | Turnover / sales | A payment recorded against a Tallyo invoice. |

One-off, recurring and accepted-quote invoices are **workflow sources**, not different tax categories. Tallyo does not currently hold a safe field for other business income, so it must not invent that category or infer it from free text.

## User experience structure

### Global navigation

Add **Finances** as a first-level application destination after the calculation contract and design have been approved.

Finances contains:

1. Overview
2. Income records
3. Customers
4. Periods
5. Exports

The default date choices are This month, This quarter, This tax year, Previous tax year and Custom dates. Currency is always explicit.

### Finances overview

The first screen answers four questions:

1. How much did I invoice?
2. How much did I receive?
3. How much am I waiting for?
4. Is anything overdue?

Summary cards:

- Invoiced
- Received
- Refunds
- Net received
- Still to be paid
- Overdue

Primary visuals:

1. **Money received over time** — accessible monthly column chart.
2. **Payment position** — doughnut chart for paid, outstanding and overdue, with Overdue visibly identified as part of Outstanding rather than added to it.
3. **Income by customer** — ranked horizontal bars.
4. **Income source** — one-off, recurring and accepted-quote invoice bars or labelled segments.
5. **Records organised** — progress ring based only on explicit readiness checks.

Every chart must also expose exact written values and a table or list. Colour is never the only means of conveying a value. Native HTML/CSS/SVG is preferred over adding a charting dependency unless a later review proves that a dependency materially improves accessibility or maintainability.

### Customer financial view

Extend the released customer detail view with the selected customer's:

- issued invoice value;
- money received;
- refunds;
- net received;
- outstanding;
- overdue;
- average payment time, only when enough dated payments exist;
- recent invoice/payment/refund timeline;
- payment-position doughnut;
- monthly receipts chart;
- most-used products or services where line-item data is reliable;
- recurring schedules and accepted-quote invoice origin.

Customer wording is always **invoice figures for this customer**. It must never say customer profit or lifetime value.

### Income records

Provide a readable ledger derived from existing invoice payments. Each record shows:

- payment or refund date;
- customer;
- invoice number and issue date;
- description derived from the invoice reference, not invented narrative;
- amount;
- currency;
- payment source where recorded;
- category: Sales from invoices;
- workflow source: one-off, recurring or accepted quote;
- related invoice tax shown;
- record status and any review warning.

Filters:

- date or period;
- customer;
- currency;
- payment or refund;
- full or part-payment;
- card-confirmed or manually recorded;
- one-off, recurring or accepted-quote origin;
- ready or needs review.

### Needs review

Readiness is a data-quality aid, not a compliance score. Checks include:

- Paid invoice without dated payment records;
- payment or refund without a valid date;
- payment total greater than the supported invoice balance outside a reviewed refund lifecycle;
- standalone credit note requiring separate reconciliation;
- missing customer or invoice reference;
- invalid currency or mixed-currency presentation attempt;
- tax-bearing invoice whose saved line data cannot reproduce the stored total;
- payment record whose provider lifecycle is uncertain.

The progress ring uses the label **Records organised**, followed by the exact numerator and denominator, for example “46 of 49 income records ready”. It never uses “MTD compliant”.

## MTD-supporting period view

MTD support is an optional UK records view inside Finances. It does not change the general international invoice-income dashboard.

The standard tax-year timeline shows:

- Period 1: 6 April to 5 July; deadline 7 August;
- Period 2: start of tax year to 5 October; deadline 7 November;
- Period 3: start of tax year to 5 January; deadline 7 February;
- Period 4: start of tax year to 5 April; deadline 7 May.

Calendar update periods for a 31 March accounting year are a later selectable variant and must be set before the first quarterly update in the relevant workflow. The view must clearly distinguish:

- **Activity during this period**; and
- **Tax year to date**.

HMRC currently describes quarterly updates as cumulative summaries generated from digital income and expense records. Tallyo provides only its income side in this scope. See:

- [Create digital records](https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax/create-digital-records)
- [Send quarterly updates](https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax/send-quarterly-updates)
- [Digital record-keeping direction](https://www.gov.uk/government/publications/digital-record-keeping-notice-for-making-tax-digital-for-income-tax/making-tax-digital-for-income-tax-digital-record-keeping-notice)

Each period shows:

- number of income records;
- gross money received;
- refunds;
- net recorded income;
- customers who paid;
- records needing review;
- a link to the underlying records.

The page does not display a tax estimate or a button to submit to HMRC.

## Export scope

The first export is named **MTD-supporting income records** or **Prepare income records**, never “MTD return”.

Candidate files:

- `income-records.csv`
- `customer-income-summary.csv`
- `income-by-period.csv`
- `invoice-index.csv`
- `refunds-and-credit-notes.csv`
- `income-summary.pdf`

Every CSV includes an export version, period, currency and generated timestamp. The detailed income file includes the payment date, amount, category, customer, invoice reference, invoice issue date, workflow source, payment source and review state. Supporting invoice values may include gross, net and tax shown when reproducible from saved data.

The PDF begins with:

> Income records from Tallyo only. This pack does not include expenses or income received outside Tallyo and is not an HMRC submission.

Export implementation must preserve owner scoping, formula-injection protection, deterministic column order, UTF-8 encoding and exact decimal formatting. Sensitive customer information is included only where necessary and the existing trusted-device export warning remains.

## Delivery phases

Each phase is a separate objective, branch, focused validation set and pull request.

### Phase 0 — Approved plan and design specification

Deliverables:

- this scope and calculation contract;
- desktop and mobile wireframes using fictional reconciled data;
- chart accessibility specification;
- explicit empty, loading, error, mixed-currency and needs-review states;
- calculation examples covering payments, deposits, part-payments and refunds.

Exit criteria:

- Owner approves the wording, layouts and calculation examples;
- no production source, database or provider change;
- no claim exceeds the product boundary.

### Phase 1 — Shared read-only calculation module

Deliverables:

- pure calculation module using existing owner-loaded invoice records;
- one canonical result shape for Overview, Customers and Finances;
- deterministic period and currency grouping;
- data-quality/readiness results;
- focused unit and invariant tests.

Exit criteria:

- totals reconcile across full, partial, deposit and refunded invoices;
- quotes, drafts, cancelled invoices and standalone credit notes follow the contract;
- current Overview totals remain unchanged unless an identified defect is deliberately fixed;
- no migration, write path or provider call.

### Phase 2 — Customer financial visuals

Deliverables:

- expanded customer summary and two compact visuals;
- accessible data equivalents;
- customer activity and source breakdown;
- responsive desktop/mobile/keyboard behaviour.

Exit criteria:

- only records linked to the selected owner and customer contribute;
- customer snapshots remain historical evidence and are not silently rewritten;
- all currencies remain separated;
- no new data collection.

Implementation state: complete for focused Owner review. Public activation remains reserved for Phase 6 release hardening and approval.

### Phase 3 — Finances overview

Deliverables:

- Finances navigation and overview;
- summary cards and five bounded visuals;
- period and currency controls;
- needs-review panel;
- plain-language “How these figures work” disclosure.

Exit criteria:

- exact values are available without interpreting charts;
- mobile charts have no horizontal page overflow;
- calculations match the shared module and CSV fixtures;
- no chart library or third-party network request unless separately approved.

### Phase 4 — Income records and period view

Deliverables:

- filterable income ledger;
- UK standard-period and tax-year-to-date presentation;
- direct navigation from charts to supporting records;
- clear income-only and non-filing notices.

Exit criteria:

- period totals reconcile exactly with the ledger;
- current HMRC dates and cumulative-period interpretation are rechecked before release;
- no HMRC credentials, API, filing or compatibility claim.

### Phase 5 — Income Pack exports

Deliverables:

- versioned CSV files and human-readable PDF summary;
- readiness report and limitations statement;
- export manifest and calculation version;
- large-record and spreadsheet-safety tests.

Exit criteria:

- every summary total traces to exported income rows;
- CSV formula injection and malformed-data cases are neutralised;
- owner isolation and account-export behaviour pass regression checks;
- an accountant can understand the income-only boundary without product guidance.

### Phase 6 — Release hardening and controlled publication

Deliverables:

- full application, accessibility, responsive, security and export regression pass;
- current public wording review;
- app build/cache update and rollback instructions;
- fictional-data acceptance walkthrough.

Exit criteria:

- separate Owner approval for merge and production publication;
- no live payment, refund, email or provider mutation during validation;
- production checks inspect only public/build evidence, not customer records.

## Test matrix

At minimum, fixtures cover:

- full manual payment;
- full Stripe-confirmed payment;
- deposit followed by final payment;
- multiple part-payments across two periods;
- full and partial refund;
- refund in a later tax period;
- Paid status without payment entries;
- payment without date;
- overdue invoice with and without a part-payment;
- recurring invoice and accepted-quote invoice;
- quote, Draft, Cancelled invoice and standalone credit note exclusions;
- inclusive and exclusive tax invoices;
- discounts and shipping;
- multiple currencies;
- deleted customer with retained document snapshot;
- more records than one database page;
- start/end tax-period boundaries and leap year;
- screen reader, keyboard, reduced-motion and 320 px layouts;
- exported values beginning with spreadsheet formula characters.

## Approval and risk boundary

Planning and fictional-data design are Medium risk. Calculation logic becomes financially material and requires focused review before merge. Any migration, server aggregation, RLS change, Stripe runtime change, live transaction, public tax claim, HMRC integration or production release is separately gated.

This plan does not authorise implementation, deployment or public claims. Phase 0 design work is the next proposed action.
