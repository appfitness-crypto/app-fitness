const {chromium}=require('/opt/node-tools/node_modules/playwright');const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:300,height:300}});
 p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://localhost:8091/prueba.html');
 await p.waitForFunction('window.LISTO',null,{timeout:120000});
 const r=await p.evaluate(()=>{
   const enc=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
   const g0=V.piel().geometry;
   return V._D().map((d,k)=>{const g=d.m.geometry; const o={nombre:k?'short':'piel', idx:enc(new Uint32Array(g.index.array)), P:enc(new Float32Array(d.P0)), GA:enc(d.GA), WA:enc(d.WA), GB:enc(d.GB), WB:enc(d.WB), T:enc(d.T), N:enc(new Float32Array(d.N0))};
     if(!k) o.MUS=enc(g.attributes._musculo.array instanceof Float32Array?g.attributes._musculo.array:new Float32Array(g.attributes._musculo.array)); return o;});
 });
 fs.writeFileSync(process.argv[2],JSON.stringify(r)); await b.close();
})();
