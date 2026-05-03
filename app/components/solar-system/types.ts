import type * as THREE from "three";
import type { PortfolioProject } from "@/app/data/projects";

export type PlanetRuntime = {
  project: PortfolioProject;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  baseColor: THREE.Color;
  activeColor: THREE.Color;
  hitArea: THREE.Mesh;
  light: THREE.PointLight;
  label: THREE.Sprite;
  radius: number;
  ellipse: number;
  speed: number;
  angle: number;
};

export type CameraReadout = {
  camera: [number, number, number];
  target: [number, number, number];
  systemRotation: [number, number, number];
  distance: number;
};

export type HoverTarget =
  | {
      type: "planet";
      runtime: PlanetRuntime;
    }
  | {
      type: "sun";
    }
  | null;

export type TapCandidate = {
  target: HoverTarget;
  x: number;
  y: number;
  time: number;
  pointerType: string;
} | null;
