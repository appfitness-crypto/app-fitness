/* ═══ progresión y autorregulación del entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Convierte los bloques 4 y 6 del cuestionario de filosofía (js/24-filosofia-entrenador.js) en reglas del día a día:
     · duración del bloque y semana de descarga (cuándo y cómo)
     · regla con la que sube el peso sugerido de una sesión a otra y tamaño del incremento
     · "¿Cómo llegas hoy?" al iniciar la sesión y el ajuste del día según lo que decidió el entrenador
   Si el entrenador no contestó una pregunta, la app se comporta como antes. ═══ */

function progCoach(ph){
  const p=(metActiva(ph)&&ph.progresion)||{};
  return {semanas:parseInt(p.semanas)||0, descarga:p.descarga||'', tipoDescarga:p.tipoDescarga||'volumen',
    regla:p.regla||'', incremento:p.incremento||'', hoy:p.hoy||''};
}
function progSocio(s){
  try{ const ent=entRutina(s&&s.entrenadorId); return progCoach(ent&&ent.filosofia); }
  catch(_){ return progCoach(null); }
}
function progSuave(s){ return !!s && (s.objetivo==='REHABILITACIÓN'||s.objetivo==='FLEXIBILIDAD'); }

// ── Semana de descarga: la última del bloque, la última de cada 2 bloques o cuando hay señales de fatiga ──
function semanaDescarga(s){
  const c=progSocio(s);
  if(!c.descarga || c.descarga==='no' || progSuave(s)) return null;
  const b=pqBloque(s), sem=pqSemanaActual(s);
  if(c.descarga==='ultima' && b.semanas>=3 && sem===b.semanas) return c.tipoDescarga;
  if(c.descarga==='cada2' && b.n%2===0 && sem===b.semanas) return c.tipoDescarga;
  if(c.descarga==='fatiga'){
    const ck=comoArray(s.logs&&s.logs.checkins).filter(x=>x && (diasDesde(x.fecha)??99)<=10).slice(-3);
    if(ck.filter(x=>x.v==='mal').length>=2) return c.tipoDescarga;
  }
  return null;
}
const PROG_DESCARGA_TXT={
  volumen:'Semana de descarga: la mitad de las series con el mismo peso.',
  intensidad:'Semana de descarga: mismas series con 15 % menos de peso.',
  activa:'Semana de descarga activa: sesión suave, o cámbiala por caminata y movilidad.'
};

// ── Ajuste de la sesión de hoy (descarga + "¿Cómo llegas hoy?") ──
function ajusteSesion(s,hoy){
  const out={seriesFactor:1, seriesMenos:0, kgFactor:1, notas:[], descarga:null, hoy:hoy||null};
  const dl=semanaDescarga(s);
  if(dl){
    out.descarga=dl;
    if(dl==='volumen') out.seriesFactor=0.55;
    else if(dl==='intensidad') out.kgFactor=0.85;
    else { out.seriesFactor=0.5; out.kgFactor=0.8; }
    out.notas.push(PROG_DESCARGA_TXT[dl]||PROG_DESCARGA_TXT.volumen);
  }
  if(hoy==='mal'){
    const r=progSocio(s).hoy;
    if(r==='serie'){ out.seriesMenos=1; out.notas.push('Llegas cansado: una serie menos por ejercicio.'); }
    else if(r==='carga'){ out.kgFactor*=0.9; out.notas.push('Llegas cansado: 10 % menos de peso en todo.'); }
    else if(r==='tecnica'){ out.seriesMenos=1; out.kgFactor*=0.8; out.notas.push('Hoy toca técnica: cargas ligeras, una serie menos y cada repetición perfecta.'); }
  }
  out.activo=out.seriesFactor<1 || out.seriesMenos>0 || out.kgFactor<1;
  return out;
}
// Series de hoy de un ejercicio (cardio, isométricos, movilidad, rondas y EMOM no cambian)
function seriesHoy(e,aj){
  const n=parseInt(e&&e.series)||0;
  if(!n || !aj || !aj.activo) return n;
  if(esEjCardio(e)||esEjRondas(e)||esEjMovilidad(e)||esEjIsometrico(e)||(e.metodo&&e.metodo.id==='emom')) return n;
  return Math.max(Math.min(2,n),Math.min(n,Math.round(n*aj.seriesFactor)-aj.seriesMenos));   // nunca menos de 2 series
}
function cargaHoy(c,aj){
  if(!c || !aj || !(aj.kgFactor<1) || !c.kg) return c;
  return Object.assign({},c,{kg:pqRedondear(c.kg*aj.kgFactor), sube:0, ajustada:true});
}

// "¿Cómo llegas hoy?" — solo si el entrenador definió qué hacer cuando el socio llega cansado
function progPreguntaHoy(s){ const r=progSocio(s).hoy; return !!r && r!=='mantener' && !progSuave(s); }
function preguntarComoLlegas(s,listo){
  uiOpciones('¿Cómo llegas hoy?',[
    {value:'bien',label:'Con energía',sub:'Dormí bien y tengo ganas'},
    {value:'normal',label:'Normal'},
    {value:'mal',label:'Cansado o dormí mal',sub:'Tu entrenador ajusta la sesión de hoy'}],
    v=>{
      if(!s.logs) s.logs={};
      s.logs.checkins=comoArray(s.logs.checkins).filter(x=>x&&x.fecha!==fechaISO(new Date())).concat([{fecha:fechaISO(new Date()), v}]).slice(-30);
      listo(v);
    });
}

