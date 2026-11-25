import { HOUSE } from './Layout.js';

const ZONES = Object.freeze([
  { level: 0, minX: -9.5, maxX: 0.1, minZ: -6.5, maxZ: 0.15, name: 'ГОСТИНАЯ' },
  { level: 0, minX: 0.1, maxX: 9.5, minZ: -6.5, maxZ: 0.15, name: 'КУХНЯ' },
  { level: 0, minX: -9.5, maxX: 0.1, minZ: 0.15, maxZ: 6.5, name: 'КАБИНЕТ / ПРИХОЖАЯ' },
  { level: 0, minX: 0.1, maxX: 9.5, minZ: 0.15, maxZ: 6.5, name: 'СТОЛОВАЯ' },

  { level: 1, minX: -9.5, maxX: 0.1, minZ: -6.5, maxZ: 0.15, name: 'СПАЛЬНЯ ХОЗЯЕВ' },
  { level: 1, minX: 0.1, maxX: 9.5, minZ: -6.5, maxZ: 0.15, name: 'ГОСТЕВАЯ СПАЛЬНЯ' },
  { level: 1, minX: -9.5, maxX: 0.1, minZ: 0.15, maxZ: 6.5, name: 'ДЕТСКАЯ' },
  { level: 1, minX: 0.1, maxX: 9.5, minZ: 0.15, maxZ: 6.5, name: 'ВАННАЯ' },

  { level: -1, minX: -9.5, maxX: 0.1, minZ: -6.5, maxZ: 0.15, name: 'КОТЕЛЬНАЯ' },
  { level: -1, minX: 0.1, maxX: 9.5, minZ: -6.5, maxZ: 0.15, name: 'ПРАЧЕЧНАЯ' },
  { level: -1, minX: -9.5, maxX: 0.1, minZ: 0.15, maxZ: 6.5, name: 'КЛАДОВАЯ' },
  { level: -1, minX: 0.1, maxX: 9.5, minZ: 0.15, maxZ: 6.5, name: 'МАСТЕРСКАЯ' }
]);

export function roomAt(level, x, z) {
  const inStairwell =
    Math.abs(x - HOUSE.stairwell.centerX) <= HOUSE.stairwell.width / 2 &&
    z >= HOUSE.stairwell.topZ &&
    z <= HOUSE.stairwell.bottomZ;
  if (inStairwell) return 'ЛЕСТНИЧНЫЙ ПРОЁМ';

  const room = ZONES.find(zone =>
    zone.level === level &&
    x >= zone.minX && x <= zone.maxX &&
    z >= zone.minZ && z <= zone.maxZ
  );
  return room?.name ?? (level < 0 ? 'ПОДВАЛ' : level > 0 ? 'ВТОРОЙ ЭТАЖ' : 'ПЕРВЫЙ ЭТАЖ');
}

export function roomZones() {
  return ZONES.map(zone => ({ ...zone }));
}
