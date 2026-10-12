/* ═══ cuerpo 3d: maniquí gris con la definición muscular, que cambia con las medidas ═══
   Superficie generada a partir de Z-Anatomy (CC BY-SA 4.0), derivado de BodyParts3D (CC BY-SA 2.1 JP).
   Necesita THREE r128 + GLTFLoader + OrbitControls + MeshoptDecoder. ═══ */
(function(){
  // Medida de referencia (cm): con estas medidas el modelo queda tal cual.
  const C3D_BASE = {pecho:95, brazo:32, antebrazo:27, cadera:95, muslo:55, pantorrilla:37, hombros:112, cuello:37};
  // Qué medida mueve cada grupo y con cuánta fuerza (1 = todo el cambio).
  const C3D_MAPA = {
    biceps:[['brazo',1]], triceps:[['brazo',1]], hombro:[['hombros',1],['brazo',.35]],
    antebrazo:[['antebrazo',1],['brazo',.3]], pecho:[['pecho',1]], espalda:[['pecho',.55],['hombros',.35]],
    gluteo:[['cadera',1]], cuadriceps:[['muslo',1]], isquios:[['muslo',1]], aductores:[['muslo',.9]],
    pantorrilla:[['pantorrilla',1]], pierna:[['pantorrilla',.45]], cuello:[['cuello',1]],
  };
  const NOMBRE_G = {biceps:'Bíceps', triceps:'Tríceps', hombro:'Deltoides', antebrazo:'Antebrazo', pecho:'Pecho',
    espalda:'Espalda', gluteo:'Glúteo', cuadriceps:'Cuádriceps', isquios:'Isquiotibiales', aductores:'Aductores',
    pantorrilla:'Pantorrilla', pierna:'Pierna', cuello:'Cuello', abdomen:'Abdomen', resto:''};
  // Medida que manda en cada grupo (para la ficha al tocar)
  const MEDIDA_G = {biceps:'brazo', triceps:'brazo', hombro:'hombros', antebrazo:'antebrazo', pecho:'pecho', espalda:'pecho',
    gluteo:'cadera', cuadriceps:'muslo', isquios:'muslo', aductores:'muslo', pantorrilla:'pantorrilla', pierna:'pantorrilla', cuello:'cuello'};
  // Nombres que Z-Anatomy dejó sin traducir
  const TRAD = {'Abdominal part of pectoralis major muscle':'Porción abdominal del pectoral mayor', 'Adductor minimus':'Aductor mínimo',
    'Opponens digiti minimi muscle of foot':'Oponente del dedo mínimo del pie', 'Linea alba':'Línea alba', 'Long head of biceps femoris':'Cabeza larga del bíceps femoral'};
  // Complexión atlética de partida: el modelo de Z-Anatomy es delgado. Solo cambia la forma, no el brillo.
  const ATLETA = {hombro:1.55, pecho:1.4, espalda:1.35, biceps:1.35, triceps:1.35, antebrazo:1.2, cuello:1.25,
    gluteo:1.15, cuadriceps:1.35, isquios:1.25, aductores:1.15, pantorrilla:1.3, pierna:1.15, abdomen:1.1};
  const GANANCIA = 1.6;   // la cinta mide más que el músculo: 10 % más de brazo ≈ 16 % más de músculo
  const LIMA = [0.578, 0.888, 0.042];   // #C8F23A en lineal

  function factores(med){
    const f = {};
    for(const g in C3D_MAPA){
      let s = 1;
      for(const [campo,peso] of C3D_MAPA[g]){
        const v = med && +med[campo];
        if(v) s += ((v / C3D_BASE[campo]) - 1) * GANANCIA * peso;
      }
      f[g] = Math.max(.7, Math.min(1.7, s));
    }
    return f;
  }

  // three r128 no des-normaliza en getX: se convierte todo a Float32
  function aFloat(geo, k, comps){
    const a = geo.attributes[k]; if(!a) return null;
    const arr = a.isInterleavedBufferAttribute ? a.data.array : a.array;
    const div = !a.normalized ? 1 : arr instanceof Int8Array ? 127 : arr instanceof Uint8Array ? 255 : arr instanceof Int16Array ? 32767 : arr instanceof Uint16Array ? 65535 : 1;
    const n = a.count, out = new Float32Array(n * comps), get = ['getX','getY','getZ'];
    for(let i=0;i<n;i++) for(let c=0;c<comps;c++){ let v = a[get[c]](i) / div; if(a.normalized && div > 1) v = Math.max(-1, v); out[i*comps+c] = v; }
    geo.setAttribute(k, new THREE.BufferAttribute(out, comps));
    return out;
  }

  // Material con brillo lima por vértice (atributo "brillo")
  function materialConBrillo(op){
    const m = new THREE.MeshPhysicalMaterial(op);
    m.onBeforeCompile = sh => {
      sh.vertexShader = 'attribute float brillo;\nattribute float cavidad;\nvarying float vBrillo;\nvarying float vCav;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvBrillo = brillo; vCav = cavidad;');
      sh.fragmentShader = 'varying float vBrillo;\nvarying float vCav;\n' + sh.fragmentShader
        .replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ndiffuseColor.rgb *= vCav;\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(' + LIMA.join(',') + ')*.3, clamp(vBrillo,0.,1.)*.78);\ntotalEmissiveRadiance += vec3(' + LIMA.join(',') + ') * vBrillo * (.35 + .65 * vBrillo) * .95;')
        .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nreflectedLight.indirectDiffuse *= vCav; reflectedLight.directSpecular *= mix(.35, 1., vCav);');
    };
    return m;
  }

  // Vecinos de cada vértice a partir de los triángulos
  function vecinos(geo){
    const idx = geo.index.array, n = geo.attributes.position.count, cnt = new Uint32Array(n + 1);
    for(let t=0;t<idx.length;t+=3) for(let k=0;k<3;k++){ cnt[idx[t+k]] += 2; }
    const ini = new Uint32Array(n + 1); for(let i=0;i<n;i++) ini[i+1] = ini[i] + cnt[i];
    const ady = new Uint32Array(ini[n]), pos = ini.slice(0, n);
    for(let t=0;t<idx.length;t+=3){ const a = idx[t], b = idx[t+1], c = idx[t+2];
      ady[pos[a]++] = b; ady[pos[a]++] = c; ady[pos[b]++] = a; ady[pos[b]++] = c; ady[pos[c]++] = a; ady[pos[c]++] = b; }
    return {ini, ady};
  }
  // Suavizado Taubin (no encoge) sólo donde w > 0
  function suavizar(P, V, w, iter){
    const n = P.length / 3, tmp = new Float32Array(P.length);
    for(let it=0; it<iter*2; it++){
      const lam = it % 2 ? -.53 : .5;
      for(let i=0;i<n;i++){
        const j = i*3; if(!(w[i] > 0)){ tmp[j] = P[j]; tmp[j+1] = P[j+1]; tmp[j+2] = P[j+2]; continue; }
        let x = 0, y = 0, z = 0; const a = V.ini[i], b = V.ini[i+1];
        for(let k=a;k<b;k++){ const q = V.ady[k]*3; x += P[q]; y += P[q+1]; z += P[q+2]; }
        const m = b - a || 1, l = lam * w[i];
        tmp[j] = P[j] + (x/m - P[j]) * l; tmp[j+1] = P[j+1] + (y/m - P[j+1]) * l; tmp[j+2] = P[j+2] + (z/m - P[j+2]) * l;
      }
      P.set(tmp);
    }
  }
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // Simetría izquierda/derecha: cada vértice se promedia con el espejo de su vecino más cercano del otro lado
  function simetrizar(P, pasadas){
    const n = P.length / 3, C = .012, grid = new Map(), key = (i, j, k) => (i * 73856093) ^ (j * 19349663) ^ (k * 83492791);
    for(let r=0; r<pasadas; r++){
      grid.clear();
      for(let i=0;i<n;i++){ const k = key(Math.floor(P[i*3]/C), Math.floor(P[i*3+1]/C), Math.floor(P[i*3+2]/C)); let L = grid.get(k); if(!L) grid.set(k, L = []); L.push(i); }
      const Q = new Float32Array(P.length);
      for(let i=0;i<n;i++){
        const mx = -P[i*3], my = P[i*3+1], mz = P[i*3+2], gi = Math.floor(mx/C), gj = Math.floor(my/C), gk = Math.floor(mz/C);
        let best = -1, bd = 1e9;
        for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++) for(let c=-1;c<=1;c++){ const L = grid.get(key(gi+a, gj+b, gk+c)); if(!L) continue;
          for(const j of L){ const dx = P[j*3]-mx, dy = P[j*3+1]-my, dz = P[j*3+2]-mz, d = dx*dx + dy*dy + dz*dz; if(d < bd){ bd = d; best = j; } } }
        if(best < 0){ Q[i*3] = P[i*3]; Q[i*3+1] = my; Q[i*3+2] = mz; continue; }
        Q[i*3] = (P[i*3] - P[best*3]) / 2; Q[i*3+1] = (my + P[best*3+1]) / 2; Q[i*3+2] = (mz + P[best*3+2]) / 2;
      }
      P.set(Q);
    }
  }
  // Retoques del modelo al cargarlo
  function pulir(D, canalG){
    const piel = D[0], gp = piel.m.geometry, P = gp.attributes.position.array, n = P.length / 3;
    // a) cabeza de maniquí: se borran nariz, ojos y boca dejando la forma de huevo
    const V = vecinos(gp), w = new Float32Array(n);
    // centro del cráneo (Z-Anatomy tiene la cabeza un poco corrida en x)
    let x0 = 9, x1 = -9;
    for(let i=0;i<n;i++){ const y = P[i*3+1], x = P[i*3]; if(y > 1.6 && y < 1.64 && Math.abs(x) < .15){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
    const cx = (x0 + x1) / 2;
    // forma de maniquí como campo de distancia: cráneo + mandíbula + cuello, unidos suave
    const elip = (x, y, z, ex, ey, ez, rx, ry, rz) => { const a = (x-ex)/rx, b = (y-ey)/ry, c = (z-ez)/rz, k0 = Math.hypot(a, b, c), k1 = Math.hypot(a/rx, b/ry, c/rz) || 1; return k0 * (k0 - 1) / k1; };
    const smin = (a, b, k) => { const h = Math.max(0, Math.min(1, .5 + .5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); };
    const campo = (x, y, z) => {
      const cr = elip(x, y, z, cx, 1.612, -.012, .072, .094, .095);
      const mand = elip(x, y, z, cx, 1.54, .022, .056, .062, .068);
      const yy = Math.max(1.38, Math.min(1.56, y)), cue = Math.hypot(x - cx, y - yy, (z + .018) * 1.08) - (.058 + .02 * sstep(1.5, 1.4, y));
      return smin(smin(cr, mand, .035), cue, .03);
    };
    const e = .0015;
    for(let i=0;i<n;i++){ const j = i*3, y = P[j+1], x = P[j];
      w[i] = Math.abs(x - cx) < .13 ? sstep(1.44, 1.475, y) : 0;
      if(!w[i]) continue;
      let px = x, py = y, pz = P[j+2];
      for(let it=0; it<10; it++){
        const d = campo(px, py, pz), gx = campo(px+e, py, pz) - campo(px-e, py, pz), gy = campo(px, py+e, pz) - campo(px, py-e, pz), gz = campo(px, py, pz+e) - campo(px, py, pz-e), gl = Math.hypot(gx, gy, gz) || 1;
        px -= d * gx / gl; py -= d * gy / gl; pz -= d * gz / gl;
      }
      const k = w[i]; P[j] = x + (px - x) * k; P[j+1] = y + (py - y) * k; P[j+2] = P[j+2] + (pz - P[j+2]) * k;
    }
    // la cabeza y el cuello se centran (en Z-Anatomy están corridos ~4 cm) y luego todo el cuerpo queda simétrico
    for(let i=0;i<n;i++){ const j = i*3; P[j] -= cx * sstep(1.38, 1.47, P[j+1]); }
    for(const d of D) simetrizar(d.m.geometry.attributes.position.array, 3);
    { const wt = new Float32Array(n).fill(.7); suavizar(P, V, wt, 3); }   // quita el granulado que deja el promedio
    for(let i=0;i<n;i++) w[i] = w[i] > 0 ? Math.max(w[i], .5) : (P[i*3+1] > 1.385 && Math.abs(P[i*3]) < .17 ? .55 : 0);
    suavizar(P, V, w, 25);
    // b) el pie no crece con el antebrazo (Z-Anatomy agrupó ahí un músculo del pie)
    const ab = canalG.map(g => g === 'antebrazo');
    for(const d of D){ const Q = d.m.geometry.attributes.position.array;
      for(let i=0;i<d.GA.length;i++){ if(Q[i*3+1] < .6){ if(ab[d.GA[i]]) d.WA[i] = 0; if(ab[d.GB[i]]) d.WB[i] = 0; } } }
    // c) borde del short recto: el dobladillo de cada pierna queda a una sola altura
    const sh = D[1];
    if(sh && sh.m.geometry.index){
      const gs = sh.m.geometry, S = gs.attributes.position.array, idx = gs.index.array, m = S.length / 3, ar = new Map();
      for(let t=0;t<idx.length;t+=3) for(let k=0;k<3;k++){ const a = idx[t+k], b = idx[t+(k+1)%3], key = a < b ? a*m + b : b*m + a; ar.set(key, (ar.get(key) || 0) + 1); }
      const borde = new Uint8Array(m);
      ar.forEach((c, key) => { if(c === 1){ borde[Math.floor(key / m)] = 1; borde[key % m] = 1; } });
      const hem = [[], []];
      for(let i=0;i<m;i++) if(borde[i] && S[i*3+1] < .85) hem[S[i*3] > 0 ? 0 : 1].push(i);
      hem.forEach(L => {
        if(!L.length) return;
        const ys = L.map(i => S[i*3+1]).sort((a, b) => a - b), yh = ys[Math.floor(ys.length * .5)];
        const side = S[L[0]*3] > 0;
        for(let i=0;i<m;i++){
          if((S[i*3] > 0) !== side) continue;
          const y = S[i*3+1];
          if(borde[i] && y < .85) S[i*3+1] = yh;
          else if(y < yh) S[i*3+1] = yh + (y - yh) * .15;            // nada cuelga por debajo del dobladillo
        }
      });
      // cintura del short: también a una sola altura (pretina recta)
      const cin = []; for(let i=0;i<m;i++) if(borde[i] && S[i*3+1] >= .85) cin.push(i);
      if(cin.length){ const ys = cin.map(i => S[i*3+1]).sort((a, b) => a - b), yc = ys[Math.floor(ys.length * .6)];
        for(let i=0;i<m;i++){ const y = S[i*3+1]; if(borde[i] && y >= .85) S[i*3+1] = yc; else if(y > yc) S[i*3+1] = yc - (y - yc) * .1; } }
      const Vs = vecinos(gs), ws = new Float32Array(m);
      for(let i=0;i<m;i++) ws[i] = borde[i] ? 0 : .8;
      suavizar(S, Vs, ws, 6);
      gs.computeVertexNormals(); sh.P0 = S.slice(); sh.N0 = gs.attributes.normal.array.slice();
    }
    gp.computeVertexNormals(); piel.P0 = P.slice(); piel.N0 = gp.attributes.normal.array.slice();
    piel.V = V;
  }
  // Oclusión barata: lo cóncavo (entre músculos) se oscurece; da la "definición" de la foto
  function cavidades(geo){
    const P = geo.attributes.position.array, N = geo.attributes.normal.array, n = P.length / 3, V = vecinos(geo);
    const out = new Float32Array(n), S1 = P.slice(), S2 = P.slice();
    const lis = (S, it) => { const tmp = new Float32Array(S.length); for(let r=0;r<it;r++){ for(let i=0;i<n;i++){ let x=0,y=0,z=0; const a=V.ini[i], b=V.ini[i+1];
      for(let k=a;k<b;k++){ const q=V.ady[k]*3; x+=S[q]; y+=S[q+1]; z+=S[q+2]; } const m=b-a||1; tmp[i*3]=x/m; tmp[i*3+1]=y/m; tmp[i*3+2]=z/m; } S.set(tmp); } };
    lis(S1, 4); lis(S2, 18);
    for(let i=0;i<n;i++){
      const j = i*3;
      const d1 = (P[j]-S1[j])*N[j] + (P[j+1]-S1[j+1])*N[j+1] + (P[j+2]-S1[j+2])*N[j+2];
      const d2 = (P[j]-S2[j])*N[j] + (P[j+1]-S2[j+1])*N[j+1] + (P[j+2]-S2[j+2])*N[j+2];
      out[i] = d1 * 500 + d2 * 110;                   // metros → contraste
    }
    // se difumina para que quede como sombra suave entre músculos, no como manchas
    const tmp = new Float32Array(n);
    for(let r=0;r<6;r++){ for(let i=0;i<n;i++){ let s = out[i], c = 1; for(let k=V.ini[i];k<V.ini[i+1];k++){ s += out[V.ady[k]]; c++; } tmp[i] = s / c; } out.set(tmp); }
    for(let i=0;i<n;i++){ const c = out[i]; out[i] = c < 0 ? Math.max(.45, 1 + c * 1.1) : Math.min(1.12, 1 + c * .5); }
    return out;
  }

  function montar(cont, op){
    op = op || {};
    const base = op.base || '';
    const W = () => cont.clientWidth, H = () => cont.clientHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, preserveDrawingBuffer:!!op.captura});
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .8;
    cont.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(op.fondo || 0x0A0E13);
    const camera = new THREE.PerspectiveCamera(30, W()/H(), .05, 20);
    camera.position.set(0, .95, 4.2);

    // Estudio como las fotos de ejercicios: principal suave, contraluces fríos
    scene.add(new THREE.HemisphereLight(0xc4d0de, 0x06080b, .06));
    const luces = new THREE.Group(); scene.add(luces);      // giran con la cámara: el cuerpo siempre se ve bien iluminado
    const key = new THREE.DirectionalLight(0xfff6ee, .62); key.position.set(1.6, 2.8, 2.2); luces.add(key);
    const fill = new THREE.DirectionalLight(0xaebfd4, .035); fill.position.set(-2.6, .8, 1.6); luces.add(fill);
    const rimA = new THREE.DirectionalLight(0x7fb0ff, .5); rimA.position.set(-2.4, 1.8, -2.0); luces.add(rimA);
    const rimB = new THREE.DirectionalLight(0x7fb0ff, .36); rimB.position.set(2.6, 1.4, -1.8); luces.add(rimB);
    const top = new THREE.DirectionalLight(0xdfe8f2, .1); top.position.set(0, 4, -.4); luces.add(top);
    [key, fill, rimA, rimB, top].forEach(l => { l.target.position.set(0, .9, 0); luces.add(l.target); });

    // sin posproceso: el resplandor lima lo hace la capa "halo" (más limpio y ligero en el teléfono)

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, .92, 0);
    controls.enableDamping = true; controls.dampingFactor = .08;
    controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 7;
    controls.rotateSpeed = .8; controls.zoomSpeed = .9;
    controls.update();

    let info = null, listo = false, raf = 0, destruido = false;
    let fAct = factores(null), fIni = fAct, fFin = fAct, t0 = 0, dur = 0;
    let piel = null, short = null, sel = null;     // sel: índice de canal resaltado
    let MUS, BR, CAV, TMAX, canalG, D = [];   // D: mallas que se deforman (piel y short) con sus datos
    let crecimiento = false, horneado = false;

    const matPiel = materialConBrillo({color:0x6E747C, roughness:.44, metalness:0, clearcoat:.18, clearcoatRoughness:.55});
    const matShort = new THREE.MeshStandardMaterial({color:0x060708, roughness:.78, metalness:0, side:THREE.DoubleSide});

    const promesa = Promise.all([
      fetch(base + 'cuerpo.json').then(r => r.json()),
      new Promise((res, rej) => {
        const l = new THREE.GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder);
        l.load(base + (op.modelo || 'cuerpo.glb'), res, undefined, rej);
      })
    ]).then(([j, gltf]) => {
      if(destruido) return;
      info = j; canalG = j.canales.map(c => c.g);
      gltf.scene.updateMatrixWorld(true);
      const mallas = []; gltf.scene.traverse(o => { if(o.isMesh) mallas.push(o); });
      const raiz = new THREE.Group();
      mallas.forEach(o => {
        const geo = o.geometry;
        aFloat(geo, 'position', 3); aFloat(geo, 'normal', 3);
        geo.applyMatrix4(o.matrixWorld); o.position.set(0,0,0); o.rotation.set(0,0,0); o.scale.set(1,1,1);
        const nm = (o.material && o.material.name) || o.name;
        if(/short/i.test(nm)){ short = o; o.material = matShort; }
        else { piel = o; o.material = matPiel; }
        raiz.add(o);
      });
      [piel, short].forEach(m => {
        if(!m) return;
        const g = m.geometry;
        g.computeVertexNormals();
        const at = k => g.attributes[k] ? (g.attributes[k].array instanceof Float32Array && !g.attributes[k].normalized ? g.attributes[k].array : aFloat(g, k, 1)) : null;
        D.push({m, P0:g.attributes.position.array.slice(), N0:g.attributes.normal.array.slice(), GA:at('_ga'), WA:at('_wa'), GB:at('_gb'), WB:at('_wb'), T:at('_t')});
        if(m === piel){ MUS = at('_musculo'); }
      });
      // modelo horneado (limpio, con sombra ya calculada) o el crudo, que se pule aquí
      const cavH = piel.geometry.attributes._cav ? aFloat(piel.geometry, '_cav', 1) : null;
      if(cavH){ CAV = cavH; horneado = true; } else { pulir(D, canalG); CAV = cavidades(piel.geometry); }
      piel.geometry.setAttribute('cavidad', new THREE.BufferAttribute(CAV, 1));
      if(short && short.geometry.attributes._cav){ const c = aFloat(short.geometry, '_cav', 1), col = new Float32Array(c.length * 3); for(let i=0;i<c.length;i++) col[i*3] = col[i*3+1] = col[i*3+2] = c[i]; short.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3)); matShort.vertexColors = true; }
      TMAX = canalG.map(() => .001); { const {GA, T} = D[0]; for(let i=0;i<T.length;i++) if(GA[i] >= 0) TMAX[GA[i]] = Math.max(TMAX[GA[i]], T[i]); }
      BR = new Float32Array(D[0].P0.length / 3); piel.geometry.setAttribute('brillo', new THREE.BufferAttribute(BR, 1));
      // Halo: capas de la misma malla, infladas y aditivas, que solo se ven alrededor de lo que brilla (resplandor suave)
      [[.006, .9], [.014, .6], [.024, .38], [.036, .2]].forEach(([d, k], c) => {
        const h = new THREE.Mesh(piel.geometry, new THREE.ShaderMaterial({
          transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.BackSide,
          vertexShader:'attribute float brillo;\nvarying float vB;\nvarying float vF;\nvoid main(){\n  vec3 p = position + normal * ' + d.toFixed(3) + ' * brillo;\n  vec4 mv = modelViewMatrix * vec4(p, 1.);\n  vec3 n = normalize(normalMatrix * normal);\n  vF = 1. - abs(dot(n, normalize(-mv.xyz)));\n  vB = brillo;\n  gl_Position = projectionMatrix * mv;\n}',
          fragmentShader:'varying float vB;\nvarying float vF;\nvoid main(){\n  float a = smoothstep(.15, 1., vB) * pow(vF, .9) * ' + k.toFixed(2) + ';\n  gl_FragColor = vec4(vec3(' + [0.784,0.949,0.227].join(',') + ') * a, a);\n}'
        }));
        h.renderOrder = 2 + c; raiz.add(h);
      });
      scene.add(raiz);
      aplicar(fAct);
      listo = true;
      if(op.alListo) op.alListo();
    });

    // Deforma la piel según los factores de cada grupo y actualiza el short y el brillo
    function aplicar(f){
      if(!D.length) return;
      const s = canalG.map(g => (f[g] == null ? 1 : f[g]) * (op.sinAtleta || horneado ? 1 : (ATLETA[g] || 1)) - 1);
      for(const d of D){
        const {P0, N0, GA, WA, GB, WB, T} = d, pa = d.m.geometry.attributes.position, p = pa.array, n = P0.length / 3;
        const K = d.K || (d.K = new Float32Array(n)), K2 = d.K2 || (d.K2 = new Float32Array(n));
        for(let i=0;i<n;i++){ const a = GA[i], b = GB[i]; K[i] = ((a >= 0 ? WA[i] * s[a] : 0) + (b >= 0 ? WB[i] * s[b] : 0)) * T[i]; }
        const Vd = d.V || (d.V = vecinos(d.m.geometry));
        for(let r=0;r<3;r++){ for(let i=0;i<n;i++){ let sm = K[i], c = 1; for(let q=Vd.ini[i];q<Vd.ini[i+1];q++){ sm += K[Vd.ady[q]]; c++; } K2[i] = sm / c; } K.set(K2); }
        for(let i=0;i<n;i++){
          const k = K[i], j = i*3;
          p[j] = P0[j] + N0[j]*k; p[j+1] = P0[j+1] + N0[j+1]*k; p[j+2] = P0[j+2] + N0[j+2]*k;
        }
        pa.needsUpdate = true; d.m.geometry.computeVertexNormals(); d.m.geometry.computeBoundingSphere();
      }
      pintarBrillo(f);
    }
    // Brillo: el músculo tocado, o (modo crecimiento) lo que creció respecto a la referencia
    function pintarBrillo(f){
      if(!BR) return;
      const n = BR.length;
      const {GA, WA, GB, WB, T} = D[0];
      // crecimiento: brilla más lo que más creció; lo que creció poco queda tenue (como en la foto)
      const cre = canalG.map(g => Math.max(0, (f[g] || 1) - 1)), tope = Math.max(.02, ...cre);
      const selG = sel != null ? canalG[sel] : null;
      const val = canalG.map((g, c) => selG != null ? (g === selG ? (c === sel ? 1 : .55) : 0)
        : crecimiento ? Math.pow(cre[c] / tope, 3) * Math.min(1, tope * 5) : 0);
      for(let i=0;i<n;i++){
        const a = GA[i], b = GB[i];
        // el brillo se concentra en el vientre del músculo (donde es más grueso) y se apaga en los bordes
        const ca = a >= 0 ? WA[i] * val[a] * (.08 + .92 * Math.pow(Math.min(1, T[i] / (TMAX[a] * .75)), 1.6)) : 0;
        const cb = b >= 0 ? WB[i] * val[b] * (.08 + .92 * Math.pow(Math.min(1, T[i] / (TMAX[b] * .75)), 1.6)) : 0;
        const v = Math.min(1, ca + cb);
        BR[i] = v;
      }
      // se difumina sobre la malla: bordes del brillo suaves, sin puntitos
      const Vd = D[0].V || (D[0].V = vecinos(piel.geometry)), B2 = D[0].B2 || (D[0].B2 = new Float32Array(n));
      for(let r=0;r<4;r++){ for(let i=0;i<n;i++){ let sm = BR[i], c = 1; for(let q=Vd.ini[i];q<Vd.ini[i+1];q++){ sm += BR[Vd.ady[q]]; c++; } B2[i] = sm / c; } BR.set(B2); }
      for(let i=0;i<n;i++){ const v = BR[i]; BR[i] = v * v * (3 - 2 * v); }
      piel.geometry.attributes.brillo.needsUpdate = true;
    }

    function ponerMedidas(med, ms){
      fIni = Object.assign({}, fAct); fFin = factores(med);
      dur = ms == null ? 900 : ms; t0 = performance.now();
      if(!dur){ fAct = fFin; aplicar(fAct); }
    }
    function mezclar(medA, medB, v){
      const A = factores(medA), B = factores(medB), f = {};
      for(const k in B) f[k] = A[k] + (B[k] - A[k]) * v;
      dur = 0; fAct = f; aplicar(f);
    }
    function verCrecimiento(si){ crecimiento = !!si; pintarBrillo(fAct); }
    function cuadro(now){
      if(dur){
        const v = Math.min(1, (now - t0) / dur), e = v < .5 ? 4*v*v*v : 1 - Math.pow(-2*v + 2, 3) / 2;
        const f = {}; for(const k in fFin) f[k] = fIni[k] + (fFin[k] - fIni[k]) * e;
        fAct = f; aplicar(f); if(v >= 1) dur = 0;
      }
      controls.update();
      luces.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
    }
    function bucle(now){ if(destruido) return; cuadro(now); raf = requestAnimationFrame(bucle); }
    if(!op.manual) raf = requestAnimationFrame(bucle);

    // Tocar → nombre del músculo y brillo en su grupo
    const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
    let abajo = null;
    renderer.domElement.addEventListener('pointerdown', e => { abajo = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', e => {
      if(!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 6 || !listo) return;
      const r = renderer.domElement.getBoundingClientRect();
      v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v2, camera);
      const hit = ray.intersectObject(piel, false)[0];
      const res = hit ? tocarVertice(hit.face.a) : (resaltar(null), null);
      op.onToque && op.onToque(res);
    });
    function tocarVertice(vi){
      const {GA, WA} = D[0];
      const m = info.musculos[Math.round(MUS[vi])];
      const c = GA[vi] >= 0 && WA[vi] > .35 ? GA[vi] : null;
      resaltar(c);
      if(!m) return null;
      const lado = m.lado === 'l' ? 'izquierdo' : m.lado === 'r' ? 'derecho' : '';
      let nom = m.es.replace(/ \((izq|der)\.\)$/, ''); nom = TRAD[nom] || nom;
      return {nombre:nom, grupo:NOMBRE_G[m.g] || '', g:m.g, lado, medida:MEDIDA_G[m.g] || null, factor:fAct[m.g] || 1};
    }
    function resaltar(c){ sel = c == null ? null : c; pintarBrillo(fAct); }
    function canal(g, lado){ return info.canales.findIndex(c => c.g === g && c.lado === lado); }

    function redimensionar(){ camera.aspect = W()/H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); }
    window.addEventListener('resize', redimensionar);
    function destruir(){
      destruido = true; cancelAnimationFrame(raf); window.removeEventListener('resize', redimensionar);
      controls.dispose();
      scene.traverse(o => { if(o.isMesh){ o.geometry.dispose(); o.material.dispose(); } });
      renderer.dispose(); renderer.domElement.remove();
    }
    return {promesa, ponerMedidas, mezclar, verCrecimiento, destruir, cuadro, camera, controls, factores,
            resaltar, canal, tocarVertice, info:() => info, piel:() => piel, _D:() => D};
  }
  window.Cuerpo3D = {montar, factores, C3D_BASE};
})();
