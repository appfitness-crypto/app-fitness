# Paso 1 de la "piel de maniquí": une músculos + huesos de Z-Anatomy en un volumen,
# lo cierra (rellena huecos y cavidades), suaviza la cabeza y saca una sola superficie.
# Uso: python piel.py -- MuscularSystem100.fbx SkeletalSystem100.fbx salida.npz
import bpy, sys, re, time
import numpy as np
from scipy import ndimage as nd
from skimage import measure
import fast_simplification

MUSC, HUESO, SAL = sys.argv[-3:]
H = 0.0025                      # tamaño de vóxel: 2.5 mm
D_CUERPO = 1.6                  # cierre del cuerpo (vóxeles): tapa rendijas de ~8 mm
D_CABEZA = 16.0                  # cierre de la cabeza: cara lisa de maniquí
Z_CUELLO = (1.35, 1.41)         # transición cuerpo → cabeza
t0 = time.time()

FUERA = re.compile(r'Cross Section|bursa|sheath|Fascia|fascia|septum|Septum|retinaculum|Iliotibial|Tooth|tooth|teeth|Incisor|Canine|Premolar|Molar|Ossicle|Malleus|Incus|Stapes|Hyoid bone|Cartilage of|cartilage|Larynx|Trachea', re.I)

def importar(ruta):
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=ruta)
    return [o for o in bpy.data.objects if o not in antes and o.type == 'MESH']

bpy.ops.wm.read_factory_settings(use_empty=True)
musc = [o for o in importar(MUSC) if not FUERA.search(o.name)]
hues = [o for o in importar(HUESO) if not FUERA.search(o.name)]
print('mallas', len(musc), len(hues), round(time.time() - t0, 1))

def puntos(o):
    me = o.data; n = len(me.vertices)
    co = np.empty(n * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    M = np.array(o.matrix_world); co = co @ M[:3, :3].T + M[:3, 3]
    me.calc_loop_triangles()
    tri = np.empty(len(me.loop_triangles) * 3, np.int32); me.loop_triangles.foreach_get('vertices', tri); tri = tri.reshape(-1, 3)
    return co, tri

def muestrear(co, tri, paso):
    # puntos sobre cada triángulo, suficientes para que no queden huecos en la rejilla
    a, b, c = co[tri[:, 0]], co[tri[:, 1]], co[tri[:, 2]]
    lado = np.maximum(np.linalg.norm(b - a, axis=1), np.maximum(np.linalg.norm(c - b, axis=1), np.linalg.norm(a - c, axis=1)))
    k = np.clip(np.ceil(lado / paso).astype(int), 1, 40)
    out = [co]
    for kk in np.unique(k):
        sel = k == kk
        if kk == 1: out.append((a[sel] + b[sel] + c[sel]) / 3); continue
        u, v = np.meshgrid(np.arange(kk + 1), np.arange(kk + 1)); m = (u + v) <= kk
        u = u[m] / kk; v = v[m] / kk
        A, B, C = a[sel][:, None], b[sel][:, None], c[sel][:, None]
        out.append((A + (B - A) * u[None, :, None] + (C - A) * v[None, :, None]).reshape(-1, 3))
    return np.concatenate(out)

P = []
for o in musc + hues:
    co, tri = puntos(o); P.append(muestrear(co, tri, H * .7))
P = np.concatenate(P).astype(np.float32)
mn = P.min(0) - 12 * H; mx = P.max(0) + 12 * H
CENTRO_X = float((P[:, 0].min() + P[:, 0].max()) / 2)
dims = np.ceil((mx - mn) / H).astype(int) + 1
print('puntos', len(P), 'rejilla', dims, round(time.time() - t0, 1))
occ = np.zeros(dims, bool)
ix = np.floor((P - mn) / H).astype(int)
occ[ix[:, 0], ix[:, 1], ix[:, 2]] = True
del P, ix

def cerrar(occ, D):
    d = nd.distance_transform_edt(~occ)
    sol = d <= D; del d
    sol = nd.binary_fill_holes(sol)
    d = nd.distance_transform_edt(sol)
    sol = d > D; del d
    # apertura: quita hilos y láminas delgadas (ligamentos sueltos) sin tocar dedos
    sol = nd.binary_opening(sol, structure=nd.generate_binary_structure(3, 1), iterations=2)
    lab, n = nd.label(sol)
    if n > 1:
        tam = nd.sum(sol, lab, range(1, n + 1)); sol = lab == (1 + int(np.argmax(tam)))
    return sol

def sdf(sol):
    return (nd.distance_transform_edt(sol) - nd.distance_transform_edt(~sol)).astype(np.float32)

cuerpo = cerrar(occ, D_CUERPO); print('cuerpo cerrado', round(time.time() - t0, 1))
f = sdf(cuerpo); del cuerpo
f = nd.gaussian_filter(f, 1.15)
# cabeza: solo la parte de arriba de la rejilla, con cierre grande y más suavizado
kz = int((Z_CUELLO[0] - 0.08 - mn[2]) / H)
cab = cerrar(occ[:, :, kz:], D_CABEZA); print('cabeza cerrada', round(time.time() - t0, 1))
fc = nd.gaussian_filter(sdf(cab), 3.5); del cab
z = mn[2] + (np.arange(kz, dims[2])) * H
w = np.clip((z - Z_CUELLO[0]) / (Z_CUELLO[1] - Z_CUELLO[0]), 0, 1); w = w * w * (3 - 2 * w)
f[:, :, kz:] = f[:, :, kz:] * (1 - w) + fc * w
del fc, occ

# ── cabeza de maniquí: formas suaves (cráneo, rostro, mandíbula, nariz, ceja, pómulos, orejas) ──
import json as _json
CAB = _json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__) or '.', 'cabeza.json')))
def elip(X, Y, Z, c, r):
    # cota de distancia a un elipsoide (Quilez); negativa dentro
    qx, qy, qz = X - c[0], Y - c[1], Z - c[2]
    k0 = np.sqrt((qx / r[0])**2 + (qy / r[1])**2 + (qz / r[2])**2)
    k1 = np.sqrt((qx / r[0]**2)**2 + (qy / r[1]**2)**2 + (qz / r[2]**2)**2)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-9)
