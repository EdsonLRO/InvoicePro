# Tallyo Income Insights Phase 0

Design-only artifacts for Owner review. No production UI, calculation, database, payment, provider, deployment or customer-data change is included.

## References

- `desktop-finances.png` / `desktop-finances.html`: the business-level Finances overview.
- `mobile-finances.png` / `mobile-finances.html`: the same information in a true 390px mobile layout.
- `desktop-customer-finances.png` / `desktop-customer-finances.html`: a customer-level Finances view.
- `mobile-customer-finances.png` / `mobile-customer-finances.html`: the customer view on mobile.
- `states.png` / `states.html`: loading, empty, calculation error, mixed-currency and needs-review states.
- `shared.css`: isolated visual styles shared by the references.
- `phase0-harness.cjs`: deterministic reconciliation and wording-boundary checks.
- `render-phase0.cjs`: isolated local renderer and geometry/accessibility checks.

The references retain the unmodified official `tallyo-wordmark-white.png`, system typography, navy/indigo palette, white surfaces and restrained slate borders used by the approved Tallyo redesign. Every company, customer, document, date and amount is fictional. Email addresses use the reserved `.example` domain.

## Scope and wording contract

The feature is **Income recorded in Tallyo**, not full bookkeeping or an MTD filing product. It may summarise issued invoice value, dated payment records, refunds, net recorded receipts, amounts still to be paid, overdue amounts, customer breakdowns, time periods and existing workflow sources. It must not claim to show complete business income, bank balances, expenses, profit, VAT or tax due, MTD compliance, filing or submission.

The persistent boundary text is:

> These figures cover invoices and payments recorded in Tallyo. Income received elsewhere and business expenses are not included.

Customer views use the same statement scoped to the selected customer. Workflow sources—one-off invoices, recurring invoices and invoices created from accepted quotes—are context only. They export under the single proposed category **Sales from invoices**; they are not tax categories.

## Calculation contract

- **Invoiced**: total value of issued invoices in the selected invoice-date period. Draft and cancelled documents, quotes and standalone credit notes are excluded.
- **Received**: positive, dated payment records in the selected payment-date period.
- **Refunds**: dated refund records shown separately as a positive display amount.
- **Net received**: received minus refunds.
- **Still to be paid**: remaining balance on eligible issued invoices. It includes overdue balances.
- **Overdue**: the overdue subset of still to be paid; it is never added on top of outstanding.
- **Needs review**: records excluded from affected received-income totals because required evidence is missing or ambiguous. Examples include a payment without a payment date, a Paid invoice without a dated payment record, and a standalone credit note awaiting an explicit treatment.
- Currencies remain separate. A currency must be selected before totals are shown; no implicit conversion is proposed.
- A quote contributes nothing. An accepted quote contributes only through its separate linked invoice and any dated payment/refund records on that invoice.

### Reconciled fictional business example

| Measure | Amount |
| --- | ---: |
| Issued invoices | £18,420 |
| Positive dated payments | £15,560 |
| Refunds | £180 |
| Net received | £15,380 |
| Still to be paid | £3,040 |
| Overdue subset | £620 |

`£15,560 - £180 = £15,380` and `£15,380 + £3,040 = £18,420`. Monthly, customer and workflow-source net totals each independently reconcile to £15,380. The readiness example has 46 of 49 records organised; two undated payments and one standalone credit note need review.

### Reconciled fictional customer example

| Measure | Amount |
| --- | ---: |
| Issued invoices | £5,980 |
| Positive dated payments | £4,620 |
| Refunds | £120 |
| Net received | £4,500 |
| Still to be paid | £1,480 |
| Overdue subset | £240 |

`£4,620 - £120 = £4,500` and `£4,500 + £1,480 = £5,980`. Monthly net receipts total £4,500 and the displayed service-line values total £5,980.

## Record examples

- **Full payment**: a £1,000 issued invoice plus a dated £1,000 payment contributes £1,000 invoiced, £1,000 received, £1,000 net received and £0 still to be paid.
- **Deposit / part-payment**: a £1,000 issued invoice plus a dated £300 payment contributes £1,000 invoiced, £300 received, £300 net received and £700 still to be paid. A “deposit” is not a separate income category.
- **Refund**: a £1,000 dated payment followed by a £120 dated refund contributes £1,000 received, £120 refunds and £880 net received for payment-date reporting. The invoice balance follows the existing source-of-truth record treatment; Phase 0 does not change financial logic.
- **Recurring invoice**: its issued and paid amounts are calculated exactly like a one-off invoice. “Recurring” is only a workflow-source label.
- **Accepted quote**: the quote itself contributes £0. Its linked issued invoice and dated payment records contribute under the ordinary invoice rules.

## Chart and accessibility contract

- Colour is never the only differentiator: labels, amounts, legends and ordering accompany every colour.
- Each chart has an explicit accessible name describing its totals and notable pattern.
- Time-series charts also include a visually hidden data table with exact values.
- Donuts repeat every segment as labelled text and explain that overdue is a subset of outstanding.
- Charts do not animate in this reference; reduced-motion preferences are respected.
- Values use tabular numerals. Currency context remains visible near totals.
- Loading uses `aria-busy`; calculation failure uses an alert; explanatory scope text uses a note.
- Mobile references use a real 390px layout with touch-sized primary navigation, not a scaled desktop composite.

## State behaviour

- **Loading** preserves the layout and does not flash misleading zeroes.
- **No income records** says that Tallyo has no eligible issued invoices; it does not imply that the business earned nothing elsewhere.
- **Figures unavailable** preserves the records, avoids partial totals and offers Retry and Income records routes.
- **Mixed currency** requires an explicit currency choice and does not combine GBP, EUR and USD.
- **Needs review** includes valid records in normal views, excludes ambiguous records from affected totals, and explains each excluded record.

## Validation and review boundary

Run from this folder:

```powershell
node phase0-harness.cjs
node render-phase0.cjs
```

The renderer uses bundled Playwright and Lucide, blocks every HTTP/HTTPS request, and loads no Tallyo application scripts. Generated PNGs are static review artifacts only. Owner approval of wording, information hierarchy, visual treatment and calculation examples is required before Phase 1 production foundations begin.
