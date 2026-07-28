# Current public-website storage and consent inventory

This is an implementation inventory, not a public cookie notice.

| Surface | Current behaviour | Category | Active now |
| --- | --- | --- | --- |
| Consent preference cookie | `tallyo_analytics_consent` stores only `granted` or `denied` for up to six months across Tallyo subdomains | Necessary privacy choice | Source prepared; inactive until approved Analytics build |
| `localStorage` | Not used | None | No |
| `sessionStorage` | Not used | None | No |
| IndexedDB | Not used | None | No |
| Public-site service worker/cache | No public-site service worker | None | No |
| Tallyo app PWA shell/cache | Existing app capability; outside public-site code | Necessary when app is used | Unchanged |
| Free-generator draft | Generator deferred; no draft storage exists | Future preference only if opt-in | No |
| Tallyo Helper conversation | Current-page DOM memory; cleared on reset/navigation; no storage API | Ephemeral necessary interaction | Yes, non-persistent |
| UTM values | Not collected, persisted or transmitted | None | No |
| Website preferences | No public-site preferences stored | Future preference | No |
| Analytics identifiers | GA4 may set `_ga` and `_ga_*` for up to six months, but only after affirmative consent | Analytics | Source prepared; disabled by default |
| Advertising identifiers | No provider, pixel, cookie or storage | Advertising | No |

Necessary service storage remains separate from Analytics. Without an approved
Analytics build the consent client is inactive and stores nothing. In an approved
production build, an unset choice shows the banner; rejection stores only the
preference and does not initialise Google; acceptance loads one Google tag and
permits only the reviewed property-free events.

Basic Consent Mode is implemented. Advertising consent is always denied.
Withdrawal updates the Google consent state, sets the GA disable flag, removes
readable Analytics cookies and blocks future events. Activation still requires
Owner approval plus verification that Enhanced Measurement, Google Signals,
advertising personalisation, enhanced conversions, user-provided data collection
and conversion marking are off in the GA property.
