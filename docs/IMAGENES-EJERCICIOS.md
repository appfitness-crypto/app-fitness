# Imágenes de ejercicios: un solo estilo

La app muestra una imagen por ejercicio en tres lugares:
- La miniatura de la lista en **Rutina**.
- La foto grande de la **sesión en curso**.
- La ficha **"Cómo se hace"**.

Para que todo combine, todas deben seguir **un mismo modelo**: el de la sentadilla goblet.

![Modelo](../img/ejercicios/sentadilla-goblet.webp)

## El modelo

| Elemento | Cómo debe verse |
|---|---|
| Figura | Maniquí 3D gris claro, sin cara ni cabello, complexión atlética, short negro. |
| Fondo | Negro con un halo blanco suave detrás de la figura. Sin piso de colores ni reflejos naranja o morado. |
| Encuadre | Vertical 2:3, cuerpo completo de pies a cabeza, centrado, vista de tres cuartos. |
| Músculo principal | Rojo-naranja con contorno fino azul neón. |
| Ángulo clave | Líneas verde neón en la articulación que importa (rodilla, cadera, codo). |
| Barra anatómica | Arriba, una barra oscura redondeada con 3 vistas pequeñas en gris (torso de frente, piernas, espalda); la vista del grupo trabajado va **resaltada en verde neón**. |
| Equipo | Real, negro mate (mancuernas, barra, máquina, polea). |
| Prohibido | Texto, letras, logos, marcas de agua, rayas o cortes en las orillas. |

## Prompt para generarlas

Usa la imagen de la sentadilla goblet como **imagen de referencia de estilo** y cambia solo lo que está entre llaves. En inglés suele salir mejor:

```
3D render in the exact style of the reference image: a featureless light-gray
mannequin athlete (no face, no hair, athletic build, black shorts) performing
{EJERCICIO EN INGLÉS, p. ej. "a seated cable row"} with {EQUIPO, p. ej. "a
cable machine and V-handle"}. Full body visible, three-quarter view, centered,
vertical 2:3 frame. Pure black background with a soft white glow behind the
figure. Main worked muscle ({MÚSCULO EN INGLÉS}) highlighted in a red-orange
gradient with a thin neon-blue outline; thin neon-green lines marking the
{ARTICULACIÓN} angle. At the top, a dark rounded horizontal bar with three
small grayscale anatomy thumbnails (front torso, legs, back); the
{VISTA: front torso / legs / back} thumbnail is highlighted with a glowing
neon-green frame and green muscles. Matte black equipment. No text, no letters,
no logos, no watermark, clean edges.
```

Revisa cada resultado contra la tabla del modelo antes de subirlo; lo que más falla es que agregue texto o cambie el color del recuadro.

## Cómo subirlas

1. Nombra cada archivo con el nombre del ejercicio tal como aparece en el plan (por ejemplo `Remo en polea baja.png`). Los acentos y mayúsculas no importan.
2. Pásamelas aquí en el chat y yo las preparo y las subo en un PR. También puedes hacerlo tú:
   ```
   pip install pillow
   python3 herramientas/preparar-imagenes.py CARPETA_CON_TUS_IMÁGENES
   ```
   El script las pone en el **mismo marco** y deja todo listo en `img/ejercicios/`:
   - Lienzo vertical 1080 × 1350 sobre el fondo oscuro de la app.
   - Bordes fundidos con el fondo.
   - Formato webp, de 40 a 70 KB cada una.
   - Su miniatura `mini-…`.
3. Si un ejercicio no tiene imagen, la app usa la del grupo muscular (`img/grupos/`) y, si tampoco hay, un ícono. Nada se rompe mientras se completan.

Para la ficha "Cómo se hace", los **pasos** y el **error común** de cada ejercicio están en `EJ_PASOS`, dentro de `js/38-entreno.js`. Si un ejercicio no tiene esos datos, la ficha muestra la nota del entrenador.

## Estado actual

Hay **226 ejercicios** en el catálogo:

| Estado | Ejercicios | Qué significa |
|---|---|---|
| **Listo** | 3 | Ya siguen el modelo. |
| **Ajustar** | 7 | Mismo estilo, pero con un detalle que corregir: color del recuadro, texto o fondo gris. |
| **Rehacer** | 15 | Están en el estilo de estudio, con piso naranja y morado y sin barra anatómica. |
| **Falta** | 201 | No tienen imagen. |

