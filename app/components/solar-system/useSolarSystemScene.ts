"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { portfolioProjects, type PortfolioProject } from "@/app/data/projects";
import { FOCUS_CAMERA_LERP, FOCUS_TARGET_LERP } from "./constants";
import { disposeThreeScene } from "./disposeThreeScene";
import { targetMatches, updateLightingState } from "./lighting";
import { createRocketController } from "./rocketController";
import { createSolarSystemObjects } from "./sceneSetup";
import type { CameraReadout, HoverTarget, TapCandidate } from "./types";

function roundedVector(vector: THREE.Vector3): [number, number, number] {
  return [
    Number(vector.x.toFixed(2)),
    Number(vector.y.toFixed(2)),
    Number(vector.z.toFixed(2)),
  ];
}

export function useSolarSystemScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
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

    const mountElement = mount;
    setIntroComplete(false);

    const {
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
    } = createSolarSystemObjects(mountElement);

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

    const rocketController = createRocketController({
      camera,
      clearCameraTween,
      controls,
      onIntroComplete: () => setIntroComplete(true),
      overviewCameraPosition,
      overviewTarget,
      planetRuntimes,
      scene,
      sun,
    });

    function cancelReturnTweenOnUserInput() {
      if (returnTweenStartedAt === null || selectedTarget) {
        return;
      }

      clearCameraTween();
    }

    clearSceneFocusRef.current = () => {
      selectedTarget = null;
      rocketController.clearTransfer();
      focusTarget = returnTarget.clone();
      cameraFocusPosition = returnCameraPosition.clone();
      returnTweenStartedAt = performance.now();
    };

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

    function selectPlanet(project: PortfolioProject, mesh: THREE.Mesh) {
      setSelectedProject(project);
      setProfileOpen(false);
      const runtime = planetRuntimes.find((item) => item.mesh === mesh);

      if (!selectedTarget) {
        returnCameraPosition = camera.position.clone();
        returnTarget = controls.target.clone();
      }

      selectedTarget = runtime ? { type: "planet", runtime } : null;

      if (runtime) {
        rocketController.beginTransfer({ type: "planet", runtime });
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
      cameraFocusPosition = visibleFocusTarget
        .clone()
        .add(direction.multiplyScalar(72));
    }

    function selectSun() {
      setSelectedProject(null);
      setProfileOpen(true);

      if (!selectedTarget) {
        returnCameraPosition = camera.position.clone();
        returnTarget = controls.target.clone();
      }

      selectedTarget = { type: "sun" };
      rocketController.beginTransfer({ type: "sun" });
      returnTweenStartedAt = null;
      controls.autoRotate = false;
      focusTarget = new THREE.Vector3(0, 0, 0);

      const direction = camera.position.clone().normalize();
      cameraFocusPosition = direction.multiplyScalar(92);
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
        [sun.hitArea, sun.mesh],
        false,
      );

      return sunIntersections.length > 0 ? { type: "sun" as const } : null;
    }

    function handlePointerMove(event: PointerEvent) {
      if (rocketController.isIntroActive()) {
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
      if (rocketController.isIntroActive()) {
        rocketController.completeIntro();
        return;
      }

      cancelReturnTweenOnUserInput();
      updatePointerFromEvent(event);
      tapCandidate = {
        pointerType: event.pointerType,
        target: getHoveredTarget(),
        time: performance.now(),
        x: event.clientX,
        y: event.clientY,
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
      const movement = Math.hypot(
        event.clientX - candidate.x,
        event.clientY - candidate.y,
      );

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
      if (rocketController.isIntroActive()) {
        rocketController.completeIntro();
        return;
      }

      cancelReturnTweenOnUserInput();
    }

    function handleControlsStart() {
      cancelReturnTweenOnUserInput();
    }

    function handleResize() {
      const width = mountElement.clientWidth;
      const height = mountElement.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function animate() {
      const currentTime = performance.now();
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      setPlanetPositions(delta);
      updateLightingState({
        hoveredTarget,
        planetRuntimes,
        selectedTarget,
        sun,
      });

      if (rocketController.isIntroActive()) {
        rocketController.updateIntro(currentTime);
      } else {
        rocketController.updateOrbit(delta, selectedTarget);

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
      sun.mesh.rotation.y += 0.006;
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
    // Auto-open profile if ?profile=true query param is present
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("profile") === "true") {
      rocketController.completeIntro();
      selectSun();
    }

    animate();

    return () => {
      clearSceneFocusRef.current = () => {};
      window.cancelAnimationFrame(animationFrame);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      controls.removeEventListener("start", handleControlsStart);
      window.removeEventListener("resize", handleResize);
      disposeThreeScene({ controls, mount: mountElement, renderer, scene });
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
