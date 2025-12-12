import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, OrnamentData } from '../types';
import { getRandomConePoint, getRandomSpherePoint } from '../utils';

interface OrnamentsProps {
  mode: TreeMode;
}

// Data for the branded spheres - Standard Brand Colors
const FIRMS = [
  { name: 'Goldman\nSachs', color: '#7399C6' },     // GS Blue (Lighter for visibility)
  { name: 'Morgan\nStanley', color: '#333333' },    // Grey/Black
  { name: 'Citadel', color: '#003399' },            // Citadel Blue
  { name: 'Millennium', color: '#228B22' },         // Green
  { name: 'J.P.\nMorgan', color: '#554035' },      // Brown
  { name: 'BlackRock', color: '#222222' },          // Black
  { name: 'Bridgewater', color: '#800020' },        // Burgundy
  { name: 'Two Sigma', color: '#FF7F50' },          // Coral
  { name: 'D.E. Shaw', color: '#C71585' },          // Violet Red
  { name: 'Point72', color: '#008B8B' },            // Teal
  { name: 'Jane\nStreet', color: '#32CD32' },       // Lime Green
  { name: 'Susquehanna', color: '#FFD700' },        // Gold
];

// Vibrant colors for the gifts
const GIFT_COLORS = [
  '#FF0055', // Hot Pink
  '#00FFCC', // Cyan
  '#9D00FF', // Purple
  '#FF5500', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Lime
  '#0099FF', // Sky Blue
];

const TEMP_OBJ = new THREE.Object3D();
const TEMP_VEC = new THREE.Vector3();
const TEMP_COLOR = new THREE.Color();

// Helper to generate a texture with the logo/text
const useLogoTexture = (name: string, color: string) => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256; // 2:1 for sphere mapping
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background - Solid Color (No Gradient/Gloss)
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, 256);

      // Border/Band
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 100, 512, 56);

      // Text
      ctx.font = 'bold 48px "Cinzel", serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const lines = name.split('\n');
      const lineHeight = 55;
      const startY = 128 - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, 256, startY + i * lineHeight);
      });
      
      // Gold trim (Simple line)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 492, 236);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [name, color]);
};

// Component for a single Logo Ball
const LogoBall: React.FC<{ data: OrnamentData; mode: TreeMode; firmName: string; firmColor: string }> = ({ data, mode, firmName, firmColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLogoTexture(firmName, firmColor);
  const currentPos = useRef(data.positionData.scatter.clone());
  
  // Random rotation speed
  const rotSpeed = useRef({ x: Math.random() * 0.5, y: Math.random() * 0.5 });

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const isTree = mode === TreeMode.TREE_SHAPE;
    const target = isTree ? data.positionData.tree : data.positionData.scatter;
    const time = state.clock.elapsedTime;
    
    // Lerp Position
    const speed = isTree ? 2.0 : 0.8;
    TEMP_VEC.copy(target);
    
    // Add hover
    if (isTree) {
      TEMP_VEC.y += Math.sin(time * 2 + data.phase) * 0.05;
    } else {
      TEMP_VEC.y += Math.sin(time * 0.5 + data.phase) * 0.5;
    }
    
    currentPos.current.lerp(TEMP_VEC, delta * speed * data.speed);
    meshRef.current.position.copy(currentPos.current);

    // Rotation
    // When in tree mode, slowly rotate to show off logo
    if (isTree) {
      // Face outward + spin slowly
      const angle = Math.atan2(currentPos.current.x, currentPos.current.z);
      meshRef.current.rotation.y = angle + time * 0.5;
      meshRef.current.rotation.x = Math.sin(time) * 0.1;
      meshRef.current.rotation.z = 0;
    } else {
      // Tumble when scattered
      meshRef.current.rotation.x += rotSpeed.current.x * delta;
      meshRef.current.rotation.y += rotSpeed.current.y * delta;
    }
  });

  return (
    <mesh ref={meshRef} scale={data.scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 32]} />
      {/* Matte material, normal colors, no extra shine */}
      <meshStandardMaterial 
        map={texture} 
        roughness={0.7} 
        metalness={0.1} 
        envMapIntensity={0.5}
      />
    </mesh>
  );
};

