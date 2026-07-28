# GA4 consent implementation review

Status: Approved, deployed and production-verified
Task: COMM-001-AN-001
Reviewed: 28 July 2026
Jurisdiction: United Kingdom
Release boundary: Production activation completed under separate exact Owner approval

## Scope and affected people

Tallyo proposes to use the existing GA4 web stream `G-PZFZKCWZ7M` on
`tallyo.co.uk` and `app.tallyo.co.uk` only after a visitor affirmatively accepts
Analytics. The affected people are public-site visitors and Tallyo account users,
including sole traders, company representatives and staff of UK business users.

Tallyo is controller for this website and product-usage measurement. Google is a
provider for Analytics processing under its applicable service and data-processing
terms. No business-user customer or invoice content is needed for this purpose.

## Proposed data flow

Before consent, Tallyo stores or reads no Analytics identifier, loads no Google
tag and sends no Analytics or consent-mode request to Google. The only persistent
value created by the consent interface is a first-party choice containing either
`granted` or `denied`. Necessary service, security and authentication storage
remains separate.

After consent, Tallyo may load `gtag.js` once and send only the approved event
name, a sanitised page location without query strings or fragments, and the
technical information Google Analytics normally receives after consent, such as
IP address, approximate location, device/browser information and a pseudonymous
Analytics identifier. Tallyo must not set a GA user ID or send names, email
addresses, company/customer data, document content, amounts, payment or Stripe
identifiers, free text, Auth identifiers or internal record identifiers.

## Applicable requirements and guidance

- PECR requires consent before non-essential Analytics storage or access. The ICO
  states that consent must be actively and clearly given and that non-essential
  technologies must not be enabled before consent.
- UK GDPR consent must be freely given, specific, informed, unambiguous and as easy
  to withdraw as to give.
- The ICO's current consent-mechanism guidance expects equally prominent accept,
  reject and customise choices.
- Google's Basic Consent Mode prevents Google tags from loading or transmitting
  before consent. Consent Mode v2 requires explicit states for
  `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization`.

Primary sources checked 28 July 2026:

- ICO, Cookies and similar technologies:
  https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
- ICO, How do we manage consent in practice:
  https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/
- Google, Consent mode overview:
  https://developers.google.com/tag-platform/security/concepts/consent-mode
- Google, Set up consent mode:
  https://developers.google.com/tag-platform/security/guides/consent
- Google Analytics configuration:
  https://developers.google.com/analytics/devguides/collection/ga4/reference/config

## Mandatory implementation controls

1. Use Basic Consent Mode: do not load the Google tag or transmit to Google before
   affirmative Analytics consent.
2. Present equally prominent `Accept analytics`, `Reject analytics` and
   `Manage preferences` controls.
3. Keep necessary storage always on and visibly separate from optional Analytics.
4. Persist only the consent choice, not an identity or account identifier.
5. Provide a persistent `Cookie settings` control on the website and app.
6. On withdrawal, send the Consent Mode v2 denial update, disable future GA calls
   in the page, remove accessible GA cookies and prevent later approved events.
7. Load the Google tag at most once per document.
8. Disable Google Signals, advertising personalisation, ad storage, ad user data,
   URL passthrough and user-provided data collection.
9. Disable automatic page views and all Enhanced Measurement events. The approved
   event allowlist is the complete measurement scope.
10. Sanitize page location and referrer values before every event and accept no
    event properties.
11. Mark no event as a key event, conversion or advertising conversion.
12. Keep Analytics disabled by default behind separate source and production
    release gates.

## Approved event purposes

The source implementation may emit only:

- `view_pricing`;
- `start_registration`;
- `complete_registration`;
- `start_checkout`;
- `subscription_activated`;
- `use_invoice_maker`;
- `download_invoice`;
- `contact_support`.

Each event carries no custom property. Registration events describe the stage only;
they do not include an email address or Supabase user identifier. Checkout and
subscription events describe the stage only; they do not include plan, price,
amount, currency, Stripe identifier or account identifier.

## Failure scenarios and required tests

Tests must prove that no Google script or request path exists before consent or
after rejection; acceptance loads one tag; withdrawal updates consent and blocks
later events; duplicate acceptance does not duplicate the tag; unknown events and
any event property fail closed; query strings and fragments do not enter the
provider payload; and prohibited personal, business, payment and free-text fields
cannot be transmitted through the event API.

The banner, preference dialog and persistent settings control require keyboard,
focus, screen-reader-label, mobile-width and equal-prominence checks.

## Notices, retention, rights and transfers

The Privacy Notice and a dedicated Cookie Notice must explain the conditional GA4
processing, consent basis, event scope, Google as a provider, pseudonymous
identifier and technical data, international-transfer safeguards, withdrawal and
cookie duration. The consent-choice cookie and GA cookies should expire after no
more than six months in this initial implementation. Withdrawal applies
prospectively; privacy requests remain available through `privacy@tallyo.co.uk`.

Before activation, the provider evidence register must record the account-specific
Google Analytics terms/DPA, property and stream, data-retention setting,
international-transfer terms, data-sharing and product-link settings.

## Google property conditions before activation

The Owner must verify directly in the GA4 property that:

- the web stream belongs to Tallyo and uses `https://tallyo.co.uk`;
- Enhanced Measurement is fully disabled;
- Google Signals is disabled;
- ads personalisation and user-provided data collection are disabled;
- no Google Ads or unrelated product link is active;
- no listed event is marked as a key event or conversion;
- the shortest suitable event-data retention is selected;
- the applicable Google Analytics terms and data-processing terms are recorded.

## Account-specific dashboard evidence

Verified in the live Tallyo GA4 property on 28 July 2026 under exact Owner
approval:

- the Tallyo web stream uses `https://tallyo.co.uk` and measurement ID
  `G-PZFZKCWZ7M`;
- Enhanced Measurement is off;
- Google Signals is off;
- user-provided data collection is off;
- ads personalisation is allowed in 0 of 307 regions;
- Google Ads links reports zero completed links;
- event-data and user-data retention are both set to the shortest available
  option, 2 months;
- `Reset on new user activity` is off;
- owner-editable key events `close_convert_lead` and `qualify_lead` were
  unmarked;
- GA4 retains its provider-controlled `purchase` key event with the unmark
  control disabled and no stream data detected. No Tallyo allowlisted event is
  marked as a key event or conversion.

No screenshot, Google account identifier, billing detail, private account
information or secret was retained. No Google Ads link was created.

## Production activation evidence

Under exact Owner approval on 28 July 2026:

- PR #134 merged at `331ace9`;
- production website deployment `cf088733-0b7f-4f21-a18a-d69f4cfe31ba`
  and app deployment `a3c3cd0c-a020-47c0-9482-8c8c77307039` succeeded;
- before consent and after rejection, no Google tag was present;
- acceptance loaded exactly one tag for `G-PZFZKCWZ7M`;
- withdrawal prevented the tag from loading on later navigation;
- GA4 Realtime showed live consented users and received the property-free
  `view_pricing` event;
- no approved Tallyo event was marked as a key event.

## Disposition

**Approved, deployed and production-verified within the reviewed scope.**

Any expansion of the event allowlist, advertising integration, user-provided data,
Google Signals or other Analytics purpose requires a new focused review and exact
Owner approval. This review is legal risk-management evidence, not a claim of
compliance or professional legal advice.
