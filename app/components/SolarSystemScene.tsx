"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ProfilePanel } from "@/app/components/ProfilePanel";
import { ProjectPanel } from "@/app/components/ProjectPanel";
import { portfolioProjects, type PortfolioProject } from "@/app/data/projects";

type PlanetRuntime = {
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

type CameraReadout = {
  camera: [number, number, number];
  target: [number, number, number];
  systemRotation: [number, number, number];
  distance: number;
};

type HoverTarget =
  | {
      type: "planet";
      runtime: PlanetRuntime;
    }
  | {
      type: "sun";
    }
  | null;

type TapCandidate = {
  target: HoverTarget;
  x: number;
  y: number;
  time: number;
  pointerType: string;
} | null;

const PLANET_SCALE = [2.4, 3.2, 3.4, 2.9, 5.4, 4.8, 4.1];
const ORBIT_RADII = [28, 44, 62, 82, 112, 148, 188];
const FOCUS_CAMERA_LERP = 0.035;
const FOCUS_TARGET_LERP = 0.035;
const ORBIT_COLORS = [
  "#d7815e",
  "#f0b46e",
  "#56d7f3",
  "#cc6f59",
  "#d8bc71",
  "#d8cb73",
  "#6f8cff",
];

function drawNoise(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha = 0.12,
) {
  const image = context.getImageData(0, 0, width, height);

  for (let index = 0; index < image.data.length; index += 4) {
    const value = (Math.random() - 0.5) * 255;
    image.data[index] = Math.max(0, Math.min(255, image.data[index] + value));
    image.data[index + 1] = Math.max(
      0,
      Math.min(255, image.data[index + 1] + value),
    );
    image.data[index + 2] = Math.max(
      0,
      Math.min(255, image.data[index + 2] + value),
    );
    image.data[index + 3] = Math.round(255 * alpha);
  }

  context.globalAlpha = alpha;
  context.putImageData(image, 0, 0);
  context.globalAlpha = 1;
}

function blob(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  rotation = 0,
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(radiusX, radiusY);
  context.beginPath();
  context.arc(0, 0, 1, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function createPlanetTexture(project: PortfolioProject) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create planet canvas context");
  }

  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, project.visual.color);
  gradient.addColorStop(0.55, "#171923");
  gradient.addColorStop(1, "#03040a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  switch (project.codename) {
    case "Mercury": {
      context.fillStyle = "#8d765b";
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 110; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          8 + Math.random() * 34,
          5 + Math.random() * 22,
          Math.random() > 0.5
            ? "rgba(44, 35, 29, 0.26)"
            : "rgba(221, 191, 147, 0.18)",
        );
      }
      drawNoise(context, width, height, 0.18);
      break;
    }
    case "Venus": {
      const venusGradient = context.createLinearGradient(0, 0, width, 0);
      venusGradient.addColorStop(0, "#ff884f");
      venusGradient.addColorStop(0.45, "#ffd07b");
      venusGradient.addColorStop(1, "#a84c2f");
      context.fillStyle = venusGradient;
      context.fillRect(0, 0, width, height);
      for (let y = 40; y < height; y += 54) {
        context.beginPath();
        context.moveTo(0, y);
        for (let x = 0; x <= width; x += 64) {
          context.lineTo(x, y + Math.sin(x * 0.018 + y * 0.04) * 18);
        }
        context.strokeStyle = "rgba(255, 230, 154, 0.28)";
        context.lineWidth = 18;
        context.stroke();
      }
      drawNoise(context, width, height, 0.12);
      break;
    }
    case "Earth": {
      context.fillStyle = "#155f96";
      context.fillRect(0, 0, width, height);
      const landColors = ["#2f8f62", "#5fa35f", "#b6a36a", "#256f4d"];
      for (let index = 0; index < 30; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          46 + Math.random() * 130,
          22 + Math.random() * 72,
          landColors[index % landColors.length],
          Math.random() * Math.PI,
        );
      }
      for (let index = 0; index < 42; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          80 + Math.random() * 180,
          5 + Math.random() * 14,
          "rgba(255, 255, 255, 0.38)",
          Math.random() * Math.PI,
        );
      }
      break;
    }
    case "Mars": {
      context.fillStyle = "#b9573d";
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 70; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          18 + Math.random() * 76,
          8 + Math.random() * 28,
          Math.random() > 0.55
            ? "rgba(72, 31, 25, 0.34)"
            : "rgba(238, 151, 91, 0.26)",
          Math.random() * Math.PI,
        );
      }
      context.fillStyle = "rgba(255, 230, 190, 0.72)";
      context.fillRect(0, 0, width, 34);
      context.fillRect(0, height - 28, width, 28);
      drawNoise(context, width, height, 0.16);
      break;
    }
    case "Jupiter": {
      const bands = ["#7f5638", "#d7b16e", "#f0d6a3", "#8e6042", "#c58c56"];
      for (let y = 0; y < height; y += 34) {
        context.fillStyle = bands[Math.floor(y / 34) % bands.length];
        context.fillRect(0, y, width, 34 + Math.sin(y) * 8);
      }
      blob(
        context,
        width * 0.68,
        height * 0.58,
        92,
        38,
        "rgba(166, 69, 42, 0.72)",
        -0.1,
      );
      drawNoise(context, width, height, 0.1);
      break;
    }
    case "Saturn": {
      const saturnBands = ["#d9c783", "#88754e", "#f1dfa5", "#b2a06a"];
      for (let y = 0; y < height; y += 42) {
        context.fillStyle =
          saturnBands[Math.floor(y / 42) % saturnBands.length];
        context.fillRect(0, y, width, 42);
      }
      drawNoise(context, width, height, 0.08);
      break;
    }
    case "Neptune": {
      context.fillStyle = "#243db8";
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 22; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          100 + Math.random() * 190,
          8 + Math.random() * 22,
          "rgba(132, 185, 255, 0.28)",
          Math.random() * Math.PI,
        );
      }
      break;
    }
    default:
      drawNoise(context, width, height, 0.12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createLabelTexture(text: string, subtitle?: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create label canvas context");
  }

  canvas.width = 768;
  canvas.height = 220;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "800 56px Orbitron, Arial, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.letterSpacing = "12px";
  context.shadowColor = "rgba(0,0,0,0.9)";
  context.shadowBlur = 20;
  context.fillStyle = "rgba(245, 247, 255, 0.92)";
  context.fillText(text.toUpperCase(), 28, 96);

  if (subtitle) {
    context.font = "700 24px Orbitron, Arial, sans-serif";
    context.letterSpacing = "6px";
    context.shadowBlur = 14;
    context.fillStyle = "rgba(123, 220, 255, 0.82)";
    context.fillText(subtitle.toUpperCase(), 32, 148);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const starCount = 2600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const color = new THREE.Color();

  for (let index = 0; index < starCount; index += 1) {
    const radius = 450 + Math.random() * 860;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    color.set(Math.random() > 0.82 ? "#ffd98a" : "#dce8ff");
    const intensity = 0.45 + Math.random() * 0.55;
    colors[index * 3] = color.r * intensity;
    colors[index * 3 + 1] = color.g * intensity;
    colors[index * 3 + 2] = color.b * intensity;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 1.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
    }),
  );
}

