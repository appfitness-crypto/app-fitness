/* ═══ pdf rutina ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PDF DE LA RUTINA — el socio descarga su plan aprobado
// Carga jsPDF de forma diferida (mismo patrón que Three.js), solo cuando se pide.
// ═════════════════════════════════════════
let _jsPDFPromise=null;
function cargarJsPDF(){
  if(window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
  if(_jsPDFPromise) return _jsPDFPromise;
  _jsPDFPromise = new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.crossOrigin='anonymous';
    s.onload=()=>res();
    s.onerror=()=>{ _jsPDFPromise=null; rej(new Error('jspdf load')); };
    document.head.appendChild(s);
  });
  return _jsPDFPromise;
}

// Logo de la app como imagen para el PDF (si falla, se usan las siglas)
function pdfLogo(){
  return fetch('icons/icon-192.png').then(r=>r.ok?r.blob():null).then(b=>b?new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=()=>res(null); fr.readAsDataURL(b); }):null).catch(()=>null);
}
// Texto seguro para la fuente del PDF: sin emojis, sin rayas largas ni flechas
function pdfTxt(s){ return sinEmoji(String(s==null?'':s)).replace(/\s*[—–]\s*/g,' - ').replace(/→/g,'->').replace(/≈/g,'~').replace(/[←-⇿☀-➿]/g,'').replace(/\s{2,}/g,' ').trim(); }

