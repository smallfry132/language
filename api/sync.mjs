/* Sync store for the Language Trainer (Vercel function).
 * One JSON document per sync code in Upstash Redis (Vercel Marketplace → Storage → Upstash for Redis).
 * The code is the only credential: it travels in a header and is stored as a SHA-256 hash.
 *   GET  → { v, data }            current version and document (v = 0, data = null when new)
 *   PUT  { base, data } → { v }   saved only if base is the current version, else 409 { v }
 * Merging happens on the devices (js/app.js, mergeDoc). */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_BYTES = 900_000;
const CODE = /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/;

// Compare-and-set: write the document and bump the version only if the caller saw the current version
const CAS = `local v = tonumber(redis.call('GET', KEYS[1]) or '0')
if v ~= tonumber(ARGV[1]) then return -1 - v end
redis.call('SET', KEYS[2], ARGV[2])
redis.call('SET', KEYS[1], v + 1)
return v + 1`;

async function redis(command) {
  const res = await fetch(REDIS_URL, { method: "POST", headers: { Authorization: `Bearer ${REDIS_TOKEN}` }, body: JSON.stringify(command) });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return (await res.json()).result;
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
async function keys(request) {
  const code = request.headers.get("x-sync-code") || "";
  if (!CODE.test(code)) return null;
  const hash = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))).toString("hex");
  return { version: `sync:${hash}:v`, doc: `sync:${hash}:doc` };
}

export async function GET(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: "not-configured" }, 503);
  const k = await keys(request);
  if (!k) return json({ error: "bad-code" }, 400);
  const [v, doc] = await redis(["MGET", k.version, k.doc]);
  return json({ v: Number(v || 0), data: doc ? JSON.parse(doc) : null });
}

export async function PUT(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: "not-configured" }, 503);
  const k = await keys(request);
  if (!k) return json({ error: "bad-code" }, 400);
  const body = await request.text();
  if (body.length > MAX_BYTES) return json({ error: "too-large" }, 413);
  let base, data;
  try { ({ base, data } = JSON.parse(body)); } catch (e) { return json({ error: "bad-json" }, 400); }
  if (!Number.isInteger(base) || !data || typeof data !== "object") return json({ error: "bad-request" }, 400);
  const r = await redis(["EVAL", CAS, "2", k.version, k.doc, String(base), JSON.stringify(data)]);
  return r < 0 ? json({ error: "conflict", v: -1 - r }, 409) : json({ v: r });
}
