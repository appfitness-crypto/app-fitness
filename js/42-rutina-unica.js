/* ═══ rutina única dentro del gimnasio ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Dos socios con el mismo objetivo y nivel no deben terminar con la misma rutina.
   · Cada socio activo deja una HUELLA anónima en /huellas/<code>: su segmento (objetivo|nivel) y un código corto
     por ejercicio. No lleva nombre, datos de salud ni nada que identifique al socio.
   · Al armar un plan (registro, "Rehacer con mi método", aprobación del staff) se compara con las huellas del mismo
     segmento; si comparte 70 % o más de los ejercicios con otro socio, se cambian accesorios por otros del mismo
     músculo hasta bajar de ese límite. Nunca se tocan los ejercicios principales del día ni se usa algo
     contraindicado para el socio. ═══ */

const UNICA_LIMITE=0.7;
function huellaEj(nm){ let h=2166136261; for(const c of kbNorm(nm)) h=Math.imul(h^c.charCodeAt(0),16777619); return ((h>>>0)%46656).toString(36).padStart(3,'0'); }
function unicaDias(rut){ return Array.isArray(rut)?rut:DIAS_ORDER.map(k=>rut&&rut[k]).filter(Boolean); }
function unicaCuenta(e){ return !!(e && (e.nm||e.nombre) && !e.fase && !esEjMovilidad(e) && !esEjCardio(e) && !esEjRondas(e)); }
function huellaRutina(rut){
  const s=new Set(); unicaDias(rut).forEach(d=>comoArray(d.ejercicios).forEach(e=>{ if(unicaCuenta(e)) s.add(huellaEj(e.nm||e.nombre)); }));
  return [...s].sort().join('');
}
function huellaSet(h){ const out=new Set(); for(let i=0;i+3<=String(h||'').length;i+=3) out.add(h.slice(i,i+3)); return out; }
function huellaSimilitud(A,B){ if(!A.size||!B.size) return 0; let n=0; A.forEach(x=>{ if(B.has(x)) n++; }); return n/(A.size+B.size-n); }
function unicaSegmento(objetivo,nivel){ return String(objetivo||'')+'|'+nivelNum(nivel); }

// Huellas del mismo segmento: el staff las tiene en el índice; los demás las leen de /huellas (best effort, con tope de tiempo)
function huellasSegmento(seg,excluir){
  const desdeIdx=()=>Object.entries(typeof IDX!=='undefined'?IDX:{}).filter(([c,x])=>c!==excluir && x && x.k===seg && x.h && x.st==='activo').map(([c,x])=>({code:c,h:x.h}));
  const local=desdeIdx();
  if(!(typeof fbListo!=='undefined' && fbListo && fbDB)) return Promise.resolve(local);
  const remoto=fbDB.ref('/huellas').orderByChild('k').equalTo(seg).limitToLast(400).once('value')
    .then(snap=>{ const v=snap.val()||{}; const m=new Map(local.map(x=>[x.code,x])); Object.keys(v).forEach(c=>{ if(c!==excluir && v[c] && v[c].h) m.set(c,{code:c,h:v[c].h}); }); return [...m.values()]; })
    .catch(()=>local);
  return Promise.race([remoto, new Promise(r=>setTimeout(()=>r(local),2500))]);
}
function huellaEscribir(code,s){
  if(!(typeof fbListo!=='undefined' && fbListo && fbDB) || !code) return;
  const v=(s && s.status==='activo' && s.rutina)?{k:unicaSegmento(s.objetivo,s.nivel), h:huellaRutina(s.rutina), u:Date.now()}:null;
  fbDB.ref('/huellas/'+code).set(v).catch(()=>{});
}

// Cambia accesorios compartidos hasta quedar por debajo del límite con cada huella del segmento
function rutinaUnicaAjustar(rut,ctx,otras){
  const cambios=[]; if(!ctx || ctx.sinMetodos || ctx.soloSuaves || !(otras&&otras.length)) return cambios;
  const dias=unicaDias(rut).filter(d=>d&&Array.isArray(d.ejercicios));
  const rnd=prng('unica|'+huellaRutina(rut));
  const otrasS=otras.map(o=>({code:o.code, S:huellaSet(o.h)}));
  for(let vuelta=0; vuelta<4; vuelta++){
    const mia=huellaSet(huellaRutina(dias));
    const peor=otrasS.map(o=>({o, j:huellaSimilitud(mia,o.S)})).filter(x=>x.j>=UNICA_LIMITE).sort((a,b)=>b.j-a.j)[0];
    if(!peor) break;
    // Candidatos: compartidos con ese socio, que no sean principales del día; aislamiento primero
    const cand=[];
    dias.forEach(d=>{ const pr=principalesDia(d,ctx); d.ejercicios.forEach((e,i)=>{
      if(!unicaCuenta(e) || pr.has(i) || e.potencia || !peor.o.S.has(huellaEj(e.nm||e.nombre))) return;
      const kb=kbBuscar(e.nm||e.nombre); if(!kb) return;
      cand.push({d,e,kb}); }); });
    cand.sort((a,b)=>(a.kb.t==='a'?0:1)-(b.kb.t==='a'?0:1));
    let hechos=0;
    for(const c of cand){
      if(hechos>=3) break;
      const usados=huellaSet(huellaRutina(dias));
      const ops=KB_EJERCICIOS.filter(x=>x.enf===c.kb.enf && x.id!==c.kb.id && !x.rondas && !x._custom && (x.nv||1)<=ctx.nivel && !!x.iso===!!c.kb.iso
        && !usados.has(huellaEj(x.nm)) && !peor.o.S.has(huellaEj(x.nm))
        && !ejContraindicado({nm:x.nm},ctx) && !(ctx.evitaNm||[]).some(n=>kbNorm(x.nm).includes(n)));
      if(!ops.length) continue;
      const pts=x=>(x.t===c.kb.t?4:0)+(['maquina','polea'].includes(x.z)===['maquina','polea'].includes(c.kb.z)?2:0)+rnd();
      const x=ops.sort((a,b)=>pts(b)-pts(a))[0];
      const antes=c.e.nm||c.e.nombre;
      const keep={series:c.e.series, reps:c.e.reps, esfuerzo:c.e.esfuerzo, rir:c.e.rir, descanso:c.e.descanso};
      aplicarEjCatalogo(c.e,x);
      Object.keys(keep).forEach(k=>{ if(keep[k]!==undefined) c.e[k]=keep[k]; });
      try{ c.e.alternativas=alternativasPara(c.e,ctx,datosEj(c.e)); }catch(_){}
      cambios.push({antes, despues:x.nm}); hechos++;
    }
    if(!hechos) break;
  }
  return cambios;
}
function unicaCtxSocio(s){
  const ent=entRutina(s.entrenadorId);
  return ctxDesdePerfil({nivel:s.nivel,objetivo:s.objetivo,limitaciones:s.limitaciones,edad:s.edad,peso:s.peso,estatura:s.estatura}, ent&&ent.filosofia);
}
// Staff: aplica la regla a un socio y avisa qué cambió (no guarda; quien llama guarda)
function rutinaUnicaSocio(s){
  if(!s || !s.rutina) return Promise.resolve([]);
  return huellasSegmento(unicaSegmento(s.objetivo,s.nivel), s.code).then(l=>rutinaUnicaAjustar(s.rutina, unicaCtxSocio(s), l));
}
function unicaAviso(c){ return c&&c.length ? 'Para no repetir la rutina de otro socio con su mismo perfil se cambió: '+c.map(x=>x.antes+' → '+x.despues).join(', ')+'.' : ''; }
