import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, Image as DreiImage } from '@react-three/drei';
import * as THREE from 'three';
import { PhotoData } from '../types';

interface PhotoCardProps {
  photo: PhotoData;
  position: [number, number, number];
  rotation: [number, number, number];
  expansion: number;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, position, rotation, expansion }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Original position vector
  const originalPos = new THREE.Vector3(...position);
  // Exploded position (push out from center)
  const explodedPos = originalPos.clone().multiplyScalar(1.5 + Math.random() * 0.5);

  useFrame((state) => {
    if (groupRef.current) {
      // Lerp position based on expansion
      const targetPos = originalPos.clone().lerp(explodedPos, expansion);
      groupRef.current.position.lerp(targetPos, 0.1);

      // Float effect
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y += Math.sin(t * 2 + originalPos.x) * 0.005;

      // Look at camera if hovered, otherwise slow rotate
      if (hovered) {
        groupRef.current.lookAt(state.camera.position);
      } else {
        groupRef.current.rotation.y += 0.005;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Polaroid Frame */}
      <mesh>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* The Image - Front */}
      <DreiImage
        url={photo.url}
        position={[0, 0.15, 0.03]}
        scale={[1, 1]}
        transparent
      />
      
      {/* The Image - Back (Mirrored for double sided effect) */}
      <DreiImage
        url={photo.url}
        position={[0, 0.15, -0.03]}
        rotation={[0, Math.PI, 0]}
        scale={[1, 1]}
        transparent
      />

      {/* Caption Text */}
      <Text
        position={[0, -0.55, 0.03]}
        fontSize={0.1}
        color="#222"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff" // Standard Google Font URL for convenience or fallback
      >
        {photo.caption}
      </Text>
      
      {/* Glow Backlight */}
      <pointLight distance={2} intensity={hovered ? 2 : 0} color="#ffaa00" />
    </group>
  );
};
