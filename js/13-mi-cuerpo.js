/* ═══ Mi cuerpo · mapa muscular ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   Ilustraciones anatómicas (img/cuerpo/, frente · espalda · lateral) con una zona tocable invisible por músculo.
   Al tocar un músculo o una medida: se ilumina, la vista se acerca y la ficha muestra su avance (medida con cinta,
   fuerza del ejercicio clave, series de la semana), los músculos que forman el grupo y tips para trabajarlo.
   Todo sale de s.logs.medidas y s.logs.sesiones; no es un diagnóstico. ═══ */
let mc = null;   // vista abierta: {root, full, S, vb, datos, ...}. Solo una a la vez (inline o pantalla completa).

/* ── Figura: coordenadas en píxeles de la ilustración (1024×1536). En frente y espalda se traza la mitad
   izquierda y se refleja (m:1); la lateral izquierda es la derecha volteada. ── */
const MC_W=1024, MC_H=1536;
const MC_IMG={frente:'img/cuerpo/frente.webp',espalda:'img/cuerpo/espalda.webp',lado:'img/cuerpo/lado.webp'};
const MC_VISTAS={
  frente:[
    {k:'trap_f',m:1,d:'M470,215 C475,235 485,250 500,258 L392,256 C420,248 448,236 470,215Z'},
    {k:'scm',m:1,d:'M470,175 C478,205 490,235 505,262 L496,264 C482,240 470,210 462,180Z'},
    {k:'delt_f',m:1,d:'M300,276 C320,258 360,250 392,256 C380,280 372,310 368,345 C355,352 340,356 325,362 C310,368 300,372 294,360 C288,330 290,300 300,276Z'},
    {k:'pec',m:1,d:'M392,256 C430,256 470,258 505,262 L506,388 C480,398 445,398 418,388 C395,378 378,362 368,345 C372,310 380,280 392,256Z'},
    {k:'tri_f',m:1,d:'M294,360 C305,368 315,374 322,384 C310,420 302,460 302,495 L282,500 C278,465 282,420 294,360Z'},
    {k:'bic',m:1,d:'M340,356 C356,352 368,350 372,360 C370,400 360,440 345,475 C335,492 320,500 308,498 C302,470 306,430 316,400 C322,380 330,365 340,356Z'},
    {k:'brq',m:1,d:'M262,490 C272,486 282,484 292,484 C282,540 260,610 232,665 L212,664 C215,630 222,590 232,555 C240,530 250,505 262,490Z'},
    {k:'flex',m:1,d:'M292,484 C306,482 320,482 330,490 C330,530 322,570 305,605 C290,635 270,655 250,668 L232,665 C260,610 282,540 292,484Z'},
    {k:'serr',m:1,d:'M385,398 C410,400 435,405 450,410 L452,470 C430,475 410,480 392,490 C388,460 384,430 385,398Z'},
    {k:'obl',m:1,d:'M392,490 C412,480 432,475 452,470 L455,560 C458,590 465,615 470,630 C450,620 425,610 402,605 C398,570 396,530 392,490Z'},
    {k:'abs',m:1,d:'M452,395 C470,392 495,392 511,394 L511,690 C495,680 480,660 470,630 C460,600 455,560 452,520 C450,470 450,430 452,395Z'},
    {k:'tfl',m:1,d:'M380,610 C392,616 400,622 404,632 L392,680 C382,690 372,690 368,680 C368,655 372,630 380,610Z'},
    {k:'vl',m:1,d:'M368,680 C372,690 382,690 392,680 C390,740 392,800 392,850 C392,900 388,935 380,960 C362,940 352,900 350,840 C350,780 356,720 368,680Z'},
    {k:'rf',m:1,d:'M404,632 C415,650 425,670 432,700 C440,760 436,840 424,900 C414,915 402,915 396,900 C392,840 390,760 392,700 C394,670 398,650 404,632Z'},
    {k:'sar',m:1,d:'M412,628 L424,624 C442,690 462,780 482,880 L470,892 C450,790 428,700 412,628Z'},
    {k:'add',m:1,d:'M440,660 C460,680 485,700 500,740 C495,780 485,820 472,850 C458,800 446,740 440,660Z'},
    {k:'vm',m:1,d:'M445,850 C462,872 470,905 462,940 C452,955 432,955 425,940 C428,910 436,875 445,850Z'},
    {k:'per',m:1,d:'M340,1060 C343,1052 347,1046 352,1040 C344,1110 350,1190 362,1255 L355,1258 C340,1200 332,1120 340,1060Z'},
    {k:'tib',m:1,d:'M352,1040 C365,1035 378,1035 384,1040 C384,1100 382,1170 378,1250 L362,1255 C352,1190 344,1110 352,1040Z'},
    {k:'gem_f',m:1,d:'M410,1030 C430,1040 450,1070 452,1120 C452,1160 440,1185 425,1195 C415,1160 410,1100 410,1030Z'},
    {k:'sol_f',m:1,d:'M425,1195 C436,1188 445,1176 449,1160 C447,1200 440,1240 430,1262 L421,1262 C422,1238 424,1215 425,1195Z'},
  ],
  espalda:[
    {k:'trap_b',m:1,d:'M495,140 C485,175 455,200 420,220 C395,232 375,240 362,246 C395,250 425,262 440,280 C455,320 470,370 490,430 C500,460 508,490 512,500 L512,140Z'},
    {k:'delt_b',m:1,d:'M300,282 C318,258 345,248 370,250 C385,258 395,268 398,280 C385,300 370,315 355,330 C340,345 320,360 300,372 C292,345 292,310 300,282Z'},
    {k:'infra',m:1,d:'M398,280 C420,285 440,295 450,310 C455,335 455,355 450,370 C430,368 400,362 375,350 C370,335 368,325 365,315 C378,300 388,290 398,280Z'},
    {k:'red',m:1,d:'M375,350 C400,362 430,368 450,372 L446,392 C420,392 395,385 372,376Z'},
    {k:'dor',m:1,d:'M372,380 C405,392 445,398 480,395 C490,420 500,445 505,470 C485,500 460,530 440,560 C425,575 412,575 405,560 C395,520 385,470 372,380Z'},
    {k:'erec',m:1,d:'M490,470 C500,500 505,540 508,585 L478,590 C478,550 482,505 490,470Z'},
    {k:'tri_b',m:1,d:'M300,368 C320,358 342,345 362,338 C372,370 372,420 365,460 C358,485 345,500 330,505 C310,505 290,505 282,500 C276,460 282,410 300,368Z'},
    {k:'ext',m:1,d:'M262,490 C285,484 315,480 330,492 C328,530 318,570 300,605 C285,635 268,655 250,668 L210,665 C212,630 220,590 230,555 C238,525 250,505 262,490Z'},
    {k:'gmed',m:1,d:'M398,505 C420,520 445,535 465,548 C460,565 440,575 405,580 C398,560 396,530 398,505Z'},
    {k:'gmax',m:1,d:'M405,588 C440,580 480,592 500,625 C510,655 510,690 505,712 C480,740 445,752 415,748 C395,730 388,690 390,650 C392,620 396,600 405,588Z'},
    {k:'bf',m:1,d:'M375,760 C395,752 420,750 432,752 C432,820 425,890 410,960 C400,975 385,980 375,970 C365,900 365,830 375,760Z'},
    {k:'st',m:1,d:'M435,752 C455,750 478,748 492,755 C490,820 480,890 465,960 C455,975 442,975 432,965 C430,890 432,820 435,752Z'},
    {k:'sol',m:1,d:'M355,1150 C370,1168 390,1175 402,1175 C420,1182 440,1180 455,1168 C450,1200 440,1235 430,1260 L370,1260 C362,1230 356,1190 355,1150Z'},
    {k:'gl',m:1,d:'M372,1012 C390,1005 400,1012 400,1030 C402,1080 402,1130 398,1172 C380,1170 360,1160 352,1140 C344,1100 348,1050 372,1012Z'},
    {k:'gm',m:1,d:'M420,1012 C440,1018 455,1040 460,1090 C463,1130 455,1165 432,1180 C415,1182 404,1175 402,1165 C402,1110 404,1060 420,1012Z'},
  ],
  lado:[
    {k:'trap_s',d:'M445,180 C470,182 500,180 520,178 C525,200 530,215 535,232 C500,228 470,228 440,232 C440,212 442,195 445,180Z'},
    {k:'pec_s',d:'M528,255 C560,262 590,290 610,330 C618,355 612,380 595,392 C570,395 545,385 530,370 C532,330 532,290 528,255Z'},
    {k:'obl_s',d:'M528,395 C555,400 585,400 610,395 C612,450 610,520 602,590 C580,595 555,595 535,590 C528,520 525,455 528,395Z'},
    {k:'glu_s',d:'M430,585 C450,590 470,610 478,640 C480,680 475,720 460,745 C440,750 410,745 400,725 C392,690 392,640 405,605 C412,592 420,585 430,585Z'},
    {k:'tfl_s',d:'M478,640 C500,650 520,675 525,700 C510,712 490,725 478,745 C480,710 480,675 478,640Z'},
    {k:'isq_s',d:'M420,760 C440,758 462,760 480,770 C482,840 480,900 476,960 L452,962 C438,900 425,830 420,760Z'},
    {k:'vl_s',d:'M478,745 C520,742 570,740 602,745 C605,820 598,890 585,960 L476,960 C480,900 482,830 478,745Z'},
    {k:'gem_s',d:'M425,1000 C445,1010 455,1030 458,1060 C460,1110 455,1150 442,1172 C420,1170 400,1155 392,1125 C388,1080 398,1030 425,1000Z'},
    {k:'sol_s',d:'M405,1160 C420,1172 435,1175 448,1172 C448,1210 445,1250 440,1290 L425,1290 C418,1250 410,1205 405,1160Z'},
    {k:'per_s',d:'M462,1030 C472,1035 480,1040 484,1050 C482,1120 478,1200 470,1265 L458,1265 C460,1190 462,1110 462,1030Z'},
    {k:'tib_s',d:'M488,1015 C500,1020 510,1025 515,1035 C512,1100 508,1200 500,1290 L488,1290 C486,1200 486,1100 488,1015Z'},
    {k:'tri_s',d:'M398,325 C420,340 445,350 470,365 C472,400 470,440 462,470 C445,478 425,478 412,470 C400,430 395,380 398,325Z'},
    {k:'bic_s',d:'M482,370 C495,365 508,355 520,345 C522,390 520,430 510,470 L480,472 C478,435 478,400 482,370Z'},
    {k:'ant_s',d:'M425,475 C455,468 490,468 512,475 C520,520 535,590 545,645 L488,655 C470,610 450,560 435,525 C428,505 424,490 425,475Z'},
    {k:'delt_s',d:'M395,285 C410,250 450,232 495,235 C520,240 532,265 530,300 C528,330 515,355 490,372 C470,378 450,372 432,360 C410,345 395,320 395,285Z'},
  ]
};
// encuadre completo de cada ilustración (la lateral se recorta al cuerpo, que ocupa el centro)
const MC_FULL={frente:{x:0,y:0,w:MC_W,h:MC_H},espalda:{x:0,y:0,w:MC_W,h:MC_H},lado:{x:212,y:0,w:600,h:MC_H}};
// Mujer: mismas poses y encuadre que las de hombre, así que se reusan sus zonas con ajustes donde cambia el cuerpo
// (hombros y brazos más angostos, pecho que baja un poco más). Cada regla mueve los puntos (x,y) de esas zonas.
function mcAjustar(vistas,reglas){
  const R={};
  Object.entries(vistas).forEach(([v,lista])=>{ R[v]=lista.map(it=>{
    const f=(reglas[v]||{})[it.k]; if(!f) return it;
    return {...it,d:it.d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,(_,x,y)=>f(+x,+y).map(n=>Math.round(n)).join(','))};
  }); });
  return R;
}
const mcAlCentro=f=>(x,y)=>[512+(x-512)*f,y];   // acerca al eje del cuerpo
const MC_VISTAS_MUJER=mcAjustar(MC_VISTAS,{
  frente:{delt_f:mcAlCentro(.97),tri_f:mcAlCentro(.97),bic:mcAlCentro(.98),brq:mcAlCentro(.97),flex:mcAlCentro(.97),vl:mcAlCentro(.985),
    pec:(x,y)=>[x,y>330?y+(y-330)*.4:y]},
  espalda:{delt_b:mcAlCentro(.97),tri_b:mcAlCentro(.97),ext:mcAlCentro(.97)},
  lado:{tri_s:(x,y)=>[x+8,y],pec_s:(x,y)=>[528+(x-528)*1.12,255+(y-255)*1.15]}
});
// Figura según el género de la entrevista (Masculino / Femenino)
const MC_FIGURAS={
  hombre:{img:MC_IMG,vistas:MC_VISTAS,full:MC_FULL},
  mujer:{img:{frente:'img/cuerpo/mujer-frente.webp',espalda:'img/cuerpo/mujer-espalda.webp',lado:'img/cuerpo/mujer-lado.webp'},vistas:MC_VISTAS_MUJER,full:MC_FULL}
};
function mcFigura(s){ return MC_FIGURAS[/MUJER|FEMEN/i.test((s&&s.genero)||'')?'mujer':'hombre']||MC_FIGURAS.hombre; }

