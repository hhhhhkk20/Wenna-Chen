import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrnamentsProps {
    expansion: number;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ expansion }) => {
    const baubleCount = 300;
    const giftCount = 50;
    
    const baubleRef = useRef<THREE.InstancedMesh>(null);
    const giftRef = useRef<THREE.InstancedMesh>(null);
    
    // Generate static data for positions
    const { baubleData, giftData } = useMemo(() => {
        const bData = [];
        const gData = [];
        
        // Baubles (Spheres)
        for(let i=0; i<baubleCount; i++) {
             const h = Math.random(); // 0 to 1 height
             const maxR = 6.5 * (1.0 - h) + 0.5;
             const r = Math.random() * maxR * 0.9;
             const theta = Math.random() * Math.PI * 2;
             const y = h * 16 - 8;
             
             bData.push({
                 pos: new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
                 color: Math.random() > 0.5 ? new THREE.Color("#ff3333") : new THREE.Color("#daa520"), // Red or Gold
                 scale: Math.random() * 0.3 + 0.2
             });
        }

        // Gifts (Boxes) - placed mostly on lower branches or floor
        for(let i=0; i<giftCount; i++) {
             const r = Math.random() * 6 + 1; 
             const theta = Math.random() * Math.PI * 2;
             // On the floor or lower tree area
             const y = -9 + Math.random() * 5; 
             
             gData.push({
                 pos: new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
                 color: Math.random() > 0.5 ? new THREE.Color("#4169E1") : new THREE.Color("#FF8C00"), // Judy Blue or Nick Orange
                 scale: Math.random() * 0.4 + 0.3
             });
        }
        
        return { baubleData: bData, giftData: gData };
    }, []);

    const tempObj = new THREE.Object3D();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Baubles logic
        if (baubleRef.current) {
            baubleData.forEach((d, i) => {
                const expPos = d.pos.clone();
                // Push out logic
                expPos.x += d.pos.x * expansion * 2.5;
                expPos.z += d.pos.z * expansion * 2.5;
                expPos.y += Math.sin(d.pos.x * 5 + expansion * 5) * expansion * 2;

                tempObj.position.copy(expPos);
                tempObj.scale.setScalar(d.scale);
                // Gentle rotation
                tempObj.rotation.set(0, time * 0.5 + i, 0); 
                
                tempObj.updateMatrix();
                baubleRef.current!.setMatrixAt(i, tempObj.matrix);
                baubleRef.current!.setColorAt(i, d.color);
            });
            baubleRef.current.instanceMatrix.needsUpdate = true;
            if (baubleRef.current.instanceColor) baubleRef.current.instanceColor.needsUpdate = true;
        }

        // Gifts logic
        if (giftRef.current) {
            giftData.forEach((d, i) => {
                 const expPos = d.pos.clone();
                 // Gifts scatter more on floor
                 expPos.x += d.pos.x * expansion * 1.2;
                 expPos.z += d.pos.z * expansion * 1.2;
                 // Float slightly when expanded
                 expPos.y += Math.sin(time + i) * 0.05 + (expansion * Math.sin(i) * 2);

                 tempObj.position.copy(expPos);
                 tempObj.scale.setScalar(d.scale);
                 tempObj.rotation.set(0, d.pos.x + time * 0.2, 0);
                 
                 tempObj.updateMatrix();
                 giftRef.current!.setMatrixAt(i, tempObj.matrix);
                 giftRef.current!.setColorAt(i, d.color);
            });
            giftRef.current.instanceMatrix.needsUpdate = true;
             if (giftRef.current.instanceColor) giftRef.current.instanceColor.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* Baubles */}
            <instancedMesh ref={baubleRef} args={[undefined, undefined, baubleCount]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial roughness={0.1} metalness={0.8} />
            </instancedMesh>
            
            {/* Gifts */}
            <instancedMesh ref={giftRef} args={[undefined, undefined, giftCount]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial roughness={0.4} metalness={0.3} />
            </instancedMesh>
        </group>
    );
};