# Requerimientos de energía y macronutrientes para usuarios de gimnasio y atletas, por objetivo

> Nota metodológica: en esta sesión el proxy bloqueó la descarga directa de textos completos (jissn.biomedcentral.com, pmc.ncbi.nlm.nih.gov, mdpi.com, bjsm.bmj.com devolvieron error DNS/403). Las cifras se verificaron con resúmenes, abstracts y registros de repositorio que devolvió la búsqueda web. Los números marcados **[no verificado en esta sesión]** vienen de conocimiento previo de la literatura y conviene confirmarlos contra el texto original antes de convertirlos en reglas duras de la app.

## 1. Estimación de energía (ecuaciones, factores de actividad, precisión) y baja disponibilidad energética (LEA / REDs)

### Takeaway
Para población general de gimnasio, Mifflin-St Jeor es la ecuación de gasto en reposo mejor validada (acierta ±10% en más personas que otras); si la app conoce la masa libre de grasa (FFM), Cunningham funciona mejor en personas entrenadas. Toda estimación es un punto de partida: hay que ajustar con el peso real cada 2–3 semanas. La LEA se define clásicamente como <30 kcal/kg FFM/día (≥45 = "óptima"), pero el consenso del COI 2023 la trata como un espectro y desaconseja usar un único umbral para diagnosticar.

