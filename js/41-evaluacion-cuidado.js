/* ═══ evaluación, poblaciones especiales y lesiones ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Convierte los bloques 2, 10 y 11 del cuestionario de filosofía (js/24-filosofia-entrenador.js) en reglas:
     · evaluación inicial y reevaluación (qué se mide, con qué ejercicios de referencia y cada cuándo)
     · fase de adaptación de principiantes y paso de máquina a peso libre
     · reglas para adultos mayores (60+) y para IMC de 35 o más
     · carga en la zona lesionada, umbral de dolor y cuándo derivar a fisioterapia o al médico
   Regla fija del sistema, no configurable: lo que el catálogo marca como contraindicado para una lesión
   nunca se programa (por ejemplo, ningún peso muerto ni buenos días con molestia lumbar). El socio entrena
   solo la mayor parte del tiempo y nadie revisa su técnica ni cuánto peso carga. ═══ */

function cuidadoFilo(ph){ return metActiva(ph)?ph:null; }
function pobCoach(ph){ const p=(cuidadoFilo(ph)&&ph.poblaciones)||{}; return {adaptacion:parseInt(p.adaptacion)||0, libre:p.libre||'', mayores:comoArray(p.mayores), obesidad:comoArray(p.obesidad)}; }
function lesCoach(ph){ const l=(cuidadoFilo(ph)&&ph.lesiones)||{}; return {zona:l.zona||'', dolor:l.dolor||'', derivar:comoArray(l.derivar).length?comoArray(l.derivar):null}; }   // sin marcar = derivación sugerida
function evalCoach(ph){ const v=(cuidadoFilo(ph)&&ph.evaluacion)||{}; return {inicio:comoArray(v.inicio), ref:comoArray(v.ref).slice(0,4), reevalua:v.reevalua||''}; }
function entSocio(s){ try{ return entRutina(s&&s.entrenadorId); }catch(_){ return null; } }

// ═════════════ POBLACIONES ═════════════
const POB_BAJO_IMPACTO=['salto','saltos','brinco','jump','trote','correr','burpee','cuerda','escaladores','jumping'];
const POB_SOLO_CAMINAR=['trote','correr','escaladora','ski','cuerda','cuerdas','remo ergometro','trineo','burpee'];
// Campos extra del contexto del motor (los lee js/14-motor-rutinas.js)
function ctxCuidado(f,nivel,edad,imc,objetivo){
  const P=pobCoach(f), L=lesCoach(f), out={evitaPob:[], adaptacion:0, guiado:false, pob:{}};
  if(objetivo==='REHABILITACIÓN'||objetivo==='FLEXIBILIDAD') return out;
  if(nivel===1 && P.adaptacion) out.adaptacion=P.adaptacion;
  // Hasta pasar a peso libre, la barra libre y los ejercicios técnicos se cambian por versiones guiadas
  if(nivel===1 && (P.libre==='yo' || (P.libre==='adaptacion' && P.adaptacion))) out.guiado=true;
  if(edad>=60){
    P.mayores.forEach(x=>{ out.pob[x]=true; });
    if(out.pob.sinSaltos) out.evitaPob.push(...PLIO_NM);
  }
  if(imc>=35){
    P.obesidad.forEach(x=>{ out.pob['ob_'+x]=true; });
    if(out.pob.ob_impacto) out.evitaPob.push(...POB_BAJO_IMPACTO);
    if(out.pob.ob_caminata) out.evitaPob.push(...POB_SOLO_CAMINAR);
    if(out.pob.ob_maquinas) out.guiado=true;
  }
  out.zonaLigera=L.zona==='ligera';
  out.evitaPob=[...new Set(out.evitaPob)];
  return out;
}
function cuidadoEvita(x,ctx){ return (ctx.evitaPob||[]).some(n=>kbNorm(x.nm||x.nombre||'').includes(n)); }

