import { box } from '../home/materials.js';

export function buildLivingRoom(THREE, group, m) {
  // Sofa against the north-west wall.
  box(THREE, group, [2.5, .48, .9], [-3.75, .48, -3.7], m.wood);
  box(THREE, group, [2.5, .72, .22], [-3.75, .98, -4.05], m.wood);
  for (const x of [-4.65, -3.75, -2.85]) box(THREE, group, [.72, .22, .72], [x, .78, -3.72], m.trim);
  // Coffee table and television cabinet.
  box(THREE, group, [1.35, .12, .72], [-3.6, .55, -1.9], m.wood);
  box(THREE, group, [.12, .55, 1.8], [-5.55, .28, -3.0], m.dark);
  box(THREE, group, [1.35, .78, .08], [-5.45, 1.35, -3.0], m.dark);
}