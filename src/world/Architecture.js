import * as THREE from 'three';
import { HOUSE, DOOR, WINDOW, floorY, roomHeight } from './Layout.js';

function addBox(scene, material, x, y, z, w, h, d, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(options.rx || 0, options.ry || 0, options.rz || 0);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  scene.add(mesh);
  return mesh;
}

function addCollider(colliders, x, z, w, d, level, extra = {}) {
  colliders.push({
    minX: x - w / 2, maxX: x + w / 2,
    minZ: z - d / 2, maxZ: z + d / 2,
    level, enabled: true, ...extra
  });
}

function wallX(scene, mat, colliders, level, z, y, x1, x2, openings = [], thickness = HOUSE.interiorWallThickness) {
  const height = roomHeight(level);
  const sorted = [...openings].sort((a, b) => a.center - b.center);
  let cursor = x1;

  const segment = (a, b, bottom = 0, segmentHeight = height) => {
    if (b - a < 0.015 || segmentHeight < 0.015) return;
    const width = b - a;
    addBox(scene, mat, (a + b) / 2, y + bottom + segmentHeight / 2, z, width, segmentHeight, thickness);
    addCollider(colliders, (a + b) / 2, z, width, thickness, level, {
      minY: y + bottom, maxY: y + bottom + segmentHeight, surface: 'wall'
    });
  };

  for (const opening of sorted) {
    const left = Math.max(x1, opening.center - opening.width / 2);
    const right = Math.min(x2, opening.center + opening.width / 2);
    if (right <= left) continue;
    segment(cursor, left);
    if (opening.type === 'window') {
      const sill = opening.sill ?? WINDOW.sillHeight;
      const windowHeight = opening.height ?? WINDOW.height;
      segment(left, right, 0, sill);
      segment(left, right, sill + windowHeight, height - sill - windowHeight);
      addCollider(colliders, (left + right) / 2, z, right - left, WINDOW.glassThickness, level, {
        minY: y + sill, maxY: y + sill + windowHeight, surface: 'window-glass'
      });
    } else if (opening.type === 'door' && opening.header !== false) {
      const doorHeight = opening.height ?? 2.08;
      segment(left, right, doorHeight, height - doorHeight);
    }
    cursor = right;
  }
  segment(cursor, x2);
}

function wallZ(scene, mat, colliders, level, x, y, z1, z2, openings = [], thickness = HOUSE.interiorWallThickness) {
  const height = roomHeight(level);
  const sorted = [...openings].sort((a, b) => a.center - b.center);
  let cursor = z1;

  const segment = (a, b, bottom = 0, segmentHeight = height) => {
    if (b - a < 0.015 || segmentHeight < 0.015) return;
    const depth = b - a;
    addBox(scene, mat, x, y + bottom + segmentHeight / 2, (a + b) / 2, thickness, segmentHeight, depth);
    addCollider(colliders, x, (a + b) / 2, thickness, depth, level, {
      minY: y + bottom, maxY: y + bottom + segmentHeight, surface: 'wall'
    });
  };

  for (const opening of sorted) {
    const near = Math.max(z1, opening.center - opening.width / 2);
    const far = Math.min(z2, opening.center + opening.width / 2);
    if (far <= near) continue;
    segment(cursor, near);
    if (opening.type === 'window') {
      const sill = opening.sill ?? 0.86;
      const windowHeight = opening.height ?? 1.22;
      segment(near, far, 0, sill);
      segment(near, far, sill + windowHeight, height - sill - windowHeight);
      addCollider(colliders, x, (near + far) / 2, WINDOW.glassThickness, far - near, level, {
        minY: y + sill, maxY: y + sill + windowHeight, surface: 'window-glass'
      });
    } else if (opening.type === 'door' && opening.header !== false) {
      const doorHeight = opening.height ?? 2.08;
      segment(near, far, doorHeight, height - doorHeight);
    }
    cursor = far;
  }
  segment(cursor, z2);
}

