export function createFlashlight(THREE, camera) {
  const housing = new THREE.Group();
  housing.name = 'PLAYER_FLASHLIGHT_LIGHT';

  const beam = new THREE.SpotLight(0xe4eddf, 42, 17, Math.PI / 7, 0.48, 1.45);
  beam.position.set(0.16, -0.13, -0.22);
  beam.castShadow = false;
  const target = new THREE.Object3D();
  target.position.set(0.08, -0.16, -8);
  housing.add(beam);
  housing.add(target);
  beam.target = target;

  const fill = new THREE.PointLight(0xd9e6dc, 1.2, 2.8, 2);
  fill.position.set(0.12, -0.12, -0.28);
  housing.add(fill);

  camera.add(housing);
  housing.visible = false;

  let enabled = false;
  const button = document.querySelector('#flashlight-button');

  function setEnabled(value) {
    enabled = Boolean(value);
    housing.visible = enabled;
    if (button) {
      button.classList.toggle('active', enabled);
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'ФОНАРИК: ВКЛ' : 'ФОНАРИК';
    }
  }

  button?.addEventListener('click', () => setEnabled(!enabled));

  return {
    toggle: () => setEnabled(!enabled),
    setEnabled,
    isEnabled: () => enabled
  };
}
