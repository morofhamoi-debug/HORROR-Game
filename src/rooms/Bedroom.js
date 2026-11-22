import {box} from '../home/materials.js';
export function buildBedroom(THREE,group,m){
box(THREE,group,[2.25,.42,2.8],[3.7,.38,2.9],m.wood);box(THREE,group,[2.18,.2,2.62],[3.7,.68,2.9],m.ceramic);box(THREE,group,[2.12,.16,1.1],[3.7,.82,3.56],m.fabric);box(THREE,group,[2.25,.72,.2],[3.7,.9,4.15],m.wood);
for(const x of [3.15,4.25])box(THREE,group,[.78,.16,.48],[x,.91,1.95],m.cushion);
for(const x of [2.15,5.2]){box(THREE,group,[.55,.52,.55],[x,.26,4.1],m.wood);box(THREE,group,[.59,.055,.59],[x,.54,4.1],m.woodLight);box(THREE,group,[.035,.35,.035],[x,.74,4.1],m.metal,false);box(THREE,group,[.25,.18,.25],[x,.99,4.1],m.trim,false);const glow=new THREE.PointLight(0xffd6a8,2.2,2.2,2);glow.position.set(x,1.05,4.1);group.add(glow);}
box(THREE,group,[1,2.15,.58],[5.25,1.075,1],m.wood);box(THREE,group,[.46,2,.025],[5,1.08,.69],m.woodLight,false);box(THREE,group,[.46,2,.025],[5.5,1.08,.69],m.woodLight,false);
for(const x of [5.08,5.42])box(THREE,group,[.035,.16,.035],[x,1.08,.65],m.metal,false);
box(THREE,group,[.85,.62,.055],[3.7,2,4.78],m.wood,false);box(THREE,group,[.72,.49,.02],[3.7,2,4.74],m.rug,false);
}