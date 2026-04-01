import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ReceptionProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function Reception({ position, rotation }: ReceptionProps) {
  const deskMaterial = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.1 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.8 });
  const logoMaterial = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.2, metalness: 0.8 });

  return (
    <group position={position} rotation={rotation}>
      {/* Reception Desk Front */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.2, 0.5]} />
        <primitive object={deskMaterial} attach="material" />
      </mesh>
      {/* Reception Desk Side */}
      <mesh position={[1.75, 0.6, -1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.2, 2.5]} />
        <primitive object={deskMaterial} attach="material" />
      </mesh>
      {/* Desk Top */}
      <mesh position={[0, 1.25, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.1, 1.5]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Logo Wall behind reception */}
      <mesh position={[0, 2, -3]} castShadow receiveShadow>
        <boxGeometry args={[6, 4, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Logo */}
      <group position={[0, 2.5, -2.85]}>
        <mesh castShadow>
          <torusGeometry args={[0.5, 0.1, 16, 32]} />
          <primitive object={logoMaterial} attach="material" />
        </mesh>
        <Text position={[0, -0.8, 0]} fontSize={0.4} color="#f8fafc" anchorX="center" anchorY="middle">
          ATELIER
        </Text>
      </group>

      {/* Computer */}
      <group position={[0, 1.3, -0.5]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0, 0.1, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[0, 0.02, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.05, 0.2]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>
    </group>
  );
}