// Después del filtro de lesiones: carga ligera en la zona lesionada, equilibrio, potencia ligera y circuitos
function ajustarCuidado(semana,ctx){
  if(!ctx || ctx.sinMetodos || ctx.soloSuaves) return 0;
  const dias=(semana||[]).filter(d=>d&&Array.isArray(d.ejercicios)&&d.ejercicios.length&&!/descanso|complemento|cardiovascular/i.test(d.tipo||''));
  const nunca=ctx.evitaNm||[]; let n=0;
  if(ctx.zonaLigera && ctx.les.length) dias.forEach(d=>d.ejercicios.forEach(e=>{
    if(!metEsFuerza(e) || e.potencia || !cargaLesion(ctx,datosEj(e))) return;
    e.reps=String(e.reps||'').replace(/^[^—·]*/,'12-15 reps ').replace(/—\s*(fuerza|hipertrofia|potencia)/i,'— resistencia');
    if(!/—/.test(e.reps)) e.reps='12-15 reps — resistencia';
    e.esfuerzo='Carga ligera: deja 4 reps en reserva y nunca trabajes con dolor'; e.rir=4;
    if(!/^(corporal|banda|sin carga)/i.test(e.peso||'')) e.peso='Ligero — 40% 1RM';
    if(!/zona lesionada/i.test(e.tip||'')) e.tip='Trabaja tu zona lesionada con carga ligera y rango cómodo. '+(e.tip||'');
    n++;
  }));
  const P=ctx.pob||{};
  if(P.equilibrio || P.caidas){
    dias.slice(0,2).forEach(d=>{
      if(d.ejercicios.some(e=>/equilibrio/i.test(e.nm||e.nombre||''))) return;
      const e={nombre:'Equilibrio en una pierna', nm:'Equilibrio en una pierna', musculo:'Equilibrio · Tobillo · Glúteo medio', ms:'Equilibrio · Tobillo · Glúteo medio',
        series:2, reps:'30 seg por lado — isométrico', peso:'Corporal', _cuidado:1,
        tip:'Junto a una pared o barra para apoyarte si lo necesitas. Mira un punto fijo; cuando sea fácil, cierra los ojos unos segundos.'};
      const i=d.ejercicios.findIndex(y=>metEsCore(y)||esEjCardio(y)||y.fase==='cierre');
      if(i>=0) d.ejercicios.splice(i,0,e); else d.ejercicios.push(e); n++;
    });
  }
  if(P.fuerzaFuncional) n+=metCubrirPatrones(dias,['cargar','unilateral'],ctx,nunca);
  if(P.potencia){
    const d=dias.find(x=>x.ejercicios.some(e=>metEsFuerza(e)&&MET_PIERNA.includes(datosEj(e).enf)&&datosEj(e).tipo==='c'));
    const e=d&&d.ejercicios.find(e=>metEsFuerza(e)&&MET_PIERNA.includes(datosEj(e).enf)&&datosEj(e).tipo==='c');
    if(e && !/potencia ligera/i.test(e.tip||'')){ e.tip='Potencia ligera: sube rápido y baja lento, con un peso que muevas con soltura. Ayuda a prevenir caídas. '+(e.tip||''); n++; }
  }
  if(P.ob_circuitos){
    let k=0;
    dias.forEach(d=>{
      if(k>=2 || d.ejercicios.some(e=>esEjCardio(e)||esEjRondas(e))) return;
      const x=metElegir(P.ob_caminata?['bici','caminadora_incl']:['bici','eliptica','caminadora_incl'],ctx,nunca); if(!x) return;
      d.ejercicios.push(metNuevo(x,{series:5, reps:'', peso:'', _cuidado:1, tip:'Circuito de bajo impacto: 1 minuto a buen ritmo y 1 minuto suave. Sin saltos ni impacto.'}));
      k++; n++;
    });
  }
  return n;
}

// ═════════════ ADAPTACIÓN DE PRINCIPIANTES ═════════════
function adaptSocio(s){
  if(!s || nivelNum(s.nivel)!==1) return 0;
  const e=entSocio(s); return pobCoach(e&&e.filosofia).adaptacion;
}

