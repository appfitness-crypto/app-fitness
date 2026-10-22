/* ═══ editor ejercicios ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// EDITOR RÁPIDO DE EJERCICIO — se elige del catálogo y series/repeticiones/descanso/método
// se ajustan con un toque (todo sigue pudiéndose escribir a mano).
// ═════════════════════════════════════════
function staffKindEj(e){ return esEjCardio(e)?'cardio':esEjRondas(e)?'rondas':esEjMovilidad(e)?'mov':esEjIsometrico(e)?'iso':'fuerza'; }
const ST_DESC=[['30 s','30 s'],['45 s','45 s'],['60 s','60 s'],['90 s','90 s'],['2 min','2 min'],['3 min','3 min'],['Libre','Autorregulado (~90 s)']];
const ST_PESOS=['Ligero — 30% 1RM','Moderado — 55% 1RM','Pesado — 75% 1RM','Corporal','Banda — resistencia media','Sin carga','Carga progresiva'];
function stNum(txt){ const m=String(txt||'').match(/\d+/); return m?parseInt(m[0]):null; }
function stChips(code,k,ei,grupo,opts,actual,fn){
  return opts.map(([lb,v])=>`<button type="button" class="ch${String(actual)===String(v)?' on':''}" data-g="${grupo}" onclick="${fn}('${code}','${k}',${ei},'${esc(String(v))}',this)">${esc(String(lb))}</button>`).join('');
}
// ═════════════════════════════════════════
// RUTINA (staff) · semana arriba, el día como lista compacta y un editor por ejercicio
// (hoja inferior en celular, columna fija en pantallas anchas). Los datos del ejercicio no cambian:
// series, reps, peso, descanso, metodo, tip, porque, grupo y alternativas.
// ═════════════════════════════════════════
const rtDia={};          // código → día abierto en la pestaña Rutina
let rtSel=null;          // {code,k,ei} del ejercicio abierto en el editor
let rtMenu=false, rtOtroReps=false, rtOtroPeso=false;
const RT_KIND_TAG={cardio:'Cardio',rondas:'Por rondas',iso:'Isométrico',mov:'Movilidad'};
const RT_KIND_NOTA={cardio:'Cardio continuo: minutos fijos del plan. La FC objetivo se calcula con la edad y el objetivo del socio.',
  rondas:'Por rondas: repeticiones (o segundos) y la FC al terminar cada ronda, en lugar de peso.',
  iso:'Isométrico: se mide por tiempo, rondas × segundos por ronda.',
  mov:'Movilidad sin carga. En su app se le explica al socio para qué sirve.'};
const RT_GRUPOS={cuadriceps:'Pierna',femoral:'Pierna',pantorrilla:'Pantorrilla',gluteo:'Glúteo',pecho:'Pecho',pecho_sup:'Pecho',dorsal:'Espalda',espalda_media:'Espalda',trapecio:'Espalda',
  deltoide:'Hombro',deltoide_lat:'Hombro',deltoide_post:'Hombro',manguito:'Hombro',biceps:'Bíceps',braquial:'Bíceps',triceps:'Tríceps',core:'Core',abdomen:'Core'};
function rtPesoCorto(p){ return String(p||'').replace(/\s*—\s*resistencia\s*/i,' ').replace(/\s*—\s*(\d+%)\s*1RM/i,' $1').trim(); }
function rtSeg(t){ t=String(t||''); let m=t.match(/(\d+(?:\.\d+)?)\s*min/i); if(m) return +m[1]*60; m=t.match(/(\d+)\s*s/i); return m?+m[1]:60; }
function rtMin(s,k){ return minutosDia(s.rutina[k],s); }   // mismo cálculo que ve el socio (js/51-carga-dia.js)
function rtSeries(s,k){ return comoArray(s.rutina[k]&&s.rutina[k].ejercicios).filter(e=>staffKindEj(e)!=='mov').reduce((a,e)=>a+(parseInt(e.series)||0),0); }
function rtMalLes(s,e){ const kb=kbBuscar(e.nm||''), les=lesionKeys(s.limitaciones||[]); return kb?(kb.ev||[]).filter(l=>les.includes(l)):[]; }
function rtRx(e){
  const kind=staffKindEj(e), n=stNum(e.reps), ser=parseInt(e.series)||1;
  if(kind==='mov') return {big:ser+(ser===1?' ronda':' rondas'), sm:limpiarReps(e.reps)};
  if(kind==='cardio') return {big:(n?n+' min':limpiarReps(e.reps)), sm:rtPesoCorto(e.peso)};
  if(kind==='iso') return {big:ser+' × '+(n?n+' s':limpiarReps(e.reps)), sm:e.descanso||''};
  if(kind==='rondas') return {big:ser+' × '+(n||limpiarReps(e.reps)), sm:rtPesoCorto(e.peso)};
  return {big:ser+' × '+(n||limpiarReps(e.reps)||'?'), sm:[rtPesoCorto(e.peso),e.descanso].filter(Boolean).join(', ')};
}
function rtDiaDe(s){
  const ok=k=>DIAS_ORDER.includes(k);
  if(ok(rtDia[s.code])) return rtDia[s.code];
  const hoy=DIAS_ORDER[(new Date().getDay()+6)%7];
  const con=k=>comoArray(s.rutina[k]&&s.rutina[k].ejercicios).length>0;
  return rtDia[s.code]=con(hoy)?hoy:(DIAS_ORDER.find(con)||'lun');
}
function rtSemanaHTML(s,kSel){
  return `<div class="rt-week" role="tablist" aria-label="Días de la semana">${DIAS_ORDER.map(k=>{
    const d=s.rutina[k], n=comoArray(d.ejercicios).length, warn=comoArray(d.ejercicios).some(e=>rtMalLes(s,e).length);
    return `<button type="button" role="tab" class="rt-wd${n?'':' rest'}" aria-selected="${k===kSel}" onclick="rtElegirDia('${s.code}','${k}')">
      ${warn?'<i class="rt-wd-dot" title="Tiene un ejercicio a revisar por lesión"></i>':''}
      <span class="c">${esc(DIAS_NAMES[k].substring(0,3).toUpperCase())}</span>
      <span class="n">${n?esc(sc(d.tipo||'Sin nombre')):'Descanso'}</span>
      <span class="m">${n?n+' ej<span class="mm">, '+rtMin(s,k)+' min</span>':'Libre'}</span></button>`;
  }).join('')}</div>`;
}
function rtVolHTML(s){
  const tot={};
  DIAS_ORDER.forEach(k=>comoArray(s.rutina[k].ejercicios).forEach(e=>{
    const kind=staffKindEj(e); if(kind!=='fuerza'&&kind!=='iso') return;
    const enf=e.enf||(kbBuscar(e.nm||'')||{}).enf, g=RT_GRUPOS[enf]; if(!g) return;
    tot[g]=(tot[g]||0)+(parseInt(e.series)||0);
  }));
  const L=Object.entries(tot).sort((a,b)=>b[1]-a[1]);
  return L.length?`<div class="rt-vol" aria-label="Series por grupo muscular en la semana"><span class="lbl">Series por semana</span>${L.map(([g,n])=>`<span>${esc(g)} <b>${n}</b></span>`).join('')}</div>`:'';
}
function rtFilaHTML(s,k,e,ei){
  const kind=staffKindEj(e), rx=rtRx(e), mal=rtMalLes(s,e), sel=rtSel&&rtSel.code===s.code&&rtSel.k===k&&rtSel.ei===ei;
  const ms=String(e.ms||'').replace(/^Movilidad\s*·?\s*/i,'');
  return `<li class="rt-row${sel?' sel':''}" data-ei="${ei}">
    <button type="button" class="rt-grip" aria-label="Mover ${esc(e.nm||'ejercicio')}. Usa las flechas arriba y abajo" onkeydown="rtGripTecla(event,'${s.code}','${k}',${ei})">${ico('grip')}</button>
    <button type="button" class="rt-rb" onclick="rtAbrir('${s.code}','${k}',${ei})">
      <span class="rt-idx${e.grupo?' g':''}">${esc(e.grupo||ei+1)}</span>
      <span class="rt-nm"><b>${e.nm?esc(e.nm):'Elegir ejercicio…'}</b><small>${RT_KIND_TAG[kind]?`<span class="rt-tag k-${kind}">${RT_KIND_TAG[kind]}</span>`:''}${esc(ms)}${mal.length?`<span class="rt-warn" title="Evitar con lesión de ${esc(mal.join(', '))}">${ico('warn')}</span>`:''}${e.metodo&&KB_METODOS[e.metodo.id]?`<span class="rt-met">${esc(KB_METODOS[e.metodo.id].nm)}</span>`:''}</small></span>
      <span class="rt-rx"><b>${esc(rx.big)}</b><small>${esc(rx.sm)}</small></span>
    </button></li>`;
}
function rtMenuHTML(s,k,rest){
  const otros=DIAS_ORDER.filter(x=>x!==k), c=s.code;
  const btns=fn=>otros.map(x=>`<button type="button" onclick="${fn}('${c}','${k}','${x}')">${esc(DIAS_NAMES[x].substring(0,3))}</button>`).join('');
  return `<div class="rt-pop" role="menu">
    <div class="sub">Intercambiar este día con</div><div class="days">${btns('rtIntercambiar')}</div>
    ${rest?'':`<div class="sub">Copiar sus ejercicios a</div><div class="days">${btns('rtCopiar')}</div><hr>
    <button type="button" class="it" onclick="rtDescanso('${c}','${k}')">${ico('moonz')}Convertir en descanso</button>`}
  </div>`;
}
function rtDiaHTML(s,k){
  const d=s.rutina[k], ej=d.ejercicios, rest=!ej.length, c=s.code;
  return `<div class="rt-dayhd"><div class="t">
      <div class="rt-dn">${esc(sc(DIAS_NAMES[k]))}</div>
      <input class="rt-tipo" value="${esc(rest&&/descanso/i.test(d.tipo||'')?'':sc(d.tipo||''))}" placeholder="${rest?'Descanso':'Nombre del día, ej. Torso A'}" aria-label="Nombre del ${esc(DIAS_NAMES[k])}" onchange="staffUpdTipo('${c}','${k}',this.value);rtRefrescar('${c}')">
      <div class="rt-meta">${rest?'Día de descanso':`<span><b>${ej.length}</b> ejercicios</span><span><b>${rtSeries(s,k)}</b> series</span><span><b>~${rtMin(s,k)}</b> min</span>`}</div></div>
    <div class="rt-menu-w"><button type="button" class="rt-ib" aria-label="Opciones del día" aria-expanded="${rtMenu}" onclick="rtMenuAlt('${c}')">${ico('more')}</button>${rtMenu?rtMenuHTML(s,k,rest):''}</div>
  </div>
  ${rest?`<div class="rt-rest"><b>Día de descanso</b><p>Puedes dejarlo así o agregar ejercicios para convertirlo en día de entrenamiento.</p>
      <button type="button" class="sd-b p" onclick="staffAddEj('${c}','${k}')">${ico('plus')}Agregar ejercicio</button></div>`
    :`<ol class="rt-list" id="rt-list">${ej.map((e,ei)=>rtFilaHTML(s,k,e,ei)).join('')}</ol>
      <button type="button" class="rt-add" onclick="staffAddEj('${c}','${k}')">${ico('plus')}Agregar ejercicio</button>
      <p class="rt-hint">Toca un ejercicio para editarlo. Arrastra ${ico('grip')} para cambiar el orden.</p>`}`;
}
function rtRutinaHTML(s){
  etiquetarCargaSemana(s.rutina,s);   // pesado / medio / ligero según lo que hoy tiene cada día
  const k=rtDiaDe(s);
  const abierto=rtSel&&rtSel.code===s.code&&rtSel.k===k&&s.rutina[k].ejercicios[rtSel.ei];
  return `${bloqueRecordatorioFilosofia()}
  <div class="rt" id="rt-${s.code}">
    ${casaBannerStaff(s)}
    <div class="rt-bar">
      <button type="button" class="sd-b" onclick="staffEnriquecer('${s.code}')" title="Agrega métodos de intensidad y opciones por área ocupada donde falten, según tu filosofía">${ico('spark')}Métodos y opciones</button>
      ${staffBotonMetodoHTML(s)}
      ${staffBotonSistemaHTML(s)}
      ${casaBarraHTML(s)}
      ${staffRutBackup[s.code]?`<button type="button" class="sd-b" onclick="staffDeshacerBase('${s.code}')">Deshacer rutina cargada</button>`:''}
    </div>
    ${rtSemanaHTML(s,k)}
    ${rtVolHTML(s)}
    <div class="rt-main">
      <section class="rt-day">${rtDiaHTML(s,k)}</section>
      <div class="rt-scrim${abierto?' on':''}" onclick="rtCerrar()"></div>
      <aside class="rt-ed${abierto?' on':''}" id="rt-ed" aria-label="Editar ejercicio">${rtEditorHTML(s)}</aside>
    </div>
  </div>`;
}
// Repinta solo la pestaña Rutina (más rápido que toda la ficha y no pierde el lugar del editor)
function rtRefrescar(code){
  const s=getSocio(code), p=document.getElementById('sdp-rutina'); if(!s||!p) return;
  const b=document.getElementById('rt-ed-b'), st=b?b.scrollTop:0;
  p.innerHTML=rtRutinaHTML(s);
  const b2=document.getElementById('rt-ed-b'); if(b2) b2.scrollTop=st;
}
function rtElegirDia(code,k){ rtDia[code]=k; rtMenu=false; if(rtSel&&(rtSel.code!==code||rtSel.k!==k)) rtSel=null; rtRefrescar(code); }
function rtAbrir(code,k,ei){ rtDia[code]=k; rtSel={code,k,ei}; rtOtroReps=false; rtOtroPeso=false; rtMenu=false; rtRefrescar(code); }
function rtCerrar(){ const c=rtSel&&rtSel.code; rtSel=null; if(c) rtRefrescar(c); }
function rtNav(d){ if(!rtSel) return; const s=getSocio(rtSel.code), n=s.rutina[rtSel.k].ejercicios.length, j=rtSel.ei+d; if(j<0||j>=n) return; rtAbrir(rtSel.code,rtSel.k,j); }
function rtMenuAlt(code){ rtMenu=!rtMenu; rtRefrescar(code); }
function rtIntercambiar(code,k,k2){ rtMenu=false; rtSel=null; rtDia[code]=k2; diaIntercambiar(code,k,k2); }
function rtCopiar(code,k,k2){
  const s=getSocio(code); if(!s) return; rtMenu=false;
  const hacer=()=>{ s.rutina[k2]=JSON.parse(JSON.stringify(s.rutina[k])); staffDirty.add(code); rtDia[code]=k2; rtSel=null; staffRenderContent(s);
    showToast('Ejercicios copiados al '+DIAS_NAMES[k2]+'. Presiona Guardar cambios para confirmarlo'); };
  if(comoArray(s.rutina[k2]&&s.rutina[k2].ejercicios).length) uiConfirm('El '+DIAS_NAMES[k2]+' ya tiene ejercicios. ¿Reemplazarlos por los del '+DIAS_NAMES[k]+'?',hacer,{label:'Reemplazar'});
  else hacer();
}
function rtDescanso(code,k){
  const s=getSocio(code); if(!s) return; rtMenu=false;
  uiConfirm('¿Convertir el '+DIAS_NAMES[k]+' en día de descanso? Se quitan sus '+s.rutina[k].ejercicios.length+' ejercicios (puedes descartarlo si no guardas).',()=>{
    s.rutina[k]={tipo:'DESCANSO',color:'descanso',ejercicios:[]}; staffDirty.add(code); rtSel=null; staffRenderContent(s);
  },{label:'Convertir',danger:true});
}
// ── Editor del ejercicio ──
function rtEditorHTML(s){
  if(!rtSel||rtSel.code!==s.code) return `<div class="rt-ed-vacio"><b>Elige un ejercicio</b>Toca cualquier ejercicio del día para ajustar series, repeticiones, carga y descanso sin perder de vista el resto.</div>`;
  const {k,ei}=rtSel, d=s.rutina[k], e=d&&d.ejercicios[ei];
  if(!e) return `<div class="rt-ed-vacio"><b>Elige un ejercicio</b>Toca cualquier ejercicio del día para editarlo.</div>`;
  const c=s.code, n=d.ejercicios.length, kind=staffKindEj(e), mal=rtMalLes(s,e), nRep=stNum(e.reps);
  const on=(a,b)=>String(a)===String(b);
  const ch=(lb,act,fn)=>`<button type="button" class="ch${act?' on':''}" aria-pressed="${act}" onclick="${fn}">${esc(lb)}</button>`;
  let repOpts=[], repLbl='Repeticiones', repPh='Ej. 8 a 12 reps';
  if(kind==='fuerza') repOpts=[5,6,8,10,12,15,20];
  else if(kind==='iso'){ repLbl='Segundos por ronda'; repOpts=[15,20,30,45,60]; repPh='Ej. 30 seg, isométrico'; }
  else if(kind==='cardio'){ repLbl='Minutos (fijos del plan)'; repOpts=[10,12,15,20,25,30,40]; repPh='Ej. 12 min'; }
  else if(kind==='rondas'){ const u=rondasRx(e,s).u; repLbl=u==='reps'?'Repeticiones por ronda':u==='seg'?'Segundos por ronda':'Metros por ronda'; repOpts=u==='reps'?[6,8,10,12,15,20]:u==='seg'?[20,30,40,45,60]:[15,20,30,40]; repPh='Ej. 12 reps'; }
  else { repPh='Ej. 8 a 10 por movimiento'; }
  const repSuf=kind==='iso'?' s':kind==='cardio'?' min':'';
  const repEnLista=repOpts.includes(nRep);
  const verRepIn=rtOtroReps||!repEnLista||!repOpts.length;
  const serLbl=kind==='cardio'?'Bloques':(kind==='fuerza')?'Series':'Rondas';
  const serOpts=kind==='cardio'?[1,2,3]:kind==='mov'?[1,2,3,4]:[1,2,3,4,5,6];
  const kg=/^\s*(\d+(?:[.,]\d+)?)\s*kg\s*$/i.exec(e.peso||'');
  const pesoEnLista=ST_PESOS.includes(e.peso);
  const verPesoIn=rtOtroPeso||(!pesoEnLista&&!kg&&!!e.peso);
  const fn=(f,v)=>`rtSet('${f}','${esc(String(v)).replace(/'/g,"\\'")}')`;
  let b=`<button type="button" class="rt-exn" onclick="epAbrir('${c}','${k}',${ei})">
      <span class="rt-nm"><b>${e.nm?esc(e.nm):'Elegir ejercicio…'}</b><small>${RT_KIND_TAG[kind]?`<span class="rt-tag k-${kind}">${RT_KIND_TAG[kind]}</span>`:''}${esc(String(e.ms||'').replace(/^Movilidad\s*·?\s*/i,''))}</small></span><span class="rt-chg">Cambiar</span></button>`;
  if(RT_KIND_NOTA[kind]) b+=`<div class="rt-note">${ico('info')}<span>${RT_KIND_NOTA[kind]}</span></div>`;
  if(mal.length) b+=`<div class="rt-note w">${ico('warn')}<span><b>Revisar:</b> se evita con lesión de ${esc(mal.join(', '))}. Toca el nombre para cambiarlo por otro.</span></div>`;
  b+=`<div class="rt-g"><div class="rt-gl">${serLbl}</div><div class="ch-row">${serOpts.map(v=>ch(v,on(parseInt(e.series),v),fn('series',v))).join('')}</div></div>`;
  b+=`<div class="rt-g"><div class="rt-gl">${repLbl}</div>
    ${repOpts.length?`<div class="ch-row">${repOpts.map(v=>ch(v+repSuf,on(nRep,v)&&!rtOtroReps,fn('reps',v))).join('')}${ch('Otro',verRepIn&&!repEnLista||rtOtroReps,"rtOtro('reps')")}</div>`:''}
    ${verRepIn?`<input class="sf-in" id="rt-reps" value="${esc(e.reps||'')}" placeholder="${repPh}" onchange="rtTexto('reps',this.value)">`:''}</div>`;
  if(kind==='fuerza'){
    b+=`<div class="rt-g"><div class="rt-gl">Carga</div><div class="ch-row">${ST_PESOS.map(p=>ch(rtPesoCorto(p),on(e.peso,p),fn('peso',p))).join('')}${ch('Kilos',!!kg,"rtKilos()")}${ch('Otro',verPesoIn,"rtOtro('peso')")}</div>
      ${kg?`<div class="rt-step"><button type="button" onclick="rtKg(-1)" aria-label="Menos peso">−</button><input id="rt-kg" inputmode="decimal" value="${esc(kg[1])}" aria-label="Kilos" onchange="rtKgTexto(this.value)"><button type="button" onclick="rtKg(1)" aria-label="Más peso">+</button><span>kg</span></div>`:''}
      ${verPesoIn?`<input class="sf-in" id="rt-peso" value="${esc(e.peso||'')}" placeholder="Ej. 40 kg o barra sola" onchange="rtTexto('peso',this.value)">`:''}</div>`;
  } else if(kind==='cardio'||kind==='rondas'){
    const r=kind==='cardio'?cardioRx(e,s):rondasRx(e,s);
    b+=`<div class="rt-g"><div class="rt-gl">FC objetivo <small>vacío: automático por edad y objetivo</small></div><input class="sf-in" value="${esc(e.peso||'')}" placeholder="${r.lo}-${r.hi} lpm" onchange="rtTexto('peso',this.value)"></div>`;
  }
  if(kind!=='cardio'&&kind!=='mov'){
    b+=`<div class="rt-g"><div class="rt-gl">Descanso entre ${kind==='fuerza'?'series':'rondas'}<button type="button" class="rt-lnk" onclick="rtDescTodo()">Aplicar a todo el día</button></div>
      <div class="ch-row">${ST_DESC.map(([lb,v])=>ch(lb,on(e.descanso,v),fn('descanso',v))).join('')}</div></div>`;
  }
  if(kind==='fuerza'){
    b+=`<div class="rt-g"><div class="rt-gl">Método de intensidad</div>
      <select class="sf-in" onchange="staffUpdMetodo('${c}','${k}',${ei},this.value)"><option value="">Sin método</option>
        ${Object.entries(KB_METODOS).map(([id,M])=>`<option value="${id}" ${e.metodo&&e.metodo.id===id?'selected':''}>${esc(M.nm)}${M.nivel>nivelNum(s.nivel)?' (nivel '+M.nivel+')':''}</option>`).join('')}
      </select>${e.metodo&&KB_METODOS[e.metodo.id]?`<div class="rt-hint2">${esc(KB_METODOS[e.metodo.id].como)}</div>`:''}</div>`;
  }
  b+=`<label class="rt-g rt-lab">Nota propioceptiva<textarea class="sf-in" rows="2" placeholder="Dónde y cómo sentir el estímulo" onchange="rtTexto('tip',this.value)">${esc(e.tip||'')}</textarea></label>`;
  if(kind==='mov') b+=`<label class="rt-g rt-lab">Para qué es (se muestra al socio)<input class="sf-in" value="${esc(e.porque||'')}" placeholder="Vacío: explicación automática" onchange="rtTexto('porque',this.value)"></label>`;
  b+=`<details class="rt-more"><summary>${ico('chev')}Superserie, detalle del método y opciones</summary>
      <div class="rt-two"><label>Grupo (A1, A2…)<input class="sf-in" value="${esc(e.grupo||'')}" placeholder="Ninguno" onchange="rtTexto('grupo',this.value.toUpperCase())"></label>
      <label>Descanso (texto libre)<input class="sf-in" value="${esc(e.descanso||'')}" onchange="rtTexto('descanso',this.value)"></label></div>
      ${kind==='fuerza'?`<label class="rt-lab">Detalle del método<input class="sf-in" value="${esc(e.metodo&&e.metodo.detalle||'')}" placeholder="Ej. drop de 25% en la última serie" onchange="staffUpdMetodoDet('${c}','${k}',${ei},this.value)"></label>`:''}
      <label class="rt-lab">Si el área está ocupada (separadas por coma)<input class="sf-in" value="${esc((e.alternativas||[]).map(a=>a.nm).join(', '))}" onchange="staffUpdAlts('${c}','${k}',${ei},this.value);rtRefrescar('${c}')"></label>
    </details>`;
  return `<div class="rt-ed-grab"></div>
    <div class="rt-ed-h"><button type="button" class="rt-ib" onclick="rtNav(-1)" aria-label="Ejercicio anterior" ${ei===0?'disabled':''}>${ico('chevl')}</button>
      <div class="rt-ed-pos">Ejercicio ${ei+1} de ${n}</div>
      <button type="button" class="rt-ib" onclick="rtNav(1)" aria-label="Ejercicio siguiente" ${ei===n-1?'disabled':''}>${ico('chev')}</button>
      <button type="button" class="rt-ib" onclick="rtCerrar()" aria-label="Cerrar editor">${ico('close')}</button></div>
    <div class="rt-ed-b" id="rt-ed-b">${b}</div>
    <div class="rt-ed-f"><button type="button" class="sd-b" onclick="rtDuplicar()">${ico('layers')}Duplicar</button>
      <button type="button" class="sd-b rt-dng" onclick="rtQuitar()">${ico('trash')}Quitar</button><span class="sp"></span>
      <button type="button" class="sd-pri" onclick="rtCerrar()">Listo</button></div>`;
}
function rtEj(){ if(!rtSel) return null; return stEj(rtSel.code,rtSel.k,rtSel.ei); }
function rtSet(f,v){
  if(!rtSel) return; const {code,k,ei}=rtSel;
  if(f==='series') staffChipSeries(code,k,ei,v,null);
  else if(f==='reps'){ rtOtroReps=false; staffChipReps(code,k,ei,v,null); }
  else if(f==='descanso') staffChipDesc(code,k,ei,v,null);
  else if(f==='peso'){ rtOtroPeso=false; staffPesoSel(code,k,ei,v,null); }
  rtRefrescar(code);
}
function rtTexto(f,v){ if(!rtSel) return; staffUpd(rtSel.code,rtSel.k,rtSel.ei,f,v); rtRefrescar(rtSel.code); }
function rtOtro(f){ if(f==='reps') rtOtroReps=!rtOtroReps; else rtOtroPeso=!rtOtroPeso; rtRefrescar(rtSel.code); setTimeout(()=>{ const i=document.getElementById(f==='reps'?'rt-reps':'rt-peso'); if(i) i.focus(); },30); }
function rtKilos(){ const e=rtEj(); if(!e) return; const m=/(\d+(?:[.,]\d+)?)\s*kg/i.exec(e.peso||''); rtOtroPeso=false; rtTexto('peso',(m?m[1].replace(',','.'):'5')+' kg'); }
function rtKg(d){ const e=rtEj(); if(!e) return; const n=parseFloat(String(e.peso).replace(',','.'))||0, paso=n<20?1:2.5; rtTexto('peso',Math.max(0,Math.round((n+d*paso)*10)/10)+' kg'); }
function rtKgTexto(v){ const n=parseFloat(String(v).replace(',','.')); if(!isNaN(n)) rtTexto('peso',Math.max(0,n)+' kg'); else rtRefrescar(rtSel.code); }
function rtDescTodo(){
  const e=rtEj(); if(!e) return; const {code,k}=rtSel, s=getSocio(code);
  let n=0; s.rutina[k].ejercicios.forEach(x=>{ const kd=staffKindEj(x); if(kd!=='cardio'&&kd!=='mov'&&x.descanso!==e.descanso){ x.descanso=e.descanso; n++; } });
  if(n) staffDirty.add(code); rtRefrescar(code);
  showToast(n?'Descanso de '+e.descanso+' en '+n+(n===1?' ejercicio':' ejercicios')+' más del día':'Todo el día ya tiene ese descanso');
}
function rtDuplicar(){
  const e=rtEj(); if(!e) return; const {code,k,ei}=rtSel, s=getSocio(code);
  s.rutina[k].ejercicios.splice(ei+1,0,JSON.parse(JSON.stringify(e))); staffDirty.add(code); rtSel={code,k,ei:ei+1}; rtRefrescar(code);
  showToast('Ejercicio duplicado');
}
function rtQuitar(){
  const e=rtEj(); if(!e) return; const {code,k,ei}=rtSel, s=getSocio(code);
  const [quitado]=s.rutina[k].ejercicios.splice(ei,1); staffDirty.add(code); rtSel=null; rtRefrescar(code);
  rtToastDeshacer('Quitaste '+(quitado.nm||'el ejercicio'),()=>{ const x=getSocio(code); if(!x) return; x.rutina[k].ejercicios.splice(ei,0,quitado); rtRefrescar(code); });
}
// Aviso con botón "Deshacer" (el aviso normal no tiene acciones)
function rtToastDeshacer(msg,fn){
  const t=document.getElementById('toast'); if(!t) return;
  t.innerHTML=''; const sp=document.createElement('span'); sp.textContent=msg; t.appendChild(sp);
  const b=document.createElement('button'); b.type='button'; b.className='toast-undo'; b.textContent='Deshacer';
  b.onclick=()=>{ t.style.display='none'; fn(); }; t.appendChild(b);
  t.style.display='block'; clearTimeout(window._toastT); window._toastT=setTimeout(()=>t.style.display='none',5000);
}
// ── Reordenar: arrastrando la agarradera o con las flechas del teclado ──
function rtMover(code,k,de,a){
  const s=getSocio(code); if(!s) return; const arr=s.rutina[k].ejercicios; if(a<0||a>=arr.length||de===a) return;
  const sel=rtSel&&rtSel.code===code&&rtSel.k===k?arr[rtSel.ei]:null;
  const [x]=arr.splice(de,1); arr.splice(a,0,x); staffDirty.add(code);
  if(sel) rtSel.ei=arr.indexOf(sel);
  rtRefrescar(code);
}
function rtGripTecla(ev,code,k,ei){
  if(ev.key!=='ArrowUp'&&ev.key!=='ArrowDown') return; ev.preventDefault();
  const j=ei+(ev.key==='ArrowUp'?-1:1); rtMover(code,k,ei,j);
  const g=document.querySelector(`#rt-list .rt-row[data-ei="${j}"] .rt-grip`); if(g) g.focus();
}
let rtDrag=null;
document.addEventListener('pointerdown',ev=>{
  const g=ev.target.closest&&ev.target.closest('.rt-grip'); if(!g) return;
  const row=g.closest('.rt-row'), list=row&&row.parentNode; if(!list) return;
  ev.preventDefault(); try{ g.setPointerCapture(ev.pointerId); }catch(e){}
  rtDrag={row,list,de:+row.dataset.ei,movido:false}; row.classList.add('drag');
});
document.addEventListener('pointermove',ev=>{
  if(!rtDrag) return; const {row,list}=rtDrag;
  let antes=null; for(const r of list.children){ if(r===row) continue; const bx=r.getBoundingClientRect(); if(ev.clientY<bx.top+bx.height/2){ antes=r; break; } }
  if(antes!==row.nextSibling){ list.insertBefore(row,antes); rtDrag.movido=true; }
});
function rtFinDrag(){
  if(!rtDrag) return; const {row,list,de,movido}=rtDrag; rtDrag=null; row.classList.remove('drag');
  if(!movido||!staffActivoId) return;
  const a=[...list.children].indexOf(row), s=getSocio(staffActivoId); if(!s) return;
  rtMover(staffActivoId,rtDiaDe(s),de,a);
}
document.addEventListener('pointerup',rtFinDrag); document.addEventListener('pointercancel',rtFinDrag);
document.addEventListener('keydown',ev=>{ if(ev.key==='Escape'&&rtSel&&document.querySelector('.rt-ed.on')) rtCerrar(); });
function stEj(code,k,ei){ const s=getSocio(code); return s&&s.rutina[k]&&s.rutina[k].ejercicios[ei]||null; }
function stMarcar(btn){ if(!btn) return; const g=btn.dataset.g; btn.parentNode.querySelectorAll('.ch').forEach(x=>x.classList.toggle('on',x===btn&&true)); }
function stCampo(btn,f,v){ const box=btn&&btn.closest('.ej-ed'); const i=box&&box.querySelector('[data-f="'+f+'"]'); if(i) i.value=v; }
function staffChipSeries(code,k,ei,v,btn){ const e=stEj(code,k,ei); if(!e) return; staffDirty.add(code); e.series=+v; stMarcar(btn); }
function staffChipDesc(code,k,ei,v,btn){ const e=stEj(code,k,ei); if(!e) return; staffDirty.add(code); e.descanso=v; stMarcar(btn); stCampo(btn,'descanso',v); }
function staffChipReps(code,k,ei,v,btn){
  const s=getSocio(code), e=stEj(code,k,ei); if(!e) return; staffDirty.add(code);
  const n=+v, kind=staffKindEj(e); let txt;
  if(kind==='fuerza') txt=n+' reps — '+(n<=6?'fuerza':n<=12?'hipertrofia':'resistencia');
  else if(kind==='iso') txt=n+' seg'+(ladoIso(e)?' por lado':'')+' — isométrico';
  else if(kind==='cardio'){ txt=n+' min'; if(!(parseInt(e.series)>0)) e.series=1; }
  else if(kind==='rondas') txt=txtUnidad(n,rondasRx(e,s).u);
  else txt=n+' min';
  e.reps=txt; stMarcar(btn); stCampo(btn,'reps',txt);
}
function staffPesoSel(code,k,ei,v,sel){ const e=stEj(code,k,ei); if(!e||!v) return; staffDirty.add(code); e.peso=v; stCampo(sel,'peso',v); }
function staffMoverEj(code,k,ei,dir){
  const s=getSocio(code); if(!s) return; const arr=s.rutina[k].ejercicios, j=ei+dir;
  if(j<0||j>=arr.length) return; staffDirty.add(code);
  const t=arr[ei]; arr[ei]=arr[j]; arr[j]=t; staffRerender(code,k);
}

