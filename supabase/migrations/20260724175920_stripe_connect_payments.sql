-- Repository-only Stripe Connect payment reconciliation foundation.
-- This migration is intentionally unapplied. It does not configure Stripe,
-- deploy an Edge Function, create a connected account or enable a payment.

create unique index if not exists invoices_connect_owner_identity_uidx
    on public.invoices(id, user_id);

create table public.stripe_connect_checkout_claims (
    request_id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    stripe_account_id text not null,
    invoice_id uuid not null,
    amount_minor bigint not null check (amount_minor > 0),
    currency text not null check (currency ~ '^[A-Z]{3}$'),
    livemode boolean not null,
    claim_status text not null default 'claimed'
        check (claim_status in (
            'claimed',
            'created',
            'completed',
            'expired',
            'failed'
        )),
    stripe_checkout_session_id text unique
        check (
            stripe_checkout_session_id is null
            or stripe_checkout_session_id ~ '^cs_(test_|live_)?[A-Za-z0-9]+$'
        ),
    session_expires_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint stripe_connect_checkout_claims_account_owner_fk
        foreign key (user_id, stripe_account_id)
        references public.stripe_connected_accounts(user_id, stripe_account_id)
        on update restrict on delete restrict,
    constraint stripe_connect_checkout_claims_invoice_owner_fk
        foreign key (invoice_id, user_id)
        references public.invoices(id, user_id)
        on update restrict on delete restrict,
    constraint stripe_connect_checkout_claim_completion_check check (
        (
            claim_status = 'claimed'
            and stripe_checkout_session_id is null
            and session_expires_at is null
        )
        or (
            claim_status <> 'claimed'
            and stripe_checkout_session_id is not null
            and session_expires_at is not null
        )
        or (
            claim_status = 'failed'
            and stripe_checkout_session_id is null
            and session_expires_at is null
        )
    )
);

create unique index stripe_connect_checkout_open_invoice_uidx
    on public.stripe_connect_checkout_claims(invoice_id)
    where claim_status in ('claimed', 'created');
create index stripe_connect_checkout_owner_created_idx
    on public.stripe_connect_checkout_claims(user_id, created_at desc);
create index stripe_connect_checkout_account_created_idx
    on public.stripe_connect_checkout_claims(
        stripe_account_id,
        created_at desc
    );

alter table public.stripe_connect_checkout_claims enable row level security;

revoke all on public.stripe_connect_checkout_claims
    from public, anon, authenticated;
grant all on public.stripe_connect_checkout_claims to service_role;

create or replace function public.prevent_stripe_connect_checkout_rebinding()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.request_id is distinct from old.request_id
       or new.user_id is distinct from old.user_id
       or new.stripe_account_id is distinct from old.stripe_account_id
       or new.invoice_id is distinct from old.invoice_id
       or new.amount_minor is distinct from old.amount_minor
       or new.currency is distinct from old.currency
       or new.livemode is distinct from old.livemode then
        raise exception 'Stripe Connect Checkout binding is immutable';
    end if;
    new.updated_at := now();
    return new;
end;
$$;

revoke execute on function public.prevent_stripe_connect_checkout_rebinding()
    from public, anon, authenticated;

create trigger prevent_stripe_connect_checkout_rebinding
    before update on public.stripe_connect_checkout_claims
    for each row
    execute function public.prevent_stripe_connect_checkout_rebinding();

