import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeParticlesProps {
  expansion: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uExpansion;
  
  attribute float aSize;
  attribute float aRandom;
  attribute vec3 aColor;
  attribute float aSpeed;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    
    // Base position
    vec3 pos = position;
    
    // Dynamic movement: Spiral effect based on height (y)
    float angle = uTime * 0.2 * aSpeed + (pos.y * 0.5);
    
    // Expansion logic
    // When uExpansion goes up, particles move outward from center (x, z)
    // and slightly chaotic
    vec3 expandedPos = pos + normalize(vec3(pos.x, 0.0, pos.z)) * (uExpansion * 5.0);
    expandedPos.y += sin(uTime * aRandom + pos.x) * uExpansion * 2.0;
    
    // Twinkle effect on size
    float twinkle = 0.8 + 0.4 * sin(uTime * 3.0 + aRandom * 10.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(expandedPos, 1.0);
    
    gl_PointSize = aSize * twinkle * (300.0 / -mvPosition.z); // Perspective sizing
    gl_Position = projectionMatrix * mvPosition;
    
    // Fade alpha based on expansion (outer particles fade slightly)
    vAlpha = 1.0 - (uExpansion * 0.3);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    
    // Soft glow gradient
    float strength = (0.5 - ll) * 2.0;
    strength = pow(strength, 2.0);
    
    gl_FragColor = vec4(vColor, vAlpha * strength);
  }
`;

export const TreeParticles: React.FC<TreeParticlesProps> = ({ expansion }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const particleCount = 45000;
  
  const { positions, colors, sizes, randoms, speeds } = useMemo(() => {
    const p = new Float32Array(particleCount * 3);
    const c = new Float32Array(particleCount * 3);
    const s = new Float32Array(particleCount);
    const r = new Float32Array(particleCount);
    const sp = new Float32Array(particleCount);

    // Zootopia Theme Colors
    const colorPine = new THREE.Color("#0f3d0f"); // Deep pine
    const colorGreen = new THREE.Color("#2ecc71"); // Bright green
    const colorGold = new THREE.Color("#f1c40f"); // Gold ornaments
    const colorRed = new THREE.Color("#e74c3c"); // Red ornaments
    const colorWhite = new THREE.Color("#ffffff"); // Lights/Snow
    const colorNick = new THREE.Color("#FF8C00"); // Nick Wilde Orange
    const colorJudy = new THREE.Color("#4169E1"); // Judy Hopps Blue

    for (let i = 0; i < particleCount; i++) {
      // Tree Shape Generation (Cone/Spiral)
      const h = Math.random(); 
      // Radius decreases as height increases
      const maxRadius = 8.0 * (1.0 - h) + 0.5; 
      
      const theta = Math.random() * Math.PI * 2 * 25.0; 
      const radius = Math.random() * maxRadius;
      
      let x = radius * Math.cos(theta);
      let y = (h * 18.0) - 9.0; // Center vertically
      let z = radius * Math.sin(theta);
      
      // Add randomness to volume
      x += (Math.random() - 0.5) * 0.5;
      z += (Math.random() - 0.5) * 0.5;

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;

      // Color assignment logic
      const rand = Math.random();
      let col = new THREE.Color();
      let size = 0.0;
      
      if (rand > 0.96) { col = colorGold; size = 4.0; } 
      else if (rand > 0.92) { col = colorRed; size = 4.0; }
      else if (rand > 0.89) { col = colorNick; size = 3.5; } // Nick highlight
      else if (rand > 0.86) { col = colorJudy; size = 3.5; } // Judy highlight
      else if (rand > 0.80) { col = colorWhite; size = 2.5; } // Lights
      else { 
        col = Math.random() > 0.5 ? colorPine : colorGreen; 
        size = 1.5; 
      }

      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;

      s[i] = size;
      r[i] = Math.random();
      sp[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions: p, colors: c, sizes: s, randoms: r, speeds: sp };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uExpansion.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uExpansion.value,
        expansion,
        0.1
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={particleCount}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={particleCount}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uExpansion: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};