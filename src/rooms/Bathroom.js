import {box} from '../home/materials.js';
export function buildBathroom(THREE,group,m){
box(THREE,group,[1.25,.16,1.25],[-4.5,.08,3.5],m.tile);box(THREE,group,[.045,1.95,1.18],[-3.86,1,3.5],m.glass,false);box(THREE,group,[.05,.05,1.2],[-3.86,1.98,3.5],m.metal,false);
box(THREE,group,[.08,.08,.08],[-4.7,1.25,4.05],m.metal,false);box(THREE,group,[.035,.62,.035],[-4.7,1.62,4.05],m.metal,false);box(THREE,group,[.32,.045,.22],[-4.7,1.95,4.05],m.metal,false);
box(THREE,group,[.62,.72,.22],[-5.25,.36,2.2],m.ceramic);box(THREE,group,[.62,.12,.62],[-5.25,.78,2.38],m.ceramic);box(THREE,group,[.5,.3,.52],[-5.25,.2,2.45],m.ceramic);
box(THREE,group,[.78,.72,.48],[-5.25,.36,4.35],m.wood);box(THREE,group,[.88,.08,.55],[-5.25,.76,4.35],m.ceramic);box(THREE,group,[.52,.06,.28],[-5.25,.82,4.35],m.tile,false);
box(THREE,group,[.72,.9,.055],[-5.25,1.65,4.04],m.glass,false);box(THREE,group,[.8,.06,.08],[-5.25,2.12,4.04],m.metal,false);
box(THREE,group,[.65,.045,.045],[-5.65,1.35,1.35],m.metal,false);box(THREE,group,[.42,.42,.045],[-5.65,1.1,1.35],m.fabric,false);
}