/* ── Grupos musculares: zonas, medida con cinta que lo sigue, ejercicios que lo trabajan y contenido de la ficha.
   rx: respaldo para reconocer ejercicios que el motor de rutinas no clasifica (grupoVol). meta: series por semana. ── */
const MC_G={
  hombros:{n:'Hombros',lat:'Deltoides',v:'frente',k:['delt_f','delt_b','delt_s'],med:'hombros',meta:10,rx:/militar|hombro|deltoid|elevacion(es)? lateral|pajaro|face pull|arnold/,
    mus:[{n:'Deltoides anterior',k:['delt_f'],f:'Eleva el brazo hacia el frente',ej:'Press militar'},
      {n:'Deltoides lateral',k:['delt_s'],f:'Abre el brazo hacia el lado; da la anchura',ej:'Elevaciones laterales'},
      {n:'Deltoides posterior',k:['delt_b'],f:'Lleva el brazo hacia atrás',ej:'Pájaros · face pull'},
      {n:'Manguito rotador',k:[],f:'Estabiliza la articulación del hombro',ej:'Rotación externa con banda'}],
    tips:[['Técnica','En el press militar aprieta glúteos y abdomen para no arquear la espalda baja. Baja la barra hasta la barbilla.'],
      ['Volumen','El deltoides lateral da la anchura: suma de 8 a 12 series por semana de elevaciones laterales con un peso que controles.'],
      ['Equilibrio','Por cada serie de empuje haz una de face pull para cuidar el hombro posterior.']]},
  pecho:{n:'Pecho',lat:'Pectoral mayor',v:'frente',k:['pec','serr','pec_s'],med:'pecho',meta:10,rx:/pecho|pectoral|banca|apertura|lagartija|flexion(es)? de brazo|cruce|fondos/,
    mus:[{n:'Pectoral mayor',k:['pec','pec_s'],f:'Empuja y cierra el brazo hacia el centro',ej:'Press de banca'},
      {n:'Serrato anterior',k:['serr'],f:'Pega el omóplato a las costillas',ej:'Push-up plus'},
      {n:'Pectoral menor',k:[],f:'Baja y adelanta el hombro (bajo el pectoral mayor)',ej:'Fondos en paralelas'}],
    tips:[['Técnica','Junta y baja los omóplatos antes de bajar la barra: así trabaja el pecho y no el hombro.'],
      ['Variedad','Alterna banco plano e inclinado a 30° para trabajar la parte alta del pectoral.'],
      ['Tempo','Baja en 2 a 3 segundos y haz una pausa breve abajo: más tensión con el mismo peso.']]},
  biceps:{n:'Bíceps',lat:'Brazo anterior',v:'frente',k:['bic','bic_s'],med:'brazo',meta:8,rx:/curl(?! (de )?(femoral|pierna|muneca))|biceps|martillo/,
    mus:[{n:'Bíceps braquial',k:['bic','bic_s'],f:'Dobla el codo y gira la palma hacia arriba',ej:'Curl con barra'},
      {n:'Braquial',k:[],f:'Flexor principal del codo, bajo el bíceps',ej:'Curl martillo'},
      {n:'Coracobraquial',k:[],f:'Acerca el brazo al cuerpo',ej:'Curl araña'}],
    tips:[['Técnica','Codos fijos junto al cuerpo. Si balanceas el torso, el peso es demasiado.'],
      ['Activación','Gira la palma hacia arriba al subir la mancuerna para activar más el bíceps.'],
      ['Grosor','El curl martillo trabaja el braquial, que empuja el bíceps hacia afuera y suma centímetros.']]},
  triceps:{n:'Tríceps',lat:'Brazo posterior',v:'espalda',k:['tri_f','tri_b','tri_s'],med:'brazo',meta:8,sinPunto:['frente'],rx:/triceps|frances|press cerrado|patada|extension(es)? (de|sobre|con) (codo|la cabeza|polea)|copa/,
    mus:[{n:'Cabeza larga',k:['tri_b'],f:'La más grande; también lleva el brazo atrás',ej:'Extensión sobre la cabeza'},
      {n:'Cabeza lateral',k:['tri_f','tri_s'],f:'Da la forma de herradura al brazo',ej:'Jalón en polea'},
      {n:'Cabeza medial',k:[],f:'Extiende el codo en todo momento',ej:'Press cerrado'}],
    tips:[['Proporción','El tríceps ocupa cerca de dos tercios del brazo: para ganar centímetros trabájalo tanto como el bíceps.'],
      ['Estiramiento','Las extensiones con el brazo sobre la cabeza estiran la cabeza larga, la de mayor tamaño.'],
      ['Técnica','Extiende el codo por completo arriba, sin golpear la articulación.']]},
  antebrazo:{n:'Antebrazo',lat:'Flexores y extensores',v:'frente',k:['brq','flex','ext','ant_s'],med:'antebrazo',meta:4,rx:/muneca|granjero|antebrazo|agarre/,
    mus:[{n:'Braquiorradial',k:['brq'],f:'Dobla el codo con la mano de lado',ej:'Curl martillo'},
      {n:'Flexores',k:['flex'],f:'Cierran la mano y doblan la muñeca',ej:'Curl de muñeca'},
      {n:'Extensores',k:['ext','ant_s'],f:'Abren la mano y levantan la muñeca',ej:'Curl de muñeca inverso'}],
    tips:[['Agarre','Sostén peso pesado: paseo del granjero de 30 a 40 segundos al final de la sesión.'],
      ['Repeticiones','Curl de muñeca y curl inverso: 2 a 3 series de 15 a 20 repeticiones.'],
      ['Straps','Deja los straps para las series más pesadas; en las ligeras deja que el antebrazo trabaje.']]},
  abdomen:{n:'Abdomen',lat:'Zona media',v:'frente',k:['obl','abs','obl_s'],med:'cintura',bajar:1,meta:8,rx:/plancha|crunch|abdomin|pallof|rueda|dead bug|bicho muerto|hollow|elevacion(es)? de (piernas|rodillas)|russian|oblicuo|core/,
    mus:[{n:'Recto abdominal',k:['abs'],f:'Flexiona el tronco; el “six pack”',ej:'Crunch en polea'},
      {n:'Oblicuo externo',k:['obl','obl_s'],f:'Gira e inclina el tronco',ej:'Pallof press'},
      {n:'Transverso abdominal',k:[],f:'Faja interna que protege la espalda baja',ej:'Vacío abdominal · plancha'}],
    tips:[['Nutrición','La cintura baja más por la alimentación que por los abdominales: cuida tus calorías y tu proteína.'],
      ['Bracing','Antes de cada levantamiento toma aire y aprieta el abdomen como si fueras a recibir un golpe.'],
      ['Variedad','Combina ejercicios que resisten el movimiento (plancha, pallof) con flexión (crunch en polea).']]},
  trapecio:{n:'Trapecio y cuello',lat:'Trapecio',v:'espalda',k:['trap_f','scm','trap_b','trap_s'],med:'cuello',meta:6,rx:/encogimiento|shrug|trapecio|remo al menton/,
    mus:[{n:'Trapecio superior',k:['trap_f','trap_s'],f:'Sube los hombros',ej:'Encogimientos'},
      {n:'Trapecio medio e inferior',k:['trap_b'],f:'Junta y baja los omóplatos',ej:'Remo con codos abiertos'},
      {n:'Esternocleidomastoideo',k:['scm'],f:'Gira y flexiona el cuello',ej:'Flexión de cuello con banda'}],
    tips:[['Técnica','En los encogimientos sube recto hacia las orejas y pausa 1 segundo arriba, sin girar los hombros.'],
      ['Postura','El trapecio medio e inferior se trabaja con remos con los codos abiertos y elevaciones en Y.'],
      ['Tensión','Si sientes el cuello tenso al empujar, baja los hombros, lejos de las orejas.']]},
  espalda:{n:'Espalda',lat:'Dorsal ancho',v:'espalda',k:['dor','erec','infra','red'],med:null,meta:10,rx:/remo|jalon|dominada|dorsal|pull ?over|espalda|hiperextension/,
    mus:[{n:'Dorsal ancho',k:['dor'],f:'Baja y lleva el brazo atrás; da la forma de V',ej:'Dominadas · jalón'},
      {n:'Infraespinoso',k:['infra'],f:'Gira el brazo hacia afuera',ej:'Face pull'},
      {n:'Redondo mayor',k:['red'],f:'Ayuda al dorsal a bajar el brazo',ej:'Jalón al pecho'},
      {n:'Erectores de la columna',k:['erec'],f:'Mantienen la espalda recta',ej:'Peso muerto'},
      {n:'Romboides',k:[],f:'Juntan los omóplatos (bajo el trapecio)',ej:'Remo sentado'}],
    tips:[['Técnica','Empieza cada jalón bajando los omóplatos; después tira con los codos, no con las manos.'],
      ['Planos','Cada semana combina un movimiento vertical (dominada o jalón) y uno horizontal (remo).'],
      ['Equilibrio','Haz entre 2 y 3 series de remo por cada serie de press para cuidar la postura.']]},
  gluteos:{n:'Glúteos',lat:'Cadera',v:'espalda',k:['gmed','gmax','glu_s','tfl','tfl_s'],med:'cadera',bajar:1,meta:10,rx:/gluteo|hip thrust|puente|patada de gluteo|abduc/,
    mus:[{n:'Glúteo mayor',k:['gmax','glu_s'],f:'Extiende la cadera: te impulsa al subir y correr',ej:'Hip thrust'},
      {n:'Glúteo medio',k:['gmed'],f:'Estabiliza la pelvis y la rodilla',ej:'Abducción con banda'},
      {n:'Tensor de la fascia lata',k:['tfl','tfl_s'],f:'Abre y estabiliza la cadera',ej:'Caminata lateral'}],
    tips:[['Técnica','En el hip thrust lleva el mentón al pecho y haz una pausa de 1 segundo arriba apretando glúteos.'],
      ['Rango','Baja más en la sentadilla (muslo paralelo o más abajo) para que el glúteo trabaje estirado.'],
      ['Rodillas','El glúteo medio protege la rodilla: incluye abducciones o caminatas con banda.']]},
  cuadriceps:{n:'Cuádriceps',lat:'Muslo anterior',v:'frente',k:['vl','rf','vm','add','sar','vl_s'],med:'muslo',meta:10,rx:/sentadilla|prensa|extension(es)? de (rodilla|pierna)|desplante|zancada|bulgara|step|hack/,
    mus:[{n:'Recto femoral',k:['rf'],f:'Extiende la rodilla y flexiona la cadera',ej:'Sentadilla'},
      {n:'Vasto lateral',k:['vl','vl_s'],f:'El más grande; da volumen por fuera',ej:'Prensa'},
      {n:'Vasto medial',k:['vm'],f:'La “gota” sobre la rodilla; la estabiliza',ej:'Extensión de rodilla'},
      {n:'Sartorio',k:['sar'],f:'Cruza el muslo; dobla y gira la cadera',ej:'Zancadas'},
      {n:'Aductores',k:['add'],f:'Cierran la pierna hacia el centro',ej:'Sentadilla sumo'}],
    tips:[['Técnica','Rodillas en la dirección de las puntas de los pies; pueden pasar la punta si el talón sigue apoyado.'],
      ['Énfasis','La sentadilla búlgara y la prensa con pies bajos cargan más el cuádriceps.'],
      ['Rodilla','Extensiones con pausa arriba para el vasto medial, clave para estabilizar la rodilla.']]},
  femoral:{n:'Femoral',lat:'Isquiotibiales',v:'espalda',k:['bf','st','isq_s'],med:'muslo',meta:8,rx:/femoral|isquio|rumano|peso muerto|curl (de )?pierna|good morning|buenos dias|nordico/,
    mus:[{n:'Bíceps femoral',k:['bf','isq_s'],f:'Dobla la rodilla y extiende la cadera',ej:'Curl femoral'},
      {n:'Semitendinoso y semimembranoso',k:['st'],f:'Parte interna; frenan la rodilla al correr',ej:'Peso muerto rumano'}],
    tips:[['Técnica','En el peso muerto rumano lleva la cadera atrás con las rodillas un poco dobladas, hasta sentir el estiramiento.'],
      ['Combinación','Combina un ejercicio de cadera (rumano) con uno de rodilla (curl femoral) cada semana.'],
      ['Prevención','Un femoral fuerte protege la rodilla y reduce lesiones al correr o cambiar de dirección.']]},
  pantorrilla:{n:'Pantorrilla',lat:'Gemelos y sóleo',v:'espalda',k:['tib','per','gem_f','sol_f','gl','gm','sol','gem_s','sol_s','tib_s','per_s'],med:'pantorrilla',meta:6,rx:/talon|talones|gemelo|pantorrilla|soleo|puntas/,
    mus:[{n:'Gastrocnemio',k:['gl','gm','gem_f','gem_s'],f:'Eleva el talón con la rodilla estirada',ej:'Elevación de talones de pie'},
      {n:'Sóleo',k:['sol','sol_s','sol_f'],f:'Eleva el talón con la rodilla doblada',ej:'Elevación de talones sentado'},
      {n:'Tibial anterior',k:['tib','tib_s'],f:'Sube la punta del pie',ej:'Elevación de puntas'},
      {n:'Peroneos',k:['per','per_s'],f:'Estabilizan el tobillo',ej:'Equilibrio en una pierna'}],
    tips:[['Rango','Baja el talón hasta estirar y sube hasta la punta, con pausa de 1 a 2 segundos abajo.'],
      ['Ambos','Gemelo con la rodilla estirada (de pie) y sóleo con la rodilla doblada (sentado): haz los dos.'],
      ['Frecuencia','Responde bien a la frecuencia: 3 veces por semana con 10 a 20 repeticiones.']]},
};
const MC_K2G={}; Object.entries(MC_G).forEach(([g,o])=>o.k.forEach(k=>MC_K2G[k]=g));
// Medidas con cinta en el orden de las tarjetas y el grupo que eligen al tocarlas
const MC_MED=[['hombros','hombros'],['pecho','pecho'],['brazo','biceps'],['antebrazo','antebrazo'],['cintura','abdomen'],['cadera','gluteos'],['muslo','cuadriceps'],['pantorrilla','pantorrilla'],['cuello','trapecio']];
// grupoVol (js/14-motor-rutinas.js) → grupo del mapa
const MC_VOL={'hombro':'hombros','pecho':'pecho','bíceps':'biceps','tríceps':'triceps','espalda':'espalda','glúteo':'gluteos','cuádriceps':'cuadriceps','femoral':'femoral','pantorrilla':'pantorrilla'};
const MC_EST={up:['En crecimiento','mc-e-up'],eq:['Estable','mc-e-eq'],dn:['Rezagado','mc-e-dn'],rec:['En recuperación','mc-e-rec'],nd:['Sin datos aún','mc-e-nd']};
const MC_NV={frente:'Vista frontal',espalda:'Vista posterior',izq:'Lateral izquierda',der:'Lateral derecha'};
const MC_ORDEN=['frente','der','espalda','izq'];
const MC_NS='http://www.w3.org/2000/svg';
const MC_ESPEJO=`matrix(-1 0 0 1 ${MC_W} 0)`;

