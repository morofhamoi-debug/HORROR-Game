import { box } from '../home/materials.js';

export function buildKitchen(THREE, group, m) {
  // Counter run on the east wall.
  box(THREE, group, [3.3, .82, .62], [3.95, .42, -3.9], m.wood);
  box(THREE, group, [3.35, .07, .68], [3.95, .86, -3.9], m.trim);
  for (let x = 2.7; x <= 5.1; x += 1.2) box(THREE, group, [.035, .68, .56], [x, .42, -3.9], m.dark, false);
  // Dining table and four simple chairs.
  box(THREE, group, [1.65, .12, 1.0], [3.55, .82, -.4], m.wood);
  for (const x of [2.8, 4.3]) for (const z of [-1.05, .25]) {
    box(THREE, group, [.42, .48, .42], [x, .48, z], m.wood);
    box(THREE, group, [.42, .12, .42], [x, .78, z], m.trim);
  }
}