import * as THREE from 'three';
import { Phone } from './Phone.js';

function makeSkinTextures(maxAnisotropy = 8) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  let seed = 90210;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = (random() - 0.5) * 11;
      const wave = Math.sin(x * 0.035 + Math.sin(y * 0.025) * 1.7) * 2.2;
      const i = (y * size + x) * 4;
      image.data[i] = 190 + n + wave;
      image.data[i + 1] = 139 + n * 0.78 + wave * 0.65;
      image.data[i + 2] = 112 + n * 0.6;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  for (let i = 0; i < 1150; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.35 + random() * 0.8;
    ctx.fillStyle = random() > 0.5 ? 'rgba(255,228,204,.16)' : 'rgba(97,48,37,.10)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const color = new THREE.CanvasTexture(canvas);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.repeat.set(1.7, 1.7);
  color.anisotropy = Math.max(1, Math.floor(maxAnisotropy));

  const normalData = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = (Math.sin(x * 0.31) * Math.cos(y * 0.29) + Math.sin((x + y) * 0.17)) * 2.3;
      const i = (y * size + x) * 4;
      normalData[i] = 128 + n;
      normalData[i + 1] = 128 - n * 0.75;
      normalData[i + 2] = 254;
      normalData[i + 3] = 255;
    }
  }
  const normal = new THREE.DataTexture(normalData, size, size, THREE.RGBAFormat);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.repeat.set(1.7, 1.7);
  normal.magFilter = THREE.LinearFilter;
  normal.minFilter = THREE.LinearMipmapLinearFilter;
  normal.generateMipmaps = true;
  normal.needsUpdate = true;
  return { color, normal };
}

function profileRadius(profile, t) {
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i], b = profile[i + 1];
    if (t <= b.t) {
      const k = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1);
      const smooth = k * k * (3 - 2 * k);
      return THREE.MathUtils.lerp(a.r, b.r, smooth);
    }
  }
  return profile[profile.length - 1].r;
}

function sweptGeometry(points, profile, tubularSegments = 24, radialSegments = 12, ellipse = 1) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const center = curve.getPointAt(t);
    const radius = profileRadius(profile, t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const c = Math.cos(angle) * radius;
      const s = Math.sin(angle) * radius * ellipse;
      const p = center.clone()
        .addScaledVector(normal, c)
        .addScaledVector(binormal, s);
      positions.push(p.x, p.y, p.z);
      uvs.push(j / radialSegments, t);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function addSwept(parent, points, profile, material, options = {}) {
  const geometry = sweptGeometry(
    points, profile,
    options.tubularSegments ?? 24,
    options.radialSegments ?? 12,
    options.ellipse ?? 0.92
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCrease(parent, points, material, radius = 0.00075) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, radius, 5, false), material);
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function palmShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.031, -0.005);
  shape.bezierCurveTo(-0.042, 0.015, -0.045, 0.060, -0.044, 0.086);
  shape.bezierCurveTo(-0.044, 0.119, -0.034, 0.137, -0.019, 0.140);
  shape.bezierCurveTo(-0.006, 0.144, 0.006, 0.144, 0.019, 0.140);
  shape.bezierCurveTo(0.035, 0.137, 0.044, 0.119, 0.044, 0.086);
  shape.bezierCurveTo(0.045, 0.060, 0.042, 0.015, 0.031, -0.005);
  shape.bezierCurveTo(0.024, -0.016, -0.024, -0.016, -0.031, -0.005);
  return shape;
}

function roundedNailGeometry(width, length) {
  const shape = new THREE.Shape();
  const r = width * 0.28;
  shape.moveTo(-width / 2 + r, 0);
  shape.lineTo(width / 2 - r, 0);
  shape.quadraticCurveTo(width / 2, 0, width / 2, r);
  shape.lineTo(width / 2, length - r);
  shape.quadraticCurveTo(width / 2, length, width / 2 - r, length);
  shape.lineTo(-width / 2 + r, length);
  shape.quadraticCurveTo(-width / 2, length, -width / 2, length - r);
  shape.lineTo(-width / 2, r);
  shape.quadraticCurveTo(-width / 2, 0, -width / 2 + r, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.0012, bevelEnabled: true, bevelThickness: 0.0008,
    bevelSize: 0.0008, bevelSegments: 2, curveSegments: 8
  });
  geometry.translate(0, 0, -0.0006);
  return geometry;
}

