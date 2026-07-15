const isTouch = window.matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch-device');

// ─── CURSOR ──────────────────────────────────────────────
const cursor = document.querySelector('.custom-cursor');

if (!isTouch) {
  document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
  document.addEventListener('mousedown', () => { cursor.style.transform = 'translate(-50%,-50%) scale(0.8)'; });
  document.addEventListener('mouseup', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; });
  document.querySelectorAll('a, button, .theme-button, .badge, .profile-picture, .social-icon').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width = '48px'; cursor.style.height = '48px'; });
    el.addEventListener('mouseleave', () => { cursor.style.width = '40px'; cursor.style.height = '40px'; });
  });
}

// ─── AUDIO ENGINE ────────────────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const master = audioCtx.createGain();
master.gain.value = 0.1;
master.connect(audioCtx.destination);

let currentAudio = null;

function stopAudio() {
  if (currentAudio) {
    try { currentAudio.nodes.forEach(n => { try { n.stop(); } catch(e) {} }); } catch(e) {}
    if (currentAudio.int) clearInterval(currentAudio.int);
    currentAudio = null;
  }
}

function playTheme(type) {
  stopAudio();
  const now = audioCtx.currentTime;
  const ctx = { nodes: [] };

  if (type === 'home') {
    const o = audioCtx.createOscillator();
    o.type = 'sine'; o.frequency.value = 220;
    const g = audioCtx.createGain(); g.gain.value = 0.08;
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.3;
    o.connect(g); g.connect(master); lfo.connect(g.gain);
    o.start(); lfo.start();
    ctx.nodes = [o, lfo];
  } else if (type === 'hacker') {
    const seq = [200, 250, 300, 267, 233, 283, 317, 250];
    let i = 0;
    ctx.int = setInterval(() => {
      const o = audioCtx.createOscillator();
      o.type = 'square'; o.frequency.value = seq[i % seq.length];
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      o.connect(g).connect(master);
      o.start(); o.stop(audioCtx.currentTime + 0.08);
      ctx.nodes.push(o);
      if (i % 4 === 0) {
        const n = audioCtx.createOscillator();
        n.type = 'sawtooth'; n.frequency.value = 80;
        const ng = audioCtx.createGain();
        ng.gain.setValueAtTime(0.03, audioCtx.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        n.connect(ng).connect(master);
        n.start(); n.stop(audioCtx.currentTime + 0.15);
        ctx.nodes.push(n);
      }
      i++;
    }, 150);
  } else if (type === 'rain') {
    const o = audioCtx.createOscillator();
    o.type = 'sine'; o.frequency.value = 180;
    const g = audioCtx.createGain(); g.gain.value = 0.05;
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    o.connect(g).connect(master); lfo.connect(g.gain);
    o.start(); lfo.start();
    ctx.nodes = [o, lfo];
    // noise burst
    ctx.int = setInterval(() => {
      if (Math.random() > 0.6) return;
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.02, audioCtx.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
      src.connect(ng).connect(master);
      src.start(); ctx.nodes.push(src);
    }, 200);
  } else if (type === 'snow') {
    const o = audioCtx.createOscillator();
    o.type = 'sine'; o.frequency.value = 300;
    const g = audioCtx.createGain(); g.gain.value = 0.04;
    const lfo = audioCtx.createOscillator();
    lfo.type = 'triangle'; lfo.frequency.value = 0.15;
    o.connect(g).connect(master); lfo.connect(g.gain);
    o.start(); lfo.start();
    ctx.nodes = [o, lfo];
  } else if (type === 'dark') {
    const o = audioCtx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = 55;
    const g = audioCtx.createGain(); g.gain.value = 0.03;
    o.connect(g).connect(master); o.start();
    const o2 = audioCtx.createOscillator();
    o2.type = 'sine'; o2.frequency.value = 110;
    const g2 = audioCtx.createGain(); g2.gain.value = 0.02;
    o2.connect(g2).connect(master); o2.start();
    ctx.nodes = [o, o2];
  }

  currentAudio = ctx;
}

// ─── BACKGROUND CANVAS ───────────────────────────────────
const bg = document.getElementById('background');
const bctx = bg.getContext('2d');
let bw, bh, dots = [];

function resizeBg() { bw = bg.width = innerWidth; bh = bg.height = innerHeight; }
resizeBg(); addEventListener('resize', resizeBg);
for (let i = 70; i--;) dots.push({ x: Math.random() * bw, y: Math.random() * bh, vx: (Math.random() - .5) * 0.2, vy: (Math.random() - .5) * 0.2, r: Math.random() * 2 + .5, a: Math.random() * 0.15 + .05 });

(function anim() {
  bctx.clearRect(0, 0, bw, bh);
  dots.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = bw; if (p.x > bw) p.x = 0; if (p.y < 0) p.y = bh; if (p.y > bh) p.y = 0;
    bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 6);
    bctx.fillStyle = `rgba(255,255,255,${p.a})`; bctx.fill();
  });
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        bctx.beginPath(); bctx.moveTo(dots[i].x, dots[i].y); bctx.lineTo(dots[j].x, dots[j].y);
        bctx.strokeStyle = `rgba(255,255,255,${.012 * (1 - d / 100)})`; bctx.lineWidth = .5; bctx.stroke();
      }
    }
  }
  requestAnimationFrame(anim);
})();