function createOrbit(radius: number, ellipse: number, color: string) {
  const points: THREE.Vector3[] = [];

  for (let index = 0; index <= 256; index += 1) {
    const angle = (index / 256) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius * ellipse,
      ),
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.74,
  });

  return new THREE.LineLoop(geometry, material);
}

function createPlanetMaterial(project: PortfolioProject) {
  const color = new THREE.Color(project.visual.color);
  const texture = createPlanetTexture(project);

  return new THREE.MeshStandardMaterial({
    color,
    map: texture,
    roughness: 0.62,
    metalness: 0.08,
    emissive: color,
    emissiveIntensity: 0.08,
  });
}

export function SolarSystemScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const runtimesRef = useRef<PlanetRuntime[]>([]);
  const clearSceneFocusRef = useRef<() => void>(() => {});
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cameraReadout, setCameraReadout] = useState<CameraReadout | null>(
    null,
  );
  const [showCameraReadout, setShowCameraReadout] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000104");
    scene.fog = new THREE.FogExp2("#000104", 0.0018);

    const camera = new THREE.PerspectiveCamera(
      46,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1800,
    );
    camera.position.set(105, -162, 270);
    const overviewCameraPosition = camera.position.clone();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.minDistance = 45;
    controls.maxDistance = 540;
    controls.target.set(0, 0, 0);
    const overviewTarget = controls.target.clone();
    controls.autoRotate = false;

    const ambient = new THREE.AmbientLight("#64708e", 0.42);
    scene.add(ambient);

    const sunLight = new THREE.PointLight("#ffd27a", 900, 520, 1.35);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const systemGroup = new THREE.Group();
    systemGroup.rotation.x = THREE.MathUtils.degToRad(70);
    systemGroup.rotation.z = THREE.MathUtils.degToRad(-18);
    scene.add(systemGroup);

    const stars = createStarField();
    scene.add(stars);

    const sunBaseColor = new THREE.Color("#ffd86f");
    const sunActiveColor = new THREE.Color("#fff4a6");
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: sunBaseColor.clone(),
    });
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(10, 64, 64),
      sunMaterial,
    );
    systemGroup.add(sun);

    const sunHitArea = new THREE.Mesh(
      new THREE.SphereGeometry(12.5, 32, 32),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    systemGroup.add(sunHitArea);

    const sunLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createLabelTexture("Sun", "Profile"),
        transparent: true,
        depthTest: false,
      }),
    );
    sunLabel.position.set(14, 0, 5);
    sunLabel.scale.set(48, 13.75, 1);
    systemGroup.add(sunLabel);

    const planetRuntimes: PlanetRuntime[] = portfolioProjects.map(
      (project, index) => {
        const radius = ORBIT_RADII[index] ?? 210 + index * 26;
        const ellipse = 0.67 + index * 0.014;
        const angle = index * 0.82 + 0.55;
        const orbitColor = ORBIT_COLORS[index] ?? project.visual.orbitColor;
        const planetRadius = PLANET_SCALE[index] ?? 3.4;
        const baseColor = new THREE.Color(project.visual.color);
        const activeColor = baseColor.clone().offsetHSL(0, 0.14, 0.16);

        const orbit = createOrbit(radius, ellipse, orbitColor);
        systemGroup.add(orbit);

        const planetMaterial = createPlanetMaterial(project);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(planetRadius, 48, 48),
          planetMaterial,
        );
        mesh.userData.slug = project.slug;
        systemGroup.add(mesh);

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
            new THREE.RingGeometry(
              planetRadius * 1.35,
              planetRadius * 1.95,
              96,
            ),
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
          project,
          mesh,
          material: planetMaterial,
          baseColor,
          activeColor,
          hitArea,
          light,
          label,
          radius,
          ellipse,
          speed: 0.000035 / (index + 1),
          angle,
        };
      },
    );

    runtimesRef.current = planetRuntimes;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let focusTarget: THREE.Vector3 | null = null;
    let cameraFocusPosition: THREE.Vector3 | null = null;
    let animationFrame = 0;
    let previousTime = performance.now();
    let lastReadoutUpdate = 0;
    let hoveredTarget: HoverTarget = null;
    let selectedTarget: HoverTarget = null;
    let tapCandidate: TapCandidate = null;
    clearSceneFocusRef.current = () => {
      selectedTarget = null;
      focusTarget = overviewTarget.clone();
      cameraFocusPosition = overviewCameraPosition.clone();
    };

    function roundedVector(vector: THREE.Vector3): [number, number, number] {
      return [
        Number(vector.x.toFixed(2)),
        Number(vector.y.toFixed(2)),
        Number(vector.z.toFixed(2)),
      ];
    }

    function updateCameraReadout(currentTime: number) {
      if (currentTime - lastReadoutUpdate < 120) {
        return;
      }

      lastReadoutUpdate = currentTime;
      setCameraReadout({
        camera: roundedVector(camera.position),
        target: roundedVector(controls.target),
        systemRotation: [
          Number(THREE.MathUtils.radToDeg(systemGroup.rotation.x).toFixed(2)),
          Number(THREE.MathUtils.radToDeg(systemGroup.rotation.y).toFixed(2)),
          Number(THREE.MathUtils.radToDeg(systemGroup.rotation.z).toFixed(2)),
        ],
        distance: Number(
          camera.position.distanceTo(controls.target).toFixed(2),
        ),
      });
    }

    function setPlanetPositions(delta: number) {
      planetRuntimes.forEach((runtime) => {
        runtime.angle += runtime.speed * delta;
        const x = Math.cos(runtime.angle) * runtime.radius;
        const z = Math.sin(runtime.angle) * runtime.radius * runtime.ellipse;
        runtime.mesh.position.set(x, 0, z);
        runtime.hitArea.position.set(x, 0, z);
        runtime.light.position.set(x, 0, z);
        runtime.mesh.rotation.y += 0.008;
        runtime.label.position.set(x + 8, 0, z + 4);
      });
    }

    function targetMatches(left: HoverTarget, right: HoverTarget) {
      if (!left || !right || left.type !== right.type) {
        return false;
      }

      if (left.type === "planet" && right.type === "planet") {
        return left.runtime === right.runtime;
      }

      return left.type === "sun";
    }

    function setPlanetLight(runtime: PlanetRuntime, level: number) {
      const targetColor = runtime.baseColor
        .clone()
        .lerp(runtime.activeColor, Math.min(level, 1));
      runtime.material.color.lerp(targetColor, 0.18);
      runtime.material.emissive.lerp(targetColor, 0.18);
      runtime.material.emissiveIntensity = THREE.MathUtils.lerp(
        runtime.material.emissiveIntensity,
        0.08 + level * 0.82,
        0.18,
      );
      runtime.light.intensity = THREE.MathUtils.lerp(
        runtime.light.intensity,
        level * 24,
        0.18,
      );
      runtime.mesh.scale.setScalar(1 + level * 0.07);
    }

    function updateLightingState() {
      planetRuntimes.forEach((runtime) => {
        const lightLevel = targetMatches(selectedTarget, {
          type: "planet",
          runtime,
        })
          ? 0.9
          : targetMatches(hoveredTarget, { type: "planet", runtime })
            ? 0.55
            : 0;
        setPlanetLight(runtime, lightLevel);
      });

      const sunLevel = targetMatches(selectedTarget, { type: "sun" })
        ? 1
        : targetMatches(hoveredTarget, { type: "sun" })
          ? 0.75
          : 0;
      const targetSunColor = sunBaseColor
        .clone()
        .lerp(sunActiveColor, sunLevel);
      sunMaterial.color.lerp(targetSunColor, 0.16);
      sunLight.intensity = THREE.MathUtils.lerp(
        sunLight.intensity,
        900 + sunLevel * 460,
        0.16,
      );
      sun.scale.setScalar(1 + sunLevel * 0.05);
    }

    function selectPlanet(project: PortfolioProject, mesh: THREE.Mesh) {
      setSelectedProject(project);
      setProfileOpen(false);
      const runtime = planetRuntimes.find((item) => item.mesh === mesh);
      selectedTarget = runtime ? { type: "planet", runtime } : null;
      controls.autoRotate = false;

      const worldPosition = new THREE.Vector3();
      mesh.getWorldPosition(worldPosition);
      focusTarget = worldPosition.clone();

      const direction = camera.position.clone().sub(worldPosition).normalize();
      const nextCameraPosition = worldPosition
        .clone()
        .add(direction.multiplyScalar(72));
      cameraFocusPosition = nextCameraPosition;
    }

    function selectSun() {
      setSelectedProject(null);
      setProfileOpen(true);
      selectedTarget = { type: "sun" };
      controls.autoRotate = false;
      focusTarget = new THREE.Vector3(0, 0, 0);

      const direction = camera.position.clone().normalize();
      const nextCameraPosition = direction.multiplyScalar(92);
      cameraFocusPosition = nextCameraPosition;
    }

    function updatePointerFromEvent(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
    }

    function getHoveredTarget() {
      const intersections = raycaster.intersectObjects(
        planetRuntimes.flatMap((runtime) => [runtime.hitArea, runtime.mesh]),
        false,
      );
      const hit = intersections[0]?.object;

      const runtime = hit
        ? planetRuntimes.find(
            (item) => item.mesh === hit || item.hitArea === hit,
          )
        : undefined;

      if (runtime) {
        return { type: "planet" as const, runtime };
      }

      const sunIntersections = raycaster.intersectObjects(
        [sunHitArea, sun],
        false,
      );

      if (sunIntersections.length > 0) {
        return { type: "sun" as const };
      }

      return null;
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointerFromEvent(event);
      hoveredTarget = getHoveredTarget();
      const isClickable = Boolean(hoveredTarget);
      renderer.domElement.classList.toggle("is-clickable", isClickable);
      renderer.domElement.style.cursor = isClickable ? "pointer" : "grab";
    }

    function handlePointerLeave() {
      hoveredTarget = null;
      tapCandidate = null;
      renderer.domElement.classList.remove("is-clickable");
      renderer.domElement.style.cursor = "grab";
    }

    function handlePointerDown(event: PointerEvent) {
      updatePointerFromEvent(event);
      tapCandidate = {
        target: getHoveredTarget(),
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
        pointerType: event.pointerType,
      };
    }

    function handlePointerCancel() {
      tapCandidate = null;
    }

    function handlePointerUp(event: PointerEvent) {
      const candidate = tapCandidate;
      tapCandidate = null;

      if (!candidate?.target) {
        return;
      }

      const maxTapDuration = candidate.pointerType === "touch" ? 280 : 500;
      const maxTapMovement = candidate.pointerType === "touch" ? 12 : 8;
      const elapsed = performance.now() - candidate.time;
      const movement = Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y);

      if (elapsed > maxTapDuration || movement > maxTapMovement) {
        return;
      }

      updatePointerFromEvent(event);
      const target = getHoveredTarget();

      if (!targetMatches(candidate.target, target)) {
        return;
      }

      if (target?.type === "planet") {
        selectPlanet(target.runtime.project, target.runtime.mesh);
        return;
      }

      if (target?.type === "sun") {
        selectSun();
      }
    }

    function handleResize() {
      if (!mount) {
        return;
      }

      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function animate() {
      const currentTime = performance.now();
      const delta = currentTime - previousTime;
      previousTime = currentTime;
      setPlanetPositions(delta);
      updateLightingState();

      if (focusTarget) {
        controls.target.lerp(focusTarget, FOCUS_TARGET_LERP);
        if (controls.target.distanceTo(focusTarget) < 0.12) {
          focusTarget = null;
        }
      }

      if (cameraFocusPosition) {
        camera.position.lerp(cameraFocusPosition, FOCUS_CAMERA_LERP);
        if (camera.position.distanceTo(cameraFocusPosition) < 0.18) {
          cameraFocusPosition = null;
        }
      }

      stars.rotation.y += 0.00008;
      sun.rotation.y += 0.006;
      controls.update();
      updateCameraReadout(currentTime);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      clearSceneFocusRef.current = () => {};
      window.cancelAnimationFrame(animationFrame);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener(
        "pointercancel",
        handlePointerCancel,
      );
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Points
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) {
              material.map.dispose();
            }

            material.dispose();
          });
        }

        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
    };
  }, []);

  const activeIndex = selectedProject
    ? portfolioProjects.findIndex(
        (project) => project.slug === selectedProject.slug,
      )
    : -1;
  const drawerOpen = Boolean(selectedProject || profileOpen);

  return (
    <main className={`three-system-shell${drawerOpen ? " has-drawer" : ""}`}>
      <div
        ref={mountRef}
        className="three-system-canvas"
        aria-label="3D project solar system"
      />

      <div className="system-hud" aria-hidden={drawerOpen ? "true" : undefined}>
        <p className="hud-kicker">Portfolio system</p>
        <h1 aria-label="Explore my orbit of works.">
          <span className="title-line">Explore my</span>
          <span className="title-line">orbit of</span>
          <span className="title-line">works.</span>
        </h1>
        <p className="hud-copy">
          Full-stack software engineer orbiting frontend craft, backend systems,
          and interactive web products.
        </p>
      </div>

      <div className="control-hint">
        <span>Rotate</span>
        <span>Zoom</span>
        <span>Click sun</span>
        <span>Click planet</span>
      </div>

      {!drawerOpen ? (
        <button
          type="button"
          className={`camera-toggle${showCameraReadout ? " is-active" : ""}`}
          onClick={() => setShowCameraReadout((isVisible) => !isVisible)}
          aria-pressed={showCameraReadout}
        >
          Camera
        </button>
      ) : null}

      {!drawerOpen && showCameraReadout && cameraReadout ? (
        <aside className="camera-readout" aria-label="Camera position readout">
          <div>
            <span>camera.position</span>
            <code>{`set(${cameraReadout.camera.join(", ")})`}</code>
          </div>
          <div>
            <span>controls.target</span>
            <code>{`set(${cameraReadout.target.join(", ")})`}</code>
          </div>
          <div>
            <span>system rotation deg</span>
            <code>
              {`x:${cameraReadout.systemRotation[0]} y:${cameraReadout.systemRotation[1]} z:${cameraReadout.systemRotation[2]}`}
            </code>
          </div>
          <div>
            <span>distance</span>
            <code>{cameraReadout.distance}</code>
          </div>
        </aside>
      ) : null}

      {drawerOpen ? (
        <div className="project-drawer-wrap">
          <button
            type="button"
            className="drawer-close"
            onClick={() => {
              clearSceneFocusRef.current();
              setSelectedProject(null);
              setProfileOpen(false);
            }}
            aria-label="Close details"
          >
            Close
          </button>
          {profileOpen ? (
            <ProfilePanel />
          ) : selectedProject ? (
            <ProjectPanel
              project={selectedProject}
              activeIndex={activeIndex}
              total={portfolioProjects.length}
            />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
