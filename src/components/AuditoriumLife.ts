import * as T from 'three';
import {screen,smooth} from '../data/tour';
export function auditoriumLife(scene:T.Scene){
 const group=new T.Group();group.name='Audiencia_y_portada';scene.add(group);
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=870;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle='#142f38';ctx.fillRect(0,0,2048,870);ctx.fillStyle='#edaa56';ctx.fillRect(112,110,72,8);
 ctx.fillStyle='#d4dddd';ctx.font='500 29px sans-serif';ctx.fillText('UNIVERSIDAD DE SANTIAGO DE CHILE',112,190);
 ctx.fillStyle='#f1f3ed';ctx.font='600 105px sans-serif';ctx.fillText('Tu siguiente',112,350);ctx.fillText('dimensión.',112,475);
 ctx.fillStyle='#edaa56';ctx.font='400 38px sans-serif';ctx.fillText('Ingeniería Comercial en Economía',112,615);
 ctx.fillStyle='#c3ced0';ctx.font='400 28px sans-serif';ctx.fillText('PROSECUCIÓN DE ESTUDIOS  /  FAE',112,748);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const mat=new T.MeshBasicMaterial({map:texture,toneMapped:false});const board=new T.Mesh(new T.PlaneGeometry(10.44,4.44),mat);board.position.set(...screen);group.add(board);
 for(const z of [-10,-17,-24]){const l=new T.PointLight('#ffe5bd',95,15,2);l.position.set(6.5,-.2,z);group.add(l);}
 const wash=new T.HemisphereLight('#d8e2e5','#776951',0);group.add(wash);
 return {group,update:(p:number)=>{wash.intensity=.45*smooth(.49,.55,p);},dispose:()=>{texture.dispose();mat.dispose();}};
}
