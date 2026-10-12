// Hornea el modelo limpio: quita fragmentos sueltos, suaviza, calcula oclusión ambiental (rayos sobre vóxeles) y escribe un GLB.
const fs=require('fs');
const [,,entrada,salida]=process.argv;
const J=JSON.parse(fs.readFileSync(entrada,'utf8'));
const dec=(s,T)=>{const b=Buffer.from(s,'base64');return new T(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const M=J.map(o=>({nombre:o.nombre, idx:dec(o.idx,Uint32Array), P:dec(o.P,Float32Array), GA:dec(o.GA,Float32Array), WA:dec(o.WA,Float32Array), GB:dec(o.GB,Float32Array), WB:dec(o.WB,Float32Array), T:dec(o.T,Float32Array), MUS:o.MUS?dec(o.MUS,Float32Array):null}));

function vecinos(idx,n){ const cnt=new Uint32Array(n+1); for(let t=0;t<idx.length;t++) cnt[idx[t]]+=2;
  const ini=new Uint32Array(n+1); for(let i=0;i<n;i++) ini[i+1]=ini[i]+cnt[i]; const ady=new Uint32Array(ini[n]), pos=ini.slice(0,n);
  for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2]; ady[pos[a]++]=b;ady[pos[a]++]=c;ady[pos[b]++]=a;ady[pos[b]++]=c;ady[pos[c]++]=a;ady[pos[c]++]=b;} return {ini,ady}; }
function taubin(P,V,w,iter){ const n=P.length/3,tmp=new Float32Array(P.length);
  for(let it=0;it<iter*2;it++){ const lam=it%2?-.53:.5;
    for(let i=0;i<n;i++){ const j=i*3; if(!(w[i]>0)){tmp[j]=P[j];tmp[j+1]=P[j+1];tmp[j+2]=P[j+2];continue;}
      let x=0,y=0,z=0; const a=V.ini[i],b=V.ini[i+1]; for(let k=a;k<b;k++){const q=V.ady[k]*3;x+=P[q];y+=P[q+1];z+=P[q+2];}
      const m=b-a||1,l=lam*w[i]; tmp[j]=P[j]+(x/m-P[j])*l; tmp[j+1]=P[j+1]+(y/m-P[j+1])*l; tmp[j+2]=P[j+2]+(z/m-P[j+2])*l; } P.set(tmp); } }
function normales(P,idx){ const n=P.length/3,N=new Float32Array(P.length);
  for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;
    const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx; for(const q of [a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz;}}
  for(let i=0;i<n;i++){const j=i*3,l=Math.hypot(N[j],N[j+1],N[j+2])||1;N[j]/=l;N[j+1]/=l;N[j+2]/=l;} return N; }

// 1) fragmentos sueltos y triángulos degenerados
function limpiar(m){
  const n=m.P.length/3, par=new Int32Array(n).map((_,i)=>i), f=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i];}return i;};
  const P=m.P, idx=m.idx, keep=[];
  for(let t=0;t<idx.length;t+=3){ const a=idx[t],b=idx[t+1],c=idx[t+2];
    const ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2],vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2];
    const ar=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx); if(ar<1e-10||a===b||b===c||a===c) continue;
    keep.push(t); par[f(a)]=f(b); par[f(b)]=f(c); }
  const tam=new Map(); for(let i=0;i<n;i++){const r=f(i); tam.set(r,(tam.get(r)||0)+1);}
  const ords=[...tam.entries()].sort((a,b)=>b[1]-a[1]);
  const vale=new Set(ords.filter(([r,c])=>c>=n*.02).map(([r])=>r));
  console.log(m.nombre,'vértices',n,'piezas',ords.length,'se quedan',vale.size,'tamaños',ords.slice(0,6).map(o=>o[1]).join(','), 'triángulos malos', idx.length/3-keep.length);
  const nuevo=new Int32Array(n).fill(-1); let k=0; for(let i=0;i<n;i++) if(vale.has(f(i))) nuevo[i]=k++;
  const I=[]; for(const t of keep){const a=nuevo[idx[t]],b=nuevo[idx[t+1]],c=nuevo[idx[t+2]]; if(a>=0&&b>=0&&c>=0) I.push(a,b,c);}
  const sel=(A,c)=>{ if(!A) return null; const o=new Float32Array(k*c); for(let i=0;i<n;i++) if(nuevo[i]>=0) for(let q=0;q<c;q++) o[nuevo[i]*c+q]=A[i*c+q]; return o; };
  Object.assign(m,{idx:new Uint32Array(I),P:sel(m.P,3),GA:sel(m.GA,1),WA:sel(m.WA,1),GB:sel(m.GB,1),WB:sel(m.WB,1),T:sel(m.T,1),MUS:sel(m.MUS,1)});
}
M.forEach(limpiar);

