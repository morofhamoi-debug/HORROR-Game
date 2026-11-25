import * as THREE from 'three';
import { addSwitch } from './Architecture.js';
import { floorY, roomHeight } from './Layout.js';
export function createLighting(scene, house) {
  const hemisphere = new THREE.HemisphereLight(0xc7d3e4, 0x30271e, 0.34);
  scene.add(hemisphere);
  const moon = new THREE.DirectionalLight(0x9baecb, 1.65);
  moon.position.set(-12, 18, -10); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -14; moon.shadow.camera.right = 14;
  moon.shadow.camera.top = 14; moon.shadow.camera.bottom = -14;
  moon.shadow.camera.near = 1; moon.shadow.camera.far = 40;
  moon.shadow.bias = -0.00018; moon.shadow.normalBias = .025; moon.shadow.radius = 3;
  scene.add(moon);
  const warm = new THREE.Color(0xffc783);
  const roomGroups = [];
  for (let level = -1; level <= 1; level++) {
    const y = floorY(level);
    const ceilingY = y + roomHeight(level);
    const group = new THREE.Group(); group.name = 'lighting_level_' + level; scene.add(group);
    const points = [[-5.2,ceilingY-0.42,-3.3,25,1.9],[4.5,ceilingY-0.42,-3.3,24,1.7],[-5.1,ceilingY-0.42,3.5,22,1.6],[4.5,ceilingY-0.42,3.6,22,1.7]];
    for (let i = 0; i < points.length; i++) {
      const [x, py, z, distance, intensity] = points[i];
      const light = new THREE.PointLight(warm, intensity, distance, 1.65);
      light.position.set(x, py, z); light.castShadow = false;
      light.userData.baseIntensity = intensity;
      group.add(light);
      const fixture = new THREE.Mesh(new THREE.CylinderGeometry(.34, .22, .12, 20), house.materials.brass);
      fixture.position.set(x, ceilingY - 0.06, z); group.add(fixture);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), house.materials.warmGlow);
      bulb.position.set(x, ceilingY - 0.19, z); group.add(bulb);
    }
    for (const x of [-8.7, 8.7]) {
      const sconce = new THREE.PointLight(0xffc58a, .8, 9, 1.8);
      sconce.position.set(x, y + roomHeight(level) * 0.70, .1);
      sconce.userData.baseIntensity = level === -1 ? 0.52 : 0.72;
      group.add(sconce);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 10), house.materials.warmGlow);
      bulb.position.copy(sconce.position); group.add(bulb);
    }
    roomGroups.push(group);
    addSwitch(scene, house.materials, house.interactables, 1.45, y + 1.30, 6.46, group, 'z');
    house.switchNodes.push({ group, level });
  }
  const porch = new THREE.PointLight(0xffc98c, 1.6, 13, 1.8);
  porch.position.set(0, 3.1, 8.4); scene.add(porch);
  const beam = new THREE.SpotLight(0x9eb5d3, 2.2, 32, Math.PI / 7, .5, 1.6);
  beam.position.set(-4, 7.5, 10); beam.target.position.set(0, 0.8, 6);
  scene.add(beam, beam.target); beam.castShadow = false;
  let elapsed = 0;
  return {
    update(dt) {
      elapsed += dt;
      const pulse = Math.sin(elapsed * 1.7) * 0.018 + Math.sin(elapsed * 0.37) * 0.025;
      for (const group of roomGroups) {
        group.children.forEach(child => {
          if (child.isLight && Number.isFinite(child.userData.baseIntensity)) {
            child.intensity = Math.max(0, child.userData.baseIntensity + pulse);
          }
        });
      }
      porch.intensity = 1.5 + Math.sin(elapsed * 1.4) * 0.06;
    },
    dispose() {
      for (const group of roomGroups) {
        group.traverse(object => object.geometry?.dispose?.());
        group.removeFromParent();
      }
      hemisphere.removeFromParent();
      moon.removeFromParent();
      porch.removeFromParent();
      beam.removeFromParent();
      beam.target.removeFromParent();
    }
  };
}
