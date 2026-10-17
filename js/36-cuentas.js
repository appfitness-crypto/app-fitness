/* ═══ CUENTAS: cliente y entrenador (Firebase Authentication con correo) ═══
   Dos formas de usar la app:
   · Cliente directo: crea su cuenta, responde la evaluación y el sistema le arma y lleva su plan
     (con la filosofía del director). Si tiene el código de un entrenador, ese entrenador lo administra.
   · Entrenador: crea su cuenta, recibe un código (p. ej. ENT-4K7Q) y se lo da a sus clientes.
     Ve y edita solo a los clientes que entraron con su código.
   Datos:
     /socios/<uid>        expediente del cliente (la llave es su uid de Firebase)
     /roles/<uid>         "entrenador" (se lo pone él mismo al registrarse) o "coordinador" (director: solo desde la consola)
     /entrenadores/<uid>  perfil público del entrenador (nombre, filosofía, código)
     /codigos/<CÓDIGO>    uid del entrenador dueño de ese código ═══ */

const COD_LETRAS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sin 0/O ni 1/I para que no se confundan al dictarlo
const COD_PREF='ENT-';
let cuentaTipo='cliente';

function cuentaUid(){ const u=fbAuth&&fbAuth.currentUser; return (u && !u.isAnonymous) ? u.uid : null; }
function codNormalizar(t){
  let c=String(t||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(c.indexOf('ENT')===0) c=c.slice(3);
  return c ? COD_PREF+c : '';
}
function codAzar(){ let s=''; for(let i=0;i<4;i++) s+=COD_LETRAS[Math.floor(Math.random()*COD_LETRAS.length)]; return COD_PREF+s; }
function cuentaErr(id,txt){ const e=document.getElementById(id); if(!e) return; e.textContent=txt; e.style.display=txt?'block':'none'; }
function cuentaMsgError(e){
  const c=String(e&&(e.code||e.message)||'');
  if(c.includes('email-already-in-use')||c.includes('credential-already-in-use')) return 'Ese correo ya tiene cuenta. Usa "Ya tengo cuenta" para entrar.';
  if(c.includes('invalid-email')) return 'Revisa el correo: no parece válido.';
  if(c.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if(c.includes('wrong-password')||c.includes('user-not-found')||c.includes('invalid-credential')||c.includes('invalid-login')) return 'Correo o contraseña incorrectos.';
  if(c.includes('too-many')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if(c.includes('network')) return 'Sin conexión. Revisa tu internet.';
  if(c.includes('permission')) return 'Firebase rechazó el registro. Revisa que las reglas nuevas (firebase-rules.json) estén publicadas.';
  return 'No se pudo completar: '+(e&&e.message||e);
}
function cuentaSinFirebase(errId){
  if(fbListo && fbAuth && navigator.onLine) return false;
  cuentaErr(errId,'Necesitas conexión a internet para crear tu cuenta o entrar.');
  return true;
}

// ── Pantalla de registro (la misma para cliente y entrenador) ──
function abrirRegistro(tipo){
  cuentaTipo = tipo==='entrenador' ? 'entrenador' : 'cliente';
  const ent = cuentaTipo==='entrenador';
  document.getElementById('reg-tag').textContent = ent ? 'Soy entrenador' : 'Soy nuevo';
  document.getElementById('reg-title').innerHTML = ent ? 'Crea tu cuenta<br>de entrenador' : 'Crea tu<br>cuenta';
  document.getElementById('reg-sub').textContent = ent
    ? 'Recibirás un código para tus clientes. Tú defines tu filosofía y las rutinas salen con tu estilo.'
    : 'Después respondes tu evaluación y la app arma tu plan.';
  document.getElementById('reg-btn').textContent = ent ? 'Crear cuenta de entrenador' : 'Crear cuenta y empezar';
  document.getElementById('reg-cambiar').innerHTML = ent
    ? '¿Eres cliente? <u>Crea tu cuenta de cliente</u>'
    : '¿Eres entrenador? <u>Regístrate como entrenador</u>';
  cuentaErr('reg-err','');
  go('s-registro');
}
function registroCambiarTipo(){ abrirRegistro(cuentaTipo==='entrenador'?'cliente':'entrenador'); }

async function crearCuenta(){
  const nombre=limpiarTexto(document.getElementById('reg-nombre').value);
  const correo=document.getElementById('reg-correo').value.trim().toLowerCase();
  const pass=document.getElementById('reg-pass').value;
  if(!nombre || nombre.length<2){ cuentaErr('reg-err','Escribe tu nombre.'); return; }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ cuentaErr('reg-err','Revisa el correo: no parece válido.'); return; }
  if(pass.length<6){ cuentaErr('reg-err','La contraseña debe tener al menos 6 caracteres.'); return; }
  if(cuentaSinFirebase('reg-err')) return;
  cuentaErr('reg-err','');
  const btn=document.getElementById('reg-btn'); btn.disabled=true;
  try{
    await fbConUsuario(6000);
    let user;
    const cur=fbAuth.currentUser;
    if(cur && cur.isAnonymous){
      // Se convierte la sesión anónima en cuenta (conserva el mismo uid)
      const cred=firebase.auth.EmailAuthProvider.credential(correo, pass);
      user=(await cur.linkWithCredential(cred)).user;
    } else {
      user=(await fbAuth.createUserWithEmailAndPassword(correo, pass)).user;
    }
    try{ await user.updateProfile({displayName:nombre}); }catch(e){}
    fbUid=user.uid;
    document.getElementById('reg-pass').value='';
    if(cuentaTipo==='entrenador'){
      const ent=await entRegistrarPerfil(user.uid, nombre);
      await fbCargarRol(user);
      guardarSesion({tipo:'staff', user:user.uid});
      fbEscucharStaff();
      entrarComoStaff(user.uid, fbRolDB||'entrenador');
      setTimeout(()=>mostrarMiCodigo(ent.codigo, true), 400);
    } else {
      await fbCargarRol(user);
      guardarSesion({tipo:'cuenta', uid:user.uid});
      empezarPlanCliente(nombre);
    }
  }catch(e){
    console.warn('crearCuenta',e);
    cuentaErr('reg-err', cuentaMsgError(e));
  }finally{ btn.disabled=false; }
}

// ── Alta del perfil del entrenador: rol → código único → perfil ──
async function entRegistrarPerfil(uid, nombre, extra){
  await fbDB.ref('/roles/'+uid).set('entrenador');
  const codigo=await entReservarCodigo(uid);
  const ent=Object.assign({ id:uid, uid, rol:'entrenador', nombre, especialidades:[], funciones:['entrenamiento'],
    filosofia:null, codigo, creado:fechaISO(new Date()) }, extra||{});
  DB.entrenadores[uid]=ent;
  guardarLocal();
  await fbDB.ref('/entrenadores/'+uid).set(limpio(ent));
  return ent;
}
async function entReservarCodigo(uid){
  for(let i=0;i<12;i++){
    const c=codAzar();
    const res=await fbDB.ref('/codigos/'+c).transaction(cur=> cur===null ? uid : undefined);
    if(res && res.committed) return c;
  }
  throw new Error('No se pudo generar un código libre. Inténtalo de nuevo.');
}
// Busca a qué entrenador pertenece un código (null si no existe)
async function entPorCodigo(texto){
  const c=codNormalizar(texto); if(!c || c.length<COD_PREF.length+4) return null;
  if(!fbListo || !fbDB) return null;
  await fbConUsuario(6000);
  const sn=await fbDB.ref('/codigos/'+c).once('value');
  const uid=sn.val(); if(!uid) return null;
  let ent=DB.entrenadores[uid];
  if(!ent){ const e=await fbDB.ref('/entrenadores/'+uid).once('value'); ent=e.val(); if(ent){ DB.entrenadores[uid]=ent; guardarLocal(); } }
  return (ent && ent.rol!=='coordinador') ? Object.assign({id:uid}, ent) : null;
}

// ── Entrar (cliente o entrenador, mismo formulario) ──
async function doEntrar(){
  let correo=document.getElementById('in-correo').value.trim().toLowerCase();
  const pass=document.getElementById('in-pass').value;
  if(!correo || !pass){ cuentaErr('in-err','Escribe tu correo y tu contraseña.'); return; }
  if(correo.indexOf('@')<0) correo=correo.replace(/[^a-z0-9_]/g,'')+STAFF_DOM;   // cuentas antiguas creadas por el director (solo usuario)
  if(cuentaSinFirebase('in-err')) return;
  cuentaErr('in-err','');
  const btn=document.getElementById('in-btn'); btn.disabled=true;
  try{
    const cur=fbAuth.currentUser;
    if(cur && !cur.isAnonymous && cur.email!==correo) await fbAuth.signOut();
    const cred=await fbAuth.signInWithEmailAndPassword(correo, pass);
    document.getElementById('in-pass').value='';
    await entrarConCuenta(cred.user);
  }catch(e){
    console.warn('doEntrar',e);
    cuentaErr('in-err', cuentaMsgError(e));
  }finally{ btn.disabled=false; }
}
// Decide a dónde va una cuenta ya autenticada: panel (entrenador/director), su plan, o la evaluación
async function entrarConCuenta(user){
  fbUid=user.uid;
  const rol=await fbCargarRol(user);
  if(rol){
    guardarSesion({tipo:'staff', user:user.uid});
    fbEscuchar();
    fbEscucharStaff();
    entrarComoStaff(user.uid, rol);
    return;
  }
  let socio=null;
  try{
    const sn=await fbDB.ref('/socios/'+user.uid).once('value');
    const v=sn.val();
    if(v){
      asegurarLogs(v);
      const code=user.uid, previo=DB.socios[code];
      DB.socios[code]=(previo && tienePendiente(code)) ? fusionarSocio(code,previo,v) : v;
      if(!tienePendiente(code)){ BASE[code]=baseDeSocio(v); baseGuardar(); }
      guardarLocal();
      socio=DB.socios[code];
    } else if(tienePendiente(user.uid)) socio=DB.socios[user.uid];
    else if(DB.socios[user.uid] && !BASE[user.uid]){ socio=DB.socios[user.uid]; dbSave(user.uid); }   // plan creado aquí que Firebase aún no aceptó: se reintenta
  }catch(e){ console.warn('Sin expediente',e); socio=getSocio(user.uid); }
  if(socio){ abrirPlanSocio(socio); return; }
  guardarSesion({tipo:'cuenta', uid:user.uid});
  empezarPlanCliente(user.displayName||'');
}
// Cuenta de cliente sin plan todavía: arranca la evaluación con su nombre ya puesto
function empezarPlanCliente(nombre){
  if(nombre){ qAnswers.nombre=nombre; const i=document.getElementById('qi-nom'); if(i){ i.value=nombre; i.dispatchEvent(new Event('input')); } }
  startQuiz();
}
// Abre el plan del cliente (lo que antes hacía el código de 4 dígitos)
function abrirPlanSocio(socio){
  if(membBloqueoSocio(socio)){ showToast(MEMB_MSG_INACTIVO); return; }
  const code=socio.code;
  activeSocio=socio;
  guardarSesion({tipo:'socio', code});
  fbEscucharSocio(code);
  const { registro, yaRegistrado } = registrarAsistencia(socio);
  socio._asistHoy=registro;
  socio._yaRegistrado=yaRegistrado;
  refreshDash();
  dashTab('inicio');
  go('s-dash');
}

async function recuperarPass(){
  const correo=document.getElementById('in-correo').value.trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ cuentaErr('in-err','Escribe arriba tu correo y vuelve a tocar "Olvidé mi contraseña".'); return; }
  if(cuentaSinFirebase('in-err')) return;
  try{ await fbAuth.sendPasswordResetEmail(correo); showToast('📧 Te enviamos un correo para cambiar tu contraseña'); cuentaErr('in-err',''); }
  catch(e){ cuentaErr('in-err', cuentaMsgError(e)); }
}

// Cierra la sesión de Firebase (la app vuelve a la sesión anónima para el siguiente uso)
function cuentaSalir(){ try{ if(fbAuth && fbAuth.currentUser && !fbAuth.currentUser.isAnonymous) fbAuth.signOut(); }catch(e){} }

// ── Código del entrenador ──
function miCodigoEntrenador(){ const e=staffActivoEntId && DB.entrenadores[staffActivoEntId]; return (e && e.codigo) || ''; }
function mostrarMiCodigo(codigo, bienvenida){
  codigo=codigo||miCodigoEntrenador();
  if(!codigo){ showToast('Aún no tienes código. Cierra sesión y vuelve a entrar.'); return; }
  const msg=(bienvenida?'<p style="margin:0 0 10px">¡Listo! Ya tienes tu cuenta de entrenador.</p>':'')+
    '<div class="qr-wrap"><img id="qr-vista" class="qr-vista" alt="Tarjeta con el QR de la app y tu código '+esc(codigo)+'"></div>'+
    '<p style="margin:0 0 12px;font-size:var(--fs-xs);color:var(--mu)">Tu cliente escanea el QR, crea su cuenta y escribe tu código al final de su evaluación. Su plan sale con tu filosofía y aparece en tu lista.</p>'+
    '<button type="button" class="sd-pri qr-wa" onclick="qrEnviarWhatsApp(\''+esc(codigo)+'\')">'+ico('share')+'Enviar QR por WhatsApp</button>'+
    '<div class="qr-acts">'+
      '<button type="button" class="tb-btn" onclick="qrDescargar(\''+esc(codigo)+'\')">'+ico('download')+'Descargar imagen</button>'+
      '<button type="button" class="tb-btn" onclick="copiarTexto(\''+esc(codigo)+'\')">Copiar código</button>'+
      (bienvenida?'<button type="button" class="tb-btn" onclick="staffMenuCerrar();abrirMiFilosofia()">Definir mi filosofía</button>':'')+
    '</div>';
  document.getElementById('staff-menu-title').textContent='Tu código';
  document.getElementById('staff-menu-body').innerHTML=msg;
  document.getElementById('modal-staff-menu').classList.add('open');
  qrPintarVista(codigo);
}
function copiarTexto(t){
  try{ navigator.clipboard.writeText(t).then(()=>showToast('Copiado: '+t)); }
  catch(e){ showToast(t); }
}

// ── El cliente en su perfil: unirse a un entrenador con su código ──
async function vincularEntrenador(){
  const s=activeSocio; if(!s) return;
  uiEntrada('Escribe el código que te dio tu entrenador','ENT-XXXX','Unirme',async v=>{
    try{
      const ent=await entPorCodigo(v);
      if(!ent){ showToast('No encontramos ese código. Revísalo con tu entrenador.'); return; }
      s.entrenadorId=ent.id; s.asignado=ent.nombre;
      dbSave(s.code);
      showToast('✓ Ahora entrenas con '+ent.nombre+'. Verá tu plan y podrá ajustarlo.');
      refreshDash();
      setTimeout(()=>ofrecerRehacerPlan(s),600);   // su rutina pasa a seguir el método del entrenador si el socio quiere
    }catch(e){ showToast(cuentaMsgError(e)); }
  });
}
// Diálogo con un campo de texto libre (usa el mismo modal de confirmar). opts: {tipo:'password', danger:true}
function uiEntrada(msg,placeholder,label,onOk,opts){
  opts=opts||{};
  document.getElementById('uic-msg').textContent=msg;
  const yes=document.getElementById('uic-yes');
  yes.textContent=label||'Aceptar'; yes.className='sd-pri'+(opts.danger?' danger':'');
  document.getElementById('uic-input-wrap').style.display='block';
  const inp=document.getElementById('uic-input'); inp.value=''; inp.placeholder=placeholder||'';
  inp.type=opts.tipo==='password'?'password':'text';
  yes.disabled=true; yes.style.opacity=.45;
  inp.oninput=()=>{ const ok=!!inp.value.trim(); yes.disabled=!ok; yes.style.opacity=ok?1:.45; };
  UIC_CB=()=>{ const v=inp.type==='password'?inp.value:inp.value.trim(); inp.value=''; inp.type='text'; onOk(v); };
  document.getElementById('modal-uic').classList.add('open');
  setTimeout(()=>inp.focus(),250);
}

// ═════════════════════════════════════════
// ELIMINAR MI CUENTA (Google Play exige poder hacerlo desde la app)
// Cliente: borra su expediente, su índice y su cuenta.
// Entrenador: borra su perfil, su código, su rol y su cuenta. Sus clientes conservan su plan
// y pasan a seguir la filosofía del plan de la app.
// ═════════════════════════════════════════
function eliminarMiCuenta(){
  if(typeof vistaSocioActiva==='function' && vistaSocioActiva()){ showToast('Desde la vista del socio no se puede eliminar su cuenta.'); return; }   // la sesión abierta es la del staff
  const u=fbAuth&&fbAuth.currentUser;
  if(!u || u.isAnonymous){ showToast('Entra a tu cuenta para eliminarla.'); return; }
  if(fbRolDB==='coordinador'){ showToast('La cuenta del director no se elimina desde la app. Quítale el rol en la consola de Firebase primero.'); return; }
  if(!navigator.onLine || !fbListo){ showToast('Necesitas conexión a internet para eliminar tu cuenta.'); return; }
  const ent=fbRolDB==='entrenador';
  const msg=ent
    ? 'Se borrarán tu cuenta de entrenador, tu filosofía y tu código. Tus clientes conservan su plan, pero ya no los verás. No se puede deshacer. Escribe ELIMINAR para continuar.'
    : 'Se borrarán tu cuenta, tu plan y todo tu historial de entrenamientos. No se puede deshacer. Escribe ELIMINAR para continuar.';
  uiPrompt(msg,'ELIMINAR',()=>{
    setTimeout(()=>uiEntrada('Por seguridad, escribe tu contraseña','Contraseña','Eliminar mi cuenta',pw=>cuentaBorrar(pw),{tipo:'password',danger:true}),300);
  },{label:'Continuar'});
}
async function cuentaBorrar(pw){
  const u=fbAuth.currentUser; if(!u || u.isAnonymous) return;
  try{ await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, pw)); }
  catch(e){ showToast(cuentaMsgError(e)); return; }
  showToast('Eliminando tu cuenta…');
  const uid=u.uid;
  try{
    if(fbRolDB==='entrenador'){
      const cod=(DB.entrenadores[uid]&&DB.entrenadores[uid].codigo) || (await fbDB.ref('/entrenadores/'+uid+'/codigo').once('value')).val();
      fbDetenerStaff();
      OUTBOX=OUTBOX.filter(x=>x.path.indexOf('/entrenadores/'+uid)!==0); outGuardar();
      await fbDB.ref('/entrenadores/'+uid).remove();     // con el rol todavía vigente
      if(cod) await fbDB.ref('/codigos/'+cod).remove();
      await fbDB.ref('/roles/'+uid).remove();            // al final: sin rol ya no podría borrar lo demás
      delete DB.entrenadores[uid];
    } else {
      fbDetenerSocio();
      const p='/socios/'+uid;
      OUTBOX=OUTBOX.filter(x=>!(x.path===p || x.path.indexOf(p+'/')===0)); outGuardar();   // que nada pendiente lo vuelva a crear
      delete DB.socios[uid]; delete BASE[uid]; baseGuardar();
      await fbDB.ref('/indice/'+uid).remove();
      await fbDB.ref(p).remove();
    }
    guardarLocal();
    await u.delete();
  }catch(e){
    console.warn('cuentaBorrar',e);
    showToast('No se pudo terminar de eliminar tu cuenta: '+cuentaMsgError(e)+' Inténtalo de nuevo.');
    return;
  }
  activeSocio=null; staffActivoId=null; staffActivoEntId=null; staffRol='entrenador';
  try{ staffLimpiarPanel(); }catch(e){}
  borrarSesion();
  go('s-inicio');
  showToast('Tu cuenta fue eliminada.');
}
