import * as THREE from 'three';
import { addSwitch } from './Architecture.js';
export function createLighting(scene, house) {
  const hemisphere = new THREE.HemisphereLight(0xc7d3e4, 0x30271e, 0.34);
  scene.add(hemisphere);
  const moon = new THREE.DirectionalLight(0x9baecb, 1.65);
  moon.position.set(-18, 28, -16); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -28; moon.shadow.camera.right = 28;
  moon.shadow.camera.top = 28; moon.shadow.camera.bottom = -28;
  moon.shadow.bias = -0.00018; moon.shadow.normalBias = .025; moon.shadow.radius = 4;
  scene.add(moon);
  const warm = new THREE.Color(0xffc783);
  const roomGroups = [];
  for (let level = -1; level <= 1; level++) {
    const y = level * 3.5;
    const group = new THREE.Group(); group.name = 'lighting_level_' + level; scene.add(group);
    const points = [[-5.2,y+2.8,-3.3,32,1.9],[4.5,y+2.8,-3.3,30,1.7],[-5.1,y+2.8,3.5,28,1.6],[4.5,y+2.8,3.6,28,1.7]];
    for (let i = 0; i < points.length; i++) {
      const [x, py, z, distance, intensity] = points[i];
      const light = new THREE.PointLight(warm, intensity, distance, 1.65);
      light.position.set(x, py, z); light.castShadow = i === 0 || (level === -1 && i === 2);
      if (light.castShadow) { light.shadow.mapSize.set(512, 512); light.shadow.bias = -0.0003; light.shadow.radius = 3; }
      group.add(light);
      const fixture = new THREE.Mesh(new THREE.CylinderGeometry(.34, .22, .12, 20), house.materials.brass);
      fixture.position.set(x, y + 3.15, z); group.add(fixture);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), house.materials.warmGlow);
      bulb.position.set(x, y + 3.02, z); group.add(bulb);
    }
    for (const x of [-8.7, 8.7]) {
      const sconce = new THREE.PointLight(0xffc58a, .8, 9, 1.8);
      sconce.position.set(x, y + 2.15, .1); group.add(sconce);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 10), house.materials.warmGlow);
      bulb.position.copy(sconce.position); group.add(bulb);
    }
    roomGroups.push(group);
    addSwitch(scene, house.materials, house.interactables, 1.4, y + 1.25, 6.45, group);
    house.switchNodes.push({ group, level });
  }
  const porch = new THREE.PointLight(0xffc98c, 1.6, 13, 1.8);
  porch.position.set(0, 3.1, 8.4); scene.add(porch);
  const beam = new THREE.SpotLight(0x9eb5d3, 2.2, 32, Math.PI / 7, .5, 1.6);
  beam.position.set(-4, 8, 9); beam.target.position.set(0, 1.2, 5);
  scene.add(beam, beam.target); beam.castShadow = true; beam.shadow.mapSize.set(1024, 1024);
  let elapsed = 0;
  return {
    update(dt) {
      elapsed += dt;
      const pulse = Math.sin(elapsed * 1.7) * .018 + Math.sin(elapsed * .37) * .025;
      for (let i = 0; i < roomGroups.length; i++) {
        const base = i === 1 ? 1.7 : 1.8;
        roomGroups[i].children.forEach(child => { if (child.isLight) child.intensity = Math.max(.05, base + pulse); });
      }
      porch.intensity = 1.5 + Math.sin(elapsed * 1.4) * .06;
    }
  };
}