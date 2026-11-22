import { box } from './materials.js';

export function buildFloor(THREE, group, m) {
  box(THREE, group, [12, .22, 10], [0, -.11, 0], m.floor);
  // Fine seams make the timber floor read at walking height.
  const seam = new THREE.LineBasicMaterial({ color: 0x30251e, transparent: true, opacity: .28 });
  for (let x = -5.5; x <= 5.5; x += .75) {
    const points = [new THREE.Vector3(x, .006, -4.8), new THREE.Vector3(x, .006, 4.8)];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), seam));
  }
  // Staggered short joints between floorboards.
  for (let z=-4.5; z<=4.5; z+=1.5) {
    for(let x=-5.6+(Math.round((z+4.5)/1.5)%2)*.35; x<5.6; x+=1.5) {
      const pts=[new THREE.Vector3(x,.007,z),new THREE.Vector3(x,.007,z+.72)];
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),seam));
    }
  }
}
