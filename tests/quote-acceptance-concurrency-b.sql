\set ON_ERROR_STOP on

select public.quote_public_action(
    repeat('f', 64),
    'accept',
    'Concurrent Test'
);