// ─── OVERLAYS ────────────────────────────────────────────
const hc = document.getElementById('hacker-overlay');
const hctx = hc.getContext('2d');
const sc = document.getElementById('snow-overlay');
const sctx = sc.getContext('2d');
let hw, hh, mCols, mDrops, snowflakes = [];

function resizeO() { hw = hc.width = sc.width = innerWidth; hh = hc.height = sc.height = innerHeight; }
resizeO(); addEventListener('resize', resizeO);
mCols = Math.floor(hw / 14); mDrops = Array(mCols).fill(0);
for (let i = 120; i--;) snowflakes.push({ x: Math.random() * hw, y: Math.random() * hh, r: Math.random() * 4 + 1, s: Math.random() * 2 + 0.5, o: Math.random() * 0.4 + 0.1 });

let mInt = null, sInt = null;

function startMatrix() {
  hc.classList.remove('hidden'); mCols = Math.floor(hw / 14); mDrops = Array(mCols).fill(0);
  if (mInt) clearInterval(mInt);
  mInt = setInterval(() => {
    hctx.fillStyle = 'rgba(0,0,0,0.05)'; hctx.fillRect(0, 0, hw, hh);
    hctx.fillStyle = 'rgba(255,255,255,0.04)'; hctx.font = '13px monospace';
    for (let i = 0; i < mCols; i++) {
      hctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), i * 14, mDrops[i] * 14);
      if (mDrops[i] * 14 > hh && Math.random() > 0.975) mDrops[i] = 0;
      mDrops[i]++;
    }
  }, 50);
}

function startSnow() {
  sc.classList.remove('hidden');
  if (sInt) clearInterval(sInt);
  sInt = setInterval(() => {
    sctx.clearRect(0, 0, hw, hh);
    snowflakes.forEach(f => {
      f.y += f.s; f.x += Math.sin(f.y * 0.01) * 0.3;
      if (f.y > hh) { f.y = -10; f.x = Math.random() * hw; }
      sctx.beginPath(); sctx.arc(f.x, f.y, f.r, 0, 6);
      sctx.fillStyle = `rgba(255,255,255,${f.o})`; sctx.fill();
    });
  }, 25);
}

function stopO() {
  if (mInt) { clearInterval(mInt); mInt = null; }
  if (sInt) { clearInterval(sInt); sInt = null; }
  hc.classList.add('hidden'); sc.classList.add('hidden');
  hctx.clearRect(0, 0, hw, hh); sctx.clearRect(0, 0, hw, hh);
}

// ─── START SCREEN ────────────────────────────────────────
const ss = document.getElementById('start-screen');
const st = document.getElementById('start-text');
const pn = document.getElementById('profile-name');
const pb = document.getElementById('profile-bio');
const vc = document.getElementById('visitor-count');
const pbBlock = document.getElementById('profile-block');
const skBlock = document.getElementById('skills-block');
const pc = document.querySelector('.profile-container');
const pp = document.querySelector('.profile-picture');
const go = document.querySelector('.glitch-overlay');

