import { DurableObject } from "cloudflare:workers";

interface PlayerState {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isWaving: boolean;
  isTalking: boolean;
}

type IncomingMessage =
  | { type: "join"; name: string; color: string }
  | { type: "move"; position: [number, number, number]; rotation: [number, number, number] }
  | { type: "wave"; isWaving: boolean }
  | { type: "talk"; isTalking: boolean }
  | { type: "chat"; content: string }
  | { type: "webrtc-signal"; to: string; signal: unknown }
  | { type: "ping" };

/**
 * ArenaRoomDurableObject — One instance per arena room (global or private).
 * Replaces the Express + Socket.io server.ts for player presence/movement.
 */
export class ArenaRoomDurableObject extends DurableObject<Env> {
  private sessions: Map<WebSocket, PlayerState> = new Map();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Restore any hibernated sessions
    this.ctx.getWebSockets().forEach((ws) => {
      const player = ws.deserializeAttachment() as PlayerState | null;
      if (player) this.sessions.set(ws, player);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // ── Handle Preflight for RTK Token endpoint ──
    const cors = {
      "Access-Control-Allow-Origin": this.env.FRONTEND_URL || "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (url.pathname.endsWith("/rtk-token") && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // ── Handle HTTP request for RTK Tokens ──
    if (url.pathname.endsWith("/rtk-token") && request.method === "POST") {
      if (!this.env.CF_ACCOUNT_ID || !this.env.CF_API_TOKEN || !this.env.RTK_APP_ID) {
        console.error("[RTK] Missing secrets: CF_ACCOUNT_ID, CF_API_TOKEN, or RTK_APP_ID not set");
        return Response.json({ error: "Missing RTK secrets" }, { status: 500, headers: cors });
      }

      // ── Get or create a persistent RealtimeKit meeting per room ──
      let meetingId = await this.ctx.storage.get<string>("rtkMeetingId");
      if (!meetingId) {
        console.log("[RTK] Creating new meeting for room:", url.pathname);
        const createRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/realtime/kit/${this.env.RTK_APP_ID}/meetings`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.env.CF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: `Deverse-${url.pathname}` }),
          }
        );
        if (!createRes.ok) {
          const errText = await createRes.text();
          console.error("[RTK] Meeting creation failed:", errText);
          return Response.json({ error: "Failed to create RTK meeting", details: errText }, { status: createRes.status, headers: cors });
        }
        const createData = await createRes.json() as any;
        // CF API wraps response in { result: { id, ... }, success: true }
        meetingId = createData?.result?.id || createData?.result?.meeting_id || createData?.id;
        if (!meetingId) {
          console.error("[RTK] No meeting ID in response:", JSON.stringify(createData));
          return Response.json({ error: "Invalid RTK meeting creation response", raw: createData }, { status: 500, headers: cors });
        }
        await this.ctx.storage.put("rtkMeetingId", meetingId);
        console.log("[RTK] Meeting created:", meetingId);
      }

      // ── Add the participant and return their auth token ──
      try {
        let participantName = "Developer";
        try {
          const bodyText = await request.text();
          if (bodyText) {
            const body = JSON.parse(bodyText);
            participantName = body.name || "Developer";
          }
        } catch { /* body is optional */ }

        const partRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/realtime/kit/${this.env.RTK_APP_ID}/meetings/${meetingId}/participants`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.env.CF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: participantName }),
          }
        );
        if (!partRes.ok) {
          const errText = await partRes.text();
          console.error("[RTK] Participant creation failed:", errText);
          return Response.json({ error: "Failed to create RTK participant", details: errText }, { status: partRes.status, headers: cors });
        }
        const partData = await partRes.json() as any;
        // Normalise: CF returns either authToken or auth_token depending on version
        const result = partData?.result || partData;
        const authToken = result?.authToken || result?.auth_token;
        if (!authToken) {
          console.error("[RTK] No authToken in participant response:", JSON.stringify(partData));
          return Response.json({ error: "No authToken in response", raw: partData }, { status: 500, headers: cors });
        }
        console.log("[RTK] Participant created for:", participantName);
        // Always return as auth_token so the frontend has a stable field name
        return Response.json({ auth_token: authToken, meeting_id: meetingId }, { status: 200, headers: cors });
      } catch (err) {
        console.error("[RTK] Unexpected error:", err);
        return Response.json({ error: "Internal error generating RTK token", details: String(err) }, { status: 500, headers: cors });
      }
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const playerName = url.searchParams.get("name") || "Developer";
    const playerColor = url.searchParams.get("color") || "#3b82f6";
    const playerId = crypto.randomUUID();

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    const newPlayer: PlayerState = {
      id: playerId,
      name: playerName,
      color: playerColor,
      position: [
        (Math.random() - 0.5) * 20,
        0,
        (Math.random() - 0.5) * 20,
      ],
      rotation: [0, 0, 0],
      isWaving: false,
      isTalking: false,
    };

