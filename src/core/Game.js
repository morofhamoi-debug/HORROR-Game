import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { House } from '../world/House.js';
import { createLighting } from '../world/Lighting.js';
import { Input } from './Input.js';
import { Player } from './Player.js';
import { HUD } from '../ui/HUD.js';
export class Game {
  constructor(elements) {
    this.elements = elements; this.running = false; this.composer = null; this.clock = new THREE.Timer();
    this.clock.connect(document);
    this.interactionTarget = null; this.quality = 'ULTRA'; this.tmpDirection = new THREE.Vector3(); this.tmpPosition = new THREE.Vector3();
    this.renderer = new THREE.WebGLRenderer({ canvas: elements.canvas, antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.transmissionResolutionScale = this.isMobile() ? 0.6 : 0.85;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile() ? 1.45 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x090b10); this.scene.fog = new THREE.FogExp2(0x11131a, .018);
    this.camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, .08, 140); this.camera.rotation.order = 'YXZ';
    this.input = new Input(elements.canvas); this.hud = new HUD(); this.onResize = () => this.resize();
  }
  isMobile() { return matchMedia('(pointer: coarse)').matches || window.innerWidth < 760; }
  async init() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = new RoomEnvironment(); this.scene.environment = pmrem.fromScene(envScene, .04).texture;
    pmrem.dispose(); envScene.dispose?.();
    this.house = new House(this.scene); this.house.build();
    this.lights = createLighting(this.scene, this.house);
    this.player = new Player(this.camera, this.input, this.house.colliders); this.player.reset();
    this.hud.setQuality(this.quality); this.hud.setFloor(0); this.hud.setInteraction('');
    this.hud.setObjective('Осмотритесь. Изучите дом.');
    this.input.onInteract = () => this.interact();
    this.input.onPause = () => { this.pause(); this.elements.pause.classList.remove('hidden'); };
    this.input.onMobileMenu = () => { this.pause(); this.elements.pause.classList.remove('hidden'); };
    this.elements.canvas.addEventListener('click', () => {
      if (this.running && !this.isMobile() && !document.pointerLockElement) this.elements.canvas.requestPointerLock?.();
    });
    this.setupPostProcessing();
    window.addEventListener('resize', this.onResize, { passive: true });
    this.renderer.compile(this.scene, this.camera);
    this.resize();
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    return this;
  }
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile() ? 1.45 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    if (this.composer) {
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  setupPostProcessing() {
    if (this.isMobile()) {
      this.quality = 'ULTRA MOBILE';
      this.hud.setQuality(this.quality);
      return;
    }
    try {
      const width = window.innerWidth, height = window.innerHeight;
      const composer = new EffectComposer(this.renderer);
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      composer.setSize(width, height);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const gtao = new GTAOPass(this.scene, this.camera, width, height);
      gtao.blendIntensity = 0.82;
      gtao.updateGtaoMaterial({ radius: 0.34, samples: 16 });
      composer.addPass(gtao);
      const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.16, 0.32, 0.88);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      this.composer = composer;
      this.quality = 'ULTRA · GTAO';
      this.hud.setQuality(this.quality);
    } catch (error) {
      console.warn('Post-processing disabled; using direct renderer.', error);
      this.composer = null;
      this.quality = 'ULTRA';
      this.hud.setQuality(this.quality);
    }
  }
  start() {
    this.running = true; this.clock.reset(); this.input.enabled = true;
    if (!this.isMobile() && this.elements.canvas.requestPointerLock) this.elements.canvas.requestPointerLock();
    this.animate();
  }
  resume() {
    this.running = true; this.clock.reset(); this.input.enabled = true;
    if (!this.isMobile() && document.pointerLockElement !== this.elements.canvas) this.elements.canvas.requestPointerLock?.();
    this.animate();
  }
  pause() {
    if (!this.running) return;
    this.running = false; this.input.enabled = false;
    if (document.pointerLockElement) document.exitPointerLock?.();
  }
  restart() { this.player.reset(); this.hud.setFloor(0); this.hud.setObjective('Осмотритесь. Изучите дом.'); this.resume(); }
  interact() {
    const eye = this.camera.position, forward = this.camera.getWorldDirection(this.tmpDirection);
    let best = null, bestDistance = 2.65;
    for (const item of this.house.interactables) {
      if (!item.object || !item.object.visible) continue;
      item.object.getWorldPosition(this.tmpPosition);
      const delta = this.tmpPosition.clone().sub(eye), distance = delta.length();
      if (distance > bestDistance) continue;
      delta.normalize(); if (delta.dot(forward) < .58) continue;
      best = item; bestDistance = distance;
    }
    if (best) {
      best.action();
      if (best.kind === 'door') this.hud.setObjective(best.open ? 'Дверь открыта.' : 'Дверь закрыта.');
      else if (best.kind === 'switch') this.hud.setObjective(best.on ? 'Свет включён.' : 'Свет выключен.');
      this.interactionTarget = null;
    }
  }
  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), .05);
    this.player.update(dt); this.camera.rotation.y = this.input.yaw; this.camera.rotation.x = this.input.pitch;
    this.house.update(dt); this.lights.update(dt); this.updateInteractionHint(); this.hud.setFloor(this.player.level);
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
  updateInteractionHint() {
    const eye = this.camera.position, forward = this.camera.getWorldDirection(this.tmpDirection);
    let target = null, bestDistance = 2.65;
    for (const item of this.house.interactables) {
      item.object.getWorldPosition(this.tmpPosition);
      const delta = this.tmpPosition.clone().sub(eye), distance = delta.length();
      if (distance < bestDistance && delta.normalize().dot(forward) > .58) { target = item; bestDistance = distance; }
    }
    if (target !== this.interactionTarget) {
      this.interactionTarget = target;
      const label = target ? (target.kind === 'door' ? (target.open ? 'Закрыть дверь' : 'Открыть дверь') : (target.on ? 'Выключить свет' : 'Включить свет')) : '';
      this.hud.setInteraction(label);
    }
  }
}