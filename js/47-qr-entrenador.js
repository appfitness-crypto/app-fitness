/* ═══ tarjeta QR del entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Dibuja en un canvas una tarjeta limpia con el QR que abre la app (img/qr/app.png, corrección H) y el código del
   entrenador, para que la mande por WhatsApp desde "Mi código". En el celular se comparte la imagen con el texto
   (WhatsApp la recibe adjunta); donde el navegador no comparte archivos, se descarga la imagen y se abre WhatsApp
   con el texto. ═══ */

const QR_URL='https://appfitness-crypto.github.io/app-fitness/';
let QR_CACHE={codigo:'', blob:null, url:''};

function qrImg(src){
  return new Promise((ok,mal)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=mal; i.src=src; });
}
function qrRedondo(c,x,y,w,h,r){
  c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();
}

// Tarjeta 1080×1350 (4:5, se ve completa en WhatsApp)
async function qrTarjetaBlob(codigo, nombre){
  if(QR_CACHE.blob && QR_CACHE.codigo===codigo) return QR_CACHE.blob;
  try{ await document.fonts.load('800 80px Kanit'); await document.fonts.load('600 40px Figtree'); }catch(_){}
  const [qr,logo]=await Promise.all([qrImg('img/qr/app.png'), qrImg('icons/icon-192.png').catch(()=>null)]);
  const W=1080, H=1350, LIMA='#C8F23A', TX='#F4F7FA', MU='#9AA6B2';
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const c=cv.getContext('2d');
  c.fillStyle='#0B0F14'; c.fillRect(0,0,W,H);
  const g=c.createRadialGradient(W/2,0,0,W/2,0,760); g.addColorStop(0,'rgba(200,242,58,.13)'); g.addColorStop(1,'rgba(200,242,58,0)');
  c.fillStyle=g; c.fillRect(0,0,W,H);
  c.textAlign='center'; c.textBaseline='alphabetic';

  // Marca
  c.font='800 84px Kanit, Figtree, sans-serif';
  const a='FITNESS ', b='PRO', wa=c.measureText(a).width, wb=c.measureText(b).width, x0=(W-wa-wb)/2;
  c.textAlign='left'; c.fillStyle=TX; c.fillText(a,x0,132); c.fillStyle=LIMA; c.fillText(b,x0+wa,132);
  c.textAlign='center'; c.fillStyle=MU; c.font='500 38px Figtree, sans-serif';
  c.fillText('Escanea para crear tu cuenta',W/2,188);

  // QR en tarjeta blanca, con el logo al centro
  const card=620, cx=(W-card)/2, cy=236, q=532;
  c.fillStyle='#FFFFFF'; qrRedondo(c,cx,cy,card,card,40); c.fill();
  c.imageSmoothingEnabled=false;
  c.drawImage(qr,cx+(card-q)/2,cy+(card-q)/2,q,q);
  c.imageSmoothingEnabled=true;
  if(logo){
    const l=118, lx=W/2-l/2, ly=cy+card/2-l/2;
    c.fillStyle='#FFFFFF'; qrRedondo(c,lx-12,ly-12,l+24,l+24,30); c.fill();
    c.save(); qrRedondo(c,lx,ly,l,l,24); c.clip(); c.drawImage(logo,lx,ly,l,l); c.restore();
  }

  // Código del entrenador
  const yc=cy+card+80;
  c.fillStyle=MU; c.font='600 30px Figtree, sans-serif';
  c.fillText(('Código de '+(nombre?'tu entrenador · '+nombre:'tu entrenador')).toUpperCase(),W/2,yc);
  c.font='800 96px Kanit, Figtree, sans-serif';
  const wc=c.measureText(codigo).width+96;
  c.strokeStyle='rgba(200,242,58,.55)'; c.lineWidth=3; qrRedondo(c,(W-wc)/2,yc+24,wc,128,28); c.stroke();
  c.fillStyle=LIMA; c.fillText(codigo,W/2,yc+122);

  // Pasos
  const pasos=['Escanea el código con tu cámara','Crea tu cuenta y responde la evaluación','Al final, escribe el código de arriba'];
  c.textAlign='left'; c.font='500 34px Figtree, sans-serif';
  const anchoMax=Math.max(...pasos.map(p=>c.measureText(p).width)), px=(W-anchoMax-70)/2;
  pasos.forEach((p,i)=>{
    const y=yc+226+i*58;
    c.fillStyle=LIMA; c.beginPath(); c.arc(px+20,y-12,20,0,Math.PI*2); c.fill();
    c.fillStyle='#0B0F14'; c.font='700 24px Figtree, sans-serif'; c.textAlign='center'; c.fillText(String(i+1),px+20,y-3);
    c.fillStyle=TX; c.font='500 34px Figtree, sans-serif'; c.textAlign='left'; c.fillText(p,px+60,y);
  });

  const blob=await new Promise(ok=>cv.toBlob(ok,'image/png'));
  if(QR_CACHE.url) URL.revokeObjectURL(QR_CACHE.url);
  QR_CACHE={codigo, blob, url:URL.createObjectURL(blob)};
  return blob;
}

function qrMensaje(codigo){
  return 'Te invito a entrenar conmigo en '+(GYM.nombreCorto||GYM.nombre)+'. Escanea el QR o entra aquí: '+QR_URL+
    '\nCrea tu cuenta y, al final de tu evaluación, escribe mi código de entrenador: '+codigo;
}
function qrNombreEnt(){
  const e=staffActivoEntId && DB.entrenadores && DB.entrenadores[staffActivoEntId];
  return e && e.nombre ? tc(e.nombre).split(' ')[0] : '';
}

// Vista previa dentro del modal "Tu código"
function qrPintarVista(codigo){
  qrTarjetaBlob(codigo, qrNombreEnt()).then(()=>{
    const im=document.getElementById('qr-vista');
    if(im){ im.src=QR_CACHE.url; im.classList.add('on'); }
  }).catch(()=>{ const w=document.getElementById('qr-vista'); if(w) w.closest('.qr-wrap').remove(); });
}

async function qrEnviarWhatsApp(codigo){
  const txt=qrMensaje(codigo);
  try{
    const blob=await qrTarjetaBlob(codigo, qrNombreEnt());
    const f=new File([blob],'fitness-pro-'+codigo+'.png',{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[f]})){
      await navigator.share({files:[f], text:txt});
      return;
    }
    qrDescargar(codigo);
    showToast('Imagen descargada. Adjúntala en el chat de WhatsApp.');
  }catch(e){
    if(e && e.name==='AbortError') return;   // el coach cerró el menú de compartir
  }
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener');
}
async function qrDescargar(codigo){
  try{
    await qrTarjetaBlob(codigo, qrNombreEnt());
    const a=document.createElement('a'); a.href=QR_CACHE.url; a.download='fitness-pro-'+codigo+'.png';
    document.body.appendChild(a); a.click(); a.remove();
  }catch(_){ showToast('No se pudo crear la imagen'); }
}
