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
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const url = new URL(request.url);
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
