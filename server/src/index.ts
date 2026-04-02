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
  upsertUserNpcSettings,
  addNpcKnowledge,
  getNpcKnowledge,
  getUserNpcSettings,
  saveUserAgent,
  getUserAgent,
  deleteUserAgent,
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

    // ── Auth: Google credential (ID token) verification ──────────────────
    if (path === "/api/auth/google" && request.method === "POST") {
      const body = await request.json() as { credential?: string };
      const { credential } = body;

      if (!credential) {
        return Response.json({ error: "Missing credential" }, { status: 400, headers: CORS });
      }

      const googleUser = await verifyGoogleToken(credential, env.GOOGLE_CLIENT_ID);
      if (!googleUser) {
        return Response.json({ error: "Invalid Google token" }, { status: 401, headers: CORS });
      }

      return createAuthResponse(env, CORS, {
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      });
    }

    // ── Auth: Google userinfo (access_token flow) ──────────────────────────
    if (path === "/api/auth/google/userinfo" && request.method === "POST") {
      const body = await request.json() as { sub?: string; email?: string; name?: string; picture?: string };

      if (!body.sub || !body.email) {
        return Response.json({ error: "Missing user info" }, { status: 400, headers: CORS });
      }

      return createAuthResponse(env, CORS, {
        googleId: body.sub,
        email: body.email,
        name: body.name || body.email,
        avatarUrl: body.picture,
      });
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

    // ── NPC Training ──────────────────────────────────────────────────────────
    if (path.startsWith("/api/npc/") && path.endsWith("/train") && request.method === "POST") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      const npcId = path.split("/")[3];

      const body = await request.json() as { text?: string; voiceId?: string; roleOverride?: string };
      const { text, voiceId, roleOverride } = body;

      // Upsert settings if provided
      if (voiceId || roleOverride) {
        await upsertUserNpcSettings(env.DB, { userId: user.id, npcId, voiceId, roleOverride });
      }

      // Add knowledge if provided
      if (text) {
        // Generate embedding
        const req = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: [text],
        });
        // @ts-ignore
        const embedding = req.data[0];

        // Upsert to Vectorize
        await env.VECTORIZE_INDEX.upsert([
          {
            id: crypto.randomUUID(),
            values: embedding,
            metadata: { npcId, userId: user.id, text, type: "user_knowledge" },
          },
        ]);

        // Save raw text to D1
        await addNpcKnowledge(env.DB, { userId: user.id, npcId, content: text });
      }

      return Response.json({ success: true }, { status: 200, headers: CORS });
    }

    if (path.startsWith("/api/npc/") && path.endsWith("/knowledge") && request.method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      const npcId = path.split("/")[3];

      const knowledge = await getNpcKnowledge(env.DB, user.id, npcId);
      const settings = await getUserNpcSettings(env.DB, user.id, npcId);

      return Response.json({ knowledge, settings: settings || {} }, { status: 200, headers: CORS });
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

    // ── Custom Agent: Clone Voice ───────────────────────────────────────────
    if (path === "/api/agent/clone-voice" && request.method === "POST") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

      const elevenLabsApiKey = (env as unknown as { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        return Response.json({ error: "ElevenLabs API key not configured" }, { status: 500, headers: CORS });
      }

      try {
        // Forward the multipart form data directly to ElevenLabs IVC endpoint
        const formData = await request.formData();
        const audioFile = formData.get("file") as File | null;
        const voiceName = formData.get("name") as string | null;

        if (!audioFile || !voiceName) {
          return Response.json({ error: "Missing file or name" }, { status: 400, headers: CORS });
        }

        const elForm = new FormData();
        elForm.append("name", voiceName);
        elForm.append("files", audioFile);

        const elRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
          method: "POST",
          headers: { "xi-api-key": elevenLabsApiKey },
          body: elForm,
        });

        if (!elRes.ok) {
          const errText = await elRes.text();
          console.error("[ElevenLabs] Voice clone error:", elRes.status, errText);
          return Response.json({ error: "Voice cloning failed" }, { status: elRes.status, headers: CORS });
        }

        const result = await elRes.json() as { voice_id: string };
        return Response.json({ voiceId: result.voice_id }, { status: 200, headers: CORS });
      } catch (err) {
        console.error("[Agent] Clone voice error:", err);
        return Response.json({ error: "Internal error" }, { status: 500, headers: CORS });
      }
    }

    // ── Custom Agent: Create ────────────────────────────────────────────────
    if (path === "/api/agent/create" && request.method === "POST") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

      const elevenLabsApiKey = (env as unknown as { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        return Response.json({ error: "ElevenLabs API key not configured" }, { status: 500, headers: CORS });
      }

      try {
        const body = await request.json() as {
          name: string;
          systemPrompt: string;
          firstMessage: string;
          voiceId: string;
          knowledgeText?: string;
        };

        if (!body.name || !body.systemPrompt || !body.voiceId) {
          return Response.json({ error: "Missing required fields" }, { status: 400, headers: CORS });
        }

        // Step 1: Create knowledge base document if text is provided
        let knowledgeDocId: string | undefined;
        if (body.knowledgeText && body.knowledgeText.length > 0) {
          const kbRes = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base/text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
            },
            body: JSON.stringify({
              name: `${body.name} - Knowledge Base`,
              text: body.knowledgeText,
            }),
          });

          if (kbRes.ok) {
            const kbResult = await kbRes.json() as { id: string };
            knowledgeDocId = kbResult.id;
            console.log(`[Agent] KB document created: ${knowledgeDocId}`);
          } else {
            console.warn("[Agent] KB creation failed, proceeding without RAG:", await kbRes.text());
          }
        }

        // Step 2: Create the conversational agent
        const agentConfig: Record<string, unknown> = {
          name: body.name,
          conversation_config: {
            agent: {
              prompt: {
                prompt: body.systemPrompt,
              },
              first_message: body.firstMessage || `Hello! I'm ${body.name}. How can I help?`,
              language: "en",
            },
            tts: {
              voice_id: body.voiceId,
              model_id: "eleven_flash_v2_5",
            },
          },
        };

        // If KB doc was created, enable RAG
        if (knowledgeDocId) {
          const config = agentConfig.conversation_config as Record<string, unknown>;
          const agent = config.agent as Record<string, unknown>;
          const prompt = agent.prompt as Record<string, unknown>;
          prompt.knowledge_base = [{ type: "file", name: `${body.name} Knowledge`, id: knowledgeDocId }];
          prompt.rag = {
            enabled: true,
            embedding_model: "e5_mistral_7b_instruct",
            max_documents_length: 10000,
          };
        }

        const agentRes = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey,
          },
          body: JSON.stringify(agentConfig),
        });

        if (!agentRes.ok) {
          const errText = await agentRes.text();
          console.error("[ElevenLabs] Agent creation error:", agentRes.status, errText);
          return Response.json({ error: "Agent creation failed", details: errText }, { status: agentRes.status, headers: CORS });
        }

        const agentResult = await agentRes.json() as { agent_id: string };

        // Step 3: Save to D1
        await saveUserAgent(env.DB, {
          userId: user.id,
          agentId: agentResult.agent_id,
          voiceId: body.voiceId,
          name: body.name,
        });

        console.log(`[Agent] Created for user ${user.id}: ${agentResult.agent_id}`);
        return Response.json({ agentId: agentResult.agent_id }, { status: 200, headers: CORS });
      } catch (err) {
        console.error("[Agent] Create error:", err);
        return Response.json({ error: "Internal error" }, { status: 500, headers: CORS });
      }
    }

    // ── Custom Agent: Get Mine ──────────────────────────────────────────────
    if (path === "/api/agent/mine" && request.method === "GET") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

      const agent = await getUserAgent(env.DB, user.id);
      return Response.json({ agent }, { status: 200, headers: CORS });
    }

    // ── Custom Agent: Delete ────────────────────────────────────────────────
    if (path === "/api/agent/mine" && request.method === "DELETE") {
      const user = await getAuthenticatedUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

      const elevenLabsApiKey = (env as unknown as { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
      const agent = await getUserAgent(env.DB, user.id);

      if (agent && elevenLabsApiKey) {
        // Best-effort delete from ElevenLabs
        try {
          await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agent.agentId}`, {
            method: "DELETE",
            headers: { "xi-api-key": elevenLabsApiKey },
          });
          // Also delete the cloned voice
          await fetch(`https://api.elevenlabs.io/v1/voices/${agent.voiceId}`, {
            method: "DELETE",
            headers: { "xi-api-key": elevenLabsApiKey },
          });
        } catch (e) {
          console.warn("[Agent] ElevenLabs cleanup error (non-critical):", e);
        }
      }

      await deleteUserAgent(env.DB, user.id);
      return Response.json({ ok: true }, { status: 200, headers: CORS });
    }

    // ── Health check ──────────────────────────────────────────────────────
    if (path === "/api/health") {
      return Response.json({ status: "ok", version: "1.0.0" }, { headers: CORS });
    }

    // Fallback for missing APIs
    if (path.startsWith("/api/")) {
       return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Serve SPA index.html for all other routes so React Router handles it
    try {
      return await env.ASSETS.fetch(new Request(new URL("/index.html", request.url).toString(), request));
    } catch (e) {
      return new Response("Deverse Edge API v1 - Assets Not Available", { status: 200, headers: CORS });
    }
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

async function createAuthResponse(
  env: Env,
  cors: Record<string, string>,
  userData: { googleId: string; email: string; name: string; avatarUrl?: string }
): Promise<Response> {
  const user = await upsertUser(env.DB, userData);
  const sessionId = await createSession(env.DB, user.id);

  const token = await signJwt(
    {
      sub: user.id,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    },
    env.JWT_SECRET
  );

  const headers = new Headers({
    ...cors,
    "Content-Type": "application/json",
    "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
  });

  return new Response(
    JSON.stringify({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        color: user.color,
      },
    }),
    { status: 200, headers }
  );
}

