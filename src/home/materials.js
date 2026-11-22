import * as THREE from 'three';
export function createHomeMaterials(){return{
plaster:new THREE.MeshStandardMaterial({color:0xb8b5aa,roughness:.94}),
innerWall:new THREE.MeshStandardMaterial({color:0xaaa79d,roughness:.92}),
floor:new THREE.MeshStandardMaterial({color:0x695344,roughness:.78}),
wood:new THREE.MeshStandardMaterial({color:0x4b3528,roughness:.76}),
woodLight:new THREE.MeshStandardMaterial({color:0x80634b,roughness:.72}),
trim:new THREE.MeshStandardMaterial({color:0xddd5c5,roughness:.82}),
glass:new THREE.MeshStandardMaterial({color:0x71817f,roughness:.18,metalness:.12,transparent:true,opacity:.42}),
dark:new THREE.MeshStandardMaterial({color:0x282a27,roughness:.9}),
tile:new THREE.MeshStandardMaterial({color:0x777a74,roughness:.68}),
fabric:new THREE.MeshStandardMaterial({color:0x77766d,roughness:1}),
cushion:new THREE.MeshStandardMaterial({color:0x9b9585,roughness:1}),
rug:new THREE.MeshStandardMaterial({color:0x51483f,roughness:1}),
ceramic:new THREE.MeshStandardMaterial({color:0xd5d3c9,roughness:.28}),
metal:new THREE.MeshStandardMaterial({color:0x777c7b,metalness:.72,roughness:.3}),
screen:new THREE.MeshStandardMaterial({color:0x080d10,emissive:0x17242a,emissiveIntensity:.32,roughness:.18})
};}
export function box(THREE,parent,size,position,material,castShadow=true,receiveShadow=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);mesh.castShadow=castShadow;mesh.receiveShadow=receiveShadow;parent.add(mesh);return mesh;}