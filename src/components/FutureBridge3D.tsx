import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count = 1000 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 12;
      p[i * 3 + 1] = (Math.random() - 0.5) * 14;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#d4af37"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Pulls the camera back on tall, narrow screens (phones) so the rings always fit the width.
const FitCamera = () => {
  const { camera, size } = useThree();
  React.useEffect(() => {
    const aspect = size.width / size.height;
    const needWidth = 6; // world units the core + rings need across
    const halfFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360;
    camera.position.z = Math.max(8, needWidth / (2 * Math.tan(halfFov) * aspect));
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
};

const AbstractCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
      ringRef.current.rotation.x = time * 0.2;
    }
  });

  return (
    <group>
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        {/* Central Crystalline Core */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <MeshDistortMaterial
            color="#d4af37"
            speed={2}
            distort={0.4}
            metalness={1}
            roughness={0.1}
          />
        </mesh>

        {/* Outer Energy Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Second Energy Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.01, 16, 100]} />
          <meshStandardMaterial
            color="#d4af37"
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
};

export const FutureBridge3D = () => {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#d4af37" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
        
        <FitCamera />
        <Suspense fallback={null}>
          <AbstractCore />
          <ParticleField count={3500} />
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};
