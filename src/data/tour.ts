export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(a:number,b:number,p:number)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
export type V=[number,number,number];
type Key={p:number,pos:V,yaw:number,pitch:number,fov:number,label:string};
const key=(p:number,pos:V,at:V,label:string,fov=65):Key=>{const d=at.map((x,i)=>x-pos[i]);return {p,pos,yaw:Math.atan2(d[0],-d[2]),pitch:Math.atan2(d[1],Math.hypot(d[0],d[2])),fov,label};};
export const screen:V=[6.5084,-3.83,-28.68];
export const keys:Key[]=[
 key(0,[68,32,91],[-1,22,-10],'La facultad',47),
 key(.07,[3,15,48],[-2,10,-10],'La llegada',51),
 key(.12,[-3.15,3.05,9.5],[-3.15,3.05,-6],'El acceso'),
 key(.15,[-3.15,3.05,5.8],[-6.6,3.05,-10.8],'Entramos'),
 key(.21,[-6.6,3.05,-16.2],[5.5,8,-18],'El hall',73),
 key(.25,[-6.6,3.05,-16.2],[5.5,32,-18],'Mira hacia arriba',76),
 key(.29,[-6.6,3.05,-16.2],[5.5,9,-18],'El hall · 360°',76),
 key(.40,[-6.6,3.05,-16.2],[5.5,9,-18],'El hall · 360°',76),
 key(.435,[-6.6,3.05,-16.2],[15,10,-19],'Las escaleras',73),
 key(.455,[-6.6,3.05,-15.5],[-6.6,1,-7.2],'Hacia el auditorio',66),
 key(.505,[-6.6,-.7,-7.2],[-3.72,-.7,-8.3],'Nivel auditorio',66),
 key(.525,[-4.7,-.7,-8.3],[-1.8,-.7,-8.3],'El umbral',67),
 key(.54,[-.6,-.7,-8.3],[-.6,-.7,-6.6],'El auditorio',70),
 key(.555,[-.6,-.7,-6.6],[6.5,-1,-10],'El auditorio',70),
 key(.585,[6.5084,-.7,-6.6],screen,'Tu próximo capítulo',66),
 key(.64,[6.5084,-4.87,-23.4],screen,'Tu próximo capítulo',66),
 key(.685,[6.5084,-4.87,-23.4],[6.5084,-1.3,-7],'Tu futura comunidad',73),
 key(.715,[6.5084,-4.87,-23.4],[6.5084,-1.3,-7],'Tu futura comunidad',73),
 key(.755,[6.5084,-3.83,-23.4],screen,'Todo comienza aquí',62),
 key(.81,[6.5084,-3.83,-28.40],screen,'Una nueva perspectiva',58),
 key(1,[6.5084,-3.83,-28.40],screen,'Una nueva perspectiva',58),
];
export function pose(p:number,aspect:number){
 let a=keys[0],b=keys[1];for(let i=0;i<keys.length-1;i++){a=keys[i];b=keys[i+1];if(p<=b.p)break;}
 const t=smooth(a.p,b.p,p),n=clamp((1.2-aspect)/.7),pos=a.pos.map((x,i)=>x+(b.pos[i]-x)*t) as V;
 pos[2]+=40*n*(1-smooth(0,.12,p));
 let delta=b.yaw-a.yaw;while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;
 let yaw=a.yaw+delta*t,pitch=a.pitch+(b.pitch-a.pitch)*t;
 if(p>=.29&&p<=.40){yaw=keys[6].yaw+Math.PI*2*smooth(.29,.40,p);pitch=keys[6].pitch;}
 return {position:pos,target:[pos[0]+Math.sin(yaw)*Math.cos(pitch)*10,pos[1]+Math.sin(pitch)*10,pos[2]-Math.cos(yaw)*Math.cos(pitch)*10] as V,fov:a.fov+(b.fov-a.fov)*t+n*8,label:p===0?a.label:b.label,yaw,pitch};
}
export const stops=[{p:0,label:'Exterior'},{p:.21,label:'Hall'},{p:.29,label:'Giro 360°'},{p:.435,label:'Escaleras'},{p:.585,label:'Auditorio'},{p:.685,label:'Audiencia'},{p:.755,label:'Pantalla'}];
