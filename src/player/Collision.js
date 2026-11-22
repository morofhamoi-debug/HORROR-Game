const PLAYER_RADIUS = 0.27;

// Solid architectural spans follow the actual dimensions in home/Walls.js.
// Furniture colliders cover the main walk-in objects, not small decorative props.
const SOLID_RECTS = [
  // Exterior shell; the front wall intentionally leaves the entry gap open.
  { minX: -6.12, maxX: 6.12, minZ: -5.12, maxZ: -4.88 },
  { minX: -6.12, maxX: -5.88, minZ: -5.0, maxZ: 5.0 },
  { minX: 5.88, maxX: 6.12, minZ: -5.0, maxZ: 5.0 },
  { minX: -6.12, maxX: -0.56, minZ: 4.88, maxZ: 5.12 },
  { minX: 0.56, maxX: 6.12, minZ: 4.88, maxZ: 5.12 },

  // Interior partitions and their open doorways.
  { minX: -1.11, maxX: -0.89, minZ: -5.0, maxZ: -2.45 },
  { minX: -1.11, maxX: -0.89, minZ: 2.55, maxZ: 5.0 },
  { minX: 2.75, maxX: 6.0, minZ: -1.31, maxZ: -1.09 },
  { minX: -6.0, maxX: -4.95, minZ: 1.09, maxZ: 1.31 },

  // Living room: sofa, media console, coffee table and floor-lamp base.
  { minX: -5.045, maxX: -2.395, minZ: -4.14, maxZ: -3.22 },
  { minX: -5.57, maxX: -5.39, minZ: -4.025, maxZ: -1.975 },
  { minX: -4.17, maxX: -2.79, minZ: -2.34, maxZ: -1.56 },
  { minX: -2.39, maxX: -1.91, minZ: -4.24, maxZ: -3.76 },

  // Kitchen: lower cabinets, refrigerator, dining table and chair footprints.
  { minX: 2.30, maxX: 5.60, minZ: -4.21, maxZ: -3.59 },
  { minX: 4.84, maxX: 5.66, minZ: -3.04, maxZ: -2.26 },
  { minX: 2.725, maxX: 4.375, minZ: -0.90, maxZ: 0.10 },
  { minX: 2.59, maxX: 3.01, minZ: -1.26, maxZ: -0.84 },
  { minX: 4.09, maxX: 4.51, minZ: -1.26, maxZ: -0.84 },
  { minX: 2.59, maxX: 3.01, minZ: 0.04, maxZ: 0.46 },
  { minX: 4.09, maxX: 4.51, minZ: 0.04, maxZ: 0.46 },

  // Bedroom: bed, wardrobe and bedside cabinets.
  { minX: 2.575, maxX: 4.825, minZ: 1.50, maxZ: 4.30 },
  { minX: 4.75, maxX: 5.75, minZ: 0.71, maxZ: 1.29 },
  { minX: 1.875, maxX: 2.425, minZ: 3.825, maxZ: 4.375 },
  { minX: 4.925, maxX: 5.475, minZ: 3.825, maxZ: 4.375 },

  // Bathroom fixtures.
  { minX: -5.56, maxX: -4.94, minZ: 1.89, maxZ: 2.71 },
  { minX: -5.64, maxX: -4.86, minZ: 4.11, maxZ: 4.59 },

  // Hallway console, shoe rack and umbrella stand.
  { minX: -0.575, maxX: 0.575, minZ: 3.38, maxZ: 3.72 },
  { minX: -1.46, maxX: -0.64, minZ: 3.94, maxZ: 4.36 },
  { minX: 0.81, maxX: 1.09, minZ: 4.06, maxZ: 4.34 }
];

function circleHitsRect(x, z, rect, radius) {
  const nearestX = Math.max(rect.minX, Math.min(x, rect.maxX));
  const nearestZ = Math.max(rect.minZ, Math.min(z, rect.maxZ));
  const dx = x - nearestX;
  const dz = z - nearestZ;
  return dx * dx + dz * dz < radius * radius;
}

export function createCollisionWorld() {
  function isBlocked(x, z) {
    // Keep exploration on the entrance apron and inside the exterior footprint.
    if (x < -6.45 || x > 6.45 || z < -5.45 || z > 8.25) return true;
    return SOLID_RECTS.some(rect => circleHitsRect(x, z, rect, PLAYER_RADIUS));
  }

  function move(position, deltaX, deltaZ) {
    // Resolve axes separately. This preserves wall sliding instead of stopping
    // all movement when only one axis meets a corner or piece of furniture.
    const nextX = position.x + deltaX;
    if (!isBlocked(nextX, position.z)) position.x = nextX;

    const nextZ = position.z + deltaZ;
    if (!isBlocked(position.x, nextZ)) position.z = nextZ;

    return position;
  }

  return { move, isBlocked, playerRadius: PLAYER_RADIUS };
}
