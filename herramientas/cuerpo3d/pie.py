# Pie de maniquí apoyado en el suelo: talón, tobillos marcados, arco por dentro, empeine y cinco dedos.
# Igual que mano.py: volumen con uniones suaves y superficie con marching cubes. La pierna junto al corte
# sale del modelo (pierna.json de "PARTE=pie node manos.mjs antebrazo ..."): el pie la continúa sin escalón.
# Coordenadas locales en metros, con origen en el centro de la pierna a 15 cm del suelo:
# u = hacia abajo (el suelo está en u = .15), v = hacia fuera, w = hacia la punta del pie.
# Uso: python3 pie.py pierna.json pie.json   (pip install numpy scipy scikit-image fast-simplification)
import sys, json
import numpy as np
from scipy.interpolate import RegularGridInterpolator
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes
import fast_simplification

PASO = .001
SUELO = .15
CORTE, HUECO = -.02, .004   # la piel vieja termina en CORTE; el pie empieza un poco después y se cose
U = np.arange(CORTE + HUECO, SUELO + .004, PASO); Vv = np.arange(-.065, .075, PASO); W = np.arange(-.085, .225, PASO)
G = np.stack(np.meshgrid(U, Vv, W, indexing='ij'), -1)

def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1)
    return b + (a - b) * h - k * h * (1 - h)

def smax(a, b, k): return -smin(-a, -b, k)

def capsula(P, a, b, ra, rb):
    a = np.array(a); ba = np.array(b) - a
    h = np.clip(((P - a) @ ba) / (ba @ ba), 0, 1)
    return np.linalg.norm(P - a - h[..., None] * ba, axis=-1) - (ra + (rb - ra) * h)

def elipsoide(P, c, r):
    r = np.array(r); q = (P - np.array(c)) / r
    return (np.linalg.norm(q, axis=-1) - 1) * r.min()

def caja(P, c, b, r):
    q = np.abs(P - np.array(c)) - np.array(b)
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(-1), 0) - r

PB = json.load(open(sys.argv[1]))
PV = np.array(PB['V']).reshape(-1, 3); PN = np.array(PB['N']).reshape(-1, 3)
ARBOL = cKDTree(PV)

def piel(Q):
    # distancia con signo a la piel de la pierna: media gaussiana de los 10 vértices más cercanos
    out = np.empty(len(Q))
    for a in range(0, len(Q), 300000):
        q = Q[a:a + 300000]; d, k = ARBOL.query(q, 10, distance_upper_bound=.06)
        ok = np.isfinite(d); k = np.where(ok, k, 0); w = np.where(ok, np.exp(-(d / .004) ** 2) + 1e-6, 0)
        sd = np.einsum('nkj,nkj->nk', q[:, None, :] - PV[k], PN[k])
        out[a:a + 300000] = np.where(w.sum(1) > 0, (sd * w).sum(1) / (w.sum(1) + 1e-12), .05)
    return out

def tobillo(P):
    # la pierna y el tobillo del modelo se respetan hasta 10 cm del suelo (sin escalón en la costura);
    # más abajo su forma se estira y se funde con el talón y el empeine
    D = np.full(P.shape[:-1], .05)
    m = (P[..., 0] < .12) & (np.abs(P[..., 1]) < .06) & (np.abs(P[..., 2]) < .07)
    q = P[m].astype(np.float64); u = q[:, 0].copy()
    q[:, 0] = np.minimum(u, .045)
    D[m] = smax(piel(q), u - .11, .02)
    return D

