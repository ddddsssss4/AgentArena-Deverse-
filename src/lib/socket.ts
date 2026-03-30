import { io, Socket } from "socket.io-client";
import { useArenaStore } from "../store/arenaStore";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket) return socket;

  // Connect to the same origin
  socket = io(window.location.origin);

  const { addPlayer, removePlayer, updatePlayer, setPlayers } = useArenaStore.getState();

  socket.on("connect", () => {
    console.log("Connected to server", socket?.id);
  });

  socket.on("currentPlayers", (players) => {
    setPlayers(players);
  });

  socket.on("playerJoined", (player) => {
    addPlayer(player);
  });

  socket.on("playerMoved", ({ id, position, rotation }) => {
    updatePlayer(id, { position, rotation });
  });

  socket.on("playerWaved", ({ id, isWaving }) => {
    updatePlayer(id, { isWaving });
  });

  socket.on("playerTalked", ({ id, isTalking }) => {
    updatePlayer(id, { isTalking });
  });

  socket.on("playerLeft", (id) => {
    removePlayer(id);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitMove = (position: [number, number, number], rotation: [number, number, number]) => {
  if (socket) {
    socket.emit("move", position, rotation);
  }
};

export const emitWave = (isWaving: boolean) => {
  if (socket) {
    socket.emit("wave", isWaving);
  }
};

export const emitTalk = (isTalking: boolean) => {
  if (socket) {
    socket.emit("talk", isTalking);
  }
};
