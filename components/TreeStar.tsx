import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TreeStar = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.rotation.y = t * 0.5;
      ref.current.rotation.z = Math.sin(t * 1.5) * 0.1;
      const scale = 1 + Math.sin(t * 3) * 0.1;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 9.2, 0]} ref={ref}>
      {/* Central light source */}
      <pointLight intensity={3} distance={15} decay={2} color="#ffd700" />
      
      {/* The Star Shape */}
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
            color="#ffd700" 
            emissive="#ffaa00" 
            emissiveIntensity={3} 
            toneMapped={false}
        />
      </mesh>

      {/* Radiant Rays */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} rotation={[0, 0, (Math.PI / 2) * i]}>
           <cylinderGeometry args={[0.02, 0.02, 3.5]} />
           <meshBasicMaterial color="#ffffaa" transparent opacity={0.6} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map(i => (
        <mesh key={`inner-${i}`} rotation={[0, 0, (Math.PI / 2) * i + Math.PI/4]} scale={[0.6, 0.6, 0.6]}>
           <cylinderGeometry args={[0.02, 0.02, 3]} />
           <meshBasicMaterial color="#ffdd88" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};