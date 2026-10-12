# Reconstruye la piel como volumen: cierra las ranuras finas entre músculos y deja una superficie limpia.
import json, base64, sys, numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes
import fast_simplification as fs

ent, sal = sys.argv[1], sys.argv[2]
R = int(sys.argv[3]) if len(sys.argv) > 3 else 2
J = json.load(open(ent))
dec = lambda s, t: np.frombuffer(base64.b64decode(s), dtype=t).copy()
enc = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
o = J[0]
P = dec(o['P'], np.float32).reshape(-1, 3).astype(np.float64); I = dec(o['idx'], np.uint32).reshape(-1, 3)
# complexión atlética horneada: desplazamiento suave (sin escalones entre grupos) a lo largo de la normal
ATLETA = dict(hombro=1.55, pecho=1.4, espalda=1.35, biceps=1.35, triceps=1.35, antebrazo=1.2, cuello=1.25,
    gluteo=1.15, cuadriceps=1.35, isquios=1.25, aductores=1.15, pantorrilla=1.3, pierna=1.15, abdomen=1.1)
canG = [c['g'] for c in json.load(open(sys.argv[6]))['canales']]
fac = np.array([ATLETA.get(g, 1.0) - 1 for g in canG] + [0.0])
GA = dec(o['GA'], np.float32).astype(int); GB = dec(o['GB'], np.float32).astype(int); WA = dec(o['WA'], np.float32); WB = dec(o['WB'], np.float32); T0 = dec(o['T'], np.float32)
kd = (WA * fac[GA] + WB * fac[GB]) * T0
nv = len(P); Nn = np.zeros_like(P); fn = np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]])
for c in range(3): np.add.at(Nn, I[:, c], fn)
Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-12
from scipy.sparse import coo_matrix as _coo
_e = np.concatenate([I[:, [0, 1]], I[:, [1, 2]], I[:, [2, 0]]]); _e = np.concatenate([_e, _e[:, ::-1]])
_A = _coo((np.ones(len(_e)), (_e[:, 0], _e[:, 1])), shape=(nv, nv)).tocsr(); _A.data[:] = 1; _d = np.asarray(_A.sum(1)).ravel()
for _ in range(25): kd = .5 * kd + .5 * (_A @ kd) / _d
P = P + Nn * kd[:, None]
P_orig = dec(o['P'], np.float32).reshape(-1, 3).astype(np.float64)
C = 0.0022
lo = P.min(0) - 0.02; hi = P.max(0) + 0.02
lo[0] = -max(-lo[0], hi[0]); hi[0] = -lo[0]                     # rejilla simétrica en x
G = np.ceil((hi - lo) / C).astype(int) + 1
vox = np.zeros(G, bool)
# superficie: muestras densas sobre cada triángulo
A, B, Cc = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]
lmax = np.maximum.reduce([np.linalg.norm(B - A, axis=1), np.linalg.norm(Cc - A, axis=1), np.linalg.norm(Cc - B, axis=1)])
s = np.maximum(1, np.ceil(lmax / (C * .4))).astype(int)
for k in np.unique(s):
    m = s == k
    u, v = np.meshgrid(np.arange(k + 1), np.arange(k + 1)); msk = (u + v) <= k; u = u[msk] / k; v = v[msk] / k; w = 1 - u - v
    pts = (A[m][:, None] * w[None, :, None] + B[m][:, None] * u[None, :, None] + Cc[m][:, None] * v[None, :, None]).reshape(-1, 3)
    ij = np.floor((pts - lo) / C).astype(int); vox[ij[:, 0], ij[:, 1], ij[:, 2]] = True
