-- Minimal disposable schema for stripe-payment-transaction-probe.sql.
\set ON_ERROR_STOP on

create table public.invoices (
    id uuid primary key,
    user_id uuid not null,
    payments jsonb not null default '[]'::jsonb,
    history jsonb default '[]'::jsonb,
    status text not null,
    stripe_event_version bigint not null default 0,
    updated_at timestamptz default now()
);

create table public.audit_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    actor_user_id uuid,
    event_type text not null,
    object_type text,
    object_id uuid,
    source text not null,
    provider text,
    provider_event_id text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create unique index audit_events_provider_event_uidx
    on public.audit_events(provider, provider_event_id)
    where provider is not null and provider_event_id is not null;

do $$
begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then
        create role anon nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then
        create role authenticated nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then
        create role service_role nologin;
    end if;
end;
$$;