// ═════════════════════════════════════════
// SELECTOR DE EJERCICIOS (agregar / cambiar) + crear ejercicio nuevo en el catálogo
// ═════════════════════════════════════════
const EP_GRUPOS=[['sug','⭐ Sugeridos'],['pecho','Pecho'],['espalda','Espalda'],['hombro','Hombro'],['brazos','Brazos'],['pierna','Pierna'],['gluteo','Glúteo'],['core','Core'],['cardio','Cardio'],['mov','Movilidad'],['iso','⏱ Isométricos'],['propios','★ Propios'],['todos','Todos']];
const EP_ENF={pecho:['pecho','pecho_sup'],espalda:['dorsal','espalda_media','trapecio'],hombro:['deltoide','deltoide_lat','deltoide_post','manguito'],brazos:['biceps','triceps','braquial'],pierna:['cuadriceps','femoral','pantorrilla'],gluteo:['gluteo'],core:['core','abdomen'],cardio:['cardio']};
const EP_ZONAS=[['','Todo el equipo'],['maquina','Máquinas'],['polea','Poleas'],['mancuernas','Mancuernas'],['libre','Barra'],['corporal','Peso corporal'],['liga','Ligas'],['trx','TRX'],['disco','Discos'],['funcional','Funcional']];
let EP={code:null,k:null,ei:null,grupo:'sug',zona:'',q:''};
function epZonaOk(z,f){ if(!f) return true; if(f==='libre') return z==='rack'||z==='banco'; return z===f; }
function epAbrir(code,k,ei){
  const s=getSocio(code); if(!s) return;
  EP={code,k,ei:(ei==null?null:ei),grupo:'sug',zona:'',q:''};
  const d=s.rutina[k]||{};
  document.getElementById('ep-titulo').textContent=EP.ei==null?'Agregar ejercicio':'Cambiar ejercicio';
  const les=lesionKeys(s.limitaciones||[]);
  document.getElementById('ep-ctx').textContent=sc(DIAS_NAMES[k])+' · '+(d.tipo||'sin tipo')+' — '+tc(s.nombre)+' ('+sc(s.nivel)+(les.length?', cuidar: '+les.join(', '):'')+')';
  document.getElementById('ep-q').value='';
  document.getElementById('ep-q').style.display='';
  document.getElementById('ep-filtros').style.display='';
  document.getElementById('modal-ejpick').classList.add('open');
  epRender();
}
function epCerrar(){ document.getElementById('modal-ejpick').classList.remove('open'); }
function epSetGrupo(g){ EP.grupo=g; epRender(); }
function epSetZona(z){ EP.zona=z; epRender(); }
function epBuscar(v){ EP.q=v; epRender(); }
function epItems(s,d){
  const les=lesionKeys(s.limitaciones||[]);
  const yaDia=new Set((d.ejercicios||[]).map(x=>kbNorm(x.nm||'')));
  const q=kbNorm(EP.q);
  const enCasa=(s.modo==='casa');   // socio con rutina en casa: se ofrece el repertorio de casa, no el del gimnasio
  let items=(enCasa?casaPool():KB_EJERCICIOS).map(x=>({id:x.id,nm:x.nm,ms:x.ms,z:x.z,t:x.t,enf:x.enf,iso:!!x.iso,cardio:x.enf==='cardio'||!!x.rondas||!!x.cont,custom:!!x._custom,ev:x.ev||[],aka:x.aka||[],eq:x.eq||[]}));
  KB_MOVILIDAD.forEach(m=>items.push({id:m.id,nm:m.nm,ms:'Movilidad · '+m.tipo,z:'corporal',enf:'mov',mov:true,ev:[],aka:[]}));
  if(q){
    items=items.filter(x=>kbNorm(x.nm).includes(q)||kbNorm(x.ms).includes(q)||(x.aka||[]).some(a=>kbNorm(a).includes(q)));
  } else if(EP.grupo==='sug'){
    const par=KB_DIA_ENF.find(([key])=>kbNorm(d.tipo||'').includes(key));
    if(par) items=items.filter(x=>par[1].includes(x.enf)); else items=items.filter(x=>!x.mov);
  } else if(EP.grupo==='mov') items=items.filter(x=>x.mov);
  else if(EP.grupo==='iso') items=items.filter(x=>x.iso);
  else if(EP.grupo==='propios') items=items.filter(x=>x.custom);
  else if(EP.grupo!=='todos') items=items.filter(x=>(EP_ENF[EP.grupo]||[]).includes(x.enf));
  items=items.filter(x=>epZonaOk(x.z,EP.zona));
  const tiene=new Set((enCasa&&s.casa&&s.casa.equipo)||[]);
  items.forEach(x=>{ x.mal=x.ev.filter(l=>les.includes(l)); if(enCasa) (x.eq||[]).forEach(q=>{ if(!tiene.has(q)) x.mal.push('sin '+((CASA_EQUIPO[q]&&CASA_EQUIPO[q].nm)||q).toLowerCase()); }); x.ya=yaDia.has(kbNorm(x.nm)); });
  items.sort((a,b)=>(a.mal.length?1:0)-(b.mal.length?1:0) || (a.ya?1:0)-(b.ya?1:0) || (a.iso?1:0)-(b.iso?1:0) || ((a.t==='c')?0:1)-((b.t==='c')?0:1) || a.nm.localeCompare(b.nm,'es'));
  return items;
}
function epRender(){
  const s=getSocio(EP.code); if(!s) return; const d=s.rutina[EP.k]||{ejercicios:[]};
  document.getElementById('ep-filtros').innerHTML=
    `<div class="ep-rowc">${EP_GRUPOS.map(([g,n])=>`<button type="button" class="ch${EP.grupo===g&&!EP.q?' on':''}" onclick="epSetGrupo('${g}')">${n}</button>`).join('')}</div>
     <div class="ep-rowc">${EP_ZONAS.map(([z,n])=>`<button type="button" class="ch${EP.zona===z?' on':''}" onclick="epSetZona('${z}')">${n}</button>`).join('')}</div>`;
  const items=epItems(s,d), tot=items.length, max=80;
  const lista=items.slice(0,max).map(x=>`
    <div class="ep-it${x.mal.length?' mal':''}" onclick="epElegir('${x.id}')">
      <div><b>${esc(x.nm)}</b><span>${esc(x.ms)}${KB_ZONAS[x.z]?' · '+esc(KB_ZONAS[x.z]):''}</span></div>
      <em class="${x.mal.length?'w':''}">${x.mal.length?'⚠ evitar: '+esc(x.mal.join(', ')):x.ya?'ya en el día':''}${x.iso?' ⏱':''}${x.cardio?' 💓':''}${x.custom?' ★':''}</em>
    </div>`).join('');
  const q=limpiarTexto(EP.q);
  document.getElementById('ep-lista').innerHTML=
    (lista||`<div class="ep-vacio">No encontré ejercicios con ese filtro.${q?'':' Prueba con otro grupo, o crea el ejercicio nuevo.'}</div>`)+
    (tot>max?`<div class="ep-vacio">Mostrando ${max} de ${tot}. Escribe en el buscador para afinar.</div>`:'')+
    `<button type="button" class="ep-new" onclick="epFormNuevo()">＋ ${q?'Crear «'+esc(q)+'» como ejercicio nuevo':'Crear un ejercicio nuevo'}</button>`;
}
function epElegir(id){
  const s=getSocio(EP.code); if(!s) return;
  const m=KB_MOVILIDAD.find(x=>x.id===id);
  const kb=m?{mov:true,id:m.id,nm:m.nm,ms:'Movilidad'}:KB_IDX[id];
  if(!kb) return;
  staffAplicarEj(EP.code,EP.k,EP.ei,kb);
}
// Datos prellenados del ejercicio según su tipo, el nivel y el objetivo del socio
function ejDefaults(kb,s){
  const nv=nivelNum(s.nivel), obj=claveObjFc(s.objetivo), esFza=/FUERZA/i.test(s.objetivo||'');
  const base={nm:kb.nm,ms:kb.ms,enf:kb.enf||'',series:3,reps:'10 reps — hipertrofia',peso:'Moderado — 55% 1RM',descanso:'90 s',tip:kb.tip||''};
  if(kb.mov){ const m=KB_MOVILIDAD.find(x=>x.id===kb.id); return Object.assign(base,{ms:'Movilidad',enf:'',series:m.series,reps:m.reps,peso:'Sin carga',descanso:'',tip:m.que}); }
  const tmp={nm:kb.nm,series:'',reps:'',peso:''};
  if(esEjCardio(tmp)){ const r=cardioRx(tmp,s); return Object.assign(base,{series:1,reps:r.per+' min',peso:'FC objetivo '+r.lo+'–'+r.hi+' lpm',descanso:'',tip:kb.tip||'Ritmo en el que puedas hablar frases cortas.'}); }
  if(esEjRondas(tmp)){ const r=rondasRx(tmp,s); return Object.assign(base,{series:r.series,reps:txtUnidad(r.base,r.u),peso:'FC objetivo '+r.lo+'–'+r.hi+' lpm',descanso:'60 s'}); }
  if(kb.iso || esEjIsometrico(tmp)){ const x=dosisIsometrico({tt:kb.tt,lado:kb.lado},nv); return Object.assign(base,{series:x.series,reps:x.reps,peso:'Corporal',descanso:'45 s',tip:kb.tip||'Respira lento y mantén la tensión sin moverte.'}); }
  const comp=kb.t==='c';
  let series=comp&&nv>=2?4:3, reps, desc;
  if(esFza){ reps=comp?'5 reps — fuerza':'10 reps — hipertrofia'; desc=comp?'2 min':'90 s'; }
  else if(obj==='MASA'){ reps=comp?'8 reps — hipertrofia':'12 reps — hipertrofia'; desc=comp?'90 s':'60 s'; }
  else if(obj==='PERDER'||obj==='RESIST'){ reps='15 reps — resistencia'; desc='45 s'; }
  else { reps=comp?'8 reps — hipertrofia':'12 reps — hipertrofia'; desc=comp?'90 s':'60 s'; }
  let peso=comp?'Moderado — 55% 1RM':'Moderado — 50% 1RM';
  if(kb.z==='corporal'||kb.z==='trx') peso='Corporal'; else if(kb.z==='liga') peso='Banda — resistencia media';
  if(kb._custom){ if(kb.series) series=kb.series; if(kb.reps) reps=kb.reps; if(kb.peso) peso=kb.peso; }
  return Object.assign(base,{series,reps,peso,descanso:desc,tip:kb.tip||('Siente el músculo objetivo ('+kb.ms+') durante todo el recorrido y controla la bajada.')});
}
function staffAplicarEj(code,k,ei,kb){
  const s=getSocio(code); if(!s) return;
  if(!s.rutina[k]) s.rutina[k]={tipo:'',color:'verde',ejercicios:[]};
  const d=s.rutina[k]; if(!Array.isArray(d.ejercicios)) d.ejercicios=[];
  const def=ejDefaults(kb,s);
  if(!esEjMovilidad(def)){
    try{ const ent=entRutina(s.entrenadorId);
      const ctx=ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones}, ent&&ent.filosofia);
      def.alternativas=alternativasPara(def,ctx,datosEj(def)); }catch(err){ console.warn('alternativas',err); }
  }
  if(ei==null) d.ejercicios.push(def); else { const old=d.ejercicios[ei]||{}; d.ejercicios[ei]=Object.assign({},def,old.grupo?{grupo:old.grupo}:{}); }
  if(/descanso/i.test(d.tipo||'')){ d.tipo=''; d.color='verde'; }
  rtDia[code]=k; rtSel={code,k,ei:ei==null?d.ejercicios.length-1:ei}; rtOtroReps=false; rtOtroPeso=false;
  staffDirty.add(code); epCerrar(); staffRerender(code,k);
  showToast('✓ '+def.nm+(ei==null?' agregado':' cambiado')+' — ajusta series y repeticiones con un toque y presiona GUARDAR');
}
function epFormNuevo(){
  const q=limpiarTexto(EP.q);
  document.getElementById('ep-q').style.display='none';
  document.getElementById('ep-filtros').style.display='none';
  document.getElementById('ep-lista').innerHTML=`
    <div class="f-grp"><label class="f-lbl" for="epn-nm">Nombre del ejercicio</label><input class="ti" id="epn-nm" maxlength="70" value="${esc(q)}" placeholder="Ej. Press Arnold"></div>
    <div class="f-grp"><label class="f-lbl" for="epn-ms">Músculos que trabaja</label><input class="ti" id="epn-ms" maxlength="70" placeholder="Ej. Deltoides · Tríceps"></div>
    <div class="f-row">
      <div class="f-grp"><label class="f-lbl" for="epn-enf">Enfoque muscular</label><select class="ti" id="epn-enf">${Object.entries(KB_ENFOQUES).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
      <div class="f-grp"><label class="f-lbl" for="epn-z">Equipo / zona</label><select class="ti" id="epn-z">${Object.entries(KB_ZONAS).map(([k,n])=>`<option value="${k}" ${k==='mancuernas'?'selected':''}>${esc(n)}</option>`).join('')}</select></div>
    </div>
    <div class="f-row">
      <div class="f-grp"><label class="f-lbl" for="epn-t">Tipo</label><select class="ti" id="epn-t"><option value="c">Compuesto (varias articulaciones)</option><option value="a">Aislamiento (un músculo)</option></select></div>
      <div class="f-grp"><label class="f-lbl" for="epn-iso">Cómo se mide</label><select class="ti" id="epn-iso"><option value="">Series × repeticiones</option><option value="1">Isométrico (por tiempo)</option></select></div>
    </div>
    <div class="f-grp"><label class="f-lbl" for="epn-tip">Descripción / nota propioceptiva</label><textarea class="ti" id="epn-tip" rows="3" placeholder="Dónde sentir el estímulo, ángulo, errores comunes…"></textarea></div>
    <div class="f-grp"><label class="f-lbl">Evitar si el socio tiene lesión en</label><div class="chk-grid">${KB_LESIONES_OPC.map(l=>`<div class="chk epn-ev" data-v="${l}" onclick="this.classList.toggle('ck')">${sc(l)}</div>`).join('')}</div></div>
    <div class="f-nota">Se guarda en el catálogo (queda para todas las rutinas y entrenadores) y se agrega a este día con series, repeticiones y descanso prellenados.</div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button type="button" class="sd-b" style="flex:1" onclick="epRender();document.getElementById('ep-q').style.display='';document.getElementById('ep-filtros').style.display=''">Volver</button>
      <button type="button" class="sd-pri" style="flex:1" onclick="epGuardarNuevo()">Guardar y agregar</button>
    </div>`;
}
function epGuardarNuevo(){
  const v=id=>document.getElementById(id).value;
  const nm=limpiarTexto(v('epn-nm')), ms=limpiarTexto(v('epn-ms'));
  if(!nm||!ms){ showToast('Completa el nombre y los músculos'); return; }
  if(KB_EJERCICIOS.find(x=>kbNorm(x.nm)===kbNorm(nm))){ showToast('Ya existe un ejercicio con ese nombre — búscalo en la lista'); return; }
  const iso=v('epn-iso')==='1', t=v('epn-t');
  const ev=[...document.querySelectorAll('#ep-lista .epn-ev.ck')].map(x=>x.dataset.v);
  const id=kbNuevoId('c',nm);
  kbExtra().ejercicios[id]={nm,ms,enf:v('epn-enf'),z:v('epn-z'),t,series:3,reps:iso?'30 seg — isométrico':(t==='c'?'8 reps — hipertrofia':'12 reps — hipertrofia'),peso:iso?'Corporal':'Moderado',tip:v('epn-tip').trim(),ev,aka:[],iso};
  kbAplicarExtra(); guardarLocal();
  const payload=limpio(kbExtra()); payload._v=1;
  fbEncolar('/config/kb','set',payload,{ok:()=>{}});
  if(estaSinConexion()||!fbListo) showToast('📚 Ejercicio guardado · se subirá al volver la conexión');
  const kb=KB_IDX[id]; if(!kb){ showToast('⚠ No se pudo guardar el ejercicio'); return; }
  staffAplicarEj(EP.code,EP.k,EP.ei,kb);
}
