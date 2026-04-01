/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { CameraControls, Sky, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import OfficeScene from './components/OfficeScene';
import { MousePointer2, Move, ZoomIn, Coffee, PenTool, MousePointerClick, Headphones } from 'lucide-react';

export default function App() {
  const cameraControlsRef = useRef<any>(null);

  return (
    <div className="w-full h-screen bg-neutral-900 relative font-sans">
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
            The Atelier Workspace
          </h1>
          <p className="text-neutral-300 mt-2 text-lg drop-shadow">
            A modern, collaborative office environment.
          </p>
        </div>
        
        <div className="bg-neutral-900/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 text-white shadow-2xl w-80 pointer-events-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-semibold text-lg">Interactive Controls</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <MousePointerClick className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="font-medium text-emerald-300">Double-Click to Move</p>
                <p className="text-neutral-400 text-xs mt-0.5">Double-click any surface (floor, whiteboard) to instantly zoom there.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <PenTool className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="font-medium text-blue-300">Draw on Whiteboards</p>
                <p className="text-neutral-400 text-xs mt-0.5">Zoom into a meeting room and click & drag on a whiteboard to draw.</p>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 my-3" />

            <div className="flex items-center gap-3 text-neutral-300">
              <MousePointer2 className="w-4 h-4 shrink-0" />
              <span>Left Click + Drag to Rotate</span>
            </div>
            
            <div className="flex items-center gap-3 text-neutral-300">
              <Move className="w-4 h-4 shrink-0" />
              <span>Right Click + Drag to Pan</span>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span>Scroll to Zoom In/Out</span>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <Coffee className="w-4 h-4 shrink-0" />
              <span>Click Coffee Machine to brew</span>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <Headphones className="w-4 h-4 shrink-0" />
              <span>Click Headphones to listen</span>
            </div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [15, 12, 20], fov: 45 }} shadows>
        <color attach="background" args={['#1a1a1a']} />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
          <Environment preset="city" />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[10, 20, 10]}
            intensity={1.5}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <OfficeScene />

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.4}
            scale={40}
            blur={2}
            far={10}
          />
          <CameraControls 
            ref={cameraControlsRef}
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            maxDistance={50}
            minDistance={0.1}
            dollySpeed={1.5}
            smoothTime={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
