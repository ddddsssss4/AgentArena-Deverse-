import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface WhiteboardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  title?: string;
}

export default function Whiteboard({ position, rotation = [0, 0, 0], size, title = "Brainstorming Board" }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const textureRef = useRef<THREE.CanvasTexture>(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [color, setColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(8);

  const { controls } = useThree();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'crosshair' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  const clearCanvas = (initial = false) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#e5e7eb'; // light gray
      ctx.lineWidth = 2;
      const gridSize = 32;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      if (initial) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Draw here...', canvas.width / 2, canvas.height / 2);
      }
    }
    if (textureRef.current) textureRef.current.needsUpdate = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1024;
    canvas.height = 512;
    clearCanvas(true);
  }, []);

  const draw = (e: ThreeEvent<PointerEvent>) => {
    if (!isDrawingRef.current) return;
    const uv = e.uv;
    if (!uv) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = uv.x * canvas.width;
    const y = (1 - uv.y) * canvas.height;

    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      if (textureRef.current) textureRef.current.needsUpdate = true;
    }
    lastPos.current = { x, y };
  };

  const tools = [
    { name: 'Black', color: '#111827', width: 8 },
    { name: 'Blue', color: '#2563eb', width: 8 },
    { name: 'Red', color: '#dc2626', width: 8 },
    { name: 'Green', color: '#16a34a', width: 8 },
    { name: 'Eraser', color: 'white', width: 48 },
    { name: 'Clear', color: 'clear', width: 0 },
  ];

  return (
    <group position={position} rotation={rotation}>
      {/* Title */}
      <Text 
        position={[0, size[1] / 2 + 0.15, 0.01]} 
        fontSize={0.2} 
        color="#1f2937" 
        anchorX="center" 
        anchorY="bottom"
      >
        {title}
      </Text>

      {/* Whiteboard Surface */}
      <mesh
        onDoubleClick={(e) => {
          // Let it bubble up to OfficeScene
        }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          setHovered(true); 
          if (controls) (controls as any).enabled = false;
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          setHovered(false); 
          isDrawingRef.current = false; 
          lastPos.current = null; 
          if (controls) (controls as any).enabled = true;
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          isDrawingRef.current = true;
          const uv = e.uv;
          if (uv) {
            lastPos.current = {
              x: uv.x * canvasRef.current.width,
              y: (1 - uv.y) * canvasRef.current.height,
            };
          }
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          isDrawingRef.current = false;
          lastPos.current = null;
        }}
        onPointerMove={(e) => {
          if (isDrawingRef.current) {
            e.stopPropagation();
            draw(e);
          }
        }}
      >
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial roughness={0.2} metalness={0.1}>
          <canvasTexture ref={textureRef} attach="map" image={canvasRef.current} />
        </meshStandardMaterial>
      </mesh>

      {/* Tool Tray */}
      <mesh position={[0, -size[1] / 2 - 0.05, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[size[0] * 0.8, 0.05, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Tools */}
      {tools.map((tool, i) => {
        const isSelected = color === tool.color && tool.name !== 'Clear';
        const spacing = 0.4;
        const startX = -(tools.length - 1) * spacing / 2;
        return (
          <group 
            key={tool.name} 
            position={[startX + i * spacing, -size[1] / 2 - 0.02, 0.1]}
            onClick={(e) => {
              e.stopPropagation();
              if (tool.name === 'Clear') {
                clearCanvas(false);
              } else {
                setColor(tool.color);
                setLineWidth(tool.width);
              }
            }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = hovered ? 'crosshair' : 'auto'; }}
          >
            {/* Marker body or Clear Button */}
            {tool.name === 'Clear' ? (
              <mesh position={[0, 0.02, 0]} castShadow>
                <boxGeometry args={[0.15, 0.04, 0.1]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            ) : (
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
                <meshStandardMaterial color={tool.name === 'Eraser' ? '#d1d5db' : tool.color} />
              </mesh>
            )}
            {/* Selection highlight */}
            {isSelected && (
              <mesh position={[0, 0.04, 0]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#fcd34d" />
              </mesh>
            )}
            <Text position={[0, -0.15, 0]} fontSize={0.08} color="#1f2937" anchorX="center" anchorY="top">
              {tool.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
