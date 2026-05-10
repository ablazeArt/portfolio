import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function disposeThreeScene({
  controls,
  mount,
  renderer,
  scene,
}: {
  controls: OrbitControls;
  mount: HTMLDivElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
}) {
  controls.dispose();
  renderer.dispose();

  if (renderer.domElement.parentElement === mount) {
    mount.removeChild(renderer.domElement);
  }

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
}