// Hoja de la rutina para imprimir o llevar en el celular:
// encabezado con la marca, datos del socio, método del entrenador, un bloque por día con columnas para
// anotar el peso de cada semana del bloque, glosario de los métodos usados y pie con página.
async function generarPDFRutina(){
  const s=activeSocio; if(!s) return;
  const btn=document.getElementById('btn-pdf-rutina');
  const btnTxt=btn?btn.textContent:'';
  if(btn){ btn.textContent='Generando…'; btn.style.pointerEvents='none'; }
  try{
    const [_,logo]=await Promise.all([cargarJsPDF(),pdfLogo()]);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });

    // Paleta de la app adaptada a papel: el lima va de fondo (nunca como texto sobre blanco)
    const DARK=[10,14,19], INK=[16,22,28], LIME=[200,242,58], LIME_D=[78,112,6], LIME_S=[244,251,222],
      ICE=[120,195,235], MUTED=[98,110,122], LINE=[224,230,236], SOFT=[245,247,250];
    const W=210, H=297, MX=14, CW=W-MX*2, MAXY=280;
    const hoy=new Date(), fGen=hoy.getDate()+'/'+(hoy.getMonth()+1)+'/'+hoy.getFullYear();
    const ent=s.entrenadorId?getEntrenador(s.entrenadorId):null;
    const entNom=ent&&ent.nombre?tc(ent.nombre):(s.asignado&&s.asignado!=='—'?tc(String(s.asignado)):'Plan de la app');
    const b=pqBloque(s), sem=Math.min(pqSemanaActual(s),b.semanas||4), nSem=Math.max(3,Math.min(6,b.semanas||4));
    const font=(st,sz,c)=>{ doc.setFont('helvetica',st); doc.setFontSize(sz); doc.setTextColor(...(c||INK)); };
    let y=0;

    function encabezado(){
      doc.setFillColor(...DARK); doc.rect(0,0,W,40,'F');
      doc.setFillColor(...LIME); doc.rect(0,40,W,1.2,'F');
      if(logo){ try{ doc.addImage(logo,'PNG',MX,9,22,22); }catch(_){ } }
      else { doc.setFillColor(...LIME); doc.roundedRect(MX,9,22,22,4,4,'F'); font('bold',12,DARK); doc.text(pdfTxt(GYM.siglas||'FS'),MX+11,22,{align:'center'}); }
      font('bold',17,[255,255,255]); doc.text(pdfTxt(GYM.nombre),MX+28,18);
      font('bold',9,LIME); doc.text('PLAN DE ENTRENAMIENTO',MX+28,25);
      font('normal',8,[190,200,210]); doc.text('Generado el '+fGen,MX+28,31);
      if(s.status==='activo'){
        const t='Bloque '+b.n+'  ·  Semana '+sem+' de '+(b.semanas||4);
        font('bold',8.5,DARK); const tw=doc.getTextWidth(t)+10;
        doc.setFillColor(...LIME); doc.roundedRect(W-MX-tw,15,tw,8,4,4,'F'); doc.text(t,W-MX-tw/2,20.3,{align:'center'});
      }
      return 49;
    }
    function encabezadoCont(){
      doc.setFillColor(...DARK); doc.rect(0,0,W,13,'F'); doc.setFillColor(...LIME); doc.rect(0,13,W,0.8,'F');
      font('bold',9,[255,255,255]); doc.text(pdfTxt(GYM.nombre),MX,8.4);
      font('normal',8.5,LIME); doc.text(pdfTxt(tc(s.nombre||'')),W-MX,8.4,{align:'right'});
      return 22;
    }
    function nuevaPagina(){ doc.addPage(); y=encabezadoCont(); }
    function asegurar(h){ if(y+h>MAXY){ nuevaPagina(); return true; } return false; }

    // ── Datos del socio ──
    y=encabezado();
    const diasTxt=DIAS_ORDER.filter(k=>s.rutina[k]&&(s.rutina[k].ejercicios||[]).length).map(k=>EN_DIAS_CORTO[DIAS_ORDER.indexOf(k)]).map(d=>d.charAt(0)+d.slice(1).toLowerCase());
    const datos=[['SOCIO',tc(s.nombre||'')],['OBJETIVO',sc(s.objetivo||'')+' · '+sc(s.nivel||'')],['ENTRENADOR',entNom],['FRECUENCIA',(diasTxt.length||s.dias)+' días: '+diasTxt.join(', ')]];
    const cw=CW/4;
    doc.setFillColor(...SOFT); doc.setDrawColor(...LINE); doc.setLineWidth(0.25); doc.roundedRect(MX,y,CW,17,3,3,'FD');
    datos.forEach(([k,v],i)=>{
      const x=MX+i*cw+5;
      if(i){ doc.setDrawColor(...LINE); doc.line(MX+i*cw,y+3,MX+i*cw,y+14); }
      font('bold',6.5,MUTED); doc.text(k,x,y+6);
      font('bold',8.6,INK); doc.text(doc.splitTextToSize(pdfTxt(v),cw-8).slice(0,2),x,y+11);
    });
    y+=23;

    // ── Método del entrenador ──
    const m=(()=>{ const e=entRutina(s.entrenadorId); try{ return (e&&metLineas(e.filosofia,e,s))||s.metodo; }catch(_){ return s.metodo; } })();
    if(m&&m.tagline){
      font('normal',7.6,INK);
      const lin=(m.lineas||[]).slice(0,4).map(l=>doc.splitTextToSize(pdfTxt(l),CW-14));
      const h=15+lin.reduce((a,l)=>a+l.length*3.4,0)+2;
      doc.setFillColor(...LIME_S); doc.roundedRect(MX,y,CW,h,3,3,'F'); doc.setFillColor(...LIME); doc.roundedRect(MX,y,2.2,h,1,1,'F');
      font('bold',6.5,LIME_D); doc.text((m.sistema?'EL MÉTODO DE TU PLAN':'EL MÉTODO DE TU ENTRENADOR'),MX+7,y+6);
      font('bold',10,INK); doc.text(pdfTxt('"'+m.tagline+'"'),MX+7,y+11.5);
      let ly=y+17; font('normal',7.6,INK);
      lin.forEach(l=>{ doc.setFillColor(...LIME_D); doc.circle(MX+8,ly-1,0.6,'F'); doc.text(l,MX+11,ly); ly+=l.length*3.4; });
      y+=h+6;
    }

    // ── Días ──
    const descansos=DIAS_ORDER.filter(k=>!(s.rutina[k]&&(s.rutina[k].ejercicios||[]).length)).map(k=>EN_DIAS[DIAS_ORDER.indexOf(k)]);
    const dias=DIAS_ORDER.map((k,i)=>({k,i,d:s.rutina[k]})).filter(x=>x.d&&(x.d.ejercicios||[]).length);
    // Columnas: # | Ejercicio | Series × reps | Descanso | Peso sugerido | Semana 1..n
    const C={n:7, ej:0, sr:25, ds:19, ps:23, wk:nSem*7.5};
    C.ej=CW-C.n-C.sr-C.ds-C.ps-C.wk;
    const X={n:MX, ej:MX+C.n, sr:MX+C.n+C.ej, ds:MX+C.n+C.ej+C.sr, ps:MX+C.n+C.ej+C.sr+C.ds, wk:MX+CW-C.wk};
    const metUsados=new Map();

    function cabTabla(){
      doc.setFillColor(...SOFT); doc.rect(MX,y,CW,6,'F');
      font('bold',6.2,MUTED);
      doc.text('EJERCICIO',X.ej+1,y+4); doc.text('SERIES × REPS',X.sr+1,y+4); doc.text('DESCANSO',X.ds+1,y+4); doc.text('PESO SUGERIDO',X.ps+1,y+4);
      for(let w=0;w<nSem;w++) doc.text('S'+(w+1),X.wk+w*7.5+3.75,y+4,{align:'center'});
      y+=6;
    }
    function cabDia(x,cont){
      const d=x.d, nm=EN_DIAS[x.i].charAt(0).toUpperCase()+EN_DIAS[x.i].slice(1);
      doc.setFillColor(...DARK); doc.roundedRect(MX,y,CW,9,2.5,2.5,'F');
      doc.setFillColor(...LIME); doc.roundedRect(MX,y,30,9,2.5,2.5,'F'); doc.rect(MX+26,y,4,9,'F');
      font('bold',9,DARK); doc.text(nm.toUpperCase(),MX+15,y+6,{align:'center'});
      font('bold',9.5,[255,255,255]); doc.text(pdfTxt(sc(d.tipo||'Entrenamiento'))+(cont?'  (continúa)':''),MX+34,y+6);
      font('normal',7.5,[190,200,210]); doc.text('~'+minutosDia(d)+' min  ·  '+d.ejercicios.length+' ejercicios',W-MX-3,y+6,{align:'right'});
      y+=11; cabTabla();
    }

    dias.forEach(x=>{
      const filas=x.d.ejercicios.map((e,j)=>{
        const r=rxTexto(e,s), c=cargaSugerida(s,e), dp=descansoPlan(e.descanso), esp=esEjCardio(e)||esEjRondas(e)||esEjMovilidad(e);
        const t=v=>v<120?v+' s':Math.round(v/6)/10+' min';
        const des=esp?'':dp.nada?'Sin descanso':dp.libre?(dp.meta?'~'+t(dp.meta):'Libre'):t(dp.seg);
        let peso=c?enKg(c.kg):pdfTxt(r.carga||e.esfuerzo||'');
        peso=peso.replace(/^Moderado\s*-\s*/i,'').replace(/^Esfuerzo moderado\s*-\s*/i,'').replace(/^FC objetivo/i,'FC'); peso=peso.charAt(0).toUpperCase()+peso.slice(1);
        const M=e.metodo&&KB_METODOS[e.metodo.id]; if(M) metUsados.set(e.metodo.id,M);
        const extra=[M?ddMetCorto(M.nm):'', (e.alternativas||[]).length?'Si está ocupado: '+e.alternativas[0].nm:''].filter(Boolean).join('  ·  ');
        font('bold',8.4); const nmL=doc.splitTextToSize(pdfTxt(e.nm),C.ej-2);
        font('normal',6.6); const exL=extra?doc.splitTextToSize(pdfTxt(extra),C.ej-2).slice(0,2):[];
        font('normal',7.6); const srL=doc.splitTextToSize(pdfTxt(limpiarReps(r.sr)),C.sr-2), psL=doc.splitTextToSize(peso||'-',C.ps-2).slice(0,3);
        const h=Math.max(nmL.length*3.6+exL.length*3+1.5, srL.length*3.3, psL.length*3.3, 6)+3.5;
        return {e,j,nmL,exL,srL,psL,des,h,c};
      });
      // Un día que cabe completo en una página nueva no se parte; uno muy largo empieza aquí si caben 2 ejercicios
      const total=11+6+filas.reduce((a,f)=>a+f.h,0), alto=11+6+filas.slice(0,2).reduce((a,f)=>a+f.h,0);
      if(y+total>MAXY && (total<=MAXY-22 || y+alto>MAXY)) nuevaPagina();
      cabDia(x,false);
      filas.forEach((f,fi)=>{
        if(y+f.h>MAXY){ nuevaPagina(); cabDia(x,true); }
        const y0=y;
        font('bold',8,LIME_D); doc.text(String(f.e.grupo||f.j+1),X.n+3.5,y0+4.4,{align:'center'});
        font('bold',8.4,INK); doc.text(f.nmL,X.ej+1,y0+4.2);
        if(f.exL.length){ font('normal',6.6,MUTED); doc.text(f.exL,X.ej+1,y0+4.2+f.nmL.length*3.6); }
        font('normal',7.6,INK); doc.text(f.srL,X.sr+1,y0+4.2);
        font('normal',7.6,MUTED); doc.text(f.des||'-',X.ds+1,y0+4.2);
        font(f.c?'bold':'normal',7.6,INK); doc.text(f.psL,X.ps+1,y0+4.2);
        doc.setDrawColor(...ICE); doc.setLineWidth(0.25);
        for(let w=0;w<nSem;w++) doc.roundedRect(X.wk+w*7.5+0.9,y0+1.4,5.7,Math.min(f.h-2.8,6),1,1,'S');
        y+=f.h;
        if(fi<filas.length-1){ doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(MX,y,MX+CW,y); }
      });
      y+=7;
    });

    // ── Descanso, métodos y recordatorios ──
    if(descansos.length){
      asegurar(12);
      font('bold',8,INK); doc.text('Días de descanso: ',MX,y);
      const dw=doc.getTextWidth('Días de descanso: ');
      font('normal',8,MUTED); doc.text(doc.splitTextToSize(pdfTxt(descansos.join(', ')+'. Camina 20 a 30 minutos, estira y duerme 7 u 8 horas.'),CW-dw),MX+dw,y);
      y+=9;
    }
    if(metUsados.size){
      asegurar(26);   // el título nunca queda solo al final de la hoja
      font('bold',10,INK); doc.text(metUsados.size===1?'Método de tu plan':'Métodos de tu plan',MX,y); y+=5;
      metUsados.forEach(M=>{
        font('normal',7.6); const tl=doc.splitTextToSize(pdfTxt(M.como),CW-48);
        const h=Math.max(tl.length*3.4,4)+3.5; asegurar(h);
        font('bold',8,LIME_D); doc.text(pdfTxt(ddMetCorto(M.nm)),MX,y+3.2);
        font('normal',7.6,INK); doc.text(tl,MX+46,y+3.2);
        y+=h; doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(MX,y-1.2,MX+CW,y-1.2);
      });
      y+=4;
    }
    const notas=['Calienta 5 a 10 minutos antes de empezar.','Respeta el descanso indicado en cada ejercicio.','Si la técnica se rompe, baja el peso: primero la forma.','Anota en S1, S2, S3… el peso que usaste cada semana del bloque.','Hidrátate durante la sesión y duerme 7 u 8 horas.'];
    asegurar(30);
    font('bold',10,INK); doc.text('Recuerda',MX,y); y+=2.5;
    const colN=CW/2-4;
    notas.forEach((n,i)=>{ const cx=MX+(i%2)*(CW/2), cy=y+4+Math.floor(i/2)*6.2;
      doc.setFillColor(...LIME); doc.circle(cx+1.6,cy-1.1,1.2,'F'); font('normal',7.6,INK); doc.text(doc.splitTextToSize(pdfTxt(n),colN-6)[0],cx+5,cy); });
    y+=4+Math.ceil(notas.length/2)*6.2+4;
    asegurar(14);
    doc.setFillColor(...DARK); doc.roundedRect(MX,y,CW,12,3,3,'F'); doc.setFillColor(...LIME); doc.roundedRect(MX,y,3,12,1.5,1.5,'F');
    font('bolditalic',10,[255,255,255]); doc.text('Tu esfuerzo de hoy es tu mejor inversión.',MX+CW/2,y+7.6,{align:'center'});

    // ── Pie en todas las páginas ──
    const tot=doc.getNumberOfPages();
    for(let p=1;p<=tot;p++){
      doc.setPage(p);
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(MX,H-12,W-MX,H-12);
      font('normal',6.8,MUTED);
      doc.text(pdfTxt(GYM.nombre+'  ·  '+tc(s.nombre||'')+'  ·  '+(s.id||'')),MX,H-7.5);
      doc.text('Página '+p+' de '+tot,W-MX,H-7.5,{align:'right'});
    }

    doc.save(`Rutina-${(tc(s.nombre||s.id||'socio')).replace(/\s+/g,'_')}.pdf`);
    showToast('Tu rutina en PDF se descargó');
  }catch(e){
    console.error(e);
    showToast('No se pudo generar el PDF. Revisa tu conexión.');
  }finally{
    if(btn){ btn.textContent=btnTxt||'Descargar mi rutina en PDF'; btn.style.pointerEvents=''; }
  }
}

