// THEREFORE 홈: 연필을 감고 나선으로 쌓여 올라가는 글 카드(나선형 교육과정).
// 시안: drafts/d-spiral.html. 3D 문법은 ELSEWHERE 지구본과 같다(docs/FAMILY.md 3절).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export async function initSpiral(stage) {

  /* ───────── 데이터: 페이지가 data-spiral 속성으로 넘겨준다 ───────── */
  const C = { paper: '#F6F3ED', sheet: '#FBF9F4', linen: '#E4E0D6', taupe: '#A69D8D', olive: '#4F594C', ink: '#24231F', caption: '#69655F' };
  const DATA = JSON.parse(stage.dataset.spiral);
  const SERIES = DATA.series; // [{ name, topic, color, count }]
  const POSTS = DATA.notes.map((n, i) => ({ ...n, i, date: new Date(n.iso + 'T00:00:00Z') })); // 오래된 글부터
  const N = POSTS.length;
  if (!N) return;

  /* ───────── HTML 부분: 범례, 패널 ───────── */
  const legend = stage.querySelector('.legend');
  const panel = stage.querySelector('.panel');
  const ruler = stage.querySelector('.ruler');
  SERIES.forEach((s, k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<i style="background:${s.color}"></i>${s.name}<span>${s.count}</span>`;
    legend.append(b);
  });
  function showPanel(p, chosen) {
    if (!p) p = POSTS[N - 1];
    const s = SERIES[p.s];
    panel.innerHTML = `<p class="meta"><i style="background:${s.color}"></i>${chosen ? '' : (p.i === N - 1 ? '가장 최근 글 · ' : '')}${s.name} · ${p.ep}편</p><h3>${p.title}</h3><p class="row"><span class="num">${p.label} · No.${String(p.i + 1).padStart(2, '0')}</span><a class="hit" href="${p.url}">읽기 →</a></p>`;
  }
  showPanel(null);

  /* ───────── 3D ───────── */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (e) {
    stage.querySelector('.fallback').hidden = false;
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(C.paper, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(C.paper, 10, 24);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfffcf4, 0xd9d2c3, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(-5, 9, 7);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xfff4e2, 0.35);
  rim.position.set(6, 2, -6);
  scene.add(rim);

  await document.fonts.load('400 76px "Noto Serif KR"', '가나다');
  await document.fonts.load('300 64px "Manrope"', '0123');
  const ANISO = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const tex = (canvas) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; };
  const rand = (() => { let s = 1960; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

  /* 카드 앞면: 번호, 시리즈, 제목, 날짜. 종이 섬유 결을 아주 옅게. */
  // 카드 그림은 1024×640 좌표로 그리고, 실제 크기(px)는 따로 정한다.
  // 평소: 데스크톱 640×400, 휴대폰 512×320. 고른 카드만 1024×640으로 바꿔 끼운다.
  const LO_W = matchMedia('(max-width: 720px)').matches ? 512 : 640;
  function frontTexture(p, px = LO_W) {
    const w = 1024, h = 640, cv = document.createElement('canvas');
    cv.width = px; cv.height = Math.round(px * 0.625);
    const g = cv.getContext('2d');
    g.scale(px / w, px / w);
    g.fillStyle = C.sheet; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2200; k++) { g.fillStyle = `rgba(110,98,78,${rand() * 0.05})`; g.fillRect(rand() * w, rand() * h, 1 + rand() * 2.5, 1); }
    g.strokeStyle = C.linen; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    const s = SERIES[p.s];
    g.fillStyle = '#857C6D'; g.font = '300 66px Manrope'; g.textBaseline = 'alphabetic'; // 큰 글자 대비 3:1 이상
    g.fillText(String(p.i + 1).padStart(2, '0'), 64, 124);
    g.fillStyle = s.color; g.font = '500 30px "Noto Serif KR"'; g.textAlign = 'right';
    g.fillText(s.name, w - 64, 112);
    g.fillStyle = C.linen; g.fillRect(64, 156, w - 128, 2);
    g.textAlign = 'left'; g.fillStyle = C.ink; g.font = '400 70px "Noto Serif KR"';
    const words = p.title.split(' '); const lines = []; let cur = '';
    for (const word of words) { const t = cur ? cur + ' ' + word : word; if (g.measureText(t).width > w - 128 && cur) { lines.push(cur); cur = word; } else cur = t; }
    lines.push(cur);
    lines.slice(0, 3).forEach((l, k) => g.fillText(l, 64, 262 + k * 96));
    g.fillStyle = C.linen; g.fillRect(64, h - 112, w - 128, 2);
    g.fillStyle = C.caption; g.font = '400 30px Manrope'; g.fillText(p.label, 64, h - 58);
    g.textAlign = 'right'; g.font = '400 30px "Noto Serif KR"'; g.fillText(`${p.ep}편`, w - 64, h - 58);
    return tex(cv);
  }
  /* 카드 뒷면: 공책 줄. */
  const backTex = (() => {
    const w = 512, h = 320, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.fillStyle = C.sheet; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(166,157,141,.45)'; for (let y = 52; y < h; y += 26) g.fillRect(28, y, w - 56, 1);
    g.fillStyle = 'rgba(156,126,94,.35)'; g.fillRect(70, 0, 1, h);
    return tex(cv);
  })();

  /* 나선 배치 */
  const R = 2.9, TURN = 11, STEP = 0.3, TOP = (N - 1) * STEP;
  const RC = 3.5, CSTEP = 1.05;
  const CARD_W = 1.5, CARD_H = 0.94;
  const sAngle = (k) => k * Math.PI / 2;
  const COL_TOP = Math.max(0, ...POSTS.map((p) => (p.ep - 1) * 1.05));
  const cardGeo = new THREE.BoxGeometry(CARD_W, CARD_H, 0.014);
  const tabGeo = new THREE.BoxGeometry(0.3, 0.085, 0.014);

  const cards = POSTS.map((p) => {
    // 조명 대신 종이 그대로(MeshBasic). 깊이는 안개와 각도에 따른 옅은 음영으로만 준다.
    const edge = new THREE.MeshBasicMaterial({ color: '#E9E4D8', transparent: true });
    const front = new THREE.MeshBasicMaterial({ map: frontTexture(p), transparent: true });
    front.userData.lo = front.map;
    const back = new THREE.MeshBasicMaterial({ map: backTex, transparent: true });
    const mesh = new THREE.Mesh(cardGeo, [edge, edge, edge, edge, front, back]);
    const tabMat = new THREE.MeshBasicMaterial({ color: SERIES[p.s].color, transparent: true });
    const tab = new THREE.Mesh(tabGeo, tabMat);
    tab.position.set(-0.56 + p.s * 0.374, CARD_H / 2 + 0.036, 0); // 시리즈마다 다른 자리의 색인 탭
    const group = new THREE.Group(); group.add(mesh, tab); scene.add(group);
    mesh.userData.card = p.i;
    const a0 = p.i * (Math.PI * 2 / TURN);
    return { p, group, mesh, mats: [edge, front, back, tabMat], a0, y0: p.i * STEP, a1: sAngle(p.s), y1: (p.ep - 1) * CSTEP, hover: 0, op: 1 };
  });

  /* 실: 카드 안쪽 가장자리에서 연필까지 */
  const threadGeo = new THREE.BufferGeometry();
  const tPos = new Float32Array(N * 6), tCol = new Float32Array(N * 8);
  threadGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
  threadGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 4));
  scene.add(new THREE.LineSegments(threadGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true })));
  const taupe = new THREE.Color(C.taupe);

  /* 바닥: 원형으로 흐려지는 원고지 칸 */
  const FLOOR = -0.72;
  (() => {
    const n = 2048, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const g = cv.getContext('2d');
    g.strokeStyle = 'rgba(166,157,141,.55)'; g.lineWidth = 2;
    const cell = n / 36;
    for (let k = 0; k <= 36; k++) { g.beginPath(); g.moveTo(k * cell, 0); g.lineTo(k * cell, n); g.stroke(); g.beginPath(); g.moveTo(0, k * cell); g.lineTo(n, k * cell); g.stroke(); }
    g.strokeStyle = 'rgba(79,89,76,.35)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(n / 2, n / 2, R / 20 * n, 0, Math.PI * 2); g.stroke();
    g.globalCompositeOperation = 'destination-in';
    const rg = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.45, 'rgba(0,0,0,.75)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, n, n);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ map: tex(cv), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = FLOOR; scene.add(m);
  })();

  /* 연필: 지우개를 바닥에 두고 서서, 심이 가장 최근 글을 가리킨다.
     깎은 부분은 원뿔이 육각 몸통을 깎아 낸 모양을 그대로 계산한다(칠과 나무 사이의 물결 경계). */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // 연필(Standard 재질)에만 은은한 반사
  const APO = 0.118;                         // 육각 몸통 맞변 반지름(맞변 거리 0.236)
  const SLOPE = 0.25;                        // 깎은 원뿔의 기울기(반지름/길이)
  const LEAD = 0.12;                         // 드러난 심의 길이
  const SHARP = 0.92;                        // 끝부분 조각의 길이
  const hexR = (t) => APO / Math.cos(((t % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6);
  const PAINT = new THREE.Color('#566451'), PAINT_HI = new THREE.Color('#61705B');
  const WOOD = new THREE.Color('#DDBF94'), WOOD_DK = new THREE.Color('#C9A779');
  const GRAPHITE = new THREE.Color('#38383A');
  function hexTube(height, rows, radiusAt, colorAt) {
    const SEG = 132, pos = [], col = [], idx = [];
    for (let j = 0; j <= rows; j++) {
      const d = (j / rows) * height;          // 꼭대기에서 내려온 거리
      for (let i = 0; i <= SEG; i++) {
        const t = (i / SEG) * Math.PI * 2;
        const r = radiusAt(t, d);
        pos.push(Math.sin(t) * r, -d, Math.cos(t) * r);
        const c = colorAt(t, d, r); col.push(c.r, c.g, c.b);
      }
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < SEG; i++) {
      const a = j * (SEG + 1) + i, b = a + SEG + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const faceShade = (t, base, hi) => { const f = Math.floor(((t + Math.PI / 6) % (Math.PI * 2)) / (Math.PI / 3)); return f % 2 ? base : hi; };
  const tmpCol = new THREE.Color();
  const pencilMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.0, envMapIntensity: 0.55 });
  // 끝부분: 심 → 나무 원뿔 → 물결 경계 → 칠한 육각
  const tipGeo = hexTube(SHARP, 120, (t, d) => Math.min(hexR(t), d * SLOPE), (t, d, r) => {
    if (r < hexR(t) - 1e-4) {
      if (d < LEAD) return GRAPHITE;
      const grain = 0.5 + 0.5 * Math.sin(t * 46 + Math.sin(t * 7) * 2 + d * 9);
      return tmpCol.copy(WOOD).lerp(WOOD_DK, grain * 0.45);
    }
    return faceShade(t, PAINT, PAINT_HI);
  });
  const tipMesh = new THREE.Mesh(tipGeo, pencilMat);
  // 몸통: 같은 육각 단면, 길이는 글 수에 따라 늘어난다
  const bodyMesh = new THREE.Mesh(hexTube(1, 1, (t) => hexR(t), (t) => faceShade(t, PAINT, PAINT_HI)), pencilMat);
  // 금박 글자: 한 면에 얇게
  const foil = (() => {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 1400; const g = cv.getContext('2d');
    g.translate(78, 20); g.rotate(Math.PI / 2); g.fillStyle = '#E2CF9E';
    g.font = '500 44px Manrope'; g.fillText('THEREFORE', 0, 0);
    g.font = '400 40px "Noto Serif KR"'; g.fillText('그러므로', 300, 0);
    g.font = '500 40px Manrope'; g.fillText('HB', 500, 0);
    g.fillRect(600, -14, 2, 2);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.09), new THREE.MeshStandardMaterial({ map: tex(cv), transparent: true, metalness: 0.75, roughness: 0.3, envMapIntensity: 1.2 }));
    m.position.set(Math.sin(Math.PI / 6) * (APO + 0.0015), -SHARP - 0.75, Math.cos(Math.PI / 6) * (APO + 0.0015));
    m.rotation.y = Math.PI / 6;
    return m;
  })();
  const tipGroup = new THREE.Group(); tipGroup.add(tipMesh, foil);
  // 금속 고리: 홈이 파인 회전체
  const ferrule = (() => {
    const pts = [new THREE.Vector2(0.135, 0)];
    const grooves = [0.06, 0.1, 0.2, 0.24];
    for (let k = 1; k <= 60; k++) {
      const y = (k / 60) * 0.3;
      const dent = grooves.reduce((m, gy) => Math.max(m, Math.exp(-Math.pow((y - gy) / 0.007, 2))), 0);
      pts.push(new THREE.Vector2(0.142 - dent * 0.008, y));
    }
    pts.push(new THREE.Vector2(0.135, 0.3));
    return new THREE.Mesh(new THREE.LatheGeometry(pts, 72), new THREE.MeshStandardMaterial({ color: '#CFC8B8', metalness: 0.9, roughness: 0.28, envMapIntensity: 1 }));
  })();
  // 지우개: 바닥에 닿는 모서리를 둥글게
  const eraser = (() => {
    const pts = [new THREE.Vector2(0, 0)];
    for (let k = 0; k <= 10; k++) { const a = (k / 10) * Math.PI / 2; pts.push(new THREE.Vector2(0.104 + Math.sin(a) * 0.028, 0.028 - Math.cos(a) * 0.028)); }
    pts.push(new THREE.Vector2(0.132, 0.22), new THREE.Vector2(0, 0.22));
    return new THREE.Mesh(new THREE.LatheGeometry(pts, 64), new THREE.MeshStandardMaterial({ color: '#CDAEA3', roughness: 0.92, envMapIntensity: 0.4 }));
  })();
  const pencil = new THREE.Group(); scene.add(pencil);
  pencil.add(eraser, ferrule, bodyMesh, tipGroup);
  eraser.position.y = FLOOR;
  ferrule.position.y = FLOOR + 0.2;
  function layoutPencil(tipY) {
    const b0 = FLOOR + 0.48, b1 = Math.max(b0 + 0.3, tipY - SHARP);
    tipGroup.position.y = b1 + SHARP;
    bodyMesh.scale.y = b1 - b0; bodyMesh.position.y = b1;
  }

  /* 분필 가루처럼 천천히 떠오르는 점 */
  const dust = (() => {
    const n = 320, pos = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const r = 0.6 + Math.sqrt(rand()) * 6.5, a = rand() * Math.PI * 2; pos.set([Math.sin(a) * r, FLOOR + rand() * (TOP + 3), Math.cos(a) * r], k * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: C.taupe, size: 0.055, map: tex(cv), transparent: true, opacity: 0.6, depthWrite: false }));
    scene.add(pts); return { pts, pos, n };
  })();

  /* 과목별 기둥 아래 이름표 */
  const plates = SERIES.map((s, k) => {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const g = cv.getContext('2d');
    g.fillStyle = s.color; g.fillRect(0, 34, 120, 14);
    g.fillStyle = C.ink; g.font = '400 72px "Noto Serif KR"'; g.fillText(s.name, 0, 140);
    g.fillStyle = C.caption; g.font = '400 40px Manrope'; g.fillText(`${s.topic} · ${s.count}`, 0, 210);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: tex(cv), transparent: true, opacity: 0, depthWrite: false }));
    const a = sAngle(k);
    m.position.set(Math.sin(a) * (RC + 1.15), FLOOR + 0.02, Math.cos(a) * (RC + 1.15));
    m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, a, 0); // 바닥에 누워, 바깥에서 읽힌다
    scene.add(m); return m;
  });

  /* ───────── 상태와 조작 ───────── */
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // 화면 주사율과 무관한 감쇠: 60Hz에서 한 프레임에 k만큼 다가가던 움직임과 같은 빠르기
  const damp = (k, dt) => 1 - Math.pow(1 - k, dt * 60);
  const lerpAngle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
  const MORPH_STAGGER = 0.009, MORPH_DUR = 0.6, MORPH_TOTAL = (N - 1) * MORPH_STAGGER + MORPH_DUR;
  // 쌓이는 연출은 첫 방문에만. 다시 오면 바로 완성된 나선을 보여 준다.
  let seenBefore = false;
  try { seenBefore = localStorage.getItem('therefore-spiral-seen') === '1'; localStorage.setItem('therefore-spiral-seen', '1'); } catch (e) { /* 저장소를 쓸 수 없어도 그대로 동작 */ }
  const st = {
    build: reduced || seenBefore ? N : 0, morphT: 0, mode: 0,
    az: ((N - 1) * (Math.PI * 2 / TURN)) % (Math.PI * 2) - 0.25, azV: 0, azT: null, y: reduced || seenBefore ? TOP : 0, yT: TOP, elev: 0.13, dist: 12, baseDist: 12,
    cardScale: 1, hover: -1, sel: -1, filter: -1, dragging: false, lastInput: -1e9, visible: true,
  };

  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const v = THREE.MathUtils.degToRad(camera.fov) / 2, hh = Math.atan(Math.tan(v) * camera.aspect);
    // 휴대폰처럼 좁은 화면: 나선 양옆이 조금 잘리더라도 앞쪽 카드가 화면 폭의 절반 가까이 되게.
    const narrow = camera.aspect < 0.8;
    st.cardScale = narrow ? 1.15 : 1;
    if (narrow && !st.narrow) st.az = ((N - 1) * (Math.PI * 2 / TURN)) % (Math.PI * 2); // 가장 최근 카드가 정면
    st.narrow = narrow;
    pencil.scale.set(narrow ? 0.7 : 1, 1, narrow ? 0.7 : 1);
    st.baseDist = narrow ? (R - 0.5) / Math.tan(hh) : Math.max(11.5, (R + 1.5) / Math.tan(hh));
  }
  fit(); new ResizeObserver(fit).observe(stage);
  new IntersectionObserver((e) => { st.visible = e[0].isIntersecting; }).observe(stage);

  function setMode(m) {
    st.mode = m; st.sel = -1; st.azT = null;
    document.getElementById('mode-time').setAttribute('aria-pressed', String(m === 0));
    document.getElementById('mode-subject').setAttribute('aria-pressed', String(m === 1));
    ruler.hidden = m === 1;
    if (reduced) st.morphT = m ? MORPH_TOTAL : 0;
    // 과목별 기둥은 두 기둥 사이에서 바라본다(정면에 기둥이 서서 연필을 가리지 않게).
    if (m === 1) { const q = Math.PI / 2; st.azT = Math.round((st.az - q / 2) / q) * q + q / 2; setTimeout(() => { if (st.mode === 1 && st.sel < 0) st.azT = null; }, 1600); }
    showPanel(null);
  }
  document.getElementById('mode-time').onclick = () => setMode(0);
  document.getElementById('mode-subject').onclick = () => setMode(1);
  legend.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const k = +b.dataset.k; st.filter = st.filter === k ? -1 : k;
    legend.classList.toggle('filtered', st.filter >= 0);
    legend.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.k === st.filter)));
  });

  let hiCard = -1;
  function sharpen(i) { // 고른 카드만 선명한 그림으로, 이전 것은 원래대로 돌리고 메모리를 비운다
    if (hiCard >= 0 && hiCard !== i) { const m = cards[hiCard].mats[1]; m.map.dispose(); m.map = m.userData.lo; m.needsUpdate = true; hiCard = -1; }
    if (i >= 0 && hiCard !== i) { const m = cards[i].mats[1]; m.map = frontTexture(cards[i].p, 1024); m.needsUpdate = true; hiCard = i; }
  }
  const announce = stage.querySelector('.announce');
  function select(i) {
    st.sel = i;
    sharpen(i);
    ruler.hidden = st.mode === 1 || (st.narrow && i >= 0); // 휴대폰에서 카드를 고른 동안은 자를 숨긴다
    if (i < 0) { showPanel(null); announce.textContent = ''; return; }
    { const p = POSTS[i]; announce.textContent = `${SERIES[p.s].name} ${p.ep}편, ${p.title}, ${p.label}`; }
    const c = cards[i], k = st.mode;
    st.azT = k ? c.a1 : c.a0;
    st.yT = k ? c.y1 : c.y0;
    showPanel(c.p, true);
  }

  /* 자(ruler): 달마다 긴 눈금, 글마다 짧은 눈금 */
  (() => {
    const bodyEl = ruler.querySelector('.body');
    let lastM = -1;
    POSTS.forEach((p) => {
      const t = document.createElement('span'); const m = p.date.getUTCMonth();
      t.className = 'tick' + (m !== lastM ? ' m' : ''); t.style.bottom = `${p.i / Math.max(1, N - 1) * 100}%`; bodyEl.append(t);
      if (m !== lastM) { const l = document.createElement('span'); l.className = 'lab'; l.textContent = `${m + 1}월`; l.style.bottom = `${p.i / Math.max(1, N - 1) * 100}%`; ruler.append(l); lastM = m; }
    });
    const now = document.createElement('span'); now.className = 'now'; ruler.append(now); st.nowEl = now;
    const setFrom = (e) => { const r = ruler.getBoundingClientRect(); st.yT = clamp(1 - (e.clientY - r.top) / r.height) * TOP; st.sel = -1; st.azT = null; st.lastInput = performance.now(); };
    ruler.addEventListener('pointerdown', (e) => { ruler.setPointerCapture(e.pointerId); setFrom(e); ruler.onpointermove = setFrom; });
    ruler.addEventListener('pointerup', () => { ruler.onpointermove = null; });
  })();

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const meshes = cards.map((c) => c.mesh);
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(meshes)[0];
    return hit ? hit.object.userData.card : -1;
  }
  const cvs = renderer.domElement;
  let down = null;
  cvs.addEventListener('pointerdown', (e) => { st.azV = 0; down = { x: e.clientX, y: e.clientY, moved: 0, type: e.pointerType, t: performance.now() }; st.dragging = true; cvs.classList.add('grabbing'); cvs.setPointerCapture(e.pointerId); });
  cvs.addEventListener('pointermove', (e) => {
    if (down) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y; down.moved += Math.abs(dx) + Math.abs(dy);
      const tNow = performance.now(), vdt = Math.max(0.008, (tNow - down.t) / 1000); down.t = tNow;
      st.azV = (-dx * 0.0042) / vdt; st.az += -dx * 0.0042; st.azT = null;
      if (down.type !== 'touch' && st.mode === 0) { st.yT = clamp(st.yT + dy * 0.012, 0, TOP); }
      down.x = e.clientX; down.y = e.clientY; st.lastInput = performance.now();
      return;
    }
    const i = pick(e); st.hover = i; cvs.classList.toggle('pointing', i >= 0);
    if (st.sel < 0) showPanel(i >= 0 ? POSTS[i] : null, i >= 0);
  });
  const release = (e) => {
    if (!down) return;
    if (down.moved < 6) select(pick(e));
    down = null; st.dragging = false; cvs.classList.remove('grabbing'); st.lastInput = performance.now();
  };
  cvs.addEventListener('pointerup', release);
  cvs.addEventListener('pointercancel', () => { down = null; st.dragging = false; cvs.classList.remove('grabbing'); });
  cvs.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') st.over = true; });
  cvs.addEventListener('pointerleave', () => { st.over = false; if (!down) { st.hover = -1; cvs.classList.remove('pointing'); if (st.sel < 0) showPanel(null); } });
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = st.sel >= 0 ? st.sel : (e.key === 'ArrowDown' ? N - 1 : N - 2);
      select(clamp(cur + (e.key === 'ArrowUp' ? 1 : -1), 0, N - 1));
    } else if (e.key === 'Escape') select(-1);
  });

  /* ───────── 매 프레임 ───────── */
  const v3 = new THREE.Vector3(), nrm = new THREE.Vector3(), dir = new THREE.Vector3();
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!st.visible) return;

    // 처음: 카드가 아래에서부터 한 장씩 쌓이고, 카메라와 연필심이 함께 올라간다.
    if (st.build < N) { st.build = Math.min(N, st.build + dt * 17); st.yT = Math.max(0, (st.build - 1) * STEP); }
    // 시간의 나선 ↔ 과목별 기둥
    if (!reduced) st.morphT = clamp(st.morphT + (st.mode ? dt : -dt), 0, MORPH_TOTAL);
    const mk = st.morphT / MORPH_TOTAL;

    // 카메라
    const idle = !st.dragging && now - st.lastInput > 2600;
    if (st.azT !== null) st.az = lerpAngle(st.az, st.azT, damp(0.07, dt));
    else if (!st.dragging) { st.az += st.azV * dt; st.azV *= Math.exp(-5 * dt); if (idle && !reduced && st.sel < 0 && !st.over && !st.narrow) st.az += dt * 0.07; }
    if (st.mode === 1 && st.sel < 0) st.yT = COL_TOP / 2; // 가장 높은 기둥의 가운데
    st.y += (st.yT - st.y) * (reduced ? 1 : damp(0.07, dt));
    const distT = st.baseDist + (st.mode ? 7 : 0) - (st.sel >= 0 ? (st.narrow ? 2 : 4.2) : 0); // 휴대폰은 카드가 화면 폭의 약 70%가 되는 데서 멈춘다
    st.dist += (distT - st.dist) * damp(0.06, dt);
    const elevT = st.mode ? 0.24 : (st.sel >= 0 ? 0.05 : 0.2);
    st.elev += (elevT - st.elev) * damp(0.06, dt);
    camera.position.set(Math.sin(st.az) * st.dist * Math.cos(st.elev), st.y + Math.sin(st.elev) * st.dist, Math.cos(st.az) * st.dist * Math.cos(st.elev));
    camera.lookAt(0, st.y - (st.mode || st.sel >= 0 ? 0 : 0.9), 0);
    scene.fog.near = st.dist - 2.5; scene.fog.far = st.dist + 11;

    // 카드
    let topY = 0;
    cards.forEach((c, i) => {
      const appear = ease(clamp(st.build - i));
      const k = ease(clamp((st.morphT - i * MORPH_STAGGER) / MORPH_DUR));
      const a = lerpAngle(c.a0, c.a1, k);
      const r = THREE.MathUtils.lerp(R, RC, k) + Math.sin(k * Math.PI) * 0.5;
      let y = THREE.MathUtils.lerp(c.y0, c.y1, k) + Math.sin(k * Math.PI) * 0.2 - (1 - appear) * 1.0;
      const hv = (i === st.hover && !st.dragging) || i === st.sel ? 1 : 0;
      c.hover += (hv - c.hover) * damp(0.16, dt);
      const push = c.hover * (i === st.sel ? 0.55 : 0.3);
      c.group.position.set(Math.sin(a) * (r + push), y, Math.cos(a) * (r + push));
      c.group.rotation.set(0, 0, 0);
      c.group.rotation.y = a;
      c.group.rotateX(-0.07 * (1 - k) - Math.sin(k * Math.PI) * 0.45); // 옮겨 가는 동안만 살짝 젖혀진다
      c.group.scale.setScalar((1 + c.hover * 0.06) * st.cardScale);
      const target = (st.filter < 0 || st.filter === c.p.s ? 1 : 0.1) * appear;
      c.op += (target - c.op) * damp(0.12, dt);
      for (const m of c.mats) { m.opacity = c.op; m.depthWrite = c.op > 0.95; }
      // 각도에 따른 옅은 음영: 정면일수록 밝고, 비스듬할수록 살짝 어둡다.
      c.group.getWorldDirection(nrm); dir.subVectors(camera.position, c.group.position).normalize();
      const shade = 0.84 + 0.16 * Math.abs(nrm.dot(dir));
      c.mats[1].color.setScalar(shade); c.mats[2].color.setScalar(shade * 0.98);
      if (appear > 0.01) topY = Math.max(topY, THREE.MathUtils.lerp(c.y0, c.y1, k));
      // 실
      const ia = i * 6;
      v3.set(Math.sin(a) * (r + push - 0.02), y, Math.cos(a) * (r + push - 0.02));
      tPos[ia] = v3.x; tPos[ia + 1] = v3.y; tPos[ia + 2] = v3.z;
      const pr = 0.14 * pencil.scale.x; tPos[ia + 3] = Math.sin(a) * pr; tPos[ia + 4] = y; tPos[ia + 5] = Math.cos(a) * pr;
      const focus = st.sel >= 0 ? st.sel : st.hover;
      const tie = focus >= 0 ? (cards[focus].p.s === c.p.s ? (i === focus ? 0.75 : 0.4) : 0.02) : (st.filter >= 0 ? (st.filter === c.p.s ? 0.35 : 0) : 0.07);
      c.tie = (c.tie ?? 0.07) + (tie - (c.tie ?? 0.07)) * damp(0.12, dt);
      const al = c.op * c.tie * (1 - k);
      for (const o of [0, 4]) { tCol[i * 8 + o] = taupe.r; tCol[i * 8 + o + 1] = taupe.g; tCol[i * 8 + o + 2] = taupe.b; tCol[i * 8 + o + 3] = al; }
    });
    threadGeo.attributes.position.needsUpdate = true; threadGeo.attributes.color.needsUpdate = true;
    layoutPencil(Math.max(topY, 0) + 0.75);
    plates.forEach((m) => { m.material.opacity = clamp(mk * 1.6 - 0.6); });

    // 가루
    if (!reduced) {
      for (let k = 0; k < dust.n; k++) { const j = k * 3 + 1; dust.pos[j] += dt * (0.05 + (k % 7) * 0.012); if (dust.pos[j] > TOP + 2.5) dust.pos[j] = FLOOR; }
      dust.pts.geometry.attributes.position.needsUpdate = true;
      dust.pts.rotation.y += dt * 0.01;
    }

    if (st.nowEl) st.nowEl.style.bottom = `${(TOP ? clamp(st.y / TOP) : 1) * 100}%`;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  if (location.search.includes('debug')) window.__spiral = { st, select, setMode, TOP, N }; // 스크린샷 확인용

}
