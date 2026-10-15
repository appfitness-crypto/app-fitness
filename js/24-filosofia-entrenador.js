/* ═══ filosofia entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// HUELLA VISUAL DE FILOSOFÍA — radar SVG reutilizable
// (selector de coach en el registro + resumen en "Mi filosofía")
// ═════════════════════════════════════════
function svgRadarFilosofia(ph, size){
  size = size||64;
  const pr = (ph&&ph.priorities) || {fuerza:3,hipertrofia:3,movilidad:3,rendimiento:3};
  const variedad = (ph&&ph.exerciseStyle&&ph.exerciseStyle.variety) || 3;
  const axes = [
    {v: pr.fuerza||3}, {v: pr.hipertrofia||3}, {v: pr.movilidad||3}, {v: pr.rendimiento||3}, {v: variedad}
  ];
  const n=axes.length, cx=size/2, cy=size/2, R=size*0.36;
  const ns="http://www.w3.org/2000/svg";
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  for(let ring=1; ring<=3; ring++){
    const r=R*(ring/3); let pts=[];
    for(let i=0;i<n;i++){ const a=-Math.PI/2+i*(2*Math.PI/n); pts.push(`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`); }
    svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--b)" stroke-width="0.6"/>`;
  }
  let dpts=[];
  axes.forEach((a,i)=>{ const r=R*(a.v/5); const ang=-Math.PI/2+i*(2*Math.PI/n); dpts.push(`${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`); });
  svg += `<polygon points="${dpts.join(' ')}" fill="var(--p)" fill-opacity="0.32" stroke="var(--p)" stroke-width="1.4"/>`;
  svg += `</svg>`;
  return svg;
}

// ═════════════════════════════════════════
// MI FILOSOFÍA — quiz del entrenador (12 pasos)
// Se guarda en DB.entrenadores[id].filosofia y de ahí
// alimenta el prompt de IA y el selector de coach del socio.
// ═════════════════════════════════════════
let filoStep=1;
let filoDraft=null;
function actualizarBotonMiFilosofia(){
  const bF=document.getElementById('btn-mi-filosofia');
  const bN=document.getElementById('btn-nuevo-ent');
  if(bF) bF.style.display = (staffActivoEntId && entHace(DB.entrenadores[staffActivoEntId],'entrenamiento')) ? 'inline-block' : 'none';
  if(bN) bN.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const fS=document.getElementById('slf-sinent'); if(fS) fS.style.display = staffRol==='coordinador' ? '' : 'none';   // solo el director ve a todos
  if(staffRol!=='coordinador' && staffFilterVal==='sinent') staffFilterVal='todos';
  const bE=document.getElementById('btn-eliminar-cuenta'); if(bE) bE.style.display = staffRol!=='coordinador' ? 'inline-block' : 'none';
  const bC=document.getElementById('btn-mi-codigo'); if(bC) bC.style.display = (staffRol!=='coordinador' && miCodigoEntrenador()) ? 'inline-block' : 'none';
  const bV=document.getElementById('btn-ver-ent'); if(bV) bV.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bRes=document.getElementById('btn-resumen'); if(bRes) bRes.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bAp=document.getElementById('btn-apariencia'); if(bAp) bAp.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bLu=document.getElementById('btn-lugares'); if(bLu) bLu.style.display = (staffRol==='coordinador' && GYM.geofence) ? 'inline-block' : 'none';
  const bFb=document.getElementById('btn-firebase'); if(bFb) bFb.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bR=document.getElementById('btn-respaldo'); if(bR) bR.style.display = staffRol==='coordinador' ? 'inline-block' : 'none';
  const bX=document.getElementById('btn-reset'); if(bX) bX.style.display = (staffRol==='coordinador' && !fbListo) ? 'inline-block' : 'none';
}
function filoBase(){
  return {tagline:'',priorities:{fuerza:3,hipertrofia:3,movilidad:3,rendimiento:3,funcional:3},progressStyle:'',
    structure:{split:'',splitPorDias:{},frecuencia:'2',periodization:'',perObjetivo:{},warmupRatio:2,method:''},exerciseStyle:{variety:3,restStyle:''},
    // reps por objetivo (texto "3-6") + tabla de series, descanso y % 1RM; vacío = valor del sistema
    dosis:{fuerza:'',hipertrofia:'',resistencia:'',potencia:'',series:{},desc:{},pct:{}},
    volumen:{},
    // bloques, descarga, regla de progresión, incremento, ajuste si llega cansado y RIR por nivel (js/40-autorregulacion.js)
    progresion:{semanas:'',descarga:'',tipoDescarga:'',regla:'',incremento:'',hoy:'',rir:{}},   // series semanales por músculo según nivel: {1:'8-12',2:'12-16',3:'16-20'}
    metodos:{favoritos:[],evita:[],frecuencia:3,principiantes:'basicos'},
    seleccion:{libreVsMaquina:3,unilateral:3,firma:'',nunca:'',patrones:[],halterofilia:'',pliometria:''},
    sesion:{calentamiento:'',orden:'',tempo:'',core:'',cardio:'',duracion:'',ejercicios:'',seguidos:''},
    horaPico:{sustitucion:'maquina',nota:''},
    sampleRoutineNote:'',adjustmentPhilosophy:'',
    rutinasModelo:{}};   // hasta 3 rutinas reales del entrenador: fuerza · grasa · rendimiento (ver js/32-filosofia-modelos.js)
}
function filoMezclar(base,obj){
  const out=JSON.parse(JSON.stringify(base));
  Object.keys(obj||{}).forEach(k=>{
    if(obj[k] && typeof obj[k]==='object' && !Array.isArray(obj[k]) && out[k] && typeof out[k]==='object') out[k]=Object.assign(out[k],obj[k]);
    else if(obj[k]!==undefined && obj[k]!==null) out[k]=obj[k];
  });
  return out;
}
const FILO_TOTAL=12;
let filoEditId=null; // a quién se le está editando la filosofía (coordinador puede editar la de otros)
function abrirMiFilosofia(idAjeno){
  const id = idAjeno || staffActivoEntId;
  if(!id){ showToast('Esta sección es solo para entrenadores con perfil propio'); return; }
  if(idAjeno && staffRol!=='coordinador'){ showToast('Solo dirección puede editar la filosofía de otro entrenador'); return; }
  filoEditId=id;
  const ent=getEntrenador(id);
  filoDraft = filoMezclar(filoBase(), ent&&ent.filosofia);
  filoStep=1;
  renderFiloStep();
  const t=document.getElementById('filo-modal-tag'); if(t) t.textContent = idAjeno ? ('FILOSOFÍA DE '+(ent?ent.nombre:idAjeno).toUpperCase()) : 'TU FILOSOFÍA DE ENTRENAMIENTO';
  document.getElementById('modal-filosofia').classList.add('open');
}
// Guarda automáticamente el avance en cada paso, para no perderlo si se cierra el cuestionario a medias
function filoGuardarProgreso(){
  if(!filoEditId) return;
  if(!DB.entrenadores[filoEditId]) DB.entrenadores[filoEditId]={id:filoEditId,nombre:document.getElementById('staff-nombre')?.textContent||filoEditId,rol:'entrenador',especialidades:[]};
  DB.entrenadores[filoEditId].filosofia = JSON.parse(JSON.stringify(filoDraft));
  dbSaveEntrenador(filoEditId);
}
function cerrarModalFilosofia(){ document.getElementById('modal-filosofia').classList.remove('open'); }

function filoSliderRow(label, val, path, extremos){
  const id='fs-'+path.replace('.','-');
  return `<div style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;margin-bottom:5px">
      <span style="font-size:var(--fs-sm);font-weight:600">${label}</span>
      <span style="font-size:var(--fs-xs);color:var(--p);font-weight:700" id="${id}">${val}</span>
    </div>
    <input type="range" min="1" max="5" value="${val}" style="width:100%;accent-color:var(--p)"
      oninput="document.getElementById('${id}').textContent=this.value; filoDraft.${path}=parseInt(this.value)">
    ${extremos?`<div style="display:flex;justify-content:space-between;font-size:var(--fs-2xs);color:var(--mu);margin-top:2px"><span>${extremos[0]}</span><span>${extremos[1]}</span></div>`:''}
  </div>`;
}
function filoChoiceGroup(name, options, current){
  return `<div class="opts" style="grid-template-columns:1fr;max-height:none;gap:6px;margin-bottom:12px">` +
    options.map(o=>`<div class="opt" style="padding:9px 12px;text-align:left;${current===o.value?'border-color:var(--p);background:color-mix(in srgb, var(--p) 6%, transparent)':''}" onclick="filoSetChoice(this,'${name}','${o.value}')"><div class="ol" style="font-size:var(--fs-sm)">${o.label}</div>${o.sub?`<div class="os" style="text-transform:none;letter-spacing:0">${o.sub}</div>`:''}</div>`).join('') +
    `</div>`;
}
function filoSetChoice(el,name,val){
  el.parentElement.querySelectorAll('.opt').forEach(o=>{o.style.borderColor='';o.style.background='';});
  el.style.borderColor='var(--p)'; el.style.background='color-mix(in srgb, var(--p) 6%, transparent)';
  const path=name.split('.');
  if(path.length===1) filoDraft[path[0]]=val; else filoDraft[path[0]][path[1]]=val;
}
function filoText(path, ph, rows){
  const val=path.split('.').reduce((o,k)=>o&&o[k],filoDraft)||'';
  return `<textarea rows="${rows||2}" style="width:100%;padding:11px;background:var(--in-bg);border:1px solid var(--b);border-radius:10px;font-family:var(--fb);font-size:var(--fs-sm);color:var(--tx);outline:none;resize:vertical;margin-bottom:12px" placeholder="${ph}" oninput="filoDraft.${path}=this.value">${esc(val)}</textarea>`;
}
function filoSub(t){ return `<div class="q-sub" style="margin:4px 0 7px">${t}</div>`; }
// Estructura por número de días (bloque 3), tabla de dosis (bloque 5) y patrones obligatorios (bloque 7)
const FILO_SPLITS=[['','Automático'],['full','Full body'],['torso','Torso / pierna'],['hibrido','Híbrido (T/P + full body)'],['ppl','Empuje / jalón / pierna'],['grupos','Un grupo por día']];
const FILO_SPLIT_SUG={2:'full',3:'full',4:'torso',5:'hibrido',6:'ppl'};
const FILO_DOSIS=[['F','fuerza','Fuerza','3-5','3-6','2-3 min','80-90'],['H','hipertrofia','Hipertrofia','3-4','6-12','60-120 s','65-80'],
  ['R','resistencia','Resistencia','2-3','12-20','30-60 s','50-65'],['P','potencia','Potencia','3-5','1-5','2-3 min','30-60']];
const FILO_PATRONES=[['sentadilla','Sentadilla'],['bisagra','Bisagra de cadera'],['empujeH','Empuje horizontal'],['empujeV','Empuje vertical'],
  ['jalonH','Jalón horizontal (remo)'],['jalonV','Jalón vertical'],['unilateral','Zancada / unilateral'],['cargar','Cargar (farmer)'],
  ['antirrotacion','Antirrotación'],['rotacion','Rotación']];
function filoTablaSplit(F){
  const sel=F.structure.splitPorDias||{};
  return `<div class="filo-tabla">${[2,3,4,5,6].map(n=>`<label class="filo-fila"><span>${n} días</span>
    <select class="ti" onchange="filoDraft.structure.splitPorDias[${n}]=this.value">${FILO_SPLITS.map(([v,l])=>`<option value="${v}" ${(sel[n]||'')===v?'selected':''}>${v?l:l+' (sugerido: '+FILO_SPLITS.find(x=>x[0]===FILO_SPLIT_SUG[n])[1].toLowerCase()+')'}</option>`).join('')}</select></label>`).join('')}</div>`;
}
const FILO_PER=[['','Mi modelo general'],['lineal','Lineal'],['ondulante','Ondulante'],['bloques','Por bloques'],['conjugada','Conjugada'],['flexible','Flexible (sesión a sesión)']];
const FILO_OBJ_PER=[['F','Fuerza','bloques'],['H','Hipertrofia','ondulante'],['G','Pérdida de grasa','lineal'],['R','Resistencia','lineal'],['D','Rendimiento deportivo','bloques']];
function filoTablaPer(F){
  const sel=F.structure.perObjetivo||{};
  return `<div class="filo-tabla">${FILO_OBJ_PER.map(([k,nm,sug])=>`<label class="filo-fila filo-fila-w"><span>${nm}</span>
    <select class="ti" onchange="filoDraft.structure.perObjetivo['${k}']=this.value">${FILO_PER.map(([v,l])=>`<option value="${v}" ${(sel[k]||'')===v?'selected':''}>${v?l:l+' (sugerido: '+FILO_PER.find(x=>x[0]===sug)[1].toLowerCase()+')'}</option>`).join('')}</select></label>`).join('')}</div>`;
}
function filoIn(path,val,ph){
  return `<input class="ti" placeholder="${ph}" value="${esc(val||'')}" oninput="filoDraft.${path}=this.value">`;
}
function filoTablaDosis(F){
  const d=F.dosis;
  return `<div class="filo-dosis"><span></span><span>Series</span><span>Reps</span><span>Descanso</span><span>% 1RM</span>
    ${FILO_DOSIS.map(([L,k,nm,s,r,ds,pc])=>`<span class="fd-nm">${nm}</span>${filoIn('dosis.series.'+L,d.series[L],s)}${filoIn('dosis.'+k,d[k],r)}${filoIn('dosis.desc.'+L,d.desc[L],ds)}${filoIn('dosis.pct.'+L,d.pct[L],pc)}`).join('')}
  </div>`;
}
function filoTogglePatron(id,el){
  const l=filoDraft.seleccion.patrones||(filoDraft.seleccion.patrones=[]);
  const i=l.indexOf(id); if(i>=0) l.splice(i,1); else l.push(id);
  el.className='filo-chip '+(l.includes(id)?'fav':'');
}
function filoCycleMetodo(id,el){
  const m=filoDraft.metodos;
  if(m.favoritos.includes(id)){ m.favoritos=m.favoritos.filter(x=>x!==id); m.evita.push(id); }
  else if(m.evita.includes(id)){ m.evita=m.evita.filter(x=>x!==id); }
  else m.favoritos.push(id);
  el.className='filo-chip '+(m.favoritos.includes(id)?'fav':m.evita.includes(id)?'no':'');
}
function renderFiloStep(){
  document.getElementById('filo-prog').style.width=(filoStep/FILO_TOTAL*100)+'%';
  const c=document.getElementById('filo-body');
  const F=filoDraft;
  const paso=`<div style="font-size:var(--fs-2xs);color:var(--mu);margin-bottom:6px">Paso ${filoStep} de ${FILO_TOTAL}</div>`;
  let html=paso;
  const T=t=>`<div class="q-title" style="font-size:var(--fs-2xl)">${t}</div>`;
  if(filoStep===1){
    html+=`${T('En una frase, ¿cuál es tu método?')}
      ${filoSub('Es lo primero que lee el socio cuando te elige.')}
      ${filoText('tagline','Ej. Construyo fuerza real antes que estética.')}
      ${filoSub('¿Qué prioriza tu método? (1 casi nada · 5 tu sello)')}
      ${filoSliderRow('Fuerza', F.priorities.fuerza, 'priorities.fuerza')}
      ${filoSliderRow('Hipertrofia / estética', F.priorities.hipertrofia, 'priorities.hipertrofia')}
      ${filoSliderRow('Movilidad y prevención', F.priorities.movilidad, 'priorities.movilidad')}
      ${filoSliderRow('Rendimiento deportivo', F.priorities.rendimiento, 'priorities.rendimiento')}
      ${filoSliderRow('Entrenamiento funcional', F.priorities.funcional, 'priorities.funcional')}`;
  } else if(filoStep===2){
    html+=`${T('Estructura semanal')}
      ${filoSub('¿Cómo organizas la semana según los días que entrena el socio?')}
      ${filoTablaSplit(F)}
      ${filoSub('¿Cuántas veces por semana trabajas cada músculo?')}
      ${filoChoiceGroup('structure.frecuencia',[{value:'1',label:'1 vez',sub:'Un grupo por día; acepto splits clásicos'},{value:'2',label:'2 veces',sub:'Lo recomendado para casi todos'},{value:'3',label:'3 veces',sub:'Alta frecuencia, menos series por sesión'}], String(F.structure.frecuencia||''))}
      ${filoSub('Duración típica de tu sesión')}
      ${filoChoiceGroup('sesion.duracion',[{value:'45',label:'45 min'},{value:'60',label:'60 min'},{value:'75',label:'75 min'},{value:'90',label:'90 min'}], String(F.sesion.duracion||''))}
      ${filoSub('Si el socio entrena días seguidos...')}
      ${filoChoiceGroup('sesion.seguidos',[{value:'nunca',label:'Nunca el mismo músculo dos días seguidos'},{value:'ligero',label:'Se permite, con el segundo día ligero'},{value:'si',label:'Sí, sin problema'}], F.sesion.seguidos)}
      ${filoSub('Notas sobre tu estructura (opcional)')}
      ${filoText('structure.split','Ej. Full body para principiantes los primeros 2 meses.')}`;
  } else if(filoStep===3){
    const P=F.progresion||(F.progresion={rir:{}});
    html+=`${T('Progreso y periodización')}
      ${filoSub('¿Cómo defines el progreso?')}
      ${filoChoiceGroup('progressStyle',[{value:'numeros',label:'Por números (peso, reps, cargas)'},{value:'calidad',label:'Por calidad de movimiento'},{value:'mixto',label:'Ambos, según la persona'}], F.progressStyle)}
      ${filoSub('Tu modelo general de periodización')}
      ${filoChoiceGroup('structure.periodization',[
        {value:'lineal',label:'Lineal',sub:'Subo carga poco a poco, bloque tras bloque'},
        {value:'ondulante',label:'Ondulante',sub:'Alterno días pesados, medios y ligeros en la semana'},
        {value:'bloques',label:'Por bloques',sub:'Acumulación → intensificación → descarga'},
        {value:'conjugada',label:'Conjugada',sub:'Fuerza máxima y velocidad en la misma semana'},
        {value:'flexible',label:'Flexible',sub:'Sin periodización fija: ajusto sesión a sesión'}], F.structure.periodization)}
      ${filoSub('¿Usas otro modelo según el objetivo del socio?')}
      ${filoTablaPer(F)}
      ${filoSub('¿Cuánto dura un bloque?')}
      ${filoChoiceGroup('progresion.semanas',[{value:'3',label:'3 semanas'},{value:'4',label:'4 semanas',sub:'Sugerido'},{value:'5',label:'5 semanas'},{value:'6',label:'6 semanas'}], String(P.semanas||''))}
      ${filoSub('¿Cada cuándo haces descarga?')}
      ${filoChoiceGroup('progresion.descarga',[{value:'ultima',label:'Última semana de cada bloque',sub:'Sugerido'},{value:'cada2',label:'Cada 2 bloques'},{value:'fatiga',label:'Solo con señales de fatiga',sub:'Si el socio llega cansado 2 de sus últimas 3 sesiones'},{value:'no',label:'No programo descargas'}], P.descarga)}
      ${filoSub('¿Cómo es tu descarga?')}
      ${filoChoiceGroup('progresion.tipoDescarga',[{value:'volumen',label:'Bajo el volumen 40-50 % y mantengo la carga',sub:'Sugerido'},{value:'intensidad',label:'Bajo la intensidad (15 % menos de peso)'},{value:'activa',label:'Semana libre o activa'}], P.tipoDescarga)}`;
  } else if(filoStep===4){
    html+=`${T('Dosis por objetivo')}
      ${filoSub('Tu tabla de trabajo. Deja vacío lo que quieras que el sistema decida (el gris es el valor sugerido).')}
      ${filoTablaDosis(F)}
      ${filoSub('Series semanales por músculo según nivel')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        ${[['1','Principiante','8-12'],['2','Intermedio','12-16'],['3','Avanzado','16-20']].map(([k,l,ph])=>`<label style="font-size:var(--fs-2xs);color:var(--mu)">${l}${filoIn('volumen['+k+']',F.volumen[k],ph)}</label>`).join('')}
      </div>
      ${filoSub('Ejercicios por sesión')}
      ${filoChoiceGroup('sesion.ejercicios',[{value:'4-5',label:'4-5',sub:'Pocos y bien hechos'},{value:'6-7',label:'6-7'},{value:'8+',label:'8 o más'}], F.sesion.ejercicios)}`;
  } else if(filoStep===5){
    const P=F.progresion||(F.progresion={rir:{}}); if(!P.rir) P.rir={};
    html+=`${T('Intensidad y autorregulación')}
      ${filoSub('¿Con qué dosificas la intensidad?')}
      ${filoChoiceGroup('structure.method',[{value:'rir',label:'RIR (repeticiones en reserva)',sub:'Sugerido'},{value:'rpe',label:'RPE (esfuerzo percibido)'},{value:'porcentajes',label:'% de 1RM'},{value:'fallo',label:'Series al fallo'},{value:'velocidad',label:'Velocidad de la barra'},{value:'sensaciones',label:'Por sensaciones'}], F.structure.method)}
      ${filoSub('¿Qué tan cerca del fallo, según nivel? (reps en reserva)')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        ${[['1','Principiante','3-4'],['2','Intermedio','1-3'],['3','Avanzado','0-2']].map(([k,l,ph])=>`<label style="font-size:var(--fs-2xs);color:var(--mu)">${l}${filoIn('progresion.rir['+k+']',P.rir[k],ph)}</label>`).join('')}
      </div>
      ${filoSub('¿Cómo progresas la carga?')}
      ${filoChoiceGroup('progresion.regla',[{value:'doble',label:'Doble progresión',sub:'Subo repeticiones y al llegar al tope subo peso (sugerido)'},{value:'fija',label:'Carga fija semanal',sub:'+2.5 kg en torso, +5 kg en pierna'},{value:'rpe',label:'Por RPE',sub:'Si la sesión se sintió fácil o bien, subo'},{value:'porcentajes',label:'Porcentajes programados por semana'}], P.regla)}
      ${filoSub('¿Cuánto subes cuando toca?')}
      ${filoChoiceGroup('progresion.incremento',[{value:'minimo',label:'El mínimo que permita el equipo',sub:'Sugerido'},{value:'2.5',label:'2.5 %'},{value:'5',label:'5 %'}], P.incremento)}
      ${filoSub('Si el socio llega cansado o durmió mal...')}
      ${filoChoiceGroup('progresion.hoy',[{value:'serie',label:'Quito una serie por ejercicio',sub:'Sugerido'},{value:'carga',label:'Bajo la carga 10 %'},{value:'tecnica',label:'Cambio a técnica: cargas ligeras'},{value:'mantener',label:'Mantengo el plan'}], P.hoy)}
      ${filoSub('Descanso entre series')}
      ${filoChoiceGroup('exerciseStyle.restStyle',[{value:'fijo',label:'Tiempo fijo'},{value:'autorregulado',label:'Autorregulado'}], F.exerciseStyle.restStyle)}
      ${filoSliderRow('Variedad de ejercicios', F.exerciseStyle.variety, 'exerciseStyle.variety',['Pocos y dominados','Mucha variedad'])}`;
  } else if(filoStep===6){
    html+=`${T('Tus métodos de intensidad')}
      ${filoSub('Toca una vez = lo uso seguido (verde). Dos veces = no lo uso (rojo). Tres = neutral.')}
      <div class="filo-chips">${Object.entries(KB_METODOS).map(([id,M])=>`<div class="filo-chip ${F.metodos.favoritos.includes(id)?'fav':F.metodos.evita.includes(id)?'no':''}" title="${esc(M.como)}" onclick="filoCycleMetodo('${id}',this)">${M.nm}</div>`).join('')}</div>
      ${filoSliderRow('¿Qué tanto los usas?', F.metodos.frecuencia, 'metodos.frecuencia',['Rutinas limpias','Casi cada ejercicio'])}
      ${filoSub('Con principiantes...')}
      ${filoChoiceGroup('metodos.principiantes',[{value:'no',label:'Nada de métodos: técnica primero'},{value:'basicos',label:'Solo básicos (tempo, pausas, superserie antagonista)'},{value:'si',label:'También intermedios si la técnica lo permite'}], F.metodos.principiantes)}`;
  } else if(filoStep===7){
    const pat=F.seleccion.patrones||[];
    html+=`${T('Cómo eliges ejercicios')}
      ${filoSub('Patrones que no pueden faltar en la semana. Marca solo los indispensables: con pocos días cada uno ocupa un lugar en la sesión.')}
      <div class="filo-chips">${FILO_PATRONES.map(([id,nm])=>`<div class="filo-chip ${pat.includes(id)?'fav':''}" onclick="filoTogglePatron('${id}',this)">${nm}</div>`).join('')}</div>
      ${filoSliderRow('Equipo que prefieres', F.seleccion.libreVsMaquina, 'seleccion.libreVsMaquina',['Máquinas y poleas','Peso libre'])}
      ${filoSliderRow('Trabajo unilateral', F.seleccion.unilateral, 'seleccion.unilateral',['Casi nunca','Mucho'])}
      ${filoSub('Halterofilia (cargadas, arranques)')}
      ${filoChoiceGroup('seleccion.halterofilia',[{value:'no',label:'No la uso'},{value:'variantes',label:'Solo variantes (swing, jalón alto)'},{value:'avanzados',label:'Movimientos completos con avanzados'}], F.seleccion.halterofilia)}
      ${filoSub('Pliometría (saltos)')}
      ${filoChoiceGroup('seleccion.pliometria',[{value:'no',label:'No la uso'},{value:'deportistas',label:'Solo con deportistas'},{value:'intermedio',label:'Desde nivel intermedio'},{value:'todos',label:'Con todos, en baja intensidad'}], F.seleccion.pliometria)}
      ${filoSub('Tus ejercicios firma (los que siempre usas)')}
      ${filoText('seleccion.firma','Ej. Hip thrust con pausa, jalón unilateral, sentadilla búlgara.')}
      ${filoSub('Ejercicios que nunca programas y por qué')}
      ${filoText('seleccion.nunca','Ej. Press tras nuca (riesgo de hombro), peso muerto en principiantes.')}`;
  } else if(filoStep===8){
    html+=`${T('Anatomía de tu sesión')}
      ${filoSub('Calentamiento')}
      ${filoChoiceGroup('sesion.calentamiento',[{value:'movilidad',label:'Movilidad general + activación'},{value:'aproximacion',label:'Series de aproximación del primer ejercicio'},{value:'especifico',label:'Activación específica del músculo del día'}], F.sesion.calentamiento)}
      ${filoSub('Orden de los ejercicios')}
      ${filoChoiceGroup('sesion.orden',[{value:'compuesto',label:'Compuesto pesado primero, aislamiento al final'},{value:'preagot',label:'A veces pre-agoto antes del compuesto'},{value:'prioridad',label:'Primero lo que el socio más necesita'}], F.sesion.orden)}
      ${filoSub('Tempo')}
      ${filoChoiceGroup('sesion.tempo',[{value:'controlado',label:'Controlado siempre (bajada lenta)'},{value:'explosivo',label:'Bajada controlada, subida explosiva'},{value:'fase',label:'Depende de la fase'}], F.sesion.tempo)}`;
  } else if(filoStep===9){
    html+=`${T('Core y cardio')}
      ${filoSub('Core')}
      ${filoChoiceGroup('sesion.core',[{value:'diario',label:'Algo de core en cada sesión'},{value:'semanal',label:'2-3 bloques a la semana'},{value:'integrado',label:'Integrado en los compuestos, casi sin aislado'}], F.sesion.core)}
      ${filoSub('Cardio')}
      ${filoChoiceGroup('sesion.cardio',[{value:'dias',label:'Días propios de cardio'},{value:'final',label:'Bloque corto al final (zona 2)'},{value:'intervalos',label:'Intervalos / circuitos metabólicos'},{value:'objetivo',label:'Según el objetivo del socio'}], F.sesion.cardio)}`;
  } else if(filoStep===10){
    html+=`${T('Hora pico')}
      ${filoSub('Si el área está ocupada, ¿qué opción prefieres darle al socio?')}
      ${filoChoiceGroup('horaPico.sustitucion',[{value:'maquina',label:'Máquina o polea con el mismo enfoque'},{value:'mancuernas',label:'Mancuernas o zona funcional'},{value:'corporal',label:'Peso corporal / bandas'},{value:'metodo',label:'Cambiar el método (p. ej. superserie con lo disponible)'}], F.horaPico.sustitucion)}
      ${filoSub('Mensaje para tus socios en hora pico')}
      ${filoText('horaPico.nota','Ej. No esperes más de 3 minutos: usa la opción y mantén el tempo.')}`;
  } else if(filoStep===11){
    html+=`${T('Tu sello final')}
      ${filoSub('Describe una sesión típica tuya, como se la explicarías a otro coach. Es lo que más ayuda a que la IA escriba como tú.')}
      ${filoText('sampleRoutineNote','Ej. Pierna: calentamiento de cadera, sentadilla en pirámide 12-10-8-6, búlgara + extensión en biserie, curl femoral con drop set, cierro con pantorrilla en tempo 3-1-1.',4)}
      ${filoSub('Si un socio se estanca...')}
      ${filoText('adjustmentPhilosophy','Ej. Reviso técnica antes que cargas...',3)}
      <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--in-bg2);border-radius:12px">
        ${svgRadarFilosofia(F,110)}
        <div style="font-size:var(--fs-xs);color:var(--mu);line-height:1.7">Así se ve tu huella; esto verá el socio al elegirte.</div>
      </div>`;
  } else if(filoStep===12){
    html+=filoPasoModelos();
  }
  c.innerHTML=html;
  const nb=document.getElementById('filo-next-btn');
  if(nb) nb.textContent = filoStep===FILO_TOTAL ? 'GUARDAR MI FILOSOFÍA ✓' : 'CONTINUAR →';
  const pb=document.querySelector('#filo-nav .btn-prev');
  if(pb) pb.style.visibility = filoStep===1 ? 'hidden' : 'visible';
  c.scrollTop=0;
}
function filoNext(){
  filoGuardarProgreso();
  if(filoStep<FILO_TOTAL){ filoStep++; renderFiloStep(); }
  else guardarFilosofia();
}
function filoPrev(){ if(filoStep>1){ filoStep--; renderFiloStep(); } }
function guardarFilosofia(){
  if(!filoEditId) return;
  filoGuardarProgreso();
  const esPropia = filoEditId===staffActivoEntId;
  cerrarModalFilosofia();
  showToast(esPropia?'🧬 Tu filosofía quedó guardada — tus rutinas nacerán con tu estilo':'🧬 Filosofía guardada para '+(getEntrenador(filoEditId)?.nombre||filoEditId));
  if(staffRol==='coordinador' && document.getElementById('staff-content')?.innerHTML.includes('Entrenadores')) abrirEntrenadores();
}