Sugerencia de orden: primero los **Rehacer**, porque ya aparecen en los planes, y luego los ejercicios compuestos de cada zona.

### Rack / barra libre

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla libre | `sentadilla-libre` | Cuádriceps · Glúteo | Ajustar: quitar texto y segunda barra |
| Sentadilla frontal | `sentadilla-frontal` | Cuádriceps · Core | Rehacer (estilo estudio) |
| Peso muerto convencional | `peso-muerto-convencional` | Glúteo · Femorales · Espalda | Rehacer (estilo estudio) |
| Peso muerto rumano | `peso-muerto-rumano` | Femorales · Glúteo | Falta |
| Remo con barra | `remo-con-barra` | Dorsal · Romboides | Falta |
| Press militar con barra | `press-militar-con-barra` | Deltoides anterior | Falta |
| Press landmine | `press-landmine` | Deltoides anterior · Pecho superior | Falta |
| Sentadilla a la caja | `sentadilla-a-la-caja` | Cuádriceps · Glúteo | Falta |
| Peso muerto sumo | `peso-muerto-sumo` | Glúteo · Femorales · Aductores | Falta |
| Buenos días con barra | `buenos-dias-con-barra` | Femorales · Espalda baja | Falta |

### Mancuernas

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla goblet | `sentadilla-goblet` | Cuádriceps · Glúteo | Listo |
| Desplante | `desplante` | Cuádriceps · Glúteo | Rehacer (estilo estudio) |
| Sentadilla búlgara | `sentadilla-bulgara` | Cuádriceps · Glúteo | Rehacer (estilo estudio) |
| Peso muerto rumano con mancuernas | `peso-muerto-rumano-con-mancuernas` | Femorales · Glúteo | Falta |
| Press inclinado con mancuernas | `press-inclinado-con-mancuernas` | Pecho superior | Falta |
| Press plano con mancuernas | `press-plano-con-mancuernas` | Pecho mayor | Falta |
| Aperturas con mancuernas | `aperturas-con-mancuernas` | Pecho | Falta |
| Pullover con mancuerna | `pullover-con-mancuerna` | Dorsal · Pecho | Falta |
| Remo con mancuerna | `remo-con-mancuerna` | Dorsal · Romboides | Falta |
| Press de hombro con mancuernas | `press-de-hombro-con-mancuernas` | Deltoides | Rehacer (estilo estudio) |
| Elevaciones laterales | `elevaciones-laterales` | Deltoides lateral | Rehacer (estilo estudio) |
| Elevación frontal ligera | `elevacion-frontal-ligera` | Deltoides anterior | Falta |
| Pájaros con mancuerna | `pajaros-con-mancuerna` | Deltoides posterior | Falta |
| Encogimientos con mancuerna | `encogimientos-con-mancuerna` | Trapecio | Falta |
| Curl con barra Z | `curl-con-barra-z` | Bíceps | Falta |
| Curl alterno con mancuernas | `curl-alterno-con-mancuernas` | Bíceps | Ajustar: selector naranja con 5 vistas → 3 vistas en verde |
| Curl martillo | `curl-martillo` | Braquial · Braquiorradial | Falta |
| Extensión de tríceps sobre la cabeza | `extension-de-triceps-sobre-la-cabeza` | Tríceps (porción larga) | Falta |
| Farmer walk | `farmer-walk` | Core · Agarre · Trapecio | Falta |
| Caminata con peso unilateral | `caminata-con-peso-unilateral` | Oblicuos · Core | Falta |
| Zancada reversa con mancuernas | `zancada-reversa-con-mancuernas` | Cuádriceps · Glúteo | Falta |
| Sentadilla isométrica con mancuerna | `sentadilla-isometrica-con-mancuerna` | Cuádriceps · Glúteo | Falta |
| Sentadilla sumo con mancuerna | `sentadilla-sumo-con-mancuerna` | Glúteo · Aductores | Falta |
| Desplante lateral | `desplante-lateral` | Glúteo · Cuádriceps · Aductores | Falta |
| Peso muerto a una pierna con mancuerna | `peso-muerto-a-una-pierna-con-mancuerna` | Femorales · Glúteo | Falta |
| Peso muerto piernas rígidas con mancuernas | `peso-muerto-piernas-rigidas-con-mancuernas` | Femorales | Falta |
| Pantorrilla a una pierna con mancuerna | `pantorrilla-a-una-pierna-con-mancuerna` | Gemelos | Falta |
| Press declinado con mancuernas | `press-declinado-con-mancuernas` | Pecho (porción baja) | Falta |
| Press en el suelo con mancuernas | `press-en-el-suelo-con-mancuernas` | Pecho mayor · Tríceps | Falta |
| Aperturas inclinadas con mancuernas | `aperturas-inclinadas-con-mancuernas` | Pecho superior | Falta |
| Remo al mentón agarre ancho | `remo-al-menton-agarre-ancho` | Deltoide lateral · Trapecio | Falta |
| Aguante lateral isométrico con mancuernas | `aguante-lateral-isometrico-con-mancuernas` | Deltoide lateral | Falta |
| Rotación externa acostado con mancuerna | `rotacion-externa-acostado-con-mancuerna` | Manguito rotador | Falta |
| Encogimientos con mancuernas | `encogimientos-con-mancuernas` | Trapecio superior | Falta |
| Curl inclinado con mancuernas | `curl-inclinado-con-mancuernas` | Bíceps (cabeza larga) | Falta |
| Curl concentrado | `curl-concentrado` | Bíceps | Falta |
| Curl isométrico a 90° | `curl-isometrico-a-90` | Bíceps · Braquial | Falta |
| Patada de tríceps con mancuerna | `patada-de-triceps-con-mancuerna` | Tríceps | Falta |
| Press francés con mancuernas | `press-frances-con-mancuernas` | Tríceps | Falta |

