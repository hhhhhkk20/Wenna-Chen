import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SnowSystem: React.FC = () => {
  const count = 1000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = new THREE.Object3D();
  const particles = useRef(new Array(count).fill(0).map(() => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      Math.random() * 20 + 5,
      (Math.random() - 0.5) * 30
    ),
    velocity: Math.random() * 0.05 + 0.02,
    wobble: Math.random() * Math.PI * 2
  })));

  useFrame(() => {
    if (!mesh.current) return;

    particles.current.forEach((particle, i) => {
      particle.position.y -= particle.velocity;
      particle.position.x += Math.sin(particle.wobble + particle.position.y) * 0.01;
      
      // Reset if below floor
      if (particle.position.y < -10) {
        particle.position.y = 15;
        particle.position.x = (Math.random() - 0.5) * 30;
        particle.position.z = (Math.random() - 0.5) * 30;
      }

      dummy.position.copy(particle.position);
      dummy.scale.setScalar(0.05); // Tiny snowflakes
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} /> {/* Diamond shape */}
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#aaaaff" 
        emissiveIntensity={0.5}
        roughness={0}
      />
    </instancedMesh>
  );
};
