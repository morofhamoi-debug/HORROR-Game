export class Input {
  constructor(canvas) {
    this.canvas = canvas; this.keys = new Set(); this.enabled = false;
    this.yaw = 0; this.pitch = 0; this.moveX = 0; this.moveY = 0;
    this.onInteract = null; this.onPause = null; this.onMobileMenu = null;
    this.joystickPointer = null; this.lookPointer = null; this.lookLast = { x: 0, y: 0 };
    this.bind();
  }
  bind() {
    window.addEventListener('keydown', event => {
      this.keys.add(event.code);
      if (event.code === 'KeyE' && !event.repeat && this.enabled) this.onInteract?.();
      if (event.code === 'Escape' && this.enabled) this.onPause?.();
    });
    window.addEventListener('keyup', event => this.keys.delete(event.code));
    document.addEventListener('mousemove', event => {
      if (!this.enabled || document.pointerLockElement !== this.canvas) return;
      this.rotate(event.movementX, event.movementY, .00215);
    });
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement) this.keys.clear();
    });
    document.getElementById('mobile-interact')?.addEventListener('click', () => {
      if (this.enabled) this.onInteract?.();
    });
    document.getElementById('mobile-menu')?.addEventListener('click', () => this.onMobileMenu?.());

    const joy = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    if (joy && knob) {
      const move = event => {
        const rect = joy.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const max = rect.width * .34;
        const dx = event.clientX - cx, dy = event.clientY - cy;
        const len = Math.hypot(dx, dy), scale = len > max ? max / len : 1;
        const x = dx * scale, y = dy * scale;
        knob.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        this.moveX = x / max; this.moveY = -y / max;
      };
      joy.addEventListener('pointerdown', event => {
        if (!this.enabled) return;
        this.joystickPointer = event.pointerId; joy.setPointerCapture(event.pointerId); move(event);
      });
      joy.addEventListener('pointermove', event => { if (event.pointerId === this.joystickPointer) move(event); });
      const stop = event => {
        if (event.pointerId !== this.joystickPointer) return;
        this.joystickPointer = null; this.moveX = 0; this.moveY = 0; knob.style.transform = 'translate(0,0)';
      };
      joy.addEventListener('pointerup', stop); joy.addEventListener('pointercancel', stop);
    }
    const look = document.getElementById('look-zone');
    if (look) {
      look.addEventListener('pointerdown', event => {
        if (!this.enabled) return;
        this.lookPointer = event.pointerId; this.lookLast = { x: event.clientX, y: event.clientY };
        look.setPointerCapture(event.pointerId);
      });
      look.addEventListener('pointermove', event => {
        if (event.pointerId !== this.lookPointer) return;
        const dx = event.clientX - this.lookLast.x, dy = event.clientY - this.lookLast.y;
        this.lookLast = { x: event.clientX, y: event.clientY }; this.rotate(dx, dy, .004);
      });
      const stopLook = event => { if (event.pointerId === this.lookPointer) this.lookPointer = null; };
      look.addEventListener('pointerup', stopLook); look.addEventListener('pointercancel', stopLook);
    }
  }
  rotate(dx, dy, sensitivity) {
    this.yaw -= dx * sensitivity; this.pitch -= dy * sensitivity;
    this.pitch = Math.max(-1.42, Math.min(1.42, this.pitch));
  }
  getMovement() {
    let x = 0, y = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    x += this.moveX; y += this.moveY;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    return { x, y, sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') };
  }
}