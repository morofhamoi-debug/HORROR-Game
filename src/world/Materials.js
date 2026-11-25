import * as THREE from 'three';

function canvasTexture(kind, base, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  let seed = kind.length * 917;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  if (kind === 'wood') {
    const plankH = 64;
    for (let y = 0; y < size; y += plankH) {
      const shade = Math.floor(random() * 22 - 11);
      ctx.fillStyle = 'rgba(' + (100 + shade) + ',' + (69 + shade) + ',' + (44 + shade) + ',.11)';
      ctx.fillRect(0, y, size, plankH - 2);
      ctx.strokeStyle = 'rgba(19,11,7,.28)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, y + plankH); ctx.lineTo(size, y + plankH); ctx.stroke();
      for (let i = 0; i < 85; i++) {
        const x = random() * size;
        const yy = y + random() * plankH;
        ctx.strokeStyle = 'rgba(' + (random() > .5 ? '235,190,132' : '35,22,13') + ',' + (0.025 + random() * .08) + ')';
        ctx.lineWidth = 1 + random() * 2;
        ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + 30, yy - 4, x + 55, yy + 3, x + 100, yy - 1); ctx.stroke();
      }
    }
    for (let x = 0; x < size; x += 128) {
      ctx.strokeStyle = 'rgba(18,12,8,.25)';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
    }
  } else if (kind === 'plaster' || kind === 'concrete' || kind === 'fabric') {
    for (let i = 0; i < 18000; i++) {
      const x = random() * size, y = random() * size;
      const a = random() * (kind === 'fabric' ? .08 : .09);
      ctx.fillStyle = random() > .5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(0,0,0,' + a + ')';
      ctx.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
    }
    if (kind === 'fabric') {
      ctx.strokeStyle = 'rgba(0,0,0,.07)';
      for (let i = 0; i < size; i += 4) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke(); }
    }
  } else if (kind === 'tile') {
    const tile = 128;
    for (let y = 0; y < size; y += tile) for (let x = 0; x < size; x += tile) {
      ctx.fillStyle = 'rgba(255,255,255,.025)';
      ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);
      ctx.strokeStyle = 'rgba(20,21,22,.5)'; ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export function createMaterials() {
  const woodTexture = canvasTexture('wood', '#71553d');
  woodTexture.repeat.set(3, 2);
  const plasterTexture = canvasTexture('plaster', '#b9b3a7');
  plasterTexture.repeat.set(3, 2);
  const concreteTexture = canvasTexture('concrete', '#54565a');
  concreteTexture.repeat.set(3, 3);
  const tileTexture = canvasTexture('tile', '#76736c');
  tileTexture.repeat.set(2, 2);
  const fabricTexture = canvasTexture('fabric', '#514a40');
  fabricTexture.repeat.set(2, 2);

  return {
    wall: new THREE.MeshStandardMaterial({ color: 0xc4bcae, map: plasterTexture, roughness: .91 }),
    wallDark: new THREE.MeshStandardMaterial({ color: 0x77746e, map: plasterTexture, roughness: .96 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xbdb8ad, roughness: .94 }),
    woodFloor: new THREE.MeshStandardMaterial({ color: 0xd1b38b, map: woodTexture, roughness: .64 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x402d20, map: woodTexture, roughness: .52 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xddd0ba, roughness: .65 }),
    tile: new THREE.MeshStandardMaterial({ color: 0x9b988e, map: tileTexture, roughness: .38 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x737579, map: concreteTexture, roughness: .94 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x777066, map: fabricTexture, roughness: .96 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x504039, roughness: .42 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x777d80, metalness: .78, roughness: .26 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xa4834f, metalness: .72, roughness: .27 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xc4d3d5, roughness: .08, metalness: .04, transmission: .72, transparent: true, opacity: .48, thickness: .08, ior: 1.45 }),
    mirror: new THREE.MeshPhysicalMaterial({ color: 0xb9c2c4, metalness: .92, roughness: .07 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xe0ddd4, roughness: .2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x151719, roughness: .7 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x111820, emissive: 0x162330, emissiveIntensity: .55, roughness: .2 }),
    warmGlow: new THREE.MeshStandardMaterial({ color: 0xffd6a0, emissive: 0xffb95d, emissiveIntensity: 1.7 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x625246, map: fabricTexture, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x303d32, roughness: 1 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x55585a, roughness: .88 })
  };
}