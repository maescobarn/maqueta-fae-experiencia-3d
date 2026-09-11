/** A continuous spatial tour through the supplied FAE maquette, then into its classroom board. */
export const LESSON_START=.68;
export const LESSON_SPAN=.06;
export const lessonStops=[.708,.768,.828,.888,.948];
export const boardCenter={x:-15.7882,y:22.7,z:-7.5};
export const PHASE={ascendStart:.338,window:.257,inside:.275,classEnd:.56,turnEnd:.625,portalEnd:.674};
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(a:number,b:number,p:number)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export type Point={x:number;y:number;z:number};
export type Frame={p:number;position:Point;target:Point;fov:number;phase:string};
const point=(x:number,y:number,z:number):Point=>({x,y,z});
const mix=(a:Point,b:Point,t:number)=>point(lerp(a.x,b.x,t),lerp(a.y,b.y,t),lerp(a.z,b.z,t));
export const routeFrames:Frame[]=[
 {p:.205,position:point(3,29,108),target:point(3,21,-12),fov:43,phase:'exterior'},
 {p:.235,position:point(-3.15,8,34),target:point(-3.15,2.9,5.8),fov:51,phase:'approach'},
 {p:.257,position:point(-3.15,3.05,9.5),target:point(-3.15,3.05,-6),fov:62,phase:'entry'},
 {p:.275,position:point(-3.15,3.05,5.8),target:point(-6.6,3.05,-10.8),fov:66,phase:'entry'},
 {p:.298,position:point(-6.6,3.05,-10.8),target:point(-6.6,3.1,-17),fov:68,phase:'hall'},
 {p:.315,position:point(-6.6,3.05,-16.2),target:point(5.5,8,-18),fov:70,phase:'atrium'},
 {p:.338,position:point(2.5,5.8,-17),target:point(12,13,-18),fov:72,phase:'atrium'},
 {p:.37,position:point(2.5,13.6,-17),target:point(12,20,-18),fov:70,phase:'ascent'},
 {p:.408,position:point(2.5,22.45,-17),target:point(-6.6,22.45,-16.2),fov:66,phase:'ascent'},
 {p:.435,position:point(-6.6,22.45,-16.2),target:point(-8.6,22.45,-12.19),fov:64,phase:'gallery'},
 {p:.46,position:point(-7.13,22.45,-12.19),target:point(-10.8,22.2,-9.2),fov:62,phase:'door'},
 {p:.48,position:point(-9,22.45,-12.19),target:point(-12.8,22.05,-6),fov:62,phase:'class'},
 {p:.51,position:point(-9.2,22.45,-10.7),target:point(-12.8,22.05,-6),fov:60,phase:'class'},
 {p:.56,position:point(-14.6,22.45,-10.7),target:point(-12.8,22.05,-6),fov:58,phase:'class'},
 {p:.59,position:point(-14.6,22.45,-10.7),target:boardCenter,fov:56,phase:'turn'},
 {p:.625,position:point(-14.6,22.7,-7.5),target:boardCenter,fov:54,phase:'turn'},
 {p:PHASE.portalEnd,position:point(boardCenter.x+.26,boardCenter.y,boardCenter.z),target:boardCenter,fov:52,phase:'board'},
];
export const tourStops=[{p:0,label:'Campus'},{p:.335,label:'Atrio'},{p:.405,label:'Ascenso'},{p:.53,label:'Aula'},{p:.708,label:'Pizarra'}];
export function getJourneyPose(p:number,aspect:number){
 p=clamp(p);const narrow=clamp((1.15-aspect)/.6);
 if(p<.035){const t=smooth(0,.035,p);return {position:mix(point(78+narrow*35,36+narrow*12,110+narrow*52),point(3,34,108+narrow*55),t),target:mix(point(-13+narrow*16,23,-9),point(3,23,-12),t),fov:46+6*narrow,phase:'exterior'};}
 if(p<.205){const t=smooth(.035,.205,p),a=t*Math.PI*2,r=120+narrow*55;return {position:point(3+Math.sin(a)*r,34+Math.sin(a)*6-5*t,-12+Math.cos(a)*r),target:point(3,23-2*t,-12),fov:46-3*t+6*narrow,phase:'orbit'};}
 let a=routeFrames[0],b=a;
 for(let i=0;i<routeFrames.length-1;i++){a=routeFrames[i];b=routeFrames[i+1];if(p<=b.p)break;}
 const t=smooth(a.p,b.p,p);const position=mix(a.position,b.position,t),target=mix(a.target,b.target,t);
 // The exterior stays framed on portrait devices; inside, retain the physical path.
 position.z+=55*narrow*(1-smooth(.205,.235,p));
 return {position,target,fov:lerp(a.fov,b.fov,t)+narrow*(p<.235?6:10),phase:p>=PHASE.portalEnd?'board':b.phase};
}
