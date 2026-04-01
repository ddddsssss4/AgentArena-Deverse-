import * as THREE from 'three';

interface DeskGroupProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function DeskGroup({ position, rotation }: DeskGroupProps) {
  const deskMaterial = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.8 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.5, metalness: 0.8 });
  const screenMaterial = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.2, metalness: 0.8 });
  const chairMaterial = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 });
  const accessoryMaterial = new THREE.MeshStandardMaterial({ color: '#d1d5db', roughness: 0.5 });

  const renderDesk = (x: number, z: number, rotY: number) => (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Table Top */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <primitive object={deskMaterial} attach="material" />
      </mesh>
      
      {/* Legs */}
      {[[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.75, pos[1]]} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.5]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      ))}

      {/* Monitor */}
      <group position={[0, 1.55, -0.4]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <primitive object={screenMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.2, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.05, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.05, 0.3]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      </group>

      {/* Keyboard & Mouse */}
      <mesh position={[0, 1.56, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <primitive object={accessoryMaterial} attach="material" />
      </mesh>
      <mesh position={[0.6, 1.56, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.03, 0.2]} />
        <primitive object={accessoryMaterial} attach="material" />
      </mesh>

      {/* Chair */}
      <group position={[0, 0, 0.8]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <primitive object={chairMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 1.3, 0.35]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <primitive object={chairMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
        {/* Wheels base */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 5]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Desk cluster of 4 */}
      {renderDesk(-1.5, -0.75, 0)}
      {renderDesk(1.5, -0.75, 0)}
      {renderDesk(-1.5, 0.75, Math.PI)}
      {renderDesk(1.5, 0.75, Math.PI)}

      {/* Divider */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.6, 0.1]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.9} />
      </mesh>
    </group>
  );
}
