-- Apply a Stripe webhook's invoice mutation and append-only audit event in one
-- transaction. The Edge Function retries when another writer changed the
-- invoice after it was read, preventing lost JSONB-array updates.
alter table public.invoices
    add column if not exists stripe_event_version bigint not null default 0;

create or replace function public.bump_invoice_stripe_event_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.stripe_event_version := old.stripe_event_version + 1;
    return new;
end;
$$;

revoke execute on function public.bump_invoice_stripe_event_version()
    from public, anon, authenticated;

drop trigger if exists bump_invoice_stripe_event_version on public.invoices;
create trigger bump_invoice_stripe_event_version
    before update on public.invoices
    for each row execute function public.bump_invoice_stripe_event_version();

create or replace function public.apply_stripe_invoice_event(
    p_invoice_id uuid,
    p_user_id uuid,
    p_expected_version bigint,
    p_payments jsonb,
    p_history jsonb,
    p_status text,
    p_event_type text,
    p_provider_event_id text,
    p_metadata jsonb,
    p_processed_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_version bigint;
    v_audit_id uuid;
begin
    if p_invoice_id is null or p_user_id is null or
       p_provider_event_id is null or btrim(p_provider_event_id) = '' then
        raise exception 'invalid Stripe invoice event parameters';
    end if;

    if jsonb_typeof(p_payments) <> 'array' or jsonb_typeof(p_history) <> 'array' then
        raise exception 'invoice payments and history must be JSON arrays';
    end if;

    if p_status not in ('Draft', 'Sent', 'Paid', 'Cancelled') then
        raise exception 'invalid invoice status';
    end if;

    if p_event_type not in (
        'stripe_payment_completed',
        'stripe_payment_failed',
        'stripe_refund_succeeded',
        'stripe_refund_failed',
        'stripe_refund_updated',
        'charge_dispute_created',
        'charge_dispute_funds_withdrawn',
        'charge_dispute_funds_reinstated',
        'charge_dispute_closed',
        'charge_dispute_updated'
    ) then
        raise exception 'unsupported Stripe invoice event type';
    end if;

    select stripe_event_version
      into v_version
      from public.invoices
     where id = p_invoice_id and user_id = p_user_id
     for update;

    if not found then
        return 'missing';
    end if;

    if exists (
        select 1
          from public.audit_events
         where provider = 'stripe'
           and provider_event_id = p_provider_event_id
    ) then
        return 'duplicate';
    end if;

    if v_version is distinct from p_expected_version then
        return 'stale';
    end if;

    insert into public.audit_events (
        user_id,
        actor_user_id,
        event_type,
        object_type,
        object_id,
        source,
        provider,
        provider_event_id,
        metadata,
        created_at
    ) values (
        p_user_id,
        null,
        p_event_type,
        'invoice',
        p_invoice_id,
        'provider_webhook',
        'stripe',
        p_provider_event_id,
        coalesce(p_metadata, '{}'::jsonb),
        coalesce(p_processed_at, now())
    )
    on conflict (provider, provider_event_id)
        where provider is not null and provider_event_id is not null
    do nothing
    returning id into v_audit_id;

    if v_audit_id is null then
        return 'duplicate';
    end if;

    update public.invoices
       set payments = p_payments,
           history = p_history,
           status = p_status,
           updated_at = coalesce(p_processed_at, now())
     where id = p_invoice_id and user_id = p_user_id;

    if not found then
        raise exception 'invoice disappeared during Stripe event processing';
    end if;

    return 'applied';
end;
$$;

revoke all on function public.apply_stripe_invoice_event(
    uuid, uuid, bigint, jsonb, jsonb, text, text, text, jsonb, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_stripe_invoice_event(
    uuid, uuid, bigint, jsonb, jsonb, text, text, text, jsonb, timestamptz
) to service_role;
