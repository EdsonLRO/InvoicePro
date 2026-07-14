-- SEC-AUTO-002: bind each generated invoice to one recurring-template
-- occurrence so retries and concurrent scheduler calls cannot create duplicates.

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

comment on column public.invoices.recurring_template_id is
    'Recurring template that generated this invoice; null for manual invoices.';

comment on column public.invoices.recurring_occurrence_date is
    'Scheduled occurrence claimed by this generated invoice for idempotency.';
