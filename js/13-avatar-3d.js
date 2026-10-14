/* ═══ avatar 3d · Mi cuerpo ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Vista 3D de cuerpo completo (maniquí gris con la definición muscular) que se gira con el dedo.
   La PRIMERA medición del cliente es su punto de partida: ese día el avatar queda tal cual y, conforme
   registra medidas nuevas, sus músculos crecen en proporción. Al tocar un músculo se ve cómo ha cambiado su medida.
   Motor: js/cuerpo3d/motor.js · modelo: modelos/cuerpo.glb (Z-Anatomy, CC BY-SA 4.0). Se cargan solo al abrir la vista. ═══ */
let av3d = null;          // vista abierta: {V, onKey}
let av3dThreePromise = null;
let c3dPromesa = null;

function cargarThree(){
  if(window.THREE) return Promise.resolve();
  if(av3dThreePromise) return av3dThreePromise;
  av3dThreePromise = new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.crossOrigin='anonymous';
    s.onload=()=>res();
    s.onerror=()=>{ av3dThreePromise=null; rej(new Error('three load')); };
    document.head.appendChild(s);
  });
  return av3dThreePromise;
}
const C3D_DIR='js/cuerpo3d/';
const C3D_JS=['vendor/GLTFLoader.js','vendor/OrbitControls.js','vendor/meshopt_decoder.js','motor.js'];
function cargarCuerpo3D(){
  if(window.Cuerpo3D) return Promise.resolve();
  if(!c3dPromesa) c3dPromesa = cargarThree()
    .then(()=>C3D_JS.reduce((p,f)=>p.then(()=>cargarScript(C3D_DIR+f)), Promise.resolve()))
    .catch(e=>{ c3dPromesa=null; throw e; });
  return c3dPromesa;
}

// Campos que mueven el avatar, en el orden de las tarjetas
const C3D_CAMPOS=['hombros','pecho','brazo','antebrazo','muslo','pantorrilla','cadera','cuello','cintura'];
function c3dNombre(id){ const c=MED_CAMPOS.find(x=>x.id===id); return c?sc(c.nm):id; }
// Punto de partida: para cada medida, el primer valor que registró (la medida 1)
function c3dReferencia(todas){
  const r={}; todas.forEach(m=>MED_CAMPOS.forEach(c=>{ if(r[c.id]==null && +m[c.id]) r[c.id]=+m[c.id]; })); return r;
}
// Hoy: el último valor de cada medida
function c3dActual(todas){
  const r={}; todas.forEach(m=>MED_CAMPOS.forEach(c=>{ if(+m[c.id]) r[c.id]=+m[c.id]; })); return r;
}
function c3dSerie(todas,id){ return todas.filter(m=>+m[id]).map(m=>({fecha:m.fecha,v:+m[id]})); }
// Avance: en cintura y cadera es bueno bajar; en lo demás, subir
const c3dAvance=(id,d)=>['cintura','cadera'].includes(id)?d<0:d>0;
function c3dFmt(v){ return (Math.round(v*10)/10).toString(); }

// Vista abierta: inline (dentro de Progreso) o a pantalla completa. Solo una a la vez.
function av3dDestruir(){
  if(!av3d) return;
  try{ av3d.V && av3d.V.destruir(); }catch(e){}
  try{ av3d.io && av3d.io.disconnect(); }catch(e){}
  if(av3d.onKey) document.removeEventListener('keydown', av3d.onKey);
  if(av3d.root && !av3d.full) av3d.root.innerHTML='';
  av3d=null;
}

