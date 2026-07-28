export const GA4_MEASUREMENT_ID = "G-PZFZKCWZ7M";
export const CONSENT_COOKIE_NAME = "tallyo_analytics_consent";
export const CONSENT_MAX_AGE_SECONDS = 15_552_000;
export const APPROVED_ANALYTICS_EVENTS = Object.freeze([
  "view_pricing",
  "start_registration",
  "complete_registration",
  "start_checkout",
  "subscription_activated",
  "use_invoice_maker",
  "download_invoice",
  "contact_support"
]);

const approvedEventSet = new Set(APPROVED_ANALYTICS_EVENTS);
const consentValues = new Set(["granted", "denied"]);
const googleTagId = "tallyo-ga4-tag";
const analyticsCookieName = /^_ga(?:_|$)/;

const readCookie = (cookieSource, name) => String(cookieSource || "")
  .split(";")
  .map((value) => value.trim())
  .find((value) => value.startsWith(`${name}=`))
  ?.slice(name.length + 1);

const consentCommand = (analyticsStorage) => ({
  analytics_storage: analyticsStorage,
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
});

export const readAnalyticsConsent = (cookieSource) => {
  const value = readCookie(cookieSource, CONSENT_COOKIE_NAME);
  return consentValues.has(value) ? value : "unset";
};

export const sanitisePageLocation = (locationValue) => {
  try {
    const url = new URL(String(locationValue || ""), "https://tallyo.co.uk/");
    if (!["https:", "http:"].includes(url.protocol)) return "https://tallyo.co.uk/";
    if (url.hostname === "app.tallyo.co.uk") return "https://app.tallyo.co.uk/";
    if (url.hostname !== "tallyo.co.uk" && url.hostname !== "www.tallyo.co.uk") return "https://tallyo.co.uk/";
    const path = url.pathname.replace(/\/+$/, "/") || "/";
    const allowedPaths = new Set([
      "/",
      "/pricing/",
      "/free-invoice-generator/",
      "/help/",
      "/faq/",
      "/about/",
      "/privacy/",
      "/cookies/",
      "/terms/",
      "/data-processing-terms/"
    ]);
    return `https://tallyo.co.uk${path.startsWith("/help/") ? "/help/" : allowedPaths.has(path) ? path : "/"}`;
  } catch {
    return "https://tallyo.co.uk/";
  }
};

const cookieDomainAttribute = (hostname) => (
  hostname === "tallyo.co.uk" || hostname?.endsWith?.(".tallyo.co.uk")
    ? "; Domain=.tallyo.co.uk"
    : ""
);

const secureCookieAttribute = (protocol) => protocol === "https:" ? "; Secure" : "";