### Máquinas

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla hack | `sentadilla-hack` | Cuádriceps | Falta |
| Prensa de piernas | `prensa-de-piernas` | Cuádriceps · Glúteo | Ajustar: quitar texto y segunda barra |
| Prensa con pies bajos | `prensa-con-pies-bajos` | Cuádriceps | Falta |
| Extensión de cuádriceps | `extension-de-cuadriceps` | Cuádriceps | Rehacer (estilo estudio) |
| Abducción de cadera en máquina | `abduccion-de-cadera-en-maquina` | Glúteo medio | Falta |
| Curl femoral acostado | `curl-femoral-acostado` | Femorales | Ajustar: quitar texto "ENTIRE" |
| Curl femoral sentado | `curl-femoral-sentado` | Femorales | Falta |
| Elevación de talones de pie | `elevacion-de-talones-de-pie` | Gemelos | Rehacer (estilo estudio) |
| Pantorrilla en prensa | `pantorrilla-en-prensa` | Gemelos | Falta |
| Press de pecho en máquina | `press-de-pecho-en-maquina` | Pecho mayor | Falta |
| Press inclinado en máquina | `press-inclinado-en-maquina` | Pecho superior | Falta |
| Pec deck (aperturas en máquina) | `pec-deck-aperturas-en-maquina` | Pecho | Falta |
| Dominada asistida en máquina | `dominada-asistida-en-maquina` | Dorsal ancho | Falta |
| Remo en máquina con apoyo de pecho | `remo-en-maquina-con-apoyo-de-pecho` | Dorsal · Romboides | Falta |
| Press de hombro en máquina | `press-de-hombro-en-maquina` | Deltoides | Falta |
| Elevación lateral en máquina | `elevacion-lateral-en-maquina` | Deltoides lateral | Falta |
| Reverse pec deck | `reverse-pec-deck` | Deltoides posterior | Falta |
| Encogimientos en máquina | `encogimientos-en-maquina` | Trapecio | Falta |
| Curl predicador en máquina | `curl-predicador-en-maquina` | Bíceps (porción corta) | Falta |
| Crunch en máquina | `crunch-en-maquina` | Recto abdominal | Falta |
| Sentadilla en Smith | `sentadilla-en-smith` | Cuádriceps · Glúteo | Falta |
| Prensa de piernas unilateral | `prensa-de-piernas-unilateral` | Cuádriceps · Glúteo | Falta |
| Hip thrust en máquina | `hip-thrust-en-maquina` | Glúteo mayor | Falta |
| Patada de glúteo en máquina | `patada-de-gluteo-en-maquina` | Glúteo mayor | Falta |
| Peso muerto rumano en Smith | `peso-muerto-rumano-en-smith` | Femorales · Glúteo | Falta |
| Pantorrilla sentado en máquina | `pantorrilla-sentado-en-maquina` | Sóleo | Falta |
| Pantorrilla en Smith | `pantorrilla-en-smith` | Gemelos | Falta |
| Press banca en Smith | `press-banca-en-smith` | Pecho mayor · Tríceps | Falta |
| Remo en máquina con pecho apoyado | `remo-en-maquina-con-pecho-apoyado` | Espalda media | Falta |
| Remo unilateral en máquina | `remo-unilateral-en-maquina` | Dorsal · Espalda media | Falta |
| Remo invertido en Smith | `remo-invertido-en-smith` | Espalda media · Bíceps | Falta |
| Pec deck inverso | `pec-deck-inverso` | Deltoide posterior | Falta |
| Encogimientos en Smith | `encogimientos-en-smith` | Trapecio superior | Falta |
| Fondos asistidos en máquina | `fondos-asistidos-en-maquina` | Tríceps · Pecho | Falta |
| Extensión de tríceps en máquina | `extension-de-triceps-en-maquina` | Tríceps | Falta |
| Aguante en hiperextensión | `aguante-en-hiperextension` | Espalda baja · Glúteo | Falta |