function addNail(parent, width, length, material) {
  const geometry = roundedNailGeometry(width, length);
  const nail = new THREE.Mesh(geometry, material);
  nail.castShadow = true;
  parent.add(nail);
  return nail;
}

function buildFinger(parent, x, length, width, skin, nailMaterial, creaseMaterial, index) {
  const finger = new THREE.Group();
  finger.position.set(x, 0.118, 0.002);
  parent.add(finger);

  const baseZ = 0;
  addSwept(finger, [
    [0, 0, baseZ],
    [0.001, length * 0.24, baseZ - 0.002],
    [0.001, length * 0.55, baseZ + 0.004],
    [0, length * 0.80, baseZ + 0.016],
    [-0.001, length * 0.91, baseZ + 0.022]
  ], [
    { t: 0, r: width * 0.82 },
    { t: 0.20, r: width },
    { t: 0.42, r: width * 0.88 },
    { t: 0.58, r: width * 0.80 },
    { t: 0.76, r: width * 0.77 },
    { t: 0.88, r: width * 0.65 },
    { t: 1, r: width * 0.42 }
  ], skin, { tubularSegments: 26, radialSegments: 12, ellipse: 0.88 });

  const jointYs = [length * 0.34, length * 0.64];
  for (const jointY of jointYs) {
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(width * 0.82, 16, 12), skin);
    knuckle.position.set(0, jointY, 0.001);
    knuckle.scale.set(0.95, 0.80, 0.86);
    knuckle.castShadow = true;
    finger.add(knuckle);
    addCrease(finger, [
      [-width * 0.62, jointY + 0.002, 0.005],
      [0, jointY - 0.002, 0.010],
      [width * 0.62, jointY + 0.002, 0.005]
    ], creaseMaterial, 0.00048);
  }

  const nailWidth = width * 0.92;
  const nailLength = length * 0.19;
  const nail = addNail(finger, nailWidth, nailLength, nailMaterial);
  nail.position.set(0, length * 0.79, 0.030);
  nail.rotation.x = -0.08;

  const tipPad = new THREE.Mesh(new THREE.SphereGeometry(width * 0.55, 14, 10), skin);
  tipPad.position.set(0, length * 0.83, 0.018);
  tipPad.scale.set(0.94, 0.82, 0.72);
  tipPad.castShadow = true;
  finger.add(tipPad);

  return finger;
}

function buildThumb(parent, side, skin, nailMaterial, creaseMaterial) {
  const thumb = new THREE.Group();
  parent.add(thumb);
  const s = side;
  addSwept(thumb, [
    [s * 0.034, 0.028, 0.006],
    [s * 0.055, 0.046, 0.005],
    [s * 0.068, 0.073, 0.014],
    [s * 0.056, 0.101, 0.027],
    [s * 0.034, 0.124, 0.038]
  ], [
    { t: 0, r: 0.010 },
    { t: 0.22, r: 0.0125 },
    { t: 0.48, r: 0.012 },
    { t: 0.72, r: 0.0105 },
    { t: 1, r: 0.007 }
  ], skin, { tubularSegments: 28, radialSegments: 14, ellipse: 0.88 });

  for (const y of [0.060, 0.094]) {
    addCrease(thumb, [
      [s * 0.054, y, 0.016],
      [s * 0.064, y - 0.003, 0.020],
      [s * 0.068, y + 0.001, 0.017]
    ], creaseMaterial, 0.0005);
  }

  const nail = addNail(thumb, 0.010, 0.017, nailMaterial);
  nail.position.set(s * 0.034, 0.111, 0.044);
  nail.rotation.z = s * -0.18;
  nail.rotation.x = -0.15;
  return thumb;
}

