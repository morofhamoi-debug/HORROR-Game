import { box } from './materials.js';

export function buildFloor(THREE, group, m) {
  box(THREE, group, [12, .22, 10], [0, -.11, 0], m.floor);
  // Simple ceiling plane; slightly raised so the room remains readable.
  box(THREE, group, [12, .16, 10], [0, 2.98, 0], m.plaster, false, true);
  // Subtle floorboard seams.
  const seam = new THREE.LineBasicMaterial({ color: 0x30251e, transparent: true, opacity: .22 });
  for (let x = -5.5; x <= 5.5; x += .75) {
    const points = [new THREE.Vector3(x, .006, -4.8), new THREE.Vector3(x, .006, 4.8)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), seam));
  }
}