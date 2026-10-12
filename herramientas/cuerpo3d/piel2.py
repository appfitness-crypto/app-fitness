# Paso 2: a cada punto de la piel le asigna el músculo de abajo (nombre, grupo, lado),
# pesos suaves por grupo para deformar sin cortes, grosor, y crea el short. Exporta GLB + JSON.
# Uso: python piel2.py -- piel.npz MuscularSystem100.fbx SkeletalSystem100.fbx Translations0.txt salida.glb salida.json
import bpy, sys, re, json
import numpy as np
from scipy import sparse
from mathutils import Vector
from mathutils.bvhtree import BVHTree

NPZ, MUSC, HUESO, TRAD, GLB, JSN = sys.argv[-6:]
d = np.load(NPZ); V = d['v'].astype(np.float64); F = d['f'].astype(np.int64)

bpy.ops.wm.read_factory_settings(use_empty=True)
def importar(ruta):
    antes = set(bpy.data.objects); bpy.ops.import_scene.fbx(filepath=ruta)
    return [o for o in bpy.data.objects if o not in antes and o.type == 'MESH']
def ancestros(o):
    r = []; p = o.parent
    while p: r.append(p.name); p = p.parent
    return ' '.join(r)
FUERA = re.compile(r'Cross Section|bursa|sheath|Fascia|fascia|septum|Septum|retinaculum|Iliotibial|Tendon of|tendon', re.I)
musc = [o for o in importar(MUSC) if not FUERA.search(o.name)]
hues = [o for o in importar(HUESO) if not re.search(r'Cross Section', o.name)]

