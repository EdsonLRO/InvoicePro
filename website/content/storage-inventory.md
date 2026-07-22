# Current public-website storage and consent inventory

This is an implementation inventory, not a public cookie notice.

| Surface | Current behaviour | Category | Active now |
| --- | --- | --- | --- |
| Cookies | None set by public website code | None | No |
| `localStorage` | Not used | None | No |
| `sessionStorage` | Not used | None | No |
| IndexedDB | Not used | None | No |
| Public-site service worker/cache | No public-site service worker | None | No |
| Tallyo app PWA shell/cache | Existing app capability; outside public-site code | Necessary when app is used | Unchanged |
| Free-generator draft | Generator deferred; no draft storage exists | Future preference only if opt-in | No |
| Tallyo Helper conversation | Current-page DOM memory; cleared on reset/navigation; no storage API | Ephemeral necessary interaction | Yes, non-persistent |
| UTM values | Parsed in page memory only; not persisted or transmitted | Future analytics input | Inactive |
| Website preferences | No public-site preferences stored | Future preference | No |
| Analytics identifiers | No provider, cookie, identifier or storage | Analytics | No |
| Advertising identifiers | No provider, pixel, cookie or storage | Advertising | No |

Consent state currently defaults to `necessary: granted` and `analytics`,
`advertising`, and `preferences: denied`. Because no non-essential storage or
provider is active, the website does not show an unnecessary cookie banner.

Future Google Consent Mode is not enabled. Before any activation, verify a denied
default, an informed user choice, withdrawal and update handling, no tags before
the required consent, region behaviour, proportionate consent logging, approved
privacy/cookie wording and tests proving the provider cannot bypass the central
event policy.
