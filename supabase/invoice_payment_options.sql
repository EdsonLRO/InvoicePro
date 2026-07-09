-- Tallyo - seller-controlled online payment options for invoices.
--
-- Adds durable invoice-level settings for Stripe payment links:
--   * full: email/app links collect the full outstanding balance.
--   * deposit: invoice emails may include a seller-approved deposit link.
--
-- Customer-entered arbitrary amounts are intentionally not supported here.

alter table public.invoices
    add column if not exists online_payment_mode text not null default 'full',
    add column if not exists deposit_amount numeric(12,2) not null default 0;

alter table public.invoices
    drop constraint if exists invoices_online_payment_mode_check;

alter table public.invoices
    add constraint invoices_online_payment_mode_check
    check (online_payment_mode in ('full', 'deposit'));

alter table public.invoices
    drop constraint if exists invoices_deposit_amount_check;

alter table public.invoices
    add constraint invoices_deposit_amount_check
    check (deposit_amount >= 0);
