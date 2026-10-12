/* ═══ ENTRENO: pestaña Rutina, sesión en curso, resumen y ficha "Cómo se hace" ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   - Rutina: tira de la semana, bloque de progresión y la sesión del día con el peso sugerido.
   - Sesión: un ejercicio a la vez sobre el mismo `sesionTemp` del módulo 15; los ejercicios
     especiales (cardio, rondas, movilidad, isométricos) se registran en su ventana de siempre.
     Al terminar se usa el mismo finalizarSesion(), que guarda igual que antes.
   - Ficha: foto del ejercicio, equipo, músculos, pasos y error común.
   Solo se agregan dos datos opcionales a cada sesión guardada: `sr` (kg y reps de cada serie)
   dentro del detalle, y `sensacion` (cómo se sintió). ═══ */

// ── Pasos y error común por ejercicio (clave: nombre del catálogo en slug). Opcional: si un
//    ejercicio no está aquí, la ficha muestra la nota del entrenador. `e` cambia el equipo mostrado.
const EJ_PASOS = {
  'press-banca-plano':{e:'Barra y banca plana',p:['Acuéstate con los ojos bajo la barra y los pies firmes en el piso.','Junta las escápulas y baja la barra controlada hasta el pecho.','Empuja hacia arriba sin despegar la cadera del banco.'],x:'Rebotar la barra en el pecho o abrir demasiado los codos.'},
  'jalon-al-pecho':{e:'Máquina de jalón (polea alta)',p:['Ajusta el soporte para que las rodillas queden fijas.','Toma la barra un poco más abierta que los hombros.','Lleva la barra a la parte alta del pecho bajando los codos.'],x:'Echarte muy atrás y jalar con impulso.'},
  'press-de-hombro-con-mancuernas':{e:'Mancuernas y banca con respaldo',p:['Siéntate con la espalda pegada al respaldo.','Empieza con las mancuernas a la altura de las orejas.','Empuja hacia arriba sin chocar las mancuernas.'],x:'Arquear la espalda baja para subir más peso.'},
  'remo-en-polea-baja':{e:'Polea baja con agarre en V',p:['Siéntate con las rodillas un poco flexionadas.','Jala el agarre hacia el ombligo con el pecho arriba.','Regresa lento hasta estirar la espalda.'],x:'Mover el torso hacia atrás y adelante para ayudarte.'},
  'elevaciones-laterales':{e:'Mancuernas',p:['De pie, con los codos un poco flexionados.','Sube los brazos a los lados hasta la altura del hombro.','Baja en 2 o 3 segundos.'],x:'Usar impulso del cuerpo o subir más allá del hombro.'},
  'cruce-de-poleas':{e:'Poleas / cables (estación de cruce)',p:['Coloca las poleas arriba y da un paso al frente.','Con los codos un poco flexionados, junta las manos frente a la cadera.','Regresa lento hasta sentir el estiramiento del pecho.'],x:'Doblar y estirar los codos: se vuelve un press.'},
  'sentadilla-goblet':{e:'Una mancuerna o pesa rusa',p:['Sostén la mancuerna pegada al pecho, pies al ancho de hombros.','Baja entre las piernas con el pecho arriba.','Sube empujando el piso con todo el pie.'],x:'Que las rodillas se vayan hacia adentro.'},
  'prensa-de-piernas':{e:'Máquina de prensa inclinada',p:['Espalda y cadera pegadas al respaldo.','Pies al ancho de cadera, a media plataforma.','Baja hasta 90° y empuja sin bloquear las rodillas.'],x:'Despegar la cadera del asiento al bajar.'},
  'sentadilla-bulgara':{e:'Banca y mancuernas',p:['Apoya el empeine del pie de atrás en la banca.','Baja recto hasta que la rodilla de atrás casi toque el piso.','Sube empujando con el pie de adelante.'],x:'Dar un paso muy corto: la rodilla se adelanta de más.'},
  'curl-femoral-acostado':{e:'Máquina de curl femoral',p:['Acuéstate con el rodillo justo arriba del talón.','Lleva los talones hacia el glúteo.','Baja lento sin soltar la tensión.'],x:'Levantar la cadera del banco.'},
  'elevacion-de-talones-de-pie':{e:'Máquina de pantorrilla de pie',p:['Apoya la punta de los pies en el borde.','Baja el talón hasta sentir el estiramiento.','Sube lo más alto que puedas y aguanta 1 segundo.'],x:'Rebotar abajo y hacer el movimiento corto.'}
};
const EN_DIAS_CORTO=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const EN_DIAS=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const EN_MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function enEspecial(e){ return esEjCardio(e)||esEjRondas(e)||esEjMovilidad(e)||esEjIsometrico(e); }
function enListaY(a){ return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' y '+a[a.length-1]; }
function enKg(kg){ return kgToDisplay(kg)+' '+unidadPeso; }

// ── Ficha del ejercicio: músculos (el primero es el principal), equipo, pasos y error común ──
function fichaEj(ej){
  const kb=kbBuscar(ej.nm);
  const ms=String(ej.ms||(kb&&kb.ms)||'').split(/\s*[·,\/]\s*|\s+y\s+/).map(x=>sc(x.trim())).filter(Boolean);
  const d=EJ_PASOS[slugImg(ej.nm)]||(kb&&EJ_PASOS[slugImg(kb.nm)])||null;
  return {ms:[...new Set(ms)], eq:(d&&d.e)||(kb&&KB_ZONAS[kb.z])||'', pasos:d?d.p:null, evita:d?d.x:null};
}

