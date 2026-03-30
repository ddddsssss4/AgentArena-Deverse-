import { ArenaRoomDurableObject } from "./durable-objects/ArenaRoomDO";
import { NPCDurableObject } from "./durable-objects/NPCDurableObject";
import {
  verifyGoogleToken,
  signJwt,
  verifyJwt,
  getSessionFromRequest,
  corsHeaders,
} from "./lib/auth";
import {
  upsertUser,
  createSession,
  getSessionUser,
  deleteSession,
  getChatHistory,
  getUserById,
} from "./lib/db";
import { NPCS } from "./config/npcs";

export { ArenaRoomDurableObject, NPCDurableObject };

const SESSION_COOKIE = "deverse_session";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const CORS = corsHeaders(env.FRONTEND_URL || "http://localhost:5173");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── WebSocket: Arena Room ──────────────────────────────────────────────
    if (path.startsWith("/ws/arena/")) {
      const roomId = path.split("/ws/arena/")[1] || "global";
      const id = env.ARENA_ROOM.idFromName(roomId);
      const stub = env.ARENA_ROOM.get(id);
      return stub.fetch(request);
    }

    // ── WebSocket: NPC Chat ────────────────────────────────────────────────
    if (path.startsWith("/ws/npc/")) {
      const npcId = path.split("/ws/npc/")[1] || "frontend-npc";
      const id = env.NPC_DURABLE_OBJECT.idFromName(npcId);
      const stub = env.NPC_DURABLE_OBJECT.get(id);

      // Inject userId into the URL for the DO to use
      const npcUrl = new URL(request.url);
      npcUrl.searchParams.set("npcId", npcId);
      return stub.fetch(new Request(npcUrl.toString(), request));
    }

    // ── Auth: Google OAuth verification ───────────────────────────────────
    if (path === "/api/auth/google" && request.method === "POST") {
      const body = await request.json() as { credential?: string };
      const { credential } = body;

      if (!credential) {
        return Response.json(
          { error: "Missing credential" },
          { status: 400, headers: CORS }
        );
      }

      const googleUser = await verifyGoogleToken(
        credential,
        env.GOOGLE_CLIENT_ID
      );

      if (!googleUser) {
        return Response.json(
          { error: "Invalid Google token" },
          { status: 401, headers: CORS }
        );
      }

      // Upsert user in D1
      const user = await upsertUser(env.DB, {
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      });

      // Create session
      const sessionId = await createSession(env.DB, user.id);

      // Sign a JWT containing the session ID
      const token = await signJwt(
        {
          sub: user.id,
          sessionId,
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        },
        env.JWT_SECRET
      );

      const headers = new Headers({
        ...CORS,
        "Content-Type": "application/json",
        "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      });

      return new Response(
        JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, color: user.color } }),
        { status: 200, headers }
      );
    }

    // ── Auth: Get current user ─────────────────────────────────────────────
    if (path === "/api/me" && request.method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      }
      return Response.json(
        { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, color: user.color },
        { status: 200, headers: CORS }
      );
    }

    // ── Auth: Logout ───────────────────────────────────────────────────────
    if (path === "/api/auth/logout" && request.method === "POST") {
      const token = getSessionFromRequest(request);
      if (token) {
        const payload = await verifyJwt<{ sessionId?: string }>(token, env.JWT_SECRET);
        if (payload?.sessionId) {
          await deleteSession(env.DB, payload.sessionId);
        }
      }
      const headers = new Headers({
        ...CORS,
        "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`,
      });
      return Response.json({ ok: true }, { status: 200, headers });
    }

    // ── NPCs: List all NPCs ────────────────────────────────────────────────
    if (path === "/api/npcs" && request.method === "GET") {
      const npcList = NPCS.map(({ id, name, role, specialty, position, color }) => ({
        id, name, role, specialty, position, color,
      }));
      return Response.json(npcList, { status: 200, headers: CORS });
    }

    // ── Chat History ───────────────────────────────────────────────────────
    if (path === "/api/chat-history" && request.method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      }

      const npcId = url.searchParams.get("npcId") ?? undefined;
      const limit = parseInt(url.searchParams.get("limit") ?? "50");

      const history = await getChatHistory(env.DB, user.id, npcId, limit);
      return Response.json(history, { status: 200, headers: CORS });
    }

    // ── Arena: Create private room ─────────────────────────────────────────
    if (path === "/api/arenas/create" && request.method === "POST") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      }
      const code = generateRoomCode();
      return Response.json({ code }, { status: 200, headers: CORS });
    }

    // ── Arena: Validate join code (any code is valid — DO handles isolation) ─
    if (path === "/api/arenas/join" && request.method === "POST") {
      const body = await request.json() as { code?: string };
      const { code } = body;
      if (!code || code.trim().length < 4) {
        return Response.json({ error: "Invalid code" }, { status: 400, headers: CORS });
      }
      return Response.json({ code: code.trim().toUpperCase() }, { status: 200, headers: CORS });
    }

    // ── Health check ──────────────────────────────────────────────────────
    if (path === "/api/health") {
      return Response.json({ status: "ok", version: "1.0.0" }, { headers: CORS });
    }

    return new Response("Deverse Edge API v1", { status: 200, headers: CORS });
  },
} satisfies ExportedHandler<Env>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedUser(request: Request, env: Env) {
  const token = getSessionFromRequest(request);
  if (!token) return null;

  const payload = await verifyJwt<{ sub?: string; sessionId?: string }>(
    token,
    env.JWT_SECRET
  );

  if (!payload?.sessionId) return null;

  return getSessionUser(env.DB, payload.sessionId);
}

function generateRoomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