function windowFrame(scene, mats, x, y, z, horizontal, width, wallThickness = HOUSE.exteriorWallThickness) {
  const height = WINDOW.height;
  const frameDepth = wallThickness + 0.09;
  const group = new THREE.Group();
  const add = (material, bx, by, bz, bw, bh, bd) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), material);
    mesh.position.set(bx, by, bz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };

  // Glass is a true solid pane. Four rails and a central mullion give the opening depth.
  add(mats.glass, 0, height / 2, 0, width - 0.15, height - 0.13, WINDOW.glassThickness);
  add(mats.darkWood, 0, 0.035, 0, width + 0.12, 0.10, frameDepth);
  add(mats.darkWood, 0, height - 0.035, 0, width + 0.12, 0.10, frameDepth);
  add(mats.darkWood, -width / 2 + 0.035, height / 2, 0, 0.10, height, frameDepth);
  add(mats.darkWood, width / 2 - 0.035, height / 2, 0, 0.10, height, frameDepth);
  add(mats.darkWood, 0, height / 2, 0, 0.045, height - 0.1, frameDepth * 0.8);

  // Deep interior sill and reveal.
  add(mats.trim, 0, -0.075, 0.01, width + 0.24, 0.10, frameDepth + 0.16);
  add(mats.trim, -width / 2 - 0.015, height / 2, 0, 0.055, height - 0.04, frameDepth);
  add(mats.trim, width / 2 + 0.015, height / 2, 0, 0.055, height - 0.04, frameDepth);

  if (!horizontal) group.rotation.y = Math.PI / 2;
  group.position.set(x, y, z);
  scene.add(group);
  return group;
}

function updateDoorCollider(collider, pivot, doorWidth, thickness, orientation) {
  pivot.updateMatrixWorld(true);
  const center = new THREE.Vector3(doorWidth / 2, DOOR.height / 2, 0).applyMatrix4(pivot.matrixWorld);
  const yaw = pivot.rotation.y;
  const halfX = Math.abs(Math.cos(yaw)) * doorWidth / 2 + Math.abs(Math.sin(yaw)) * thickness / 2;
  const halfZ = Math.abs(Math.sin(yaw)) * doorWidth / 2 + Math.abs(Math.cos(yaw)) * thickness / 2;
  collider.minX = center.x - halfX;
  collider.maxX = center.x + halfX;
  collider.minZ = center.z - halfZ;
  collider.maxZ = center.z + halfZ;
  collider.enabled = true;
  collider.surface = 'door';
  collider.orientation = orientation;
}

export function addDoor(scene, mats, interactables, colliders, level, x, y, z, openingWidth, orientation = 'z', label = 'дверь') {
  const doorWidth = openingWidth - DOOR.openingClearance;
  const doorThickness = DOOR.leafThickness;
  const doorHeight = DOOR.height;
  const pivot = new THREE.Group();

  if (orientation === 'z') pivot.position.set(x - doorWidth / 2, y, z);
  else pivot.position.set(x, y, z + doorWidth / 2);

  const closedYaw = orientation === 'z' ? 0 : Math.PI / 2;
  pivot.rotation.y = closedYaw;
  scene.add(pivot);

  const leaf = new THREE.Group();
  pivot.add(leaf);
  addBox(leaf, mats.darkWood, doorWidth / 2, doorHeight / 2, 0, doorWidth, doorHeight, doorThickness);
  addBox(leaf, mats.woodFloor, doorWidth / 2, doorHeight * 0.54, doorThickness / 2 + 0.012, doorWidth - 0.20, doorHeight - 0.42, 0.018);
  for (const yy of [0.25, doorHeight - 0.25]) {
    addBox(leaf, mats.brass, doorWidth / 2, yy, doorThickness / 2 + 0.027, doorWidth - 0.29, 0.035, 0.025);
  }

  const hingeX = orientation === 'z' ? 0 : 0;
  const hingeZ = orientation === 'z' ? 0 : 0;
  for (const yy of [0.24, doorHeight - 0.24]) {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12), mats.brass);
    hinge.position.set(hingeX, yy, hingeZ);
    hinge.castShadow = true;
    pivot.add(hinge);
  }

  const handleX = doorWidth - 0.17;
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), mats.brass);
  handle.position.set(handleX, DOOR.handleHeight, doorThickness / 2 + 0.07);
  handle.castShadow = true;
  leaf.add(handle);
  const escutcheon = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 20), mats.metal);
  escutcheon.rotation.x = Math.PI / 2;
  escutcheon.position.set(handleX, DOOR.handleHeight, doorThickness / 2 + 0.028);
  leaf.add(escutcheon);

  // Door casing is independent geometry, so it remains stationary while the leaf swings.
  const casingMaterial = mats.trim;
  if (orientation === 'z') {
    addBox(scene, casingMaterial, x - openingWidth / 2 - 0.045, y + doorHeight / 2, z, 0.09, doorHeight + 0.12, 0.12);
    addBox(scene, casingMaterial, x + openingWidth / 2 + 0.045, y + doorHeight / 2, z, 0.09, doorHeight + 0.12, 0.12);
    addBox(scene, casingMaterial, x, y + doorHeight + 0.06, z, openingWidth + 0.18, 0.10, 0.12);
  } else {
    addBox(scene, casingMaterial, x, y + doorHeight / 2, z - openingWidth / 2 - 0.045, 0.12, doorHeight + 0.12, 0.09);
    addBox(scene, casingMaterial, x, y + doorHeight / 2, z + openingWidth / 2 + 0.045, 0.12, doorHeight + 0.12, 0.09);
    addBox(scene, casingMaterial, x, y + doorHeight + 0.06, z, 0.12, 0.10, openingWidth + 0.18);
  }

  const collider = {
    minX: 0, maxX: 0, minZ: 0, maxZ: 0,
    minY: y, maxY: y + doorHeight, level, enabled: true, surface: 'door'
  };
  updateDoorCollider(collider, pivot, doorWidth, doorThickness, orientation);
  colliders.push(collider);

  const item = {
    kind: 'door',
    object: handle,
    pivot,
    open: false,
    label,
    action() {
      this.open = !this.open;
      pivot.rotation.y = this.open ? closedYaw - Math.PI / 2 : closedYaw;
      updateDoorCollider(collider, pivot, doorWidth, doorThickness, orientation);
    }
  };
  interactables.push(item);
  return item;
}