// ═════════════ DOLOR ═════════════
const DOLOR_NIV=[['0','Nada'],['1','Leve'],['2','Moderado'],['3','Fuerte']];   // 1-3 · 4-6 · 7-10 de 10
const DOLOR_SINT=[['agudo','Agudo o punzante'],['inflamacion','Inflamación'],['hormigueo','Adormecimiento u hormigueo'],['empeora','Empeora con los días'],['nocede','No cede en 2 semanas']];
const DOLOR_DERIVA_DEF=['agudo','inflamacion','hormigueo','empeora'];
function dolorReglas(s){
  const e=entSocio(s), L=lesCoach(e&&e.filosofia);
  return {umbral:L.dolor||'3', derivar:L.derivar||DOLOR_DERIVA_DEF};
}
function dolorMensaje(s,d){
  if(!d || !(+d.n>0)) return '';
  const R=dolorReglas(s);
  if((d.sint||[]).some(x=>R.derivar.includes(x)))
    return '⚠ Ese síntoma necesita valoración: consulta a fisioterapia o al médico antes de volver a cargar esa zona. Tu entrenador ya está avisado.';
  if(R.umbral==='fisio') return 'Sigue lo que te indicó tu fisioterapeuta y comenta esta molestia con tu entrenador.';
  const pasa=R.umbral==='nada' ? +d.n>=1 : +d.n>=2;
  return pasa ? 'Pasa el límite de dolor de tu entrenador: la próxima vez baja el peso o usa la alternativa del ejercicio, y avísale.'
    : 'Dolor leve: tu entrenador lo tolera si mañana no empeora. Si empeora, avísale.';
}
function dolorDeriva(s,d){ return !!d && +d.n>0 && (d.sint||[]).some(x=>dolorReglas(s).derivar.includes(x)); }
function dolorHTML(x){
  const d=x.dolor||{n:'0',sint:[]}, s=activeSocio;
  const msg=s?dolorMensaje(s,d):'';
  return `<section class="en-sec" id="en-dolor"><div class="en-sec-h"><h3>¿Sentiste dolor o molestia?</h3><span>Leve 1-3 · Moderado 4-6 · Fuerte 7-10</span></div>
    <div class="en-feel" role="group" aria-label="Dolor durante la sesión">${DOLOR_NIV.map(([v,l])=>`<button type="button" aria-pressed="${String(d.n)===v}" onclick="finDolor('${v}')">${l}</button>`).join('')}</div>
    ${+d.n>0?`<div class="en-feel en-feel-s" role="group" aria-label="Síntomas">${DOLOR_SINT.map(([v,l])=>`<button type="button" aria-pressed="${(d.sint||[]).includes(v)}" onclick="finDolorSint('${v}')">${l}</button>`).join('')}</div>`:''}
    ${msg?`<p class="en-fin-nota" role="status">${esc(msg)}</p>`:''}</section>`;
}
function finDolorPintar(){ const el=document.getElementById('en-dolor'); if(el&&enFin) el.outerHTML=dolorHTML(enFin.reg); }
function finDolorGuardar(){
  const s=activeSocio; if(!s||!enFin) return;
  const d=enFin.reg.dolor;
  if(!d || !(+d.n>0)) delete enFin.reg.dolor;
  if(dolorDeriva(s,d)) s.alertaDolor={fecha:enFin.reg.fecha, n:+d.n, sint:d.sint.slice(), tipo:enFin.reg.tipo||''};
  else if(s.alertaDolor && s.alertaDolor.fecha===enFin.reg.fecha) delete s.alertaDolor;
  dbSave(s.code);
  finDolorPintar();
}
function finDolor(v){
  if(!enFin) return;
  const d=enFin.reg.dolor||(enFin.reg.dolor={n:'0',sint:[]});
  d.n=v; if(v==='0') d.sint=[];
  finDolorGuardar();
}
function finDolorSint(v){
  if(!enFin||!enFin.reg.dolor) return;
  const l=enFin.reg.dolor.sint||(enFin.reg.dolor.sint=[]); const i=l.indexOf(v); if(i>=0) l.splice(i,1); else l.push(v);
  finDolorGuardar();
}
function dolorStaffHTML(s){
  const a=s.alertaDolor; if(!a) return '';
  const nv=(DOLOR_NIV.find(x=>x[0]===String(a.n))||[])[1]||'';
  const si=comoArray(a.sint).map(v=>(DOLOR_SINT.find(x=>x[0]===v)||[])[1]||v).join(', ');
  return `<div class="pg-alerta" role="alert"><b>⚠ Reportó dolor ${esc(nv.toLowerCase())} el ${esc(fmtFecha(a.fecha))}${a.tipo?' ('+esc(sc(a.tipo))+')':''}</b>
    <span>Síntomas: ${esc(si||'—')}. Según tu regla debe valorarlo fisioterapia o un médico antes de volver a cargar esa zona.</span>
    <div class="fx-acts"><button type="button" class="sd-b p" onclick="staffSetTab('rutina')">Ajustar rutina</button><button type="button" class="sd-b" onclick="dolorRevisado('${esc(s.code)}')">Marcar como revisado</button></div></div>`;
}
function dolorRevisado(code){
  const s=getSocio(code); if(!s) return;
  delete s.alertaDolor; pqGuardarStaff(s,['alertaDolor']); staffRenderContent(s); staffRenderList();
  showToast('Alerta de dolor revisada');
}

