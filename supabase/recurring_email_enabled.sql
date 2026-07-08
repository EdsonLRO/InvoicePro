-- Add opt-in automatic emailing for recurring invoice schedules.
-- Safe to run more than once.

alter table public.recurring_templates
    add column if not exists email_enabled boolean not null default false;
