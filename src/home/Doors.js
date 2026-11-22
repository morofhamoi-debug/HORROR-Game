import { box } from './materials.js';

export function buildDoors(THREE, group, m) {
  // The entrance door is intentionally left ajar so the player can enter.
  const hinge = new THREE.Group();
  hinge.name = 'FRONT_ENTRY_DOOR_OPEN';
  hinge.position.set(-.56, 0, 4.88);
  box(THREE, hinge, [1.12, 2.12, .10], [.56, 1.06, 0], m.wood);
  box(THREE, hinge, [.82, 1.82, .025], [.56, 1.08, -.065], m.dark, false);
  box(THREE, hinge, [.055, 2.18, .16], [0, 1.09, -.02], m.trim, false);
  box(THREE, hinge, [.055, 2.18, .16], [1.12, 1.09, -.02], m.trim, false);
  box(THREE, hinge, [1.27, .07, .16], [.56, 2.18, -.02], m.trim, false);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 10), m.trim);
  handle.position.set(.92, 1.02, -.13);
  hinge.add(handle);
  hinge.rotation.y = -.95;
  group.add(hinge);
  return hinge;
}
