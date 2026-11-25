import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOUSE,
  PLAYER,
  FLOOR_Y,
  ROOM_HEIGHT,
  DOOR,
  WINDOW,
  STAIRS,
  floorY,
  roomHeight,
  stairFlightFor,
  stairProgress
} from '../src/world/Layout.js';
import { roomAt, roomZones } from '../src/world/RoomZones.js';

test('the three floor elevations are ordered and separated by their room height plus slab', () => {
  assert.equal(floorY(-1), -2.65);
  assert.equal(floorY(0), 0);
  assert.equal(floorY(1), 3.15);
  assert.ok(floorY(-1) < floorY(0));
  assert.ok(floorY(0) < floorY(1));
  assert.equal(floorY(0) - HOUSE.floorThickness - HOUSE.ceilingFinishThickness - floorY(-1), roomHeight(-1));
  assert.equal(floorY(1) - HOUSE.floorThickness - HOUSE.ceilingFinishThickness - floorY(0), roomHeight(0));
});

test('all interior clear heights are finite and human-scale', () => {
  for (const level of [-1, 0, 1]) {
    const height = roomHeight(level);
    assert.ok(Number.isFinite(height));
    assert.ok(height >= 2.30 && height <= 3.05);
    assert.ok(height > PLAYER.height + 0.45);
  }
});

test('the basement and upper stair flights have consistent step rise and tread', () => {
  for (const [flight, target] of [[STAIRS.upper, 1], [STAIRS.basement, -1]]) {
    const rise = Math.abs(floorY(target) - floorY(0)) / flight.steps;
    const tread = Math.abs(flight.endZ - flight.startZ) / flight.steps;
    assert.ok(rise >= 0.17 && rise <= 0.22, 'step rise: ' + rise);
    assert.ok(tread >= 0.25 && tread <= 0.31, 'step tread: ' + tread);
  }
});

test('stair routing maps all four ascent and descent directions', () => {
  assert.equal(stairFlightFor(0, -1).to, 1);
  assert.equal(stairFlightFor(1, 1).to, 0);
  assert.equal(stairFlightFor(0, 1).to, -1);
  assert.equal(stairFlightFor(-1, -1).to, 0);
  assert.equal(stairFlightFor(1, -1), null);
});

test('stair progress is clamped and monotonic for upward and downward paths', () => {
  const flight = STAIRS.upper;
  assert.equal(stairProgress(flight, flight.startZ), 0);
  assert.equal(stairProgress(flight, flight.endZ), 1);
  assert.equal(stairProgress(flight, flight.endZ - 2), 1);
  const mid = (flight.startZ + flight.endZ) / 2;
  assert.ok(Math.abs(stairProgress(flight, mid) - 0.5) < 1e-9);
});

test('house bounds, stairwell and player capsule fit the stated architectural envelope', () => {
  assert.ok(HOUSE.bounds.maxX - HOUSE.bounds.minX > 19);
  assert.ok(HOUSE.bounds.maxZ - HOUSE.bounds.minZ > 13);
  assert.ok(HOUSE.stairwell.minX < HOUSE.stairwell.centerX);
  assert.ok(HOUSE.stairwell.maxX > HOUSE.stairwell.centerX);
  assert.ok(PLAYER.radius > 0.25 && PLAYER.radius < 0.4);
  assert.ok(PLAYER.eyeHeight < PLAYER.height);
});


test('door and window clear dimensions remain human-scaled', () => {
  assert.equal(DOOR.height, 2.08);
  assert.ok(DOOR.height > 2.0 && DOOR.height < PLAYER.height + 0.5);
  assert.ok(DOOR.leafThickness >= 0.07 && DOOR.leafThickness <= 0.10);
  assert.ok(WINDOW.sillHeight > 0.75 && WINDOW.sillHeight < 1.0);
  assert.ok(WINDOW.height > 1.0 && WINDOW.height < 1.5);
  assert.ok(WINDOW.glassThickness >= 0.04 && WINDOW.glassThickness <= 0.07);
});

test('all three floors have four named room zones and a stairwell zone', () => {
  assert.equal(roomZones().length, 12);
  assert.equal(roomAt(0, -5, -3), 'ГОСТИНАЯ');
  assert.equal(roomAt(0, 4, -3), 'КУХНЯ');
  assert.equal(roomAt(1, -5, 3), 'ДЕТСКАЯ');
  assert.equal(roomAt(-1, 4, 3), 'МАСТЕРСКАЯ');
  assert.equal(roomAt(0, 7.05, 0), 'ЛЕСТНИЧНЫЙ ПРОЁМ');
});
