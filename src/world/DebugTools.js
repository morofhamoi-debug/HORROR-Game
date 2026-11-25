import * as THREE from 'three';
import { floorY } from './Layout.js';
import { runGeometryAudit } from './GeometryAudit.js';

export class DebugTools {
  constructor(scene, colliders, renderer, house) {
    this.scene = scene;
    this.colliders = colliders;
    this.renderer = renderer;
    this.house = house;
    this.enabled = new URLSearchParams(window.location.search).get('debug') === '1';
    this.accumulator = 0;
    this.group = new THREE.Group();
    this.group.name = 'debug_collision_bounds';
    this.scene.add(this.group);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff4e4e,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      depthTest: false
    });
    this.meshes = [];
    this.buildColliders();
    this.overlay = document.createElement('div');
    this.overlay.id = 'debug-stats';
    this.overlay.style.cssText = [
      'position:fixed','left:12px','top:84px','z-index:30','display:none',
      'padding:10px 12px','background:rgba(0,0,0,.72)',
      'border:1px solid rgba(180,160,120,.35)','color:#e7ddc8',
      'font:10px/1.6 ui-monospace,monospace','white-space:pre',
      'pointer-events:none','backdrop-filter:blur(8px)'
    ].join(';');
    document.body.appendChild(this.overlay);
    this.setEnabled(this.enabled);
    this.onKeyDown = event => {
      if (event.code === 'F3') { event.preventDefault(); this.toggle(); }
      if (event.code === 'F4') { event.preventDefault(); this.runAudit(); }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  buildColliders() {
    for (const collider of this.colliders) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.material);
      mesh.userData.collider = collider;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      this.meshes.push(mesh);
    }
    this.syncColliders();
  }

  syncColliders() {
    for (const mesh of this.meshes) {
      const c = mesh.userData.collider;
      const levelY = Number.isFinite(c.minY) ? c.minY : floorY(c.level ?? 0);
      const topY = Number.isFinite(c.maxY) ? c.maxY : levelY + 1.2;
      mesh.visible = c.enabled !== false;
      mesh.position.set(
        (c.minX + c.maxX) / 2,
        (levelY + topY) / 2,
        (c.minZ + c.maxZ) / 2
      );
      mesh.scale.set(
        Math.max(0.01, c.maxX - c.minX),
        Math.max(0.01, topY - levelY),
        Math.max(0.01, c.maxZ - c.minZ)
      );
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.group.visible = this.enabled;
    this.overlay.style.display = this.enabled ? 'block' : 'none';
    if (this.enabled) this.syncColliders();
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  runAudit() {
    const report = runGeometryAudit(this.scene, this.colliders);
    console.group('HOLLOW HOUSE / geometry audit');
    console.table({
      meshes: report.meshCount,
      colliders: report.colliderCount,
      estimatedTriangles: report.triangleEstimate,
      nonFiniteMeshes: report.nonFiniteMeshes.length,
      invalidGeometry: report.invalidGeometry.length,
      invalidColliders: report.invalidColliders.length,
      duplicateTransformGroups: report.duplicateTransformGroups,
      duplicateColliderGroups: report.duplicateColliderGroups,
      passed: report.passed
    });
    if (report.nonFiniteMeshes.length) console.warn('Non-finite mesh vertices:', report.nonFiniteMeshes);
    if (report.invalidGeometry.length) console.warn('Invalid mesh geometry:', report.invalidGeometry);
    if (report.invalidColliders.length) console.warn('Invalid colliders:', report.invalidColliders);
    console.groupEnd();
    return report;
  }

  update(dt, player) {
    if (!this.enabled) return;
    this.syncColliders();
    this.accumulator += dt;
    if (this.accumulator < 0.2) return;
    this.accumulator = 0;
    const info = this.renderer.info;
    this.overlay.textContent =
      'HOLLOW HOUSE / DEBUG\n' +
      'LEVEL: ' + player.level + '\n' +
      'POS: ' + player.position.x.toFixed(2) + ', ' + player.position.y.toFixed(2) + ', ' + player.position.z.toFixed(2) + '\n' +
      'MESHES: ' + info.memory.geometries + ' GEO / ' + info.memory.textures + ' TEX\n' +
      'DRAW CALLS: ' + info.render.calls + '\n' +
      'TRIANGLES: ' + info.render.triangles + '\n' +
      'COLLIDERS: ' + this.colliders.length + '\n' +
      'F3: TOGGLE COLLIDERS   F4: RUN AUDIT';
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    this.group.removeFromParent();
    this.group.traverse(object => object.geometry?.dispose?.());
    this.material.dispose();
    this.overlay.remove();
  }
}
