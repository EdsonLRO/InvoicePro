-- Per-invoice overdue reminder automation settings.
-- Run this once in the Supabase SQL Editor before saving invoice reminder settings.

alter table public.invoices
    add column if not exists overdue_reminders_enabled boolean not null default false,
    add column if not exists overdue_first_reminder_days integer not null default 3,
    add column if not exists overdue_repeat_reminder_days integer not null default 7,
    add column if not exists overdue_max_reminders integer not null default 3;

alter table public.invoices
    drop constraint if exists invoices_overdue_first_reminder_days_chk,
    add constraint invoices_overdue_first_reminder_days_chk
        check (overdue_first_reminder_days between 1 and 365);

alter table public.invoices
    drop constraint if exists invoices_overdue_repeat_reminder_days_chk,
    add constraint invoices_overdue_repeat_reminder_days_chk
        check (overdue_repeat_reminder_days between 1 and 365);

alter table public.invoices
    drop constraint if exists invoices_overdue_max_reminders_chk,
    add constraint invoices_overdue_max_reminders_chk
        check (overdue_max_reminders between 1 and 24);
