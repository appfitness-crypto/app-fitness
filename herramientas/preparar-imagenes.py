#!/usr/bin/env python3
"""Prepara las fotos de ejercicios para la app con UN SOLO MARCO.

Uso:
    python3 herramientas/preparar-imagenes.py CARPETA_ORIGINALES [--salida img/ejercicios]

Por cada imagen (png, jpg, jpeg o webp) de CARPETA_ORIGINALES:
  1. Nombre: se convierte al formato de la app (minúsculas, sin acentos, guiones):
     "Sentadilla Goblet.png" -> sentadilla-goblet.webp
     El nombre debe ser el del ejercicio tal como aparece en el plan.
  2. Marco: lienzo vertical 4:5 (1080 x 1350) con el fondo oscuro de la app (#0A0E13).
     La imagen se escala para caber completa, centrada, y sus bordes se funden con el
     fondo (así desaparecen rayas o cortes en las orillas y todas se ven del mismo tamaño).
  3. Archivos: <nombre>.webp (ficha y sesión) y mini-<nombre>.webp (miniatura cuadrada
     de 320 px tomada de la parte alta del cuerpo), calidad 80.
Requiere Pillow:  pip install pillow
"""
import argparse, os, re, sys, unicodedata
from PIL import Image, ImageDraw, ImageFilter

FONDO = (10, 14, 19)
ANCHO, ALTO = 1080, 1350
MINI = 320
EXT = ('.png', '.jpg', '.jpeg', '.webp')


def slug(nombre):
    n = unicodedata.normalize('NFD', nombre)
    n = ''.join(c for c in n if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', n).strip('-')


def mascara_bordes(w, h, ancho):
    """Opacidad 255 en el centro y 0 en las orillas, con transición suave."""
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    d.rectangle((ancho, ancho, w - ancho, h - ancho), fill=255)
    return m.filter(ImageFilter.GaussianBlur(ancho / 2))


def enmarcar(im):
    im = im.convert('RGB')
    esc = min(ANCHO / im.width, ALTO / im.height)
    w, h = round(im.width * esc), round(im.height * esc)
    im = im.resize((w, h), Image.LANCZOS)
    lienzo = Image.new('RGB', (ANCHO, ALTO), FONDO)
    x, y = (ANCHO - w) // 2, (ALTO - h) // 2
    lienzo.paste(im, (x, y), mascara_bordes(w, h, max(24, round(min(w, h) * 0.06))))
    return lienzo


def miniatura(enmarcada):
    # cuadro centrado en el tercio alto (donde están el torso y el músculo resaltado)
    lado = round(ANCHO * 0.78)
    x = (ANCHO - lado) // 2
    y = round(ALTO * 0.22)
    return enmarcada.crop((x, y, x + lado, y + lado)).resize((MINI, MINI), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('originales')
    ap.add_argument('--salida', default=os.path.join(os.path.dirname(__file__), '..', 'img', 'ejercicios'))
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)
    hechos = 0
    for f in sorted(os.listdir(a.originales)):
        base, ext = os.path.splitext(f)
        if ext.lower() not in EXT or base.startswith('mini-'):
            continue
        n = slug(base)
        marco = enmarcar(Image.open(os.path.join(a.originales, f)))
        marco.save(os.path.join(a.salida, n + '.webp'), 'WEBP', quality=80, method=6)
        miniatura(marco).save(os.path.join(a.salida, 'mini-' + n + '.webp'), 'WEBP', quality=80, method=6)
        kb = os.path.getsize(os.path.join(a.salida, n + '.webp')) // 1024
        print(f'  {f}  ->  {n}.webp ({kb} KB) + mini-{n}.webp')
        hechos += 1
    print(f'{hechos} imagen(es) listas en {os.path.normpath(a.salida)}')
    if not hechos:
        sys.exit('No encontré imágenes .png, .jpg o .webp en ' + a.originales)


if __name__ == '__main__':
    main()
