import { Canvas } from "@react-three/fiber";
import { OrbitControls, KeyboardControls, Environment, Text } from "@react-three/drei";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import * as THREE from "three";
import { Character } from "../components/arena/Character";
import { NPCCharacter } from "../components/arena/NPCCharacter";
import { NPCChatModal } from "../components/arena/NPCChatModal";
import { connectSocket, disconnectSocket, getSelfId } from "../lib/socket";
import { useArenaStore } from "../store/arenaStore";

// ─── NPC config (mirrors server config, positions are where NPCs stand) ───────
const NPC_CONFIGS = [
  { id: "frontend-npc", name: "Aria", role: "Frontend Engineer", position: [10, 0, -5] as [number, number, number], color: "#6366f1" },
  { id: "backend-npc", name: "Kai", role: "Backend Architect", position: [-10, 0, -5] as [number, number, number], color: "#10b981" },
  { id: "devops-npc", name: "Nova", role: "DevOps Engineer", position: [0, 0, -15] as [number, number, number], color: "#f59e0b" },
];

const NPC_PROXIMITY_RADIUS = 5;

// ─── 3D Scene components (unchanged from the existing code) ──────────────────

function Desk({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>
      {[[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      <mesh position={[0, 1.3, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 1.3, -0.24]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.6, 16, 16]} /><meshStandardMaterial color="#22c55e" roughness={0.8} /></mesh>
      <mesh position={[0.3, 1.0, 0.3]}><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial color="#16a34a" roughness={0.8} /></mesh>
      <mesh position={[-0.3, 1.1, -0.2]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color="#15803d" roughness={0.8} /></mesh>
    </group>
  );
}

function OfficeEnvironment({ showNPCs }: { showNPCs: boolean }) {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      <gridHelper args={[100, 100, '#cbd5e1', '#f1f5f9']} position={[0, 0, 0]} />

      {/* Walls */}
      <mesh position={[0, 4, -50]} receiveShadow castShadow><boxGeometry args={[100, 8, 1]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[50, 4, 0]} receiveShadow castShadow><boxGeometry args={[1, 8, 100]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[-50, 4, 0]} receiveShadow castShadow><boxGeometry args={[1, 8, 100]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[0, 4, 50]} receiveShadow><boxGeometry args={[100, 8, 1]} /><meshStandardMaterial color="#bae6fd" opacity={0.3} transparent roughness={0.1} /></mesh>

      {/* Selfie Wall */}
      <group position={[0, 0, -49]}>
        <mesh position={[0, 4, 0]} receiveShadow castShadow><boxGeometry args={[20, 8, 1]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[0, 7.5, 0.55]}><boxGeometry args={[20, 0.1, 0.1]} /><meshBasicMaterial color="#38bdf8" /></mesh>
        <Text position={[0, 4, 0.6]} fontSize={2.5} color="#ffffff" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff" outlineWidth={0.05} outlineColor="#38bdf8">
          {showNPCs ? "DevArena" : "Private Room"}
        </Text>
        <Text position={[0, 2, 0.6]} fontSize={0.5} color="#94a3b8" anchorX="center" anchorY="middle">{showNPCs ? "#VirtualOffice #DevLife" : "#Team #Private"}</Text>
      </group>

      {/* Desk clusters */}
      {[[-20, 25], [20, 25], [0, 25]].map(([px, pz], ci) => (
        <group key={ci} position={[px, 0, pz]}>
          {[[-5, -5], [-5, -8], [-9, -5], [-9, -8], [5, -5], [5, -8], [9, -5], [9, -8], [-2, -5], [-2, -8], [2, -5], [2, -8]].slice(ci * 4, ci * 4 + 4).map(([dx, dz], i) => (
            <Desk key={i} position={[dx, 0, dz]} rotation={[0, i % 2 === 1 ? Math.PI : 0, 0]} />
          ))}
        </group>
      ))}

      {/* Plants */}
      {[[-48, -48], [48, -48], [48, 48], [-48, 48], [-20, -48], [20, -48], [-20, 48], [20, 48], [-5, 5], [5, 5]].map(([x, z], i) => (
        <Plant key={i} position={[x, 0, z]} />
      ))}
    </group>
  );
}

// ─── Main ArenaStage ──────────────────────────────────────────────────────────

export default function ArenaStage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "global";
  const isPrivateRoom = roomId !== "global";

  const [isConnected, setIsConnected] = useState(false);
  const [nearbyNpc, setNearbyNpc] = useState<string | null>(null);
  const [activeNpcChat, setActiveNpcChat] = useState<typeof NPC_CONFIGS[number] | null>(null);

  const players = useArenaStore((state) => state.players);

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
    if (isPrivateRoom) return; // No NPCs in private rooms

    const nearby = NPC_CONFIGS.find((npc) => {
      const npcPos = new THREE.Vector3(...npc.position);
      return playerPos.distanceTo(npcPos) < NPC_PROXIMITY_RADIUS;
    });

    setNearbyNpc(nearby?.id ?? null);
  }, [isPrivateRoom]);

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
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Controls</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/80">
            {[["Move", ["W", "A", "S", "D"]], ["Wave", ["Space"]], ["Talk/NPC", ["T"]], ["Camera", "Drag"]].map(([label, keys]) => (
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
            <Environment preset="apartment" />

            <OfficeEnvironment showNPCs={!isPrivateRoom} />

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

            {/* NPC Characters (global arena only) */}
            {!isPrivateRoom &&
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

            <OrbitControls
              makeDefault
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={2}
              maxDistance={80}
              target={[0, 1, 0]}
            />
          </Canvas>
        </KeyboardControls>
      </Suspense>
    </div>
  );
}
