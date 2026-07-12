# SECURITY_OPERATIONS.md - Tallyo

Operational security checklist for moving Tallyo from a working prototype into a safer product. This is not a compliance claim; it is the working list of controls to put in place before real customer email and payments.

## Current Priority

Email, opt-in reminder automation, recurring auto-email, and Stripe invoice-payment flows now exist for the current app. Current priority is to keep those working flows stable, keep secrets server-side, test the new Stripe lifecycle handling, and build a recovery path before real customer use.

Future SaaS subscription billing, plan tiers, workspaces, RBAC, and the public marketing website are deliberately deferred. They should not interrupt the current app/security finishing workflow.

## Backup And Restore

Minimum before real users:

- Confirm the Supabase plan includes scheduled database backups.
- Document backup frequency and retention.
- Run a restore test into a separate non-production Supabase project.
- Keep production, test, and local data clearly separated.
- Export a small user-owned dataset and confirm invoices, customers, saved items, company settings, payments, and recurring templates can be recovered.

Manual restore test checklist:

1. Create a test account with company settings, a customer, a saved item, an invoice, a payment, and a recurring schedule.
2. Take or identify the backup snapshot.
3. Restore into a separate project, never over production during a test.
4. Confirm row counts and sample records match.
5. Confirm RLS still blocks cross-user reads.
6. Confirm Edge Function secrets are not copied into source or logs.

## Data Protection Groundwork

Needed before inviting real users:

- Privacy policy.
- Terms of service.
- Data retention position.
- User data export process.
- User deletion/erasure process.
- Breach response checklist.
- Subprocessor list: Supabase, GitHub Pages, Resend, Stripe, and any future analytics provider.
- Clear wording that Tallyo is built with data protection principles in mind, not a GDPR-compliance claim.

## Audit Events

The existing per-invoice and per-schedule `history` fields are useful activity history, but they are not tamper-proof. Trusted provider events and selected sensitive app actions now use `public.audit_events`.

Security findings, remediation decisions, verification evidence, and residual risk are tracked in `SECURITY_FINDINGS_LEDGER.md`. Update that ledger for meaningful findings, high-impact hardening, accepted risks, and follow-up evidence. Do not put secrets or unnecessary customer data in it.

Design rule:

- The browser may read its own audit events.
- The browser should not insert, update, or delete audit events.
- Edge Functions and verified provider webhooks should insert audit events with the service role key.
- Events should be append-only.
- Provider webhooks should use unique provider event IDs to prevent duplicate processing.
- The app uses `log-app-event` for selected authenticated user actions. This is stronger than editable browser history, but it is still user-action audit logging, not independent provider evidence.

SQL lives in `supabase/audit_events.sql`.

Current app-action coverage:

- Account password changes, MFA enable/disable, document deletes, PDF exports, manual payment removal, customer deletes, saved-item deletes/price changes, and recurring schedule pause/resume/delete.
- Keep audit metadata privacy-safe. Do not store passwords, tokens, full card data, full exported documents, or unnecessary customer PII in logs.

Remaining audit hardening:

- Expand coverage to company/settings changes, privileged automation failures, and backup/restore operations.

## Email Phase Gates

Do not automate emails until manual sending is reliable.

Manual email gate:

- Resend domain is verified for `tallyo.co.uk`.
- SPF, DKIM, and DMARC DNS records are in place.
- Resend API key is stored only as a Supabase secret.
- A server-side Edge Function sends emails.
- The function checks invoice ownership before sending.
- Failed sends are visible and do not create false "sent" events.

Automation gate:

- Delivery/failure webhooks are verified and idempotent.
- Reminder rules are defined per invoice, pre-filled from company defaults.
- Paid, draft, and cancelled invoices are excluded.
- Automatic reminders are opt-in per invoice, not a global blanket setting.
- Rate limits or abuse controls exist before real users.

## Payments Phase Gates

Stripe is implemented for the current invoice-payment flow. Treat it as test/development until live mode is intentionally approved and configured. Do not move to real customer payment links until the lifecycle, recovery, and compliance basics below are ready.

Still-to-decide before production/commercial use:

- Whether this remains a single-business invoice-payment app flow or later becomes a multi-business SaaS/Stripe Connect platform.
- Whether Tallyo ever takes platform fees. This is future SaaS work, not current app finishing.
- Supported currencies beyond the current invoice currency flow.
- Refund, dispute, chargeback, failed-payment, and customer support handling.
- Terms, privacy, cancellation, and payment dispute wording for real customers.

Payment security requirements:

- Stripe secret key stays server-side only.
- Checkout sessions are created in an Edge Function.
- Webhook signatures are verified.
- Webhooks are idempotent.
- Every payment event is tied to both `invoice_id` and `user_id`.
- Webhook payment updates are accepted only for Checkout sessions previously created and logged by Tallyo.
- Amount and currency are checked before updating invoice payments.
- Already-paid invoices cannot be accidentally paid twice without clear handling.
- Stripe-confirmed payments are locked from manual removal in the app.
- In-app Stripe refund requests go through a server-side Edge Function; the browser never calls Stripe directly.
- Invoice balances still change only after the signed Stripe refund webhook confirms the refund.
- Seller-approved deposits are allowed; arbitrary customer-entered payment amounts are not.

Current implementation notes:

- `create-stripe-checkout` creates app-initiated full-balance Checkout sessions.
- `create-stripe-refund` requests a full or partial Stripe refund for one of the user's own confirmed Stripe payment rows.
- `send-document-email` can create email payment links for full balance and seller-approved deposit amounts.
- `stripe-webhook` verifies Stripe signatures, accepts `checkout.session.completed` and `checkout.session.async_payment_succeeded` for payment recording, checks the Tallyo-created checkout audit event, updates invoice payments, and logs activity/audit events.
- The webhook also handles `checkout.session.async_payment_failed`, `refund.created`, `refund.updated`, `refund.failed`, and key dispute events for lifecycle awareness. Failed payments and disputes are logged; successful refunds are recorded as locked negative Stripe payment entries and can reopen the invoice balance.
- Current sandbox Stripe webhook destination is subscribed only to the 11 event types Tallyo handles: Checkout completed/succeeded/failed async events, refund created/updated/failed events, and charge dispute created/updated/closed/funds withdrawn/funds reinstated events.
- Other Stripe lifecycle events such as `payment_intent.succeeded`, `charge.succeeded`, `charge.updated`, and `charge.refunded` are expected in Stripe history but should not independently mark invoices paid.

Next payment hardening:

- Finish sandbox replay testing for refund-failure, failed/asynchronous payment, and dispute events.
- Keep card data out of Tallyo; continue using Stripe-hosted Checkout.
- Test duplicate/replayed webhook events.
- Confirm failed or unexpected payment events never mark invoices paid.
- Keep a clear distinction between customer invoice payments and future Tallyo SaaS subscription billing.

## Secret Handling

- Never commit real `.env` files.
- Never put service role, Resend, or Stripe secret keys in `index.html`, `config.js`, or docs.
- Keep `.env.example` as placeholders only.
- Store production secrets in Supabase secrets or provider dashboards.
- Rotate any secret that is accidentally printed, committed, or pasted into a shared place.

## Release Checks

Before deploying a security-sensitive change:

1. Confirm no secrets were added to source.
2. Confirm CSP and SRI are unchanged unless deliberately reviewed.
3. Confirm RLS policies are not weakened.
4. Confirm privileged functions stamp the correct `user_id`.
5. Confirm service-worker cache changes are intentional.
6. Test success, failure, wrong-user access, duplicate events, and missing-data paths.
