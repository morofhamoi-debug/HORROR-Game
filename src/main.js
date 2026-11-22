import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildHome } from './home/Home.js';
import { buildHomeLighting } from './home/Lighting.js';
import { createCollisionWorld } from './player/Collision.js';
import { createTouchControls } from './player/TouchControls.js';
import { createInteractionSystem } from './player/Interaction.js';
import { createFlashlight } from './player/Flashlight.js';
import { createAudioManager } from './audio/AudioManager.js';

const loading = document.querySelector('#loading');
const startScreen = document.querySelector('#start-screen');
const startButton = document.querySelector('#start-button');
const errorBox = document.querySelector('#error');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
document.body.classList.toggle('touch-device', isTouchDevice);

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777e79);
  scene.fog = new THREE.Fog(0x777e79, 24, 68);

  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 120);
  camera.position.set(0, 1.68, 7.1);
  // The camera is part of the scene so camera-mounted lights (flashlight) render correctly.
  scene.add(camera);

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

  buildHomeLighting(THREE, scene);

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

  const audio = createAudioManager();
  const controls = new PointerLockControls(camera, renderer.domElement);
  const collisionWorld = createCollisionWorld();
  const touchControls = createTouchControls({ renderer, camera, enabled: isTouchDevice });
  const interaction = createInteractionSystem({
    THREE,
    camera,
    roots: home.userData.interactables || [],
    collisionWorld,
    audio
  });
  const flashlight = createFlashlight(THREE, camera, audio);
  const keys = { forward: false, backward: false, left: false, right: false };
  const velocity = new THREE.Vector2();
  const clock = new THREE.Clock();
  let touchStarted = false;
  let footstepDistance = 0;

  function getFootstepSurface(x, z) {
    if (z > 5.1) return 'stone';
    if (x < -4.45 && z > 1.0) return 'tile'; // bathroom tile
    if (x > 2.05 && z < 0.8) return 'tile'; // kitchen tile
    if (x > 1.75 && z > 1.15) return 'carpet'; // bedroom rug and soft floor
    if (x < -2.15 && z < -1.25) return 'carpet'; // living-room rug
    return 'wood';
  }

  function keyChange(event, pressed) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': keys.forward = pressed; break;
      case 'KeyS': case 'ArrowDown': keys.backward = pressed; break;
      case 'KeyA': case 'ArrowLeft': keys.left = pressed; break;
      case 'KeyD': case 'ArrowRight': keys.right = pressed; break;
      case 'KeyE':
        if (pressed && !event.repeat) {
          if (interaction.isInspecting()) interaction.closeInspection();
          else interaction.interact();
        }
        break;
      case 'KeyF': if (pressed && !event.repeat) flashlight.toggle(); break;
      case 'Escape': if (pressed) interaction.closeInspection(); break;
    }
  }

  addEventListener('keydown', event => keyChange(event, true));
  addEventListener('keyup', event => keyChange(event, false));
  addEventListener('blur', () => {
    Object.keys(keys).forEach(key => { keys[key] = false; });
    velocity.set(0, 0);
  });

  startButton.addEventListener('click', () => {
    audio.start();
    if (isTouchDevice) {
      touchStarted = true;
      startScreen.classList.add('hidden');
    } else {
      controls.lock();
    }
  });
  controls.addEventListener('lock', () => startScreen.classList.add('hidden'));
  controls.addEventListener('unlock', () => {
    if (!interaction.isInspecting()) startScreen.classList.remove('hidden');
  });

  loading.classList.add('hidden');
  setTimeout(() => {
    loading.style.display = 'none';
    startScreen.classList.remove('hidden');
  }, 450);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const active = controls.isLocked || (touchControls.enabled && touchStarted);

    if (active) {
      const touchInput = touchControls.enabled ? touchControls.getInput() : null;
      let inputX = touchInput ? touchInput.x : Number(keys.right) - Number(keys.left);
      let inputForward = touchInput ? touchInput.y : Number(keys.forward) - Number(keys.backward);

      const inputLength = Math.hypot(inputX, inputForward);
      if (inputLength > 1) {
        inputX /= inputLength;
        inputForward /= inputLength;
      }

      const speed = 3.0;
      velocity.x = THREE.MathUtils.damp(velocity.x, inputX * speed, 12, delta);
      velocity.y = THREE.MathUtils.damp(velocity.y, inputForward * speed, 12, delta);

      // Convert camera-relative input into world-space movement.
      const yaw = camera.rotation.y;
      const cosine = Math.cos(yaw);
      const sine = Math.sin(yaw);
      const deltaX = (cosine * velocity.x - sine * velocity.y) * delta;
      const deltaZ = (-sine * velocity.x - cosine * velocity.y) * delta;

      const previousX = camera.position.x;
      const previousZ = camera.position.z;
      collisionWorld.move(camera.position, deltaX, deltaZ);
      camera.position.y = 1.68;

      const travelled = Math.hypot(camera.position.x - previousX, camera.position.z - previousZ);
      if (travelled > 0.0005) {
        footstepDistance += travelled;
        const surface = getFootstepSurface(camera.position.x, camera.position.z);
        const stepLength = surface === 'carpet' ? 0.92 : 0.82;
        if (footstepDistance >= stepLength) {
          footstepDistance %= stepLength;
          const movementIntensity = THREE.MathUtils.clamp(Math.hypot(velocity.x, velocity.y) / speed, .45, 1);
          audio.playFootstep(surface, { x: camera.position.x, y: 0.05, z: camera.position.z }, movementIntensity);
        }
      }
    } else {
      velocity.set(0, 0);
    }

    interaction.update(delta);
    audio.update(delta, camera);
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
  errorBox.textContent = 'Не удалось запустить сцену. Проверь подключение к интернету и поддержку WebGL.\n' + error.message;
  errorBox.classList.remove('hidden');
  console.error(error);
}
