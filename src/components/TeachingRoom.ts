import * as THREE from 'three';
import {smooth} from '../data/journey';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {PhotoMaterials} from './PhotoMaterials';
const boardCenter={x:4.5,y:25.9,z:-13.76};
export function createTeachingRoom(scene:THREE.Scene,photos?:PhotoMaterials){
 const stage=new THREE.Group();stage.name='Aula_recorrido_nivel_6';
 const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[],textures:THREE.Texture[]=[];
 const track=<T extends THREE.BufferGeometry>(g:T)=>{geometries.push(g);return g;};
 const mat=(color:string,roughness=.75,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;};
 const concrete=mat('#c2b8ac'),stone=mat('#dfd6c7'),edge=mat('#879194'),dark=mat('#23353d',.46,.45),wood=mat('#8e6446'),blue=mat('#195a9c',.44),black=mat('#252a2e',.6),silver=mat('#969d9d',.33,.65),wall=mat('#a2a6a5'),floor=mat('#c5c4bd'),paper=mat('#eceae2'),white=mat('#eceee5'),green=mat('#335443'),soil=mat('#544c40');
 const glass=photos?photos.glazing('Vidrios del aula','classroom'):mat('#d8e3e6',.09,0);
 if(!photos){glass.transparent=true;glass.opacity=.25;glass.depthWrite=false;}materials.push(glass);
 // Material UVs use world metres; instanced walls never stretch an entire photo over a floor.
 const textureLoader=new THREE.TextureLoader();
 const pbr=(m:THREE.MeshStandardMaterial,name:string,metres:number,colorMap:boolean)=>{
  const texture=(kind:string,color=false)=>{const t=textureLoader.load(`/materials/${name}_${kind}_1k.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;};
  if(colorMap)m.map=texture('diff',true);m.normalMap=texture('nor_gl');m.roughnessMap=texture('rough');m.normalScale.set(.19,.19);
  m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 surfacePosition=vec4(transformed,1.0);vec3 surfaceNormal=objectNormal;
   #ifdef USE_INSTANCING
    surfacePosition=instanceMatrix*surfacePosition;surfaceNormal=mat3(instanceMatrix)*surfaceNormal;
   #endif
   vec3 meters=(modelMatrix*surfacePosition).xyz;vec3 axis=abs(normalize(mat3(modelMatrix)*surfaceNormal));
   vec2 surfaceUv=(axis.y>.5?meters.xz:(axis.x>.5?meters.zy:meters.xy))/${metres.toFixed(3)};
   #ifdef USE_MAP
    vMapUv=surfaceUv;
   #endif
   #ifdef USE_NORMALMAP
    vNormalMapUv=surfaceUv;
   #endif
   #ifdef USE_ROUGHNESSMAP
    vRoughnessMapUv=surfaceUv;
   #endif`);};m.customProgramCacheKey=()=>`world-surface-${name}-${metres}`;
 };
 if(photos){photos.apply(concrete,'concrete',{size:[1.05,1.45],color:'#b9b8b1',relief:.003});photos.apply(wall,'concrete',{color:'#a9afae',contrast:.35,relief:.001});photos.apply(floor,'stone',{size:[.6,.9],color:'#c9c8bd',grout:1});photos.apply(stone,'stone',{size:[.6,.9],grout:1});}
 else{pbr(concrete,'concrete_wall_009',1.805,true);pbr(floor,'floor_tiles_08',1.5,false);pbr(stone,'floor_tiles_08',1.5,true);}
 const lit=new THREE.MeshStandardMaterial({color:'#ffe3b3',emissive:'#ffe7c3',emissiveIntensity:2.2,roughness:.4});materials.push(lit);
 const windowDark=mat('#263c47',.25,.45);windowDark.emissive.set('#cfb37b');windowDark.emissiveIntensity=.12;
 const unitBox=track(new THREE.BoxGeometry(1,1,1)),unitSphere=track(new THREE.SphereGeometry(1,20,14)),unitTube=track(new THREE.CylinderGeometry(1,1,1,12));
 const softBox=track(new RoundedBoxGeometry(1,1,1,2,.055));
 const hairCap=track(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.58));
 const batches=new Map<string,{geo:THREE.BufferGeometry;mat:THREE.Material;matrices:THREE.Matrix4[];shadow:boolean}>();
 const dummy=new THREE.Object3D();
 const add=(geo:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,rx=0,ry=0,rz=0,shadow=true)=>{
  const key=geo.uuid+material.uuid+(shadow?'s':'n');let b=batches.get(key);if(!b){b={geo,mat:material,matrices:[],shadow};batches.set(key,b);}
  dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();b.matrices.push(dummy.matrix.clone());
 };
 const box=(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,ry=0,shadow=true)=>add((m===blue||m===wood||m===black)&&Math.max(w,h,d)<2.1?softBox:unitBox,m,x,y,z,w,h,d,0,ry,0,shadow);
 const sphere=(m:THREE.Material,x:number,y:number,z:number,rx:number,ry:number,rz:number)=>add(unitSphere,m,x,y,z,rx,ry,rz);
 const tube=(m:THREE.Material,a:THREE.Vector3,b:THREE.Vector3,r:number)=>{
  const mid=a.clone().add(b).multiplyScalar(.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());
  const e=new THREE.Euler().setFromQuaternion(q);add(unitTube,m,mid.x,mid.y,mid.z,r,a.distanceTo(b),r,e.x,e.y,e.z);
 };
 const text=(value:string,w:number,h:number,size:number,color:string,bg:string|null=null)=>{
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d')!;
  if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.font=`500 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  value.split('\n').forEach((line,i,lines)=>ctx.fillText(line,512,c.height/2+(i-(lines.length-1)/2)*size*1.5));
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.push(t);const m=new THREE.MeshBasicMaterial({map:t,transparent:!bg,depthWrite:false});materials.push(m);const mesh=new THREE.Mesh(track(new THREE.PlaneGeometry(w,h)),m);stage.add(mesh);return mesh;
 };
 // Aula: scale, gray slats, blue writing chairs and windows follow the institutional film.
 box(floor,4.55,24.035,-8.5,10.6,.07,10.9);box(white,4.55,27.88,-8.5,10.6,.14,10.9);
 box(wall,-.8,26,-8.5,.13,4,11);// Front teaching wall.
 box(wall,4.55,26,-14,10.6,4,.18);
 for(let z=-13.8;z<-3;z+=.19)box(edge,.018,26,z,.022,3.8,.032,0,false);
 for(let z=-13.8;z<-3.1;z+=2.65){
  const start=z-.025,end=Math.min(z+2.525,-3.08),span=end-start,center=(start+end)/2;
  box(concrete,9.9,24.48,center,.2,.9,span);box(concrete,9.9,27.67,center,.2,.35,span);box(dark,9.85,26,z,.15,3.5,.055);
  box(glass,9.88,26.02,center,.04,2.18,span);
  box(stone,9.81,27.3,center,.06,.13,Math.max(.02,span-.03));const blind=mat('#d6d6cc',.9);blind.transparent=true;blind.opacity=.34;blind.depthWrite=false;box(blind,9.825,26.63,center,.013,1.26,Math.max(.02,span-.1),0,false);
  for(let i=0;i<7;i++)box(edge,9.804,26.08+i*.18,center,.009,.009,Math.max(.02,span-.1),0,false);
 }
 for(let z=-4;z>-14;z-=2)box(edge,4.5,24.078,z,8.9,.008,.012,0,false);
 for(let x=1.5;x<9;x+=1.5)box(edge,x,24.078,-8.5,.012,.008,10.9,0,false);
 for(const x of [2.2,6.5])for(const z of [-5.8,-10.8]){box(dark,x,27.76,z,1.95,.1,.36);box(lit,x,27.69,z,1.8,.02,.26,0,false);}
 const classroomLight=new THREE.PointLight('#f4f1e9',35,14,2);classroomLight.position.set(4.5,27.2,-8);stage.add(classroomLight);
 const galleryLight=new THREE.PointLight('#f3f2eb',24,30,2);galleryLight.position.set(-5,27.1,-1.5);stage.add(galleryLight);
 // Chairs use a curved blue shell, tubular legs, an individual black writing tablet.
 const chair=(x:number,z:number)=>{
  box(blue,x,24.49,z,.49,.09,.46);box(blue,x,24.85,z+.21,.48,.6,.06);
  for(const dx of [-.21,.21])for(const dz of [-.17,.19])tube(black,new THREE.Vector3(x+dx,24.46,z+dz),new THREE.Vector3(x+dx*1.12,24.08,z+dz*1.16),.016);
  tube(black,new THREE.Vector3(x+.24,24.38,z+.2),new THREE.Vector3(x+.26,24.82,z-.31),.015);
  box(black,x+.16,24.83,z-.34,.51,.035,.39);
  box(paper,x+.12,24.857,z-.34,.23,.008,.3,-.06,false);
  box(dark,x+.20,24.867,z-.37,.012,.008,.17,.14,false);
 };
 // Articulated anatomy in seated poses, with separate clothes, skin, hair and hands.
 const skins=['#b37e59','#dbab83','#8d5a41','#c4926f'];const shirts=['#e4e1d8','#344b60','#a1b0b5','#866959','#526d68','#767d96'];
 const skinMats=skins.map(c=>mat(c,.82)),shirtMats=shirts.map(c=>mat(c,.92)),pants=[mat('#344048'),mat('#2c4059'),mat('#62645e')],hairs=[mat('#28231f'),mat('#4c3528'),mat('#756146')];
 const eye=mat('#24252a');
 const person=(x:number,z:number,i:number,standing=false)=>{
  const base=24.09,skin=skinMats[i%4],shirt=standing?white:shirtMats[i%6],trousers=pants[i%3],hair=hairs[i%3];
  const hip=standing?base+.88:base+.49,shoulder=hip+.46,head=shoulder+.24;
  // Rounded torso and pelvis retain human proportions when seen from either side.
  sphere(trousers,x,hip,z,.205,.15,.14);sphere(shirt,x,hip+.24,z,.235,.285,.14);
  sphere(skin,x,shoulder+.09,z,.06,.1,.06);
  sphere(skin,x,head+.045,z,.107,.145,.107);add(hairCap,hair,x,head+.076,z+.007,.111,.14,.11);
  if(i%3===0&&!standing)sphere(hair,x,head-.07,z+.12,.104,.14,.06);
  sphere(skin,x,head+.022,z-.106,.029,.043,.028);
  for(const side of [-1,1]){sphere(skin,x+side*.105,head+.025,z,.022,.04,.027);sphere(eye,x+side*.039,head+.051,z-.098,.011,.01,.009);}
  for(const side of [-1,1]){
   const sx=x+side*.11,kneeZ=standing?z-.01:z-.36,kneeY=standing?base+.46:base+.47;
   tube(trousers,new THREE.Vector3(sx,hip-.015,z),new THREE.Vector3(sx,kneeY,kneeZ),.085);sphere(trousers,sx,kneeY,kneeZ,.087,.085,.085);
   tube(trousers,new THREE.Vector3(sx,kneeY,kneeZ),new THREE.Vector3(sx,base+.11,kneeZ+.045),.063);sphere(black,sx,base+.064,kneeZ-.05,.085,.06,.145);
   const elbow=new THREE.Vector3(x+side*.27,standing?hip+.15:hip+.19,standing?z-.01:z-.18),start=new THREE.Vector3(x+side*.215,shoulder-.03,z),hand=new THREE.Vector3(x+side*.19,standing?hip-.03:base+.78,standing?z-.1:z-.34);
   tube(shirt,start,elbow,.071);sphere(shirt,elbow.x,elbow.y,elbow.z,.071,.07,.07);tube(skin,elbow,hand,.045);sphere(skin,hand.x,hand.y,hand.z,.047,.033,.062);
  }
  if(standing){box(dark,x,hip+.045,z-.134,.39,.026,.027);for(let j=0;j<4;j++)sphere(silver,x,hip+.16+j*.085,z-.142,.009,.009,.005);}
 };
 let student=0;for(const z of [-5.8,-7.7,-9.6])for(const x of [1.2,2.65,4.1,5.55]){chair(x,z);person(x,z,student++);if(student%3===0)box(wood,x-.36,24.28,z+.08,.19,.4,.28,.14);}
 const beforeTeacher=new Map([...batches.entries()].map(([k,b])=>[k,b.matrices.length]));
 person(2.2,-12,4,true);
 const teacherTurn=new THREE.Matrix4().makeTranslation(2.2,0,-12).multiply(new THREE.Matrix4().makeRotationY(Math.PI)).multiply(new THREE.Matrix4().makeTranslation(-2.2,0,12));
 for(const [key,b] of batches)for(let i=beforeTeacher.get(key)||0;i<b.matrices.length;i++)b.matrices[i].premultiply(teacherTurn);
 box(wood,1.15,24.88,-12.8,1.7,.075,.7);for(const x of [.4,1.9])box(dark,x,24.49,-12.8,.06,.75,.56);
 box(dark,1.15,24.94,-12.7,.52,.025,.34);box(dark,1.15,25.12,-12.89,.52,.36,.028);
 box(silver,boardCenter.x,boardCenter.y,boardCenter.z-.04,5.56,2.56,.1);
 const boardWhite=new THREE.MeshBasicMaterial({color:'#f4f2eb',toneMapped:false});materials.push(boardWhite);box(boardWhite,boardCenter.x,boardCenter.y,boardCenter.z,5.4,2.4,.025);box(silver,boardCenter.x,boardCenter.y-1.29,boardCenter.z+.14,5.5,.055,.35);
 box(blue,6.5,24.68,-13.59,.16,.04,.05);box(black,6.3,24.68,-13.59,.15,.04,.05);
 const boardInk=text('Economía\nUna nueva manera de mirar',4.2,1.2,60,'#345663');boardInk.position.set(4.5,25.9,boardCenter.z+.022);

 // The room front is split around the actual door: x=-8.041 in model coordinates.
 box(glass,3.88,25.75,-3,9.25,3.4,.045);box(glass,9.86,25.75,-3,.12,3.4,.045);
 box(concrete,9.18,27.65,-3,1.4,.7,.15);
 for(const x of [8.50,9.83])box(dark,x,25.48,-3,.07,2.96,.17);
 box(dark,9.17,26.96,-3,1.4,.07,.17);
 box(blue,9.88,25.4,-3.62,.065,2.8,1.22);
 for(let x=-.7;x<8.6;x+=1.16)box(dark,x,25.77,-3,.045,3.44,.085);
 box(dark,3.9,26.97,-3,9.25,.045,.085);
 const label=text('ECONOMÍA',1.15,.32,112,'#f2f2e9','#18343f');label.position.set(7.8,26.16,-2.96);

 for(const b of batches.values()){const inst=new THREE.InstancedMesh(b.geo,b.mat,b.matrices.length);b.matrices.forEach((m,i)=>inst.setMatrixAt(i,m));inst.castShadow=b.shadow&&b.mat!==glass;inst.receiveShadow=true;inst.computeBoundingSphere();stage.add(inst);}
 materials.forEach(m=>m.userData.reflectionZone='classroom');
 stage.rotation.y=Math.PI/2;stage.scale.set(1,1,.72);stage.position.set(-5.881,-3.2,-3);scene.add(stage);
 return {group:stage,update:(time:number,p:number)=>{(boardInk.material as THREE.MeshBasicMaterial).opacity=1-smooth(.605,.669,p);},dispose:()=>{geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.remove(stage);}};
}
