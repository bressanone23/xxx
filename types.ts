import * as THREE from 'three';

export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  tree: THREE.Vector3;
  scatter: THREE.Vector3;
}

export interface OrnamentData {
  id: number;
  type: 'ball' | 'gift' | 'star';
  positionData: DualPosition;
  scale: number;
  color: string;
  speed: number; // For animation variance
  phase: number; // For animation offset
}
