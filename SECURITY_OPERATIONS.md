# SECURITY_OPERATIONS.md - Tallyo

Operational security checklist for moving Tallyo from a working prototype into a safer product. This is not a compliance claim; it is the working list of controls to put in place before real customer email and payments.

Agent task ownership, independent review, locks, and evidence follow `AUTOMATION_MODEL_ORCHESTRATION.md`. Legally material data, payment, communication, vendor, incident, and release work also follows the active review process in `TALLYO_LEGAL_COMPLIANCE_AGENT.md`. Any browser/dashboard operation follows `AGENT_HIERARCHY_AND_COMPUTER_USE.md`, which defaults computer use to Read only and keeps secrets masked.

## Current Priority

Email, opt-in reminder automation, recurring auto-email, and Stripe invoice-payment flows now exist for the current app. Current priority is to keep those working flows stable, keep secrets server-side, test the new Stripe lifecycle handling, and build a recovery path before real customer use.

Future SaaS subscription billing, plan tiers, workspaces, RBAC, and the public marketing website are deliberately deferred. They should not interrupt the current app/security finishing workflow.

## Backup And Restore

Supabase Pro is active and provides daily database backups with a seven-day retention window. The current operational procedure is in `BACKUP_RESTORE_RUNBOOK.md`.

Current evidence and remaining release gate:

- Completed daily physical backups through 2026-07-14 were verified through the Supabase CLI; WAL-G was enabled and PITR remained disabled.
- An Owner-approved isolated restore completed on 2026-07-15. Exact data/structure counts matched, both copied cron jobs were disabled, and two-context RLS read/write checks passed. See `BACKUP_RESTORE_TEST_EVIDENCE_2026-07-15.md`.
- Permanently delete the temporary restore project only after explicit Owner approval.
- Keep production, test, and local data clearly separated.

## Scheduled Automation Boundary

The recurring and overdue cron jobs retrieve a dedicated automation secret from Supabase Vault at runtime and send it as `x-automation-secret`. `generate-recurring` checks that secret before creating its service-role client, and unsigned requests return HTTP 401. The service role remains server-side and every generated row must still be explicitly attributed to the schedule owner because service-role access bypasses RLS.

The protected functions returned HTTP 200 on 2026-07-14. The recurring pg_net request exhausted its former short response timeout even though its function completed, so both jobs now use a 30-second response timeout. Confirm the next natural 06:00 and 09:00 UTC pg_net responses using `DEFERRED_MANUAL_CONFIGURATION.md`. Disable both jobs immediately in any restored clone.
- Confirm invoices, customers, saved items, company settings, payments, recurring templates, Auth records, and audit events recover as expected.
- Re-run cross-user RLS isolation tests after restoration.
- Disable cloned cron and outbound automation before it can send email, create invoices, or call payment services.
- Confirm Edge Function secrets, provider dashboards, Auth settings, and Storage objects are handled separately.

PITR is not enabled by this runbook. It is a separately billed add-on and remains an Owner decision.

## Data Protection Groundwork

Internal groundwork is now recorded in `LEGAL_PRIVACY_READINESS.md`. Before inviting real users it must become approved, tested operations and accurate customer-facing documents:

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

- Account password changes/recovery, MFA enable/disable/backup-factor changes, document deletes, PDF exports, manual payment removal, customer deletes, saved-item deletes/price changes, and recurring schedule pause/resume/delete.
- Keep audit metadata privacy-safe. Do not store passwords, tokens, full card data, full exported documents, or unnecessary customer PII in logs.

Remaining audit hardening:

- Company/settings saves are logged at a privacy-safe category level. Recurring generation records success, failure, retry reuse, skipped claims, and schedule-history failures without raw exception text. The 2026-07-15 restore exercise has separate privacy-safe operational evidence; it did not add customer content or credentials to the audit record.

Recurring integrity rule:

- One invoice is permitted per `(recurring_template_id, recurring_occurrence_date)` when both values exist.
- A conditional update of the expected active `next_run` is the processing claim; only its winner may send email.
- A rare crash after that claim but before Resend acceptance may miss an email. Eliminating both duplicate and missed delivery under every crash point requires a future transactional outbox/queue.

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
- Operationally test and legally review `PAYMENT_OPERATIONS_RUNBOOK.md`, including refund, dispute, chargeback, failed-payment, and support handling.
- Terms, privacy, cancellation, and payment dispute wording for real customers.

The Legal, Privacy and Regulatory Agent must issue a dated disposition for legally material payment/customer-use changes and verify mandatory conditions before release. A required external professional review, unresolved legal block, missing notice, or unsupported product claim keeps public launch blocked.

Payment security requirements:

- Stripe secret key stays server-side only.
- Checkout sessions are created in an Edge Function.
- Webhook signatures are verified.
- Webhooks are idempotent.
- Every payment event is tied to both `invoice_id` and `user_id`.
- Webhook payment updates and asynchronous-failure history are accepted only for Checkout sessions previously created and logged by Tallyo.
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
- `stripe-webhook` verifies Stripe signatures, defaults to sandbox events unless `STRIPE_LIVE_MODE=true` is set server-side, accepts `checkout.session.completed` and `checkout.session.async_payment_succeeded` for payment recording, checks the Tallyo-created checkout audit event, updates invoice payments, and logs activity/audit events.
- The webhook also handles `checkout.session.async_payment_failed`, `refund.created`, `refund.updated`, `refund.failed`, and key dispute events for lifecycle awareness. Failed payments and disputes are logged; successful refunds are recorded as locked negative Stripe payment entries and can reopen the invoice balance.
- Current sandbox Stripe webhook destination is subscribed only to the 11 event types Tallyo handles: Checkout completed/succeeded/failed async events, refund created/updated/failed events, and charge dispute created/updated/closed/funds withdrawn/funds reinstated events.
- Other Stripe lifecycle events such as `payment_intent.succeeded`, `charge.succeeded`, `charge.updated`, and `charge.refunded` are expected in Stripe history but should not independently mark invoices paid.

Next payment hardening:

- Keep `STRIPE_SANDBOX_TEST_EVIDENCE.md` current. Duplicate payment/refund replay, unrelated-event rejection, a known-payment dispute, and a genuine asynchronous `refund.failed` lifecycle passed in sandbox.
- Keep card data out of Tallyo; continue using Stripe-hosted Checkout.
- Done for one completed payment and one successful refund: duplicate replays did not change invoice state or create additional audit rows.
- Re-run the recorded lifecycle checks after material payment-handler changes and confirm failed or unexpected payment events never mark invoices paid.
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
7. Confirm task locks were released and the required QA/Security/Payments handoffs are evidenced.
8. Confirm no dashboard action crossed an Owner-approval boundary.
