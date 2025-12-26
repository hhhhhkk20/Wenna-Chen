export interface PhotoData {
  id: string;
  url: string;
  caption: string;
}

export interface TreeState {
  expansion: number; // 0 to 1 (0 = tight tree, 1 = exploded/open)
  rotationSpeed: number;
  isGestureMode: boolean;
}

export enum ParticleType {
  NEEDLE = 0,
  ORNAMENT = 1,
  SNOW = 2,
  MAGIC = 3
}
