/* ═══ ver la app como el socio ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   El director o el entrenador abre la app del socio tal como él la ve (Inicio, Rutina, Progreso, Nutrición, Perfil)
   para acompañarlo y explicarle cómo funciona. Lo que cambie ahí se guarda en el expediente del socio, igual que si lo
   hiciera él. No toca la sesión guardada del staff, no registra asistencia y no permite cerrar ni eliminar la cuenta
   del socio: esos botones regresan al panel.
   El botón "Ver su perfil" de la lista se activa o desactiva desde el Menú del panel (se guarda en el perfil del staff). ═══ */

let VISTA_SOCIO=null;   // {code} mientras el staff ve la app de un socio
function vistaSocioActiva(){ return !!VISTA_SOCIO; }

// ── Preferencia: mostrar u ocultar el botón en la lista ──
const VS_LS='fsp-ver-perfil';
function verPerfilActivo(){
  const e=staffActivoEntId && DB.entrenadores && DB.entrenadores[staffActivoEntId];
  if(e && e.prefs && typeof e.prefs.verPerfil==='boolean') return e.prefs.verPerfil;
  try{ const v=localStorage.getItem(VS_LS); if(v!==null) return v==='1'; }catch(_){}
  return true;
}
function verPerfilAlternar(){
  const on=!verPerfilActivo();
  try{ localStorage.setItem(VS_LS,on?'1':'0'); }catch(_){}
  const e=staffActivoEntId && DB.entrenadores && DB.entrenadores[staffActivoEntId];
  if(e){ e.prefs=Object.assign({},e.prefs,{verPerfil:on}); dbSaveEntrenador(staffActivoEntId); }
  staffRenderList();
  showToast(on?'Botón "Ver su perfil" activado':'Botón "Ver su perfil" desactivado');
}
function verPerfilBtnHTML(s){
  if(!verPerfilActivo()) return '';
  return `<button type="button" class="sl-ver" onclick="event.stopPropagation();verComoSocio('${esc(s.code)}')" aria-label="Ver la app como ${esc(tc(s.nombre))}">${ico('user')}<span>Ver su perfil</span></button>`;
}

// ── Entrar y salir ──
function verComoSocio(code){
  // En la lista el staff solo tiene el índice ligero; el expediente completo se descarga al abrirlo
  const s0=getSocio(code)||(typeof idxLite==='function'?idxLite(code):null);
  if(!s0){ showToast('No se encontró ese socio'); return; }
  const falta=!idxCompleto(getSocio(code));
  const cargar=(falta && typeof idxCargarSocio==='function' && fbListo) ? idxCargarSocio(code) : Promise.resolve(getSocio(code));
  if(falta) showToast('Abriendo la app de '+tc(s0.nombre).split(' ')[0]+'…');
  cargar.then(s=>{
    s=s||getSocio(code);
    if(!s || s._lite){ showToast('No se pudo cargar este socio. Revisa tu conexión.'); return; }
    asegurarLogs(s);
    const hoy=fechaISO(new Date());
    s._asistHoy=comoArray(s.logs.asistencia).find(r=>r&&r.fecha===hoy)||null;   // solo muestra la de hoy si él ya la registró
    s._yaRegistrado=true;
    VISTA_SOCIO={code};
    activeSocio=s;
    document.body.classList.add('vista-socio');
    vistaBarra(s);
    go('s-dash');
    dashTab('inicio');
  });
}
function salirVistaSocio(){
  if(!VISTA_SOCIO) return;
  const code=VISTA_SOCIO.code;
  VISTA_SOCIO=null;
  try{ miCuerpoDestruir(); }catch(_){}
  activeSocio=null;
  document.body.classList.remove('vista-socio');
  const b=document.getElementById('vista-barra'); if(b) b.remove();
  go('s-panel');
  if(getSocio(code)) staffOpenSocio(code); else { staffRenderList(); staffVista('lista'); }
}
function vistaBarra(s){
  let b=document.getElementById('vista-barra');
  if(!b){ b=document.createElement('div'); b.id='vista-barra'; b.className='vista-barra'; b.setAttribute('role','status'); document.body.appendChild(b); }
  b.innerHTML=`<span class="vb-dot" aria-hidden="true"></span>
    <span class="vb-tx">Vista de <b>${esc(tc(s.nombre))}</b><small>Lo que cambies se guarda en su plan</small></span>
    <button type="button" class="vb-btn" onclick="salirVistaSocio()">${ico('chevl')}Volver al panel</button>`;
}
