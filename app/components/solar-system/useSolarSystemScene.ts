"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { portfolioProjects, type PortfolioProject } from "@/app/data/projects";
import {
  FOCUS_CAMERA_LERP,
  FOCUS_TARGET_LERP,
  INTRO_DURATION,
  ORBIT_COLORS,
  ORBIT_RADII,
  PLANET_SCALE,
  easeInCubic,
  easeInOutCubic,
} from "./constants";
import {
  createOrbit,
  createRocket,
  createRocketTrail,
  createStarField,
} from "./objects";
import {
  createEarthCloudTexture,
  createGlowTexture,
  createLabelTexture,
  createPlanetMaterial,
  createSunTexture,
} from "./textures";
import type { CameraReadout, HoverTarget, PlanetRuntime, TapCandidate } from "./types";

type RocketOrbitTarget = Exclude<HoverTarget, null>;

type RocketTransfer = {
  target: RocketOrbitTarget;
  startedAt: number;
  duration: number;
  startPosition: THREE.Vector3;
  startScale: number;
  arriveAngle: number;
};

export function useSolarSystemScene() {
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
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    setIntroComplete(false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000104");
    scene.fog = new THREE.FogExp2("#000104", 0.0018);

    function getOverviewCameraPosition(width: number) {
      if (width <= 820) {
        return new THREE.Vector3(141.68, -218.6, 364.33);
      }

      return new THREE.Vector3(105, -162, 270);
    }

    const camera = new THREE.PerspectiveCamera(
      46,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1800,
    );
    const overviewCameraPosition = getOverviewCameraPosition(mount.clientWidth);
    camera.position.copy(overviewCameraPosition);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enabled = false;
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
      map: createSunTexture(),
    });
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(10, 64, 64),
      sunMaterial,
    );
    systemGroup.add(sun);

    const sunGlowTexture = createGlowTexture();
    const sunGlowMaterial = new THREE.SpriteMaterial({
      map: sunGlowTexture,
      color: "#fff12f",
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunGlow = new THREE.Sprite(sunGlowMaterial);
    sunGlow.scale.set(52, 52, 1);
    systemGroup.add(sunGlow);

    const sunOuterGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sunGlowTexture,
        color: "#f6ff32",
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sunOuterGlow.scale.set(92, 92, 1);
    systemGroup.add(sunOuterGlow);

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

        let cloudLayer: THREE.Mesh | undefined;
        if (project.codename === "Earth") {
          cloudLayer = new THREE.Mesh(
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
        }

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
          cloudLayer,
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
    let returnCameraPosition = overviewCameraPosition.clone();
    let returnTarget = overviewTarget.clone();
    let returnTweenStartedAt: number | null = null;

    function clearCameraTween() {
      focusTarget = null;
      cameraFocusPosition = null;
      returnTweenStartedAt = null;
    }

    function cancelReturnTweenOnUserInput() {
      if (returnTweenStartedAt === null || selectedTarget) {
        return;
      }

      clearCameraTween();
    }

    clearSceneFocusRef.current = () => {
      selectedTarget = null;
      rocketTransfer = null;
      focusTarget = returnTarget.clone();
      cameraFocusPosition = returnCameraPosition.clone();
      returnTweenStartedAt = performance.now();
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
        runtime.cloudLayer?.rotateY(0.004);
        runtime.label.position.set(x + 8, 0, z + 4);
      });
    }

    setPlanetPositions(0);
    systemGroup.updateMatrixWorld(true);

    const earthRuntime =
      planetRuntimes.find((runtime) => runtime.project.codename === "Earth") ??
      planetRuntimes[2];
    const earthWorldPosition = new THREE.Vector3();
    earthRuntime.mesh.getWorldPosition(earthWorldPosition);

    const introLaunchDirection = new THREE.Vector3(0, 1, 0);

    const rocket = createRocket();
    rocket.group.traverse((object) => {
      object.renderOrder = 20;
    });
    const rocketTrail = createRocketTrail();
    const rocketTrailGeometry = rocketTrail.points.geometry;
    const rocketTrailMaterial = rocketTrail.points.material;
    const rocketStart = earthWorldPosition
      .clone()
      .add(introLaunchDirection.clone().multiplyScalar(15));
    const rocketEnd = earthWorldPosition
      .clone()
      .add(introLaunchDirection.clone().multiplyScalar(124));
    const introCloseCamera = rocketStart
      .clone()
      .add(new THREE.Vector3(10, 10, 28));
    const introMidCamera = rocketEnd
      .clone()
      .add(new THREE.Vector3(28, 34, 58));
    const trailFloorY = earthWorldPosition.y + 5.6;
    const rocketPosition = new THREE.Vector3();
    const introCameraPosition = new THREE.Vector3();
    const introTarget = new THREE.Vector3();
    const rocketOrbitRadius = 82;
    const rocketOrbitEllipse = 0.66;
    let rocketOrbitAngle = Math.atan2(
      earthWorldPosition.z / rocketOrbitEllipse,
      earthWorldPosition.x,
    );
    let focusedRocketOrbitAngle = 0;
    let rocketOrbitTransitionStartedAt: number | null = null;
    let rocketTransfer: RocketTransfer | null = null;

    rocket.group.scale.setScalar(1.28);
    rocket.group.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      introLaunchDirection,
    );
    rocket.group.position.copy(rocketStart);
    scene.add(rocket.group);
    scene.add(rocketTrail.points);
    camera.position.copy(introCloseCamera);
    controls.target.copy(rocketStart);
    sunLabel.visible = false;
    planetRuntimes.forEach((runtime) => {
      runtime.label.visible = false;
    });

    let introActive = true;
    const introStartedAt = performance.now();

    function updateRocketTrail(position: THREE.Vector3, progress: number) {
      let visibleTrailPoints = 0;

      for (let index = 0; index < rocketTrail.positions.length / 3; index += 1) {
        const offset = 3.2 + index * (0.62 + progress * 0.42);
        const drift = Math.sin(index * 1.87 + progress * 18) * (0.08 + index * 0.006);
        const side = new THREE.Vector3(
          Math.sin(index * 0.73) * drift,
          Math.cos(index * 1.13) * drift,
          Math.sin(index * 1.37) * drift,
        );
        const point = position
          .clone()
          .add(introLaunchDirection.clone().multiplyScalar(-offset))
          .add(side);

        if (point.y >= trailFloorY) {
          rocketTrail.positions[index * 3] = point.x;
          rocketTrail.positions[index * 3 + 1] = point.y;
          rocketTrail.positions[index * 3 + 2] = point.z;
          visibleTrailPoints = index + 1;
        } else {
          rocketTrail.positions[index * 3] = position.x;
          rocketTrail.positions[index * 3 + 1] = trailFloorY;
          rocketTrail.positions[index * 3 + 2] = position.z;
        }
      }

      rocketTrailGeometry.setDrawRange(0, visibleTrailPoints);
      rocketTrailGeometry.attributes.position.needsUpdate = true;

      if (rocketTrailMaterial instanceof THREE.PointsMaterial) {
        rocketTrailMaterial.opacity = Math.max(0, 0.62 * (1 - progress * 0.72));
      }
    }

    function getFocusedRocketOrbitRadius(runtime: PlanetRuntime) {
      return Math.max(runtime.radius * 0.07 + 0.9, 4.2);
    }

    function getFocusedSunRocketOrbitRadius() {
      return 13.2;
    }

    function getCameraOrbitAxes() {
      return {
        right: new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion),
        up: new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion),
      };
    }

    function getRocketTargetCenter(target: RocketOrbitTarget) {
      const center = new THREE.Vector3();

      if (target.type === "planet") {
        target.runtime.mesh.getWorldPosition(center);
      } else {
        sun.getWorldPosition(center);
      }

      return center;
    }

    function getRocketTargetOrbitRadius(target: RocketOrbitTarget) {
      return target.type === "planet"
        ? getFocusedRocketOrbitRadius(target.runtime)
        : getFocusedSunRocketOrbitRadius();
    }

    function getRocketOrbitPosition(target: RocketOrbitTarget, angle: number) {
      const center = getRocketTargetCenter(target);
      const radius = getRocketTargetOrbitRadius(target);
      const { right, up } = getCameraOrbitAxes();

      return center
        .add(right.clone().multiplyScalar(Math.cos(angle) * radius))
        .add(up.clone().multiplyScalar(Math.sin(angle) * radius));
    }

    function beginRocketTransfer(target: RocketOrbitTarget) {
      const center = getRocketTargetCenter(target);
      const relativeRocketPosition = rocket.group.position.clone().sub(center);
      const { right, up } = getCameraOrbitAxes();
      const currentAngle = Math.atan2(
        relativeRocketPosition.dot(up),
        relativeRocketPosition.dot(right),
      );
      const distance = rocket.group.position.distanceTo(center);

      rocketTransfer = {
        target,
        startedAt: performance.now(),
        duration: THREE.MathUtils.clamp(distance * 18, 1250, 2800),
        startPosition: rocket.group.position.clone(),
        startScale: rocket.group.scale.x,
        arriveAngle: currentAngle + 0.9,
      };
    }

    function completeIntro() {
      if (!introActive) {
        return;
      }

      introActive = false;
      controls.enabled = true;
      camera.position.copy(overviewCameraPosition);
      controls.target.copy(overviewTarget);
      rocket.group.visible = true;
      rocket.group.scale.setScalar(1.28);
      rocket.group.position.copy(rocketEnd);
      rocketTrail.points.visible = false;
      rocket.flameLight.intensity = 8;
      rocketOrbitTransitionStartedAt = performance.now();
      sunLabel.visible = true;
      planetRuntimes.forEach((runtime) => {
        runtime.label.visible = true;
      });
      clearCameraTween();
      setIntroComplete(true);
    }

    function updateIntro(currentTime: number) {
      if (!introActive) {
        return;
      }

      const progress = THREE.MathUtils.clamp(
        (currentTime - introStartedAt) / INTRO_DURATION,
        0,
        1,
      );
      const launchWindow = THREE.MathUtils.clamp(progress / 0.72, 0, 1);
      const launchProgress =
        launchWindow < 0.22
          ? 0
          : easeInCubic((launchWindow - 0.22) / 0.78);
      rocketPosition.lerpVectors(rocketStart, rocketEnd, launchProgress);
      rocket.group.position.copy(rocketPosition);
      rocket.flame.scale.setScalar(1 + Math.sin(currentTime * 0.03) * 0.18);
      rocket.flameLight.intensity = 42 * (1 - progress * 0.55);
      updateRocketTrail(rocketPosition, progress);

      if (progress < 0.72) {
        const cameraProgress = easeInOutCubic(progress / 0.72);
        introCameraPosition.lerpVectors(
          introCloseCamera,
          introMidCamera,
          cameraProgress,
        );
        introTarget.lerpVectors(rocketStart, rocketPosition, cameraProgress);
      } else {
        const pullbackProgress = easeInOutCubic((progress - 0.72) / 0.28);
        introCameraPosition.lerpVectors(
          introMidCamera,
          overviewCameraPosition,
          pullbackProgress,
        );
        introTarget.lerpVectors(rocketEnd, overviewTarget, pullbackProgress);
      }

      camera.position.copy(introCameraPosition);
      controls.target.copy(introTarget);

      if (progress >= 1) {
        completeIntro();
      }
    }

    function updateRocketOrbit(delta: number) {
      const orbitingFocusedTarget = selectedTarget;
      const orbitPosition = new THREE.Vector3();
      const nextPosition = new THREE.Vector3();

      if (rocketTransfer) {
        const progress = THREE.MathUtils.clamp(
          (performance.now() - rocketTransfer.startedAt) /
            rocketTransfer.duration,
          0,
          1,
        );
        const easedProgress = easeInOutCubic(progress);
        const flightAngle = rocketTransfer.arriveAngle + progress * 0.42;
        const targetOrbitPosition = getRocketOrbitPosition(
          rocketTransfer.target,
          flightAngle,
        );
        const nextTargetOrbitPosition = getRocketOrbitPosition(
          rocketTransfer.target,
          flightAngle + 0.16,
        );
        const flightDistance =
          rocketTransfer.startPosition.distanceTo(targetOrbitPosition);
        const cameraLift = getCameraOrbitAxes().up.multiplyScalar(
          Math.sin(easedProgress * Math.PI) *
            Math.min(24, flightDistance * 0.18),
        );
        const currentPosition = rocketTransfer.startPosition
          .clone()
          .lerp(targetOrbitPosition, easedProgress)
          .add(cameraLift);
        const direction = (
          progress < 0.94 ? targetOrbitPosition : nextTargetOrbitPosition
        )
          .clone()
          .sub(currentPosition)
          .normalize();

        if (direction.lengthSq() > 0) {
          rocket.group.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction,
          );
        }

        rocket.group.position.copy(currentPosition);
        rocket.group.scale.setScalar(
          THREE.MathUtils.lerp(rocketTransfer.startScale, 0.58, easedProgress),
        );
        rocket.flameLight.intensity = THREE.MathUtils.lerp(
          rocket.flameLight.intensity,
          22,
          0.16,
        );

        if (progress >= 1) {
          focusedRocketOrbitAngle = flightAngle;
          rocketTransfer = null;
        }

        rocket.flame.scale.setScalar(
          0.76 + Math.sin(performance.now() * 0.024) * 0.1,
        );
        return;
      } else if (orbitingFocusedTarget) {
        focusedRocketOrbitAngle += delta * 0.00155;
        const nextAngle = focusedRocketOrbitAngle + 0.16;
        const center = new THREE.Vector3();
        const radius =
          orbitingFocusedTarget.type === "planet"
            ? getFocusedRocketOrbitRadius(orbitingFocusedTarget.runtime)
            : getFocusedSunRocketOrbitRadius();
        const { right: cameraRight, up: cameraUp } = getCameraOrbitAxes();

        if (orbitingFocusedTarget.type === "planet") {
          orbitingFocusedTarget.runtime.mesh.getWorldPosition(center);
        } else {
          sun.getWorldPosition(center);
        }

        orbitPosition
          .copy(center)
          .add(
            cameraRight
              .clone()
              .multiplyScalar(Math.cos(focusedRocketOrbitAngle) * radius),
          )
          .add(
            cameraUp
              .clone()
              .multiplyScalar(Math.sin(focusedRocketOrbitAngle) * radius),
          );
        nextPosition
          .copy(center)
          .add(cameraRight.clone().multiplyScalar(Math.cos(nextAngle) * radius))
          .add(cameraUp.clone().multiplyScalar(Math.sin(nextAngle) * radius));
      } else {
        rocketOrbitAngle += delta * 0.000045;
        const nextAngle = rocketOrbitAngle + 0.018;
        const x = Math.cos(rocketOrbitAngle) * rocketOrbitRadius;
        const z =
          Math.sin(rocketOrbitAngle) * rocketOrbitRadius * rocketOrbitEllipse;
        const nextX = Math.cos(nextAngle) * rocketOrbitRadius;
        const nextZ =
          Math.sin(nextAngle) * rocketOrbitRadius * rocketOrbitEllipse;

        orbitPosition.set(x, 4.2, z);
        nextPosition.set(nextX, 4.2, nextZ);
      }

      const transitionProgress = rocketOrbitTransitionStartedAt === null
        ? 1
        : THREE.MathUtils.clamp(
            (performance.now() - rocketOrbitTransitionStartedAt) / 1700,
            0,
            1,
          );
      const easedTransition = easeInOutCubic(transitionProgress);
      const currentPosition =
        orbitingFocusedTarget
          ? orbitPosition
          : rocketOrbitTransitionStartedAt === null
          ? rocket.group.position
              .clone()
              .lerp(orbitPosition, 0.045)
          : rocketEnd.clone().lerp(orbitPosition, easedTransition);
      const direction =
        orbitingFocusedTarget || transitionProgress >= 1
          ? nextPosition.clone().sub(currentPosition).normalize()
          : orbitPosition.clone().sub(currentPosition).normalize();

      if (transitionProgress >= 1) {
        rocketOrbitTransitionStartedAt = null;
      }

      rocket.group.position.copy(currentPosition);
      rocket.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      rocket.group.scale.setScalar(
        THREE.MathUtils.lerp(
          rocket.group.scale.x,
          orbitingFocusedTarget ? 0.58 : 0.9,
          orbitingFocusedTarget ? 0.12 : easedTransition,
        ),
      );
      rocket.flameLight.intensity = THREE.MathUtils.lerp(
        rocket.flameLight.intensity,
        orbitingFocusedTarget ? 14 : 8,
        0.12,
      );
      rocket.flame.scale.setScalar(0.68 + Math.sin(performance.now() * 0.024) * 0.08);
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

    function setLabelOpacity(label: THREE.Sprite, opacity: number) {
      if (!(label.material instanceof THREE.SpriteMaterial)) {
        return;
      }

      label.material.opacity = THREE.MathUtils.lerp(
        label.material.opacity,
        opacity,
        0.16,
      );
    }

    function updateLightingState() {
      const hasFocusedTarget = Boolean(selectedTarget);

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
        setLabelOpacity(
          runtime.label,
          hasFocusedTarget
            ? targetMatches(selectedTarget, { type: "planet", runtime })
              ? 0.9
              : 0.16
            : 1,
        );
      });

      setLabelOpacity(
        sunLabel,
        hasFocusedTarget
          ? targetMatches(selectedTarget, { type: "sun" })
            ? 0.9
            : 0.16
          : 1,
      );

      const sunLevel = targetMatches(selectedTarget, { type: "sun" })
        ? 1
        : targetMatches(hoveredTarget, { type: "sun" })
          ? 0.75
          : 0;
      const targetSunColor = sunBaseColor
        .clone()
        .lerp(sunActiveColor, sunLevel);
      sunMaterial.color.lerp(targetSunColor, 0.16);
      sunGlowMaterial.opacity = THREE.MathUtils.lerp(
        sunGlowMaterial.opacity,
        0.72 + sunLevel * 0.24,
        0.12,
      );
      sunGlow.scale.setScalar(52 + sunLevel * 8);
      sunOuterGlow.material.opacity = THREE.MathUtils.lerp(
        sunOuterGlow.material.opacity,
        0.24 + sunLevel * 0.16,
        0.12,
      );
      sunOuterGlow.scale.setScalar(92 + sunLevel * 12);
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
      if (!selectedTarget) {
        returnCameraPosition = camera.position.clone();
        returnTarget = controls.target.clone();
      }
      selectedTarget = runtime ? { type: "planet", runtime } : null;
      rocketOrbitTransitionStartedAt = null;
      if (runtime) {
        beginRocketTransfer({ type: "planet", runtime });
      }
      returnTweenStartedAt = null;
      controls.autoRotate = false;

      const worldPosition = new THREE.Vector3();
      mesh.getWorldPosition(worldPosition);
      const drawerOffset = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(renderer.domElement.clientWidth <= 820 ? 0 : 26);
      const visibleFocusTarget = worldPosition.clone().add(drawerOffset);
      focusTarget = visibleFocusTarget.clone();

      const direction = camera.position.clone().sub(worldPosition).normalize();
      const nextCameraPosition = visibleFocusTarget
        .clone()
        .add(direction.multiplyScalar(72));
      cameraFocusPosition = nextCameraPosition;
    }

    function selectSun() {
      setSelectedProject(null);
      setProfileOpen(true);
      if (!selectedTarget) {
        returnCameraPosition = camera.position.clone();
        returnTarget = controls.target.clone();
      }
      selectedTarget = { type: "sun" };
      rocketOrbitTransitionStartedAt = null;
      beginRocketTransfer({ type: "sun" });
      returnTweenStartedAt = null;
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
      if (introActive) {
        renderer.domElement.classList.remove("is-clickable");
        renderer.domElement.style.cursor = "grab";
        return;
      }

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
      if (introActive) {
        completeIntro();
        return;
      }

      cancelReturnTweenOnUserInput();
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

    function handleWheel() {
      if (introActive) {
        completeIntro();
        return;
      }

      cancelReturnTweenOnUserInput();
    }

    function handleControlsStart() {
      cancelReturnTweenOnUserInput();
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

      if (introActive) {
        updateIntro(currentTime);
      } else {
        updateRocketOrbit(delta);

        if (focusTarget) {
          controls.target.lerp(focusTarget, FOCUS_TARGET_LERP);
          if (controls.target.distanceTo(focusTarget) < 0.12) {
            focusTarget = null;
          }
        }
      }

      if (cameraFocusPosition) {
        camera.position.lerp(cameraFocusPosition, FOCUS_CAMERA_LERP);
        if (camera.position.distanceTo(cameraFocusPosition) < 0.18) {
          cameraFocusPosition = null;
        }
      }

      if (
        returnTweenStartedAt !== null &&
        (!focusTarget || controls.target.distanceTo(focusTarget) < 0.12) &&
        (!cameraFocusPosition ||
          camera.position.distanceTo(cameraFocusPosition) < 0.18)
      ) {
        clearCameraTween();
      }

      if (
        returnTweenStartedAt !== null &&
        currentTime - returnTweenStartedAt > 2600
      ) {
        controls.target.copy(returnTarget);
        camera.position.copy(returnCameraPosition);
        clearCameraTween();
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
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: true });
    controls.addEventListener("start", handleControlsStart);
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
      renderer.domElement.removeEventListener("wheel", handleWheel);
      controls.removeEventListener("start", handleControlsStart);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
          return;
        }

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
      });
    };
  }, []);

  const activeIndex = selectedProject
    ? portfolioProjects.findIndex(
        (project) => project.slug === selectedProject.slug,
      )
    : -1;
  const drawerOpen = Boolean(selectedProject || profileOpen);

  const shellClassName = [
    "three-system-shell",
    introComplete ? "is-ready" : "is-intro",
    drawerOpen ? "has-drawer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function closeDrawer() {
    clearSceneFocusRef.current();
    setSelectedProject(null);
    setProfileOpen(false);
  }

  return {
    activeIndex,
    cameraReadout,
    closeDrawer,
    drawerOpen,
    mountRef,
    profileOpen,
    selectedProject,
    setShowCameraReadout,
    shellClassName,
    showCameraReadout,
  };
}