### Funcional (kettlebell, cajón, trineo)

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Step-up al cajón | `step-up-al-cajon` | Glúteo · Cuádriceps | Falta |
| Fondos en paralelas | `fondos-en-paralelas` | Pecho inferior · Tríceps | Falta |
| Dominadas | `dominadas` | Dorsal ancho · Bíceps | Rehacer (estilo estudio) |
| Remo invertido en TRX | `remo-invertido-en-trx` | Espalda media · Core | Falta |
| Elevación de piernas colgado | `elevacion-de-piernas-colgado` | Abdomen inferior | Falta |
| Swing con kettlebell | `swing-con-kettlebell` | Glúteo · Cadena posterior | Falta |
| Dominada agarre neutro | `dominada-agarre-neutro` | Dorsal · Bíceps | Falta |
| Dominada excéntrica (negativa) | `dominada-excentrica-negativa` | Dorsal · Bíceps | Falta |
| Aguante isométrico en barra (arriba) | `aguante-isometrico-en-barra-arriba` | Dorsal · Bíceps | Falta |
| Aguante en L (L-sit) | `aguante-en-l-l-sit` | Abdomen · Tríceps | Falta |
| Cuerdas de batalla | `cuerdas-de-batalla` | Sistema cardiovascular · Hombro | Falta |
| Empuje de trineo | `empuje-de-trineo` | Sistema cardiovascular · Piernas | Falta |

