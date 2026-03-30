import { Canvas } from "@react-three/fiber";
import { OrbitControls, KeyboardControls, Environment, Text } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { Character } from "../components/arena/Character";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useArenaStore } from "../store/arenaStore";

function Desk({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Desk Top */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>
      {/* Legs */}
      <mesh position={[-1.4, 0.5, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[1.4, 0.5, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-1.4, 0.5, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[1.4, 0.5, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Monitor */}
      <mesh position={[0, 1.3, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Screen glow */}
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
      {/* Pot */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 1.0, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 1.1, -0.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Cabin({ position, rotation, name, color = "#e0f2fe" }: { position: [number, number, number], rotation: [number, number, number], name: string, color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Floor/Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, 2.5, -3.9]} receiveShadow castShadow>
        <boxGeometry args={[8, 5, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      
      {/* Side Walls (Glass) */}
      <mesh position={[-3.9, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 8]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent roughness={0.1} />
      </mesh>
      <mesh position={[3.9, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 8]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent roughness={0.1} />
      </mesh>
      
      {/* Front Wall with Doorway (Glass) */}
      <mesh position={[-2.5, 2.5, 3.9]} receiveShadow>
        <boxGeometry args={[3, 5, 0.2]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent roughness={0.1} />
      </mesh>
      <mesh position={[3.5, 2.5, 3.9]} receiveShadow>
        <boxGeometry args={[1, 5, 0.2]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent roughness={0.1} />
      </mesh>
      {/* Header above door */}
      <mesh position={[0.5, 4.5, 3.9]} receiveShadow>
        <boxGeometry args={[3, 1, 0.2]} />
        <meshStandardMaterial color={color} opacity={0.3} transparent roughness={0.1} />
      </mesh>

      {/* Cabin Name Text */}
      <Text
        position={[0, 3.5, -3.7]}
        fontSize={0.6}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        {name}
      </Text>

      {/* Small Desk inside */}
      <Desk position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
      <Plant position={[2.5, 0, -2.5]} />
    </group>
  );
}

function SelfieWall({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wall Base */}
      <mesh position={[0, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 8, 1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      {/* Glowing Accent Lines */}
      <mesh position={[0, 7.5, 0.55]}>
        <boxGeometry args={[20, 0.1, 0.1]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0, 0.5, 0.55]}>
        <boxGeometry args={[20, 0.1, 0.1]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* DevArena Text */}
      <Text
        position={[0, 4, 0.6]}
        fontSize={2.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        outlineWidth={0.05}
        outlineColor="#38bdf8"
      >
        DevArena
      </Text>
      
      {/* Subtext */}
      <Text
        position={[0, 2, 0.6]}
        fontSize={0.5}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        #VirtualOffice #DevLife
      </Text>

      {/* Decorative Plants nearby */}
      <Plant position={[-8, 0, 2]} />
      <Plant position={[8, 0, 2]} />
      <Plant position={[-6, 0, 3]} />
      <Plant position={[6, 0, 3]} />
    </group>
  );
}

function OfficeEnvironment() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      {/* Grid for tiles */}
      <gridHelper args={[100, 100, '#cbd5e1', '#f1f5f9']} position={[0, 0, 0]} />

      {/* North Wall */}
      <mesh position={[0, 4, -50]} receiveShadow castShadow>
        <boxGeometry args={[100, 8, 1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* East Wall */}
      <mesh position={[50, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 8, 100]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* West Wall */}
      <mesh position={[-50, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 8, 100]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* South Glass Wall */}
      <mesh position={[0, 4, 50]} receiveShadow>
        <boxGeometry args={[100, 8, 1]} />
        <meshStandardMaterial color="#bae6fd" opacity={0.3} transparent roughness={0.1} />
      </mesh>

      {/* Selfie Wall (North Center) */}
      <SelfieWall position={[0, 0, -49]} rotation={[0, 0, 0]} />

      {/* Cabins (West Side) */}
      <Cabin position={[-40, 0, -20]} rotation={[0, Math.PI / 2, 0]} name="Focus Room A" />
      <Cabin position={[-40, 0, 0]} rotation={[0, Math.PI / 2, 0]} name="Focus Room B" />
      <Cabin position={[-40, 0, 20]} rotation={[0, Math.PI / 2, 0]} name="Focus Room C" />

      {/* Cabins (East Side) */}
      <Cabin position={[40, 0, -20]} rotation={[0, -Math.PI / 2, 0]} name="Quiet Pod 1" color="#fce7f3" />
      <Cabin position={[40, 0, 0]} rotation={[0, -Math.PI / 2, 0]} name="Quiet Pod 2" color="#fce7f3" />
      <Cabin position={[40, 0, 20]} rotation={[0, -Math.PI / 2, 0]} name="Quiet Pod 3" color="#fce7f3" />

      {/* Desks Cluster 1 (South West) */}
      <group position={[-20, 0, 25]}>
        <Desk position={[-5, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[-5, 0, -8]} rotation={[0, Math.PI, 0]} />
        <Desk position={[-9, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[-9, 0, -8]} rotation={[0, Math.PI, 0]} />
      </group>

      {/* Desks Cluster 2 (South East) */}
      <group position={[20, 0, 25]}>
        <Desk position={[5, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[5, 0, -8]} rotation={[0, Math.PI, 0]} />
        <Desk position={[9, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[9, 0, -8]} rotation={[0, Math.PI, 0]} />
      </group>

      {/* Desks Cluster 3 (Center South) */}
      <group position={[0, 0, 25]}>
        <Desk position={[-2, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[-2, 0, -8]} rotation={[0, Math.PI, 0]} />
        <Desk position={[2, 0, -5]} rotation={[0, 0, 0]} />
        <Desk position={[2, 0, -8]} rotation={[0, Math.PI, 0]} />
      </group>

      {/* Meeting Room (Center West) */}
      <group position={[-20, 0, -10]}>
        {/* Glass Walls */}
        <mesh position={[7.5, 3, 0]} receiveShadow>
          <boxGeometry args={[0.2, 6, 20]} />
          <meshStandardMaterial color="#e0f2fe" opacity={0.3} transparent roughness={0.1} />
        </mesh>
        <mesh position={[-7.5, 3, 0]} receiveShadow>
          <boxGeometry args={[0.2, 6, 20]} />
          <meshStandardMaterial color="#e0f2fe" opacity={0.3} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 3, -10]} receiveShadow>
          <boxGeometry args={[15, 6, 0.2]} />
          <meshStandardMaterial color="#e0f2fe" opacity={0.3} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 3, 10]} receiveShadow>
          <boxGeometry args={[15, 6, 0.2]} />
          <meshStandardMaterial color="#e0f2fe" opacity={0.3} transparent roughness={0.1} />
        </mesh>
        
        {/* Meeting Table */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.2, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[-2, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 1]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[2, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 1]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        
        {/* Whiteboard */}
        <mesh position={[0, 3, -9.8]} castShadow receiveShadow>
          <boxGeometry args={[8, 3, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>

      {/* Lounge Area (Center East) */}
      <group position={[20, 0, -10]}>
        {/* Rug */}
        <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#38bdf8" roughness={1} />
        </mesh>
        {/* Sofa 1 */}
        <mesh position={[0, 0.5, -5]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 2]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, -5.8]} castShadow receiveShadow>
          <boxGeometry args={[8, 1.5, 0.4]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.8} />
        </mesh>
        {/* Sofa 2 */}
        <mesh position={[-5, 0.5, 0]} castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[8, 1, 2]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.8} />
        </mesh>
        <mesh position={[-5.8, 1.2, 0]} castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[8, 1.5, 0.4]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.8} />
        </mesh>
        {/* Coffee Table */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
      </group>

      {/* Plants - Lots of them! */}
      {/* Corners */}
      <Plant position={[-48, 0, -48]} />
      <Plant position={[48, 0, -48]} />
      <Plant position={[48, 0, 48]} />
      <Plant position={[-48, 0, 48]} />
      
      {/* Along North Wall */}
      <Plant position={[-20, 0, -48]} />
      <Plant position={[-30, 0, -48]} />
      <Plant position={[20, 0, -48]} />
      <Plant position={[30, 0, -48]} />

      {/* Along South Wall */}
      <Plant position={[-20, 0, 48]} />
      <Plant position={[-30, 0, 48]} />
      <Plant position={[20, 0, 48]} />
      <Plant position={[30, 0, 48]} />

      {/* Center Area */}
      <Plant position={[-5, 0, 5]} />
      <Plant position={[5, 0, 5]} />
      <Plant position={[0, 0, 10]} />
      
      {/* Near Meeting Room */}
      <Plant position={[-10, 0, -10]} />
      <Plant position={[-10, 0, -20]} />
      <Plant position={[-30, 0, -10]} />
      
      {/* Near Lounge */}
      <Plant position={[10, 0, -10]} />
      <Plant position={[10, 0, -20]} />
      <Plant position={[30, 0, -10]} />
    </group>
  );
}

export default function ArenaStage() {
  const [isConnected, setIsConnected] = useState(false);
  const players = useArenaStore((state) => state.players);

  useEffect(() => {
    const socket = connectSocket();
    setIsConnected(true);

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.24))] rounded-[2.5rem] overflow-hidden relative bg-slate-50 border border-outline-variant/20 soft-atrium-shadow">
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
          <span className="text-white text-xs font-bold tracking-widest uppercase">
            {isConnected ? 'Virtual Office' : 'Connecting...'}
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
            <div className="flex items-center justify-between gap-4">
              <span>Move</span>
              <div className="flex gap-1">
                <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">W</kbd>
                <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">A</kbd>
                <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">S</kbd>
                <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">D</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Camera</span>
              <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/20">Drag</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Wave</span>
              <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">Space</kbd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Talk</span>
              <kbd className="bg-black/50 px-2 py-1 rounded text-xs border border-white/20">T</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            Loading Office...
          </div>
        }
      >
        <KeyboardControls
          map={[
            { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
            { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
            { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
            { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
            { name: 'wave', keys: ['Space'] },
            { name: 'talk', keys: ['t', 'T'] },
          ]}
        >
          <Canvas shadows camera={{ position: [0, 8, 16], fov: 45 }} gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}>
            <color attach="background" args={['#f8fafc']} />
            
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
            
            {/* Environment & Reflections */}
            <Environment preset="apartment" />
            
            {/* Office Map */}
            <OfficeEnvironment />

            {/* Render Players */}
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

            {/* Local Player */}
            <Character isLocal color="#3b82f6" />

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
