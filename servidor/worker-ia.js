/* ════════════════════════════════════════════════════════
   PROXY DE IA — Cloudflare Worker (plan gratuito)
   Guarda la API key de Anthropic del lado del servidor para
   que la app pueda generar rutinas con IA.

   1. dash.cloudflare.com → Workers & Pages → Create → "Hello World"
   2. Pega este archivo y despliega.
   3. Settings → Variables → agrega el SECRETO  ANTHROPIC_API_KEY
      (y opcional MODEL; por defecto claude-sonnet-5)
   4. Copia la URL del worker en js/config.js → aiEndpoint: '...'

   Seguridad:
   · Solo responde a los dominios de la app (ORIGENES_PERMITIDOS).
   · Cada petición lleva el token de Firebase del usuario (cuenta con
     correo, no anónima) y aquí se verifica su firma con las llaves
     públicas de Google. Sin token válido no se llama a la IA.
   · Límite de rutinas por usuario (LIMITE_POR_HORA). El conteo vive en
     la memoria del worker: es un freno contra abusos, no una cuota exacta.
   ════════════════════════════════════════════════════════ */
const ORIGENES_PERMITIDOS = [
  'https://appfitness-crypto.github.io',     // GitHub Pages
  'https://app-fitness-7cf1c.web.app',       // Firebase Hosting (la que abre la app de Play Store)
  'https://app-fitness-7cf1c.firebaseapp.com',
];
const FIREBASE_PROYECTO = 'app-fitness-7cf1c';
const LIMITE_POR_HORA = 6;

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwksCache = null, jwksVence = 0;
const usos = new Map();   // uid → [timestamps de la última hora]

function b64url(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return Uint8Array.from(atob(s),c=>c.charCodeAt(0)); }
function json64(s){ return JSON.parse(new TextDecoder().decode(b64url(s))); }

async function llaves(){
  if(jwksCache && Date.now()<jwksVence) return jwksCache;
  const r=await fetch(JWKS_URL);
  if(!r.ok) throw new Error('jwks');
  const edad=/max-age=(\d+)/.exec(r.headers.get('cache-control')||'');
  jwksCache=(await r.json()).keys||[];
  jwksVence=Date.now()+1000*Math.min(+(edad&&edad[1])||3600, 21600);
  return jwksCache;
}

// Verifica un ID token de Firebase Authentication. Devuelve el uid o null.
async function uidDelToken(token, obtenerLlaves=llaves){
  const partes=String(token||'').split('.'); if(partes.length!==3) return null;
  let h,p; try{ h=json64(partes[0]); p=json64(partes[1]); }catch{ return null; }
  if(h.alg!=='RS256' || !h.kid) return null;
  const ahora=Math.floor(Date.now()/1000);
  if(p.aud!==FIREBASE_PROYECTO || p.iss!=='https://securetoken.google.com/'+FIREBASE_PROYECTO) return null;
  if(!(p.exp>ahora) || !(p.iat<=ahora+60) || !p.sub || typeof p.sub!=='string') return null;
  if(!p.firebase || p.firebase.sign_in_provider==='anonymous') return null;   // solo cuentas con correo
  const jwk=(await obtenerLlaves()).find(k=>k.kid===h.kid); if(!jwk) return null;
  const llave=await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
  const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5', llave, b64url(partes[2]), new TextEncoder().encode(partes[0]+'.'+partes[1]));
  return ok ? p.sub : null;
}

function dentroDelLimite(uid){
  const hace1h=Date.now()-3600e3;
  const l=(usos.get(uid)||[]).filter(t=>t>hace1h);
  if(l.length>=LIMITE_POR_HORA){ usos.set(uid,l); return false; }
  l.push(Date.now()); usos.set(uid,l); return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGENES_PERMITIDOS.includes(origin) ? origin : ORIGENES_PERMITIDOS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST' || !ORIGENES_PERMITIDOS.includes(origin)) {
      return new Response('No permitido', { status: 403, headers: cors });
    }

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    let uid = null;
    try { uid = await uidDelToken(token); } catch { uid = null; }
    if (!uid) return new Response('Inicia sesión para usar la IA', { status: 401, headers: cors });
    if (!dentroDelLimite(uid)) return new Response('Demasiadas rutinas en poco tiempo. Intenta en una hora.', { status: 429, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response('JSON inválido', { status: 400, headers: cors }); }
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    if (!prompt || prompt.length > 20000) return new Response('Prompt inválido', { status: 400, headers: cors });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.MODEL || 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};

export { uidDelToken };   // para pruebas