### Peso corporal

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla sissy asistida | `sentadilla-sissy-asistida` | Cuádriceps | Falta |
| Isométrico de cuádriceps | `isometrico-de-cuadriceps` | Cuádriceps | Falta |
| Sentadilla isométrica en pared | `sentadilla-isometrica-en-pared` | Cuádriceps | Falta |
| Puente de glúteo | `puente-de-gluteo` | Glúteo | Rehacer (estilo estudio) |
| Caminata lateral con banda | `caminata-lateral-con-banda` | Glúteo medio | Falta |
| Curl femoral en fitball | `curl-femoral-en-fitball` | Femorales | Falta |
| Curl nórdico asistido | `curl-nordico-asistido` | Femorales | Falta |
| Pantorrilla unilateral en escalón | `pantorrilla-unilateral-en-escalon` | Gemelos | Falta |
| Lagartijas | `lagartijas` | Pecho · Tríceps · Core | Falta |
| Rotación externa con banda | `rotacion-externa-con-banda` | Manguito rotador | Falta |
| Fondos en banco | `fondos-en-banco` | Tríceps | Falta |
| Plancha frontal | `plancha-frontal` | Core | Rehacer (estilo estudio) |
| Plancha lateral | `plancha-lateral` | Oblicuos | Rehacer (estilo estudio) |
| Dead bug | `dead-bug` | Core profundo | Falta |
| Bird-dog | `bird-dog` | Core · Erectores | Falta |
| Rueda abdominal | `rueda-abdominal` | Core anterior | Rehacer (estilo estudio) |
| Sentadilla con salto | `sentadilla-con-salto` | Cuádriceps · Glúteo | Falta |
| Aguante de zancada (split squat isométrico) | `aguante-de-zancada-split-squat-isometrico` | Cuádriceps · Glúteo | Falta |
| Puente de glúteo isométrico | `puente-de-gluteo-isometrico` | Glúteo | Falta |
| Puente isométrico con talones elevados | `puente-isometrico-con-talones-elevados` | Femorales · Glúteo | Falta |
| Aguante de pantorrilla en punta | `aguante-de-pantorrilla-en-punta` | Gemelos · Sóleo | Falta |
| Lagartijas inclinadas (manos elevadas) | `lagartijas-inclinadas-manos-elevadas` | Pecho · Tríceps | Falta |
| Lagartijas diamante | `lagartijas-diamante` | Tríceps · Pecho | Falta |
| Lagartijas declinadas (pies elevados) | `lagartijas-declinadas-pies-elevados` | Pecho superior · Hombro | Falta |
| Presión isométrica de palmas | `presion-isometrica-de-palmas` | Pecho mayor | Falta |
| Aguante isométrico en lagartija (abajo) | `aguante-isometrico-en-lagartija-abajo` | Pecho · Tríceps · Core | Falta |
| Superman | `superman` | Espalda baja · Glúteo | Falta |
| Superman isométrico | `superman-isometrico` | Espalda baja · Glúteo | Falta |
| Rotación externa isométrica en pared | `rotacion-externa-isometrica-en-pared` | Manguito rotador | Falta |
| Plancha alta (brazos extendidos) | `plancha-alta-brazos-extendidos` | Core · Hombro | Falta |
| Plancha lateral con pierna elevada | `plancha-lateral-con-pierna-elevada` | Oblicuos · Glúteo medio | Falta |
| Hollow hold | `hollow-hold` | Abdomen · Core | Falta |
| Plancha con toque de hombro | `plancha-con-toque-de-hombro` | Core · Hombro | Falta |
| Crunch abdominal | `crunch-abdominal` | Recto abdominal | Falta |
| Elevación de rodillas en banco | `elevacion-de-rodillas-en-banco` | Abdomen bajo | Falta |
| Escaladores | `escaladores` | Core · Hombro | Rehacer (estilo estudio) |
| Crunch bicicleta | `crunch-bicicleta` | Oblicuos · Abdomen | Falta |
| Tijeras (flutter kicks) | `tijeras-flutter-kicks` | Abdomen bajo | Falta |
| Salto de cuerda | `salto-de-cuerda` | Sistema cardiovascular | Falta |
| Burpees | `burpees` | Sistema cardiovascular · Cuerpo completo | Falta |
| Jumping jacks | `jumping-jacks` | Sistema cardiovascular | Falta |

### Bancos + barra

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Hip thrust | `hip-thrust` | Glúteo mayor | Falta |
| Hiperextensión 45° | `hiperextension-45` | Erectores · Glúteo | Falta |
| Press banca plano | `press-banca-plano` | Pecho mayor · Tríceps | Rehacer (estilo estudio) |
| Press inclinado con barra | `press-inclinado-con-barra` | Pecho superior | Falta |
| Press francés con barra Z | `press-frances-con-barra-z` | Tríceps (porción larga) | Falta |
| Press banca agarre cerrado | `press-banca-agarre-cerrado` | Tríceps · Pecho | Falta |
| Hip thrust a una pierna | `hip-thrust-a-una-pierna` | Glúteo mayor | Falta |
| Remo con mancuernas pecho apoyado | `remo-con-mancuernas-pecho-apoyado` | Espalda media · Dorsal | Falta |
| Curl Scott con barra Z | `curl-scott-con-barra-z` | Bíceps | Falta |

