import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { buildHome } from './home/Home.js';

const loading = document.querySelector('#loading');
const startScreen = document.querySelector('#start-screen');
const startButton = document.querySelector('#start-button');
const errorBox = document.querySelector('#error');

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8c928d);
  scene.fog = new THREE.Fog(0x8c928d, 18, 48);

  const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.68, 7.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xdce2df, 0x38332c, 1.25));
  const sun = new THREE.DirectionalLight(0xffe8c9, 2.0);
  sun.position.set(-7, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);

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
  setTimeout(() => { loading.style.display = 'none'; startScreen.classList.remove('hidden'); }, 450);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    if (controls.isLocked) {
      direction.set(Number(keys.right) - Number(keys.left), 0, Number(keys.backward) - Number(keys.forward));
      if (direction.lengthSq() > 0) direction.normalize();
      const speed = 3.0;
      velocity.x = THREE.MathUtils.damp(velocity.x, direction.x * speed, 12, delta);
      velocity.z = THREE.MathUtils.damp(velocity.z, direction.z * speed, 12, delta);
      controls.moveRight(velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      // Keep the player inside the first house block until room collision is added.
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.45, 5.45);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.45, 4.45);
      camera.position.y = 1.68;
    }
    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  });
} catch (error) {
  loading.classList.add('hidden');
  errorBox.textContent = 'Не удалось запустить сцену. Проверь подключение к интернету и поддержку WebGL.\n' + error.message;
  errorBox.classList.remove('hidden');
  console.error(error);
}