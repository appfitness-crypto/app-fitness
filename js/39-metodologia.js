/* ═══ metodología del entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Convierte la filosofía que el entrenador llenó (js/24-filosofia-entrenador.js) en decisiones concretas
   de la rutina del socio que lo eligió, sin depender de la IA:
     · cómo organiza la semana (split) y cómo periodiza (lineal, ondulante, bloques, conjugada)
     · sus rangos de repeticiones, cómo dosifica la intensidad (RPE, RIR, % 1RM, fallo) y sus series típicas
     · calentamiento, orden de los ejercicios, tempo, core y cardio
     · lo que prioriza (fuerza, hipertrofia, movilidad, rendimiento, funcional)
     · los ejercicios que nunca programa
   Además arma el texto "Así entrena <coach>" que ve el socio en la vista previa y en su perfil.
   Rehabilitación y flexibilidad no se tocan: ahí manda el protocolo clínico. ═══ */

const MET_REPS_DEF={F:[4,6],H:[8,12],R:[15,20]};
const MET_PROP={F:'fuerza',H:'hipertrofia',R:'resistencia',P:'potencia'};
const MET_ZONAS={
  'Piernas':['cuadriceps','gluteo','femoral','pantorrilla'],
  'Pecho / espalda':['pecho','pecho_sup','dorsal','espalda_media'],
  'Hombros / brazos':['deltoide','deltoide_lat','deltoide_post','biceps','braquial','triceps','manguito','trapecio'],
  'Core / abdomen':['core','abdomen'],
};
const MET_PIERNA=['cuadriceps','gluteo','femoral','pantorrilla'];

function metActiva(ph){ return !!(ph && ph.tagline && String(ph.tagline).trim()); }
// "3-6", "8 a 12", "15" → [a,b]
function metRango(txt,def){
  const n=String(txt||'').match(/\d{1,2}/g);
  if(!n) return def.slice();
  const a=Math.max(1,Math.min(30,+n[0])), b=Math.max(1,Math.min(30,n[1]?+n[1]:+n[0]));
  return [Math.min(a,b),Math.max(a,b)];
}
function metRepsTxt(r,letra){ return (r[0]===r[1]?r[0]:r[0]+'-'+r[1])+' reps — '+MET_PROP[letra]; }
function metLista(s){ return String(s||'').split(/[,;\n]+/).map(kbNorm).filter(x=>x.length>2); }
function metNombre(ent){ return tc(String((ent&&ent.nombre)||'tu entrenador')).split(' ')[0]; }

// ── Split: lee cómo describe el entrenador su semana ("Torso/pierna 4 días; full body para principiantes") ──
function metSplitClave(txt,nivel){
  const frases=String(txt||'').toLowerCase().split(/[.;\n]+/).map(x=>x.trim()).filter(Boolean);
  const clave=f=>/full|cuerpo completo/.test(f)?'full'
    : /torso|upper|superior/.test(f)?'torso'
    : /push|pull|ppl|empuje|jal[oó]n|tir[oó]n/.test(f)?'ppl'
    : /weider|grupo|por m[uú]sculo|dividid/.test(f)?'grupos' : null;
  if(nivel===1){ const p=frases.find(f=>/principiante|novato|empiez/.test(f) && clave(f)); if(p) return clave(p); }
  const g=frases.find(f=>!/principiante|novato|empiez/.test(f) && clave(f));
  return g?clave(g):null;
}
function metSplitTipos(ph,nFull,nivel){
  if(!metActiva(ph) || !nFull) return null;
  const k=metSplitClave(ph.structure&&ph.structure.split, nivel); if(!k) return null;
  const col=['verde','gold','neon','hombro','red','verde'];
  let nombres;
  if(k==='full' || nFull===1) nombres=['Full Body A','Full Body B','Full Body C'];
  else if(k==='torso') nombres=nFull===3?['Torso A','Pierna A','Full Body B']:['Torso A','Pierna A','Torso B','Pierna B'];
  else if(k==='ppl') nombres=nFull<3?['Full Body A','Full Body B']:['Empuje · Pecho + Tríceps','Jalón · Espalda + Bíceps','Pierna A','Empuje · Pecho + Tríceps B','Jalón · Espalda + Bíceps B','Pierna B'];
  else nombres=nFull<4?null:['Pecho + Tríceps','Espalda + Bíceps','Pierna A','Hombro + Core','Pierna B','Full Body Funcional'];
  if(!nombres) return null;
  const out=[]; for(let i=0;i<nFull;i++) out.push([nombres[i%nombres.length], col[i%col.length]]);
  return {clave:k, tipos:out};
}
const MET_SPLIT_TXT={full:'cuerpo completo en cada sesión',torso:'torso y pierna en días alternos',ppl:'empuje, jalón y pierna',grupos:'un grupo muscular por día'};
// Variedad baja = pocos ejercicios dominados: las sesiones A, B y C repiten los mismos ejercicios
function metPocaVariedad(ph){ return metActiva(ph) && ((ph.exerciseStyle&&ph.exerciseStyle.variety)||3)<=2; }