function c3dVistaHTML(full){
  return `
    <div class="c3d-lienzo" id="c3d-lienzo"></div>
    <div class="c3d-arriba">
      <div>
        ${full?`<div class="c3d-kick">Mi cuerpo</div><h2 class="c3d-t" id="c3d-t">Tus músculos,<br><em>a tu medida</em></h2>`:''}
        <p class="c3d-pista">${full?'Desliza para girar · pellizca para acercar · toca un músculo o una medida':'Desliza a los lados para girar · toca un músculo o una medida'}</p>
      </div>
      ${full
        ?`<button type="button" class="c3d-x" onclick="cerrarMiCuerpo()" aria-label="Cerrar pantalla completa">✕</button>`
        :`<button type="button" class="c3d-x" id="c3d-abrir" onclick="abrirMiCuerpo()" aria-label="Ver Mi cuerpo en pantalla completa"><svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>`}
    </div>
    <div class="c3d-cargando" id="c3d-cargando" role="status">Cargando tu cuerpo 3D…</div>
    <div class="c3d-abajo">
      <div class="c3d-fila">
        <span class="c3d-cuando" id="c3d-cuando"></span>
        <div class="c3d-sw" role="group" aria-label="Comparar tu cuerpo">
          <button type="button" id="c3d-b-ini" onclick="c3dVer('inicio')">Inicio</button>
          <button type="button" id="c3d-b-hoy" onclick="c3dVer('hoy')">Hoy</button>
        </div>
      </div>
      <div class="c3d-ficha" id="c3d-ficha" hidden aria-live="polite"></div>
      <div class="c3d-chips" id="c3d-chips" tabindex="0" role="region" aria-label="Tus medidas"></div>
      <p class="c3d-pie">Estimación visual con tus medidas · no es un diagnóstico.<br>Modelo anatómico: Z-Anatomy (CC BY-SA 4.0), derivado de BodyParts3D.</p>
    </div>`;
}

function c3dMontar(root, full){
  const s=activeSocio; if(!s||!root) return;
  av3dDestruir();
  const {todas}=getMedidas(s);
  const ref=c3dReferencia(todas), hoy=c3dActual(todas);
  const nMed=todas.filter(m=>MED_CAMPOS.some(c=>+m[c.id])).length;
  const desde=todas.find(m=>MED_CAMPOS.some(c=>+m[c.id]));
  root.innerHTML=c3dVistaHTML(full);
  const yo={V:null,root,full,ref,hoy,todas,nMed,modo:'hoy',desde};
  av3d=yo;
  if(full){ yo.onKey=e=>{ if(e.key==='Escape') cerrarMiCuerpo(); }; document.addEventListener('keydown',yo.onKey); }
  c3dPintarChips();
  c3dVer(nMed>=2?'hoy':'inicio',true);
  cargarCuerpo3D().then(()=>{
    if(av3d!==yo) return;
    const V=Cuerpo3D.montar(document.getElementById('c3d-lienzo'),{base:'modelos/',referencia:ref,onToque:c3dToque});
    yo.V=V;
    // encuadre: cuerpo completo, un poco de frente-lado
    const r=full?6.2:5.6;
    V.camera.position.set(Math.sin(.35)*r,.84,Math.cos(.35)*r); V.controls.target.set(0,.8,0);
    V.controls.minDistance=1.3; V.controls.maxDistance=8;
    if(!full){
      // dentro de la página: el dedo de arriba a abajo mueve la página; de lado gira el cuerpo
      V.controls.enableZoom=false;
      V.controls.update();
      V.controls.minPolarAngle=V.controls.maxPolarAngle=V.controls.getPolarAngle();
      if('IntersectionObserver' in window){ yo.io=new IntersectionObserver(es=>es.forEach(e=>V.pausar(!e.isIntersecting))); yo.io.observe(root); }
    }
    V.controls.update();
    return V.promesa.then(()=>{
      if(av3d!==yo) return;
      document.getElementById('c3d-cargando')?.remove();
      // arranca en tu punto de partida y, si ya hay avance, crece hasta hoy
      c3dVer('inicio',true);
      if(nMed>=2) setTimeout(()=>{ if(av3d===yo && yo.modo==='inicio') c3dVer('hoy'); },650);
    });
  }).catch(()=>{
    const c=document.getElementById('c3d-cargando');
    if(c) c.innerHTML='No se pudo cargar el cuerpo 3D. Revisa tu conexión e inténtalo de nuevo.';
  });
}
// Dentro de Progreso (se llama al pintar la sección de cuerpo)
function c3dMontarInline(){ const el=document.getElementById('c3d-in'); if(el) c3dMontar(el,false); }

function abrirMiCuerpo(){
  if(!activeSocio) return;
  av3dDestruir();
  let ov=document.getElementById('c3d');
  if(!ov){ ov=document.createElement('div'); ov.id='c3d'; document.body.appendChild(ov); }
  ov.className='c3d c3d-full';
  ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-labelledby','c3d-t');
  document.documentElement.classList.add('c3d-abierto');
  c3dMontar(ov,true);
  requestAnimationFrame(()=>ov.classList.add('on'));
  ov.querySelector('.c3d-x')?.focus();
}
function cerrarMiCuerpo(){
  av3dDestruir();
  const ov=document.getElementById('c3d');
  if(ov){ ov.classList.remove('on'); setTimeout(()=>ov.remove(),220); }
  document.documentElement.classList.remove('c3d-abierto');
  c3dMontarInline();
  document.getElementById('c3d-abrir')?.focus();
}

