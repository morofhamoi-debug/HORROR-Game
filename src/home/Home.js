import { createHomeMaterials } from './materials.js';
import { buildWalls } from './Walls.js';
import { buildFloor } from './Floor.js';
import { buildCeiling } from './Ceiling.js';
import { buildDoors } from './Doors.js';
import { buildWindows } from './Windows.js';
import { buildLivingRoom } from '../rooms/LivingRoom.js';
import { buildKitchen } from '../rooms/Kitchen.js';
import { buildBedroom } from '../rooms/Bedroom.js';
import { buildBathroom } from '../rooms/Bathroom.js';
import { buildCorridor } from '../rooms/Corridor.js';
import { buildWallSwitch } from './WallSwitch.js';
import { buildInspectables } from './Inspectables.js';

export function buildHome(THREE) {
  const home = new THREE.Group();
  home.name = 'HORROR_GAME_HOME';
  const m = createHomeMaterials();

  buildFloor(THREE, home, m);
  buildWalls(THREE, home, m);
  buildCeiling(THREE, home, m);
  buildWindows(THREE, home, m);
  const entryDoor = buildDoors(THREE, home, m);

  // Each room is an independent module to keep the project expandable.
  buildLivingRoom(THREE, home, m);
  buildKitchen(THREE, home, m);
  buildBedroom(THREE, home, m);
  buildBathroom(THREE, home, m);
  buildCorridor(THREE, home, m);

  const lightSwitch = buildWallSwitch(THREE, home, m, home.userData.ceilingFixtures);
  const photograph = buildInspectables(THREE, home, m);
  home.userData.interactables = [entryDoor, lightSwitch, photograph];

  return home;
}
