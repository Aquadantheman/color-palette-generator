export type RGB = [number, number, number];

export interface Swatch {
  rgb: RGB;
  hex: string;
}

export interface Analysis {
  score: number;
  label: string;
  description: string;
  bridgeColors: Swatch[];
}

