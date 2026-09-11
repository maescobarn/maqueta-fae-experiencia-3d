import {assetUrl} from '../assetUrl';
'use client';
import {useEffect,useRef,type RefObject} from 'react';
import * as THREE from 'three';
import {unzlibSync} from 'three/addons/libs/fflate.module.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createTeachingRoom} from './TeachingRoom';
import {PhotoMaterials} from './PhotoMaterials';
import {createTourEnvironment} from './ImmersiveEnvironment';
import {pose,smooth} from '../data/tour';
import {scannedPeople} from './ScannedPeople';
import {auditoriumLife} from './AuditoriumLife';
type Props={motion:RefObject<{p:number}>;onReady:(available:boolean)=>void;onProgress:(message:string)=>void};
export default function ImmersiveScene({motion,onReady,onProgress}:Props){
 const host=useRef<HTMLDivElement>(null),callback=useRef(onReady),report=useRef(onProgress);useEffect(()=>{callback.current=onReady;report.current=onProgress;},[onReady,onProgress]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const mobile=matchMedia('(pointer: coarse)').matches||window.innerWidth<760||/iPhone|iPad|iPod/.test(navigator.userAgent);
  el.dataset.quality=mobile?'mobile':'desktop';
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:mobile?'default':'high-performance'});}catch{callback.current(false);return;}

  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.05;renderer.transmissionResolutionScale=mobile?.5:.8;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.domElement.setAttribute('aria-label','Recorrido tridimensional por la maqueta FAE USACH');el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.035,500);
  const photos=new PhotoMaterials(mobile);
  let environment:ReturnType<typeof createTourEnvironment>;
  try{environment=createTourEnvironment(scene,renderer,photos,mobile);}catch{photos.dispose();renderer.dispose();renderer.domElement.remove();callback.current(false);return;}

  const target=mobile?null:new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
  const composer=target?new EffectComposer(renderer,target):null,ao=composer?new GTAOPass(scene,camera,1,1):null;
  if(composer&&ao){
   composer.addPass(new RenderPass(scene,camera));ao.updateGtaoMaterial({radius:1.1,thickness:.45,distanceExponent:2,samples:12});ao.blendIntensity=.85;
   const renderAO=ao.render.bind(ao);
   ao.render=(...args:Parameters<typeof ao.render>)=>{
    const objects=environment.hiddenForAO,visible=objects.map(o=>o.visible);objects.forEach(o=>o.visible=false);
    try{renderAO(...args);}finally{objects.forEach((o,i)=>o.visible=visible[i]);}
   };
   composer.addPass(ao);composer.addPass(new OutputPass());
  }
  let alive=true,raf=0,width=1,height=1,inView=true,ready=false,contextLost=false,lastTime=0,lastP=-1;
  let people:ReturnType<typeof scannedPeople>|undefined;let teaching:ReturnType<typeof createTeachingRoom>|undefined;let audience:ReturnType<typeof auditoriumLife>|undefined;
  const fail=()=>{if(alive){ready=false;el.dataset.error='render';callback.current(false);}};
  renderer.debug.onShaderError=()=>fail();
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),40000);
  report.current('Cargando edificio 3D…');
  void (async()=>{
   const response=await fetch(assetUrl('/models/fae-v4.glb.zlib'),{signal:controller.signal});if(!response.ok)throw new Error('Model download');
   const reader=response.body?.getReader();const total=Number(response.headers.get('content-length'));let received=0;const chunks:Uint8Array[]=[];
   if(!reader)throw new Error('Model stream');
   while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.length;if(alive&&total){const percent=Math.min(100,Math.round(received/total*100));el.dataset.loaded=String(percent);report.current(`Cargando edificio 3D · ${percent}%`);}}
   clearTimeout(timeout);if(!alive)return;
   const packed=new Uint8Array(received);let offset=0;for(const chunk of chunks){packed.set(chunk,offset);offset+=chunk.length;}
   const raw=unzlibSync(packed);report.current('Preparando materiales y luz…');
   const gltf=await new GLTFLoader().parseAsync(raw.buffer as ArrayBuffer,assetUrl('/models/'));

   if(!alive){gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});return;}
   const model=gltf.scene;model.traverse(o=>{
    if(o.name==='basement')o.visible=true;
    if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;
     if((Array.isArray(o.material)?o.material:[o.material]).some(m=>m.name==='Espejo de agua'))o.visible=false;
    }
   });
   photos.tuneModel(model);
   model.traverse(o=>{if(o instanceof THREE.Mesh&&o.parent?.name==='basement'){for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m instanceof THREE.MeshStandardMaterial){
    if(/Hormigón/.test(m.name))m.color.set('#535c60');
    if(/Canto de losas/.test(m.name))m.color.set('#697477');
    if(/Tableros/.test(m.name))m.color.set('#805337');
    if(/Asientos/.test(m.name))m.color.set('#234656');
   }}});scene.add(model);teaching=createTeachingRoom(scene,photos);audience=auditoriumLife(scene);
   await photos.ready();if(!alive)return;
   // A missing decorative photograph must not make the complete tour unavailable.
   if(photos.failures.length){el.dataset.textureWarnings=String(photos.failures.length);for(const material of photos.materials){if(material.map&&!material.map.image){material.map=null;material.onBeforeCompile=()=>{};material.needsUpdate=true;}}}
   environment.capture();ready=true;lastP=-1;
   // Present the building first; keep all original people and poses, loading in batches.
   people=scannedPeople(scene,renderer,mobile);el.dataset.peopleLoading='true';
   void people.ready.then(()=>{if(alive){el.dataset.peopleLoading='false';lastP=-1;}}).catch(()=>{if(alive)el.dataset.peopleLoading='partial';});
  })().catch(fail).finally(()=>clearTimeout(timeout));
  const cursor=new THREE.Vector2(),look=new THREE.Vector2();
  const pointer=(e:PointerEvent)=>{if(e.pointerType==='mouse')cursor.set((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);};window.addEventListener('pointermove',pointer,{passive:true});
  const resize=()=>{const nextWidth=el.clientWidth,nextHeight=el.clientHeight;if(!nextWidth||!nextHeight||(width===nextWidth&&height===nextHeight))return;width=nextWidth;height=nextHeight;renderer.setSize(width,height,false);composer?.setSize(width,height);camera.aspect=width/height;lastP=-1;};
  const ro=new ResizeObserver(resize);ro.observe(el);resize();const io=new IntersectionObserver(([e])=>{inView=e.isIntersecting;});io.observe(el);
  const lost=(e:Event)=>{e.preventDefault();contextLost=true;fail();};renderer.domElement.addEventListener('webglcontextlost',lost);
  let announced=false;let costSum=0,costFrames=0;
  const render=(time:number)=>{raf=requestAnimationFrame(render);if(!ready||!alive||document.hidden||!inView||contextLost||time-lastTime<(mobile?32:16))return;const p=motion.current.p;if(p>=.81&&p===lastP)return;const dt=Math.min((time-lastTime)/1000,.08);lastTime=time;lastP=p;
   const view=pose(p,width/height);camera.position.set(...view.position);camera.fov=view.fov;camera.updateProjectionMatrix();camera.lookAt(...view.target);look.lerp(cursor,1-Math.exp(-dt*3));const sway=(1-smooth(.59,.63,p))*.006;camera.rotateY(-look.x*sway);camera.rotateX(-look.y*sway*.4);
   teaching?.update(time*.001,0);audience?.update(p);environment.update(p);renderer.toneMappingExposure=.87+smooth(.16,.23,p)*.07;
   const frameStart=performance.now();try{if(composer){ao!.enabled=p>.16&&p<.79;composer.render(dt);}else renderer.render(scene,camera);}catch{fail();return;}if(!ready)return;if(!announced){callback.current(true);announced=true;}el.dataset.stage=view.label;el.dataset.progress=p.toFixed(4);el.dataset.materials='original-photographs';el.dataset.people='V4: 144 seated scans / 6 identities / 18 poses';el.dataset.drawcalls=String(renderer.info.render.calls);el.dataset.triangles=String(renderer.info.render.triangles);costSum+=performance.now()-frameStart;costFrames++;if(costFrames===30){el.dataset.renderMs=(costSum/costFrames).toFixed(1);costSum=0;costFrames=0;}
  };raf=requestAnimationFrame(render);
  return()=>{alive=false;controller.abort();clearTimeout(timeout);cancelAnimationFrame(raf);ro.disconnect();io.disconnect();window.removeEventListener('pointermove',pointer);renderer.domElement.removeEventListener('webglcontextlost',lost);const geos=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());teaching?.dispose();audience?.dispose();people?.dispose();photos.dispose();environment.dispose();composer?.passes.forEach(pass=>pass.dispose());composer?.dispose();renderer.dispose();renderer.domElement.remove();};
 },[motion]);
 return <div className="campus-webgl" ref={host} aria-hidden="true"/>;
}
