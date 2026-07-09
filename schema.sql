-- ============================================================================
-- InvoicePro — Database Schema + Row Level Security (RLS)
-- Run this whole file once in the Supabase SQL Editor.
--
-- Design notes:
--  * Every table has a user_id that defaults to the logged-in user (auth.uid()).
--  * RLS is enabled on every table, so the DATABASE itself blocks any access
--    to rows that don't belong to the requesting user. This is the server-side
--    multi-tenant isolation that remediates finding F-07 (and supports F-05).
--  * Invoices store a SNAPSHOT of customer details (customer_snapshot JSONB) so
--    historical invoices stay correct even if the customer is later edited or
--    deleted (GDPR erasure) — see threat model / compliance notes.
--  * Money is stored as numeric(12,2); dates as date; flexible structures as
--    JSONB (line items, payments) to mirror the current app's data shapes.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. COMPANY SETTINGS  (one row per user — the user's own business profile)
-- ----------------------------------------------------------------------------
create table public.company_settings (
    user_id          uuid primary key references auth.users(id) on delete cascade,
    name             text,
    address          text,
    phone            text,
    mobile           text,
    email            text,
    tax_id           text,
    additional_info  text,
    logo_url         text,
    invoice_prefix   text default '',
    quote_prefix     text default 'QUO-',
    credit_prefix    text default 'CN-',
    default_currency text default 'GBP',
    payment_details  text,
    default_notes    text,
    default_terms    text,
    invoice_footer   text,
    brand_color      text default '#4f46e5',
    logo_position    text default 'left',
    updated_at       timestamptz default now()
);


-- ----------------------------------------------------------------------------
-- 2. CUSTOMERS  (the reusable address book)
-- ----------------------------------------------------------------------------
create table public.customers (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name             text not null,
    address          text,
    phone            text,
    mobile           text,
    email            text,
    tax_id           text,
    additional_info  text,
    created_at       timestamptz default now()
);
create index customers_user_id_idx on public.customers(user_id);


-- ----------------------------------------------------------------------------
-- 3. SAVED ITEMS  (reusable line-item catalogue)
-- ----------------------------------------------------------------------------
create table public.saved_items (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name         text not null,
    description  text,
    price        numeric(12,2) default 0,
    created_at   timestamptz default now()
);
create index saved_items_user_id_idx on public.saved_items(user_id);


-- ----------------------------------------------------------------------------
-- 4. INVOICES  (one row per document: invoice / quote / credit note)
--    customer_snapshot freezes the customer details at issue time.
--    items & payments are stored as JSONB to match the current app.
-- ----------------------------------------------------------------------------
create table public.invoices (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,

    doc_type          text not null default 'invoice'
                          check (doc_type in ('invoice','quote','credit')),
    number            text not null,
    status            text not null default 'Draft'
                          check (status in ('Draft','Sent','Paid','Cancelled')),

    issue_date        date,
    due_date          date,
    po_number         text,
    currency          text default 'GBP',

    -- frozen copy of the customer at the moment of issue (snapshot model)
    customer_id       uuid references public.customers(id) on delete set null,
    customer_snapshot jsonb,

    -- line items: [{ name, qty, unit, price, discount }, ...]
    items             jsonb not null default '[]'::jsonb,
    -- payments: [{ amount, date, note }, ...]
    payments          jsonb not null default '[]'::jsonb,

    online_payment_mode text not null default 'full'
                          check (online_payment_mode in ('full','deposit')),
    deposit_amount    numeric(12,2) not null default 0
                          check (deposit_amount >= 0),

    global_discount   numeric(12,2) default 0,
    tax_rate          numeric(6,3)  default 0,
    tax_mode          text          default 'exclusive',
    history           jsonb         default '[]'::jsonb,
    shipping_cost     numeric(12,2) default 0,
    tip               numeric(12,2) default 0,

    notes             text,
    terms             text,

    -- computed totals snapshot (kept for fast listing / reporting)
    grand_total       numeric(12,2) default 0,

    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
);
create index invoices_user_id_idx on public.invoices(user_id);
-- invoice numbers must be unique PER USER and per document type
create unique index invoices_user_number_idx
    on public.invoices(user_id, doc_type, number);


-- ============================================================================
-- ROW LEVEL SECURITY
-- Turn RLS on for every table, then add policies. With RLS enabled and NO
-- policy, the default is DENY ALL — so we explicitly grant each user access
-- to ONLY their own rows. auth.uid() is the verified ID of the logged-in user
-- provided by Supabase Auth; it cannot be forged by the client.
-- ============================================================================

alter table public.company_settings enable row level security;
alter table public.customers        enable row level security;
alter table public.saved_items      enable row level security;
alter table public.invoices         enable row level security;

-- company_settings ----------------------------------------------------------
create policy "own company_settings - select"
    on public.company_settings for select using (auth.uid() = user_id);
create policy "own company_settings - insert"
    on public.company_settings for insert with check (auth.uid() = user_id);
create policy "own company_settings - update"
    on public.company_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own company_settings - delete"
    on public.company_settings for delete using (auth.uid() = user_id);

-- customers ------------------------------------------------------------------
create policy "own customers - select"
    on public.customers for select using (auth.uid() = user_id);
create policy "own customers - insert"
    on public.customers for insert with check (auth.uid() = user_id);
create policy "own customers - update"
    on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own customers - delete"
    on public.customers for delete using (auth.uid() = user_id);

-- saved_items ----------------------------------------------------------------
create policy "own saved_items - select"
    on public.saved_items for select using (auth.uid() = user_id);
create policy "own saved_items - insert"
    on public.saved_items for insert with check (auth.uid() = user_id);
create policy "own saved_items - update"
    on public.saved_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved_items - delete"
    on public.saved_items for delete using (auth.uid() = user_id);

-- invoices -------------------------------------------------------------------
create policy "own invoices - select"
    on public.invoices for select using (auth.uid() = user_id);
create policy "own invoices - insert"
    on public.invoices for insert with check (auth.uid() = user_id);
create policy "own invoices - update"
    on public.invoices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own invoices - delete"
    on public.invoices for delete using (auth.uid() = user_id);


-- ============================================================================
-- Optional convenience: auto-create an empty company_settings row the first
-- time a user signs up, so the app always has a settings row to read/update.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.company_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================================
-- DONE. Next step in the app: switch the login to Supabase Auth, then rewrite
-- the save/load layer to read/write these tables instead of localStorage.
-- ============================================================================
