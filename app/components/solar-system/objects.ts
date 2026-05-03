import * as THREE from "three";

export function createStarField() {
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

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 3.1, 24),
    new THREE.MeshStandardMaterial({
      color: "#eef4ff",
      roughness: 0.36,
      metalness: 0.18,
    }),
  );
  group.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 0.9, 24),
    new THREE.MeshStandardMaterial({
      color: "#ff6f4f",
      roughness: 0.42,
      metalness: 0.08,
    }),
  );
  nose.position.y = 2;
  group.add(nose);

  const rocketWindow = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 18, 18),
    new THREE.MeshBasicMaterial({ color: "#7bdcff" }),
  );
  rocketWindow.position.set(0, 0.72, 0.42);
  group.add(rocketWindow);

  const finMaterial = new THREE.MeshStandardMaterial({
    color: "#7bdcff",
    emissive: "#1b7188",
    emissiveIntensity: 0.28,
    roughness: 0.42,
  });

  for (let index = 0; index < 3; index += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.52), finMaterial);
    const angle = (index / 3) * Math.PI * 2;
    fin.position.set(Math.cos(angle) * 0.42, -1.18, Math.sin(angle) * 0.42);
    fin.rotation.y = -angle;
    group.add(fin);
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
  flame.position.y = -2.12;
  flame.rotation.x = Math.PI;
  group.add(flame);

  const flameLight = new THREE.PointLight("#ffb35c", 0, 28, 2);
  flameLight.position.y = -2;
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
