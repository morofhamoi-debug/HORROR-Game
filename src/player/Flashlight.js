export function createFlashlight(THREE, camera, audio) {
  const housing = new THREE.Group();
  housing.name = 'PLAYER_FLASHLIGHT';

  const barrelMaterial = new THREE.MeshStandardMaterial({
    color: 0x252a29,
    metalness: .78,
    roughness: .34
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0x788078,
    metalness: .86,
    roughness: .25
  });
  const lensMaterial = new THREE.MeshStandardMaterial({
    color: 0x899b8a,
    emissive: 0x9bb99d,
    emissiveIntensity: .08,
    metalness: .12,
    roughness: .2
  });

  // Compact flashlight model, visible in the lower-right of the first-person view.
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(.045, .052, .34, 18),
    barrelMaterial
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(.23, -.22, -.47);
  barrel.castShadow = false;
  barrel.frustumCulled = false;
  housing.add(barrel);

  const frontRing = new THREE.Mesh(
    new THREE.CylinderGeometry(.055, .055, .035, 18),
    trimMaterial
  );
  frontRing.rotation.x = Math.PI / 2;
  frontRing.position.set(.23, -.22, -.64);
  housing.add(frontRing);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(.043, .043, .012, 18),
    lensMaterial
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(.23, -.22, -.664);
  housing.add(lens);

  const beam = new THREE.SpotLight(0xe4eddf, 42, 17, Math.PI / 7, 0.48, 1.45);
  beam.position.set(.23, -.22, -.62);
  beam.castShadow = false;
  const target = new THREE.Object3D();
  target.position.set(.23, -.22, -8);
  housing.add(beam);
  housing.add(target);
  beam.target = target;

  const fill = new THREE.PointLight(0xd9e6dc, 1.2, 2.8, 2);
  fill.position.set(.23, -.22, -.58);
  housing.add(fill);

  camera.add(housing);
  housing.visible = false;

  let enabled = false;
  const button = document.querySelector('#flashlight-button');

  function setEnabled(value) {
    enabled = Boolean(value);
    housing.visible = enabled;
    lensMaterial.emissiveIntensity = enabled ? .9 : .08;
    audio?.playFlashlight(enabled);
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