// ── Registros anteriores de un ejercicio y peso sugerido para hoy ──
function histEj(s,nm){
  const out=[];
  comoArray(s.logs&&s.logs.sesiones).forEach(x=>comoArray(x&&x.detalle).forEach(d=>{ if(d&&d.n===nm&&!d.alt) out.push(d); }));
  return out;
}
// Si completó todas las series la última vez sube un escalón; si no, repite el peso.
// Sin historial: % de su 1RM estimado si el plan lo pide, o el peso escrito en el plan.
function cargaSugerida(s,ej){
  if(esEjCardio(ej)||esEjRondas(ej)||esEjMovilidad(ej)) return null;
  const u=histEj(s,ej.nm).filter(d=>+d.kg>0).pop();
  if(u){
    const kg=+u.kg, compl=(+u.s||0)>=(+u.p||1);
    if(!compl||esEjIsometrico(ej)) return {kg, ult:kg, sube:0, sr:u.sr};
    const nk=pqRedondear(kg+(kg>=20?2.5:kg>=5?1:0.5));
    return {kg:nk, ult:kg, sube:Math.round((nk-kg)*10)/10, sr:u.sr};
  }
  if(esEjIsometrico(ej)) return null;
  const pct=pct1RM(ej.peso), rm=s.logs&&s.logs.rm&&s.logs.rm[prKey(ej.nm)];
  if(pct&&rm) return {kg:pqRedondear(rm*pctPorReps(parseInt(ej.reps)||10,2)), ult:null, sube:null};
  const fijo=pqParseKg(ej.peso);
  return fijo?{kg:fijo, ult:null, sube:null}:null;
}
function minutosDia(d){
  const seg=(d.ejercicios||[]).reduce((a,e)=>{ const n=parseInt(e.series)||3; const r=segundosDescanso(e.descanso)||75; return a+n*(45+r); },0);
  return Math.max(10,Math.round(seg/60/5)*5);
}

// ═════════════ RUTINA ═════════════
let rutDia=null;
function renderRutinaTab(){
  const s=activeSocio; if(!s) return;
  actualizarHoy();
  const cont=document.getElementById('dsec-rutina');
  const fechas=fechasSemana(), sem=sesionesSemana(s);
  if(!DIAS_ORDER.includes(rutDia)) rutDia=HOY_KEY;
  const b=pqBloque(s), semA=Math.max(1,Math.min(pqSemanaActual(s),b.semanas));
  const pend=s.status==='pendiente'
    ? `<div class="pend-banner">${ico('clock')}<div>Tu plan está pendiente de revisión por tu entrenador. Puedes consultarlo, pero podría tener ajustes.</div></div>` : '';
  const weeks=Array.from({length:b.semanas},(_,i)=>`<i class="${i<semA-1?'done':i===semA-1?'now':''}"></i>`).join('');
  const strip=DIAS_ORDER.map((k,i)=>{
    const d=s.rutina[k], rest=!d||!d.ejercicios||!d.ejercicios.length, hoy=k===HOY_KEY;
    const est=sem[i]?', entrenado':rest?', descanso':'';
    return `<button type="button" class="en-dia${sem[i]?' done':''}${rest&&!sem[i]?' rest':''}${hoy?' hoy':''}" aria-pressed="${k===rutDia}" onclick="rutElegir('${k}')" aria-label="${EN_DIAS[i]} ${fechas[i]}${est}${hoy?', hoy':''}">
      <small>${EN_DIAS_CORTO[i]}</small><b class="num">${fechas[i]}</b><span class="en-st">${sem[i]?ico('check'):rest?'':'<span class="en-dot"></span>'}</span></button>`;
  }).join('');
  cont.innerHTML=`
    ${appHead('Mi plan',esc(sc(s.objetivo||'Entrenar'))+' · '+s.dias+' días por semana')}
    ${pend}
    ${pqPlanChip(s)}
    ${casaChipSocio(s)}
    <div class="en-block">
      <div class="en-block-t"><b>Semana ${semA} de ${b.semanas}</b><span>Bloque ${b.n}${s.asignado?' · '+esc(tc(String(s.asignado)).split(' ')[0]):''}</span></div>
      <div class="en-weeks" style="grid-template-columns:repeat(${b.semanas},1fr)" aria-hidden="true">${weeks}</div>
    </div>
    <div class="en-strip" role="group" aria-label="Días de esta semana">${strip}</div>
    <div id="en-dia">${rutDiaHTML(s)}</div>
    <div class="en-tip">${ico('spark')}<span>Toca un ejercicio para ver cómo se hace. El peso sugerido sale de tu última sesión: si completaste todas las series, subes un poco; si no, repites el peso.</span></div>`;
}
function rutElegir(k){
  rutDia=k; const s=activeSocio; if(!s) return;
  document.querySelectorAll('#dsec-rutina .en-dia').forEach((b,i)=>b.setAttribute('aria-pressed',DIAS_ORDER[i]===k));
  document.getElementById('en-dia').innerHTML=rutDiaHTML(s);
}
function rutDiaHTML(s){
  const k=rutDia, i=DIAS_ORDER.indexOf(k), d=s.rutina[k], sem=sesionesSemana(s), fechas=fechasSemana();
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY), esHoy=k===HOY_KEY, hecho=sem[i];
  if(!d||!d.ejercicios||!d.ejercicios.length){
    return `<div class="en-card"><div class="en-rest"><h3>Descanso</h3><p>El músculo crece hoy. Camina 20 a 30 minutos, estira y duerme 7 u 8 horas.</p></div></div>`;
  }
  const ejs=d.ejercicios;
  const grupos=[...new Set(ejs.map(e=>sc(String(e.ms||'').split(/[·,]/)[0].trim())).filter(Boolean))].slice(0,3);
  const estado=hecho?'Hecho':esHoy?'Hoy':i<hoyI?'Pendiente':'Próximo';
  const enCurso=esHoy&&sesionTemp&&sesionTemp.diaKey===k&&Object.keys(sesionTemp.ej||{}).length;
  const filas=ejs.map((e,j)=>{
    const c=cargaSugerida(s,e), r=rxTexto(e,s);
    const sub=r.sr+(c&&c.ult!=null?' · última '+enKg(c.ult):'')+(!c&&!enEspecial(e)&&!histEj(s,e.nm).length?' · nuevo para ti':'');
    const der=c?`<b class="num">${enKg(c.kg)}</b>${c.sube>0?`<small>+${kgToDisplay(c.sube)}</small>`:c.ult!=null?'<small class="igual">igual</small>':'<small class="igual">sugerido</small>'}`:'';
    return `<button type="button" class="en-ej" onclick="verComoDia('${k}',${j})" aria-label="${esc(e.nm)}: ver cómo se hace">
      <span class="en-th">${pic(basesEjercicioMini(e),'dumbbell','thumb')}</span>
      <span class="en-ej-t"><b>${esc(e.nm)}</b><span>${esc(sub)}</span></span>
      <span class="en-carga">${der}</span></button>`;
  }).join('');
  const cta=esHoy
    ? `<button type="button" class="en-btn en-btn-p" onclick="iniciarSesion('${k}')">${ico('play')}${enCurso?'Continuar sesión':hecho?'Registrar otra sesión':'Empezar sesión'}</button>`
    : `<button type="button" class="en-btn en-btn-g" onclick="openDay('${k}')">${ico('info')}Ver detalle del día</button>`;
  return `<article class="en-card">
    <div class="en-hero">
      <div class="en-k">${ico(hecho?'check':'calendar')}${estado} · ${EN_DIAS[i]} ${fechas[i]}</div>
      <h3>${esc(sc(d.tipo))}</h3>
      <div class="en-meta"><span>${ico('dumbbell')}${ejs.length} ejercicios</span><span>${ico('clock')}~${minutosDia(d)} min</span>${grupos.length?`<span>${ico('target')}${esc(enListaY(grupos))}</span>`:''}</div>
    </div>
    <div class="en-ejs">${filas}</div>
    <div class="en-cta">${cta}</div>
  </article>`;
}
function verComoDia(k,j){ const s=activeSocio; const e=s&&s.rutina[k]&&s.rutina[k].ejercicios[j]; if(e) abrirFicha(e); }

