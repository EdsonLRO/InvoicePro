# Tallyo Restricted Case-System Options - 2026-07-17

Internal D07 shortlist for `LEGAL-OPS-001`. Provider information and published prices were checked against official sources on 2026-07-17. On 2026-07-17, the Owner reported that the existing Gmail service uses Tallyo's business domain and is on Business Standard. The Google Workspace route is the preferred candidate, but Standard does not include Vault and the Owner chose to remain on Standard for now. The gap and blocked controls are recorded in `GOOGLE_WORKSPACE_PRIVACY_CASE_PLAN_2026-07-17.md`. This is not a final provider selection, purchasing approval, account-creation approval, legal advice, or authorization to place real personal data in any candidate system.

## Recommendation In Plain English

Tallyo needs a locked case cabinet, not an ordinary inbox. The selected setup must keep privacy requests and incidents away from Git and ordinary chat/email, require MFA, restrict who can open cases, record important activity, warn before deadlines, protect attachments, support retention/deletion, and provide controlled backup access.

1. **If the existing business email is already a paid Google Workspace account on Tallyo's business domain:** evaluate Google Workspace Business Plus first. It is the least disruptive candidate, but only the restricted Shared Drive may hold cases; the inbox remains an intake route. Business Plus is important because it includes Vault. A free `@gmail.com` account is not this option.
2. **If the existing email is free Gmail or a lower/ineligible Workspace tier:** Microsoft 365 Business Premium is the preferred new-service candidate for a one-person business. It offers a lower current published annual price than Google Business Plus and a useful identity, SharePoint/Lists, and audit baseline. Licensing and retention configuration still need verification.
3. **Use Zendesk Enterprise only if case volume or staffing grows enough to justify it:** it has the best ready-made ticket workflow of these candidates, but the required account audit log and custom roles are Enterprise features, the current Enterprise price requires a sales discussion, and regional hosting must be activated and checked.

An encrypted local folder or spreadsheet is not shortlisted for live use. It would leave weak evidence for access history, deadline escalation, backup recovery, and emergency access.

## Shortlist Comparison

| Required control | Google Workspace Business Plus | Microsoft 365 Business Premium | Zendesk Enterprise |
|---|---|---|---|
| Restricted access | Use a dedicated Shared Drive with limited-access folders, external sharing disabled by default, and membership limited to named roles. Shared-drive managers and Workspace admins remain powerful roles. | Use a dedicated SharePoint site/List with named membership and external sharing disabled by default. Microsoft's additional Restricted Access Control is a separate SharePoint Premium feature, so it must not be assumed to be included. | Enterprise custom agent roles and ticket/group restrictions are available, but administrators retain broad access and copied agents can receive ticket updates; configuration needs a focused review. |
| MFA and recovery | Enforce Google 2-Step Verification for every operator and administrator. Establish a separately controlled backup administrator and test recovery without recording codes in Git. | Enforce phishing-resistant MFA where supported through Microsoft Entra controls. Establish a separately controlled emergency administrator and test recovery without recording credentials in Git. | Require Zendesk 2FA for team members. Confirm recovery and account-owner transfer procedures and ensure API tokens cannot bypass the intended operating boundary. |
| Deadline tracking | Maintain a restricted case register with received date, legal deadline, internal checkpoints, owner, backup, status, and escalation. Calendar or approved automation reminders need synthetic testing. | Use Microsoft Lists fields/views with controlled reminder/automation rules. The exact legal deadline calculation and escalation path need synthetic testing. | SLA policies, triggers, views, and automations provide the strongest native ticket deadline workflow, but the legal deadline design still needs synthetic testing. |
| Audit evidence | Drive logs include events such as view, edit, download, and delete, but Google states that not every activity is logged. Drive log events are normally available for six months; Vault events are retained indefinitely. | Microsoft Purview Audit (Standard) is included for Business plans and normally retains audit records for 180 days. Microsoft states that auditing is not enabled by default for SMB licences, so activation and coverage must be verified. | The Enterprise account audit log records administrative/account changes indefinitely. Ticket-level change evidence and export/deletion coverage must be tested separately; the account audit log does not capture end-user activity. |
| Attachments and secure delivery | Store evidence in limited-access case folders. Do not send public links; require an explicitly authenticated recipient and record the disclosure. Malware-safe handling and download restrictions need acceptance testing. | Store evidence in the restricted SharePoint case area. If external delivery is approved, use authenticated guests only and record the disclosure. Malware-safe handling and link expiry need acceptance testing. | Enable secure downloads/private attachments and file-type restrictions; Zendesk documents attachment malware scanning. End users may need authenticated Help Centre access. Public attachment links must not be used for case evidence. |
| Retention, hold, export, deletion | Business Plus includes Vault for retention, hold, search, and export. Incorrect Vault rules can irreversibly purge data, so rules require a tiny synthetic scope, second-person review, and separate approval before any live use. | Purview/SharePoint retention capability and its exact Business Premium licensing must be confirmed against the intended case design. Destructive retention rules require separate approval and synthetic proof. | Ticket/end-user deletion schedules exist; more advanced retention may require an add-on. Export, redaction, attachment deletion, post-closure deletion, and provider residuals require contract and synthetic verification. |
| Continuity | Shared-drive content belongs to the organisation rather than one person, but Tallyo still needs a backup operator, tested admin recovery, provider outage procedure, and verified export/restore evidence. | SharePoint content belongs to the organisation, but Tallyo still needs a backup operator, tested admin recovery, provider outage procedure, and verified export/restore evidence. | Requires a backup agent/administrator and account-owner continuity. Provider export and recovery behaviour must be verified; a vendor promise is not a tested Tallyo restore. |

