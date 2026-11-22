import { box } from './materials.js';

export function buildWindows(THREE, group, m) {
  const specs = [
    { x: -3.8, z: -4.88, w: 1.65, h: 1.18, side: 'back' },
    { x: 1.25, z: -4.88, w: 1.55, h: 1.18, side: 'back' },
    { x: -5.88, z: -1.0, w: 1.18, h: 1.12, side: 'left' },
    { x: 5.88, z: 1.4, w: 1.2, h: 1.12, side: 'right' }
  ];
  for (const s of specs) {
    const horizontal = s.side === 'back';
    const paneSize = horizontal ? [s.w, s.h, .035] : [.035, s.h, s.w];
    box(THREE, group, paneSize, [s.x, 1.78, s.z], m.glass, false);
    const frameT = .075;
    const pieces = horizontal
      ? [
          [[s.w + .16, frameT, .12], [s.x, 1.78 + s.h/2, s.z]],
          [[s.w + .16, frameT, .12], [s.x, 1.78 - s.h/2, s.z]],
          [[frameT, s.h, .12], [s.x - s.w/2, 1.78, s.z]],
          [[frameT, s.h, .12], [s.x + s.w/2, 1.78, s.z]],
          [[.045, s.h, .10], [s.x, 1.78, s.z]]
        ]
      : [
          [[.12, frameT, s.w + .16], [s.x, 1.78 + s.h/2, s.z]],
          [[.12, frameT, s.w + .16], [s.x, 1.78 - s.h/2, s.z]],
          [[.12, s.h, frameT], [s.x, 1.78, s.z - s.w/2]],
          [[.12, s.h, frameT], [s.x, 1.78, s.z + s.w/2]],
          [[.10, s.h, .045], [s.x, 1.78, s.z]]
        ];
    for (const [size, pos] of pieces) box(THREE, group, size, pos, m.trim, false);
  }
}
