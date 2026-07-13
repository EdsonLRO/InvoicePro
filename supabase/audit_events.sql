-- ============================================================================
-- Tallyo - Append-only audit events draft
--
-- Purpose:
--   Trusted server-side event log for security-sensitive actions such as email
--   delivery events, Stripe payment webhooks, refunds, disputes, and privileged
--   automation.
--
-- Important:
--   This complements the existing invoice/template history JSONB fields. It is
--   not wired into the app yet. Apply in Supabase SQL Editor when ready.
--
-- Security model:
--   * Users can read their own audit events.
--   * Users cannot insert/update/delete audit events through the browser.
--   * Edge Functions using the service role key insert trusted events.
--   * Updates and deletes are blocked by trigger to keep events append-only.
-- ============================================================================

create table if not exists public.audit_events (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users(id) on delete cascade,
    actor_user_id     uuid references auth.users(id) on delete set null,
    event_type        text not null,
    object_type       text,
    object_id         uuid,
    source            text not null default 'app'
                      check (source in ('app', 'edge_function', 'provider_webhook', 'system')),
    request_id        text,
    provider          text,
    provider_event_id text,
    metadata          jsonb not null default '{}'::jsonb,
    created_at        timestamptz not null default now()
);

create index if not exists audit_events_user_created_idx
    on public.audit_events(user_id, created_at desc);

create index if not exists audit_events_actor_user_id_idx
    on public.audit_events(actor_user_id);

create index if not exists audit_events_object_idx
    on public.audit_events(object_type, object_id);

create unique index if not exists audit_events_provider_event_uidx
    on public.audit_events(provider, provider_event_id)
    where provider is not null and provider_event_id is not null;

alter table public.audit_events enable row level security;

drop policy if exists "own audit_events - select" on public.audit_events;
create policy "own audit_events - select"
    on public.audit_events for select using ((select auth.uid()) = user_id);

-- No insert/update/delete policies are created on purpose. Browser clients read
-- their own audit events, while trusted Edge Functions insert with service role.

create or replace function public.prevent_audit_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    raise exception 'audit_events are append-only';
end;
$$;

revoke execute on function public.prevent_audit_event_mutation() from public, anon, authenticated;

drop trigger if exists prevent_audit_event_update on public.audit_events;
create trigger prevent_audit_event_update
    before update on public.audit_events
    for each row execute function public.prevent_audit_event_mutation();

drop trigger if exists prevent_audit_event_delete on public.audit_events;
create trigger prevent_audit_event_delete
    before delete on public.audit_events
    for each row execute function public.prevent_audit_event_mutation();
