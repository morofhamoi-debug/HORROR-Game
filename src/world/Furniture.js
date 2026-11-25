import * as THREE from 'three';

function blocker(colliders, x, z, w, d, level) {
  colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, level, enabled: true });
}

function box(group, mat, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}
function cylinder(group, mat, x, y, z, rTop, rBottom, h, sides = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, sides), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}
function legSet(group, mat, x, z, y, w, d, h) {
  for (const xx of [-1, 1]) for (const zz of [-1, 1]) box(group, mat, x + xx * w / 2, y + h / 2, z + zz * d / 2, .09, h, .09);
}
function table(group, mats, x, y, z, w = 1.8, d = 1.0) {
  box(group, mats.darkWood, x, y + .77, z, w, .13, d);
  legSet(group, mats.darkWood, x, z, y, w - .18, d - .18, .74);
  box(group, mats.trim, x, y + .84, z, w - .12, .025, d - .12);
}
function sofa(group, mats, x, y, z, rotation = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotation; group.add(g);
  box(g, mats.leather, 0, .34, 0, 2.65, .42, .94);
  box(g, mats.leather, 0, .77, -.37, 2.65, .72, .24);
  for (const s of [-1, 1]) box(g, mats.leather, s * 1.25, .57, .02, .22, .65, .94);
  for (const s of [-.83, 0, .83]) box(g, mats.fabric, s, .6, -.02, .76, .2, .72);
  box(g, mats.darkWood, 0, .1, .02, 2.5, .12, .82);
  for (const s of [-1, 1]) for (const z of [-.3, .3]) box(g, mats.darkWood, s * 1.07, .06, z, .08, .12, .08);
}
function bed(group, mats, x, y, z, w = 2.2, d = 2.7) {
  box(group, mats.darkWood, x, y + .34, z, w, .52, d);
  box(group, mats.fabric, x, y + .66, z + .04, w - .14, .22, d - .16);
  box(group, mats.ceiling, x, y + .79, z - d * .32, w - .18, .16, .72);
  box(group, mats.trim, x, y + .8, z - d * .34, .7, .12, .48);
  box(group, mats.trim, x + .68, y + .8, z - d * .34, .7, .12, .48);
  box(group, mats.darkWood, x, y + .9, z - d / 2 - .1, w + .12, 1.25, .16);
  box(group, mats.darkWood, x, y + .1, z + d / 2 - .12, w + .1, .22, .18);
}
function cabinet(group, mats, x, y, z, w, h, d, rotation = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotation; group.add(g);
  box(g, mats.darkWood, 0, h / 2, 0, w, h, d);
  for (let i = 0; i < 2; i++) {
    box(g, mats.woodFloor, (i - .5) * (w / 2), h * .55, d / 2 + .018, w / 2 - .07, h * .75, .04);
    box(g, mats.brass, (i - .5) * (w / 2) + (i === 0 ? .28 : -.28), h * .55, d / 2 + .055, .045, .045, .045);
  }
}
function plant(group, mats, x, y, z, scale = 1) {
  cylinder(group, mats.ceramic, x, y + .22 * scale, z, .28 * scale, .22 * scale, .44 * scale, 18);
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.399;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.12 * scale, 10, 8), mats.grass);
    leaf.scale.set(.65, 2.2, .65);
    leaf.position.set(x + Math.cos(angle) * .17 * scale, y + (.63 + (i % 3) * .08) * scale, z + Math.sin(angle) * .17 * scale);
    leaf.rotation.z = Math.cos(angle) * .55; leaf.rotation.x = Math.sin(angle) * .4;
    leaf.castShadow = true; group.add(leaf);
  }
}

