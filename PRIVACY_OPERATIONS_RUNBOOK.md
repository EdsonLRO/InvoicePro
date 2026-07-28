# Tallyo Privacy Operations Runbook

Manual launch procedure for privacy requests, account-closure/deletion requests and personal-data incidents. It is not legal advice and does not authorize publication, provider changes or production deletion.

## Non-Negotiable Handling Rules

- Never place live case data, customer data, private email addresses, identity documents, message bodies, provider payloads, payment details, passwords, MFA material, JWTs, or secrets in Git, ordinary chat, or unrestricted tickets.
- Use a non-identifying case reference in operational discussion. Keep the identity-to-reference mapping only in the restricted case system.
- Grant case access by role and need; require MFA; record access, exports, disclosure, deletion, and approval actions.
- Collect only the evidence needed for the specific decision. Identity documents are exceptional, not the default.
- Do not promise deletion, correction, response, refund, or regulator notification until the relevant authority has assessed the facts and provider limitations.
- Stop and obtain qualified advice for disputed identity, third-party data, exemptions, criminal/special-category data, vulnerable people, legal holds, cross-border complexity, or uncertain notification thresholds.

## Required Roles

The Owner must assign each role before launch. In the initial sole-trader model, the Owner may hold the routine roles. A backup mailbox monitor is required so requests are not missed during absence:

| Role | Minimum authority |
|---|---|
| Intake owner | Recognise and log a request/incident from any channel; start the deadline clock |
| Privacy case owner | Scope, route, coordinate searches, maintain the record, and escalate |
| Identity decision approver | Approve proportionate verification and reject excessive collection |
| System/provider operators | Perform approved tenant-scoped searches or provider actions without expanding scope |
| Response approver | Approve disclosure, correction, deletion, refusal, extension, and secure delivery |
| Incident lead | Contain and coordinate technical investigation while preserving evidence |
| Notification authority | Decide ICO/affected-person notification with qualified advice where needed |
| Owner escalation | Approve material legal risk, public/customer communications, spend, and production-impacting action |

One person may hold several roles in a small operation. Straightforward cases require a recorded Owner checklist and read-back; obtain qualified review or advice when a high-risk, disputed, legally complex, or uncertain trigger applies.

**Launch mailbox assignment confirmed 28 July 2026:** Edson Oliveira, Owner, is the primary monitor; Claudia Duarte is the backup monitor; `main@tallyo.co.uk` and `privacy@tallyo.co.uk` are reviewed every business day. The Owner reports that send, receive and reply tests passed for both mailboxes. No mailbox content was copied into this record.

## Manual Launch Workflow

1. Receive requests at `privacy@tallyo.co.uk`; recognise a request received through `main@tallyo.co.uk` or another channel and route it promptly.
2. Create a non-identifying case reference in the restricted Google Workspace case area, which the Owner confirmed as Tallyo's official support/privacy record system on 28 July 2026.
3. Record received date/time, request type, Tallyo role, response deadline, case owner and backup monitor. Do not copy unnecessary message content.
4. Verify identity proportionately. An authenticated account session or low-risk corroboration may be enough; do not request identity documents by default.
5. Decide whether Tallyo is controller or is assisting a business user as processor.
6. Search only the systems relevant to the request: Supabase/Auth, tenant tables, audit evidence, Resend, Stripe, Cloudflare logs and support email.
7. Record counts, dates and provider references rather than copying raw payloads.
8. For correction, export, deletion or anonymisation, prepare an exact tenant/system manifest and obtain Owner approval before any production change.
9. Preserve only records still needed for tax, accounting, fraud prevention, payment disputes, regulatory duties, security incidents or legal claims. Record the reason and next review date.
10. Record provider and backup limitations. Do not promise immediate provider or backup erasure.
11. Send the response through a verified secure route and record delivery.
12. Close the case with outcome, remaining limitations and the case-record deletion review date.

No fixed closed-account deletion deadline is promised. No self-service closure, 30-day read-only period, automated purge or scheduled retention deletion is required for launch.

## Rights Request Procedure