// ═════════════ EVALUACIÓN ═════════════
const EVAL_ITEMS={peso_cintura:'Peso y cintura', grasa:'% de grasa', rm:'Fuerza en tus ejercicios de referencia', saltos:'Salto (potencia)',
  movilidad:'Movilidad', cardio:'Prueba cardiovascular', fotos:'Fotos de progreso', salud:'Cuestionario de salud y lesiones'};
const EVAL_AUTO=['peso_cintura','grasa','rm','salud'];
const EVAL_REF={sentadilla:['Sentadilla',/sentadilla(?! bulgara)/], peso_muerto:['Peso muerto',/peso muerto/], banca:['Press de banca',/press (de )?banca/],
  jalon:['Jalón o dominada',/jalon|dominada/], militar:['Press militar',/press militar|press de hombro/], hip_thrust:['Hip thrust',/hip thrust/], prensa:['Prensa',/prensa/]};
function evalRefDe(nm,ref){ const n=kbNorm(nm); return (ref||[]).find(k=>EVAL_REF[k]&&EVAL_REF[k][1].test(n))||null; }
// Desde qué fecha cuenta lo evaluado: la primera vez, todo; al reevaluar, desde el inicio del bloque o desde la última evaluación
function evalEstado(s){
  const e=entSocio(s), C=evalCoach(e&&e.filosofia);
  if(!C.inicio.length || progSuave(s)) return null;
  const ev=s.evaluacion||{}, ult=ev.fecha||'', b=pqBloque(s);
  let toca=!ult, desde='';
  if(ult && C.reevalua!=='inicio'){
    if(C.reevalua==='bloque' || (C.reevalua==='cada2' && b.n%2===0)) toca=pqSemanaActual(s)>=b.semanas && ult<b.desde;
    else if(C.reevalua==='anual') toca=(diasDesde(ult)||0)>=90;
    if(toca) desde=C.reevalua==='anual'?ult:b.desde;
  }
  const it=ev.items||{};
  const hecho=id=>{
    if(it[id] && (!desde || (C.reevalua==='anual' ? it[id]>desde : it[id]>=desde))) return true;
    if(desde) return id==='rm' && evalRmHecho(s,C.ref,desde);
    if(id==='peso_cintura') return !!(+s.peso && +s.cintura);
    if(id==='grasa') return !!(+s.cintura);
    if(id==='salud') return Array.isArray(s.limitaciones) || !!s.fechaRegistro;   // se contesta en el registro (vacío = sin limitaciones)
    if(id==='rm') return evalRmHecho(s,C.ref,'');
    return false;
  };
  const items=C.inicio.filter(id=>EVAL_ITEMS[id]).map(id=>({id, nm:EVAL_ITEMS[id], ok:hecho(id), auto:EVAL_AUTO.includes(id)}));
  return {toca, inicial:!ult, desde, items, ref:C.ref, pendientes:items.filter(x=>!x.ok).length, reevalua:C.reevalua};
}
function evalRmHecho(s,ref,desde){
  if(!ref.length) return comoArray(s.logs&&s.logs.sesiones).some(x=>x&&x.fecha>=desde&&comoArray(x.detalle).some(d=>+d.kg>0));
  const vistos=new Set();
  comoArray(s.logs&&s.logs.sesiones).forEach(x=>{ if(!x||x.fecha<desde) return; comoArray(x.detalle).forEach(d=>{ if(+d.kg>0){ const k=evalRefDe(d.n,ref); if(k) vistos.add(k); } }); });
  return ref.every(k=>vistos.has(k) || !evalRefEnRutina(s,k));
}
function evalRefEnRutina(s,k){ return DIAS_ORDER.some(d=>comoArray(s.rutina&&s.rutina[d]&&s.rutina[d].ejercicios).some(e=>EVAL_REF[k][1].test(kbNorm(e.nm||'')))); }
const EVAL_PISTA={peso_cintura:'Anota tu peso y tu cintura en Perfil.', grasa:'Sale de tu cintura: anótala en Perfil.', rm:'Registra el peso de tus series en: ', salud:'Lo contestaste al registrarte.',
  saltos:'Se hace con tu entrenador en piso.', movilidad:'Se hace con tu entrenador en piso.', cardio:'Se hace con tu entrenador en piso.', fotos:'Tu entrenador te las toma o te dice cómo.'};
