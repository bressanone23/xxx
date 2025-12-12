import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { TreeMode } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';

interface SceneProps {
  mode: TreeMode;
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  return (
    <Canvas 
      dpr={[1, 2]} 
      gl={{ antialias: false, toneMappingExposure: 1.1 }}
      className="w-full h-full"
    >
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={45} />
      
      {/* Lighting - Balanced for flat colors */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <hemisphereLight intensity={0.8} groundColor="#444444" color="#ffffff" />
      
      <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ffffff" />
      
      <spotLight 
        position={[0, 25, 5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={3} 
        distance={50}
        castShadow 
        color="#fff"
      />

      {/* Reflections */}
      <Environment preset="city" background={false} />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      
      {/* Magical Floating Dust/Snow */}
      <Sparkles count={300} scale={25} size={6} speed={0.4} opacity={0.8} color="#ffffaa" />

      {/* Main Content */}
      <group position={[0, -2, 0]}>
         <Foliage mode={mode} />
         <Ornaments mode={mode} />
      </group>

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        autoRotate={mode === TreeMode.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        {/* Glow - Significantly reduced for "Normal Color" look */}
        <Bloom 
          luminanceThreshold={0.85} 
          mipmapBlur 
          intensity={0.3} 
          radius={0.4}
        />
        {/* Film Grain for texture */}
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
        {/* Cinematic Vignette */}
        <Vignette offset={0.3} darkness={0.4} eskil={false} />
      </EffectComposer>
    </Canvas>
  );
};
