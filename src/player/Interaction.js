export function createInteractionSystem({ THREE, camera, roots, collisionWorld }) {
  const raycaster = new THREE.Raycaster();
  raycaster.far = 3.2;
  const center = new THREE.Vector2(0, 0);
  const prompt = document.querySelector('#interaction-prompt');
  const promptText = document.querySelector('#interaction-text');
  const interactButton = document.querySelector('#interact-button');
  const inspectPanel = document.querySelector('#inspect-panel');
  const inspectTitle = document.querySelector('#inspect-title');
  const inspectBody = document.querySelector('#inspect-body');
  const inspectClose = document.querySelector('#inspect-close');

  let focused = null;
  let panelOpen = false;

  function findInteractable(object) {
    let current = object;
    while (current) {
      if (current.userData?.interaction) return current;
      current = current.parent;
    }
    return null;
  }

  function setPrompt(target) {
    focused = target;
    const meta = target?.userData?.interaction;
    const label = meta?.type === 'door'
      ? (target.userData.isOpen ? 'Закрыть дверь' : 'Открыть дверь')
      : meta?.type === 'light-switch'
        ? (meta.getState() ? 'Выключить свет' : 'Включить свет')
        : meta?.label || 'Взаимодействовать';

    if (promptText) promptText.textContent = label;
    prompt?.classList.toggle('hidden', !target || panelOpen);
    if (interactButton) {
      interactButton.classList.toggle('hidden', !target || panelOpen);
      interactButton.textContent = meta?.type === 'inspect' ? 'ОСМОТРЕТЬ' : 'ВЗАИМОДЕЙСТВОВАТЬ';
    }
  }

  function closeInspection() {
    panelOpen = false;
    inspectPanel?.classList.add('hidden');
    setPrompt(focused);
  }

  inspectClose?.addEventListener('click', closeInspection);

  function interact() {
    if (!focused || panelOpen) return false;
    const target = focused;
    const meta = target.userData.interaction;

    if (meta.type === 'door') {
      target.userData.isOpen = !target.userData.isOpen;
      target.userData.targetAngle = target.userData.isOpen ? Math.PI / 2 : 0;
      collisionWorld?.setDoorClosed(!target.userData.isOpen);
      setPrompt(target);
      return true;
    }

    if (meta.type === 'light-switch') {
      meta.toggle();
      const state = meta.getState();
      if (meta.rocker) meta.rocker.rotation.x = state ? -0.18 : 0.18;
      setPrompt(target);
      return true;
    }

    if (meta.type === 'inspect') {
      panelOpen = true;
      if (inspectTitle) inspectTitle.textContent = meta.title || meta.label || 'Осмотр';
      if (inspectBody) inspectBody.textContent = meta.description || 'Здесь нет ничего необычного.';
      inspectPanel?.classList.remove('hidden');
      setPrompt(null);
      return true;
    }

    meta.onActivate?.();
    return true;
  }

  interactButton?.addEventListener('click', interact);

  function update(delta) {
    for (const root of roots) {
      if (root.userData?.interaction?.type === 'door') {
        const targetAngle = root.userData.targetAngle ?? -0.95;
        root.rotation.y = THREE.MathUtils.damp(root.rotation.y, targetAngle, 9, delta);
      }
    }

    if (panelOpen) return;
    camera.updateMatrixWorld();
    raycaster.setFromCamera(center, camera);
    const intersections = raycaster.intersectObjects(roots, true);
    const hit = intersections.find(entry => entry.distance <= raycaster.far);
    const target = hit ? findInteractable(hit.object) : null;
    setPrompt(target);
  }

  return {
    update,
    interact,
    closeInspection,
    getFocused: () => focused
  };
}
