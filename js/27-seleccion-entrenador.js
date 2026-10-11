/* ═══ seleccion entrenador ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// SELECCIÓN DE ENTRENADOR EN EL REGISTRO DEL SOCIO
// ═════════════════════════════════════════
window._trainerReturnFn = null;
window._trainerPrevScreen = 'qq11';
function qNextToTrainer(returnFn, prevScreenId){
  window._trainerReturnFn = returnFn;
  window._trainerPrevScreen = prevScreenId||'qq11';
  renderTrainerPicker();
  mostrarSub('qqT');
}
function qTrainerBack(){ mostrarSub(window._trainerPrevScreen); }
// Último paso: código del entrenador (opcional). Sin código, la app arma el plan con la filosofía del sistema.
let qtModo='', qtValidado=null;
function qtReiniciar(){ qtModo=''; qtValidado=null; const c=document.getElementById('qt-codigo'); if(c) c.value=''; const r=document.getElementById('qt-codigo-res'); if(r) r.textContent=''; }
function renderTrainerPicker(){
  ['qt-sin','qt-con'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.toggle('sel', id==='qt-'+qtModo); });
  const w=document.getElementById('qt-codigo-wrap'); if(w) w.style.display = qtModo==='con' ? 'block' : 'none';
  const b=document.getElementById('qbT'); if(b) b.disabled = !(qtModo==='sin' || (qtModo==='con' && qtValidado));
}
function qtElegir(modo){
  qtModo=modo;
  if(modo==='sin'){ qAnswers.entrenadorId=''; qAnswers.entrenadorNombre=''; }
  else if(qtValidado){ qAnswers.entrenadorId=qtValidado.id; qAnswers.entrenadorNombre=qtValidado.nombre; }
  renderTrainerPicker();
  if(modo==='con') setTimeout(()=>document.getElementById('qt-codigo')?.focus(),100);
}
function qtCodigoCambio(){
  qtValidado=null; qAnswers.entrenadorId=''; qAnswers.entrenadorNombre='';
  document.getElementById('qt-codigo-res').textContent='';
  renderTrainerPicker();
}
async function qtValidarCodigo(){
  const res=document.getElementById('qt-codigo-res');
  const v=document.getElementById('qt-codigo').value;
  if(!navigator.onLine || !fbListo){ res.style.color='var(--r)'; res.textContent='Necesitas internet para validar el código.'; return; }
  res.style.color='var(--mu)'; res.textContent='Buscando…';
  try{
    const ent=await entPorCodigo(v);
    if(!ent){ res.style.color='var(--r)'; res.textContent='No encontramos ese código. Revísalo con tu entrenador.'; return; }
    qtValidado=ent; qAnswers.entrenadorId=ent.id; qAnswers.entrenadorNombre=ent.nombre;
    res.style.color='var(--v)';
    res.textContent='✓ Entrenarás con '+ent.nombre+(ent.filosofia&&ent.filosofia.tagline?' — "'+ent.filosofia.tagline+'"':'');
    renderTrainerPicker();
  }catch(e){ res.style.color='var(--r)'; res.textContent=cuentaMsgError(e); }
}
function qConfirmTrainerAndGenerate(){
  if(window._trainerReturnFn) window._trainerReturnFn();
}

window.showToast=function showToast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block';
  clearTimeout(window._toastT);
  window._toastT=setTimeout(()=>t.style.display='none',2800);
}