// ═════════════ FICHA "CÓMO SE HACE" ═════════════
function abrirFicha(ej){
  const dlg=document.getElementById('en-ficha'); if(!dlg||!ej) return;
  const f=fichaEj(ej);
  dlg.innerHTML=`<div class="en-f-in">
    <div class="en-f-top"><span class="en-grab" aria-hidden="true"></span><button type="button" class="en-btn-sm" onclick="cerrarFicha()">Cerrar</button></div>
    <div class="en-f-fig">${pic(basesEjercicio(ej),'dumbbell','thumb')}</div>
    <h3 id="en-f-t">${esc(ej.nm)}</h3>
    ${f.eq?`<div class="en-f-eq">${ico('dumbbell')}<span>${esc(f.eq)}</span></div>`:''}
    ${f.ms.length?`<div class="en-f-sec"><b>Músculos que trabaja</b><div class="en-musc">${f.ms.map((m,i)=>`<span class="${i?'':'p'}"><i></i>${esc(m)}${i?'':' · principal'}</span>`).join('')}</div></div>`:''}
    ${f.pasos?`<div class="en-f-sec"><b>Cómo se hace</b><ol class="en-pasos">${f.pasos.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>`:''}
    ${ej.tip?`<div class="en-f-sec"><b>Nota de tu entrenador</b><p>${esc(sinEmoji(ej.tip))}</p></div>`:''}
    ${f.evita?`<div class="en-evita">${ico('info')}<span><b>Evita:</b> ${esc(f.evita)}</span></div>`:''}
    <button type="button" class="en-btn en-btn-p" onclick="cerrarFicha()">Entendido</button></div>`;
  dlg.setAttribute('aria-labelledby','en-f-t');
  dlg.classList.remove('cerrando');
  if(!dlg.open) dlg.showModal();
  dlg.scrollTop=0;
}
function cerrarFicha(){
  const d=document.getElementById('en-ficha'); if(!d||!d.open) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ d.close(); return; }
  d.classList.add('cerrando');
  setTimeout(()=>{ d.close(); d.classList.remove('cerrando'); },200);
}

