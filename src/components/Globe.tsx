import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GlobeModel = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[2.2, 64, 64]} />
          <meshStandardMaterial
            color="#d4af37"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Glow effect */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color="#d4af37"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      </Float>
    </group>
  );
};

export const HeroGlobe = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
        <GlobeModel />
      </Canvas>
    </div>
  );
};
