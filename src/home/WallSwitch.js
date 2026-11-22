import { box } from './materials.js';

export function buildWallSwitch(THREE, group, m, fixtures) {
  const control = new THREE.Group();
  control.name = 'ENTRY_LIGHT_SWITCH';
  box(THREE, control, [.17,.24,.055], [0,0,0], m.dark, false);
  box(THREE, control, [.105,.17,.018], [0,0,-.037], m.trim, false);
  const rocker = box(THREE, control, [.052,.09,.025], [0,0,-.055], m.metal, false);
  control.position.set(.86,1.22,4.91);

  let isOn = true;
  control.userData.interaction = {
    type: 'light-switch',
    label: 'Выключить свет',
    rocker,
    toggle() {
      isOn = !isOn;
      for (const fixture of fixtures) {
        fixture.light.visible = isOn;
        fixture.diffuser.material.emissiveIntensity = isOn ? 0.42 : 0.015;
      }
    },
    getState: () => isOn
  };

  group.add(control);
  return control;
}
