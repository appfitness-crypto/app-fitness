// Paso 7 (LEEME.md): cambia las manos del modelo (dedos cortos en punta) por la mano relajada de mano.py.
// Corta la piel en la muñeca, coloca la mano nueva siguiendo el eje del antebrazo (y su espejo en el otro lado)
// y le da a cada vértice nuevo los datos del vértice viejo más cercano (músculo, grupos), con su propia sombra.
// Uso: node manos.mjs antebrazo cuerpo-paso6.glb antebrazo.json && python3 mano.py antebrazo.json mano.json
//      && node manos.mjs cuerpo-paso6.glb mano.json cuerpo-paso7.glb
// Con PARTE=pie hace lo mismo con los pies (corte sobre el tobillo, pie de pie.py):
//      PARTE=pie node manos.mjs antebrazo cuerpo-paso7.glb pierna.json && python3 pie.py pierna.json pie.json
//      && PARTE=pie node manos.mjs cuerpo-paso7.glb pie.json cuerpo.glb
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, meshopt} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer';
import fs from 'fs';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const modo=process.argv[2]==='antebrazo', [ent,manoJson,sal]=modo?[process.argv[3],null,process.argv[4]]:process.argv.slice(2);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(ent);
const H=modo?null:JSON.parse(fs.readFileSync(manoJson,'utf8'));
const node=doc.getRoot().listNodes().find(n=>n.getName()==='piel');
const s=node.getScale()[0], t=node.getTranslation(), prim=node.getMesh().listPrimitives()[0];
const sem=prim.listSemantics(), n=prim.getAttribute('POSITION').getCount();
const leer=k=>{ const A=prim.getAttribute(k), c=A.getElementSize(), o=new Float32Array(n*c), e=new Array(c);
  for(let i=0;i<n;i++){ A.getElement(i,e); for(let q=0;q<c;q++) o[i*c+q]=e[q]; } return o; };
const D={}; for(const k of sem) D[k]=leer(k);
const P=D.POSITION, Wd=new Float32Array(n*3);
for(let i=0;i<n;i++) for(let q=0;q<3;q++) Wd[i*3+q]=P[i*3+q]*s+t[q];

const PIE=process.env.PARTE==='pie';
// zona de trabajo (lado x>0, o su espejo con |x|): antebrazo y mano, o pierna y pie
const zona=(x,y)=>PIE ? x>.02 && y<.32 : x>.19, RADIO=PIE ? .2 : .11;
// eje del antebrazo (lado x>0): centro de dos cortes horizontales sobre la muñeca
const centro=y=>{ let lo=[9,9],hi=[-9,-9]; for(let i=0;i<n;i++){ const x=Wd[i*3]; if(zona(x,Wd[i*3+1])&&Math.abs(Wd[i*3+1]-y)<.006){ const z=Wd[i*3+2];
  lo=[Math.min(lo[0],x),Math.min(lo[1],z)]; hi=[Math.max(hi[0],x),Math.max(hi[1],z)]; } } return [(lo[0]+hi[0])/2,y,(lo[1]+hi[1])/2]; };
const Y0=+(process.env.MUNECA||(PIE ? .15 : .875)), c0=centro(Y0+.075), O=centro(Y0);
const sub=(a,b)=>a.map((v,q)=>v-b[q]), dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], nor=a=>{const l=Math.hypot(...a);return a.map(v=>v/l);};
const cruz=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
let eu=nor(sub(O,c0)), ew=nor(sub([0,0,1],eu.map(v=>v*eu[2]))), ev=cruz(ew,eu); if(ev[0]<0) ev=ev.map(v=>-v);
// pie: eje vertical hacia el suelo, punta hacia delante con la punta un poco abierta hacia fuera
if(PIE){ const a=+(process.env.ABRE||.09); eu=[0,-1,0]; ew=[Math.sin(a),0,Math.cos(a)]; ev=[Math.cos(a),0,-Math.sin(a)]; }
console.log('muñeca',O.map(v=>v.toFixed(3)),'eje',eu.map(v=>v.toFixed(3)));
const local=(x,y,z)=>{ const d=[x-O[0],y-O[1],z-O[2]]; return [dot(d,eu),dot(d,ev),dot(d,ew)]; };