export function createFurniture(scene, mats, level, colliders = []) {
  const group = new THREE.Group();
  group.name = 'furniture_level_' + level;
  scene.add(group);
  const y = level * 3.5;
  const tile = level === -1;
  const roomMat = tile ? mats.tile : mats.woodFloor;

  if (level === 0) {
    // North-west: the living room.
    box(group, mats.rug, -5.1, y + .025, -3.35, 6.1, .04, 4.7);
    sofa(group, mats, -5.1, y, -4.9, 0);
    blocker(colliders, -5.1, -4.9, 2.65, .94, level);
    sofa(group, mats, -5.1, y, -1.35, Math.PI);
    blocker(colliders, -5.1, -1.35, 2.65, .94, level);
    table(group, mats, -5.1, y, -3.2, 1.45, .9);
    blocker(colliders, -5.1, -3.2, 1.45, .9, level);
    cabinet(group, mats, -8.25, y, -3.2, .35, 1.25, 2.6, 0);
    blocker(colliders, -8.25, -3.2, .42, 2.6, level);
    box(group, mats.black, -9.34, y + 1.65, -3.2, .06, 1.7, 2.2);
    box(group, mats.screen, -9.29, y + 1.67, -3.2, .04, 1.48, 1.98);
    plant(group, mats, -2.25, y, -5.65, 1.25);
    // North-east: kitchen and island.
    for (let i = 0; i < 5; i++) {
      const x = 1.4 + i * 1.46;
      box(group, mats.trim, x, y + .48, -5.75, 1.32, .92, .72);
      box(group, mats.darkWood, x, y + .96, -5.75, 1.38, .1, .78);
      box(group, mats.darkWood, x, y + .48, -5.36, 1.2, .72, .035);
      blocker(colliders, x, -5.75, 1.32, .72, level);
      box(group, mats.brass, x + .42, y + .5, -5.31, .035, .22, .035);
    }
    box(group, mats.darkWood, 4.65, y + .98, -3.65, 3.6, .14, 1.35);
    box(group, mats.trim, 4.65, y + .9, -3.65, 3.45, .04, 1.2);
    blocker(colliders, 4.65, -3.65, 3.6, 1.35, level);
    for (let i = 0; i < 3; i++) {
      box(group, mats.darkWood, 3.2 + i * 1.45, y + .47, -2.8, .48, .9, .48);
      box(group, mats.fabric, 3.2 + i * 1.45, y + .95, -2.8, .5, .12, .5);
    }
    // South-east: dining area.
    box(group, mats.rug, 4.55, y + .025, 3.45, 5.1, .04, 4.4);
    table(group, mats, 4.65, y, 3.45, 2.35, 1.2);
    blocker(colliders, 4.65, 3.45, 2.35, 1.2, level);
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1;
      const z = 3.45 + (i % 2 ? .72 : -.72);
      box(group, mats.darkWood, 4.65 + side * 1.48, y + .48, z, .52, .88, .52);
      box(group, mats.fabric, 4.65 + side * 1.48, y + .94, z, .56, .12, .56);
    }
    // South-west: study and entry bench.
    table(group, mats, -5.4, y, 3.8, 2.1, .9);
    blocker(colliders, -5.4, 3.8, 2.1, .9, level);
    cabinet(group, mats, -8.2, y, 4.4, .65, 2.15, 2.4);
    blocker(colliders, -8.2, 4.4, .65, 2.4, level);
    box(group, mats.leather, -4.8, y + .48, 5.05, 1.2, .76, .8);
    blocker(colliders, -4.8, 5.05, 1.2, .8, level);
    plant(group, mats, -2.4, y, 5.25, .9);
  }

  if (level === 1) {
    // Primary suite north-west.
    bed(group, mats, -5.2, y, -3.2, 2.5, 3.05);
    blocker(colliders, -5.2, -3.2, 2.5, 3.05, level);
    cabinet(group, mats, -8.5, y, -3.5, .55, 2.3, 2.4);
    blocker(colliders, -8.5, -3.5, .6, 2.4, level);
    table(group, mats, -2.55, y, -4.8, 1.2, .62);
    // Bedroom north-east.
    bed(group, mats, 4.2, y, -3.4, 2.1, 2.7);
    blocker(colliders, 4.2, -3.4, 2.1, 2.7, level);
    cabinet(group, mats, 8.2, y, -4.6, .6, 2.2, 2.3);
    box(group, mats.rug, 4.2, y + .025, -3.2, 3.7, .04, 4.1);
    // Child / guest room south-west.
    bed(group, mats, -5.25, y, 3.2, 2, 2.55);
    blocker(colliders, -5.25, 3.2, 2, 2.55, level);
    table(group, mats, -2.55, y, 4.55, 1.4, .72);
    cabinet(group, mats, -8.45, y, 4.25, .5, 1.9, 2);
    // Bathroom south-east: double vanity, tub and shower screen.
    box(group, mats.tile, 4.3, y + .025, 3.45, 5.5, .04, 5.5);
    box(group, mats.ceramic, 7.45, y + .35, 4.75, 2.1, .65, 1.2);
    blocker(colliders, 7.45, 4.75, 2.1, 1.2, level);
    box(group, mats.ceramic, 4.1, y + .48, 5.25, 1.5, .95, .72);
    blocker(colliders, 4.1, 5.25, 1.5, .72, level);
    box(group, mats.mirror, 4.1, y + 1.65, 4.78, 1.55, 1.35, .06);
    box(group, mats.trim, 4.1, y + .99, 4.78, 1.7, .06, .12);
    cylinder(group, mats.metal, 7.6, y + 1.85, 2.35, .035, .035, 1.5, 12);
    box(group, mats.glass, 7.1, y + 1.15, 2.45, .07, 2.2, 2.2);
    plant(group, mats, 1.9, y, 5.55, .75);
  }

  if (level === -1) {
    // Utility / boiler room.
    box(group, mats.concrete, -5.1, y + .03, -3.1, 6.1, .05, 5.4);
    box(group, mats.metal, -7.4, y + 1.3, -4.2, 1.6, 2.6, 1.25);
    blocker(colliders, -7.4, -4.2, 1.6, 1.25, level);
    box(group, mats.metal, -7.4, y + 2.65, -4.2, .95, .12, .82);
    for (let i = 0; i < 4; i++) cylinder(group, mats.brass, -8.1 + i * .45, y + 1.4, -3.5, .045, .045, 2.1, 12);
    // Laundry.
    box(group, mats.ceramic, 3.2, y + .48, -4.8, 1.35, .95, 1.2);
    box(group, mats.metal, 3.2, y + .48, -4.8, 1.15, .8, 1.08);
    blocker(colliders, 3.2, -4.8, 1.35, 1.2, level);
    cylinder(group, mats.black, 3.2, y + .48, -4.23, .3, .3, .08, 24).rotation.x = Math.PI / 2;
    box(group, mats.ceramic, 5.05, y + .48, -4.8, 1.35, .95, 1.2);
    box(group, mats.metal, 5.05, y + .48, -4.8, 1.15, .8, 1.08);
    blocker(colliders, 5.05, -4.8, 1.35, 1.2, level);
    cylinder(group, mats.black, 5.05, y + .48, -4.23, .3, .3, .08, 24).rotation.x = Math.PI / 2;
    // Storage shelving.
    for (let i = 0; i < 3; i++) {
      const z = 1.5 + i * 1.45;
      box(group, mats.darkWood, -8.1, y + 1.1, z, 2.1, .12, .5);
      for (let j = 0; j < 3; j++) box(group, mats.trim, -8.8 + j * .68, y + .5 + (j % 2) * .12, z, .55, .8, .4);
      box(group, mats.darkWood, -8.1, y + 2.2, z, 2.1, .12, .5);
    }
    // Workshop bench and vice.
    table(group, mats, 3.8, y, 4.4, 3.2, 1.1);
    blocker(colliders, 3.8, 4.4, 3.2, 1.1, level);
    box(group, mats.metal, 3.3, y + 1.02, 4.4, .34, .2, .28);
    cabinet(group, mats, 8.2, y, 4.6, .55, 2.1, 2.2);
    blocker(colliders, 8.2, 4.6, .6, 2.2, level);
    for (let i = 0; i < 5; i++) {
      const tool = new THREE.Mesh(new THREE.BoxGeometry(.55, .035, .06), mats.metal);
      tool.position.set(2.8 + i * .48, y + 1.47, 4.32); group.add(tool);
    }
  }

  return group;
}