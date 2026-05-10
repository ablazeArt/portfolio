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

function crater(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color = "rgba(20, 14, 12, 0.28)",
) {
  context.save();
  context.translate(x, y);
  context.scale(1, 0.62 + Math.random() * 0.34);
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = Math.max(1, radius * 0.18);
  context.strokeStyle = "rgba(255, 235, 188, 0.16)";
  context.stroke();
  context.restore();
}

function wavyBand(
  context: CanvasRenderingContext2D,
  y: number,
  color: string,
  lineWidth: number,
  amplitude: number,
  phase = 0,
) {
  context.beginPath();
  context.moveTo(0, y);

  for (let x = 0; x <= context.canvas.width; x += 32) {
    context.lineTo(
      x,
      y +
        Math.sin(x * 0.018 + phase) * amplitude +
        Math.sin(x * 0.041 + y * 0.02) * (amplitude * 0.42),
    );
  }

  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.stroke();
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
      for (let index = 0; index < 54; index += 1) {
        crater(
          context,
          Math.random() * width,
          Math.random() * height,
          5 + Math.random() * 20,
          "rgba(39, 31, 27, 0.36)",
        );
      }
      for (let index = 0; index < 18; index += 1) {
        wavyBand(
          context,
          Math.random() * height,
          "rgba(248, 218, 164, 0.08)",
          3 + Math.random() * 7,
          12 + Math.random() * 22,
          Math.random() * Math.PI * 2,
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
        wavyBand(
          context,
          y,
          "rgba(255, 230, 154, 0.28)",
          18,
          18,
          y * 0.04,
        );
      }
      for (let index = 0; index < 44; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          70 + Math.random() * 160,
          8 + Math.random() * 28,
          "rgba(255, 246, 196, 0.16)",
          Math.random() * Math.PI,
        );
      }
      for (let y = 24; y < height; y += 34) {
        wavyBand(
          context,
          y,
          "rgba(125, 50, 31, 0.12)",
          6,
          10,
          y * 0.02,
        );
      }
      drawNoise(context, width, height, 0.12);
      break;
    }
    case "Earth": {
      const oceanGradient = context.createLinearGradient(0, 0, width, height);
      oceanGradient.addColorStop(0, "#0b3f8a");
      oceanGradient.addColorStop(0.42, "#176ca3");
      oceanGradient.addColorStop(0.72, "#0b456f");
      oceanGradient.addColorStop(1, "#062946");
      context.fillStyle = oceanGradient;
      context.fillRect(0, 0, width, height);

      const landColors = ["#2f8f62", "#66a85f", "#b7a968", "#246e4e"];
      const continents = [
        [width * 0.18, height * 0.34, 96, 62, -0.42],
        [width * 0.27, height * 0.56, 64, 112, 0.22],
        [width * 0.49, height * 0.32, 128, 58, 0.1],
        [width * 0.56, height * 0.48, 72, 86, -0.18],
        [width * 0.71, height * 0.42, 148, 66, 0.24],
        [width * 0.82, height * 0.66, 88, 40, -0.18],
      ] as const;

      continents.forEach(([x, y, radiusX, radiusY, rotation], index) => {
        blob(
          context,
          x,
          y,
          radiusX,
          radiusY,
          landColors[index % landColors.length],
          rotation,
        );

        for (let detail = 0; detail < 6; detail += 1) {
          blob(
            context,
            x + (Math.random() - 0.5) * radiusX * 1.4,
            y + (Math.random() - 0.5) * radiusY * 1.2,
            18 + Math.random() * 48,
            8 + Math.random() * 26,
            landColors[(index + detail + 1) % landColors.length],
            Math.random() * Math.PI,
          );
        }
      });

      for (let index = 0; index < 22; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          24 + Math.random() * 72,
          5 + Math.random() * 16,
          "rgba(125, 204, 172, 0.22)",
          Math.random() * Math.PI,
        );
      }

      blob(context, width * 0.18, height * 0.16, 120, 38, "#edf8ff", -0.25);
      blob(context, width * 0.74, height * 0.86, 140, 44, "#edf8ff", 0.12);

      for (let index = 0; index < 64; index += 1) {
        blob(
          context,
          Math.random() * width,
          Math.random() * height,
          60 + Math.random() * 180,
          4 + Math.random() * 18,
          "rgba(255, 255, 255, 0.34)",
          Math.random() * Math.PI,
        );
      }

      for (let index = 0; index < 34; index += 1) {
        wavyBand(
          context,
          Math.random() * height,
          "rgba(202, 243, 255, 0.2)",
          3 + Math.random() * 5,
          8 + Math.random() * 18,
          Math.random() * Math.PI * 2,
        );
      }

      for (let index = 0; index < 80; index += 1) {
        context.beginPath();
        context.arc(
          Math.random() * width,
          Math.random() * height,
          0.8 + Math.random() * 1.6,
          0,
          Math.PI * 2,
        );
        context.fillStyle = "rgba(255, 226, 128, 0.24)";
        context.fill();
      }

      drawNoise(context, width, height, 0.06);
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
      for (let index = 0; index < 36; index += 1) {
        crater(
          context,
          Math.random() * width,
          Math.random() * height,
          6 + Math.random() * 26,
          "rgba(84, 34, 24, 0.26)",
        );
      }
      for (let y = 90; y < height - 80; y += 72) {
        wavyBand(
          context,
          y,
          "rgba(88, 29, 24, 0.32)",
          8 + Math.random() * 10,
          22,
          y * 0.03,
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
        wavyBand(
          context,
          y + 18,
          "rgba(255, 241, 196, 0.22)",
          5,
          8 + Math.random() * 9,
          y * 0.08,
        );
        wavyBand(
          context,
          y + 31,
          "rgba(67, 38, 28, 0.16)",
          4,
          7,
          y * 0.03,
        );
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
      blob(
        context,
        width * 0.68,
        height * 0.58,
        54,
        18,
        "rgba(255, 210, 142, 0.2)",
        -0.12,
      );
      for (let index = 0; index < 8; index += 1) {
        blob(
          context,
          Math.random() * width,
          120 + Math.random() * 280,
          42 + Math.random() * 96,
          10 + Math.random() * 24,
          "rgba(80, 42, 30, 0.18)",
          Math.random() * Math.PI,
        );
      }
      drawNoise(context, width, height, 0.1);
      break;
    }
    case "Saturn": {
      const saturnBands = ["#d9c783", "#88754e", "#f1dfa5", "#b2a06a"];
      for (let y = 0; y < height; y += 42) {
        context.fillStyle =
          saturnBands[Math.floor(y / 42) % saturnBands.length];
        context.fillRect(0, y, width, 42);
        wavyBand(
          context,
          y + 18,
          "rgba(255, 242, 186, 0.18)",
          4,
          7,
          y * 0.05,
        );
      }
      for (let y = 14; y < height; y += 24) {
        wavyBand(
          context,
          y,
          "rgba(67, 55, 37, 0.1)",
          3,
          5,
          y * 0.04,
        );
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
      blob(
        context,
        width * 0.72,
        height * 0.58,
        82,
        34,
        "rgba(13, 24, 93, 0.38)",
        -0.18,
      );
      for (let y = 42; y < height; y += 58) {
        wavyBand(
          context,
          y,
          "rgba(150, 220, 255, 0.14)",
          8,
          16,
          y * 0.02,
        );
      }
      drawNoise(context, width, height, 0.08);
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

export function createSunTexture() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create sun canvas context");
  }

  const size = 1024;
  canvas.width = size;
  canvas.height = size;

  const center = size / 2;
  const baseGradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  baseGradient.addColorStop(0, "#fffad0");
  baseGradient.addColorStop(0.4, "#fff72f");
  baseGradient.addColorStop(0.78, "#f8df14");
  baseGradient.addColorStop(1, "#e6a812");
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 170; index += 1) {
    blob(
      context,
      Math.random() * size,
      Math.random() * size,
      32 + Math.random() * 140,
      7 + Math.random() * 34,
      Math.random() > 0.45
        ? "rgba(255, 255, 210, 0.16)"
        : "rgba(244, 142, 24, 0.12)",
      Math.random() * Math.PI,
    );
  }

  for (let y = 0; y < size; y += 38) {
    context.beginPath();
    context.moveTo(0, y);

    for (let x = 0; x <= size; x += 34) {
      context.lineTo(
        x,
        y +
          Math.sin(x * 0.012 + y * 0.018) * 18 +
          Math.sin(x * 0.031) * 6,
      );
    }

    context.strokeStyle = "rgba(255, 246, 96, 0.13)";
    context.lineWidth = 10 + Math.random() * 8;
    context.stroke();
  }

  drawNoise(context, size, size, 0.08);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export function createGlowTexture(color = "255, 246, 50") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create glow canvas context");
  }

  const size = 512;
  canvas.width = size;
  canvas.height = size;

  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  gradient.addColorStop(0, `rgba(${color}, 0.95)`);
  gradient.addColorStop(0.25, `rgba(${color}, 0.48)`);
  gradient.addColorStop(0.55, `rgba(${color}, 0.16)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createEarthCloudTexture() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create earth cloud canvas context");
  }

  const cloudContext = context;
  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;
  cloudContext.clearRect(0, 0, width, height);

  function softCloud(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    opacity: number,
    rotation = 0,
  ) {
    cloudContext.save();
    cloudContext.translate(x, y);
    cloudContext.rotate(rotation);
    cloudContext.scale(radiusX, radiusY);
    const gradient = cloudContext.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.58, `rgba(255, 255, 255, ${opacity * 0.46})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    cloudContext.beginPath();
    cloudContext.arc(0, 0, 1, 0, Math.PI * 2);
    cloudContext.fillStyle = gradient;
    cloudContext.fill();
    cloudContext.restore();
  }

  const cloudSystems = [
    { x: 0.18, y: 0.24, rx: 170, ry: 34, rotation: -0.28 },
    { x: 0.38, y: 0.48, rx: 220, ry: 42, rotation: 0.2 },
    { x: 0.66, y: 0.32, rx: 190, ry: 36, rotation: -0.12 },
    { x: 0.78, y: 0.64, rx: 240, ry: 46, rotation: 0.16 },
    { x: 0.28, y: 0.74, rx: 150, ry: 30, rotation: -0.08 },
  ];

  cloudSystems.forEach((system, systemIndex) => {
    const centerX = system.x * width;
    const centerY = system.y * height;
    softCloud(
      centerX,
      centerY,
      system.rx,
      system.ry,
      0.36,
      system.rotation,
    );

    for (let index = 0; index < 8; index += 1) {
      softCloud(
        centerX + (Math.random() - 0.5) * system.rx * 1.15,
        centerY + (Math.random() - 0.5) * system.ry * 1.9,
        28 + Math.random() * 70,
        10 + Math.random() * 20,
        0.2 + Math.random() * 0.12,
        system.rotation + (Math.random() - 0.5) * 0.55,
      );
    }

    if (systemIndex % 2 === 0) {
      softCloud(
        centerX + system.rx * 0.42,
        centerY - system.ry * 0.18,
        system.rx * 0.42,
        system.ry * 0.5,
        0.24,
        system.rotation + 0.18,
      );
    }
  });

  for (let y = 46; y < height; y += 86) {
    wavyBand(
      cloudContext,
      y,
      "rgba(255, 255, 255, 0.1)",
      3 + Math.random() * 3,
      7 + Math.random() * 12,
      y * 0.045,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
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
