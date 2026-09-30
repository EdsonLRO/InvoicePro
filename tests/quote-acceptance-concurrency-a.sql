\set ON_ERROR_STOP on

begin;

-- Hold the quote row so the second acceptance reaches the same transaction
-- boundary while this request is still in flight.
select id
  from public.invoices
 where quote_access_token_hash = repeat('f', 64)
 for update;

select pg_sleep(2);

select public.quote_public_action(
    repeat('f', 64),
    'accept',
    'Concurrent Test'
);

commit;