// ── Intensidad: cómo la dosifica el entrenador, según el tipo de día y el nivel del socio ──
function metEsfuerzo(metodo,letra,nivel){
  if(letra==='P') return {txt:'Máxima velocidad en cada repetición; descansa completo',rir:3};
  if(metodo==='rpe') return letra==='F'?{txt:'RPE 8: termina sintiendo que te quedaban 2 reps',rir:2}
    : letra==='H'?{txt:nivel>1?'RPE 8-9: te queda 1 rep, quizá 2':'RPE 8: te quedan 2 reps',rir:nivel>1?1:2}
    : {txt:'RPE 7: te quedan unas 3 reps',rir:3};
  if(metodo==='rir') return letra==='F'?{txt:'RIR 2: deja 2 reps en reserva',rir:2}
    : letra==='H'?{txt:nivel>1?'RIR 1-2: deja 1 o 2 reps en reserva':'RIR 2: deja 2 reps en reserva',rir:nivel>1?1:2}
    : {txt:'RIR 3: deja 3 reps en reserva',rir:3};
  if(metodo==='porcentajes') return letra==='F'?{txt:'80-85% de tu 1RM',rir:2}
    : letra==='H'?{txt:'67-75% de tu 1RM',rir:2} : {txt:'55-65% de tu 1RM',rir:3};
  if(metodo==='fallo'){
    if(nivel===1) return {txt:'Deja 2 reps en reserva; el fallo llega cuando domines la técnica',rir:2};
    return letra==='F'?{txt:'Pesado, deja 1 rep en reserva',rir:1}:{txt:'Última serie al fallo técnico',rir:0};
  }
  return null;
}

// ── Clasificación de ejercicios dentro del plan ──
function metEsFuerza(e){
  const nm=e&&(e.nm||e.nombre); if(!nm||e.fase) return false;
  return !esEjCardio(e) && !esEjRondas(e) && !esEjMovilidad(e) && !esEjIsometrico(e);
}
function metEsCore(e){ const d=datosEj(e); return d.enf==='core'||d.enf==='abdomen'; }
function metDiaFuerza(d){
  return d && Array.isArray(d.ejercicios) && !/descanso|complemento|cardiovascular/i.test(d.tipo||'')
    && d.ejercicios.filter(metEsFuerza).length>=2;
}
function metEnfDia(d){ return new Set((d.ejercicios||[]).map(e=>datosEj(e).enf).filter(Boolean)); }
function metNuevo(x,extra){
  return Object.assign({nombre:x.nm, nm:x.nm, musculo:x.ms, ms:x.ms, enf:x.enf,
    tip:x.tip||('Siente el músculo objetivo ('+x.ms+') durante todo el recorrido.')}, extra||{});
}
// Primer ejercicio del catálogo de la lista que el socio puede hacer (lesiones, nivel y "nunca" del entrenador)
function metElegir(ids,ctx,nunca,yaEnDia){
  for(const id of ids){
    const x=KB_IDX[id]; if(!x) continue;
    if(ctx.les.some(l=>(x.ev||[]).includes(l))) continue;
    if((x.nv||1)>ctx.nivel) continue;
    if(nunca.some(n=>kbNorm(x.nm).includes(n))) continue;
    if(yaEnDia && yaEnDia.some(e=>kbNorm(e.nm||e.nombre)===kbNorm(x.nm))) continue;
    return x;
  }
  return null;
}

