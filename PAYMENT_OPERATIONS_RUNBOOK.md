# Tallyo Payment Operations Runbook

Internal operating procedure for invoice payments handled through Stripe. This is not a customer-facing refund policy, legal advice, or permission to enable Stripe live mode.

## Current Boundary

- Stripe invoice payments operate in controlled live mode; sandbox remains the safe regression environment.
- Tallyo uses Stripe-hosted Checkout; Tallyo does not collect or store full card details.
- A payment changes an invoice only after a signed Stripe webhook is verified and matched to a Tallyo-created Checkout Session.
- A refund changes the invoice balance only after a signed Stripe refund webhook confirms the provider outcome.
- The controlled live activation and one full fictional acceptance refund are verified. Each future refund, real-customer payment link, customer-facing term, and public claim remains separately controlled.

## Roles

| Role | Responsibility |
|---|---|
| Seller/account owner | Confirms the invoice, customer request, amount, and business reason; communicates with the customer. |
| Tallyo app | Requests Checkout/refunds, records signed provider events, and updates invoice state. |
| Stripe | Hosts card entry, processes the payment/refund, and supplies signed lifecycle events. |
| Tallyo operator | Investigates technical failures using privacy-safe identifiers and escalates security incidents. |

## Refund Procedure

1. Open the invoice and verify the relevant Stripe-confirmed payment row.
2. Confirm the requested amount does not exceed the refundable amount and record a short business reason without unnecessary personal data.
3. Use Tallyo's Refund action. Do not call Stripe from browser code or manually edit the invoice payment JSON.
4. Treat the request as pending until the signed Stripe webhook records the confirmed refund.
5. Check the invoice balance, payment row, activity history, and append-only audit event.
6. If Stripe reports a failed refund, confirm Tallyo reverses any provisional state and preserves the failure evidence.
7. Tell the customer only what is verified. Do not promise an instant or guaranteed bank-credit date.

## Dispute And Chargeback Procedure

1. Record the date, amount, invoice, Stripe case status, response deadline, and owner without copying full card or unnecessary customer data.
2. Preserve the invoice, delivery evidence, customer communications, terms accepted at the time, payment event, and refund history.
3. Review the signed dispute event and Stripe dashboard; never mark an invoice paid or refunded from an email or screenshot alone.
4. Decide whether to accept or contest the dispute. A contested or material case requires external legal/accounting advice where appropriate.
5. Submit evidence only through the approved Stripe workflow and retain a privacy-safe decision record.
6. Reconcile the final `won`, `lost`, funds-withdrawn, or funds-reinstated event with Tallyo.

Card-not-present transactions carry chargeback risk. GOV.UK describes chargeback liability and common reasons at <https://www.gov.uk/invoicing-and-taking-payment-from-customers/payment-obligations>.

## Failure And Incident Handling

| Signal | Immediate action |
|---|---|
| Checkout creation fails | Do not create a manual paid entry. Retry only after checking configuration and invoice ownership. |
| Webhook signature fails | Reject it, preserve minimal technical evidence, and investigate destination/secret configuration. |
| Duplicate event | Confirm idempotency preserved one audit event and one invoice mutation. |
| Amount/currency/session mismatch | Fail closed and investigate; do not override the check in the browser. |
| Refund remains pending or fails | Reconcile with Stripe and keep the customer informed without promising an outcome. |
| Dispute/chargeback appears | Follow the dispute procedure and preserve evidence. |
| Suspected key compromise | Stop payment operations, contain access, preserve logs, and rotate secrets only with Owner approval. |

## Controlled Live Activation

The following order is mandatory. Do not place secret values, webhook payloads, customer details, or bank details in repository evidence.

### Technical deployment candidate

1. Merge the reviewed payment-readiness PR only after its required `verify` check passes and there are no unresolved comments or conflicts.
2. Take the normal Supabase backup/snapshot evidence and record the release commit.
3. Apply migration `20260717165044_atomic_stripe_invoice_events.sql` before deploying the matching webhook. Verify that `apply_stripe_invoice_event` is executable by `service_role` only and that invoice RLS and append-only audit triggers are unchanged.
4. Deploy `stripe-webhook`, `create-stripe-checkout`, `create-stripe-refund`, and `send-document-email` from the same reviewed commit.
5. Keep the public `window.STRIPE_LIVE_MODE` flag `false` and keep `STRIPE_PAYMENTS_ENABLED` disabled for live mode until the provider configuration below is complete.

### Owner/provider activation