    server.serializeAttachment(newPlayer);
    this.sessions.set(server, newPlayer);

    // Send current players to the new joiner
    const currentPlayers = [...this.sessions.values()].filter(
      (p) => p.id !== playerId
    );
    server.send(JSON.stringify({ type: "currentPlayers", players: currentPlayers }));
    server.send(JSON.stringify({ type: "selfJoined", player: newPlayer }));

    // Broadcast new player to everyone else
    this.broadcast(
      JSON.stringify({ type: "playerJoined", player: newPlayer }),
      server
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== "string") return;

    const player = this.sessions.get(ws);
    if (!player) return;

    let msg: IncomingMessage;
    try {
      msg = JSON.parse(message) as IncomingMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "move": {
        player.position = msg.position;
        player.rotation = msg.rotation;
        ws.serializeAttachment(player);
        this.broadcast(
          JSON.stringify({
            type: "playerMoved",
            id: player.id,
            position: msg.position,
            rotation: msg.rotation,
          }),
          ws
        );
        break;
      }

      case "wave": {
        player.isWaving = msg.isWaving;
        ws.serializeAttachment(player);
        this.broadcast(
          JSON.stringify({ type: "playerWaved", id: player.id, isWaving: msg.isWaving }),
          ws
        );
        break;
      }

      case "talk": {
        player.isTalking = msg.isTalking;
        ws.serializeAttachment(player);
        this.broadcast(
          JSON.stringify({ type: "playerTalked", id: player.id, isTalking: msg.isTalking }),
          ws
        );
        break;
      }

      case "chat": {
        this.broadcast(
          JSON.stringify({
            type: "chatMessage",
            from: player.name,
            color: player.color,
            content: msg.content,
            timestamp: Date.now(),
          }),
          ws
        );
        break;
      }

      case "webrtc-signal": {
        // Route the SDP offer/answer/ICE candidate directly to the target peer
        const targetWs = [...this.sessions.entries()].find(
          ([, p]) => p.id === msg.to
        )?.[0];
        if (targetWs) {
          targetWs.send(
            JSON.stringify({
              type: "webrtc-signal",
              from: player.id,
              signal: msg.signal,
            })
          );
        }
        break;
      }

      case "ping": {
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      }
    }
  }

  webSocketClose(ws: WebSocket): void {
    const player = this.sessions.get(ws);
    if (player) {
      this.sessions.delete(ws);
      this.broadcast(JSON.stringify({ type: "playerLeft", id: player.id }));
    }
  }

  webSocketError(ws: WebSocket): void {
    this.webSocketClose(ws);
  }

  private broadcast(message: string, exclude?: WebSocket): void {
    for (const ws of this.sessions.keys()) {
      if (ws === exclude) continue;
      try {
        ws.send(message);
      } catch {
        // WebSocket may be closed; clean up
        this.sessions.delete(ws);
      }
    }
  }
}
