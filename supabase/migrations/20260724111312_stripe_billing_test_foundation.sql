-- Repository-only Stripe Billing foundation.
-- This migration is intentionally unapplied. It creates no Stripe objects,
-- configures no secrets and enables no subscription Checkout path.

create table public.billing_customers (
    user_id uuid primary key references auth.users(id) on delete cascade,
    stripe_customer_id text not null unique
        check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, stripe_customer_id)
);

create table public.billing_subscriptions (
    user_id uuid primary key references auth.users(id) on delete cascade,
    stripe_customer_id text not null,
    stripe_subscription_id text not null unique
        check (stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
    stripe_price_id text not null
        check (stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
    plan_key text not null default 'tallyo_pro'
        check (plan_key = 'tallyo_pro'),
    billing_interval text not null
        check (billing_interval in ('monthly', 'annual')),
    provider_status text not null
        check (provider_status in (
            'incomplete',
            'incomplete_expired',
            'active',
            'past_due',
            'unpaid',
            'canceled',
            'paused'
        )),
    current_period_end timestamptz,
    cancel_at_period_end boolean not null default false,
    provider_event_created_at timestamptz not null,
    provider_event_id text not null
        check (provider_event_id ~ '^evt_[A-Za-z0-9]+$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint billing_subscriptions_customer_owner_fk
        foreign key (user_id, stripe_customer_id)
        references public.billing_customers(user_id, stripe_customer_id)
        on update restrict on delete restrict
);

create table public.billing_events (
    stripe_event_id text primary key
        check (stripe_event_id ~ '^evt_[A-Za-z0-9]+$'),
    user_id uuid not null references auth.users(id) on delete cascade,
    event_type text not null
        check (event_type in (
            'checkout.session.completed',
            'checkout.session.expired',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'customer.subscription.paused',
            'customer.subscription.resumed',
            'invoice.paid',
            'invoice.payment_failed',
            'invoice.payment_action_required'
        )),
    stripe_object_id text,
    processing_result text not null
        check (processing_result in ('applied', 'stale')),
    provider_created_at timestamptz not null,
    processed_at timestamptz not null default now()
);

create table public.account_entitlements (
    user_id uuid primary key references auth.users(id) on delete cascade,
    plan_key text not null default 'tallyo_pro'
        check (plan_key = 'tallyo_pro'),
    access_state text not null
        check (access_state in ('full', 'grace', 'read_only')),
    effective_until timestamptz,
    source_event_id text not null
        references public.billing_events(stripe_event_id)
        on update restrict on delete restrict,
    updated_at timestamptz not null default now()
);

create index billing_events_user_created_idx
    on public.billing_events(user_id, provider_created_at desc);
create index billing_subscriptions_customer_idx
    on public.billing_subscriptions(stripe_customer_id);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.account_entitlements enable row level security;

create policy "own billing customers - select"
    on public.billing_customers
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "own billing subscriptions - select"
    on public.billing_subscriptions
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "own billing events - select"
    on public.billing_events
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "own account entitlements - select"
    on public.account_entitlements
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

revoke all on public.billing_customers from public, anon, authenticated;
revoke all on public.billing_subscriptions from public, anon, authenticated;
revoke all on public.billing_events from public, anon, authenticated;
revoke all on public.account_entitlements from public, anon, authenticated;

grant select on public.billing_customers to authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select on public.billing_events to authenticated;
grant select on public.account_entitlements to authenticated;

grant all on public.billing_customers to service_role;
grant all on public.billing_subscriptions to service_role;
grant all on public.billing_events to service_role;
grant all on public.account_entitlements to service_role;

create or replace function public.set_billing_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

revoke execute on function public.set_billing_updated_at()
    from public, anon, authenticated;

create trigger set_billing_customers_updated_at
    before update on public.billing_customers
    for each row execute function public.set_billing_updated_at();

create trigger set_billing_subscriptions_updated_at
    before update on public.billing_subscriptions
    for each row execute function public.set_billing_updated_at();

create trigger set_account_entitlements_updated_at
    before update on public.account_entitlements
    for each row execute function public.set_billing_updated_at();

create or replace function public.prevent_billing_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    raise exception 'billing_events are append-only';
end;
$$;

revoke execute on function public.prevent_billing_event_mutation()
    from public, anon, authenticated;

create trigger prevent_billing_event_update
    before update on public.billing_events
    for each row execute function public.prevent_billing_event_mutation();

create trigger prevent_billing_event_delete
    before delete on public.billing_events
    for each row execute function public.prevent_billing_event_mutation();

create or replace function public.apply_stripe_billing_event(
    p_user_id uuid,
    p_stripe_customer_id text,
    p_stripe_subscription_id text,
    p_stripe_price_id text,
    p_billing_interval text,
    p_provider_status text,
    p_current_period_end timestamptz,
    p_cancel_at_period_end boolean,
    p_event_id text,
    p_event_type text,
    p_stripe_object_id text,
    p_event_created_at timestamptz
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_existing_event_at timestamptz;
    v_existing_subscription_id text;
    v_access_state text;
    v_effective_until timestamptz;
begin
    if p_user_id is null
       or p_stripe_customer_id is null
       or p_stripe_subscription_id is null
       or p_stripe_price_id is null
       or p_event_id is null
       or p_stripe_customer_id !~ '^cus_[A-Za-z0-9]+$'
       or p_stripe_subscription_id !~ '^sub_[A-Za-z0-9]+$'
       or p_stripe_price_id !~ '^price_[A-Za-z0-9]+$'
       or p_event_id !~ '^evt_[A-Za-z0-9]+$'
       or p_event_created_at is null then
        raise exception 'invalid Stripe Billing event parameters';
    end if;

    if p_billing_interval not in ('monthly', 'annual')
       or p_provider_status not in (
           'incomplete',
           'incomplete_expired',
           'active',
           'past_due',
           'unpaid',
           'canceled',
           'paused'
       )
       or p_event_type not in (
           'checkout.session.completed',
           'checkout.session.expired',
           'customer.subscription.created',
           'customer.subscription.updated',
           'customer.subscription.deleted',
           'customer.subscription.paused',
           'customer.subscription.resumed',
           'invoice.paid',
           'invoice.payment_failed',
           'invoice.payment_action_required'
       ) then
        raise exception 'unsupported Stripe Billing state or event';
    end if;

    if p_provider_status in ('active', 'past_due')
       and p_current_period_end is null then
        raise exception 'paid or grace Billing state requires a period end';
    end if;

    perform 1
      from public.billing_customers
     where user_id = p_user_id
       and stripe_customer_id = p_stripe_customer_id
     for update;
    if not found then
        return 'customer_mismatch';
    end if;

    if exists (
        select 1
          from public.billing_events
         where stripe_event_id = p_event_id
    ) then
        return 'duplicate';
    end if;

    select provider_event_created_at, stripe_subscription_id
      into v_existing_event_at, v_existing_subscription_id
      from public.billing_subscriptions
     where user_id = p_user_id
     for update;

    if found and (
        p_event_created_at < v_existing_event_at
        or (
            p_event_created_at = v_existing_event_at
            and p_stripe_subscription_id <> v_existing_subscription_id
        )
    ) then
        insert into public.billing_events (
            stripe_event_id,
            user_id,
            event_type,
            stripe_object_id,
            processing_result,
            provider_created_at
        ) values (
            p_event_id,
            p_user_id,
            p_event_type,
            nullif(btrim(p_stripe_object_id), ''),
            'stale',
            p_event_created_at
        );
        return 'stale';
    end if;

    insert into public.billing_events (
        stripe_event_id,
        user_id,
        event_type,
        stripe_object_id,
        processing_result,
        provider_created_at
    ) values (
        p_event_id,
        p_user_id,
        p_event_type,
        nullif(btrim(p_stripe_object_id), ''),
        'applied',
        p_event_created_at
    );

    insert into public.billing_subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        plan_key,
        billing_interval,
        provider_status,
        current_period_end,
        cancel_at_period_end,
        provider_event_created_at,
        provider_event_id
    ) values (
        p_user_id,
        p_stripe_customer_id,
        p_stripe_subscription_id,
        p_stripe_price_id,
        'tallyo_pro',
        p_billing_interval,
        p_provider_status,
        p_current_period_end,
        coalesce(p_cancel_at_period_end, false),
        p_event_created_at,
        p_event_id
    )
    on conflict (user_id) do update set
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        stripe_price_id = excluded.stripe_price_id,
        plan_key = excluded.plan_key,
        billing_interval = excluded.billing_interval,
        provider_status = excluded.provider_status,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end,
        provider_event_created_at = excluded.provider_event_created_at,
        provider_event_id = excluded.provider_event_id;

    if p_provider_status = 'active' then
        v_access_state := 'full';
        v_effective_until := p_current_period_end;
    elsif p_provider_status = 'past_due' then
        v_access_state := 'grace';
        v_effective_until := p_event_created_at + interval '7 days';
    else
        v_access_state := 'read_only';
        v_effective_until := p_current_period_end;
    end if;

    insert into public.account_entitlements (
        user_id,
        plan_key,
        access_state,
        effective_until,
        source_event_id
    ) values (
        p_user_id,
        'tallyo_pro',
        v_access_state,
        v_effective_until,
        p_event_id
    )
    on conflict (user_id) do update set
        plan_key = excluded.plan_key,
        access_state = excluded.access_state,
        effective_until = excluded.effective_until,
        source_event_id = excluded.source_event_id;

    return 'applied';
end;
$$;

revoke all on function public.apply_stripe_billing_event(
    uuid, text, text, text, text, text, timestamptz, boolean,
    text, text, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_stripe_billing_event(
    uuid, text, text, text, text, text, timestamptz, boolean,
    text, text, text, timestamptz
) to service_role;

create or replace function public.account_entitlement_allows_write(
    p_user_id uuid
)
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
    select exists (
        select 1
          from public.account_entitlements
         where user_id = p_user_id
           and access_state in ('full', 'grace')
           and (
               effective_until is null
               or effective_until > now()
           )
    );
$$;

revoke all on function public.account_entitlement_allows_write(uuid)
    from public, anon, authenticated;
grant execute on function public.account_entitlement_allows_write(uuid)
    to service_role;
