import { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import Cabin from './Cabin';
import Cafeteria from './Cafeteria';
import SelfiePoint from './SelfiePoint';
import DeskGroup from './DeskGroup';
import Decor from './Decor';
import Reception from './Reception';
import MusicStation from './MusicStation';

export default function OfficeScene() {
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.8, metalness: 0.1 }), []);
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.9, metalness: 0.0 }), []);
  const artFrameMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 }), []);
  const artCanvasMaterial1 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.5 }), []);
  const artCanvasMaterial2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.5 }), []);
  const artCanvasMaterial3 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.5 }), []);

  const { controls, camera } = useThree();

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    if (controls && (controls as any).setLookAt) {
      const target = e.point;
      
      // Calculate a position slightly back and up from the clicked point
      // to give a good viewing angle
      const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
      
      // If clicking on a wall/whiteboard (y > 0.5), we want to stand in front of it
      // If clicking on the floor (y < 0.5), we want to look down at it from a bit higher
      const distance = target.y > 0.5 ? 4 : 8;
      const heightOffset = target.y > 0.5 ? 0 : 3;
      
      const newCamPos = new THREE.Vector3(
        target.x + direction.x * distance,
        Math.max(1.5, target.y + heightOffset), // Keep camera at least at eye level
        target.z + direction.z * distance
      );

      (controls as any).setLookAt(
        newCamPos.x, newCamPos.y, newCamPos.z,
        target.x, target.y, target.z,
        true // animate
      );
    }
  };

  return (
    <group onDoubleClick={handleDoubleClick}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Outer Walls */}
      <group>
        {/* Back Wall */}
        <mesh receiveShadow castShadow position={[0, 3, -20]}>
          <boxGeometry args={[40, 6, 0.5]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
        {/* Left Wall */}
        <mesh receiveShadow castShadow position={[-20, 3, 0]}>
          <boxGeometry args={[0.5, 6, 40]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
        {/* Right Wall */}
        <mesh receiveShadow castShadow position={[20, 3, 0]}>
          <boxGeometry args={[0.5, 6, 40]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      </group>

      {/* Artwork on Left Wall */}
      <group position={[-19.7, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow position={[-4, 0, 0]}>
          <boxGeometry args={[2, 3, 0.1]} />
          <primitive object={artFrameMaterial} attach="material" />
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.8, 2.8]} />
            <primitive object={artCanvasMaterial1} attach="material" />
          </mesh>
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[2, 3, 0.1]} />
          <primitive object={artFrameMaterial} attach="material" />
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.8, 2.8]} />
            <primitive object={artCanvasMaterial2} attach="material" />
          </mesh>
        </mesh>
        <mesh castShadow receiveShadow position={[4, 0, 0]}>
          <boxGeometry args={[2, 3, 0.1]} />
          <primitive object={artFrameMaterial} attach="material" />
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.8, 2.8]} />
            <primitive object={artCanvasMaterial3} attach="material" />
          </mesh>
        </mesh>
      </group>

      {/* Reception */}
      <Reception position={[0, 0, 15]} rotation={[0, Math.PI, 0]} />

      {/* Cabins (Meeting Rooms) */}
      <Cabin position={[-14, 0, -14]} rotation={[0, 0, 0]} size={[10, 5, 10]} name="Conference A" color="#3b82f6" />
      <Cabin position={[-2, 0, -14]} rotation={[0, 0, 0]} size={[8, 5, 10]} name="Huddle 1" color="#10b981" />
      <Cabin position={[8, 0, -14]} rotation={[0, 0, 0]} size={[8, 5, 10]} name="Huddle 2" color="#f59e0b" />

      {/* Cafeteria */}
      <Cafeteria position={[12, 0, 10]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Selfie Point */}
      <SelfiePoint position={[-15, 0, 15]} rotation={[0, Math.PI / 4, 0]} />

      {/* Music Station */}
      <MusicStation position={[-15, 0, 5]} rotation={[0, Math.PI / 2, 0]} />

      {/* Open Workspace */}
      <DeskGroup position={[-10, 0, 0]} rotation={[0, 0, 0]} />
      <DeskGroup position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <DeskGroup position={[-10, 0, 8]} rotation={[0, 0, 0]} />
      <DeskGroup position={[0, 0, 8]} rotation={[0, 0, 0]} />

      {/* Decor & Plants */}
      <Decor />
    </group>
  );
}