const CORTE=-.02, HUECO=.004;   // igual que en mano.py
if(process.argv[2]==='antebrazo'){
  // forma del antebrazo junto a la muñeca (coordenadas de la mano) para que mano.py la continúe sin escalón
  const Nn=D.NORMAL, V=[], NN=[];
  for(let i=0;i<n;i++){ if(!zona(Wd[i*3],Wd[i*3+1])) continue; const L=local(Wd[i*3],Wd[i*3+1],Wd[i*3+2]); if(L[0]<-.075||L[0]>(PIE ? .055 : .004)||Math.hypot(L[1],L[2])>.11) continue;
    V.push(...L); NN.push(dot([Nn[i*3],Nn[i*3+1],Nn[i*3+2]],eu),dot([Nn[i*3],Nn[i*3+1],Nn[i*3+2]],ev),dot([Nn[i*3],Nn[i*3+1],Nn[i*3+2]],ew)); }
  fs.writeFileSync(sal,JSON.stringify({V,N:NN})); console.log('antebrazo',V.length/3,'vértices →',sal); process.exit(0);
}
// 1) quitar la mano vieja: más allá del plano de la muñeca, cerca del eje (los dos lados por simetría)
const fuera=new Uint8Array(n), viejos=[];
for(let i=0;i<n;i++){ const x=Math.abs(Wd[i*3]); if(!zona(x,Wd[i*3+1])) continue;
  const [u,v,w]=local(x,Wd[i*3+1],Wd[i*3+2]); if(u>CORTE&&Math.hypot(v,w)<RADIO){ fuera[i]=1; if(Wd[i*3]>0) viejos.push(i); } }
const nuevo=new Int32Array(n).fill(-1); let m=0; for(let i=0;i<n;i++) if(!fuera[i]) nuevo[i]=m++;
const idx=prim.getIndices().getArray(), I=[];
for(let k=0;k<idx.length;k+=3) if(!fuera[idx[k]]&&!fuera[idx[k+1]]&&!fuera[idx[k+2]]) I.push(nuevo[idx[k]],nuevo[idx[k+1]],nuevo[idx[k+2]]);
console.log('vértices quitados',n-m);
// borde del corte en la piel vieja (aristas con un solo triángulo junto a la muñeca), llevado al plano del corte
const bordeDe=(F,cond)=>{ const c=new Map(); for(let k=0;k<F.length;k+=3) for(let e=0;e<3;e++){ const a=F[k+e], b=F[k+(e+1)%3], key=a<b?a+','+b:b+','+a; c.set(key,(c.get(key)||0)+1); }
  const B=new Set(); for(const [key,v] of c) if(v===1){ const [a,b]=key.split(',').map(Number); if(cond(a)&&cond(b)){ B.add(a); B.add(b); } } return [...B]; };
const viejoIdx=new Int32Array(m); for(let i=0;i<n;i++) if(nuevo[i]>=0) viejoIdx[nuevo[i]]=i;
const bordeViejo=bordeDe(I, j=>{ const i=viejoIdx[j]; return zona(Math.abs(Wd[i*3]),Wd[i*3+1]) && local(Math.abs(Wd[i*3]),Wd[i*3+1],Wd[i*3+2])[0]>CORTE-.02; });
for(const j of bordeViejo){ const i=viejoIdx[j], sx=Math.sign(Wd[i*3]); const [u]=local(Math.abs(Wd[i*3]),Wd[i*3+1],Wd[i*3+2]); const du=CORTE-u;
  Wd[i*3]+=sx*eu[0]*du; Wd[i*3+1]+=eu[1]*du; Wd[i*3+2]+=eu[2]*du;
  for(let q=0;q<3;q++) P[i*3+q]=(Wd[i*3+q]-t[q])/s; }
console.log('borde de la piel vieja',bordeViejo.length);


// 2) mano nueva (y su espejo), datos del vértice viejo más cercano
const hv=H.V.length/3, total=m+hv*2, out={};
for(const k of sem){ const c=D[k].length/n, o=new Float32Array(total*c);
  for(let i=0;i<n;i++) if(nuevo[i]>=0) for(let q=0;q<c;q++) o[nuevo[i]*c+q]=D[k][i*c+q]; out[k]=o; }