// ═════════════ SESIÓN EN CURSO ═════════════
let sesUI={k:null, cur:0, alts:false, borr:{}, aviso:false};
let sesReloj=null;
function iniciarSesion(k){
  const s=activeSocio; if(!s) return;
  const d=s.rutina[k]; if(!d||!d.ejercicios||!d.ejercicios.length) return;
  activeRutinaKey=k;
  if(!sesionTemp||sesionTemp.diaKey!==k) sesionTemp={diaKey:k, ej:{}};
  if(!sesionTemp.t0) sesionTemp.t0=Date.now();
  if(sesUI.k!==k) sesUI={k, cur:0, alts:false, borr:{}, aviso:false};
  go('s-ses');
  renderSes();
  clearInterval(sesReloj);
  sesReloj=setInterval(()=>{ const r=document.getElementById('en-reloj'); if(!r){ clearInterval(sesReloj); return; } r.textContent=enMMSS((Date.now()-(sesionTemp&&sesionTemp.t0||Date.now()))/1000); },1000);
}
function enMMSS(seg){ seg=Math.max(0,Math.floor(seg)); const h=Math.floor(seg/3600), m=Math.floor(seg%3600/60), x=seg%60; return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0'); }
function sesEjs(){ const s=activeSocio; return (s&&s.rutina[sesUI.k]&&s.rutina[sesUI.k].ejercicios)||[]; }
function sesReg(i){ if(!sesionTemp.ej[i]) sesionTemp.ej[i]={done:false,sets:[]}; return sesionTemp.ej[i]; }
function sesHechas(i){ const r=sesionTemp&&sesionTemp.ej[i]; if(!r) return 0; return (r.sets||[]).filter(x=>x&&(x.ok||x.seg>0||x.fc>0)).length || (r.done?1e9:0); }
function sesAvance(i,e){ const n=parseInt(e.series)||1; return Math.min(1,sesHechas(i)/n); }
// Valores en pantalla de cada serie (todavía sin marcar): peso sugerido y reps del plan
function sesBorrador(i,e,c){
  if(!sesUI.borr[i]){
    const n=parseInt(e.series)||3;
    sesUI.borr[i]=Array.from({length:n},(_,j)=>({kg:c?c.kg:0, r:parseInt(repsDeSerie(e,j))||0}));
  }
  return sesUI.borr[i];
}
function renderSes(){
  const s=activeSocio, cont=document.getElementById('en-ses'); if(!s||!cont||!sesionTemp) return;
  const ejs=sesEjs(), i=Math.min(sesUI.cur,ejs.length-1), e0=ejs[i]; if(!e0) return;
  const alt=ejEjecutado(e0,i), e=alt?Object.assign({},e0,{nm:alt.nm,ms:alt.ms||e0.ms,tip:alt.nota||e0.tip}):e0;
  const f=fichaEj(e), c=cargaSugerida(s,alt?e:e0), d=s.rutina[sesUI.k];
  const especial=enEspecial(e0), reg=sesReg(i);
  const M=e0.metodo&&KB_METODOS[e0.metodo.id]&&!especial?KB_METODOS[e0.metodo.id]:null;
  const des=segundosDescanso(e0.descanso);
  const prog=ejs.map((x,j)=>{ const p=sesAvance(j,x); return `<i class="${p>=1?'done':''}${j===i?' cur':''}"><b style="transform:scaleX(${p})"></b></i>`; }).join('');
  let series='';
  if(especial){
    const r=rxTexto(e0,s), n=sesHechas(i);
    series=`<div class="en-esp"><p>${esc(r.sr)}${r.carga?' · '+esc(r.carga):''}</p>
      <button type="button" class="en-btn en-btn-p" onclick="openModal(${i})">${ico('timer')}${n?'Ver o cambiar registro':'Registrar'}</button></div>`;
  } else {
    const B=sesBorrador(i,e0,c), prev=c&&c.sr;
    series=`<div class="en-sets" role="table" aria-label="Series de ${esc(e.nm)}">
      <div class="en-set-h" role="row"><span role="columnheader">#</span><span role="columnheader">Anterior</span>
        <span role="columnheader"><button type="button" class="en-unit" onclick="sesUnidad()" aria-label="Cambiar a ${unidadPeso==='kg'?'libras':'kilos'}">${unidadPeso.toUpperCase()}</button></span>
        <span role="columnheader">REPS</span><span role="columnheader"><span class="sr-only">Hecha</span></span></div>
      ${B.map((b,j)=>{ const st=reg.sets[j], ok=!!(st&&st.ok), kg=ok?st.kg:b.kg, rr=ok?(st.r||b.r):b.r;
        const ant=prev&&prev[j]?`${kgToDisplay(prev[j][0])} × ${prev[j][1]||'—'}`:(c&&c.ult!=null?`${kgToDisplay(c.ult)}`:'—');
        return `<div class="en-set${ok?' hecha':''}" role="row" data-j="${j}">
        <span class="en-n num" role="cell">${j+1}</span>
        <span class="en-prev num" role="cell">${ant}</span>
        <span role="cell"><input type="number" inputmode="decimal" step="0.5" min="0" value="${kg?kgToDisplay(kg):''}" placeholder="0" aria-label="${unidadPeso==='kg'?'Kilos':'Libras'} serie ${j+1}" oninput="sesValor(${i},${j},'kg',this.value)"></span>
        <span role="cell"><input type="number" inputmode="numeric" min="0" value="${rr||''}" placeholder="0" aria-label="Repeticiones serie ${j+1}" oninput="sesValor(${i},${j},'r',this.value)"></span>
        <span role="cell"><button type="button" class="en-ok" aria-pressed="${ok}" aria-label="Serie ${j+1} hecha" onclick="sesMarcar(${i},${j})">${ico('check')}</button></span></div>`; }).join('')}
    </div>`;
  }
  const alts=e0.alternativas||[], altSel=reg.alt;
  const sig=ejs[i+1];
  cont.innerHTML=`
    <div class="en-s-top">
      <button type="button" class="en-icon-btn" aria-label="Salir de la sesión (se guarda lo que llevas)" onclick="sesSalir()">${ico('chevl')}</button>
      <div class="en-s-t"><b>${esc(sc(d.tipo))}</b><span>${ico('clock')}<span class="num" id="en-reloj">${enMMSS((Date.now()-sesionTemp.t0)/1000)}</span></span></div>
      <button type="button" class="en-btn-sm" onclick="sesTerminar()">Terminar</button>
    </div>
    <div class="en-prog" aria-hidden="true">${prog}</div>
    <div class="en-ex">
      <button type="button" class="en-media" onclick="abrirFicha(sesEjActual())" aria-label="Ver cómo se hace ${esc(e.nm)}">
        ${pic(basesEjercicio(e),'dumbbell','thumb')}
        ${!especial&&!histEj(s,e0.nm).length?'<span class="en-new">Primera vez</span>':''}
        <span class="en-media-cta">${ico('play')}Cómo se hace</span>
      </button>
      <h3>${esc(e.nm)}</h3>
      <div class="en-meta"><span>Ejercicio ${i+1} de ${ejs.length}</span>${!especial?`<span>${esc(e0.series)} × ${esc(limpiarRepsTxt(e0.reps))}</span>`:''}${f.eq?`<span>${ico('dumbbell')}${esc(f.eq)}</span>`:''}${e0.grupo?`<span>Grupo ${esc(e0.grupo)}</span>`:''}</div>
      ${alt?`<div class="en-swap">Solo hoy, en lugar de ${esc(e0.nm)}</div>`:''}
      ${f.ms.length?`<div class="en-musc">${f.ms.map((m,j)=>`<span class="${j?'':'p'}"><i></i>${esc(m)}</span>`).join('')}</div>`:''}
      ${!especial?`<div class="en-pills">
        ${c?`<span class="en-pill l">${ico('bolt')}Hoy <b>${enKg(c.kg)}</b>${c.sube>0?' · +'+kgToDisplay(c.sube):''}</span>`:''}
        ${(()=>{ const pr=s.logs&&s.logs.prs&&s.logs.prs[prKey(e.nm)]; return pr?`<span class="en-pill">${ico('trophy')}Récord <b>${enKg(pr.kg)}</b></span>`:''; })()}
        ${des?`<span class="en-pill">${ico('timer')}Descanso <b>${des<120?des+' s':Math.round(des/60*10)/10+' min'}</b></span>`:''}
        ${M?`<span class="en-pill">${ico('bolt')}<b>${esc(M.nm)}</b></span>`:''}
      </div>`:''}
    </div>
    ${(M&&M.como)||e.tip?`<div class="en-tip">${ico('spark')}<span>${esc(sinEmoji(M&&M.como?M.como:e.tip))}</span></div>`:''}
    ${series}
    ${alts.length?`<button type="button" class="en-alt-tg" aria-expanded="${sesUI.alts}" onclick="sesUI.alts=!sesUI.alts;renderSes()"><span>¿Área ocupada? Cámbialo solo por hoy</span>${ico('chev')}</button>
      ${sesUI.alts?`<div class="en-alts">${alts.map((a,ai)=>`<button type="button" class="en-alt" aria-pressed="${altSel===ai}" onclick="sesAlternativa(${i},${ai})"><span><b>${esc(a.nm)}</b><span>${esc(a.nota||a.ms||'')}</span></span><em>${altSel===ai?'Hoy':'Usar'}</em></button>`).join('')}</div>`:''}`:''}
    ${sig?`<div class="en-next">${ico('arrow')}<div><b>Después: ${esc(sig.nm)}</b><span>${esc(rxTexto(sig,s).sr)}</span></div></div>`:''}
    <div class="en-nav">
      ${i>0?`<button type="button" class="en-btn en-btn-g en-btn-ic" aria-label="Ejercicio anterior" onclick="sesIr(-1)">${ico('chevl')}</button>`:''}
      <button type="button" class="en-btn en-btn-p" id="en-sig" data-pend="${sesAvance(i,e0)<1?1:0}" onclick="${sig?'sesIr(1)':'sesTerminar()'}">${sig?'Siguiente ejercicio':'Terminar sesión'}</button>
    </div>`;
}
function sesEjActual(){ const ejs=sesEjs(), i=sesUI.cur, e0=ejs[i]; const a=e0&&ejEjecutado(e0,i); return a?Object.assign({},e0,{nm:a.nm,ms:a.ms||e0.ms,tip:a.nota||e0.tip}):e0; }
function limpiarRepsTxt(r){ return String(r||'').replace(/\s*reps?\b/i,'').trim(); }
function sesValor(i,j,campo,v){
  const B=sesUI.borr[i]; if(!B||!B[j]) return;
  const n=parseFloat(v); const val=isNaN(n)?0:(campo==='kg'?displayToKg(n):Math.round(n));
  B[j][campo]=val;
  const st=sesReg(i).sets[j]; if(st&&st.ok) st[campo]=val;
}
function sesMarcar(i,j){
  const ejs=sesEjs(), e=ejs[i], reg=sesReg(i), B=sesUI.borr[i]; if(!B) return;
  const on=!(reg.sets[j]&&reg.sets[j].ok);
  // Solo las series marcadas se guardan: así el peso sugerido nunca cuenta como hecho
  reg.sets[j]=on?{kg:B[j].kg||0, r:B[j].r||0, ok:true}:undefined;
  const row=document.querySelector(`#en-ses .en-set[data-j="${j}"]`);
  if(row){ row.classList.toggle('hecha',on); row.querySelector('.en-ok').setAttribute('aria-pressed',on); }
  const bar=document.querySelectorAll('#en-ses .en-prog i')[i];
  if(bar){ const p=sesAvance(i,e); bar.querySelector('b').style.transform=`scaleX(${p})`; bar.classList.toggle('done',p>=1); }
  const sg=document.getElementById('en-sig'); if(sg) sg.dataset.pend=sesAvance(i,e)<1?1:0;
  if(!on) return;
  vibrarToque();
  const n=parseInt(e.series)||B.length, sigSerie=B.findIndex((x,k)=>k>j&&!(reg.sets[k]&&reg.sets[k].ok));
  const des=segundosDescanso(e.descanso)||90;
  if(sigSerie>=0) descansoIniciar(des,`Serie ${sigSerie+1} · ${B[sigSerie].kg?enKg(B[sigSerie].kg)+' × ':''}${B[sigSerie].r||''}`);
  else if(ejs[i+1]) descansoIniciar(des,ejs[i+1].nm);
  else descansoOcultar();
  if(sesHechas(i)>=n) reg.done=true;
}
function sesAlternativa(i,ai){
  const reg=sesReg(i); reg.alt=reg.alt===ai?null:ai;
  delete sesUI.borr[i]; reg.sets=(reg.sets||[]).map(()=>undefined);
  renderSes();
}
function sesUnidad(){ unidadPeso=unidadPeso==='kg'?'lb':'kg'; try{ localStorage.setItem('unidadPeso',unidadPeso); }catch(e){} renderSes(); }
function sesIr(d){ descansoOcultar(); sesUI.alts=false; sesUI.cur=Math.max(0,Math.min(sesEjs().length-1,sesUI.cur+d)); renderSes(); window.scrollTo(0,0); }
function sesSalir(){ descansoOcultar(); clearInterval(sesReloj); go('s-dash'); refreshDash(); dashTab('rutina'); }
function sesTerminar(){ descansoOcultar(); finalizarSesion(); }
// La ventana de siempre (cardio, rondas…) avisa al cerrarse para actualizar el avance
function sesRefrescar(){ if(document.getElementById('s-ses').classList.contains('on')) renderSes(); }

// ── Descanso: cuenta regresiva que sale desde abajo ──
const EN_C=2*Math.PI*30; let enD={left:0,total:0,iv:null,to:null};
function descansoIniciar(seg,sig){
  clearInterval(enD.iv); clearTimeout(enD.to); enD.left=enD.total=seg;
  const el=document.getElementById('en-desc'); if(!el) return;
  el.classList.remove('fin');
  el.innerHTML=`<div class="en-desc-in">
    <div class="en-ring"><svg viewBox="0 0 72 72" aria-hidden="true"><circle class="bgc" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30" stroke-dasharray="${EN_C}" stroke-dashoffset="0"/></svg><b class="num" id="en-d-t">${enMMSS(seg)}</b></div>
    <div class="en-desc-t"><b id="en-d-h">Descansa</b><span>Sigue: ${esc(sig)}</span></div>
    <div class="en-desc-a"><button type="button" onclick="descansoAjustar(-15)" aria-label="Quitar 15 segundos">−15</button><button type="button" onclick="descansoAjustar(15)" aria-label="Agregar 15 segundos">+15</button><button type="button" class="skip" onclick="descansoOcultar()">Saltar</button></div></div>`;
  el.setAttribute('aria-hidden','false'); el.inert=false;
  requestAnimationFrame(()=>{ if(el.getAttribute('aria-hidden')==='false') el.classList.add('on'); });
  enD.iv=setInterval(()=>{ enD.left=Math.max(0,enD.left-1); descansoPintar(); if(enD.left===0) descansoListo(); },1000);
}
function descansoPintar(){
  const t=document.getElementById('en-d-t'); if(t) t.textContent=enMMSS(enD.left);
  const fg=document.querySelector('#en-desc .fg'); if(fg) fg.setAttribute('stroke-dashoffset',EN_C*(1-enD.left/enD.total));
}
function descansoAjustar(d){ enD.left=Math.max(0,enD.left+d); enD.total=Math.max(enD.total,enD.left); descansoPintar(); if(enD.left===0) descansoListo(); }
function descansoListo(){
  clearInterval(enD.iv);
  const el=document.getElementById('en-desc'); if(!el) return;
  el.classList.add('fin'); const h=document.getElementById('en-d-h'); if(h) h.textContent='¡A darle!';
  vibrarToque([80,60,80]);
  enD.to=setTimeout(descansoOcultar,2600);
}
function descansoOcultar(){
  clearInterval(enD.iv); clearTimeout(enD.to);
  const el=document.getElementById('en-desc'); if(!el) return;
  el.classList.remove('on'); el.setAttribute('aria-hidden','true'); el.inert=true;
}

// ═════════════ RESUMEN AL TERMINAR ═════════════
let enFin=null;
function mostrarResumenSesion(info){
  enFin=info; clearInterval(sesReloj); descansoOcultar();
  sesUI={k:null, cur:0, alts:false, borr:{}, aviso:false};
  const s=activeSocio, x=info.reg, cont=document.getElementById('en-fin'); if(!s||!cont) return;
  const ev=calcEvolucion(s);
  const min=info.t0?Math.max(1,Math.round((x.ts-info.t0)/60000)):null;
  const tot=comoArray(x.detalle).reduce((a,d)=>a+(+d.p||0),0), ok=comoArray(x.detalle).reduce((a,d)=>a+Math.min(+d.s||0,+d.p||0),0);
  const pct=info.prevVol>0&&x.volumen>0?Math.round((x.volumen-info.prevVol)/info.prevVol*100):null, mx=Math.max(x.volumen,info.prevVol||0)||1;
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY);
  const prox=DIAS_ORDER.map((k,i)=>({k,i})).filter(o=>o.i>hoyI&&s.rutina[o.k]&&(s.rutina[o.k].ejercicios||[]).length)[0];
  const meta=Math.max(1,parseInt(s.dias)||3), hechas=Math.min(ev.estaSemana,meta);
  const fmt=n=>Math.round(n).toLocaleString('es-MX');
  cont.innerHTML=`
    <div class="en-fin-hero">
      <div class="en-fin-ck">${ico('check')}</div>
      <h2>Sesión completa</h2>
      <p>${esc(sc(x.tipo))} · ${EN_DIAS[hoyI]} ${new Date(x.ts).getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][new Date(x.ts).getMonth()]}</p>
    </div>
    <div class="en-fin-stats"><div><b class="num">${min!=null?min:'—'}</b><span>minutos</span></div><div><b class="num">${x.volumen>0?fmt(x.volumen):'—'}</b><span>kg de volumen</span></div><div><b class="num">${tot?ok+'/'+tot:x.ejercicios}</b><span>${tot?'series':'ejercicios'}</span></div></div>
    ${info.prs.length?`<section class="en-sec"><div class="en-sec-h"><h3>${info.prs.length===1?'Récord nuevo':info.prs.length+' récords nuevos'}</h3></div>
      <div class="en-prs en-stag">${info.prs.map(p=>`<div class="en-pr"><div class="en-pr-ic">${ico('trophy')}</div><div><b>${esc(p.n)}</b><span>Antes ${enKg(p.antes)}</span></div><strong class="en-up num">+${kgToDisplay(Math.round((p.kg-p.antes)*10)/10)}</strong></div>`).join('')}</div></section>`:''}
    ${pct!=null?`<section class="en-sec"><div class="en-sec-h"><h3>Contra tu último ${esc(sc(x.tipo))}</h3><span class="${pct>=0?'en-up':''}">${pct>=0?'+':''}${pct}% de volumen</span></div>
      <div class="en-cmp">
        <div class="en-cmp-r"><span>${esc(fmtFecha(info.prevFecha))}</span><div class="en-bar"><i class="prev" style="width:${info.prevVol/mx*100}%"></i></div><b class="num">${fmt(info.prevVol)}</b></div>
        <div class="en-cmp-r"><span>Hoy</span><div class="en-bar"><i style="width:${x.volumen/mx*100}%"></i></div><b class="num">${fmt(x.volumen)}</b></div>
      </div></section>`:''}
    <div class="en-goal">
      <div class="en-goal-top"><div><h3>Vas <span>${ev.estaSemana}</span> de ${meta}</h3><p>${ev.estaSemana>=meta?'¡Semana cumplida!':prox?'Próxima: '+esc(sc(s.rutina[prox.k].tipo))+', '+EN_DIAS[prox.i]+'.':'Te faltan '+(meta-ev.estaSemana)+' esta semana.'}</p></div>
        <div class="en-racha" aria-label="Racha de ${ev.racha} semanas">${ico('flame')}<b class="num">${ev.racha}</b><small>${ev.racha===1?'semana':'semanas'}</small></div></div>
      <div class="en-slots" aria-hidden="true">${Array.from({length:meta},(_,i)=>`<i class="${i<hechas?'ok':''}"></i>`).join('')}</div>
    </div>
    <section class="en-sec"><div class="en-sec-h"><h3>¿Cómo te sentiste?</h3><span>Ayuda a ajustar tu plan</span></div>
      <div class="en-feel" role="group" aria-label="Cómo te sentiste">${['Fácil','Bien','Duro','Al límite'].map(f=>`<button type="button" aria-pressed="${x.sensacion===f}" onclick="finSentir(this,'${f}')">${f}</button>`).join('')}</div></section>
    <button type="button" class="en-btn en-btn-p" onclick="finListo()">${ico('check')}Listo</button>`;
  go('s-fin');
}
function finSentir(btn,f){
  if(!enFin) return; const s=activeSocio;
  enFin.reg.sensacion=enFin.reg.sensacion===f?null:f;
  if(!enFin.reg.sensacion) delete enFin.reg.sensacion;
  btn.parentNode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.textContent===enFin.reg.sensacion));
  if(s) dbSave(s.code);
}
function finListo(){ enFin=null; go('s-dash'); refreshDash(); dashTab('progreso'); }