def suave_union(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h)
def suave_resta(a, b, k):   # a menos b
    h = np.clip(.5 - .5 * (a + b) / k, 0, 1); return a * (1 - h) + (-b) * h + k * h * (1 - h)
kz2 = int((1.40 - mn[2]) / H)
xs = mn[0] + np.arange(dims[0]) * H; ys = mn[1] + np.arange(dims[1]) * H; zs = mn[2] + np.arange(kz2, dims[2]) * H
X, Y, Z = np.meshgrid(xs, ys, zs, indexing='ij')
X = X - CENTRO_X
# cabeza de maniquí (diseñada con cabeza.py): cráneo + uniones suaves
d = elip(X, Y, Z, *CAB['craneo'])
for c, r, k in CAB['union']: d = suave_union(d, elip(X, Y, Z, c, r), k)
for c, r, k in CAB.get('resta', []): d = suave_resta(d, elip(X, Y, Z, c, r), k)
cab = (-d / H).astype(np.float32); del X, Y, Z, d
# el cuello (y lo de abajo) se corta bajo el cráneo y se une suave con la cabeza nueva
ZC = 1.43 + .07 * np.clip((ys + .02) / .09, 0, 1)        # corte bajo la barbilla adelante, más alto en la nuca
corte = ((ZC[None, :, None] - zs[None, None, :]) / H).astype(np.float32)
fz = f[:, :, kz2:]
fz = suave_union(fz, corte, 6.0)           # intersección suave con el semiespacio de abajo (mínimo de campos positivos dentro)
f[:, :, kz2:] = -suave_union(-fz, -cab, .022 / H)
v, caras, _, _ = measure.marching_cubes(f, 0.0, step_size=1)
v = v * H + mn
print('marching cubes', len(v), len(caras), round(time.time() - t0, 1))
v2, c2 = fast_simplification.simplify(v.astype(np.float32), caras.astype(np.int32), target_count=150_000)
print('simplificado', len(v2), len(c2), round(time.time() - t0, 1))
np.savez_compressed(SAL, v=v2, f=c2)