def pie(P):
    d = tobillo(P)
    d = smin(d, elipsoide(P, (.072, -.024, -.002), (.011, .007, .011)), .01)   # tobillo de dentro
    d = smin(d, elipsoide(P, (.082, .025, -.01), (.012, .007, .011)), .01)     # tobillo de fuera
    d = smin(d, elipsoide(P, (.121, 0, -.02), (.03, .029, .032)), .025)        # talón
    d = smin(d, capsula(P, (.095, .002, 0), (.13, .008, .125), .03, .017), .025)  # empeine
    d = smin(d, caja(P, (.141, .006, .07), (.004, .029, .074), .008), .015)    # planta
    d = smin(d, elipsoide(P, (.137, .004, .135), (.013, .043, .024)), .015)    # bola del pie
    dedos = np.minimum.reduce([
        capsula(P, (.14, -.004, .152), (.146, -.004, .19), .0079, .0068),
        capsula(P, (.141, .01, .149), (.146, .011, .182), .0076, .0066),
        capsula(P, (.142, .023, .145), (.147, .025, .172), .0072, .0063),
        capsula(P, (.143, .034, .137), (.147, .037, .158), .0068, .006),
    ])
    d = smin(d, dedos, .006)
    d = smin(d, capsula(P, (.137, -.024, .148), (.142, -.027, .2), .0128, .0112), .008)   # dedo gordo
    d = smax(d, -elipsoide(P, (.157, -.036, .05), (.018, .016, .045)), .01)   # arco por dentro
    return smax(d, P[..., 0] - (SUELO + .0005), .007)                         # planta plana en el suelo

def densificar_borde(V, F, veces=2):
    # la simplificación deja pocos vértices en el borde abierto: se parte cada arista del borde en dos
    # (el punto nuevo queda en el arco, no en la cuerda) para coser con triángulos parejos
    V = [tuple(v) for v in V]; F = [tuple(f) for f in F]
    for _ in range(veces):
        cuenta = {}
        for f in F:
            for e in range(3):
                a, b = f[e], f[(e + 1) % 3]; cuenta[(min(a, b), max(a, b))] = cuenta.get((min(a, b), max(a, b)), 0) + 1
        nuevo = []
        for f in F:
            hecho = False
            for e in range(3):
                a, b, c = f[e], f[(e + 1) % 3], f[(e + 2) % 3]
                if cuenta[(min(a, b), max(a, b))] == 1:
                    pa, pb = np.array(V[a]), np.array(V[b]); m = (pa + pb) / 2
                    r = (np.hypot(*pa[1:]) + np.hypot(*pb[1:])) / 2; rm = np.hypot(*m[1:])
                    if rm > 1e-6: m[1:] *= r / rm
                    V.append(tuple(m)); k = len(V) - 1
                    nuevo += [(a, k, c), (k, b, c)]; hecho = True; break
            if not hecho: nuevo.append(f)
        F = nuevo
    return np.array(V, np.float32), np.array(F, np.int32)

D = pie(G)
V, F, N, _ = marching_cubes(D, 0, spacing=(PASO, PASO, PASO))
V += np.array([U[0], Vv[0], W[0]])
V, F = fast_simplification.simplify(V.astype(np.float32), F.astype(np.int32), target_reduction=1 - 8000 / len(F))
V, F = densificar_borde(V, F)

Nv = np.zeros_like(V)
fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
for k in range(3): np.add.at(Nv, F[:, k], fn)
Nv /= np.linalg.norm(Nv, axis=1, keepdims=True) + 1e-12
sdf = RegularGridInterpolator((U, Vv, W), D, bounds_error=False, fill_value=.05)
ao = np.zeros(len(V))
for i in range(1, 6):
    d = i * .0035
    ao += (d - sdf(V + Nv * d)) / 2 ** i
# el suelo también tapa luz: la planta y el borde de abajo quedan más oscuros
ao += np.clip((V[:, 0] - (SUELO - .012)) / .012, 0, 1) * .25
ao = np.clip(1 - ao * 55, .35, 1)
print('pie: vértices', len(V), 'triángulos', len(F), 'sombra media', round(float(ao.mean()), 3))
json.dump({'V': V.round(6).ravel().tolist(), 'F': F.ravel().tolist(), 'AO': ao.round(3).tolist()}, open(sys.argv[2], 'w'))