create or replace function public.claim_stripe_connect_checkout(
    p_user_id uuid,
    p_stripe_account_id text,
    p_invoice_id uuid,
    p_request_id uuid,
    p_amount_minor bigint,
    p_currency text,
    p_livemode boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_existing public.stripe_connect_checkout_claims%rowtype;
begin
    if p_user_id is null or p_invoice_id is null or p_request_id is null
       or p_amount_minor is null or p_amount_minor <= 0
       or p_currency !~ '^[A-Z]{3}$'
       or p_stripe_account_id !~ '^acct_[A-Za-z0-9]+$' then
        raise exception 'invalid Stripe Connect Checkout claim';
    end if;

    if not exists (
        select 1
          from public.stripe_connected_accounts
         where user_id = p_user_id
           and stripe_account_id = p_stripe_account_id
           and livemode = p_livemode
           and onboarding_state = 'active'
           and card_payments_status = 'active'
           and payouts_status = 'active'
           and disconnected_at is null
    ) then
        return 'account_unavailable';
    end if;

    if not exists (
        select 1
          from public.invoices
         where id = p_invoice_id
           and user_id = p_user_id
    ) then
        return 'invoice_mismatch';
    end if;

    update public.stripe_connect_checkout_claims
       set claim_status = 'expired',
           updated_at = now()
     where invoice_id = p_invoice_id
       and (
           (
               claim_status = 'claimed'
               and created_at < now() - interval '5 minutes'
           )
           or (
               claim_status = 'created'
               and session_expires_at <= now()
           )
       );

    select *
      into v_existing
      from public.stripe_connect_checkout_claims
     where request_id = p_request_id;

    if found then
        if v_existing.user_id is distinct from p_user_id
           or v_existing.stripe_account_id is distinct from p_stripe_account_id
           or v_existing.invoice_id is distinct from p_invoice_id
           or v_existing.amount_minor is distinct from p_amount_minor
           or v_existing.currency is distinct from p_currency
           or v_existing.livemode is distinct from p_livemode then
            return 'request_mismatch';
        end if;
        if v_existing.claim_status = 'created' then
            return 'request_created';
        end if;
        return 'request_reused';
    end if;

    if exists (
        select 1
          from public.stripe_connect_checkout_claims
         where invoice_id = p_invoice_id
           and claim_status in ('claimed', 'created')
    ) then
        return 'checkout_pending';
    end if;

    begin
        insert into public.stripe_connect_checkout_claims (
            request_id,
            user_id,
            stripe_account_id,
            invoice_id,
            amount_minor,
            currency,
            livemode
        )
        values (
            p_request_id,
            p_user_id,
            p_stripe_account_id,
            p_invoice_id,
            p_amount_minor,
            p_currency,
            p_livemode
        );
    exception
        when unique_violation then
            return 'checkout_pending';
    end;

    return 'claimed';
end;
$$;

revoke all on function public.claim_stripe_connect_checkout(
    uuid, text, uuid, uuid, bigint, text, boolean
) from public, anon, authenticated;
grant execute on function public.claim_stripe_connect_checkout(
    uuid, text, uuid, uuid, bigint, text, boolean
) to service_role;

create or replace function public.complete_stripe_connect_checkout_claim(
    p_user_id uuid,
    p_request_id uuid,
    p_stripe_checkout_session_id text,
    p_session_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_stripe_checkout_session_id !~ '^cs_(test_|live_)?[A-Za-z0-9]+$'
       or p_session_expires_at is null
       or p_session_expires_at <= now() then
        return false;
    end if;

    update public.stripe_connect_checkout_claims
       set stripe_checkout_session_id = p_stripe_checkout_session_id,
           session_expires_at = p_session_expires_at,
           claim_status = 'created',
           updated_at = now()
     where request_id = p_request_id
       and user_id = p_user_id
       and claim_status = 'claimed';

    return found;
end;
$$;

revoke all on function public.complete_stripe_connect_checkout_claim(
    uuid, uuid, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.complete_stripe_connect_checkout_claim(
    uuid, uuid, text, timestamptz
) to service_role;

create or replace function public.fail_stripe_connect_checkout_claim(
    p_user_id uuid,
    p_request_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.stripe_connect_checkout_claims
       set claim_status = 'failed',
           updated_at = now()
     where request_id = p_request_id
       and user_id = p_user_id
       and claim_status = 'claimed';
    return found;
end;
$$;

revoke all on function public.fail_stripe_connect_checkout_claim(uuid, uuid)
    from public, anon, authenticated;
grant execute on function public.fail_stripe_connect_checkout_claim(uuid, uuid)
    to service_role;

create or replace function public.record_stripe_connect_checkout_terminal_event(
    p_stripe_checkout_session_id text,
    p_user_id uuid,
    p_stripe_account_id text,
    p_provider_event_id text,
    p_event_type text,
    p_livemode boolean,
    p_provider_created_at timestamptz,
    p_processed_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_status text;
begin
    if p_event_type not in (
        'stripe_connect_checkout_expired',
        'stripe_connect_checkout_failed'
    ) then
        raise exception 'unsupported Stripe Connect Checkout terminal event';
    end if;
    if p_provider_event_id !~ '^evt_[A-Za-z0-9]+$'
       or p_stripe_checkout_session_id
          !~ '^cs_(test_|live_)?[A-Za-z0-9]+$'
       or p_provider_created_at is null then
        raise exception 'invalid Stripe Connect Checkout terminal event';
    end if;
    if exists (
        select 1
          from public.stripe_connect_events
         where stripe_event_id = p_provider_event_id
    ) then
        return 'duplicate';
    end if;

    v_status := case
        when p_event_type = 'stripe_connect_checkout_expired'
            then 'expired'
        else 'failed'
    end;

    update public.stripe_connect_checkout_claims
       set claim_status = v_status,
           updated_at = now()
     where stripe_checkout_session_id = p_stripe_checkout_session_id
       and user_id = p_user_id
       and stripe_account_id = p_stripe_account_id
       and livemode = p_livemode
       and claim_status = 'created';

    if not found then
        return 'missing';
    end if;

    insert into public.stripe_connect_events (
        stripe_event_id,
        user_id,
        stripe_account_id,
        event_type,
        processing_result,
        livemode,
        provider_created_at,
        processed_at
    )
    values (
        p_provider_event_id,
        p_user_id,
        p_stripe_account_id,
        p_event_type,
        'applied',
        p_livemode,
        p_provider_created_at,
        coalesce(p_processed_at, now())
    );
    return 'applied';
end;
$$;

revoke all on function public.record_stripe_connect_checkout_terminal_event(
    text, uuid, text, text, text, boolean, timestamptz, timestamptz
) from public, anon, authenticated;
grant execute on function public.record_stripe_connect_checkout_terminal_event(
    text, uuid, text, text, text, boolean, timestamptz, timestamptz
) to service_role;

create or replace function public.apply_stripe_connect_invoice_event(
    p_invoice_id uuid,
    p_user_id uuid,
    p_stripe_account_id text,
    p_expected_version bigint,
    p_payments jsonb,
    p_history jsonb,
    p_status text,
    p_event_type text,
    p_provider_event_id text,
    p_metadata jsonb,
    p_processed_at timestamptz,
    p_provider_created_at timestamptz,
    p_livemode boolean,
    p_checkout_session_id text default null,
    p_amount_minor bigint default null,
    p_currency text default null
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
    if p_invoice_id is null or p_user_id is null
       or p_provider_event_id !~ '^evt_[A-Za-z0-9]+$'
       or p_stripe_account_id !~ '^acct_[A-Za-z0-9]+$'
       or p_provider_created_at is null then
        raise exception 'invalid Stripe Connect invoice event parameters';
    end if;
    if jsonb_typeof(p_payments) <> 'array'
       or jsonb_typeof(p_history) <> 'array' then
        raise exception 'invoice payments and history must be JSON arrays';
    end if;
    if p_status not in ('Draft', 'Sent', 'Paid', 'Cancelled') then
        raise exception 'invalid invoice status';
    end if;
    if p_event_type not in (
        'stripe_connect_payment_completed',
        'stripe_connect_payment_failed',
        'stripe_connect_refund_succeeded',
        'stripe_connect_refund_failed',
        'stripe_connect_refund_updated',
        'stripe_connect_dispute_created',
        'stripe_connect_dispute_funds_withdrawn',
        'stripe_connect_dispute_funds_reinstated',
        'stripe_connect_dispute_closed',
        'stripe_connect_dispute_updated'
    ) then
        raise exception 'unsupported Stripe Connect invoice event type';
    end if;

    if not exists (
        select 1
          from public.stripe_connected_accounts
         where user_id = p_user_id
           and stripe_account_id = p_stripe_account_id
           and livemode = p_livemode
    ) then
        raise exception 'Stripe Connect account ownership mismatch';
    end if;

    if exists (
        select 1
          from public.stripe_connect_events
         where stripe_event_id = p_provider_event_id
    ) then
        return 'duplicate';
    end if;

    if p_event_type in (
        'stripe_connect_payment_completed',
        'stripe_connect_payment_failed'
    ) and not exists (
        select 1
          from public.stripe_connect_checkout_claims
         where stripe_checkout_session_id = p_checkout_session_id
           and invoice_id = p_invoice_id
           and user_id = p_user_id
           and stripe_account_id = p_stripe_account_id
           and amount_minor = p_amount_minor
           and currency = p_currency
           and livemode = p_livemode
           and claim_status = 'created'
    ) then
        raise exception 'Stripe Connect Checkout claim mismatch';
    end if;

    select stripe_event_version
      into v_version
      from public.invoices
     where id = p_invoice_id
       and user_id = p_user_id
     for update;

    if not found then
        return 'missing';
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
    )
    values (
        p_user_id,
        null,
        p_event_type,
        'invoice',
        p_invoice_id,
        'provider_webhook',
        'stripe_connect',
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

    insert into public.stripe_connect_events (
        stripe_event_id,
        user_id,
        stripe_account_id,
        event_type,
        processing_result,
        livemode,
        provider_created_at,
        processed_at
    )
    values (
        p_provider_event_id,
        p_user_id,
        p_stripe_account_id,
        p_event_type,
        'applied',
        p_livemode,
        p_provider_created_at,
        coalesce(p_processed_at, now())
    );

    update public.invoices
       set payments = p_payments,
           history = p_history,
           status = p_status,
           updated_at = coalesce(p_processed_at, now())
     where id = p_invoice_id
       and user_id = p_user_id;

    if not found then
        raise exception 'invoice disappeared during Connect event processing';
    end if;

    if p_event_type = 'stripe_connect_payment_completed' then
        update public.stripe_connect_checkout_claims
           set claim_status = 'completed',
               updated_at = now()
         where stripe_checkout_session_id = p_checkout_session_id
           and claim_status = 'created';
    elsif p_event_type = 'stripe_connect_payment_failed' then
        update public.stripe_connect_checkout_claims
           set claim_status = 'failed',
               updated_at = now()
         where stripe_checkout_session_id = p_checkout_session_id
           and claim_status = 'created';
    end if;

    return 'applied';
end;
$$;

revoke all on function public.apply_stripe_connect_invoice_event(
    uuid, uuid, text, bigint, jsonb, jsonb, text, text, text, jsonb,
    timestamptz, timestamptz, boolean, text, bigint, text
) from public, anon, authenticated;
grant execute on function public.apply_stripe_connect_invoice_event(
    uuid, uuid, text, bigint, jsonb, jsonb, text, text, text, jsonb,
    timestamptz, timestamptz, boolean, text, bigint, text
) to service_role;

comment on table public.stripe_connect_checkout_claims is
    'Private service-only binding between a Tallyo invoice and a connected-account Checkout attempt.';