// 2) suavizado: general muy leve (quita el granulado) + banda clavículas/cuello + manos y pies
const piel=M[0], n=piel.P.length/3, Vp=vecinos(piel.idx,n);
{ const w=new Float32Array(n); for(let i=0;i<n;i++){ const x=piel.P[i*3], y=piel.P[i*3+1];
    w[i]=.55; if(y>1.37&&y<1.47&&Math.abs(x)<.2) w[i]=1; }
  taubin(piel.P,Vp,w,+(process.env.SUAVE||16)); }
// pliegues afilados (costuras entre músculos del volumen original): Laplaciano simple sólo donde la curvatura es alta
{ const P=piel.P, ITER=+(process.env.PLIEGUE||25), UMB=+(process.env.UMB||.18), tmp=new Float32Array(P.length);
  let tocados=0;
  for(let r=0;r<ITER;r++){ tmp.set(P);
    for(let i=0;i<n;i++){ const j=i*3, a=Vp.ini[i], b=Vp.ini[i+1]; if(b===a) continue; let x=0,y=0,z=0,e=0;
      for(let k=a;k<b;k++){ const q=Vp.ady[k]*3; x+=P[q];y+=P[q+1];z+=P[q+2]; e+=Math.hypot(P[q]-P[j],P[q+1]-P[j+1],P[q+2]-P[j+2]); }
      const m=b-a; x/=m;y/=m;z/=m; e/=m; const L=Math.hypot(x-P[j],y-P[j+1],z-P[j+2])/(e||1);
      if(L>UMB){ const w=Math.min(1,(L-UMB)/UMB)*.7; tmp[j]+=(x-P[j])*w; tmp[j+1]+=(y-P[j+1])*w; tmp[j+2]+=(z-P[j+2])*w; if(r===0) tocados++; } }
    P.set(tmp); }
  console.log('pliegues: vértices tocados', tocados); }
const sh=M[1]; const Vs=vecinos(sh.idx,sh.P.length/3); taubin(sh.P,Vs,new Float32Array(sh.P.length/3).fill(.5),4);
M.forEach(m=>{ m.N=normales(m.P,m.idx); });

// 3) oclusión ambiental: vóxeles de 3 mm con la superficie de piel y short, rayos coseno desde cada vértice
const C=.003; let mn=[9,9,9],mx=[-9,-9,-9];
M.forEach(m=>{ for(let i=0;i<m.P.length;i+=3) for(let q=0;q<3;q++){ mn[q]=Math.min(mn[q],m.P[i+q]); mx[q]=Math.max(mx[q],m.P[i+q]); } });
mn=mn.map(v=>v-.12); mx=mx.map(v=>v+.12);
const G=[0,1,2].map(q=>Math.ceil((mx[q]-mn[q])/C)), vox=new Uint8Array(G[0]*G[1]*G[2]);
const marca=(x,y,z)=>{ const i=Math.floor((x-mn[0])/C), j=Math.floor((y-mn[1])/C), k=Math.floor((z-mn[2])/C); vox[(k*G[1]+j)*G[0]+i]=1; };
M.forEach(m=>{ const P=m.P, I=m.idx; for(let t=0;t<I.length;t+=3){ const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
  const l=Math.max(Math.hypot(P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]),Math.hypot(P[c]-P[a],P[c+1]-P[a+1],P[c+2]-P[a+2]),Math.hypot(P[c]-P[b],P[c+1]-P[b+1],P[c+2]-P[b+2]));
  const s=Math.max(1,Math.ceil(l/(C*.5)));
  for(let u=0;u<=s;u++) for(let v=0;v<=s-u;v++){ const A=1-(u+v)/s, B=u/s, D=v/s; marca(P[a]*A+P[b]*B+P[c]*D, P[a+1]*A+P[b+1]*B+P[c+1]*D, P[a+2]*A+P[b+2]*B+P[c+2]*D); } } });