let v = parseInt(localStorage.getItem('zc_v') || '921234');
if (!localStorage.getItem('zc_visited')) { v++; localStorage.setItem('zc_v', v); localStorage.setItem('zc_visited', '1'); }
vc.textContent = v.toLocaleString();

const sm = 'Click here to see the motion baby';
let si = 0, sc = true;

(function ts() {
  if (si < sm.length) si++;
  st.textContent = sm.slice(0, si) + (sc ? '|' : ' ');
  setTimeout(ts, 100);
})();

setInterval(() => { sc = !sc; st.textContent = sm.slice(0, si) + (sc ? '|' : ' '); }, 500);

// ─── NAME TYPING ─────────────────────────────────────────
const nm = 'z c';
let ni = 0, nd = false, nc = true;

(function tn() {
  if (!nd && ni < nm.length) ni++;
  else if (nd && ni > 0) ni--;
  else if (ni === nm.length) { nd = true; setTimeout(tn, 10000); return; }
  else if (ni === 0) nd = false;
  pn.textContent = nm.slice(0, ni) + (nc ? '|' : ' ');
  if (Math.random() < 0.05) { pn.classList.add('glitch'); setTimeout(() => pn.classList.remove('glitch'), 200); }
  setTimeout(tn, nd ? 150 : 300);
})();

setInterval(() => { nc = !nc; }, 500);

// ─── BIO TYPING ──────────────────────────────────────────
const bios = ["z c", "mon blaze", "noir & blanc"];
let bm = 0, bi = 0, bd = false, bc = true;

(function tb() {
  const l = bios[bm];
  if (!bd && bi < l.length) bi++;
  else if (bd && bi > 0) bi--;
  else if (bi === l.length) { bd = true; setTimeout(tb, 2000); return; }
  else if (bi === 0 && bd) { bd = false; bm = (bm + 1) % bios.length; }
  pb.textContent = l.slice(0, bi) + (bc ? '|' : ' ');
  if (Math.random() < 0.05) { pb.classList.add('glitch'); setTimeout(() => pb.classList.remove('glitch'), 200); }
  setTimeout(tb, bd ? 75 : 150);
})();

setInterval(() => { bc = !bc; }, 500);

