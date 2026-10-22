/* ═══ menú sugerido ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Arma el menú del día del socio con platillos mexicanos, escalados al % de cada comida
   (reparto de MEAL_TEMPLATES) y a sus metas de calorías y macros (nutricionFinal).
   Reglas de .claude/skills/nutricion-deportiva: filtro de seguridad primero, equivalentes del SMAE,
   tolerancias de ±5 % kcal en el día y ±15 % por comida, pre/post según la hora de entreno. ═══ */

// Equivalentes SMAE (4.ª ed.) por subgrupo: kcal, proteína, lípidos, hidratos de carbono.
// Se usan las kcal oficiales (no recalculadas con 4/4/9).
const SMAE_EQ={
  VER:{k:25,p:2,l:0,c:4, lb:['verdura','verduras']},
  FRU:{k:60,p:0,l:0,c:15, lb:['fruta','frutas']},
  CER:{k:70,p:2,l:0,c:15, lb:['cereal','cereales']},
  LEG:{k:120,p:8,l:1,c:20, lb:['leguminosa','leguminosas']},
  AOAMB:{k:40,p:7,l:1,c:0, lb:['origen animal','origen animal']},
  AOAB:{k:55,p:7,l:3,c:0, lb:['origen animal','origen animal']},   // PENDIENTE: lípidos sin verificar
  AOAM:{k:75,p:7,l:5,c:0, lb:['origen animal','origen animal']},   // PENDIENTE: lípidos sin verificar
  LECD:{k:95,p:9,l:2,c:12, lb:['leche','leches']},                 // PENDIENTE: lípidos y HC sin verificar
  GRA:{k:45,p:0,l:5,c:0, lb:['grasa','grasas']},
  GRAP:{k:70,p:3,l:5,c:3, lb:['grasa','grasas']},                  // PENDIENTE: grasas con proteína
  LIB:{k:0,p:0,l:0,c:0, lb:['','']},
};
// Alimentos: 1 unidad = 1 equivalente. u: cómo se muestra (n = piezas, g = gramos, taza, cdita, fr = fracción de pieza);
// por: cuánto de esa medida es 1 equivalente. m: macros propios (USDA FoodData Central) cuando el SMAE no los da.
// tope: máximo de equivalentes por comida, para que las porciones sigan siendo realistas.
// est: porción no confirmada en el SMAE o en conflicto entre ediciones (PENDIENTE de revisión del nutriólogo).
const MENU_ALIM={
  tortilla:{g:'CER', u:'n', s:'tortilla de maíz', pl:'tortillas de maíz', por:1, tope:6},
  totopo:{g:'CER', u:'n', s:'tortilla horneada en totopos', pl:'tortillas horneadas en totopos', por:1, tope:5},
  tostada:{g:'CER', u:'n', s:'tostada horneada', pl:'tostadas horneadas', por:1, est:1, tope:5},
  bolillo:{g:'CER', u:'fr', s:'bolillo', pl:'bolillos', por:0.5, gluten:1, tope:4},
  arroz:{g:'CER', u:'taza', s:'de arroz cocido', por:1/3, est:1, tope:4},
  avena:{g:'CER', u:'taza', s:'de avena en hojuelas', por:1/3, est:1, gluten:1, tope:4},
  pasta:{g:'CER', u:'taza', s:'de pasta cocida', por:0.5, est:1, gluten:1, tope:4},
  frijol:{g:'LEG', u:'taza', s:'de frijoles de la olla', por:0.5, leg:1, tope:2},
  lenteja:{g:'LEG', u:'taza', s:'de lentejas cocidas', por:0.5, est:1, leg:1, tope:3},
  huevo:{g:'AOAM', u:'n', s:'huevo', pl:'huevos', por:1, huevo:1, tope:4},
  clara:{g:'AOAMB', u:'n', s:'clara de huevo', pl:'claras de huevo', por:2, est:1, huevo:1, tope:3},
  pollo:{g:'AOAMB', u:'g', s:'de pechuga de pollo cocida', por:30, carne:1, prot:'pollo', tope:7},
  res:{g:'AOAB', u:'g', s:'de bistec de res magro, cocido', por:30, est:1, carne:1, prot:'res', tope:6},
  atun:{g:'AOAMB', u:'g', s:'de atún en agua, escurrido', por:30, est:1, pescado:1, prot:'atun', tope:5},
  pescado:{g:'AOAMB', u:'g', s:'de filete de pescado blanco, cocido', por:30, est:1, pescado:1, prot:'pescado', tope:7},
  panela:{g:'AOAM', u:'g', s:'de queso panela', por:40, lacteo:1, prot:'panela', tope:3},
  tofu:{g:'AOAM', m:{k:72,p:8.5,l:4.5,c:1.5}, u:'g', s:'de tofu firme', por:50, lb:['proteína vegetal','proteína vegetal'], prot:'tofu', tope:5},
  yogur:{g:'LECD', m:{k:70,p:12,l:0.5,c:4.5}, u:'taza', s:'de yogur griego natural sin azúcar', por:0.5, lacteo:1, tope:4},
  leche:{g:'LECD', u:'taza', s:'de leche descremada o deslactosada light', por:1, lacteo:1, tope:2},
  papaya:{g:'FRU', u:'taza', s:'de papaya picada', por:1, tope:2},
  manzana:{g:'FRU', u:'n', s:'manzana', pl:'manzanas', por:1, tope:1},
  platano:{g:'FRU', u:'fr', s:'plátano', pl:'plátanos', por:0.5, tope:3},
  fresa:{g:'FRU', u:'taza', s:'de fresas', por:1, est:1, tope:2},
  naranja:{g:'FRU', u:'n', s:'naranja', pl:'naranjas', por:1, est:1, tope:2},
  nopal:{g:'VER', u:'taza', s:'de nopales cocidos', por:1},
  calabacita:{g:'VER', u:'taza', s:'de calabacitas cocidas', por:1, est:1},
  mexicana:{g:'VER', u:'taza', s:'de jitomate, cebolla y chile picados', por:0.5, est:1},
  ensalada:{g:'VER', u:'taza', s:'de ensalada (lechuga, jitomate y pepino)', por:1, est:1},
  verduras:{g:'VER', u:'taza', s:'de verduras cocidas (zanahoria, calabacita, chayote)', por:1, est:1},
  pico:{g:'VER', u:'taza', s:'de pico de gallo', por:0.5, est:1},
  jicama:{g:'VER', u:'taza', s:'de jícama y pepino con limón', por:1, est:1},
  aceite:{g:'GRA', u:'cdita', s:'de aceite', por:1, grasa:1, tope:3},
  aguacate:{g:'GRA', u:'fr', s:'aguacate', pl:'aguacates', por:0.25, est:1, grasa:1, tope:3},
  almendra:{g:'GRAP', u:'n', s:'almendra', pl:'almendras', por:10, est:1, grasa:1, tope:2},
  cacahuate:{g:'GRAP', u:'n', s:'cacahuate natural', pl:'cacahuates naturales', por:14, est:1, grasa:1, tope:2},
  salsa:{g:'LIB', u:'libre', s:'Salsa verde o roja al gusto'},
};
// Platillos: t = tiempos de comida donde caben (des, col, com, cen). c = [alimento, cantidad base, mínimo, máximo, paso]
// en equivalentes; si mínimo = máximo, la porción es fija. Sin cerdo en toda la biblioteca.
const MENU_PLATILLOS=[
  {id:'d-huevo-mex', n:'Huevos a la mexicana con frijoles', t:['des','cen'], prep:'Guisa el jitomate, la cebolla y el chile en el aceite y agrega el huevo.',
    c:[['huevo',2,1,3],['clara',0,0,2],['mexicana',1,1,1],['aceite',1,0,2],['tortilla',2,1,4],['frijol',1,0.5,2,0.5]]},
  {id:'d-avena', n:'Avena con leche y plátano', t:['des','col'], prep:'Cuece la avena en la leche y sírvela con el plátano en rodajas.',
    c:[['avena',2,1,4],['leche',1,0.5,2,0.5],['platano',1,1,2],['almendra',1,0,2]]},
  {id:'d-chilaquiles', n:'Chilaquiles horneados con huevo y panela', t:['des'], prep:'Hornea los totopos, báñalos en salsa caliente y sirve con el huevo y el queso.',
    c:[['totopo',2,2,4],['salsa',0,0,0],['huevo',1,1,2],['clara',0,0,2],['panela',1,1,2]]},
  {id:'d-molletes', n:'Molletes de frijol con panela y pico de gallo', t:['des','cen'], prep:'Unta los frijoles en el bolillo, agrega el queso y gratina en el horno o comal.',
    c:[['bolillo',2,2,4],['frijol',1,0.5,2,0.5],['panela',1,1,2],['pico',1,1,1]]},
  {id:'d-yogur', n:'Yogur griego con fresas y avena', t:['des','col','cen'], prep:'Sirve el yogur con las fresas picadas y la avena.',
    c:[['yogur',2,1,4],['fresa',1,1,2],['avena',1,1,3],['almendra',0,0,1]]},
  {id:'d-tacos-huevo', n:'Tacos de huevo con nopales', t:['des','cen'], prep:'Revuelve el huevo con los nopales asados en el aceite y arma los tacos con salsa.',
    c:[['tortilla',2,2,4],['huevo',2,1,3],['clara',0,0,2],['nopal',1,1,1],['aceite',1,0,1],['salsa',0,0,0]]},
  {id:'d-tofu-mex', n:'Tofu a la mexicana con frijoles y tortillas', t:['des','com','cen'], prep:'Desmorona el tofu y guísalo con jitomate, cebolla y chile.',
    c:[['tofu',2,1,4],['mexicana',1,1,1],['aceite',1,0,1],['tortilla',2,1,4],['frijol',1,0.5,2,0.5]]},
  {id:'d-enfrijoladas', n:'Enfrijoladas de pollo', t:['des','com'], prep:'Pasa las tortillas por agua caliente (no fritas), báñalas en frijol molido y rellénalas de pollo.',
    c:[['tortilla',2,2,4],['frijol',1,1,2,0.5],['pollo',2,1,4],['panela',1,0,2]]},
  {id:'c-manzana', n:'Manzana con almendras', t:['col'], prep:'',
    c:[['manzana',1,1,1],['almendra',1,1,2]]},
  {id:'c-yogur-fresa', n:'Yogur griego con fresas', t:['col'], prep:'',
    c:[['yogur',2,1,3],['fresa',1,0,2]]},
  {id:'c-tostada-atun', n:'Tostadas horneadas de atún con pico de gallo', t:['col','cen'], prep:'Mezcla el atún con el pico de gallo y sírvelo sobre las tostadas.',
    c:[['tostada',1,1,3],['atun',2,1,4],['pico',1,1,1],['aguacate',0,0,1]]},
  {id:'c-licuado', n:'Licuado de leche con plátano y avena', t:['col','des'], prep:'Licúa todo con hielo y canela.',
    c:[['leche',1,1,2,0.5],['platano',1,1,2],['avena',1,0,2]]},
  {id:'c-huevo-naranja', n:'Huevos cocidos con naranja', t:['col'], prep:'',
    c:[['huevo',1,1,2],['naranja',1,1,1]]},
  {id:'c-jicama', n:'Jícama y pepino con limón y cacahuates', t:['col'], prep:'',
    c:[['jicama',1,1,1],['cacahuate',1,1,2]]},
  {id:'c-panela', n:'Queso panela con pepino y chile en polvo', t:['col'], prep:'',
    c:[['panela',1,1,2],['jicama',1,1,1]]},
  {id:'c-platano-yogur', n:'Plátano con yogur griego', t:['col'], prep:'',
    c:[['platano',1,1,2],['yogur',1,1,2]]},
  {id:'m-pollo-verde', n:'Pollo en salsa verde con arroz y frijoles', t:['com'], prep:'Cuece el pollo en la salsa verde; acompaña con arroz, frijoles y ensalada.',
    c:[['pollo',3,2,5],['salsa',0,0,0],['arroz',1,1,3],['frijol',1,0.5,2,0.5],['tortilla',1,0,3],['aceite',1,0,2],['ensalada',1,1,1]]},
  {id:'m-bistec', n:'Bistec a la mexicana con frijoles y tortillas', t:['com'], prep:'Asa el bistec y guísalo con jitomate, cebolla y chile.',
    c:[['res',3,2,5],['mexicana',1,1,1],['aceite',1,0,2],['frijol',1,0.5,2,0.5],['tortilla',2,1,4],['ensalada',1,1,1]]},
  {id:'m-caldo', n:'Caldo de pollo con verduras y arroz', t:['com'], prep:'Hierve la pechuga con las verduras; sirve con arroz, limón y tortillas.',
    c:[['pollo',4,2,5],['verduras',1,1,1],['arroz',1,1,3],['tortilla',2,0,3],['aguacate',0,0,1]]},
  {id:'m-veracruzana', n:'Pescado a la veracruzana con arroz y ensalada', t:['com','cen'], prep:'Cuece el pescado en salsa de jitomate con aceitunas y alcaparras.',
    c:[['pescado',4,2,6],['mexicana',1,1,1],['aceite',1,0,2],['arroz',2,1,3],['tortilla',0,0,2],['ensalada',1,1,1]]},
  {id:'m-tinga', n:'Tinga de pollo en tostadas horneadas', t:['com','cen'], prep:'Guisa el pollo deshebrado con jitomate, cebolla y chipotle.',
    c:[['pollo',3,2,5],['mexicana',1,1,1],['tostada',3,2,4],['frijol',1,0,2,0.5],['aguacate',1,0,2],['ensalada',1,1,1]]},
  {id:'m-lentejas', n:'Sopa de lentejas con queso panela y tortillas', t:['com'], prep:'Cuece las lentejas con jitomate, zanahoria y cebolla.',
    c:[['lenteja',2,1,3],['verduras',1,1,1],['panela',1,1,2],['tortilla',1,1,3],['aceite',0,0,1]]},
  {id:'m-tacos-pollo', n:'Tacos de pollo deshebrado con pico de gallo', t:['com','cen'], prep:'Calienta las tortillas en el comal y rellena con el pollo y el pico de gallo.',
    c:[['tortilla',3,2,5],['pollo',3,2,5],['pico',1,1,1],['aguacate',1,0,2],['frijol',0,0,1,0.5]]},
  {id:'m-pasta-atun', n:'Pasta con atún y verduras', t:['com'], prep:'Mezcla la pasta con el atún, las verduras salteadas y el aceite.',
    c:[['pasta',2,1,4],['atun',3,2,5],['verduras',1,1,1],['aceite',1,0,2]]},
  {id:'m-calabacitas', n:'Calabacitas a la mexicana con panela, frijoles y tortillas', t:['com','cen'], prep:'Guisa las calabacitas con jitomate y agrega el queso en cubos al final.',
    c:[['calabacita',1,1,1],['panela',2,1,3],['frijol',1,0.5,2,0.5],['tortilla',2,1,4],['aceite',1,0,1]]},
  {id:'m-tofu-verde', n:'Tofu en salsa verde con arroz y frijoles', t:['com'], prep:'Dora el tofu en cubos y báñalo en salsa verde.',
    c:[['tofu',3,2,4],['salsa',0,0,0],['arroz',1,1,3],['frijol',1,0.5,2,0.5],['aceite',1,0,1],['ensalada',1,1,1]]},
  {id:'n-tacos-pechuga', n:'Tacos de pechuga asada con calabacitas', t:['cen','com'], prep:'Asa la pechuga en tiras y sirve con calabacitas y salsa.',
    c:[['tortilla',2,1,4],['pollo',3,2,5],['calabacita',1,1,1],['aguacate',0,0,1],['salsa',0,0,0]]},
  {id:'n-quesadillas', n:'Quesadillas de panela con nopales', t:['cen'], prep:'Hazlas en el comal, sin aceite.',
    c:[['tortilla',2,2,3],['panela',2,1,3],['nopal',1,1,1],['salsa',0,0,0]]},
  {id:'n-tostadas-atun', n:'Tostadas de atún a la mexicana', t:['cen'], prep:'Mezcla el atún con jitomate, cebolla y chile; sirve sobre las tostadas.',
    c:[['tostada',2,2,4],['atun',3,2,5],['pico',1,1,1],['aguacate',1,0,1]]},
  {id:'n-ensalada-pollo', n:'Ensalada de pollo con aguacate y tostadas', t:['cen'], prep:'Mezcla la lechuga y el jitomate con el pollo en tiras y el aguacate.',
    c:[['pollo',3,2,5],['ensalada',2,2,2],['aguacate',1,1,2],['tostada',1,1,3]]},
  {id:'n-empapelado', n:'Pescado empapelado con verduras y arroz', t:['cen'], prep:'Envuelve el pescado con las verduras en papel aluminio y hornea 20 minutos.',
    c:[['pescado',3,2,5],['verduras',1,1,1],['arroz',1,1,3],['tortilla',0,0,2],['aceite',1,0,1]]},
];
// Platillos con foto en img/menu/<id>.webp (800×500). Los demás se muestran sin foto.
// MENU_FOTO_IGUAL: platillos parecidos que por ahora usan la foto de otro.
const MENU_FOTOS=new Set(['c-huevo-naranja','c-jicama','c-licuado','c-manzana','c-panela','c-platano-yogur','c-tostada-atun','c-yogur-fresa','d-avena','d-chilaquiles','d-enfrijoladas','d-huevo-mex','d-molletes','d-tacos-huevo','d-tofu-mex','d-yogur','m-bistec','m-calabacitas','m-caldo','m-lentejas','m-pasta-atun','m-pollo-verde','m-tacos-pollo','m-tinga','m-tofu-verde','m-veracruzana','n-empapelado','n-ensalada-pollo','n-quesadillas','n-tacos-pechuga','n-tostadas-atun']);
const MENU_FOTO_IGUAL={};
function menuFotoId(id){ return MENU_FOTOS.has(id)?id:MENU_FOTO_IGUAL[id]||''; }
function menuFotoSrc(id){ return 'img/menu/'+id+'.webp'; }
const MENU_HORAS=[['manana','Mañana'],['mediodia','Mediodía'],['tarde','Tarde o noche'],['','Varía']];
const MENU_PREFS=[['veg','Vegetariano'],['sinLac','Sin lácteos'],['sinGlu','Sin gluten']];
const MENU_TOL_DIA=0.05, MENU_TOL_COMIDA=0.15;   // regla de diseño: ±5 % kcal del día, ±15 % por comida

