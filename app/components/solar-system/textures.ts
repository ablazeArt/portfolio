import * as THREE from "three";
import type { PortfolioProject } from "@/app/data/projects";

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

export function createPlanetTexture(project: PortfolioProject) {
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

export function createLabelTexture(text: string, subtitle?: string) {
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

export function createPlanetMaterial(project: PortfolioProject) {
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
