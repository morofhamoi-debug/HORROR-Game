import * as THREE from 'three';
import { createMaterials } from './Materials.js';
import { buildFloorDeck, buildLevelArchitecture } from './Architecture.js';
import { createFurniture } from './Furniture.js';
import { addDecor, createDust } from './Decor.js';
function addBox(scene, material, x, y, z, w, h, d) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function addTree(scene, x, z, height, mats) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.2, .34, height * .52, 8), mats.darkWood);
  trunk.position.set(x, height * .26 - .12, z); trunk.castShadow = true; scene.add(trunk);
  for (let i = 0; i < 4; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(height * (.18 + i * .012), 1), mats.grass);
    crown.position.set(x + Math.sin(i * 7) * .32, height * (.42 + i * .13) - .12, z + Math.cos(i * 5) * .3);
    crown.scale.set(1, 1.2, 1); crown.castShadow = true; scene.add(crown);
  }
}
export class House {
  constructor(scene) {
    this.scene = scene; this.materials = createMaterials();
    this.colliders = []; this.interactables = []; this.switchNodes = []; this.dust = null;
  }
  build() {
    const m = this.materials;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), m.grass);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.16, 0); ground.receiveShadow = true; this.scene.add(ground);
    const driveway = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 28), m.stone);
    driveway.rotation.x = -Math.PI / 2; driveway.position.set(0, -.105, 20); driveway.receiveShadow = true; this.scene.add(driveway);
    for (let i = 0; i < 10; i++) addBox(this.scene, m.stone, 0, -.055, 8.8 + i * 1.2, 3.6, .08, .72);
    addTree(this.scene, -17, -12, 12, m); addTree(this.scene, 18, -15, 14, m);
    addTree(this.scene, -19, 12, 10, m); addTree(this.scene, 20, 13, 13, m);
    addTree(this.scene, -12, 25, 11, m); addTree(this.scene, 13, 28, 12, m);

    for (let level = -1; level <= 1; level++) {
      buildFloorDeck(this.scene, m, this.colliders, level, level * 3.5, false);
      buildLevelArchitecture(this.scene, m, this.colliders, this.interactables, level);
      createFurniture(this.scene, m, level);
      addDecor(this.scene, m, level);
    }

    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: .84, metalness: .08 });
    const roofA = addBox(this.scene, roofMaterial, 0, 8.55, -2.25, 20.3, .25, 8.7);
    const roofB = addBox(this.scene, roofMaterial, 0, 8.55, 2.25, 20.3, .25, 8.7);
    roofA.rotation.x = -.46; roofB.rotation.x = .46;
    addBox(this.scene, m.darkWood, 0, 9.48, 0, 20.4, .24, .2);
    for (const x of [-9.7, 9.7]) {
      addBox(this.scene, m.trim, x, 6.75, 0, .16, .24, 13.5);
      addBox(this.scene, m.stone, x, -.32, 0, .35, .52, 13.15);
      addBox(this.scene, m.trim, x, 3.15, -6.52, .14, 6.2, .14);
      addBox(this.scene, m.trim, x, 3.15, 6.52, .14, 6.2, .14);
    }
    for (const x of [-2.25, 2.25]) {
      addBox(this.scene, m.darkWood, x, 2.15, 6.52, .34, .56, .26);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), m.warmGlow);
      glow.position.set(x, 2.1, 6.36); this.scene.add(glow);
    }
    this.dust = createDust(this.scene);
    this.scene.userData.house = this;
    return this;
  }
  update(dt) {
    if (!this.dust) return;
    const p = this.dust.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) + dt * (0.025 + (i % 7) * .003);
      if (y > 4.2) y = -3.5;
      p.setY(i, y);
    }
    p.needsUpdate = true;
  }
}