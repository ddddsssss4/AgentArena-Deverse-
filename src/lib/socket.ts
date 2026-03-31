/**
 * Native WebSocket client — replaces Socket.io.
 * Connects to the Cloudflare ArenaRoomDurableObject at /ws/arena/:roomId
 * Same event shape as before; no changes needed in Character.tsx or arenaStore.ts.
 */
import { useArenaStore } from "../store/arenaStore";
import { useChatStore } from "../store/chatStore";

let ws: WebSocket | null = null;
let selfId: string | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getWsUrl(roomId = "global"): string {
  // In dev: Vite proxies /ws → ws://localhost:8787
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  const user = getSelf();
  const name = encodeURIComponent(user?.name || "Developer");
  const color = encodeURIComponent(user?.color || "#3b82f6");

  return `${protocol}//${host}/ws/arena/${roomId}?name=${name}&color=${color}`;
}

function getSelf() {
  try {
    const raw = localStorage.getItem("deverse_user");
    return raw ? JSON.parse(raw) as { name: string; color: string } : null;
  } catch {
    return null;
  }
}

export const connectSocket = (roomId = "global") => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }

  ws = new WebSocket(getWsUrl(roomId));

  const {
    addPlayer,
    removePlayer,
    updatePlayer,
    setPlayers,
  } = useArenaStore.getState();

  ws.onopen = () => {
    console.log("[Arena WS] Connected to room:", roomId);
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };

  ws.onmessage = (event) => {
    if (typeof event.data !== "string") return;

    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(event.data) as Record<string, unknown>;
    } catch {
      return;
    }

    switch (msg.type) {
      case "selfJoined": {
        const player = msg.player as { id: string };
        selfId = player.id;
        break;
      }
      case "currentPlayers": {
        const players = msg.players as Parameters<typeof setPlayers>[0];
        setPlayers(players);
        break;
      }
      case "playerJoined": {
        const player = msg.player as Parameters<typeof addPlayer>[0];
        addPlayer(player);
        break;
      }
      case "playerMoved": {
        const { id, position, rotation } = msg as {
          id: string;
          position: [number, number, number];
          rotation: [number, number, number];
        };
        updatePlayer(id, { position, rotation });
        break;
      }
      case "playerWaved": {
        const { id, isWaving } = msg as { id: string; isWaving: boolean };
        updatePlayer(id, { isWaving });
        break;
      }
      case "playerTalked": {
        const { id, isTalking } = msg as { id: string; isTalking: boolean };
        updatePlayer(id, { isTalking });
        break;
      }
      case "chatMessage": {
        const { addMessage } = useChatStore.getState();
        addMessage({
          from: msg.from as string,
          color: msg.color as string,
          content: msg.content as string,
          timestamp: msg.timestamp as number,
          isSelf: false, // incoming messages are always from others
        });
        break;
      }
      case "webrtc-signal": {
        // Dispatch as a DOM event so webrtc.ts can react without coupling
        window.dispatchEvent(
          new CustomEvent("webrtc-signal", {
            detail: { from: msg.from, signal: msg.signal },
          })
        );
        break;
      }
      case "playerLeft": {
        removePlayer(msg.id as string);
        break;
      }
    }
  };

  ws.onclose = () => {
    console.log("[Arena WS] Disconnected. Reconnecting in 3s...");
    ws = null;
    selfId = null;
    reconnectTimer = setTimeout(() => connectSocket(roomId), 3000);
  };

  ws.onerror = (err) => {
    console.error("[Arena WS] Error:", err);
  };

  return ws;
};

export const disconnectSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
    selfId = null;
  }
};

export const getSelfId = () => selfId;

// ─── Emit helpers (same API surface as before) ───────────────────────────────

function send(data: object) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export const emitMove = (
  position: [number, number, number],
  rotation: [number, number, number]
) => send({ type: "move", position, rotation });

export const emitWave = (isWaving: boolean) =>
  send({ type: "wave", isWaving });

export const emitTalk = (isTalking: boolean) =>
  send({ type: "talk", isTalking });

export const emitChat = (content: string) =>
  send({ type: "chat", content });

export const emitWebRTCSignal = (to: string, signal: unknown) =>
  send({ type: "webrtc-signal", to, signal });
