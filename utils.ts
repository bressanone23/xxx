import * as THREE from 'three';

// Random point inside a sphere of radius R
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Random point within a Cone volume (approximate for tree shape)
export const getRandomConePoint = (height: number, radiusBase: number, yOffset: number = 0): THREE.Vector3 => {
  const h = height;
  // Normalized height (0 to 1)
  const yNorm = Math.random(); 
  // Radius at this height (linear taper)
  const rAtHeight = (1 - yNorm) * radiusBase;
  
  const angle = Math.random() * Math.PI * 2;
  // Distribute points more towards surface but fill volume too
  const r = Math.sqrt(Math.random()) * rAtHeight; 
  
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  const y = (yNorm * h) - (h / 2) + yOffset;

  return new THREE.Vector3(x, y, z);
};