export function buildFloorDeck(scene, mats, level) {
  const y = floorY(level);
  const material = level === -1 ? mats.concrete : mats.woodFloor;
  const addDeck = (x1, x2, z1, z2) => {
    if (x2 <= x1 || z2 <= z1) return;
    addBox(scene, material, (x1 + x2) / 2, y - HOUSE.floorThickness / 2, (z1 + z2) / 2,
      x2 - x1, HOUSE.floorThickness, z2 - z1);
  };

  // The central and western slab is continuous. The eastern stair opening is deliberate.
  addDeck(-9.50, 5.45, -6.50, 6.50);
  addDeck(8.65, 9.50, -6.50, 6.50);
  addDeck(5.45, 8.65, -6.50, HOUSE.stairwell.topZ);
  addDeck(5.45, 8.65, HOUSE.stairwell.bottomZ, 6.50);

}

export function buildCeiling(scene, mats, level) {
  const ceilingMaterial = mats.ceiling;
  const finishThickness = HOUSE.ceilingFinishThickness;
  const top = level === 1
    ? floorY(1) + roomHeight(1) + finishThickness
    : floorY(level + 1) - HOUSE.floorThickness;
  const centerY = top - finishThickness / 2;
  const add = (x1, x2, z1, z2) => {
    if (x2 <= x1 || z2 <= z1) return;
    addBox(scene, ceilingMaterial, (x1 + x2) / 2, centerY, (z1 + z2) / 2,
      x2 - x1, finishThickness, z2 - z1);
  };
  add(-9.50, 5.45, -6.50, 6.50);
  add(8.65, 9.50, -6.50, 6.50);
  add(5.45, 8.65, -6.50, HOUSE.stairwell.topZ);
  add(5.45, 8.65, HOUSE.stairwell.bottomZ, 6.50);
}

function buildExterior(scene, mats, colliders, interactables, level) {
  const y = floorY(level);
  const height = roomHeight(level);
  const wallMat = level === -1 ? mats.wallDark : mats.wall;
  const ext = HOUSE.exteriorWallThickness;

  wallX(scene, wallMat, colliders, level, -6.65, y, -9.50, 9.50, [
    { center: -5.35, width: 1.95, type: 'window' },
    { center: 1.25, width: 2.15, type: 'window' },
    { center: 6.00, width: 1.95, type: 'window' }
  ], ext);

  wallX(scene, wallMat, colliders, level, 6.65, y, -9.50, 9.50, level === 0
    ? [
        { center: -6.15, width: 1.95, type: 'window' },
        { center: 0, width: 1.55, type: 'door', height: 2.12 },
        { center: 6.15, width: 1.95, type: 'window' }
      ]
    : [
        { center: -5.35, width: 1.95, type: 'window' },
        { center: 5.60, width: 1.95, type: 'window' }
      ], ext);

  wallZ(scene, wallMat, colliders, level, -9.65, y, -6.50, 6.50, [
    { center: -2.10, width: 1.70, type: 'window' },
    { center: 3.60, width: 1.90, type: 'window' }
  ], ext);

  wallZ(scene, wallMat, colliders, level, 9.65, y, -6.50, 6.50, [
    { center: -2.30, width: 1.80, type: 'window' },
    { center: 3.50, width: 1.80, type: 'window' }
  ], ext);

  // Actual frames and glazing are centered within the wall thickness.
  for (const [x, w] of [[-5.35,1.95],[1.25,2.15],[6.00,1.95]]) {
    windowFrame(scene, mats, x, y + 0.86, -6.65, true, w, ext);
  }
  for (const [x, w] of (level === 0 ? [[-6.15,1.95],[6.15,1.95]] : [[-5.35,1.95],[5.60,1.95]])) {
    windowFrame(scene, mats, x, y + 0.86, 6.65, true, w, ext);
  }
  for (const [z,w] of [[-2.10,1.70],[3.60,1.90]]) windowFrame(scene, mats, -9.65, y + 0.86, z, false, w, ext);
  for (const [z,w] of [[-2.30,1.80],[3.50,1.80]]) windowFrame(scene, mats, 9.65, y + 0.86, z, false, w, ext);

  if (level === 0) {
    addDoor(scene, mats, interactables, colliders, level, 0, y, 6.65, 1.55, 'z', 'входная дверь');
  }
}

