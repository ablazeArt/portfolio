import * as THREE from "three";
import type { HoverTarget, PlanetRuntime, SunRuntime } from "./types";

export function targetMatches(left: HoverTarget, right: HoverTarget) {
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

type LightingState = {
  hoveredTarget: HoverTarget;
  planetRuntimes: PlanetRuntime[];
  selectedTarget: HoverTarget;
  sun: SunRuntime;
};

export function updateLightingState({
  hoveredTarget,
  planetRuntimes,
  selectedTarget,
  sun,
}: LightingState) {
  const hasFocusedTarget = Boolean(selectedTarget);

  planetRuntimes.forEach((runtime) => {
    const lightLevel = targetMatches(selectedTarget, { type: "planet", runtime })
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
    sun.label,
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
  const targetSunColor = sun.baseColor.clone().lerp(sun.activeColor, sunLevel);

  sun.material.color.lerp(targetSunColor, 0.16);
  sun.glowMaterial.opacity = THREE.MathUtils.lerp(
    sun.glowMaterial.opacity,
    0.72 + sunLevel * 0.24,
    0.12,
  );
  sun.glow.scale.setScalar(52 + sunLevel * 8);

  if (sun.outerGlow.material instanceof THREE.SpriteMaterial) {
    sun.outerGlow.material.opacity = THREE.MathUtils.lerp(
      sun.outerGlow.material.opacity,
      0.24 + sunLevel * 0.16,
      0.12,
    );
  }

  sun.outerGlow.scale.setScalar(92 + sunLevel * 12);
  sun.light.intensity = THREE.MathUtils.lerp(
    sun.light.intensity,
    900 + sunLevel * 460,
    0.16,
  );
  sun.mesh.scale.setScalar(1 + sunLevel * 0.05);
}
