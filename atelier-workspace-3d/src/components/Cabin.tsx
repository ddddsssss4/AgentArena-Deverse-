import { Text } from '@react-three/drei';
import * as THREE from 'three';
import Whiteboard from './Whiteboard';

interface CabinProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  name: string;
  color: string;
}

export default function Cabin({ position, rotation, size, name, color }: CabinProps) {
  const [w, h, d] = size;
  const wallThickness = 0.2;

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transmission: 0.9,
    opacity: 1,
    metalness: 0,
    roughness: 0.1,
    ior: 1.5,
    thickness: 0.1,
    transparent: true,
  });

  const frameMaterial = new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.8, roughness: 0.2 });
  const tableMaterial = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.8 });
  const chairMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  const whiteboardMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1, metalness: 0.1 });

  return (
    <group position={position} rotation={rotation}>
      {/* Floor */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>

      {/* Glass Walls */}
      {/* Front Wall */}
      <mesh position={[0, h / 2, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, wallThickness]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, h / 2, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, wallThickness]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-w / 2, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, h, d]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[w / 2, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, h, d]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Frame / Pillars */}
      {[[-w/2, -d/2], [w/2, -d/2], [-w/2, d/2], [w/2, d/2]].map((pos, i) => (
        <mesh key={i} position={[pos[0], h / 2, pos[1]]} castShadow receiveShadow>
          <boxGeometry args={[0.3, h, 0.3]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      {/* Top Frame */}
      <mesh position={[0, h, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.3, d + 0.3]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Signage */}
      <group position={[0, h - 0.5, d / 2 + 0.11]}>
        <mesh>
          <planeGeometry args={[3, 0.8]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          {name}
        </Text>
      </group>

      {/* Whiteboard Backing */}
      <mesh position={[0, h / 2, -d / 2 + 0.14]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, h * 0.5, 0.03]} />
        <primitive object={whiteboardMaterial} attach="material" />
      </mesh>
      {/* Interactive Whiteboard Surface */}
      <Whiteboard position={[0, h / 2, -d / 2 + 0.156]} size={[w * 0.6, h * 0.5]} title={`${name} Board`} />
      {/* Whiteboard Frame */}
      <mesh position={[0, h / 2, -d / 2 + 0.12]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.62, h * 0.52, 0.05]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Interior - Table */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, 0.1, d * 0.4]} />
        <primitive object={tableMaterial} attach="material" />
      </mesh>
      {/* Table Leg */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 0.8, 16]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Interior - Chairs */}
      {[-1, 1].map((x, i) => (
        <group key={`chair-front-${i}`} position={[x * (w * 0.2), 0, d * 0.3]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <primitive object={chairMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.9, -0.25]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.8, 0.1]} />
            <primitive object={chairMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((x, i) => (
        <group key={`chair-back-${i}`} position={[x * (w * 0.2), 0, -d * 0.3]} rotation={[0, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <primitive object={chairMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.9, -0.25]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.8, 0.1]} />
            <primitive object={chairMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
        </group>
      ))}
      
      {/* Light inside cabin */}
      <pointLight position={[0, h - 0.5, 0]} intensity={0.8} distance={10} color="#fef08a" />
    </group>
  );
}
