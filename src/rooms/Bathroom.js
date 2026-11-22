import { box } from '../home/materials.js';

export function buildBathroom(THREE, group, m) {
  // Bathroom fixtures are simple placeholder geometry for the blockout stage.
  box(THREE, group, [1.25, .16, 1.25], [-4.5, .08, 3.5], m.tile);
  box(THREE, group, [.72, .42, .5], [-5.0, .42, 4.0], m.trim);
  box(THREE, group, [.62, .9, .5], [-2.8, .45, 3.9], m.trim);
  box(THREE, group, [.9, .08, .55], [-2.8, .92, 3.9], m.dark);
}