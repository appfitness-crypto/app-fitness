/* ═══ menú del entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   El entrenador o nutriólogo arma el menú de su socio con los platillos de la biblioteca (js/48): elige el número
   de comidas, la hora de cada una, el platillo y las porciones. Lo que guarda queda en s.nutricion.plan y es lo
   que el socio ve como definitivo (sin "Otra opción"). Sigue la skill nutricion-deportiva. ═══ */

const MA_HORAS={'Desayuno':'08:00','Colación AM':'11:00','Comida':'14:30','Colación PM':'17:30','Colación':'17:30','Cena':'20:30','Colación noche':'22:00'};
const MA_TIEMPOS=[['sug','Para esta comida'],['des','Desayunos'],['col','Colaciones'],['com','Comidas'],['cen','Cenas'],['todos','Todos']];
let MA=null;                               // menú en edición: {code, n, comidas:[{nombre,hora,id,q,nota}]}
let MQ={i:0, t:'sug', q:'', pref:{}};      // buscador de platillos

function maPlat(id){ return MENU_PLATILLOS.find(p=>p.id===id)||null; }
// Aporte de un platillo con sus cantidades (q va alineado con platillo.c, en equivalentes)
function maCalc(id,q){
  const p=maPlat(id); if(!p) return null;
  let k=0,pr=0,l=0,c=0;
  p.c.forEach(([f],i)=>{ const m=menuMacros(f,+q[i]||0); k+=m.k; pr+=m.p; l+=m.l; c+=m.c; });
  return {k,p:pr,l,c};
}
function maMetas(s,n){ return menuMetasComidas(s,nutricionFinal(s),n); }
function maTope(f,max){ const a=MENU_ALIM[f]; return Math.max(max||1, a.tope||Math.max(3,(max||1)*2)); }
function maSin(f){ const a=MENU_ALIM[f]; return 'Sin '+String(a.u==='n'||a.u==='fr'?a.s:a.s.replace(/^de /,'')); }
function maNum(x){ return Math.round(x).toLocaleString('es-MX'); }

// ── Resumen en la ficha del socio (pestaña Nutrición del panel) ──
function maResumenStaffHTML(s){
  const plan=s.nutricion&&s.nutricion.plan, puede=nutPuedeEditar(s), c=esc(s.code);
  const legado=comoArray(s.nutricion&&s.nutricion.menu);
  if(!plan||!comoArray(plan.comidas).length){
    return `<section class="fx-sec"><h3>Menú del socio</h3><div class="fx-panel">
      <p class="fx-vacio">${legado.length?'Tiene un menú escrito a mano (formato anterior). Ármalo con platillos para que vea fotos, porciones y horarios.':'Ahora ve el menú automático de la app, que cambia cada día. Si armas uno, verá el tuyo como definitivo.'}</p>
      ${legado.length?`<div class="nt-menu" style="margin-top:10px">${legado.map(m=>`<div><b>${esc(m.nombre)}</b><span>${esc(m.detalle)}</span></div>`).join('')}</div>`:''}
      ${puede?`<div class="fx-acts" style="margin-top:12px"><button type="button" class="sd-b p" onclick="maAbrir('${c}')">${ico('food')}Armar menú</button></div>`:''}
    </div></section>`;
  }
  const nut=nutricionFinal(s), tot={k:0,p:0,c:0,l:0};
  const filas=comoArray(plan.comidas).map(m=>{
    const r=m.id&&maCalc(m.id,m.q); if(r){ tot.k+=r.k; tot.p+=r.p; tot.c+=r.c; tot.l+=r.l; }
    const p=m.id&&maPlat(m.id), fid=p&&menuFotoId(p.id);
    return `<li>${fid?`<img src="${menuFotoSrc(fid)}" alt="" loading="lazy" width="64" height="40">`:`<span class="ma-ph">${ico('food')}</span>`}
      <div><b>${esc(m.hora||'')}${m.hora?' · ':''}${esc(m.nombre)}</b><span>${p?esc(p.n):'Sin platillo'}</span></div><em>${r?maNum(r.k)+' kcal':''}</em></li>`;
  }).join('');
  const dev=nut.kcal?(tot.k-nut.kcal)/nut.kcal:0, ok=Math.abs(dev)<=MENU_TOL_DIA;
  return `<section class="fx-sec"><h3>Menú del socio ${puede?`<button type="button" class="fx-lnk" onclick="maAbrir('${c}')">${ico('pencil')}Editar menú</button>`:''}</h3><div class="fx-panel">
    <div class="ma-por">Asignado por ${esc(plan.por||'staff')}${plan.fecha?' · '+esc(fmtFecha(plan.fecha)):''} · el socio lo ve como definitivo</div>
    <ul class="ma-res">${filas}</ul>
    <div class="mn-total ${ok?'ok':'warn'}">${ico(ok?'check':'warn')}<span><b>${maNum(tot.k)} de ${maNum(nut.kcal)} kcal</b> (${dev>=0?'+':''}${Math.round(dev*100)}%) · P ${maNum(tot.p)} g · C ${maNum(tot.c)} g · G ${maNum(tot.l)} g</span></div>
  </div></section>`;
}

