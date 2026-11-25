import * as THREE from 'three';
import { HOUSE, STAIRS, floorY } from './Layout.js';

function addBox(scene, material, x, y, z, w, h, d) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function cylinderBetween(scene, material, from, to, radius, radialSegments = 10) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, radialSegments), material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addCollider(colliders, x, z, width, depth, level) {
  colliders.push({
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
    level,
    enabled: true,
    surface: 'stair-railing'
  });
}

function buildFlight(scene, mats, colliders, config, fromLevel, toLevel) {
  const x = STAIRS.centerX;
  const width = HOUSE.stairwell.width;
  const tread = Math.abs(config.endZ - config.startZ) / config.steps;
  const fromY = floorY(fromLevel);

  for (let i = 0; i < config.steps; i++) {
    const z = config.startZ + Math.sign(config.endZ - config.startZ) * (i + 0.5) * tread;
    const topY = fromY + (floorY(toLevel) - fromY) * ((i + 1) / config.steps);
    const bottomY = fromY + (floorY(toLevel) - fromY) * (i / config.steps);
    const h = Math.abs(topY - bottomY);
    const step = addBox(scene, mats.darkWood, x, (topY + bottomY) / 2, z, width, h, tread + 0.012);
    step.name = 'stair_' + fromLevel + '_to_' + toLevel + '_' + (i + 1);
    const treadSurfaceY = toLevel > fromLevel ? topY : bottomY;
    addBox(scene, mats.trim, x, treadSurfaceY - 0.012, z, width - 0.04, 0.024, tread - 0.015);
  }

  const start = [x, fromY + 0.94, config.startZ];
  const end = [x, floorY(toLevel) + 0.94, config.endZ];
  for (const side of [-1, 1]) {
    const railX = x + side * (width / 2 + 0.04);
    const startRail = [railX, start[1], start[2]];
    const endRail = [railX, end[1], end[2]];
    cylinderBetween(scene, mats.darkWood, startRail, endRail, 0.055, 12);

    for (let i = 0; i <= config.steps; i += 3) {
      const t = i / config.steps;
      const y = start[1] + (end[1] - start[1]) * t;
      const z = config.startZ + (config.endZ - config.startZ) * t;
      cylinderBetween(scene, mats.darkWood, [railX, y - 0.72, z], [railX, y, z], 0.035, 8);
    }

    const minZ = Math.min(config.startZ, config.endZ);
    const maxZ = Math.max(config.startZ, config.endZ);
    for (const level of [fromLevel, toLevel]) addCollider(colliders, railX, (minZ + maxZ) / 2, 0.12, maxZ - minZ + 0.12, level);
  }
}

export function buildStairs(scene, mats, colliders) {
  addBox(scene, mats.woodFloor, STAIRS.centerX, -HOUSE.floorThickness / 2, 0,
    HOUSE.stairwell.width, HOUSE.floorThickness, 0.60);
  buildFlight(scene, mats, colliders, STAIRS.upper, 0, 1);
  buildFlight(scene, mats, colliders, STAIRS.basement, 0, -1);
}
