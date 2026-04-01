import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

export default function CoffeeMachine({ position, rotation }: any) {
  // 'idle' = cup on the side, empty
  // 'placed' = cup under spout, empty
  // 'filling' = coffee pouring, cup filling
  // 'full' = cup full, ready to take
  const [cupState, setCupState] = useState<'idle' | 'placed' | 'filling' | 'full'>('idle');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const fillLevelRef = useRef<THREE.Mesh>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  const cupGroupRef = useRef<THREE.Group>(null);

  const handleCupClick = (e: any) => {
    e.stopPropagation();
    if (cupState === 'idle') {
      setCupState('placed');
      setTimeout(() => {
        setCupState('filling');
        setTimeout(() => {
          setCupState('full');
        }, 3000); // 3 seconds to fill
      }, 500); // 0.5s pause before pouring
    } else if (cupState === 'full') {
      setCupState('idle');
    }
  };

  useFrame((state) => {
    // Animate cup position
    if (cupGroupRef.current) {
      const targetX = cupState === 'idle' ? 0.8 : 0;
      const targetZ = cupState === 'idle' ? 0.3 : 0.6;
      cupGroupRef.current.position.x = THREE.MathUtils.lerp(cupGroupRef.current.position.x, targetX, 0.1);
      cupGroupRef.current.position.z = THREE.MathUtils.lerp(cupGroupRef.current.position.z, targetZ, 0.1);
    }

    // Animate fill level
    if (fillLevelRef.current) {
      if (cupState === 'filling') {
        fillLevelRef.current.scale.y = THREE.MathUtils.lerp(fillLevelRef.current.scale.y, 1, 0.02);
      } else if (cupState === 'idle') {
        fillLevelRef.current.scale.y = 0.001; // empty
      }
    }

    // Animate stream
    if (streamRef.current) {
      if (cupState === 'filling') {
        streamRef.current.scale.y = 1;
        // Animate texture or just bob it slightly for effect
        streamRef.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 20) * 0.01;
      } else {
        streamRef.current.scale.y = 0.001;
      }
    }
  });

  const machineMaterial = new THREE.MeshStandardMaterial({ color: '#374151', metalness: 0.6, roughness: 0.3 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: '#111827', metalness: 0.8, roughness: 0.2 });
  const silverMaterial = new THREE.MeshStandardMaterial({ color: '#d1d5db', metalness: 0.9, roughness: 0.1 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.9, opacity: 1, roughness: 0.1, transparent: true });
  const coffeeMaterial = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.1 });
  const waterMaterial = new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transmission: 0.8, opacity: 0.8, roughness: 0.1, transparent: true });

  return (
    <group position={position} rotation={rotation}>
      {/* Machine Body */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 0.8]} />
        <primitive object={machineMaterial} attach="material" />
      </mesh>
      
      {/* Front Panel */}
      <mesh position={[0, 0.8, 0.41]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.6, 0.05]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>

      {/* Screen/Display */}
      <mesh position={[0, 0.9, 0.44]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.25, 0.02]} />
        <meshStandardMaterial color={cupState === 'filling' ? '#34d399' : '#1e3a8a'} emissive={cupState === 'filling' ? '#34d399' : '#1e3a8a'} emissiveIntensity={0.5} />
      </mesh>

      {/* Buttons */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.65, 0.44]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <primitive object={silverMaterial} attach="material" />
        </mesh>
      ))}

      {/* Spout Base */}
      <mesh position={[0, 0.45, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>

      {/* Spout Nozzles */}
      <mesh position={[-0.08, 0.38, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <primitive object={silverMaterial} attach="material" />
      </mesh>
      <mesh position={[0.08, 0.38, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <primitive object={silverMaterial} attach="material" />
      </mesh>

      {/* Drip Tray */}
      <mesh position={[0, 0.05, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.1, 0.6]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
      {/* Drip Tray Grid */}
      <mesh position={[0, 0.105, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.01, 0.5]} />
        <primitive object={silverMaterial} attach="material" />
      </mesh>

      {/* Water Tank (Back) */}
      <mesh position={[0, 0.6, -0.45]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.1, 0.2]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Water inside tank */}
      <mesh position={[0, 0.5, -0.45]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.9, 0.15]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>

      {/* Coffee Stream */}
      <mesh ref={streamRef} position={[0, 0.25, 0.6]} scale={[1, 0.001, 1]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <primitive object={coffeeMaterial} attach="material" />
      </mesh>

      {/* Interactive Glass */}
      <group 
        ref={cupGroupRef} 
        position={[0.8, 0.11, 0.3]} 
        onClick={handleCupClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        {/* Glass Body */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.2, 16]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
        
        {/* Coffee Fill Level */}
        <mesh ref={fillLevelRef} position={[0, 0.1, 0]} scale={[1, 0.001, 1]}>
          <cylinderGeometry args={[0.11, 0.085, 0.18, 16]} />
          <primitive object={coffeeMaterial} attach="material" />
        </mesh>

        {/* Tooltip */}
        {cupState === 'idle' && hovered && (
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              Click to brew coffee
            </div>
          </Html>
        )}
        {cupState === 'full' && hovered && (
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              Click to take coffee
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
