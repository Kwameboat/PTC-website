import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const GlobeModel = ({ color = "#d4af37" }: { color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = time * 0.15;
      wireframeRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Core */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Wireframe Shell */}
        <mesh ref={wireframeRef}>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Atmosphere Glow */}
        <mesh scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      </Float>
    </group>
  );
};

export const Globe3D = ({ color = "#d4af37" }: { color?: string }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={color} />
        <Suspense fallback={<div className="text-gold-primary">Loading 3D...</div>}>
          <GlobeModel color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
};
