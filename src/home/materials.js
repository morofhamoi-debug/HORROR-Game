import * as THREE from 'three';

function proceduralTexture(kind, repeatX=2, repeatY=2) {
  const canvas=document.createElement('canvas');
  canvas.width=256; canvas.height=256;
  const ctx=canvas.getContext('2d');
  const palettes={
    wood:['#493529','#624a38','#80634b'],
    plaster:['#aaa69b','#bdb9ae','#d0cbc0'],
    fabric:['#68675f','#77766d','#89877d'],
    tile:['#777a74','#858780','#999b94'],
    stone:['#b7b3a8','#cbc7bb','#d5d1c6']
  };
  const colors=palettes[kind]||palettes.plaster;
  ctx.fillStyle=colors[1];ctx.fillRect(0,0,256,256);
  let seed=kind.length*971+37;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<2400;i++){
    const shade=colors[Math.floor(rand()*colors.length)];
    ctx.globalAlpha=.08+rand()*.16;ctx.fillStyle=shade;
    const x=rand()*256,y=rand()*256,s=1+rand()*3;
    ctx.fillRect(x,y,s,s);
  }
  ctx.globalAlpha=1;
  if(kind==='wood'){
    for(let i=0;i<95;i++){
      ctx.beginPath();ctx.strokeStyle=i%3===0?colors[0]:colors[2];
      ctx.globalAlpha=.12+rand()*.15;ctx.lineWidth=.5+rand()*1.4;
      const y=rand()*256;ctx.moveTo(0,y);ctx.bezierCurveTo(70,y-8,170,y+8,256,y+(rand()-.5)*12);ctx.stroke();
    }
  } else if(kind==='tile'||kind==='stone'){
    ctx.globalAlpha=.22;ctx.strokeStyle='#454943';ctx.lineWidth=2;
    for(let x=0;x<=256;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();}
    for(let y=0;y<=256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
  } else if(kind==='fabric'){
    ctx.globalAlpha=.12;ctx.strokeStyle='#e0ded5';ctx.lineWidth=1;
    for(let p=0;p<256;p+=4){ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,256);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(256,p);ctx.stroke();}
  }
  ctx.globalAlpha=1;
  const map=new THREE.CanvasTexture(canvas);
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.repeat.set(repeatX,repeatY);
  map.colorSpace=THREE.SRGBColorSpace;
  const bump=new THREE.CanvasTexture(canvas);
  bump.wrapS=bump.wrapT=THREE.RepeatWrapping;
  bump.repeat.set(repeatX,repeatY);
  return {map,bump};
}

export function createHomeMaterials(){
  const woodTex=proceduralTexture('wood',2,3);
  const plasterTex=proceduralTexture('plaster',3,2);
  const fabricTex=proceduralTexture('fabric',2,2);
  const tileTex=proceduralTexture('tile',2,2);
  const stoneTex=proceduralTexture('stone',2,2);
  return {
    plaster:new THREE.MeshStandardMaterial({color:0xffffff,map:plasterTex.map,bumpMap:plasterTex.bump,bumpScale:.018,roughness:.96}),
    innerWall:new THREE.MeshStandardMaterial({color:0xffffff,map:plasterTex.map,bumpMap:plasterTex.bump,bumpScale:.018,roughness:.95}),
    floor:new THREE.MeshStandardMaterial({color:0xffffff,map:woodTex.map,bumpMap:woodTex.bump,bumpScale:.035,roughness:.82}),
    wood:new THREE.MeshStandardMaterial({color:0xffffff,map:woodTex.map,bumpMap:woodTex.bump,bumpScale:.025,roughness:.78}),
    woodLight:new THREE.MeshStandardMaterial({color:0xffffff,map:woodTex.map,bumpMap:woodTex.bump,bumpScale:.02,roughness:.74}),
    trim:new THREE.MeshStandardMaterial({color:0xddd5c5,roughness:.82}),
    glass:new THREE.MeshStandardMaterial({color:0x71817f,roughness:.18,metalness:.12,transparent:true,opacity:.42}),
    dark:new THREE.MeshStandardMaterial({color:0x282a27,roughness:.9}),
    tile:new THREE.MeshStandardMaterial({color:0xffffff,map:tileTex.map,bumpMap:tileTex.bump,bumpScale:.025,roughness:.72}),
    fabric:new THREE.MeshStandardMaterial({color:0xffffff,map:fabricTex.map,bumpMap:fabricTex.bump,bumpScale:.035,roughness:1}),
    cushion:new THREE.MeshStandardMaterial({color:0xffffff,map:fabricTex.map,bumpMap:fabricTex.bump,bumpScale:.04,roughness:1}),
    rug:new THREE.MeshStandardMaterial({color:0x51483f,map:fabricTex.map,bumpMap:fabricTex.bump,bumpScale:.05,roughness:1}),
    ceramic:new THREE.MeshStandardMaterial({color:0xffffff,map:stoneTex.map,bumpMap:stoneTex.bump,bumpScale:.012,roughness:.3}),
    metal:new THREE.MeshStandardMaterial({color:0x777c7b,metalness:.72,roughness:.3}),
    screen:new THREE.MeshStandardMaterial({color:0x080d10,emissive:0x17242a,emissiveIntensity:.32,roughness:.18})
  };
}

export function box(THREE,parent,size,position,material,castShadow=true,receiveShadow=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
  mesh.position.set(...position);mesh.castShadow=castShadow;mesh.receiveShadow=receiveShadow;
  parent.add(mesh);return mesh;
}
