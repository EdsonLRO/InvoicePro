# Tallyo — Security Story (formerly InvoicePro)

> How an app that only *felt* secure was hardened, phase by phase, into something genuinely defensible — told in plain English.
> **Tallyo** is the current public brand; the project was originally built as **InvoicePro**, which still appears in historical context.

---

## Short summary

Tallyo is a secure invoicing and business-records workspace (invoices, quotes, customers, payments, recurring billing) built with Vue 3 and Supabase. It began life as a single browser-only file with weak, fake security, and was rebuilt into a proper client + backend system with real authentication, database-enforced isolation, optional multi-factor login, integrity-checked front-end code, and a securely-scheduled cloud function.

This document walks the journey honestly: what each weakness was, what was done about it, and why it matters — including the limitations that still exist. It deliberately does **not** claim formal GDPR compliance; it describes real controls and honest gaps.

---

## The starting point: an app that only felt secure

The original app (InvoicePro) was a single HTML file that ran entirely in the browser. There was no server and no real database. "Accounts" were faked: the app hashed the email and password together with a fast, unsalted **SHA-256** and kept it in the browser's local storage. All the business data — customers, invoices, addresses — was bundled into one blob, "encrypted" with the password using an old library, and left in the same browser.

The honest problem: everything of value lived in one place, with no walls between any of it, and the app pulled in code from several outside sources without checking it hadn't been tampered with. It *felt* secure because it used words like "encrypted" — but the locks were weak and all the keys were under the same doormat.

The rest of this document is the journey from there to something you can actually defend.

**The one idea behind everything that follows:** real security comes from *separation and verification* — keep the valuable things apart, make each part prove who it is, give each part only what it needs, and don't trust anything just because it showed up.

---

## Phase 1 — A real backend and real logins (Supabase Auth)

**The weakness.** Passwords were stored as a fast, unsalted hash — the kind of thing that can be cracked offline quickly. And there was no real proof of identity: the "email verification" code was generated in the browser and shown to the user, so anyone could "verify" any email. The app couldn't actually tell who you were.

**What was done.**
- Moved authentication to **Supabase Auth**, so the app itself never stores or even sees password hashes. Passwords are hashed on the server with **bcrypt** — a deliberately slow, salted algorithm that makes offline cracking painful.
- Turned on **real email confirmation**: a genuine link is sent by the server, and the account can't be used until it's clicked.
- Sign-in now issues a short-lived, signed **token (a JWT)** that proves who you are for the session — so the app no longer holds onto your password.

**Why it matters.** This is the difference between a lock that looks sturdy and one that actually holds. Slow, salted hashing buys real time even if data is ever exposed, and server-sent verification means an email address genuinely belongs to the person using it.

---

## Phase 2 — Walls between users (Row Level Security)

**The weakness.** In the original design nothing stopped one person's data from mixing with another's — there were no walls, because there was only ever one "account" per browser.

**What was done.** Every row of data now carries the ID of the user who owns it, and the database enforces **Row Level Security (RLS)**. The important part: the rule lives *inside the database itself*, not in the app's code. So even if someone got past the app and asked the database directly for "all invoices," the database would quietly return only *their own* rows. The check can't be skipped by clever requests, because it isn't optional — it's built into the data layer.

**Verified, not assumed.** This wasn't taken on faith. I deliberately tried to break it — querying for everything as one user — and confirmed the database returned only that user's rows. A control you've tested to fail is worth far more than one you're hoping works.

**Why it matters.** This is the heart of keeping many users' data safely separated. Putting the rule in the database means the safety net is always there, underneath everything, no matter what the app above it does.

---

## Phase 3 — A second lock on the door (MFA)

**What was done.** Added optional **multi-factor authentication (MFA)** using a **time-based one-time code (TOTP)** — the rotating six-digit number from an authenticator app. Once enrolled, signing in needs both the password *and* the current code.

**Why it matters, and how it was checked.** A password can be guessed or stolen; the rotating code is something only the real person's phone has right now. I confirmed the whole flow, including the important negative case — that entering the *wrong* code is correctly refused. Testing that the lock says "no" to the wrong key matters as much as testing it says "yes" to the right one.

**Recovery hardening added later.** The sign-in gate now fails closed: if Supabase cannot prove the required **Authenticator Assurance Level (AAL)** or cannot safely load the verified factors, Tallyo signs out the incomplete session instead of loading the app. A user can also add a second authenticator as a backup. Supabase does not provide recovery codes, so this keeps recovery inside the same two-factor model rather than treating email access as a magic bypass.

