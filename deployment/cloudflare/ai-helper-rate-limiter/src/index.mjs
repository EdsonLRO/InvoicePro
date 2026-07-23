const MAX_BODY_BYTES = 128;
const RATE_KEY = /^[a-f0-9]{64}$/;

const headers = Object.freeze({
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
});

const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

export const handleRateLimitRequest = async ({ request, env = {} }) => {
  if (request.method !== "POST") return json(405, { allowed: false });
  if (new URL(request.url).pathname !== "/limit") return json(404, { allowed: false });
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { allowed: false });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json(413, { allowed: false });

  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { allowed: false });
    }
    body = JSON.parse(raw);
  } catch {
    return json(400, { allowed: false });
  }

  if (
    !body
    || typeof body !== "object"
    || Array.isArray(body)
    || Object.keys(body).length !== 1
    || typeof body.key !== "string"
    || !RATE_KEY.test(body.key)
  ) {
    return json(400, { allowed: false });
  }
  if (!env.RATE_LIMITER || typeof env.RATE_LIMITER.limit !== "function") {
    return json(503, { allowed: false });
  }

  try {
    const result = await env.RATE_LIMITER.limit({ key: body.key });
    if (!result?.success) return json(429, { allowed: false });
  } catch {
    return json(503, { allowed: false });
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
};

export default {
  fetch(request, env) {
    return handleRateLimitRequest({ request, env });
  }
};
