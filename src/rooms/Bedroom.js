import { box } from '../home/materials.js';

export function buildBedroom(THREE, group, m) {
  box(THREE, group, [2.25, .42, 2.8], [3.7, .38, 2.9], m.wood);
  box(THREE, group, [2.2, .18, 2.65], [3.7, .68, 2.9], m.trim);
  box(THREE, group, [2.25, .72, .2], [3.7, .9, 4.15], m.wood);
  box(THREE, group, [.55, .42, .5], [2.15, .21, 4.1], m.wood);
  box(THREE, group, [.55, .42, .5], [5.2, .21, 4.1], m.wood);
}