import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { emitMove, emitTalk, emitWave } from "../../lib/socket";
import { useArenaStore } from "../../store/arenaStore";

interface CharacterProps {
  id?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  isLocal?: boolean;
  isWaving?: boolean;
  isTalking?: boolean;
}

const SPEED = 5;
const ROTATION_SPEED = 3;
const PROXIMITY_RADIUS = 3;

export const Character: React.FC<CharacterProps> = ({
  id,
  position = [0, 1, 0],
  rotation = [0, 0, 0],
  color = "#3b82f6", // Default blue
  isLocal = false,
  isWaving = false,
  isTalking = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const [sub, get] = useKeyboardControls();
  const [localWaving, setLocalWaving] = useState(false);
  const [localTalking, setLocalTalking] = useState(false);
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);

  // State for non-local players
  const [remoteWaving, setRemoteWaving] = useState(isWaving);
  const [remoteTalking, setRemoteTalking] = useState(isTalking);

  useEffect(() => {
    if (!isLocal) {
      setRemoteWaving(isWaving);
      setRemoteTalking(isTalking);
    }
  }, [isWaving, isTalking, isLocal]);

  // Handle local player movement and interaction
  useFrame((state, delta) => {
    if (!isLocal || !groupRef.current) return;

    const { forward, backward, left, right, wave, talk } = get() as any;

    // Movement
    const moveDirection = new THREE.Vector3();
    if (forward) moveDirection.z -= 1;
    if (backward) moveDirection.z += 1;
    if (left) moveDirection.x -= 1;
    if (right) moveDirection.x += 1;

    moveDirection.normalize().multiplyScalar(SPEED * delta);

    // Apply rotation based on movement direction
    if (moveDirection.length() > 0) {
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        ROTATION_SPEED * delta
      );
    }

    // Apply movement
    groupRef.current.position.add(moveDirection);

    // Emit movement to server if moved
    if (moveDirection.length() > 0) {
      emitMove(
        [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z],
        [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z]
      );
    }

    // Handle waving
    if (wave && !localWaving) {
      setLocalWaving(true);
      emitWave(true);
      setTimeout(() => {
        setLocalWaving(false);
        emitWave(false);
      }, 2000); // Wave for 2 seconds
    }

    // Handle talking
    if (talk !== localTalking) {
      setLocalTalking(talk);
      emitTalk(talk);
    }

    // Proximity check
    const players = useArenaStore.getState().players;
    const nearby = Object.values(players)
      .filter((p) => p.id !== id) // Exclude self
      .filter((p) => {
        const pPos = new THREE.Vector3(...p.position);
        return groupRef.current!.position.distanceTo(pPos) < PROXIMITY_RADIUS;
      })
      .map((p) => p.id);

    setNearbyPlayers(nearby);
  });

  // Waving animation
  useFrame((state) => {
    if (!armRef.current) return;
    const waving = isLocal ? localWaving : remoteWaving;
    if (waving) {
      armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
    } else {
      armRef.current.rotation.z = 0;
    }
  });

  const currentWaving = isLocal ? localWaving : remoteWaving;
  const currentTalking = isLocal ? localTalking : remoteTalking;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.4, 0.8, 4, 16]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.5} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.5} 
          clearcoat={1} 
        />
      </mesh>

      {/* Glowing Visor */}
      <mesh position={[0, 2.2, 0.28]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Right Arm (Waving) */}
      <group position={[0.55, 1.5, 0]}>
        <mesh ref={armRef} position={[0, -0.4, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 0.5, 4, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.5} />
        </mesh>
      </group>

      {/* Left Arm */}
      <mesh position={[-0.55, 1.1, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.12, 0.5, 4, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Floating Ring (Aura) */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
      </mesh>

      {/* Point Light for the character */}
      <pointLight position={[0, 2, 0]} color={color} intensity={0.5} distance={5} />

      {/* Status Indicators */}
      {currentTalking && (
        <Html position={[0, 2.8, 0]} center>
          <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm animate-pulse">
            💬 Talking...
          </div>
        </Html>
      )}

      {currentWaving && (
        <Html position={[0, 2.5, 0]} center>
          <div className="text-2xl animate-bounce">👋</div>
        </Html>
      )}

      {/* Local Player UI */}
      {isLocal && (
        <Html position={[0, 3.2, 0]} center>
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              You
            </div>
            {nearbyPlayers.length > 0 && (
              <div className="bg-green-500/80 text-white px-2 py-1 rounded-full text-xs animate-pulse whitespace-nowrap">
                {nearbyPlayers.length} Dev(s) nearby! Press 'T' to talk.
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
