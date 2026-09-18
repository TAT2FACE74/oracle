(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const LANES = 4;
  const ROAD_L = W * 0.11;
  const ROAD_R = W * 0.89;
  const ROAD_W = ROAD_R - ROAD_L;
  const LANE_W = ROAD_W / LANES;
  const GOAL = 3800;

  function loadImg(src) {
    const im = new Image();
    im.src = src;
    return im;
  }

  const sprites = {
    player: loadImg('assets/player.png'),
    suv: loadImg('assets/car-suv.png'),
    muscle: loadImg('assets/car-muscle.png'),
    wanted: loadImg('assets/wanted.png'),
  };

  let mode = 'title';
  let lives = 3;
  let score = 0;
  let distance = 0;
  let scroll = 0;
  let cars = [];
  let smears = [];
  let spawnT = 0;
  let deathT = 0;
  let flash = 0;
  let invuln = 0;

  const player = { lane: 1.5, y: H * 0.82, w: 48, h: 78 };
  const held = new Set();

  let muted = false;
  let audioCtx = null;
  let siren = null;

  function laneX(lane) {
    return ROAD_L + LANE_W * (lane + 0.5);
  }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function startSiren() {
    if (muted || siren) return;
    ensureAudio();
    const g = audioCtx.createGain();
    g.gain.value = 0.04;
    g.connect(audioCtx.destination);
    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.value = 680;
    o2.frequency.value = 900;
    const lfo = audioCtx.createOscillator();
    const lg = audioCtx.createGain();
    lfo.frequency.value = 1.7;
    lg.gain.value = 170;
    lfo.connect(lg);
    lg.connect(o1.frequency);
    lg.connect(o2.frequency);
    o1.connect(g);
    o2.connect(g);
    o1.start();
    o2.start();
    lfo.start();
    siren = { g, o1, o2, lfo };
  }

  function stopSiren() {
    if (!siren) return;
    try {
      siren.o1.stop();
      siren.o2.stop();
      siren.lfo.stop();
      siren.g.disconnect();
    } catch (e) {}
    siren = null;
  }

  function thud() {
    try {
      ensureAudio();
      const n = Math.floor(audioCtx.sampleRate * 0.12);
      const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.22));
      const s = audioCtx.createBufferSource();
      const g = audioCtx.createGain();
      g.gain.value = muted ? 0 : 0.22;
      s.buffer = buf;
      s.connect(g);
      g.connect(audioCtx.destination);
      s.start();
    } catch (e) {}
  }

  function showOverlay(title, sub, body, btn) {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('ovTitle').textContent = title;
    document.getElementById('ovSub').textContent = sub;
    document.getElementById('ovBody').textContent = body;
    document.getElementById('startBtn').textContent = btn;
  }

  function hideOverlay() {
    document.getElementById('overlay').classList.add('hidden');
  }

  function updateHud() {
    document.getElementById('livesEl').textContent =
      '❤'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, 3 - lives));
    document.getElementById('progEl').textContent =
      'BORDER ' + Math.min(100, Math.floor((distance / GOAL) * 100)) + '%';
    document.getElementById('scoreEl').textContent = 'SCORE ' + score;
  }

  function resetGame(full) {
    if (full) {
      lives = 3;
      score = 0;
      distance = 0;
      scroll = 0;
      smears = [];
    }
    cars = [];
    player.lane = 1.5;
    player.y = H * 0.82;
    invuln = 1.3;
    spawnT = 0.3;
    deathT = 0;
    flash = 0;
    mode = 'play';
    startSiren();
    hideOverlay();
    if (window.matchMedia('(pointer: coarse)').matches) {
      document.getElementById('pad').classList.add('show');
    }
    updateHud();
  }

  function spawnCar() {
    const lane = Math.floor(Math.random() * LANES);
    for (const c of cars) {
      if (c.lane === lane && c.y < 150) return;
    }
    const kind = Math.random() < 0.55 ? 'suv' : 'muscle';
    cars.push({
      lane,
      x: laneX(lane),
      y: -90 - Math.random() * 50,
      w: kind === 'suv' ? 64 : 68,
      h: kind === 'suv' ? 86 : 52,
      speed: 2.6 + Math.random() * 2.4 + Math.min(3.2, distance / 1100),
      kind,
      phase: Math.random() * 6.28,
    });
  }

  function overlap(a, b) {
    const ax = a.x - a.w * 0.28;
    const ay = a.y - a.h * 0.3;
    const aw = a.w * 0.56;
    const ah = a.h * 0.5;
    const bx = b.x - b.w * 0.32;
    const by = b.y - b.h * 0.35;
    const bw = b.w * 0.64;
    const bh = b.h * 0.5;
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function killPlayer() {
    smears.push({
      x: laneX(player.lane),
      y: player.y + scroll,
      w: 40 + Math.random() * 22,
      h: 75 + Math.random() * 45,
      rot: (Math.random() - 0.5) * 0.7,
    });
    lives -= 1;
    flash = 0.5;
    mode = 'dying';
    deathT = 1.15;
    thud();
    updateHud();
  }

  function update(dt) {
    if (mode !== 'play' && mode !== 'dying') return;
    if (flash > 0) flash -= dt;
    if (invuln > 0) invuln -= dt;

    if (mode === 'dying') {
      deathT -= dt;
      for (const c of cars) c.y += c.speed * 60 * dt;
      if (deathT <= 0) {
        if (lives <= 0) {
          mode = 'lose';
          stopSiren();
          document.getElementById('pad').classList.remove('show');
          showOverlay(
            'BUSTED',
            'Game Over',
            'Three blood smears on the asphalt. The chase is over.',
            'TRY AGAIN'
          );
        } else {
          cars = [];
          player.lane = 1.5;
          player.y = H * 0.82;
          invuln = 1.6;
          mode = 'play';
        }
      }
      return;
    }

    let mx = 0;
    let my = 0;
    if (held.has('ArrowLeft') || held.has('a') || held.has('left')) mx -= 1;
    if (held.has('ArrowRight') || held.has('d') || held.has('right')) mx += 1;
    if (held.has('ArrowUp') || held.has('w') || held.has('up')) my -= 1;
    if (held.has('ArrowDown') || held.has('s') || held.has('down')) my += 1;

    player.lane = Math.max(0, Math.min(LANES - 0.02, player.lane + mx * 3.4 * dt));
    player.y = Math.max(H * 0.26, Math.min(H * 0.9, player.y + my * 170 * dt));

    const adv = (my < 0 ? 150 : 40) * dt;
    distance += adv;
    scroll += adv;
    score = Math.floor(distance / 4);

    spawnT -= dt;
    if (spawnT <= 0) {
      spawnCar();
      if (Math.random() < 0.4) spawnCar();
      spawnT = Math.max(0.26, 0.82 - distance / 4800);
    }

    const box = { x: laneX(player.lane), y: player.y, w: player.w, h: player.h };
    for (let i = cars.length - 1; i >= 0; i--) {
      const c = cars[i];
      c.y += c.speed * 60 * dt;
      c.x = laneX(c.lane);
      c.phase += dt * 11;
      if (c.y > H + 120) {
        cars.splice(i, 1);
        continue;
      }
      if (invuln <= 0 && overlap(box, c)) {
        killPlayer();
        break;
      }
    }

    if (distance >= GOAL) {
      mode = 'win';
      stopSiren();
      document.getElementById('pad').classList.remove('show');
      showOverlay(
        '¡MÉXICO!',
        'You made it',
        'Crossed with ' + lives + ' life' + (lives === 1 ? '' : 'ves') + ' left. Score ' + score + '.',
        'RUN AGAIN'
      );
    }
    updateHud();
  }

  function drawRoad() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#c4a574');
    g.addColorStop(1, '#7a5a32');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2b2b2f';
    ctx.fillRect(ROAD_L - 10, 0, ROAD_W + 20, H);
    ctx.fillStyle = '#1e1e22';
    ctx.fillRect(ROAD_L, 0, ROAD_W, H);
    ctx.strokeStyle = '#d4c56a';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 16]);
    ctx.lineDashOffset = scroll * 0.95;
    for (let i = 1; i < LANES; i++) {
      const x = ROAD_L + LANE_W * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ROAD_L, 0);
    ctx.lineTo(ROAD_L, H);
    ctx.moveTo(ROAD_R, 0);
    ctx.lineTo(ROAD_R, H);
    ctx.stroke();

    const remain = GOAL - distance;
    if (remain < 950) {
      const t = 1 - remain / 950;
      ctx.fillStyle = 'rgba(0,110,55,' + (0.4 + t * 0.35) + ')';
      ctx.fillRect(0, 0, W, 72 + t * 36);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🇲🇽  MÉXICO  🇲🇽', W / 2, 42 + t * 10);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      for (let x = 8; x < W; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 58 + t * 24);
        ctx.lineTo(x, 88 + t * 34);
        ctx.stroke();
      }
    }
  }

  function drawSmears() {
    for (const s of smears) {
      const sy = s.y - scroll;
      if (sy < -140 || sy > H + 140) continue;
      ctx.save();
      ctx.translate(s.x, sy);
      ctx.rotate(s.rot);
      ctx.fillStyle = 'rgba(110,6,10,0.93)';
      ctx.beginPath();
      ctx.ellipse(0, 0, s.w * 0.55, s.h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(150,18,22,0.88)';
      ctx.beginPath();
      ctx.ellipse(5, 12, s.w * 0.34, s.h * 0.52, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(130,8,12,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.quadraticCurveTo(6, 28, 10, s.h * 0.55);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCar(c) {
    const im = c.kind === 'suv' ? sprites.suv : sprites.muscle;
    ctx.save();
    ctx.translate(c.x, c.y);
    if (im.complete && im.naturalWidth) ctx.drawImage(im, -c.w / 2, -c.h / 2, c.w, c.h);
    else {
      ctx.fillStyle = '#111';
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    }
    const blink = Math.sin(c.phase) > 0;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = blink ? 'rgba(255,40,40,.6)' : 'rgba(50,90,255,.6)';
    ctx.beginPath();
    ctx.arc(-14, -c.h * 0.32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blink ? 'rgba(50,90,255,.6)' : 'rgba(255,40,40,.6)';
    ctx.beginPath();
    ctx.arc(14, -c.h * 0.32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlayer() {
    const px = laneX(player.lane);
    if (mode === 'dying') {
      ctx.save();
      ctx.translate(px, player.y);
      ctx.scale(1.5, 0.22);
      ctx.globalAlpha = 0.9;
      if (sprites.player.complete) ctx.drawImage(sprites.player, -32, -42, 64, 84);
      ctx.fillStyle = 'rgba(140,0,10,.75)';
      ctx.beginPath();
      ctx.ellipse(0, 24, 44, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (invuln > 0 && Math.floor(invuln * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(px, player.y);
    if (sprites.player.complete && sprites.player.naturalWidth) {
      ctx.drawImage(sprites.player, -player.w / 2, -player.h / 2, player.w, player.h);
    } else {
      ctx.fillStyle = '#e85d04';
      ctx.fillRect(-18, -32, 36, 64);
    }
    ctx.restore();
  }

  function draw() {
    drawRoad();
    drawSmears();
    if (sprites.wanted.complete && sprites.wanted.naturalWidth) {
      const y = ((scroll * 0.25) % (H + 220)) - 110;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(sprites.wanted, W - 68, y, 50, 50);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#c9a227';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('WANTED', W - 64, y + 56);
    }
    for (const c of cars) drawCar(c);
    if (mode === 'play' || mode === 'dying') drawPlayer();
    if (flash > 0) {
      ctx.fillStyle = 'rgba(170,0,0,' + flash + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  let last = performance.now();
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener('keydown', (e) => {
    held.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });

  document.querySelectorAll('#pad button').forEach((btn) => {
    const d = btn.getAttribute('data-dir');
    const on = (e) => { e.preventDefault(); held.add(d); };
    const off = (e) => { e.preventDefault(); held.delete(d); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  });

  document.getElementById('startBtn').onclick = () => {
    ensureAudio();
    resetGame(true);
  };
  document.getElementById('muteBtn').onclick = () => {
    muted = !muted;
    document.getElementById('muteBtn').textContent = muted ? '🔇 MUTED' : '🔊 SIRENS';
    if (muted) stopSiren();
    else if (mode === 'play') startSiren();
  };

  if (window.matchMedia('(pointer: coarse)').matches) {
    document.getElementById('pad').classList.add('show');
  }
  updateHud();
})();
