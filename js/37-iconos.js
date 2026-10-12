/* ═══ ÍCONOS EN LUGAR DE EMOJIS ═══
   La app dibuja sus íconos con SVG de trazo (los <symbol id="i-…"> de index.html).
   Muchos textos (avisos, catálogos, botones, mensajes) traían emojis, que se ven distintos
   en cada celular y no combinan con el resto. Este módulo los cambia por el ícono equivalente
   en cuanto aparecen en pantalla, también en lo que se dibuja después (MutationObserver).
   - Donde no cabe un SVG (placeholder, title, aria-label, <option>) el emoji solo se quita.
   - Los emojis con significado de color (corazones, ✅ ❌ ⚠ ⛔) conservan su color.
   - Las flechas y palomitas tipográficas (→ ← ✓ ✕ ★) se quedan: son texto, no emojis.
   Para agregar uno: suma la pareja emoji → nombre de ícono en EMO_ICONO. ═══ */
const EMO_ICONO = {
  '🏋':'dumbbell','💪':'dumbbell','📋':'clipboard','🗑':'trash',
  '🥗':'food','🥦':'food','🍗':'food','🍚':'food','🥑':'food','🥜':'food',
  '✅':'check ok','❌':'x bad','⚠':'warn alerta','⛔':'ban bad','🚫':'ban bad','✋':'ban',
  '🧬':'dna','📚':'book','🔥':'flame','🤸':'stretch','🧘':'stretch','🩰':'stretch','🦒':'stretch',
  '⏱':'timer','⏳':'clock','⏸':'pause','⚡':'bolt','💾':'save','💡':'bulb','💓':'pulse','✨':'spark',
  '🏠':'home','🏥':'medical','⚕':'medical','💳':'card','🔒':'lock','🔐':'lock','🔑':'key','🔔':'bell',
  '🏅':'trophy','🏆':'trophy','⭐':'star','💚':'heart ok','💛':'heart alerta','❤':'heart bad',
  '➕':'plus','📊':'chart','📈':'chart','📍':'pin','📄':'file','📎':'file','📏':'ruler','📅':'calendar',
  '⚽':'ball','🥎':'ball','🎾':'racquet','🏀':'basketball','⛳':'golf','🏊':'swim','🥋':'belt',
  '🦵':'leg','🦶':'run','👣':'run','🏃':'run','🔀':'shuffle','🚀':'rocket','⬇':'download','⬆':'arrow up',
  '👨':'user','👥':'users','💼':'briefcase','🎨':'palette','👈':'chevl','🔎':'search','🔍':'search',
  '🚪':'logout','💬':'chat','🔄':'refresh','✎':'pencil','📧':'mail',
  '🪑':'box','🪜':'box','🧺':'box','🎒':'box','➰':'box','⛓':'box','🪢':'box'
};
(function(){
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const claves=Object.keys(EMO_ICONO).sort((a,b)=>b.length-a.length).map(esc).join('|');
  // el emoji base, su selector de variante (FE0F) y lo que venga unido con ZWJ (👨‍⚕️)
  const RE=new RegExp('(?:'+claves+')\\uFE0F?(?:\\u200D[^\\s]\\uFE0F?)*','gu');
  const RE_UNO=new RegExp('^(?:'+claves+')','u');
  const NS='http://www.w3.org/2000/svg', XL='http://www.w3.org/1999/xlink';
  const SALTAR=new Set(['SCRIPT','STYLE','TEXTAREA','OPTION','TITLE','INPUT','SELECT','svg','use','symbol']);
  const ATRIBUTOS=['placeholder','title','aria-label'];

  function icono(emoji){
    const base=(emoji.match(RE_UNO)||[''])[0];
    const [nombre,...extra]=(EMO_ICONO[base]||'spark').split(' ');
    const svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class','ico emo'+(extra.length?' '+extra.join(' '):''));
    svg.setAttribute('aria-hidden','true');
    const use=document.createElementNS(NS,'use');
    use.setAttribute('href','#i-'+nombre); use.setAttributeNS(XL,'xlink:href','#i-'+nombre);
    svg.appendChild(use);
    return svg;
  }
  function textoANodos(nodo){
    const t=nodo.nodeValue; RE.lastIndex=0;
    if(!t || !RE.test(t)) return;
    const p=nodo.parentNode; if(!p || SALTAR.has(p.nodeName) || (p.closest && p.closest('[contenteditable],[data-sin-icono]'))) return;
    const frag=document.createDocumentFragment(); let i=0; RE.lastIndex=0; let m;
    while((m=RE.exec(t))){
      if(m.index>i) frag.appendChild(document.createTextNode(t.slice(i,m.index)));
      frag.appendChild(icono(m[0]));
      i=m.index+m[0].length;
    }
    if(i<t.length) frag.appendChild(document.createTextNode(t.slice(i)));
    p.replaceChild(frag,nodo);
  }
  function limpiarAtributos(el){
    ATRIBUTOS.forEach(a=>{ const v=el.getAttribute && el.getAttribute(a); if(v){ RE.lastIndex=0; if(RE.test(v)) el.setAttribute(a, v.replace(RE,'').replace(/\s{2,}/g,' ').trim()); } });
    if(el.nodeName==='OPTION'){ const v=el.textContent; RE.lastIndex=0; if(RE.test(v)) el.textContent=v.replace(RE,'').trim(); }
  }
  function revisar(raiz){
    if(!raiz) return;
    if(raiz.nodeType===3){ textoANodos(raiz); return; }
    if(raiz.nodeType!==1) return;
    limpiarAtributos(raiz);                                   // también en campos y listas (solo sus atributos)
    if(SALTAR.has(raiz.nodeName)) return;
    raiz.querySelectorAll('[placeholder],[title],[aria-label],option').forEach(limpiarAtributos);
    const w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ RE.lastIndex=0; return RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP; }});
    const lista=[]; let n; while((n=w.nextNode())) lista.push(n);
    lista.forEach(textoANodos);
  }
  // Para textos que no van a pantalla (PDF, WhatsApp, IA): quita los emojis
  window.sinEmoji=function(s){ RE.lastIndex=0; return String(s==null?'':s).replace(RE,'').replace(/[ \t]{2,}/g,' ').replace(/^\s+/,''); };
  window.iconizar=revisar;

  function iniciar(){
    revisar(document.body);
    new MutationObserver(cambios=>{
      cambios.forEach(c=>{
        if(c.type==='characterData') textoANodos(c.target);
        else c.addedNodes.forEach(revisar);
      });
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
})();
