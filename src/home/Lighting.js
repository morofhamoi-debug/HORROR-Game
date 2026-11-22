import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function buildHomeLighting(THREE, scene) {
  // Cool daylight gently enters through the windows.
  const windowLights = [
    [-3.8, 1.75, -4.35],
    [1.25, 1.75, -4.35],
    [-5.35, 1.72, -1.0],
    [5.35, 1.72, 1.4]
  ];
  for (const [x, y, z] of windowLights) {
    const light = new THREE.PointLight(0xb9d3e5, 2.8, 5.2, 2);
    light.position.set(x, y, z);
    light.castShadow = false;
    scene.add(light);
  }

  // A low, cool ambient fill keeps dark corners readable without flattening shadows.
  const ambient = new THREE.HemisphereLight(0xdbe5eb, 0x302820, 0.72);
  scene.add(ambient);

  // Neutral outdoor key light; the interior fixtures provide the warmer pools of light.
  const sun = new THREE.DirectionalLight(0xffe5c8, 1.35);
  sun.position.set(-8, 11, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 32;
  sun.shadow.bias = -0.00018;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun);
  scene.add(sun.target);

  return { sun, ambient };
}
