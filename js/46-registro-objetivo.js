/* ═══ registro: objetivo por pasos, casa, lesión primero y "¿este plan va contigo?" ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   · Pantalla de objetivo con 4 opciones y su explicación: masa muscular, bajar grasa, recomposición y rendimiento.
   · Rendimiento abre: deporte, resistencia, flexibilidad, rehabilitación o fuerza máxima.
   · Deporte y rehabilitación preguntan dónde entrenar (gimnasio, funcional o casa); casa pregunta el equipo y
     la rutina se arma con el motor de rutina en casa (js/31-casa-motor.js), el mismo que usa el staff.
   · Si marca una lesión: tratarla primero (plan de rehabilitación y su objetivo queda para después) o ir directo
     a su objetivo cuidándola.
   · En la vista previa: "¿Este plan va con lo que tenías en mente?" Si no, regresa a elegir objetivo. ═══ */

const OBJ_NOMBRE={'GANAR MÚSCULO':'Incremento de masa muscular','PERDER PESO':'Bajar porcentaje de grasa','RECOMPOSICIÓN CORPORAL':'Recomposición corporal',
  'RENDIMIENTO':'Rendimiento deportivo','RENDIMIENTO DEPORTIVO':'Deporte','RESISTENCIA':'Resistencia','FLEXIBILIDAD':'Flexibilidad','REHABILITACIÓN':'Rehabilitación','FUERZA PURA':'Fuerza máxima'};
function objNombre(o){ return OBJ_NOMBRE[o]||sc(o||''); }
const OBJ_INFO={
  'GANAR MÚSCULO':{d:'Construir músculo con entrenamiento de fuerza e hipertrofia y comiendo un poco más de lo que gastas.',i:'Ideal si quieres verte más fuerte y con más volumen.'},
  'PERDER PESO':{d:'Reducir grasa conservando tu músculo: fuerza, cardio y un déficit calórico moderado, sin dietas extremas.',i:'Ideal si tu prioridad es bajar de talla o de peso.'},
  'RECOMPOSICIÓN CORPORAL':{d:'Bajar grasa y ganar músculo al mismo tiempo: entrenamiento de fuerza, comida cerca de tu mantenimiento y mucha proteína. Tu peso cambia poco, pero tu cuerpo se ve más firme.',i:'Ideal si empiezas o regresas después de un tiempo, o si quieres tonificar sin subir ni bajar mucho de peso.'},
  'RENDIMIENTO':{d:'Entrenar para rendir mejor: en tu deporte, en resistencia, en flexibilidad, recuperando una lesión o levantando más peso.',i:'En el siguiente paso eliges el enfoque.'},
  'RENDIMIENTO DEPORTIVO':{d:'Fuerza, potencia y prevención de lesiones según lo que exige tu deporte.',i:'Ideal si practicas un deporte y quieres rendir más.'},
  'RESISTENCIA':{d:'Mejorar tu condición: aguantar más tiempo y recuperarte más rápido, con cardio y fuerza resistente.',i:'Ideal si corres, haces clases o quieres cansarte menos.'},
  'FLEXIBILIDAD':{d:'Ganar movilidad y elasticidad con sesiones de movilidad y estiramiento, sin pesas.',i:'Ideal si te sientes rígido o quieres moverte mejor.'},
  'REHABILITACIÓN':{d:'Un protocolo por fases para recuperar una zona lesionada, sin dolor y de forma progresiva.',i:'Es una guía de apoyo: no sustituye la valoración médica.'},
  'FUERZA PURA':{d:'Levantar más peso en los ejercicios básicos con series cortas y pesadas.',i:'Ideal si ya entrenas y quieres ser más fuerte.'},
};
function objDescMostrar(id,key){
  const el=document.getElementById(id); if(!el) return;
  const x=OBJ_INFO[key];
  el.innerHTML=x?`<b>${esc(objNombre(key))}</b><p>${esc(x.d)}</p><small>${esc(x.i)}</small>`:'';
  el.classList.toggle('on',!!x);
}

