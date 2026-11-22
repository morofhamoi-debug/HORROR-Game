import {box} from '../home/materials.js';
export function buildCorridor(THREE,group,m){
box(THREE,group,[1.15,.78,.34],[0,.39,3.55],m.wood);box(THREE,group,[1.18,.055,.38],[0,.81,3.55],m.woodLight);
for(const y of [.35,.58]){box(THREE,group,[.82,.025,.025],[0,y,3.365],m.dark,false);box(THREE,group,[.07,.045,.035],[0,y,3.34],m.metal,false);}
box(THREE,group,[.72,.92,.035],[0,1.65,3.31],m.glass,false);box(THREE,group,[.82,1.02,.06],[0,1.65,3.35],m.wood,false);
box(THREE,group,[.78,.58,.38],[-1.05,.29,4.15],m.wood);box(THREE,group,[.82,.045,.42],[-1.05,.59,4.15],m.woodLight);
for(const y of [.2,.42])box(THREE,group,[.72,.025,.34],[-1.05,y,4.15],m.dark,false);
for(const x of [-.95,-.55,-.15]){box(THREE,group,[.07,.07,.07],[x,2.05,4.82],m.metal,false);box(THREE,group,[.08,.48,.16],[x,1.78,4.72],m.fabric,false);}
box(THREE,group,[.28,.5,.28],[.95,.25,4.2],m.dark);for(const x of [.9,1])box(THREE,group,[.025,.75,.025],[x,.83,4.2],m.woodLight,false);
}