// Etiqueta de periodización de cada día de fuerza: A/B/C del mismo tipo = pesado / ligero / medio
function metFaseDia(per,tipo,i,nivel){
  const suf=((String(tipo).trim().match(/\b([ABC])$/)||[])[1]);
  const pos=suf?{A:0,B:1,C:2}[suf]:i;
  if(per==='ondulante') return ['pesado','ligero','medio'][pos%3];
  if(per==='conjugada' && nivel>1) return ['maximo','dinamico'][pos%2];
  return null;
}
const MET_FASE_TXT={pesado:'Día pesado',medio:'Día medio',ligero:'Día ligero',maximo:'Esfuerzo máximo',dinamico:'Esfuerzo dinámico'};
function metLetraDia(fase,obj){
  if(fase==='pesado') return obj==='R'?'H':'F';
  if(fase==='medio') return obj==='F'?'F':obj==='R'?'R':'H';
  if(fase==='ligero') return obj==='F'?'H':'R';
  if(fase==='maximo') return 'F';
  return obj;
}

// ═════════════════════════════════════════
// Aplica la metodología a una semana ya armada (plantilla). Devuelve las líneas para el socio.
// p = {objetivo, nivel, edad, zonas}
// ═════════════════════════════════════════
function aplicarMetodologia(semana,ent,ctx,p){
  const ph=ent&&ent.filosofia;
  if(!metActiva(ph) || ctx.sinMetodos || ctx.soloSuaves) return null;
  const nivel=ctx.nivel, obj=ctx.obj, edad=parseInt(p.edad)||35;
  const ss=ph.sesion||{}, pr=ph.priorities||{}, se=ph.seleccion||{};
  const nunca=metLista(se.nunca);
  const per=(ph.structure&&ph.structure.periodization)||'';
  const metodoInt=(ph.structure&&ph.structure.method)||'';
  const modelo=(typeof filoModeloReps==='function')?filoModeloReps(ph,p.objetivo):null;
  const dosis=ph.dosis||{};
  const rangos={F:metRango(dosis.fuerza,MET_REPS_DEF.F), H:metRango(dosis.hipertrofia,MET_REPS_DEF.H), R:metRango(dosis.resistencia,MET_REPS_DEF.R)};
  if(modelo && !String(dosis[MET_PROP[obj]]||'').trim()) rangos[obj]=[modelo.min,modelo.max];
  // Seguridad: principiantes y mayores de 60 no bajan de 6 reps
  if(nivel===1 || edad>=60){ rangos.F=[Math.max(6,rangos.F[0]),Math.max(6,rangos.F[1])]; }
  const dias=(semana||[]).filter(metDiaFuerza);
  if(!dias.length) return null;

  // 1) Ejercicios que el entrenador nunca programa: se cambian por otro del mismo enfoque o se quitan
  (semana||[]).forEach(d=>{
    if(!d||!Array.isArray(d.ejercicios)) return;
    d.ejercicios=d.ejercicios.filter(e=>{
      const nm=e.nm||e.nombre; if(!nm || !nunca.some(n=>kbNorm(nm).includes(n))) return true;
      const kb=kbBuscar(nm), enf=(kb&&kb.enf)||e.enf;
      const x=enf && metElegir(KB_EJERCICIOS.filter(c=>c.enf===enf && !c.rondas).map(c=>c.id),ctx,nunca,d.ejercicios);
      if(!x) return false;
      aplicarEjCatalogo(e,x); return true;
    });
  });

  // 2) Periodización, rangos, series e intensidad
  dias.forEach((d,i)=>{
    const fase=metFaseDia(per,d.tipo,i,nivel);
    if(fase) d.tipo=String(d.tipo).replace(/\s*·\s*(D[ií]a (pesado|medio|ligero)|Esfuerzo (m[aá]ximo|din[aá]mico))$/i,'')+' · '+MET_FASE_TXT[fase];
    const letraDia=fase?metLetraDia(fase,obj):obj;
    let principal=true;
    d.ejercicios.forEach(e=>{
      if(!metEsFuerza(e) || e.potencia) return;
      const dd=datosEj(e), comp=dd.tipo==='c';
      let letra = comp ? letraDia : (letraDia==='F'?'H':letraDia);
      if(letra==='F' && cargaLesion(ctx,dd)) letra='H';   // sobre la zona lesionada no se carga pesado
      let rango=rangos[letra];
      if(fase==='dinamico' && comp && principal){
        e.series=nivel>=3?8:6; e.reps='3 reps — velocidad'; e.peso='Moderado — 55% 1RM';
        e.esfuerzo='55-60% de tu 1RM, cada repetición lo más rápido posible'; e.rir=4;
        principal=false; return;
      }
      e.reps=metRepsTxt(rango,letra);
      if(modelo && modelo.series) e.series=Math.max(2,Math.min(6,modelo.series));
      if(comp && principal){
        if((pr.fuerza||3)>=4 && nivel>1) e.series=Math.min(5,(parseInt(e.series)||3)+1);
        if(per==='bloques') e.series=Math.min(5,(parseInt(e.series)||3)+1);
        principal=false;
      } else if(!comp && (pr.hipertrofia||3)>=4) e.series=Math.min(4,(parseInt(e.series)||3)+1);
      const esf=metEsfuerzo(metodoInt,letra,nivel);
      if(esf){ e.esfuerzo=esf.txt; e.rir=esf.rir; }
      if(!/1\s*RM/i.test(e.peso||'') && !/^(corporal|banda|sin carga)/i.test(e.peso||'')) e.peso='Moderado — 60% 1RM';
    });
  });

  // 3) Prioridades: potencia (rendimiento) y trabajo funcional
  if((pr.rendimiento||3)>=4 && nivel>1){
    let n=0;
    dias.forEach(d=>{
      if(n>=2 || ![...metEnfDia(d)].some(x=>MET_PIERNA.includes(x))) return;
      const x=metElegir(['sentadilla_salto','kb_swing'],ctx,nunca,d.ejercicios); if(!x) return;
      d.ejercicios.unshift(metNuevo(x,{series:4, reps:'5 reps — potencia', peso:x.z==='corporal'?'Corporal':'Moderado', potencia:true,
        esfuerzo:'Máxima velocidad en cada repetición; descansa completo', rir:3, descanso:'90 s',
        tip:'Explota hacia arriba con toda la intención y aterriza suave; si la velocidad baja, termina la serie.'}));
      n++;
    });
  }
  if((pr.funcional||3)>=4){
    let n=0;
    dias.forEach(d=>{
      if(n>=2) return;
      const x=metElegir(['farmer','farmer_unilateral'],ctx,nunca,d.ejercicios); if(!x) return;
      d.ejercicios.push(metNuevo(x,{series:3, reps:'30 m — resistencia', peso:'Moderado'})); n++;
    });
  }

  // 4) Orden de los ejercicios
  const zonasSocio=new Set((p.zonas||[]).flatMap(z=>MET_ZONAS[z]||[]));
  const orden = ss.orden==='prioridad' && !zonasSocio.size ? 'compuesto' : ss.orden;
  let preagot=0;
  dias.forEach(d=>{
    const fuerza=d.ejercicios.filter(e=>metEsFuerza(e)&&!e.potencia);
    const peso=e=>{
      if(orden==='prioridad') return zonasSocio.has(datosEj(e).enf)?0:metEsCore(e)?3:1;
      if(metEsCore(e)) return 3;
      return datosEj(e).tipo==='c'?0:1;
    };
    if(orden==='compuesto' || orden==='prioridad'){
      const ord=fuerza.map((e,i)=>({e,i})).sort((a,b)=>peso(a.e)-peso(b.e)||a.i-b.i).map(o=>o.e);
      let k=0; d.ejercicios=d.ejercicios.map(e=>fuerza.includes(e)?ord[k++]:e);
    }
    if(orden==='preagot' && preagot<2 && nivel>1 && metodosPermitidos(ctx).includes('pre_agot')){
      const comp=fuerza.find(e=>datosEj(e).tipo==='c'); if(!comp) return;
      const enf=datosEj(comp).enf; if(!enf || cargaLesion(ctx,datosEj(comp))) return;
      let iso=fuerza.find(e=>e!==comp && datosEj(e).tipo==='a' && datosEj(e).enf===enf);
      if(!iso){
        const x=metElegir(KB_EJERCICIOS.filter(c=>c.enf===enf && c.t==='a' && !c.iso && ['maquina','polea'].includes(c.z)).map(c=>c.id),ctx,nunca,d.ejercicios);
        if(!x) return;
        iso=metNuevo(x,{series:3, reps:metRepsTxt(rangos.H,'H'), peso:'Moderado — 55% 1RM'});
        const esf=metEsfuerzo(metodoInt,'H',nivel); if(esf){ iso.esfuerzo=esf.txt; iso.rir=esf.rir; }
      } else d.ejercicios.splice(d.ejercicios.indexOf(iso),1);
      d.ejercicios.splice(d.ejercicios.indexOf(comp),0,iso);
      const usadas=new Set(d.ejercicios.map(e=>e.grupo&&e.grupo.charAt(0)).filter(Boolean));
      const g=['A','B','C','D','E'].find(l=>!usadas.has(l))||'P';
      iso.grupo=g+'1'; comp.grupo=g+'2';
      const M=KB_METODOS.pre_agot;
      iso.metodo={id:'pre_agot',nm:M.nm,detalle:'Con '+(comp.nm||comp.nombre)};
      comp.metodo={id:'pre_agot',nm:M.nm,detalle:'Después de '+(iso.nm||iso.nombre)};
      preagot++;
    }
  });

  // 5) Tempo (va al inicio de la nota de cada ejercicio de fuerza)
  if(ss.tempo){
    dias.forEach(d=>{
      const pesado=/pesado|m[aá]ximo|din[aá]mico/i.test(d.tipo||'');
      const modo=ss.tempo==='fase'?(pesado?'explosivo':'controlado'):ss.tempo;
      const txt=modo==='explosivo'?'Tempo: baja en 2-3 s y sube explosivo. ':'Tempo 3-1-1: baja en 3 s, pausa 1 s, sube en 1 s. ';
      d.ejercicios.forEach(e=>{
        if(!metEsFuerza(e) || e.potencia || /^tempo/i.test(e.tip||'')) return;
        e.tip=txt+(e.tip||'');
      });
    });
  }

  // 6) Core
  const coreIds=['plancha','dead_bug','pallof','bird_dog','pallof_liga'];
  const agregarCore=(d,i)=>{
    if(d.ejercicios.some(metEsCore)) return;
    const rot=coreIds.slice(i%coreIds.length).concat(coreIds.slice(0,i%coreIds.length));
    const x=metElegir(rot,ctx,nunca,d.ejercicios); if(!x) return;
    d.ejercicios.push(metNuevo(x,{series:3, reps:x.iso?'30 seg — isométrico':'12 reps — resistencia', peso:x.z==='corporal'?'Corporal':'Ligero'}));
  };
  if(ss.core==='diario') dias.forEach(agregarCore);
  else if(ss.core==='semanal'){
    let con=0;
    dias.forEach(d=>{
      if(!d.ejercicios.some(metEsCore)) return;
      if(con>=3) d.ejercicios=d.ejercicios.filter(e=>!metEsCore(e)||datosEj(e).tipo==='c'); else con++;
    });
    dias.forEach((d,i)=>{ if(con<2 && !d.ejercicios.some(metEsCore)){ agregarCore(d,i); con++; } });
  } else if(ss.core==='integrado'){
    dias.forEach(d=>{
      d.ejercicios=d.ejercicios.filter(e=>!metEsCore(e) || datosEj(e).tipo==='c');
      const c=d.ejercicios.find(e=>metEsFuerza(e)&&datosEj(e).tipo==='c');
      if(c && !/abdomen firme/i.test(c.tip||'')) c.tip='Abdomen firme durante toda la serie: aquí también trabaja tu core. '+(c.tip||'');
    });
  }

  // 7) Cardio
  let cardio=ss.cardio;
  if(cardio==='objetivo') cardio=obj==='R'?'intervalos':'final';
  if(cardio==='final' || cardio==='intervalos'){
    const tope=cardio==='intervalos'?(obj==='R'?3:2):(obj==='R'?dias.length:2);
    let n=0;
    dias.forEach((d,i)=>{
      if(n>=tope || d.ejercicios.some(e=>esEjCardio(e)||esEjRondas(e))) return;
      let x;
      if(cardio==='final') x=metElegir(i%2?['bici','caminadora_incl','eliptica']:['caminadora_incl','bici','eliptica'],ctx,nunca);
      else x=metElegir(nivel>1?['burpee','trineo','cuerda_salto','escaladores','bici_aire']:['trineo','escaladores','bici'],ctx,nunca);
      if(!x) return;
      d.ejercicios.push(metNuevo(x, cardio==='final'
        ? {series:1, reps:'12 min — zona 2', peso:'', tip:'Ritmo en el que puedas hablar con frases cortas; es trabajo cardiovascular, no castigo.'}
        : {series:nivel>1?5:4, reps:'', peso:'', tip:'Intervalo intenso y descanso igual de largo; mantén la técnica aunque te canses.'}));
      n++;
    });
  }

  // 8) Calentamiento y cierre de movilidad (al final, para que queden en primer lugar)
  const movPrimero=ss.calentamiento==='movilidad' || (pr.movilidad||3)>=4;
  dias.forEach(d=>{
    const enf=metEnfDia(d);
    const pierna=[...enf].some(x=>MET_PIERNA.includes(x));
    if(ss.calentamiento==='especifico'){
      const x=metElegir(pierna?['monster_walk','clamshell','puente_liga']:(ctx.les.includes('hombro')?['banda_rotacion','face_pull_liga']:['face_pull_liga','banda_rotacion']),ctx,nunca,d.ejercicios);
      if(x) d.ejercicios.unshift(metNuevo(x,{series:2, reps:x.lado?'12 por lado':'15 reps', peso:'Banda ligera', fase:'calentamiento',
        tip:'Activación antes de cargar: movimiento lento sintiendo solo el músculo que vas a entrenar hoy. '+(x.tip||'')}));
    }
    if(ss.calentamiento==='aproximacion'){
      const c=d.ejercicios.find(e=>metEsFuerza(e)&&datosEj(e).tipo==='c');
      if(c && !/aproximaci/i.test(c.tip||'')) c.tip='Antes: 2 series de aproximación (5 reps con ~50% y 3 reps con ~75% del peso de trabajo). '+(c.tip||'');
    }
    if(movPrimero && !d.ejercicios.some(e=>esEjMovilidad(e) && /articular|din[aá]mica/i.test(e.nm||e.nombre||'')))
      d.ejercicios.unshift({nombre:'Movilidad articular dinámica', nm:'Movilidad articular dinámica', musculo:'Movilidad · Articulaciones', ms:'Movilidad · Articulaciones',
        series:2, reps:'8-10 reps por movimiento', peso:'Sin carga', fase:'calentamiento', tip:'Prepara las articulaciones antes de cargar peso: muévete suave y amplio, sin cansarte.'});
    if((pr.movilidad||3)>=5 && !d.ejercicios.some(e=>/estiramiento/i.test(e.nm||e.nombre||'')))
      d.ejercicios.push({nombre:'Movilidad y estiramiento', nm:'Movilidad y estiramiento', musculo:'Movilidad · Flexibilidad', ms:'Movilidad · Flexibilidad',
        series:1, reps:'10 min', peso:'Sin carga', fase:'cierre', tip:'Respira lento en cada postura hasta sentir que el músculo cede; nunca hasta el dolor.'});
  });

  return metLineas(ph,ent,p,ctx);
}