// ── Rendimiento deportivo: qué quiere mejorar ──
function rendAbrir(){
  document.querySelectorAll('#qq2r .opt').forEach(o=>o.classList.remove('sel'));
  const b=document.getElementById('qb2r'); if(b) b.disabled=true;
  objDescMostrar('rend-desc','');
}
function qSelRend(el,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.objetivo=val; qAnswers.disciplina=''; qAnswers.lesionRehab=''; qAnswers.entorno='';
  objDescMostrar('rend-desc',val);
  document.getElementById('qb2r').disabled=false;
}
function qNext2r(){
  const o=qAnswers.objetivo;
  if(!o||o==='RENDIMIENTO') return;
  if(o==='RENDIMIENTO DEPORTIVO'){ abrirDisciplinas(); document.getElementById('qb2b').disabled=true; mostrarSub('qq2b'); return; }
  if(o==='REHABILITACIÓN'){ abrirLesiones(); document.getElementById('qb2c').disabled=true; mostrarSub('qq2c'); return; }
  showQStep(3); window.scrollTo(0,0);
}
// Atrás desde el paso 3: a la pantalla de donde vino
function qPrev3(){
  const o=qAnswers.objetivo;
  if(o==='RENDIMIENTO DEPORTIVO'){ mostrarSub(qAnswers.entorno==='casa'?'qqCasa':'qq2b2'); return true; }
  if(['RESISTENCIA','FLEXIBILIDAD','FUERZA PURA'].includes(o)){ mostrarSub('qq2r'); return true; }
  return false;
}

// ── Casa: qué equipo tiene ──
let CASA_REG_DESDE='qq2b2';
function casaEqAbrir(desde){
  CASA_REG_DESDE=desde;
  const cont=document.getElementById('casa-eq-opts');
  cont.innerHTML=Object.entries(CASA_PAQUETES).map(([id,p])=>{
    const eq=p.eq.length?p.eq.map(q=>(CASA_EQUIPO[q]||{}).nm).filter(Boolean).join(', '):'Sin equipo: tu propio cuerpo';
    return `<div class="opt${qAnswers.casaPaquete===id?' sel':''}" onclick="qSelCasaEq(this,'${id}')"><div class="ol">${esc(p.nm)}</div><div class="os">${esc(eq)}</div></div>`;
  }).join('');
  document.getElementById('qbCasa').disabled=!qAnswers.casaPaquete;
  mostrarSub('qqCasa');
}
function qSelCasaEq(el,id){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.casaPaquete=id; qAnswers.casaEquipo=[...(CASA_PAQUETES[id]||{eq:[]}).eq];
  document.getElementById('qbCasa').disabled=false;
}
function qNextCasa(){
  if(!qAnswers.casaPaquete) return;
  if(CASA_REG_DESDE==='qq2c2') rehabIniciarClinico(); else { showQStep(3); window.scrollTo(0,0); }
}
function qPrevCasa(){ mostrarSub(CASA_REG_DESDE); }

// ── Rehabilitación: dónde la hará ──
function rehabEntornoAbrir(){
  document.querySelectorAll('#qq2c2 .opt').forEach(o=>o.classList.toggle('sel',false));
  qAnswers.entorno='';
  document.getElementById('qb2c2').disabled=true;
  mostrarSub('qq2c2');
}
function qSelEntornoRehab(el,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  qAnswers.entorno=val;
  document.getElementById('qb2c2').disabled=false;
}
function qNext2c2(){
  if(!qAnswers.entorno) return;
  if(qAnswers.entorno==='casa') casaEqAbrir('qq2c2'); else rehabIniciarClinico();
}
function qPrevG1(){ mostrarSub(qAnswers.entorno==='casa'?'qqCasa':'qq2c2'); }

