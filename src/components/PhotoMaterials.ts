import {assetUrl} from '../assetUrl';
import * as THREE from 'three';
import {photoSamples,type PhotoSampleKey} from '../data/photoSamples';

/** Unit square to a quadrilateral in the original image. No edited bitmaps. */
export function photoHomography(quad:readonly (readonly [number,number])[]){
 const rows:number[][]=[];
 for(let i=0;i<4;i++){
  const [x,y]=[[0,0],[1,0],[1,1],[0,1]][i],[u,v]=quad[i];
  rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);
 }
 for(let c=0;c<8;c++){
  let p=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[p][c]))p=r;
  [rows[c],rows[p]]=[rows[p],rows[c]];
  if(Math.abs(rows[c][c])<1e-10)throw new Error('Invalid photographic surface quadrilateral');
  const d=rows[c][c];for(let k=c;k<9;k++)rows[c][k]/=d;
  for(let r=0;r<8;r++)if(r!==c){const q=rows[r][c];for(let k=c;k<9;k++)rows[r][k]-=q*rows[c][k];}
 }
 const h=rows.map(r=>r[8]);return new THREE.Matrix3().set(h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],1);
}

const vertexDeclaration='varying vec3 vFaeWorld; varying vec3 vFaeNormal;';
const vertexCoordinates=[
 'vec4 faeVertex=vec4(transformed,1.0);',
 'vec3 faeVertexNormal=objectNormal;',
 '#ifdef USE_INSTANCING',
 'faeVertex=instanceMatrix*faeVertex;',
 'mat3 faeInstance=mat3(instanceMatrix);',
 'faeVertexNormal/=vec3(dot(faeInstance[0],faeInstance[0]),dot(faeInstance[1],faeInstance[1]),dot(faeInstance[2],faeInstance[2]));',
 'faeVertexNormal=faeInstance*faeVertexNormal;',
 '#endif',
 'vFaeWorld=(modelMatrix*faeVertex).xyz;',
 'mat3 faeModel=mat3(modelMatrix);',
 'faeVertexNormal/=vec3(dot(faeModel[0],faeModel[0]),dot(faeModel[1],faeModel[1]),dot(faeModel[2],faeModel[2]));',
 'vFaeNormal=normalize(faeModel*faeVertexNormal);',
].join('\n');
const fragmentDeclaration=[
 'varying vec3 vFaeWorld; varying vec3 vFaeNormal;',
 'uniform mat3 faePhotoProjection;',
 'uniform vec2 faeSurfaceSize; uniform vec2 faeSurfaceRotation;',
 'uniform vec3 faePhotoMean;',
 'uniform float faeTextureContrast; uniform float faeRelief; uniform float faeGrout; uniform float faeFixedProjection;',
 'vec2 faePlaneUv(){',
 'vec3 n=normalize(vFaeNormal);',
 'if(faeFixedProjection>.5||abs(n.y)>.65){vec2 r=faeSurfaceRotation;return mat2(r.x,-r.y,r.y,r.x)*vFaeWorld.xz/faeSurfaceSize;}',
 'vec3 t=normalize(vec3(n.z,0.0,-n.x));',
 'return vec2(dot(vFaeWorld,t),vFaeWorld.y)/faeSurfaceSize;',
 '}',
 'vec2 faeImageUv(vec2 p){',
 'vec2 tile=1.0-abs(mod(p,2.0)-1.0);',
 'vec3 q=faePhotoProjection*vec3(tile,1.0);',
 'vec2 uv=q.xy/q.z;return vec2(uv.x,1.0-uv.y);',
 '}',
 'vec3 faeSurfaceNormal(vec3 n,float h){',
 'vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition);',
 'vec3 rx=cross(dy,n),ry=cross(n,dx);float determinant=dot(dx,rx);',
 'float areaSquared=dot(dx,dx)*dot(dy,dy);',
 'if(determinant*determinant<max(areaSquared*1e-10,1e-30))return n;',
 'vec3 g=sign(determinant)*(dFdx(h)*rx+dFdy(h)*ry);',
 'return normalize(abs(determinant)*n-g);',
 '}',
].join('\n');
const photoColor=[
 '#ifdef USE_MAP',
 'vec2 faeUv=faePlaneUv();',
 'vec4 faePhotograph=texture2D(map,faeImageUv(faeUv));',
 'vec3 faeRelative=faePhotograph.rgb/max(faePhotoMean,vec3(.015));',
 'faeRelative=clamp(mix(vec3(1.0),faeRelative,faeTextureContrast),vec3(.3),vec3(1.9));',
 'vec2 faeEdge=min(fract(faeUv),1.0-fract(faeUv));',
 'float faeJoint=faeGrout*(1.0-smoothstep(.005,.014,min(faeEdge.x,faeEdge.y)));',
 'diffuseColor.rgb*=faeRelative*(1.0-faeJoint*.28);',
 'float faeLuminance=dot(faeRelative,vec3(.2126,.7152,.0722));',
 '#endif',
].join('\n');

export class PhotoMaterials{
 private textures=new Map<string,THREE.Texture>();
 private pending:Promise<unknown>[]=[];
 private alive=true;

