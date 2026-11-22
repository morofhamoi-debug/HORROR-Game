import { box } from './materials.js';

export function buildInspectables(THREE, group, m) {
  const frame = new THREE.Group();
  frame.name = 'HALLWAY_PHOTOGRAPH';
  // The frame is mounted on the corridor-facing side of the partition.
  box(THREE, frame, [.055,.74,.58], [0,0,0], m.wood);
  box(THREE, frame, [.022,.58,.42], [.037,0,0], m.dark, false);
  box(THREE, frame, [.018,.46,.30], [.052,0,0], m.fabric, false);
  box(THREE, frame, [.025,.12,.12], [.067,.08,-.045], m.woodLight, false);
  box(THREE, frame, [.025,.12,.12], [.067,-.09,.045], m.woodLight, false);
  frame.position.set(-.84,1.92,3.72);
  frame.userData.interaction = {
    type: 'inspect',
    label: 'Старая фотография',
    title: 'Фотография в коридоре',
    description: 'На выцветшем снимке изображён этот дом. У крыльца стоят трое людей, но лица почти стёрлись от времени. На обороте карандашом написано: «Не забывай запирать входную дверь».'
  };
  group.add(frame);
  return frame;
}