// INICIO (tu primera medición) ⇄ HOY (tu última medición)
function c3dVer(modo,inmediato){
  if(!av3d) return;
  av3d.modo=modo;
  const {V,ref,hoy,nMed}=av3d;
  document.getElementById('c3d-b-ini')?.setAttribute('aria-pressed',String(modo==='inicio'));
  document.getElementById('c3d-b-hoy')?.setAttribute('aria-pressed',String(modo==='hoy'));
  const cu=document.getElementById('c3d-cuando');
  if(cu) cu.textContent = !nMed ? 'Toca una medida para guardar tu punto de partida'
    : modo==='inicio' ? 'Tu punto de partida · '+fmtFecha(av3d.desde.fecha)
    : nMed<2 ? 'Primera medición: aquí empieza tu evolución'
    : 'Hoy · '+fmtFecha(av3d.todas[av3d.todas.length-1].fecha);
  if(V){ V.resaltar(null); V.ponerMedidas(modo==='hoy'?hoy:ref, inmediato?0:900); V.verCrecimiento(modo==='hoy' && nMed>=2); }
  const f=document.getElementById('c3d-ficha'); if(f) f.hidden=true;
  document.getElementById('c3d-chips')?.removeAttribute('hidden');
  c3dPintarChips();
}

// Tarjetas de medidas del cuerpo: se tocan para ver su evolución y registrar la medida de hoy
function c3dPintarChips(){
  const el=document.getElementById('c3d-chips'); if(!el||!av3d) return;
  const {ref,hoy,modo,nMed}=av3d;
  el.innerHTML=C3D_CAMPOS.map(id=>{
    if(hoy[id]==null) return `<button type="button" class="c3d-chip vacio" onclick="c3dFichaMedida('${id}')"><span>${c3dNombre(id)}</span><b class="num">—</b><small class="mas">+ Agregar</small></button>`;
    const v=modo==='hoy'?hoy[id]:ref[id], d=+(hoy[id]-ref[id]).toFixed(1);
    const dTx = modo==='hoy' && nMed>=2 ? `<small class="${c3dAvance(id,d)?'mas':''}">${d>0?'+':''}${c3dFmt(d)} cm</small>` : '<small>Editar</small>';
    return `<button type="button" class="c3d-chip${modo==='hoy'&&c3dAvance(id,d)?' sube':''}" onclick="c3dFichaMedida('${id}')" aria-label="${c3dNombre(id)} ${c3dFmt(v)} centímetros. Ver evolución y registrar"><span>${c3dNombre(id)}</span><b class="num">${c3dFmt(v)}<i>cm</i></b>${dTx}</button>`;
  }).join('');
}