const mcCapa=v=>v==='izq'||v==='der'?'lado':v;
const mcFmt=v=>(Math.round(v*10)/10).toString();
const mcEl=(t,a)=>{ const e=document.createElementNS(MC_NS,t); for(const k in a) e.setAttribute(k,a[k]); return e; };
const mcClamp=v=>Math.max(0,Math.min(100,v));
function mcColor(p){ // avance 0–100 → gris → verde → lima
  const a=[52,66,78],b=[120,150,40],c=[200,242,58],t=Math.max(0,Math.min(1,(p-30)/50));
  const [x,y,u]=t<.5?[a,b,t*2]:[b,c,(t-.5)*2];
  return `rgb(${x.map((v,i)=>Math.round(v+(y[i]-v)*u)).join(',')})`;
}
function mcNombreMed(id){ const c=MED_CAMPOS.find(x=>x.id===id); return c?sc(c.nm):id; }
const mcDias=f=>Math.round((new Date(fechaISO(new Date())+'T12:00')-new Date(f+'T12:00'))/864e5);

/* ═══ Datos del socio por grupo ═══ */
function mcGrupoDeEj(nm){
  if(!nm) return null;
  if(typeof grupoVol==='function'){ try{ const g=MC_VOL[grupoVol({nm})]; if(g) return g; }catch(e){} }
  const t=kbNorm(nm);
  for(const [g,o] of Object.entries(MC_G)) if(o.rx.test(t)) return g;
  return null;
}
function mcDatos(s){
  const medidas=comoArray(s.logs?.medidas).filter(Boolean);
  const ses=comoArray(s.logs?.sesiones).filter(x=>x&&x.fecha).sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
  const hoy=fechaISO(new Date()), hace7=fechaISO(new Date(Date.now()-6*864e5));
  const D={}; Object.keys(MC_G).forEach(g=>D[g]={ej:{},series:0,ultima:null});
  ses.forEach(x=>comoArray(x.detalle).forEach(d=>{
    const g=d&&mcGrupoDeEj(d.n); if(!g) return;
    const o=D[g]; o.ultima=x.fecha;
    if(x.fecha>=hace7 && x.fecha<=hoy) o.series+=(+d.s||0);
    // mejor serie del día: 1RM estimado (Epley) si hay repeticiones; si no, el peso; en isométricos, los segundos
    let v=null, u='kg';
    const sr=comoArray(d.sr).filter(p=>p&&+p[0]>0);
    if(sr.length) v=Math.max(...sr.map(([kg,r])=>+r>0&&+r<=20?kg*(1+r/30):+kg));
    else if(+d.kg>0) v=+d.kg;
    else if(+d.seg>0){ v=+d.seg; u='s'; }
    if(v==null) return;
    const e=o.ej[d.n]||(o.ej[d.n]={u,pts:{}});
    if(e.u===u) e.pts[x.fecha]=Math.max(e.pts[x.fecha]||0,Math.round(v*10)/10);
  }));
  const R={};
  Object.entries(MC_G).forEach(([g,G])=>{
    const o=D[g];
    const serieMed=G.med?medidas.filter(m=>+m[G.med]).map(m=>({fecha:m.fecha,v:+m[G.med]})):[];
    // ejercicio clave: el que más veces registró con carga en este grupo
    const [nmClave,ej]=Object.entries(o.ej).sort((a,b)=>Object.keys(b[1].pts).length-Object.keys(a[1].pts).length)[0]||[];
    const serieFz=ej?Object.entries(ej.pts).sort().map(([fecha,v])=>({fecha,v})).slice(-10):[];
    const comps=[];
    if(serieMed.length>1){ const p=(serieMed.at(-1).v/serieMed[0].v-1)*100*(G.bajar?-1:1); comps.push(mcClamp(50+p*10)); }
    if(serieFz.length>1){ const p=(serieFz.at(-1).v/serieFz[0].v-1)*100; comps.push(mcClamp(50+p*2.5)); }
    if(ses.length) comps.push(mcClamp(o.series/G.meta*100));
    const avance=comps.length&&(serieMed.length>1||serieFz.length>1||o.ultima)?Math.round(comps.reduce((a,b)=>a+b,0)/comps.length):null;
    const dias=o.ultima?mcDias(o.ultima):null;
    const rec=dias==null?100:[35,65,90][dias]||100;
    const est=avance==null?'nd':dias!=null&&dias<=1?'rec':avance>=60?'up':avance>=45?'eq':'dn';
    R[g]={serieMed,serieFz,ejClave:nmClave||null,u:ej?ej.u:'kg',series:o.series,ultima:o.ultima,dias,rec,avance,est};
  });
  return R;
}

