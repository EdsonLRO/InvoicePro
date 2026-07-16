# Tallyo Legal And Privacy Tabletop Evidence - 2026-07-15

Internal, fictional exercise evidence. No real person, account, customer, invoice, email address, provider event, secret, or production record was used.

This tabletop tests whether the written process identifies the right decisions and evidence. It does not prove that live rights, incident, deletion, notification, or provider procedures work end to end.

## Exercise 1: Fictional Access And Deletion Request

**Scenario:** A fictional invoice recipient asks Tallyo for a copy of their data and deletion. The recipient is not a Tallyo account holder and was entered by a fictional business user.

**Walkthrough:**

1. Open a restricted case and record receipt, scope, deadline, owner, and contact route.
2. Avoid assuming Tallyo is the controller for invoice-recipient data. Determine whether the business user controls the record and whether Tallyo should assist as processor.
3. Verify identity proportionately and avoid collecting identity documents by default.
4. Search the relevant tenant-scoped database records, email delivery/audit metadata, Stripe identifiers if payment was used, and provider-held records. Explain backup expiry rather than promising immediate erasure from snapshots.
5. Separate third-party and business-confidential data, record any exemption or extension advice, and deliver securely.
6. Record processor actions, outcome, closure, and case-record retention.

**Controls that supported the exercise:** RLS and owner attribution, minimised provider audit metadata, documented data flows, provider register, and backup limitations.

**Gaps found:**

- No restricted rights-case system is selected or tested.
- No approved controller/processor decision tree or contact route exists.
- Account-holder workspace export is implemented, harness-tested, and deployed with a read-back JWT-protected `log-app-event` v7 allowlist. Dedicated test-account desktop/mobile warning, download, and readability acceptance passed, and corrected production events contain only format/version metadata. Deletion is not implemented or operationally verified.
- Provider assistance/deletion request steps and contacts are not evidenced.
- Final retention periods and backup-deletion wording are not approved.
- No approved secure delivery channel is selected.

**Result:** `Tabletop passed with blocking gaps`. The runbook produced the right questions and did not overpromise, but live operation remains blocked.

## Exercise 2: Fictional Cross-Tenant Exposure

**Scenario:** Monitoring suggests a fictional user may have seen another tenant's customer name and invoice amount after a deployment. No real production event occurred.

**Walkthrough:**

1. Timestamp detection, stop the affected release path, preserve privacy-minimised logs, and avoid moving payloads into source control or chat.
2. Test the suspected policy/query path in an isolated environment and identify affected tables, users, fields, duration, and access evidence.
3. Rotate or revoke credentials only if evidence supports credential exposure and the Owner approves production-impacting action.
4. Assess whether confidentiality was actually lost and the likely severity of harm.
5. Contact Supabase and qualified security/legal support where scope or notification threshold is uncertain.
6. Record the ICO/affected-person notification decision and the 72-hour timeline; do not treat every security issue as automatically reportable.
7. Remediate, repeat two-account isolation tests, monitor, and capture lessons learned.

**Controls that supported the exercise:** database RLS, two-account isolation tests, append-only provider events, security findings ledger, incident runbook, and release approval boundaries.

**Gaps found:**

- No restricted incident case system or on-call contact list is approved.
- Provider escalation contacts and external legal/security contacts are not recorded.
- No production alerting/SIEM pipeline exists for cross-tenant access indicators.
- Notification decision authority and out-of-hours escalation are not assigned.
- No tested customer communication channel or approved breach wording exists.

**Result:** `Tabletop passed with blocking gaps`. Technical investigation steps are credible, but live incident operation and legal notification decisions are not ready.

## Follow-Up Actions

| Action | Priority | Status | Release effect |
|---|---|---|---|
| Select a restricted rights/incident case system and define access/retention | High | Blocked pending Owner/provider decision | Blocks public onboarding |
| Approve controller/processor routing and lawful-basis decisions | High | Blocked pending qualified review | Blocks public onboarding |
| Accept and evidence the RLS-scoped account-holder export | High | Verified for controlled account-holder desktop/mobile scope | Does not by itself unblock public onboarding |
| Build and verify correction and deletion operations | High | Planned | Blocks public onboarding |
| Collect vendor DPA, transfer, deletion and incident-contact evidence | High | Planned | Blocks public onboarding |
| Assign incident decision authority and escalation contacts | High | Planned | Blocks public onboarding |
| Rehearse a timed restore and deleted-data handling | High | Approval-gated | Blocks public onboarding |

## Evidence Limit

The exercise verifies process design only. It does not change the Legal Agent's public/paid release disposition, approve a lawful basis, establish compliance, or authorise use of real customer data.
