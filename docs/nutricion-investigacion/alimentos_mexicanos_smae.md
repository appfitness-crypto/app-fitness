# Alimentos mexicanos, porciones caseras y el Sistema Mexicano de Alimentos Equivalentes (SMAE)

> **Limitaciones de esta investigación (léanse antes de usar los números).** En esta sesión WebFetch y curl no tenían acceso de red (fallo de DNS o 403 del proxy en fisiologia.facmed.unam.mx, pdfcoffee.com, heynutre.com y api.nal.usda.gov). Solo funcionó WebSearch, así que todos los datos citados vienen de **resúmenes de resultados de búsqueda** sobre las páginas enlazadas, no de una lectura directa de las tablas. Los valores marcados **[conocido, sin verificar]** son cifras estándar del SMAE 4.ª ed. que no pude confirmar con una fuente en esta sesión. Hay que verificarlos contra el libro antes de cargarlos en la app.
>
> **Ficha del SMAE:** Pérez Lizaur AB, Palacios González B, Castro Becerra AL, Flores Galicia I. *Sistema Mexicano de Alimentos Equivalentes*, 4.ª ed. México: Fomento de Nutrición y Salud A.C. / Ogali; 2014. Se citan existen una 5.ª ed. y una versión de 2014 ([UNAM Facultad de Medicina, Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [Scribd "Tabla de Porciones SMAE 5ta Edición"](https://es.scribd.com/document/670591266/Alimentos-Equivalentes-SMAE)).

## 1. Estructura del SMAE: grupos, subgrupos y aporte por equivalente

### Takeaway
El SMAE define un "equivalente" como una porción con un aporte nutrimental parecido al de los demás alimentos de su grupo, por lo que se pueden intercambiar dentro del grupo. Un motor de comidas puede manejarse con una tabla fija de unos 18 subgrupos (kcal/P/G/HC) y una lista de alimentos con la porción que vale un equivalente de su subgrupo.

### Cited Findings
- Un equivalente es una porción cuyo aporte nutrimental es similar en calidad y cantidad a otros alimentos de su grupo, y por eso son intercambiables. El sistema se usaba en México desde los años 70 como traducción del sistema estadounidense de intercambios. En 1988 lo adaptaron a la población mexicana nutriólogos del Instituto Nacional de Nutrición, entre ellos Ana Berta Pérez Lizaur. — [UAM Xochimilco, repositorio](https://repositorio.xoc.uam.mx/jspui/retrieve/1c20a869-8df1-4694-ab79-4b2a9c74be66/251120.pdf)
- Verduras: 25 kcal, 2 g de proteína, 0 g de lípidos y 4 g de HC. Frutas: 60 kcal y 15 g de HC. — [heynutre, tabla SMAE](https://www.heynutre.com/tabla-equivalencias-smae/); [Studocu, resumen SMAE](https://www.studocu.com/es-mx/document/universidad-autonoma-del-carmen/evaluacion-del-estado-nutricio/smae-resumen-sobre-el-sistema-mexicano-de-equivalentes/50631086)
- Cereales sin grasa: 70 kcal, 2 g P, 0 g L, 15 g HC. Cereales con grasa: 115 kcal, 2 g P, 5 g L, 15 g HC. — [heynutre guía](https://www.heynutre.com/blog/sistema-mexicano-equivalencias-guia/); [sistemadigitaldealimentos.org, cereales](https://www.sistemadigitaldealimentos.org/equivalentes/grupo/cereales)
- Leguminosas: 120 kcal, 8 g P, 1 g L, 20 g HC. — [heynutre tabla](https://www.heynutre.com/tabla-equivalencias-smae/)
- Alimentos de origen animal (AOA), todos con 7 g de proteína por equivalente: muy bajo aporte de grasa 40 kcal, bajo 55 kcal, moderado 75 kcal, alto 100 kcal. Para "muy bajo", el anexo de la UNAM da 40 kcal / 7 g P / 1 g L / 0 g HC. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [heynutre guía](https://www.heynutre.com/blog/sistema-mexicano-equivalencias-guia/)
- Leche descremada: 95 kcal y 9 g de proteína por equivalente. — [heynutre tabla](https://www.heynutre.com/tabla-equivalencias-smae/)
- Grasas: su nutrimento clave son 5 g de lípidos por equivalente. En los AOA el nutrimento clave son 7 g de proteína. — [heynutre guía](https://www.heynutre.com/blog/sistema-mexicano-equivalencias-guia/)
- Como referencia general, un adulto sano con actividad moderada o alta necesita de 8 a 12 equivalentes de cereales y tubérculos al día. — [ilcereales.lat](https://ilcereales.lat/porciones-equivalentes-de-cereales-para-alimentacion-diaria/) (fuente secundaria)

**Tabla maestra propuesta para la app (por 1 equivalente)**

| Grupo | Subgrupo | kcal | Proteína g | Lípidos g | HC g | Estado |
|---|---|---|---|---|---|---|
| Verduras | — | 25 | 2 | 0 | 4 | citado |
| Frutas | — | 60 | 0 | 0 | 15 | citado (kcal/HC) |
| Cereales y tubérculos | sin grasa | 70 | 2 | 0 | 15 | citado |
| Cereales y tubérculos | con grasa | 115 | 2 | 5 | 15 | citado |
| Leguminosas | — | 120 | 8 | 1 | 20 | citado |
| AOA | muy bajo aporte de grasa | 40 | 7 | 1 | 0 | citado |
| AOA | bajo aporte de grasa | 55 | 7 | 3 | 0 | kcal y P citadas; L [conocido, sin verificar] |
| AOA | moderado aporte de grasa | 75 | 7 | 5 | 0 | kcal y P citadas; L [conocido, sin verificar] |
| AOA | alto aporte de grasa | 100 | 7 | 8 | 0 | kcal y P citadas; L [conocido, sin verificar] |
| Leche | descremada | 95 | 9 | 2 | 12 | kcal y P citadas; L/HC [conocido, sin verificar] |
| Leche | semidescremada | 110 | 9 | 4 | 12 | [conocido, sin verificar] |
| Leche | entera | 150 | 9 | 8 | 12 | [conocido, sin verificar] |
| Leche | con azúcar | 200 | 8 | 5 | 30 | [conocido, sin verificar] |
| Aceites y grasas | sin proteína | 45 | 0 | 5 | 0 | L citado; resto [conocido, sin verificar] |
| Aceites y grasas | con proteína | 70 | 3 | 5 | 3 | [conocido, sin verificar] |
| Azúcares | sin grasa | 40 | 0 | 0 | 10 | [conocido, sin verificar] |
| Azúcares | con grasa | 85 | 0 | 5 | 10 | [conocido, sin verificar] |
| Alimentos libres de energía | — | 0 (≤ ~20 kcal) | 0 | 0 | 0 | [conocido, sin verificar] |

### Inferences
- Los valores del SMAE son promedios redondeados, así que la suma de kcal no cuadra exactamente con 4/4/9. Ejemplo: muy bajo en grasa da 7×4 + 1×9 = 37 frente a 40 kcal. La app debería guardar las kcal oficiales del subgrupo y no recalcularlas.
- En nutrición deportiva conviene mostrar "proteína por 100 kcal" por subgrupo para ordenar fuentes: AOA muy bajo en grasa ≈ 17.5 g, AOA bajo ≈ 12.7 g, leche descremada ≈ 9.5 g, leguminosas ≈ 6.7 g, AOA alto ≈ 7 g (derivado de la tabla).
- Modelo de datos sugerido: `subgrupo(id, kcal, p, g, hc)` + `alimento(id, nombre_es, subgrupo_id, medida_casera, cantidad, unidad, gramos_netos, fuente, edicion)`. Para mezclas como la tortilla de harina (cereal con grasa), guardar el número de equivalentes por grupo, por ejemplo 1 cereal sin grasa + 1 grasa.

### Gaps
- No pude abrir el texto completo del SMAE 4.ª ni 5.ª ed. para confirmar lípidos y HC de AOA bajo, moderado y alto, de las leches semidescremada, entera y con azúcar, de grasas con proteína y de azúcares. Tampoco pude confirmar si la 5.ª ed. cambió algún valor por subgrupo; no encontré ninguna fuente que describa los cambios de la 5.ª ed.
- Existe un subgrupo de "leche con azúcar" y, en algunas versiones, de "yogur". No verifiqué si la 5.ª ed. agrega subgrupos.

## 2. Porciones equivalentes concretas de alimentos comunes

### Takeaway
Las porciones de los alimentos básicos (tortilla, ½ bolillo, ½ taza de frijol, 1 huevo, 40 g de panela, 1 cdita de aceite, 1 taza de papaya, 1 manzana, 1 taza de nopal) aparecen en varias fuentes. Algunas porciones **varían entre fuentes o ediciones**: arroz, avena, pasta, aguacate y chayote. La app debe guardar la edición junto a cada porción.

### Cited Findings
- 1 tortilla de maíz = ½ bolillo = 1 equivalente de cereal sin grasa. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [Xataka México](https://www.xataka.com.mx/investigacion/a-cuantas-tortillas-equivale-bolillo-ciencia-tiene-respuesta)
- Tortilla de 30 g: una fuente que dice citar el manual del SMAE vía UNAM da 65 kcal, 0.5 g de grasa, 10 g de HC y 1.5 g de proteína. Eso no cuadra con el equivalente promedio de 70/2/0/15, así que es un valor por alimento y no por subgrupo; hay que verificarlo. — resumen de búsqueda (fuente sin identificar con precisión; ver [fitia, tortilla de maíz](https://fitia.app/calories-nutritional-information/tortilla-de-maiz-15969/))
- Arroz cocido: ¼ taza. — [sistemadigitaldealimentos.org](https://www.sistemadigitaldealimentos.org/equivalentes/grupo/cereales); [heynutre](https://www.heynutre.com/tabla-equivalencias-smae/)
- Avena cruda: ⅓ taza ([UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [ilcereales](https://ilcereales.lat/porciones-equivalentes-de-cereales-para-alimentacion-diaria/)), **contradicho por** ½ taza (20 g) en [sistemadigitaldealimentos.org](https://www.sistemadigitaldealimentos.org/equivalentes/grupo/cereales). Avena cocida: ¾ taza.
- Pasta cocida: ½ taza ([Studocu SMAE](https://www.studocu.com/es-mx/document/universidad-nacional-autonoma-de-mexico/nutriologia-y-salud-oral/sistema-mexicano-de-alimentos-equivalentes-smae-sistema-mexicano-de-alimentos-equivalentes-smae/24897095)), **contradicho por** ⅓ taza en la [tabla "5ta Edición" de Scribd](https://es.scribd.com/document/670591266/Alimentos-Equivalentes-SMAE).
- Camote: ½ taza. — [Scribd 5ta ed.](https://es.scribd.com/document/670591266/Alimentos-Equivalentes-SMAE)
- Frijol entero cocido: ½ taza ≈ 86 g ([pdfcoffee SMAE](https://pdfcoffee.com/smae-2-pdf-free.html)); otra tabla da 85 g ([Studocu Tecmilenio](https://www.studocu.com/es-mx/document/universidad-tecmilenio/administracion-financiera/lista-de-alimentos-equivalentes-completa/81799798)).
- Huevo entero: 1 pieza, en AOA. Queso panela: 40 g; algunas guías usan 30 g para panela reducida en grasa. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [Querétaro Maratón, equivalentes 2024](https://www.queretaromaraton.com.mx/file/QM_EQUIVALENTES_2024.pdf)
- Pechuga de pollo o pavo: 30 g cocida = 1 equivalente de AOA muy bajo en grasa. En el mismo subgrupo están el atún en agua, los mariscos, el pescado blanco y la clara de huevo. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [heynutre guía](https://www.heynutre.com/blog/sistema-mexicano-equivalencias-guia/)
- Bistec: una tabla en línea da 30 g = 43 kcal, 7 g P, 1.5 g L. — [heynutre tabla](https://www.heynutre.com/tabla-equivalencias-smae/)
- Queso Oaxaca: 30 g, en AOA moderado en grasa según una fuente; **otra** lo pone en alto en grasa con unos 95 kcal. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [Scribd Doc1](https://www.scribd.com/document/628845872/Doc1)
- Soya texturizada: está en leguminosas, porción de 30 g (fuente secundaria). Yogur griego: ½ taza en una guía de equivalentes de 2024, con grupo SMAE sin confirmar. — [Querétaro Maratón 2024](https://www.queretaromaraton.com.mx/file/QM_EQUIVALENTES_2024.pdf); [heynutre](https://www.heynutre.com/equivalencias-smae/)
- Aguacate: ⅓ de pieza en varias listas **frente a** ¼ de pieza en la guía de la UNAM y otra guía. Aceite (canola, cártamo, girasol, oliva): 1 cucharadita, en grasas sin proteína. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [nutricionsinfiltros SMAE](https://nutricionsinfiltros.com/wp-content/uploads/2024/01/SMAE-.pdf); [Nutrideas 2025](https://nutrideasfit.com/wp-content/uploads/2025/01/Guia-de-Equivalentes_-2025_compressed.pdf)
- Frutas: papaya picada 1 taza; manzana 1 pieza; mango Ataulfo ½ pieza. Plátano según variedad: Tabasco ½ pieza (≈ 60 g), dominico 3 piezas, macho ¼ pieza. — [Scribd 5ta ed.](https://es.scribd.com/document/670591266/Alimentos-Equivalentes-SMAE); [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [sistemadigitaldealimentos.org frutas](https://www.sistemadigitaldealimentos.org/equivalentes/grupo/frutas)
- Verduras: nopal cocido 1 taza; calabacita cruda 1 pieza (cocida ½ taza); espinaca cocida ½ taza; jitomate bola 1 pieza. Chayote: ½ pieza cocido (UNAM, otra lista) **frente a** ½ taza hervido = 80 g (Sistema Digital). — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf); [sistemadigitaldealimentos.org verduras](https://www.sistemadigitaldealimentos.org/equivalentes/grupo/verduras); [Querétaro Maratón 2024](https://www.queretaromaraton.com.mx/file/QM_EQUIVALENTES_2024.pdf)

**Tabla de porciones para la app** (las macros salen del subgrupo de la sección 1; "a verificar" = no confirmado en esta sesión)

| Alimento | Subgrupo SMAE | Medida casera por 1 eq. | g | Estado |
|---|---|---|---|---|
| Tortilla de maíz | Cereal sin grasa | 1 pieza | ~30 | citado |
| Bolillo / telera (sin migajón) | Cereal sin grasa | ½ pieza | a verificar | citado (medida) |
| Tortilla de harina | Cereal con grasa | 1 pieza | a verificar | grupo [conocido, sin verificar] |
| Arroz cocido | Cereal sin grasa | ¼ taza | a verificar | citado |
| Avena cruda | Cereal sin grasa | ⅓ taza (o ½ taza = 20 g) | — | en conflicto |
| Pasta cocida | Cereal sin grasa | ½ taza (o ⅓) | — | en conflicto |
| Camote | Cereal sin grasa | ½ taza | — | citado |
| Papa | Cereal sin grasa | a verificar | — | brecha |
| Frijol entero cocido | Leguminosas | ½ taza | 85–86 | citado |
| Lenteja / garbanzo cocidos | Leguminosas | ½ taza | a verificar | [conocido, sin verificar] |
| Soya texturizada | Leguminosas | — | 30 | citado (secundario) |
| Huevo entero | AOA moderado en grasa | 1 pieza | — | medida citada; subgrupo [conocido, sin verificar] |
| Claras de huevo | AOA muy bajo en grasa | 2 piezas | — | subgrupo citado; cantidad [conocido, sin verificar] |
| Pechuga de pollo cocida | AOA muy bajo en grasa | — | 30 | citado |
| Atún en agua | AOA muy bajo en grasa | — | a verificar | subgrupo citado |
| Pescado blanco (filete) | AOA muy bajo en grasa | — | a verificar | subgrupo citado |
| Bistec de res | AOA bajo en grasa | — | 30 | gramos citados; subgrupo [conocido, sin verificar] |
| Queso panela | AOA bajo en grasa | — | 40 | gramos citados |
| Queso Oaxaca | AOA moderado o alto en grasa | — | 30 | en conflicto |
| Leche descremada / entera | Leche | 1 taza (240 ml) | — | [conocido, sin verificar] |
| Yogur griego natural | Leche (¿?) | ½ taza | — | grupo sin confirmar |
| Aguacate | Grasa sin proteína | ⅓ o ¼ de pieza | — | en conflicto |
| Aceite vegetal | Grasa sin proteína | 1 cucharadita | ~5 | citado |
| Nueces, almendras, cacahuates | Grasa con proteína | a verificar | — | brecha |
| Plátano Tabasco | Fruta | ½ pieza | ~60 | citado |
| Manzana | Fruta | 1 pieza | — | citado |
| Papaya picada | Fruta | 1 taza | — | citado |
| Mango Ataulfo | Fruta | ½ pieza | — | citado |
| Nopal cocido | Verdura | 1 taza | — | citado |
| Calabacita | Verdura | 1 pieza cruda / ½ taza cocida | — | citado |
| Jitomate bola | Verdura | 1 pieza | — | citado |
| Chayote | Verdura | ½ pieza o ½ taza (80 g) | 80 | en conflicto |
| Espinaca cocida | Verdura | ½ taza | — | citado |

### Inferences
- Como las porciones cambian entre fuentes y ediciones, la app debería tomar **gramos netos** como unidad canónica y usar la medida casera solo para mostrar. Lo ideal es completar los gramos con FoodData Central cuando el SMAE no los dé.
- Para usuarios deportistas, presentar 1 equivalente de AOA muy bajo en grasa (30 g de pechuga cocida) como "7 g de proteína" permite armar porciones prácticas: 120 g de pechuga cocida = 4 eq. = 28 g P, unas 160 kcal (inferido de la tabla de subgrupos).

### Gaps
- Faltan gramos verificados para: bolillo, tortilla de harina, papa, lenteja, garbanzo, atún, pescado, leche, yogur griego, nueces, almendras y cacahuates. No pude abrir el PDF del SMAE ni de la UNAM.
- No pude consultar FoodData Central (API bloqueada) para dar macros a nivel de gramo.

## 3. Platillos mexicanos típicos adaptados (alta proteína y menos grasa)

### Takeaway
No encontré fuentes citables con macros de versiones "fit" de platillos mexicanos. Lo que sigue son estimaciones **calculadas con los equivalentes SMAE** de la sección 1, no datos publicados.

### Cited Findings
- La NOM-043 indica que los alimentos del mismo grupo son intercambiables y los de grupos distintos se complementan. Combinar una leguminosa con un cereal da una proteína parecida a la de un trozo de carne. — [Material de la NOM-043 vía UGTO](https://www.redicinaysa.ugto.mx/index.php/REDICINAYSA/article/download/412/394/763); [CDMX, El plato del bien comer](https://cms311.cdmx.gob.mx/wp-content/uploads/2024/11/El-plato-del-BUEN-COMER.pdf)

### Inferences
Estimaciones construidas con equivalentes (kcal/P/G/HC de la tabla maestra; los valores sin verificar se marcan con *):

| Platillo adaptado | Composición en equivalentes | kcal | P g | G g | HC g |
|---|---|---|---|---|---|
| 3 tacos de pollo deshebrado (tortilla de maíz, sin freír) + pico de gallo | 3 cereal s/g + 3 AOA muy bajo (90 g pollo) + 1 verdura | 355 | 29 | 3 | 49 |
| Tinga de pollo en 2 tostadas horneadas + 1 cdita de aceite | 2 cereal s/g + 3 AOA muy bajo + 1 verdura + 1 grasa* | 330 | 27 | 8 | 34 |
| Enfrijoladas (3 tortillas pasadas por agua, no por aceite) con pollo y 40 g de panela | 3 cereal s/g + 1 leguminosa + 2 AOA muy bajo + 1 AOA bajo | 465 | 37 | 6 | 65 |
| Chilaquiles horneados (3 tortillas en totopo al horno) + salsa + 2 huevos* + 40 g de panela | 3 cereal s/g + 1 verdura + 2 AOA moderado* + 1 AOA bajo | 445 | 29 | 13* | 49 |
| Huevo a la mexicana (1 huevo + 3 claras*) + 2 tortillas | 1 AOA moderado* + 1.5 AOA muy bajo + 1 verdura + 2 cereal s/g | 300 | 21.5 | 6.5* | 34 |
| Caldo de pollo (120 g pechuga + verduras + ¼ taza de arroz) | 4 AOA muy bajo + 2 verdura + 1 cereal s/g | 280 | 34 | 4 | 23 |
| Licuado de avena (1 taza de leche descremada + ⅓ taza de avena + ½ plátano) | 1 leche descremada* + 1 cereal s/g + 1 fruta | 225 | 11 | 2* | 42 |

- Patrones de adaptación (inferencia de la tabla de subgrupos): cambiar tortilla frita o dorada por tortilla al comal u horneada ahorra unos 45 kcal y 5 g de grasa por pieza (de cereal con grasa a sin grasa). Pasar de carne alta en grasa a muy baja en grasa ahorra unos 60 kcal y 7 g de grasa por equivalente. Usar panela en vez de Oaxaca o Chihuahua baja la grasa por porción de queso.

### Gaps
- No hay macros publicados por fuentes mexicanas autorizadas (INCMNSZ, INSP) para estas versiones. Lo de arriba es cálculo propio y hay que etiquetarlo como estimación en la app.

## 4. Proteínas económicas en México y niveles de costo

### Takeaway
Profeco (Quién es Quién en los Precios) monitorea huevo, frijol, atún y pollo dentro de la canasta PACIC. Los datos encontrados son parciales, pero confirman que huevo y frijol son las proteínas más baratas.

### Cited Findings
- La canasta PACIC de 24 productos incluye atún en hojuela (2 latas de 140 g), frijol negro (900 g), huevo (paquete de 18 piezas) y pollo (1 kg). Reporte QQP del 2 de febrero de 2026. — [Profeco QQP 02/02/2026](https://qqph.profeco.gob.mx/storage/attachment/primeran/2026/QQPPRIMERAN_020226.pdf)
- Huevo, paquete de 18 piezas: promedio de MXN 47.40, frente a un máximo previo de 55.54. Frijol negro: de más de MXN 32 por paquete en 2025 a un promedio de 24.15. La canasta PACIC se mantiene en MXN 910. Nota de prensa sin fecha precisa. — [Rotativo](https://rotativo.com.mx/canasta-pacic-bajan-huevo-pollo-frijol)
- Profeco publica cada semana sus reportes de precios de productos de primera necesidad. — [QQP Profeco](https://qqp.profeco.gob.mx/)

### Inferences
- Costo aproximado por equivalente (7–8 g de proteína), con los precios citados. Huevo: 47.40/18 ≈ MXN 2.6 por pieza (1 eq.). Frijol: 24.15/900 g, y ½ taza cocida sale de unos 30–35 g crudos [conocido, sin verificar], ≈ MXN 0.9 por eq. de leguminosa (8 g P). Niveles sugeridos: **muy económico** frijol, lenteja y soya texturizada; **económico** huevo; **medio** atún en lata y pollo entero o pierna; **más caro** pechuga, res magra, pescado, yogur griego y proteína en polvo. Pollo, atún y soya no tienen precio citado en esta sesión.

### Gaps
- Sin precios verificados de pollo, pechuga, atún, soya texturizada, res, yogur griego ni queso panela. Habría que extraerlos de los PDF semanales de QQP, que no pude abrir.

## 5. Equivalentes vegetarianos y sin lácteos en la cocina mexicana

### Takeaway
Dentro del SMAE, la vía vegetariana se apoya en las leguminosas (frijol, lenteja, garbanzo, haba, soya texturizada) combinadas con cereal (maíz). Para una dieta sin lácteos, el grupo leche se sustituye con otras fuentes de proteína y calcio, y el SMAE no tiene un subgrupo específico para bebidas vegetales.

### Cited Findings
- Una leguminosa combinada con un cereal aporta una proteína parecida a la de un trozo de carne (orientación de la NOM-043). — [CDMX, El plato del bien comer](https://cms311.cdmx.gob.mx/wp-content/uploads/2024/11/El-plato-del-BUEN-COMER.pdf)
- La soya texturizada está en el grupo de leguminosas, porción de 30 g (fuente secundaria). — [Querétaro Maratón 2024](https://www.queretaromaraton.com.mx/file/QM_EQUIVALENTES_2024.pdf)
- La clara de huevo está en AOA muy bajo en grasa (para ovovegetarianos). — [heynutre guía](https://www.heynutre.com/blog/sistema-mexicano-equivalencias-guia/)

### Inferences
- Para igualar 7 g de proteína (1 eq. AOA): 1 eq. de leguminosa da 8 g P pero con 120 kcal y 20 g de HC, contra 40 kcal del pollo. La app debe advertir que la proteína vegetal "cuesta" más energía y carbohidrato.
- Opciones mexicanas sin lácteos (inferencia culinaria): tinga de soya texturizada, tacos de frijol con nopales, caldo de lentejas, huevo con nopales, licuado de avena con bebida de soya (macros de la etiqueta).

### Gaps
- No encontré la clasificación SMAE de las bebidas vegetales (soya, almendra), del tofu ni del tempeh, ni las porciones de lenteja y garbanzo por edición.

## 6. Fuentes de datos de composición y licencias para usar en la app

### Takeaway
USDA FoodData Central es dominio público (CC0) y la opción más segura para macros por gramo. El SMAE es un libro con derechos de autor (Fomento de Nutrición y Salud / Ogali) sin licencia abierta conocida. Reproducir sus listas de porciones en una app comercial puede requerir permiso. La tabla extendida del INCMNSZ (2019) se distribuye a través de CONABIO.

### Cited Findings
- Los datos de USDA FoodData Central son de dominio público, sin derechos de autor, y se publican bajo CC0 1.0. USDA pide citar FoodData Central como fuente y, si es posible, avisarle del producto que los usa. — [FoodData Central](https://fdc.nal.usda.gov/index.html); [data.gov FoodData Central](https://catalog.data.gov/dataset/fooddata-central)
- La cita sugerida es: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019." — [MenuLogistics/USDASQLite](https://github.com/MenuLogistics/USDASQLite)
- La "Tabla de composición de alimentos extendida 2019" del INCMNSZ reúne la composición de alimentos consumidos en México, sobre todo con análisis del propio Instituto. Tiene diccionario de datos en CONABIO (SIAGRO). — [CONABIO, Diccionario de datos](https://siagro.conabio.gob.mx/nutricion/download/Diccionario_datos.pdf)
- Antecedentes del análisis de composición de alimentos en México: Bourges y Valencia (INN). — [ALAN](https://www.alanrevista.org/download/article/3881)
- SMAE 4.ª ed.: Fomento de Nutrición y Salud A.C. / Ogali, 2014. — [UNAM Anexo 1](https://fisiologia.facmed.unam.mx/wp-content/uploads/2019/02/2-Valoraci%C3%B3n-nutricional-Anexos.pdf)
- El Plato del Bien Comer es material de apoyo de la NOM-043-SSA2-2012. Su texto oficial está en PLATIICA de la Secretaría de Economía. Tiene tres colores: verde para verduras y frutas, amarillo para cereales y rojo para leguminosas y alimentos de origen animal. — [PLATIICA](https://platiica.economia.gob.mx/normalizacion/?p=35253); [UGTO](https://www.redicinaysa.ugto.mx/index.php/REDICINAYSA/article/download/412/394/763); [normasoficiales.mx](https://www.normasoficiales.mx/nom/nom-043-ssa2-2012)

### Inferences
- Arquitectura recomendada: (a) usar la **estructura de subgrupos** del SMAE, porque son promedios genéricos y el concepto es de uso clínico común, citando la edición; (b) tomar los **macros por gramo** de FoodData Central (CC0), ajustados a los alimentos mexicanos (corn tortilla, pinto/black beans cooked, panela ≈ queso fresco, etc.); (c) **calcular** los equivalentes de cada alimento con la regla "gramos que aportan el nutrimento clave del subgrupo" (15 g HC para cereal, 7 g P para AOA, 5 g L para grasa) en vez de copiar las listas del libro. Así se evita depender de la tabla protegida.
- Las copias del SMAE en Scribd, pdfcoffee y Studocu no son oficiales. No deben usarse como fuente de carga masiva.

### Gaps
- No encontré los términos de licencia de la tabla INCMNSZ/CONABIO ni una "Base de Alimentos de México (BAM)" del INSP descargable. La búsqueda solo devolvió la Red BAMX (bancos de alimentos), que no tiene relación.
- No confirmé si Fomento de Nutrición y Salud ofrece licencias de datos para software.