def bvh(obs):
    vs, ps, dueno = [], [], []; off = 0
    for i, o in enumerate(obs):
        me = o.data; n = len(me.vertices)
        co = np.empty(n * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
        M = np.array(o.matrix_world); co = co @ M[:3, :3].T + M[:3, 3]
        vs.append(co)
        me.calc_loop_triangles()
        t = np.empty(len(me.loop_triangles) * 3, np.int64); me.loop_triangles.foreach_get('vertices', t); t = t.reshape(-1, 3)
        ps.append(t + off); dueno.append(np.full(len(t), i)); off += n
    vs = np.concatenate(vs); ps = np.concatenate(ps)
    return BVHTree.FromPolygons(vs.tolist(), ps.tolist()), np.concatenate(dueno), vs, ps
bm, dm_, mv, _ = bvh(musc)
bh, _, _, _ = bvh(hues)
print('bvh listos')

# suavizado Taubin: quita el ruido de la reconstrucción sin encoger ni borrar la definición
def vecinos(F, n):
    fila = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
    col = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = sparse.csr_matrix((np.ones(len(fila)), (fila, col)), shape=(n, n)); A.data[:] = 1
    return sparse.diags(1 / np.maximum(np.asarray(A.sum(1)).ravel(), 1)) @ A
L = vecinos(F, len(V))
for _ in range(8):
    V = V + .5 * (L @ V - V); V = V - .53 * (L @ V - V)

# orientación: volumen positivo hacia afuera
a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
if np.einsum('ij,ij->i', a, np.cross(b, c)).sum() < 0: F = F[:, ::-1].copy()

# ── músculo bajo cada vértice ──
nv = len(V); mid = np.full(nv, -1); sobre_hueso = np.zeros(nv, bool)
for i in range(nv):
    p = Vector(V[i])
    r1 = bm.find_nearest(p); r2 = bh.find_nearest(p)
    mid[i] = dm_[r1[2]]
    if r2[0] is not None and r2[3] + .004 < r1[3]: sobre_hueso[i] = True
print('asignación hecha')

es = {}
for ln in open(TRAD, encoding='utf-8'):
    cc = ln.rstrip('\n').split(';')
    if len(cc) >= 4: es[cc[0].strip().lower()] = cc[3].strip()
def nombre_es(n):
    base = re.sub(r'\.(l|r)$', '', n); base = re.sub(r'\.\d+$', '', base); base = base.strip('()')
    lado = ' (izq.)' if n.endswith('.l') else ' (der.)' if n.endswith('.r') else ''
    t = es.get(base.lower()) or es.get(base.lower().replace(' muscle', '')) or base
    return t[0].upper() + t[1:] + lado
REGLAS = [
    ('pecho', r'pectoralis|Serratus anterior'), ('hombro', r'deltoid|Supraspinatus|Infraspinatus|Teres minor'),
    ('biceps', r'biceps brachii|Brachialis muscle|Coracobrachialis'), ('triceps', r'triceps|Anconeus'),
    ('antebrazo', r'Brachioradialis|carpi|digitorum superficialis|digitorum profundus|Pronator|Supinator|Palmaris|Extensor digitorum muscle|digiti minimi muscle|pollicis longus|Abductor pollicis longus|Extensor indicis'),
    ('espalda', r'Latissimus|trapezius|Rhomboid|Teres major|Erector|Iliocostalis|Longissimus|Spinalis|Serratus posterior'),
    ('abdomen', r'Rectus abdominis|abdominal oblique|Pyramidalis'), ('gluteo', r'gluteus|Tensor fasciae'),
    ('cuadriceps', r'Rectus femoris|Vastus|Sartorius'), ('isquios', r'biceps femoris|Semitendinosus|Semimembranosus'),
    ('aductores', r'Adductor longus|Adductor brevis|Adductor magnus|Gracilis|Pectineus|Adductor minimus'),
    ('pantorrilla', r'gastrocnemius|Soleus|Plantaris|Calcaneal'), ('pierna', r'Tibialis|fibularis|Extensor hallucis longus|Extensor digitorum longus'),
    ('cuello', r'Sternocleidomastoid|Splenius|Scalenus|Platysma|Levator scapulae|hyoid|Semispinalis capitis'),
]
def grupo(n):
    for g, rx in REGLAS:
        if re.search(rx, n, re.I): return g
    return 'resto'
def lado(n): return 'l' if n.endswith('.l') else 'r' if n.endswith('.r') else 'c'
def region(o):
    a = ancestros(o)
    return 'brazo' if 'upper limb' in a else 'pierna' if 'lower limb' in a else 'cabeza' if 'Cranial' in a else 'tronco'

# músculos que de verdad tocan la piel → lista compacta
usados = sorted(set(mid[~sobre_hueso].tolist()))
nuevo = {m: k for k, m in enumerate(usados)}
musculos = [{'id': k, 'en': musc[m].name, 'es': nombre_es(musc[m].name), 'g': grupo(musc[m].name), 'lado': lado(musc[m].name)} for k, m in enumerate(usados)]
mid2 = np.array([-1 if sobre_hueso[i] else nuevo[mid[i]] for i in range(nv)], np.float32)
reg = np.array([region(musc[m]) for m in mid])

# ── canales de grupo (grupo.lado) con pesos suavizados sobre la malla ──
canales = sorted({f"{grupo(musc[m].name)}.{lado(musc[m].name)}" for m in usados if grupo(musc[m].name) != 'resto'})
ci = {c: k for k, c in enumerate(canales)}
W = np.zeros((nv, len(canales)), np.float32)
for i in range(nv):
    if sobre_hueso[i]: continue
    n = musc[mid[i]].name; g = grupo(n)
    if g != 'resto': W[i, ci[f'{g}.{lado(n)}']] = 1
fila = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
col = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
A = sparse.csr_matrix((np.ones(len(fila), np.float32), (fila, col)), shape=(nv, nv)); A.data[:] = 1
grado = np.asarray(A.sum(1)).ravel(); A = sparse.diags(1 / np.maximum(grado, 1)) @ A
for _ in range(10): W = .5 * W + .5 * (A @ W)
orden = np.argsort(-W, axis=1)
ga = orden[:, 0]; gb = orden[:, 1]
wa = W[np.arange(nv), ga]; wb = W[np.arange(nv), gb]
ga = np.where(wa > .01, ga, -1).astype(np.float32); gb = np.where(wb > .01, gb, -1).astype(np.float32)

# ── grosor: extremidades crecen según su distancia al eje; lo plano, una capa fija ──
PLANOS = {'pecho': .035, 'espalda': .022, 'gluteo': .045, 'hombro': .03, 'abdomen': .015, 'cuello': .02}
cent = {}
for c in canales:
    g, l = c.split('.')
    idx = np.where(np.isin(mid, [m for m in usados if f'{grupo(musc[m].name)}.{lado(musc[m].name)}' == c]) & ~sobre_hueso)[0]
    P = V[idx]; ce = P.mean(0); _, _, vt = np.linalg.svd(P - ce, full_matrices=False); e = vt[0] * (1 if vt[0][2] >= 0 else -1)
    cent[c] = (ce, e)
T = np.zeros(nv, np.float32)
for i in range(nv):
    if ga[i] < 0: continue
    c = canales[int(ga[i])]; g = c.split('.')[0]
    if g in PLANOS: T[i] = PLANOS[g]
    else:
        ce, e = cent[c]; dv = V[i] - ce; T[i] = .55 * np.linalg.norm(dv - e * dv.dot(e))

# ── malla de la piel en Blender ──
def malla(nombre, verts, caras):
    me = bpy.data.meshes.new(nombre); me.from_pydata(verts.tolist(), [], caras.tolist()); me.update()
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(nombre, me); bpy.context.scene.collection.objects.link(ob); return ob
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
piel = malla('piel', V, F)
def attr(ob, nombre, arr):
    at = ob.data.attributes.new(nombre, 'FLOAT', 'POINT'); at.data.foreach_set('value', arr.astype(np.float32).tolist())
for k, arr in (('_musculo', mid2), ('_ga', ga), ('_wa', wa), ('_gb', gb), ('_wb', wb), ('_t', T)): attr(piel, k, arr)
mp = bpy.data.materials.new('piel'); piel.data.materials.append(mp)

# ── short: la piel entre medio muslo y cintura (sin brazos), separada un poco hacia afuera ──
zmin, zmax = V[:, 2].min(), V[:, 2].max(); alto = zmax - zmin
z0, z1 = zmin + .375 * alto, zmin + .58 * alto
dentro = (V[:, 2] > z0) & (V[:, 2] < z1) & (reg != 'brazo')
fs = F[dentro[F].all(1)]
usadosv = np.unique(fs); mapa = -np.ones(nv, np.int64); mapa[usadosv] = np.arange(len(usadosv))
# normales de vértice de la piel para separar el short 1.1 cm
nf = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
NV = np.zeros_like(V)
for k in range(3): np.add.at(NV, F[:, k], nf)
NV /= np.maximum(np.linalg.norm(NV, axis=1, keepdims=True), 1e-9)
SV = V[usadosv] + NV[usadosv] * .016
# el short es tela: se alisa para que no marque cada músculo
Ls = vecinos(mapa[fs], len(usadosv))
for _ in range(25): SV = SV + .5 * (Ls @ SV - SV)
short = malla('short', SV, mapa[fs])
# el short lleva sus propios pesos: se deforma igual que la piel que cubre
for k, arr in (('_ga', ga), ('_wa', wa), ('_gb', gb), ('_wb', wb), ('_t', T)): attr(short, k, arr[usadosv])
ms = bpy.data.materials.new('short'); short.data.materials.append(ms)

bpy.ops.export_scene.gltf(filepath=GLB, export_format='GLB', export_attributes=True, export_normals=True,
                          export_texcoords=False, export_materials='EXPORT', export_yup=True, use_selection=False)
a = lambda v: [round(float(v[0]), 4), round(float(v[2]), 4), round(float(-v[1]), 4)]
json.dump({'fuente': 'Z-Anatomy (CC BY-SA 4.0), derivado de BodyParts3D (CC BY-SA 2.1 JP)',
           'musculos': musculos, 'canales': [{'c': c, 'g': c.split('.')[0], 'lado': c.split('.')[1], 'centro': a(cent[c][0]), 'eje': a(cent[c][1])} for c in canales],
           'alto': float(alto)}, open(JSN, 'w', encoding='utf-8'), ensure_ascii=False)
print('listo', nv, 'vértices', len(F), 'caras', len(musculos), 'músculos', len(canales), 'canales', len(fs), 'caras de short')
