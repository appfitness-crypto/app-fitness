const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs=require('fs');
const [modo,total,hilos,N]=[process.argv[2],+process.argv[3],+process.argv[4]||4,+process.argv[5]||8];
const dir='cuadros-'+modo; fs.mkdirSync(dir,{recursive:true});
(async()=>{ const br=await chromium.launch(); const t0=Date.now();
  await Promise.all([...Array(hilos).keys()].map(async h=>{ const p=await br.newPage({viewport:{width:1080,height:1080}});
    p.on('pageerror',e=>console.error('ERR',e.message)); await p.goto('http://127.0.0.1:8091/anim.html'); await p.evaluate(()=>window.listo); await p.evaluate(m=>setModo(m),modo);
    for(let f=h;f<total;f+=hilos){ const b64=await p.evaluate(([f,N])=>cuadro(f,{N}),[f,N]); fs.writeFileSync(`${dir}/f${String(f).padStart(4,'0')}.png`,Buffer.from(b64,'base64')); }
  })); console.log(modo,total,'cuadros en',((Date.now()-t0)/1000).toFixed(0),'s'); await br.close(); })();
