---
name: nutricion-deportiva
description: Guía de nutrición deportiva basada en evidencia para Fitness System Pro (gimnasio en México). Úsala SIEMPRE que haya que generar, revisar o programar algo de nutrición en la app. Por ejemplo, menús o comidas sugeridas, días de ejemplo, platillos mexicanos con porciones, metas de calorías o macros, reglas en js/03-nutricion-motor.js o js/26-nutricion-staff.js, el reparto por número de comidas, pre y post entreno, hidratación, suplementos, o textos de la pestaña Nutrición. También cuando un socio o entrenador pregunta qué comer para un objetivo (incremento de masa muscular, definición, recomposición, rendimiento o rehabilitación) o para un deporte (fútbol, tenis, pádel, frontenis, squash, básquetbol, natación, golf, gimnasia, taekwondo o clases fitness). Úsala aunque no digan "nutrición": "qué ceno si entreno a las 8", "arma un plan de 2,000 kcal", "cuánta proteína", "bajar de peso para competir" o "creatina para mi hijo" también cuentan.
---

# Nutrición deportiva para Fitness System Pro

Esta skill convierte la investigación del gimnasio (`docs/NUTRICION-DEPORTIVA.md` y las notas en `docs/nutricion-investigacion/`) en un flujo de trabajo. Sirve para dos tipos de tarea:

- **Contenido:** generar o revisar comidas, días de menú, metas de macros y textos para socios.
- **Código:** escribir o revisar las reglas que la app usa para calcular y sugerir.

En ambos casos el orden es el mismo, porque cada paso depende del anterior. Calcular calorías para alguien que no debería recibir un plan automático es el error más caro.

## El flujo, en orden

1. **Filtro de seguridad** → decide el modo: plan completo, modo educativo o derivación.
2. **Energía** → gasto estimado, siempre como rango.
3. **Macros por objetivo** → proteína, grasa y carbohidrato en g/kg.
4. **Deporte y carga del día** → ajusta el carbohidrato del día.
5. **Reparto y horario** → % por tiempo de comida y cuál hace de pre y de post.
6. **Menú con equivalentes SMAE** → platillos mexicanos en porciones caseras, dentro de las tolerancias.
7. **Lenguaje y marco legal** → "sugerencia educativa", sin lenguaje de culpa.

No te saltes pasos aunque la petición parezca sencilla. "Dame un menú de 1,800 kcal" igual pasa por el paso 1: si no sabes la edad o las condiciones, dilo y deja el menú condicionado a eso.

Para calcular de forma reproducible usa `scripts/metas.py` (ver más abajo). Así las cifras del menú y las del código salen de las mismas reglas.

## 1. Filtro de seguridad (siempre primero)

Lee `references/seguridad.md` antes de calcular nada. En resumen:

| Si la persona… | Modo |
|---|---|
| tiene menos de 12 años | Sin plan. Solo orientación general para padres y derivación |
| tiene 12–17 años | **Educativo:** Plato del Bien Comer, hidratación y horarios. Sin déficit, sin conteo de kcal, sin suplementos ni cafeína. "Bajar para competir" → canalizar al staff |
| está embarazada o en lactancia | Sin déficit ni metas de peso; derivar a gineco-obstetricia |
| tiene diabetes con insulina, sulfonilureas o glinidas | Sin low-carb, ayuno ni déficit automático; aviso de hipoglucemia; derivar |
| tiene enfermedad renal | Proteína ≤0.8 g/kg u ocultar la cifra; sin creatina ni proteína en polvo; derivar |
| tiene SCOFF ≥2, antecedente de TCA, IMC <18.5, amenorrea o fracturas por estrés | Apagar calorías, déficits y métricas de peso; derivación cálida |
| tiene hipertensión | Sodio 1,500–2,000 mg/día; con enfermedad cardiovascular, derivar antes |
| tiene 60 años o más | Proteína 1.2–1.6 g/kg (antes preguntar por riñón); déficit suave |
| toma medicamentos | Filtros de alimentos según el fármaco (warfarina, estatinas, IMAO, levotiroxina) |
| tiene alergias o celiaquía | Exclusiones duras que nunca se relajan |

Si falta información para el filtro, no la inventes: pídela o deja la salida marcada como condicionada ("si no hay diabetes en tratamiento ni embarazo…").

## 2. Energía

- Mifflin-St Jeor por defecto. Usa Cunningham (500 + 22·MLG) si hay % de grasa por bioimpedancia, porque es más precisa en entrenados.
- Muestra el gasto como **rango de ±10 %** y sesga el factor de actividad hacia abajo: la gente sobreestima su actividad.
- Recalibra cada 2–3 semanas con el peso real: TDEE ≈ kcal promedio − (Δpeso kg/sem × 7,700 / 7).
- La disponibilidad energética <30 kcal/kg MLG es solo una **bandera** para revisión humana, nunca un diagnóstico.

## 3. Macros por objetivo

Detalle y reglas por nivel en `references/objetivos.md`. Resumen:

| Objetivo | Energía | Proteína g/kg | Grasa | Carbohidrato | Ritmo |
|---|---|---|---|---|---|
| Incremento de masa muscular | +10–20 % (novato 15–20, intermedio 10–15, avanzado 5–10) | 1.6–2.2 | 0.5–1.5 g/kg | resto, ≥3–5 g/kg | +0.25–0.5 %/sem |
| Definición | déficit = el menor entre 20–25 % del TDEE y 500 kcal | 2.0–2.4 (o 2.3–3.1 por kg de MLG) | ≥ máx(15–20 % kcal, 0.5–0.6 g/kg) | resto | −0.5–1 %/sem; ≤0.5 % si es delgado |
| Recomposición | mantenimiento a −10–15 % | 2.0–2.4 | 20–35 % | resto | peso estable o ≈ −0.25 %/sem |
| Rendimiento | mantenimiento | 1.2–2.0 | 20–35 % | según la carga del día, 3–12 g/kg | si hay que bajar, ≤0.7 %/sem y nunca en competencia |
| Rehabilitación | 25–30 kcal/kg, sin déficit agresivo | 1.6–2.2 (2.5 con bota o férula) en 4–5 tomas | normal | sube en días de fisio con carga | sin meta de pérdida |

Nunca bajes de la TMR estimada. Los pisos de 1,200/1,500 kcal se usan como límite de seguridad, pero están marcados como **pendientes** (no tienen fuente primaria).

## 4. Deporte y carga del día

Los 11 deportes de la app y sus ejemplos de día de partido están en `references/deportes.md`. Para un socio recreativo:

- fútbol, tenis, pádel, frontenis, squash y básquetbol: 4–6 g/kg de carbohidrato;
- natación: 3–5 g/kg recreativa, 5–8 g/kg con doble sesión;
- golf y clases fitness: 3–5 g/kg;
- gimnasia: 3–5 g/kg, sin déficit en menores;
- taekwondo: 4–6 g/kg, sin herramientas de corte de peso.

Para etiquetar el día usa la carga sRPE (minutos × RPE): ligero <300 UA, moderado 300–600, pesado >600 o cualquier partido. Son umbrales de diseño sin validar.

## 5. Reparto y horario

Manda el total diario; el horario solo reacomoda. Detalle en `references/timing-hidratacion-suplementos.md`.

| Comidas | Reparto de kcal |
|---|---|
| 3 | 30 / 40 / 30 |
| 4 | 25 / 35 / 15 (colación PM) / 25 |
| 5 | 20–25 / 10 / 30–35 / 10 / 20–25 |
| 6 | 20 / 10 / 30 / 10 / 20 / 10 (pre-sueño o post) |

- La comida principal en México es entre las 14:00 y las 17:00. Respétalo.
- El horario de entreno mueve 10–15 % de las kcal y del carbohidrato hacia el pre y el post, sin cambiar el total.
- Reglas duras:
  - ≥0.25 g/kg de proteína en cada comida principal;
  - ≥3 tomas de proteína separadas 3–4 h;
  - sin leguminosas ni comida grasosa o muy fibrosa en el pre inmediato.

## 6. Menú con equivalentes SMAE

Antes de armar comidas, lee `references/smae-alimentos.md` (tabla de equivalentes, porciones caseras y su estado de verificación) y `references/motor-menus.md` (el algoritmo y las tolerancias).

- Arma con **platillos mexicanos reales** (tacos, enfrijoladas, caldo, chilaquiles horneados, huevos a la mexicana, licuado), no con listas de alimentos sueltos.
- Usa porciones caseras: tortilla entera, ½ taza, cucharadita, carne en saltos de 10–30 g.
- Tolerancias del día: ±5 % kcal, ±10 % proteína (nunca por debajo del mínimo), ±15 % grasa y carbohidrato, ±15 % por comida.
- Muestra los equivalentes junto a cada platillo ("2 cereales · 3 AOA · 1 grasa") y los macros por comida y del día.
- Las restricciones duras (alergias, vegetariano o vegano, celiaquía) nunca se relajan. Las suaves se relajan en este orden: variedad, tiempo de cocina, presupuesto y "no me gusta".
- Las kcal oficiales del SMAE no cuadran exacto con 4/4/9. Usa la tabla tal cual, no la recalcules.
- **Calcula, no estimes.** Las kcal y la proteína de cada comida salen de sumar sus equivalentes (o gramos × macros por gramo), y el total del día sale de sumar las comidas. Antes de entregar, rehaz la suma: es fácil subestimar el aceite, el aguacate, las oleaginosas y los quesos, y un total que "cuadra" con cifras inventadas engaña al socio.

### Formato sugerido para un día de menú

```
Sugerencia educativa · <objetivo> · <kcal meta> kcal
Metas: P <g> · L <g> · HC <g>  (cómo se calcularon, 1 línea)

Desayuno (≈ <kcal>) — <platillo con porciones caseras>
  Equivalentes: … · Aporte: <kcal> · P <g> · L <g> · HC <g>
Colación … / Comida … / Pre-entreno … / Cena post …

Total del día: <kcal> (<±%>) · P <g> · L <g> · HC <g>
Cambios posibles: <2–3 alternativas del mismo grupo>
Cifras pendientes usadas: <cuáles, si aplica>
Avalado por: <nutriólogo con cédula del gimnasio> (o "pendiente de revisión")
```

