import { box } from './materials.js';

export function buildWalls(THREE, group, m) {
  const wallH = 2.9, t = 0.22;
  // Exterior shell: four separate walls leave a clear interior volume.
  box(THREE, group, [12, wallH, t], [0, wallH/2, -5], m.plaster);
  box(THREE, group, [12, wallH, t], [0, wallH/2, 5], m.plaster);
  box(THREE, group, [t, wallH, 10], [-6, wallH/2, 0], m.plaster);
  box(THREE, group, [t, wallH, 10], [6, wallH/2, 0], m.plaster);
  // Main partitions. Openings are intentionally left between room zones.
  box(THREE, group, [t, wallH, 3.0], [-1.0, wallH/2, -3.5], m.innerWall);
  box(THREE, group, [t, wallH, 3.1], [-1.0, wallH/2, 3.45], m.innerWall);
  box(THREE, group, [4.0, wallH, t], [3.9, wallH/2, -1.2], m.innerWall);
  box(THREE, group, [2.0, wallH, t], [-4.9, wallH/2, 1.2], m.innerWall);
  // Skirting boards add a readable architectural scale.
  const skirting = m.trim;
  box(THREE, group, [11.5, .12, .06], [0, .08, -4.86], skirting, false);
  box(THREE, group, [11.5, .12, .06], [0, .08, 4.86], skirting, false);
  box(THREE, group, [.06, .12, 9.5], [-5.86, .08, 0], skirting, false);
  box(THREE, group, [.06, .12, 9.5], [5.86, .08, 0], skirting, false);
}