// ── Editor ──
function maAsegurarModales(){
  if(document.getElementById('modal-menu-staff')) return;
  const w=document.createElement('div');
  w.innerHTML=`<div class="modal" id="modal-menu-staff" onclick="if(event.target===this)maCerrar()">
      <div class="mbox ma-box" role="dialog" aria-modal="true" aria-labelledby="ma-titulo"><div class="mx" onclick="maCerrar()" aria-label="Cerrar">✕</div><div id="ma-cuerpo"></div></div></div>
    <div class="modal" id="modal-platillo" onclick="if(event.target===this)mqCerrar()">
      <div class="mbox mq-box" role="dialog" aria-modal="true" aria-labelledby="mq-titulo"><div class="mx" onclick="mqCerrar()" aria-label="Cerrar">✕</div>
        <div class="m-title" id="mq-titulo" style="font-size:var(--fs-3xl);margin-bottom:6px">Elegir platillo</div>
        <div class="ep-ctx" id="mq-ctx"></div>
        <input class="sf-in mq-q" id="mq-q" aria-label="Buscar platillo" placeholder="Buscar platillo o ingrediente…" oninput="MQ.q=this.value;mqRender()" autocomplete="off">
        <div id="mq-filtros"></div><div id="mq-lista" class="mq-lista"></div></div></div>`;
  while(w.firstChild) document.body.appendChild(w.firstChild);
}
function maSlots(s,n,previas){
  const usadas=new Set();
  return (MEAL_TEMPLATES[n]||MEAL_TEMPLATES[4]).map(t=>{
    const j=(previas||[]).findIndex((m,ix)=>!usadas.has(ix)&&m.nombre===t.nombre);
    if(j>=0){ usadas.add(j); return Object.assign({},previas[j]); }
    return {nombre:t.nombre, hora:MA_HORAS[t.nombre]||'', id:null, q:[], nota:''};
  });
}
function maAbrir(code){
  const s=getSocio(code); if(!s) return;
  if(!nutPuedeEditar(s)){ showToast('No tienes permiso para editar la nutrición de este socio'); return; }
  const plan=s.nutricion&&s.nutricion.plan;
  if(plan&&comoArray(plan.comidas).length){
    const comidas=comoArray(plan.comidas).map(m=>({nombre:m.nombre||'',hora:m.hora||'',id:m.id||null,q:comoArray(m.q).map(Number),nota:m.nota||''}));
    MA={code, n:comidas.length, comidas, nuevo:false};
  } else {
    const n=[3,4,5,6].includes(+s.comidasPorDia)?+s.comidasPorDia:4;
    MA={code, n, comidas:maSlots(s,n,[]), nuevo:true};
  }
  maAsegurarModales(); maRender();
  document.getElementById('modal-menu-staff').classList.add('open');
}
function maCerrar(){ const m=document.getElementById('modal-menu-staff'); if(m) m.classList.remove('open'); MA=null; }
function maRender(){
  if(!MA) return; const s=getSocio(MA.code); if(!s) return;
  const nut=nutricionFinal(s), metas=maMetas(s,MA.n);
  const tot={k:0,p:0,c:0,l:0}; let conPlat=0;
  const cards=MA.comidas.map((m,i)=>{
    const meta=metas[i]||metas[metas.length-1], r=m.id&&maCalc(m.id,m.q), p=m.id&&maPlat(m.id);
    if(r){ tot.k+=r.k; tot.p+=r.p; tot.c+=r.c; tot.l+=r.l; conPlat++; }
    const dv=r&&meta?(r.k-meta.T.k)/meta.T.k:0, okC=Math.abs(dv)<=MENU_TOL_COMIDA;
    const fid=p&&menuFotoId(p.id);
    const ing=p?p.c.map(([f,,min,max,paso],ci)=>{
      const a=MENU_ALIM[f], q=+m.q[ci]||0;
      if(a.u==='libre') return `<li class="libre"><span>${esc(a.s)}</span></li>`;
      const st=paso||1, tope=maTope(f,max);
      return `<li class="${q?'':'cero'}"><span>${esc(q?menuPorcion(f,q):maSin(f))}</span>
        <div class="ma-st"><button type="button" onclick="maPaso(${i},${ci},-1)" aria-label="Menos ${esc(a.s)}" ${q<=0?'disabled':''}>−</button><button type="button" onclick="maPaso(${i},${ci},1)" aria-label="Más ${esc(a.s)}" ${q+st>tope+1e-9?'disabled':''}>+</button></div></li>`;
    }).join(''):'';
    return `<article class="ma-c${p?'':' vacia'}">
      <div class="ma-c-h">
        <input type="time" class="ma-hora" value="${esc(m.hora)}" aria-label="Hora de ${esc(m.nombre)}" onchange="maCampo(${i},'hora',this.value)">
        <input class="ma-nom" value="${esc(m.nombre)}" aria-label="Nombre de la comida" onchange="maCampo(${i},'nombre',this.value)">
        <span class="ma-meta">${meta?Math.round(meta.pctD*100)+'% · meta ~'+maNum(meta.T.k)+' kcal':''}${meta&&meta.rol?` · <b>${meta.rol==='pre'?'antes de entrenar':'después de entrenar'}</b>`:''}</span>
      </div>
      ${p?`<div class="ma-c-p">
          ${fid?`<img src="${menuFotoSrc(fid)}" alt="" width="96" height="60" loading="lazy">`:`<span class="ma-ph">${ico('food')}</span>`}
          <div class="ma-c-n"><b>${esc(p.n)}</b><small class="${okC?'':'w'}">${maNum(r.k)} kcal${meta?` (${dv>=0?'+':''}${Math.round(dv*100)}%)`:''} · P ${maNum(r.p)} · C ${maNum(r.c)} · G ${maNum(r.l)}</small></div>
          <button type="button" class="ma-chg" onclick="mqAbrir(${i})">Cambiar</button></div>
        <ul class="ma-ing">${ing}</ul>
        <div class="ma-c-a"><button type="button" class="ma-lnk" onclick="maAjustar(${i})">${ico('target')}Ajustar a la meta</button><button type="button" class="ma-lnk dng" onclick="maQuitarPlat(${i})">${ico('trash')}Quitar</button></div>
        <input class="sf-in ma-nota" value="${esc(m.nota)}" placeholder="Nota para el socio (opcional), ej. sin sal" aria-label="Nota de ${esc(m.nombre)}" onchange="maCampo(${i},'nota',this.value)">`
      :`<button type="button" class="ma-elegir" onclick="mqAbrir(${i})">${ico('plus')}Elegir platillo</button>`}
    </article>`;
  }).join('');
  const dev=nut.kcal?(tot.k-nut.kcal)/nut.kcal:0, ok=Math.abs(dev)<=MENU_TOL_DIA&&conPlat===MA.comidas.length;
  const barra=(v,meta,cls)=>`<i class="${cls}" style="width:${Math.min(100,meta?v/meta*100:0)}%"></i>`;
  document.getElementById('ma-cuerpo').innerHTML=`
    <div class="m-tag">Menú · ${esc(tc(s.nombre))}</div>
    <div class="m-title" id="ma-titulo" style="font-size:var(--fs-3xl)">Armar menú</div>
    <div class="ma-sum ${ok?'ok':conPlat?'warn':''}">
      <div class="ma-sum-t"><b>${maNum(tot.k)}</b> de ${maNum(nut.kcal)} kcal ${conPlat?`<span>${dev>=0?'+':''}${Math.round(dev*100)}%</span>`:''}</div>
      <div class="ma-bar">${barra(tot.k,nut.kcal,'k')}</div>
      <div class="ma-mac"><span><i class="m-p"></i>P ${maNum(tot.p)}/${nut.prot} g</span><span><i class="m-c"></i>C ${maNum(tot.c)}/${nut.carbs} g</span><span><i class="m-g"></i>G ${maNum(tot.l)}/${nut.grasas} g</span></div>
    </div>
    <div class="ma-g"><div class="rt-gl">Comidas al día</div>
      <div class="ch-row">${[3,4,5,6].map(n=>`<button type="button" class="ch${n===MA.n?' on':''}" aria-pressed="${n===MA.n}" onclick="maSetN(${n})">${n}</button>`).join('')}</div></div>
    <div class="ma-tools">
      <button type="button" class="sd-b" onclick="maSugerir()">${ico('spark')}${conPlat?'Llenar vacías con sugerencia':'Partir del menú sugerido'}</button>
      ${conPlat?`<button type="button" class="sd-b" onclick="maAjustarTodo()">${ico('target')}Ajustar todo a la meta</button>`:''}
    </div>
    <div class="ma-lista">${cards}</div>
    <p class="f-nota">Lo que guardes es lo que verá el socio en su pestaña de Nutrición, con fotos, porciones y horarios. Las porciones son sugerencia educativa; revisa alergias o condiciones médicas del socio.</p>
    <div class="ma-f">
      ${!MA.nuevo?`<button type="button" class="sd-b rt-dng" onclick="maQuitarPlan()">Volver al automático</button>`:''}
      <button type="button" class="sd-pri" onclick="maGuardar()" ${conPlat?'':'disabled'}>Guardar menú</button>
    </div>`;
}
function maCampo(i,f,v){ if(!MA||!MA.comidas[i]) return; MA.comidas[i][f]=f==='hora'?String(v||''):limpiarTexto(v); if(f!=='nota') maRender(); }
function maSetN(n){ if(!MA) return; const s=getSocio(MA.code); MA.n=n; MA.comidas=maSlots(s,n,MA.comidas); maRender(); }
function maPaso(i,ci,d){
  const m=MA&&MA.comidas[i], p=m&&maPlat(m.id); if(!p) return;
  const [f,,,max,paso]=p.c[ci], st=paso||1;
  m.q[ci]=Math.max(0,Math.min(maTope(f,max),Math.round(((+m.q[ci]||0)+d*st)*100)/100));
  maRender();
}
function maMetaDe(i){ const s=getSocio(MA.code), metas=maMetas(s,MA.n); return metas[i]||metas[metas.length-1]; }
function maAjustar(i){
  const m=MA&&MA.comidas[i], p=m&&maPlat(m.id); if(!p) return;
  const meta=maMetaDe(i), r=menuEscalar(p,meta.T,meta.rol==='pre');
  if(r){ m.q=r.q.slice(); maRender(); showToast('Porciones ajustadas a ~'+maNum(meta.T.k)+' kcal'); }
}
function maAjustarTodo(){ if(!MA) return; MA.comidas.forEach((m,i)=>{ const p=m.id&&maPlat(m.id); if(!p) return; const meta=maMetaDe(i), r=menuEscalar(p,meta.T,meta.rol==='pre'); if(r) m.q=r.q.slice(); }); maRender(); showToast('Porciones ajustadas a la meta de cada comida'); }
function maQuitarPlat(i){ const m=MA&&MA.comidas[i]; if(!m) return; m.id=null; m.q=[]; maRender(); }
// Llena las comidas vacías (o todas, si no hay ninguna) con el generador automático, respetando lo ya elegido
function maSugerir(){
  if(!MA) return; const s=getSocio(MA.code), nut=nutricionFinal(s);
  const dia=generarMenuDia(Object.assign({},s,{menuAlt:null}),nut,MA.n);
  const usados=new Set(MA.comidas.map(m=>m.id).filter(Boolean));
  dia.comidas.forEach((d,i)=>{
    const m=MA.comidas[i]; if(!m||m.id||!d.r) return;
    if(usados.has(d.r.platillo.id)){
      const alt=(d.pool||[]).find(p=>!usados.has(p.id)); if(!alt) return;
      const r=menuEscalar(alt,d.T,d.rol==='pre'); if(!r) return; m.id=alt.id; m.q=r.q.slice();
    } else { m.id=d.r.platillo.id; m.q=d.r.q.slice(); }
    usados.add(m.id);
  });
  maRender(); showToast('Listo: revisa y ajusta lo que quieras');
}
function maGuardar(){
  if(!MA) return; const s=getSocio(MA.code); if(!s||!nutPuedeEditar(s)) return;
  const comidas=MA.comidas.filter(m=>m.id).map(m=>({nombre:limpiarTexto(m.nombre)||'Comida', hora:m.hora||'', id:m.id, q:m.q.map(x=>Math.round(+x*100)/100), nota:limpiarTexto(m.nota||'')}));
  if(!comidas.length){ showToast('Elige al menos un platillo'); return; }
  const o=s.nutricion||{override:false};
  s.nutricion=Object.assign({},o,{plan:{comidas, por:pqStaffNombre(), fecha:fechaISO(new Date())}});
  pqGuardarStaff(s,['nutricion']);
  maCerrar(); staffRenderList(); staffRenderContent(s);
  showToast('Menú asignado. El socio ya lo ve en su app');
}
function maQuitarPlan(){
  if(!MA) return; const code=MA.code, s=getSocio(code); if(!s||!nutPuedeEditar(s)) return;
  uiConfirm('¿Quitar el menú asignado? El socio volverá a ver el menú automático de la app.',()=>{
    const o=Object.assign({},s.nutricion); delete o.plan;
    if(o.override||comoArray(o.menu).length||o.nota) s.nutricion=o; else delete s.nutricion;
    pqGuardarStaff(s,['nutricion']); maCerrar(); staffRenderList(); staffRenderContent(s);
    showToast('El socio ve de nuevo el menú automático');
  },{label:'Quitar menú',danger:true});
}

