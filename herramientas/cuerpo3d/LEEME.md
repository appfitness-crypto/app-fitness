# Mi cuerpo 3D: cómo se genera `modelos/cuerpo.glb`

Modelo base: **Z-Anatomy** (CC BY-SA 4.0), derivado de **BodyParts3D** (CC BY-SA 2.1 JP).
El modelo modificado (`modelos/cuerpo.glb` y `modelos/cuerpo.json`) se comparte con la misma licencia
(ver `LICENCIA-Z-Anatomy.txt`). La licencia aplica al modelo, no al código de la app.

## Pasos

1. **Volumen de músculos y huesos → piel** (Blender 5.2 sin interfaz, Python 3.13,
   `pip install bpy scipy scikit-image fast-simplification`):
   - `piel.py`: importa `MuscularSystem100.fbx` y `SkeletalSystem100.fbx` de
     `LluisV/Z-Anatomy` (`Resources/Models/FBX/`), los convierte en volumen, pone la cabeza de `cabeza.json`
     y saca la superficie.
   - `piel2.py`: asigna a cada vértice su músculo, los pesos de 2 grupos (`_ga`, `_wa`, `_gb`, `_wb`) y el
     grosor `_t`, crea el short y exporta el GLB "crudo" y `cuerpo.json`.
2. **Pulido en el navegador** (`prueba.html` + `pulir-visor.js`, junto al GLB crudo y a `js/cuerpo3d/vendor/`):
   cabeza de maniquí lisa, cuello centrado, simetría izquierda/derecha y bordes del short rectos.
   `node exportar.cjs crudo.json` guarda el resultado (necesita Playwright y un servidor en `localhost:8091`).
3. **Reconstrucción limpia** (`pip install scipy scikit-image fast-simplification`):
   `python3 reconstruir.py crudo.json recon.json 4 1.4 16 cuerpo.json`
   - Hornea la complexión atlética de partida (inflado suave por grupo, sin escalones).
   - Vuelve a hacer la piel como volumen: cierra las ranuras entre músculos, quita burbujas y pelusa,
     respeta manos y pies, y queda simétrica exacta.
   - Infla el short con la piel y endereza el dobladillo y la pretina.
4. **Sombra y GLB**: `PLIEGUE=0 SUAVE=2 node hornear.cjs recon.json horneado.glb`
   - Quita piezas sueltas y triángulos rotos.
   - Calcula la oclusión ambiental con rayos sobre vóxeles (atributo `_cav`), que da la sombra entre músculos.
5. **Compresión**: `npx @gltf-transform/cli meshopt horneado.glb cuerpo-paso5.glb --level medium` (≈ 1.7 MB).
6. **Alisado final**: `IT=14 ITS=6 node refinar.mjs cuerpo-paso5.glb cuerpo-paso6.glb`
   - Taubin sobre la piel (menos en manos y pies) y el short: quita el granulado del escaneo sin encoger los músculos.
   - Se aplica una sola vez a la salida del paso 5 (no sobre un `cuerpo.glb` ya alisado).
7. **Manos nuevas** (las del modelo tenían dedos cortos en punta):
   ```
   node manos.mjs antebrazo cuerpo-paso6.glb antebrazo.json
   python3 mano.py antebrazo.json mano.json
   node manos.mjs cuerpo-paso6.glb mano.json cuerpo-paso7.glb
   ```
   - `mano.py` hace una mano relajada (dedos juntos y algo flexionados, pulgar al lado) como volumen con uniones
     suaves; la muñeca continúa la forma real del antebrazo.
   - `manos.mjs` corta la piel en la muñeca, coloca la mano (y su espejo) en el eje del antebrazo y cose los dos
     bordes con una tira de triángulos: una sola superficie, sin escalón.
8. **Pies nuevos** (los del modelo eran planos y con dedos en punta), con el mismo método:
   ```
   PARTE=pie node manos.mjs antebrazo cuerpo-paso7.glb pierna.json
   python3 pie.py pierna.json pie.json
   PARTE=pie node manos.mjs cuerpo-paso7.glb pie.json cuerpo.glb
   ```
   - `pie.py`: talón, tobillos, arco por dentro, empeine y cinco dedos, con la planta plana en el suelo. Respeta la
     forma real del tobillo hasta 10 cm del suelo para que la costura (a 17 cm) no se note.
   - Tras coser, `manos.mjs` suaviza la banda de la costura (en manos y pies) para que no quede un anillo marcado.

El visor además promedia las normales con sus vecinas al deformar (`suavizarNormales` en `motor.js`), así la luz
marca el relieve de los músculos y no la textura del modelo.

El visor de la app (`js/cuerpo3d/motor.js`) solo lee el modelo ya horneado: no repite estos pasos en el teléfono.
