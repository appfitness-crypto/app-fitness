# SMAE: equivalentes, porciones y alimentos mexicanos

El SMAE (Pérez Lizaur y col., 4.ª ed., 2014) define un equivalente como una porción con un aporte similar al de los demás alimentos de su grupo, y por eso intercambiable. Es el puente entre las metas de macros y la comida mexicana.

## Tabla de equivalentes por subgrupo

| Subgrupo | kcal | P | L | HC | Estado |
|---|---|---|---|---|---|
| Verduras | 25 | 2 | 0 | 4 | V |
| Frutas | 60 | 0 | 0 | 15 | V (kcal y HC) |
| Cereales sin grasa | 70 | 2 | 0 | 15 | V |
| Cereales con grasa | 115 | 2 | 5 | 15 | V |
| Leguminosas | 120 | 8 | 1 | 20 | V |
| AOA muy bajo en grasa | 40 | 7 | 1 | 0 | V |
| AOA bajo en grasa | 55 | 7 | 3 | 0 | kcal y P V; **L pendiente** |
| AOA moderado en grasa | 75 | 7 | 5 | 0 | kcal y P V; **L pendiente** |
| AOA alto en grasa | 100 | 7 | 8 | 0 | kcal y P V; **L pendiente** |
| Leche descremada | 95 | 9 | 2 | 12 | kcal y P V; **L y HC pendientes** |
| Leche semidescremada | 110 | 9 | 4 | 12 | **Pendiente** |
| Leche entera | 150 | 9 | 8 | 12 | **Pendiente** |
| Leche con azúcar | 200 | 8 | 5 | 30 | **Pendiente** |
| Grasas sin proteína | 45 | 0 | 5 | 0 | L V; resto **pendiente** |
| Grasas con proteína | 70 | 3 | 5 | 3 | **Pendiente** |
| Azúcares sin grasa | 40 | 0 | 0 | 10 | **Pendiente** |
| Azúcares con grasa | 85 | 0 | 5 | 10 | **Pendiente** |

Las kcal oficiales son promedios redondeados que no cuadran con 4/4/9 (el AOA muy bajo daría 37 kcal y no 40). **Usa las kcal de la tabla; no las recalcules.**

## Porciones caseras confirmadas (1 equivalente)

- 1 tortilla de maíz o ½ bolillo = 1 cereal sin grasa.
- ½ taza de frijol cocido (85–86 g) = 1 leguminosa.
- 1 huevo = 1 AOA (moderado en grasa en el SMAE).
- 40 g de queso panela = 1 AOA.
- 30 g de pechuga de pollo cocida = 1 AOA muy bajo en grasa.
- 1 cucharadita de aceite = 1 grasa sin proteína.
- 1 taza de papaya, 1 manzana o ½ plátano Tabasco (~60 g) = 1 fruta.
- 1 taza de nopal cocido = 1 verdura.

**Porciones en conflicto entre fuentes (P):**

- avena cruda (⅓ o ½ taza = 20 g);
- pasta cocida (½ o ⅓ taza);
- aguacate (⅓ o ¼ de pieza);
- chayote;
- queso Oaxaca (¿moderado o alto en grasa?).

**Faltan los gramos de:** bolillo, tortilla de harina, papa, lenteja, atún, leche, yogur griego y oleaginosas. Si los usas, márcalos como estimados.

## Licencia y datos (decisión de producto)

El SMAE tiene derechos de autor y las copias en Scribd o Studocu no son oficiales. **Arquitectura propuesta (D):**

- Usar la *estructura* de subgrupos del SMAE (concepto clínico común, citado con su edición).
- Tomar los macros por gramo de USDA FoodData Central (CC0) o de la tabla del INCMNSZ 2019 (vía CONABIO).
- Calcular los equivalentes con la regla del nutrimento clave: 15 g HC = 1 cereal o fruta; 7 g P = 1 AOA; 5 g L = 1 grasa.
- Los gramos netos son la unidad canónica; la medida casera es solo para mostrar.

En código, no copies listas del libro; guarda la fuente de cada alimento.

## Costo y alternativas

- **Proteínas más baratas** (Profeco, PACIC): huevo (~MXN 2.6 por pieza) y frijol negro (MXN 24.15 los 900 g). El pollo, el atún, la soya y el panela no tienen precio verificado.
- **Vegetariano:** leguminosa + cereal da una proteína parecida a la de la carne (orientación NOM-043). Pero 1 equivalente de leguminosa son 120 kcal y 20 g de HC, contra 40 kcal del pollo. Además, la proteína de chícharo y arroz tiene peor calidad que la de suero o soya.
- **Regla (D):** en veganos, subir la meta de proteína ~10–20 % y descontar un cereal por cada leguminosa usada como proteína.

## Platillos adaptados de referencia (estimaciones propias)

| Platillo | kcal | P (g) |
|---|---|---|
| 3 tacos de pollo deshebrado con pico de gallo | ~355 | 29 |
| Enfrijoladas con tortilla pasada por agua, pollo y panela | ~465 | 37 |
| Caldo de pollo con 120 g de pechuga | ~280 | 34 |
| Chilaquiles horneados con huevo y panela | ~445 | 29 |

**Reglas de adaptación:**

- tortilla frita → tortilla de comal: ahorra ~45 kcal y 5 g de grasa;
- carne alta en grasa → carne muy baja en grasa: ahorra ~60 kcal por equivalente.

**Otros platillos cotidianos que encajan:**

- huevos a la mexicana;
- bistec en salsa verde;
- tinga de pollo en tostada horneada;
- pescado a la veracruzana;
- frijoles de la olla;
- calabacitas a la mexicana;
- arroz rojo;
- licuado de leche con plátano y avena;
- molletes con poco queso;
- yogur con fruta y granola;
- atún a la mexicana;
- sopa de lentejas;
- tamal con atole (día de partido).