1. **Recognise and log:** open a restricted case immediately; record received time/channel, request type, scope, non-identifying subject category, deadline, owner, and status. Requests may be verbal or written. Do not require special wording.
2. **Preserve the request:** retain the minimum original evidence in the restricted system. Remove it from any inappropriate channel only through an approved recoverable process.
3. **Decide Tallyo's role:** determine per processing activity whether Tallyo responds as controller, assists a business user as processor, or must route/escalate. Record reasoning; do not route blindly.
4. **Verify identity proportionately:** use existing authenticated access or low-risk corroboration where adequate. Ask only for additional evidence needed to prevent wrongful disclosure or deletion. Keep account recovery separate from rights verification.
5. **Clarify scope where genuinely needed:** do not delay straightforward work. Record any pause, extension, refusal, or fee decision and obtain qualified advice.
6. **Search from an approved checklist:** Supabase Auth; tenant-scoped tables; append-only audit events; Resend email/delivery/suppression records; Stripe payment/refund/dispute records; restricted support/case records; hosting metadata where applicable; backup limitations. Record system references and result counts, not raw payloads, in the case summary.
7. **Review third-party and protected material:** separate other people's data, business-confidential material, security-sensitive fields, and legally restricted information. Record every redaction or withheld category and its approved reason.
8. **Perform approved actions:** correct inaccurate active records; delete or restrict where approved; issue provider-assistance requests; record active-system completion, residual legal holds, provider retention, and backup expiry. Never claim immediate erasure from backups unless verified.
9. **Deliver securely:** use the approved delivery route, confirm the recipient, apply least disclosure, and record delivery evidence. Do not use public provider share links.
10. **Close and review:** record outcome, approvers, provider references, completion time, remaining limitations, appeal/complaint information where required, case retention trigger, and deletion due date.

The normal response deadline must be configured from current ICO guidance and recorded by the Owner; the case system must alert well before the deadline, not on the deadline. Obtain qualified advice before relying on an extension or where the applicable deadline is disputed or uncertain.

## Correction And Deletion Control

Before each action, capture an approved target manifest containing only system, tenant/account reference, record type, action, reason, approver, and expected evidence. Operators must:

1. reauthenticate and confirm tenant scope;
2. export only if legally/operationally approved and store only in the restricted case system;
3. apply the smallest approved correction/deletion in active systems;
4. confirm dependent records, provider records, audit/legal-hold exceptions, and backup expiry separately;
5. verify through a scoped read-back that the intended result occurred and no other tenant changed;
6. record evidence references and counts without copying content into Git; and
7. stop if scope, authorization, ownership, or side effects differ from the approved manifest.

Account deletion, project deletion, bulk deletion, provider-account closure, secret rotation, and production migrations remain separately approval-gated destructive actions.

## Personal-Data Incident Procedure

1. **Start the clock:** record detection time, reporter, system, known facts, and incident lead. Preserve evidence without reproducing payloads.
2. **Contain safely:** stop ongoing exposure using the least disruptive reversible control. Production changes, credential rotation, customer communications, and destructive actions retain their existing approval boundaries unless an authorized emergency procedure says otherwise.
3. **Determine facts:** systems, data categories, number/types of people, period, access/download evidence, encryption, tenant scope, jurisdictions, providers, and continuing risk.
4. **Classify:** distinguish service/security incident from a personal-data breach and assess likelihood and severity of harm. Record uncertainty and assumptions.
5. **Escalate:** the Owner notifies affected providers and obtains qualified legal or security help when the incident is material, high-risk, disputed, or uncertain. Provider notice does not replace Tallyo's own assessment.
6. **Decide notifications:** record whether ICO and affected-person notification thresholds are met, who decided, when, evidence considered, and why. Where notification is required, act without undue delay and manage the 72-hour timeline; later information can follow where permitted.
7. **Recover and verify:** remediate, repeat relevant isolation/security checks, monitor, and ensure restored backups do not silently reintroduce deleted or exposed state.
8. **Close:** approve lessons, control changes, notice/register updates, follow-up owners, evidence retention, and review date.

## Launch Acceptance Check

Before public launch:

1. prove `main@tallyo.co.uk` and `privacy@tallyo.co.uk` can receive and send — **Owner-reported pass 28 July 2026**;
2. record the primary and backup monitor and absence cover — **Edson Oliveira, Owner / Claudia Duarte; every business day**;
3. complete one fictional access/deletion case from receipt to secure response;
4. verify controller/processor routing and the system-search checklist;
5. prepare a fictional deletion manifest and read-back record without changing production data;
6. record Supabase, Resend, Stripe, Cloudflare and support-email retention limitations; and
7. confirm no secret, customer content or private mailbox material entered Git or ordinary chat.

Provider selection, paid-plan changes, production deletion and real-person testing remain separately approval-gated.

## Review Triggers

Review this runbook after a material legal change, incident, missed deadline, provider/region change, new data category, new user type or jurisdiction, hosting/payment activation, account deletion implementation, or at least annually.
