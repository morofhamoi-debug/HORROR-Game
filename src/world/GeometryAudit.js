import * as THREE from 'three';

export function runGeometryAudit(scene, colliders = []) {
  scene.updateMatrixWorld(true);
  const meshes = [];
  const nonFiniteMeshes = [];
  const invalidGeometry = [];
  const missingNormals = [];
  const nonFiniteNormals = [];
  let degenerateTriangles = 0;
  const signatures = new Map();

  scene.traverse(object => {
    if (!object.isMesh || !object.geometry || object.userData?.debug) return;
    meshes.push(object);
    const geometry = object.geometry;
    const position = geometry.getAttribute('position');

    if (!position || position.count < 3) {
      invalidGeometry.push(object.name || object.type);
      return;
    }

    for (let i = 0; i < position.count; i++) {
      if (!Number.isFinite(position.getX(i)) ||
          !Number.isFinite(position.getY(i)) ||
          !Number.isFinite(position.getZ(i))) {
        nonFiniteMeshes.push(object.name || object.type);
        break;
      }
    }

    const normals = geometry.getAttribute('normal');
    if (!normals) {
      missingNormals.push(object.name || object.type);
    } else {
      for (let i = 0; i < normals.count; i++) {
        const nx = normals.getX(i), ny = normals.getY(i), nz = normals.getZ(i);
        if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz) ||
            nx * nx + ny * ny + nz * nz < 0.01) {
          nonFiniteNormals.push(object.name || object.type);
          break;
        }
      }
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box || !Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) {
      invalidGeometry.push(object.name || object.type);
      return;
    }

    const p = object.position;
    const r = object.rotation;
    const s = object.scale;
    const signature = [
      geometry.type,
      object.material?.uuid || 'no-material',
      p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4),
      r.x.toFixed(4), r.y.toFixed(4), r.z.toFixed(4),
      s.x.toFixed(4), s.y.toFixed(4), s.z.toFixed(4)
    ].join('|');
    signatures.set(signature, (signatures.get(signature) || 0) + 1);
  });

  const invalidColliders = [];
  const colliderSignatures = new Map();
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const values = [c.minX, c.maxX, c.minZ, c.maxZ];
    if (!values.every(Number.isFinite) || c.minX >= c.maxX || c.minZ >= c.maxZ) {
      invalidColliders.push(i);
      continue;
    }
    const key = [c.level, ...values.map(v => v.toFixed(4))].join('|');
    colliderSignatures.set(key, (colliderSignatures.get(key) || 0) + 1);
  }

  const duplicateTransformGroups = [...signatures.values()].filter(count => count > 1).length;
  const duplicateColliderGroups = [...colliderSignatures.values()].filter(count => count > 1).length;
  let triangles = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const cPoint = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const cross = new THREE.Vector3();
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position');
    const index = geometry.index;
    const count = index ? index.count : position.count;
    triangles += count / 3;
    for (let i = 0; i + 2 < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(position, ia);
      b.fromBufferAttribute(position, ib);
      cPoint.fromBufferAttribute(position, ic);
      edge1.subVectors(b, a);
      edge2.subVectors(cPoint, a);
      cross.crossVectors(edge1, edge2);
      if (cross.lengthSq() < 1e-14) degenerateTriangles++;
    }
  }

  return {
    meshCount: meshes.length,
    colliderCount: colliders.length,
    triangleEstimate: Math.round(triangles),
    nonFiniteMeshes,
    invalidGeometry,
    missingNormals,
    nonFiniteNormals,
    degenerateTriangles,
    invalidColliders,
    duplicateTransformGroups,
    duplicateColliderGroups,
    passed: nonFiniteMeshes.length === 0 && invalidGeometry.length === 0 && missingNormals.length === 0 && nonFiniteNormals.length === 0 && invalidColliders.length === 0
  };
}

export function assertValidColliders(colliders) {
  const report = runGeometryAudit(new THREE.Scene(), colliders);
  if (report.invalidColliders.length) {
    throw new Error('Invalid collision bounds at indices: ' + report.invalidColliders.join(', '));
  }
  return report;
}
