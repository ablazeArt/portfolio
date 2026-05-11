import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { portfolioProjects } from "@/app/data/projects";
import { ORBIT_COLORS, ORBIT_RADII, PLANET_SCALE } from "./constants";
import { createOrbit, createStarField } from "./objects";
import {
  createEarthCloudTexture,
  createGlowTexture,
  createLabelTexture,
  createPlanetMaterial,
  createSunTexture,
} from "./textures";
import type { PlanetRuntime, SunRuntime } from "./types";

export type SolarSystemObjects = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  overviewCameraPosition: THREE.Vector3;
  overviewTarget: THREE.Vector3;
  planetRuntimes: PlanetRuntime[];
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  setPlanetPositions: (delta: number) => void;
  stars: THREE.Group;
  sun: SunRuntime;
  systemGroup: THREE.Group;
};

export function getOverviewCameraPosition(width: number) {
  if (width <= 820) {
    return new THREE.Vector3(141.68, -218.6, 364.33);
  }

  return new THREE.Vector3(105, -162, 270);
}

function createRenderer(mount: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  return renderer;
}

function createSun(systemGroup: THREE.Group): SunRuntime {
  const baseColor = new THREE.Color("#ffd86f");
  const activeColor = new THREE.Color("#fff4a6");
  const material = new THREE.MeshBasicMaterial({
    color: baseColor.clone(),
    map: createSunTexture(),
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(10, 64, 64), material);
  systemGroup.add(mesh);

  const glowTexture = createGlowTexture();
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: "#fff12f",
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(52, 52, 1);
  systemGroup.add(glow);

  const outerGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: "#f6ff32",
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  outerGlow.scale.set(92, 92, 1);
  systemGroup.add(outerGlow);

  const hitArea = new THREE.Mesh(
    new THREE.SphereGeometry(12.5, 32, 32),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  systemGroup.add(hitArea);

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createLabelTexture("Sun", "Profile"),
      transparent: true,
      depthTest: false,
    }),
  );
  label.position.set(14, 0, 5);
  label.scale.set(48, 13.75, 1);
  systemGroup.add(label);

  const light = new THREE.PointLight("#ffd27a", 900, 520, 1.35);
  light.position.set(0, 0, 0);

  return {
    activeColor,
    baseColor,
    glow,
    glowMaterial,
    hitArea,
    label,
    light,
    material,
    mesh,
    outerGlow,
  };
}

function addEarthDetails(mesh: THREE.Mesh, planetRadius: number) {
  const cloudLayer = new THREE.Mesh(
    new THREE.SphereGeometry(planetRadius * 1.018, 48, 48),
    new THREE.MeshBasicMaterial({
      map: createEarthCloudTexture(),
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  cloudLayer.renderOrder = 10;
  mesh.add(cloudLayer);

  const atmosphere = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture("92, 208, 255"),
      color: "#7bdcff",
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  atmosphere.scale.set(planetRadius * 4.8, planetRadius * 4.8, 1);
  atmosphere.renderOrder = 12;
  mesh.add(atmosphere);

  return cloudLayer;
}

function createPlanetRuntimes(systemGroup: THREE.Group) {
  return portfolioProjects.map((project, index) => {
    const radius = ORBIT_RADII[index] ?? 210 + index * 26;
    const ellipse = 0.67 + index * 0.014;
    const angle = index * 0.82 + 0.55;
    const orbitColor = ORBIT_COLORS[index] ?? project.visual.orbitColor;
    const planetRadius = PLANET_SCALE[index] ?? 3.4;
    const baseColor = new THREE.Color(project.visual.color);
    const activeColor = baseColor.clone().offsetHSL(0, 0.14, 0.16);

    systemGroup.add(createOrbit(radius, ellipse, orbitColor));

    const material = createPlanetMaterial(project);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(planetRadius, 48, 48), material);
    mesh.userData.slug = project.slug;
    systemGroup.add(mesh);

    const cloudLayer = project.codename === "Earth"
      ? addEarthDetails(mesh, planetRadius)
      : undefined;

    const light = new THREE.PointLight(
      project.visual.color,
      0,
      Math.max(planetRadius * 16, 42),
      2.2,
    );
    systemGroup.add(light);

    const hitArea = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(planetRadius * 1.8, 5), 24, 24),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    hitArea.userData.slug = project.slug;
    systemGroup.add(hitArea);

    if (project.visual.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planetRadius * 1.35, planetRadius * 1.95, 96),
        new THREE.MeshBasicMaterial({
          color: "#e7d882",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.66,
        }),
      );
      ring.rotation.x = THREE.MathUtils.degToRad(78);
      mesh.add(ring);
    }

    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createLabelTexture(project.codename, `#${project.name}`),
        transparent: true,
        depthTest: false,
      }),
    );
    label.scale.set(Math.max(project.codename.length * 8.8, 68), 19.5, 1);
    systemGroup.add(label);

    return {
      activeColor,
      angle,
      baseColor,
      cloudLayer,
      ellipse,
      hitArea,
      label,
      light,
      material,
      mesh,
      project,
      radius,
      speed: 0.000035 / (index + 1),
    } satisfies PlanetRuntime;
  });
}

export function createSolarSystemObjects(mount: HTMLDivElement): SolarSystemObjects {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#000104");
  scene.fog = new THREE.FogExp2("#000104", 0.0018);

  const camera = new THREE.PerspectiveCamera(
    46,
    mount.clientWidth / mount.clientHeight,
    0.1,
    1800,
  );
  const overviewCameraPosition = getOverviewCameraPosition(mount.clientWidth);
  camera.position.copy(overviewCameraPosition);

  const renderer = createRenderer(mount);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enabled = false;
  controls.minDistance = 45;
  controls.maxDistance = 540;
  controls.target.set(0, 0, 0);
  controls.autoRotate = false;
  const overviewTarget = controls.target.clone();

  scene.add(new THREE.AmbientLight("#64708e", 0.42));

  const systemGroup = new THREE.Group();
  systemGroup.rotation.x = THREE.MathUtils.degToRad(70);
  systemGroup.rotation.z = THREE.MathUtils.degToRad(-18);
  scene.add(systemGroup);

  const stars = createStarField();
  scene.add(stars);

  const sun = createSun(systemGroup);
  scene.add(sun.light);

  const planetRuntimes = createPlanetRuntimes(systemGroup);

  function setPlanetPositions(delta: number) {
    planetRuntimes.forEach((runtime) => {
      runtime.angle += runtime.speed * delta;
      const x = Math.cos(runtime.angle) * runtime.radius;
      const z = Math.sin(runtime.angle) * runtime.radius * runtime.ellipse;
      runtime.mesh.position.set(x, 0, z);
      runtime.hitArea.position.set(x, 0, z);
      runtime.light.position.set(x, 0, z);
      runtime.mesh.rotation.y += 0.008;
      runtime.cloudLayer?.rotateY(0.004);
      runtime.label.position.set(x + 8, 0, z + 4);
    });
  }

  setPlanetPositions(0);
  systemGroup.updateMatrixWorld(true);

  return {
    camera,
    controls,
    overviewCameraPosition,
    overviewTarget,
    planetRuntimes,
    renderer,
    scene,
    setPlanetPositions,
    stars,
    sun,
    systemGroup,
  };
}
