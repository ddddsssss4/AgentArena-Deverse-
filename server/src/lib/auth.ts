// JWT helpers using Web Crypto API (Workers compatible)

const ALGORITHM = { name: "HMAC", hash: "SHA-256" };

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    ALGORITHM,
    false,
    ["sign", "verify"]
  );
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

export async function signJwt(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })).buffer as ArrayBuffer
  );
  const body = base64url(
    new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer
  );
  const unsigned = `${header}.${body}`;

  const key = await getKey(secret);
  const signature = await crypto.subtle.sign(
    ALGORITHM,
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64url(signature)}`;
}

export async function verifyJwt<T = Record<string, unknown>>(
  token: string,
  secret: string
): Promise<T | null> {
  try {
    const [header, payload, sig] = token.split(".");
    if (!header || !payload || !sig) return null;

    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      ALGORITHM,
      key,
      fromBase64url(sig),
      new TextEncoder().encode(`${header}.${payload}`)
    );

    if (!valid) return null;

    const decoded = JSON.parse(
      new TextDecoder().decode(fromBase64url(payload))
    ) as T & { exp?: number };

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }

    return decoded;
  } catch {
    return null;
  }
}

// ─── Google token verification ────────────────────────────────────────────────

interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  aud?: string;
}

export async function verifyGoogleToken(
  credential: string,
  clientId: string
): Promise<GoogleTokenPayload | null> {
  try {
    // Verify via Google's tokeninfo endpoint (simple & reliable)
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!res.ok) return null;

    const payload = (await res.json()) as GoogleTokenPayload & {
      aud?: string;
      error_description?: string;
    };

    if (payload.error_description) return null;

    // Verify the token is for our app
    if (payload.aud !== clientId) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─── Auth middleware helper ───────────────────────────────────────────────────

export function getSessionFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Also check cookie
  const cookie = request.headers.get("Cookie");
  if (cookie) {
    const match = cookie.match(/deverse_session=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

export function corsHeaders(frontendUrl: string) {
  return {
    "Access-Control-Allow-Origin": frontendUrl,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}