function evalCardSocio(s){
  if(!s || s.status!=='activo') return '';
  const E=evalEstado(s); if(!E || !E.pendientes) return '';
  if(E.inicial && (diasDesde(s.fechaRegistro)||0)>28) return '';
  if((s.avisosVistos||{}).eval===evalAvisoClave(E)) return '';
  const listos=E.items.length-E.pendientes;
  return `<div class="pg-home soft ev-card ev-mini">
    <div class="ev-mini-tx"><div class="pg-home-k">${E.inicial?'Tu evaluación inicial':'Toca reevaluarte'}</div>
      <div class="ev-mini-m">${listos} de ${E.items.length} listos · tu entrenador te guía en lo que falta</div></div>
    <button type="button" class="sd-b ev-mini-b" onclick="evalVerSocio()">Ver qué falta</button>
    <button type="button" class="ev-mini-x" onclick="evalAvisoCerrar()" aria-label="Ocultar aviso">${ico('x')}</button></div>`;
}
// Aviso de evaluación: el socio lo oculta y no vuelve hasta la siguiente reevaluación
function evalAvisoClave(E){ return E.inicial?'inicial':'re-'+(E.desde||''); }
function evalAvisoCerrar(){
  const s=activeSocio; if(!s) return; const E=evalEstado(s); if(!E) return;
  s.avisosVistos=Object.assign({},s.avisosVistos,{eval:evalAvisoClave(E)}); dbSave(s.code);
  showToast('Listo. Tu evaluación sigue en Perfil.'); refreshDash();
}
function evalVerSocio(){
  const s=activeSocio; if(!s) return; const E=evalEstado(s); if(!E) return;
  const refTxt=E.ref.map(k=>EVAL_REF[k][0]).join(', ');
  let m=document.getElementById('modal-eval'); if(!m){ m=document.createElement('div'); m.className='modal'; m.id='modal-eval'; m.onclick=e=>{ if(e.target===m) m.classList.remove('open'); }; document.body.appendChild(m); }
  m.innerHTML=`<div class="mbox" style="max-width:460px" role="dialog" aria-modal="true">
    <div class="pg-home-k">${E.inicial?'Tu evaluación inicial':'Toca reevaluarte'}</div>
    <div style="font-size:var(--fs-md);color:var(--mu);line-height:1.5;margin:6px 0 12px">Sirve para medir tu punto de partida y ajustar tu plan. Lo que se hace en piso lo marca tu entrenador.</div>
    <ul class="ev-l">${E.items.map(x=>`<li class="${x.ok?'ok':''}"><b>${x.ok?'✓ ':''}${esc(x.nm)}</b>${x.ok?'':`<span>${esc(EVAL_PISTA[x.id]+(x.id==='rm'?(refTxt||'tus ejercicios principales')+'.':''))}</span>`}</li>`).join('')}</ul>
    <button type="button" class="sd-pri" style="width:100%;margin-top:16px" onclick="document.getElementById('modal-eval').classList.remove('open')">Entendido</button></div>`;
  m.classList.add('open');
}
function evalFilaPerfilHTML(s){
  if(!s || s.status!=='activo') return ''; const E=evalEstado(s); if(!E || !E.pendientes) return '';
  return `<button type="button" class="pf-row" onclick="evalVerSocio()">${it('clipboard','sm')}<span>${E.inicial?'Mi evaluación inicial':'Mi reevaluación'}: faltan ${E.pendientes}</span>${ico('chev')}</button>`;
}
function evalStaffHTML(s){
  const E=evalEstado(s); if(!E) return '';
  const tit=E.inicial?'Evaluación inicial':E.toca?'Toca reevaluar':'Evaluación';
  const ult=s.evaluacion&&s.evaluacion.fecha;
  return `<div class="sd-sec">${tit} <small>${ult?'última: '+esc(fmtFecha(ult)):'según la filosofía de su entrenador'}</small></div>
    <div class="sd-body"><ul class="ev-l">${E.items.map(x=>`<li class="${x.ok?'ok':''}"><b>${x.ok?'✓ ':''}${esc(x.nm)}</b>
      ${x.ok||(x.auto&&E.inicial)?'':`<button type="button" class="sd-b" onclick="evalMarcar('${esc(s.code)}','${x.id}')">Marcar hecho</button>`}</li>`).join('')}</ul>
      ${E.toca||E.inicial?`<button type="button" class="sd-pri" style="margin-top:10px" ${E.pendientes?'disabled':''} onclick="evalCerrar('${esc(s.code)}')">${E.pendientes?'Faltan '+E.pendientes+' por completar':'Registrar evaluación completa'}</button>`:''}</div>`;
}
function evalMarcar(code,id){
  const s=getSocio(code); if(!s) return;
  s.evaluacion=Object.assign({},s.evaluacion||{}); s.evaluacion.items=Object.assign({},s.evaluacion.items||{},{[id]:fechaISO(new Date())});
  pqGuardarStaff(s,['evaluacion']); staffRenderContent(s);
}
function evalCerrar(code){
  const s=getSocio(code); if(!s) return;
  s.evaluacion=Object.assign({},s.evaluacion||{}, {fecha:fechaISO(new Date())});
  pqGuardarStaff(s,['evaluacion']); staffRenderContent(s); showToast('Evaluación registrada');
}

