/* ═══ dialogos ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// DIÁLOGOS PROPIOS — reemplazan confirm()/prompt() nativos, que el
// navegador puede bloquear dentro de vistas empotradas (como una vista
// previa). Con estos, los botones de confirmar/eliminar funcionan igual
// en cualquier contexto.
// ═════════════════════════════════════════
let UIC_CB=null;
function uiConfirm(msg,onYes,opts){
  opts=opts||{};
  document.getElementById('uic-msg').textContent=msg;
  const yes=document.getElementById('uic-yes');
  yes.textContent=opts.label||'Confirmar'; yes.className='sd-pri'+(opts.danger?' danger':''); yes.disabled=false; yes.style.opacity=1;
  document.getElementById('uic-no').textContent=opts.cancel||'Cancelar';
  document.getElementById('uic-input-wrap').style.display='none';
  UIC_CB=onYes;
  document.getElementById('modal-uic').classList.add('open');
}
function uiPrompt(msg,expected,onYes,opts){
  opts=opts||{};
  document.getElementById('uic-msg').textContent=msg;
  const yes=document.getElementById('uic-yes');
  yes.textContent=opts.label||'Confirmar'; yes.className='sd-pri danger';
  document.getElementById('uic-no').textContent='Cancelar';
  document.getElementById('uic-input-wrap').style.display='block';
  const inp=document.getElementById('uic-input'); inp.value=''; inp.placeholder=expected; inp.type='text';
  yes.disabled=true; yes.style.opacity=.45;
  inp.oninput=()=>{ const ok=inp.value.trim()===expected; yes.disabled=!ok; yes.style.opacity=ok?1:.45; };
  UIC_CB=onYes;
  document.getElementById('modal-uic').classList.add('open');
  setTimeout(()=>inp.focus(),250);
}
function uiNo(){ document.getElementById('modal-uic').classList.remove('open'); UIC_CB=null; }
function uiYes(){ const cb=UIC_CB; if(document.getElementById('uic-yes').disabled) return; document.getElementById('modal-uic').classList.remove('open'); UIC_CB=null; if(cb) cb(); }

// Diálogo de opciones (elige una). ops: [{value,label,sub,sel}]
function uiOpciones(msg,ops,onPick){
  let m=document.getElementById('modal-uio');
  if(!m){ m=document.createElement('div'); m.className='modal'; m.id='modal-uio'; m.onclick=e=>{ if(e.target===m) m.classList.remove('open'); }; document.body.appendChild(m); }
  m.innerHTML=`<div class="mbox" style="max-width:420px" role="dialog" aria-modal="true">
    <div style="font-size:var(--fs-base);line-height:1.6;color:var(--tx);margin-bottom:14px">${esc(msg)}</div>
    <div class="opts" style="grid-template-columns:1fr;gap:8px;max-height:none">${ops.map((o,i)=>`<div class="opt${o.sel?' sel':''}" role="button" tabindex="0" data-i="${i}"><div class="ol">${esc(o.label)}</div>${o.sub?`<div class="os">${esc(o.sub)}</div>`:''}</div>`).join('')}</div>
    <button type="button" class="sd-b" style="width:100%;margin-top:14px">Cancelar</button></div>`;
  m.querySelectorAll('.opt').forEach(el=>{ const go=()=>{ m.classList.remove('open'); onPick(ops[+el.dataset.i].value); };
    el.onclick=go; el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }; });
  m.querySelector('button').onclick=()=>m.classList.remove('open');
  m.classList.add('open');
}
