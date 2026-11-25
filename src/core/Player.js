import * as THREE from 'three';
export class Player {
  constructor(camera, input, colliders) {
    this.camera = camera; this.input = input; this.colliders = colliders;
    this.position = new THREE.Vector3(-1.2, 0, 5.6); this.level = 0;
    this.velocity = new THREE.Vector3(); this.radius = .34; this.eyeHeight = 1.68;
    this.stairBase = null; this.stairDirection = 0; this.stairStart = 0; this.stairEnd = 0; this.stairTarget = 0;
  }
  reset() {
    this.position.set(-1.2, 0, 5.6); this.level = 0; this.velocity.set(0, 0, 0);
    this.stairBase = null; this.stairDirection = 0; this.stairCooldown = false;
    this.input.yaw = 0; this.input.pitch = 0;
    this.camera.position.set(this.position.x, this.eyeHeight, this.position.z);
  }
  blocked(x, z, level) {
    for (const box of this.colliders) {
      if (box.enabled === false) continue;
      if (box.level !== undefined && box.level !== level) continue;
      if (x > box.minX - this.radius && x < box.maxX + this.radius && z > box.minZ - this.radius && z < box.maxZ + this.radius) return true;
    }
    return false;
  }
  update(dt) {
    const move = this.input.getMovement();
    const fx = -Math.sin(this.input.yaw), fz = -Math.cos(this.input.yaw);
    const rx = Math.cos(this.input.yaw), rz = -Math.sin(this.input.yaw);
    const speed = move.sprint ? 4.5 : 2.75;
    const dx = (fx * move.y + rx * move.x) * speed * dt;
    const dz = (fz * move.y + rz * move.x) * speed * dt;
    const oldX = this.position.x, oldZ = this.position.z;
    const nextX = THREE.MathUtils.clamp(oldX + dx, -9.45, 9.45);
    const nextZ = THREE.MathUtils.clamp(oldZ + dz, -6.42, 6.42);
    if (!this.blocked(nextX, oldZ, this.level)) this.position.x = nextX;
    if (!this.blocked(this.position.x, nextZ, this.level)) this.position.z = nextZ;

    const stair = this.isStairs(this.position.x, this.position.z);
    if (!stair) {
      this.stairBase = null; this.stairDirection = 0;
    } else if (this.stairBase === null && Math.abs(dz) > .0001) {
      if (this.level === 0 && dz < 0) {
        this.stairBase = 0; this.stairDirection = 1; this.stairTarget = 1;
        this.stairStart = this.position.z; this.stairEnd = -3.1;
      } else if (this.level === 0 && dz > 0) {
        this.stairBase = 0; this.stairDirection = -1; this.stairTarget = -1;
        this.stairStart = this.position.z; this.stairEnd = 3.1;
      } else if (this.level === 1 && dz > 0) {
        this.stairBase = 1; this.stairDirection = -1; this.stairTarget = 0;
        this.stairStart = this.position.z; this.stairEnd = 0;
      } else if (this.level === -1 && dz < 0) {
        this.stairBase = -1; this.stairDirection = 1; this.stairTarget = 0;
        this.stairStart = this.position.z; this.stairEnd = 0;
      }
    }
    let floorY = this.level * 3.5;
    if (stair && this.stairBase !== null) {
      const span = Math.max(.01, Math.abs(this.stairEnd - this.stairStart));
      const traveled = this.stairDirection > 0
        ? this.stairStart - this.position.z
        : this.position.z - this.stairStart;
      const progress = THREE.MathUtils.clamp(traveled / span, 0, 1);
      floorY = this.stairBase * 3.5 + this.stairDirection * progress * 3.5;
      if (progress > .985) {
        this.level = this.stairTarget;
        this.stairBase = null;
        this.stairDirection = 0;
        floorY = this.level * 3.5;
      }
    }
    this.position.y = floorY;
    this.camera.position.set(this.position.x, floorY + this.eyeHeight, this.position.z);
  }
  isStairs(x, z) { return Math.abs(x - 7.05) < 1.42 && z > -3.25 && z < 3.25; }
}