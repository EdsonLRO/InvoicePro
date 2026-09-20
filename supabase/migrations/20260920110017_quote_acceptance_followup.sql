-- Optional accepted-quote invoice delivery.
--
-- The business user chooses this before the quote is sent. Customer acceptance
-- still commits independently: delivery is a follow-up side effect and a
-- provider failure leaves the generated invoice as a visible Draft.

alter table public.invoices
    add column if not exists quote_auto_send_invoice boolean not null default false,
    add column if not exists quote_auto_send_due_days smallint,
    add column if not exists quote_auto_send_recipient text,
    add column if not exists quote_auto_send_status text,
    add column if not exists quote_auto_send_attempted_at timestamptz,
    add column if not exists quote_auto_send_sent_at timestamptz;

alter table public.invoices
    drop constraint if exists invoices_quote_auto_send_settings_check,
    add constraint invoices_quote_auto_send_settings_check check (
        (quote_auto_send_invoice = false
            and quote_auto_send_due_days is null
            and quote_auto_send_recipient is null)
        or
        (quote_auto_send_invoice = true
            and doc_type = 'quote'
            and quote_auto_send_due_days between 1 and 365
            and quote_auto_send_recipient is not null
            and char_length(quote_auto_send_recipient) between 3 and 320
            and position('@' in quote_auto_send_recipient) > 1)
    ),
    drop constraint if exists invoices_quote_auto_send_status_check,
    add constraint invoices_quote_auto_send_status_check check (
        quote_auto_send_status is null
        or (
            quote_auto_send_invoice = true
            and doc_type = 'quote'
            and quote_response = 'accepted'
            and quote_auto_send_status in ('sending', 'sent', 'failed')
        )
    ),
    drop constraint if exists invoices_quote_auto_send_timestamps_check,
    add constraint invoices_quote_auto_send_timestamps_check check (
        (quote_auto_send_status is null
            and quote_auto_send_attempted_at is null
            and quote_auto_send_sent_at is null)
        or
        (quote_auto_send_status in ('sending', 'failed')
            and quote_auto_send_attempted_at is not null
            and quote_auto_send_sent_at is null)
        or
        (quote_auto_send_status = 'sent'
            and quote_auto_send_attempted_at is not null
            and quote_auto_send_sent_at is not null)
    );

comment on column public.invoices.quote_auto_send_invoice is
    'Owner-selected option to email the linked invoice once this quote is accepted.';
comment on column public.invoices.quote_auto_send_due_days is
    'Whole days after acceptance used to set the generated invoice due date.';
comment on column public.invoices.quote_auto_send_recipient is
    'Server-stored recipient reviewed by the owner when the quote email was sent.';
comment on column public.invoices.quote_auto_send_status is
    'Server-managed one-attempt delivery state: sending, sent or failed.';

create or replace function public.protect_quote_acceptance_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_content_changed boolean := false;
begin
    if tg_op = 'DELETE' then
        if current_user = 'authenticated' and old.quote_response is not null then
            raise exception 'Responded quotes are read-only';
        end if;
        if current_user = 'authenticated' and old.source_quote_id is not null then
            raise exception 'Invoices created from accepted quotes cannot be deleted';
        end if;
        return old;
    end if;

    if tg_op = 'INSERT' then
        if current_user = 'authenticated' and (
            new.quote_access_token_hash is not null
            or new.quote_access_created_at is not null
            or new.quote_access_expires_at is not null
            or new.quote_access_revoked_at is not null
            or new.quote_first_viewed_at is not null
            or new.quote_access_version <> 1
            or new.quote_link_version is not null
            or new.quote_response is not null
            or new.quote_response_name is not null
            or new.quote_responded_at is not null
            or new.source_quote_id is not null
            or new.quote_auto_send_invoice <> false
            or new.quote_auto_send_due_days is not null
            or new.quote_auto_send_recipient is not null
            or new.quote_auto_send_status is not null
            or new.quote_auto_send_attempted_at is not null
            or new.quote_auto_send_sent_at is not null
        ) then
            raise exception 'Quote acceptance fields are server-managed';
        end if;
        return new;
    end if;

    if current_user = 'authenticated' then
        if old.quote_response is not null then
            raise exception 'Responded quotes are read-only';
        end if;

        if new.quote_access_token_hash is distinct from old.quote_access_token_hash
            or new.quote_access_created_at is distinct from old.quote_access_created_at
            or new.quote_access_expires_at is distinct from old.quote_access_expires_at
            or new.quote_access_revoked_at is distinct from old.quote_access_revoked_at
            or new.quote_first_viewed_at is distinct from old.quote_first_viewed_at
            or new.quote_access_version is distinct from old.quote_access_version
            or new.quote_link_version is distinct from old.quote_link_version
            or new.quote_response is distinct from old.quote_response
            or new.quote_response_name is distinct from old.quote_response_name
            or new.quote_responded_at is distinct from old.quote_responded_at
            or new.source_quote_id is distinct from old.source_quote_id
            or new.quote_auto_send_invoice is distinct from old.quote_auto_send_invoice
            or new.quote_auto_send_due_days is distinct from old.quote_auto_send_due_days
            or new.quote_auto_send_recipient is distinct from old.quote_auto_send_recipient
            or new.quote_auto_send_status is distinct from old.quote_auto_send_status
            or new.quote_auto_send_attempted_at is distinct from old.quote_auto_send_attempted_at
            or new.quote_auto_send_sent_at is distinct from old.quote_auto_send_sent_at
        then
            raise exception 'Quote acceptance fields are server-managed';
        end if;

        if old.doc_type = 'quote' then
            v_content_changed :=
                new.doc_type is distinct from old.doc_type
                or new.number is distinct from old.number
                or new.status is distinct from old.status
                or new.issue_date is distinct from old.issue_date
                or new.due_date is distinct from old.due_date
                or new.po_number is distinct from old.po_number
                or new.currency is distinct from old.currency
                or new.customer_id is distinct from old.customer_id
                or new.customer_snapshot is distinct from old.customer_snapshot
                or new.items is distinct from old.items
                or new.global_discount is distinct from old.global_discount
                or new.tax_rate is distinct from old.tax_rate
                or new.tax_mode is distinct from old.tax_mode
                or new.shipping_cost is distinct from old.shipping_cost
                or new.tip is distinct from old.tip
                or new.notes is distinct from old.notes
                or new.terms is distinct from old.terms
                or new.grand_total is distinct from old.grand_total;

            if v_content_changed then
                new.quote_access_version := old.quote_access_version + 1;
                new.quote_access_token_hash := null;
                new.quote_access_created_at := null;
                new.quote_access_expires_at := null;
                new.quote_access_revoked_at := null;
                new.quote_first_viewed_at := null;
                new.quote_link_version := null;
            end if;
        end if;
    end if;

    return new;
end;
$$;

revoke execute on function public.protect_quote_acceptance_fields()
    from public, anon, authenticated, service_role;
