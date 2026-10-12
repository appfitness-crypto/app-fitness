# Diseño de la cabeza de maniquí con formas suaves; vista previa por sphere tracing (numpy).
import numpy as np, sys, json
def elip(P, c, r):
    # cota de distancia a un elipsoide (Quilez): mucho mejor que escalar la esfera
    r = np.array(r); q = P - np.array(c)
    k0 = np.sqrt(((q / r)**2).sum(-1)); k1 = np.sqrt(((q / r**2)**2).sum(-1))
    return k0 * (k0 - 1) / np.maximum(k1, 1e-9)
def su(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h)
def sr(a, b, k):
    h = np.clip(.5 - .5 * (a + b) / k, 0, 1); return a * (1 - h) + (-b) * h + k * h * (1 - h)
PARTES = json.load(open(sys.argv[1]))
def campo(P):
    d = elip(P, *PARTES['craneo'])
    for c, r, k in PARTES['union']: d = su(d, elip(P, c, r), k)
    for c, r, k in PARTES.get('resta', []): d = sr(d, elip(P, c, r), k)
    return d
def render(az, N=360):
    # cámara ortográfica alrededor del eje z, mirando al centro de la cabeza
    ce = np.array([0, 0, 1.59]); ancho = .30
    u, v = np.meshgrid(np.linspace(-ancho/2, ancho/2, N), np.linspace(ancho/2, -ancho/2, N))
    dirc = np.array([-np.sin(az), np.cos(az), 0.0])  # az=0: cámara en -y (de frente) mirando hacia +y
    der = np.array([np.cos(az), np.sin(az), 0.0])
    O = ce - dirc * .5 + der * u[..., None] + np.array([0, 0, 1.0]) * v[..., None]
    t = np.zeros((N, N)); hit = np.zeros((N, N), bool)
    for _ in range(90):
        P = O + dirc * t[..., None]; d = campo(P)
        hit |= d < 1e-4; t = np.where(hit, t, t + np.maximum(d, 1e-4) * .9)
    P = O + dirc * t[..., None]; e = 1e-3
    n = np.stack([campo(P + np.array([e, 0, 0])) - campo(P - np.array([e, 0, 0])),
                  campo(P + np.array([0, e, 0])) - campo(P - np.array([0, e, 0])),
                  campo(P + np.array([0, 0, e])) - campo(P - np.array([0, 0, e]))], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9
    L = np.array([.5, -.7, .6]); L /= np.linalg.norm(L)
    c = np.clip((n * L).sum(-1), 0, 1) * .75 + .2
    return np.where(hit, c, .04)
from PIL import Image
img = np.concatenate([render(a) for a in (0, .6, 1.5708)], 1)
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(sys.argv[2])
