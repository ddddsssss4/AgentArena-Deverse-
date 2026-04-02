import { Canvas } from "@react-three/fiber";
import { CameraControls, KeyboardControls, Environment, Text } from "@react-three/drei";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import * as THREE from "three";
import OfficeScene from "../components/arena/workspace/OfficeScene";
import { MousePointer2, Move, ZoomIn, Coffee, PenTool, MousePointerClick, Headphones } from "lucide-react";
import { Character } from "../components/arena/Character";
import { NPCCharacter } from "../components/arena/NPCCharacter";
import { NPCChatModal } from "../components/arena/NPCChatModal";
import { RoomChat } from "../components/arena/RoomChat";
import { connectSocket, disconnectSocket, getSelfId } from "../lib/socket";
import { useRealtimeKitClient, RealtimeKitProvider } from "@cloudflare/realtimekit-react";
import { RtkParticipantsAudio } from "@cloudflare/realtimekit-react-ui";
import { useArenaStore } from "../store/arenaStore";
import { useAuthStore } from "../store/authStore";
import { ShortcutsDialog } from "../components/common/ShortcutsDialog";

// ─── NPC config (mirrors server config, positions are where NPCs stand) ───────
const NPC_CONFIGS = [
  { id: "frontend-npc", name: "Aria", role: "Frontend Engineer", position: [10, 0, -5] as [number, number, number], color: "#6366f1" },
  { id: "backend-npc", name: "Kai", role: "Backend Architect", position: [-10, 0, -5] as [number, number, number], color: "#10b981" },
  { id: "devops-npc", name: "Nova", role: "DevOps Engineer", position: [0, 0, -15] as [number, number, number], color: "#f59e0b" },
];

const NPC_PROXIMITY_RADIUS = 5;

// ─── 3D Scene components (unchanged from the existing code) ──────────────────
// Removed old OfficeEnvironment down to this line

// ─── Main ArenaStage ──────────────────────────────────────────────────────────