// ═════════════ Textos para el socio y para la IA ═════════════
function cuidadoLineas(ph,p){
  const L=[], P=pobCoach(ph), Le=lesCoach(ph), E=evalCoach(ph);
  const nivel=nivelNum(p&&p.nivel), edad=parseInt(p&&p.edad)||0;
  if(nivel===1 && P.adaptacion) L.push('Tus primeras '+P.adaptacion+' semanas son de adaptación: cuerpo completo, cargas ligeras y técnica antes que peso.');
  if(nivel===1 && (P.libre==='yo'||(P.libre==='adaptacion'&&P.adaptacion))) L.push(P.libre==='yo'?'Empiezas con máquinas y versiones guiadas; tu entrenador decide cuándo pasas a peso libre.':'Empiezas con máquinas y versiones guiadas; el peso libre llega al terminar la adaptación.');
  if(edad>=60 && (P.mayores.includes('equilibrio')||P.mayores.includes('caidas'))) L.push('Incluye trabajo de equilibrio para prevenir caídas.');
  if(E.inicio.length) L.push('Tu entrenador te evalúa: '+E.inicio.filter(x=>EVAL_ITEMS[x]).map(x=>EVAL_ITEMS[x].toLowerCase()).join(', ')+'.');
  if(Le.zona==='ligera') L.push('Lo que carga una zona lesionada va siempre ligero y en rango cómodo.');
  const dl={nada:'Nunca entrenes con dolor: si aparece, baja el peso o cambia el ejercicio.','3':'Una molestia de hasta 3 de 10 se tolera si al día siguiente no empeora.',fisio:'Con dolor, manda lo que indique tu fisioterapeuta.'}[Le.dolor];
  if(dl) L.push(dl);
  return L;
}
function cuidadoIA(ph){
  const L=[], P=pobCoach(ph), Le=lesCoach(ph), E=evalCoach(ph);
  if(P.adaptacion) L.push('Principiantes: '+P.adaptacion+' semanas de adaptación (full body, RIR 3-4, técnica, sin métodos).');
  if(P.libre) L.push('Paso a peso libre en principiantes: '+{inicio:'desde el inicio',adaptacion:'después de la adaptación',yo:'cuando lo decida el entrenador (mientras, máquinas)'}[P.libre]+'.');
  if(P.mayores.length) L.push('Adultos mayores (60+): '+P.mayores.join(', ')+'.');
  if(P.obesidad.length) L.push('IMC 35 o más: '+P.obesidad.join(', ')+'.');
  if(Le.zona) L.push('Zona lesionada: '+(Le.zona==='ligera'?'solo carga ligera y rango cómodo':'carga normal en lo que no está contraindicado')+'. Nunca programes lo contraindicado para la lesión.');
  if(E.ref.length) L.push('Ejercicios de referencia para medir fuerza: '+E.ref.map(k=>EVAL_REF[k]?EVAL_REF[k][0]:k).join(', ')+' (inclúyelos si la lesión lo permite).');
  return L;
}
