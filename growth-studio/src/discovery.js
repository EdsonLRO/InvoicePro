export const emptyDiscovery = {
  schemaVersion: 1,
  generatedAt: null,
  sourcePolicy: "Public business sources only",
  searchSummary: "The first automated research cycle has not completed yet.",
  candidates: []
};

const text = (value, maximum = 500) => typeof value === "string" ? value.trim().slice(0, maximum) : "";

const topLevelFields = new Set(["schemaVersion", "generatedAt", "sourcePolicy", "searchSummary", "candidates"]);
const candidateFields = new Set([
  "id",
  "company",
  "website",
  "sector",
  "location",
  "fitScore",
  "confidence",
  "signal",
  "fitReason",
  "decisionRole",
  "contentAngle",
  "sourceTitle",
  "sourceUrl",
  "discoveredAt",
  "status"
]);

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function normaliseDiscovery(payload) {
  if (!payload || typeof payload !== "object") return structuredClone(emptyDiscovery);
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  return {
    schemaVersion: 1,
    generatedAt: text(payload.generatedAt, 40) || null,
    sourcePolicy: text(payload.sourcePolicy, 120) || emptyDiscovery.sourcePolicy,
    searchSummary: text(payload.searchSummary, 500) || emptyDiscovery.searchSummary,
    candidates: candidates.slice(0, 50).map((candidate, index) => ({
      id: text(candidate.id, 80) || `candidate-${index + 1}`,
      company: text(candidate.company, 120),
      website: safeUrl(candidate.website),
      sector: text(candidate.sector, 120),
      location: text(candidate.location, 120),
      fitScore: Math.max(0, Math.min(100, Number(candidate.fitScore) || 0)),
      confidence: ["High", "Medium", "Low"].includes(candidate.confidence) ? candidate.confidence : "Medium",
      signal: text(candidate.signal, 500),
      fitReason: text(candidate.fitReason, 500),
      decisionRole: text(candidate.decisionRole, 160),
      contentAngle: text(candidate.contentAngle, 300),
      sourceTitle: text(candidate.sourceTitle, 200),
      sourceUrl: safeUrl(candidate.sourceUrl),
      discoveredAt: text(candidate.discoveredAt, 40),
      status: ["new", "saved", "dismissed"].includes(candidate.status) ? candidate.status : "new"
    })).filter((candidate) => candidate.company && candidate.sourceUrl)
  };
}

export function validateDiscoveryPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Discovery payload must be an object.");
  }
  for (const field of Object.keys(payload)) {
    if (!topLevelFields.has(field)) throw new Error(`Unexpected discovery field: ${field}`);
  }
  if (payload.schemaVersion !== 1) throw new Error("Discovery schemaVersion must be 1.");
  if (!Array.isArray(payload.candidates) || payload.candidates.length > 50) {
    throw new Error("Discovery candidates must be an array with no more than 50 entries.");
  }
  if (payload.generatedAt !== null && Number.isNaN(Date.parse(payload.generatedAt))) {
    throw new Error("Discovery generatedAt must be an ISO date-time or null for an empty bootstrap feed.");
  }
  if (payload.candidates.length > 0 && !payload.generatedAt) {
    throw new Error("Discovery generatedAt is required when candidates are present.");
  }

  const ids = new Set();
  payload.candidates.forEach((candidate, index) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`Discovery candidate ${index + 1} must be an object.`);
    }
    for (const field of Object.keys(candidate)) {
      if (!candidateFields.has(field)) throw new Error(`Unexpected candidate field: ${field}`);
    }
    const candidateId = text(candidate.id, 80);
    if (!candidateId) throw new Error(`Discovery candidate ${index + 1} requires an id.`);
    if (ids.has(candidateId)) throw new Error(`Duplicate discovery candidate id: ${candidateId}`);
    ids.add(candidateId);
    if (!text(candidate.company, 120)) throw new Error(`Discovery candidate ${candidate.id} requires a company.`);
    if (!safeUrl(candidate.sourceUrl)) throw new Error(`Discovery candidate ${candidate.id} requires an HTTPS sourceUrl.`);
    if (candidate.website && !safeUrl(candidate.website)) throw new Error(`Discovery candidate ${candidate.id} has an invalid website.`);
    if (!Number.isFinite(candidate.fitScore) || candidate.fitScore < 0 || candidate.fitScore > 100) {
      throw new Error(`Discovery candidate ${candidate.id} has an invalid fitScore.`);
    }
  });

  const normalised = normaliseDiscovery(payload);
  if (normalised.candidates.length !== payload.candidates.length) {
    throw new Error("Discovery candidates failed normalisation.");
  }
  return normalised;
}
