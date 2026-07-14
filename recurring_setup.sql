-- ============================================================================
-- Tallyo - Recurring templates setup
--
-- Run in the Supabase SQL Editor if the recurring_templates table is missing
-- or needs to be brought up to the current app shape.
--
-- Security model:
--   * Each schedule belongs to one auth user via user_id.
--   * RLS scopes browser access to auth.uid() = user_id.
--   * The scheduled Edge Function uses the service role key and must explicitly
--     stamp generated invoices with the template owner's user_id.
-- ============================================================================

create table if not exists public.recurring_templates (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name              text,
    customer_snapshot jsonb,
    items             jsonb not null default '[]'::jsonb,
    currency          text default 'GBP',
    global_discount   numeric(12,2) default 0,
    tax_mode          text default 'exclusive',
    shipping_cost     numeric(12,2) default 0,
    notes             text,
    terms             text,
    frequency         text not null default 'monthly',
    custom_interval   integer default 1,
    custom_unit       text default 'months',
    start_date        date not null default current_date,
    next_run          date not null default current_date,
    active            boolean not null default true,
    email_enabled     boolean not null default false,
    last_generated    date,
    generated_count   integer default 0,
    history           jsonb default '[]'::jsonb,
    created_at        timestamptz default now(),
    updated_at        timestamptz default now(),
    constraint recurring_templates_frequency_check
        check (frequency in ('weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
    constraint recurring_templates_custom_unit_check
        check (custom_unit in ('days', 'weeks', 'months'))
);

alter table public.recurring_templates
    add column if not exists user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    add column if not exists name text,
    add column if not exists customer_snapshot jsonb,
    add column if not exists items jsonb not null default '[]'::jsonb,
    add column if not exists currency text default 'GBP',
    add column if not exists global_discount numeric(12,2) default 0,
    add column if not exists tax_mode text default 'exclusive',
    add column if not exists shipping_cost numeric(12,2) default 0,
    add column if not exists notes text,
    add column if not exists terms text,
    add column if not exists frequency text not null default 'monthly',
    add column if not exists custom_interval integer default 1,
    add column if not exists custom_unit text default 'months',
    add column if not exists start_date date not null default current_date,
    add column if not exists next_run date not null default current_date,
    add column if not exists active boolean not null default true,
    add column if not exists email_enabled boolean not null default false,
    add column if not exists last_generated date,
    add column if not exists generated_count integer default 0,
    add column if not exists history jsonb default '[]'::jsonb,
    add column if not exists created_at timestamptz default now(),
    add column if not exists updated_at timestamptz default now();

-- Generated invoices retain their schedule source and occurrence. The partial
-- unique index prevents retries/concurrent jobs from generating the same
-- occurrence twice while leaving manual invoices unaffected.
alter table public.invoices
    add column if not exists recurring_template_id uuid,
    add column if not exists recurring_occurrence_date date;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'invoices_recurring_template_id_fkey'
          and conrelid = 'public.invoices'::regclass
    ) then
        alter table public.invoices
            add constraint invoices_recurring_template_id_fkey
            foreign key (recurring_template_id)
            references public.recurring_templates(id)
            on delete set null;
    end if;
end;
$$;

create unique index if not exists invoices_recurring_occurrence_uidx
    on public.invoices(recurring_template_id, recurring_occurrence_date)
    where recurring_template_id is not null
      and recurring_occurrence_date is not null;

create index if not exists recurring_templates_user_id_idx
    on public.recurring_templates(user_id);

create index if not exists recurring_templates_due_idx
    on public.recurring_templates(active, next_run);

alter table public.recurring_templates enable row level security;

drop policy if exists "own recurring_templates - select" on public.recurring_templates;
drop policy if exists "own recurring - select" on public.recurring_templates;
create policy "own recurring - select"
    on public.recurring_templates for select using ((select auth.uid()) = user_id);

drop policy if exists "own recurring_templates - insert" on public.recurring_templates;
drop policy if exists "own recurring - insert" on public.recurring_templates;
create policy "own recurring - insert"
    on public.recurring_templates for insert with check ((select auth.uid()) = user_id);

drop policy if exists "own recurring_templates - update" on public.recurring_templates;
drop policy if exists "own recurring - update" on public.recurring_templates;
create policy "own recurring - update"
    on public.recurring_templates for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own recurring_templates - delete" on public.recurring_templates;
drop policy if exists "own recurring - delete" on public.recurring_templates;
create policy "own recurring - delete"
    on public.recurring_templates for delete using ((select auth.uid()) = user_id);