// ── Lo que el socio lee: cómo entrena su coach y por qué su plan se ve así ──
function metLineas(ph,ent,p,ctx){
  if(!metActiva(ph)) return null;
  const L=[], nm=metNombre(ent), ss=ph.sesion||{}, nivel=ctx?ctx.nivel:nivelNum(p.nivel);
  const sp=metSplitClave(ph.structure&&ph.structure.split, nivel);
  if(sp) L.push('Semana organizada en '+MET_SPLIT_TXT[sp]+'.');
  const per=ph.structure&&ph.structure.periodization;
  if(per==='ondulante') L.push('Periodización ondulante: alternas días pesados, medios y ligeros en la misma semana.');
  else if(per==='lineal') L.push('Progresión lineal: cuando completes todas las reps con buena técnica, sube un poco el peso.');
  else if(per==='bloques') L.push('Trabajas por bloques: primero acumulas volumen, luego subes la intensidad y después descargas.');
  else if(per==='conjugada') L.push(nivel>1?'Método conjugado: un día buscas la carga máxima y otro la velocidad.':'Cuando domines la técnica tu plan alternará días de carga máxima y de velocidad; por ahora progresas paso a paso.');
  const mi={rpe:'Mides el esfuerzo con RPE: qué tan duro se sintió la serie del 1 al 10.',rir:'Mides el esfuerzo con RIR: cuántas reps te quedaron en reserva.',
    porcentajes:'Las cargas van en % de tu 1RM; la app te sugiere el peso con tus registros.',fallo:nivel>1?'Las últimas series de aislamiento llegan al fallo técnico.':'Por ahora sin llegar al fallo: primero la técnica.'}[ph.structure&&ph.structure.method];
  if(mi) L.push(mi);
  const cal={movilidad:'Cada sesión empieza con movilidad articular.',aproximacion:'Antes del ejercicio principal haces series de aproximación.',especifico:'Antes de cargar activas el músculo del día.'}[ss.calentamiento];
  if(cal) L.push(cal);
  const ord={compuesto:'Primero los ejercicios compuestos pesados; el aislamiento va al final.',preagot:'Algunos días pre-agotas el músculo antes del compuesto.',prioridad:'Primero va lo que más necesitas: tus zonas prioritarias.'}[ss.orden];
  if(ord) L.push(ord);
  const tem={controlado:'Bajadas lentas y controladas en todo.',explosivo:'Bajas controlado y subes explosivo.',fase:'El tempo cambia según el día: controlado o explosivo.'}[ss.tempo];
  if(tem) L.push(tem);
  const core={diario:'Core en cada sesión.',semanal:'Core en 2 o 3 sesiones por semana.',integrado:'El core trabaja dentro de los ejercicios grandes.'}[ss.core];
  if(core) L.push(core);
  const car={dias:'El cardio tiene sus propios días.',final:'Cierras con un bloque corto de cardio suave.',intervalos:'Cierras algunos días con intervalos.',objetivo:'El cardio se ajusta a tu objetivo.'}[ss.cardio];
  if(car) L.push(car);
  const prog={numeros:'Tu avance se mide en números: peso y repeticiones.',calidad:'Tu avance se mide primero por la calidad del movimiento.',mixto:'Tu avance se mide en números y en calidad de movimiento.'}[ph.progressStyle];
  if(prog) L.push(prog);
  if(ph.adjustmentPhilosophy && String(ph.adjustmentPhilosophy).trim()) L.push('Si te estancas: '+String(ph.adjustmentPhilosophy).trim());
  return {entrenador:(ent&&ent.nombre)||'', corto:nm, tagline:String(ph.tagline).trim(), lineas:L,
    horaPico:(ph.horaPico&&ph.horaPico.nota)?String(ph.horaPico.nota).trim():''};
}