// ── Buscador de platillos ──
function mqAbrir(i){
  if(!MA) return; const s=getSocio(MA.code), m=MA.comidas[i]; if(!s||!m) return;
  MQ={i, t:'sug', q:'', pref:Object.assign({},s.nutPrefs||{})};
  const meta=maMetaDe(i);
  document.getElementById('mq-titulo').textContent=(m.id?'Cambiar platillo':'Elegir platillo')+' · '+m.nombre;
  document.getElementById('mq-ctx').textContent='Meta de esta comida: ~'+maNum(meta.T.k)+' kcal · P '+maNum(meta.T.p)+' g. Las porciones se ajustan solas al elegir.'+(meta.rol==='pre'?' Es antes de entrenar: sin leguminosas ni grasa.':'');
  document.getElementById('mq-q').value='';
  document.getElementById('modal-platillo').classList.add('open');
  mqRender();
}
function mqCerrar(){ const m=document.getElementById('modal-platillo'); if(m) m.classList.remove('open'); }
function mqTiempo(t){ MQ.t=t; mqRender(); }
function mqPref(k){ MQ.pref[k]=!MQ.pref[k]; mqRender(); }
function mqRender(){
  if(!MA) return; const m=MA.comidas[MQ.i], meta=maMetaDe(MQ.i), esPre=meta.rol==='pre';
  const tiempo=menuTiempo(m.nombre), q=kbNorm(MQ.q||'');
  document.getElementById('mq-filtros').innerHTML=
    `<div class="ep-rowc">${MA_TIEMPOS.map(([t,lb])=>`<button type="button" class="ch${MQ.t===t&&!q?' on':''}" onclick="mqTiempo('${t}')">${lb}</button>`).join('')}</div>
     <div class="ep-rowc">${MENU_PREFS.map(([k,lb])=>`<button type="button" class="ch${MQ.pref[k]?' on':''}" aria-pressed="${!!MQ.pref[k]}" onclick="mqPref('${k}')">${lb}</button>`).join('')}</div>`;
  const usados=new Set(MA.comidas.map((x,ix)=>ix!==MQ.i&&x.id).filter(Boolean));
  let items=MENU_PLATILLOS.filter(p=>menuPlatilloApto(p,MQ.pref,false));
  if(q) items=items.filter(p=>kbNorm(p.n).includes(q)||p.c.some(([f])=>kbNorm(MENU_ALIM[f].s+' '+(MENU_ALIM[f].pl||'')).includes(q)));
  else if(MQ.t==='sug') items=items.filter(p=>p.t.includes(tiempo));
  else if(MQ.t!=='todos') items=items.filter(p=>p.t.includes(MQ.t));
  const filas=items.map(p=>{
    const apto=!esPre||menuPlatilloApto(p,{},true), r=menuEscalar(p,meta.T,esPre&&apto);
    return {p,r,apto,err:r?r.err:9};
  }).sort((a,b)=>(a.apto?0:1)-(b.apto?0:1)||(usados.has(a.p.id)?1:0)-(usados.has(b.p.id)?1:0)||a.err-b.err);
  document.getElementById('mq-lista').innerHTML=filas.length?filas.map(({p,r,apto})=>{
    const fid=menuFotoId(p.id), sel=m.id===p.id;
    return `<button type="button" class="mq-it${sel?' on':''}${apto?'':' mal'}" onclick="mqElegir('${p.id}')">
      ${fid?`<img src="${menuFotoSrc(fid)}" alt="" width="160" height="100" loading="lazy">`:`<span class="ma-ph">${ico('food')}</span>`}
      <b>${esc(p.n)}</b>
      <span>${r?'~'+maNum(r.k)+' kcal · P '+maNum(r.p)+' g':''}${usados.has(p.id)?' · ya en el menú':''}${apto?'':' · no ideal antes de entrenar'}</span>
    </button>`;
  }).join(''):`<div class="ep-vacio">No hay platillos con ese filtro. Quita algún filtro o busca otro ingrediente.</div>`;
}
function mqElegir(id){
  if(!MA) return; const p=maPlat(id), m=MA.comidas[MQ.i]; if(!p||!m) return;
  const meta=maMetaDe(MQ.i), r=menuEscalar(p,meta.T,meta.rol==='pre'&&menuPlatilloApto(p,{},true));
  m.id=id; m.q=r?r.q.slice():p.c.map(x=>x[1]);
  mqCerrar(); maRender();
}

