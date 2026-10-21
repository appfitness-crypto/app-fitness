/* ════════════════════════════════════════════════════════
   FITNESS SYSTEM PRO — Service Worker (modo sin conexión)
   → La app (HTML): red primero con límite de 4 s; si no hay
     internet o la señal es muy lenta, abre la copia guardada.
   → Fotos, íconos, Firebase SDK, PDF, 3D y tipografías: se
     guardan al instalar y se sirven desde el dispositivo
     (se actualizan en segundo plano cuando hay internet).
   → Los datos de Firebase NUNCA pasan por aquí (van directo).
   → Al desplegar cambios, sube CACHE_VERSION.
   ════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'fitnesspro-v120';
const PRECACHE_LOCAL = [
  './',
  './index.html',
  './css/estilos.css',
  './js/config.js',
  './js/00-conocimiento.js',
  './js/01-datos-firebase.js',
  './js/02-mensualidad.js',
  './js/03-nutricion-motor.js',
  './js/04-estadisticas.js',
  './js/05-seed-demo.js',
  './js/06-geofence-sesion-login.js',
  './js/07-quiz.js',
  './js/08-rutinas-ia-fallback.js',
  './js/09-pdf-rutina.js',
  './js/10-tema-fondo.js',
  './js/11-composicion-rehab.js',
  './js/12-deportes-club.js',
  './js/13-avatar-3d.js',
  './js/14-motor-rutinas.js',
  './js/15-registro-sesion.js',
  './js/16-socios-admin.js',
  './js/17-panel-staff.js',
  './js/18-editor-ejercicios.js',
  './js/19-ficha-socio-estado.js',
  './js/20-dialogos.js',
  './js/21-progresion.js',
  './js/30-casa-catalogo.js',
  './js/31-casa-motor.js',
  './js/32-filosofia-modelos.js',
  './js/33-teclado-botones.js',
  './js/34-apariencia.js',
  './js/35-indice-socios.js',
  './js/36-cuentas.js',
  './js/37-iconos.js',
  './js/38-entreno.js',
  './js/39-metodologia.js',
  './js/40-autorregulacion.js',
  './js/41-evaluacion-cuidado.js',
  './js/42-rutina-unica.js',
  './js/43-mover-sesion.js',
  './js/44-instalar-app.js',
  './js/45-vista-socio.js',
  './js/46-registro-objetivo.js',
  './js/47-qr-entrenador.js',
  './img/qr/app.png',
  './js/22-resumen-coordinacion.js',
  './js/23-conocimiento-staff.js',
  './js/24-filosofia-entrenador.js',
  './js/25-entrenadores-admin.js',
  './js/26-nutricion-staff.js',
  './js/27-seleccion-entrenador.js',
  './js/28-pwa.js',
  './js/29-privacidad.js',
  './js/99-arranque.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/logo-inicio.webp',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './img/grupos/abdomen.webp',
  './img/grupos/biceps.webp',
  './img/grupos/braquial.webp',
  './img/grupos/cardiovascular.webp',
  './img/grupos/core.webp',
  './img/grupos/cuadriceps.webp',
  './img/grupos/deltoides.webp',
  './img/grupos/dorsal.webp',
  './img/grupos/erectores.webp',
  './img/grupos/espalda.webp',
  './img/grupos/femorales.webp',
  './img/grupos/gemelos.webp',
  './img/grupos/gluteo.webp',
  './img/grupos/manguito.webp',
  './img/grupos/oblicuos.webp',
  './img/grupos/pecho.webp',
  './img/grupos/recto.webp',
  './img/grupos/trapecio.webp',
  './img/grupos/triceps.webp',
  './img/hero/bienvenida.webp',
  './img/hero/inicio.webp',
  './img/sesiones/accesorios.webp',
  './img/sesiones/cardio.webp',
  './img/sesiones/cardiovascular.webp',
  './img/sesiones/descanso.webp',
  './img/sesiones/espalda.webp',
  './img/sesiones/full.webp',
  './img/sesiones/general.webp',
  './img/sesiones/hombro.webp',
  './img/sesiones/movilidad.webp',
  './img/sesiones/pecho.webp',
  './img/sesiones/pierna.webp',
  './img/sesiones/torso.webp',
];
const PRECACHE_CDN = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Figtree:wght@400;500;600;700;800&display=swap',
];
// Solo estos dominios externos se guardan (librerías y tipografías). Firebase Database queda fuera.
const CDN_HOSTS = ['www.gstatic.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];

/* Instalar: guardar todo lo necesario, uno por uno (si uno falla, los demás sí quedan) */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) =>
      Promise.allSettled([
        ...PRECACHE_LOCAL.map((u) => c.add(new Request(u, { cache: 'reload' }))),
        ...PRECACHE_CDN.map((u) => c.add(new Request(u, { mode: 'cors', credentials: 'omit' }))),
      ])
    )
  );
  self.skipWaiting();
});

