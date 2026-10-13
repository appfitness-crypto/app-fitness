# Logo: hexágono de puntos con tres chevrones

La marca es una retícula hexagonal de puntos (cada punto es una sesión, como el mapa de
constancia de Progreso) con tres chevrones que suben (tu evolución), en los colores de la app:

| Elemento | Color |
|---|---|
| Fondo | `#0A0E13` |
| Puntos base | `#2B333C` (en video `#36414D`) |
| Chevrón inferior · medio · superior | `#4F6418` · `#8DB02A` · `#C8F23A` |
| Cima | `#F1F5F7` (blanco) |
| Versión clara | base `#D5DCE2`, chevrones `#C9DE85` · `#9CC22E` · `#6E9A00`, cima `#0A0E13` |

## Archivos listos (`icons/marca/`)
- `marca-oscuro.svg`, `marca-claro.svg`, `marca-oscuro-transparente.svg`: vectoriales para
  impresión a cualquier tamaño o para llevar a un programa 3D (cada punto es un círculo).
- `marca-3d-1080.png`: versión con volumen (esferas con luz), para redes o como referencia.

## Volver a generarlo
```
python3 marca.py            # posiciones de los puntos → marca.json
python3 svg.py oscuro       # marca-oscuro.svg (también: claro; "oscuro sinfondo")
python3 -m http.server 8091 # en esta carpeta, y luego:
node render.cjs intro 300   # 5 s a 60 fps con desenfoque de movimiento → cuadros-intro/
node render.cjs bucle 240   # bucle de 4 s sin costura → cuadros-bucle/
```
Los cuadros se unen con ffmpeg (ver la historia del PR). En la app:
`video/logo-animado.*` (barra de cada pantalla, bucle recortado a 240 px) y
`video/logo-inicio.*` (esquina de bienvenida: se arma una vez y queda fijo; recorte cuadrado 320 px del video de Gemini, póster `icons/logo-inicio.webp`). `render.cjs` usa Playwright.
