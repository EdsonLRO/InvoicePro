const defaultConsent = Object.freeze({
  necessary: "granted",
  analytics: "denied",
  advertising: "denied",
  preferences: "denied"
});

export const analyticsConfiguration = Object.freeze({
  enabled: false,
  environment: "preview",
  ga4MeasurementId: "",
  googleTagManagerContainerId: "",
  googleAdsConversionId: "",
  provider: null
});

export const getConsentState = () => defaultConsent;

const validProperties = (eventDefinition, properties) => {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) return false;
  const allowed = eventDefinition.allowedProperties || {};
  const keys = Object.keys(properties);
  if (keys.some((key) => !Object.hasOwn(allowed, key))) return false;
  return keys.every((key) => Array.isArray(allowed[key]) && allowed[key].includes(properties[key]));
};

export const createAnalytics = ({
  policy,
  enabled = false,
  environment = "preview",
  consent = getConsentState,
  provider = null
} = {}) => {
  const trackEvent = (eventName, properties = {}) => {
    try {
      const eventDefinition = policy?.events?.[eventName];
      if (!eventDefinition) return Object.freeze({ accepted: false, reason: "unknown-event" });
      if (!validProperties(eventDefinition, properties)) return Object.freeze({ accepted: false, reason: "invalid-properties" });
      if (!enabled || environment !== "production" || typeof provider !== "function") return Object.freeze({ accepted: false, reason: "disabled" });
      if (consent()?.[eventDefinition.consentCategory] !== "granted") return Object.freeze({ accepted: false, reason: "consent-denied" });
      provider(eventName, Object.freeze({ ...properties }));
      return Object.freeze({ accepted: true, reason: "sent" });
    } catch {
      return Object.freeze({ accepted: false, reason: "provider-error" });
    }
  };

  return Object.freeze({ trackEvent, getConsentState: consent });
};

export const parseCampaignParameters = (urlValue) => {
  try {
    const url = new URL(urlValue, "https://tallyo.invalid");
    const result = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = url.searchParams.get(key)?.trim();
      if (value) result[key] = value.slice(0, 80);
    }
    return Object.freeze(result);
  } catch {
    return Object.freeze({});
  }
};
