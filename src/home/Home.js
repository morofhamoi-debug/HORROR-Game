import { createHomeMaterials, box } from './materials.js';
import { buildWalls } from './Walls.js';
import { buildFloor } from './Floor.js';
import { buildLivingRoom } from '../rooms/LivingRoom.js';
import { buildKitchen } from '../rooms/Kitchen.js';
import { buildBedroom } from '../rooms/Bedroom.js';
import { buildBathroom } from '../rooms/Bathroom.js';

export function buildHome(THREE) {
  const home = new THREE.Group();
  home.name = 'HORROR_GAME_HOME';
  const m = createHomeMaterials();
  buildFloor(THREE, home, m);
  buildWalls(THREE, home, m);
  buildLivingRoom(THREE, home, m);
  buildKitchen(THREE, home, m);
  buildBedroom(THREE, home, m);
  buildBathroom(THREE, home, m);

  // Window frames and glass panels.
  for (const [x, z, width, height] of [[-3.8,-4.88,1.6,1.15],[1.2,-4.88,1.5,1.15],[-5.88,-1.0,1.1,1.1],[5.88,1.4,1.15,1.1]]) {
    const horizontal = Math.abs(x) < 5.7;
    const pane = box(THREE, home, horizontal ? [width,height,.045] : [.045,height,width], [x,1.75,z], m.glass, false);
    pane.material = m.glass;
  }

  // Warm ceiling fixtures keep the interior dim but readable.
  for (const [x,z] of [[-3.4,-2.6],[3.3,-2.5],[-3.5,2.8],[3.5,2.8]]) {
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(.55,.08,.28), m.dark);
    fixture.position.set(x,2.82,z);
    home.add(fixture);
    const light = new THREE.PointLight(0xffd9a6, 22, 7, 2);
    light.position.set(x,2.55,z);
    light.castShadow = true;
    home.add(light);
  }
  return home;
}