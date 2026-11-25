import * as THREE from 'three';
import { createMaterials } from './Materials.js';
import { buildFloorDeck, buildLevelArchitecture } from './Architecture.js';
import { createFurniture } from './Furniture.js';
import { buildStairs } from './Stairs.js';
import { addDecor, createDust } from './Decor.js';
import { HOUSE, floorY } from './Layout.js';

function addBox(scene, material, x, y, z, w, h, d, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(options.rx || 0, options.ry || 0, options.rz || 0);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  scene.add(mesh);
  return mesh;
}

function addTree(scene, x, z, height, mats) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.34, height * 0.52, 10), mats.darkWood);
  trunk.position.set(x, height * 0.26 - 0.12, z);
  trunk.castShadow = true;
  scene.add(trunk);

  for (let i = 0; i < 5; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(height * (0.16 + i * 0.012), 1), mats.grass);
    crown.position.set(x + Math.sin(i * 7) * 0.32, height * (0.42 + i * 0.115) - 0.12, z + Math.cos(i * 5) * 0.30);
    crown.scale.set(1, 1.2, 1);
    crown.castShadow = true;
    scene.add(crown);
  }
}

function buildFoundation(scene, mats) {
  const basementY = floorY(-1);
  const foundation = addBox(
    scene,
    mats.concrete,
    0,
    basementY - HOUSE.floorThickness - HOUSE.foundationThickness / 2,
    0,
    20.0,
    HOUSE.foundationThickness,
    14.0
  );
  foundation.name = 'continuous_reinforced_foundation_slab';

  // The exposed stone plinth is continuous around the facade and leaves the front doorway clear.
  addBox(scene, mats.stone, 0, -0.01, -6.70, 19.60, 0.34, 0.46);
  addBox(scene, mats.stone, -5.1375, -0.01, 6.70, 8.525, 0.34, 0.46);
  addBox(scene, mats.stone, 5.1375, -0.01, 6.70, 8.525, 0.34, 0.46);
  addBox(scene, mats.stone, -9.65, -0.01, 0, 0.46, 0.34, 13.60);
  addBox(scene, mats.stone, 9.65, -0.01, 0, 0.46, 0.34, 13.60);
}

function buildRoof(scene, mats) {
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x24272a,
    roughness: 0.88,
    metalness: 0.08
  });

  const pitch = 0.30;
  const roofRun = 6.75;
  const roofCenterZ = 3.325;
  const roofCenterY = 7.05;

  const northPitch = addBox(
    scene, roofMaterial, 0, roofCenterY, -roofCenterZ,
    20.3, 0.25, roofRun, { rx: -pitch }
  );
  const southPitch = addBox(
    scene, roofMaterial, 0, roofCenterY, roofCenterZ,
    20.3, 0.25, roofRun, { rx: pitch }
  );
  northPitch.name = 'roof_north_pitch';
  southPitch.name = 'roof_south_pitch';

  // A long ridge cap bridges the two pitched roof slabs.
  addBox(scene, mats.darkWood, 0, 8.10, 0, 20.45, 0.28, 0.34);

  // Continuous fascia at both gable ends.
  for (const x of [-9.82, 9.82]) {
    addBox(scene, mats.darkWood, x, 7.10, 0, 0.15, 2.25, 13.35);
  }

  // Gutters run along the long eaves; downpipes continue down the facade.
  for (const z of [-6.62, 6.62]) {
    const gutter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 19.8, 12),
      mats.metal
    );
    gutter.rotation.z = Math.PI / 2;
    gutter.position.set(0, 6.02, z);
    gutter.castShadow = true;
    scene.add(gutter);
    for (const x of [-8.8, 8.8]) {
      const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.8, 10), mats.metal);
      outlet.position.set(x, 3.08, z);
      outlet.castShadow = true;
      scene.add(outlet);
      for (const y of [0.55, 3.0, 5.3]) {
        addBox(scene, mats.brass, x, y, z, 0.12, 0.075, 0.12);
      }
    }
  }
}
function buildPorchDetails(scene, mats) {
  addBox(scene, mats.stone, 0, -0.10, 7.60, 4.5, 0.20, 2.10);
  for (const x of [-1.80, 1.80]) {
    addBox(scene, mats.trim, x, 1.42, 8.15, 0.22, 2.84, 0.22);
    addBox(scene, mats.trim, x, 2.90, 8.15, 0.32, 0.12, 0.32);
  }
  addBox(scene, mats.darkWood, 0, 2.95, 8.15, 4.1, 0.18, 0.30);
  addBox(scene, mats.darkWood, 0, 3.15, 8.55, 4.25, 0.12, 1.2);

  for (let i = 0; i < 3; i++) {
    addBox(scene, mats.stone, 0, -0.10 - i * 0.08, 8.35 + i * 0.42, 3.3 - i * 0.30, 0.16, 0.48);
  }
}