// ── Peso sugerido de una sesión a otra según la regla del entrenador ──
function histEjSes(s,nm){
  const out=[];
  comoArray(s.logs&&s.logs.sesiones).forEach(x=>comoArray(x&&x.detalle).forEach(d=>{ if(d&&d.n===nm&&!d.alt) out.push({d,ses:x}); }));
  return out;
}
function progIncremento(kg,inc){
  const min=pqRedondear(kg+(kg>=20?2.5:kg>=5?1:0.5));
  if(inc==='2.5'||inc==='5'){ const x=pqRedondear(kg*(1+(+inc)/100)); return x>kg?Math.max(x,kg+0.5):min; }
  return min;
}
function progPierna(ej){ return MET_PIERNA.includes(datosEj(ej).enf); }
// u = último registro con peso ({d, ses}) · devuelve {kg, nota} o null si la regla no aplica
function progSiguiente(s,ej,u){
  const c=progSocio(s), d=u.d, kg=+d.kg;
  if(c.regla==='doble' && Array.isArray(d.sr) && d.sr.some(x=>x[1])){
    const top=repsObjetivo(ej.reps);
    if(!d.sr.every(x=>(+x[1]||0)>=top)) return {kg, nota:'Mismo peso hasta lograr '+top+' reps en todas las series'};
  }
  if(c.regla==='rpe'){
    const f=u.ses&&u.ses.sensacion;
    if(f==='Duro'||f==='Al límite') return {kg, nota:'Mismo peso: la última vez se sintió '+f.toLowerCase()};
  }
  if(c.regla==='fija'){
    const sem=x=>fechaISO(inicioSemana(new Date(x+'T12:00:00')));
    if(u.ses && u.ses.fecha && sem(u.ses.fecha)===sem(fechaISO(new Date()))) return {kg, nota:'El peso sube una vez por semana'};
    if(kg>=20) return {kg:kg+(progPierna(ej)?5:2.5)};
  }
  if(c.regla==='porcentajes'){
    const pct=pct1RM(ej.peso), rm=s.logs&&s.logs.rm&&s.logs.rm[prKey(ej.nm)];
    if(pct && rm){
      const b=pqBloque(s), sem=Math.min(pqSemanaActual(s),b.semanas);
      const f=Math.min(0.95,pctPorReps(repsObjetivo(ej.reps),ej.rir!=null?+ej.rir:2)*(1+0.025*(sem-1)));
      const x=pqRedondear(rm*f);
      return {kg:Math.max(x,kg), nota:'Semana '+sem+' del bloque: '+Math.round(f*100)+'% de tu 1RM'};
    }
  }
  return {kg:progIncremento(kg,c.incremento)};
}

// ── Textos para el socio ("Así entrena…") ──
function progLineas(ph){
  const c=progCoach(ph), L=[];
  if(c.semanas || c.descarga){
    const dl={ultima:'la última semana es de descarga',cada2:'cada 2 bloques la última semana es de descarga',fatiga:'si acumulas cansancio, la semana se vuelve de descarga',no:'sin semanas de descarga programadas'}[c.descarga];
    L.push((c.semanas?'Bloques de '+c.semanas+' semanas':'Trabajas por bloques')+(dl?'; '+dl:'')+'.');
  }
  const rg={doble:'Doble progresión: primero subes repeticiones hasta el tope del rango y después el peso.',
    fija:'El peso sube una vez por semana: unos 2.5 kg en torso y 5 kg en pierna.',
    rpe:'El peso sube cuando la sesión anterior se sintió fácil o bien.',
    porcentajes:'Tus cargas siguen porcentajes de tu 1RM que suben cada semana del bloque.'}[c.regla];
  if(rg) L.push(rg);
  if(c.hoy && c.hoy!=='mantener') L.push('Antes de entrenar te pregunto cómo llegas y ajusto la sesión del día.');
  return L;
}
// ── Instrucciones para la IA ──
function progIA(ph,objetivo){
  const c=progCoach(ph), L=[];
  const per=metPeriodizacion(ph,objetivo);
  if(per) L.push('Periodización para el objetivo de este socio: '+per+'.');
  if(c.semanas) L.push('Duración del bloque: '+c.semanas+' semanas.');
  if(c.descarga) L.push('Descarga: '+{ultima:'última semana de cada bloque',cada2:'cada 2 bloques',fatiga:'solo con señales de fatiga',no:'no programa descargas'}[c.descarga]+(c.descarga!=='no'?' ('+{volumen:'baja volumen 40-50 % y mantiene la carga',intensidad:'baja la intensidad',activa:'semana libre o activa'}[c.tipoDescarga]+')':'')+'.');
  if(c.regla) L.push('Regla de progresión: '+{doble:'doble progresión (reps al tope del rango → sube peso)',fija:'carga fija semanal (+2.5 kg torso, +5 kg pierna)',rpe:'por RPE (si quedó fácil, sube)',porcentajes:'porcentajes programados por semana'}[c.regla]+'.');
  const rir=(ph&&ph.progresion&&ph.progresion.rir)||{};
  const rt=[['1','principiante'],['2','intermedio'],['3','avanzado']].filter(([k])=>rir[k]).map(([k,n])=>n+' RIR '+rir[k]);
  if(rt.length) L.push('Repeticiones en reserva por nivel: '+rt.join(', ')+'.');
  return L;
}
