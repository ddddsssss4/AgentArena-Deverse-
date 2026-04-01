import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SelfiePointProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function SelfiePoint({ position, rotation }: SelfiePointProps) {
  const backdropMaterial = new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.2, metalness: 0.8 });
  const standMaterial = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 });
  const potMaterial = new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.6 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });

  return (
    <group position={position} rotation={rotation}>
      {/* Backdrop */}
      <mesh position={[0, 2.5, -1]} castShadow receiveShadow>
        <boxGeometry args={[6, 5, 0.5]} />
        <primitive object={backdropMaterial} attach="material" />
      </mesh>

      {/* Neon Sign */}
      <group position={[0, 3.5, -0.7]}>
        <Text fontSize={0.8} color="#fdf2f8" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#db2777">
          #ATELIER
        </Text>
        <pointLight position={[0, 0, 0.5]} intensity={2} distance={5} color="#fbcfe8" />
      </group>

      {/* Ring Light / Camera Stand */}
      <group position={[0, 0, 2]}>
        {/* Tripod Legs */}
        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.75, x === 0 ? -0.5 : 0.5]} rotation={[x === 0 ? 0.2 : -0.2, 0, x * 0.4]} castShadow>
            <cylinderGeometry args={[0.02, 0.05, 1.5]} />
            <primitive object={standMaterial} attach="material" />
          </mesh>
        ))}
        {/* Center Pole */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <primitive object={standMaterial} attach="material" />
        </mesh>
        {/* Ring Light */}
        <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.3, 0.05, 16, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <pointLight position={[0, 2.2, 0.5]} intensity={1} distance={3} color="#ffffff" />
      </group>

      {/* Floor Pad */}
      <mesh receiveShadow position={[0, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#fce7f3" roughness={0.9} />
      </mesh>

      {/* Plants */}
      {[-2.5, 2.5].map((x, i) => (
        <group key={`plant-${i}`} position={[x, 0, -0.2]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.8, 16]} />
            <primitive object={potMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <primitive object={leafMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