/* ═══ Montaje ═══ */
function miCuerpoDestruir(){
  if(!mc) return;
  cancelAnimationFrame(mc.anim);
  if(mc.onKey) document.removeEventListener('keydown',mc.onKey);
  if(mc.onResize) removeEventListener('resize',mc.onResize);
  if(mc.root && !mc.full) mc.root.innerHTML='';
  mc=null;
}
// Dentro de Progreso (se llama al pintar la sección de cuerpo)
function mcMontarInline(){ const el=document.getElementById('mc-in'); if(el) mcMontar(el,false); }

function mcMontar(root,full,previo){
  const s=activeSocio; if(!s||!root) return;
  miCuerpoDestruir();
  asegurarLogs(s);
  const S=Object.assign({v:'frente',m:'anat',g:null,sub:null,tab:'prog',graf:'med'},previo||{});
  const yo={root,full,S,anim:0,datos:mcDatos(s),F:mcFigura(s)};
  mc=yo;
  root.innerHTML=`
    <div class="mc-esc" id="mc-esc">
      <div class="mc-giro" id="mc-giro">
        <svg class="mc-svg" id="mc-svg" viewBox="0 0 ${MC_W} ${MC_H}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Tu cuerpo: toca un punto para ver el músculo">
          <defs><filter id="mc-brillo" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <g id="mc-fig"></g>
        </svg>
      </div>
      <div class="mc-hud">
        <div class="mc-seg mc-seg-s" role="group" aria-label="Vista del cuerpo" id="mc-vistas">
          ${[['frente','Frente','Vista frontal'],['espalda','Espalda','Vista posterior'],['izq','Izq.','Lateral izquierda'],['der','Der.','Lateral derecha']].map(([v,n,a])=>`<button type="button" data-v="${v}" aria-pressed="${S.v===v}" aria-label="${a}">${n}</button>`).join('')}
        </div>
        ${full?`<button type="button" class="mc-x" onclick="cerrarMiCuerpo()" aria-label="Cerrar pantalla completa">✕</button>`
          :`<button type="button" class="mc-x" id="mc-abrir" onclick="abrirMiCuerpo()" aria-label="Ver Mi cuerpo en pantalla completa"><svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>`}
      </div>
      <div class="mc-tag" id="mc-tag" hidden></div>
      <div class="mc-modo">
        <div class="mc-ley" id="mc-ley" hidden><span>Rezagado</span><i></i><span>Avanzando</span></div>
        <div class="mc-seg mc-seg-s" role="group" aria-label="Color de los músculos" id="mc-modos">
          <button type="button" data-m="anat" aria-pressed="${S.m==='anat'}">Anatomía</button><button type="button" data-m="prog" aria-pressed="${S.m==='prog'}">Avance</button>
        </div>
      </div>
      <div class="mc-zoom">
        <button type="button" id="mc-zmas" aria-label="Acercar">+</button>
        <button type="button" id="mc-zmenos" aria-label="Alejar">−</button>
        <button type="button" id="mc-ztodo" aria-label="Ver cuerpo completo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
      </div>
    </div>
    <div class="mc-chips" id="mc-chips" role="region" aria-label="Tus medidas" tabindex="0"></div>
    <div class="mc-panel" id="mc-panel" aria-live="polite"></div>
    <p class="mc-pie">Estimación visual con tus medidas y entrenamientos · no es un diagnóstico.</p>`;
  yo.svg=root.querySelector('#mc-svg'); yo.fig=root.querySelector('#mc-fig'); yo.esc=root.querySelector('#mc-esc');
  yo.vb={...yo.F.full[mcCapa(S.v)]};
  if(full){ yo.onKey=e=>{ if(e.key==='Escape') cerrarMiCuerpo(); }; document.addEventListener('keydown',yo.onKey); }
  yo.onResize=()=>mcTag(); addEventListener('resize',yo.onResize);
  mcEventos(yo);
  mcDibujar(); mcPanel(); mcChips();
  if(S.g){ const t=mcEncuadre(S.sub&&S.sub.length?S.sub:MC_G[S.g].k); if(t) yo.vb=t; }
  mcAplicarVB();
}

