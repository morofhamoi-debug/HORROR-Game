import * as THREE from 'three';

const PHONE = Object.freeze({
  width: 0.078,
  height: 0.163,
  thickness: 0.0085,
  cornerRadius: 0.010,
  screenWidth: 0.071,
  screenHeight: 0.151,
  screenRadius: 0.008
});

function roundedRect(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function roundedPlane(width, height, radius, material) {
  const geometry = new THREE.ShapeGeometry(roundedRect(width, height, radius), 12);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const uv = geometry.getAttribute('uv');
  const position = geometry.getAttribute('position');
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (position.getX(i) - bounds.min.x) / (bounds.max.x - bounds.min.x),
      (position.getY(i) - bounds.min.y) / (bounds.max.y - bounds.min.y)
    );
  }
  uv.needsUpdate = true;
  return new THREE.Mesh(geometry, material);
}

function cylinderZ(radius, depth, material, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function drawIcon(ctx, x, y, size, color, symbol, label) {
  const r = size * 0.24;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#131720');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.96)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 ' + Math.round(size * 0.48) + 'px -apple-system,system-ui,sans-serif';
  ctx.fillText(symbol, x + size / 2, y + size / 2 + 1);
  if (label) {
    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.font = '500 10px -apple-system,system-ui,sans-serif';
    ctx.fillText(label, x + size / 2, y + size + 12);
  }
}

function drawWallpaper(ctx, width, height) {
  const gradient = ctx.createLinearGradient(10, 20, width - 30, height);
  gradient.addColorStop(0, '#121a37');
  gradient.addColorStop(0.42, '#55357c');
  gradient.addColorStop(0.76, '#a24d68');
  gradient.addColorStop(1, '#d37b54');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const blobs = [
    [width * 0.18, height * 0.35, width * 0.78, '#367dff'],
    [width * 0.86, height * 0.62, width * 0.72, '#ff765d'],
    [width * 0.46, height * 0.78, width * 0.62, '#a45cff']
  ];
  for (const [x, y, radius, color] of blobs) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color + 'aa');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * width;
    ctx.beginPath();
    ctx.moveTo(x, height * 0.18);
    ctx.bezierCurveTo(x + 80, height * 0.36, x - 60, height * 0.7, x + 40, height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScreen(ctx, width, height, now, mode) {
  ctx.clearRect(0, 0, width, height);
  drawWallpaper(ctx, width, height);

  const date = new Date();
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = '600 20px -apple-system,system-ui,sans-serif';
  ctx.fillText(time, 28, 35);
  ctx.textAlign = 'right';
  ctx.font = '600 18px -apple-system,system-ui,sans-serif';
  ctx.fillText('5G  ▰', width - 28, 35);

  if (mode === 'lock') {
    ctx.textAlign = 'center';
    ctx.font = '500 19px -apple-system,system-ui,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(day.charAt(0).toUpperCase() + day.slice(1), width / 2, height * 0.29);
    ctx.font = '300 90px -apple-system,system-ui,sans-serif';
    ctx.fillText(time, width / 2, height * 0.41);
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.font = '500 14px -apple-system,system-ui,sans-serif';
    ctx.fillText('HOLLOW HOUSE', width / 2, height * 0.47);

    ctx.fillStyle = 'rgba(12,15,28,.30)';
    ctx.beginPath();
    ctx.roundRect(18, height * 0.65, width - 36, 86, 18);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.font = '600 15px -apple-system,system-ui,sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Уведомления', 34, height * 0.65 + 26);
    ctx.font = '400 14px -apple-system,system-ui,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.fillText('Телефон готов к использованию', 34, height * 0.65 + 54);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.textAlign = 'center';
    ctx.font = '500 15px -apple-system,system-ui,sans-serif';
    ctx.fillText(day.charAt(0).toUpperCase() + day.slice(1), width / 2, 77);

    const apps = [
      ['Сообщ.', '#2bba66', '✉'], ['Камера', '#303944', '◉'], ['Фото', '#c95c8a', '✿'], ['Карты', '#397ac8', '⌖'],
      ['Банк', '#19864f', '₽'], ['Музыка', '#d3475b', '♫'], ['Часы', '#24252a', '◷'], ['Заметки', '#d9ad42', '≡'],
      ['Погода', '#4187d6', '☼'], ['Настр.', '#747981', '⚙'], ['Почта', '#367bd0', '✉'], ['Safari', '#2f9bd2', '◎']
    ];
    const size = 54;
    const gap = 22;
    const total = size * 4 + gap * 3;
    const startX = (width - total) / 2;
    apps.forEach((app, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      drawIcon(ctx, startX + col * (size + gap), height * 0.20 + row * 112, size, app[1], app[2], app[0]);
    });

    ctx.fillStyle = 'rgba(255,255,255,.20)';
    ctx.beginPath();
    ctx.roundRect(16, height - 104, width - 32, 76, 25);
    ctx.fill();
    drawIcon(ctx, 31, height - 90, 50, '#31ad67', '☎', '');
    drawIcon(ctx, 117, height - 90, 50, '#3687cf', '⌖', '');
    drawIcon(ctx, 203, height - 90, 50, '#d65a60', '♫', '');
    drawIcon(ctx, 289, height - 90, 50, '#3c8fd0', '◎', '');
  }

  // Dynamic Island, front sensors and home indicator.
  ctx.fillStyle = '#050507';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 48, 10, 96, 25, 14);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 34, height - 13, 68, 4, 2);
  ctx.fill();
}