solido = ndimage.binary_fill_holes(vox)
print('vóxeles', G, 'sólido', solido.sum())
# cierre morfológico (rellena ranuras < ~2R vóxeles), sin tocar manos ni pies
bola = np.zeros((2 * R + 1,) * 3, bool); zz, yy, xx = np.ogrid[-R:R + 1, -R:R + 1, -R:R + 1]; bola[(xx ** 2 + yy ** 2 + zz ** 2) <= R * R + .5] = True
cerrado = ndimage.binary_closing(np.pad(solido, R + 1), structure=bola)[R + 1:-R - 1, R + 1:-R - 1, R + 1:-R - 1]
xs = lo[0] + np.arange(G[0]) * C; ys = lo[1] + np.arange(G[1]) * C
X, Y = np.meshgrid(xs, ys, indexing='ij')
proteger = ((np.abs(X) > 0.215) & (Y < 0.93)) | (Y < 0.085)
cerrado = np.where(proteger[:, :, None], solido, cerrado | solido)
cerrado = ndimage.binary_fill_holes(ndimage.binary_opening(cerrado, structure=ndimage.generate_binary_structure(3, 1)))   # quita pelusa y burbujas
# quedarse con la pieza más grande
lab, nl = ndimage.label(cerrado); tam = ndimage.sum(cerrado, lab, range(1, nl + 1)); cerrado = lab == (np.argmax(tam) + 1)
campo = ndimage.gaussian_filter(cerrado.astype(np.float32), float(sys.argv[4]) if len(sys.argv) > 4 else 1.3)
campo = (campo + campo[::-1]) / 2                                  # simetría exacta izquierda/derecha
V, F, _, _ = marching_cubes(campo, 0.5)
V = V * C + lo
print('marching cubes', len(V), len(F))
V2, F2 = fs.simplify(V.astype(np.float32), F.astype(np.int32), target_reduction=1 - 80000 / len(V) * 2 / 2)
print('simplificado', len(V2), len(F2))
# Taubin leve
n = len(V2); ed = np.concatenate([F2[:, [0, 1]], F2[:, [1, 2]], F2[:, [2, 0]]]); ed = np.concatenate([ed, ed[:, ::-1]])
from scipy.sparse import coo_matrix
Ad = coo_matrix((np.ones(len(ed)), (ed[:, 0], ed[:, 1])), shape=(n, n)).tocsr(); Ad.data[:] = 1; deg = np.asarray(Ad.sum(1)).ravel()
Q = V2.astype(np.float64)
for it in range(int(sys.argv[5]) if len(sys.argv) > 5 else 12):
    for lam in (.5, -.53):
        Q = Q + lam * (Ad @ Q / deg[:, None] - Q)
# simetría por vecino espejo
for r in range(2):
    t = cKDTree(Q); M = Q * [-1, 1, 1]; d, j = t.query(M); Q = (Q + Q[j] * [-1, 1, 1]) / 2
# orientación: marching cubes con campo "dentro = 1" deja normales hacia adentro → se invierten
F2 = F2[:, ::-1].copy()
# atributos desde el vértice original más cercano
t = cKDTree(P); d, j = t.query(Q)   # P ya inflado: mismo orden de vértices que el original
print('distancia a original: media %.4f máx %.4f' % (d.mean(), d.max()))
o2 = dict(o); o2['P'] = enc(Q.astype(np.float32)); o2['idx'] = enc(F2.astype(np.uint32).ravel())
for k in ['GA', 'WA', 'GB', 'WB', 'T', 'MUS']:
    a = dec(o[k], np.float32); o2[k] = enc(a[j].astype(np.float32))
o2.pop('N', None)
J[0] = o2
# el short se infla igual que la piel que cubre (más 2 mm de holgura) para que la piel no lo atraviese
so = J[1]; SP = dec(so['P'], np.float32).reshape(-1, 3).astype(np.float64); SI = dec(so['idx'], np.uint32).reshape(-1, 3)
SN = np.zeros_like(SP); sf = np.cross(SP[SI[:, 1]] - SP[SI[:, 0]], SP[SI[:, 2]] - SP[SI[:, 0]])
for c in range(3): np.add.at(SN, SI[:, c], sf)
SN /= np.linalg.norm(SN, axis=1, keepdims=True) + 1e-12
_, js = cKDTree(P_orig).query(SP)
SP2 = SP + SN * (kd[js] + 0.002)[:, None]
# y que ningún vértice de la piel nueva quede fuera del short: se empuja el short hasta cubrirla
tq = cKDTree(Q); dd, jq = tq.query(SP2)
fuera = ((Q[jq] - SP2) * SN).sum(1)            # >0: la piel está por fuera del short
SP2 = SP2 + SN * np.clip(fuera + 0.0025, 0, None)[:, None]
# dobladillo y pretina rectos otra vez
_ed = np.sort(np.concatenate([SI[:, [0, 1]], SI[:, [1, 2]], SI[:, [2, 0]]]), axis=1)
_u, _c = np.unique(_ed, axis=0, return_counts=True); _b = np.unique(_u[_c == 1].ravel())
for lado in (1, -1):
    h = _b[(SP2[_b, 1] < .85) & (np.sign(SP2[_b, 0]) == lado)]
    if len(h): SP2[h, 1] = np.median(SP2[h, 1])
cz = _b[SP2[_b, 1] >= .85]
if len(cz): SP2[cz, 1] = np.percentile(SP2[cz, 1], 60)
so['P'] = enc(SP2.astype(np.float32)); so.pop('N', None)
print('short: empujados', int((fuera > -0.0025).sum()))
json.dump(J, open(sal, 'w'))