The password-reset page now uses masked fields and requires a TOTP code when the account has MFA. If the app cannot establish the recovery requirements, the update stays disabled. Removing a backup factor or switching MFA off also requires a fresh authenticator code. These paths are implemented, with final browser acceptance testing still recorded as open work in `MFA_RECOVERY_RUNBOOK.md`.

---

**Session safety added later.** The Account page now separates **Log Out This Device** from **Log Out All Devices**. That matters because the two actions are not the same risk. Logging out one browser should be easy and local. Logging out every device is a stronger security action, so the app asks for the current password and, where MFA is active, the authenticator code before using Supabase's global sign-out. In plain terms: ordinary exit is simple; account-wide session revocation gets a stronger check.

---

## Phase 4 — Trusting the code the browser runs (CSP and SRI)

**The weakness.** The app loaded several scripts from outside sources with no way to check they hadn't been altered. If any one of those sources were compromised, malicious code would run with full trust inside the app — able to read the password and quietly steal everything. This was the single highest-risk issue in the original design.

**What was done.**
- Pinned every library to an exact version and added **Subresource Integrity (SRI)**. SRI is a fingerprint: the browser checks each downloaded script against a known hash and refuses to run it if a single character has changed. Tampered code never executes.
- Added a **Content-Security-Policy (CSP)** — a strict list of which sources are even allowed to run scripts or open connections, shrinking the space an attacker has to work in.
- Brought the styling library **in-house (self-hosted)** instead of fetching it live, removing one outside dependency entirely.

**Why it matters.** This closes off "supply-chain" attacks — where you're compromised not through your own code but through something you borrowed. SRI means "only run this exact code I already trust," and CSP means "and only talk to these specific places."

---

## Phase 5 — Looking after the data itself (data handling)

**What was done.**
- Data moved off the browser and into a proper database, **encrypted in transit** (HTTPS/TLS on the way there) and **encrypted at rest** (protected while stored) by the platform.
- Invoices keep a **snapshot of the customer's details** as they were at the time. This is quietly a privacy feature: if a customer is later edited or removed, old invoices stay historically correct without holding a live link to personal data that should be gone.
- The browser now only ever holds a short-lived session token and whatever's on screen — never the password, and never anyone else's data.

**Why it matters.** Sensitive information now lives behind a locked door with a sensible, privacy-aware shape, rather than sitting in the open on the user's own machine.

---

## Phase 6 — Keeping an honest record (activity history)

**What was done.** Each invoice, and each recurring schedule, now keeps a timestamped **activity history** — created, sent, paid, converted, reminded, generated, and so on. It's a plain record of what happened and when.

**An honest limit, stated plainly.** This is described in the app as an **activity history, not a tamper-proof audit log**. Because it lives in the same record a user can edit, a determined user could in principle change it. A true audit log would be append-only and separately protected. Being upfront about that limit — rather than overclaiming "full audit trail" — is itself part of doing security honestly.

**Why it matters.** Knowing what happened, and when, is the backbone of noticing when something's wrong. Even a modest history is a big step up from a system that remembered nothing.

---

## Phase 7 — The scheduled recurring invoice function, done securely

The most involved piece: making recurring invoices generate *on their own*, on a daily schedule, with nobody logged in and no browser open. This meant stepping off the single web page onto a real server-side, scheduled function — and it's where the most interesting security thinking lives.

**The core tension.** Normally the app talks to the database *as the logged-in user*, and Row Level Security keeps them to their own data. But a scheduled job runs with **nobody logged in**. To do its work it needs the **service role key** — a master key that **bypasses Row Level Security entirely** and can touch every user's data. That's powerful, and therefore dangerous. The whole exercise was handling that power responsibly.

**How the master key is kept safe.** The service key is **never written into the code**, never committed to the repository, and never anywhere the browser could see it. The function reads it at run-time from a server-side value the platform injects — so the code can be public while the secret stays private. Secrets belong in the environment, not the source.

**Making sure the master key can't leak into the wrong rows.** This is the subtle part that got the most attention. Because the function runs with the master key, there is **no safety net** — RLS won't catch a mistake. So when the function creates an invoice, it must **explicitly stamp it with the correct owner's user ID**, taken from the schedule it came from. Get that right and every user's data stays properly separated even though the function can see everyone's. Get it wrong and you'd mix people's invoices together. *A service-role function has no RLS safety net, so correct per-user attribution has to be enforced deliberately in code — that single line is the difference between "a script that works" and "a script that's secure."*

**Authenticate the scheduler before privileged work.** The daily scheduler calls a public function URL, but knowing that URL must not be enough to trigger service-role work. Both scheduled jobs now send a dedicated automation secret in a custom header. The recurring function checks it before creating the privileged database client and returns `401 Unauthorized` when it is missing or wrong. The automation secret is not the service-role key and does not grant direct database access by itself.