export class Phone {
  constructor(parent, options = {}) {
    this.root = new THREE.Group();
    this.root.name = 'iphone_16_pro_max_viewmodel';
    this.parent = parent;
    this.parent.add(this.root);
    this.root.visible = false;
    this.mode = 'home';
    this.timeAccumulator = 0;
    this.targetPosition = new THREE.Vector3(0.16, -0.23, -0.47);
    this.targetRotation = new THREE.Euler(-0.12, -0.16, 0.10);
    this.skinSide = 1;

    const anisotropy = Math.max(1, Math.floor(options.maxAnisotropy ?? 8));
    this.materials = [];
    this.geometries = [];
    const trackMaterial = material => (this.materials.push(material), material);
    const trackGeometry = geometry => (this.geometries.push(geometry), geometry);

    const titanium = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x85898d, metalness: 0.96, roughness: 0.27,
      clearcoat: 0.7, clearcoatRoughness: 0.22
    }));
    const titaniumDark = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x292d33, metalness: 0.92, roughness: 0.32
    }));
    const backMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x8e8e88, metalness: 0.12, roughness: 0.69,
      clearcoat: 0.28, clearcoatRoughness: 0.5
    }));
    const glass = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x090b10, metalness: 0.02, roughness: 0.035,
      clearcoat: 1, clearcoatRoughness: 0.035, ior: 1.48
    }));
    const cameraGlass = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x05070d, metalness: 0.15, roughness: 0.045,
      clearcoat: 1, clearcoatRoughness: 0.02
    }));
    const brightMetal = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xd0d0cc, metalness: 0.98, roughness: 0.2
    }));
    const black = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x080a0d, metalness: 0.55, roughness: 0.24
    }));
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 384;
    screenCanvas.height = 816;
    this.screenContext = screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;
    this.screenTexture.anisotropy = anisotropy;
    this.screenTexture.generateMipmaps = true;
    this.screenMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      map: this.screenTexture, toneMapped: false
    }));

    const shellGeometry = trackGeometry(new THREE.ExtrudeGeometry(
      roundedRect(PHONE.width - 0.001, PHONE.height - 0.001, PHONE.cornerRadius),
      {
        depth: PHONE.thickness,
        bevelEnabled: true,
        bevelThickness: 0.001,
        bevelSize: 0.001,
        bevelSegments: 5,
        curveSegments: 24,
        steps: 1
      }
    ));
    shellGeometry.translate(0, 0, -PHONE.thickness / 2);
    const shell = new THREE.Mesh(shellGeometry, titanium);
    shell.name = 'titanium_unibody_frame';
    this.root.add(shell);

    const back = roundedPlane(PHONE.width - 0.004, PHONE.height - 0.004, PHONE.cornerRadius - 0.001, backMaterial);
    trackGeometry(back.geometry);
    back.rotation.y = Math.PI;
    back.position.z = -PHONE.thickness / 2 - 0.0003;
    this.root.add(back);

    const frontGlass = roundedPlane(PHONE.width - 0.0035, PHONE.height - 0.0035, PHONE.cornerRadius - 0.001, glass);
    trackGeometry(frontGlass.geometry);
    frontGlass.position.z = PHONE.thickness / 2 + 0.00025;
    this.root.add(frontGlass);

    const screen = roundedPlane(PHONE.screenWidth, PHONE.screenHeight, PHONE.screenRadius, this.screenMaterial);
    trackGeometry(screen.geometry);
    screen.position.z = PHONE.thickness / 2 + 0.0009;
    screen.name = 'always_on_iphone_display';
    this.root.add(screen);

    // The earpiece and front camera are real, raised geometry, not a painted texture.
    const island = new THREE.Mesh(new THREE.BoxGeometry(0.031, 0.006, 0.0014), black);
    island.position.set(0, PHONE.height / 2 - 0.012, PHONE.thickness / 2 + 0.0014);
    island.geometry = trackGeometry(island.geometry);
    this.root.add(island);
    const frontLens = new THREE.Mesh(new THREE.CircleGeometry(0.00135, 24), cameraGlass);
    frontLens.position.set(0.012, PHONE.height / 2 - 0.012, PHONE.thickness / 2 + 0.0022);
    frontLens.geometry = trackGeometry(frontLens.geometry);
    this.root.add(frontLens);

    // Three raised lenses and a LiDAR/flash cluster on the back.
    const cameraPlate = new THREE.Mesh(
      trackGeometry(new THREE.ExtrudeGeometry(roundedRect(0.034, 0.040, 0.006), {
        depth: 0.0014, bevelEnabled: true, bevelThickness: 0.0005,
        bevelSize: 0.0005, bevelSegments: 3, curveSegments: 14
      })),
      titaniumDark
    );
    cameraPlate.rotation.y = Math.PI;
    cameraPlate.position.set(-0.018, PHONE.height / 2 - 0.027, -PHONE.thickness / 2 - 0.0003);
    this.root.add(cameraPlate);

    const lensPositions = [[-0.026, PHONE.height / 2 - 0.014], [-0.010, PHONE.height / 2 - 0.014], [-0.026, PHONE.height / 2 - 0.032]];
    for (const [x, y] of lensPositions) {
      const ring = cylinderZ(0.0061, 0.0018, brightMetal, 40);
      ring.position.set(x, y, -PHONE.thickness / 2 - 0.002);
      ring.geometry = trackGeometry(ring.geometry);
      this.root.add(ring);
      const lens = cylinderZ(0.0048, 0.0016, cameraGlass, 40);
      lens.position.set(x, y, -PHONE.thickness / 2 - 0.003);
      lens.geometry = trackGeometry(lens.geometry);
      this.root.add(lens);
      const reflection = new THREE.Mesh(new THREE.CircleGeometry(0.0015, 24), trackMaterial(new THREE.MeshBasicMaterial({
        color: 0x324c8e, transparent: true, opacity: 0.72
      })));
      reflection.position.set(x - 0.001, y + 0.001, -PHONE.thickness / 2 - 0.004);
      reflection.geometry = trackGeometry(reflection.geometry);
      this.root.add(reflection);
    }

    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.0025, 20), trackMaterial(new THREE.MeshBasicMaterial({ color: 0xffefcf })));
    flash.position.set(-0.010, PHONE.height / 2 - 0.032, -PHONE.thickness / 2 - 0.002);
    flash.geometry = trackGeometry(flash.geometry);
    this.root.add(flash);

    // Machined side keys and a lower USB-C port.
    const addSideKey = (x, y, length, width = 0.002) => {
      const key = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(width, length, 0.0045)), titaniumDark);
      key.position.set(x, y, 0);
      this.root.add(key);
    };
    addSideKey(-PHONE.width / 2 - 0.0008, PHONE.height * 0.21, 0.016);
    addSideKey(-PHONE.width / 2 - 0.0008, PHONE.height * 0.36, 0.010);
    addSideKey(-PHONE.width / 2 - 0.0008, PHONE.height * 0.49, 0.010);
    addSideKey(PHONE.width / 2 + 0.0008, PHONE.height * 0.18, 0.021);

    const usb = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(0.010, 0.0016, 0.003)), black);
    usb.position.set(0, -PHONE.height / 2 - 0.0002, 0);
    this.root.add(usb);
    for (let i = 0; i < 5; i++) {
      const hole = new THREE.Mesh(trackGeometry(new THREE.CylinderGeometry(0.00065, 0.00065, 0.0018, 10)), black);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(-0.021 + i * 0.0105, -PHONE.height / 2 - 0.0002, 0);
      this.root.add(hole);
    }

    this.screenMode = 'home';
    this.updateScreen(performance.now());
    this.root.position.copy(this.targetPosition);
    this.root.rotation.copy(this.targetRotation);
    this.root.scale.setScalar(1.34);
  }

  updateScreen(now) {
    drawScreen(this.screenContext, 384, 816, now, this.screenMode);
    this.screenTexture.needsUpdate = true;
  }

  showHome() {
    this.screenMode = 'home';
    this.updateScreen(performance.now());
  }

  showLock() {
    this.screenMode = 'lock';
    this.updateScreen(performance.now());
  }

  update(dt, now = performance.now()) {
    this.timeAccumulator += dt;
    if (this.timeAccumulator >= 1) {
      this.timeAccumulator = 0;
      if (this.root.visible) this.updateScreen(now);
    }
  }

  setTransform(position, rotation) {
    this.root.position.copy(position);
    this.root.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  setVisible(value) {
    this.root.visible = value;
  }

  dispose() {
    this.root.removeFromParent();
    this.screenTexture.dispose();
    for (const material of this.materials) material.dispose();
    for (const geometry of new Set(this.geometries)) geometry.dispose();
    this.materials.length = 0;
    this.geometries.length = 0;
  }
}

export { PHONE };
