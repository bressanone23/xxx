import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode } from '../types';
import { getRandomConePoint, getRandomSpherePoint } from '../utils';

interface FoliageProps {
  mode: TreeMode;
  count?: number;
}

const FoliageShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uMorph; // 0.0 = Scattered, 1.0 = Tree
    
    attribute vec3 aTreePos;
    attribute vec3 aScatterPos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Cubic ease in-out for smoother morph
      float t = uMorph < 0.5 ? 4.0 * uMorph * uMorph * uMorph : 1.0 - pow(-2.0 * uMorph + 2.0, 3.0) / 2.0;

      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Breathing effect (stronger when in tree mode)
      float breath = sin(uTime * 2.0 + aRandom * 10.0) * 0.05;
      pos += normal * breath * t; // Expand outward

      // Add some floating noise in scattered mode
      float floatY = sin(uTime * 0.5 + aRandom * 20.0) * 0.5 * (1.0 - t);
      pos.y += floatY;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (4.0 + aRandom * 3.0) * (20.0 / -mvPosition.z);
      
      // Color variation: Bright Emerald to Gold/Rainbow
      vec3 emerald = vec3(0.0, 0.8, 0.4); // Much brighter green
      vec3 gold = vec3(1.0, 0.9, 0.4);   // Bright gold
      
      // Introduce rainbow noise for festive feel
      vec3 rainbow = 0.6 + 0.4 * cos(uTime + aRandom * 6.28 + vec3(0,2,4));
      
      // Mix base emerald with either Gold or Rainbow based on random factor
      vec3 highlight = mix(gold, rainbow, aRandom * 0.6); 
      
      // Dynamic mixing - more sparkle
      float sparkle = sin(uTime * 3.0 + aRandom * 50.0);
      vColor = mix(emerald, highlight, smoothstep(0.9, 1.0, sparkle));
      
      // Fade out slightly when scattered to reduce chaos visual noise
      vAlpha = 0.8 + 0.2 * t; // More opaque generally
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Soft glow edge
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.2); // Softer falloff
      
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

export const Foliage: React.FC<FoliageProps> = ({ mode, count = 15000 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const { treePositions, scatterPositions, randoms } = useMemo(() => {
    const tPos = new Float32Array(count * 3);
    const sPos = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Shape: Cone
      const treeP = getRandomConePoint(14, 5, 0);
      tPos[i * 3] = treeP.x;
      tPos[i * 3 + 1] = treeP.y;
      tPos[i * 3 + 2] = treeP.z;

      // Scatter Shape: Sphere
      const scatterP = getRandomSpherePoint(25);
      sPos[i * 3] = scatterP.x;
      sPos[i * 3 + 1] = scatterP.y;
      sPos[i * 3 + 2] = scatterP.z;

      rands[i] = Math.random();
    }

    return {
      treePositions: tPos,
      scatterPositions: sPos,
      randoms: rands
    };
  }, [count]);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate uMorph uniform based on React state
      const targetMorph = mode === TreeMode.TREE_SHAPE ? 1.0 : 0.0;
      const currentMorph = shaderRef.current.uniforms.uMorph.value;
      
      // Lerp for smooth transition
      const speed = 1.5;
      shaderRef.current.uniforms.uMorph.value = THREE.MathUtils.lerp(currentMorph, targetMorph, delta * speed);
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
  }), []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three.js even if we override in shader
          count={count}
          array={treePositions} 
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FoliageShaderMaterial.vertexShader}
        fragmentShader={FoliageShaderMaterial.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};