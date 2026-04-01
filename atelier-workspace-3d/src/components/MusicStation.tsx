import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';

function Headphone({ position, rotation, color, onClick, isActive, id }: any) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isActive && groupRef.current) {
      // Gentle bobbing when active
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.02;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Headband */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color={hovered ? '#9ca3af' : color} />
      </mesh>
      {/* Left Earcup */}
      <mesh position={[-0.1, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Right Earcup */}
      <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Stand for headphone */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Floating notes if active */}
      {isActive && (
        <Html position={[0, 0.35, 0]} center>
          <div className="flex gap-1 items-end h-4 pointer-events-none">
            <div className="w-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
            <div className="w-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
            <div className="w-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
          </div>
        </Html>
      )}
    </group>
  );
}

export default function MusicStation({ position, rotation }: any) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setActiveId(prev => prev === id ? null : id);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Table */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.1, 2]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {/* Legs */}
      <mesh position={[-2.8, 0.75, -0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[2.8, 0.75, -0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[-2.8, 0.75, 0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[2.8, 0.75, 0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Table Mat */}
      <mesh position={[0, 1.56, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.02, 1.2]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Signage */}
      <group position={[0, 1.55, -0.5]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.2]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <Text position={[0, 0.45, 0.03]} fontSize={0.15} color="#f9fafb" anchorX="center" anchorY="middle">
          Listening Station
        </Text>
        <Text position={[0, 0.3, 0.03]} fontSize={0.08} color="#9ca3af" anchorX="center" anchorY="middle">
          Pick a headphone to tune in
        </Text>
      </group>

      {/* Headphones */}
      <Headphone id={1} position={[-2, 1.57, 0.2]} rotation={[0, 0.2, 0]} color="#f87171" onClick={handleToggle} isActive={activeId === 1} />
      <Headphone id={2} position={[0, 1.57, 0.2]} rotation={[0, -0.1, 0]} color="#fbbf24" onClick={handleToggle} isActive={activeId === 2} />
      <Headphone id={3} position={[2, 1.57, 0.2]} rotation={[0, 0.3, 0]} color="#a78bfa" onClick={handleToggle} isActive={activeId === 3} />

      {/* Global UI for active music */}
      {activeId !== null && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-neutral-900/90 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4 w-64 pointer-events-none transform transition-all">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Now Playing</p>
              <p className="text-sm font-medium truncate">
                {activeId === 1 ? 'Lofi Chill Beats' : activeId === 2 ? 'Deep Focus Ambient' : 'Coffee Shop Jazz'}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