// ═════════════ PROGRESO ═════════════
function renderProgresoTab(){
  av3dDestruir();
  const s=activeSocio; if(!s) return;
  asegurarLogs(s);
  const ev=calcEvolucion(s), ses=comoArray(s.logs.sesiones).filter(Boolean);
  const pesos=s.logs.pesoCorporal||[], pesoNow=pesoActual(s), prs=s.logs.prs||{};
  const meta=Math.max(1,parseInt(s.dias)||3), hechas=Math.min(ev.estaSemana,meta), falta=Math.max(0,meta-ev.estaSemana);
  const sem=sesionesSemana(s), hoyI=DIAS_ORDER.indexOf(HOY_KEY);
  const tocan=DIAS_ORDER.map((k,i)=>({k,i})).filter(o=>o.i>=hoyI&&!sem[o.i]&&s.rutina[o.k]&&(s.rutina[o.k].ejercicios||[]).length).map(o=>EN_DIAS[o.i]).slice(0,falta);
  const goalTxt=ev.estaSemana>=meta?'¡Semana cumplida! Lo que sumes ahora es extra.'
    :`Te ${falta===1?'falta 1 sesión':'faltan '+falta+' sesiones'} para cerrar la semana.${tocan.length?' Te toca'+(tocan.length>1?'n ':' ')+enListaY(tocan)+'.':''}`;
  const desde=s.fechaRegistro||(ses[0]&&ses[0].fecha);
  const sesRev=ses.slice().reverse().slice(0,8);
  const prKeys=Object.keys(prs).sort((a,b)=>prs[b].kg-prs[a].kg).slice(0,6);
  document.getElementById('dsec-progreso').innerHTML=`
    ${appHead('Mi progreso',desde?'Desde el '+fmtFecha(desde):'Tu esfuerzo se ve en los resultados.')}
    <div class="en-goal">
      <div class="en-goal-top"><div><h3>Vas <span>${ev.estaSemana}</span> de ${meta}</h3><p>${goalTxt}</p></div>
        <div class="en-racha" aria-label="Racha de ${ev.racha} semanas">${ico('flame')}<b class="num">${ev.racha}</b><small>${ev.racha===1?'semana':'semanas'}</small></div></div>
      <div class="en-slots" aria-hidden="true">${Array.from({length:meta},(_,i)=>`<i class="${i<hechas?'ok':''}"></i>`).join('')}</div>
    </div>

    <section class="en-sec"><div class="en-sec-h"><h3>Constancia</h3><span>${ev.total} ${ev.total===1?'sesión':'sesiones'} · ${ev.adherencia}% en 4 semanas</span></div>
      ${enHeatHTML(s,ses)}</section>

    <section class="en-sec"><div class="en-sec-h"><h3>Fuerza</h3><span>Mejor peso de cada mes</span></div>
      ${enFuerzaHTML(s,ses)}</section>

    <section class="en-sec"><div class="en-sec-h"><h3>Peso corporal</h3>${ev.deltaPeso!==null?`<span class="${ev.deltaPeso<=0?'en-up':''}">${ev.deltaPeso>0?'+':''}${ev.deltaPeso} kg desde tu registro</span>`:''}</div>
      <div class="en-peso">
        <div class="en-peso-top"><b class="num">${pesoNow}<small> kg</small></b></div>
        ${enPesoSVG(pesos)}
        <div class="peso-input-row">
          <input type="number" id="peso-nuevo" placeholder="${pesoNow}" step="0.1" min="30" max="250" inputmode="decimal" aria-label="Tu peso de hoy en kilos">
          <button type="button" class="btn-mini" onclick="guardarPeso()">Registrar peso</button>
        </div>
      </div></section>

    ${enHitoHTML(ev.total)}

    ${prKeys.length?`<section class="en-sec"><div class="en-sec-h"><h3>Récords personales</h3></div>
      <div class="en-list">${prKeys.map(nm=>`<div class="en-li"><span>${esc(nm)}</span><b class="num">${enKg(prs[nm].kg)}</b><small>${fmtFecha(prs[nm].fecha)}</small></div>`).join('')}</div></section>`:''}

    <section class="en-sec"><div class="en-sec-h"><h3>Últimas sesiones</h3>${sesRev.length?'<span>Volumen</span>':''}</div>
      ${sesRev.length?`<div class="en-hist">${sesRev.map(x=>{ const f=new Date((x.fecha||'')+'T12:00:00'); const ok=!isNaN(f);
        return `<div class="en-h-row"><div class="en-h-d"><b class="num">${ok?f.getDate():'—'}</b><small>${ok?EN_MESES[f.getMonth()].toUpperCase():''}</small></div>
        <div class="en-h-t"><b>${esc(sc(x.tipo||'Sesión'))}</b><span>${x.ejercicios||0} ejercicios${x.sensacion?' · '+esc(x.sensacion):''}</span></div>
        <div class="en-h-v num">${x.volumen>0?Math.round(x.volumen).toLocaleString('es-MX'):'—'}${x.volumen>0?'<small>kg</small>':''}</div></div>`; }).join('')}</div>`
      :'<div class="empty-msg">Aún no hay sesiones registradas.<br>Al terminar tu primera sesión aparecerá aquí.</div>'}</section>

    <div class="card" id="card-cuerpo">
      <div class="card-t">${it('user','sm')}Tu rendimiento y equilibrio corporal</div>
      <div id="cuerpo-contenido"></div>
    </div>`;
  renderCuerpo();
}
// Mapa de 12 semanas (filas lunes a domingo): completa si hizo al menos el 80% de las series
function enHeatHTML(s,ses){
  const ini=inicioSemana(new Date()); ini.setDate(ini.getDate()-77);
  const hoy=new Date(); hoy.setHours(23,59,59,999);
  const nivel=(t0)=>{ const t1=t0+86400000; const del=ses.filter(x=>x.ts>=t0&&x.ts<t1); if(!del.length) return 0;
    const det=del.flatMap(x=>comoArray(x.detalle)); if(!det.length) return 2;
    const r=det.reduce((a,d)=>a+Math.min(+d.s||0,+d.p||0),0)/Math.max(1,det.reduce((a,d)=>a+(+d.p||0),0));
    return r>=.8?2:1; };
  let h='';
  for(let d=0;d<7;d++){
    h+=`<span class="en-hl">${'LMXJVSD'[d]}</span>`;
    for(let w=0;w<12;w++){
      const f=new Date(ini); f.setDate(ini.getDate()+w*7+d);
      const fut=f>hoy, esHoy=fechaISO(f)===fechaISO(new Date()), v=fut?0:nivel(f.getTime());
      h+=`<span class="en-cell${v===2?' c2':v===1?' c1':''}${fut?' fut':''}${esHoy?' hoy':''}"></span>`;
    }
  }
  return `<div class="en-heat-w"><div class="en-heat" role="img" aria-label="Mapa de entrenamientos de las últimas 12 semanas">${h}</div>
    <div class="en-heat-leg"><span>Hace 12 semanas</span><span><i class="c0"></i>Nada<i class="c1"></i>Parcial<i class="c2"></i>Completa</span></div></div>`;
}
// Ejercicios con más registros: mejor peso de cada mes (hasta 6 meses)
function enFuerzaHTML(s,ses){
  const por={};
  ses.forEach(x=>comoArray(x.detalle).forEach(d=>{ if(!d||d.alt||!(+d.kg>0)||!x.fecha) return;
    const m=x.fecha.slice(0,7); (por[d.n]=por[d.n]||{})[m]=Math.max((por[d.n]||{})[m]||0,+d.kg); }));
  const lifts=Object.keys(por).map(n=>{ const ms=Object.keys(por[n]).sort().slice(-6); return {n, ms, v:ms.map(m=>por[n][m])}; })
    .filter(l=>l.v.length>=2).sort((a,b)=>(b.v[b.v.length-1]-b.v[0])-(a.v[a.v.length-1]-a.v[0])).slice(0,4);
  if(!lifts.length) return '<div class="empty-msg">Registra el peso de tus series durante al menos dos meses y aquí verás cuánto subes en cada ejercicio.</div>';
  return `<div class="en-lifts">${lifts.map(l=>{ const a=l.v[0], b=l.v[l.v.length-1], dif=Math.round((b-a)*10)/10, pc=a>0?Math.round(dif/a*100):0;
    const mes=m=>EN_MESES[+m.slice(5,7)-1];
    return `<button type="button" class="en-lift" aria-expanded="false" onclick="this.setAttribute('aria-expanded',this.getAttribute('aria-expanded')!=='true')">
      <span class="en-lift-n">${esc(l.n)}</span>${enSpark(l.v)}
      <span class="en-lift-v"><b class="num">${enKg(b)}</b><span class="${dif>0?'en-up':''}">${dif>0?'+':''}${kgToDisplay(dif)} · ${dif>0?'+':''}${pc}%</span></span>
      <span class="en-lift-det">${l.ms.map((m,i)=>mes(m)+' '+kgToDisplay(l.v[i])).join(' · ')} ${unidadPeso}</span></button>`; }).join('')}</div>`;
}
function enSpark(v){
  const W=112,H=44,p=4,mn=Math.min(...v),mx=Math.max(...v);
  const pt=v.map((y,i)=>[p+i*(W-2*p)/(v.length-1),H-p-(y-mn)/((mx-mn)||1)*(H-2*p)]);
  const d=pt.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' '), l=pt[pt.length-1];
  return `<svg class="en-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="a" d="${d} L${l[0]} ${H} L${p} ${H}Z"/><path class="l" d="${d}"/><circle cx="${l[0]}" cy="${l[1]}" r="3.5"/></svg>`;
}
function enPesoSVG(pesos){
  if(pesos.length<2) return '<div class="empty-msg">Registra tu peso al menos 2 veces para ver la curva.</div>';
  const v=pesos.slice(-24).map(p=>+p.kg), fs=pesos.slice(-24).map(p=>p.fecha);
  let mn=Math.min(...v), mx=Math.max(...v); const rg=Math.max(1,mx-mn); mn=Math.floor((mn-rg*.15)*2)/2; mx=Math.ceil((mx+rg*.15)*2)/2;
  const X0=36,X1=312,Y0=10,Y1=112, x=i=>X0+i*(X1-X0)/(v.length-1), y=k=>Y1-(k-mn)/(mx-mn)*(Y1-Y0);
  let s='';
  [mn,(mn+mx)/2,mx].forEach(k=>{ s+=`<line class="g" x1="${X0}" x2="${X1}" y1="${y(k)}" y2="${y(k)}"/><text x="${X0-6}" y="${y(k)+4}" text-anchor="end">${Math.round(k*10)/10}</text>`; });
  s+=`<path class="l" d="${v.map((k,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(k).toFixed(1)).join(' ')}"/>`;
  s+=`<circle class="ini" cx="${x(0)}" cy="${y(v[0])}" r="4"/><circle class="fin" cx="${x(v.length-1)}" cy="${y(v[v.length-1])}" r="4"/>`;
  s+=`<text x="${X0}" y="132" text-anchor="start">${esc(fmtFecha(fs[0]))}</text><text x="${X1}" y="132" text-anchor="end">${esc(fmtFecha(fs[fs.length-1]))}</text>`;
  return `<svg class="en-peso-svg" viewBox="0 0 320 138" role="img" aria-label="Peso de ${v[0]} a ${v[v.length-1]} kilos">${s}</svg>`;
}
function enHitoHTML(total){
  const H=[1,5,10,20,30,40,50,75,100,150,200,250,300,400,500,750,1000];
  const sig=H.find(h=>h>total); if(!sig) return '';
  const falta=sig-total;
  return `<div class="en-mile"><div class="en-mile-top"><div class="en-mile-ic">${ico('trophy')}</div>
    <div><b>${falta===1?'1 sesión':falta+' sesiones'} para tus ${sig} entrenamientos</b><span>${total?'Llevas '+total+'. Cada sesión cuenta.':'Tu primera sesión empieza la cuenta.'}</span></div></div>
    <div class="en-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${sig}" aria-valuenow="${total}" aria-label="${total} de ${sig} entrenamientos"><i style="width:${total/sig*100}%"></i></div></div>`;
}