### Cited Findings
- Frankenfield et al. 2005 (revisión sistemática, ADA): Mifflin-St Jeor fue la ecuación más confiable, prediciendo la TMR dentro de ±10% del valor medido en más individuos no obesos y obesos que cualquier otra; adultos mayores y minorías étnicas estuvieron subrepresentados en el desarrollo y validación de las ecuaciones — [Resumen vía búsqueda / Penn State Pure](https://pure.psu.edu/en/publications/comparison-of-predictive-equations-for-resting-metabolic-rate-in-)
- Cifra secundaria atribuida a Frankenfield: Mifflin 82% dentro de ±10% en no obesos vs 73% Harris-Benedict original y 76% Harris-Benedict revisada — no confirmada en el abstract; usar con cautela — [Penn State Pure](https://pure.psu.edu/en/publications/comparison-of-predictive-equations-for-resting-metabolic-rate-in-)
- Meta-análisis 2023 en atletas (Sports Med): las ecuaciones Cunningham (1980), Harris-Benedict (1918), Cunningham (1991), De Lorenzo y Ten-Haaf no difirieron significativamente de la TMR medida; las demás (incluida Mifflin-St Jeor) sub- o sobreestimaron. Ten-Haaf fue la más precisa (80.2% de participantes dentro de ±10%); las demás entre 40.7% y 63.7% — [PubMed 37632665](https://pubmed.ncbi.nlm.nih.gov/37632665/)
- Atletas recreativos de 18–35 años (n=90): Cunningham predijo con exactitud el gasto en reposo; Harris-Benedict, OMS, Schofield, Mifflin y Owen tuvieron <50% de exactitud — [PMC4183531](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4183531/)
- Ultra-resistencia (n=30): Mifflin-St Jeor tuvo el menor error; Mifflin y Cunningham aceptables en hombres, Mifflin en mujeres, "con cautela" a falta de calorimetría — [Progress in Nutrition (Mattioli)](https://mattioli1885journals.com/index.php/progressinnutrition/article/download/8052/7918/33801)
- Fórmulas de referencia **[no verificado en esta sesión]**: Mifflin-St Jeor: hombres = 10·peso(kg) + 6.25·talla(cm) − 5·edad + 5; mujeres = mismo − 161. Cunningham (1980): 500 + 22·FFM(kg). Katch-McArdle: 370 + 21.6·FFM(kg). Harris-Benedict (1918/revisada 1984) tiende a sobreestimar en población actual — [Calculadora QxMD Mifflin](https://calculate.qxmd.com/storage/calculators/846/Mifflin-StJeorEquation.html)
- Consenso COI 2023 sobre REDs: la LEA es un espectro de "adaptable" a "problemática"; REDs aparece cuando la exposición a LEA problemática es prolongada o severa; no se diagnostica con un solo biomarcador; introduce la herramienta IOC REDs CAT2 (3 pasos, semáforo de 4 niveles) — [Human Performance Alliance, resumen del consenso 2023](https://humanperformancealliance.org/news/2023-international-olympic-committee-consensus-statement-on-reds/); [ACSM](https://acsm.org/?p=16119)
- El umbral <30 kcal/kg FFM/día se usa comúnmente como corte de LEA, pero proviene de estudios de laboratorio de corto plazo en mujeres sedentarias; dada la variabilidad interindividual solo puede estimarse que por debajo de 30 el cuerpo cambia prioridades — [Frontiers in Sports and Active Living 2024](https://www.frontiersin.org/articles/10.3389/fspor.2024.1390558/full)
- Disponibilidad energética "óptima" ≥45 kcal/kg FFM/día en mujeres atletas; 30–45 = rango subclínico; la existencia de estos umbrales es ampliamente debatida y no hay consenso sobre cómo medir cada componente — [Vidal.fr](https://www.vidal.fr/actualites/30846-deficit-energetique-amateurs-ou-elites-de-nombreux-sportifs-a-risque.html); [apcz.umk.pl](https://apcz.umk.pl/QS/article/download/75636/47785/259801)
- En hombres no se han establecido puntos de corte definitivos de LEA — [Frontiers 2024](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1390558/epub)
- Definición: EA = (ingesta energética − gasto por ejercicio) / kg FFM — [mysportscience (Jeukendrup)](https://mysportscience.com/post/can-we-measure-low-energy-availability)

### Inferences
- Regla práctica para la app: usar Mifflin-St Jeor por defecto; si el usuario tiene % de grasa medido (bioimpedancia en el gimnasio), ofrecer Cunningham/Katch-McArdle. Mostrar el resultado como rango (±10%) y recalibrar cada 2–3 semanas con el cambio de peso promedio (TDEE real ≈ ingesta − cambio de peso × ~7,700 kcal/kg, aproximación).
- Factores de actividad clásicos (multiplicadores de TMR) **[no verificado en esta sesión]**: sedentario 1.2; ligero 1.375; moderado 1.55; activo 1.725; muy activo 1.9. Son heurísticos sin validación fuerte; la mayoría de usuarios sobreestima su actividad, por lo que conviene sesgar hacia el factor menor.
- Alarma REDs para la app: si la ingesta estimada menos el gasto del ejercicio cae por debajo de ~30 kcal/kg FFM de forma sostenida, o aparecen señales (amenorrea, lesiones por estrés, fatiga persistente), mostrar advertencia y sugerir profesional; no usarlo como diagnóstico.

### Gaps
- No se pudieron leer los valores exactos de PAL de FAO/OMS/UNU ni validar los multiplicadores 1.2–1.9 (origen: práctica de la industria, no consenso).
- No se obtuvo el texto completo del consenso COI 2023 (Mountjoy et al., BJSM 2023;57:1073) para confirmar su redacción exacta sobre 30 kcal/kg FFM.
- No hay ecuaciones validadas específicamente en población mexicana en lo encontrado.

## 2. Déficit calórico para perder grasa: tamaño, ritmo semanal, preservación de músculo, pisos mínimos

### Takeaway
Ritmo recomendado: ~0.5–1% del peso corporal por semana (más cerca de 0.5–0.7% si el usuario es delgado y entrenado). Cuanto más grasa corporal tenga la persona, más agresivo puede ser el déficit. Mantener entrenamiento de fuerza y proteína alta (hasta 2.3–3.1 g/kg FFM en sujetos delgados) para preservar músculo. Los "pisos" de 1,200/1,500 kcal son reglas clínicas de uso común, no un estándar fisiológico.

### Cited Findings
- Helms, Aragon & Fitschen 2014 (JISSN 11:20): fijar las calorías para perder ~0.5–1% del peso corporal por semana para maximizar la retención muscular; proteína 2.3–3.1 g/kg de masa magra; grasa 15–30% de la energía; el resto carbohidratos; modificar frecuencia/timing tiene poco efecto en pérdida de grasa o retención de masa magra (revisión narrativa, población: culturistas naturales en preparación) — [AUT Open Repository](https://openrepository.aut.ac.nz/items/723f44d2-7c20-4214-ba62-987339099039/full); [PDF resumen](https://athletebody.jp/wp-content/uploads/2014/07/Natural-BB-Contest-Prep-Recommendations.pdf)
- ISSN Position Stand: Diets and Body Composition (Aragon et al. 2017): las dietas para perder grasa dependen de un déficit sostenido; "cuanto mayor la grasa corporal basal, más agresivamente puede imponerse el déficit"; un amplio rango de enfoques dietéticos (bajo en grasa a cetogénico) puede ser igual de eficaz; proteína 2.3–3.1 g/kg FFM puede requerirse para maximizar retención muscular en sujetos delgados y entrenados en hipocalórico; ingestas >3 g/kg son área emergente — [PubMed 28630601](https://pubmed.ncbi.nlm.nih.gov/28630601/); [DOAJ](https://doaj.org/article/ade5811724154baead28da15b3eb9b06)
- Garthe et al. 2011 (atletas de élite, 4 sesiones de fuerza/semana): pérdida lenta 0.7%/sem vs rápida 1.4%/sem; el grupo lento aumentó masa magra ~2.1% mientras perdía grasa; el rápido no ganó masa magra. Conclusión de los autores: apuntar a 0.7%/sem para ganar masa magra y fuerza durante la pérdida de peso. Confusor: el grupo lento hizo dieta más tiempo (~8.5 vs 5.3 semanas) — [SPONET registro](https://www.sponet.de/sponet/Record/4020931); [Iron Man Magazine (comentario)](https://www.ironmanmagazine.com/losing-fat-while-maintaining-muscle/)
- Rangos clínicos de dieta para pérdida de peso: mujeres 1,200–1,500 kcal/día; hombres 1,500–1,800 kcal/día; dietas <500 kcal/día no recomendadas — [Medicina 2019, tabla](https://pmc.ncbi.nlm.nih.gov/articles/PMC6571590/table/medicina-55-00166-t001a)
- Los "mínimos" 1,200 (mujeres) / 1,500 (hombres) atribuidos a NIH no tienen fuente primaria verificable; son reglas generales difundidas — [MyFitnessPal foro](https://community.myfitnesspal.com/es/discussion/1469616/retirar-el-comentario-de-you-are-likely-not-eating-enough); [FAQ r/1200isplenty](https://lr.eu.psf.lt/r/1200isplenty/wiki/faq)
- Guía AHA/ACC/TOS 2013 de obesidad **[no verificado en esta sesión]**: déficit de 500–750 kcal/día o 1,200–1,500 kcal (mujeres) / 1,500–1,800 kcal (hombres) — coincide con la tabla de Medicina 2019 arriba.

### Inferences
- Regla sugerida: déficit inicial = calorías que produzcan 0.5–1.0% de peso/semana; para un usuario de 80 kg ≈ 0.4–0.8 kg/sem ≈ 440–880 kcal/día de déficit (usando ~7,700 kcal/kg, aproximación que sobreestima la pérdida a largo plazo). Personas con obesidad pueden tolerar ~1%/sem; personas delgadas/entrenadas: 0.5–0.7%/sem.
- Piso en la app: no bajar de ~TMR estimada ni de 1,200 (mujeres)/1,500 (hombres) kcal sin supervisión profesional; además comprobar que EA no caiga <30 kcal/kg FFM.
- Si la pérdida >1%/sem durante ≥2 semanas (después de las primeras 1–2 semanas, donde hay pérdida de agua/glucógeno), aumentar calorías.

### Gaps
- No se encontró un consenso único sobre "% de déficit" (p. ej., 20–25% del TDEE); es práctica común pero sin fuente primaria confirmada aquí.
- El papel de "diet breaks"/refeeds no se investigó en esta sesión.

## 3. Superávit calórico para ganar músculo: por nivel de entrenamiento, ganancia esperada

### Takeaway
Superávit pequeño: ~10–20% sobre mantenimiento para novatos/intermedios, menor para avanzados, buscando ganar ~0.25–0.5% del peso corporal por semana. Evidencia reciente en entrenados sugiere que superávits mayores aumentan sobre todo la grasa, no el músculo.

### Cited Findings
- Iraki, Fitschen, Espinar & Helms 2019 (Sports, MDPI; revisión narrativa, culturistas naturales en off-season): superávit ~10–20% para novatos e intermedios con ganancia de ~0.25–0.5% del peso/semana; avanzados con superávit menor y ganancia más lenta; proteína 1.6–2.2 g/kg/día en 3–6 comidas con ~0.40–0.55 g/kg por comida; grasa 0.5–1.5 g/kg/día; carbohidratos el resto, ≥3–5 g/kg/día — [PubMed 31247944](https://pubmed.ncbi.nlm.nih.gov/31247944/); [MDPI](https://www.mdpi.com/2075-4663/7/7/154)
- Un sitio secundario atribuye 5–10% de superávit para avanzados a Iraki 2019, no confirmado en el abstract — [Barbend](https://barbend.com/how-many-calories-to-eat-bulking-season)
- Helms et al. 2023 (Sports Medicine – Open): 21 levantadores entrenados (17 completaron), 8 semanas, 3 d/sem: mantenimiento vs superávit moderado (5%) vs alto (15%). Sin evidencia de diferencias en grosor muscular ni 1RM sentadilla; el superávit alto mejoró más el 1RM de banca y aumentó más los pliegues cutáneos. Conclusión: tasas mayores de ganancia de peso aumentan principalmente la grasa. Limitaciones: muestra pequeña, participantes comieron por encima del objetivo — [PubMed 37914977](https://pubmed.ncbi.nlm.nih.gov/37914977/); [DOAJ](https://doaj.org/article/ab6ce09af2cc4daa9a1c2e9b88e1b1e9)
- ISSN 2017 (dietas y composición corporal): la ganancia de masa magra puede ocurrir en recomposición; las dietas cetogénicas parecen requerir superávit para ganar músculo — [PubMed 28630601](https://pubmed.ncbi.nlm.nih.gov/28630601/); [PMC9564904](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9564904/)

### Inferences
- Regla sugerida: novato +10–20% (≈ +250–500 kcal); intermedio +5–15%; avanzado +5–10% (o mantenimiento/recomposición). Objetivo de ganancia: novato ~0.5%/sem (~2% /mes), intermedio ~0.25–0.5%/sem (~1–2%/mes), avanzado ≤0.25%/sem (~0.5–1%/mes). Los valores mensuales son derivación aritmética de 0.25–0.5%/sem, no cifras publicadas.
- Si el usuario tiene % de grasa alto (p. ej., hombres >20–25%, mujeres >30–35%), priorizar recomposición o déficit antes del superávit (inferencia, sin umbral consensuado).

### Gaps
- Los modelos populares de "ganancia mensual esperada por nivel" (Aragon, McDonald: p. ej., 1–1.5% del peso/mes en novatos) no se pudieron verificar con fuente primaria.
- Slater et al. 2019 (revisión sobre superávit energético) no apareció en las búsquedas.

## 4. Proteína: g/kg/día por objetivo, dosis por comida, distribución, leucina, caseína antes de dormir, calidad vegetal vs animal, límites superiores

### Takeaway
Base para gimnasio: 1.4–2.0 g/kg/día (ISSN); el beneficio en masa magra se estabiliza alrededor de 1.6 g/kg/día (Morton 2018), con 2.2 g/kg como techo práctico para cubrir variabilidad; en déficit y en sujetos delgados, 2.3–3.1 g/kg FFM. Por comida: ~0.25–0.4 g/kg (20–40 g) en ≥4 comidas. Antes de dormir: 30–40 g de caseína. La RDA (0.8 g/kg) es un mínimo para sedentarios, no un óptimo para quien entrena.

### Cited Findings
- RDA adultos: 0.8 g/kg/día (56 g hombres / 46 g mujeres de referencia); AMDR proteína 10–35% de energía — [NASEM DRI tabla resumen, NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?rep); [National Academies](https://www.nationalacademies.org/read/11767/chapter/9)
- ISSN Position Stand Protein & Exercise (Jäger et al. 2017, JISSN 14:20): 1.4–2.0 g/kg/día para construir y mantener músculo en la mayoría de quienes hacen ejercicio; dosis por toma ~0.25 g/kg de proteína de alta calidad o 20–40 g totales; ejercicio y proteína son sinérgicos cuando la proteína se consume antes o después — [NutraIngredients](https://www.nutraingredients.com/Article/2017/06/21/ISSN-publishes-position-stand-on-protein-and-exercise/); [DOAJ](https://doaj.org/article/fcc34534a75d466aa37abda0042df7a7)
- ISSN 2017 **[no verificado en esta sesión, texto completo bloqueado]**: dosis óptima contiene ~700–3,000 mg de leucina (6–10 g de EAA); distribuir cada 3–4 h; ingestas de 3–4 g/kg/día en individuos entrenados no han mostrado efectos adversos en estudios de corto plazo.
- ACSM/AND/DC 2016 (Thomas, Erdman & Burke, MSSE 48(3):543–568): 1.2–2.0 g/kg/día; espaciar cantidades moderadas de proteína de alta calidad (~0.3 g/kg) tras el ejercicio y a lo largo del día — [NFPT resumen](https://archive25.nfpt.com/?p=33767); [mysportscience](https://www.mysportscience.com/post/2016/04/02/new-position-statement-on-nutrition-and-athletic-performance)
- Morton et al. 2018 (BJSM 52:376; 49 estudios, 1,863 participantes): la suplementación proteica más allá de una ingesta total de 1.62 g/kg/día no produjo ganancias adicionales de FFM inducidas por entrenamiento de fuerza (análisis de punto de quiebre: 42 brazos, 723 sujetos); el efecto disminuye con la edad y es mayor en entrenados — [BJSM abstract](https://bjsm.bmj.com/content/52/6/376.abstract); [AUT repositorio](https://openrepository.aut.ac.nz/items/8dea98a4-4e37-4c60-be43-4b6ece0bd9a5/full)
- IC 95% del punto de quiebre de Morton: ~1.03–2.20 g/kg/día; de ahí la recomendación de 2.2 g/kg como límite superior práctico **[IC no verificado en esta sesión; aparece en secundarias]** — [Stronger by Science](https://www.strongerbyscience.com/?p=61316)
- Nunes et al. 2022 (J Cachexia Sarcopenia Muscle; 74 ECA): en <65 años, ≥1.6 g/kg/día con ejercicio de fuerza aumentó masa magra; en ≥65 años el efecto fue significativo con 1.2–1.59 g/kg/día — [PubMed 35187864](https://pubmed.ncbi.nlm.nih.gov/35187864/)
- Déficit: 2.3–3.1 g/kg FFM (ISSN 2017 dietas; Helms 2014) — [PubMed 28630601](https://pubmed.ncbi.nlm.nih.gov/28630601/); [AUT repositorio Helms](https://openrepository.aut.ac.nz/items/723f44d2-7c20-4214-ba62-987339099039/full)
- Schoenfeld & Aragon 2018 (JISSN 15:10): para maximizar anabolismo, 0.4 g/kg/comida en mínimo 4 comidas para llegar a ≥1.6 g/kg/día; con 2.2 g/kg/día en 4 comidas, hasta 0.55 g/kg/comida. Los ~20–25 g "máximos" de estudios antiguos son específicos de proteína rápida aislada — [PMC5828430](https://pmc.ncbi.nlm.nih.gov/articles/PMC5828430/); [DOAJ](https://doaj.org/article/4922eba27775405f945f3d34067cf0e3)
- Iraki 2019: 3–6 comidas, 0.40–0.55 g/kg por comida en off-season — [PubMed 31247944](https://pubmed.ncbi.nlm.nih.gov/31247944/)
- ISSN Nutrient Timing (Kerksick et al. 2017, JISSN 14:33): ~30–40 g de caseína antes de dormir aumenta la síntesis proteica nocturna y la tasa metabólica sin afectar la lipólisis — [DOAJ](https://doaj.org/article/8044581e83354ad88642b8124c51b956); [Exercise & Sport Nutrition Lab](https://exerciseandsportnutritionlab.com/latest-issn-nutrient-timing-guidelines-published/)
- Calidad vegetal vs animal: suero y soya clasifican como alta calidad (DIAAS ≥75); chícharo, avena, arroz y otras vegetales <75 ("sin declaración de calidad"); mezclas (papa, soya, chícharo) elevan el DIAAS — [PMC7590266](https://pmc.ncbi.nlm.nih.gov/articles/PMC7590266/)
- Meta-análisis 2025 (Reid-McCann, Nutrition Reviews; 30 ECA, 1,538 participantes): pequeña ventaja de la proteína animal en masa muscular (SMD −0.20; IC95% −0.37 a −0.03) que desaparece con soya vs leche; sin diferencias en fuerza ni desempeño — [GetFitCraft (resumen secundario)](https://getfitcraft.com/science/whey-vs-plant-protein-research); verificar en el original
- Soya produjo ganancias similares de fuerza y masa magra que suero con entrenamiento (IJSNEM 2018) — [PubMed 33971994 / referencias](https://pubmed.ncbi.nlm.nih.gov/33971994/); contradicho parcialmente por Br J Nutr 2022 (suero mejoró masa magra, soya no) — mismo resumen de búsqueda

### Inferences
- Reglas sugeridas (g/kg peso corporal/día): salud general/sedentario ≥0.8 (mejor 1.0–1.2); gimnasio mantenimiento 1.4–1.6; hipertrofia 1.6–2.2; déficit 1.8–2.7 g/kg peso (≈2.3–3.1 g/kg FFM en delgados); adultos ≥65 con fuerza ≥1.2–1.6. En personas con obesidad, calcular sobre peso ajustado o peso meta (inferencia; no consensuado aquí).
- Por comida: objetivo 0.3–0.4 g/kg (≈20–40 g; en mayores de 65, hacia el extremo alto), 3–6 comidas, una de ellas antes de dormir si conviene.
- Dietas vegetarianas/veganas: subir el objetivo ~10–20% o combinar fuentes (inferencia basada en DIAAS más bajo).
- Tope en la app: avisar si >3.0–3.5 g/kg/día (no por daño probado en sanos, sino falta de beneficio y desplazamiento de otros nutrientes); en enfermedad renal, derivar al médico.

### Gaps
- No se verificó el umbral de leucina (≈2–3 g/comida; 700–3,000 mg) contra el texto original de ISSN.
- No se encontraron IDR/IDS de proteína de las "Recomendaciones de Ingestión de Nutrimentos para la Población Mexicana" (Bourges et al.).
- Morgan et al. 2021 (vegetal vs animal) no apareció en las búsquedas.

## 5. Carbohidratos: g/kg/día por volumen de entrenamiento, periodización, low-carb/keto en fuerza

### Takeaway
Los carbohidratos se ajustan a la carga de entrenamiento ("fuel for the work required"): 3–5 g/kg (ligera), 5–7 (moderada ~1 h/d), 6–10 (alta 1–3 h/d), 8–12 (muy alta >4–5 h/d). Para el socio típico de gimnasio (fuerza 3–5 días/semana, ~1 h) basta ~3–5 g/kg; los rangos altos aplican a deportes de resistencia. Keto no parece perjudicar fuerza ni masa magra en entrenados, pero la evidencia es pequeña y la adherencia baja.

### Cited Findings
- Burke et al. 2011 (J Sports Sci 29 S1:S17–S27), adoptado por ACSM 2016: ligera (baja intensidad o habilidad) 3–5 g/kg/d; moderada (~1 h/d) 5–7; alta (1–3 h/d moderada-alta) 6–10; muy alta (>4–5 h/d) 8–12 — [Nutrients 2019 tabla, PMC6950062](https://pmc.ncbi.nlm.nih.gov/articles/PMC6950062/table/nutrients-11-03017-t002); [UNM Kravitz](https://www.unm.edu/~lkravitz/Article%20folder/carbohydratenew.html); [Birmingham](https://research.birmingham.ac.uk/en/publications/carbohydrates-for-training-and-competition/)
- ACSM/AND/DC 2016: 3–10 g/kg/d y hasta 12 g/kg/d en actividad extrema y prolongada — [NFPT](https://archive25.nfpt.com/?p=33767)
- Variante Gatorade SSI 2024: 3–7 g/kg/d para programas moderados — [Gatorade PDF](https://performancepartner.gatorade.com/content/resources/pdfs/science-of-carbohydrate-2024.pdf)
- Off-season culturismo: carbohidratos el resto de la energía, ≥3–5 g/kg/d — [PubMed 31247944](https://pubmed.ncbi.nlm.nih.gov/31247944/)
- RDA carbohidrato 130 g/d (glucosa cerebral); AMDR 45–65% de energía — [NCBI Bookshelf DRI](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?rep)
- Vargas-Molina et al. 2022 (meta-análisis, 5 estudios, 111 entrenados): sin diferencias significativas en FFM entre keto y control; keto parece requerir superávit para ganar músculo; >8 semanas continuas no recomendable por saciedad/adherencia — [PMC9564904](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9564904/)
- Vargas-Molina et al. 2024 (Nutrients): sin diferencias en 1RM sentadilla (n=106) ni banca (n=119) entre keto y control — [PubMed 39064644](https://pubmed.ncbi.nlm.nih.gov/39064644/)
- ISSN 2017 dietas: enfoques bajo en grasa a cetogénico pueden ser igualmente eficaces para composición corporal si se igualan calorías y proteína — [PubMed 28630601](https://pubmed.ncbi.nlm.nih.gov/28630601/)

### Inferences
- Regla sugerida: carbohidrato = energía restante tras fijar proteína y grasa mínima, con piso recomendado ~3 g/kg en quien entrena fuerza con volumen moderado (flexible si el usuario prefiere low-carb). Para usuarios que además corren/ciclismo >1 h/día, escalar a 5–7 g/kg.
- Periodizar: más carbohidrato en días de entrenamiento intenso/largo; menos en descanso (aplicable sobre todo a atletas).

### Gaps
- No se verificó el texto original de Burke 2011 (solo adaptaciones secundarias consistentes entre sí).
- No se investigó carbohidrato peri-entreno específico (g/kg/h) por estar fuera del foco de gimnasio general.

## 6. Grasa: % de energía y mínimos g/kg, hormonas, ácidos grasos esenciales/omega-3

### Takeaway
Rango general 20–35% de la energía (AMDR y ACSM); en déficit de culturismo se tolera 15–30%; en off-season 0.5–1.5 g/kg/día. Evitar dietas muy bajas en grasa: bajar de ~40% a ~20% de grasa se asoció con ~10–15% menos testosterona en hombres.

### Cited Findings
- AMDR grasa 20–35% de energía — [NCBI Bookshelf DRI](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?rep)
- ACSM/AND/DC 2016: grasa 20–35% de la energía total — [NFPT](https://archive25.nfpt.com/?p=33767)
- Helms 2014 (preparación de competencia): 15–30% de calorías de grasa — [AUT repositorio](https://openrepository.aut.ac.nz/items/723f44d2-7c20-4214-ba62-987339099039/full)
- Iraki 2019 (off-season): 0.5–1.5 g/kg/día — [PubMed 31247944](https://pubmed.ncbi.nlm.nih.gov/31247944/)
- Whittaker & Wu 2021 (J Steroid Biochem Mol Biol; 6 estudios, 206 hombres): dietas bajas en grasa reducen testosterona total, libre, urinaria y DHT; pasar de 40% a 20% de grasa bajó ~11.5% en promedio (15% en hombres de ascendencia europea); evidencia limitada — [Nutrition Evidence](https://nutrition-evidence.com/article/377532/low-fat-diets-and-testosterone-in-men-systematic-review-and-meta-analysis-of-intervention-studies); [Stronger by Science](https://www.strongerbyscience.com/low-fat-diets-testosterone/)
- Omega-3/esenciales **[no verificado en esta sesión]**: IA de ácido α-linolénico 1.6 g/d hombres, 1.1 g/d mujeres; ácido linoleico 17 g/d hombres, 12 g/d mujeres (19–50 años) — IOM 2002/2005.

### Inferences
- Regla sugerida: grasa mínima ≈ max(20% de energía, ~0.6 g/kg/día) para la mayoría; permitir 15% solo en fases cortas de definición avanzada; máximo ~35% (o más si el usuario elige low-carb). Incluir ≥2 porciones de pescado graso/semana o fuente de ALA (inferencia de guías generales).
- En mujeres, grasa muy baja + déficit grande aumenta riesgo de LEA/alteraciones menstruales (inferencia vinculada a REDs).

### Gaps
- No se verificó una recomendación específica de EPA+DHA para deportistas ni el consenso COI 2018 de suplementos.
- No se encontraron datos de grasa y hormonas en mujeres.

## 7. Fibra

### Takeaway
IOM: 14 g/1,000 kcal (≈38 g hombres, 25 g mujeres de 19–50 años). En México la referencia de etiquetado (NOM-051) usa 30 g/día; la población mexicana consume menos de lo recomendado.

### Cited Findings
- IA fibra: 14 g/1,000 kcal; 38 g/d hombres y 25 g/d mujeres (19–50 años) — [NCBI Bookshelf DRI](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?rep); [National Academies](https://www.nationalacademies.org/read/11767/chapter/9)
- México: recomendación de 30 g/d según NOM-051; otros autores sugieren hasta 35 g en hombres; adolescentes 14–18 años: 30 g (H) / 26 g (M) según Recomendaciones de Ingestión de Nutrimentos para la Población Mexicana 2008 — [Revista Portales Médicos](https://www.revista-portalesmedicos.com/revista-medica/consumo-de-macronutrimentos-y-fibra/); otra fuente universitaria: 25–30 g/d — [REDICINAYSA UGTO](https://www.redicinaysa.ugto.mx/index.php/REDICINAYSA/article/download/213/195/374)
- La ingesta habitual de fibra en la población mexicana es baja y la de azúcares añadidos y grasas saturadas alta — [FAO microdata citation](https://microdata.fao.org/index.php/citations/148)
- Obra base mexicana: Bourges, Casanueva & Rosado, "Recomendaciones de ingestión de nutrimentos para la población mexicana" (Panamericana, 2005/2008), define RNP, IDR, IDS y LSC — [ALAN revista](https://www.alanrevista.org/download/article/5252)

### Inferences
- Regla sugerida: fibra = 14 g × (kcal objetivo/1000), con mínimo 25 g; mostrar 30 g como meta de referencia mexicana. En días de alto volumen o pre-competencia, se puede reducir temporalmente para tolerancia GI (aplica a atletas).

### Gaps
- No se obtuvo el texto oficial de NOM-051 ni de Bourges con valores de fibra y proteína para adultos.

## 8. Diferencias por sexo, edad y nivel de entrenamiento

### Takeaway
Las recomendaciones en g/kg son en general iguales para hombres y mujeres; las diferencias relevantes son: ecuaciones de gasto distintas por sexo, mayor riesgo y umbrales de LEA mejor estudiados en mujeres, mayor necesidad de proteína por comida/día en ≥65 años (resistencia anabólica), y superávit/ritmos más conservadores en avanzados.

### Cited Findings
- Edad: el efecto de la proteína sobre FFM se reduce con la edad (Morton 2018); en ≥65 años beneficio con 1.2–1.59 g/kg/día; en <65 con ≥1.6 g/kg/día y fuerza (Nunes 2022) — [BJSM abstract](https://bjsm.bmj.com/content/52/6/376.abstract); [PubMed 35187864](https://pubmed.ncbi.nlm.nih.gov/35187864/)
- Nivel de entrenamiento: la suplementación proteica es más eficaz en entrenados (Morton 2018) — [BJSM abstract](https://bjsm.bmj.com/content/52/6/376.abstract); superávit menor y ganancia más lenta para avanzados (Iraki 2019) — [PubMed 31247944](https://pubmed.ncbi.nlm.nih.gov/31247944/)
- Sexo: umbrales de LEA derivados de mujeres; puntos de corte en hombres no establecidos — [Frontiers 2024](https://www.frontiersin.org/articles/10.3389/fspor.2024.1390558/full); ecuación de Mifflin con constante distinta por sexo y precisión variable por sexo en atletas — [Progress in Nutrition](https://mattioli1885journals.com/index.php/progressinnutrition/article/download/8052/7918/33801)
- Fibra y energía de referencia difieren por sexo (38 vs 25 g) — [NCBI Bookshelf DRI](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?rep)
- Ecuaciones desarrolladas con poca representación de adultos mayores y minorías étnicas — [Penn State Pure](https://pure.psu.edu/en/publications/comparison-of-predictive-equations-for-resting-metabolic-rate-in-)

### Inferences
- Para la app: mujeres → cribado de síntomas de REDs (menstruación) cuando haya déficit; ≥65 años → proteína por comida hacia 0.4 g/kg y ≥1.2 g/kg/día; avanzados → superávits ≤10% o recomposición.

### Gaps
- No se encontró evidencia específica sobre variación de necesidades según fase del ciclo menstrual ni sobre adultos mexicanos.
- Fuentes con cifras más antiguas o discutidas: los multiplicadores de actividad, el "mínimo 1,200/1,500 kcal", la regla 7,700 kcal/kg (3,500 kcal/lb) — todas heurísticas que deben presentarse como estimaciones.
