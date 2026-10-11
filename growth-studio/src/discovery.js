export const emptyDiscovery = {
  schemaVersion: 1,
  generatedAt: null,
  sourcePolicy: "Public business sources only",
  searchSummary: "The first automated research cycle has not completed yet.",
  candidates: []
};

const text = (value, maximum = 500) => typeof value === "string" ? value.trim().slice(0, maximum) : "";

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
