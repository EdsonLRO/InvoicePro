-- Unapplied foundation for the optional, one-email free-generator overview.
-- Browser roles receive no access. The public Edge Function uses service_role
-- after validating consent, origin and abuse limits.

create table public.marketing_overview_requests (
  id uuid primary key default gen_random_uuid(),
  email text,
  email_hash text not null unique,
  network_hash text not null,
  consent_version text not null,
  consent_wording text not null,
  source text not null,
  consented_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'withdrawn')),
  sent_at timestamptz,
  withdrawn_at timestamptz,
  unsubscribe_token_hash text not null unique,
  created_at timestamptz not null default now(),
  constraint marketing_overview_email_state check (
    (status = 'pending' and email is not null)
    or (status in ('sent', 'failed', 'withdrawn') and email is null)
  ),
  constraint marketing_overview_withdrawal_state check (
    (status = 'withdrawn' and withdrawn_at is not null)
    or (status <> 'withdrawn' and withdrawn_at is null)
  )
);

create index marketing_overview_requests_network_created_idx
  on public.marketing_overview_requests (network_hash, created_at desc);

alter table public.marketing_overview_requests enable row level security;
alter table public.marketing_overview_requests force row level security;

revoke all on table public.marketing_overview_requests from public, anon, authenticated;
grant select, insert, update on table public.marketing_overview_requests to service_role;

comment on table public.marketing_overview_requests is
  'Minimised consent and one-send evidence for the optional free-generator Tallyo overview email.';
