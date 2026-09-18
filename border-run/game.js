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

  const player = { lane: 1.5, y: H * 0.82, w: 58, h: 96 };
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


  /** Public-domain folk melody — mariachi-ish synth fanfare on win. */
  let winMusicTimer = null;
  let winNodes = [];
  function stopWinMusic() {
    if (winMusicTimer) {
      clearTimeout(winMusicTimer);
      winMusicTimer = null;
    }
    for (const n of winNodes) {
      try { n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    }
    winNodes = [];
  }
  function playLaCucaracha() {
    // Mute button is for sirens only — always play the border fanfare.
    stopWinMusic();
    ensureAudio();
    const kickOff = () => {
      if (!audioCtx) return;
      // Note freqs (Hz). Melody of La Cucaracha (traditional).
      const N = {
        C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23,
        G4: 392.0, A4: 440.0, Bb4: 466.16, C5: 523.25, D5: 587.33, Eb5: 622.25, F5: 698.46, G5: 783.99,
        Bb3: 233.08, C3: 130.81, F3: 174.61, G3: 196.0,
      };
      // Classic La Cucaracha phrasing (public domain)
      const phrase = [
        [N.F4, 1], [N.F4, 1], [N.F4, 1], [N.C4, 1],
        [N.D4, 1], [N.D4, 1], [N.D4, 1], [N.Bb3, 1],
        [N.C4, 1], [N.D4, 1], [N.Eb4, 1], [N.F4, 1],
        [N.G4, 1], [N.G4, 1], [N.G4, 2],
        [null, 1],
        [N.F4, 1], [N.F4, 1], [N.F4, 1], [N.C4, 1],
        [N.D4, 1], [N.D4, 1], [N.D4, 1], [N.Bb3, 1],
        [N.C4, 1], [N.Eb4, 1], [N.D4, 1], [N.C4, 2],
        [null, 1],
        [N.G4, 1], [N.G4, 1], [N.G4, 1], [N.Eb4, 1],
        [N.F4, 1], [N.F4, 1], [N.F4, 1], [N.D4, 1],
        [N.C4, 1], [N.D4, 1], [N.Eb4, 1], [N.F4, 1],
        [N.G4, 1], [N.G4, 1], [N.G4, 2],
        [null, 1],
        [N.C5, 1], [N.C5, 1], [N.Bb4, 1], [N.A4, 1],
        [N.G4, 1], [N.F4, 1], [N.Eb4, 1], [N.D4, 1],
        [N.C4, 2], [N.G4, 1], [N.C5, 3],
      ];
      const beat = 0.2;
      const master = audioCtx.createGain();
      // Louder — was nearly inaudible on phones under the siren duck
      master.gain.value = 0.38;
      master.connect(audioCtx.destination);

      const bassNotes = [N.F3, N.F3, N.G3, N.G3, N.C3, N.C3, N.F3, N.F3];
      let t = audioCtx.currentTime + 0.05;
      for (let i = 0; i < 20; i++) {
        const f = bassNotes[i % bassNotes.length];
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 2);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + beat * 2 + 0.02);
        winNodes.push(o);
        t += beat * 2;
      }

      t = audioCtx.currentTime + 0.05;
      for (const [freq, beats] of phrase) {
        if (freq) {
          for (const [type, detune, vol] of [['square', 0, 0.22], ['sawtooth', 8, 0.1], ['triangle', -5, 0.08]]) {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            const f = audioCtx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 2800;
            o.type = type;
            o.frequency.value = freq;
            o.detune.value = detune;
            const dur = beats * beat;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.04, dur * 0.9));
            o.connect(f); f.connect(g); g.connect(master);
            o.start(t); o.stop(t + dur + 0.04);
            winNodes.push(o);
          }
        }
        t += beats * beat;
      }
      const ms = Math.max(500, (t - audioCtx.currentTime) * 1000 + 80);
      winMusicTimer = setTimeout(() => { winMusicTimer = null; winNodes = []; }, ms);
    };

    // iOS / Chrome often leave AudioContext suspended until resume() finishes.
    // Scheduling notes before that makes the whole fanfare silent.
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(kickOff).catch(kickOff);
      } else {
        kickOff();
      }
    } catch (e) {
      try { kickOff(); } catch (e2) {}
    }
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
    stopWinMusic();
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
    document.getElementById('pad').classList.add('show');
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
          player.y = Math.min(H * 0.88, player.y + 70);
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

    // Direct climb — Up/Down move him on screen immediately (Frogger feel).
    const yBottom = H * 0.88;
    const yTop = H * 0.07;
    if (my !== 0) {
      player.y = Math.max(yTop, Math.min(yBottom, player.y + my * 300 * dt));
    }

    // Border meter tracks how high he is. Road keeps scrolling a bit so it feels alive.
    const progress = (yBottom - player.y) / (yBottom - yTop);
    distance = progress * GOAL;
    scroll += (my < 0 ? 210 : 55) * dt;
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

    if (progress >= 0.985 || player.y <= yTop + 0.5) {
      mode = 'win';
      stopSiren();
      playLaCucaracha();
      document.getElementById('pad').classList.remove('show');
      showOverlay(
        '¡MÉXICO!',
        'La Cucaracha!',
        'You made it across! Crossed with ' + lives + ' life' + (lives === 1 ? '' : 'ves') + ' left. Score ' + score + '.',
        'RUN AGAIN'
      );
    }
    updateHud();
  }

  function drawRoad() {
    // night desert sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#070b18');
    sky.addColorStop(0.45, '#1a1020');
    sky.addColorStop(1, '#3a2210');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 53 + Math.floor(scroll * 0.02)) % Math.floor(H * 0.35);
      ctx.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }

    // desert shoulders
    const sand = ctx.createLinearGradient(0, 0, 0, H);
    sand.addColorStop(0, '#6b4a28');
    sand.addColorStop(1, '#3d2a14');
    ctx.fillStyle = sand;
    ctx.fillRect(0, 0, ROAD_L - 6, H);
    ctx.fillRect(ROAD_R + 6, 0, W - ROAD_R - 6, H);

    // asphalt
    const road = ctx.createLinearGradient(ROAD_L, 0, ROAD_R, 0);
    road.addColorStop(0, '#1a1a1e');
    road.addColorStop(0.5, '#2a2a30');
    road.addColorStop(1, '#1a1a1e');
    ctx.fillStyle = road;
    ctx.fillRect(ROAD_L - 8, 0, ROAD_W + 16, H);

    // soft edge rumble
    ctx.fillStyle = 'rgba(180,40,40,0.35)';
    ctx.fillRect(ROAD_L - 8, 0, 6, H);
    ctx.fillRect(ROAD_R + 2, 0, 6, H);

    // lane dashes
    ctx.strokeStyle = '#e8d56a';
    ctx.lineWidth = 4;
    ctx.setLineDash([22, 18]);
    ctx.lineDashOffset = scroll * 1.1;
    for (let i = 1; i < LANES; i++) {
      const x = ROAD_L + LANE_W * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(240,240,240,0.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ROAD_L, 0); ctx.lineTo(ROAD_L, H);
    ctx.moveTo(ROAD_R, 0); ctx.lineTo(ROAD_R, H);
    ctx.stroke();

    // heat shimmer lines near bottom glow from "asphalt"
    ctx.fillStyle = 'rgba(255,120,40,0.04)';
    ctx.fillRect(ROAD_L, H * 0.7, ROAD_W, H * 0.3);

    const remain = GOAL - distance;
    if (remain < 950) {
      const t = 1 - remain / 950;
      ctx.fillStyle = 'rgba(0,120,60,' + (0.45 + t * 0.4) + ')';
      ctx.fillRect(0, 0, W, 78 + t * 40);
      // Mexican flag stripe accents
      ctx.fillStyle = 'rgba(0,104,71,0.9)';
      ctx.fillRect(W * 0.2, 18, W * 0.2, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(W * 0.4, 18, W * 0.2, 10);
      ctx.fillStyle = 'rgba(206,17,38,0.95)';
      ctx.fillRect(W * 0.6, 18, W * 0.2, 10);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🇲🇽  MÉXICO  🇲🇽', W / 2, 58 + t * 12);
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      for (let x = 8; x < W; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 68 + t * 28);
        ctx.lineTo(x, 98 + t * 38);
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
    // headlight wash toward player
    ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(0, c.h * 0.45, 2, 0, c.h * 0.9, c.w * 0.9);
    hg.addColorStop(0, 'rgba(255,230,160,0.35)');
    hg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-c.w * 0.2, c.h * 0.2);
    ctx.lineTo(c.w * 0.2, c.h * 0.2);
    ctx.lineTo(c.w * 0.7, c.h * 1.1);
    ctx.lineTo(-c.w * 0.7, c.h * 1.1);
    ctx.closePath();
    ctx.fill();
    const blink = Math.sin(c.phase) > 0;
    ctx.fillStyle = blink ? 'rgba(255,40,40,.75)' : 'rgba(50,90,255,.75)';
    ctx.beginPath();
    ctx.arc(-16, -c.h * 0.28, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blink ? 'rgba(50,90,255,.75)' : 'rgba(255,40,40,.75)';
    ctx.beginPath();
    ctx.arc(16, -c.h * 0.28, 9, 0, Math.PI * 2);
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
    const on = (e) => {
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      held.add(d);
    };
    const off = (e) => {
      e.preventDefault();
      held.delete(d);
    };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('lostpointercapture', off);
  });

  document.getElementById('startBtn').onclick = () => {
    ensureAudio();
    resetGame(true);
  };
  document.getElementById('muteBtn').onclick = () => {
    muted = !muted;
    document.getElementById('muteBtn').textContent = muted ? '🔇 MUTED' : '🔊 SIRENS';
    if (muted) { stopSiren(); stopWinMusic(); }
    else if (mode === 'play') startSiren();
  };

  if (window.matchMedia('(pointer: coarse)').matches) {
    document.getElementById('pad').classList.add('show');
  }
  updateHud();
})();
