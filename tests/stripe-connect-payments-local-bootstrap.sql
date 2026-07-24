\set ON_ERROR_STOP on

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

create table auth.users (
    id uuid primary key
);

insert into auth.users (id)
values
    ('11111111-1111-4111-8111-111111111111'),
    ('22222222-2222-4222-8222-222222222222');

create table public.invoices (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    doc_type text not null default 'invoice',
    grand_total numeric not null default 100,
    currency text not null default 'GBP',
    payments jsonb not null default '[]'::jsonb,
    history jsonb not null default '[]'::jsonb,
    status text not null default 'Sent',
    stripe_event_version bigint not null default 0,
    updated_at timestamptz not null default now()
);

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

create trigger bump_invoice_stripe_event_version
    before update on public.invoices
    for each row execute function public.bump_invoice_stripe_event_version();

create table public.audit_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
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

grant all on public.invoices, public.audit_events to service_role;
