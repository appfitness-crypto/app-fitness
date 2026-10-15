/* ═══ mover una sesión a otro día ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   El socio que no puede venir el día que le toca (ej. jueves) puede hacer esa sesión otro día de la misma
   semana (ej. viernes). La sesión se guarda como la del jueves (diaKey 'jue') con la fecha real en que se hizo,
   así el jueves queda como hecho en su semana y su progreso, pesos y racha cuentan igual.
   Los cambios se guardan por semana en s.movimientos = {'<lunes ISO>': {jue:{a:'vie', motivo, fecha}}}. ═══ */

const MOV_MOTIVOS=[['compromiso','Tengo un compromiso'],['trabajo','Trabajo o escuela'],['salud','Salud o cansancio'],['viaje','Viaje'],['otro','Otro motivo']];
function movSemanaKey(){ return fechaISO(inicioSemana(new Date())); }
function movSemana(s){ return ((s&&s.movimientos)||{})[movSemanaKey()]||{}; }
function movDiaTieneRutina(s,k){ const d=s&&s.rutina&&s.rutina[k]; return !!(d&&d.ejercicios&&d.ejercicios.length); }
// A qué día se movió la sesión de k (o null) · qué sesiones se movieron a k
function movidaDe(s,k){ const m=movSemana(s)[k]; return m&&m.a?m.a:null; }
function movidasA(s,k){ const M=movSemana(s); return Object.keys(M).filter(src=>M[src]&&M[src].a===k&&movDiaTieneRutina(s,src)); }
function movTxtDia(k){ const i=DIAS_ORDER.indexOf(k); return i>=0?EN_DIAS[i]:k; }
// Sesiones de la rutina que se pueden hacer hoy: la del día, las movidas a hoy y las pendientes de días pasados de esta semana
function movPendientesPasados(s){
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY), sem=sesionesSemana(s);
  return DIAS_ORDER.filter((k,i)=>i<hoyI && movDiaTieneRutina(s,k) && !sem[i] && !movidaDe(s,k));
}

// ── Flujo: elegir día destino → motivo → guardar (y empezar si es hoy) ──
function moverSesion(k,destino){
  const s=activeSocio; if(!s || !movDiaTieneRutina(s,k)) return;
  actualizarHoy();
  if(sesionesSemana(s)[DIAS_ORDER.indexOf(k)]){ showToast('Esa sesión ya la hiciste esta semana'); return; }
  const tipo=sc(s.rutina[k].tipo||'tu sesión');
  if(destino===k){   // la vuelve a su propio día y la empieza
    const M=s.movimientos&&s.movimientos[movSemanaKey()]; if(M&&M[k]){ delete M[k]; dbSave(s.code); }
    if(k===HOY_KEY) iniciarSesion(k); else movRefrescar();
    return;
  }
  if(destino) return movPedirMotivo(s,k,destino);
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY), fechas=fechasSemana();
  const ops=DIAS_ORDER.map((d,i)=>({d,i})).filter(({d,i})=>i>=hoyI && d!==k).map(({d,i})=>{
    const propia=movDiaTieneRutina(s,d) && !movidaDe(s,d), otras=movidasA(s,d).filter(x=>x!==k);
    const sub=d===HOY_KEY?'Hoy':(propia?'Ese día ya tienes '+sc(s.rutina[d].tipo):'Día de descanso')+(otras.length?' · ya tiene otra sesión movida':'');
    return {value:d, label:(d===HOY_KEY?'Hoy, ':'')+movTxtDia(d)+' '+fechas[i], sub};
  });
  if(!ops.length){ showToast('Ya no quedan días esta semana para moverla'); return; }
  uiOpciones('¿A qué día mueves '+tipo+' del '+movTxtDia(k)+'?', ops, d=>movPedirMotivo(s,k,d));
}
function movPedirMotivo(s,k,destino){
  uiOpciones('¿Por qué la mueves? Ayuda a tu entrenador a entender tu semana.', MOV_MOTIVOS.map(([v,l])=>({value:v,label:l})), motivo=>movGuardar(s,k,destino,motivo));
}
function movGuardar(s,k,destino,motivo){
  const sk=movSemanaKey();
  const prev=s.movimientos||{}, M={};
  if(prev[sk]) M[sk]=Object.assign({},prev[sk]);   // solo se conserva la semana actual: lo anterior ya quedó en las sesiones
  M[sk]=M[sk]||{};
  M[sk][k]={a:destino, motivo:motivo||'otro', fecha:fechaISO(new Date())};
  s.movimientos=M;
  dbSave(s.code);
  const tipo=sc(s.rutina[k].tipo||'tu sesión');
  if(destino===HOY_KEY){
    showToast(tipo+' del '+movTxtDia(k)+' queda para hoy');
    iniciarSesion(k);
  } else {
    showToast(tipo+' del '+movTxtDia(k)+' se movió al '+movTxtDia(destino));
    movRefrescar();
  }
}
function movDeshacer(k){
  const s=activeSocio; if(!s) return;
  const sk=movSemanaKey(), M=s.movimientos&&s.movimientos[sk];
  if(!M||!M[k]) return;
  delete M[k]; if(!Object.keys(M).length) delete s.movimientos[sk];
  dbSave(s.code); showToast('La sesión volvió a su día'); movRefrescar();
}
function movRefrescar(){
  if(document.getElementById('s-det')&&document.getElementById('s-det').classList.contains('on')){ go('s-dash'); }
  refreshDash();
  if(typeof renderRutinaTab==='function' && document.getElementById('dsec-rutina')) renderRutinaTab();
}
const MOV_MOTIVO_TXT=Object.fromEntries(MOV_MOTIVOS);
function movEtiqueta(x){ return x&&x.movida&&x.movida.de ? 'Sesión del '+movTxtDia(x.movida.de)+(x.movida.a?', hecha el '+movTxtDia(x.movida.a):'') : ''; }
