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

create table auth.users (id uuid primary key);

create table public.company_settings (
    user_id uuid primary key references auth.users(id),
    name text,
    address text,
    phone text,
    mobile text,
    email text,
    logo_url text,
    invoice_prefix text default ''
);

create table public.invoices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    doc_type text not null default 'invoice'
        check (doc_type in ('invoice', 'quote', 'credit')),
    number text not null,
    status text not null default 'Draft'
        constraint invoices_status_check
        check (status in ('Draft', 'Sent', 'Paid', 'Cancelled')),
    issue_date date,
    due_date date,
    po_number text,
    currency text default 'GBP',
    customer_id uuid,
    customer_snapshot jsonb,
    items jsonb not null default '[]'::jsonb,
    payments jsonb not null default '[]'::jsonb,
    online_payment_mode text not null default 'full',
    deposit_amount numeric(12,2) not null default 0,
    global_discount numeric(12,2) default 0,
    tax_rate numeric(6,3) default 0,
    tax_mode text default 'exclusive',
    history jsonb default '[]'::jsonb,
    shipping_cost numeric(12,2) default 0,
    tip numeric(12,2) default 0,
    notes text,
    terms text,
    grand_total numeric(12,2) default 0,
    overdue_reminders_enabled boolean not null default false,
    stripe_event_version bigint not null default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create unique index invoices_user_number_idx
    on public.invoices(user_id, doc_type, number);

create table public.audit_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    actor_user_id uuid,
    event_type text not null,
    object_type text,
    object_id uuid,
    source text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant select, insert, update, delete on public.invoices to authenticated, service_role;
grant select, insert, update, delete on public.company_settings to authenticated, service_role;
grant select, insert on public.audit_events to service_role;

alter table public.invoices enable row level security;
create policy "own invoices - select" on public.invoices
    for select using ((select auth.uid()) = user_id);
create policy "own invoices - insert" on public.invoices
    for insert with check ((select auth.uid()) = user_id);
create policy "own invoices - update" on public.invoices
    for update using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own invoices - delete" on public.invoices
    for delete using ((select auth.uid()) = user_id);
