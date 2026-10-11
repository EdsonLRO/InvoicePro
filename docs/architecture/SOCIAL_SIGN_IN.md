# Google and Apple sign-in

## Current state

Tallyo contains a repository-ready Google and Apple sign-in flow through the existing Supabase Auth client. Both providers are disabled in checked-in configuration and every generated Cloudflare build unless all of the following are true:

1. the individual provider flag is enabled;
2. `TALLYO_SOCIAL_AUTH_PUBLIC_RELEASE_APPROVED=true` is set for that exact build;
3. the provider is enabled and correctly configured in Supabase Auth;
4. its external developer application uses the exact Supabase callback URL; and
5. the Tallyo app return URL is present in the Supabase redirect allowlist.

This document is an activation runbook, not permission to change a provider or publish the feature.

## User flow

1. The signed-out user chooses **Continue with Google** or **Continue with Apple**.
2. The browser is redirected by Supabase Auth to the selected provider.
3. The provider returns to Supabase's callback. Supabase validates the provider response and returns the browser to the exact current Tallyo app path.
4. Tallyo resumes the Supabase session and sends it through the same recovery-state and authenticator-assurance checks as password sign-in.
5. Supabase automatically links an OAuth identity to an existing user only when the provider email matches the user's verified email. Tallyo does not implement manual identity linking.
6. A new provider-only account must create a one-time Tallyo backup password before any business data loads. This preserves Tallyo's existing password reauthentication, global sign-out and MFA recovery model. Later Google or Apple sign-ins are direct, subject to MFA when enabled.

Tallyo requests no Google or Apple service access beyond the identity information used by Supabase Auth. Browser code does not read, store or log provider access or refresh tokens.

## Data and privacy boundary

The flow can receive a provider subject identifier, verified email and limited profile metadata. Apple users may choose a private relay email. Apple's web OAuth flow does not reliably provide a full name, and Tallyo must not make access depend on one.

Before public activation:

- review and publish the Privacy Notice wording for optional Google/Apple sign-in;
- record Google and Apple in the applicable vendor/data-flow register, including transfer and retention findings;
- verify that the Terms of Service, Business-User Data Processing Terms and Privacy Notice remain linked beside account creation;
- use only the minimum `openid`, email and profile scopes needed by Supabase; and
- verify that no provider token, secret or `.p8` signing key appears in source, build output, logs or support records.

## Provider configuration — Owner actions

### Google

1. Create or select the Tallyo project in Google Auth Platform.
2. Configure the audience, app name, approved Tallyo logo, support contact and verified Tallyo domains.
3. Configure only `openid`, email and profile scopes.
4. Create a **Web application** OAuth client.
5. Add `https://app.tallyo.co.uk` as the production JavaScript origin.
6. Add the callback copied from Supabase **Authentication → Sign In / Providers → Google** as the authorized redirect URI. For the current project it should use the form `https://cuagwifetheefftleeup.supabase.co/auth/v1/callback`; copy it from the dashboard rather than retyping it.
7. Enter the client ID and client secret directly in Supabase. Never place the secret in Cloudflare, browser configuration or this repository.

Official reference: <https://supabase.com/docs/guides/auth/social-login/auth-google>

### Apple

1. Use the Owner's Apple Developer account to create the required App/Services ID, website domain association and Sign in with Apple capability.
2. Register the exact Supabase Auth callback copied from the Apple provider page in Supabase.
3. Create the Apple signing key and store its `.p8` file outside the repository in the approved secret system.
4. Generate the client secret and enter it directly in Supabase.
5. Record a rotation date before the Apple web OAuth secret expires. Apple requires this secret to be renewed every six months; a missed rotation will stop Apple sign-in.

Official reference: <https://supabase.com/docs/guides/auth/social-login/auth-apple>

## Supabase and build activation

1. Confirm the Site URL remains `https://app.tallyo.co.uk/`.
2. Use exact redirect URLs. Retain only approved rollback/local routes; do not add a broad production wildcard for convenience.
3. Keep automatic verified-email identity linking. Do not enable manual linking without a separate threat model and Owner approval.
4. Enable one provider at a time in Supabase and leave the browser flag off.
5. Run a protected-preview test using a synthetic account only after that real-account test is specifically approved.
6. Review callback cancellation, provider denial, new-account backup-password setup, existing verified-email linking, MFA challenge, local/global sign-out, password recovery and session expiry.
7. Enable only the reviewed provider flag in Cloudflare:
   - `TALLYO_GOOGLE_AUTH_ENABLED=true`, or
   - `TALLYO_APPLE_AUTH_ENABLED=true`.
8. Set `TALLYO_SOCIAL_AUTH_PUBLIC_RELEASE_APPROVED=true` only for the exact approved release.
9. Publish through the normal protected pull-request and Pages workflow, then perform bounded readback without inspecting customer data.

## Rollback

1. Set both browser provider flags to `false` and deploy the reviewed rollback build. Existing email/password sign-in remains available.
2. Disable the affected provider in Supabase if the provider or callback configuration is unsafe.
3. Do not delete users, unlink identities, rotate unrelated credentials or alter RLS during rollback.
4. If an Apple secret is lost or exposed, revoke only that Apple key in the Apple Developer Console and replace it in Supabase through the approved secret-handling path.

## Security invariants

- Exact provider allowlist: `google` and `apple` only.
- Exact current-origin/path return URL; HTTPS required outside localhost.
- Existing Supabase session, RLS, tenant ownership and AAL2 controls remain authoritative.
- Provider-only accounts cannot load business data until the recovery credential is established.
- Turnstile remains required for password sign-in, password registration and password reset. OAuth relies on the provider and Supabase rate/security controls and does not weaken the password path.
- Raw provider errors are not displayed to users.
- No schema, RLS, service-role use, provider token storage or new dependency is introduced by the browser implementation.
