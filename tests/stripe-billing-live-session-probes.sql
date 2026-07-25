\set ON_ERROR_STOP on

set role service_role;

do $$
begin
    if not public.complete_stripe_billing_checkout_claim(
        '22222222-2222-4222-8222-222222222222',
        'cus_TestAccountTwo',
        'ffffffff-ffff-4fff-8fff-ffffffffffff',
        'cs_live_TallyoSyntheticSession',
        now() + interval '30 minutes'
    ) then
        raise exception 'live Checkout Session claim was not accepted';
    end if;

    begin
        update public.billing_checkout_claims
           set stripe_checkout_session_id = 'cs_invalid_TallyoSession'
         where user_id = '22222222-2222-4222-8222-222222222222';
        raise exception 'invalid Checkout Session mode was accepted';
    exception
        when check_violation then null;
    end;
end;
$$;

reset role;

select json_build_object(
    'live_checkout_session_constraint', 'passed',
    'accepted_modes', array['test', 'live'],
    'other_modes_rejected', true
);
