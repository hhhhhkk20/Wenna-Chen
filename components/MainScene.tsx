import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { PhotoCard } from './PhotoCard';
import { SnowSystem } from './SnowSystem';
import { TreeStar } from './TreeStar';
import { Ornaments } from './Ornaments';
import { PhotoData } from '../types';

interface MainSceneProps {
  photos: PhotoData[];
  expansion: number;
  autoRotate: boolean;
}

const MovingCamera = ({ autoRotate }: { autoRotate: boolean }) => {
  useFrame((state) => {
    if (autoRotate) {
      const t = state.clock.getElapsedTime();
      state.camera.position.x = Math.sin(t * 0.2) * 20;
      state.camera.position.z = Math.cos(t * 0.2) * 20;
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
};

export const MainScene: React.FC<MainSceneProps> = ({ photos, expansion, autoRotate }) => {
  return (
    <Canvas
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 10, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={2} color="#ffaa00" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#0055ff" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#ff0000" />
      
      {/* The Tree & Ornaments */}
      <group position={[0, -2, 0]}>
        <TreeParticles expansion={expansion} />
        <Ornaments expansion={expansion} />
        <TreeStar />
        
        {/* Photos arranged in a spiral */}
        {photos.map((photo, index) => {
          // Golden Ratio spiral placement
          const t = index / photos.length;
          const angle = t * Math.PI * 2 * 3; // 3 full turns
          const radius = 6 * (1 - t) + 2; 
          const y = t * 14 - 5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
             <PhotoCard 
                key={photo.id}
                photo={photo} 
                position={[x, y, z]} 
                rotation={[0, -angle, 0]}
                expansion={expansion}
             />
          );
        })}
      </group>

      <SnowSystem />

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        maxDistance={40}
        minDistance={5}
        autoRotate={false} 
      />
      
      {/* Auto Rotate override */}
      <MovingCamera autoRotate={autoRotate} />

      {/* Floor Reflection Hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
            color="#050505" 
            roughness={0.1} 
            metalness={0.8} 
        />
      </mesh>
    </Canvas>
  );
};