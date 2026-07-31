-- The hosted project's default privileges grant service_role all table
-- privileges. This workflow only needs to read, insert and update requests.
revoke delete, truncate, references, trigger
  on table public.marketing_overview_requests
  from service_role;