### Poleas / cables

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Patada de glúteo en polea | `patada-de-gluteo-en-polea` | Glúteo mayor | Falta |
| Cruce de poleas | `cruce-de-poleas` | Pecho (porción media) | Ajustar: fondo gris → negro; selector cian → verde |
| Cruce de poleas de abajo hacia arriba | `cruce-de-poleas-de-abajo-hacia-arriba` | Pecho superior | Falta |
| Cruce de poleas de arriba hacia abajo | `cruce-de-poleas-de-arriba-hacia-abajo` | Pecho inferior | Ajustar: fondo gris → negro; selector morado → verde |
| Jalón al pecho | `jalon-al-pecho` | Dorsal ancho | Listo |
| Jalón unilateral en polea | `jalon-unilateral-en-polea` | Dorsal ancho | Falta |
| Pullover en polea alta | `pullover-en-polea-alta` | Dorsal ancho | Ajustar: selector naranja → verde |
| Remo en polea baja | `remo-en-polea-baja` | Dorsal · Romboides | Listo |
| Face pull | `face-pull` | Deltoides posterior · Manguito | Falta |
| Elevación lateral en polea | `elevacion-lateral-en-polea` | Deltoides lateral | Falta |
| Elevación frontal en polea | `elevacion-frontal-en-polea` | Deltoides anterior | Falta |
| Rotación externa en polea | `rotacion-externa-en-polea` | Manguito rotador | Falta |
| Curl en polea baja | `curl-en-polea-baja` | Bíceps | Falta |
| Curl martillo en polea con cuerda | `curl-martillo-en-polea-con-cuerda` | Braquial | Falta |
| Extensión de tríceps en polea | `extension-de-triceps-en-polea` | Tríceps | Falta |
| Press Pallof | `press-pallof` | Core antirrotación | Falta |
| Crunch en polea | `crunch-en-polea` | Recto abdominal | Falta |
| Abducción de cadera en polea | `abduccion-de-cadera-en-polea` | Glúteo medio | Falta |
| Pull-through en polea | `pull-through-en-polea` | Glúteo · Femorales | Falta |
| Curl femoral en polea con tobillera | `curl-femoral-en-polea-con-tobillera` | Femorales | Falta |
| Jalón agarre neutro | `jalon-agarre-neutro` | Dorsal · Bíceps | Falta |
| Extensión de tríceps con cuerda | `extension-de-triceps-con-cuerda` | Tríceps | Falta |
| Pallof isométrico (sostén al frente) | `pallof-isometrico-sosten-al-frente` | Core · Oblicuos | Falta |
| Leñador en polea | `lenador-en-polea` | Oblicuos · Core | Falta |

### Cardio

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Caminata inclinada | `caminata-inclinada` | Cardiovascular | Falta |
| Elíptica | `eliptica` | Cardiovascular | Falta |
| Bicicleta estática | `bicicleta-estatica` | Cardiovascular | Falta |
| Remo ergómetro | `remo-ergometro` | Cardiovascular · Espalda | Falta |
| Trote en caminadora | `trote-en-caminadora` | Sistema cardiovascular | Falta |
| Bicicleta de aire | `bicicleta-de-aire` | Sistema cardiovascular | Falta |
| Escaladora (stair climber) | `escaladora-stair-climber` | Sistema cardiovascular · Glúteo | Falta |
| Esquiadora (ski erg) | `esquiadora-ski-erg` | Sistema cardiovascular · Dorsal | Falta |

### Discos / landmine

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla con disco al pecho | `sentadilla-con-disco-al-pecho` | Cuádriceps · Glúteo | Falta |
| Sentadilla landmine | `sentadilla-landmine` | Cuádriceps · Core | Falta |
| Hip thrust con disco | `hip-thrust-con-disco` | Glúteo mayor | Falta |
| Curl femoral deslizando con discos | `curl-femoral-deslizando-con-discos` | Femorales · Glúteo | Falta |
| Press de pecho con disco (squeeze press) | `press-de-pecho-con-disco-squeeze-press` | Pecho mayor | Falta |
| Remo T con barra (landmine) | `remo-t-con-barra-landmine` | Espalda media · Dorsal | Falta |
| Press landmine a una mano | `press-landmine-a-una-mano` | Deltoide anterior · Pecho superior | Falta |
| Elevación frontal con disco | `elevacion-frontal-con-disco` | Deltoide anterior | Falta |
| Aguante frontal con disco | `aguante-frontal-con-disco` | Deltoide anterior · Core | Falta |
| Encogimientos con disco | `encogimientos-con-disco` | Trapecio superior | Falta |
| Curl con disco | `curl-con-disco` | Braquial · Bíceps | Falta |
| Extensión de tríceps con disco sobre la cabeza | `extension-de-triceps-con-disco-sobre-la-cabeza` | Tríceps | Falta |
| Plancha con disco en la espalda | `plancha-con-disco-en-la-espalda` | Core | Falta |
| Giro ruso con disco | `giro-ruso-con-disco` | Oblicuos | Falta |
| Caminata con disco sobre la cabeza | `caminata-con-disco-sobre-la-cabeza` | Core · Hombro | Falta |

