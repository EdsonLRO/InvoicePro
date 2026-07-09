-- Overdue reminder automation settings.
-- Run this once in the Supabase SQL Editor before saving the new email settings.

alter table public.company_settings
    add column if not exists overdue_reminders_enabled boolean not null default false,
    add column if not exists overdue_first_reminder_days integer not null default 3,
    add column if not exists overdue_repeat_reminder_days integer not null default 7,
    add column if not exists overdue_max_reminders integer not null default 3;

alter table public.company_settings
    drop constraint if exists company_settings_overdue_first_reminder_days_chk,
    add constraint company_settings_overdue_first_reminder_days_chk
        check (overdue_first_reminder_days between 1 and 365);

alter table public.company_settings
    drop constraint if exists company_settings_overdue_repeat_reminder_days_chk,
    add constraint company_settings_overdue_repeat_reminder_days_chk
        check (overdue_repeat_reminder_days between 1 and 365);

alter table public.company_settings
    drop constraint if exists company_settings_overdue_max_reminders_chk,
    add constraint company_settings_overdue_max_reminders_chk
        check (overdue_max_reminders between 1 and 24);
