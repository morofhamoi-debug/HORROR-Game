export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.enabled = false;
    this.yaw = 0;
    this.pitch = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.onInteract = null;
    this.onPause = null;
    this.onMobileMenu = null;
    this.joystickPointer = null;
    this.lookPointer = null;
    this.lookLast = { x: 0, y: 0 };
    this.abortController = new AbortController();
    this.signal = this.abortController.signal;
    this.bind();
  }

  listen(target, type, handler, options = {}) {
    target.addEventListener(type, handler, { ...options, signal: this.signal });
  }

  bind() {
    this.listen(window, 'keydown', event => {
      this.keys.add(event.code);
      if (event.code === 'KeyE' && !event.repeat && this.enabled) this.onInteract?.();
      if (event.code === 'Escape' && this.enabled) this.onPause?.();
    });

    this.listen(window, 'keyup', event => this.keys.delete(event.code));

    this.listen(document, 'mousemove', event => {
      if (!this.enabled || document.pointerLockElement !== this.canvas) return;
      this.rotate(event.movementX, event.movementY, 0.00215);
    });

    this.listen(document, 'pointerlockchange', () => {
      if (!document.pointerLockElement) this.keys.clear();
    });

    this.listen(document.getElementById('mobile-interact'), 'click', () => {
      if (this.enabled) this.onInteract?.();
    });

    this.listen(document.getElementById('mobile-menu'), 'click', () => {
      if (this.enabled) this.onMobileMenu?.();
    });

    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    if (joystick && knob) {
      const moveStick = event => {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const max = rect.width * 0.34;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const length = Math.hypot(dx, dy);
        const scale = length > max ? max / length : 1;
        const x = dx * scale;
        const y = dy * scale;
        knob.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        this.moveX = x / max;
        this.moveY = -y / max;
      };

      this.listen(joystick, 'pointerdown', event => {
        if (!this.enabled) return;
        this.joystickPointer = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        moveStick(event);
      });

      this.listen(joystick, 'pointermove', event => {
        if (event.pointerId === this.joystickPointer) moveStick(event);
      });

      const stopStick = event => {
        if (event.pointerId !== this.joystickPointer) return;
        this.joystickPointer = null;
        this.moveX = 0;
        this.moveY = 0;
        knob.style.transform = 'translate(0,0)';
      };

      this.listen(joystick, 'pointerup', stopStick);
      this.listen(joystick, 'pointercancel', stopStick);
    }

    const lookZone = document.getElementById('look-zone');
    if (lookZone) {
      this.listen(lookZone, 'pointerdown', event => {
        if (!this.enabled) return;
        this.lookPointer = event.pointerId;
        this.lookLast = { x: event.clientX, y: event.clientY };
        lookZone.setPointerCapture(event.pointerId);
      });

      this.listen(lookZone, 'pointermove', event => {
        if (event.pointerId !== this.lookPointer) return;
        const dx = event.clientX - this.lookLast.x;
        const dy = event.clientY - this.lookLast.y;
        this.lookLast = { x: event.clientX, y: event.clientY };
        this.rotate(dx, dy, 0.004);
      });

      const stopLook = event => {
        if (event.pointerId === this.lookPointer) this.lookPointer = null;
      };

      this.listen(lookZone, 'pointerup', stopLook);
      this.listen(lookZone, 'pointercancel', stopLook);
    }
  }

  rotate(dx, dy, sensitivity) {
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this.pitch = Math.max(-1.42, Math.min(1.42, this.pitch));
  }

  getMovement() {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    x += this.moveX;
    y += this.moveY;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return {
      x,
      y,
      sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')
    };
  }

  dispose() {
    this.enabled = false;
    this.keys.clear();
    this.moveX = 0;
    this.moveY = 0;
    this.joystickPointer = null;
    this.lookPointer = null;
    this.abortController.abort();
  }
}
