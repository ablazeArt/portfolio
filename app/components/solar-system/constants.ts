export const PLANET_SCALE = [2.4, 3.2, 3.4, 2.9, 5.4, 4.8, 4.1];
export const ORBIT_RADII = [28, 44, 62, 82, 112, 148, 188];
export const FOCUS_CAMERA_LERP = 0.035;
export const FOCUS_TARGET_LERP = 0.035;
export const INTRO_DURATION = 6200;
export const ORBIT_COLORS = [
  "#d7815e",
  "#f0b46e",
  "#56d7f3",
  "#cc6f59",
  "#d8bc71",
  "#d8cb73",
  "#6f8cff",
];

export function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function easeInCubic(value: number) {
  return value * value * value;
}