// ── Lesión: tratarla primero o ir directo a su objetivo ──
const LES_PROTO={'Rodilla / menisco':'osgood','Espalda / lumbar':'espalda','Hombro / manguito':'hombro','Cadera':'cadera','Cuello / cervical':'cuello'};
function lesTratables(){ return (qAnswers.limitaciones||[]).filter(l=>LES_PROTO[l]); }
function lesPrioridadRender(){
  const box=document.getElementById('les-prio'); if(!box) return;
  const les=lesTratables();
  if(!les.length || qAnswers.objetivo==='REHABILITACIÓN'){ box.hidden=true; box.innerHTML=''; qAnswers.lesionPrimero=''; qAnswers.lesionPrimeroId=''; return; }
  if(!qAnswers.lesionPrimero) qAnswers.lesionPrimero='no';
  if(!les.some(l=>LES_PROTO[l]===qAnswers.lesionPrimeroId)) qAnswers.lesionPrimeroId=LES_PROTO[les[0]];
  const meta=objNombre(qAnswers.objetivo);
  box.hidden=false;
  box.innerHTML=`<div class="les-prio-t">¿Cómo quieres empezar?</div>
    <div class="opts s1">
      <div class="opt${qAnswers.lesionPrimero==='si'?' sel':''}" onclick="qSelLesPrio(this,'si')"><div class="ol">Primero tratar mi lesión</div><div class="os">Te damos un plan de rehabilitación y, cuando estés bien, pasamos a: ${esc(meta)}.</div></div>
      <div class="opt${qAnswers.lesionPrimero==='no'?' sel':''}" onclick="qSelLesPrio(this,'no')"><div class="ol">Ir directo a mi objetivo</div><div class="os">Tu plan de ${esc(meta.toLowerCase())} cuida la zona lesionada desde el primer día.</div></div>
    </div>
    ${qAnswers.lesionPrimero==='si'&&les.length>1?`<div class="les-prio-t sm">¿Cuál tratamos primero?</div><div class="les-prio-ch">${les.map(l=>`<button type="button" class="${LES_PROTO[l]===qAnswers.lesionPrimeroId?'on':''}" onclick="qSelLesPrioId('${LES_PROTO[l]}')">${esc(l)}</button>`).join('')}</div>`:''}`;
}
function qSelLesPrio(el,v){ qAnswers.lesionPrimero=v; lesPrioridadRender(); }
function qSelLesPrioId(id){ qAnswers.lesionPrimeroId=id; lesPrioridadRender(); }

// Antes de generar: si eligió tratar su lesión primero, el plan es de rehabilitación y su objetivo queda guardado
function registroRestaurarObjetivo(){
  if(qAnswers.objetivoMeta){ qAnswers.objetivo=qAnswers.objetivoMeta; qAnswers.objetivoMeta=''; qAnswers.lesionRehab=''; }
}
function registroPrepararGeneracion(){
  registroRestaurarObjetivo();
  if(qAnswers.lesionPrimero==='si' && qAnswers.lesionPrimeroId && qAnswers.objetivo!=='REHABILITACIÓN' && lesTratables().length){
    qAnswers.objetivoMeta=qAnswers.objetivo;
    qAnswers.objetivo='REHABILITACIÓN';
    qAnswers.lesionRehab=qAnswers.lesionPrimeroId;
  }
}

// ── Plan en casa desde el registro (deporte en casa) ──
function socioDesdeQuiz(){
  return {code:'registro', nombre:qAnswers.nombre, objetivo:qAnswers.objetivo, nivel:qAnswers.nivel, edad:qAnswers.edad, peso:qAnswers.peso,
    estatura:qAnswers.estatura, dias:qAnswers.dias, diasSemana:[...(qAnswers.diasSemana||[])], zonas:[...(qAnswers.zonas||[])],
    limitaciones:(qAnswers.limitaciones||[]).filter(l=>l!=='Sin limitaciones'), disciplina:qAnswers.disciplina||'', entrenadorId:qAnswers.entrenadorId||'',
    clasesGrupales:(qAnswers.clasesGrupales||[]).filter(c=>c.dias&&c.dias.length)};
}
function semanaDesdeRutinaObj(rut){ return DIAS_ORDER.map(k=>{ const d=rut[k]||{}; return {dia:DIAS_NAMES[k], tipo:d.tipo||'DESCANSO', color:d.color||'descanso', ejercicios:d.ejercicios||[]}; }); }
function planCasaRegistro(){
  try{
    const r=casaGenerar(socioDesdeQuiz(),{equipo:qAnswers.casaEquipo||[], duracion:45});
    if(!r||r.error) return null;
    const eq=(qAnswers.casaEquipo||[]).map(q=>(CASA_EQUIPO[q]||{}).nm).filter(Boolean);
    const disc=(typeof DEPORTES!=='undefined'&&DEPORTES.find(d=>d.id===qAnswers.disciplina))||null;
    return {casa:true, origen:'casa', semana:semanaDesdeRutinaObj(r.rutina),
      perfil:{nivel:qAnswers.nivel||'PRINCIPIANTE', objetivo:'RENDIMIENTO DEPORTIVO', split:'Rutina en casa', fase:'Fuerza y acondicionamiento en casa',
        nota:'Tu rutina para entrenar en casa'+(eq.length?' con: '+eq.join(', ')+'.':' solo con tu peso corporal.')+(disc?' Es tu base de fuerza y acondicionamiento; lo específico de '+disc.nm.toLowerCase()+' lo trabajas en tus entrenamientos.':'')}};
  }catch(e){ console.warn('rutina en casa del registro',e); return null; }
}

