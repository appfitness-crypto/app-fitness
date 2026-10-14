# Mano relajada de maniquí (dedos juntos y un poco flexionados), como en las fotos de ejercicios.
# Se construye como volumen (distancias con unión suave) y se saca la superficie con marching cubes.
# Coordenadas locales de la mano, en metros: u = hacia la punta de los dedos, v = hacia el pulgar, w = hacia la palma.
# El antebrazo junto a la muñeca sale del modelo (antebrazo.json de manos.mjs): la mano lo continúa sin escalón.
# Uso: python3 mano.py antebrazo.json mano.json   (pip install numpy scipy scikit-image fast-simplification)
import sys, json, math
import numpy as np
from scipy.interpolate import RegularGridInterpolator
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes
import fast_simplification

PASO = .0009
CORTE, HUECO = -.02, .004   # la piel vieja termina en CORTE; la mano empieza un poco después y se cose
U = np.arange(CORTE + HUECO, .215, PASO); Vv = np.arange(-.06, .08, PASO); W = np.arange(-.045, .075, PASO)
G = np.stack(np.meshgrid(U, Vv, W, indexing='ij'), -1)

def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1)
    return b + (a - b) * h - k * h * (1 - h)

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

AB = json.load(open(sys.argv[1]))
AV = np.array(AB['V']).reshape(-1, 3); AN = np.array(AB['N']).reshape(-1, 3)
ARBOL = cKDTree(AV)

def antebrazo(Q):
    # distancia con signo a la piel del antebrazo: media gaussiana de los 10 vértices más cercanos
    out = np.empty(len(Q))
    for a in range(0, len(Q), 300000):
        q = Q[a:a + 300000]; d, k = ARBOL.query(q, 10, distance_upper_bound=.06)
        ok = np.isfinite(d); k = np.where(ok, k, 0); w = np.where(ok, np.exp(-(d / .004) ** 2) + 1e-6, 0)
        sd = np.einsum('nkj,nkj->nk', q[:, None, :] - AV[k], AN[k])
        out[a:a + 300000] = np.where(w.sum(1) > 0, (sd * w).sum(1) / (w.sum(1) + 1e-12), .05)
    return out

def muneca(P):
    # la muñeca continúa el antebrazo: su forma junto al corte se estira hacia la palma y se va afinando
    D = np.full(P.shape[:-1], .05)
    m = (P[..., 0] < .06) & (np.abs(P[..., 1]) < .065) & (np.abs(P[..., 2]) < .065)
    q = P[m].astype(np.float64); u = q[:, 0].copy()
    e = 1 + .3 * np.clip((u + .004) / .05, 0, 1)
    q[:, 0] = np.minimum(u, -.004); q[:, 1:] *= e[:, None]
    D[m] = -smin(-antebrazo(q) / e, -(u - .05), .02)   # final suave dentro de la palma
    return D

def dedo(P, base, largo, r0, r1, abre, flex=(13, 24, 18)):
    tramos = [.46, .30, .24]; p = np.array(base, float)
    d = np.array([1., abre, 0.]); d /= np.linalg.norm(d)
    ang = 0; out = None; r = r0
    for t, f in zip(tramos, flex):
        ang += math.radians(f)
        dd = np.array([d[0] * math.cos(ang), d[1], math.sin(ang)]); dd /= np.linalg.norm(dd)
        q = p + dd * largo * t; rn = r - (r0 - r1) * t
        s = capsula(P, p, q, r, rn); out = s if out is None else smin(out, s, .002)
        p, r = q, rn
    return out

def mano(P):
    palma = caja(P, (.052, -.002, .002), (.036, .029, .003), .0115)
    m = smin(muneca(P), palma, .022)
    m = smin(m, elipsoide(P, (.038, .022, .007), (.032, .017, .014)), .012)      # eminencia del pulgar
    m = smin(m, elipsoide(P, (.06, -.028, .004), (.036, .012, .011)), .012)      # borde del meñique
    dedos = np.minimum.reduce([
        dedo(P, (.094, .026, .001), .074, .0093, .0074, -.05),   # índice
        dedo(P, (.099, .0075, .001), .082, .0096, .0076, 0),     # medio
        dedo(P, (.096, -.0108, .001), .077, .0092, .0073, .04),  # anular
        dedo(P, (.087, -.0285, .001), .06, .0082, .0065, .09),   # meñique
    ])
    m = smin(m, dedos, .007)
    pulgar = smin(smin(capsula(P, (.012, .026, .004), (.05, .045, .017), .0135, .0112),
                       capsula(P, (.05, .045, .017), (.077, .051, .027), .0108, .0097), .004),
                  capsula(P, (.077, .051, .027), (.099, .052, .033), .0094, .0076), .003)
    return smin(m, pulgar, .01)

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

D = mano(G)
V, F, N, _ = marching_cubes(D, 0, spacing=(PASO, PASO, PASO))
V += np.array([U[0], Vv[0], W[0]])
V, F = fast_simplification.simplify(V.astype(np.float32), F.astype(np.int32), target_reduction=1 - 9000 / len(F))
V, F = densificar_borde(V, F)

# normales y oclusión ambiental a partir del volumen (sombra entre dedos y en la palma)
Nv = np.zeros_like(V)
fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
for k in range(3): np.add.at(Nv, F[:, k], fn)
Nv /= np.linalg.norm(Nv, axis=1, keepdims=True) + 1e-12
sdf = RegularGridInterpolator((U, Vv, W), D, bounds_error=False, fill_value=.05)
ao = np.zeros(len(V))
for i in range(1, 6):
    d = i * .0035
    ao += (d - sdf(V + Nv * d)) / 2 ** i
ao = np.clip(1 - ao * 55, .35, 1)
print('mano: vértices', len(V), 'triángulos', len(F), 'sombra media', round(float(ao.mean()), 3))
json.dump({'V': V.round(6).ravel().tolist(), 'F': F.ravel().tolist(), 'AO': ao.round(3).tolist()}, open(sys.argv[2], 'w'))
