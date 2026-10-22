/* ═══ nutrición del socio ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Pestaña Nutrición de la app del socio: un resumen compacto (kcal, barra de macros, agua), el menú del día como
   línea de tiempo plegable y los ajustes (comidas, hora de entreno, filtros) en una hoja aparte.
   El menú sale de js/48 (automático) o de js/49 (armado por el entrenador, definitivo). ═══ */

let NX_ABIERTA=null;    // índice de la comida desplegada; null = la próxima según la hora, -1 = ninguna
let NX_HOJA=false;      // hoja "Ajustar mi menú" abierta

function nxNum(x){ return Math.round(x).toLocaleString('es-MX'); }
function nxMin(h){ const m=/^(\d{1,2}):(\d{2})/.exec(h||''); return m?(+m[1])*60+(+m[2]):null; }
function nxHora12(h){ const t=nxMin(h); if(t==null) return ''; let H=Math.floor(t/60); const M=t%60, ap=H<12?'am':'pm'; H=H%12||12; return H+':'+String(M).padStart(2,'0')+' '+ap; }
function nxPlan(s){ const p=s.nutricion&&s.nutricion.plan; return p&&comoArray(p.comidas).length?p:null; }
// Comidas del día con lo necesario para pintarlas, del menú armado por el entrenador o del automático
function nxComidas(s,nut){
  const plan=nxPlan(s);
  if(plan){
    return {plan, items:comoArray(plan.comidas).slice().sort((a,b)=>(nxMin(a.hora)??9999)-(nxMin(b.hora)??9999)).map(m=>{
      const p=maPlat(m.id); if(!p) return null; const r=maCalc(m.id,m.q), q=comoArray(m.q);
      return {nombre:m.nombre, hora:m.hora, p, k:r.k, P:r.p, C:r.c, G:r.l, nota:m.nota||'', rol:'',
        comps:p.c.map(([f],ci)=>({f,q:+q[ci]||0})).filter(x=>x.q>0||MENU_ALIM[x.f].u==='libre')};
    }).filter(Boolean)};
  }
  const n=[3,4,5,6].includes(+s.comidasPorDia)?+s.comidasPorDia:4;
  const dia=generarMenuDia(s,nut,n);
  return {plan:null, n, items:dia.comidas.map(m=>m.r?{nombre:m.nombre, hora:MA_HORAS[m.nombre]||'', p:m.r.platillo, k:m.r.k, P:m.r.p, C:m.r.c, G:m.r.l, comps:m.r.comps, rol:m.rol, opciones:m.opciones}:{nombre:m.nombre, hora:MA_HORAS[m.nombre]||'', p:null, rol:m.rol})};
}
function nxFilaHTML(m,i,op,sig,menor,conOtra){
  if(!m.p) return `<li class="nx-m"><div class="nx-m-h nx-sin"><span class="nx-t"><b>${esc(nxHora12(m.hora))}</b><small>${esc(m.nombre)}</small></span><span class="nx-ph">${ico('food')}</span>
    <span class="nx-d"><b>Sin platillo con tus filtros</b><small>Toca "Ajustar" y quita algún filtro.</small></span><span></span></div></li>`;
  const fid=menuFotoId(m.p.id), rol=m.rol==='pre'?'Antes de entrenar':m.rol==='post'?'Después de entrenar':'';
  return `<li class="nx-m${op?' op':''}${sig?' sig':''}">
    <button type="button" class="nx-m-h" aria-expanded="${op}" onclick="nxAbrir(${i})">
      <span class="nx-t"><b>${esc(nxHora12(m.hora))}</b><small>${esc(m.nombre)}</small></span>
      ${fid?`<img src="${menuFotoSrc(fid)}" alt="" width="56" height="56" loading="lazy" decoding="async">`:`<span class="nx-ph">${ico('food')}</span>`}
      <span class="nx-d"><b>${esc(m.p.n)}</b><small>${menor?'':nxNum(m.k)+' kcal · P '+nxNum(m.P)+' g'}${rol?`<em>${rol}</em>`:''}</small></span>
      <span class="nx-chev">${ico('chev')}</span>
    </button>
    ${op?`<div class="nx-m-b">
      ${fid?`<img class="nx-foto" src="${menuFotoSrc(fid)}" alt="${esc(m.p.n)}" width="800" height="500" decoding="async">`:''}
      <ul class="nx-ing">${m.comps.map(x=>`<li>${esc(menuPorcion(x.f,x.q))}</li>`).join('')}</ul>
      ${m.p.prep?`<p class="nx-prep">${esc(m.p.prep)}</p>`:''}
      ${m.nota?`<p class="nx-nota">${ico('info')}<span>${esc(m.nota)}</span></p>`:''}
      <div class="nx-m-f">${menor?'<span></span>':`<span>C ${nxNum(m.C)} g · G ${nxNum(m.G)} g</span>`}${conOtra&&m.opciones>1?`<button type="button" class="nx-otra" onclick="nutMenuOtra('${esc(m.nombre)}')">${ico('refresh')}Otra opción</button>`:''}</div>
    </div>`:''}
  </li>`;
}
function nutTabHTML(s){
  const nut=nutricionFinal(s), base=calcNutricion(s), edad=parseInt(s.edad)||0, menor=edad>0&&edad<18;
  const o=s.nutricion||{}, legado=comoArray(o.menu), plan=nxPlan(s);
  const tot=(nut.prot*4+nut.carbs*4+nut.grasas*9)||1, pP=nut.prot*4/tot*100, pC=nut.carbs*4/tot*100, pG=Math.max(0,100-pP-pC);
  const sum=`<section class="nx-sum">
    <div class="nx-sum-top"><div>${menor?'<span class="nx-k sm">Tu energía del día</span>':`<span class="nx-k">${nxNum(nut.kcal)}</span><span class="nx-u">kcal al día${nut.manual?' · ajustado por '+esc(o.por||'tu nutriólogo'):''}</span>`}</div>
      <span class="nx-obj">${esc(sc(s.objetivo||''))}</span></div>
    ${menor?'':`<div class="nx-bar" aria-hidden="true"><i class="m-p" style="flex:${pP}"></i><i class="m-c" style="flex:${pC}"></i><i class="m-g" style="flex:${pG}"></i></div>
    <dl class="nx-mac"><div><dt><i class="m-p"></i>Proteína</dt><dd>${nut.prot} g</dd></div><div><dt><i class="m-c"></i>Carbohidratos</dt><dd>${nut.carbs} g</dd></div><div><dt><i class="m-g"></i>Grasas</dt><dd>${nut.grasas} g</dd></div></dl>`}
    <div class="nx-agua">${ico('drop')}<span>Agua: <b>${esc(nut.agua)} L</b> al día, más 0.5 L por sesión</span></div>
  </section>
  ${nut.manual&&o.nota?`<div class="nx-coach">${ico('star')}<p><b>Tu ${plan?'entrenador':'nutriólogo'}:</b> ${esc(o.nota)}</p></div>`:''}`;

  let dia;
  if(edad>0&&edad<12){
    dia=`<section class="nx-dia"><p class="nx-vacio">A tu edad, lo que comes lo decide tu familia con tu pediatra. Pide en recepción la guía del Plato del Bien Comer para tus papás.</p></section>`;
  } else if(!plan&&legado.length){
    dia=`<section class="nx-dia"><div class="nx-dia-h"><div><h2>Tu menú</h2><p>Escrito por ${esc(o.por||'tu entrenador')}</p></div></div>
      <ul class="nx-leg">${legado.map(m=>`<li><b>${esc(m.nombre)}</b><span>${esc(m.detalle)}</span></li>`).join('')}</ul></section>`;
  } else {
    const d=nxComidas(s,nut), items=d.items;
    const mins=new Date().getHours()*60+new Date().getMinutes();
    let sig=items.findIndex(m=>m.p&&(nxMin(m.hora)??0)>=mins-60); if(sig<0) sig=items.findIndex(m=>m.p);
    const abierta=NX_ABIERTA==null?sig:NX_ABIERTA;
    const suma=items.reduce((a,m)=>a+(m.k||0),0), dev=nut.kcal?(suma-nut.kcal)/nut.kcal:0, ok=Math.abs(dev)<=MENU_TOL_DIA;
    const horaTxt={manana:'entrenas en la mañana',mediodia:'entrenas a mediodía',tarde:'entrenas en la tarde'}[s.horaEntreno]||'';
    dia=`<section class="nx-dia">
      <div class="nx-dia-h"><div><h2>Tu menú de hoy</h2><p>${d.plan?'Armado por '+esc(d.plan.por||'tu entrenador'):d.n+' comidas'+(horaTxt?' · '+horaTxt:'')}</p></div>
        ${d.plan?'':`<button type="button" class="nx-aj" onclick="nxAjustes(true)">${ico('settings')}Ajustar</button>`}</div>
      <ol class="nx-lista">${items.map((m,i)=>nxFilaHTML(m,i,i===abierta,i===sig,menor,!d.plan)).join('')}</ol>
      ${menor?`<p class="nx-tot">${ico('info')}<span>Eres menor de edad: tu menú cubre lo que gastas, sin dietas para bajar de peso.</span></p>`
        :`<p class="nx-tot ${ok?'ok':'warn'}">${ico(ok?'check':'warn')}<span>Tu menú suma <b>${nxNum(suma)} kcal</b>${ok?', dentro de tu meta.':' ('+(dev>0?'+':'')+Math.round(dev*100)+'% de tu meta).'}</span></p>`}
    </section>`;
  }
  const mas=`<details class="nx-mas"><summary>${ico('info')}Cómo se calculó y aviso</summary><div class="nx-mas-b">
    <p>Metabolismo basal <b>${base.bmr} kcal</b> × actividad <b>${base.factor}</b> (${esc(s.dias)} días por semana) = gasto <b>${nxNum(base.tdee)} kcal</b>. Ajuste por objetivo: ${esc(base.ajusteTxt)}.</p>
    <p>Calculado con tu peso actual, <b>${base.pesoBase} kg</b>. Se actualiza solo al registrar tu peso en Progreso.</p>
    <p>${esc(base.nota)}</p>
    <p class="nx-legal">Sugerencia educativa con equivalentes del Sistema Mexicano de Alimentos Equivalentes. Si tienes diabetes, enfermedad renal, embarazo, alergias o alguna condición médica, revisa tu alimentación con tu médico o nutriólogo.</p>
  </div></details>`;
  return sum+dia+mas;
}
// Hoja "Ajustar mi menú": vive en <body> para que ningún contenedor de la pestaña recorte el modal
function nxHojaMontar(s){
  let w=document.getElementById('nx-hoja'); if(!w){ w=document.createElement('div'); w.id='nx-hoja'; document.body.appendChild(w); }
  if(nxPlan(s)||comoArray(s.nutricion&&s.nutricion.menu).length){ w.innerHTML=''; return; }
  const n=[3,4,5,6].includes(+s.comidasPorDia)?+s.comidasPorDia:4, hora=s.horaEntreno||'', pref=s.nutPrefs||{};
  const ch=(on,lb,fn)=>`<button type="button" class="ch${on?' on':''}" aria-pressed="${on}" onclick="${fn}">${lb}</button>`;
  w.innerHTML=`<div class="modal${NX_HOJA?' open':''}" onclick="if(event.target===this)nxAjustes(false)">
    <div class="mbox" role="dialog" aria-modal="true" aria-labelledby="nx-hoja-t"><div class="mx" onclick="nxAjustes(false)" aria-label="Cerrar">✕</div>
      <div class="m-title" id="nx-hoja-t" style="font-size:var(--fs-3xl)">Ajustar mi menú</div>
      <div class="nx-g"><div class="nx-gl">Comidas al día</div><div class="ch-row">${[3,4,5,6].map(k=>ch(k===n,k,`nxSet('comidasPorDia',${k})`)).join('')}</div></div>
      <div class="nx-g"><div class="nx-gl">¿A qué hora entrenas?</div><div class="ch-row">${MENU_HORAS.map(([v,lb])=>ch(hora===v,lb,`nxSet('horaEntreno','${v}')`)).join('')}</div></div>
      <div class="nx-g"><div class="nx-gl">Lo que no comes</div><div class="ch-row">${MENU_PREFS.map(([k,lb])=>ch(!!pref[k],lb,`nutPref('${k}')`)).join('')}</div></div>
      <button type="button" class="sd-pri nx-listo" onclick="nxAjustes(false)">Listo</button>
    </div></div>`;
}
function nxAbrir(i){
  const ab=document.querySelector('#dsec-nutricion .nx-m.op'), lista=[...document.querySelectorAll('#dsec-nutricion .nx-m')];
  NX_ABIERTA=(ab&&lista.indexOf(ab)===i)?-1:i; renderNutricionTab();
}
function nxAjustes(v){ NX_HOJA=v; const s=activeSocio; if(s) nxHojaMontar(s); }
function nxSet(k,v){ const s=activeSocio; if(!s) return; s[k]=v; NX_ABIERTA=null; dbSave(s.code); renderNutricionTab(); }