export default function ArenaStage() {
  const cameraControlsRef = useRef<any>(null);
  const { user } = useAuthStore();
  const searchParams = useSearchParams()[0];
  const isPrivateRoom = searchParams.get("private") === "true";
  const roomId = searchParams.get("room") || "global";

  const { players } = useArenaStore();
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyPlayer, setNearbyPlayer] = useState(false);
  const [activeNpcChat, setActiveNpcChat] = useState<{ id: string; name: string; role: string; color: string } | null>(null);
  const [nearbyNpc, setNearbyNpc] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [meeting, initMeeting] = useRealtimeKitClient();
  const [rtkToken, setRtkToken] = useState("");

  // Connect to Cloudflare RealtimeKit if user is logged in
  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    const fetchToken = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/api/arenas/${roomId}/rtk-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: user.name, userId: user.id })
        });
        const data = (await res.json()) as any;
        if (mounted && data.auth_token) {
           const rtkMeeting = await initMeeting({ authToken: data.auth_token });
           if (rtkMeeting) {
             await rtkMeeting.join(); // Explicitly join the meeting to start receiving audio
           }
           setRtkToken(data.auth_token);
        }
      } catch (err) {
        console.error("Failed to connect to Cloudflare RealtimeKit room:", err);
      }
    };
    
    fetchToken();
    return () => { mounted = false; };
  }, [isPrivateRoom, user, roomId]);

  useEffect(() => {
    connectSocket(roomId);
    setIsConnected(true);
    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [roomId]);

  // Listen for 'T' key to open NPC chat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // 1. NPC Interaction (T)
      if ((e.key === "t" || e.key === "T") && nearbyNpc && !activeNpcChat) {
        const npc = NPC_CONFIGS.find((n) => n.id === nearbyNpc);
        if (npc) setActiveNpcChat(npc);
      }
      // 2. Escape to close everything
      if (e.key === "Escape") {
        if (activeNpcChat) setActiveNpcChat(null);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
      // 3. Shortcuts Guide (Ctrl+/ or Cmd+/)
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nearbyNpc, activeNpcChat, isShortcutsOpen]);

  // Auto-open shortcuts for first-time visitors
  useEffect(() => {
    const hasSeenShortcuts = localStorage.getItem("deverse_seen_shortcuts");
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        setIsShortcutsOpen(true);
        localStorage.setItem("deverse_seen_shortcuts", "true");
      }, 1500); // Small delay for entrance polish
    }
  }, []);

  const handlePlayerProximity = useCallback((playerPos: THREE.Vector3) => {
    // 1. NPC Proximity
    const showNpcs = !isPrivateRoom || searchParams.get("npcs") === "true";
    let foundNpc = null;
    if (showNpcs) {
      foundNpc = NPC_CONFIGS.find((npc) => {
        const npcPos = new THREE.Vector3(...npc.position);
        return playerPos.distanceTo(npcPos) < NPC_PROXIMITY_RADIUS;
      });
    }
    setNearbyNpc(foundNpc?.id ?? null);

    // 2. Human Player Proximity
    const otherPlayers = useArenaStore.getState().players;
    const isPlayerNearby = Object.values(otherPlayers).some((p) => {
      const pPos = new THREE.Vector3(...p.position);
      return playerPos.distanceTo(pPos) < NPC_PROXIMITY_RADIUS; // Same radius for humans
    });
    setNearbyPlayer(isPlayerNearby);
  }, [isPrivateRoom, searchParams]);

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.24))] rounded-[2.5rem] overflow-hidden relative bg-slate-50 border border-outline-variant/20 soft-atrium-shadow">
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400"} animate-pulse`} />
          <span className="text-white text-xs font-bold tracking-widest uppercase">
            {isPrivateRoom ? `Room: ${roomId}` : "Global Arena"}
          </span>
        </div>
        <div className="mt-2 text-slate-800 font-bold text-xs font-mono bg-white/50 inline-block px-2 py-1 rounded backdrop-blur-sm">
          {Object.keys(players).length + 1} Dev(s) Online
        </div>
      </div>



      {/* NPC Chat Modal */}
      {activeNpcChat && (
        <NPCChatModal
          npcId={activeNpcChat.id}
          npcName={activeNpcChat.name}
          npcRole={activeNpcChat.role}
          npcColor={activeNpcChat.color}
          onClose={() => setActiveNpcChat(null)}
        />
      )}

      {/* Shortcuts Guide Modal */}
      <ShortcutsDialog 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />

      {/* Room Chat & Audio Overlay (Enabled for both Global & Private) */}
      {user && (
        <RealtimeKitProvider value={meeting}>
          <RoomChat 
            selfName={user.name} 
            selfColor={user.color} 
            isNearbyPlayer={nearbyPlayer}
            isNpcChatActive={!!activeNpcChat}
          />
          {rtkToken && <RtkParticipantsAudio meeting={meeting} />}
        </RealtimeKitProvider>
      )}

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            Loading Arena…
          </div>
        }
      >
        <KeyboardControls
          map={[
            { name: "forward", keys: ["ArrowUp", "w", "W"] },
            { name: "backward", keys: ["ArrowDown", "s", "S"] },
            { name: "left", keys: ["ArrowLeft", "a", "A"] },
            { name: "right", keys: ["ArrowRight", "d", "D"] },
            { name: "wave", keys: ["Space"] },
            { name: "talk", keys: ["t", "T"] },
          ]}
        >
          <Canvas
            shadows
            camera={{ position: [0, 8, 16], fov: 45 }}
            gl={{ alpha: false, antialias: true }}
          >
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.5}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
            />
            <Environment preset="city" />

            <OfficeScene />

            {/* Remote players */}
            {Object.values(players).map((player) => (
              <Character
                key={player.id}
                id={player.id}
                position={player.position}
                rotation={player.rotation}
                color={player.color}
                isWaving={player.isWaving}
                isTalking={player.isTalking}
                isLocal={false}
              />
            ))}

            {/* Local player — passes proximity callback */}
            <Character
              isLocal
              color="#3b82f6"
              onProximityUpdate={handlePlayerProximity}
            />

            {/* NPC Characters (global arena only, or if toggled in private) */}
            {(!isPrivateRoom || searchParams.get("npcs") === "true") &&
              NPC_CONFIGS.map((npc) => (
                <NPCCharacter
                  key={npc.id}
                  id={npc.id}
                  name={npc.name}
                  role={npc.role}
                  position={npc.position}
                  color={npc.color}
                  isNearby={nearbyNpc === npc.id}
                />
              ))}

            <CameraControls 
              ref={cameraControlsRef}
              makeDefault 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 2 - 0.05}
              maxDistance={80}
              minDistance={2}
              dollySpeed={1.5}
              smoothTime={0.4}
            />
          </Canvas>
        </KeyboardControls>
      </Suspense>
    </div>
  );
}