**Storing the scheduler's secret in an encrypted vault.** The scheduler runs as a small job inside the database. Rather than paste its secret in plain text into that job, it is stored in **Supabase Vault**, encrypted. The job looks it up by name and decrypts it only when the request is built. Someone reading the schedule sees the Vault reference, not the value.

**Tested before trusted.** The function was run by hand first and watched, reading the server logs to fix two small issues, before ever letting it run on a schedule. Bench-test first, wire it to the wall second. Only once it generated correct, correctly-owned invoices was it handed to the daily timer.

**Making retries safe.** Scheduled systems can fail halfway through. Tallyo now stamps every generated invoice with both its recurring-template ID and the scheduled occurrence date, and the database allows only one invoice for that pair. The function also has to win a conditional update of the schedule's expected `next_run` before it may email the customer. A retry can therefore reuse the existing occurrence instead of creating or emailing another invoice. The trade-off is stated honestly: a crash after claiming the schedule but before Resend accepts the email could miss that email. Avoiding both duplicates and missed sends under every crash point would require a future transactional outbox or queue.

---

## Phase 8 - Email that reaches customers without exposing secrets

**The need.** An invoicing app is much more useful when it can actually send invoices and reminders. But email adds a new security boundary: the browser must never see the email provider API key, and customer-contact automation must not become a blunt "email everyone" switch.

**What was done.**
- Resend is used from Supabase Edge Functions only; the browser never sees `RESEND_API_KEY`.
- The sending domain is `mail.tallyo.co.uk`, with SPF/DKIM/DMARC work handled through DNS.
- Manual document email is server-side, checks the signed-in user owns the document, and records activity.
- Resend webhooks are signed and store provider events in `audit_events`, so delivery/failure status comes from the provider rather than the browser.
- Recurring invoice email is opt-in per recurring schedule.
- Overdue reminder automation is opt-in per invoice, with per-invoice first-send, repeat, and maximum-reminder settings. Company settings are defaults only.

**Why it matters.** This keeps the email credential server-side, makes delivery status verifiable, and reduces accidental customer contact. The product decision is also a security decision: automation should express clear user intent, not surprise-send emails because a global switch was left on.

---

## Phase 9 - Stripe payments with a verified trust chain

**The need.** Taking card payments means handling money-related state. The browser can ask for a payment link, but it must never be able to mark an invoice as paid. Only Stripe, through a verified webhook, should be trusted to confirm payment.

**What was done.**
- Stripe Checkout sessions are created server-side with `STRIPE_SECRET_KEY`; the browser never sees the secret key.
- The app can create full-balance Checkout sessions, and invoice emails can include full-balance or seller-approved deposit links.
- Customers cannot enter arbitrary partial-payment amounts; deposits are controlled by the seller.
- The Stripe webhook verifies Stripe's signature before doing anything.
- The webhook processes signed Checkout completion events for payment recording, including asynchronous Checkout success.
- The webhook checks invoice/user metadata, amount, currency, duplicate events, and that the Checkout session was previously created and logged by Tallyo.
- Stripe-confirmed payments are locked from manual removal in the app.
- In code, refund requests are made through a server-side Edge Function, not directly from the browser.
- Failed asynchronous payments and disputes are logged as lifecycle events instead of marking invoices paid.
- Successful Stripe refunds are recorded as locked negative Stripe payment entries, so the invoice balance can reopen without pretending the original card payment never happened.

**Why it matters.** This creates a clear trust chain: Tallyo creates a Checkout session, Stripe confirms the signed completion event, and only then does Tallyo update the invoice. That is much stronger than trusting a browser redirect or accepting every Stripe payment event shape.

**Payment threat model in plain English.** The main risks are fake payment confirmations, replayed webhook events, cross-user invoice updates, wrong amounts, wrong currencies, arbitrary customer-chosen deposits, and refunds being treated as trusted just because the browser says so. Tallyo reduces those risks by keeping Stripe secrets server-side, verifying webhook signatures, checking event idempotency, matching Stripe metadata back to a known Tallyo-created Checkout session, validating invoice ownership and expected amount/currency, locking Stripe-confirmed rows from manual deletion, and waiting for signed Stripe refund events before changing invoice balance. The honest remaining risk is operational: Stripe is still a sandbox/test setup until live-mode configuration, replay testing, refund/dispute procedures, backup/restore evidence, and policy/legal groundwork are complete.

---

## Current boundary - finish the app before SaaS conversion

Tallyo now has the core app features working: documents, customers, saved items, recurring invoices, email, overdue reminders, Stripe invoice payments, PDFs, branding, and activity history.

The next security work is not to rush into a public SaaS website. The next work is to finish the current app properly:

- finish sandbox replay testing for Stripe refund-failure, dispute, chargeback, and failed-payment awareness;
- prove backup and restore;
- expand append-only audit events beyond provider webhooks;
- finish the remaining factor-specific MFA recovery evidence and define the all-factors-lost operating process;
- keep documentation and threat models aligned with the real app;
- complete basic privacy and operational groundwork before real customer use.

The future public website, Tallyo subscriptions, plan tiers, workspaces, teams, RBAC, and SaaS billing are valid future goals, but they are a separate phase. Mixing them into the current finishing work would increase risk and make the security story harder to verify.

---

## Current limitations (told honestly)

A credible security posture isn't about claiming perfection — it's about knowing exactly where you stand. A few things are deliberately still on the list:

- **Not certified as compliant.** The app is **built with data protection principles in mind**, but it is **not** formally "GDPR compliant." Real compliance groundwork — a privacy policy, lawful basis, data-subject rights (access/erasure/portability), retention, and a breach process — is future work and would be required before onboarding real paying customers.
- **Activity history is convenient, not tamper-proof** — provider events and selected sensitive app actions now go into append-only `audit_events`. Company/settings saves are logged only as changed categories, not raw bank details, notes, addresses, or other sensitive values. This is still not a complete monitoring/compliance audit system.
- **Recovery is not yet fully proven.** The Supabase organisation is Pro and completed daily backups through 2026-07-13 were verified, but Tallyo still needs a timed non-production restore test under `BACKUP_RESTORE_RUNBOOK.md`.
- **MFA has no provider recovery codes.** Tallyo now supports a second authenticator and refuses email-only MFA bypass, but an all-factors-lost support process and factor-specific recovery tests remain. Supabase leaked-password protection is enabled, advisor-verified, and passed a safe provider rejection test on 2026-07-14.
- **All-devices logout exists but can be strengthened.** It currently uses current-password confirmation plus MFA when required before Supabase global sign-out. A future production hardening step would be an email-code confirmation flow before revocation.
- **The content-security-policy allows one permissive setting** the in-browser framework needs — a documented trade-off rather than a hidden one.
- **Payment lifecycle still needs production testing.** The repo now includes deployed in-app Stripe refund requests plus failed-payment, refund, refund-failure, and dispute awareness, and the sandbox Stripe webhook destination is subscribed to the needed events. It still needs broader replay testing and live-mode readiness before real customer use.
- **Stripe should still be treated as test/development** unless live mode is explicitly approved and configured. Real customer payment links should wait for payment lifecycle handling, backups, terms/privacy/refund processes, and operational readiness.
- **Email/payment automation depends on configuration.** DNS, secrets, provider webhooks, and scheduled jobs must stay correctly configured.
- **SaaS subscriptions are not implemented.** Current Stripe work is for customers paying invoices. Future Tallyo subscription billing, entitlements, workspaces, and teams are separate future architecture work.

Naming these plainly is the point. It's the difference between marketing and a genuine assessment.

---

## Future improvements

- **Refund/dispute/chargeback replay testing** for Stripe payment lifecycle events.
- **Production email hardening** such as tightening DMARC policy once all legitimate senders are confirmed.
- **More append-only audit logging** for automation failures, backup/restore evidence, and other sensitive actions.
- **Formal backups / retention** and a documented restore process.
- **All-factors-lost MFA support procedure** plus stronger Auth-level signup checks (server-side password policy / breached-password screening).
- **Data-protection groundwork** (privacy policy, consent/unsubscribe, data-subject request handling) before taking real customers.
- **Future SaaS architecture** (public website, Tallyo subscriptions, plan tiers, workspaces, teams/RBAC, and server-enforced entitlements) after the current app is finished and hardened.

---

## Security principles used

Across every phase, the same instincts show up:

- **Separation** — keep code, credentials, and data in different places rather than one blob.
- **Verification** — make each part prove itself (real logins, MFA, integrity-checked scripts) instead of trusting by default.
- **Defence in the data layer** — put the isolation rule inside the database (RLS), so it can't be skipped by the app above it.
- **Least privilege** — keep the scheduler's caller secret separate from the service-role credential, and begin privileged work only after caller authentication.
- **Secrets in the environment, not the code** — the master key is injected at runtime and never committed; the scheduler's dedicated secret lives encrypted in a vault.
- **Explicit attribution where there's no safety net** — the service-role function stamps every row with the right owner, because RLS won't catch it there.
- **Test the "no", not just the "yes"** — confirm controls reject the wrong input (e.g. a wrong MFA code, a cross-user query).
- **Honesty about limits** — state what isn't done, and don't overclaim compliance or security.

That mindset — not any single tool — is the real story.