No candidate satisfies D07 merely by being purchased. The selected configuration must pass Security and Privacy review plus the four synthetic exercises in `PRIVACY_OPERATIONS_RUNBOOK.md` before real requests or incidents are allowed.

## Current Published Cost Signal

| Candidate | Published position checked 2026-07-17 | Cost caveat |
|---|---|---|
| Google Workspace Business Plus | Google lists GBP 18.40 per user/month with a one-year commitment, or GBP 22 per user/month on the flexible plan. | Confirm VAT, minimum commitment, the actual existing Workspace edition, any second licensed operator, and contract terms before purchase. |
| Microsoft 365 Business Premium | Microsoft lists GBP 16.90 per user/month, paid yearly, excluding VAT. | Confirm monthly alternative, any second licensed operator, retention features, storage, and contract terms before purchase. |
| Zendesk Enterprise | Current public pricing directs Enterprise buyers to Sales. | Obtain a written quote covering Enterprise audit/custom roles, secure attachments, data-location activation, retention/add-ons, number of agents, tax, and contract length. No quote request is authorized yet. |

Prices are comparison signals only and may change. Starting a free trial can create contractual, data-location, configuration, and later billing consequences; do not start one without separate Owner approval.

## Evidence And Material Limitations

### Google Workspace

- [Google Workspace UK plan comparison](https://workspace.google.com/intl/en_gb/business/) - Business Plus pricing and inclusion of Vault.
- [Shared-drive ownership and limited-access folders](https://support.google.com/a/users/answer/7212025?hl=en) and [shared-drive access controls](https://support.google.com/a/users/answer/12380484?hl=en) - organisational ownership and sharing restrictions.
- [Drive log events](https://support.google.com/a/answer/4579696?hl=en) and [log retention](https://support.google.com/a/answer/7061566) - event coverage limitations, six-month Drive log retention, and indefinite Vault-event retention.
- [Vault licensing](https://support.google.com/vault/answer/2462365?hl=en) and [Vault retention behaviour](https://support.google.com/vault/answer/2990828?hl=en) - Business Plus inclusion, holds/retention/export, deletion delay, and irreversible-purge warning.
- [Google 2-Step Verification administration](https://support.google.com/a/answer/175197?hl=en) and [Google Cloud Data Processing Addendum](https://workspace.google.com/terms/dpa_terms.html) - identity and contract evidence requiring review.

### Microsoft 365

- [Microsoft 365 UK business pricing](https://www.microsoft.com/en-gb/microsoft-365/business/microsoft-365-plans-and-pricing) - Business Premium price and plan positioning.
- [Microsoft Purview licensing](https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description) and [Audit overview](https://learn.microsoft.com/en-us/purview/audit-solutions-overview) - Audit (Standard) inclusion and 180-day baseline.
- [Audit activation](https://learn.microsoft.com/en-us/purview/audit-log-enable-disable) - SMB tenants must verify and, where necessary, enable auditing.
- [Authenticated external sharing](https://learn.microsoft.com/en-ca/sharepoint/manage-security-groups) - authenticated-guest restriction; public/anonymous links are unsuitable for case evidence.
- [Restricted Access Control licensing](https://learn.microsoft.com/en-us/SharePoint/restricted-access-control) - useful advanced control, but it requires SharePoint Premium and must not be treated as included in Business Premium.
- [Microsoft Products and Services Data Protection Addendum](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA) - current contract evidence requiring review.

### Zendesk

- [Current Zendesk pricing](https://www.zendesk.com/pricing/) - Enterprise requires a sales conversation.
- [Enterprise audit log](https://support.zendesk.com/hc/en-us/articles/4408828001434-Viewing-the-audit-log-for-changes-to-your-account), [custom roles](https://support.zendesk.com/hc/en-us/articles/4408882153882-Creating-custom-roles-and-assigning-agents), and [2FA](https://support.zendesk.com/hc/en-us/articles/4408826974874-Managing-two-factor-authentication) - material tier and access requirements.
- [SLA workflow](https://support.zendesk.com/hc/en-us/articles/5600997516058-About-SLA-policies-and-how-they-work), [secure attachments](https://support.zendesk.com/hc/en-us/articles/4408832757146-Allowing-attachments-in-tickets), and [storage/deletion options](https://support.zendesk.com/hc/en-us/articles/4408835043994-Managing-data-storage-in-your-Zendesk-account) - workflow, secure download, and retention limitations.
- [Regional hosting policy](https://support.zendesk.com/hc/en-us/articles/4408883599130-Regional-Data-Hosting-Policy) and [Zendesk DPA](https://www.zendesk.com/company/agreements-and-terms/) - location is not automatically committed unless entitled and activated; coverage exceptions and transfer terms require review.

## D07 Decision Still Required

Business-domain Google Workspace Business Standard is recorded. D07 remains blocked because Vault is not included and no upgrade/add-on is approved. Safe D08-D09 role preparation may continue under `PRIVACY_INCIDENT_ROLE_OPTIONS_2026-07-17.md`.

Account creation, trial activation, contract acceptance, paid subscription, private-email inspection, provider configuration, live data, and destructive retention remain separately blocked.
