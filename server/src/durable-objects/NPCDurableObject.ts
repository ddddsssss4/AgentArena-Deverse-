import { DurableObject } from "cloudflare:workers";
import { getNpcById } from "../config/npcs";
import { saveChatTurn } from "../lib/db";

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

        if (msg.data instanceof ArrayBuffer) {
          const byteSize = msg.data.byteLength;
          console.log(`[Whisper] Received binary audio frame: ${byteSize} bytes. Sending to Whisper...`);
          server.send(JSON.stringify({ type: "status", status: "thinking" }));
          
          try {
            const audioArray = [...new Uint8Array(msg.data)];
            console.log(`[Whisper] Audio array length: ${audioArray.length}. Calling AI...`);
            
            const transcription = await this.env.AI.run(
              "@cf/openai/whisper",
              { audio: audioArray }
            ) as { text: string };
            
            console.log(`[Whisper] Transcription result: "${transcription.text}"`);
            userMessage = transcription.text.trim();
            
            if (!userMessage) {
              console.warn("[Whisper] Empty transcription, likely silent audio.");
              server.send(JSON.stringify({ type: "status", status: "ready" }));
              return;
            }

            // Echo the transcribed text back so the user sees what they said
            server.send(JSON.stringify({ type: "transcribed_text", content: userMessage }));
          } catch (err) {
            console.error("[Whisper] Transcription error:", err);
            server.send(JSON.stringify({ type: "error", error: "Speech-to-text failed." }));
            return;
          }
        } else if (typeof msg.data === "string") {
          console.log(`[WS] Text message: ${msg.data.slice(0, 100)}`);
          const parsed = JSON.parse(msg.data) as { type: string; content?: string };
          if (parsed.type !== "message" || !parsed.content) return;
          userMessage = parsed.content;
          server.send(JSON.stringify({ type: "status", status: "thinking" }));
        } else {
          console.warn("[WS] Unrecognized message type, ignoring.");
          return;
        }

        // ── 1. Memory retrieval (Vectorize) ──────────────────────────────
        const queryEmbedding = await this.env.AI.run(
          "@cf/baai/bge-base-en-v1.5",
          { text: [userMessage] }
        ) as { data: number[][] };

        const vector = queryEmbedding.data[0];

        const memoryQuery = await this.env.VECTORIZE_INDEX.query(vector, {
          topK: 3,
          returnMetadata: "all",
          filter: { npcId },
        });

        // ── 2. Build prompt with memories ────────────────────────────────
        const promptMessages: Array<{ role: string; content: string }> = [
          { role: "system", content: npcConfig.systemPrompt },
        ];

        if (memoryQuery.matches && memoryQuery.matches.length > 0) {
          const memoryTexts = memoryQuery.matches
            .filter((m) => m.metadata?.text)
            .map((m) => m.metadata!.text as string)
            .join("\n---\n");

          if (memoryTexts.length > 0) {
            promptMessages.push({
              role: "system",
              content: `Past conversation context:\n${memoryTexts}`,
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
            `https://api.elevenlabs.io/v1/text-to-speech/${npcConfig.voiceId}/stream`,
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
        this.ctx.waitUntil(
          this.saveMemory(npcId, userMessage, responseText, vector)
        );

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

      // Store in Vectorize with npcId filter
      await this.env.VECTORIZE_INDEX.insert([
        {
          id: crypto.randomUUID(),
          values: messageVector,
          metadata: { text: summaryText, npcId },
        },
      ]);
    } catch {
      // Memory save failure is non-critical
    }
  }
}
