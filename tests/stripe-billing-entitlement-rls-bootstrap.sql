\set ON_ERROR_STOP on

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create table public.company_settings (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    value text
);

create table public.customers (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    value text
);

create table public.saved_items (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    value text
);

create table public.invoices (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    value text
);

create table public.recurring_templates (
    id uuid primary key,
    user_id uuid not null references auth.users(id),
    value text
);

alter table public.company_settings enable row level security;
alter table public.customers enable row level security;
alter table public.saved_items enable row level security;
alter table public.invoices enable row level security;
alter table public.recurring_templates enable row level security;

grant select, insert, update, delete
    on public.company_settings,
       public.customers,
       public.saved_items,
       public.invoices,
       public.recurring_templates
    to authenticated;

grant all
    on public.company_settings,
       public.customers,
       public.saved_items,
       public.invoices,
       public.recurring_templates
    to service_role;

create policy "own company_settings - select"
    on public.company_settings for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "own company_settings - insert"
    on public.company_settings for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "own company_settings - update"
    on public.company_settings for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own company_settings - delete"
    on public.company_settings for delete to authenticated
    using ((select auth.uid()) = user_id);

create policy "own customers - select"
    on public.customers for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "own customers - insert"
    on public.customers for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "own customers - update"
    on public.customers for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own customers - delete"
    on public.customers for delete to authenticated
    using ((select auth.uid()) = user_id);

create policy "own saved_items - select"
    on public.saved_items for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "own saved_items - insert"
    on public.saved_items for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "own saved_items - update"
    on public.saved_items for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own saved_items - delete"
    on public.saved_items for delete to authenticated
    using ((select auth.uid()) = user_id);

create policy "own invoices - select"
    on public.invoices for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "own invoices - insert"
    on public.invoices for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "own invoices - update"
    on public.invoices for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own invoices - delete"
    on public.invoices for delete to authenticated
    using ((select auth.uid()) = user_id);

create policy "own recurring - select"
    on public.recurring_templates for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "own recurring - insert"
    on public.recurring_templates for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "own recurring - update"
    on public.recurring_templates for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "own recurring - delete"
    on public.recurring_templates for delete to authenticated
    using ((select auth.uid()) = user_id);
