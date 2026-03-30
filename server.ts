import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store connected players
  const players = new Map();

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Spawn player at random position
    const spawnPosition = [
      (Math.random() - 0.5) * 20, // x
      0, // y
      (Math.random() - 0.5) * 20, // z
    ];

    const newPlayer = {
      id: socket.id,
      position: spawnPosition,
      rotation: [0, 0, 0],
      isWaving: false,
      isTalking: false,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
    };

    players.set(socket.id, newPlayer);

    // Send current players to the new player
    socket.emit("currentPlayers", Array.from(players.values()));

    // Broadcast new player to others
    socket.broadcast.emit("playerJoined", newPlayer);

    // Handle movement
    socket.on("move", (position, rotation) => {
      const player = players.get(socket.id);
      if (player) {
        player.position = position;
        player.rotation = rotation;
        socket.broadcast.emit("playerMoved", { id: socket.id, position, rotation });
      }
    });

    // Handle waving
    socket.on("wave", (isWaving) => {
      const player = players.get(socket.id);
      if (player) {
        player.isWaving = isWaving;
        socket.broadcast.emit("playerWaved", { id: socket.id, isWaving });
      }
    });

    // Handle talking
    socket.on("talk", (isTalking) => {
      const player = players.get(socket.id);
      if (player) {
        player.isTalking = isTalking;
        socket.broadcast.emit("playerTalked", { id: socket.id, isTalking });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);
      players.delete(socket.id);
      io.emit("playerLeft", socket.id);
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
