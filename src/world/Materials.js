import * as THREE from 'three';

function seededRandom(seedValue) {
  let seed = seedValue >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function canvasTexture(kind, base, size = 512, anisotropy = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const random = seededRandom(kind.length * 917 + size);

  if (kind === 'wood') {
    const plankHeight = 64;
    for (let y = 0; y < size; y += plankHeight) {
      const shade = Math.floor(random() * 22 - 11);
      ctx.fillStyle = 'rgba(' + (100 + shade) + ',' + (69 + shade) + ',' + (44 + shade) + ',.12)';
      ctx.fillRect(0, y, size, plankHeight - 2);
      ctx.strokeStyle = 'rgba(19,11,7,.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y + plankHeight);
      ctx.lineTo(size, y + plankHeight);
      ctx.stroke();
      for (let i = 0; i < 100; i++) {
        const x = random() * size;
        const yy = y + random() * plankHeight;
        const alpha = 0.025 + random() * 0.085;
        ctx.strokeStyle = random() > 0.5
          ? 'rgba(235,190,132,' + alpha + ')'
          : 'rgba(35,22,13,' + alpha + ')';
        ctx.lineWidth = 1 + random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, yy);
        ctx.bezierCurveTo(x + 30, yy - 4, x + 55, yy + 3, x + 100, yy - 1);
        ctx.stroke();
      }
    }
    for (let x = 0; x < size; x += 128) {
      ctx.strokeStyle = 'rgba(18,12,8,.27)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  } else if (kind === 'plaster' || kind === 'concrete' || kind === 'fabric') {
    for (let i = 0; i < 20000; i++) {
      const x = random() * size;
      const y = random() * size;
      const alpha = random() * (kind === 'fabric' ? 0.09 : 0.10);
      ctx.fillStyle = random() > 0.5
        ? 'rgba(255,255,255,' + alpha + ')'
        : 'rgba(0,0,0,' + alpha + ')';
      ctx.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
    }
    if (kind === 'fabric') {
      ctx.strokeStyle = 'rgba(0,0,0,.06)';
      for (let i = 0; i < size; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
      }
    }
  } else if (kind === 'tile') {
    const tileSize = 128;
    for (let y = 0; y < size; y += tileSize) {
      for (let x = 0; x < size; x += tileSize) {
        ctx.fillStyle = 'rgba(255,255,255,.035)';
        ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        ctx.strokeStyle = 'rgba(20,21,22,.48)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.max(1, Math.floor(anisotropy));
  texture.generateMipmaps = true;
  return texture;
}

function makeNormalTexture(kind, size = 256, anisotropy = 8) {
  const data = new Uint8Array(size * size * 4);
  const randomAt = (x, y) => {
    const n = Math.sin((x + kind.length * 13.7) * 127.1 + (y + 31.3) * 311.7) * 43758.5453;
    return (n - Math.floor(n)) - 0.5;
  };
  const heightAt = (x, y) => {
    if (kind === 'wood') {
      return Math.sin(y * 0.16 + Math.sin(x * 0.035) * 2.2) * 0.34 +
        Math.sin(y * 0.49 + x * 0.006) * 0.08 + randomAt(x, y) * 0.08;
    }
    if (kind === 'tile') {
      const gx = Math.abs((x % 64) - 32);
      const gy = Math.abs((y % 64) - 32);
      return (gx > 30 || gy > 30 ? -0.22 : 0.025) + randomAt(x, y) * 0.025;
    }
    if (kind === 'fabric') {
      return Math.sin(x * 0.65) * 0.035 + Math.sin(y * 0.65) * 0.035 + randomAt(x, y) * 0.03;
    }
    const coarse = randomAt(Math.floor(x / 3), Math.floor(y / 3));
    return randomAt(x, y) * 0.09 + coarse * 0.11;
  };

  const strength = kind === 'wood' ? 2.2 : kind === 'tile' ? 1.3 : 1.75;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (heightAt(x + 1, y) - heightAt(x - 1, y)) * strength;
      const dy = (heightAt(x, y + 1) - heightAt(x, y - 1)) * strength;
      let nx = -dx, ny = -dy, nz = 1;
      const invLength = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx *= invLength; ny *= invLength; nz *= invLength;
      const index = (y * size + x) * 4;
      data[index] = Math.round((nx * 0.5 + 0.5) * 255);
      data[index + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[index + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.max(1, Math.floor(anisotropy));
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeRoughnessTexture(kind, base, size = 256, anisotropy = 8) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = Math.sin((x + kind.length * 9) * 0.13) * Math.sin((y + 17) * 0.11) * 0.05;
      const grain = kind === 'wood' ? Math.sin(y * 0.27) * 0.04 : 0;
      const value = Math.max(0, Math.min(1, base + noise + grain));
      const byte = Math.round(value * 255);
      const index = (y * size + x) * 4;
      data[index] = byte;
      data[index + 1] = byte;
      data[index + 2] = byte;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.max(1, Math.floor(anisotropy));
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function surfaceMaps(kind, color, roughness, anisotropy) {
  const map = canvasTexture(kind, color, 512, anisotropy);
  const normalMap = makeNormalTexture(kind, 256, anisotropy);
  const roughnessMap = makeRoughnessTexture(kind, roughness, 256, anisotropy);
  if (kind === 'wood') {
    map.repeat.set(3, 2);
    normalMap.repeat.set(3, 2);
    roughnessMap.repeat.set(3, 2);
  } else if (kind === 'plaster' || kind === 'concrete') {
    map.repeat.set(3, 2);
    normalMap.repeat.set(3, 2);
    roughnessMap.repeat.set(3, 2);
  } else if (kind === 'tile') {
    map.repeat.set(2, 2);
    normalMap.repeat.set(2, 2);
    roughnessMap.repeat.set(2, 2);
  }
  return { map, normalMap, roughnessMap };
}

export function createMaterials(maxAnisotropy = 8) {
  const anisotropy = Math.max(1, Math.floor(maxAnisotropy));
  const wood = surfaceMaps('wood', '#71553d', 0.64, anisotropy);
  const plaster = surfaceMaps('plaster', '#b9b3a7', 0.91, anisotropy);
  const concrete = surfaceMaps('concrete', '#54565a', 0.94, anisotropy);
  const tile = surfaceMaps('tile', '#76736c', 0.42, anisotropy);
  const fabric = surfaceMaps('fabric', '#514a40', 0.96, anisotropy);

  return {
    wall: new THREE.MeshStandardMaterial({
      color: 0xc4bcae, ...plaster, roughness: 0.91, normalScale: new THREE.Vector2(0.58, 0.58)
    }),
    wallDark: new THREE.MeshStandardMaterial({
      color: 0x77746e, ...plaster, roughness: 0.96, normalScale: new THREE.Vector2(0.75, 0.75)
    }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xbdb8ad, ...plaster, roughness: 0.94 }),
    woodFloor: new THREE.MeshStandardMaterial({
      color: 0xd1b38b, ...wood, roughness: 0.64, normalScale: new THREE.Vector2(0.72, 0.72)
    }),
    darkWood: new THREE.MeshStandardMaterial({
      color: 0x402d20, ...wood, roughness: 0.52, normalScale: new THREE.Vector2(0.82, 0.82)
    }),
    trim: new THREE.MeshStandardMaterial({ color: 0xddd0ba, ...wood, roughness: 0.65 }),
    tile: new THREE.MeshStandardMaterial({
      color: 0x9b988e, ...tile, roughness: 0.38, metalness: 0.015, normalScale: new THREE.Vector2(0.48, 0.48)
    }),
    concrete: new THREE.MeshStandardMaterial({
      color: 0x737579, ...concrete, roughness: 0.94, normalScale: new THREE.Vector2(0.9, 0.9)
    }),
    fabric: new THREE.MeshStandardMaterial({
      color: 0x777066, ...fabric, roughness: 0.96, normalScale: new THREE.Vector2(0.55, 0.55)
    }),
    leather: new THREE.MeshStandardMaterial({ color: 0x504039, roughness: 0.42, metalness: 0.015 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x777d80, metalness: 0.78, roughness: 0.26 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xa4834f, metalness: 0.72, roughness: 0.27 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc4d3d5, roughness: 0.08, metalness: 0.04, transmission: 0.72,
      transparent: true, opacity: 0.48, thickness: 0.08, ior: 1.45
    }),
    mirror: new THREE.MeshPhysicalMaterial({ color: 0xb9c2c4, metalness: 0.92, roughness: 0.07 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xe0ddd4, roughness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x151719, roughness: 0.7 }),
    screen: new THREE.MeshStandardMaterial({
      color: 0x111820, emissive: 0x162330, emissiveIntensity: 0.55, roughness: 0.2
    }),
    warmGlow: new THREE.MeshStandardMaterial({ color: 0xffd6a0, emissive: 0xffb95d, emissiveIntensity: 1.7 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x625246, ...fabric, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x303d32, roughness: 1 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x55585a, ...concrete, roughness: 0.88 })
  };
}
