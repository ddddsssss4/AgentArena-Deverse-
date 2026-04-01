import { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import CoffeeMachine from './CoffeeMachine';

interface CafeteriaProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function Cafeteria({ position, rotation }: CafeteriaProps) {
  const [dispensedCups, setDispensedCups] = useState<{id: number, x: number, z: number}[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  const dispenseCup = (e: any) => {
    e.stopPropagation();
    setDispensedCups(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: -3 + (Math.random() * 0.8 - 0.4),
        z: -4.5 + (Math.random() * 0.4 - 0.2)
      }
    ]);
  };

  const counterMaterial = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9 });
  const chairMaterial = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.5 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#fca5a5', roughness: 0.9 });
  const machineMaterial = new THREE.MeshStandardMaterial({ color: '#9ca3af', metalness: 0.8, roughness: 0.2 });
  const cupMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
  const vendingMaterial = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4, metalness: 0.2 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.9, opacity: 1, roughness: 0.1 });

  return (
    <group position={position} rotation={rotation}>
      {/* Cafeteria Area Floor */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Counter */}
      <mesh position={[0, 1.5, -5]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 2]} />
        <primitive object={counterMaterial} attach="material" />
      </mesh>
      
      {/* Counter Top */}
      <mesh position={[0, 3.05, -5]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.1, 2.2]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Coffee Machine */}
      <CoffeeMachine position={[-3, 3.1, -5]} rotation={[0, 0, 0]} />

      {/* Cups */}
      {[-1, -0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={`cup-${i}`} position={[x, 3.2, -4.5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
          <primitive object={cupMaterial} attach="material" />
        </mesh>
      ))}

      {/* Dispensed Cups */}
      {dispensedCups.map((cup) => (
        <mesh key={cup.id} position={[cup.x, 3.2, cup.z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
          <primitive object={cupMaterial} attach="material" />
        </mesh>
      ))}

      {/* Vending Machine */}
      <group position={[7, 2, -5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 4, 1.5]} />
          <primitive object={vendingMaterial} attach="material" />
        </mesh>
        {/* Glass Front */}
        <mesh position={[-0.2, 0.2, 0.76]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 3, 0.05]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
        {/* Panel */}
        <mesh position={[0.7, 0.2, 0.76]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {/* Light inside */}
        <pointLight position={[-0.2, 1, 0.5]} intensity={0.5} distance={3} color="#ffffff" />
      </group>

      {/* Menu Board */}
      <group position={[0, 4.5, -6]}>
        <mesh castShadow>
          <boxGeometry args={[8, 2, 0.2]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <Text position={[0, 0, 0.11]} fontSize={0.6} color="#fcd34d" anchorX="center" anchorY="middle">
          CAFE & BISTRO
        </Text>
      </group>

      {/* Tables & Chairs */}
      {[-4, 0, 4].map((x, i) => (
        <group key={`cafe-table-${i}`} position={[x, 0, 1]}>
          {/* Table */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
            <primitive object={woodMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.4, 1.2, 16]} />
            <primitive object={counterMaterial} attach="material" />
          </mesh>

          {/* Chairs */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, j) => (
            <group key={`chair-${j}`} position={[Math.cos(angle) * 1.8, 0, Math.sin(angle) * 1.8]} rotation={[0, -angle - Math.PI / 2, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
                <primitive object={chairMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                <primitive object={counterMaterial} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Lighting */}
      <pointLight position={[0, 5, -2]} intensity={1.2} distance={15} color="#fcd34d" />
      <pointLight position={[-4, 3, 1]} intensity={0.5} distance={5} color="#fef3c7" />
      <pointLight position={[4, 3, 1]} intensity={0.5} distance={5} color="#fef3c7" />
    </group>
  );
}
