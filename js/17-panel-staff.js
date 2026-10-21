/* ═══ panel staff ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PANEL STAFF — conectado a la misma DB
// ═════════════════════════════════════════
const STAFF_USERS={};   // v8.2: el acceso del staff vive en Firebase Authentication (ya no hay contraseñas en el código)
let staffRol='entrenador', staffActivoId=null, staffFilterVal='todos', staffSearchVal='', staffSemVal=null;
let staffActivoEntId=null; // id del entrenador logueado (para su propia filosofía)

// El acceso al panel es con correo y contraseña desde "Ya tengo cuenta" (js/36-cuentas.js → doEntrar)

let STAFF_CONTENT_VACIO=null;
function staffLimpiarPanel(){
  const c=document.getElementById('staff-content'); if(!c) return;
  if(STAFF_CONTENT_VACIO===null) STAFF_CONTENT_VACIO=c.dataset.vacio||'';
  c.innerHTML=STAFF_CONTENT_VACIO;
  const l=document.getElementById('staff-list'); if(l) l.innerHTML='';
}
function staffLogout(){ staffLimpiarPanel(); borrarSesion(); staffActivoId=null; staffActivoEntId=null; staffRol='entrenador'; try{ if(fbAuth) fbAuth.signOut(); }catch(e){} fbDetenerStaff(); go('s-inicio'); }

function fbAbrirSetup(){
  const ta=document.getElementById('fb-config-input');
  if(ta && !ta.value.trim()){
    const cfg=leerFbConfig();
    if(cfg) ta.value=JSON.stringify(cfg,null,2);
  }
}
function fbAccesoPermitido(){ return staffRol==='coordinador'; }
function fbConectar(){
  if(!fbAccesoPermitido()){ showToast('Solo dirección puede configurar Firebase'); return; }
  const raw=document.getElementById('fb-config-input').value.trim();
  let cfg;
  try{ cfg=JSON.parse(raw); }catch(e){ cfg=null; }
  if(!cfg||!cfg.apiKey||!cfg.databaseURL){ document.getElementById('fb-err').style.display='block'; return; }
  document.getElementById('fb-err').style.display='none';
  if(!initFirebase(cfg)){ document.getElementById('fb-err').textContent='❌ No se pudo conectar. Revisa el databaseURL.'; document.getElementById('fb-err').style.display='block'; return; }
  guardarFbConfig(cfg);
  fbArrancar();
  actualizarFbBadge();
  showToast('🔥 Firebase conectado correctamente');
  go('s-inicio');
}
function fbDesconectar(){
  try{ localStorage.removeItem(LS_FB_CFG); }catch(e){}
  showToast('Firebase desconectado — recarga la app'); borrarSesion(); location.reload();
}
// ── Navegación del panel: en celular se ve la lista O la ficha (con botón para volver) ──
function staffVista(v){
  const p=document.getElementById('s-panel'); if(p) p.setAttribute('data-vista',v);
  window.scrollTo(0,0);
}
function staffVolverLista(){ staffVista('lista'); }
function actualizarFbBadge(){
  const b=document.getElementById('fb-status-badge'); if(!b) return;
  b.style.display='inline-flex';
  b.className='stf-chip '+(fbListo?'':'warn');
  b.textContent=fbListo?'Conectado a Firebase':'Modo local';
}
// ── Menú del staff (celular): agrupa las acciones que antes ocupaban toda la barra ──
function staffMenu(){
  const grupos=[
    ['Personas',['btn-mi-codigo','btn-mi-filosofia','btn-ver-ent','btn-nuevo-ent','btn-conocimiento']],
    ['Datos y sistema',['btn-resumen','btn-apariencia','btn-lugares','btn-respaldo','btn-firebase','btn-reset']],
    ['Cuenta',['btn-eliminar-cuenta','btn-logout']]
  ];
  let html='';
  grupos.forEach(([t,ids])=>{
    const items=ids.map(id=>document.getElementById(id)).filter(b=>b && b.style.display!=='none');
    if(!items.length) return;
    html+=`<div class="sm-g">${t}</div>`+items.map(b=>{
      const raw=b.textContent.trim(); const m=raw.match(/^([^\p{L}\p{N}]+)\s*(.*)$/u);
      const svg=b.querySelector('svg'); const ic=b.id==='btn-logout'?ico('logout'):(svg?svg.outerHTML:ico('chev')), lb=m?m[2]:raw;
      const cls=(b.id==='btn-logout'||b.id==='btn-eliminar-cuenta')?' danger':(b.id==='btn-reset'?' warn':'');
      return `<button type="button" class="sm-row${cls}" onclick="staffMenuIr('${b.id}')"><span class="sm-ic">${ic}</span><span>${esc(lb)}</span></button>`;
    }).join('');
  });
  if(typeof verPerfilActivo==='function'){
    const on=verPerfilActivo();
    html=html.replace('<div class="sm-g">Cuenta</div>',`<div class="sm-g">Herramientas</div><button type="button" class="sm-row" role="switch" aria-checked="${on}" onclick="verPerfilAlternar();staffMenu()"><span class="sm-ic">${ico('user')}</span><span style="flex:1">Botón "Ver su perfil"<small class="sm-sub">Entra a la app del socio para explicarle cómo funciona</small></span><span class="sm-sw${on?' on':''}" aria-hidden="true"></span></button><div class="sm-g">Cuenta</div>`);
  }
  document.getElementById('staff-menu-title').textContent='Menú';
  document.getElementById('staff-menu-body').innerHTML=html;
  document.getElementById('modal-staff-menu').classList.add('open');
}
function staffMenuCerrar(){ document.getElementById('modal-staff-menu').classList.remove('open'); }
function staffMenuIr(id){ staffMenuCerrar(); const b=document.getElementById(id); if(b) setTimeout(()=>b.click(),60); }

function staffGetSocios(){
  const todos=(typeof sociosParaStaff==='function'?sociosParaStaff():Object.values(DB.socios||{})).filter(Boolean);
  if(staffRol==='coordinador' || !staffActivoEntId) return todos;
  // Cada entrenador o nutriólogo ve solo a quienes lo eligieron a él (entrenamiento) o se lo asignaron a él (nutrición).
  // Los socios sin asignar solo los ve el coordinador.
  return todos.filter(s=>s.entrenadorId===staffActivoEntId || s.nutriologoId===staffActivoEntId);
}
// Cliente sin entrenador: nunca eligió uno, o el suyo ya no existe (borró su cuenta). Su plan lo lleva el director.
function socioSinEntrenador(s){ const e=s && s.entrenadorId && getEntrenador(s.entrenadorId); return !e || e.rol==='coordinador'; }
function membBadgeCls(e){ return e.estado==='pendiente'?'pend':e.estado==='tolerancia'?'tol':e.estado==='inactivo'?'off':'ok'; }
function membBadgeTxt(e){ return e.estado==='pendiente'?'Pendiente':e.estado==='tolerancia'?'Tolerancia · '+e.restan+' d':e.estado==='inactivo'?'Inactivo':'Activo'; }
function staffRenderList(){
  const cont=document.getElementById('staff-socio-list'); if(!cont) return;
  try{ membSincronizar(); }catch(err){ console.warn('membSincronizar',err); }
  const todos=staffGetSocios();
  const est=s=>membEstado(s).estado;
  const cnt={todos:todos.length,pendiente:todos.filter(s=>s.status==='pendiente').length,activo:todos.filter(s=>{const e=est(s);return e==='activo'||e==='tolerancia';}).length,
    tolerancia:todos.filter(s=>est(s)==='tolerancia').length,inactivo:todos.filter(s=>est(s)==='inactivo').length,progresion:todos.filter(pqNecesitaAccion).length,sinent:todos.filter(socioSinEntrenador).length};
  ['todos','sinent','pendiente','activo','tolerancia','inactivo','progresion'].forEach(k=>{ const e=document.getElementById('slc-'+k); if(e) e.textContent=cnt[k]; });
  const tt=document.getElementById('sl-count'); if(tt) tt.textContent='('+todos.length+')';
  const av=document.getElementById('staff-memb-aviso');
  if(av){
    const porV=todos.filter(s=>{const e=membEstado(s);return e.estado==='activo'&&e.porVencer;}).length;
    av.innerHTML=(cnt.tolerancia||cnt.inactivo||porV)?`<div class="mb-aviso" onclick="staffFiltroDirecto('${cnt.tolerancia?'tolerancia':cnt.inactivo?'inactivo':'activo'}')"><b>🔔 Mensualidades</b>${cnt.tolerancia?cnt.tolerancia+' en tolerancia (tienen '+MEMB_TOL+' días para pagar). ':''}${cnt.inactivo?cnt.inactivo+' inactivo'+(cnt.inactivo>1?'s':'')+'. ':''}${porV?porV+(porV===1?' renueva':' renuevan')+' en 3 días o menos.':''}</div>`:'';
  }
  // Semáforo de atención: contadores que también filtran (Urgente / Atención / Al día)
  const mot={}; todos.forEach(x=>{ mot[x.code]=est(x)==='inactivo'?{c:'n',txt:'Mensualidad vencida'}:semaforoMotivo(x); });
  const att=document.getElementById('staff-att');
  if(att){
    const nS=k=>todos.filter(x=>mot[x.code].c===k).length;
    att.innerHTML=[['r','Urgente'],['y','Atención'],['g','Al día']].map(([k,l])=>
      `<button type="button" aria-pressed="${staffSemVal===k}" onclick="staffFiltroSem('${k}')"><b>${nS(k)}</b><span><i class="sl-dot ${k}"></i>${l}</span></button>`).join('');
  }
  let list=todos.slice();
  if(staffFilterVal==='sinent') list=list.filter(socioSinEntrenador);
  else if(staffFilterVal==='progresion') list=list.filter(pqNecesitaAccion);
  else if(staffFilterVal==='activo') list=list.filter(s=>{const e=est(s);return e==='activo'||e==='tolerancia';});
  else if(staffFilterVal==='tolerancia'||staffFilterVal==='inactivo'||staffFilterVal==='pendiente') list=list.filter(s=>est(s)===staffFilterVal);
  if(staffSemVal) list=list.filter(s=>mot[s.code].c===staffSemVal);
  const q=(staffSearchVal||'').trim().toLowerCase();
  if(q) list=list.filter(s=>String(s.nombre||'').toLowerCase().includes(q)||String(s.code||'').includes(q));
  // Primero lo que pide acción: planes por aprobar, luego rojo, amarillo, verde; inactivos al final
  const ordSem={r:1,y:2,g:3,n:4};
  const rango=s=>est(s)==='pendiente'?0:est(s)==='inactivo'?5:(ordSem[mot[s.code].c]||4);
  list.sort((a,b)=>(rango(a)-rango(b))||String(a.nombre||'').localeCompare(String(b.nombre||''),'es'));
  cont.innerHTML = list.length ? list.map(s=>{
    const ini=tc(s.nombre).split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const me=membEstado(s), m=mot[s.code];
    const badge=me.estado==='activo'?'':`<span class="sl-st ${membBadgeCls(me)}">${membBadgeTxt(me)}</span>`;
    return `<div class="sl-item${staffActivoId===s.code?' sel':''}${me.estado==='inactivo'?' off':''}" onclick="staffOpenSocio('${esc(s.code)}')" role="button" tabindex="0">
      <div class="sl-ini">${esc(ini)}${m.c!=='n'?`<i class="sl-dot ${m.c}"></i>`:''}</div>
      <div class="sl-tx"><div class="sl-nm">${esc(tc(s.nombre))}</div>${m.txt?`<div class="sl-why ${m.c}">${esc(m.txt)}</div>`:''}<div class="sl-sub">${esc(sc(s.objetivo))}${esc(pqBadgeLista(s))}</div></div>
      <div class="sl-der">${badge}<span class="sl-ult">${esc(ultimaSesionTxt(s))}</span>${typeof verPerfilBtnHTML==='function'?verPerfilBtnHTML(s):''}</div>
    </div>`;
  }).join('') : `<div class="empty-msg">${q?'Ningún socio coincide con tu búsqueda.':'Aún no hay socios en esta lista.'}</div>`;
}
function staffFiltroSem(k){ staffSemVal=staffSemVal===k?null:k; staffRenderList(); }
function staffFiltroDirecto(val){
  const btn=[...document.querySelectorAll('#staff-filters .sl-f')].find(b=>(b.getAttribute('onclick')||'').includes("'"+val+"'"));
  if(btn) staffFilterStatus(btn,val);
}
function staffFilterStatus(el,val){
  document.querySelectorAll('#staff-filters .sl-f').forEach(d=>d.classList.remove('ac'));
  el.classList.add('ac'); staffFilterVal=val; staffRenderList();
}
function staffFilterSocios(v){ staffSearchVal=v; staffRenderList(); }
function staffOpenSocio(code){
  // El expediente completo se descarga al abrir al socio (la lista solo trae el índice ligero)
  if(typeof idxCargarSocio==='function' && fbListo && !idxFallo && !(DB.socios[code] && !DB.socios[code]._lite)){
    staffActivoId=code; staffRenderList(); staffVista('detalle');
    const c=document.getElementById('staff-content');
    if(c) c.innerHTML='<div class="empty-msg" style="padding:40px;text-align:center">Cargando expediente…</div>';
    idxCargarSocio(code).then(s=>{ if(staffActivoId!==code) return; if(s) staffOpenSocio(code); else if(c) c.innerHTML='<div class="empty-msg" style="padding:40px;text-align:center">No se pudo cargar este socio. Revisa tu conexión.</div>'; });
    return;
  }
  staffActivoId=code; staffRenderList();
  const s=getSocio(code);
  if(s && staffTabCode!==code){ staffTabCode=code; staffTab=(s.status==='pendiente')?'rutina':'evolucion'; staffProgSel='actual'; }
  if(!s){ showToast('⚠ No se encontró ese socio en la base de datos (code: '+code+')'); return; }
  try{
    staffRenderContent(s); staffVista('detalle');
  }catch(e){
    console.error('Error al abrir socio', code, e);
    showToast('⚠ Error al abrir el socio — revisa la consola (F12)');
  }
}

function staffRenderContent(s){
  const ca=document.getElementById('staff-content');
  const isPend=s.status==='pendiente';
  const ev=calcEvolucion(s);
  const pesoNow=pesoActual(s);
  if(!s.rutina) s.rutina={};
  DIAS_ORDER.forEach(k=>{
    if(!s.rutina[k]) s.rutina[k]={tipo:'DESCANSO',color:'descanso',ejercicios:[]};
    if(!Array.isArray(s.rutina[k].ejercicios)) s.rutina[k].ejercicios=[];
  });
  const puedeEd=staffRol==='coordinador';

  // ── Pestañas: Resumen · Rutina · Nutrición · Progresión ──
  if(staffTab==='progresion' && isPend) staffTab='rutina';
  const hotProg = !isPend && pqNecesitaAccion(s);
  const TABS=[['evolucion','Resumen','chart'],['rutina','Rutina','dumbbell'],['nutricion','Nutrición','leaf'],['progresion','Progresión','trophy']];
  const tabsHTML=`<div class="sd-tabs fx-tabs" id="sd-tabs" role="tablist">${TABS.map(([id,nm,ic])=>`<button type="button" role="tab" class="tb${staffTab===id?' on':''}" data-t="${id}" onclick="staffSetTab('${id}')">${ico(ic)}<span>${nm}</span>${(id==='progresion'&&hotProg)?'<i></i>':''}</button>`).join('')}</div>`;
  const pane=(id,html)=>`<div class="sd-pane${staffTab===id?' on':''}" id="sdp-${id}">${html}</div>`;
  const me=membEstado(s);
  const sub=[sc(s.nivel),sc(s.objetivo)].filter(Boolean).join(', ');

  ca.innerHTML=`
    <datalist id="kb-nombres">${casaNombresDatalist(s)}</datalist>
    <div class="sd fx">
      <div class="fx-head">
        <div class="fx-id"><div class="fx-nom">${esc(tc(s.nombre))}</div><div class="fx-sub">${esc(sub)}<span class="fx-cod">${esc(s.id)}</span></div></div>
        ${me.estado==='activo'&&!puedeEd?'':membBadgeHTML(s,puedeEd)}
      </div>
      ${isPend?`<div class="sd-alert">Plan generado por cuestionario: pendiente de tu revisión y aprobación.${s.origenRutina==='plantilla'?' <b>Se generó con la plantilla base (la IA no estaba disponible); revísalo con más detalle.</b>':s.origenRutina==='ia'?' Generado con IA.':''}</div>`:''}
      ${tabsHTML}
      ${pane('evolucion',fxResumenHTML(s,ev,pesoNow,puedeEd))}
      ${pane('rutina',rtRutinaHTML(s))}
      ${pane('nutricion',bloqueNutricionStaff(s))}
      ${pane('progresion',bloqueProgresionTab(s))}
      <div class="sd-bar fx-bar${staffDirty.has(s.code)||isPend?' on':''}" id="fx-bar">
        <span class="fx-bar-msg">${staffDirty.has(s.code)?'Cambios sin guardar':''}</span>
        ${isPend?`<button type="button" class="sd-pri ghost" onclick="staffAprobar('${s.code}')">Aprobar plan</button>`:''}
        <button type="button" class="sd-pri" onclick="staffGuardar('${s.code}')">Guardar cambios</button>
      </div>
    </div>`;
  if(typeof rtTrasPintar==='function') rtTrasPintar(s);
}
// Barra de guardar: aparece en cuanto hay un cambio sin guardar en la ficha abierta
function staffBarSync(){
  const b=document.getElementById('fx-bar'); if(!b||!staffActivoId) return;
  const s=getSocio(staffActivoId), sucio=staffDirty.has(staffActivoId);
  b.classList.toggle('on',sucio||(s&&s.status==='pendiente'));
  const m=b.querySelector('.fx-bar-msg'); if(m) m.textContent=sucio?'Cambios sin guardar':'';
}
(function(){ const a=staffDirty.add.bind(staffDirty), d=staffDirty.delete.bind(staffDirty);
  staffDirty.add=function(c){ const r=a(c); staffBarSync(); return r; };
  staffDirty.delete=function(c){ const r=d(c); staffBarSync(); return r; }; })();

// ── Resumen: lo urgente arriba, luego la semana, los datos, el peso, las cargas y las últimas sesiones ──
function fxSemanaHTML(s,ev){
  const hoy=new Date(), lun=inicioSemana(hoy), hoyIdx=(hoy.getDay()+6)%7;
  const hechas=new Set(sesValidas(s).map(x=>x.fecha));
  const letras=['L','M','M','J','V','S','D'];
  const dias=DIAS_ORDER.map((k,i)=>{
    const d=new Date(lun); d.setDate(lun.getDate()+i);
    const toca=comoArray(s.rutina&&s.rutina[k]&&s.rutina[k].ejercicios).length>0;
    const hecho=hechas.has(fechaISO(d));
    const st=hecho?'done':toca?(i<hoyIdx?'miss':'plan'):'rest';
    const lb={done:'entrenó',miss:'faltó',plan:'toca',rest:'descanso'}[st];
    return `<div class="${i===hoyIdx?'hoy':''}"><i class="${st}" title="${sc(DIAS_NAMES[k])}: ${lb}">${st==='done'?ico('check'):st==='miss'?ico('close'):''}</i>${letras[i]}</div>`;
  }).join('');
  const dp=ev.deltaPeso;
  return `<section class="fx-sec"><h3>Esta semana <small>${ev.estaSemana} de ${esc(s.dias)} sesiones</small></h3><div class="fx-panel">
    <div class="fx-wk">${dias}</div>
    <div class="fx-stats"><div><b>${ev.total}</b><span>sesiones en total</span></div><div><b>${ev.adherencia}%</b><span>asistencia, 4 semanas</span></div><div><b>${dp===null?'Sin datos':(dp>0?'+':'')+dp+' kg'}</b><span>cambio de peso</span></div></div>
  </div></section>`;
}
function fxDatosHTML(s,pesoNow,puedeEd){
  const me=membEstado(s);
  const lims=comoArray(s.limitaciones);
  const ent=s.entrenadorId&&DB.entrenadores&&DB.entrenadores[s.entrenadorId];
  const nut=s.nutriologoId&&DB.entrenadores&&DB.entrenadores[s.nutriologoId];
  const membTx=me.sinFecha?'Sin fecha de renovación':membTxt(s);
  return `<section class="fx-sec"><h3>Datos ${puedeEd?`<button type="button" class="fx-lnk" onclick="abrirEditarSocio('${s.code}')">${ico('pencil')}Editar</button>`:''}</h3><div class="fx-panel">
    <dl class="fx-dl">
      <div><dt>Edad</dt><dd>${esc(s.edad||'Sin dato')} <small>años</small></dd></div>
      <div><dt>Peso</dt><dd>${esc(pesoNow)} <small>kg</small></dd></div>
      <div><dt>Estatura</dt><dd>${esc(s.estatura||'Sin dato')} <small>cm</small></dd></div>
      <div><dt>Nivel</dt><dd>${esc(sc(s.nivel))}</dd></div>
      <div><dt>Objetivo</dt><dd>${esc(sc(s.objetivo))}</dd></div>
      <div><dt>Días</dt><dd>${esc(s.dias)} <small>por semana</small></dd></div>
    </dl>
    <div class="fx-rows">
      <div><span>Limitaciones</span><b>${lims.length?lims.map(l=>`<span class="fx-lim">${ico('warn')}${esc(sc(l))}</span>`).join(''):'Ninguna'}</b></div>
      ${(s.gimnasta&&s.gimnasta.alarmas&&s.gimnasta.alarmas.length)?`<div><span>Señal de alarma</span><b class="fx-rojo">${esc(s.gimnasta.alarmas.join(', '))}. Requiere valoración médica</b></div>`:''}
      ${(s.clasesGrupales&&s.clasesGrupales.length)?`<div><span>Clases grupales</span><b>${s.clasesGrupales.map(c=>esc(c.clase)+' ('+c.dias.map(d=>sc(DIAS_NAMES[d]).substring(0,3)).join(', ')+')').join('; ')}</b></div>`:''}
      <div><span>Entrenador</span><b>${esc((ent&&ent.nombre)||s.asignado||'Sin asignar')}</b></div>
      <div><span>Nutrición</span><b>${esc((nut&&nut.nombre)||s.nutriologo||'Su entrenador')}</b></div>
      ${me.sinFecha&&!puedeEd?'':`<div><span>Mensualidad</span><b class="${me.estado==='tolerancia'?'fx-ambar':me.estado==='inactivo'?'fx-rojo':''}">${puedeEd?`<button type="button" class="fx-lnk" onclick="membAbrir('${s.code}')">${esc(membTx)}</button>`:esc(membTx)}</b></div>`}
    </div>
    ${puedeEd?`<details class="fx-asig"><summary>Cambiar entrenador o nutriólogo</summary>${bloqueAsignacionStaff(s)}</details>`:''}
  </div></section>`;
}
function fxPesoHTML(s){
  const P=comoArray(s.logs&&s.logs.pesoCorporal).filter(x=>x&&x.kg).slice(-12);
  if(P.length<2) return '';
  const W=520,H=170,pl=36,pr=64,pt=14,pb=26;
  const vs=P.map(x=>+x.kg), mn=Math.floor(Math.min(...vs)-0.5), mx=Math.ceil(Math.max(...vs)+0.5);
  const x=i=>pl+i*(W-pl-pr)/(P.length-1), y=v=>pt+(mx-v)*(H-pt-pb)/(mx-mn);
  const pts=P.map((p,i)=>x(i).toFixed(1)+','+y(+p.kg).toFixed(1)).join(' ');
  const paso=Math.max(1,Math.ceil((mx-mn)/3));
  let g=''; for(let v=mn;v<=mx;v+=paso) g+=`<line class="gl" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  const L=P.length-1, f=i=>esc(fmtFecha(P[i].fecha));
  return `<section class="fx-sec"><h3>Peso <small>${P.length} registros</small></h3><div class="fx-panel">
    <svg class="fx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peso de ${vs[0]} a ${vs[L]} kg">${g}
      <polygon class="ar" points="${x(0)},${H-pb} ${pts} ${x(L)},${H-pb}"/><polyline class="ln" points="${pts}"/>
      <circle class="end" cx="${x(L)}" cy="${y(vs[L])}" r="6"/><text class="endt" x="${x(L)+10}" y="${y(vs[L])+4}">${vs[L]} kg</text>
      <text x="${x(0)}" y="${H-6}">${f(0)}</text><text x="${x(L)}" y="${H-6}" text-anchor="end">${f(L)}</text></svg>
  </div></section>`;
}
function fxCargasHTML(s){
  const a=analisisSocio(s);
  if(!a.sesiones.length) return `<section class="fx-sec"><h3>Cargas</h3><div class="fx-panel"><p class="fx-vacio">Aún no hay sesiones registradas. En cuanto entrene verás aquí qué ejercicios suben de peso y cuáles se estancaron.</p></div></section>`;
  const fila=(nm,cls,txt)=>`<div><span>${esc(nm)}</span><b class="${cls}">${txt}</b></div>`;
  const filas=a.subiendo.slice(0,5).map(n=>fila(n,'fx-up','Subiendo')).join('')+a.estancados.slice(0,5).map(n=>fila(n,'fx-ambar','Sin subir en 3 sesiones')).join('');
  const flecha=a.volAnt==null?'':(a.volUlt>a.volAnt*1.05?', más que la anterior':a.volUlt<a.volAnt*0.95?', menos que la anterior':', igual que la anterior');
  return `<section class="fx-sec"><h3>Cargas <small>${a.diasSin===0?'entrenó hoy':a.diasSin===1?'entrenó ayer':'última sesión hace '+a.diasSin+' días'}</small></h3><div class="fx-panel">
    <p class="fx-nota">${Math.round(a.volUlt).toLocaleString('es-MX')} kg de volumen esta semana${flecha}.</p>
    ${filas?`<div class="fx-rows fx-rows-top">${filas}</div>`:'<p class="fx-vacio">Aún no hay suficientes sesiones con peso registrado por ejercicio para ver tendencia.</p>'}
  </div></section>`;
}
function fxSesionesHTML(s){
  const r=comoArray(s.logs&&s.logs.sesiones).filter(Boolean).slice(-6).reverse();
  if(!r.length) return '';
  return `<section class="fx-sec fx-full"><h3>Últimas sesiones</h3><div class="fx-panel fx-rows">${r.map(x=>{
    const det=[x.volumen?Math.round(x.volumen).toLocaleString('es-MX')+' kg':'', x.tut>=20?fmtTut(x.tut):'', x.cardioMin?x.cardioMin+' min de cardio':''].filter(Boolean).join(', ');
    return `<div><span>${esc(fmtFecha(x.fecha))}${x.tipo?', '+esc(sc(x.tipo)):''}</span><b>${esc(det)}</b></div>`; }).join('')}</div></section>`;
}
function fxResumenHTML(s,ev,pesoNow,puedeEd){
  return `<div class="fx-grid">
    ${(dolorStaffHTML(s)||objMetaStaffHTML(s)||evalStaffHTML(s))?`<div class="fx-full">${dolorStaffHTML(s)}${typeof objMetaStaffHTML==='function'?objMetaStaffHTML(s):''}${evalStaffHTML(s)}</div>`:''}
    ${fxSemanaHTML(s,ev)}
    ${fxDatosHTML(s,pesoNow,puedeEd)}
    ${fxPesoHTML(s)}
    ${fxCargasHTML(s)}
    ${fxSesionesHTML(s)}
  </div>`;
}

// ═════════════════════════════════════════
// PANEL DEL STAFF · pestañas
// ═════════════════════════════════════════
let staffTab='evolucion', staffTabCode=null, staffProgSel='actual';
const staffRutBackup={};             // respaldo de la rutina antes de cargar un bloque anterior
function staffSetTab(t){
  staffTab=t;
  document.querySelectorAll('#sd-tabs .tb').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  document.querySelectorAll('#staff-content .sd-pane').forEach(p=>p.classList.toggle('on',p.id==='sdp-'+t));
  const el=document.getElementById('sd-tabs'); if(el&&el.scrollIntoView) el.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function staffRerender(code,k){
  const s=getSocio(code); if(!s) return;
  if(k) rtDia[code]=k;
  staffRenderContent(s);
}