function menuTiempo(nombre){ return /^Desayuno/.test(nombre)?'des':/^Comida/.test(nombre)?'com':/^Cena/.test(nombre)?'cen':'col'; }
function menuMacros(f,q){
  const a=MENU_ALIM[f], b=a.m||SMAE_EQ[a.g];
  return {k:b.k*q, p:b.p*q, l:b.l*q, c:b.c*q};
}
function menuFrac(v){
  const w=Math.floor(v+1e-6), r=v-w, F=[[0.25,'¼'],[1/3,'⅓'],[0.5,'½'],[2/3,'⅔'],[0.75,'¾']];
  const f=F.find(x=>Math.abs(x[0]-r)<0.04);
  return f ? (w?w+'':'')+f[1] : String(Math.round(v*10)/10);
}
// Texto casero de una porción: "2 tortillas de maíz", "90 g de pechuga…", "½ taza de frijoles…", "¼ de aguacate"
function menuPorcion(f,q){
  const a=MENU_ALIM[f], v=q*(a.por||1);
  if(a.u==='libre') return a.s;
  if(a.u==='g') return Math.round(v)+' g '+a.s;
  if(a.u==='n') return Math.round(v)+' '+(Math.round(v)===1?a.s:a.pl);
  if(a.u==='taza') return menuFrac(v)+' '+(v>1?'tazas ':'taza ')+a.s;
  if(a.u==='cdita') return menuFrac(v)+' '+(v>1?'cditas ':'cdita ')+a.s;
  return v<1 ? (v===0.5?'½ ':menuFrac(v)+' de ')+a.s : menuFrac(v)+' '+(v>1?a.pl:a.s);
}
function menuPlatilloApto(p,pref,esPre){
  return p.c.every(([f,,min])=>{
    const a=MENU_ALIM[f];
    if(pref.veg && (a.carne||a.pescado)) return false;
    if(pref.sinLac && a.lacteo) return false;
    if(pref.sinGlu && a.gluten) return false;
    if(esPre && (a.leg||a.grasa) && min>0) return false;   // pre inmediato: sin leguminosas ni grasa obligatorias
    return true;
  });
}
// Escala las porciones en pasos caseros para acercarse a la meta de la comida (búsqueda local desde varias escalas).
// Si la meta es mayor que el platillo base, los máximos crecen hasta 2× (regla de diseño: metas altas de volumen).
function menuEscalar(p,T,esPre){
  const base=p.c.reduce((a,[f,q])=>a+menuMacros(f,q).k,0)||1, f=Math.min(2,Math.max(1,T.k/base));
  const comps=p.c.map(([fo,q,min,max,paso])=>{
    const a=MENU_ALIM[fo], st=paso||1;
    if(esPre&&(a.leg||a.grasa)) return {f:fo,q0:0,min:0,max:0,st};
    const mx=min===max?max:Math.max(max,Math.round(max*f/st)*st);
    return {f:fo,q0:q,min,max:a.tope?Math.max(min,Math.min(mx,a.tope)):mx,st};
  });
  const medir=q=>{
    let k=0,pr=0,l=0,c=0,dev=0;
    comps.forEach((cp,i)=>{ const m=menuMacros(cp.f,q[i]); k+=m.k; pr+=m.p; l+=m.l; c+=m.c; dev+=Math.abs(q[i]-cp.q0)/cp.st; });
    if(k<=0) return null;
    const eP = pr<T.p ? (T.p-pr)/Math.max(T.p,5)*3 : (pr-T.p)/Math.max(T.p,5);
    const err = Math.abs(k-T.k)/T.k*3 + eP + Math.abs(c-T.c)/Math.max(T.c,20) + Math.abs(l-T.l)/Math.max(T.l,8)*0.7 + dev*0.01;
    return {err,q:q.slice(),k,p:pr,l,c};
  };
  const ajustar=(cp,v)=>Math.min(cp.max,Math.max(cp.min,Math.round(v/cp.st)*cp.st));
  let mejor=null;
  for(const esc of [1,(1+f)/2,f]){
    let act=medir(comps.map(cp=>ajustar(cp,cp.q0*esc)));
    for(let it=0; act && it<80; it++){
      let sig=null;
      comps.forEach((cp,i)=>{ for(const d of [-cp.st,cp.st]){
        const v=Math.round((act.q[i]+d)*100)/100; if(v<cp.min-1e-9||v>cp.max+1e-9) continue;
        const q=act.q.slice(); q[i]=v; const r=medir(q); if(r && r.err<(sig?sig.err:act.err)) sig=r;
      }});
      if(!sig) break; act=sig;
    }
    if(act && (!mejor||act.err<mejor.err)) mejor=act;
  }
  return mejor && Object.assign(mejor,{platillo:p, comps:comps.map((cp,i)=>({f:cp.f,q:mejor.q[i]})).filter(x=>x.q>0||MENU_ALIM[x.f].u==='libre')});
}
function menuProteinaPrincipal(r){
  let top=null, maxP=0;
  r.comps.forEach(x=>{ const a=MENU_ALIM[x.f]; if(!a.prot) return; const pr=menuMacros(x.f,x.q).p; if(pr>maxP){ maxP=pr; top=a.prot; } });
  return top;
}
// Metas por comida: % de kcal del reparto, con el horario de entreno moviendo ~10 % hacia el pre y el post (regla de diseño)
function menuMetasComidas(s,nut,n){
  const plant=(MEAL_TEMPLATES[n]||MEAL_TEMPLATES[4]).map(m=>Object.assign({},m,{tiempo:menuTiempo(m.nombre),pctD:m.pct/100,rol:''}));
  const nombres=plant.map(m=>m.nombre), hora=s.horaEntreno||'';
  let pre=null, post=null;
  if(hora==='manana'){ post='Desayuno'; }
  else if(hora==='mediodia'){ pre=nombres.includes('Colación AM')?'Colación AM':null; post='Comida'; }
  else if(hora==='tarde'){ pre=nombres.find(x=>x==='Colación PM'||x==='Colación')||null; post='Cena'; }
  if(pre||post){
    const rec=plant.filter(m=>m.nombre===pre||m.nombre===post), don=plant.filter(m=>m.nombre!==pre&&m.nombre!==post);
    const totD=don.reduce((a,m)=>a+m.pctD,0);
    don.forEach(m=>{ m.pctD-=0.10*m.pctD/totD; });
    rec.forEach(m=>{ m.pctD+=0.10/rec.length; m.rol=m.nombre===pre?'pre':'post'; });
  }
  const norm=(arr,fn)=>{ const w=arr.map(fn), t=w.reduce((a,b)=>a+b,0); return w.map(x=>x/t); };
  const wP=norm(plant,m=>m.pctD*(m.tiempo==='col'?0.85:1));
  const wC=norm(plant,m=>m.pctD*(m.rol?1.4:1));
  const wL=norm(plant,m=>m.pctD*(m.rol==='pre'?0.3:1));
  return plant.map((m,i)=>Object.assign(m,{pct:Math.round(m.pctD*100), T:{k:nut.kcal*m.pctD, p:nut.prot*wP[i], c:nut.carbs*wC[i], l:nut.grasas*wL[i]}}));
}
function menuDiaSemilla(){ const d=new Date(); return d.getFullYear()*400+d.getMonth()*31+d.getDate(); }
function menuAlternas(s){
  const hoy=fechaISO(new Date());
  if(!s.menuAlt||s.menuAlt.f!==hoy) return {};
  return s.menuAlt.a||{};
}
// Genera el día completo: elige y escala un platillo por comida, sin repetir platillo ni usar la misma proteína más de 2 veces
function generarMenuDia(s,nut,n){
  const pref=s.nutPrefs||{}, alt=menuAlternas(s), semilla=menuDiaSemilla();
  const comidas=menuMetasComidas(s,nut,n), usados=new Set(), proteinas={};
  comidas.forEach((m,i)=>{
    const esPre=m.rol==='pre';
    let cands=MENU_PLATILLOS.filter(p=>p.t.includes(m.tiempo) && !usados.has(p.id) && menuPlatilloApto(p,pref,esPre))
      .map(p=>menuEscalar(p,m.T,esPre)).filter(Boolean)
      .filter(r=>{ const pr=menuProteinaPrincipal(r); return !pr || (proteinas[pr]||0)<2; })
      .sort((a,b)=>a.err-b.err);
    // Se elige entre todos los platillos que cumplen la tolerancia (±15 % kcal, proteína ≥85 %, error total acotado),
    // para que "Otra opción" recorra toda la biblioteca y no solo los 5 más cercanos
    const enTol=cands.filter(r=>Math.abs(r.k-m.T.k)/m.T.k<=MENU_TOL_COMIDA && r.p>=m.T.p*0.85 && r.err<=1);
    const pool=enTol.length?enTol:cands.slice(0,3);
    const r=pool.length ? pool[(semilla+i*7+(alt[m.nombre]||0))%pool.length] : null;
    if(r){ usados.add(r.platillo.id); const pr=menuProteinaPrincipal(r); if(pr) proteinas[pr]=(proteinas[pr]||0)+1; }
    m.r=r; m.opciones=pool.length; m.pool=pool.map(x=>x.platillo);
  });
  // Ajuste del día: si el total se sale de ±5 %, reescala la comida con más holgura hacia la diferencia
  const tot=()=>comidas.reduce((a,m)=>m.r?{k:a.k+m.r.k,p:a.p+m.r.p,l:a.l+m.r.l,c:a.c+m.r.c}:a,{k:0,p:0,l:0,c:0});
  // Primero reescala el mismo platillo; si con eso no alcanza, prueba los otros de su lista (regenerar solo esa comida)
  for(const m of comidas.filter(x=>x.r).sort((a,b)=>b.T.k-a.T.k)){
    const t=tot(), dk=nut.kcal-t.k;
    if(Math.abs(dk)/nut.kcal<=MENU_TOL_DIA) break;
    const T=Object.assign({},m.T,{k:Math.max(80,m.r.k+dk), p:Math.max(0,m.r.p+(nut.prot-t.p)), c:Math.max(0,m.r.c+(nut.carbs-t.c)), l:Math.max(0,m.r.l+(nut.grasas-t.l))});
    const resto=t.k-m.r.k, falta=r=>Math.abs(nut.kcal-(resto+r.k));
    let mejor=m.r;
    for(const pl of [m.r.platillo].concat(m.pool.filter(x=>x!==m.r.platillo))){
      const r2=menuEscalar(pl,T,m.rol==='pre');
      if(r2 && falta(r2)<falta(mejor)-1) mejor=r2;
      if(falta(mejor)/nut.kcal<=MENU_TOL_DIA) break;
    }
    m.r=mejor;
  }
  return {comidas, total:tot()};
}
// Equivalentes del platillo: "2 cereales · 3 origen animal · 1 grasa"
function menuEquivTxt(r){
  const acc={};
  r.comps.forEach(x=>{ const a=MENU_ALIM[x.f]; if(a.g==='LIB') return; const lb=a.lb||SMAE_EQ[a.g].lb; acc[lb[0]]=acc[lb[0]]||{q:0,lb}; acc[lb[0]].q+=x.q; });
  return Object.values(acc).map(o=>menuFrac(o.q)+' '+(o.q>1?o.lb[1]:o.lb[0])).join(' · ');
}

