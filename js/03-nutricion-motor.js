/* ═══ nutricion motor ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// MOTOR DE NUTRICIÓN — fórmulas verificadas
// BMR: Mifflin-St Jeor (1990)
// ═════════════════════════════════════════
// Composición corporal estimada: IMC y, si hay cintura, % de grasa con la fórmula RFM (Relative Fat Mass):
// RFM = 64 − 20 × estatura / cintura (+12 en mujeres). Con eso se distingue un IMC alto por músculo de uno por grasa.
function composicionCorporal(s,peso){
  const est=+s.estatura||0, m=est/100, imc=m?peso/(m*m):0;
  const g=(s.genero||'').toUpperCase(), mujer=g.includes('MUJER')||g.includes('FEMENINO');
  const cin=+s.cintura||0;
  const grasa=(cin>=50 && est) ? Math.max(5,Math.min(60,64-20*est/cin+(mujer?12:0))) : null;
  const grasaAlta=grasa!=null ? grasa>=(mujer?35:28) : (imc>=30 && !/AVAN/i.test(s.nivel||''));
  const muscular=grasa!=null ? (imc>=27 && grasa<(mujer?28:20)) : (imc>=27 && /AVAN/i.test(s.nivel||''));
  // Peso de referencia para proteína y grasas: masa magra si se conoce; con IMC ≥ 30 sin cintura, peso ajustado
  // (peso ideal de Devine + 40 % del exceso), para no recetar 190 g de proteína a quien pesa 95 kg por grasa.
  const pulg=est/2.54, ideal=Math.max(40,(mujer?45.5:50)+2.3*Math.max(0,pulg-60));
  const ref = grasa!=null ? peso*(1-grasa/100)/(mujer?0.75:0.82)   // masa magra llevada a un "peso sano" equivalente
            : (imc>=30 && !muscular) ? ideal+0.4*(peso-ideal) : peso;
  return {imc:Math.round(imc*10)/10, grasa:grasa!=null?Math.round(grasa):null, grasaAlta, muscular, pesoRef:Math.round(Math.min(peso,ref)*10)/10, mujer};
}
function calcNutricion(s){
  const peso = pesoActual(s);
  const est = s.estatura, edad = s.edad;
  // BMR Mifflin-St Jeor
  const bmrH = 10*peso + 6.25*est - 5*edad + 5;
  const bmrM = 10*peso + 6.25*est - 5*edad - 161;
  // Género: acepta datos históricos (Hombre/Mujer) y las etiquetas actuales (Masculino/Femenino)
  const g=(s.genero||'').toUpperCase();
  const esHombre = g.includes('HOMBRE')||g.includes('MASCULINO');
  const esMujer = g.includes('MUJER')||g.includes('FEMENINO');
  const comp = composicionCorporal(s,peso);
  // Con % de grasa conocido, Katch-McArdle (usa la masa magra) es más preciso que Mifflin-St Jeor
  const bmr = comp.grasa!=null ? Math.round(370+21.6*peso*(1-comp.grasa/100))
    : Math.round(esHombre ? bmrH : esMujer ? bmrM : (bmrH+bmrM)/2);

  // Factor de actividad según días de entrenamiento/semana
  const factores = {2:1.375, 3:1.45, 4:1.55, 5:1.65, 6:1.725};
  const factor = factores[s.dias] || 1.55;
  const tdee = Math.round(bmr * factor);

  // Ajuste calórico según objetivo
  let kcal, ajusteTxt, protKg, nota;
  switch(s.objetivo){
    case 'PERDER PESO':
      kcal = Math.round(tdee * 0.82); // déficit ~18%
      if(kcal < bmr) kcal = bmr;      // nunca por debajo del basal
      ajusteTxt = 'Déficit moderado (−18% del gasto total)';
      protKg = 2.0;
      nota = 'El déficit se genera aumentando tu actividad total, no con restricción extrema. Proteína alta (2.0 g/kg) para preservar masa muscular. Sentirás más hambre: contrólala con volumen de verduras y proteína en cada comida.';
      break;
    case 'GANAR MÚSCULO':
      if(comp.grasaAlta){   // IMC alto por grasa: recomposición (ganar músculo y bajar grasa a la vez), sin superávit
        kcal = Math.round(tdee * 0.95);
        ajusteTxt = 'Recomposición (−5% del gasto total)';
        protKg = 2.0;
        nota = 'Con tu composición actual conviene ganar músculo mientras bajas grasa (recomposición): calorías un poco por debajo de tu gasto y proteína alta. Tu peso puede bajar despacio mientras tu fuerza sube; eso es progreso.';
        break;
      }
      kcal = Math.round(tdee * (comp.muscular ? 1.05 : 1.10)); // superávit ~10% (5% si ya es musculoso: gana más lento y con menos grasa)
      ajusteTxt = comp.muscular ? 'Superávit ligero (+5% del gasto total)' : 'Superávit ligero (+10% del gasto total)';
      protKg = 1.8;
      nota = 'Superávit controlado para construir músculo minimizando grasa. Prioriza carbohidratos alrededor del entrenamiento (antes y después). Creatina monohidratada 3–5 g/día es el suplemento con más evidencia.';
      break;
    case 'FUERZA PURA':
      kcal = Math.round(tdee * 1.05);
      ajusteTxt = 'Superávit mínimo (+5% del gasto total)';
      protKg = 1.8;
      nota = 'Mantenimiento ligeramente positivo: la fuerza requiere recuperación completa. Carbohidratos suficientes para rendir en series pesadas. Duerme 7–9 horas: ahí se consolida la fuerza.';
      break;
    default: // RESISTENCIA
      kcal = tdee;
      ajusteTxt = 'Mantenimiento (gasto total)';
      protKg = 1.6;
      nota = 'Calorías de mantenimiento con carbohidratos como combustible principal. Hidratación antes, durante y después de sesiones largas. Repón electrolitos si sudas más de 60 min.';
  }

  // Macros (sobre el peso de referencia: con obesidad no se calculan sobre el peso total)
  const pRef = comp.pesoRef || peso;
  const prot = Math.round(protKg * pRef);                       // g proteína
  const grasas = Math.round(Math.max(0.8*pRef, (kcal*0.25)/9)); // ≥0.8 g/kg, ~25% kcal
  const kcalRestantes = kcal - prot*4 - grasas*9;
  const carbs = Math.max(0, Math.round(kcalRestantes/4));       // resto en carbohidratos
  const agua = Math.round(peso * 35 / 100) / 10;                 // litros (35 ml/kg)

  if(pRef<peso-0.5) nota += ' Proteína y grasas calculadas sobre '+pRef+' kg (peso de referencia por tu composición corporal), no sobre tu peso total.';
  if(comp.imc>=30 && comp.grasa==null) nota += ' Agrega tu medida de cintura en tu perfil para afinar este cálculo.';
  return { bmr, factor, tdee, kcal, prot, protKg, grasas, carbs, agua, ajusteTxt, nota, pesoBase: peso, imc:comp.imc, grasaPct:comp.grasa, pesoRef:pRef };
}
const MEAL_TEMPLATES={
  3:[{nombre:'Desayuno',pct:30,tag:'media'},{nombre:'Comida',pct:40,tag:'fuerte'},{nombre:'Cena',pct:30,tag:'media'}],
  4:[{nombre:'Desayuno',pct:27,tag:'media'},{nombre:'Colación',pct:13,tag:'ligera'},{nombre:'Comida',pct:37,tag:'fuerte'},{nombre:'Cena',pct:23,tag:'media'}],
  5:[{nombre:'Desayuno',pct:25,tag:'media'},{nombre:'Colación AM',pct:10,tag:'ligera'},{nombre:'Comida',pct:30,tag:'fuerte'},{nombre:'Colación PM',pct:10,tag:'ligera'},{nombre:'Cena',pct:25,tag:'media'}],
  6:[{nombre:'Desayuno',pct:20,tag:'media'},{nombre:'Colación AM',pct:8,tag:'ligera'},{nombre:'Comida',pct:27,tag:'fuerte'},{nombre:'Colación PM',pct:8,tag:'ligera'},{nombre:'Cena',pct:22,tag:'media'},{nombre:'Colación noche',pct:15,tag:'ligera'}]
};
const TAG_INFO={fuerte:{lbl:'Comida fuerte',v:0.30},media:{lbl:'Comida media',v:0.30},ligera:{lbl:'Colación',v:0}};
// Reparto muy general del plato por comida: reserva un espacio fijo de verduras (comidas fuertes/medias)
// y divide el resto entre proteína/carbohidratos/grasas en la misma proporción que tus macros del día.
function nutPlato(pP,cP,gP,verdurasPct){
  const rem=100-verdurasPct;
  let prot=Math.round(rem*pP/100), carb=Math.round(rem*cP/100);
  let grasa=100-verdurasPct-prot-carb;
  if(grasa<0){ carb=Math.max(0,carb+grasa); grasa=0; }
  return {verduras:verdurasPct, prot, carb, grasa};
}
function nutRepartoComidas(n,kcal,pP,cP,gP){
  const plant=MEAL_TEMPLATES[n]||MEAL_TEMPLATES[4];
  return plant.map(m=>{
    const info=TAG_INFO[m.tag];
    return Object.assign({kcal:Math.round(kcal*m.pct/100)}, m, info.v?{plato:nutPlato(pP,cP,gP,info.v*100)}:{});
  });
}
// Nutrición final: la calculada, o la que ajustó el nutriólogo/entrenador si personalizó al socio
function nutricionFinal(s){
  const base=calcNutricion(s), o=s.nutricion;
  if(!o || !o.override) return Object.assign({},base,{manual:false});
  return Object.assign({},base,{
    kcal:+o.kcal||base.kcal, prot:+o.prot||base.prot, carbs:+o.carbs||base.carbs, grasas:+o.grasas||base.grasas, agua:+o.agua||base.agua,
    manual:true
  });
}