// ── Vista previa: ¿el plan va con lo que tenías en mente? ──
let PV_AJUSTE_OK=false;
function pvAjusteReset(){
  PV_AJUSTE_OK=false;
  const a=document.getElementById('pv-ajuste'), c=document.getElementById('pv-confirmar');
  if(a){ a.classList.remove('ok'); a.querySelector('.pv-aj-t').textContent='¿Este plan va con lo que tenías en mente?'; a.querySelector('.pv-aj-s').textContent='Revisa tu semana. Si no es lo que buscabas, regresamos a tu objetivo y lo armamos de nuevo con tus mismas respuestas.'; }
  if(c) c.hidden=true;
}
function pvAjusteSi(){
  PV_AJUSTE_OK=true;
  const a=document.getElementById('pv-ajuste'), c=document.getElementById('pv-confirmar');
  if(a){ a.classList.add('ok'); a.querySelector('.pv-aj-t').textContent='Perfecto, tu plan va con lo que buscas'; a.querySelector('.pv-aj-s').textContent='Solo falta aceptar el aviso de privacidad y confirmarlo.'; }
  if(c){ c.hidden=false; setTimeout(()=>c.scrollIntoView({block:'center',behavior:'smooth'}),60); }
}
function pvAjusteNo(){
  registroRestaurarObjetivo();
  window._rutinaTemp=null;
  qAnswers.objetivo=''; qAnswers.disciplina=''; qAnswers.lesionRehab=''; qAnswers.entorno='';
  document.querySelectorAll('#qq2 .opt,#qq2r .opt').forEach(o=>o.classList.remove('sel'));
  objDescMostrar('obj-desc','');
  const b=document.getElementById('qb2'); if(b) b.disabled=true;
  go('s-quiz'); showQStep(2); window.scrollTo(0,0);
  showToast('Elige el objetivo que buscas: tus demás respuestas se conservan');
}
function pvConfirmar(){
  if(!PV_AJUSTE_OK){
    const a=document.getElementById('pv-ajuste');
    if(a){ a.scrollIntoView({block:'center',behavior:'smooth'}); a.classList.add('aviso'); setTimeout(()=>a.classList.remove('aviso'),1600); }
    showToast('Antes de guardar, dinos si el plan va con lo que buscas');
    return;
  }
  if(privCasilleroOk()) confirmarRutina();
}