// ── TAB: PROGRESO ──
// renderProgresoTab() vive en js/38-entreno.js (meta semanal, constancia, fuerza, peso e historial).

// ── Render del bloque de composición corporal ──
function renderCuerpo(){
  const s=activeSocio; if(!s) return;
  const cont=document.getElementById('cuerpo-contenido'); if(!cont) return;
  const {todas}=getMedidas(s);
  // Mi cuerpo 3D (lo monta c3dMontarInline): ahí se ven y se registran las medidas, y al tocar se ve su evolución
  cont.innerHTML=`<section class="en-sec"><div class="en-sec-h"><h3>Mi cuerpo</h3><span>${todas.length>1?'Desde tu primera medición':'Tu punto de partida'}</span></div>
    <div class="c3d c3d-in" id="c3d-in"></div></section>
    <div id="cuerpo-mapas">${mapasHTML(s)}</div>`;
  c3dMontarInline();
}
// Tus mapas: rendimiento y equilibrio corporal (se vuelve a pintar al guardar una medida)
function mapasHTML(s){
  const {primera, ultima}=getMedidas(s);
  const rend = calcularRendimiento(s);
  const equilibrio = calcularEquilibrioCorporal(s);
  const hayProgresion = primera && ultima && primera!==ultima;
  return `
    <section class="en-sec"><div class="en-sec-h"><h3>Tus mapas</h3><span>Rendimiento y equilibrio</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
      <div style="flex:1;min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 12px;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--v) 10%,transparent),transparent 70%);border-radius:16px">
        <div style="font-family:var(--fb);font-weight:700;font-size:11px;color:var(--chart1)">RENDIMIENTO</div>
        ${radarChartSVG(rend,{size:170,color:'var(--chart1)',color2:'var(--chart2)',glow:true})}
        <div style="font-size:10px;color:var(--mu);font-family:var(--fb);text-align:center;line-height:1.5">PRs, asistencia, cardio y nivel. No depende de tu foto.</div>
      </div>
      <div style="flex:1;min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 12px;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--p) 10%,transparent),transparent 70%);border-radius:16px">
        <div style="font-family:var(--fb);font-weight:700;font-size:11px;color:var(--n)">EQUILIBRIO CORPORAL</div>
        ${radarChartSVG(equilibrio,{size:170,color:'var(--n)',color2:'var(--p)',glow:true})}
        <div style="font-size:10px;color:var(--mu);font-family:var(--fb);text-align:center;line-height:1.5">${hayProgresion
          ? '50 = sin cambio. Sube donde más avanzas hacia tu objetivo, baja donde te quedas atrás.'
          : 'Registra 2 mediciones en fechas distintas para activarlo.'}</div>
      </div>
    </div></section>`;
}

