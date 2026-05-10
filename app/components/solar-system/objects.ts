import * as THREE from "three";

function createPointGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create point glow canvas context");
  }

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
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.34, "rgba(255, 255, 255, 0.82)");
  gradient.addColorStop(0.72, "rgba(255, 255, 255, 0.16)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const starCount = 6200;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const color = new THREE.Color();

  for (let index = 0; index < starCount; index += 1) {
    const radius = 360 + Math.random() * 1240;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const variant = Math.random();
    color.set(
      variant > 0.92 ? "#ffd98a" : variant > 0.78 ? "#9fd1ff" : "#dce8ff",
    );
    const intensity = 0.34 + Math.random() * 0.82;
    colors[index * 3] = color.r * intensity;
    colors[index * 3 + 1] = color.g * intensity;
    colors[index * 3 + 2] = color.b * intensity;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: createPointGlowTexture(),
      size: 1.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.96,
      vertexColors: true,
      alphaTest: 0.02,
      depthWrite: false,
    }),
  );
}

export function createOrbit(radius: number, ellipse: number, color: string) {
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

export function createRocket() {
  const group = new THREE.Group();

  const hullMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.2,
    metalness: 0.1,
  });

  const darkMetalMaterial = new THREE.MeshStandardMaterial({
    color: "#333333",
    roughness: 0.6,
    metalness: 0.8,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: "#ff6f4f",
    roughness: 0.4,
    metalness: 0.2,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#7bdcff",
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.0,
    transparent: true,
    opacity: 0.8,
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 3.1, 32),
    hullMaterial
  );
  group.add(body);

  const ringGeometry = new THREE.CylinderGeometry(0.51, 0.51, 0.05, 32);
  const ring1 = new THREE.Mesh(ringGeometry, darkMetalMaterial);
  ring1.position.y = 0.5;
  group.add(ring1);
  
  const ring2 = new THREE.Mesh(ringGeometry, accentMaterial);
  ring2.position.y = -0.5;
  group.add(ring2);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 1.2, 32),
    accentMaterial
  );
  nose.position.y = 2.15;
  group.add(nose);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.45, 0.5, 32),
    darkMetalMaterial
  );
  nozzle.position.y = -1.8;
  group.add(nozzle);

  const windowGroup = new THREE.Group();
  windowGroup.position.set(0, 0.8, 0.42);
  
  const windowFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.04, 16, 32),
    darkMetalMaterial
  );
  
  const windowGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 32, 32),
    glassMaterial
  );
  windowGlass.scale.z = 0.4;
  
  windowGroup.add(windowFrame);
  windowGroup.add(windowGlass);
  group.add(windowGroup);

  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.6, -0.6);
  finShape.lineTo(0.6, -1.0);
  finShape.lineTo(0, -0.4);
  finShape.lineTo(0, 0);

  const extrudeSettings = {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  };

  const finGeometry = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
  finGeometry.translate(0, 0, -0.03);

  for (let index = 0; index < 4; index += 1) {
    const fin = new THREE.Mesh(finGeometry, accentMaterial);
    const angle = (index / 4) * Math.PI * 2;
    fin.position.y = -0.8;
    
    const finWrapper = new THREE.Group();
    fin.position.x = 0.45; 
    finWrapper.rotation.y = angle;
    finWrapper.add(fin);
    group.add(finWrapper);
  }

  for (let index = 0; index < 2; index += 1) {
    const boosterGroup = new THREE.Group();
    boosterGroup.position.x = index === 0 ? 0.65 : -0.65;
    boosterGroup.position.y = -0.6;
    
    const boosterBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 1.8, 16),
      hullMaterial
    );
    
    const boosterNose = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.4, 16),
      accentMaterial
    );
    boosterNose.position.y = 1.1;
    
    const boosterNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.3, 16),
      darkMetalMaterial
    );
    boosterNozzle.position.y = -1.05;
    
    boosterGroup.add(boosterBody);
    boosterGroup.add(boosterNose);
    boosterGroup.add(boosterNozzle);
    group.add(boosterGroup);
  }

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 1.28, 24),
    new THREE.MeshBasicMaterial({
      color: "#ffd36b",
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flame.name = "rocket-flame";
  flame.position.y = -2.42;
  flame.rotation.x = Math.PI;
  group.add(flame);

  const flameLight = new THREE.PointLight("#ffb35c", 0, 28, 2);
  flameLight.position.y = -2.3;
  group.add(flameLight);

  return { group, flame, flameLight };
}

export function createRocketTrail(count = 54) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color("#ffcf7a");
  const coolColor = new THREE.Color("#7bdcff");

  for (let index = 0; index < count; index += 1) {
    const mix = index / count;
    const pointColor = color.clone().lerp(coolColor, mix * 0.6);
    colors[index * 3] = pointColor.r;
    colors[index * 3 + 1] = pointColor.g;
    colors[index * 3 + 2] = pointColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: createPointGlowTexture(),
      size: 0.82,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.62,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  return { points, positions };
}
