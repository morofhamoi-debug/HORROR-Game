import { box } from '../home/materials.js';

export function buildCorridor(THREE, group, m) {
  // Narrow entrance hall with a console and wall-mounted mirror.
  box(THREE, group, [1.15,.78,.34], [0,.39,3.55], m.wood);
  box(THREE, group, [1.18,.055,.38], [0,.81,3.55], m.trim);
  box(THREE, group, [.72,.92,.035], [0,1.65,3.31], m.dark, false);
  box(THREE, group, [.78,.055,.06], [0,2.13,3.31], m.trim, false);
  // Small shoe rack beside the entrance.
  box(THREE, group, [.78,.58,.38], [-1.05,.29,4.15], m.wood);
  box(THREE, group, [.82,.045,.42], [-1.05,.59,4.15], m.trim);
  for (const y of [.2,.42]) box(THREE, group, [.72,.025,.34], [-1.05,y,4.15], m.dark, false);
}
