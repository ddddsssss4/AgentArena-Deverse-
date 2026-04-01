import * as THREE from 'three';

const potMaterial = new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.6 });
const leafMaterial = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });
const sofaMaterial = new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.9 });

const Plant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Pot */}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
      <primitive object={potMaterial} attach="material" />
    </mesh>
    {/* Leaves */}
    <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
      <sphereGeometry args={[0.6, 16, 16]} />
      <primitive object={leafMaterial} attach="material" />
    </mesh>
    <mesh position={[0.2, 1.5, 0.2]} castShadow receiveShadow>
      <sphereGeometry args={[0.4, 16, 16]} />
      <primitive object={leafMaterial} attach="material" />
    </mesh>
    <mesh position={[-0.2, 1.4, -0.2]} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <primitive object={leafMaterial} attach="material" />
    </mesh>
  </group>
);

const Lounge = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    {/* Rug */}
    <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color="#cbd5e1" roughness={1} />
    </mesh>
    
    {/* Sofa */}
    <mesh position={[0, 0.5, -2]} castShadow receiveShadow>
      <boxGeometry args={[4, 1, 1.5]} />
      <primitive object={sofaMaterial} attach="material" />
    </mesh>
    <mesh position={[0, 1.2, -2.5]} castShadow receiveShadow>
      <boxGeometry args={[4, 1.4, 0.5]} />
      <primitive object={sofaMaterial} attach="material" />
    </mesh>
    <mesh position={[-1.8, 1, -2]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 0.6, 1.5]} />
      <primitive object={sofaMaterial} attach="material" />
    </mesh>
    <mesh position={[1.8, 1, -2]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 0.6, 1.5]} />
      <primitive object={sofaMaterial} attach="material" />
    </mesh>

    {/* Coffee Table */}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
      <meshStandardMaterial color="#d97706" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
      <meshStandardMaterial color="#1f2937" roughness={0.5} />
    </mesh>
  </group>
);

export default function Decor() {
  return (
    <group>
      {/* Plants around the office */}
      <Plant position={[-18, 0, -8]} />
      <Plant position={[-18, 0, 8]} />
      <Plant position={[18, 0, -18]} />
      <Plant position={[18, 0, 18]} />
      <Plant position={[-5, 0, -5]} />
      <Plant position={[5, 0, 5]} />

      {/* Lounge Area */}
      <Lounge position={[10, 0, -5]} rotation={[0, -Math.PI / 4, 0]} />
    </group>
  );
}