export const Ornaments: React.FC<OrnamentsProps> = ({ mode }) => {
  const giftRef = useRef<THREE.InstancedMesh>(null);

  // Generate Data for Logo Balls and Gifts
  const { logoBalls, gifts } = useMemo(() => {
    const _logoBalls: (OrnamentData & { firmName: string; firmColor: string })[] = [];
    const _gifts: OrnamentData[] = [];

    // Create Logo Balls (2 per firm)
    FIRMS.forEach((firm, index) => {
      // 2 instances for better coverage
      for (let i = 0; i < 2; i++) {
        const scale = 0.7; // Large spheres
        const treePos = getRandomConePoint(13, 4.2, 0);
        
        // Push outward to surface
        const dist = Math.sqrt(treePos.x**2 + treePos.z**2);
        if (dist > 0.1) {
          treePos.x *= 1.2;
          treePos.z *= 1.2;
        }

        _logoBalls.push({
          id: index * 2 + i,
          type: 'ball',
          scale,
          color: firm.color,
          firmName: firm.name,
          firmColor: firm.color,
          positionData: {
            tree: treePos,
            scatter: getRandomSpherePoint(22),
          },
          speed: 0.8 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
    });

    // Create Colorful Gifts
    const GIFT_COUNT = 80;
    for (let i = 0; i < GIFT_COUNT; i++) {
      const scale = 0.3 + Math.random() * 0.3;
      const treePos = getRandomConePoint(12, 3.5, -1);
      
      const color = GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)];

      _gifts.push({
        id: i + 1000,
        type: 'gift',
        scale,
        color: color,
        positionData: {
          tree: treePos,
          scatter: getRandomSpherePoint(18),
        },
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return { logoBalls: _logoBalls, gifts: _gifts };
  }, []);

  const currentPositionsGifts = useRef(gifts.map(g => g.positionData.scatter.clone()));

  useFrame((state, delta) => {
    const isTree = mode === TreeMode.TREE_SHAPE;
    const time = state.clock.elapsedTime;

    // Animate Gifts (Instanced)
    if (giftRef.current) {
      gifts.forEach((gift, i) => {
        const target = isTree ? gift.positionData.tree : gift.positionData.scatter;
        const current = currentPositionsGifts.current[i];
        
        const speed = isTree ? 1.5 : 0.5;

        // Rotation logic
        if (!isTree) {
           TEMP_OBJ.rotation.set(time + gift.phase, time * 0.5, gift.phase);
        } else {
           TEMP_OBJ.rotation.set(0, gift.phase + time * 0.2, 0);
        }

        current.lerp(target, delta * speed * gift.speed);
        
        // Hover
        if (isTree) current.y += Math.sin(time * 3 + gift.phase) * 0.02;

        TEMP_OBJ.position.copy(current);
        TEMP_OBJ.scale.setScalar(gift.scale);
        TEMP_OBJ.updateMatrix();
        
        giftRef.current!.setColorAt(i, TEMP_COLOR.set(gift.color));
        giftRef.current!.setMatrixAt(i, TEMP_OBJ.matrix);
      });
      giftRef.current.instanceMatrix.needsUpdate = true;
      if (giftRef.current.instanceColor) giftRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Individual Logo Balls */}
      {logoBalls.map((b) => (
        <LogoBall 
          key={b.id} 
          data={b} 
          mode={mode} 
          firmName={b.firmName}
          firmColor={b.firmColor}
        />
      ))}

      {/* Instanced Colorful Gifts - Matte Finish */}
      <instancedMesh ref={giftRef} args={[undefined, undefined, gifts.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          metalness={0.1} 
          roughness={0.8}
          envMapIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
};
