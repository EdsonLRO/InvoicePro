# Tallyo — Security Story (formerly InvoicePro)

> How an app that only *felt* secure was hardened, phase by phase, into something genuinely defensible — told in plain English.
> **Tallyo** is the current public brand; the project was originally built as **InvoicePro**, and the code still uses that name during the rebrand.

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

**Least privilege for the scheduler.** The daily scheduler has to call the function, and that call needs a key. It was deliberately given only the **public, low-power key** (enough to *trigger* the function), not the master key. The function then does its privileged work internally with its own key. Give each part only what it truly needs, and nothing more.

**Storing the scheduler's key in an encrypted vault.** The scheduler runs as a small job inside the database. Rather than paste its key in plain text into that job — where anyone with database access could read it — it's stored in **Supabase Vault**, encrypted. The job looks the key up by name and decrypts it only at the moment it runs. So even someone reading the list of scheduled jobs sees a reference, never the actual secret.

**Tested before trusted.** The function was run by hand first and watched, reading the server logs to fix two small issues, before ever letting it run on a schedule. Bench-test first, wire it to the wall second. Only once it generated correct, correctly-owned invoices was it handed to the daily timer.

---

## Current limitations (told honestly)

A credible security posture isn't about claiming perfection — it's about knowing exactly where you stand. A few things are deliberately still on the list:

- **Not certified as compliant.** The app is **built with data protection principles in mind**, but it is **not** formally "GDPR compliant." Real compliance groundwork — a privacy policy, lawful basis, data-subject rights (access/erasure/portability), retention, and a breach process — is future work and would be required before onboarding real paying customers.
- **Activity history is convenient, not tamper-proof** — a true append-only audit log would be a further step.
- **No formal backups** on the current free hosting tier; free-tier projects can also pause and stop the scheduled job.
- **MFA has no recovery/backup codes**, and there's no password-strength or breach-password check at signup yet.
- **The content-security-policy allows one permissive setting** the in-browser framework needs — a documented trade-off rather than a hidden one.
- **No email sending yet**, so notifications and reminders are drafted for the user to send manually rather than sent automatically.

Naming these plainly is the point. It's the difference between marketing and a genuine assessment.

---

## Future improvements

- **Email sending** (via a dedicated provider) with proper domain authentication (SPF, DKIM, DMARC) — enabling automatic invoice delivery and overdue reminders.
- **Automated overdue reminders** once email exists (the detection already works in-app; only sending is missing).
- **Append-only audit logging** for a tamper-resistant record of sensitive actions.
- **Formal backups / retention** and a documented restore process.
- **MFA recovery codes** and stronger signup checks (password strength / breach lookup).
- **Data-protection groundwork** (privacy policy, consent/unsubscribe, data-subject request handling) before taking real customers.

---

## Security principles used

Across every phase, the same instincts show up:

- **Separation** — keep code, credentials, and data in different places rather than one blob.
- **Verification** — make each part prove itself (real logins, MFA, integrity-checked scripts) instead of trusting by default.
- **Defence in the data layer** — put the isolation rule inside the database (RLS), so it can't be skipped by the app above it.
- **Least privilege** — give each component only the access it needs (the scheduler gets a low-power key, not the master key).
- **Secrets in the environment, not the code** — the master key is injected at runtime and never committed; the scheduler's key lives encrypted in a vault.
- **Explicit attribution where there's no safety net** — the service-role function stamps every row with the right owner, because RLS won't catch it there.
- **Test the "no", not just the "yes"** — confirm controls reject the wrong input (e.g. a wrong MFA code, a cross-user query).
- **Honesty about limits** — state what isn't done, and don't overclaim compliance or security.

That mindset — not any single tool — is the real story.