// ── Vista del socio: el menú asignado es definitivo ──
function menuPlanHTML(s,nut){
  const plan=s.nutricion.plan, edad=parseInt(s.edad)||0, menor=edad>0&&edad<18;
  const num=x=>Math.round(x).toLocaleString('es-MX'), tot={k:0,p:0,c:0,l:0};
  const comidas=comoArray(plan.comidas).slice().sort((a,b)=>String(a.hora||'99').localeCompare(String(b.hora||'99')));
  const cards=comidas.map(m=>{
    const p=maPlat(m.id); if(!p) return '';
    const r=maCalc(m.id,m.q); tot.k+=r.k; tot.p+=r.p; tot.c+=r.c; tot.l+=r.l;
    const fid=menuFotoId(p.id), q=comoArray(m.q);
    const comps=p.c.map(([f],ci)=>({f,q:+q[ci]||0})).filter(x=>x.q>0||MENU_ALIM[x.f].u==='libre');
    const eq=menuEquivTxt({comps});
    return `<div class="comida-it mn-it">
      <div class="comida-it-h">${m.hora?`<span class="ma-h">${esc(m.hora)}</span>`:''}<b>${esc(m.nombre)}</b>${menor?'':`<span class="comida-kcal">~${num(r.k)} kcal</span>`}</div>
      ${fid?`<img class="mn-foto" src="${menuFotoSrc(fid)}" alt="${esc(p.n)}" width="800" height="500" loading="lazy" decoding="async">`:''}
      <div class="mn-plat"><b>${esc(p.n)}</b></div>
      <ul class="mn-ing">${comps.map(x=>`<li>${esc(menuPorcion(x.f,x.q))}</li>`).join('')}</ul>
      ${p.prep?`<div class="mn-prep">${esc(p.prep)}</div>`:''}
      ${m.nota?`<div class="ma-nota-s">${ico('info')}<span>${esc(m.nota)}</span></div>`:''}
      <div class="mn-eq">${esc(eq)}${menor?'':` <span>· P ${num(r.p)} g · C ${num(r.c)} g · G ${num(r.l)} g</span>`}</div>
    </div>`;
  }).join('');
  const dev=nut.kcal?(tot.k-nut.kcal)/nut.kcal:0, ok=Math.abs(dev)<=MENU_TOL_DIA;
  return `<div class="card">
    <div class="card-t">${it('food','sm')}Tu menú</div>
    <div class="ma-por s">Armado para ti por <b>${esc(plan.por||'tu entrenador')}</b>${plan.fecha?' · '+esc(fmtFecha(plan.fecha)):''}</div>
    <div class="comida-list">${cards}</div>
    ${menor?'':`<div class="mn-total ${ok?'ok':'warn'}">${ico(ok?'check':'warn')}<span><b>Total del día: ${num(tot.k)} kcal</b> · P ${num(tot.p)} g · C ${num(tot.c)} g · G ${num(tot.l)} g</span></div>`}
    <div class="f-nota" style="margin-top:10px">Sugerencia educativa de tu ${nut.manual?'nutriólogo':'entrenador'}, con equivalentes del Sistema Mexicano de Alimentos Equivalentes. Si tienes alguna condición médica o alergia, coméntalo antes de seguirlo.</div>
  </div>`;
}
