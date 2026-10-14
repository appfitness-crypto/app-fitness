/* ═══ cuerpo 3d: maniquí gris con la definición muscular, que cambia con las medidas ═══
   Superficie generada a partir de Z-Anatomy (CC BY-SA 4.0), derivado de BodyParts3D (CC BY-SA 2.1 JP).
   El modelo (modelos/cuerpo.glb) ya viene limpio, simétrico y con la sombra horneada: ver herramientas/cuerpo3d/.
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
  // Complexión de partida: más atlética que el modelo anatómico (hombros, pecho, espalda y brazos marcados, como en
  // las fotos de ejercicios). Solo cambia la forma: el brillo de "crecimiento" sigue midiendo contra tus medidas.
  const COMPLEXION = {hombro:1.26, pecho:1.16, espalda:1.16, biceps:1.22, triceps:1.2, antebrazo:1.1, cuello:1.08,
    cuadriceps:1.15, isquios:1.1, aductores:1.05, gluteo:1.06, pantorrilla:1.12, pierna:1.06};
  // Grupos que mueve cada medida (los de peso fuerte): al tocar una tarjeta se iluminan
  const GRUPOS_MEDIDA = {cintura:['abdomen']};
  for(const g in C3D_MAPA) for(const [m, p] of C3D_MAPA[g]) if(p >= .9) (GRUPOS_MEDIDA[m] = GRUPOS_MEDIDA[m] || []).push(g);
  const GANANCIA = 1.6;   // la cinta mide más que el músculo: 10 % más de brazo ≈ 16 % más de músculo
  const LIMA = [0.578, 0.888, 0.042];   // #C8F23A en lineal

  // ref: medidas de partida (la primera medición del cliente). Con ellas el cuerpo queda tal cual.
  function factores(med, ref){
    ref = ref || C3D_BASE;
    const f = {};
    for(const g in C3D_MAPA){
      let s = 1;
      for(const [campo,peso] of C3D_MAPA[g]){
        const v = med && +med[campo], r = +ref[campo];
        if(v && r) s += ((v / r) - 1) * GANANCIA * peso;
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
        '#include <emissivemap_fragment>\nfloat cav = pow(clamp(vCav, 0., 1.1), 1.55);\ndiffuseColor.rgb *= cav;\n'
        // el músculo encendido se tiñe de lima pero conserva su volumen (luz y sombra), como en las fotos de ejercicios
        + 'float br = clamp(vBrillo, 0., 1.);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(' + LIMA.join(',') + ') * .3 * cav, br * (.55 + .4 * br));\n'
        + 'totalEmissiveRadiance += vec3(' + LIMA.join(',') + ') * br * (.05 + .38 * br * br) * (.4 + .6 * cav);')
        .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nreflectedLight.indirectDiffuse *= vCav; reflectedLight.directSpecular *= mix(.25, 1., clamp(vCav, 0., 1.)) * (1. - .7 * clamp(vBrillo, 0., 1.));');
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
  // Promedia las normales con sus vecinas: quita el granulado del escaneo sin encoger la forma (la silueta no cambia)
  function suavizarNormales(geo, V, pasos){
    const N = geo.attributes.normal.array, n = N.length / 3, T = suavizarNormales.T && suavizarNormales.T.length === N.length ? suavizarNormales.T : (suavizarNormales.T = new Float32Array(N.length));
    for(let r=0;r<pasos;r++){
      for(let i=0;i<n;i++){ const j = i*3; let x = N[j], y = N[j+1], z = N[j+2];
        for(let q=V.ini[i];q<V.ini[i+1];q++){ const k = V.ady[q]*3; x += N[k]; y += N[k+1]; z += N[k+2]; }
        const l = Math.hypot(x, y, z) || 1; T[j] = x/l; T[j+1] = y/l; T[j+2] = z/l; }
      N.set(T);
    }
    geo.attributes.normal.needsUpdate = true;
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

    // Estudio como las fotos de ejercicios: una principal alta y lateral que marca el relieve, casi sin relleno,
    // y dos contraluces azules por detrás que recortan la silueta contra el fondo oscuro
    scene.add(new THREE.HemisphereLight(0xc8ccd2, 0x05070a, .08));
    const luces = new THREE.Group(); scene.add(luces);      // giran con la cámara: el cuerpo siempre se ve bien iluminado
    const key = new THREE.DirectionalLight(0xfff1e4, .8); key.position.set(-2.3, 2.8, 1.4); luces.add(key);
    const fill = new THREE.DirectionalLight(0x9fb3cc, .12); fill.position.set(2.4, .6, 1.8); luces.add(fill);
    const rimA = new THREE.DirectionalLight(0x6f9dff, 1.0); rimA.position.set(-2.6, 1.6, -2.2); luces.add(rimA);
    const rimB = new THREE.DirectionalLight(0x6f9dff, .85); rimB.position.set(2.8, 1.2, -2.0); luces.add(rimB);
    const top = new THREE.DirectionalLight(0xdfe8f2, .22); top.position.set(0, 4, -.6); luces.add(top);
    [key, fill, rimA, rimB, top].forEach(l => { l.target.position.set(0, .9, 0); luces.add(l.target); });

    // sin posproceso: el resplandor lima lo hace la capa "halo" (más limpio y ligero en el teléfono)

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, .92, 0);
    controls.enableDamping = true; controls.dampingFactor = .08;
    controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 7;
    controls.rotateSpeed = .8; controls.zoomSpeed = .9;
    controls.update();

    let info = null, listo = false, raf = 0, destruido = false;
    let REF = op.referencia || C3D_BASE;
    let fAct = factores(null), fIni = fAct, fFin = fAct, t0 = 0, dur = 0;
    let piel = null, short = null, sel = null, selGs = null;     // sel: índice de canal resaltado · selGs: grupos de una medida
    let MUS, BR, BRS, CUB, CAV, TMAX, canalG, D = [];   // D: mallas que se deforman (piel y short) con sus datos
    let crecimiento = false;

    // gris arcilla mate con un velo de brillo suave (como un modelo esculpido)
    const matPiel = materialConBrillo({color:0x55565A, roughness:.5, metalness:0, clearcoat:.22, clearcoatRoughness:.42});
    const matShort = new THREE.MeshStandardMaterial({color:0x060708, roughness:.78, metalness:0, side:THREE.DoubleSide});
    // lo que brilla debajo del short (glúteo, cadera) se ve en la tela, no asomándose por los bordes
    matShort.onBeforeCompile = sh => {
      sh.vertexShader = 'attribute float brillo;\nvarying float vBrillo;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvBrillo = brillo;');
      sh.fragmentShader = 'varying float vBrillo;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(' + LIMA.join(',') + ')*.2, clamp(vBrillo,0.,1.)*.5);\ntotalEmissiveRadiance += vec3(' + LIMA.join(',') + ') * vBrillo * .3;');
    };

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
      // sombra horneada en el modelo (herramientas/cuerpo3d/hornear.cjs)
      CAV = piel.geometry.attributes._cav ? aFloat(piel.geometry, '_cav', 1) : new Float32Array(D[0].P0.length / 3).fill(1);
      piel.geometry.setAttribute('cavidad', new THREE.BufferAttribute(CAV, 1));
      if(short && short.geometry.attributes._cav){ const c = aFloat(short.geometry, '_cav', 1), col = new Float32Array(c.length * 3); for(let i=0;i<c.length;i++) col[i*3] = col[i*3+1] = col[i*3+2] = c[i]; short.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3)); matShort.vertexColors = true; }
      TMAX = canalG.map(() => .001); { const {GA, T} = D[0]; for(let i=0;i<T.length;i++) if(GA[i] >= 0) TMAX[GA[i]] = Math.max(TMAX[GA[i]], T[i]); }
      BR = new Float32Array(D[0].P0.length / 3); piel.geometry.setAttribute('brillo', new THREE.BufferAttribute(BR, 1));
      if(short){ BRS = new Float32Array(D[1].P0.length / 3); short.geometry.setAttribute('brillo', new THREE.BufferAttribute(BRS, 1)); }
      // piel tapada por el short: ahí no brilla la piel (brilla la tela)
      CUB = new Uint8Array(BR.length);
      if(short){
        const S = D[1].P0, C = .02, H = new Map(), k3 = (x, y, z) => x * 73856093 ^ y * 19349663 ^ z * 83492791;
        for(let i=0;i<S.length;i+=3){ const k = k3(Math.floor(S[i]/C), Math.floor(S[i+1]/C), Math.floor(S[i+2]/C)); let L = H.get(k); if(!L) H.set(k, L = []); L.push(i); }
        const P = D[0].P0;
        for(let i=0;i<BR.length;i++){ const x = P[i*3], y = P[i*3+1], z = P[i*3+2], gx = Math.floor(x/C), gy = Math.floor(y/C), gz = Math.floor(z/C);
          let cerca = false;
          for(let a=-1;a<=1&&!cerca;a++) for(let b=-1;b<=1&&!cerca;b++) for(let c=-1;c<=1&&!cerca;c++){ const L = H.get(k3(gx+a, gy+b, gz+c)); if(!L) continue;
            for(const q of L){ const dx = S[q]-x, dy = S[q+1]-y, dz = S[q+2]-z; if(dx*dx + dy*dy + dz*dz < .00016){ cerca = true; break; } } }
          CUB[i] = cerca ? 1 : 0; }
      }
      // Halo: capas de la misma malla, infladas y aditivas, que solo se ven alrededor de lo que brilla (resplandor suave)
      const halo = geo => [[.006, .9], [.014, .6], [.024, .38], [.036, .2]].forEach(([d, k], c) => {
        const h = new THREE.Mesh(geo, new THREE.ShaderMaterial({
          transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.BackSide,
          vertexShader:'attribute float brillo;\nvarying float vB;\nvarying float vF;\nvoid main(){\n  vec3 p = position + normal * ' + d.toFixed(3) + ' * brillo;\n  vec4 mv = modelViewMatrix * vec4(p, 1.);\n  vec3 n = normalize(normalMatrix * normal);\n  vF = 1. - abs(dot(n, normalize(-mv.xyz)));\n  vB = brillo;\n  gl_Position = projectionMatrix * mv;\n}',
          fragmentShader:'varying float vB;\nvarying float vF;\nvoid main(){\n  float a = smoothstep(.15, 1., vB) * pow(vF, .9) * ' + k.toFixed(2) + ';\n  gl_FragColor = vec4(vec3(' + [0.784,0.949,0.227].join(',') + ') * a, a);\n}'
        }));
        h.renderOrder = 2 + c; raiz.add(h);
      });
      halo(piel.geometry); if(short) halo(short.geometry);
      scene.add(raiz);
      aplicar(fAct);
      listo = true;
      if(op.alListo) op.alListo();
    });

    // Deforma la piel según los factores de cada grupo y actualiza el short y el brillo
    function aplicar(f){
      if(!D.length) return;
      const s = canalG.map(g => Math.min(1.9, (f[g] == null ? 1 : f[g]) * (COMPLEXION[g] || 1)) - 1);
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
        pa.needsUpdate = true; d.m.geometry.computeVertexNormals(); suavizarNormales(d.m.geometry, Vd, d.m === piel ? 3 : 1); d.m.geometry.computeBoundingSphere();
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
      const val = canalG.map((g, c) => selGs ? (selGs.has(g) ? 1 : 0) : selG != null ? (g === selG ? (c === sel ? 1 : .55) : 0)
        : crecimiento ? Math.pow(cre[c] / tope, 3) * Math.min(1, tope * 5) : 0);
      for(let i=0;i<n;i++){
        const a = GA[i], b = GB[i];
        // el brillo se concentra en el vientre del músculo (donde es más grueso) y se apaga en los bordes
        const ca = a >= 0 ? WA[i] * val[a] * (.12 + .88 * Math.pow(Math.min(1, T[i] / TMAX[a]), 1.15)) : 0;
        const cb = b >= 0 ? WB[i] * val[b] * (.12 + .88 * Math.pow(Math.min(1, T[i] / TMAX[b]), 1.15)) : 0;
        const v = Math.min(1, ca + cb);
        BR[i] = v;
      }
      // se difumina sobre la malla: bordes del brillo suaves, sin puntitos
      const Vd = D[0].V || (D[0].V = vecinos(piel.geometry)), B2 = D[0].B2 || (D[0].B2 = new Float32Array(n));
      for(let r=0;r<7;r++){ for(let i=0;i<n;i++){ let sm = BR[i], c = 1; for(let q=Vd.ini[i];q<Vd.ini[i+1];q++){ sm += BR[Vd.ady[q]]; c++; } B2[i] = sm / c; } BR.set(B2); }
      for(let i=0;i<n;i++){ const v = BR[i] * (1 - CUB[i]); BR[i] = Math.min(1, v * (1.35 - .35 * v)); }
      piel.geometry.attributes.brillo.needsUpdate = true;
      // el short toma el brillo de lo que cubre
      if(BRS){
        const d = D[1], m = BRS.length, Vs = d.V || (d.V = vecinos(short.geometry)), S2 = d.B2 || (d.B2 = new Float32Array(m));
        for(let i=0;i<m;i++){ const a = d.GA[i], b = d.GB[i]; BRS[i] = Math.min(1, (a >= 0 ? d.WA[i] * val[a] : 0) + (b >= 0 ? d.WB[i] * val[b] : 0)); }
        for(let r=0;r<6;r++){ for(let i=0;i<m;i++){ let sm = BRS[i], c = 1; for(let q=Vs.ini[i];q<Vs.ini[i+1];q++){ sm += BRS[Vs.ady[q]]; c++; } S2[i] = sm / c; } BRS.set(S2); }
        for(let i=0;i<m;i++){ const v = BRS[i]; BRS[i] = v * v * (3 - 2 * v) * .7; }
        short.geometry.attributes.brillo.needsUpdate = true;
      }
    }

    function ponerMedidas(med, ms){
      fIni = Object.assign({}, fAct); fFin = factores(med, REF);
      dur = ms == null ? 900 : ms; t0 = performance.now();
      if(!dur){ fAct = fFin; aplicar(fAct); }
    }
    function mezclar(medA, medB, v){
      const A = factores(medA, REF), B = factores(medB, REF), f = {};
      for(const k in B) f[k] = A[k] + (B[k] - A[k]) * v;
      dur = 0; fAct = f; aplicar(f);
    }
    function ponerReferencia(r){ REF = r || C3D_BASE; }
    function verCrecimiento(si){ crecimiento = !!si; pintarBrillo(fAct); }
    function cuadro(now){
      if(dur){
        const v = Math.min(1, (now - t0) / dur), e = v < .5 ? 4*v*v*v : 1 - Math.pow(-2*v + 2, 3) / 2;
        const f = {}; for(const k in fFin) f[k] = fIni[k] + (fFin[k] - fIni[k]) * e;
        fAct = f; aplicar(f); if(v >= 1) dur = 0;
      }
      pasoGiro(now);
      controls.update();
      luces.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
    }
    let pausado = false;
    function bucle(now){ if(destruido || pausado) return; cuadro(now); raf = requestAnimationFrame(bucle); }
    function pausar(si){ si = !!si; if(si === pausado || op.manual) return; pausado = si; cancelAnimationFrame(raf); if(!si) raf = requestAnimationFrame(bucle); }
    if(!op.manual) raf = requestAnimationFrame(bucle);

    // Tocar → nombre del músculo y brillo en su grupo
    const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
    let abajo = null;
    renderer.domElement.addEventListener('pointerdown', e => { abajo = [e.clientX, e.clientY]; giro = null; });
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
    function resaltar(c){ sel = c == null ? null : c; selGs = null; pintarBrillo(fAct); }
    // Ilumina los músculos de una medida y gira el cuerpo para que se vean de frente
    function resaltarMedida(medida){
      const gs = GRUPOS_MEDIDA[medida]; sel = null; selGs = gs ? new Set(gs) : null; pintarBrillo(fAct);
      if(!selGs || !listo) return;
      // si buena parte ya mira a la cámara, no se gira (el bíceps basta para "brazo")
      const N = D[0].N0, t = controls.target, ca = Math.atan2(camera.position.x - t.x, camera.position.z - t.z), cx = Math.sin(ca), cz = Math.cos(ca);
      let x = 0, z = 0, tot = 0, vis = 0;
      for(let i=0;i<BR.length;i++){ const b = BR[i]; if(b > .3){ const nx = N[i*3], nz = N[i*3+2]; x += nx * b; z += nz * b; tot += b; if(nx * cx + nz * cz > .2) vis += b; } }
      if(!tot || vis / tot > .3 || Math.hypot(x, z) < 1e-3) return;
      girarA(Math.atan2(x, z));
    }
    // giro suave de la cámara alrededor del cuerpo hasta el ángulo pedido (por el camino más corto)
    let giro = null;
    function girarA(az){
      const t = controls.target, p = camera.position, r = Math.hypot(p.x - t.x, p.z - t.z), a0 = Math.atan2(p.x - t.x, p.z - t.z);
      let d = az - a0; d = Math.atan2(Math.sin(d), Math.cos(d));
      if(Math.abs(d) < .5) return;     // ya se ve: no mover
      const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
      giro = {a0, d, r, t0:performance.now(), dur:quieto ? 0 : 750};
    }
    function pasoGiro(now){
      if(!giro) return;
      const v = giro.dur ? Math.min(1, (now - giro.t0) / giro.dur) : 1, e = v < .5 ? 4*v*v*v : 1 - Math.pow(-2*v + 2, 3) / 2;
      const a = giro.a0 + giro.d * e, t = controls.target;
      camera.position.x = t.x + Math.sin(a) * giro.r; camera.position.z = t.z + Math.cos(a) * giro.r;
      if(v >= 1) giro = null;
    }
    function canal(g, lado){ return info.canales.findIndex(c => c.g === g && c.lado === lado); }

    function redimensionar(){ camera.aspect = W()/H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); }
    window.addEventListener('resize', redimensionar);
    function destruir(){
      destruido = true; cancelAnimationFrame(raf); window.removeEventListener('resize', redimensionar);
      controls.dispose();
      scene.traverse(o => { if(o.isMesh){ o.geometry.dispose(); o.material.dispose(); } });
      renderer.dispose(); renderer.domElement.remove();
    }
    return {promesa, ponerMedidas, mezclar, verCrecimiento, ponerReferencia, pausar, destruir, cuadro, camera, controls, factores,
            resaltar, resaltarMedida, canal, tocarVertice, info:() => info, piel:() => piel};
  }
  window.Cuerpo3D = {montar, factores, C3D_BASE, MEDIDA_G, NOMBRE_G};
})();
