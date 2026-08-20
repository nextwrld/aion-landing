/**
 * Origin extraction and derivation for rate limiting.
 * - Extracts CF-Connecting-IP only (never X-Forwarded-For)
 * - Normalizes (trim, lowercase, strip brackets)
 * - Derives originKey via HMAC-SHA-256 using CONTACT_IP_HASH_KEY
 * - Emits truncated origin_fingerprint without exposing IP in clear
 */

/**
 * Extract and normalize CF-Connecting-IP.
 * Returns null if header is absent or empty after trim.
 */
export function getNormalizedIp(request: Request): string | null {
  const raw = request.headers.get("CF-Connecting-IP");
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  let normalized = trimmed.toLowerCase();
  // Strip surrounding brackets if present (e.g. "[::1]")
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }
  return normalized;
}

/**
 * Derive HMAC-SHA-256 hex of normalizedIp using hashKey.
 * Uses Web Crypto API available in Workers.
 */
export async function deriveOriginKey(
  normalizedIp: string,
  hashKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(hashKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(normalizedIp),
  );
  const bytes = new Uint8Array(signature);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/**
 * Truncate hex to fingerprint for logs (default 12 chars).
 * Never logs full key nor IP.
 */
export function toFingerprint(originKey: string, length = 12): string {
  return originKey.slice(0, length);
}

export type OriginInfo = {
  normalizedIp: string | null;
  originKey: string | null;
  fingerprint: string | null;
};

/**
 * Resolve origin info for a request.
 * If CONTACT_IP_HASH_KEY is missing or IP is missing, originKey/fingerprint stay null.
 */
export async function getOriginInfo(
  request: Request,
  hashKey: string | undefined,
): Promise<OriginInfo> {
  const normalizedIp = getNormalizedIp(request);
  if (!normalizedIp || !hashKey) {
    return { normalizedIp, originKey: null, fingerprint: null };
  }
  try {
    const originKey = await deriveOriginKey(normalizedIp, hashKey);
    const fingerprint = toFingerprint(originKey);
    return { normalizedIp, originKey, fingerprint };
  } catch {
    return { normalizedIp, originKey: null, fingerprint: null };
  }
}