function buildInterior(scene, mats, colliders, interactables, level) {
  const y = floorY(level);
  const wall = level === -1 ? mats.wallDark : mats.wall;
  const thickness = HOUSE.interiorWallThickness;

  // The central cross-wall divides the room groups while preserving three real passages.
  wallZ(scene, wall, colliders, level, 0.10, y, -6.50, 6.50, [
    { center: -3.10, width: 1.22, type: 'door' },
    { center: 3.15, width: 1.22, type: 'door' }
  ], thickness);

  wallX(scene, wall, colliders, level, 0.15, y, -9.50, 9.50, [
    { center: -3.10, width: 1.28, type: 'door' },
    { center: 3.05, width: 1.28, type: 'door' },
    { center: 7.05, width: 1.95, type: 'door', header: false }
  ], thickness);

  // Doors in a wall running along Z have leaves spanning world Z (orientation X).
  addDoor(scene, mats, interactables, colliders, level, 0.10, y, -3.10, 1.22, 'x', 'дверь комнаты');
  addDoor(scene, mats, interactables, colliders, level, 0.10, y, 3.15, 1.22, 'x', 'дверь комнаты');
  // Doors in a wall running along X have leaves spanning world X (orientation Z).
  addDoor(scene, mats, interactables, colliders, level, -3.10, y, 0.15, 1.28, 'z', 'дверь');
  addDoor(scene, mats, interactables, colliders, level, 3.05, y, 0.15, 1.28, 'z', 'дверь');

  // Stairwell boundaries have open passages, not inaccessible hinged doors.
  if (level === 1) {
    wallX(scene, wall, colliders, level, HOUSE.stairwell.topZ, y, 5.45, 8.65, [
      { center: 7.05, width: 2.0, type: 'door', header: false }
    ], thickness);
  }
  if (level === -1) {
    wallX(scene, wall, colliders, level, HOUSE.stairwell.bottomZ, y, 5.45, 8.65, [
      { center: 7.05, width: 2.0, type: 'door', header: false }
    ], thickness);
  }
}

function buildServiceDetails(scene, mats, level) {
  if (level !== -1) return;
  const y = floorY(level);
  // Vertical plumbing runs and pipe clamps are placed against the basement perimeter.
  for (const x of [-8.4, -5.8, 5.8, 8.2]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.25, 12), mats.metal);
    pipe.position.set(x, y + 1.18, -6.38);
    pipe.castShadow = true;
    scene.add(pipe);
    for (const clampY of [y + 0.52, y + 1.85]) {
      addBox(scene, mats.brass, x, clampY, -6.36, 0.11, 0.07, 0.09);
    }
  }
  for (let i = 0; i < 5; i++) {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 3.8, 8), mats.black);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(0, y + 2.22 + i * 0.035, -6.30);
    scene.add(cable);
  }
}

export function buildLevelArchitecture(scene, mats, colliders, interactables, level) {
  const y = floorY(level);
  buildCeiling(scene, mats, level);
  buildExterior(scene, mats, colliders, interactables, level);
  buildInterior(scene, mats, colliders, interactables, level);
  buildServiceDetails(scene, mats, level);
}

export function addSwitch(scene, mats, interactables, x, y, z, lightGroup, orientation = 'z') {
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.04), mats.trim);
  plate.position.set(x, y, z);
  if (orientation === 'x') plate.rotation.y = Math.PI / 2;
  scene.add(plate);

  const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.03), mats.black);
  toggle.position.set(x, y, z + (orientation === 'z' ? 0.03 : 0));
  if (orientation === 'x') {
    toggle.position.x += 0.03;
    toggle.rotation.y = Math.PI / 2;
  }
  scene.add(toggle);

  const emissiveParts = [];
  lightGroup.traverse(child => { if (child.isMesh && child.material === mats.warmGlow) emissiveParts.push(child); });

  interactables.push({
    kind: 'switch',
    object: toggle,
    on: true,
    action() {
      this.on = !this.on;
      lightGroup.traverse(child => { if (child.isLight) child.visible = this.on; });
      for (const mesh of emissiveParts) mesh.visible = this.on;
      toggle.material = this.on ? mats.warmGlow : mats.black;
    }
  });
}