// la sombra de la mano nueva arranca con el mismo tono que el antebrazo junto al corte
let TONO=1; if(D._cav){ let sa=0,na=0; for(let i=0;i<n;i++){ if(fuera[i]||!zona(Wd[i*3],Wd[i*3+1])) continue; const [u]=local(Wd[i*3],Wd[i*3+1],Wd[i*3+2]); if(u>-.045&&u<-.025&&Math.hypot(...local(Wd[i*3],Wd[i*3+1],Wd[i*3+2]).slice(1))<.11){ sa+=D._cav[i]; na++; } }
  let sb=0,nb=0; for(let i=0;i<H.V.length/3;i++) if(H.V[i*3]<CORTE+HUECO+.012){ sb+=H.AO[i]; nb++; }
  TONO=(sa/na)/(sb/nb); console.log('tono antebrazo',(sa/na).toFixed(3),'mano',(sb/nb).toFixed(3)); }
const bordeMano=bordeDe(H.F, ()=>true); for(const i of bordeMano) H.V[i*3]=CORTE+HUECO;
console.log('borde de la mano',bordeMano.length);
const VW=new Float32Array(hv*3);
for(let i=0;i<hv;i++){ const [u,v,w]=[H.V[i*3],H.V[i*3+1],H.V[i*3+2]]; for(let q=0;q<3;q++) VW[i*3+q]=O[q]+eu[q]*u+ev[q]*v+ew[q]*w; }
for(let lado=0;lado<2;lado++){ const sx=lado?-1:1;
  for(let i=0;i<hv;i++){ const j=m+lado*hv+i, x=VW[i*3]*sx, y=VW[i*3+1], z=VW[i*3+2];
    let mejor=-1, dm=1e9; for(const q of viejos){ const d=(Wd[q*3]-VW[i*3])**2+(Wd[q*3+1]-y)**2+(Wd[q*3+2]-z)**2; if(d<dm){dm=d;mejor=q;} }
    // el lado x<0 es el espejo: busca su par exacto en el otro lado (el modelo es simétrico)
    let src=mejor; if(lado){ const mx=-Wd[mejor*3]; let d2=1e9; for(let q=0;q<n;q++){ if(Wd[q*3]>=0||!zona(-Wd[q*3],Wd[q*3+1])) continue; const d=(Wd[q*3]-mx)**2+(Wd[q*3+1]-Wd[mejor*3+1])**2+(Wd[q*3+2]-Wd[mejor*3+2])**2; if(d<d2){d2=d;src=q;} } }
    for(const k of sem){ const c=D[k].length/n; for(let q=0;q<c;q++) out[k][j*c+q]=D[k][src*c+q]; }
    out.POSITION[j*3]=(x-t[0])/s; out.POSITION[j*3+1]=(y-t[1])/s; out.POSITION[j*3+2]=(z-t[2])/s;
    if(out._cav) out._cav[j]=H.AO[i]*TONO;
  }
  for(let k=0;k<H.F.length;k+=3){ const b=m+lado*hv, a0=H.F[k]+b, a1=H.F[k+1]+b, a2=H.F[k+2]+b;
    // el espejo invierte el sentido de las caras
    if(lado) I.push(a0,a2,a1); else I.push(a0,a1,a2); }
}
// 3) costura: une el borde de la piel vieja con el de la mano nueva (una tira de triángulos, sin escalón)
const OUT=out.POSITION, pos=j=>[OUT[j*3]*s+t[0],OUT[j*3+1]*s+t[1],OUT[j*3+2]*s+t[2]];
for(let lado=0;lado<2;lado++){ const sx=lado?-1:1;
  const ang=j=>{ const p=pos(j); const L=local(p[0]*sx,p[1],p[2]); return Math.atan2(L[2],L[1]); };
  const A=bordeViejo.filter(j=>Math.sign(Wd[viejoIdx[j]*3])===sx).map(j=>({j,a:ang(j)}));
  const B=bordeMano.map(i=>m+lado*hv+i).map(j=>({j,a:ang(j)}));
  const a0=A.reduce((x,y)=>x.a<y.a?x:y).a, rel=v=>((v-a0)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  A.forEach(o=>o.r=rel(o.a)); B.forEach(o=>{ o.r=rel(o.a); if(o.r>2*Math.PI-.05) o.r-=2*Math.PI; });
  A.sort((x,y)=>x.r-y.r); B.sort((x,y)=>x.r-y.r);
  A.push({j:A[0].j,r:A[0].r+2*Math.PI}); B.push({j:B[0].j,r:B[0].r+2*Math.PI});
  const T=[]; let i=0,k=0;
  while(i<A.length-1||k<B.length-1){
    if(k>=B.length-1||(i<A.length-1&&A[i+1].r<=B[k+1].r)){ T.push(A[i].j,B[k].j,A[i+1].j); i++; }
    else { T.push(A[i].j,B[k].j,B[k+1].j); k++; } }
  // orientación: la normal de la tira debe mirar hacia fuera del eje
  let voto=0; for(let q=0;q<T.length;q+=3){ const a=pos(T[q]),b=pos(T[q+1]),c=pos(T[q+2]);
    const nn=cruz(sub(b,a),sub(c,a)), cen=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    const o=[O[0]*sx,O[1],O[2]], ax=[eu[0]*sx,eu[1],eu[2]], rel2=sub(cen,o), rad=sub(rel2,ax.map(v=>v*dot(rel2,ax)));
    voto+=Math.sign(dot(nn,rad)); }
  for(let q=0;q<T.length;q+=3) if(voto>0) I.push(T[q],T[q+1],T[q+2]); else I.push(T[q],T[q+2],T[q+1]);
  console.log('costura lado',lado,'triángulos',T.length/3,'borde',A.length-1,B.length-1,'voto',voto);
}
// 4) suaviza la banda de la costura (piel vieja, tira y pieza nueva) para que no quede un anillo marcado
{ const Q=out.POSITION, nv=total, cnt=new Uint32Array(nv+1);
  for(let k=0;k<I.length;k++) cnt[I[k]]+=2;
  const ini=new Uint32Array(nv+1); for(let i=0;i<nv;i++) ini[i+1]=ini[i]+cnt[i];
  const ady=new Uint32Array(ini[nv]), ps=ini.slice(0,nv);
  for(let k=0;k<I.length;k+=3){ const a=I[k],b=I[k+1],c=I[k+2]; ady[ps[a]++]=b;ady[ps[a]++]=c;ady[ps[b]++]=a;ady[ps[b]++]=c;ady[ps[c]++]=a;ady[ps[c]++]=b; }
  const w=new Float32Array(nv);
  for(let i=0;i<nv;i++){ const x=Q[i*3]*s+t[0], y=Q[i*3+1]*s+t[1], z=Q[i*3+2]*s+t[2], ax=Math.abs(x); if(!zona(ax,y)) continue;
    const [u,v,ww]=local(ax,y,z); if(Math.hypot(v,ww)>.11) continue; const d=Math.abs(u-(CORTE+HUECO/2)); if(d<.018) w[i]=1-d/.018; }
  const tmp=new Float32Array(Q.length);
  for(let it=0;it<24;it++){ const lam=it%2?-.53:.5;
    for(let i=0;i<nv;i++){ const j=i*3; if(!(w[i]>0)){ tmp[j]=Q[j];tmp[j+1]=Q[j+1];tmp[j+2]=Q[j+2]; continue; }
      let x=0,y=0,z=0; const a=ini[i],b=ini[i+1]; for(let k=a;k<b;k++){ const q=ady[k]*3; x+=Q[q];y+=Q[q+1];z+=Q[q+2]; }
      const m2=b-a||1, l=lam*w[i]; tmp[j]=Q[j]+(x/m2-Q[j])*l; tmp[j+1]=Q[j+1]+(y/m2-Q[j+1])*l; tmp[j+2]=Q[j+2]+(z/m2-Q[j+2])*l; }
    Q.set(tmp); }
}
// normales
const N=new Float32Array(total*3), Q=out.POSITION;
for(let k=0;k<I.length;k+=3){ const a=I[k]*3,b=I[k+1]*3,c=I[k+2]*3;
  const ux=Q[b]-Q[a],uy=Q[b+1]-Q[a+1],uz=Q[b+2]-Q[a+2],vx=Q[c]-Q[a],vy=Q[c+1]-Q[a+1],vz=Q[c+2]-Q[a+2];
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx; for(const q of [a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz;} }
for(let i=0;i<total;i++){ const j=i*3,l=Math.hypot(N[j],N[j+1],N[j+2])||1; N[j]/=l;N[j+1]/=l;N[j+2]/=l; }
out.NORMAL=N;
for(const k of sem) prim.getAttribute(k).setArray(out[k]).setNormalized(false);
prim.getIndices().setArray(new Uint32Array(I));
await doc.transform(quantize({quantizePosition:16, quantizeNormal:10, quantizeGeneric:12}), meshopt({encoder:MeshoptEncoder, level:'medium'}));
await io.write(sal, doc); console.log('escrito', sal, 'vértices', total);
