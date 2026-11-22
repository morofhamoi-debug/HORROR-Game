import { box } from './materials.js';

export function buildWalls(THREE, group, m) {
  const H=2.9, T=.22;
  const wall=(size,pos)=>box(THREE,group,size,pos,m.plaster);
  const inner=(size,pos)=>box(THREE,group,size,pos,m.innerWall);

  // Back wall with two window apertures.
  const back=[{c:-3.8,w:1.65},{c:1.25,w:1.55}];
  let cursor=-6;
  for(const win of back){
    const l=win.c-win.w/2, r=win.c+win.w/2;
    if(l>cursor) wall([l-cursor,H,T],[(l+cursor)/2,H/2,-5]);
    wall([win.w,1.19,T],[win.c,.595,-5]);
    wall([win.w,.53,T],[win.c,2.635,-5]);
    cursor=r;
  }
  if(cursor<6) wall([6-cursor,H,T],[(6+cursor)/2,H/2,-5]);

  // Front wall with a full-height entrance aperture.
  wall([5.44,H,T],[-3.28,H/2,5]);
  wall([5.44,H,T],[3.28,H/2,5]);
  wall([1.12,.78,T],[0,2.51,5]);

  // Left wall: one window centered at z=-1.
  wall([T,H,3.41],[-6,H/2,-3.295]);
  wall([T,H,5.41],[-6,H/2,2.295]);
  wall([T,1.22,1.18],[-6,.61,-1]);
  wall([T,.56,1.18],[-6,2.62,-1]);

  // Right wall: one window centered at z=1.4.
  wall([T,H,5.81],[6,H/2,-2.095]);
  wall([T,H,3.01],[6,H/2,3.495]);
  wall([T,1.22,1.18],[6,.61,1.4]);
  wall([T,.56,1.18],[6,2.62,1.4]);

  // Interior partitions with open doorways.
  inner([T,H,2.55],[-1,H/2,-3.725]);
  inner([T,H,2.45],[-1,H/2,3.775]);
  inner([3.25,H,T],[4.375,H/2,-1.2]);
  inner([1.05,H,T],[-5.475,H/2,1.2]);

  // Baseboards.
  wall([11.5,.12,.06],[0,.08,-4.84]);
  wall([11.5,.12,.06],[0,.08,4.84]);
  wall([.06,.12,9.5],[-5.84,.08,0]);
  wall([.06,.12,9.5],[5.84,.08,0]);
}