// ── UI ──
function nutMenuOtra(nombre){
  const s=activeSocio; if(!s) return;
  const hoy=fechaISO(new Date());
  if(!s.menuAlt||s.menuAlt.f!==hoy) s.menuAlt={f:hoy,a:{}};
  s.menuAlt.a=Object.assign({},s.menuAlt.a); s.menuAlt.a[nombre]=(s.menuAlt.a[nombre]||0)+1;
  dbSave(s.code); renderNutricionTab();
}
function nutHoraEntreno(v){ const s=activeSocio; if(!s) return; s.horaEntreno=v; dbSave(s.code); renderNutricionTab(); }
function nutPref(k){
  const s=activeSocio; if(!s) return;
  s.nutPrefs=Object.assign({},s.nutPrefs); s.nutPrefs[k]=!s.nutPrefs[k];
  dbSave(s.code); renderNutricionTab();
}
function menuSugeridoHTML(s,nut,nComidas){
  const edad=parseInt(s.edad)||0, menor=edad>0&&edad<18;
  const sel=`<div class="q-sub" style="margin:2px 0 8px">¿En cuántas comidas repartes tu día?</div>
    <div class="comida-sel">${[3,4,5,6].map(n=>`<button type="button" class="${n===nComidas?'on':''}" onclick="nutElegirComidas(${n})">${n}</button>`).join('')}</div>`;
  if(edad>0 && edad<12) return `<div class="card"><div class="card-t">${it('food','sm')}Tu menú</div>
    <p class="mn-aviso">A tu edad, lo que comes lo decide tu familia con tu pediatra. Pide en recepción la guía del Plato del Bien Comer para tus papás.</p></div>`;
  const hora=s.horaEntreno||'', pref=s.nutPrefs||{};
  const dia=generarMenuDia(s,nut,nComidas), t=dia.total;
  const dev=nut.kcal?(t.k-nut.kcal)/nut.kcal:0, ok=Math.abs(dev)<=MENU_TOL_DIA;
  const num=x=>Math.round(x).toLocaleString('es-MX');
  return `<div class="card">
    <div class="card-t">${it('food','sm')}Tu menú de hoy</div>
    ${sel}
    <div class="q-sub" style="margin:2px 0 8px">¿A qué hora entrenas?</div>
    <div class="chips-row">${MENU_HORAS.map(([v,lb])=>`<button type="button" class="chip-sel ${hora===v?'ac':''}" aria-pressed="${hora===v}" onclick="nutHoraEntreno('${v}')">${lb}</button>`).join('')}</div>
    <div class="chips-row">${MENU_PREFS.map(([k,lb])=>`<button type="button" class="chip-sel ${pref[k]?'ac':''}" aria-pressed="${!!pref[k]}" onclick="nutPref('${k}')">${pref[k]?ico('check')+' ':''}${lb}</button>`).join('')}</div>
    <div class="comida-list">
      ${dia.comidas.map(m=>`<div class="comida-it mn-it">
        <div class="comida-it-h"><span class="comida-tag ${m.tag}">${m.tag==='ligera'?'Colación':m.tag==='fuerte'?'Comida fuerte':'Comida media'}</span><b>${esc(m.nombre)}</b>${m.rol?`<span class="mn-rol">${m.rol==='pre'?'Antes de entrenar':'Después de entrenar'}</span>`:''}<span class="comida-kcal">${m.pct}%${menor?'':' · ~'+num(m.T.k)+' kcal'}</span></div>
        ${m.r&&menuFotoId(m.r.platillo.id)?`<img class="mn-foto" src="${menuFotoSrc(menuFotoId(m.r.platillo.id))}" alt="${esc(m.r.platillo.n)}" width="800" height="500" loading="lazy" decoding="async">`:''}
        ${m.r?`<div class="mn-plat"><b>${esc(m.r.platillo.n)}</b>${m.opciones>1?`<button type="button" class="mn-otra" onclick="nutMenuOtra('${esc(m.nombre)}')" aria-label="Otra opción para ${esc(m.nombre)}">${ico('refresh')}Otra opción</button>`:''}</div>
        <ul class="mn-ing">${m.r.comps.map(x=>`<li>${esc(menuPorcion(x.f,x.q))}</li>`).join('')}</ul>
        ${m.r.platillo.prep?`<div class="mn-prep">${esc(m.r.platillo.prep)}</div>`:''}
        <div class="mn-eq">${esc(menuEquivTxt(m.r))}${menor?'':` <span>· ${num(m.r.k)} kcal · P ${num(m.r.p)} g · C ${num(m.r.c)} g · G ${num(m.r.l)} g</span>`}</div>`
        :`<div class="comida-plato">No encontramos un platillo con tus filtros para esta comida. Quita algún filtro o pide ayuda a tu entrenador.</div>`}
        ${hora==='manana'&&m.nombre==='Desayuno'?`<div class="mn-prep">Antes de entrenar: ½ plátano o un yogur. Si la sesión dura menos de 1 hora, también puedes entrenar en ayunas.</div>`:''}
      </div>`).join('')}
    </div>
    ${menor?`<p class="mn-aviso">Eres menor de edad: tu menú cubre lo que gastas, sin dietas para bajar de peso. Si quieres cambiar tu peso, platícalo con tus papás y tu médico.</p>`
      :`<div class="mn-total ${ok?'ok':'warn'}">${ico(ok?'check':'warn')}<span><b>Total del día: ${num(t.k)} kcal</b> (${dev>=0?'+':''}${Math.round(dev*100)}% de tu meta) · P ${num(t.p)} g · C ${num(t.c)} g · G ${num(t.l)} g</span></div>`}
    <div class="f-nota" style="margin-top:10px">Sugerencia educativa, armada con los equivalentes del Sistema Mexicano de Alimentos Equivalentes; algunas porciones son aproximadas. No sustituye la consulta: si tienes diabetes, enfermedad renal, embarazo, alergias o alguna condición médica, revisa tu alimentación con tu médico o nutriólogo.</div>
  </div>`;
}
