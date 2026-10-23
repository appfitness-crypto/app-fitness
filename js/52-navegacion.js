/* ═══ botón Atrás del celular y vista al recargar ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   La app es una sola página: sin esto, el botón Atrás de Android cerraba la app desde cualquier pantalla.
   Se deja una entrada extra en el historial; cada Atrás la consume, la app retrocede un paso
   (cierra la ventana abierta, vuelve a la pantalla anterior o a la primera pestaña) y la vuelve a poner.
   En la pantalla principal pide un segundo Atrás para salir.
   También recuerda la pestaña y el socio abiertos para volver a ellos al recargar (sessionStorage). ═══ */

// ── Vista actual (sobrevive a recargar, no a cerrar la app) ──
const NAV_LS='fp_vista';
function navVistaGuardada(){ try{ return JSON.parse(sessionStorage.getItem(NAV_LS))||{}; }catch(e){ return {}; } }
function navGuardarVista(cambio){ try{ sessionStorage.setItem(NAV_LS,JSON.stringify(Object.assign(navVistaGuardada(),cambio))); }catch(e){} }
// Staff: vuelve a abrir la ficha y la pestaña en la que estaba
function navRestaurarStaff(){
  const v=navVistaGuardada();
  if(!v.socio || !getSocio(v.socio)) return;
  if(v.stab){ staffTabCode=v.socio; staffTab=v.stab; }
  staffOpenSocio(v.socio);
}
// Se guarda al cambiar de pestaña o de socio (envolviendo las funciones que ya existen)
[['dashTab',a=>navGuardarVista({tab:a[0]})],
 ['staffOpenSocio',a=>navGuardarVista({socio:a[0]})],
 ['staffSetTab',a=>navGuardarVista({stab:a[0]})],
 ['staffVolverLista',()=>navGuardarVista({socio:null,stab:null})],
 ['staffLogout',()=>navGuardarVista({socio:null,stab:null,tab:null})],
 ['logoutSocio',()=>navGuardarVista({tab:null})],
].forEach(([n,guardar])=>{
  const f=window[n]; if(typeof f!=='function') return;
  window[n]=function(){ const r=f.apply(this,arguments); guardar(arguments); return r; };
});

// ── Botón Atrás ──
// Ventanas que necesitan su propia función para cerrarse bien (las demás se cierran tocando el fondo o quitando .open)
const NAV_CERRAR={'modal-ej':()=>closeModal(),'modal-uic':()=>uiNo(),'modal-menu-staff':()=>maCerrar()};
function navCerrarVentana(){
  const dlg=[...document.querySelectorAll('dialog[open]')].pop();
  if(dlg){ if(dlg.id==='en-ficha') cerrarFicha(); else dlg.close(); return true; }
  if(document.querySelector('#c3d.on')){ cerrarMiCuerpo(); return true; }
  const m=[...document.querySelectorAll('.modal.open')].pop();
  if(m){
    if(NAV_CERRAR[m.id]) NAV_CERRAR[m.id]();
    else if((m.getAttribute('onclick')||'').includes('event.target===this')) m.click();   // respeta las que no se dejan cerrar (aviso de privacidad pendiente)
    else m.classList.remove('open');
    return true;
  }
  if(typeof rtSel!=='undefined' && rtSel && document.querySelector('.rt-ed.on')){ rtCerrar(); return true; }
  return false;
}
function navPantalla(){ const s=document.querySelector('.sc.on'); return s?s.id:''; }
// Un paso atrás. Devuelve false si ya está en una pantalla principal.
function navAtras(){
  if(navCerrarVentana()) return true;
  switch(navPantalla()){
    case 's-ses': sesSalir(); return true;           // lo registrado de la sesión se conserva
    case 's-det': ddVolver(); return true;
    case 's-fin': finListo(); return true;
    case 's-quiz': quizBack(); return true;
    case 's-preview': go('s-quiz'); return true;
    case 's-login': case 's-registro': case 's-fbsetup': go('s-inicio'); return true;
    case 's-dash': if(typeof tabActiva==='function' && tabActiva()!=='inicio'){ dashTab('inicio'); return true; } return false;
    case 's-panel': {
      const p=document.getElementById('s-panel');
      if(p && p.getAttribute('data-vista')==='detalle'){ staffVolverLista(); return true; }
      return false;
    }
  }
  return false;
}
(function(){
  let ultimo=0;
  const armar=()=>{ try{ history.pushState({fpNav:1},''); }catch(e){} };
  try{ if(!history.state || !history.state.fpNav){ history.replaceState({fpNav:0},''); armar(); } }catch(e){}
  window.addEventListener('popstate',()=>{
    if(navAtras()){ armar(); return; }
    if(Date.now()-ultimo<2000){ history.back(); return; }   // segundo Atrás seguido: sale de la app
    ultimo=Date.now();
    showToast('Presiona atrás otra vez para salir');
    armar();
  });
})();