// ── Bloque "Así entrena <coach>" (vista previa del plan y perfil del socio) ──
function metodoHTML(m){
  if(!m || !m.tagline) return '';
  return `<div class="met-c">
    <div class="met-k">Así entrena ${esc(m.corto||m.entrenador)}</div>
    <div class="met-t">«${esc(m.tagline)}»</div>
    ${(m.lineas||[]).length?`<ul class="met-l">${m.lineas.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}
  </div>`;
}

// ═════════════════════════════════════════
// REHACER EL PLAN con el método del entrenador (socio que se vincula con código después de registrarse)
// Usa el mismo camino que el registro y conserva todo el historial del socio.
// ═════════════════════════════════════════
const MET_SIN_REHACER=['REHABILITACIÓN','FLEXIBILIDAD'];
function rutinaDesdeSemana(semana){
  const keys=['lun','mar','mie','jue','vie','sab','dom'], out={};
  (semana||[]).forEach((d,i)=>{
    const k=keys[i]||keys[6];
    out[k]={label:DIAS_NAMES[k], tipo:d.tipo, color:d.color||'verde',
      ejercicios:(d.ejercicios||[]).map(e=>{
        const r={nm:e.nm||e.nombre, series:e.series, reps:e.reps, peso:e.peso,
          ms:e.ms||e.musculo, tip:e.tip||'Siente este músculo durante el movimiento.',
          enf:e.enf||e.enfoque||'', metodo:e.metodo||null, grupo:e.grupo||'', descanso:e.descanso||'',
          alternativas:e.alternativas||[]};
        if(e.esfuerzo) r.esfuerzo=e.esfuerzo;
        if(e.rir!=null) r.rir=e.rir;
        return r;
      })};
  });
  keys.forEach(k=>{ if(!out[k]) out[k]={label:DIAS_NAMES[k],tipo:'DESCANSO',color:'descanso',ejercicios:[]}; });
  return out;
}
// Arma un plan nuevo para el socio con el método de "ent", sin guardarlo. Devuelve {rutina, metodo} o null.
function planConMetodo(s,ent){
  if(!s || !ent || !metActiva(ent.filosofia) || MET_SIN_REHACER.includes(s.objetivo) || s.modo==='casa') return null;
  const respaldo=JSON.parse(JSON.stringify(qAnswers));
  try{
    Object.assign(qAnswers,{nombre:s.nombre||'', objetivo:s.objetivo, nivel:s.nivel, edad:s.edad, peso:s.peso, estatura:s.estatura,
      genero:s.genero||'', dias:s.dias||4, diasSemana:[...(s.diasSemana||[])], zonas:[...(s.zonas||[])],
      limitaciones:(s.limitaciones&&s.limitaciones.length)?[...s.limitaciones]:['Sin limitaciones'], cardio:s.cardio||'',
      disciplina:s.disciplina||'', entorno:s.entorno||'', entrenadorId:ent.id, entrenadorNombre:ent.nombre,
      clasesGrupales:(s.clasesGrupales||[]).map(c=>({clase:c.clase,dias:[...(c.dias||[])],entrenaMismoDia:!!c.entrenaMismoDia}))});
    const data=buildFallback(); data.origen='plantilla';
    procesarRutina(data);
    return {rutina:rutinaDesdeSemana(data.semana), metodo:data.metodo||null};
  }catch(e){ console.warn('No se pudo rehacer el plan',e); return null; }
  finally{ Object.keys(qAnswers).forEach(k=>delete qAnswers[k]); Object.assign(qAnswers,respaldo); }
}
function rehacerPlanConEntrenador(s){
  const plan=planConMetodo(s, s&&getEntrenador(s.entrenadorId)); if(!plan) return false;
  s.rutina=plan.rutina; s.origenRutina='plantilla'; s.metodo=plan.metodo;
  s.planActualizado=fechaISO(new Date());
  dbSave(s.code);
  return true;
}

// ── Panel del entrenador: rehacer la rutina de un socio con su método ──
// Se carga en el editor como "Usar esta rutina como base": se puede deshacer y no se guarda hasta "Guardar cambios".
function staffEntMetodo(s){
  const ent=(s&&s.entrenadorId&&getEntrenador(s.entrenadorId)) || (staffRol!=='coordinador' && staffActivoEntId && getEntrenador(staffActivoEntId));
  return ent && metActiva(ent.filosofia) ? ent : null;
}
function staffBotonMetodoHTML(s){
  if(!s || MET_SIN_REHACER.includes(s.objetivo) || s.modo==='casa') return '';
  const ent=staffEntMetodo(s);
  if(!ent){
    return (staffRol!=='coordinador' && staffActivoEntId)
      ? `<button type="button" class="sd-b" onclick="abrirMiFilosofia()" title="Llena tu filosofía para poder rehacer rutinas con tu método">🧬 Define tu método</button>` : '';
  }
  const propio=ent.id===staffActivoEntId;
  return `<button type="button" class="sd-b p" onclick="staffRehacerConMetodo('${s.code}')" title="Arma de nuevo la semana con la filosofía de ${esc(ent.nombre)}: split, periodización, reps, intensidad, calentamiento, core y cardio">🧬 Rehacer con ${propio?'mi método':'el método de '+esc(metNombre(ent))}</button>`;
}
function staffRehacerConMetodo(code){
  const s=getSocio(code); if(!s) return;
  const ent=staffEntMetodo(s); if(!ent) return;
  uiConfirm('¿Rehacer la rutina de '+tc(s.nombre||'')+' con el método de '+metNombre(ent)+'?\nReemplaza la rutina en pantalla, incluidos los ajustes manuales. No se guarda hasta que presiones Guardar cambios y puedes deshacerlo. Su historial no cambia.',()=>{
    const plan=planConMetodo(s,ent);
    if(!plan){ showToast('No se pudo rehacer esta rutina'); return; }
    staffRutBackup[code]=limpio(s.rutina);
    s.rutina=plan.rutina; s.metodo=plan.metodo; s.origenRutina='plantilla';
    staffDirty.add(code); staffTab='rutina'; staffRenderContent(s);
    showToast('🧬 Rutina rehecha con el método de '+metNombre(ent)+'. Revísala y presiona GUARDAR');
  },{label:'Rehacer rutina'});
}
function ofrecerRehacerPlan(s){
  const ent=s&&getEntrenador(s.entrenadorId);
  if(!ent || !metActiva(ent.filosofia) || MET_SIN_REHACER.includes(s.objetivo)) return;
  uiConfirm('¿Rehacemos tu plan con el método de '+metNombre(ent)+'? Cambian tus ejercicios, series y repeticiones. Tus registros, récords y progreso se conservan.',
    ()=>{ if(rehacerPlanConEntrenador(s)){ showToast('Tu plan ya sigue el método de '+metNombre(ent)); refreshDash(); }
          else showToast('No se pudo rehacer el plan. Inténtalo más tarde.'); },
    {label:'Rehacer mi plan', cancel:'Ahora no'});
}