export class House {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'house_root';
    this.scene.add(this.root);
    this.materials = createMaterials(options.maxAnisotropy ?? 8);
    this.colliders = [];
    this.interactables = [];
    this.switchNodes = [];
    this.dust = null;
  }

  build() {
    const mats = this.materials;
    const root = this.root;

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), mats.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.16, 0);
    ground.receiveShadow = true;
    root.add(ground);

    const driveway = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 28), mats.stone);
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(0, -0.105, 20);
    driveway.receiveShadow = true;
    root.add(driveway);

    for (let i = 0; i < 10; i++) {
      addBox(root, mats.stone, 0, -0.055, 8.8 + i * 1.2, 3.6, 0.08, 0.72);
    }

    addTree(root, -17, -12, 12, mats);
    addTree(root, 18, -15, 14, mats);
    addTree(root, -19, 12, 10, mats);
    addTree(root, 20, 13, 13, mats);
    addTree(root, -12, 25, 11, mats);
    addTree(root, 13, 28, 12, mats);

    buildFoundation(root, mats);

    // Build all levels against one shared coordinate system and one shared collision registry.
    for (const level of [-1, 0, 1]) {
      buildFloorDeck(root, mats, level);
      buildLevelArchitecture(root, mats, this.colliders, this.interactables, level);
      createFurniture(root, mats, level, this.colliders);
      addDecor(root, mats, level);
    }

    buildStairs(root, mats, this.colliders);
    buildPorchDetails(root, mats);
    buildRoof(root, mats);

    for (const x of [-9.65, 9.65]) {
      addBox(root, mats.stone, x, -0.38, 0, 0.34, 0.54, 13.20);
      addBox(root, mats.trim, x, 4.55, -6.48, 0.14, 2.8, 0.14);
      addBox(root, mats.trim, x, 4.55, 6.48, 0.14, 2.8, 0.14);
    }

    for (const x of [-2.25, 2.25]) {
      addBox(root, mats.darkWood, x, 2.15, 6.52, 0.34, 0.56, 0.26);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mats.warmGlow);
      glow.position.set(x, 2.10, 6.36);
      root.add(glow);
    }

    this.dust = createDust(root);
    root.userData.house = this;
    this.scene.userData.house = this;
    return this;
  }

  dispose() {
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.root.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of list) {
        materials.add(material);
        for (const [key, value] of Object.entries(material)) {
          if (key.endsWith('Map') && value?.isTexture) textures.add(value);
        }
      }
    });
    for (const material of Object.values(this.materials)) {
      materials.add(material);
      for (const [key, value] of Object.entries(material)) {
        if (key.endsWith('Map') && value?.isTexture) textures.add(value);
      }
    }
    for (const texture of textures) texture.dispose();
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
    this.root.removeFromParent();
    if (this.scene.userData.house === this) delete this.scene.userData.house;
  }

  update(dt) {
    if (!this.dust) return;
    const positions = this.dust.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i) + dt * (0.025 + (i % 7) * 0.003);
      if (y > 5.9) y = -2.45;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  }
}