function abrirMiCuerpo(){
  if(!activeSocio) return;
  const previo=mc?{...mc.S}:null;
  let ov=document.getElementById('mc-full');
  if(!ov){ ov=document.createElement('div'); ov.id='mc-full'; document.body.appendChild(ov); }
  ov.className='mc mc-full';
  ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Mi cuerpo');
  document.documentElement.classList.add('mc-abierto');
  mcMontar(ov,true,previo);
  requestAnimationFrame(()=>ov.classList.add('on'));
  ov.querySelector('.mc-x')?.focus();
}
function cerrarMiCuerpo(){
  const previo=mc?{...mc.S}:null;
  miCuerpoDestruir();
  const ov=document.getElementById('mc-full');
  if(ov){ ov.classList.remove('on'); setTimeout(()=>ov.remove(),220); }
  document.documentElement.classList.remove('mc-abierto');
  const el=document.getElementById('mc-in'); if(el) mcMontar(el,false,previo);
  document.getElementById('mc-abrir')?.focus();
}

/* ═══ Figura y selección ═══ */
function mcDibujar(){
  const {fig,svg,S}=mc, c=mcCapa(S.v);
  fig.innerHTML='';
  fig.setAttribute('transform',S.v==='izq'?MC_ESPEJO:'');
  const img=mcEl('image',{width:MC_W,height:MC_H,preserveAspectRatio:'none',href:mc.F.img[c]});
  // velo: oscurece todo menos el músculo elegido (la máscara recorta sus zonas)
  const mask=mcEl('mask',{id:'mc-mk',maskUnits:'userSpaceOnUse',x:0,y:0,width:MC_W,height:MC_H});
  mask.appendChild(mcEl('rect',{width:MC_W,height:MC_H,fill:'#fff'}));
  mc.gMask=mcEl('g',{}); mask.appendChild(mc.gMask);
  const velo=mcEl('rect',{width:MC_W,height:MC_H,class:'mc-velo',mask:'url(#mc-mk)'});
  const gm=mcEl('g',{}), gh=mcEl('g',{});
  mc.gLinea=mcEl('g',{class:'mc-linea'});
  fig.append(mask,img,velo,gm,mc.gLinea,gh);
  mc.F.vistas[c].forEach(it=>(it.m?[0,1]:[0]).forEach(r=>{
    const g=MC_K2G[it.k], p=mcEl('path',{d:it.d,class:'mc-m','data-k':it.k,'data-g':g,'data-r':r,...(r?{transform:MC_ESPEJO}:{})});
    const a=mc.datos[g].avance;
    if(S.m==='prog') p.style.setProperty('--pc',a==null?'#3a4652':mcColor(a));
    p.appendChild(mcEl('title',{})).textContent=MC_G[g].n;
    gm.appendChild(p);
  }));
  // un punto por grupo visible en esta vista, al centro de su zona izquierda
  Object.entries(MC_G).forEach(([g,o])=>{
    const ps=[...gm.querySelectorAll(`.mc-m[data-g="${g}"][data-r="0"]`)];
    if(!ps.length||(o.sinPunto||[]).includes(c)) return;
    const b=mcUnir(ps.map(p=>p.getBBox()));
    const h=mcEl('g',{class:'mc-hs','data-g':g,tabindex:'0',role:'button','aria-label':o.n});
    const cx=b.x+b.w/2, cy=b.y+b.h/2;
    h.append(mcEl('circle',{cx,cy,r:18,class:'mc-pulso'}),mcEl('circle',{cx,cy,r:18,class:'mc-r1'}),mcEl('circle',{cx,cy,r:7,class:'mc-r2'}));
    gh.appendChild(h);
  });
  svg.classList.toggle('prog',S.m==='prog');
  mc.root.querySelector('#mc-ley').hidden=S.m!=='prog';
  mcMarcar(); mcEscalar();
}
function mcUnir(bs){
  const x=Math.min(...bs.map(b=>b.x)), y=Math.min(...bs.map(b=>b.y));
  return {x,y,w:Math.max(...bs.map(b=>b.x+b.width))-x,h:Math.max(...bs.map(b=>b.y+b.height))-y};
}
function mcMarcar(){
  const {fig,svg,S}=mc, sub=S.sub?new Set(S.sub):null;
  svg.classList.toggle('sel',!!S.g&&!!fig.querySelector(`.mc-m[data-g="${S.g}"]`));
  mc.gMask.innerHTML=''; mc.gLinea.innerHTML='';
  fig.querySelectorAll('.mc-m').forEach(p=>{
    const on=p.dataset.g===S.g, on2=!!(on&&sub&&sub.has(p.dataset.k));
    p.classList.toggle('on',on); p.classList.toggle('on2',on2);
    if(!on) return;
    const t=p.getAttribute('transform')||'';
    mc.gMask.appendChild(mcEl('path',{d:p.getAttribute('d'),fill:'#000',transform:t}));
    mc.gLinea.appendChild(mcEl('path',{d:p.getAttribute('d'),transform:t,class:on2?'l2':''}));
  });
  fig.querySelectorAll('.mc-hs').forEach(h=>h.classList.toggle('on',h.dataset.g===S.g));
  mcTag();
}

/* ═══ Zoom y encuadre ═══ */
const mcFull=()=>mc.F.full[mcCapa(mc.S.v)];
const mcAcercado=()=>mc.vb.w<mcFull().w*.97;
function mcAplicarVB(){
  const v=mc.vb; mc.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);
  // sin zoom, el dedo de arriba a abajo mueve la página; con zoom, mueve el cuerpo
  mc.esc.style.touchAction=mcAcercado()?'none':'pan-y';
  mcEscalar(); mcTag();
}
function mcEscalar(){
  const s=Math.max(.35,Math.min(1,mc.vb.w/mcFull().w));
  mc.fig.querySelectorAll('.mc-hs').forEach(h=>{
    h.querySelectorAll('.mc-r1,.mc-pulso').forEach(c=>c.setAttribute('r',18*s));
    h.querySelector('.mc-r2').setAttribute('r',7*s);
  });
  mc.svg.style.setProperty('--lw',(4*s).toFixed(2));
}
function mcIrA(t,ms=520){
  cancelAnimationFrame(mc.anim);
  const yo=mc, a={...yo.vb}, t0=performance.now();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ yo.vb={...t}; mcAplicarVB(); return; }
  const paso=now=>{
    if(mc!==yo) return;
    const u=Math.min(1,(now-t0)/ms), e=1-Math.pow(1-u,3);
    yo.vb={x:a.x+(t.x-a.x)*e,y:a.y+(t.y-a.y)*e,w:a.w+(t.w-a.w)*e,h:a.h+(t.h-a.h)*e};
    mcAplicarVB(); if(u<1) yo.anim=requestAnimationFrame(paso);
  };
  yo.anim=requestAnimationFrame(paso);
}
function mcEncuadre(keys){
  const ps=[...mc.fig.querySelectorAll('.mc-m[data-r="0"]')].filter(p=>keys.includes(p.dataset.k));
  if(!ps.length) return null;
  let b=mcUnir(ps.map(p=>p.getBBox()));
  if(mc.S.v==='izq') b={...b,x:MC_W-b.x-b.w};
  const r=mc.esc.clientWidth/mc.esc.clientHeight||.6;
  let w=Math.max(b.w*2.2,420), h=Math.max(b.h*2.2,420);
  if(w/h<r) w=h*r; else h=w/r;
  return {x:b.x+b.w/2-w/2,y:b.y+b.h/2-h/2,w,h};
}
function mcLimitar(v){
  const F=mcFull();
  if(v.w>=F.w&&v.h>=F.h) return {...v,x:F.x+F.w/2-v.w/2,y:F.y+F.h/2-v.h/2};
  return {...v,x:Math.max(F.x-v.w*.4,Math.min(F.x+F.w-v.w*.6,v.x)),y:Math.max(F.y-v.h*.3,Math.min(F.y+F.h-v.h*.7,v.y))};
}
function mcZoomT(base,f,cx,cy){
  const F=mcFull(), nw=Math.min(F.w*1.4,Math.max(F.w*.16,base.w*f)), s=nw/base.w;
  if(cx==null){ cx=base.x+base.w/2; cy=base.y+base.h/2; }
  return mcLimitar({x:cx-(cx-base.x)*s,y:cy-(cy-base.y)*s,w:nw,h:base.h*s});
}

/* etiqueta flotante del grupo elegido */
function mcTag(){
  if(!mc) return;
  const tag=mc.root.querySelector('#mc-tag'), S=mc.S;
  const h=S.g&&mc.fig.querySelector(`.mc-hs[data-g="${S.g}"] .mc-r2`);
  if(!h){ tag.hidden=true; return; }
  const r=h.getBoundingClientRect(), sr=mc.esc.getBoundingClientRect();
  const x=r.left+r.width/2-sr.left, y=r.top+r.height/2-sr.top;
  if(x<-20||x>sr.width+20||y<-20||y>sr.height+20){ tag.hidden=true; return; }
  const o=MC_G[S.g], d=mc.datos[S.g], sub=S.sub?o.mus.find(m=>m.k.join()===S.sub.join()):null;
  const linea=d.serieMed.length?`${mcFmt(d.serieMed.at(-1).v)} cm${d.serieMed.length>1?' · '+mcDelta(S.g).txt:''}`
    : d.serieFz.length?`${esc(d.ejClave)} · ${mcFmt(d.serieFz.at(-1).v)} ${d.u}` : 'Sin registros aún';
  tag.innerHTML=`<b>${esc(sub?sub.n:o.n)}</b><span>${linea}</span>`;
  tag.hidden=false;
  tag.classList.toggle('izq',x>sr.width*.55);
  tag.style.left=x+'px'; tag.style.top=y+'px';
}
function mcDelta(g){
  const s=mc.datos[g].serieMed; if(s.length<2) return {d:0,txt:'',cls:''};
  const d=+(s.at(-1).v-s[0].v).toFixed(1), bien=MC_G[g].bajar?d<0:d>0;
  return {d,txt:(d>0?'+':d<0?'−':'±')+mcFmt(Math.abs(d))+' cm',cls:d===0?'':bien?'mas':'menos'};
}

