import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface NPCCharacterProps {
  id: string;
  name: string;
  role: string;
  position: [number, number, number];
  color: string;
  isNearby?: boolean;
}

export const NPCCharacter: React.FC<NPCCharacterProps> = ({
  id,
  name,
  role,
  position,
  color,
  isNearby = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  // Idle bobbing animation + aura pulse
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.08;

    if (auraRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      auraRef.current.scale.set(scale, 1, scale);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity =
        isNearby ? 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.4, 0.8, 4, 16]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.7}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.7}
          clearcoat={1}
        />
      </mesh>

      {/* Glowing Visor */}
      <mesh position={[0, 2.2, 0.28]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* NPC Indicator Ring (floating crown) */}
      <mesh position={[0, 2.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 16, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Ground Aura */}
      <mesh
        ref={auraRef}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Point Light */}
      <pointLight
        position={[0, 2, 0]}
        color={color}
        intensity={isNearby ? 1.5 : 0.6}
        distance={6}
      />

      {/* Name + Role Label */}
      <Text
        position={[0, 3.4, 0]}
        fontSize={0.22}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {name}
      </Text>
      <Text
        position={[0, 3.1, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {role}
      </Text>

      {/* Proximity Prompt */}
      {isNearby && (
        <Html position={[0, 3.8, 0]} center>
          <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg shadow-primary/30 whitespace-nowrap">
            Press T to talk
          </div>
        </Html>
      )}
    </group>
  );
};
