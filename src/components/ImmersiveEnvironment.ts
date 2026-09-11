import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type {PhotoMaterials} from './PhotoMaterials';

export function createTourEnvironment(scene:THREE.Scene,renderer:THREE.WebGLRenderer,photos:PhotoMaterials,mobile:boolean){
 scene.background=null;scene.fog=new THREE.FogExp2('#bdcbd1',.0015);
 const sky=new Sky();sky.name='Luz_diurna';sky.scale.setScalar(1500);
 const skyUniforms=sky.material.uniforms;
 skyUniforms.turbidity.value=3.2;skyUniforms.rayleigh.value=1.4;
 skyUniforms.mieCoefficient.value=.003;skyUniforms.mieDirectionalG.value=.76;
 skyUniforms.sunPosition.value.set(-45,60,55).normalize();scene.add(sky);
 const pmrem=new THREE.PMREMGenerator(renderer),skyScene=new THREE.Scene();skyScene.add(sky.clone());
 const exterior=pmrem.fromScene(skyScene,.025,.1,2000);
 scene.environment=exterior.texture;scene.environmentIntensity=.48;
 const hemi=new THREE.HemisphereLight('#d3e2ed','#817669',.38);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff3dc',2.15);sun.position.set(-45,75,40);sun.target.position.set(0,15,-15);
 sun.castShadow=true;sun.shadow.mapSize.set(mobile?2048:4096,mobile?2048:4096);
 Object.assign(sun.shadow.camera,{left:-62,right:62,top:70,bottom:-65,near:1,far:190});sun.shadow.normalBias=.015;sun.shadow.bias=-.00005;scene.add(sun,sun.target);
 const bounce=new THREE.DirectionalLight('#d2e2e7',.18);bounce.position.set(35,35,-45);scene.add(bounce);
 RectAreaLightUniformsLib.init();
 // Broad daylight transmitted by the membrane, rather than a bright point in the void.
 const atriumLight=new THREE.RectAreaLight('#fff5e6',1.45,18,23);
 atriumLight.position.set(5.5,26.7,-19.4);atriumLight.lookAt(5.5,1.3,-19.4);scene.add(atriumLight);
 const windowLight=new THREE.SpotLight('#f4f7f7',130,22,1.12,.65,2);
 windowLight.position.set(-7.7,24.0,-8.2);windowLight.target.position.set(-13,20.85,-7.5);
 windowLight.castShadow=true;windowLight.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
 windowLight.shadow.normalBias=.006;windowLight.shadow.bias=-.000025;windowLight.shadow.camera.near=.12;scene.add(windowLight,windowLight.target);
 const groundMat=photos.apply(new THREE.MeshStandardMaterial(),'stone',{size:[.8,1.2],grout:1,color:'#a4aaa5',contrast:.45});
 const ground=new THREE.Mesh(new THREE.ShapeGeometry((()=>{const s=new THREE.Shape();s.moveTo(-450,-450);s.lineTo(450,-450);s.lineTo(450,450);s.lineTo(-450,450);s.closePath();const h=new THREE.Path();h.moveTo(-23,-12);h.lineTo(-23,49);h.lineTo(31,49);h.lineTo(31,-12);h.closePath();s.holes.push(h);return s;})()),groundMat);ground.name='Suelo_continuo';ground.rotation.x=-Math.PI/2;
 ground.position.y=-.145;ground.receiveShadow=true;scene.add(ground);
 const shape=new THREE.Shape();
 for(let i=0;i<100;i++){
  const a=i/100*Math.PI*2,r=1+.2*Math.cos(3*a)+.09*Math.sin(5*a),x=-4+11*r*Math.cos(a)*.95,z=29+7*r*Math.sin(a)*.94;
  if(i===0)shape.moveTo(x,-z);else shape.lineTo(x,-z);
 }shape.closePath();
 const water=new Reflector(new THREE.ShapeGeometry(shape),{textureWidth:mobile?512:1024,textureHeight:mobile?512:1024,color:0x77888a,clipBias:.003,multisample:mobile?0:2});
 water.name='Reflejo_real_del_estanque';water.rotation.x=-Math.PI/2;water.position.y=.224;scene.add(water);
 const reflectionTargets:THREE.WebGLRenderTarget[]=[exterior];
 const hiddenForAO:THREE.Object3D[]=[sky,water];
 const capture=()=>{
  const transparent:THREE.Object3D[]=[];
  scene.traverse(o=>{if(o instanceof THREE.Mesh){const a=Array.isArray(o.material)?o.material:[o.material];if(a.some(m=>m.transparent||m instanceof THREE.MeshPhysicalMaterial&&m.transmission>0))transparent.push(o);}});
  hiddenForAO.push(...transparent);
  const visibility=transparent.map(o=>o.visible);transparent.forEach(o=>o.visible=false);water.visible=false;
  scene.updateMatrixWorld(true);
  const probe=(at:[number,number,number])=>{
   const cube=new THREE.WebGLCubeRenderTarget(mobile?128:256,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
   const camera=new THREE.CubeCamera(.12,250,cube);camera.position.set(...at);scene.add(camera);camera.update(renderer,scene);scene.remove(camera);
   const env=pmrem.fromCubemap(cube.texture);cube.dispose();reflectionTargets.push(env);return env.texture;
  };
  const atrium=probe([5.5,12.8,-19.4]),classroom=probe([-11.8,22.6,-8.3]);
  transparent.forEach((o,i)=>o.visible=visibility[i]);water.visible=true;
  for(const m of photos.glass){m.envMap=m.userData.reflectionZone==='classroom'?classroom:m.userData.reflectionZone==='interior'?atrium:exterior.texture;m.envMapIntensity=1.05;m.needsUpdate=true;}
  for(const m of photos.materials)if(!photos.glass.has(m as THREE.MeshPhysicalMaterial)&&m.userData.reflectionZone==='classroom'){m.envMap=classroom;m.envMapIntensity=.5;m.needsUpdate=true;}
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 };
 const update=(p:number)=>{water.visible=p<.14;if(scene.fog instanceof THREE.FogExp2)scene.fog.density=.0015*(1-Math.min(1,Math.max(0,(p-.10)/.06)));};
 const dispose=()=>{reflectionTargets.forEach(t=>t.dispose());pmrem.dispose();water.dispose();sun.shadow.dispose();windowLight.shadow.dispose();};
 return {capture,update,dispose,hiddenForAO};
}
