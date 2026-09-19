# Tallyo document status rules — review specification

Status: proposed behaviour for Owner review; no runtime, database or provider change.

## Purpose

Make document status understandable without turning Tallyo into an accounting system. A user controls whether a document is a draft, issued or cancelled. Tallyo derives payment and overdue state from trusted records and dates.

## Recommended model

### User-controlled lifecycle

| Current state | Available action | Result |
|---|---|---|
| Draft | Mark as sent | Sent |
| Draft | Cancel | Cancelled |
| Sent | Cancel, only when there is no payment or refund history | Cancelled |
| Cancelled | Duplicate | A new Draft; the cancelled record stays unchanged |

Paid, Partially Paid and Overdue are never selectable. Sent does not mean an email was delivered; it means the document has been issued. Email delivery remains a separate factual indicator.

An issued document is not silently reverted to Draft. This preserves the version already given to a customer. Corrections can be made deliberately in a later linked-credit workflow; this release does not invent that workflow.

### Invoice display status

Apply these rules in order:

1. Cancelled remains Cancelled.
2. An unissued document remains Draft.
3. A positive invoice with no remaining balance is Paid.
4. An issued invoice with a remaining balance after its due date is Overdue.
5. An issued invoice with a recorded part-payment and a remaining balance is Partially Paid.
6. Otherwise an issued invoice is Sent.

For an overdue part-paid invoice, the primary status is Overdue and the interface should also show the remaining balance. A zero-value issued invoice remains Sent rather than pretending a payment occurred.

### Quotes and credit notes

- Quotes use Draft, Sent and Cancelled in this release. Their validity date does not make them Overdue. Accepted/Declined and automatic invoice creation belong to the separately reviewed quote-acceptance release.
- Standalone credit notes use Draft, Sent and Cancelled in this release. They do not become Paid or Overdue. Invoice-linked credit behaviour belongs to the separately reviewed linked-credit release.

### Payments, refunds and disputes

- A manual or Stripe-confirmed payment may apply only to an invoice and may not exceed its outstanding balance.
- The first payment on a Draft issues it as Sent before deriving its payment status.
- A confirmed refund reduces net paid. The resulting visible status is recalculated from remaining balance and due date.
- Failed/pending refunds do not alter paid amount or status.
- Disputes remain a separate “needs attention” state and do not rewrite financial status automatically.
- Any payment or refund history blocks Cancel. This avoids representing a paid/refunded sale as if it never existed. The later linked-credit workflow will provide the proper correction path.

### Historical compatibility

Existing stored Paid rows must remain visibly Paid if they pre-date complete payment evidence. They are not silently reopened or rewritten. New user actions must not create another manual Paid row. A later confirmed refund/payment change can move such a row back into the derived model.

## Current behaviour found

The current app already derives Partially Paid and Overdue in the list, but it also:

- exposes Paid as a manual editor choice;
- stores Paid from browser and Stripe payment paths;
- applies invoice payment/overdue derivation to quotes and credit notes;
- permits broad status transitions, including reverting issued documents to Draft;
- duplicates payment-to-status logic in the browser, the Owner Stripe webhook and the connected-account Stripe webhook;
- skips overdue reminders using stored status while the list uses effective status.

These inconsistencies explain why implementation must be coordinated rather than treated as a label-only change.

## Controlled implementation sequence after approval

1. Add one shared, pure status rule and scenario matrix for browser use; do not alter persistence yet.
2. Replace the editor dropdown with relevant actions and remove manual Paid.
3. Apply document-type-aware display/filter/dashboard/reminder rules.
4. Align manual payment removal/refund previews with the same calculation.
5. In a separate high-risk backend slice, align both signed Stripe webhook paths and preserve atomic/idempotent event handling. Keep the existing database status constraint for legacy compatibility unless evidence requires a migration.
6. Run the complete invoice, reminder, recurring, payment, refund, dispute, email, PDF/mobile and PWA regression set. Stop again before merge or production release.

## Explicitly out of scope

- quote acceptance or conversion;
- linked credit notes;
- changing payment/refund provider behaviour;
- changing disputes, subscriptions or entitlements;
- migrations, production data repair or automatic rewriting of historical rows;
- sending email, creating Checkout objects, charging or refunding money;
- broad document immutability or accounting-ledger functionality.

## Review questions

Approve or change these three product decisions before implementation:

1. Paid must be derived and never manually selected.
2. An overdue part-paid invoice shows Overdue as its primary status, with the remaining balance visible.
3. A document with any payment/refund history cannot be cancelled; it remains available for the later linked-credit correction path.
