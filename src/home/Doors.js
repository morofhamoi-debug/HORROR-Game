import { box } from './materials.js';

export function buildDoors(THREE, group, m) {
  const frame = m.trim;
  const door = new THREE.Group();
  door.name = 'FRONT_ENTRY_DOOR';
  // Front entrance, facing the starting position outside the house.
  box(THREE, door, [1.12, 2.12, .10], [0, 1.06, 4.91], m.wood);
  box(THREE, door, [.82, 1.82, .025], [0, 1.08, 4.845], m.dark, false);
  box(THREE, door, [.055, 2.18, .16], [-.61, 1.09, 4.88], frame, false);
  box(THREE, door, [.055, 2.18, .16], [.61, 1.09, 4.88], frame, false);
  box(THREE, door, [1.27, .07, .16], [0, 2.18, 4.88], frame, false);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 10), m.trim);
  handle.position.set(.38, 1.02, 4.77);
  door.add(handle);
  group.add(door);
  return door;
}
