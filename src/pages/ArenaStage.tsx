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
import { connectToPeer, disconnectPeer } from "../lib/webrtc";
import { useArenaStore } from "../store/arenaStore";
import { useAuthStore } from "../store/authStore";

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

  // Re-run WebRTC connections whenever a new player arrives/leaves
  useEffect(() => {
    if (!isPrivateRoom) return;
    const playerIds = Object.keys(players);
    playerIds.forEach((id) => connectToPeer(id));
    return () => {
      // Cleanup logic if needed
    };
  }, [players, isPrivateRoom]);

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
      if ((e.key === "t" || e.key === "T") && nearbyNpc && !activeNpcChat) {
        const npc = NPC_CONFIGS.find((n) => n.id === nearbyNpc);
        if (npc) setActiveNpcChat(npc);
      }
      if (e.key === "Escape" && activeNpcChat) {
        setActiveNpcChat(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nearbyNpc, activeNpcChat]);

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

      {/* Controls Help */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="bg-neutral-900/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 text-white shadow-2xl w-80 pointer-events-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-semibold text-lg">Interactive Controls</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <MousePointerClick className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="font-medium text-emerald-300">Double-Click to Move</p>
                <p className="text-neutral-400 text-xs mt-0.5">Focus explicitly on meeting room surfaces</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <PenTool className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="font-medium text-blue-300">Interact</p>
                <p className="text-neutral-400 text-xs mt-0.5">Walk up and press 'T' to talk to NPCs</p>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 my-3" />

            <div className="flex items-center gap-3 text-neutral-300">
              <MousePointer2 className="w-4 h-4 shrink-0" />
              <span>Left Click + Drag to Rotate</span>
            </div>
            
            <div className="flex items-center gap-3 text-neutral-300">
              <Move className="w-4 h-4 shrink-0" />
              <span>Right Click + Drag to Pan</span>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span>Scroll to Zoom In/Out</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Player Controls</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/80">
            {[["Move", ["W", "A", "S", "D"]], ["Wave", ["Space"]], ["Talk/NPC", ["T"]]].map(([label, keys]) => (
              <div key={label as string} className="flex items-center justify-between gap-4">
                <span>{label}</span>
                <div className="flex gap-1">
                  {Array.isArray(keys)
                    ? keys.map((k) => <kbd key={k} className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">{k}</kbd>)
                    : <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/20">{keys}</span>}
                </div>
              </div>
            ))}
          </div>
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

      {/* Private Room Chat Overlay */}
      {isPrivateRoom && user && (
        <RoomChat 
          selfName={user.name} 
          selfColor={user.color} 
          isNearbyPlayer={nearbyPlayer}
          isNpcChatActive={!!activeNpcChat}
        />
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
