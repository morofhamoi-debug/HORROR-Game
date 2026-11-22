import { box } from './materials.js';

function createAgedPhotograph(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#a99b7d');
  sky.addColorStop(.58, '#c1ae89');
  sky.addColorStop(1, '#71634f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 256, 320);

  // Faded clouds and distant tree line.
  ctx.fillStyle = 'rgba(232,216,177,.28)';
  ctx.beginPath();
  ctx.ellipse(70, 78, 62, 24, -.12, 0, Math.PI * 2);
  ctx.ellipse(176, 99, 72, 30, .1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6f715d';
  ctx.beginPath();
  ctx.moveTo(0, 190); ctx.lineTo(30, 144); ctx.lineTo(58, 180);
  ctx.lineTo(91, 136); ctx.lineTo(130, 184); ctx.lineTo(164, 146);
  ctx.lineTo(211, 184); ctx.lineTo(242, 150); ctx.lineTo(256, 172);
  ctx.lineTo(256, 320); ctx.lineTo(0, 320); ctx.closePath();
  ctx.fill();

  // A small country house in the background.
  ctx.fillStyle = '#b9a887';
  ctx.fillRect(64, 156, 132, 112);
  ctx.fillStyle = '#554c3e';
  ctx.beginPath();
  ctx.moveTo(48, 164); ctx.lineTo(129, 104); ctx.lineTo(213, 164); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4b463b';
  ctx.fillRect(112, 205, 34, 63);
  ctx.fillStyle = '#554d3d';
  for (const x of [80, 160]) {
    ctx.fillRect(x, 184, 23, 28);
    ctx.fillStyle = 'rgba(223,201,151,.55)';
    ctx.fillRect(x + 3, 187, 17, 22);
    ctx.fillStyle = '#554d3d';
  }

  // Three distant silhouettes on the front path.
  for (const [x, y, scale] of [[76,250,.8],[126,244,1],[176,252,.78]]) {
    ctx.fillStyle = '#37352e';
    ctx.beginPath();
    ctx.arc(x, y - 20 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 7 * scale, y - 13 * scale, 14 * scale, 36 * scale);
    ctx.fillRect(x - 7 * scale, y + 18 * scale, 5 * scale, 22 * scale);
    ctx.fillRect(x + 2 * scale, y + 18 * scale, 5 * scale, 22 * scale);
  }

  // Paper wear, dust and a soft vignette.
  let seed = 1998;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = random() > .5 ? 'rgba(50,39,24,.12)' : 'rgba(255,235,194,.12)';
    const x = random() * 256;
    const y = random() * 320;
    ctx.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
  }
  const vignette = ctx.createRadialGradient(128, 150, 60, 128, 150, 205);
  vignette.addColorStop(.55, 'rgba(28,22,15,0)');
  vignette.addColorStop(1, 'rgba(28,22,15,.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 256, 320);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: .96 });
}

export function buildInspectables(THREE, group, m) {
  const frame = new THREE.Group();
  frame.name = 'HALLWAY_PHOTOGRAPH';

  box(THREE, frame, [.055,.74,.58], [0,0,0], m.wood);
  box(THREE, frame, [.022,.61,.45], [.037,0,0], m.dark, false);
  const photoMaterial = createAgedPhotograph(THREE);
  box(THREE, frame, [.012,.52,.36], [.052,0,0], photoMaterial, false);
  box(THREE, frame, [.018,.045,.40], [.061,.29,0], m.woodLight, false);
  box(THREE, frame, [.018,.045,.40], [.061,-.29,0], m.woodLight, false);

  frame.position.set(-.84,1.92,3.72);
  frame.userData.interaction = {
    type: 'inspect',
    label: 'Старая фотография',
    title: 'Фотография в коридоре',
    description: 'На выцветшем снимке изображён этот дом. У крыльца стоят трое людей, но лица почти стёрлись от времени. На обороте карандашом написано: «Не забывай запирать входную дверь».'
  };
  group.add(frame);
  return frame;
}