/* ═══ Elegir grupo, músculo o vista ═══ */
function mcElegir(g,{vista,sub}={}){
  const S=mc.S;
  S.g=g; S.sub=sub||null;
  if(!g){ mcMarcar(); mcIrA(mcFull()); mcPanel(); mcChips(); return; }
  const o=MC_G[g];
  const enVista=v=>mc.F.vistas[mcCapa(v)].some(it=>o.k.includes(it.k));
  const destino=vista||(enVista(S.v)?S.v:o.v);
  const enfocar=()=>{ mcMarcar(); const t=mcEncuadre(S.sub&&S.sub.length?S.sub:o.k); mcIrA(t||mcFull()); };
  if(destino!==S.v) mcCambiarVista(destino,enfocar); else enfocar();
  mcPanel(); mcChips();
}
function mcElegirSub(keys){
  const S=mc.S, en=v=>mc.F.vistas[mcCapa(v)].some(it=>keys.includes(it.k));
  const vista=en(S.v)?S.v:en('frente')?'frente':en('espalda')?'espalda':'der';
  S.sub=keys;
  const enfocar=()=>{ mcMarcar(); const t=mcEncuadre(keys); if(t) mcIrA(t); };
  if(vista!==S.v) mcCambiarVista(vista,enfocar); else enfocar();
  mcPanel();
}
function mcCambiarVista(v,luego){
  const S=mc.S;
  if(v===S.v){ luego&&luego(); return; }
  S.v=v;
  mc.root.querySelectorAll('#mc-vistas button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v));
  const yo=mc;
  const hacer=()=>{
    if(mc!==yo) return;
    mcDibujar();
    if(luego) luego();
    else { const t=S.g&&mcEncuadre(S.sub&&S.sub.length?S.sub:MC_G[S.g].k); yo.vb=t||{...mcFull()}; mcAplicarVB(); }
  };
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ hacer(); return; }
  const giro=mc.root.querySelector('#mc-giro');
  giro.classList.remove('anim'); void giro.offsetWidth; giro.classList.add('anim');
  mc.root.querySelector('#mc-tag').hidden=true;
  setTimeout(hacer,200);
}

/* ═══ Gestos: tocar, deslizar (girar o mover), pellizcar, rueda ═══ */
function mcEventos(yo){
  const {root,esc:st,svg}=yo, ptrs=new Map(); let gesto=null;
  const aSVG=(x,y)=>{ const p=svg.createSVGPoint(); p.x=x; p.y=y; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  root.querySelector('#mc-vistas').addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) mcCambiarVista(b.dataset.v); });
  root.querySelector('#mc-modos').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    yo.S.m=b.dataset.m; root.querySelectorAll('#mc-modos button').forEach(x=>x.setAttribute('aria-pressed',x===b)); mcDibujar(); });
  root.querySelector('#mc-chips').addEventListener('click',e=>{ const b=e.target.closest('[data-g]'); if(!b) return;
    const g=b.dataset.g; yo.S.tab='prog'; mcElegir(yo.S.g===g&&!b.classList.contains('vacio')?null:g,{vista:MC_G[g].v});
    if(b.classList.contains('vacio')) setTimeout(()=>root.querySelector('#mc-in-v')?.focus(),60); });
  root.querySelector('#mc-panel').addEventListener('click',e=>{
    const t=e.target;
    if(t.closest('[data-cerrar]')) return mcElegir(null);
    const tb=t.closest('[data-tab]'); if(tb){ yo.S.tab=tb.dataset.tab; mcPanel(); return; }
    const gf=t.closest('[data-graf]'); if(gf){ yo.S.graf=gf.dataset.graf; mcPanel(); return; }
    if(t.closest('[data-todos]')){ yo.S.todos=!yo.S.todos; mcPanel(); return; }
    const rk=t.closest('[data-rank]'); if(rk){ yo.S.tab='prog'; mcElegir(rk.dataset.rank); return; }
    const mu=t.closest('[data-mu]'); if(mu){
      const m=MC_G[yo.S.g].mus[+mu.dataset.mu];
      if(!m.k.length || (yo.S.sub&&yo.S.sub.join()===m.k.join())) return mcElegir(yo.S.g);
      mcElegirSub(m.k);
    }
  });
  root.querySelector('#mc-panel').addEventListener('submit',e=>{ e.preventDefault(); mcGuardar(); });
  root.querySelector('#mc-zmas').onclick=()=>mcIrA(mcZoomT(yo.vb,.7),260);
  root.querySelector('#mc-zmenos').onclick=()=>mcIrA(mcZoomT(yo.vb,1/.7),260);
  root.querySelector('#mc-ztodo').onclick=()=>mcIrA(mcFull());
  yo.fig.addEventListener('keydown',e=>{ const h=e.target.closest('.mc-hs'); if(h&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); yo.S.tab='prog'; mcElegir(h.dataset.g,{vista:yo.S.v}); } });

  st.addEventListener('pointerdown',e=>{
    if(e.target.closest('.mc-zoom,.mc-hud,.mc-modo')) return;
    ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===1) gesto={tipo:'uno',x0:e.clientX,y0:e.clientY,vb0:{...yo.vb},k:1/svg.getScreenCTM().a,mov:false,obj:e.target};
    else if(ptrs.size===2){ cancelAnimationFrame(yo.anim); const [a,b]=[...ptrs.values()]; gesto={tipo:'pinza',d0:Math.hypot(a.x-b.x,a.y-b.y),vb0:{...yo.vb}}; }
  });
  st.addEventListener('pointermove',e=>{
    if(!ptrs.has(e.pointerId)||!gesto) return;
    ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(gesto.tipo==='uno'){
      const dx=e.clientX-gesto.x0, dy=e.clientY-gesto.y0;
      if(!gesto.mov&&Math.hypot(dx,dy)>8){ gesto.mov=true; cancelAnimationFrame(yo.anim); try{ st.setPointerCapture(e.pointerId); }catch(_){} }
      if(gesto.mov&&mcAcercado()){ yo.vb=mcLimitar({...gesto.vb0,x:gesto.vb0.x-dx*gesto.k,y:gesto.vb0.y-dy*gesto.k}); mcAplicarVB(); }
    }else if(ptrs.size===2){
      const [a,b]=[...ptrs.values()], m=aSVG((a.x+b.x)/2,(a.y+b.y)/2);
      yo.vb=mcZoomT(gesto.vb0,gesto.d0/Math.hypot(a.x-b.x,a.y-b.y),m.x,m.y); mcAplicarVB();
    }
  });
  st.addEventListener('pointerup',e=>{
    if(!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if(gesto&&gesto.tipo==='uno'){
      const dx=e.clientX-gesto.x0, dy=e.clientY-gesto.y0;
      if(!gesto.mov) mcTocar(gesto.obj);
      else if(!mcAcercado()&&Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){ const i=MC_ORDEN.indexOf(yo.S.v); mcCambiarVista(MC_ORDEN[(i+(dx<0?1:-1)+4)%4]); }
    }
    if(!ptrs.size) gesto=null;
    else if(gesto&&gesto.tipo==='pinza'){ const [p]=[...ptrs.values()]; gesto={tipo:'uno',x0:p.x,y0:p.y,vb0:{...yo.vb},k:1/svg.getScreenCTM().a,mov:true}; }
  });
  // el navegador tomó el gesto (deslizar la página): no cuenta como toque
  st.addEventListener('pointercancel',e=>{ ptrs.delete(e.pointerId); if(!ptrs.size) gesto=null; });
  // rueda: en pantalla completa siempre; dentro de la página, solo con Ctrl (o pellizco del trackpad) para no robar el scroll
  st.addEventListener('wheel',e=>{
    if(!yo.full&&!e.ctrlKey) return;
    e.preventDefault(); const p=aSVG(e.clientX,e.clientY); yo.vb=mcZoomT(yo.vb,e.deltaY>0?1.12:1/1.12,p.x,p.y); mcAplicarVB();
  },{passive:false});
}
function mcTocar(t){
  const S=mc.S, h=t.closest&&t.closest('.mc-hs'), m=t.closest&&t.closest('.mc-m');
  const g=h?h.dataset.g:m?m.dataset.g:null;
  if(g){ if(S.g!==g) S.tab='prog'; mcElegir(g,{vista:S.v}); }
  else if(S.g) mcElegir(null);
}

/* ═══ Tarjetas de medidas ═══ */
function mcChips(){
  const el=mc.root.querySelector('#mc-chips'); if(!el) return;
  el.innerHTML=MC_MED.map(([id,g])=>{
    const s=mc.datos[g].serieMed, on=mc.S.g===g?' on':'';
    if(!s.length) return `<button type="button" class="mc-chip vacio${on}" data-g="${g}"><span>${mcNombreMed(id)}</span><b>—</b><small class="mas">+ Agregar</small></button>`;
    const d=mcDelta(g);
    return `<button type="button" class="mc-chip${on}" data-g="${g}" aria-label="${mcNombreMed(id)} ${mcFmt(s.at(-1).v)} centímetros. Ver músculo y evolución"><span>${mcNombreMed(id)}</span><b>${mcFmt(s.at(-1).v)}<i>cm</i></b><small class="${d.cls}">${s.length>1?d.txt:'Inicio'}</small></button>`;
  }).join('');
}