### TRX

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla asistida en TRX | `sentadilla-asistida-en-trx` | Cuádriceps · Glúteo | Falta |
| Sentadilla a una pierna asistida en TRX | `sentadilla-a-una-pierna-asistida-en-trx` | Cuádriceps · Glúteo | Falta |
| Zancada con pie en TRX | `zancada-con-pie-en-trx` | Glúteo · Cuádriceps | Falta |
| Curl femoral en TRX | `curl-femoral-en-trx` | Femorales · Glúteo | Falta |
| Lagartijas en TRX | `lagartijas-en-trx` | Pecho · Core · Hombro | Falta |
| Aperturas en TRX | `aperturas-en-trx` | Pecho mayor | Falta |
| Aperturas posteriores en TRX (T) | `aperturas-posteriores-en-trx-t` | Deltoide posterior · Espalda media | Falta |
| Curl en TRX | `curl-en-trx` | Bíceps | Falta |
| Extensión de tríceps en TRX | `extension-de-triceps-en-trx` | Tríceps | Falta |
| Plancha en TRX | `plancha-en-trx` | Core · Hombro | Falta |
| Plancha lateral en TRX | `plancha-lateral-en-trx` | Oblicuos · Core | Falta |
| Rodillas al pecho en TRX | `rodillas-al-pecho-en-trx` | Abdomen · Core | Falta |
| Fallout en TRX | `fallout-en-trx` | Abdomen · Core | Falta |

### Ligas

| Ejercicio | Archivo | Músculos | Estado |
|---|---|---|---|
| Sentadilla con banda en rodillas | `sentadilla-con-banda-en-rodillas` | Cuádriceps · Glúteo | Falta |
| Extensión de rodilla con banda | `extension-de-rodilla-con-banda` | Cuádriceps | Falta |
| Puente de glúteo con banda | `puente-de-gluteo-con-banda` | Glúteo | Falta |
| Patada de glúteo con banda | `patada-de-gluteo-con-banda` | Glúteo mayor | Falta |
| Almeja con banda | `almeja-con-banda` | Glúteo medio | Falta |
| Curl femoral con banda | `curl-femoral-con-banda` | Femorales | Falta |
| Flexión plantar con banda | `flexion-plantar-con-banda` | Gemelos · Sóleo | Falta |
| Lagartijas con banda | `lagartijas-con-banda` | Pecho · Tríceps | Falta |
| Press de pecho con banda | `press-de-pecho-con-banda` | Pecho mayor | Falta |
| Aperturas con banda | `aperturas-con-banda` | Pecho mayor | Falta |
| Jalón con banda | `jalon-con-banda` | Dorsal | Falta |
| Remo sentado con banda | `remo-sentado-con-banda` | Espalda media | Falta |
| Face pull con banda | `face-pull-con-banda` | Deltoide posterior · Manguito | Falta |
| Elevación lateral con banda | `elevacion-lateral-con-banda` | Deltoide lateral | Falta |
| Rotación interna con banda | `rotacion-interna-con-banda` | Manguito rotador | Falta |
| Curl con banda | `curl-con-banda` | Bíceps | Falta |
| Extensión de tríceps con banda | `extension-de-triceps-con-banda` | Tríceps | Falta |
| Press Pallof con banda | `press-pallof-con-banda` | Core · Oblicuos | Falta |
| Leñador con banda | `lenador-con-banda` | Oblicuos · Core | Falta |
