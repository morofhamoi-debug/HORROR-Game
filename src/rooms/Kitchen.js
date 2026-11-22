import {box} from '../home/materials.js';
export function buildKitchen(THREE,group,m){
box(THREE,group,[3.3,.82,.62],[3.95,.42,-3.9],m.wood);box(THREE,group,[3.35,.07,.68],[3.95,.86,-3.9],m.ceramic);
for(let x=2.55;x<=5.25;x+=.9){box(THREE,group,[.035,.68,.56],[x,.42,-3.9],m.dark,false);box(THREE,group,[.035,.11,.025],[x,.45,-3.605],m.metal,false);}
for(const x of [2.85,3.85,4.85]){box(THREE,group,[.88,.72,.34],[x,2.05,-4.55],m.woodLight);box(THREE,group,[.035,.58,.025],[x,2.05,-4.365],m.dark,false);box(THREE,group,[.035,.09,.035],[x+.28,2.05,-4.33],m.metal,false);}
box(THREE,group,[.82,.035,.42],[3.05,.91,-3.9],m.metal,false);box(THREE,group,[.055,.25,.055],[3.05,1.04,-4.02],m.metal,false);box(THREE,group,[.22,.045,.055],[3.05,1.16,-3.92],m.metal,false);
box(THREE,group,[.78,.035,.55],[4.75,.91,-3.9],m.dark,false);for(const x of [4.53,4.96])for(const z of [-4.08,-3.73])box(THREE,group,[.22,.025,.22],[x,.94,z],m.metal,false);
box(THREE,group,[.78,.48,.035],[4.75,.42,-3.56],m.dark,false);box(THREE,group,[.56,.22,.025],[4.75,.43,-3.535],m.screen,false);
box(THREE,group,[.82,1.95,.78],[5.25,.98,-2.65],m.ceramic);box(THREE,group,[.035,.78,.04],[5.25,1.55,-2.23],m.metal,false);box(THREE,group,[.035,.45,.04],[5.25,.55,-2.23],m.metal,false);
box(THREE,group,[1.65,.12,1],[3.55,.82,-.4],m.woodLight);
for(const x of [2.8,4.3])for(const z of [-1.05,.25]){box(THREE,group,[.42,.48,.42],[x,.48,z],m.wood);box(THREE,group,[.42,.12,.42],[x,.78,z],m.fabric);box(THREE,group,[.42,.58,.09],[x,.98,z-.16],m.wood);}
box(THREE,group,[.34,.07,.24],[3.55,.92,-.4],m.ceramic,false);for(const [x,z] of [[3.43,-.4],[3.58,-.43],[3.66,-.35]])box(THREE,group,[.09,.09,.09],[x,.99,z],m.woodLight,false);
}