/* ═══ Ficha ═══ */
function mcGrafica(serie,u,bajar){
  const W=320,H=150,L=36,R=14,T=16,B=24;
  const vs=serie.map(p=>p.v), mn=Math.min(...vs), mx=Math.max(...vs), rg=(mx-mn)||1, lo=mn-rg*.25, hi=mx+rg*.3;
  const X=i=>L+i*(W-L-R)/(serie.length-1), Y=v=>T+(hi-v)*(H-T-B)/(hi-lo);
  const pts=serie.map((p,i)=>[X(i),Y(p.v)]);
  const linea=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const bien=bajar?vs.at(-1)<=vs[0]:vs.at(-1)>=vs[0], c=bien?'#C8F23A':'#FF6B7A';
  const marcas=[lo+(hi-lo)*.25,lo+(hi-lo)*.7];
  const n=serie.length-1, cada=Math.max(1,Math.ceil(serie.length/4));
  return `<svg class="mc-graf" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución: ${vs.map(mcFmt).join(', ')} ${u}">
    <defs><linearGradient id="mc-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
    ${marcas.map(t=>`<line class="gl" x1="${L}" x2="${W-R}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${L-6}" y="${Y(t)+3}" text-anchor="end">${mcFmt(t)}</text>`).join('')}
    <line class="gl" x1="${L}" x2="${W-R}" y1="${H-B}" y2="${H-B}"/>
    ${serie.map((p,i)=>i===0||i===n||(i%cada===0&&n-i>=cada)?`<text x="${X(i)}" y="${H-7}" text-anchor="${i===0?'start':i===n?'end':'middle'}">${fmtFecha(p.fecha).slice(0,5)}</text>`:'').join('')}
    <path d="${linea} L${X(n)},${H-B} L${X(0)},${H-B} Z" fill="url(#mc-ga)"/>
    <path d="${linea}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===n?5:2.6}" fill="${i===n?c:'#0F151C'}" stroke="${c}" stroke-width="1.6"/>`).join('')}
    <text class="fin" x="${pts[n][0]-8}" y="${pts[n][1]-10}" text-anchor="end">${mcFmt(vs[n])} ${u}</text>
  </svg>`;
}
function mcAnillo(p){
  const r=18, c=2*Math.PI*r;
  return `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="${r}" fill="none" stroke="#1F2933" stroke-width="5"/>
    ${p==null?'':`<circle cx="22" cy="22" r="${r}" fill="none" stroke="${mcColor(Math.max(p,30))}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 22 22)"/>`}</svg>`;
}
function mcVistasDe(keys){
  if(!keys.length) return 'Profundo';
  const vs=[]; const en=c=>mc.F.vistas[c].some(it=>keys.includes(it.k));
  if(en('frente')) vs.push('Frente'); if(en('espalda')) vs.push('Espalda'); if(en('lado')) vs.push('Lateral');
  return vs.join(' · ');
}
function mcPanel(){
  const P=mc.root.querySelector('#mc-panel'), S=mc.S;
  if(!S.g){ P.innerHTML=mcResumen(); return; }
  const g=S.g, o=MC_G[g], d=mc.datos[g], e=MC_EST[d.est];
  let cuerpo='';
  if(S.tab==='prog'){
    const dl=mcDelta(g), fz=d.serieFz, dfz=fz.length>1?+(fz.at(-1).v-fz[0].v).toFixed(1):null;
    const usarMed=(S.graf==='med'||!fz.length)&&d.serieMed.length>1, usarFz=!usarMed&&fz.length>1;
    const medNm=o.med?mcNombreMed(o.med):'';
    cuerpo=`<div class="mc-kpis">
        <div class="mc-kpi"><small>Medida</small>${d.serieMed.length?`<b>${mcFmt(d.serieMed.at(-1).v)}<i> cm</i></b><span class="${dl.cls}">${d.serieMed.length>1?dl.txt+' desde el inicio':'Tu punto de partida'}</span>`:`<b>—</b><span>${o.med?'Sin registrar':'Sin cinta'}</span>`}</div>
        <div class="mc-kpi"><small>Fuerza</small>${fz.length?`<b>${mcFmt(fz.at(-1).v)}<i> ${d.u}</i></b><span class="${dfz>0?'mas':''}">${dfz!=null?(dfz>0?'+':'')+mcFmt(dfz)+' '+d.u:'Primer registro'}</span>`:`<b>—</b><span>Sin registros</span>`}</div>
        <div class="mc-kpi"><small>Avance</small><div class="mc-anillo">${mcAnillo(d.avance)}<b>${d.avance==null?'—':d.avance+'<i>%</i>'}</b></div></div>
      </div>
      ${usarMed||usarFz?`<div class="mc-blk">
        <div class="mc-blk-h"><b>${usarMed?`Tu ${medNm.toLowerCase()}, de menos a más`:`${esc(d.ejClave)} · mejor serie`}</b>
          ${d.serieMed.length>1&&fz.length>1?`<div class="mc-mini" role="group" aria-label="Qué graficar"><button type="button" data-graf="med" aria-pressed="${usarMed}">Medida</button><button type="button" data-graf="fz" aria-pressed="${usarFz}">Fuerza</button></div>`:''}</div>
        ${usarMed?mcGrafica(d.serieMed,'cm',o.bajar):mcGrafica(fz,d.u)}
        <p class="mc-nota">${usarMed?(o.bajar?'Aquí bajar es avanzar.':'Cada punto es una medición.'):d.u==='kg'?'Récord estimado a 1 repetición con tu mejor serie de cada sesión.':'Segundos de tu mejor serie en cada sesión.'}</p>
      </div>`:`<p class="mc-nota mc-blk">${d.serieMed.length===1?'Con tu próxima medición verás aquí tu curva.':'Cuando registres tus medidas o entrenes este grupo, aquí verás tu curva de menos a más.'}</p>`}
      <div class="mc-blk mc-dos">
        <div><div class="mc-fila"><span>Series esta semana</span><b>${d.series} / ${o.meta}</b></div><div class="mc-barra"><i style="width:${Math.min(100,d.series/o.meta*100)}%"></i></div></div>
        <div><div class="mc-fila"><span>Recuperación</span><b>${d.rec}%</b></div><div class="mc-barra"><i class="${d.rec<50?'rec':''}" style="width:${d.rec}%"></i></div></div>
      </div>
      <p class="mc-nota">${d.ultima?`Último entrenamiento: ${d.dias===0?'hoy':d.dias===1?'ayer':'hace '+d.dias+' días'}${d.ejClave?' · ejercicio clave: '+esc(d.ejClave):''}.`:'Aún no registras entrenamientos de este grupo.'}</p>
      ${o.med?(()=>{ const c=MED_CAMPOS.find(x=>x.id===o.med), ult=d.serieMed.at(-1);
        return `<form class="mc-reg" novalidate><label for="mc-in-v">${mcNombreMed(o.med)} de hoy</label>
          <span class="mc-campo"><input id="mc-in-v" type="number" step="0.5" min="${c.min}" max="${c.max}" inputmode="decimal" placeholder="${mcFmt(ult?ult.v:c.base)}" required><i>cm</i></span>
          <button type="submit">Guardar</button></form>`; })():''}`;
  }else if(S.tab==='mus'){
    cuerpo=`<p class="mc-nota mc-nota0">Toca un músculo para verlo en el cuerpo.</p><ul class="mc-lista">${o.mus.map((m,i)=>`<li><button type="button" class="mc-mu${S.sub&&m.k.length&&S.sub.join()===m.k.join()?' on':''}" data-mu="${i}">
        <b>${m.n}</b><span class="v">${mcVistasDe(m.k)}</span><span class="f">${m.f}</span><span class="ej">Ejercicio clave: ${m.ej}</span></button></li>`).join('')}</ul>`;
  }else{
    cuerpo=`<ul class="mc-lista">${o.tips.map(([t,p])=>`<li class="mc-tip"><small>${t}</small><p>${p}</p></li>`).join('')}</ul>`;
  }
  P.innerHTML=`<div class="mc-p-h"><div><div class="mc-kick">Grupo muscular</div><h3>${o.n}</h3>
      <div class="mc-sub">${o.lat} · ${MC_NV[S.v].toLowerCase()}</div><span class="mc-est ${e[1]}">${e[0]}</span></div>
      <button type="button" class="mc-f-x" data-cerrar aria-label="Cerrar grupo">✕</button></div>
    <div class="mc-tabs" role="tablist">${[['prog','Progreso'],['mus','Músculos'],['tips','Tips']].map(([k,n])=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${S.tab===k}">${n}</button>`).join('')}</div>
    <div role="tabpanel">${cuerpo}</div>`;
}
function mcResumen(){
  const D=mc.datos, S=mc.S, con=Object.entries(MC_G).filter(([g])=>D[g].avance!=null);
  if(!con.length) return `<h3>Cómo va tu cuerpo</h3>
    <div class="mc-vacio">Toca un músculo o una medida para ver su detalle. Cuando registres tus medidas y tus entrenamientos, aquí verás qué grupos avanzan y cuáles se quedan atrás.</div>`;
  const prom=gs=>{ const v=gs.map(g=>D[g].avance).filter(x=>x!=null); return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null; };
  const ant=prom(['hombros','pecho','biceps','abdomen','cuadriceps']), post=prom(['triceps','espalda','trapecio','gluteos','femoral','pantorrilla']);
  const orden=con.slice().sort((a,b)=>D[b[0]].avance-D[a[0]].avance);
  const n=Math.min(3,Math.floor(orden.length/2)), mejor=orden.slice(0,n), atras=orden.slice(-n).reverse();
  const sinDatos=Object.keys(MC_G).length-con.length;
  const fila=([g,o])=>{ const a=D[g].avance; return `<button type="button" class="mc-rank" data-rank="${g}"><b>${o.n}</b><div class="mc-barra"><i style="width:${a??0}%;background:${a==null?'transparent':mcColor(Math.max(a,30))}"></i></div><span>${a==null?'—':a+'%'}</span></button>`; };
  const todos=Object.entries(MC_G).sort((a,b)=>(D[b[0]].avance??-1)-(D[a[0]].avance??-1));
  return `<h3>Cómo va tu cuerpo</h3>
    <p class="mc-nota mc-nota0">Toca un músculo o una medida para ver su detalle.</p>
    ${ant!=null&&post!=null?`<div class="mc-dos">
      <div><div class="mc-fila"><span>Frente</span><b>${ant}%</b></div><div class="mc-barra"><i style="width:${ant}%"></i></div></div>
      <div><div class="mc-fila"><span>Espalda</span><b>${post}%</b></div><div class="mc-barra"><i class="amb" style="width:${post}%"></i></div></div></div>`:''}
    ${S.todos?`<div class="mc-blk"><div class="mc-blk-h"><b>Todos los grupos</b></div>${todos.map(fila).join('')}</div>`
      :n?`<div class="mc-blk mc-grupos">
        <div><div class="mc-blk-h"><b>Van mejor</b></div>${mejor.map(fila).join('')}</div>
        <div><div class="mc-blk-h"><b>Necesitan atención</b></div>${atras.map(fila).join('')}</div>
      </div>`:`<div class="mc-blk">${orden.map(fila).join('')}</div>`}
    <button type="button" class="mc-mas" data-todos>${S.todos?'Ver resumen':`Ver los ${todos.length} grupos${sinDatos?` (${sinDatos} sin datos)`:''}`}</button>
    <p class="mc-nota">Avance: 50 % es sin cambio. Sube con tus medidas, tu fuerza y tus series de la semana.</p>`;
}

// Registrar la medida de hoy desde la ficha (reemplaza la de hoy si ya había)
function mcGuardar(){
  const s=activeSocio; if(!s||!mc||!mc.S.g) return;
  const id=MC_G[mc.S.g].med, c=MED_CAMPOS.find(x=>x.id===id), inp=mc.root.querySelector('#mc-in-v');
  if(!c||!inp) return;
  const v=parseFloat(String(inp.value).replace(',','.'));
  if(!(v>=c.min && v<=c.max)){ showToast(`⚠ Escribe tu ${mcNombreMed(id).toLowerCase()} entre ${c.min} y ${c.max} cm`); inp.focus(); return; }
  asegurarLogs(s);
  const hoyF=fechaISO(new Date()), ex=s.logs.medidas.find(m=>m.fecha===hoyF);
  if(ex) ex[id]=v; else s.logs.medidas.push({fecha:hoyF,[id]:v});
  s.logs.medidas.sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
  dbSave(s.code);
  showToast(`📏 ${mcNombreMed(id)}: ${mcFmt(v)} cm guardado`);
  mc.datos=mcDatos(s);
  mcDibujar(); mcPanel(); mcChips();
  const mp=document.getElementById('cuerpo-mapas'); if(mp && typeof mapasHTML==='function') mp.innerHTML=mapasHTML(s,'equilibrio');
  if(typeof refreshDash==='function') refreshDash();
}

// Guardar medidas del día
function guardarMedidas(){ asegurarLogs(activeSocio);
  const s=activeSocio; if(!s) return;
  const med={fecha:fechaISO(new Date())};
  let alguna=false;
  MED_CAMPOS.forEach(c=>{
    const v=parseFloat(document.getElementById('med-'+c.id)?.value);
    if(v&&v>=c.min&&v<=c.max){ med[c.id]=v; alguna=true; }
  });
  if(!alguna){ showToast('⚠ Ingresa al menos una medida válida'); return; }
  if(!s.logs.medidas) s.logs.medidas=[];
  const hoy=med.fecha;
  const ex=s.logs.medidas.find(m=>m.fecha===hoy);
  if(ex) Object.assign(ex,med); else s.logs.medidas.push(med);
  dbSave(s.code);
  showToast('📏 Medidas registradas — Mi cuerpo se actualizó');
  renderProgresoTab();
  refreshDash();
}

// Mini sparkline para el hero
function drawSpark(id, valores){
  const cv=document.getElementById(id); if(!cv||valores.length<2) return;
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||140, H=cv.clientHeight||44;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const xx=ACC.replace('#','');
  const rr=parseInt(xx.substr(0,2),16),gg=parseInt(xx.substr(2,2),16),bb=parseInt(xx.substr(4,2),16);
  let min=Math.min(...valores), max=Math.max(...valores);
  const rg=Math.max(0.5,max-min); min-=rg*0.2; max+=rg*0.2;
  const X=i=>4+(W-8)*(i/(valores.length-1));
  const Y=v=>4+(H-8)*(1-(v-min)/(max-min));
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,`rgba(${rr},${gg},${bb},0.22)`); grad.addColorStop(1,`rgba(${rr},${gg},${bb},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H);
  valores.forEach((v,i)=>ctx.lineTo(X(i),Y(v)));
  ctx.lineTo(X(valores.length-1),H); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  valores.forEach((v,i)=>{i===0?ctx.moveTo(X(i),Y(v)):ctx.lineTo(X(i),Y(v));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  const last=valores.length-1;
  ctx.beginPath(); ctx.arc(X(last),Y(valores[last]),3,0,Math.PI*2);
  ctx.fillStyle=ACC; ctx.fill();
}

// Gráfica de medida seleccionada (reusa estilo de drawPesoChart)
let medChartSel='cintura';
function setMedChart(campo){
  medChartSel=campo;
  document.querySelectorAll('.chip-sel[data-med]').forEach(c=>c.classList.toggle('ac',c.dataset.med===campo));
  dibujarMedChart();
}
function dibujarMedChart(){
  const s=activeSocio; if(!s) return;
  const arr=(s.logs?.medidas||[]).filter(m=>m[medChartSel]!=null).map(m=>({fecha:m.fecha,kg:m[medChartSel]}));
  const cv=document.getElementById('chart-med'); if(!cv) return;
  drawSerieEnCanvas(cv, arr, ' cm');
}
// Generalización del dibujo de series (misma estética que peso)
function drawSerieEnCanvas(cv, serie, sufijo){
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||320, H=cv.clientHeight||150;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const TXC=(getComputedStyle(document.documentElement).getPropertyValue('--tx')||'#173527').trim();
  const hx=s=>{const x=s.replace('#','');return [parseInt(x.substr(0,2),16),parseInt(x.substr(2,2),16),parseInt(x.substr(4,2),16)];};
  const [ar,ag,ab]=hx(ACC), [tr,tg,tb]=hx(TXC);
  if(serie.length<2){
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='10px Figtree, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Registra esta medida 2+ veces para ver la curva',W/2,H/2); return;
  }
  const pad={l:36,r:12,t:14,b:20};
  const vals=serie.map(p=>p.kg);
  let min=Math.min(...vals),max=Math.max(...vals);
  const rg=Math.max(1,max-min); min-=rg*0.15; max+=rg*0.15;
  const X=i=>pad.l+(W-pad.l-pad.r)*(i/(serie.length-1));
  const Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-min)/(max-min));
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.07)`; ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+(H-pad.t-pad.b)*g/3;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle=`rgba(${tr},${tg},${tb},0.4)`; ctx.font='8px Figtree, sans-serif'; ctx.textAlign='right';
    ctx.fillText((max-(max-min)*g/3).toFixed(1),pad.l-5,y+3);
  }
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,`rgba(${ar},${ag},${ab},0.18)`); grad.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.beginPath(); ctx.moveTo(X(0),H-pad.b);
  serie.forEach((p,i)=>ctx.lineTo(X(i),Y(p.kg)));
  ctx.lineTo(X(serie.length-1),H-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath();
  serie.forEach((p,i)=>{i===0?ctx.moveTo(X(i),Y(p.kg)):ctx.lineTo(X(i),Y(p.kg));});
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  serie.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(X(i),Y(p.kg),2.6,0,Math.PI*2);
    ctx.fillStyle=(getComputedStyle(document.documentElement).getPropertyValue('--dk3')||'#fff').trim(); ctx.fill();
    ctx.strokeStyle=ACC; ctx.lineWidth=1.5; ctx.stroke();
  });
  ctx.fillStyle=`rgba(${tr},${tg},${tb},0.45)`; ctx.font='8px Figtree, sans-serif';
  ctx.textAlign='left'; ctx.fillText(fmtFecha(serie[0].fecha),pad.l,H-6);
  ctx.textAlign='right'; ctx.fillText(fmtFecha(serie[serie.length-1].fecha)+(sufijo||''),W-pad.r,H-6);
}