function buildHand(side, materials) {
  const root = new THREE.Group();
  root.name = side < 0 ? 'left_hand_and_forearm' : 'right_hand_and_forearm';

  // The forearm gradually narrows into the anatomical wrist.
  addSwept(root, [
    [0.006 * side, -0.355, -0.006],
    [0.004 * side, -0.275, -0.003],
    [0.002 * side, -0.185, 0],
    [0, -0.095, 0.003],
    [0, -0.018, 0]
  ], [
    { t: 0, r: 0.043 },
    { t: 0.22, r: 0.047 },
    { t: 0.52, r: 0.043 },
    { t: 0.78, r: 0.035 },
    { t: 1, r: 0.030 }
  ], materials.skin, { tubularSegments: 38, radialSegments: 18, ellipse: 0.82 });

  // A dark fabric cuff gives the arm a clear transition at the sleeve.
  const cuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.049, 0.047, 24, 1, false),
    materials.sleeve
  );
  cuff.position.set(0, -0.322, -0.005);
  cuff.rotation.z = side * -0.04;
  cuff.castShadow = true;
  root.add(cuff);
  const cuffEdge = new THREE.Mesh(
    new THREE.TorusGeometry(0.047, 0.0018, 8, 28),
    materials.sleeveEdge
  );
  cuffEdge.position.set(0, -0.298, -0.005);
  cuffEdge.rotation.x = Math.PI / 2;
  root.add(cuffEdge);

  const palmGeometry = new THREE.ExtrudeGeometry(palmShape(), {
    depth: 0.034,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.004,
    bevelSegments: 4,
    curveSegments: 18,
    steps: 1
  });
  palmGeometry.translate(0, 0, -0.017);
  const palm = new THREE.Mesh(palmGeometry, materials.skin);
  palm.castShadow = true;
  palm.receiveShadow = true;
  root.add(palm);

  // Soft thenar and hypothenar eminences create the characteristic palm volume.
  const eminenceA = new THREE.Mesh(new THREE.SphereGeometry(0.025, 20, 16), materials.skin);
  eminenceA.position.set(side * 0.027, 0.038, 0.009);
  eminenceA.scale.set(0.78, 1.8, 0.72);
  eminenceA.castShadow = true;
  root.add(eminenceA);
  const eminenceB = new THREE.Mesh(new THREE.SphereGeometry(0.020, 18, 14), materials.skin);
  eminenceB.position.set(-side * 0.026, 0.040, 0.009);
  eminenceB.scale.set(0.82, 1.55, 0.7);
  eminenceB.castShadow = true;
  root.add(eminenceB);

  // Three natural palm flexion creases and a curved life line.
  addCrease(root, [
    [-0.030, 0.042, 0.021], [-0.010, 0.055, 0.022],
    [0.009, 0.050, 0.023], [0.027, 0.060, 0.020]
  ], materials.crease, 0.00085);
  addCrease(root, [
    [-0.030, 0.080, 0.020], [-0.009, 0.074, 0.022],
    [0.014, 0.076, 0.022], [0.031, 0.085, 0.019]
  ], materials.crease, 0.00075);
  addCrease(root, [
    [side * 0.034, 0.027, 0.021], [side * 0.017, 0.008, 0.024],
    [side * 0.003, 0.028, 0.024], [-side * 0.002, 0.054, 0.023]
  ], materials.crease, 0.0007);

  const lengths = [0.078, 0.090, 0.084, 0.066];
  const widths = [0.0085, 0.0095, 0.0090, 0.0075];
  const xs = [-0.030, -0.010, 0.011, 0.031];
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    fingers.push(buildFinger(root, xs[i], lengths[i], widths[i], materials.skin, materials.nail, materials.crease, i));
  }
  const thumb = buildThumb(root, -side, materials.skin, materials.nail, materials.crease);

  // Faint dorsal tendons and veins remain visible around the wrist and metacarpals.
  addCrease(root, [
    [-0.018, 0.006, -0.013], [-0.012, 0.040, -0.015],
    [-0.006, 0.078, -0.015], [-0.008, 0.112, -0.008]
  ], materials.vein, 0.00055);
  addCrease(root, [
    [0.019, 0.003, -0.013], [0.014, 0.038, -0.015],
    [0.010, 0.077, -0.014], [0.014, 0.112, -0.008]
  ], materials.vein, 0.00048);

  // Fine knuckle pads add a soft, non-cartoon silhouette to the finger roots.
  for (let i = 0; i < 4; i++) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(widths[i] * 0.86, 14, 12), materials.knuckle);
    pad.position.set(xs[i], 0.124, 0.009);
    pad.scale.set(1, 0.78, 0.75);
    pad.castShadow = true;
    root.add(pad);
  }

  root.userData.fingers = fingers;
  root.userData.thumb = thumb;
  root.userData.side = side;
  return root;
}