export const createGa4ConsentClient = ({
  enabled = false,
  environment = "preview",
  measurementId = GA4_MEASUREMENT_ID,
  windowRef = globalThis.window,
  documentRef = globalThis.document
} = {}) => {
  const active = enabled === true &&
    environment === "production" &&
    measurementId === GA4_MEASUREMENT_ID &&
    Boolean(windowRef) &&
    Boolean(documentRef);
  let tagRequested = false;

  const currentConsent = () => readAnalyticsConsent(documentRef?.cookie);
  const setDisabled = (value) => {
    if (windowRef) windowRef[`ga-disable-${measurementId}`] = Boolean(value);
  };
  const persistConsent = (value) => {
    if (!active || !consentValues.has(value)) return false;
    const location = windowRef.location || {};
    documentRef.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secureCookieAttribute(location.protocol)}${cookieDomainAttribute(location.hostname)}`;
    return true;
  };
  const ensureGtag = () => {
    windowRef.dataLayer = windowRef.dataLayer || [];
    if (typeof windowRef.gtag !== "function") {
      windowRef.gtag = function gtag() {
        windowRef.dataLayer.push(arguments);
      };
    }
    return windowRef.gtag;
  };
  const clearAnalyticsCookies = () => {
    const location = windowRef.location || {};
    const names = String(documentRef.cookie || "")
      .split(";")
      .map((part) => part.trim().split("=")[0])
      .filter((name) => analyticsCookieName.test(name));
    for (const name of new Set(names)) {
      documentRef.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secureCookieAttribute(location.protocol)}`;
      if (location.hostname === "tallyo.co.uk" || location.hostname?.endsWith?.(".tallyo.co.uk")) {
        documentRef.cookie = `${name}=; Max-Age=0; Path=/; Domain=.tallyo.co.uk; SameSite=Lax${secureCookieAttribute(location.protocol)}`;
      }
    }
  };
  const loadTag = () => {
    if (!active) return Object.freeze({ accepted: false, reason: "disabled" });
    if (currentConsent() !== "granted") return Object.freeze({ accepted: false, reason: "consent-denied" });
    if (tagRequested || documentRef.getElementById?.(googleTagId)) {
      tagRequested = true;
      return Object.freeze({ accepted: true, reason: "already-loaded" });
    }

    setDisabled(false);
    const gtag = ensureGtag();
    gtag("consent", "default", consentCommand("denied"));
    gtag("set", "ads_data_redaction", true);
    gtag("set", "url_passthrough", false);
    gtag("set", "allow_google_signals", false);
    gtag("set", "allow_ad_personalization_signals", false);
    gtag("consent", "update", consentCommand("granted"));
    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "tallyo.co.uk",
      cookie_expires: CONSENT_MAX_AGE_SECONDS,
      cookie_update: true,
      page_location: sanitisePageLocation(windowRef.location?.href),
      page_referrer: "",
      page_title: "Tallyo"
    });

    const script = documentRef.createElement("script");
    script.id = googleTagId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    tagRequested = true;
    documentRef.head.appendChild(script);
    return Object.freeze({ accepted: true, reason: "loaded" });
  };
  const accept = () => {
    if (!persistConsent("granted")) return Object.freeze({ accepted: false, reason: "disabled" });
    return loadTag();
  };
  const reject = () => {
    if (!persistConsent("denied")) return Object.freeze({ accepted: false, reason: "disabled" });
    if (typeof windowRef.gtag === "function") {
      windowRef.gtag("consent", "update", consentCommand("denied"));
    }
    setDisabled(true);
    clearAnalyticsCookies();
    return Object.freeze({ accepted: true, reason: "denied" });
  };
  const start = () => {
    if (!active) return Object.freeze({ accepted: false, reason: "disabled" });
    return currentConsent() === "granted"
      ? loadTag()
      : Object.freeze({ accepted: false, reason: currentConsent() === "denied" ? "consent-denied" : "consent-unset" });
  };
  const trackEvent = (eventName, properties = {}) => {
    if (!active) return Object.freeze({ accepted: false, reason: "disabled" });
    if (!approvedEventSet.has(eventName)) return Object.freeze({ accepted: false, reason: "unknown-event" });
    if (!properties || typeof properties !== "object" || Array.isArray(properties) || Object.keys(properties).length) {
      return Object.freeze({ accepted: false, reason: "invalid-properties" });
    }
    if (currentConsent() !== "granted") return Object.freeze({ accepted: false, reason: "consent-denied" });
    const loaded = loadTag();
    if (!loaded.accepted) return loaded;
    windowRef.gtag("event", eventName, {
      send_to: measurementId,
      page_location: sanitisePageLocation(windowRef.location?.href),
      page_referrer: "",
      page_title: "Tallyo"
    });
    return Object.freeze({ accepted: true, reason: "sent" });
  };

  return Object.freeze({
    enabled: active,
    start,
    accept,
    reject,
    withdraw: reject,
    trackEvent,
    getConsentState: currentConsent
  });
};

export const bindAnalyticsConsentUi = ({
  client,
  root = globalThis.document,
  onConsentChange = () => {}
} = {}) => {
  if (!client?.enabled || !root) return Object.freeze({ active: false });
  const banner = root.querySelector("[data-cookie-banner]");
  const dialog = root.querySelector("[data-cookie-dialog]");
  const analyticsChoice = root.querySelector("[data-cookie-analytics]");
  const settingsControls = root.querySelectorAll("[data-cookie-settings]");
  settingsControls.forEach((control) => { control.hidden = false; });
  const setBanner = (visible) => {
    if (banner) banner.hidden = !visible;
  };
  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  };
  const openDialog = () => {
    if (!dialog) return;
    if (analyticsChoice) analyticsChoice.checked = client.getConsentState() === "granted";
    setBanner(false);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
  const finishChoice = (choice) => {
    if (choice === "granted") client.accept();
    else client.reject();
    onConsentChange(choice);
    setBanner(false);
    closeDialog();
  };

  root.querySelectorAll("[data-cookie-accept]").forEach((button) => button.addEventListener("click", () => finishChoice("granted")));
  root.querySelectorAll("[data-cookie-reject]").forEach((button) => button.addEventListener("click", () => finishChoice("denied")));
  settingsControls.forEach((button) => button.addEventListener("click", openDialog));
  root.querySelectorAll("[data-cookie-save]").forEach((button) => button.addEventListener("click", () => finishChoice(analyticsChoice?.checked ? "granted" : "denied")));
  root.querySelectorAll("[data-cookie-cancel]").forEach((button) => button.addEventListener("click", () => {
    closeDialog();
    setBanner(client.getConsentState() === "unset");
  }));
  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
    setBanner(client.getConsentState() === "unset");
  });

  const initialConsent = client.getConsentState();
  setBanner(initialConsent === "unset");
  client.start();
  return Object.freeze({ active: true, openDialog });
};