// ─── REVEAL ──────────────────────────────────────────────
function reveal() {
  ss.classList.add('hidden');
  pbBlock.classList.remove('hidden');
  gsap.fromTo(pbBlock, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', onComplete: () => { pc.style.animation = 'orbit 3s linear infinite'; } });
  tn();
  tb();
  playTheme('home');
  // cursor trail
  if (!isTouch) {
    try {
      class CursorTrail {
        constructor(opts) {
          this.len = opts.length || 10;
          this.size = opts.size || 8;
          this.spd = opts.speed || 0.2;
          this.pts = [];
          this.el = document.createElement('div');
          this.el.className = 'cursor-trail';
          document.body.appendChild(this.el);
          for (let i = 0; i < this.len; i++) {
            const d = document.createElement('div');
            d.className = 'cursor-trail-dot';
            d.style.width = this.size + 'px'; d.style.height = this.size + 'px';
            d.style.opacity = (1 - i / this.len) * 0.5;
            this.el.appendChild(d);
            this.pts.push({ el: d, x: 0, y: 0 });
          }
          document.addEventListener('mousemove', e => { this.pts[0].x = e.clientX; this.pts[0].y = e.clientY; });
          this.update();
        }
        update() {
          for (let i = this.pts.length - 1; i > 0; i--) {
            this.pts[i].x += (this.pts[i - 1].x - this.pts[i].x) * this.spd;
            this.pts[i].y += (this.pts[i - 1].y - this.pts[i].y) * this.spd;
            this.pts[i].el.style.left = this.pts[i].x + 'px';
            this.pts[i].el.style.top = this.pts[i].y + 'px';
          }
          requestAnimationFrame(() => this.update());
        }
      }
      new CursorTrail({ length: 12, size: 7, speed: 0.18 });
    } catch (e) {}
  }
  // periodic glitch
  setInterval(() => {
    if (Math.random() > 0.6) { go.style.opacity = '0.15'; setTimeout(() => go.style.opacity = '0', 200); }
  }, 5000);
}

ss.addEventListener('click', reveal);
ss.addEventListener('touchstart', e => { e.preventDefault(); reveal(); });

// ─── FAST ORBIT ──────────────────────────────────────────
pp.addEventListener('click', () => {
  pc.classList.remove('fast-orbit'); pc.style.animation = 'none'; void pc.offsetWidth;
  pc.classList.add('fast-orbit');
  setTimeout(() => { pc.classList.remove('fast-orbit'); void pc.offsetWidth; pc.style.animation = 'orbit 3s linear infinite'; }, 500);
});

// ─── 3D TILT ─────────────────────────────────────────────
if (!isTouch) {
  pbBlock.addEventListener('mousemove', e => {
    const r = pbBlock.getBoundingClientRect();
    gsap.to(pbBlock, { rotationX: (e.clientY - r.top - r.height / 2) / r.height * 8, rotationY: -(e.clientX - r.left - r.width / 2) / r.width * 8, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
  });
  pbBlock.addEventListener('mouseleave', () => { gsap.to(pbBlock, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power2.out' }); });
}

// ─── SKILLS TOGGLE ───────────────────────────────────────
const rb = document.getElementById('results-theme');
const rh = document.getElementById('results-hint');
const rc = document.getElementById('results-button-container');
let sk = false;

function toggleSkills() {
  if (!sk) {
    gsap.to(pbBlock, { x: -100, opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
      pbBlock.classList.add('hidden'); skBlock.classList.remove('hidden');
      gsap.fromTo(skBlock, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      document.querySelectorAll('.skill-bar').forEach(b => { b.style.width = b.dataset.w + '%'; });
    } });
    rh.classList.remove('hidden'); sk = true;
  } else {
    gsap.to(skBlock, { x: 100, opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
      skBlock.classList.add('hidden'); pbBlock.classList.remove('hidden');
      gsap.fromTo(pbBlock, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    } });
    rh.classList.add('hidden'); sk = false;
  }
}

rb.addEventListener('click', toggleSkills);

// ─── THEME SWITCHING ─────────────────────────────────────
const themeBtns = document.querySelectorAll('.theme-button');
const themes = ['home', 'hacker', 'rain', 'snow', 'dark'];

themeBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    themeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchTheme(themes[i]);
  });
});

function switchTheme(theme) {
  stopO();
  document.body.className = theme + '-theme';

  if (theme === 'hacker') { startMatrix(); rc.classList.remove('hidden'); playTheme('hacker'); }
  else if (theme === 'rain') { startMatrix(); playTheme('rain'); }
  else if (theme === 'snow') { startSnow(); rc.classList.remove('hidden'); playTheme('snow'); }
  else if (theme === 'dark') { playTheme('dark'); hideSkills(); }
  else { playTheme('home'); hideSkills(); }

  go.style.opacity = '0.3';
  setTimeout(() => go.style.opacity = '0', 200);
}

function hideSkills() {
  rc.classList.add('hidden');
  if (sk) { skBlock.classList.add('hidden'); pbBlock.classList.remove('hidden'); gsap.set(pbBlock, { opacity: 1, x: 0 }); sk = false; rh.classList.add('hidden'); }
}

// ─── VOLUME ──────────────────────────────────────────────
const vs = document.getElementById('volume-slider');
const vi = document.getElementById('volume-icon');
let muted = false;

vs.addEventListener('input', () => { master.gain.value = parseFloat(vs.value) * 0.1; muted = false; });

vi.addEventListener('click', () => {
  muted = !muted;
  master.gain.value = muted ? 0 : parseFloat(vs.value) * 0.1;
  vi.innerHTML = muted
    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>'
    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>';
});

// ─── TRANSPARENCY ────────────────────────────────────────
const ts = document.getElementById('transparency-slider');
ts.addEventListener('input', () => {
  const o = ts.value;
  pbBlock.style.background = `rgba(0,0,0,${o})`;
  skBlock.style.background = `rgba(0,0,0,${o})`;
});