function makeMaterials(maxAnisotropy = 8) {
  const textures = makeSkinTextures(maxAnisotropy);
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xffe2d0,
    map: textures.color,
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(0.12, 0.12),
    roughness: 0.70,
    metalness: 0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.58,
    sheen: 0.12,
    sheenRoughness: 0.82
  });
  return {
    skin,
    skinTexture: textures.color,
    skinNormal: textures.normal,
    knuckle: new THREE.MeshStandardMaterial({ color: 0xc98d78, roughness: 0.76 }),
    nail: new THREE.MeshPhysicalMaterial({
      color: 0xe8cfc3, roughness: 0.34, metalness: 0,
      clearcoat: 0.28, clearcoatRoughness: 0.28
    }),
    crease: new THREE.MeshStandardMaterial({
      color: 0x8c5d4e, roughness: 0.92, transparent: true, opacity: 0.32
    }),
    vein: new THREE.MeshStandardMaterial({
      color: 0x927e7e, roughness: 0.86, transparent: true, opacity: 0.18
    }),
    sleeve: new THREE.MeshStandardMaterial({
      color: 0x25282b, roughness: 0.96, metalness: 0
    }),
    sleeveEdge: new THREE.MeshStandardMaterial({
      color: 0x55534d, roughness: 0.88
    })
  };
}

function smoothPose(group, position, rotation, blend) {
  group.position.lerpVectors(position.rest, position.phone, blend);
  group.rotation.set(
    THREE.MathUtils.lerp(rotation.rest.x, rotation.phone.x, blend),
    THREE.MathUtils.lerp(rotation.rest.y, rotation.phone.y, blend),
    THREE.MathUtils.lerp(rotation.rest.z, rotation.phone.z, blend)
  );
}

export class FirstPersonHands {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.root = new THREE.Group();
    this.root.name = 'first_person_hands_viewmodel';
    camera.add(this.root);

    this.materials = makeMaterials(options.maxAnisotropy ?? 8);
    this.left = buildHand(-1, this.materials);
    this.right = buildHand(1, this.materials);
    this.root.add(this.left, this.right);

    this.viewLight = new THREE.DirectionalLight(0xffe4d2, 0.72);
    this.viewLight.position.set(0.25, 0.55, 1);
    this.root.add(this.viewLight);
    this.fillLight = new THREE.AmbientLight(0xffd8c0, 0.36);
    this.root.add(this.fillLight);

    this.phone = new Phone(this.root, options);
    this.phoneOpen = false;
    this.phoneBlend = 0;
    this.motionClock = 0;

    this.pose = {
      leftPosition: {
        rest: new THREE.Vector3(-0.315, -0.585, -0.64),
        phone: new THREE.Vector3(0.065, -0.405, -0.525)
      },
      rightPosition: {
        rest: new THREE.Vector3(0.315, -0.605, -0.66),
        phone: new THREE.Vector3(0.225, -0.420, -0.495)
      },
      leftRotation: {
        rest: new THREE.Euler(-0.22, 0.10, 0.23),
        phone: new THREE.Euler(-0.08, -0.16, 0.46)
      },
      rightRotation: {
        rest: new THREE.Euler(-0.28, -0.09, -0.22),
        phone: new THREE.Euler(-0.30, 0.08, -0.52)
      }
    };

    this.phoneBase = {
      position: new THREE.Vector3(0.155, -0.245, -0.485),
      rotation: new THREE.Euler(-0.10, -0.17, 0.10)
    };
    this.phoneHidden = {
      position: new THREE.Vector3(0.20, -0.78, -0.38),
      rotation: new THREE.Euler(0.42, -0.50, 0.26)
    };
    this.phone.setTransform(this.phoneHidden.position, this.phoneHidden.rotation);
    this.phone.root.scale.setScalar(1.34);

