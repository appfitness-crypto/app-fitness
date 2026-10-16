/* ═══ instalar la app en el celular ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   · Android (Chrome, Edge) y PC: el navegador ofrece la instalación; se guarda su aviso y el botón "Instalar" lo abre.
   · Android sin ese aviso (Samsung Internet, Firefox, Chrome antes de habilitarlo): pasos desde el menú del navegador.
   · iPhone y iPad: Apple no deja instalar con un botón; se explican los pasos de "Agregar a pantalla de inicio".
   · Dentro de Instagram, Facebook, WhatsApp…: primero hay que abrir el enlace en el navegador.
   Se muestra una tarjeta en Inicio (se puede posponer 7 días) y una fila en Perfil. Si ya está instalada, no aparece nada. ═══ */

let INST_AVISO=null;   // evento beforeinstallprompt guardado
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); INST_AVISO=e;
  instRefrescar();
});
window.addEventListener('appinstalled',()=>{
  INST_AVISO=null;
  try{ showToast('Listo: la app quedó en tu pantalla de inicio'); }catch(_){}
  instRefrescar();
});

function instInstalada(){
  try{ return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone===true; }
  catch(_){ return false; }
}
function instPlataforma(){
  const ua=navigator.userAgent||'';
  const ios=/iPhone|iPad|iPod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  const android=/Android/i.test(ua);
  const dentroDe=/Instagram/i.test(ua)?'Instagram':/FBAN|FBAV|FB_IAB/i.test(ua)?'Facebook':/WhatsApp/i.test(ua)?'WhatsApp':/TikTok|musical_ly/i.test(ua)?'TikTok':/Line\//i.test(ua)?'Line':(android&&/; wv\)/.test(ua))?'otra app':'';
  let nav='otro';
  if(ios) nav=/CriOS/i.test(ua)?'chrome':/FxiOS/i.test(ua)?'firefox':/EdgiOS/i.test(ua)?'edge':'safari';
  else if(android) nav=/SamsungBrowser/i.test(ua)?'samsung':/Firefox/i.test(ua)?'firefox':/EdgA/i.test(ua)?'edge':/OPR\//i.test(ua)?'opera':'chrome';
  return {ios, android, movil:ios||android, dentroDe, nav};
}
// ¿Tiene sentido ofrecerla? En PC solo si el navegador la puede instalar
function instDisponible(){ if(instInstalada()) return false; const p=instPlataforma(); return p.movil || !!INST_AVISO; }

const INST_POSP='fsp-inst-pospuesta';
function instPospuesta(){ try{ const t=+localStorage.getItem(INST_POSP)||0; return t && Date.now()-t<7*864e5; }catch(_){ return false; } }
function instPosponer(){ try{ localStorage.setItem(INST_POSP,String(Date.now())); }catch(_){} instRefrescar(); }

function instTarjetaHTML(){
  if(!instDisponible() || instPospuesta()) return '';
  const p=instPlataforma(), directo=!!INST_AVISO && !p.ios;
  return `<div class="pg-home soft inst-card">
    <div class="inst-ic">${ico('download')}</div>
    <div class="inst-tx"><div class="pg-home-k">Tenla a un toque</div>
      <div class="inst-m">${directo?'Instala la app y ábrela desde tu pantalla de inicio, como cualquier otra.':'Agrega la app a tu pantalla de inicio para entrar más rápido.'}</div>
      <div class="inst-acts">
        <button type="button" class="sd-pri" onclick="instAbrir()">${directo?'Instalar':'Cómo agregarla'}</button>
        <button type="button" class="btn-back-link" onclick="instPosponer()">Ahora no</button>
      </div></div></div>`;
}
function instFilaPerfilHTML(){
  if(!instDisponible()) return '';
  return `<button type="button" class="pf-row" onclick="instAbrir()">${it('download','sm')}<span>Instalar la app en mi celular</span>${ico('chev')}</button>`;
}

function instAbrir(){
  if(INST_AVISO && !instPlataforma().ios){
    const ev=INST_AVISO;
    ev.prompt();
    ev.userChoice.then(r=>{ if(r&&r.outcome==='accepted') INST_AVISO=null; instRefrescar(); }).catch(()=>{});
    return;
  }
  instGuia();
}

