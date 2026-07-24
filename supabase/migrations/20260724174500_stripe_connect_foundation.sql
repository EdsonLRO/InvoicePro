-- Repository-only Stripe Connect account foundation.
-- This migration is intentionally unapplied. It creates no Stripe account,
-- configures no secret and enables no customer payment path.

create table public.stripe_connected_accounts (
    user_id uuid primary key references auth.users(id) on delete cascade,
    stripe_account_id text not null unique
        check (stripe_account_id ~ '^acct_[A-Za-z0-9]+$'),
    api_family text not null default 'accounts_v2'
        check (api_family = 'accounts_v2'),
    dashboard_access text not null default 'full'
        check (dashboard_access = 'full'),
    fees_collector text not null default 'stripe'
        check (fees_collector = 'stripe'),
    losses_collector text not null default 'stripe'
        check (losses_collector = 'stripe'),
    livemode boolean not null,
    onboarding_state text not null default 'pending'
        check (onboarding_state in (
            'pending',
            'restricted',
            'active',
            'disconnected'
        )),
    card_payments_status text not null default 'unknown'
        check (card_payments_status in (
            'unknown',
            'inactive',
            'pending',
            'restricted',
            'active'
        )),
    payouts_status text not null default 'unknown'
        check (payouts_status in (
            'unknown',
            'inactive',
            'pending',
            'restricted',
            'active'
        )),
    provider_updated_at timestamptz,
    disconnected_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, stripe_account_id),
    constraint stripe_connected_accounts_disconnect_check check (
        (onboarding_state = 'disconnected' and disconnected_at is not null)
        or (onboarding_state <> 'disconnected' and disconnected_at is null)
    )
);

create table public.stripe_connect_events (
    stripe_event_id text primary key
        check (stripe_event_id ~ '^evt_[A-Za-z0-9]+$'),
    user_id uuid not null references auth.users(id) on delete cascade,
    stripe_account_id text not null,
    event_type text not null,
    processing_result text not null
        check (processing_result in (
            'applied',
            'duplicate',
            'stale',
            'rejected'
        )),
    livemode boolean not null,
    provider_created_at timestamptz not null,
    processed_at timestamptz not null default now(),
    constraint stripe_connect_events_account_owner_fk
        foreign key (user_id, stripe_account_id)
        references public.stripe_connected_accounts(user_id, stripe_account_id)
        on update restrict on delete restrict
);

create index stripe_connect_events_user_created_idx
    on public.stripe_connect_events(user_id, provider_created_at desc);
create index stripe_connect_events_account_created_idx
    on public.stripe_connect_events(stripe_account_id, provider_created_at desc);

alter table public.stripe_connected_accounts enable row level security;
alter table public.stripe_connect_events enable row level security;

create policy "own connected account - select"
    on public.stripe_connected_accounts
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

revoke all on public.stripe_connected_accounts
    from public, anon, authenticated;
revoke all on public.stripe_connect_events
    from public, anon, authenticated;

grant select on public.stripe_connected_accounts to authenticated;
grant all on public.stripe_connected_accounts to service_role;
grant all on public.stripe_connect_events to service_role;

create or replace function public.set_stripe_connect_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

revoke execute on function public.set_stripe_connect_updated_at()
    from public, anon, authenticated;

create trigger set_stripe_connected_accounts_updated_at
    before update on public.stripe_connected_accounts
    for each row execute function public.set_stripe_connect_updated_at();

create or replace function public.prevent_stripe_connect_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    raise exception 'stripe_connect_events are append-only';
end;
$$;

revoke execute on function public.prevent_stripe_connect_event_mutation()
    from public, anon, authenticated;

create trigger prevent_stripe_connect_event_update
    before update on public.stripe_connect_events
    for each row execute function public.prevent_stripe_connect_event_mutation();

create trigger prevent_stripe_connect_event_delete
    before delete on public.stripe_connect_events
    for each row execute function public.prevent_stripe_connect_event_mutation();

comment on table public.stripe_connected_accounts is
    'Tenant-bound, provider-derived Stripe Connect state. Browser roles may read only their own row.';
comment on table public.stripe_connect_events is
    'Private, append-only Stripe Connect reconciliation evidence without full provider payloads.';
