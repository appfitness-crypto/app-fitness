# Motor de menús en cuatro pasos

La literatura y los productos comerciales coinciden en tres ideas:

- Las **recetas**, no los alimentos sueltos, dan combinaciones apetecibles.
- Las metas deben ser **rangos**. Eat This Much documenta que usar % exactos, muchas exclusiones, poco presupuesto o poco tiempo impide cuadrar los macros.
- **Regenerar una sola comida** tiene más éxito que regenerar la semana.

Un ejemplo docente de 1,800 kcal con el SMAE cae en ~1,835 kcal: ±2 % es un error normal en planes por equivalentes.

## Algoritmo (regla de diseño)

1. **Filtro de seguridad** → modo completo, educativo o derivar (ver `seguridad.md`).
2. **Metas del día:**
   - gasto, objetivo y etiqueta de carga del día → kcal, P, L y HC;
   - reparto por tiempo de comida con la tabla de comidas;
   - desplazamiento pre/post según la hora de entreno.
3. **Llenar cada comida:**
   - **Filtrar** los platillos por tiempo de comida; etiquetas (vegano, sin lactosa, sin gluten, alérgenos); costo; minutos de cocina y repetición reciente.
   - **Puntuar** por afinidad y variedad.
   - **Escalar** las porciones de los 5–10 mejores con pasos caseros (tortilla entera, ¼ taza, cucharadita, carne en saltos de 10–30 g), minimizando la desviación de macros.
   - **Elegir** al azar entre los que cumplen la tolerancia.
4. **Ajustar el día:**
   - si el total se sale de rango, corregir con **comodines** (tortilla, aceite, claras, fruta) en la comida con más holgura;
   - si aun así falla, regenerar solo esa comida.

## Tolerancias

| Medida | Tolerancia |
|---|---|
| kcal del día | ±5 % |
| Proteína del día | ±10 %, nunca por debajo del mínimo |
| Grasa y carbohidrato del día | ±15 % |
| Cada comida | ±15 % de su reparto |

## Restricciones

- **Duras, nunca se relajan:** alergias, vegetariano o vegano, celiaquía y las reglas del filtro de seguridad.
- **Suaves, se relajan en este orden:** variedad → tiempo de cocina → presupuesto → "no me gusta".
- **Variedad:**
  - el mismo platillo principal no se repite antes de 3–4 días;
  - la misma proteína no más de 2 veces al día;
  - desayunos y colaciones sí pueden repetirse, para facilitar el meal prep.

## Interfaz propuesta

- Una opción por comida con 2–3 alternativas (decisión de diseño; ninguna fuente fija el número).
- Botones "cambiar opción" por comida y "cambiar alimento" por ingrediente, dentro del mismo grupo SMAE.
- Candado para fijar las comidas favoritas.
- Equivalentes junto al platillo ("2 cereales · 3 AOA · 1 grasa").
- Lista de compras semanal y semáforo de cumplimiento.

## Ajuste semanal (regla de diseño, sin ensayos)

Se evalúa la tendencia del peso (promedio móvil de 7 días) en ventanas de 2 semanas. En mujeres, conviene comparar las mismas fases del ciclo.

| Situación (con adherencia ≥80 %) | Ajuste |
|---|---|
| Definición: pérdida <50 % de la meta | −5–10 % kcal (sin tocar proteína) o +~2,000 pasos/día |
| Definición: pérdida >1.25× la meta o fuerza −5–10 % | +5–10 % kcal |
| Volumen: ganancia <50 % de la meta | +5 % kcal |
| Volumen: ganancia >1.5× la meta o cintura +>1 cm en 2 semanas | −5 % kcal |
| Adherencia <80 % | No ajustar calorías; mensaje sobre adherencia |

## Días de ejemplo (calculados con equivalentes parcialmente pendientes)

**Mujer de ~65 kg, definición, entrena a las 19:00. Meta ~1,800 kcal.**
Resultado: 1,755 kcal · P 112 g (1.7 g/kg) · L 53 g · HC 201 g.

- Desayuno: 2 tortillas con 80 g de panela asada, nopales y ⅓ de aguacate; leche descremada y papaya.
- Colación: manzana con 10 almendras.
- Comida: 90 g de bistec en salsa verde, ½ taza de frijol, 2 tortillas y ensalada.
- Pre: ½ plátano, avena y 2 claras.
- Cena post: 2 tacos con 120 g de pechuga y calabacitas.

Ojo: su proteína (1.7 g/kg) queda por debajo de 2.0–2.4 g/kg para definición. Al reutilizarlo, sube la proteína (más pechuga o claras, yogur griego en la colación).

**Hombre de ~85 kg, incremento de masa, entrena a las 18:00. Meta ~2,600 kcal.**
Resultado: 2,580 kcal · P 152 g (1.8 g/kg) · L 66 g · HC 336 g.

- Desayuno: huevos a la mexicana con 3 tortillas y licuado.
- Colación: papaya, cacahuates y tostada horneada.
- Comida: caldo con 120 g de pollo, arroz, 2 tortillas y frijol.
- Pre: licuado de leche, plátano y avena.
- Cena post: 4 tacos con 150 g de atún o pechuga.