// ── Después de la rehabilitación: pasar a su objetivo ──
function objMetaCardHTML(s){
  if(!s || !s.objetivoMeta || s.status!=='activo') return '';
  return `<div class="pg-home soft ev-mini">
    <div class="ev-mini-tx"><div class="pg-home-k">Primero tu lesión</div>
      <div class="ev-mini-m">Cuando estés bien pasamos a tu objetivo: ${esc(objNombre(s.objetivoMeta))}</div></div>
    <button type="button" class="sd-b ev-mini-b" onclick="objMetaPasar()">Ya estoy bien</button></div>`;
}
// Arma el plan de un socio con su perfil actual (método de su entrenador o del sistema; en casa si entrena en casa)
function planDesdeSocio(s){
  if(s.entorno==='casa' && s.casa && Array.isArray(s.casa.equipo) && s.objetivo!=='REHABILITACIÓN'){
    const r=casaGenerar(s,{equipo:s.casa.equipo, duracion:s.casa.duracion||45});
    return r&&!r.error?{rutina:r.rutina, metodo:null, casa:true}:null;
  }
  const ent=entRutina(s.entrenadorId);
  const respaldo=JSON.parse(JSON.stringify(qAnswers));
  try{
    Object.assign(qAnswers,{nombre:s.nombre||'', objetivo:s.objetivo, nivel:s.nivel, edad:s.edad, peso:s.peso, estatura:s.estatura,
      genero:s.genero||'', dias:s.dias||4, diasSemana:[...(s.diasSemana||[])], zonas:[...(s.zonas||[])],
      limitaciones:(s.limitaciones&&s.limitaciones.length)?[...s.limitaciones]:['Sin limitaciones'], cardio:s.cardio||'',
      disciplina:s.disciplina||'', entorno:s.entorno||'', lesionRehab:'', entrenadorId:s.entrenadorId||'', entrenadorNombre:(ent&&ent.nombre)||'',
      clasesGrupales:(s.clasesGrupales||[]).map(c=>({clase:c.clase,dias:[...(c.dias||[])],entrenaMismoDia:!!c.entrenaMismoDia}))});
    const data=buildFallback(); data.origen='plantilla';
    procesarRutina(data);
    return {rutina:rutinaDesdeSemana(data.semana), metodo:data.metodo||null};
  }catch(e){ console.warn('No se pudo armar el plan',e); return null; }
  finally{ Object.keys(qAnswers).forEach(k=>delete qAnswers[k]); Object.assign(qAnswers,respaldo); }
}
function pasarAObjetivoMeta(s){
  if(!s||!s.objetivoMeta) return false;
  const antes={objetivo:s.objetivo, lesionRehab:s.lesionRehab};
  s.objetivo=s.objetivoMeta; s.lesionRehab='';
  const plan=planDesdeSocio(s);
  if(!plan){ Object.assign(s,antes); return false; }
  delete s.objetivoMeta;
  s.rutina=plan.rutina; s.metodo=plan.metodo; s.origenRutina='plantilla'; s.planActualizado=fechaISO(new Date());
  if(plan.casa){ s.modo='casa'; s.casa=Object.assign({},s.casa,{fecha:fechaISO(new Date()), por:'Cambio de objetivo'}); }
  if(s.logs && Array.isArray(s.logs.lesiones)) s.logs.lesiones=s.logs.lesiones.filter(l=>l.protoId!==antes.lesionRehab);
  dbSave(s.code);
  return true;
}
function objMetaPasar(){
  const s=activeSocio; if(!s||!s.objetivoMeta) return;
  uiConfirm('¿Ya te sientes bien para pasar a tu objetivo: '+objNombre(s.objetivoMeta)+'?\nHazlo cuando ya no tengas dolor en la zona. Tu nuevo plan seguirá cuidando tu lesión. Si tienes dudas, consúltalo con tu entrenador o tu médico.',()=>{
    if(pasarAObjetivoMeta(s)){ showToast('Listo: tu plan ahora es de '+objNombre(s.objetivo).toLowerCase()); refreshDash(); }
    else showToast('No se pudo armar tu nuevo plan. Inténtalo de nuevo.');
  },{label:'Sí, pasar a mi objetivo'});
}
// Panel del staff: aviso de que el socio está en rehabilitación antes de su objetivo
function objMetaStaffHTML(s){
  if(!s||!s.objetivoMeta) return '';
  return `<div class="sd-sec">Rehabilitación primero <small>después: ${esc(objNombre(s.objetivoMeta))}</small></div>
    <div class="sd-body"><p style="margin:0 0 10px;color:var(--mu);font-size:var(--fs-sm);line-height:1.5">Eligió tratar su lesión antes de empezar su objetivo. Cuando esté sin dolor, pásalo a su objetivo: el plan nuevo sigue cuidando su lesión.</p>
    <button type="button" class="sd-b p" onclick="objMetaStaffPasar('${esc(s.code)}')">Pasar a su objetivo</button></div>`;
}
function objMetaStaffPasar(code){
  const s=getSocio(code); if(!s) return;
  uiConfirm('¿Pasar a '+tc(s.nombre||'')+' a su objetivo: '+objNombre(s.objetivoMeta)+'?\nSe arma su plan nuevo y termina su protocolo de rehabilitación.',()=>{
    if(pasarAObjetivoMeta(s)){ showToast('Plan nuevo listo: '+objNombre(s.objetivo)); staffRenderContent(s); }
    else showToast('No se pudo armar el plan nuevo');
  },{label:'Pasar a su objetivo'});
}