// Ficha: un músculo tocado o una medida. Muestra cuánto cambió, su gráfica y deja registrar la de hoy.
function c3dFicha(o){
  const f=document.getElementById('c3d-ficha'); if(!f||!av3d) return;
  const {todas,ref,hoy}=av3d, id=o.id, c=id&&MED_CAMPOS.find(x=>x.id===id);
  let cuerpo='';
  if(!id){
    cuerpo=`<p class="c3d-f-nota">Este músculo no tiene una medida con cinta asociada.</p>`;
  } else {
    const serie=c3dSerie(todas,id);
    if(hoy[id]==null){
      cuerpo=`<p class="c3d-f-nota">Aún no registras tu medida de ${c3dNombre(id).toLowerCase()}. La primera que guardes será tu punto de partida.</p>`;
    } else {
      const d=+(hoy[id]-ref[id]).toFixed(1), pct=ref[id]?Math.round((hoy[id]/ref[id]-1)*1000)/10:0;
      cuerpo=`<div class="c3d-f-num">
          <b class="c3d-f-d${c3dAvance(id,d)?' mas':''}">${d>0?'+':''}${c3dFmt(d)} cm</b>
          <span>${c3dNombre(id)} ${c3dFmt(ref[id])} → ${c3dFmt(hoy[id])} cm<br>${serie.length>1?(pct>0?'+':'')+pct+' % desde tu primera medición':'Tu primera medición'}</span>
        </div>
        ${serie.length>1?`<canvas class="c3d-f-graf" id="c3d-graf" role="img" aria-label="Evolución de ${c3dNombre(id)}: ${serie.map(p=>c3dFmt(p.v)).join(', ')} cm"></canvas>`
          :`<p class="c3d-f-nota">Con tu próxima medición verás aquí su curva.</p>`}`;
    }
    cuerpo+=`<form class="c3d-f-reg" onsubmit="event.preventDefault();c3dGuardar('${id}')">
        <label for="c3d-in-v">Medida de hoy</label>
        <span class="c3d-f-in"><input id="c3d-in-v" type="number" step="0.5" min="${c.min}" max="${c.max}" inputmode="decimal" placeholder="${c3dFmt(hoy[id]||c.base)}" required><i>cm</i></span>
        <button type="submit">Guardar</button>
      </form>`;
  }
  f.innerHTML=`<div class="c3d-f-h"><div><div class="c3d-kick">${o.kick}</div><b class="c3d-f-n">${esc(o.titulo)}</b>
      ${o.sub?`<span class="c3d-f-s">${esc(o.sub)}</span>`:''}</div>
      <button type="button" class="c3d-f-x" onclick="c3dToque(null)" aria-label="Cerrar ficha">✕</button></div>${cuerpo}`;
  f.hidden=false; document.getElementById('c3d-chips')?.setAttribute('hidden','');
  if(id && hoy[id]!=null) c3dGrafica(document.getElementById('c3d-graf'), c3dSerie(todas,id));
}
// Tocar un músculo en el cuerpo
function c3dToque(r){
  const f=document.getElementById('c3d-ficha'); if(!f||!av3d) return;
  if(!r || !r.grupo){ f.hidden=true; document.getElementById('c3d-chips')?.removeAttribute('hidden'); av3d.V?.resaltar(null); return; }
  // el abdomen no crece con la cinta, pero su evolución se sigue con la cintura
  const id=r.medida || (r.g==='abdomen' ? 'cintura' : null);
  const zona={hombros:'Hombro',brazo:'Brazo',antebrazo:'Antebrazo',pecho:'Pecho',cadera:'Cadera',muslo:'Muslo',pantorrilla:'Pierna',cuello:'Cuello',cintura:'Abdomen'}[id]||'';
  const donde=[zona, r.lado].filter(Boolean).join(' ');
  c3dFicha({kick:'Tocaste', titulo:r.grupo, sub:[donde, r.nombre].filter(Boolean).join(' · '), id});
}
// Tocar una tarjeta de medida
function c3dFichaMedida(id){
  if(!av3d) return;
  // el músculo que mueve esta medida se ilumina en el cuerpo (como al tocarlo)
  if(av3d.V?.resaltarMedida) av3d.V.resaltarMedida(id); else av3d.V?.resaltar(null);
  c3dFicha({kick:'Tu medida', titulo:c3dNombre(id), sub:'En verde, el músculo que mueve esta medida', id});
  setTimeout(()=>document.getElementById('c3d-in-v')?.focus(),50);
}
// Registrar la medida de hoy desde la ficha (reemplaza la de hoy si ya había)
function c3dGuardar(id){
  const s=activeSocio, c=MED_CAMPOS.find(x=>x.id===id), inp=document.getElementById('c3d-in-v');
  if(!s||!c||!inp||!av3d) return;
  const v=parseFloat(String(inp.value).replace(',','.'));
  if(!(v>=c.min && v<=c.max)){ showToast(`⚠ Escribe tu ${c3dNombre(id).toLowerCase()} entre ${c.min} y ${c.max} cm`); inp.focus(); return; }
  asegurarLogs(s); if(!s.logs.medidas) s.logs.medidas=[];
  const hoyF=fechaISO(new Date()), ex=s.logs.medidas.find(m=>m.fecha===hoyF);
  if(ex) ex[id]=v; else s.logs.medidas.push({fecha:hoyF,[id]:v});
  s.logs.medidas.sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
  dbSave(s.code);
  showToast(`📏 ${c3dNombre(id)}: ${c3dFmt(v)} cm guardado`);
  // el cuerpo, las tarjetas y los mapas se actualizan sin recargar el modelo
  const {todas}=getMedidas(s);
  Object.assign(av3d,{todas, ref:c3dReferencia(todas), hoy:c3dActual(todas),
    nMed:todas.filter(m=>MED_CAMPOS.some(x=>+m[x.id])).length, desde:todas.find(m=>MED_CAMPOS.some(x=>+m[x.id]))});
  av3d.V?.ponerReferencia(av3d.ref);
  c3dVer('hoy');
  c3dFichaMedida(id);
  const mp=document.getElementById('cuerpo-mapas'); if(mp && typeof mapasHTML==='function') mp.innerHTML=mapasHTML(s);
  if(typeof refreshDash==='function') refreshDash();
}
function c3dGrafica(cv,serie){
  if(!cv||serie.length<2) return;
  const dpr=window.devicePixelRatio||1, W=cv.clientWidth||300, H=cv.clientHeight||110;
  cv.width=W*dpr; cv.height=H*dpr; const x=cv.getContext('2d'); x.scale(dpr,dpr);
  const L='#C8F23A', vals=serie.map(p=>p.v); let mn=Math.min(...vals), mx=Math.max(...vals); const rg=Math.max(1,mx-mn); mn-=rg*.25; mx+=rg*.35;
  const pad={l:14,r:14,t:24,b:20}, X=i=>pad.l+(W-pad.l-pad.r)*(i/(serie.length-1)), Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-mn)/(mx-mn));
  x.strokeStyle='rgba(241,245,247,.07)'; x.lineWidth=1; for(let g=0;g<=2;g++){ const y=pad.t+(H-pad.t-pad.b)*g/2; x.beginPath(); x.moveTo(pad.l,y); x.lineTo(W-pad.r,y); x.stroke(); }
  const g=x.createLinearGradient(0,pad.t,0,H-pad.b); g.addColorStop(0,'rgba(200,242,58,.28)'); g.addColorStop(1,'rgba(200,242,58,0)');
  x.beginPath(); x.moveTo(X(0),H-pad.b); serie.forEach((p,i)=>x.lineTo(X(i),Y(p.v))); x.lineTo(X(serie.length-1),H-pad.b); x.closePath(); x.fillStyle=g; x.fill();
  x.beginPath(); serie.forEach((p,i)=>i?x.lineTo(X(i),Y(p.v)):x.moveTo(X(i),Y(p.v))); x.strokeStyle=L; x.lineWidth=2.5; x.lineJoin='round'; x.stroke();
  const n=serie.length-1, cada=Math.max(1,Math.ceil(serie.length/6));
  serie.forEach((p,i)=>{ x.beginPath(); x.arc(X(i),Y(p.v),i===n?4.5:3,0,7); x.fillStyle=i===n?L:'#10151C'; x.fill(); x.strokeStyle=L; x.lineWidth=1.6; x.stroke();
    if(i===n || i%cada===0){ x.textAlign=i===0?'left':i===n?'right':'center'; x.fillStyle=i===n?L:'rgba(241,245,247,.8)'; x.font='700 11px Figtree, sans-serif'; x.fillText(c3dFmt(p.v),X(i)+(i===0?-4:i===n?4:0),Y(p.v)-9); } });
  x.font='600 10px Figtree, sans-serif'; x.fillStyle='rgba(241,245,247,.55)';
  x.textAlign='left'; x.fillText(fmtFecha(serie[0].fecha),pad.l-4,H-4); x.textAlign='right'; x.fillText(fmtFecha(serie[n].fecha),W-pad.r+4,H-4);
}

