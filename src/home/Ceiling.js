import { box } from './materials.js';

export function buildCeiling(THREE, group, m) {
  box(THREE, group, [12, .16, 10], [0, 2.98, 0], m.plaster, false, true);

  // Continuous ceiling coving around the room perimeter.
  box(THREE, group, [11.75, .07, .07], [0, 2.86, -4.82], m.trim, false);
  box(THREE, group, [11.75, .07, .07], [0, 2.86, 4.82], m.trim, false);
  box(THREE, group, [.07, .07, 9.65], [-5.82, 2.86, 0], m.trim, false);
  box(THREE, group, [.07, .07, 9.65], [5.82, 2.86, 0], m.trim, false);

  // Recessed ceiling fixtures: dark housing, isolated luminous diffuser and warm pool of light.
  for (const [x, z] of [[-3.4,-2.6],[3.3,-2.5],[-3.5,2.8],[3.5,2.8]]) {
    box(THREE, group, [.62,.075,.34], [x,2.84,z], m.dark, false);

    const diffuser = box(THREE, group, [.48,.025,.22], [x,2.79,z], m.trim, false);
    // Clone the shared trim material so only the lamp diffuser emits light.
    diffuser.material = m.trim.clone();
    diffuser.material.emissive = new THREE.Color(0x8c7048);
    diffuser.material.emissiveIntensity = .42;

    const light = new THREE.PointLight(0xffd9ad, 12, 6.2, 2);
    light.position.set(x, 2.56, z);
    light.castShadow = false;
    group.add(light);
  }
}
