export const MARKETING_OVERVIEW_CONSENT_VERSION =
  "tallyo-overview-v1-2026-07-31";
export const MARKETING_OVERVIEW_SOURCE = "free-invoice-generator-pre-download";

export const normaliseOverviewEmail = (value) =>
  String(value || "").trim().toLowerCase();

export const validOverviewEmail = (value) => {
  const email = normaliseOverviewEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const buildOverviewRequest = ({ email, consent }) => {
  const normalisedEmail = normaliseOverviewEmail(email);
  if (!consent) {
    return {
      ok: false,
      message: normalisedEmail
        ? "Tick the consent box if you would like the one overview email. You can still continue your download without it."
        : "Enter an email address and tick the consent box to request the overview, or continue your download without it.",
    };
  }
  if (!validOverviewEmail(normalisedEmail)) {
    return {
      ok: false,
      message: "Enter a valid email address for the one overview email.",
    };
  }
  return {
    ok: true,
    body: {
      email: normalisedEmail,
      consent: true,
      consentVersion: MARKETING_OVERVIEW_CONSENT_VERSION,
      source: MARKETING_OVERVIEW_SOURCE,
    },
  };
};

export const createPreparedDownloadController = (
  { prepare, showPanel, download },
) => {
  let pending = false;
  return Object.freeze({
    begin() {
      if (!prepare()) return false;
      pending = true;
      if (showPanel() === false) {
        pending = false;
        download();
      }
      return true;
    },
    complete() {
      if (!pending) return false;
      pending = false;
      download();
      return true;
    },
    isPending() {
      return pending;
    },
  });
};
