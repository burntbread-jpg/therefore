// THEREFORE 첫 화면: 흩어진 글자 조각이 12칸 원고지에 한 자씩 앉는 장면.
// 3D 문법은 ELSEWHERE 지구본(src/scripts/globe.ts)을 따른다. docs/FAMILY.md 3절 참고.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ROWS = ['인생은 초등학교에서', '배운 것의 복습이란다.'];
const COLS = 12;
const INK = '#24231F';
const TAUPE = 0xa69d8d;
const LINEN = 0xe4e0d6;
const SHEET = 0xfbf9f4;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// 스크린샷과 방문마다 같은 흩어짐을 보이도록 고정 시드 난수를 쓴다.
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function glyphTexture(ch, renderer) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = INK;
  ctx.font = '400 150px "Noto Serif KR", serif';
  if (ch === '.') {
    // 원고지 규칙: 마침표는 칸의 왼쪽 아래.
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('.', 52, 214);
  } else {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, size / 2, size / 2 + 8);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

export async function initManuscript(root) {
  const stage = root.querySelector('.ms-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, {
    enablePan: false, enableDamping: true, dampingFactor: 0.07, enableZoom: false,
    rotateSpeed: 0.55, minPolarAngle: 0.35, maxPolarAngle: Math.PI - 0.35,
    autoRotate: false, autoRotateSpeed: 0.45,
  });

  await document.fonts.load('400 150px "Noto Serif KR"', ROWS.join(''));

  // 원고지: 12칸 × 2줄의 가는 선.
  const W = COLS, H = 2;
  const pts = [];
  for (let y = -1; y <= 1; y++) pts.push(-W / 2, y, 0, W / 2, y, 0);
  for (let x = -W / 2; x <= W / 2; x++) pts.push(x, -1, 0, x, 1, 0);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: TAUPE, transparent: true, opacity: 0 });
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  // 글자 조각.
  const random = rng(20140301);
  const plane = new THREE.PlaneGeometry(0.9, 0.9);
  const edge = new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.96, 0.96));
  const pieces = [];
  ROWS.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === ' ') return;
      const group = new THREE.Group();
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96),
        new THREE.MeshBasicMaterial({ color: SHEET, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      const outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({ color: LINEN, transparent: true }));
      const glyph = new THREE.Mesh(plane,
        new THREE.MeshBasicMaterial({ map: glyphTexture(ch, renderer), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      glyph.position.z = 0.002;
      group.add(sheet, outline, glyph);
      scene.add(group);
      const home = new THREE.Vector3(-W / 2 + c + 0.5, r === 0 ? 0.5 : -0.5, 0);
      const away = new THREE.Vector3((random() - 0.5) * 13, (random() - 0.5) * 6.5, (random() - 0.5) * 6);
      const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(
        (random() - 0.5) * Math.PI * 1.6, (random() - 0.5) * Math.PI * 1.6, (random() - 0.5) * Math.PI));
      pieces.push({ group, sheet, outline, glyph, home, away, spin, order: pieces.length, bounce: -1 });
    });
  });

  // 진행도 T: 0 = 흩어짐, 1 = 원고지에 모두 앉음. 글자마다 출발이 조금씩 늦다.
  const STAGGER = 0.07, TRAVEL = 1.25;
  const total = STAGGER * (pieces.length - 1) + TRAVEL;
  let T = reduced ? total : 0;
  let goal = reduced ? total : 0;
  let speed = 1;
  const settled = () => T >= total - 1e-3;

  const tmpQ = new THREE.Quaternion();
  const identity = new THREE.Quaternion();
  function place(now) {
    let sum = 0;
    for (const p of pieces) {
      const k = ease(clamp((T - p.order * STAGGER) / TRAVEL));
      sum += k;
      p.group.position.lerpVectors(p.away, p.home, k);
      p.group.position.z += Math.sin(k * Math.PI) * 0.8;
      if (p.bounce >= 0) {
        const b = (now - p.bounce) / 650;
        if (b >= 1) p.bounce = -1; else p.group.position.z += Math.sin(b * Math.PI) * 0.7;
      }
      tmpQ.copy(p.spin).slerp(identity, k);
      p.group.quaternion.copy(tmpQ);
      const paper = 1 - k;
      p.sheet.material.opacity = paper;
      p.outline.material.opacity = paper;
    }
    gridMat.opacity = Math.pow(sum / pieces.length, 3);
  }

  // 카메라: 원고지 폭이 화면에 들어오는 거리. 도입은 멀리서 다가온다.
  const front = new THREE.Vector3();
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const hHalf = Math.atan(Math.tan(v) * camera.aspect);
    const pad = camera.aspect > 1 ? 2.2 : 0.5; // 데스크톱은 본문 폭에 맞춰 조금 작게
    const dist = Math.max((W / 2 + pad) / Math.tan(hHalf), (H / 2 + 1.4) / Math.tan(v));
    front.set(0, 0, dist);
    controls.minDistance = controls.maxDistance = dist;
  }
  fit();
  camera.position.copy(front);
  if (!reduced) camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.9).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.25);
  controls.update();
  new ResizeObserver(fit).observe(stage);

  // 손으로 돌린 뒤 잠시 쉬면, 다 모인 원고지는 정면으로 돌아온다(흩어진 동안은 천천히 돈다).
  let dragging = false, lastTouch = performance.now();
  controls.addEventListener('start', () => { dragging = true; });
  controls.addEventListener('end', () => { dragging = false; lastTouch = performance.now(); });

  // 글자를 누르면 그 조각만 들렸다가 다시 앉는다.
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || reduced) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(pieces.map((p) => p.glyph))[0];
    const p = hit && pieces.find((q) => q.glyph === hit.object);
    if (p) p.bounce = performance.now();
  });

  // '다시 맞추기': 흩었다가 다시 원고지에 앉힌다.
  let replayAt = -1;
  const replay = root.querySelector('[data-ms-replay]');
  if (replay) {
    if (reduced) replay.hidden = true;
    replay.addEventListener('click', () => { goal = 0; speed = 2.2; replayAt = -1; });
  }

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(stage);

  // 첫 방문: 0.7초 뒤 모이기 시작.
  const startAt = performance.now() + 700;
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    if (!reduced && now > startAt && goal === 0 && replayAt < 0 && T === 0) goal = total;
    if (goal === 0 && T === 0 && speed > 1) { // 다 흩어진 뒤 잠깐 멈췄다가 다시 모인다.
      if (replayAt < 0) replayAt = now + 600;
      else if (now > replayAt) { goal = total; speed = 1; replayAt = -1; }
    }
    if (T !== goal) T = goal > T ? Math.min(goal, T + dt * speed) : Math.max(goal, T - dt * speed);
    place(now);
    const idle = !dragging && now - lastTouch > 1400;
    controls.autoRotate = !reduced && !settled() && !dragging;
    if (settled() && idle) {
      camera.position.lerp(front, 0.035);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  // 시안 스크린샷용: 진행도를 직접 정한다(0~1).
  window.__manuscript = {
    set(v) { T = goal = clamp(v) * total; speed = 1; replayAt = -1; },
    front() { camera.position.copy(front); controls.update(); },
  };

  root.querySelector('.ms-fallback').hidden = true;
  root.dataset.ready = 'true';
}
