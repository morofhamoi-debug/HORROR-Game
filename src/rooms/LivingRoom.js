import {box} from '../home/materials.js';
export function buildLivingRoom(THREE,group,m){
box(THREE,group,[2.65,.38,.92],[-3.72,.38,-3.68],m.wood);
box(THREE,group,[2.48,.66,.22],[-3.72,.91,-4.02],m.fabric);
box(THREE,group,[.22,.62,.92],[-4.94,.68,-3.68],m.wood);box(THREE,group,[.22,.62,.92],[-2.5,.68,-3.68],m.wood);
for(const x of [-4.48,-3.72,-2.96]){box(THREE,group,[.72,.18,.68],[x,.66,-3.62],m.cushion);box(THREE,group,[.62,.46,.16],[x,.98,-3.91],m.fabric);}
box(THREE,group,[2.65,.035,1.85],[-3.45,.025,-1.95],m.rug,false);
box(THREE,group,[1.38,.12,.78],[-3.48,.52,-1.95],m.woodLight);
for(const x of [-4.02,-2.94])for(const z of [-2.23,-1.67])box(THREE,group,[.07,.48,.07],[x,.25,z],m.dark);
box(THREE,group,[.18,.52,2.05],[-5.48,.28,-3],m.wood);
box(THREE,group,[1.55,.9,.09],[-5.36,1.43,-3],m.dark);box(THREE,group,[1.42,.77,.025],[-5.305,1.44,-3],m.screen,false);
for(const z of [-3.95,-2.05])box(THREE,group,[.22,.48,.24],[-5.15,.3,z],m.dark);
box(THREE,group,[.48,.48,.48],[-2.15,.24,-4],m.wood);box(THREE,group,[.55,.055,.55],[-2.15,.5,-4],m.woodLight);
box(THREE,group,[.045,.55,.045],[-2.15,.8,-4],m.metal,false);box(THREE,group,[.32,.22,.32],[-2.15,1.18,-4],m.trim,false);
const lamp=new THREE.PointLight(0xffd6a0,5,3,2);lamp.position.set(-2.15,1.25,-4);group.add(lamp);
box(THREE,group,[.28,.06,.2],[-3.35,.62,-1.9],m.ceramic,false);box(THREE,group,[.34,.08,.22],[-3,.62,-2],m.dark,false);
}