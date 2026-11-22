import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildHome } from './home/Home.js';
import { buildHomeLighting } from './home/Lighting.js';

const loading = document.querySelector('#loading');
const startScreen = document.querySelector('#start-screen');
const startButton = document.querySelector('#start-button');
const errorBox = document.querySelector('#error');

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777e79);
  scene.fog = new THREE.Fog(0x777e79, 24, 68);

  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 120);
  camera.position.set(0, 1.68, 7.1);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.info.autoReset = true;
  document.body.appendChild(renderer.domElement);

  // A neutral indoor environment gives wood, glass and metal believable reflections.
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
  pmremGenerator.dispose();

  // Lighting is separated from geometry so it can be tuned without rebuilding rooms.
  buildHomeLighting(THREE, scene);

  // Exterior ground gives the entrance a visible approach.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x454a43, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.24;
  ground.receiveShadow = true;
  scene.add(ground);

  const home = buildHome(THREE);
  scene.add(home);

  const controls = new PointerLockControls(camera, renderer.domElement);
  const keys = { forward: false, backward: false, left: false, right: false };
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const clock = new THREE.Clock();

  function keyChange(event, pressed) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': keys.forward = pressed; break;
      case 'KeyS': case 'ArrowDown': keys.backward = pressed; break;
      case 'KeyA': case 'ArrowLeft': keys.left = pressed; break;
      case 'KeyD': case 'ArrowRight': keys.right = pressed; break;
    }
  }
  addEventListener('keydown', e => keyChange(e, true));
  addEventListener('keyup', e => keyChange(e, false));
  startButton.addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => startScreen.classList.add('hidden'));
  controls.addEventListener('unlock', () => startScreen.classList.remove('hidden'));

  loading.classList.add('hidden');
  setTimeout(() => {
    loading.style.display = 'none';
    startScreen.classList.remove('hidden');
  }, 450);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    if (controls.isLocked) {
      direction.set(
        Number(keys.right) - Number(keys.left),
        0,
        Number(keys.backward) - Number(keys.forward)
      );
      if (direction.lengthSq() > 0) direction.normalize();
      const speed = 3.0;
      velocity.x = THREE.MathUtils.damp(velocity.x, direction.x * speed, 12, delta);
      velocity.z = THREE.MathUtils.damp(velocity.z, direction.z * speed, 12, delta);
      controls.moveRight(velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      // Temporary outer bounds; room-by-room wall collision is a later gameplay task.
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.55, 5.55);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.55, 7.8);
      camera.position.y = 1.68;
    }
    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  });
} catch (error) {
  loading.classList.add('hidden');
  errorBox.textContent = 'Не удалось запустить сцену. Проверь подключение к интернету и поддержку WebGL.\\n' + error.message;
  errorBox.classList.remove('hidden');
  console.error(error);
}