// Guardar medidas del día
function guardarMedidas(){ asegurarLogs(activeSocio);
  const s=activeSocio; if(!s) return;
  const med={fecha:fechaISO(new Date())};
  let alguna=false;
  MED_CAMPOS.forEach(c=>{
    const v=parseFloat(document.getElementById('med-'+c.id)?.value);
    if(v&&v>=c.min&&v<=c.max){ med[c.id]=v; alguna=true; }
  });
  if(!alguna){ showToast('⚠ Ingresa al menos una medida válida'); return; }
  if(!s.logs.medidas) s.logs.medidas=[];
  const hoy=med.fecha;
  const ex=s.logs.medidas.find(m=>m.fecha===hoy);
  if(ex) Object.assign(ex,med); else s.logs.medidas.push(med);
  dbSave(s.code);
  showToast('📏 Medidas registradas — tu avatar se actualizó');
  renderProgresoTab();
  refreshDash();
}

// Mini sparkline para el hero
function drawSpark(id, valores){
  const cv=document.getElementById(id); if(!cv||valores.length<2) return;
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||140, H=cv.clientHeight||44;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const xx=ACC.replace('#','');
  const rr=parseInt(xx.substr(0,2),16),gg=parseInt(xx.substr(2,2),16),bb=parseInt(xx.substr(4,2),16);
  let min=Math.min(...valores), max=Math.max(...valores);
  const rg=Math.max(0.5,max-min); min-=rg*0.2; max+=rg*0.2;
  const X=i=>4+(W-8)*(i/(valores.length-1));
  const Y=v=>4+(H-8)*(1-(v-min)/(max-min));
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,`rgba(${rr},${gg},${bb},0.22)`); grad.addColorStop(1,`rgba(${rr},${gg},${bb},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H);
  valores.forEach((v,i)=>ctx.lineTo(X(i),Y(v)));
  ctx.lineTo(X(valores.length-1),H); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  valores.forEach((v,i)=>{i===0?ctx.moveTo(X(i),Y(v)):ctx.lineTo(X(i),Y(v));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  const last=valores.length-1;
  ctx.beginPath(); ctx.arc(X(last),Y(valores[last]),3,0,Math.PI*2);
  ctx.fillStyle=ACC; ctx.fill();
}

// Gráfica de medida seleccionada (reusa estilo de drawPesoChart)
let medChartSel='cintura';
function setMedChart(campo){
  medChartSel=campo;
  document.querySelectorAll('.chip-sel[data-med]').forEach(c=>c.classList.toggle('ac',c.dataset.med===campo));
  dibujarMedChart();
}
function dibujarMedChart(){
  const s=activeSocio; if(!s) return;
  const arr=(s.logs?.medidas||[]).filter(m=>m[medChartSel]!=null).map(m=>({fecha:m.fecha,kg:m[medChartSel]}));
  const cv=document.getElementById('chart-med'); if(!cv) return;
  drawSerieEnCanvas(cv, arr, ' cm');
}
// Generalización del dibujo de series (misma estética que peso)
function drawSerieEnCanvas(cv, serie, sufijo){
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||320, H=cv.clientHeight||150;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const TXC=(getComputedStyle(document.documentElement).getPropertyValue('--tx')||'#173527').trim();
  const hx=s=>{const x=s.replace('#','');return [parseInt(x.substr(0,2),16),parseInt(x.substr(2,2),16),parseInt(x.substr(4,2),16)];};
  const [ar,ag,ab]=hx(ACC), [tr,tg,tb]=hx(TXC);
  if(serie.length<2){
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='10px Figtree, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Registra esta medida 2+ veces para ver la curva',W/2,H/2); return;
  }
  const pad={l:36,r:12,t:14,b:20};
  const vals=serie.map(p=>p.kg);
  let min=Math.min(...vals),max=Math.max(...vals);
  const rg=Math.max(1,max-min); min-=rg*0.15; max+=rg*0.15;
  const X=i=>pad.l+(W-pad.l-pad.r)*(i/(serie.length-1));
  const Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-min)/(max-min));
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.07)`; ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+(H-pad.t-pad.b)*g/3;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='8px Figtree, sans-serif'; ctx.textAlign='right';
    ctx.fillText((max-(max-min)*g/3).toFixed(1),pad.l-5,y+3);
  }
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,`rgba(${ar},${ag},${ab},0.18)`); grad.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H-pad.b);
  serie.forEach((p,i)=>ctx.lineTo(X(i),Y(p.kg)));
  ctx.lineTo(X(serie.length-1),H-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  serie.forEach((p,i)=>{i===0?ctx.moveTo(X(i),Y(p.kg)):ctx.lineTo(X(i),Y(p.kg));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  serie.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(X(i),Y(p.kg),2.6,0,Math.PI*2);
    ctx.fillStyle=(getComputedStyle(document.documentElement).getPropertyValue('--dk3')||'#fff').trim(); ctx.fill();
    ctx.strokeStyle=ACC; ctx.lineWidth=1.5; ctx.stroke();
  });
  ctx.fillStyle=`rgba(${tr},${tg},${tb},0.45)`; ctx.font='8px Figtree, sans-serif';
  ctx.textAlign='left'; ctx.fillText(fmtFecha(serie[0].fecha),pad.l,H-6);
  ctx.textAlign='right'; ctx.fillText(fmtFecha(serie[serie.length-1].fecha)+(sufijo||''),W-pad.r,H-6);
}