function guardarPeso(){ asegurarLogs(activeSocio);
  const s=activeSocio; if(!s) return;
  const v=parseFloat(document.getElementById('peso-nuevo').value);
  if(!v || v<30 || v>250){ showToast('⚠ Ingresa un peso válido'); return; }
  if(!s.logs.pesoCorporal) s.logs.pesoCorporal=[];
  const hoy=fechaISO(new Date());
  const ex=s.logs.pesoCorporal.find(p=>p.fecha===hoy);
  if(ex) ex.kg=v; else s.logs.pesoCorporal.push({fecha:hoy,kg:v});
  dbSave(s.code);
  showToast('✓ Peso registrado: '+v+' kg');
  renderProgresoTab();
}

// ── Mini gráfica canvas (sin dependencias) ──
function drawPesoChart(pesos){
  const cv=document.getElementById('chart-peso'); if(!cv) return;
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||320, H=cv.clientHeight||150;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const TXC=(getComputedStyle(document.documentElement).getPropertyValue('--tx')||'#173527').trim();
  const txA=a=>{const x=TXC.replace('#','');const r=parseInt(x.substr(0,2),16),g=parseInt(x.substr(2,2),16),b=parseInt(x.substr(4,2),16);return `rgba(${r},${g},${b},${a})`};
  const accA=a=>{const x=ACC.replace('#','');const r=parseInt(x.substr(0,2),16),g=parseInt(x.substr(2,2),16),b=parseInt(x.substr(4,2),16);return `rgba(${r},${g},${b},${a})`};
  if(pesos.length<2){
    ctx.fillStyle=txA(0.45); ctx.font='10px Figtree, sans-serif';
    ctx.textAlign='center'; ctx.fillText('Registra tu peso 2+ veces para ver la curva',W/2,H/2);
    return;
  }
  const pad={l:34,r:12,t:14,b:20};
  const vals=pesos.map(p=>p.kg);
  let min=Math.min(...vals), max=Math.max(...vals);
  const range=Math.max(1,(max-min)); min-=range*0.15; max+=range*0.15;
  const X=i=>pad.l+(W-pad.l-pad.r)*(i/(pesos.length-1));
  const Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-min)/(max-min));

  // grid
  ctx.strokeStyle=accA(0.07); ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+(H-pad.t-pad.b)*g/3;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle=txA(0.4); ctx.font='8px Figtree, sans-serif'; ctx.textAlign='right';
    ctx.fillText((max-(max-min)*g/3).toFixed(1), pad.l-5, y+3);
  }
  // área
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,accA(0.18)); grad.addColorStop(1,accA(0));
  ctx.beginPath(); ctx.moveTo(X(0),H-pad.b);
  pesos.forEach((p,i)=>ctx.lineTo(X(i),Y(p.kg)));
  ctx.lineTo(X(pesos.length-1),H-pad.b); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  // línea
  ctx.beginPath();
  pesos.forEach((p,i)=>{ i===0?ctx.moveTo(X(i),Y(p.kg)):ctx.lineTo(X(i),Y(p.kg)); });
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round';
  ctx.shadowColor=accA(0.5); ctx.shadowBlur=6; ctx.stroke(); ctx.shadowBlur=0;
  // puntos
  pesos.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(X(i),Y(p.kg),2.6,0,Math.PI*2);
    ctx.fillStyle=(getComputedStyle(document.documentElement).getPropertyValue('--dk3')||'#ffffff').trim(); ctx.fill();
    ctx.strokeStyle=ACC; ctx.lineWidth=1.5; ctx.stroke();
  });
  // fechas extremos
  ctx.fillStyle=txA(0.45); ctx.font='8px Figtree, sans-serif';
  ctx.textAlign='left'; ctx.fillText(fmtFecha(pesos[0].fecha),pad.l,H-6);
  ctx.textAlign='right'; ctx.fillText(fmtFecha(pesos[pesos.length-1].fecha),W-pad.r,H-6);
}

