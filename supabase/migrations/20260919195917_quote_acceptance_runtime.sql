-- Tallyo quote acceptance runtime foundation.
--
-- This migration adds a scoped public-link state to existing quote rows and a
-- source relationship to automatically created invoices. Public customers do
-- not receive direct table or RPC access: the public Edge Function uses the
-- service role after validating a high-entropy token whose SHA-256 hash is the
-- only token material stored here.

alter table public.invoices
    add column if not exists quote_access_token_hash text,
    add column if not exists quote_access_created_at timestamptz,
    add column if not exists quote_access_expires_at timestamptz,
    add column if not exists quote_access_revoked_at timestamptz,
    add column if not exists quote_first_viewed_at timestamptz,
    add column if not exists quote_access_version bigint not null default 1,
    add column if not exists quote_link_version bigint,
    add column if not exists quote_response text,
    add column if not exists quote_response_name text,
    add column if not exists quote_responded_at timestamptz,
    add column if not exists source_quote_id uuid;

alter table public.invoices
    drop constraint if exists invoices_status_check;

alter table public.invoices
    add constraint invoices_status_check
    check (status in ('Draft', 'Sent', 'Paid', 'Cancelled', 'Accepted', 'Declined'));

alter table public.invoices
    add constraint invoices_quote_token_hash_check
    check (
        quote_access_token_hash is null
        or quote_access_token_hash ~ '^[0-9a-f]{64}$'
    ),
    add constraint invoices_quote_link_state_check
    check (
        (quote_access_token_hash is null
            and quote_access_created_at is null
            and quote_access_expires_at is null
            and quote_link_version is null)
        or
        (doc_type = 'quote'
            and quote_access_token_hash is not null
            and quote_access_created_at is not null
            and quote_access_expires_at > quote_access_created_at
            and quote_link_version is not null
            and quote_link_version > 0)
    ),
    add constraint invoices_quote_response_check
    check (
        (quote_response is null
            and quote_response_name is null
            and quote_responded_at is null
            and status not in ('Accepted', 'Declined'))
        or
        (doc_type = 'quote'
            and quote_response = 'accepted'
            and status = 'Accepted'
            and quote_response_name is not null
            and char_length(btrim(quote_response_name)) between 2 and 100
            and quote_responded_at is not null)
        or
        (doc_type = 'quote'
            and quote_response = 'declined'
            and status = 'Declined'
            and quote_response_name is null
            and quote_responded_at is not null)
    ),
    add constraint invoices_source_quote_type_check
    check (source_quote_id is null or doc_type = 'invoice'),
    add constraint invoices_source_quote_not_self_check
    check (source_quote_id is null or source_quote_id <> id);

create unique index invoices_id_user_uidx
    on public.invoices(id, user_id);

alter table public.invoices
    add constraint invoices_source_quote_owner_fkey
    foreign key (source_quote_id, user_id)
    references public.invoices(id, user_id)
    on delete restrict;

create unique index invoices_quote_access_token_uidx
    on public.invoices(quote_access_token_hash)
    where quote_access_token_hash is not null;

create unique index invoices_source_quote_uidx
    on public.invoices(source_quote_id)
    where source_quote_id is not null;

create index invoices_source_quote_id_idx
    on public.invoices(source_quote_id)
    where source_quote_id is not null;

comment on column public.invoices.quote_access_token_hash is
    'SHA-256 hash of the current 256-bit quote-access token; raw token is never stored.';
comment on column public.invoices.quote_access_version is
    'Server-managed quote content version used to invalidate links after owner edits.';
comment on column public.invoices.quote_link_version is
    'Quote content version captured when the current public link was created.';
comment on column public.invoices.source_quote_id is
    'Accepted quote that atomically created this draft invoice.';

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

drop trigger if exists protect_quote_acceptance_fields on public.invoices;
create trigger protect_quote_acceptance_fields
    before insert or update or delete on public.invoices
    for each row execute function public.protect_quote_acceptance_fields();

