# Tallyo Supabase Auth email templates

These reviewed HTML files mirror the Tallyo-owned transactional email style. They are source-controlled candidates only; Supabase hosted-project Auth templates are configured in the Supabase Dashboard or Management API and are not changed by this repository branch.

## Mapping

- `confirm-signup.html` → Confirm signup
- `reset-password.html` → Reset password
- `change-email.html` → Change email address
- `magic-link.html` → Magic link
- `reauthentication-code.html` → Reauthentication

Every link template uses Supabase's `{{ .ConfirmationURL }}` value unchanged. The reauthentication template displays only `{{ .Token }}`. Do not route these values through an external link shortener or analytics redirect, and keep email-provider click tracking disabled so authentication links are not rewritten.

## Activation boundary

Before applying a template to the hosted project:

1. compare the file with the current official Supabase Auth email-template documentation;
2. verify the exact Tallyo Site URL and redirect allowlist;
3. preview the template using fictional addresses only;
4. test confirmation, password recovery and any enabled flow through the existing MFA/session gates;
5. obtain Owner approval for the production Supabase template change and rollback plan.

No password, session, token or account value may be logged or copied into release evidence.