const NR=48, dirs=[]; for(let r=0;r<NR;r++){ const u=(r+.5)/NR, phi=r*2.399963, st=Math.sqrt(u), ct=Math.sqrt(1-u); dirs.push([st*Math.cos(phi),st*Math.sin(phi),ct]); }
const lleno=(x,y,z)=>{ const i=Math.floor((x-mn[0])/C), j=Math.floor((y-mn[1])/C), k=Math.floor((z-mn[2])/C); if(i<0||j<0||k<0||i>=G[0]||j>=G[1]||k>=G[2]) return 0; return vox[(k*G[1]+j)*G[0]+i]; };
function oclusion(m, alcance){
  const P=m.P,N=m.N,nv=P.length/3,ao=new Float32Array(nv);
  for(let i=0;i<nv;i++){ const j=i*3, nx=N[j],ny=N[j+1],nz=N[j+2];
    const tx0=Math.abs(nx)<.9?[0,1,0]:[1,0,0]; let ax=ny*tx0[2]-nz*tx0[1], ay=nz*tx0[0]-nx*tx0[2], az=nx*tx0[1]-ny*tx0[0]; const al=Math.hypot(ax,ay,az); ax/=al;ay/=al;az/=al;
    const bx=ny*az-nz*ay, by=nz*ax-nx*az, bz=nx*ay-ny*ax; const rot=i*.618;
    let occ=0;
    for(const [dx0,dy0,dz] of dirs){ const cr=Math.cos(rot), sr=Math.sin(rot), dx=dx0*cr-dy0*sr, dy=dx0*sr+dy0*cr;
      const rx=ax*dx+bx*dy+nx*dz, ry=ay*dx+by*dy+ny*dz, rz=az*dx+bz*dy+nz*dz;
      for(let d=.008; d<alcance; d+=C*.8){ if(lleno(P[j]+rx*d,P[j+1]+ry*d,P[j+2]+rz*d)){ occ+=1-Math.pow(d/alcance,.7)*.6; break; } } }
    ao[i]=1-occ/NR; }
  return ao;
}
const t0=Date.now();
M.forEach(m=>{ m.AO=oclusion(m,.11); });
console.log('oclusión', (Date.now()-t0)/1000,'s');
// difuminar un poco (sin granulado) y cavidad media para la definición entre músculos
function difuminar(A,V,it){ const n=A.length,t=new Float32Array(n); for(let r=0;r<it;r++){ for(let i=0;i<n;i++){ let s=A[i]*2,c=2; for(let k=V.ini[i];k<V.ini[i+1];k++){s+=A[V.ady[k]];c++;} t[i]=s/c; } A.set(t);} }
difuminar(piel.AO,Vp,5); difuminar(sh.AO,Vs,2);
{ const P=piel.P,N=piel.N,S=P.slice(),tmp=new Float32Array(P.length);
  for(let r=0;r<10;r++){ for(let i=0;i<n;i++){ let x=0,y=0,z=0; const a=Vp.ini[i],b=Vp.ini[i+1]; for(let k=a;k<b;k++){const q=Vp.ady[k]*3;x+=S[q];y+=S[q+1];z+=S[q+2];} const m=b-a||1; tmp[i*3]=x/m;tmp[i*3+1]=y/m;tmp[i*3+2]=z/m;} S.set(tmp); }
  const cav=new Float32Array(n); for(let i=0;i<n;i++){ const j=i*3; cav[i]=((P[j]-S[j])*N[j]+(P[j+1]-S[j+1])*N[j+1]+(P[j+2]-S[j+2])*N[j+2])*220; }
  difuminar(cav,Vp,4);
  piel.CAV=new Float32Array(n); for(let i=0;i<n;i++){ const ao=Math.pow(Math.max(0,piel.AO[i]),1.25), c=cav[i]; piel.CAV[i]=Math.max(.22,Math.min(1.08, ao*(c<0?Math.max(.55,1+c):1+Math.min(.08,c*.4)))); } }
