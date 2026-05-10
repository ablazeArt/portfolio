import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { INTRO_DURATION, easeInCubic, easeInOutCubic } from "./constants";
import { createRocket, createRocketTrail } from "./objects";
import type { PlanetRuntime, RocketOrbitTarget, SunRuntime } from "./types";

type RocketTransfer = {
  target: RocketOrbitTarget;
  startedAt: number;
  duration: number;
  startPosition: THREE.Vector3;
  startScale: number;
  arriveAngle: number;
};

type RocketControllerOptions = {
  camera: THREE.PerspectiveCamera;
  clearCameraTween: () => void;
  controls: OrbitControls;
  onIntroComplete: () => void;
  overviewCameraPosition: THREE.Vector3;
  overviewTarget: THREE.Vector3;
  planetRuntimes: PlanetRuntime[];
  scene: THREE.Scene;
  sun: SunRuntime;
};

export function createRocketController({
  camera,
  clearCameraTween,
  controls,
  onIntroComplete,
  overviewCameraPosition,
  overviewTarget,
  planetRuntimes,
  scene,
  sun,
}: RocketControllerOptions) {
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
  const introCloseCamera = rocketStart.clone().add(new THREE.Vector3(10, 10, 28));
  const introMidCamera = rocketEnd.clone().add(new THREE.Vector3(28, 34, 58));
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
  let introActive = true;
  const introStartedAt = performance.now();

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

  sun.label.visible = false;
  planetRuntimes.forEach((runtime) => {
    runtime.label.visible = false;
  });

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
      sun.mesh.getWorldPosition(center);
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

  function beginTransfer(target: RocketOrbitTarget) {
    const center = getRocketTargetCenter(target);
    const relativeRocketPosition = rocket.group.position.clone().sub(center);
    const { right, up } = getCameraOrbitAxes();
    const currentAngle = Math.atan2(
      relativeRocketPosition.dot(up),
      relativeRocketPosition.dot(right),
    );
    const distance = rocket.group.position.distanceTo(center);

    rocketOrbitTransitionStartedAt = null;
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
    sun.label.visible = true;
    planetRuntimes.forEach((runtime) => {
      runtime.label.visible = true;
    });
    clearCameraTween();
    onIntroComplete();
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
      launchWindow < 0.22 ? 0 : easeInCubic((launchWindow - 0.22) / 0.78);
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

  function updateTransfer(currentTime: number) {
    if (!rocketTransfer) {
      return false;
    }

    const progress = THREE.MathUtils.clamp(
      (currentTime - rocketTransfer.startedAt) / rocketTransfer.duration,
      0,
      1,
    );
    const easedProgress = easeInOutCubic(progress);
    const flightAngle = rocketTransfer.arriveAngle + progress * 0.42;
    const targetOrbitPosition = getRocketOrbitPosition(rocketTransfer.target, flightAngle);
    const nextTargetOrbitPosition = getRocketOrbitPosition(
      rocketTransfer.target,
      flightAngle + 0.16,
    );
    const flightDistance = rocketTransfer.startPosition.distanceTo(targetOrbitPosition);
    const cameraLift = getCameraOrbitAxes().up.multiplyScalar(
      Math.sin(easedProgress * Math.PI) * Math.min(24, flightDistance * 0.18),
    );
    const currentPosition = rocketTransfer.startPosition
      .clone()
      .lerp(targetOrbitPosition, easedProgress)
      .add(cameraLift);
    const direction = (progress < 0.94 ? targetOrbitPosition : nextTargetOrbitPosition)
      .clone()
      .sub(currentPosition)
      .normalize();

    if (direction.lengthSq() > 0) {
      rocket.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
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

    rocket.flame.scale.setScalar(0.76 + Math.sin(currentTime * 0.024) * 0.1);
    return true;
  }

  function updateFocusedOrbit(target: RocketOrbitTarget, delta: number) {
    focusedRocketOrbitAngle += delta * 0.00155;
    const orbitPosition = getRocketOrbitPosition(target, focusedRocketOrbitAngle);
    const nextPosition = getRocketOrbitPosition(target, focusedRocketOrbitAngle + 0.16);
    return { nextPosition, orbitPosition };
  }

  function updateOverviewOrbit(delta: number) {
    rocketOrbitAngle += delta * 0.000045;
    const nextAngle = rocketOrbitAngle + 0.018;
    const orbitPosition = new THREE.Vector3(
      Math.cos(rocketOrbitAngle) * rocketOrbitRadius,
      4.2,
      Math.sin(rocketOrbitAngle) * rocketOrbitRadius * rocketOrbitEllipse,
    );
    const nextPosition = new THREE.Vector3(
      Math.cos(nextAngle) * rocketOrbitRadius,
      4.2,
      Math.sin(nextAngle) * rocketOrbitRadius * rocketOrbitEllipse,
    );
    return { nextPosition, orbitPosition };
  }

  function updateOrbit(delta: number, selectedTarget: RocketOrbitTarget | null) {
    const currentTime = performance.now();

    if (updateTransfer(currentTime)) {
      return;
    }

    const orbitingFocusedTarget = selectedTarget;
    const { nextPosition, orbitPosition } = orbitingFocusedTarget
      ? updateFocusedOrbit(orbitingFocusedTarget, delta)
      : updateOverviewOrbit(delta);
    const transitionProgress = rocketOrbitTransitionStartedAt === null
      ? 1
      : THREE.MathUtils.clamp(
          (currentTime - rocketOrbitTransitionStartedAt) / 1700,
          0,
          1,
        );
    const easedTransition = easeInOutCubic(transitionProgress);
    const currentPosition = orbitingFocusedTarget
      ? orbitPosition
      : rocketOrbitTransitionStartedAt === null
        ? rocket.group.position.clone().lerp(orbitPosition, 0.045)
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
    rocket.flame.scale.setScalar(0.68 + Math.sin(currentTime * 0.024) * 0.08);
  }

  return {
    beginTransfer,
    clearTransfer() {
      rocketTransfer = null;
    },
    completeIntro,
    isIntroActive() {
      return introActive;
    },
    updateIntro,
    updateOrbit,
  };
}