create or replace function public.quote_public_action(
    p_token_hash text,
    p_action text,
    p_confirmed_name text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_quote public.invoices%rowtype;
    v_invoice public.invoices%rowtype;
    v_company public.company_settings%rowtype;
    v_now timestamptz := now();
    v_name text := nullif(btrim(coalesce(p_confirmed_name, '')), '');
    v_prefix text := '';
    v_next_number bigint := 0;
    v_number text;
    v_attempt integer := 0;
begin
    if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$'
        or p_action not in ('view', 'accept', 'decline', 'invoice')
    then
        return jsonb_build_object('state', 'unavailable');
    end if;

    select *
      into v_quote
      from public.invoices
     where quote_access_token_hash = p_token_hash
       and doc_type = 'quote'
     for update;

    if not found then
        return jsonb_build_object('state', 'unavailable');
    end if;

    if v_quote.quote_access_revoked_at is not null then
        return jsonb_build_object('state', 'revoked');
    end if;
    if v_quote.quote_access_expires_at is null
        or v_quote.quote_access_expires_at <= v_now
    then
        return jsonb_build_object('state', 'expired');
    end if;
    if v_quote.quote_link_version is distinct from v_quote.quote_access_version then
        return jsonb_build_object('state', 'changed');
    end if;

    select * into v_company
      from public.company_settings
     where user_id = v_quote.user_id;

    if v_quote.quote_response = 'accepted' then
        select * into v_invoice
          from public.invoices
         where source_quote_id = v_quote.id;
    end if;

    if p_action = 'accept' and v_quote.quote_response = 'declined' then
        return jsonb_build_object('state', 'declined');
    end if;
    if p_action = 'decline' and v_quote.quote_response = 'accepted' then
        return jsonb_build_object('state', 'accepted');
    end if;

    if v_quote.quote_response is null and v_quote.status <> 'Sent' then
        return jsonb_build_object('state', 'changed');
    end if;

    if p_action = 'view' and v_quote.quote_first_viewed_at is null then
        update public.invoices
           set quote_first_viewed_at = v_now,
               history = coalesce(history, '[]'::jsonb) || jsonb_build_array(
                   jsonb_build_object(
                       'ts', v_now,
                       'type', 'quote_viewed',
                       'text', 'Quote viewed'
                   )
               )
         where id = v_quote.id;
        insert into public.audit_events (
            user_id, actor_user_id, event_type, object_type, object_id,
            source, metadata, created_at
        ) values (
            v_quote.user_id, null, 'quote_viewed', 'quote', v_quote.id,
            'system', '{}'::jsonb, v_now
        );
        v_quote.quote_first_viewed_at := v_now;
    end if;

    if p_action = 'accept' and v_quote.quote_response is null then
        if v_name is null or char_length(v_name) not between 2 and 100 then
            return jsonb_build_object('state', 'invalid_name');
        end if;

        perform pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtextextended(v_quote.user_id::text, 0)
        );
        v_prefix := coalesce(v_company.invoice_prefix, '');

        select coalesce(max(
            case
                when pg_catalog.regexp_replace(number, '\D', '', 'g') <> ''
                then pg_catalog.regexp_replace(number, '\D', '', 'g')::bigint
                else 0
            end
        ), 0)
          into v_next_number
          from public.invoices
         where user_id = v_quote.user_id
           and doc_type = 'invoice';

        loop
            v_attempt := v_attempt + 1;
            v_next_number := v_next_number + 1;
            v_number := v_prefix || pg_catalog.lpad(v_next_number::text, 4, '0');
            begin
                insert into public.invoices (
                    user_id, doc_type, number, status, issue_date, due_date,
                    po_number, currency, customer_id, customer_snapshot, items,
                    payments, online_payment_mode, deposit_amount,
                    global_discount, tax_rate, tax_mode, history,
                    shipping_cost, tip, notes, terms, grand_total,
                    overdue_reminders_enabled, source_quote_id
                ) values (
                    v_quote.user_id, 'invoice', v_number, 'Draft',
                    v_now::date, null, v_quote.po_number, v_quote.currency,
                    v_quote.customer_id, v_quote.customer_snapshot,
                    v_quote.items, '[]'::jsonb, 'full', 0,
                    v_quote.global_discount, v_quote.tax_rate,
                    v_quote.tax_mode,
                    jsonb_build_array(jsonb_build_object(
                        'ts', v_now,
                        'type', 'created_from_quote',
                        'text', 'Created automatically from accepted quote ' || v_quote.number
                    )),
                    v_quote.shipping_cost, v_quote.tip, v_quote.notes,
                    v_quote.terms, v_quote.grand_total, false, v_quote.id
                )
                returning * into v_invoice;
                exit;
            exception when unique_violation then
                if v_attempt >= 5 then
                    raise;
                end if;
            end;
        end loop;

        update public.invoices
           set status = 'Accepted',
               quote_response = 'accepted',
               quote_response_name = v_name,
               quote_responded_at = v_now,
               history = coalesce(history, '[]'::jsonb) || jsonb_build_array(
                   jsonb_build_object(
                       'ts', v_now,
                       'type', 'quote_accepted',
                       'text', 'Quote accepted by ' || v_name
                   ),
                   jsonb_build_object(
                       'ts', v_now,
                       'type', 'invoice_created_from_quote',
                       'text', 'Invoice ' || v_invoice.number || ' automatically created'
                   )
               )
         where id = v_quote.id
         returning * into v_quote;

        insert into public.audit_events (
            user_id, actor_user_id, event_type, object_type, object_id,
            source, metadata, created_at
        ) values
        (
            v_quote.user_id, null, 'quote_accepted', 'quote', v_quote.id,
            'system', '{}'::jsonb, v_now
        ),
        (
            v_quote.user_id, null, 'invoice_created_from_quote', 'invoice',
            v_invoice.id, 'system',
            jsonb_build_object('source_quote_id', v_quote.id), v_now
        );
    elsif p_action = 'decline' and v_quote.quote_response is null then
        update public.invoices
           set status = 'Declined',
               quote_response = 'declined',
               quote_response_name = null,
               quote_responded_at = v_now,
               history = coalesce(history, '[]'::jsonb) || jsonb_build_array(
                   jsonb_build_object(
                       'ts', v_now,
                       'type', 'quote_declined',
                       'text', 'Quote declined'
                   )
               )
         where id = v_quote.id
         returning * into v_quote;

        insert into public.audit_events (
            user_id, actor_user_id, event_type, object_type, object_id,
            source, metadata, created_at
        ) values (
            v_quote.user_id, null, 'quote_declined', 'quote', v_quote.id,
            'system', '{}'::jsonb, v_now
        );
    end if;

    if p_action = 'invoice' and v_quote.quote_response <> 'accepted' then
        return jsonb_build_object('state', 'unavailable');
    end if;

    if v_quote.quote_response = 'accepted' and v_invoice.id is null then
        select * into v_invoice
          from public.invoices
         where source_quote_id = v_quote.id;
    end if;

    return jsonb_build_object(
        'state', coalesce(v_quote.quote_response, 'active'),
        'business', jsonb_build_object(
            'name', coalesce(v_company.name, 'Tallyo business'),
            'logoUrl', v_company.logo_url,
            'address', v_company.address,
            'email', v_company.email,
            'phone', coalesce(v_company.phone, v_company.mobile)
        ),
        'quote', jsonb_build_object(
            'number', v_quote.number,
            'status', v_quote.status,
            'issueDate', v_quote.issue_date,
            'validUntil', v_quote.due_date,
            'poNumber', v_quote.po_number,
            'currency', v_quote.currency,
            'customer', v_quote.customer_snapshot,
            'items', v_quote.items,
            'globalDiscount', v_quote.global_discount,
            'taxRate', v_quote.tax_rate,
            'taxMode', v_quote.tax_mode,
            'shippingCost', v_quote.shipping_cost,
            'tip', v_quote.tip,
            'notes', v_quote.notes,
            'terms', v_quote.terms,
            'total', v_quote.grand_total
        ),
        'acceptance', case
            when v_quote.quote_response = 'accepted' then jsonb_build_object(
                'confirmedName', v_quote.quote_response_name,
                'respondedAt', v_quote.quote_responded_at
            )
            else null
        end,
        'invoice', case
            when v_invoice.id is not null then jsonb_build_object(
                'number', v_invoice.number,
                'status', v_invoice.status,
                'issueDate', v_invoice.issue_date,
                'dueDate', v_invoice.due_date,
                'currency', v_invoice.currency,
                'customer', v_invoice.customer_snapshot,
                'items', v_invoice.items,
                'globalDiscount', v_invoice.global_discount,
                'taxRate', v_invoice.tax_rate,
                'taxMode', v_invoice.tax_mode,
                'shippingCost', v_invoice.shipping_cost,
                'tip', v_invoice.tip,
                'notes', v_invoice.notes,
                'terms', v_invoice.terms,
                'total', v_invoice.grand_total
            )
            else null
        end,
        'expiresAt', v_quote.quote_access_expires_at
    );
end;
$$;

revoke all on function public.quote_public_action(text, text, text)
    from public, anon, authenticated;
grant execute on function public.quote_public_action(text, text, text)
    to service_role;
