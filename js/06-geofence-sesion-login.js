/* ═══ geofence sesion login ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// GEOFENCE — solo si js/config.js define GYM.geofence (apagada en la app pública)
// ═════════════════════════════════════════
const GEO_CENTER = GYM.geofence ? {lat:GYM.geofence.lat, lng:GYM.geofence.lng} : {lat:0,lng:0};
const GEO_RADIO_M = (GYM.geofence && GYM.geofence.radioM) || 200;
let geoStatus = 'unknown';
let geoCoords = null;

// Ya no restringe nada — la app funciona en cualquier lugar. Solo usa el GPS (si el
// socio lo permite) para clasificar el check-in en el Resumen y para armar "Lugares
// visitados" en el menú del coordinador, sin mostrarle nada de esto al socio.
function initGeofence(){
  if(!GYM.geofence || !navigator.geolocation) return;   // sin gimnasio fijo: no se pide la ubicación
  navigator.geolocation.getCurrentPosition(
    pos => {
      geoCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const dist = haversine(geoCoords.lat, geoCoords.lng, GEO_CENTER.lat, GEO_CENTER.lng);
      geoStatus = dist <= GEO_RADIO_M ? 'gym' : 'outside';
    },
    () => { geoStatus='unknown'; },
    { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
  );
}
// Agrupa el check-in en una celda de ~55m (para juntar el ruido normal del GPS) y lleva
// la cuenta de cuántas veces y en qué días se ha abierto la app desde ahí.
function registrarLugarVisitado(coords){
  if(!coords || typeof coords.lat!=='number' || typeof coords.lng!=='number') return;
  const lat=Math.round(coords.lat*2000)/2000, lng=Math.round(coords.lng*2000)/2000;
  const arr=comoArray(DB.config&&DB.config.lugares).slice();
  const hoy=fechaISO(new Date());
  const i=arr.findIndex(x=>x&&x.lat===lat&&x.lng===lng);
  if(i>=0){
    const l=arr[i]; l.visitas=(l.visitas||1)+1; l.ultima=hoy;
    l.dias=comoArray(l.dias); if(!l.dias.includes(hoy)){ l.dias.push(hoy); if(l.dias.length>60) l.dias=l.dias.slice(-60); }
  } else arr.push({lat,lng,visitas:1,primera:hoy,ultima:hoy,dias:[hoy]});
  arr.sort((a,b)=>(b.visitas||0)-(a.visitas||0));
  DB.config=DB.config||{}; DB.config.lugares=arr.slice(0,80);
  guardarLocal();
  fbEncolar('/config/lugares','set',DB.config.lugares);
}
function setGeoBanner(type, msg){
  const b=document.getElementById('geo-banner'), t=document.getElementById('geo-txt');
  if(!b||!t) return;
  b.className='geo-banner geo-'+type; t.textContent=msg;
}
function haversine(lat1,lng1,lat2,lng2){
  const R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function registrarAsistencia(s){
  const now = new Date();
  asegurarLogs(s);
  if(!s.logs) s.logs = {sesiones:[],pesoCorporal:[],prs:{},asistencia:[],medidas:[],lesiones:[]};
  if(!s.logs.asistencia) s.logs.asistencia = [];
  const registro = {
    fecha: fechaISO(now), hora: now.toTimeString().substring(0,5),
    ts: now.getTime(), ubicacion: geoStatus,
    lat: geoCoords?.lat||null, lng: geoCoords?.lng||null,
  };
  const yaRegistrado = s.logs.asistencia.some(r=>r.fecha===registro.fecha);
  if(!yaRegistrado){
    s.logs.asistencia.unshift(registro);
    if(s.logs.asistencia.length>90) s.logs.asistencia = s.logs.asistencia.slice(0,90);
    dbSave(s.code);
    if(GYM.geofence) registrarLugarVisitado(geoCoords);
  }
  return { registro, yaRegistrado };
}

// Arranque de la app: después de DOMContentLoaded (y de los demás que lo escuchan), sin esperar a fotos y videos
// Ojo: mientras corren los scripts con defer el documento ya está en 'interactive' pero DOMContentLoaded
// aún no llega y faltan módulos por cargar; por eso se espera el evento (o 'load' si ya pasó) y nunca se arranca antes.
function alDomListo(fn){
  let hecho=false; const f=()=>{ if(hecho) return; hecho=true; setTimeout(fn,0); };
  if(document.readyState==='complete') f();
  else { document.addEventListener('DOMContentLoaded',f); window.addEventListener('load',f); }
}
alDomListo(()=>{
  { const c=document.getElementById('staff-content'); if(c) STAFF_CONTENT_VACIO=c.innerHTML; }
  // ── Cargar caché local de inmediato (offline-first) ──
  const localInicial = lsLoad();
  if(localInicial && localInicial.socios && Object.keys(localInicial.socios).length){ DB = localInicial; }
  else { DB = { socios:{}, entrenadores:(localInicial&&localInicial.entrenadores)||{}, config:(localInicial&&localInicial.config)||{}, version:1 }; }   // sin datos demo
  DB.config = DB.config || {};
  // v8.2: este dispositivo ya no guarda la lista completa de socios salvo que sea del staff
  { const ses0=leerSesion();
    if(!ses0 || ses0.tipo!=='staff'){
      const guardar=new Set(OUTBOX.filter(x=>x.tipo==='socio').map(x=>x.code));
      if(ses0 && ses0.tipo==='socio') guardar.add(ses0.code);
      const dejar={}; Object.keys(DB.socios||{}).forEach(c=>{ if(guardar.has(c)) dejar[c]=DB.socios[c]; });
      DB.socios=dejar;
      Object.keys(BASE).forEach(c=>{ if(!guardar.has(c)) delete BASE[c]; }); baseGuardar();
    }
    Object.values(DB.entrenadores||{}).forEach(e=>{ if(e && e.uid && e.pass!==undefined) delete e.pass; });
    guardarLocal();
  }
  Object.values(DB.socios||{}).forEach(asegurarLogs);
  kbAplicarExtra();

  // ── Config de Firebase: la de js/config.js manda ──
  // Si el dispositivo tenía guardada la de otro proyecto (p. ej. el anterior), se reemplaza.
  const FIREBASE_CONFIG = GYM.firebase;
  const guardada = leerFbConfig();
  const cfg = (guardada && guardada.projectId === FIREBASE_CONFIG.projectId) ? guardada : FIREBASE_CONFIG;
  guardarFbConfig(cfg); // Guardar para siguientes cargas
  const ok = initFirebase(cfg);
  if(!ok){
    // Sin Firebase: ya tenemos la caché local cargada arriba
  } else {
    fbArrancar();
  }
  initGeofence();
  restaurarSesion();
  actualizarPillSync();
  // Footer del inicio
  { const whp=document.getElementById('wc-hero-pic'); if(whp) whp.innerHTML=pic(['hero/bienvenida','hero/inicio'],'bolt','fill'); }
  const n = new Date();
  const sem = Math.ceil((((n - new Date(n.getFullYear(),0,1)) / 86400000) + new Date(n.getFullYear(),0,1).getDay()+1)/7);
  document.getElementById('inicio-fecha').textContent = 'Semana '+sem+' · '+n.getFullYear();
  actualizarContadorSocios();
});

// ═════════════════════════════════════════
// SESIÓN PERSISTENTE (sobrevive refresh/PWA)
// ═════════════════════════════════════════
const LS_SES='fitkiosk_sesion_v1';
function guardarSesion(o){ try{localStorage.setItem(LS_SES,JSON.stringify(o));}catch(e){} }
function borrarSesion(){ try{localStorage.removeItem(LS_SES);}catch(e){} }
function leerSesion(){ try{return JSON.parse(localStorage.getItem(LS_SES));}catch(e){return null;} }

function restaurarSesion(){
  const ses=leerSesion(); if(!ses) return;
  if(ses.tipo==='socio'){
    const socio=getSocio(ses.code);
    if(!socio){ borrarSesion(); restaurarCuenta(ses.code); return; }
    if(membBloqueoSocio(socio)){ borrarSesion(); return; }
    activeSocio=socio;
    fbEscucharSocio(ses.code);
    // Recuperar el check-in de hoy si ya existe; si no, registrarlo
    const hoy=fechaISO(new Date());
    const existente=(socio.logs?.asistencia||[]).find(r=>r.fecha===hoy);
    if(existente){ socio._asistHoy=existente; socio._yaRegistrado=true; }
    else { const {registro}=registrarAsistencia(socio); socio._asistHoy=registro; }
    refreshDash();
    dashTab('inicio');
    go('s-dash');
    verificarCuentaSocio(ses.code);
  } else if(ses.tipo==='cuenta'){
    restaurarCuenta(ses.uid);
  } else if(ses.tipo==='staff'){
    restaurarStaff(ses);
  }
}
// El plan se abre al instante con lo guardado en el celular; si la cuenta de Firebase ya no es la misma, se cierra
async function verificarCuentaSocio(code){
  if(!fbListo || !fbAuth) return;
  const est=await Promise.race([fbPrimerEstado,new Promise(r=>setTimeout(()=>r(null),8000))]);
  if(!est) return;   // sin respuesta (sin conexión): se sigue con lo local
  const u=fbAuth.currentUser;
  if(!u || u.isAnonymous || u.uid!==code){ if(activeSocio && activeSocio.code===code){ logoutSocio(); showToast('Tu sesión terminó. Vuelve a entrar con tu correo.'); } }
}
// Cuenta de cliente sin plan en este celular: se busca su expediente o se retoma la evaluación
async function restaurarCuenta(uid){
  if(!fbListo || !fbAuth) return;
  const est=await Promise.race([fbPrimerEstado,new Promise(r=>setTimeout(()=>r(null),8000))]);
  const u=fbAuth.currentUser;
  if(!est || !u || u.isAnonymous || (uid && u.uid!==uid)){ borrarSesion(); return; }
  entrarConCuenta(u);
}
async function restaurarStaff(ses){
  if(!fbListo || !fbAuth){ return; }     // sin Firebase no se puede verificar al staff: se queda en el inicio
  const est=await Promise.race([fbPrimerEstado,new Promise(r=>setTimeout(()=>r(null),6000))]);
  if(!est || !est.user || est.user.isAnonymous || !est.rol){ borrarSesion(); return; }
  entrarComoStaff(est.user.uid, est.rol);
}
function entrarComoStaff(usuario, rolDB){
  const esCoord = rolDB==='coordinador';
  // La llave del entrenador es su uid; las cuentas antiguas (creadas por el director) se buscan por su campo uid
  if(DB.entrenadores && !DB.entrenadores[usuario]){
    const viejo=Object.values(DB.entrenadores).find(e=>e && e.uid===usuario);
    if(viejo && viejo.id) usuario=viejo.id;
  }
  if(esCoord) dirAsegurarPerfil(usuario);
  const entObj = DB.entrenadores && DB.entrenadores[usuario];
  staffRol = esCoord ? 'coordinador' : ((entObj&&entObj.rol&&entObj.rol!=='coordinador')?entObj.rol:'entrenador');
  staffActivoEntId = entObj ? usuario : null;   // el director también tiene perfil: su filosofía es la del plan de la app
  const badge=document.getElementById('staff-role-badge');
  badge.style.display='inline-block';
  badge.textContent=sc((entObj&&!esCoord?entTipoLabel(entObj):(esCoord?'director':staffRol)).toUpperCase());
  document.getElementById('staff-nombre').textContent=(entObj&&entObj.nombre)||(esCoord?'Director':usuario);
  staffActivoId=null;
  staffLimpiarPanel();
  staffRenderList();
  go('s-panel'); staffVista('lista');
  actualizarFbBadge();
  actualizarBotonMiFilosofia();
  if(esCoord){
    // Borra de Firebase las contraseñas antiguas en texto (ya no sirven: el acceso es por Firebase Authentication)
    Object.keys(DB.entrenadores||{}).forEach(id=>{
      const e=DB.entrenadores[id];
      if(e && e.pass!==undefined){ delete e.pass; try{ fbDB.ref('/entrenadores/'+id+'/pass').remove().catch(()=>{}); }catch(x){} }
    });
    guardarLocal();
    avisarEntrenadoresSinAcceso();
  }
}
// El director necesita un perfil en /entrenadores para guardar su filosofía (la que usan los clientes sin entrenador)
function dirAsegurarPerfil(id){
  DB.entrenadores=DB.entrenadores||{};
  const e=DB.entrenadores[id];
  if(e && e.rol==='coordinador') return;
  if(e) e.rol='coordinador';
  else {
    const u=fbAuth&&fbAuth.currentUser;
    DB.entrenadores[id]={ id, uid:(u&&u.uid)||id, rol:'coordinador', nombre:(u&&u.displayName)||'Director', especialidades:[], funciones:['entrenamiento'], filosofia:null };
  }
  dbSaveEntrenador(id);
}
function avisarEntrenadoresSinAcceso(){
  const n=Object.values(DB.entrenadores||{}).filter(e=>e && e.rol!=='coordinador' && !e.uid).length;
  if(n) setTimeout(()=>showToast('🔐 '+n+' entrenador(es) aún sin acceso seguro: abre Entrenadores → Editar y crea su contraseña (mín. 6)'),1200);
}

// ═════════════════════════════════════════
// NAVEGACIÓN
// ═════════════════════════════════════════
let activeSocio = null;
let activeRutinaKey = HOY_KEY;

function go(id){
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  window.scrollTo(0,0);
  updateTb(id);
}
function updateTb(id){
  const tba=document.getElementById('tb-actions');
  const g=document.getElementById('global-tb');
  if(g) g.style.display=(['s-panel','s-quiz','s-det','s-preview','s-dash','s-ses','s-fin'].includes(id))?'none':'';
  if(g) g.classList.toggle('tb-bienvenida', id==='s-inicio');   // en bienvenida el logo grande va en la pantalla, no en la barra
  if(g) g.classList.toggle('tb-acceso', ['s-inicio','s-login','s-registro'].includes(id));   // sin selector de tema antes de entrar
  if(id==='s-dash'){
    tba.innerHTML = `<div class="tb-btn" onclick="logoutSocio()"><svg class="ico" aria-hidden="true"><use href="#i-logout"/></svg>Salir</div>`;
  } else if(id==='s-inicio'||id==='s-login'){
    tba.innerHTML = '';
    if(id==='s-inicio') actualizarContadorSocios();
  } else { tba.innerHTML=''; }
}
function logoutSocio(){ if(typeof vistaSocioActiva==='function' && vistaSocioActiva()) return salirVistaSocio(); av3dDestruir(); fbDetenerSocio(); activeSocio=null; borrarSesion(); cuentaSalir(); go('s-inicio'); }

// El acceso del cliente ahora es con correo y contraseña: ver js/36-cuentas.js
