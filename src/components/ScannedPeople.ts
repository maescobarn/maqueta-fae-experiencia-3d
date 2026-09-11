import {assetUrl} from '../assetUrl';
import * as T from 'three';
import {unzlibSync} from 'three/addons/libs/fflate.module.js';
type Placement={x:number;y:number;z:number;angle:number;scale:number;asset:string;zone:string;outfit?:number};
type Manifest={records:{name:string;texture:string;url:string}[];textures:Record<string,string>;placements:Placement[]};
export function scannedPeople(scene:T.Scene,renderer:T.WebGLRenderer){
 const group=new T.Group();group.name='Alumnos V4 · escaneados';scene.add(group);let alive=true;const geos:T.BufferGeometry[]=[],mats:T.Material[]=[],textures:T.Texture[]=[];
 const ready=(async()=>{
  const response=await fetch(assetUrl("/people-v4/manifest.json"));if(!response.ok)throw new Error('People manifest');const data=await response.json() as Manifest;
  const materialMap=new Map<string,T.MeshStandardMaterial>();
  await Promise.all(Object.entries(data.textures).map(async([name,url])=>{const texture=await new T.TextureLoader().loadAsync(assetUrl(url));if(!alive){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.flipY=name!=='headphones';texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(texture);const material=new T.MeshStandardMaterial({map:texture,roughness:.83,metalness:0,envMapIntensity:.45});mats.push(material);materialMap.set(name,material);}));
  if(!alive)return;
  await Promise.all(data.records.map(async asset=>{
   const response=await fetch(assetUrl(asset.url));if(!response.ok)throw new Error(asset.name);const encoded=new Uint8Array(await response.arrayBuffer());if(!alive)return;
   const raw=unzlibSync(encoded),header=new DataView(raw.buffer,raw.byteOffset,8),count=header.getUint32(0,true),indices=header.getUint32(4,true);let offset=8;
   const take=(bytes:number)=>{const result=raw.slice(offset,offset+bytes).buffer;offset+=bytes;return result;};
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(take(count*12)),3));geo.setAttribute('normal',new T.BufferAttribute(new Int16Array(take(count*6)),3,true));geo.setAttribute('uv',new T.BufferAttribute(new Uint16Array(take(count*4)),2,true));geo.setIndex(new T.BufferAttribute(new Uint32Array(take(indices*4)),1));geos.push(geo);
   const placements=data.placements.filter(p=>p.asset===asset.name),material=materialMap.get(asset.texture)!.clone();mats.push(material);
   if(asset.name.includes('seated')){
    material.onBeforeCompile=shader=>{shader.vertexShader='attribute vec3 outfitTint; varying vec3 vOutfitTint; varying float vBodyHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOutfitTint=outfitTint;vBodyHeight=position.y;');shader.fragmentShader='varying vec3 vOutfitTint; varying float vBodyHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     float hi=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));float lo=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));float neutralFabric=1.0-smoothstep(0.12,0.23,(hi-lo)/max(hi,0.001));float torso=smoothstep(0.81,0.91,vBodyHeight)*(1.0-smoothstep(1.22,1.29,vBodyHeight));diffuseColor.rgb*=mix(vec3(1.0),vOutfitTint,neutralFabric*torso);`);};
    material.customProgramCacheKey=()=> 'v4-seated-outfits';const palette=[[.30,.48,.73],[.80,.58,.31],[.42,.58,.35],[.65,.30,.26],[.97,.97,.95],[.34,.37,.43],[.32,.55,.58],[.57,.39,.66],[.78,.77,.68],[.23,.28,.36]],colors=new Float32Array(placements.length*3);placements.forEach((p,i)=>colors.set(palette[p.outfit??0],i*3));geo.setAttribute('outfitTint',new T.InstancedBufferAttribute(colors,3));
   }
   const mesh=new T.InstancedMesh(geo,material,placements.length),transform=new T.Object3D();mesh.name=asset.name;mesh.castShadow=true;mesh.receiveShadow=true;
   placements.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.rotation.set(0,p.angle,0);transform.scale.setScalar(p.scale);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});mesh.computeBoundingSphere();group.add(mesh);
  }));
  renderer.shadowMap.needsUpdate=true;
 })();
 return {group,ready,dispose:()=>{alive=false;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.remove(group);}};
}
