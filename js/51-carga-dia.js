/* ═══ carga y duración del día ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   La duración y la etiqueta "Día pesado / medio / ligero" salen de lo que el día contiene de verdad (series,
   repeticiones, descansos, minutos de cardio, EMOM y movilidad), así que se recalculan cuando el entrenador edita.
   La etiqueta compara los días de entrenamiento de la misma semana. ═══ */

const CD_TRANSICION=60;          // seg por ejercicio para preparar equipo y cambiar de estación
function cdSocio(){ return (typeof activeSocio!=='undefined'&&activeSocio)||null; }
// Segundos de trabajo de una serie de fuerza: ~3 s por repetición (4-5 s con tempo o pausa), mínimo 20 s
function cdSegSerie(e,reps){
  const t=String(e.reps||'')+' '+String(e.metodo&&e.metodo.id||'');
  const porRep=/tempo|pausa|excentric|negativa/i.test(t+' '+(e.nm||''))?4.5:3;
  return Math.max(20,Math.round((reps||10)*porRep));
}
function cdRepsSerie(e,j){ const r=parseInt(repsDeSerie(e,j)); return r>0?r:repsObjetivo(e.reps)||10; }
function cdDescanso(e){ const p=descansoPlan(e.descanso); return p.nada?0:p.seg?p.seg:p.meta||90; }
// Minutos que lleva un ejercicio (con su descanso y la transición)
function minutosEjercicio(e,d,s){
  s=s||cdSocio();
  if(e.metodo&&e.metodo.id==='emom') return (parseInt(e.series)||10)+1;
  if(esEjCardio(e)) return cardioRx(e,s).total+1;
  if(esEjMovilidad(e)){
    const r=movRx(e,d);
    if(r.forma==='tiempo'&&r.min) return r.min;
    return Math.max(2,Math.round(r.series*Math.max(1,r.np||2)*40/60)+1);   // ~40 s por movimiento por ronda
  }
  const n=parseInt(e.series)||3, des=cdDescanso(e);
  if(esEjRondas(e)){ const r=rondasRx(e,s), w=r.u==='seg'?r.base:r.u==='m'?Math.max(20,r.base*0.8):r.base*3; return Math.round((r.series*(w+(des||60))+CD_TRANSICION)/60); }
  if(esEjIsometrico(e)){ const w=segMetaIso(e)*(ladoIso(e)?2:1); return Math.round((n*(w+(des||45))+CD_TRANSICION)/60); }
  let seg=CD_TRANSICION;
  for(let j=0;j<n;j++) seg+=cdSegSerie(e,cdRepsSerie(e,j))+(j<n-1?des:0);
  return Math.round(seg/60);
}
function minutosDia(d,s){
  const ejs=(d&&d.ejercicios)||[]; if(!ejs.length) return 0;
  const m=ejs.reduce((a,e)=>a+minutosEjercicio(e,d,s),0);
  return Math.max(10,Math.round(m/5)*5);
}
// Carga del día: series de fuerza pesan más con menos repeticiones (más % del 1RM) y en compuestos;
// EMOM, circuitos y cardio suman por minuto; movilidad y estiramiento no cuentan.
function cargaEjercicio(e,d,s){
  s=s||cdSocio();
  if(esEjMovilidad(e)) return 0;
  if(e.metodo&&e.metodo.id==='emom') return (parseInt(e.series)||10)*0.8;
  if(esEjCardio(e)) return cardioRx(e,s).total*0.08;
  if(esEjRondas(e)) return rondasRx(e,s).series*1.1;
  const n=parseInt(e.series)||3;
  if(esEjIsometrico(e)) return n*0.5;
  if(e.potencia) return n*1.1;   // explosivo con carga ligera: pocas reps pero no es una serie pesada
  const comp=(datosEj(e).tipo==='c')?1.25:1, rir=e.rir!=null?+e.rir:2;
  let c=0;
  for(let j=0;j<n;j++){ const pct=pctPorReps(cdRepsSerie(e,j),rir); c+=1+Math.max(0,pct-0.6)*4; }   // 12 reps ≈ 1.3 · 5 reps ≈ 1.8 por serie
  return c*comp;
}
function cargaDia(d,s){ return ((d&&d.ejercicios)||[]).reduce((a,e)=>a+cargaEjercicio(e,d,s),0); }

const CD_SUFIJO=/\s*·\s*D[ií]a (pesado|medio|ligero)\s*$/i;
// Reescribe "· Día pesado / medio / ligero" de cada día con la carga real comparada con la semana.
// Solo toca los días que ya llevan esa etiqueta (el nombre que puso el entrenador no se cambia).
function etiquetarCargaSemana(rutina,s){
  const dias=Array.isArray(rutina)?rutina:Object.values(rutina||{});
  const ent=dias.filter(d=>d&&Array.isArray(d.ejercicios)&&d.ejercicios.length);
  const cargas=ent.map(d=>cargaDia(d,s)), con=cargas.filter(x=>x>0);
  if(con.length<2) return false;
  const prom=con.reduce((a,b)=>a+b,0)/con.length;
  let cambio=false;
  ent.forEach((d,i)=>{
    if(!CD_SUFIJO.test(String(d.tipo||''))) return;
    const r=cargas[i]/prom, et=r>=1.12?'Día pesado':r<=0.85?'Día ligero':'Día medio';
    const nuevo=String(d.tipo).replace(CD_SUFIJO,'')+' · '+et;
    if(nuevo!==d.tipo){ d.tipo=nuevo; cambio=true; }
  });
  return cambio;
}
