// Paso 6 (LEEME.md): alisa el granulado de la piel del GLB ya comprimido (Taubin, sin encoger) y lo vuelve a comprimir.
// Uso: npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer
//      IT=14 ITS=6 node refinar.mjs cuerpo-paso5.glb cuerpo.glb   (aplicar una sola vez sobre la salida del paso 5)
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, meshopt} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [,,ent,sal]=process.argv, IT=+(process.env.IT||12), ITS=+(process.env.ITS||6);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(ent);
function vecinos(idx,n){ const cnt=new Uint32Array(n+1); for(let t=0;t<idx.length;t++) cnt[idx[t]]+=2;
  const ini=new Uint32Array(n+1); for(let i=0;i<n;i++) ini[i+1]=ini[i]+cnt[i]; const ady=new Uint32Array(ini[n]), pos=ini.slice(0,n);
  for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2]; ady[pos[a]++]=b;ady[pos[a]++]=c;ady[pos[b]++]=a;ady[pos[b]++]=c;ady[pos[c]++]=a;ady[pos[c]++]=b;} return {ini,ady}; }
function taubin(P,V,w,iter){ const n=P.length/3,tmp=new Float32Array(P.length);
  for(let it=0;it<iter*2;it++){ const lam=it%2?-.53:.5;
    for(let i=0;i<n;i++){ const j=i*3; let x=0,y=0,z=0; const a=V.ini[i],b=V.ini[i+1]; for(let k=a;k<b;k++){const q=V.ady[k]*3;x+=P[q];y+=P[q+1];z+=P[q+2];}
      const m=b-a||1,l=lam*w[i]; tmp[j]=P[j]+(x/m-P[j])*l; tmp[j+1]=P[j+1]+(y/m-P[j+1])*l; tmp[j+2]=P[j+2]+(z/m-P[j+2])*l; } P.set(tmp); } }
function normales(P,idx){ const n=P.length/3,N=new Float32Array(P.length);
  for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;
    const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx; for(const q of [a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz;}}
  for(let i=0;i<n;i++){const j=i*3,l=Math.hypot(N[j],N[j+1],N[j+2])||1;N[j]/=l;N[j+1]/=l;N[j+2]/=l;} return N; }
for(const node of doc.getRoot().listNodes()){ const mesh=node.getMesh(); if(!mesh) continue;
  const s=node.getScale()[0], t=node.getTranslation();
  for(const p of mesh.listPrimitives()){
    const A=p.getAttribute('POSITION'), n=A.getCount(), P=new Float32Array(n*3), e=[0,0,0];
    for(let i=0;i<n;i++){ A.getElement(i,e); P[i*3]=e[0]; P[i*3+1]=e[1]; P[i*3+2]=e[2]; }
    const idx=p.getIndices().getArray(), V=vecinos(idx,n), w=new Float32Array(n);
    // peso en espacio del mundo: más suave en el tronco y extremidades, poco en manos/pies/cara (se encogen)
    for(let i=0;i<n;i++){ const y=P[i*3+1]*s+t[1], x=Math.abs(P[i*3]*s+t[0]);
      let k=1; if(y<.09) k=.35;            // pies
      if(x>.3&&y<1.0&&y>.6) k=.4;           // manos
      w[i]=k; }
    taubin(P,V,w,node.getName()==='short'?ITS:IT);
    A.setArray(P).setNormalized(false);
    const N=normales(P,idx); p.getAttribute('NORMAL').setArray(N).setNormalized(false);
  }
}
await doc.transform(quantize({quantizePosition:16, quantizeNormal:10, quantizeGeneric:12, pattern:/^(POSITION|NORMAL)$/}), meshopt({encoder:MeshoptEncoder, level:'medium'}));
await io.write(sal, doc); console.log('ok', sal);
