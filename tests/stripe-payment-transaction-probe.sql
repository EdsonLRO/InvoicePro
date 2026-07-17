-- Isolated PostgreSQL probe for PAY-LIVE-001.
-- Run only after the disposable schema and matching migration are applied.
\set ON_ERROR_STOP on

truncate public.audit_events, public.invoices;
insert into public.invoices (id, user_id, payments, history, status, updated_at)
values (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '[]',
    '[]',
    'Sent',
    '2026-07-17T16:00:00Z'
);

do $$
declare
    v_result text;
    v_history_count integer;
    v_audit_count integer;
    v_version bigint;
begin
    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        0,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-1"}]',
        'Sent',
        'stripe_payment_completed',
        'evt-1',
        '{"amount":10}',
        '2026-07-17T16:01:00Z'
    ) into v_result;
    assert v_result = 'applied', 'first event was not applied';

    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        1,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-1"}]',
        'Sent',
        'stripe_payment_completed',
        'evt-1',
        '{"amount":10}',
        '2026-07-17T16:02:00Z'
    ) into v_result;
    assert v_result = 'duplicate', 'duplicate event was not rejected';

    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        0,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-2"}]',
        'Sent',
        'charge_dispute_created',
        'evt-2',
        '{}',
        '2026-07-17T16:02:00Z'
    ) into v_result;
    assert v_result = 'stale', 'stale event was not rejected';

    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        1,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-1"},{"providerMarker":"stripe:evt-2"}]',
        'Sent',
        'charge_dispute_created',
        'evt-2',
        '{}',
        '2026-07-17T16:02:00Z'
    ) into v_result;
    assert v_result = 'applied', 'fresh retry was not applied';

    select jsonb_array_length(history) into v_history_count from public.invoices;
    select count(*) into v_audit_count from public.audit_events;
    select stripe_event_version into v_version from public.invoices;
    assert v_history_count = 2, 'concurrent event history was lost';
    assert v_audit_count = 2, 'provider audit event count is incorrect';
    assert v_version = 2, 'invoice mutation version did not advance';

    update public.invoices
       set history = history || '[{"type":"edited"}]'::jsonb
     where id = '11111111-1111-4111-8111-111111111111';

    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        2,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-1"},{"providerMarker":"stripe:evt-2"},{"providerMarker":"stripe:evt-3"}]',
        'Sent',
        'charge_dispute_updated',
        'evt-3',
        '{}',
        '2026-07-17T16:03:00Z'
    ) into v_result;
    assert v_result = 'stale', 'concurrent app edit did not invalidate the webhook snapshot';

    select public.apply_stripe_invoice_event(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        3,
        '[{"amount":10}]',
        '[{"providerMarker":"stripe:evt-1"},{"providerMarker":"stripe:evt-2"},{"type":"edited"},{"providerMarker":"stripe:evt-3"}]',
        'Sent',
        'charge_dispute_updated',
        'evt-3',
        '{}',
        '2026-07-17T16:03:00Z'
    ) into v_result;
    assert v_result = 'applied', 'webhook retry after app edit was not applied';

    select jsonb_array_length(history), stripe_event_version
      into v_history_count, v_version
      from public.invoices;
    select count(*) into v_audit_count from public.audit_events;
    assert v_history_count = 4, 'app edit or provider history was lost';
    assert v_audit_count = 3, 'audit count after app-edit retry is incorrect';
    assert v_version = 4, 'invoice version after app-edit retry is incorrect';

    assert not has_function_privilege(
        'anon',
        'public.apply_stripe_invoice_event(uuid,uuid,bigint,jsonb,jsonb,text,text,text,jsonb,timestamptz)',
        'execute'
    ), 'anon can execute the payment transaction';
    assert not has_function_privilege(
        'authenticated',
        'public.apply_stripe_invoice_event(uuid,uuid,bigint,jsonb,jsonb,text,text,text,jsonb,timestamptz)',
        'execute'
    ), 'authenticated can execute the payment transaction';
    assert has_function_privilege(
        'service_role',
        'public.apply_stripe_invoice_event(uuid,uuid,bigint,jsonb,jsonb,text,text,text,jsonb,timestamptz)',
        'execute'
    ), 'service_role cannot execute the payment transaction';
end;
$$;

select 'Stripe payment transaction probe passed.' as result;