/* Activar: borrar cachés de versiones anteriores y tomar control */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// De dónde salió el HTML de cada pestaña ('red' o 'cache'): sus js/css salen del mismo lado, para no mezclar versiones
const origenPagina = new Map();
function marcarPagina(e, origen){ if(e.resultingClientId){ origenPagina.set(e.resultingClientId, origen); if(origenPagina.size>20) origenPagina.delete(origenPagina.keys().next().value); } }

function guardable(res){ return res && (res.status === 200) && (res.type === 'basic' || res.type === 'cors'); }
function guardar(req, res){ if(guardable(res)){ const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)); } return res; }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const cdn = CDN_HOSTS.includes(url.hostname);
  if (!propio && !cdn) return;             // Firebase Database, IA, etc.: directo a la red
  if (/\.(mp4|webm)$/i.test(url.pathname)) return;   // videos: piden por partes (206), van directo a la red

  // 1) La app: red primero (máx. 4 s), si no, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(new Promise((resolve) => {
      let listo = false;
      const usarCache = () => caches.match('./').then((r) => r || caches.match('./index.html')).then((r) => r || Response.error());
      const timer = setTimeout(() => {
        usarCache().then((r) => { if (!listo && r.type !== 'error') { listo = true; marcarPagina(e, 'cache'); resolve(r); } });
      }, 4000);
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put('./', copy)); }
        if (!listo) { listo = true; clearTimeout(timer); marcarPagina(e, 'red'); resolve(res); }
      }).catch(() => {
        clearTimeout(timer);
        usarCache().then((r) => { if (!listo) { listo = true; marcarPagina(e, 'cache'); resolve(r); } });
      });
    }));
    return;
  }

  // 2) El código de la app (js/ y css/): sale del mismo lado que el HTML de esa pestaña (red o copia guardada),
  //    así nunca se mezcla un index.html nuevo con módulos viejos. Si no se sabe (el SW se reinició): red primero
  //    (máx. 4 s) y si no hay internet, la copia guardada.
  if (propio && /\.(js|css)$/.test(url.pathname)) {
    const origen = origenPagina.get(e.clientId);
    // Página abierta desde la copia guardada: sus módulos también (misma versión)
    if (origen === 'cache') {
      e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => guardar(req, res))));
      return;
    }
    // Página que llegó de la red: sus módulos también de la red, aunque tarden (la copia solo si no hay internet)
    if (origen === 'red') {
      e.respondWith(fetch(req).then((res) => guardar(req, res)).catch(() => caches.match(req).then((r) => r || Response.error())));
      return;
    }
    e.respondWith(new Promise((resolve) => {
      let listo = false;
      const timer = setTimeout(() => {
        caches.match(req).then((r) => { if (r && !listo) { listo = true; resolve(r); } });
      }, 4000);
      fetch(req).then((res) => {
        guardar(req, res);
        if (!listo) { listo = true; clearTimeout(timer); resolve(res); }
      }).catch(() => {
        clearTimeout(timer);
        caches.match(req).then((r) => { if (!listo) { listo = true; resolve(r || Response.error()); } });
      });
    }));
    return;
  }

  // 3) El modelo 3D de Mi cuerpo (≈ 1.7 MB): se baja la primera vez que se abre y luego sale del dispositivo.
  //    No se vuelve a pedir en cada apertura; se renueva al subir CACHE_VERSION.
  if (propio && url.pathname.includes('/modelos/')) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => guardar(req, res))));
    return;
  }

  // 4) Todo lo demás (fotos, íconos, librerías, tipografías):
  //    desde el dispositivo al instante y se actualiza en segundo plano
  e.respondWith(
    caches.match(req).then((cached) => {
      const red = fetch(req).then((res) => guardar(req, res)).catch(() => cached || Response.error());
      if (cached) { e.waitUntil(red.catch(() => {})); return cached; }
      return red;
    })
  );
});
