import * as THREE from 'three';
import { HOUSE, PLAYER, STAIRS, floorY, roomHeight, stairFlightFor, stairProgress } from '../world/Layout.js';

function circleIntersectsAabb(x, z, radius, box) {
  const closestX = Math.max(box.minX, Math.min(x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < radius * radius;
}

export class Player {
  constructor(camera, input, colliders) {
    this.camera = camera;
    this.input = input;
    this.colliders = colliders;
    this.position = new THREE.Vector3(-3.1, 0, 5.6);
    this.level = 0;
    this.radius = PLAYER.radius;
    this.height = PLAYER.height;
    this.eyeHeight = PLAYER.eyeHeight;
    this.stairFlight = null;
    this.floorHeight = floorY(0);
    this.verticalVelocity = 0;
    this.grounded = true;
    this.gravity = 18;
    this.maxStepHeight = 0.23;
  }

  reset() {
    this.position.set(-3.1, floorY(0), 5.6);
    this.level = 0;
    this.floorHeight = floorY(0);
    this.verticalVelocity = 0;
    this.grounded = true;
    this.stairFlight = null;
    this.input.yaw = 0;
    this.input.pitch = 0;
    this.camera.position.set(this.position.x, this.floorHeight + this.eyeHeight, this.position.z);
  }

  isInsideStairLane(x, z) {
    return Math.abs(x - STAIRS.centerX) <= STAIRS.halfWidth &&
      z >= HOUSE.stairwell.topZ - 0.15 &&
      z <= HOUSE.stairwell.bottomZ + 0.15;
  }

  floorAt(x, z, dz) {
    if (!this.stairFlight && this.isInsideStairLane(x, z) && Math.abs(dz) > 0.00001) {
      this.stairFlight = stairFlightFor(this.level, dz);
    }

    if (!this.stairFlight) return floorY(this.level);

    const flight = this.stairFlight;
    const progress = stairProgress(flight, z);
    const count = flight.steps;
    const fromY = floorY(flight.from);
    const toY = floorY(flight.to);
    const stepIndex = toY > fromY
      ? Math.max(0, Math.min(count, Math.ceil(progress * count - 0.000001)))
      : Math.max(0, Math.min(count, Math.floor(progress * count + 0.000001)));
    const currentY = fromY + (toY - fromY) * (stepIndex / count);

    if (progress >= 0.999) {
      this.level = flight.to;
      this.stairFlight = null;
      return floorY(this.level);
    }

    // Walking back to the originating landing releases the stair state cleanly.
    if (progress <= 0.001 && ((flight.endZ < flight.startZ && dz > 0) || (flight.endZ > flight.startZ && dz < 0))) {
      this.stairFlight = null;
      return floorY(this.level);
    }
    return currentY;
  }

  groundSurfaceAt(x, z, dz) {
    if (this.isInsideStairLane(x, z) || this.stairFlight) return this.floorAt(x, z, dz);
    const insideFootprint = x >= HOUSE.bounds.minX && x <= HOUSE.bounds.maxX && z >= HOUSE.bounds.minZ && z <= HOUSE.bounds.maxZ;
    if (insideFootprint) return this.floorAt(x, z, dz);
    // Front porch and its three physical steps descend to the exterior terrain height.
    if (Math.abs(x) <= 2.3 && z > HOUSE.bounds.maxZ && z <= 9.5) {
      if (z <= 8.08) return 0;
      if (z <= 8.53) return -0.02;
      if (z <= 8.95) return -0.10;
      return -0.16;
    }
    return -0.16;
  }

  isBlocked(x, z, feetY) {
    const inOpenStairwell = this.stairFlight !== null || this.isInsideStairLane(x, z);
    if (!inOpenStairwell && feetY + this.height > floorY(this.level) + roomHeight(this.level) - 0.06) {
      return true;
    }
    for (const box of this.colliders) {
      if (box.enabled === false) continue;
      if (box.level !== undefined && box.level !== this.level &&
          !(this.stairFlight && (box.level === this.stairFlight.from || box.level === this.stairFlight.to))) continue;

      if (Number.isFinite(box.minY) && Number.isFinite(box.maxY)) {
        const bodyBottom = feetY + 0.04;
        const bodyTop = feetY + this.height;
        if (box.maxY <= bodyBottom || box.minY >= bodyTop) continue;
      }
      if (circleIntersectsAabb(x, z, this.radius, box)) return true;
    }
    return false;
  }

  update(dt) {
    const move = this.input.getMovement();
    const forwardX = -Math.sin(this.input.yaw);
    const forwardZ = -Math.cos(this.input.yaw);
    const rightX = Math.cos(this.input.yaw);
    const rightZ = -Math.sin(this.input.yaw);
    const speed = move.sprint ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
    const dx = (forwardX * move.y + rightX * move.x) * speed * dt;
    const dz = (forwardZ * move.y + rightZ * move.x) * speed * dt;

    const oldX = this.position.x;
    const oldZ = this.position.z;
    let nextX = THREE.MathUtils.clamp(oldX + dx, -30, 30);
    let nextZ = THREE.MathUtils.clamp(oldZ + dz, -30, 30);

    // Resolve each axis independently for predictable wall sliding.
    const candidateFloorX = this.floorAt(nextX, this.position.z, 0);
    if (!this.isBlocked(nextX, this.position.z, candidateFloorX)) {
      this.position.x = nextX;
    }

    const candidateFloorZ = this.floorAt(this.position.x, nextZ, dz);
    if (!this.isBlocked(this.position.x, nextZ, candidateFloorZ)) {
      this.position.z = nextZ;
    }

    const targetFloor = this.groundSurfaceAt(this.position.x, this.position.z, dz);
    const heightDelta = targetFloor - this.position.y;

    if (heightDelta <= this.maxStepHeight && heightDelta >= -this.maxStepHeight) {
      // Step-sized vertical changes follow real tread surfaces without floating or snapping through a floor.
      this.position.y = targetFloor;
      this.verticalVelocity = 0;
      this.grounded = true;
    } else if (heightDelta < -this.maxStepHeight) {
      // Large drops are resolved by gravity rather than an instant level-height teleport.
      this.grounded = false;
      this.verticalVelocity -= this.gravity * dt;
      this.position.y += this.verticalVelocity * dt;
      if (this.position.y <= targetFloor) {
        this.position.y = targetFloor;
        this.verticalVelocity = 0;
        this.grounded = true;
      }
    } else {
      // Do not allow the capsule to climb an unconnected vertical ledge.
      this.position.x = oldX;
      this.position.z = oldZ;
      this.stairFlight = null;
      this.verticalVelocity = 0;
      this.grounded = true;
      this.position.y = this.groundSurfaceAt(oldX, oldZ, 0);
    }

    this.floorHeight = this.position.y;
    this.camera.position.set(
      this.position.x,
      this.floorHeight + this.eyeHeight,
      this.position.z
    );
  }
}
