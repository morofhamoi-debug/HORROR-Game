import * as THREE from 'three';

export function createHomeMaterials() {
  return {
    plaster: new THREE.MeshStandardMaterial({ color: 0xb8b5aa, roughness: 0.94 }),
    innerWall: new THREE.MeshStandardMaterial({ color: 0xaaa79d, roughness: 0.92 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x695344, roughness: 0.78 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x4b3528, roughness: 0.76 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xddd5c5, roughness: 0.82 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x71817f, roughness: 0.18, metalness: 0.12 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x282a27, roughness: 0.9 }),
    tile: new THREE.MeshStandardMaterial({ color: 0x777a74, roughness: 0.68 })
  };
}

export function box(THREE, parent, size, position, material, castShadow = true, receiveShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}