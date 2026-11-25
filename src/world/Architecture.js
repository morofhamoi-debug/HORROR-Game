import * as THREE from 'three';
function addBox(scene, material, x, y, z, w, h, d) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function addCollider(colliders, x, z, w, d, level) {
  colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, level, enabled: true });
}
function wallX(scene, mat, colliders, level, z, y, x1, x2, openings = []) {
  const height = 3.28, thick = .22;
  const sorted = [...openings].sort((a, b) => a.center - b.center);
  let cursor = x1;
  const segment = (a, b, bottom = 0, h = height) => {
    if (b - a < .02 || h < .02) return;
    const width = b - a;
    addBox(scene, mat, (a + b) / 2, y + bottom + h / 2, z, width, h, thick);
    addCollider(colliders, (a + b) / 2, z, width, thick, level);
  };
  for (const opening of sorted) {
    const left = opening.center - opening.width / 2, right = opening.center + opening.width / 2;
    segment(cursor, left);
    if (opening.type === 'window') {
      segment(left, right, 0, opening.sill || .82);
      segment(left, right, (opening.sill || .82) + (opening.height || 1.35), height - (opening.sill || .82) - (opening.height || 1.35));
    }
    cursor = right;
  }
  segment(cursor, x2);
}
function wallZ(scene, mat, colliders, level, x, y, z1, z2, openings = []) {
  const height = 3.28, thick = .22;
  const sorted = [...openings].sort((a, b) => a.center - b.center);
  let cursor = z1;
  const segment = (a, b, bottom = 0, h = height) => {
    if (b - a < .02 || h < .02) return;
    const depth = b - a;
    addBox(scene, mat, x, y + bottom + h / 2, (a + b) / 2, thick, h, depth);
    addCollider(colliders, x, (a + b) / 2, thick, depth, level);
  };
  for (const opening of sorted) {
    const near = opening.center - opening.width / 2, far = opening.center + opening.width / 2;
    segment(cursor, near);
    if (opening.type === 'window') {
      segment(near, far, 0, opening.sill || .82);
      segment(near, far, (opening.sill || .82) + (opening.height || 1.35), height - (opening.sill || .82) - (opening.height || 1.35));
    }
    cursor = far;
  }
  segment(cursor, z2);
}
function windowFrame(scene, mats, x, y, z, horizontal = true, width = 1.85) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.BoxGeometry(width - .12, 1.28, .055), mats.glass);
  glass.position.y = .68; group.add(glass);
  const bar = (bx, by, bw, bh, bd) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mats.darkWood);
    mesh.position.set(bx, by, 0); mesh.castShadow = true; group.add(mesh);
  };
  bar(0, 0, width, .09, .13); bar(0, 1.36, width, .09, .13);
  bar(-width / 2 + .04, .68, .08, 1.36, .13); bar(width / 2 - .04, .68, .08, 1.36, .13);
  bar(0, .68, .045, 1.28, .1); bar(0, .68, width - .12, .045, .1);
  group.position.set(x, y, z);
  if (!horizontal) group.rotation.y = Math.PI / 2;
  scene.add(group); return group;
}
function addDoor(scene, mats, interactables, colliders, level, x, y, z, width, orientation = 'z', label = 'дверь') {
  const pivot = new THREE.Group();
  if (orientation === 'z') pivot.position.set(x - width / 2, y, z);
  else pivot.position.set(x, y, z + width / 2);
  if (orientation === 'x') pivot.rotation.y = Math.PI / 2;
  scene.add(pivot);
  const door = new THREE.Mesh(new THREE.BoxGeometry(width, 2.28, .095), mats.darkWood);
  door.position.set(width / 2, 1.14, 0); door.castShadow = true; door.receiveShadow = true; pivot.add(door);
  const inset = new THREE.Mesh(new THREE.BoxGeometry(width - .22, 1.75, .025), mats.woodFloor);
  inset.position.set(width / 2, 1.2, .06); pivot.add(inset);
  for (const yy of [.34, 2.05]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width - .32, .035, .035), mats.brass);
    panel.position.set(width / 2, yy, .08); pivot.add(panel);
  }
  const handle = new THREE.Mesh(new THREE.SphereGeometry(.055, 16, 12), mats.brass);
  handle.position.set(width - .2, 1.08, .11); pivot.add(handle);

  const a = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.42, .18), mats.trim);
  const b = a.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(width + .24, .12, .18), mats.trim);
  if (orientation === 'z') {
    a.position.set(x - width / 2 - .06, y + 1.21, z);
    b.position.set(x + width / 2 + .06, y + 1.21, z);
    top.position.set(x, y + 2.4, z);
  } else {
    a.position.set(x, y + 1.21, z - width / 2 - .06);
    b.position.set(x, y + 1.21, z + width / 2 + .06);
    top.geometry.dispose(); top.geometry = new THREE.BoxGeometry(.18, .12, width + .24);
    top.position.set(x, y + 2.4, z);
  }
  scene.add(a, b, top);
  const collider = orientation === 'z'
    ? { minX: x - width / 2, maxX: x + width / 2, minZ: z - .09, maxZ: z + .09, level, enabled: true }
    : { minX: x - .09, maxX: x + .09, minZ: z - width / 2, maxZ: z + width / 2, level, enabled: true };
  colliders.push(collider);
  const item = {
    kind: 'door', object: handle, open: false, label,
    action() {
      this.open = !this.open; collider.enabled = !this.open;
      if (orientation === 'z') pivot.rotation.y = this.open ? -1.25 : 0;
      else pivot.rotation.y = this.open ? Math.PI / 2 - 1.25 : Math.PI / 2;
    }
  };
  interactables.push(item); return item;
}
export function buildFloorDeck(scene, mats, colliders, level, y, tile = false) {
  const material = tile ? mats.tile : (level === -1 ? mats.concrete : mats.woodFloor);
  const top = y - .12;
  const addDeck = (x, z, w, d) => addBox(scene, material, x, top, z, w, .24, d);
  addDeck((-9.65 + 5.45) / 2, 0, 15.1, 13.2);
  addDeck((8.65 + 9.65) / 2, 0, 1, 13.2);
  addDeck(7.05, (-6.6 - 3.25) / 2, 3.2, 3.35);
  addDeck(7.05, (3.25 + 6.6) / 2, 3.2, 3.35);
}
export function buildLevelArchitecture(scene, mats, colliders, interactables, level) {
  const y = level * 3.5;
  const outer = level === -1 ? mats.wallDark : mats.wall;
  wallX(scene, outer, colliders, level, -6.65, y, -9.65, 9.65, [
    { center: -5.4, width: 2, type: 'window' }, { center: 1.3, width: 2.25, type: 'window' }, { center: 6, width: 2, type: 'window' }
  ]);
  wallX(scene, outer, colliders, level, 6.65, y, -9.65, 9.65, level === 0
    ? [{ center: 0, width: 1.55, type: 'door' }, { center: -6.2, width: 2, type: 'window' }, { center: 6.15, width: 2, type: 'window' }]
    : [{ center: -5.4, width: 2, type: 'window' }, { center: 5.6, width: 2, type: 'window' }]
  );
  wallZ(scene, outer, colliders, level, -9.65, y, -6.65, 6.65, [
    { center: -2.1, width: 1.7, type: 'window' }, { center: 3.6, width: 1.9, type: 'window' }
  ]);
  wallZ(scene, outer, colliders, level, 9.65, y, -6.65, 6.65, [
    { center: -2.3, width: 1.8, type: 'window' }, { center: 3.5, width: 1.8, type: 'window' }
  ]);

  wallZ(scene, mats.wall, colliders, level, .1, y, -6.55, 6.55, [
    { center: -3.1, width: 1.18, type: 'door' }, { center: 3.15, width: 1.18, type: 'door' }
  ]);
  wallX(scene, mats.wall, colliders, level, .15, y, -9.55, 9.55, [
    { center: -3.1, width: 1.22, type: 'door' }, { center: 3.05, width: 1.22, type: 'door' },
    { center: 7.05, width: 1.5, type: 'door' }
  ]);

  for (const x of [-5.4, 1.3, 6]) windowFrame(scene, mats, x, y + .82, -6.64, true, x === 1.3 ? 2.25 : 2);
  for (const x of [-6.2, 6.15]) if (level === 0) windowFrame(scene, mats, x, y + .82, 6.64, true, 2);
  if (level !== 0) {
    windowFrame(scene, mats, -5.4, y + .82, 6.64, true, 2);
    windowFrame(scene, mats, 5.6, y + .82, 6.64, true, 2);
  }
  for (const z of [-2.1, 3.6]) windowFrame(scene, mats, -9.64, y + .82, z, false, z < 0 ? 1.7 : 1.9);
  for (const z of [-2.3, 3.5]) windowFrame(scene, mats, 9.64, y + .82, z, false, 1.8);

  addDoor(scene, mats, interactables, colliders, level, .1, y, -3.1, 1.18, 'x', 'дверь комнаты');
  addDoor(scene, mats, interactables, colliders, level, .1, y, 3.15, 1.18, 'x', 'дверь комнаты');
  addDoor(scene, mats, interactables, colliders, level, -3.1, y, .15, 1.22, 'z', 'дверь');
  addDoor(scene, mats, interactables, colliders, level, 3.05, y, .15, 1.22, 'z', 'дверь');
  if (level === 0) addDoor(scene, mats, interactables, colliders, level, 7.05, y, .15, 1.5, 'z', 'дверь в лестничный пролёт');
  if (level === 1) {
    wallX(scene, mats.wall, colliders, level, -3.25, y, 5.45, 8.65, [{ center: 7.05, width: 1.5, type: 'door' }]);
    addDoor(scene, mats, interactables, colliders, level, 7.05, y, -3.25, 1.5, 'z', 'дверь на лестницу');
  }
  if (level === -1) {
    wallX(scene, mats.wallDark, colliders, level, 3.25, y, 5.45, 8.65, [{ center: 7.05, width: 1.5, type: 'door' }]);
    addDoor(scene, mats, interactables, colliders, level, 7.05, y, 3.25, 1.5, 'z', 'дверь на лестницу');
  }

  if (level === 0) {
    addDoor(scene, mats, interactables, colliders, level, 0, y, 6.65, 1.55, 'z', 'входная дверь');
    addBox(scene, mats.stone, 0, y - .05, 7.55, 4.8, .2, 2.1);
    for (const x of [-1.85, 1.85]) {
      addBox(scene, mats.trim, x, y + 1.45, 8.15, .22, 2.9, .22);
      addBox(scene, mats.trim, x, y + 2.95, 8.15, .32, .12, .32);
    }
    addBox(scene, mats.darkWood, 0, y + 2.98, 8.15, 4.2, .18, .3);
    for (let i = 0; i < 3; i++) addBox(scene, mats.stone, 0, y - .03 - i * .08, 8.35 + i * .42, 3.4 - i * .35, .16, .48);
  }
  if (level === -1) {
    // Central ground-floor landing with two physically separate flights.
    addBox(scene, mats.woodFloor, 7.05, -.12, 0, 2.55, .24, 1.3);
    const rise = 3.5 / 15, tread = .21;
    for (let i = 0; i < 15; i++) {
      const upZ = -.105 - i * tread;
      const upSurface = (i + 1) * rise;
      addBox(scene, mats.darkWood, 7.05, upSurface - .11, upZ, 2.0, .22, .23);
      const downZ = .105 + i * tread;
      const downSurface = -(i + 1) * rise;
      addBox(scene, mats.darkWood, 7.05, downSurface - .11, downZ, 2.0, .22, .23);
      for (const side of [-1, 1]) {
        addBox(scene, mats.brass, 7.05 + side * 1.04, upSurface + .34, upZ, .045, .68, .045);
        addBox(scene, mats.brass, 7.05 + side * 1.04, downSurface + .34, downZ, .045, .68, .045);
      }
    }
    const upperRail = addBox(scene, mats.darkWood, 7.05 - 1.04, 1.78, -1.58, .09, .1, 4.72);
    upperRail.rotation.x = .84;
    const upperRail2 = addBox(scene, mats.darkWood, 7.05 + 1.04, 1.78, -1.58, .09, .1, 4.72);
    upperRail2.rotation.x = .84;
    const lowerRail = addBox(scene, mats.darkWood, 7.05 - 1.04, -1.78, 1.58, .09, .1, 4.72);
    lowerRail.rotation.x = .84;
    const lowerRail2 = addBox(scene, mats.darkWood, 7.05 + 1.04, -1.78, 1.58, .09, .1, 4.72);
    lowerRail2.rotation.x = .84;
    for (const side of [-1, 1]) {
      addCollider(colliders, 7.05 + side * 1.04, -1.58, .13, 4.72, 0);
      addCollider(colliders, 7.05 + side * 1.04, -1.58, .13, 4.72, 1);
      addCollider(colliders, 7.05 + side * 1.04, 1.58, .13, 4.72, 0);
      addCollider(colliders, 7.05 + side * 1.04, 1.58, .13, 4.72, -1);
    }
  }
  if (level === -1) {
    for (let x = -8; x <= 8; x += 2.6) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 3.1, 10), mats.metal);
      pipe.position.set(x, y + 1.55, -6.48); pipe.castShadow = true; scene.add(pipe);
    }
  }
}
export function addSwitch(scene, mats, interactables, x, y, z, lightGroup) {
  const plate = new THREE.Mesh(new THREE.BoxGeometry(.15, .22, .04), mats.trim);
  plate.position.set(x, y, z); scene.add(plate);
  const toggle = new THREE.Mesh(new THREE.BoxGeometry(.06, .09, .03), mats.black);
  toggle.position.set(x, y, z + .03); scene.add(toggle);
  interactables.push({
    kind: 'switch', object: toggle, on: true,
    action() {
      this.on = !this.on;
      lightGroup.traverse(child => { if (child.isLight) child.visible = this.on; });
      toggle.material = this.on ? mats.warmGlow : mats.black;
    }
  });
}