 readonly materials=new Set<THREE.MeshStandardMaterial>();
 readonly glass=new Set<THREE.MeshPhysicalMaterial>();
 readonly failures:string[]=[];
 constructor(private mobile:boolean){}
 private source(file:string){
  const t=this.textures.get(file);if(t)return t;
  const tex=new THREE.Texture();tex.name=file;tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.anisotropy=this.mobile?4:8;
  this.textures.set(file,tex);
  // Native image decoding works across Safari versions; mobile files are pre-sized.
  const image=new Image();image.decoding='async';
  this.pending.push(new Promise<void>(resolve=>{
   const timer=window.setTimeout(()=>{this.failures.push(file);resolve();},25000);
   image.onload=()=>{clearTimeout(timer);if(this.alive){tex.image=image;tex.needsUpdate=true;}resolve();};
   image.onerror=()=>{clearTimeout(timer);this.failures.push(file);resolve();};
   image.src=assetUrl('/materials/usach-originals/'+(this.mobile?'mobile/':'')+file);
  }));
  return tex;
 }
 apply(m:THREE.MeshStandardMaterial,key:PhotoSampleKey,options:{size?:[number,number];color?:string;contrast?:number;relief?:number;grout?:number;rotation?:number}={}){
  const s=photoSamples.samples[key];m.map=this.source(s.file);m.normalMap=null;m.roughnessMap=null;m.color.set(options.color??s.color);
  m.roughness=s.roughness;m.metalness=0;this.materials.add(m);
  const avg=new THREE.Color().setRGB(s.meanRGB[0]/255,s.meanRGB[1]/255,s.meanRGB[2]/255,THREE.SRGBColorSpace);
  m.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,{
    faePhotoProjection:{value:photoHomography(s.quad)},faeSurfaceSize:{value:new THREE.Vector2(...(options.size??s.size))},faeSurfaceRotation:{value:new THREE.Vector2(Math.cos(options.rotation??0),Math.sin(options.rotation??0))},
    faePhotoMean:{value:avg},faeTextureContrast:{value:options.contrast??s.contrast},faeRelief:{value:options.relief??s.relief},faeGrout:{value:options.grout??0},faeFixedProjection:{value:key==='membrane'?1:0},
   });
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+vertexDeclaration).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertexCoordinates);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+fragmentDeclaration).replace('#include <map_fragment>',photoColor).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(1.0-faeLuminance)*.06,.045,.98);').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=faeSurfaceNormal(normal,faeLuminance*faeRelief);');
  };
  m.customProgramCacheKey=()=> 'fae-original-photo-v7';m.needsUpdate=true;return m;
 }
 glazing(name:string,zone:'exterior'|'interior'|'classroom'='interior'){
  const exterior=zone==='exterior';
  const m=new THREE.MeshPhysicalMaterial({name,side:THREE.DoubleSide,color:exterior?'#d2e1e3':'#eef5f4',metalness:0,roughness:exterior?.095:.065,transmission:this.mobile?0:.92,thickness:.025,ior:1.5,opacity:this.mobile?(exterior?.68:.18):1,transparent:this.mobile,depthWrite:!this.mobile,envMapIntensity:1.1});
  m.userData.reflectionZone=zone;this.glass.add(m);this.materials.add(m);return m;
 }
 paint(m:THREE.MeshStandardMaterial,key:PhotoSampleKey){
  const physical=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(physical,m);
  physical.defines={STANDARD:'',PHYSICAL:''};
  physical.clearcoat=this.mobile?0:.55;physical.clearcoatRoughness=.16;
  return this.apply(physical,key);
 }
 tuneModel(root:THREE.Group){
  root.traverse(o=>{
   if(!(o instanceof THREE.Mesh))return;
   const zone=o.parent?.name??'interior';
   const original=Array.isArray(o.material)?o.material:[o.material];
   const replacement=original.map(material=>{
    if(!(material instanceof THREE.MeshStandardMaterial))return material;
    const name=material.name,m=material.clone();this.materials.add(m);
    if(/Vidrio|Cristales|Barandas de vidrio/.test(name)){
     o.castShadow=false;return this.glazing(name,zone==='tower'||zone==='wings'?'exterior':'interior');
    }
    if(/Hormig|Losas de hormigón|Canto de losas/.test(name))return this.apply(m,'concrete',{color:zone==='tower'?'#abaeaa':'#aaa9a3',size:[1.05,1.45],contrast:.7,relief:.004});
    if(/Piedra gradería/.test(name))return this.apply(m,'stone',{size:[.9,.68],rotation:Math.atan2(-125,190),grout:0,color:'#bcbdb7',contrast:.65,relief:.0018});
    if(/Piedra del atrio|Pavimento/.test(name))return this.apply(m,'stone',{size:zone==='site'?[.8,1.2]:[.6,.9],grout:1,color:zone==='site'?'#b8b8ad':'#c0beb5',relief:.0025});
    if(/amarill/i.test(name))return this.paint(m,'yellow');
    if(/rojas|rojos/i.test(name))return this.paint(m,zone==='tower'?'redExterior':'red');
    if(/azules|Puertas azules/.test(name))return this.paint(m,'blue');
    if(/Membrana blanca/.test(name)){
     this.apply(m,'membrane',{size:[3.6,3.6],contrast:.15,relief:0});m.emissive.set('#f6f3e8');m.emissiveIntensity=.14;return m;
    }
    if(/Perfilería/.test(name)){m.color.set('#303b3e');m.roughness=.32;m.metalness=.35;}
    if(/Lamas|Arriostramiento/.test(name)){m.color.set('#c6cdcc');m.roughness=.4;m.metalness=.12;}
    if(/Acero de escaleras/.test(name)){m.color.set('#9aabaa');m.roughness=.28;m.metalness=.82;}
    if(/Juntas|Costuras/.test(name)){m.color.set('#777a73');m.roughness=.9;}
    if(/Peldaños mecánicos/.test(name)){m.color.set('#32383a');m.roughness=.37;m.metalness=.5;}
    return m;
   });
   o.material=Array.isArray(o.material)?replacement:replacement[0];
  });
 }
 async ready(){await Promise.all(this.pending);}
 dispose(){this.alive=false;this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());}
}