sh.CAV=new Float32Array(sh.P.length/3).map((_,i)=>Math.max(.3,Math.min(1,Math.pow(sh.AO[i],1.1))));
let hist=[0,0,0,0,0]; piel.CAV.forEach(v=>hist[Math.min(4,Math.floor(v*4.5))]++); console.log('reparto sombra',hist.join(' '));

// 4) GLB sin comprimir (luego gltf-transform meshopt)
const bufs=[], views=[], acc=[]; let off=0;
function add(arr, type, comp, target, norm){ const b=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength); const pad=(4-b.length%4)%4; bufs.push(b,Buffer.alloc(pad));
  views.push({buffer:0,byteOffset:off,byteLength:b.length,...(target?{target}:{})}); off+=b.length+pad;
  const cnt=arr.length/({SCALAR:1,VEC3:3}[type]); const a={bufferView:views.length-1,componentType:comp,count:cnt,type};
  if(type==='VEC3'&&comp===5126){ const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9]; for(let i=0;i<arr.length;i+=3) for(let q=0;q<3;q++){lo[q]=Math.min(lo[q],arr[i+q]);hi[q]=Math.max(hi[q],arr[i+q]);} a.min=lo;a.max=hi; }
  acc.push(a); return acc.length-1; }
const meshes=[], nodes=[], mats=[];
M.forEach((m,k)=>{ const at={POSITION:add(m.P,'VEC3',5126,34962), NORMAL:add(m.N,'VEC3',5126,34962)};
  for(const [nm,A] of [['_ga',m.GA],['_wa',m.WA],['_gb',m.GB],['_wb',m.WB],['_t',m.T],['_cav',m.CAV],['_musculo',m.MUS]]) if(A) at[nm]=add(A,'SCALAR',5126,34962);
  const ind=add(m.idx,'SCALAR',5125,34963);
  mats.push({name:m.nombre}); meshes.push({name:m.nombre,primitives:[{attributes:at,indices:ind,material:k}]}); nodes.push({name:m.nombre,mesh:k}); });
const bin=Buffer.concat(bufs);
const gltf={asset:{version:'2.0',generator:'hornear.cjs (Z-Anatomy CC BY-SA 4.0)'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials:mats,accessors:acc,bufferViews:views,buffers:[{byteLength:bin.length}]};
let js=Buffer.from(JSON.stringify(gltf)); js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]);
const head=Buffer.alloc(12); head.writeUInt32LE(0x46546C67,0); head.writeUInt32LE(2,4); head.writeUInt32LE(12+8+js.length+8+bin.length,8);
const h1=Buffer.alloc(8); h1.writeUInt32LE(js.length,0); h1.writeUInt32LE(0x4E4F534A,4);
const h2=Buffer.alloc(8); h2.writeUInt32LE(bin.length,0); h2.writeUInt32LE(0x004E4942,4);
fs.writeFileSync(salida,Buffer.concat([head,h1,js,h2,bin])); console.log('escrito',salida,(12+16+js.length+bin.length)/1e6,'MB');
