export const HOUSE = Object.freeze({
  bounds: Object.freeze({ minX: -9.65, maxX: 9.65, minZ: -6.65, maxZ: 6.65 }),
  exteriorWallThickness: 0.30,
  interiorWallThickness: 0.14,
  floorThickness: 0.24,
  ceilingFinishThickness: 0.08,
  foundationThickness: 0.36,
  stairwell: Object.freeze({
    minX: 5.45,
    maxX: 8.65,
    topZ: -4.55,
    bottomZ: 3.85,
    centerX: 7.05,
    width: 1.90
  })
});

export const LEVELS = Object.freeze({
  basement: -1,
  ground: 0,
  upper: 1
});

export const FLOOR_Y = Object.freeze({
  [-1]: -2.65,
  [0]: 0,
  [1]: 3.15
});

export const ROOM_HEIGHT = Object.freeze({
  [-1]: 2.33,
  [0]: 2.83,
  [1]: 2.74
});

export const DOOR = Object.freeze({
  height: 2.08,
  leafThickness: 0.085,
  handleHeight: 1.02,
  openingClearance: 0.055
});

export const WINDOW = Object.freeze({
  sillHeight: 0.86,
  height: 1.22,
  glassThickness: 0.055
});

export const PLAYER = Object.freeze({
  radius: 0.32,
  height: 1.78,
  eyeHeight: 1.66,
  walkSpeed: 2.75,
  sprintSpeed: 4.5
});

export const STAIRS = Object.freeze({
  centerX: HOUSE.stairwell.centerX,
  halfWidth: 0.88,
  upper: Object.freeze({
    from: 0,
    to: 1,
    startZ: 0,
    endZ: -4.55,
    steps: 17
  }),
  basement: Object.freeze({
    from: 0,
    to: -1,
    startZ: 0,
    endZ: 3.85,
    steps: 13
  })
});

export function floorY(level) {
  if (!(level in FLOOR_Y)) throw new RangeError('Unknown house level: ' + level);
  return FLOOR_Y[level];
}

export function roomHeight(level) {
  if (!(level in ROOM_HEIGHT)) throw new RangeError('Unknown house level: ' + level);
  return ROOM_HEIGHT[level];
}

export function levelName(level) {
  return level === 1 ? 'ВТОРОЙ ЭТАЖ' : level === -1 ? 'ПОДВАЛ' : 'ПЕРВЫЙ ЭТАЖ';
}

export function stairFlightFor(level, directionZ) {
  if (level === 0 && directionZ < 0) return STAIRS.upper;
  if (level === 1 && directionZ > 0) return { ...STAIRS.upper, from: 1, to: 0, startZ: STAIRS.upper.endZ, endZ: STAIRS.upper.startZ };
  if (level === 0 && directionZ > 0) return STAIRS.basement;
  if (level === -1 && directionZ < 0) return { ...STAIRS.basement, from: -1, to: 0, startZ: STAIRS.basement.endZ, endZ: STAIRS.basement.startZ };
  return null;
}

export function stairProgress(flight, z) {
  const span = flight.endZ - flight.startZ;
  if (Math.abs(span) < 0.001) return 1;
  return Math.min(1, Math.max(0, (z - flight.startZ) / span));
}
