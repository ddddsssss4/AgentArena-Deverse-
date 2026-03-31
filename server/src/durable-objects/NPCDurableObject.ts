import { DurableObject } from "cloudflare:workers";
import { getNpcById } from "../config/npcs";
import { saveChatTurn, getUserNpcSettings } from "../lib/db";

/**
 * NPCDurableObject — One instance per NPC (keyed by npcId).
 * Manages memory retrieval, AI reasoning with Workers AI, and ElevenLabs voice streaming.
 */
export class NPCDurableObject extends DurableObject<Env> {
  private sessions: Set<WebSocket> = new Set();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const url = new URL(request.url);
    const npcId = url.searchParams.get("npcId") || "frontend-npc";
    const userId = url.searchParams.get("userId") || "anonymous";

    const npcConfig = getNpcById(npcId);
    if (!npcConfig) {
      return new Response("NPC not found", { status: 404 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    server.accept();
    this.sessions.add(server);

    server.addEventListener("message", async (msg) => {
      try {
        let userMessage = "";

        console.log(`[WS] Message received. Type: ${typeof msg.data}, isArrayBuffer: ${msg.data instanceof ArrayBuffer}`);

        // --- 1. Identify Data Type ---
        if (typeof msg.data === "string") {
          const parsed = JSON.parse(msg.data) as { type: string; content?: string };
          if (parsed.type !== "message" || !parsed.content) return;
          userMessage = parsed.content;
          server.send(JSON.stringify({ type: "status", status: "thinking" }));
        } else {
          // Binary audio — workers runtime may deliver as ArrayBuffer OR Blob depending on env
          const binaryData = msg.data as ArrayBuffer | Blob;
          let resolvedBuffer: ArrayBuffer;

          if (binaryData instanceof ArrayBuffer) {
            console.log("[Whisper] Received ArrayBuffer, byteLength:", binaryData.byteLength);
            resolvedBuffer = binaryData;
          } else if (typeof (binaryData as Blob).arrayBuffer === "function") {
            // Cloudflare local dev delivers binary frames as Blob — convert it
            console.log("[Whisper] Received Blob (local dev), converting via .arrayBuffer()...");
            resolvedBuffer = await (binaryData as Blob).arrayBuffer();
            console.log("[Whisper] Resolved byteLength:", resolvedBuffer.byteLength);
          } else {
            console.error("[Whisper] Unknown binary type, cannot process.");
            return;
          }

          if (resolvedBuffer.byteLength === 0) {
            console.error("[Whisper] Empty audio buffer received.");
            server.send(JSON.stringify({ type: "error", error: "Received empty audio. Please try again." }));
            return;
          }

          server.send(JSON.stringify({ type: "status", status: "thinking" }));

          try {
            const audioArray = Array.from(new Uint8Array(resolvedBuffer));
            console.log(`[Whisper] Sending ${audioArray.length} PCM bytes to Cloudflare Whisper...`);

            const transcription = await this.env.AI.run("@cf/openai/whisper", { audio: audioArray }) as { text: string };
            userMessage = transcription.text?.trim() ?? "";
            console.log(`[Whisper] Transcription: "${userMessage}"`);

            if (!userMessage) {
              console.warn("[Whisper] No speech detected.");
              server.send(JSON.stringify({ type: "status", status: "ready" }));
              return;
            }

            server.send(JSON.stringify({ type: "transcribed_text", content: userMessage }));
          } catch (err) {
            console.error("[Whisper] API Error:", err);
            server.send(JSON.stringify({ type: "error", error: "Voice transcription failed." }));
            return;
          }
        }

        // ── 0. Load user overrides ───────────────────────────────────────
        let activeSystemPrompt = npcConfig.systemPrompt;
        let activeVoiceId: string = npcConfig.voiceId;
        
        if (userId !== "anonymous") {
          const settings = await getUserNpcSettings(this.env.DB, userId, npcId);
          if (settings) {
            if (settings.roleOverride) activeSystemPrompt += `\nRole context: ${settings.roleOverride}`;
            if (settings.voiceId) activeVoiceId = settings.voiceId;
          }
        }

        // ── 1. Memory retrieval (Vectorize with userId filtering) ────────
        const queryEmbedding = await this.env.AI.run(
          "@cf/baai/bge-base-en-v1.5",
          { text: [userMessage] }
        ) as { data: number[][] };

        const vector = queryEmbedding.data[0];

        // Filter by userId if authenticated, else just npcId
        const filterStr = userId !== "anonymous" 
          ? { npcId, userId } 
          : { npcId };

        const memoryQuery = await this.env.VECTORIZE_INDEX.query(vector, {
          topK: 3,
          returnMetadata: "all",
          filter: filterStr as any,
        });

        // ── 2. Build prompt with memories ────────────────────────────────
        const promptMessages: Array<{ role: string; content: string }> = [
          { role: "system", content: activeSystemPrompt },
        ];

        if (memoryQuery.matches && memoryQuery.matches.length > 0) {
          const memoryTexts = memoryQuery.matches
            .filter((m) => m.metadata?.text)
            .map((m) => {
              const prefix = m.metadata?.type === "user_knowledge" ? "[User Provided Fact]" : "[Past Conversation]";
              return `${prefix} ${m.metadata!.text as string}`;
            })
            .join("\n---\n");

          if (memoryTexts.length > 0) {
            promptMessages.push({
              role: "system",
              content: `Relevant context:\n${memoryTexts}`,
            });
          }
        }

        promptMessages.push({ role: "user", content: userMessage });

        // ── 3. AI Response (Llama 3) ─────────────────────────────────────
        const aiResponse = await this.env.AI.run(
          "@cf/meta/llama-3-8b-instruct",
          { messages: promptMessages }
        ) as { response: string };

        const responseText = aiResponse.response;

        // Send text response immediately
        server.send(JSON.stringify({
          type: "text",
          content: responseText,
          npcId,
          npcName: npcConfig.name,
        }));

        // ── 4. Voice generation (ElevenLabs) ─────────────────────────────
        const elevenLabsApiKey = (this.env as unknown as { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;

        if (elevenLabsApiKey) {
          server.send(JSON.stringify({ type: "status", status: "speaking" }));

          const ttsRes = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}/stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": elevenLabsApiKey,
              },
              body: JSON.stringify({
                text: responseText,
                model_id: "eleven_flash_v2_5",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 },
              }),
            }
          );

          if (ttsRes.ok && ttsRes.body) {
            console.log(`[NPC:${npcId}] ElevenLabs stream started`);
            const reader = ttsRes.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              server.send(value);
            }
            server.send(JSON.stringify({ type: "audioEnd" }));
            console.log(`[NPC:${npcId}] ElevenLabs stream finished`);
          } else {
            const errorText = await ttsRes.text();
            console.error(`[NPC:${npcId}] ElevenLabs Error:`, ttsRes.status, errorText);
            server.send(JSON.stringify({ type: "status", status: "ready" }));
          }
        } else {
          console.warn(`[NPC:${npcId}] Skipping voice: ELEVENLABS_API_KEY missing in .dev.vars`);
          server.send(JSON.stringify({ type: "status", status: "ready" }));
        }

        // ── 5. Persist to D1 (background) ────────────────────────────────
        if (userId !== "anonymous") {
          this.ctx.waitUntil(
            Promise.all([
              saveChatTurn(this.env.DB, {
                userId,
                npcId,
                role: "user",
                content: userMessage,
              }),
              saveChatTurn(this.env.DB, {
                userId,
                npcId,
                role: "npc",
                content: responseText,
              }),
            ])
          );
        }

        // ── 6. Summarize + Vectorize memory (background) ─────────────────
        if (userId !== "anonymous") {
          this.ctx.waitUntil(
            this.saveMemory(npcId, userId, userMessage, responseText, vector)
          );
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        server.send(JSON.stringify({ type: "error", error: message }));
      }
    });

    server.addEventListener("close", () => {
      this.sessions.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private async saveMemory(
    npcId: string,
    userId: string,
    userMessage: string,
    responseText: string,
    messageVector: number[]
  ): Promise<void> {
    try {
      // Summarize the exchange using Workers AI
      const summary = await this.env.AI.run(
        "@cf/facebook/bart-large-cnn",
        {
          input_text: `User: ${userMessage}\nAssistant: ${responseText}`,
          max_length: 100,
        }
      ) as { summary: string };

      const summaryText = summary.summary || `${userMessage} → ${responseText.slice(0, 100)}`;

      // Store in Vectorize with userId and npcId filter
      await this.env.VECTORIZE_INDEX.insert([
        {
          id: crypto.randomUUID(),
          values: messageVector,
          metadata: { text: summaryText, npcId, userId, type: "conversation" },
        },
      ]);
    } catch {
      // Memory save failure is non-critical
    }
  }
}
