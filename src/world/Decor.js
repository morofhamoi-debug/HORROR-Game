import * as THREE from 'three';
function cube(scene, mat, pos, size, rotation = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
  mesh.position.set(...pos); mesh.rotation.y = rotation; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function picture(scene, mats, x, y, z, rotation = 0, variant = 0) {
  cube(scene, mats.darkWood, [x, y, z], [1.05, .78, .09], rotation);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(.87, .6), new THREE.MeshStandardMaterial({ color: variant === 0 ? 0x6d6559 : variant === 1 ? 0x777b79 : 0x463d36, roughness: .92, emissive: variant === 2 ? 0x120d0a : 0x000000 }));
  art.position.set(x, y, z + .052); art.rotation.y = rotation; scene.add(art);
  const line = new THREE.Mesh(new THREE.BoxGeometry(.62, .025, .025), mats.brass);
  line.position.set(x, y - .12, z + .075); line.rotation.y = rotation; scene.add(line);
}
function wallTrim(scene, mats, level) {
  const y = level * 3.5;
  for (const z of [-6.48, 6.48]) {
    cube(scene, mats.trim, [0, y + .12, z], [18.9, .18, .08]);
    cube(scene, mats.ceiling, [0, y + 3.12, z], [18.9, .12, .1]);
  }
  for (const x of [-9.48, 9.48]) {
    cube(scene, mats.trim, [x, y + .12, 0], [.08, .18, 12.8]);
    cube(scene, mats.ceiling, [x, y + 3.12, 0], [.1, .12, 12.8]);
  }
}
function curtains(scene, mats, x, y, z, width) {
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0x81796b, roughness: 1, side: THREE.DoubleSide });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, width + .45, 10), mats.brass);
  rod.rotation.z = Math.PI / 2; rod.position.set(x, y + 1.5, z); scene.add(rod);
  for (const side of [-1, 1]) {
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(width * .24, 1.55, 8, 12), curtainMat);
    cloth.position.set(x + side * width * .37, y + .72, z + .12); cloth.castShadow = true; scene.add(cloth);
  }
}
function bookStack(scene, mats, x, y, z, count = 4) {
  const colors = [mats.leather, mats.darkWood, mats.fabric, mats.rug];
  for (let i = 0; i < count; i++) {
    const h = .06 + (i % 2) * .015;
    const book = new THREE.Mesh(new THREE.BoxGeometry(.24 + (i % 2) * .04, h, .34), colors[i % colors.length]);
    book.position.set(x, y + i * h, z); book.rotation.y = (i % 2 ? .1 : -.06); book.castShadow = true; scene.add(book);
  }
}
export function addDecor(scene, mats, level) {
  const y = level * 3.5;
  wallTrim(scene, mats, level);
  if (level === 0) {
    picture(scene, mats, -5.2, y + 2.38, -6.49, 0, 1);
    picture(scene, mats, 4.55, y + 2.35, -6.49, 0, 0);
    picture(scene, mats, -9.49, y + 2.2, -3.2, Math.PI / 2, 2);
    curtains(scene, mats, -5.4, y + .82, -6.5, 2);
    curtains(scene, mats, 1.3, y + .82, -6.5, 2.25);
    bookStack(scene, mats, -5.1, y + .95, -3.2, 5);
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .45, 18), mats.ceramic);
    vase.position.set(4.65, y + 1.12, 3.45); scene.add(vase);
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 12), new THREE.MeshStandardMaterial({ color: 0x76503b, roughness: .4 }));
    fruit.position.set(4.3, y + 1.04, 3.35); scene.add(fruit);
  }
  if (level === 1) {
    picture(scene, mats, -5.2, y + 2.35, -6.49, 0, 2);
    picture(scene, mats, 4.25, y + 2.32, -6.49, 0, 1);
    picture(scene, mats, -9.49, y + 2.25, 3.2, Math.PI / 2, 0);
    curtains(scene, mats, -5.4, y + .82, -6.5, 2);
    curtains(scene, mats, 1.3, y + .82, -6.5, 2.25);
    bookStack(scene, mats, -2.55, y + .95, -4.8, 3);
  }
  if (level === -1) {
    for (let x = -8; x <= 8; x += 4) cube(scene, mats.darkWood, [x, y + 3.12, 0], [.18, .18, 12.8]);
    picture(scene, mats, -9.49, y + 2.25, -3.2, Math.PI / 2, 2);
    cube(scene, new THREE.MeshStandardMaterial({ color: 0x8f6b39, roughness: .8 }), [-7.5, y + 2.55, -6.49], [.68, .32, .04]);
  }
}
export function createDust(scene) {
  const count = 500;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - .5) * 18;
    positions[i * 3 + 1] = Math.random() * 8 - 3.7;
    positions[i * 3 + 2] = (Math.random() - .5) * 12;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xc9bda5, size: .018, transparent: true, opacity: .32, depthWrite: false });
  const points = new THREE.Points(geometry, material); points.name = 'floating_dust'; scene.add(points); return points;
}