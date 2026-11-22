export function createTouchControls({ renderer, camera, enabled }) {
  const base = document.querySelector('#joystick');
  const knob = document.querySelector('#joystick-knob');
  const hint = document.querySelector('#look-hint');

  camera.rotation.order = 'YXZ';
  const input = { x: 0, y: 0 };
  let stickPointer = null;
  let lookPointer = null;
  let lastLookX = 0;
  let lastLookY = 0;
  const sensitivity = 0.0036;
  const maxPitch = Math.PI / 2 - 0.08;

  if (!enabled || !base || !knob) {
    document.querySelector('#touch-controls')?.classList.add('disabled');
    return {
      enabled: false,
      getInput: () => ({ x: 0, y: 0 })
    };
  }

  document.querySelector('#touch-controls')?.classList.remove('disabled');
  hint?.classList.remove('hidden');

  function updateStick(event) {
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = rect.width * 0.34;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const length = Math.hypot(dx, dy);
    const scale = length > maxDistance ? maxDistance / length : 1;
    const clampedX = dx * scale;
    const clampedY = dy * scale;

    input.x = clampedX / maxDistance;
    input.y = -clampedY / maxDistance;
    knob.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
  }

  function resetStick() {
    input.x = 0;
    input.y = 0;
    knob.style.transform = 'translate(-50%, -50%)';
  }

  base.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    event.preventDefault();
    stickPointer = event.pointerId;
    base.setPointerCapture(event.pointerId);
    updateStick(event);
  });

  base.addEventListener('pointermove', event => {
    if (event.pointerId === stickPointer) {
      event.preventDefault();
      updateStick(event);
    }
  });

  function releaseStick(event) {
    if (event.pointerId !== stickPointer) return;
    stickPointer = null;
    resetStick();
  }
  base.addEventListener('pointerup', releaseStick);
  base.addEventListener('pointercancel', releaseStick);
  base.addEventListener('lostpointercapture', releaseStick);

  renderer.domElement.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    if (event.clientX < window.innerWidth * 0.34) return;
    lookPointer = event.pointerId;
    lastLookX = event.clientX;
    lastLookY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  renderer.domElement.addEventListener('pointermove', event => {
    if (event.pointerId !== lookPointer) return;
    const dx = event.clientX - lastLookX;
    const dy = event.clientY - lastLookY;
    lastLookX = event.clientX;
    lastLookY = event.clientY;
    camera.rotation.y -= dx * sensitivity;
    camera.rotation.x = Math.max(
      -maxPitch,
      Math.min(maxPitch, camera.rotation.x - dy * sensitivity)
    );
    event.preventDefault();
  });

  function releaseLook(event) {
    if (event.pointerId === lookPointer) lookPointer = null;
  }
  renderer.domElement.addEventListener('pointerup', releaseLook);
  renderer.domElement.addEventListener('pointercancel', releaseLook);
  renderer.domElement.addEventListener('lostpointercapture', releaseLook);

  return {
    enabled: true,
    getInput: () => ({ x: input.x, y: input.y })
  };
}
