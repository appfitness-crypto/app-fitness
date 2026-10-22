# Filtro de seguridad

Se ejecuta antes de cualquier cálculo. Su salida es un **modo**:

- **completo:** se calculan metas y se sugieren menús.
- **educativo:** solo orientación general (Plato del Bien Comer, hidratación, horarios); sin kcal, déficit ni suplementos.
- **derivar:** se explica con calidez por qué conviene ver a un profesional y se ofrece contenido general.

Puede haber modo completo **con restricciones** (por ejemplo, hipertensión → tope de sodio).

En México es probable encontrar estas condiciones. Según la prensa sobre ENSANUT 2022, hay diabetes en 18.3 % de los adultos, prediabetes en 22.1 % e hipertensión en 47.8 %. Por eso el cuestionario de entrada bloquea antes de calcular.

## Preguntas mínimas del cuestionario

1. Edad.
2. ¿Embarazo o lactancia?
3. ¿Diabetes? ¿Usa insulina, sulfonilureas (glibenclamida, glimepirida) o glinidas?
4. ¿Enfermedad renal?
5. ¿Hipertensión, enfermedad del corazón o colesterol alto?
6. Medicamentos de uso diario.
7. Alergias, celiaquía o intolerancia a la lactosa; dieta vegetariana o vegana.
8. SCOFF (5 preguntas) y si tiene antecedente de trastorno alimentario; en mujeres, ausencia de menstruación; fracturas por estrés.

## Tabla de reglas

| Condición | Evidencia (estado) | Regla para la app (regla de diseño) |
|---|---|---|
| Menor de 18 | AAP: las bebidas energéticas "nunca son apropiadas" y desalienta los ergogénicos (Verificada) | Modo **educativo**. Sin déficit, conteo de kcal ni suplementos; cafeína, pre-entrenos y bebidas energéticas bloqueados. **<12 años: sin función de plan.** |
| Menor + "bajar de peso para competir" (taekwondo, gimnasia) | Reducción rápida de peso en 38 % de jóvenes de taekwondo; más lesiones durante los cortes (Verificada) | Nunca dar protocolo de corte, deshidratación ni sauna. Canalizar al staff y a los padres. |
| Embarazo o lactancia | +0/+340/+452 kcal por trimestre, +330/+400 en lactancia (secundaria, **Pendiente**); cafeína <200 mg/día | Sin déficit ni metas de peso; pautas generales; derivar a gineco-obstetricia; mostrar las señales para detener el ejercicio. |
| 60 años o más | PROT-AGE ≥1.0–1.2 g/kg; con fuerza, beneficio desde 1.2–1.59 g/kg (Verificada) | Proteína 1.2–1.6 g/kg, preguntando antes por enfermedad renal; tomas de ~0.4 g/kg; déficit suave. |
| Diabetes con insulina, sulfonilureas o glinidas | Alto riesgo de hipoglucemia con ejercicio (Verificada); <90 mg/dL antes → 15–30 g de CHO (**Pendiente**) | Sin low-carb, ayuno ni déficit automático; aviso de hipoglucemia; derivar. |
| Enfermedad renal crónica | KDIGO 2024: 0.8 g/kg en G3–G5 (Verificada) | Proteína ≤0.8 g/kg u ocultar la cifra; sin creatina ni proteína en polvo; derivar a nefrología. |
| Hipertensión, enfermedad cardiovascular, dislipidemia | AHA: sodio ≤1,500 ideal, 2,300 límite (Verificada); grasa saturada <5–6 % (**Pendiente**) | Tope de sodio 1,500–2,000 mg; evitar bicarbonato de sodio como suplemento; con enfermedad cardiovascular o insuficiencia cardiaca, derivar. |
| Trastorno alimentario o REDs | SCOFF validado en universitarios mexicanos, corte ≥2 (Verificada) | SCOFF ≥2, antecedente de TCA, IMC <18.5, amenorrea o fracturas por estrés → apagar calorías, déficits y métricas de peso; derivación cálida. |
| Disponibilidad energética <30 kcal/kg MLG | Umbral debatido (COI 2023) | Solo bandera para revisión humana. |
| Medicamentos | Secundaria | Warfarina: vitamina K constante (no cambiar de golpe las verduras verdes). Estatinas: sin toronja. IMAO: sin alimentos ricos en tiramina (quesos añejos, embutidos curados). Levotiroxina: separar ~4 h del calcio y el hierro. |
| Alergias y celiaquía | Práctica clínica | Exclusiones duras que nunca se relajan. Celiaquía: tortilla de maíz sí; bolillo, tortilla de harina, avena no certificada y pasta, no. |
| Intolerancia a la lactosa | Práctica clínica | Lácteos deslactosados o yogur, sin perder calcio. |

## Cómo comunicar una derivación

- Explica en una o dos frases por qué ("con insulina, cambiar los carbohidratos sin ajustar la dosis puede bajar el azúcar").
- No diagnostiques ni nombres trastornos ("parece que tienes anorexia"). Habla de cuidar la salud y de que un profesional puede personalizar.
- Ofrece lo que sí se puede dar: Plato del Bien Comer, hidratación y horarios.
- En menores, dirígete también a padres y entrenador.
- Ajusta las señales de alerta a la persona: por ejemplo, la amenorrea solo aplica a mujeres. No pongas cifras sin fuente en el texto para el socio; si usas una cifra de la investigación, que sea de las verificadas.

## Lenguaje

Evita "cheat meal", "alimentos prohibidos", "quemar lo que comiste", "limpio/sucio" y "ganarte la comida". Permite ocultar los números.