    // Isolate viewmodel lighting and geometry from the house's world-light layer.
    this.camera.layers.enable(1);
    this.root.traverse(object => object.layers.set(1));
    this.setPhoneOpen(false, true);
  }

  setPhoneOpen(open, instant = false) {
    this.phoneOpen = Boolean(open);
    if (this.phoneOpen) this.phone.showHome();
    if (instant) this.phoneBlend = this.phoneOpen ? 1 : 0;
    if (this.phoneOpen || this.phoneBlend > 0.02) this.phone.setVisible(true);
  }

  togglePhone() {
    this.setPhoneOpen(!this.phoneOpen);
    return this.phoneOpen;
  }

  get phoneVisible() {
    return this.phoneOpen || this.phoneBlend > 0.02;
  }

  update(dt, movement = {}) {
    const blendTarget = this.phoneOpen ? 1 : 0;
    this.phoneBlend = THREE.MathUtils.damp(this.phoneBlend, blendTarget, 7.5, dt);
    if (this.phoneBlend < 0.008 && !this.phoneOpen) {
      this.phoneBlend = 0;
      this.phone.setVisible(false);
    } else if (this.phoneBlend > 0.008) {
      this.phone.setVisible(true);
    }

    this.motionClock += dt;
    const moveAmount = THREE.MathUtils.clamp(movement.amount ?? 0, 0, 1);
    const speed = movement.sprint ? 1.7 : 1.0;
    const stride = Math.sin(this.motionClock * 9.4 * speed);
    const sway = Math.sin(this.motionClock * 4.1) * 0.006;
    const bob = Math.abs(stride) * 0.010 * moveAmount;

    smoothPose(this.left, this.pose.leftPosition, this.pose.leftRotation, this.phoneBlend);
    smoothPose(this.right, this.pose.rightPosition, this.pose.rightRotation, this.phoneBlend);

    const restFactor = 1 - this.phoneBlend;
    this.left.position.y += bob * restFactor + sway * restFactor;
    this.right.position.y -= bob * restFactor - sway * restFactor;
    this.left.rotation.z += Math.sin(this.motionClock * 3.2) * 0.014 * restFactor;
    this.right.rotation.z -= Math.sin(this.motionClock * 3.2 + 0.8) * 0.014 * restFactor;

    const phonePosition = this.phoneHidden.position.clone().lerp(this.phoneBase.position, this.phoneBlend);
    phonePosition.y += Math.sin(this.motionClock * 2.0) * 0.003 * this.phoneBlend;
    const phoneRotation = new THREE.Euler(
      THREE.MathUtils.lerp(this.phoneHidden.rotation.x, this.phoneBase.rotation.x, this.phoneBlend),
      THREE.MathUtils.lerp(this.phoneHidden.rotation.y, this.phoneBase.rotation.y, this.phoneBlend),
      THREE.MathUtils.lerp(this.phoneHidden.rotation.z, this.phoneBase.rotation.z, this.phoneBlend) +
        Math.sin(this.motionClock * 2.2) * 0.018 * this.phoneBlend
    );
    this.phone.setTransform(phonePosition, phoneRotation);
    this.phone.update(dt);

    // Right index finger bends toward the active screen as if tapping or scrolling.
    const index = this.right.userData.fingers[1];
    const tap = this.phoneBlend > 0.35
      ? Math.sin(this.motionClock * 4.2) * 0.08 + Math.sin(this.motionClock * 1.9) * 0.025
      : 0;
    index.rotation.x = THREE.MathUtils.damp(index.rotation.x, 0.22 * this.phoneBlend + tap * this.phoneBlend, 7, dt);
    this.right.userData.thumb.rotation.x = THREE.MathUtils.damp(
      this.right.userData.thumb.rotation.x,
      0.11 * this.phoneBlend,
      7,
      dt
    );
    this.left.userData.thumb.rotation.x = THREE.MathUtils.damp(
      this.left.userData.thumb.rotation.x,
      Math.sin(this.motionClock * 1.3) * 0.025 * this.phoneBlend,
      5,
      dt
    );
  }

  dispose() {
    this.phone.dispose();
    this.root.removeFromParent();
    const geometries = new Set();
    const materials = new Set(Object.values(this.materials).filter(value => value?.isMaterial));
    this.root.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    this.materials.skinTexture?.dispose();
    this.materials.skinNormal?.dispose();
  }
}