## 7. Lenguaje y marco legal

- La NOM-043-SSA2-2012 regula la orientación alimentaria, y el artículo 79 de la LGS exige título registrado para ejercer la nutrición. Por eso los menús de la app son **"sugerencias educativas"**, no prescripciones. Muestra nombre y cédula del nutriólogo que los revisa cuando exista, y pide consentimiento expreso para datos de salud.
- Evita "cheat meal", "alimentos prohibidos", "quemar lo que comiste" y "limpio/sucio". Permite ocultar los números.
- Los suplementos nunca se presentan con lenguaje terapéutico ("cura", "previene", "desintoxica").
- La personalización clínica la hace el nutriólogo o el entrenador por separado. La app sugiere; el staff ajusta.

## Las cifras pendientes no son reglas duras

La investigación no pudo leer textos completos. Cada cifra tiene una de tres etiquetas:

- **Verificada:** puede alimentar reglas, con la cita.
- **Pendiente:** valor provisional y configurable.
- **Regla de diseño:** parámetro por defecto que debe revisar el nutriólogo.

La lista de pendientes está en `references/cifras-pendientes.md`. Cuando uses una:

- En contenido, menciónalo en una línea ("lípidos del AOA moderado: pendiente de verificar").
- En código, ponla como **constante configurable con comentario** (`// PENDIENTE: verificar con SMAE 4.ª ed.`), nunca enterrada en una fórmula.
- No conviertas una regla de diseño en "la evidencia dice". Di "regla propuesta".

## Cuando el trabajo es código de la app

- El motor actual está en `js/03-nutricion-motor.js` (`calcNutricion`, `nutricionFinal`: bmr, factor, kcal, prot, carbs, grasas, agua). La ficha del staff está en `js/26-nutricion-staff.js` (`bloqueNutricionStaff`, `nutGuardarFicha`). La pestaña del socio es `dashTab('nutricion')` en `js/08`.
- Los scripts `js/NN-*.js` se cargan en orden y comparten el ámbito global; sigue ese estilo (JS vanilla, sin módulos).
- Al revisar una regla, compárala contra las tablas de esta skill e indica, para cada cifra, si coincide, si es pendiente o si contradice la evidencia, con la línea del archivo.
- Revisa también el código como código, no solo las cifras. La evidencia no sirve si la regla está mal programada. Busca estos errores típicos:
  - textos o notas que contradicen el cálculo (por ejemplo, "el déficit sale de la actividad" cuando el código recorta la ingesta);
  - `valor || defecto`, que ignora un 0 capturado a propósito por el staff;
  - recortes con `Math.max(0, …)` que dejan macros cuya suma ya no da las kcal;
  - objetivos no reconocidos que caen en un caso por defecto equivocado;
  - umbrales sin fuente.
- Katch-McArdle y Cunningham usan las dos la masa libre de grasa. Que el código use una u otra no es un error; solo anota que el texto exacto de ambas está pendiente de verificar.
- El filtro de seguridad va **antes** del cálculo en el código también: una función que devuelva el modo (`completo` / `educativo` / `derivar`) y que el resto respete.
- Si cambias archivos de la app, sube `CACHE_VERSION` en `sw.js` y anota el cambio en `docs/CAMBIOS.md`.

## Script de metas

`scripts/metas.py` calcula el gasto, las metas por objetivo y el reparto por comida con las reglas de esta skill. Úsalo para no hacer la aritmética a mano:

```bash
python3 .claude/skills/nutricion-deportiva/scripts/metas.py \
  --sexo f --edad 30 --peso 65 --talla 163 --actividad 1.55 \
  --objetivo definicion --comidas 5 --entreno 19:00
```

Opciones: `--objetivo masa|definicion|recomposicion|rendimiento|rehabilitacion`, `--nivel novato|intermedio|avanzado`, `--grasa <%>` (activa Cunningham), `--carga descanso|ligero|moderado|pesado|doble` y `--perfil fuerza|mixto|resistencia` (para rendimiento), y `--json`. El script no hace el filtro de seguridad: ese paso lo haces tú antes.

## Referencias

| Archivo | Cuándo leerlo |
|---|---|
| `references/seguridad.md` | Siempre, antes de calcular |
| `references/objetivos.md` | Al fijar energía y macros |
| `references/deportes.md` | Si la persona practica uno de los 11 deportes o es día de partido |
| `references/timing-hidratacion-suplementos.md` | Pre/post, agua, suplementos |
| `references/smae-alimentos.md` | Al armar platillos y porciones |
| `references/motor-menus.md` | Al generar menús o programar el generador |
| `references/cifras-pendientes.md` | Antes de convertir una cifra en regla del código |
| `docs/NUTRICION-DEPORTIVA.md` | Para la fuente y el contexto de cualquier cifra |
| `docs/nutricion-investigacion/*.md` | Para el detalle de un tema y sus enlaces |
