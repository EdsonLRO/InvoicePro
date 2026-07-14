-- SEC-AUTO-001: authenticate privileged scheduled functions with the existing
-- automation secret, retrieved from Vault at runtime rather than stored inline.

select cron.alter_job(
    job_id := (select jobid from cron.job where jobname = 'generate-recurring-daily'),
    command := $job$
        select net.http_post(
            url := 'https://cuagwifetheefftleeup.supabase.co/functions/v1/generate-recurring',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-automation-secret', (
                    select decrypted_secret
                    from vault.decrypted_secrets
                    where name = 'automation_secret'
                )
            ),
            body := '{}'::jsonb
        );
    $job$
);

select cron.alter_job(
    job_id := (select jobid from cron.job where jobname = 'send-overdue-reminders-daily'),
    command := $job$
        select net.http_post(
            url := 'https://cuagwifetheefftleeup.supabase.co/functions/v1/send-overdue-reminders',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-automation-secret', (
                    select decrypted_secret
                    from vault.decrypted_secrets
                    where name = 'automation_secret'
                )
            ),
            body := '{}'::jsonb
        );
    $job$
);