// ── TAB: NUTRICIÓN ──
function nutElegirComidas(n){
  const s=activeSocio; if(!s) return;
  s.comidasPorDia=n; dbSave(s.code); renderNutricionTab();
}
function renderNutricionTab(){
  const s=activeSocio; if(!s) return;
  const nut=nutricionFinal(s), base=calcNutricion(s);
  const pK=nut.prot*4, cK=nut.carbs*4, gK=nut.grasas*9;
  const tot=pK+cK+gK;
  const pP=Math.round(pK/tot*100), cP=Math.round(cK/tot*100), gP=100-pP-cP;
  const menu=comoArray(s.nutricion&&s.nutricion.menu);
  const nComidas=[3,4,5,6].includes(+s.comidasPorDia)?+s.comidasPorDia:4;
  const reparto=nutRepartoComidas(nComidas,nut.kcal,pP,cP,gP);

  document.getElementById('dsec-nutricion').innerHTML=`
    ${appHead('Nutrición',nut.manual?'Tu plan de alimentación, personalizado para ti.':'Tu plan de alimentación, calculado con tus datos.')}
    ${nut.manual?`<div class="nut-note" style="border-color:color-mix(in srgb,var(--v2) 45%,transparent)">🥗 Ajustado por <b style="color:var(--tx)">${esc(s.nutricion.por||'tu nutriólogo')}</b>${s.nutricion.fecha?' · '+esc(fmtFecha(s.nutricion.fecha)):''}${s.nutricion.nota?`<br><span style="font-style:italic">“${esc(s.nutricion.nota)}”</span>`:''}</div>`
      :`<div class="nut-note">Objetivo: <b style="color:var(--tx)">${esc(sc(s.objetivo))}</b> · ${nut.ajusteTxt}<br>Calculado con tu peso actual: <b style="color:var(--tx)">${nut.pesoBase} kg</b> — se actualiza solo al registrar peso en Progreso.</div>`}

    <div class="macro-grid">
      <div class="macro-c" style="--mc:var(--v)">${it('flame')}<div class="mc-v">${nut.kcal}<span class="mc-u"> kcal</span></div><div class="mc-l">Calorías / día</div><div class="mc-s">${nut.ajusteTxt}</div></div>
      <div class="macro-c" style="--mc:var(--n)">${it('dumbbell')}<div class="mc-v">${nut.prot}<span class="mc-u"> g</span></div><div class="mc-l">Proteína</div><div class="mc-s">${nut.protKg} g/kg${(nut.pesoRef&&nut.pesoRef<nut.pesoBase-0.5)?' de '+nut.pesoRef+' kg de referencia':''} · ${pP}% kcal · reparte en 3–4 comidas</div></div>
      <div class="macro-c" style="--mc:var(--g)">${it('bolt')}<div class="mc-v">${nut.carbs}<span class="mc-u"> g</span></div><div class="mc-l">Carbohidratos</div><div class="mc-s">${cP}% kcal · prioriza pre y post entreno</div></div>
      <div class="macro-c" style="--mc:var(--p)">${it('drop')}<div class="mc-v">${nut.grasas}<span class="mc-u"> g</span></div><div class="mc-l">Grasas</div><div class="mc-s">${gP}% kcal · mínimo saludable garantizado (0.8 g/kg)</div></div>
    </div>

    <div class="card">
      <div class="card-t">${it('chart','sm')}Distribución de macros</div>
      <div class="dist-bar">
        <div style="width:${pP}%;background:var(--n)"></div>
        <div style="width:${cP}%;background:var(--g)"></div>
        <div style="width:${gP}%;background:var(--p)"></div>
      </div>
      <div class="dist-leg">
        <span><b style="color:var(--n)">●</b> Proteína ${pP}%</span>
        <span><b style="color:var(--g)">●</b> Carbohidratos ${cP}%</span>
        <span><b style="color:var(--p)">●</b> Grasas ${gP}%</span>
      </div>
    </div>

    ${menu.length?`<div class="card">
      <div class="card-t">${it('leaf','sm')}Reparto de tus comidas</div>
      <div class="q-sub" style="margin:2px 0 12px">¿En cuántas comidas repartes tu día?</div>
      <div class="comida-sel">${[3,4,5,6].map(n=>`<button type="button" class="${n===nComidas?'on':''}" onclick="nutElegirComidas(${n})">${n}</button>`).join('')}</div>
      <div class="comida-list">
        ${reparto.map(m=>`<div class="comida-it">
          <div class="comida-it-h"><span class="comida-tag ${m.tag}">${esc(m.tag==='ligera'?'Colación':m.tag==='fuerte'?'Comida fuerte':'Comida media')}</span><b>${esc(m.nombre)}</b><span class="comida-kcal">${m.pct}% · ~${m.kcal} kcal</span></div>
        </div>`).join('')}
      </div>
    </div>`:menuSugeridoHTML(s,nut,nComidas)}

    ${menu.length?`<div class="card">
      <div class="card-t">${it('leaf','sm')}Menú de tu ${nut.manual?'nutriólogo':'entrenador'}</div>
      ${menu.map(m=>`<div class="nut-detail" style="align-items:flex-start"><span style="flex:0 0 auto;font-weight:700;color:var(--tx)">${esc(m.nombre)}</span><b style="text-align:right;font-weight:500;color:var(--mu)">${esc(m.detalle)}</b></div>`).join('')}
    </div>`:''}

    <div class="flota" data-flota>
      <div class="flota-k">${ico('star')}Guía de tu ${nut.manual?'nutriólogo':'entrenador'}</div>
      <div class="flota-t">${nut.manual&&s.nutricion.nota?esc(s.nutricion.nota):base.nota}</div>
      <div class="flota-n">Es una guía${nut.manual?' personalizada':' con fórmulas estándar'}. Si tienes alguna condición médica, coméntala con tu médico o nutriólogo.</div>
    </div>

    <details class="card nut-calc">
      <summary class="card-t">${it('info','sm')}<span class="nc-t">${nut.manual?'Cálculo automático (referencia)':'Cómo se calculó'}<small>Toca para ver los datos</small></span>${ico('chev')}</summary>
      <div class="nut-detail"><span>Metabolismo basal (Mifflin-St Jeor)</span><b>${base.bmr} kcal</b></div>
      <div class="nut-detail"><span>Factor de actividad (${s.dias} días/sem)</span><b>× ${base.factor}</b></div>
      <div class="nut-detail"><span>Gasto total diario (TDEE)</span><b>${base.tdee} kcal</b></div>
      <div class="nut-detail"><span>Ajuste por objetivo</span><b>${base.kcal} kcal</b></div>
      <div class="nut-detail"><span>Agua recomendada (35 ml/kg)</span><b>${base.agua} L/día + 0.5 L por sesión</b></div>
    </details>`;
  flotaObservar(document.getElementById('dsec-nutricion'));
}
// Tarjetas "flotantes": aparecen al pasar por la mitad de la pantalla y se desvanecen al seguir bajando o subir
let FLOTA_OBS=null;
function flotaObservar(root){
  const els=root?root.querySelectorAll('[data-flota]'):[];
  if(!els.length) return;
  if(!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches){ els.forEach(e=>e.classList.add('vis')); return; }
  if(!FLOTA_OBS) FLOTA_OBS=new IntersectionObserver(ents=>ents.forEach(en=>en.target.classList.toggle('vis',en.isIntersecting)),{rootMargin:'-10% 0px -22% 0px',threshold:0.15});
  els.forEach(e=>FLOTA_OBS.observe(e));
}