1. Confirm the Stripe account is approved for live charges and that the Owner has completed required identity, business, bank, payout, tax, and account-security steps directly with Stripe.
2. In Stripe live mode, create the production webhook endpoint for the deployed `stripe-webhook` URL, pin its API version, and subscribe only to:
   - `checkout.session.completed`;
   - `checkout.session.async_payment_succeeded`;
   - `checkout.session.async_payment_failed`;
   - `refund.created`, `refund.updated`, and `refund.failed`;
   - `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.
3. Enter the live Stripe server key and live webhook signing secret directly in Supabase secret management. Set the exact approved HTTPS `APP_BASE_URL` and set `STRIPE_API_VERSION` to the same reviewed version pinned on the live webhook endpoint. Never place secret values in browser code, chat, screenshots, commits, or evidence.
4. Set `STRIPE_LIVE_MODE=true`, then set `STRIPE_PAYMENTS_ENABLED=true`. The functions reject test/live key mismatches and live payments remain disabled unless both switches are explicit.
5. With separate approval for a real-money acceptance test, send one minimum-value invoice to an Owner-controlled address, pay it once, and verify Checkout amount/currency, signed webhook success, one invoice payment, one append-only audit event, correct invoice status, and Stripe settlement state. Refund it only if separately approved, then verify the signed refund lifecycle and balance restoration.
6. Only after that verification, change the public `window.STRIPE_LIVE_MODE` flag to `true`, publish the reviewed frontend, and perform a no-data smoke check. Real customer use and customer communications remain subject to the separate release/legal gate below.

**Controlled acceptance, 2026-07-18:** The fictional GBP 1.00 live payment settled once, and a later separately approved full refund was requested through Tallyo. The first browser attempt returned a transport error and database readback confirmed no effect; one controlled retry succeeded. Signed webhook reconciliation recorded one negative GBP 1.00 refund, one request audit and one success audit, reopened the invoice to Sent, and restored the GBP 1.00 balance. No customer communication occurred.

**Refund receipts, 2026-07-18:** After separate Owner approval, Stripe Customer emails > Refunds was enabled and verified on. PAY-LIVE-003 showed that `customer_email` alone did not produce the automatic receipt, so both Checkout-producing functions now set `customer_creation=always` without requesting future card saving. A separately approved repeat GBP 1.00 payment/refund cycle then reconciled without duplicates, and the Owner confirmed that Stripe delivered the refund receipt with a customer-facing reference. Tallyo does not send a duplicate Resend refund email. Treat that automatic receipt as a foreseeable consequence when obtaining approval for every future refund. If a customer needs bank tracing, use the Stripe refund detail's supported ARN, STAN or RRN when it becomes available; do not expose internal provider identifiers as a substitute.

### Rollback and containment

1. Set `STRIPE_PAYMENTS_ENABLED=false` first. This blocks new live Checkout Sessions and in-app refunds while allowing the webhook to finish processing already-created provider events.
2. Set the public `window.STRIPE_LIVE_MODE` flag to `false` and publish the controlled frontend so the test/development notice is visible.
3. Do not delete invoice payments or audit events and do not roll back the transaction function while unresolved Stripe events exist. Reconcile in-flight Checkout Sessions, refunds, and disputes against Stripe.
4. If webhook integrity is affected, leave the endpoint available only when safe, preserve privacy-minimised evidence, correct the configuration/code, and replay provider events from Stripe after review.
5. Rotate or revoke a suspected key only through the approved Owner/provider process. Record identifiers and outcomes, never the secret value.

## Support Record

For each material case record: internal case reference, invoice reference, provider event type, amount/currency, status, timestamps, decision owner, customer communication status, and outcome. Do not record full card data, secret keys, webhook payloads, passwords, TOTP codes, or identity documents.

## Release Gate

Technical sandbox handling and the controlled live payment/refund paths are verified, but unrestricted real-customer use remains blocked until:

- the timed restore exercise is complete;
- the Auth/session/SMTP/abuse-control decisions are resolved;
- the privacy and rights processes in `LEGAL_PRIVACY_READINESS.md` are operational;
- customer-facing Terms, Privacy Notice, refund/support wording, and any required external professional review are complete;
- live Stripe configuration and signed live webhook testing receive explicit Owner approval.

**Legal Agent disposition, 2026-07-14:** `Blocked` for live/customer use. Internal technical runbook may be used for sandbox operations. Customer-facing refund, cancellation, liability, and dispute wording requires a later legally material review and may require external advice.