// Pasos según el teléfono y el navegador
function instPasos(){
  const p=instPlataforma();
  if(p.dentroDe){
    return {t:'Primero ábrela en tu navegador', n:'Desde '+p.dentroDe+' no se puede agregar a la pantalla de inicio.', pasos:[
      ['Toca el menú <b>···</b> o <b>⋮</b>','Está arriba a la derecha (o abajo, según la app).'],
      [p.ios?'Elige <b>Abrir en Safari</b>':'Elige <b>Abrir en Chrome</b> o <b>Abrir en el navegador</b>',''],
      ['Vuelve a abrir esta guía','Desde Perfil → Instalar la app en mi celular.']]};
  }
  if(p.ios){
    const fin=['Toca <b>Agregar</b>','Arriba a la derecha. El ícono del gimnasio aparece en tu pantalla de inicio.'];
    if(p.nav==='safari') return {t:'Agrégala a tu iPhone', n:'En iPhone se hace desde Safari, en pocos pasos.', pasos:[
      ['Toca el botón <b>Compartir</b> '+instIcoCompartir(),'Está en la barra de abajo. Si no lo ves, toca <b>···</b> primero.'],
      ['Desliza hacia abajo y toca <b>Agregar a pantalla de inicio</b> '+instIcoMas(),'Si no aparece, toca <b>Ver más</b> o <b>Editar acciones</b>.'],
      ['Deja activado <b>Abrir como app web</b>','Si tu iPhone lo muestra.'],
      fin]};
    return {t:'Agrégala a tu iPhone', n:'Funciona mejor desde Safari. Si prefieres seguir en '+({chrome:'Chrome',firefox:'Firefox',edge:'Edge'}[p.nav]||'este navegador')+':', pasos:[
      ['Toca el botón <b>Compartir</b> '+instIcoCompartir(),'Está junto a la barra de dirección, arriba o abajo.'],
      ['Toca <b>Agregar a pantalla de inicio</b> '+instIcoMas(),'Si no aparece, toca <b>Ver más</b>. Si tampoco está, abre este enlace en Safari.'],
      fin]};
  }
  if(p.android){
    if(p.nav==='samsung') return {t:'Agrégala a tu celular', n:'En Samsung Internet son 3 pasos.', pasos:[
      ['Toca el menú <b>≡</b>','Abajo a la derecha.'],
      ['Toca <b>Agregar página a</b> → <b>Pantalla de inicio</b>','O <b>Instalar</b>, si te lo ofrece.'],
      ['Toca <b>Agregar</b>','El ícono del gimnasio aparece en tu pantalla de inicio.']]};
    if(p.nav==='firefox') return {t:'Agrégala a tu celular', n:'En Firefox son 3 pasos.', pasos:[
      ['Toca el menú <b>⋮</b>',''],
      ['Toca <b>Instalar</b> o <b>Agregar a la pantalla de inicio</b>',''],
      ['Confirma con <b>Agregar</b>','El ícono del gimnasio aparece en tu pantalla de inicio.']]};
    return {t:'Agrégala a tu celular', n:'Desde el menú de tu navegador, en 3 pasos.', pasos:[
      ['Toca el menú <b>⋮</b>','Arriba a la derecha.'],
      ['Toca <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>',''],
      ['Toca <b>Instalar</b>','El ícono del gimnasio aparece en tu pantalla de inicio.']]};
  }
  return {t:'Instálala en tu equipo', n:'Busca el ícono de instalar en la barra de dirección de tu navegador, o en su menú la opción <b>Instalar</b>.', pasos:[]};
}
function instIcoCompartir(){ return '<svg class="ico inst-g" aria-hidden="true"><use href="#i-share"/></svg>'; }
function instIcoMas(){ return '<svg class="ico inst-g" aria-hidden="true"><use href="#i-plus"/></svg>'; }

function instGuia(){
  const g=instPasos(), p=instPlataforma();
  let m=document.getElementById('modal-inst');
  if(!m){ m=document.createElement('div'); m.className='modal'; m.id='modal-inst'; m.onclick=e=>{ if(e.target===m) m.classList.remove('open'); }; document.body.appendChild(m); }
  m.innerHTML=`<div class="mbox inst-box" role="dialog" aria-modal="true" aria-labelledby="inst-t">
    <div class="inst-h"><div class="inst-ic">${ico('download')}</div><div><div class="inst-t" id="inst-t">${g.t}</div><div class="inst-n">${g.n}</div></div></div>
    ${g.pasos.length?`<ol class="inst-pasos">${g.pasos.map(([a,b],i)=>`<li><span class="inst-num">${i+1}</span><div><div class="inst-a">${a}</div>${b?`<div class="inst-b">${b}</div>`:''}</div></li>`).join('')}</ol>`:''}
    ${p.ios&&!p.dentroDe?'<div class="inst-nota">Al abrirla desde el ícono la primera vez, entra con tu correo y contraseña. Tu plan y tu progreso siguen ahí.</div>':''}
    <button type="button" class="sd-pri" style="width:100%;margin-top:16px" onclick="document.getElementById('modal-inst').classList.remove('open')">Entendido</button>
  </div>`;
  m.classList.add('open');
}

function instRefrescar(){
  try{
    const dash=document.getElementById('s-dash');
    if(!dash || !dash.classList.contains('on') || typeof activeSocio==='undefined' || !activeSocio) return;
    const t=typeof tabActiva==='function'?tabActiva():'';
    if(t==='inicio') refreshDash(); else if(t==='perfil') renderPerfilTab();
  }catch(_){}
}
