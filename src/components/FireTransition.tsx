import { useEffect, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

export function FireTransition({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const duration = 1800 + Math.random() * 700;
    const done = window.setTimeout(onComplete, duration);
    return () => clearTimeout(done);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      r: number;
      hue: number;
    };

    const particles: Particle[] = [];
    const spawn = (w: number, h: number) => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: w * 0.15 + Math.random() * w * 0.7,
          y: h * 0.85 + Math.random() * h * 0.1,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.5 - Math.random() * 3.5,
          life: 0,
          max: 40 + Math.random() * 50,
          r: 8 + Math.random() * 18,
          hue: 10 + Math.random() * 30,
        });
      }
    };

    const loop = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = 'rgba(5, 3, 5, 0.28)';
      ctx.fillRect(0, 0, w, h);

      spawn(w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.99;
        const t = p.life / p.max;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.85;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1 - t * 0.3));
        g.addColorStop(0, `hsla(${p.hue + 20}, 100%, 70%, ${alpha})`);
        g.addColorStop(0.4, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.7})`);
        g.addColorStop(1, `hsla(${p.hue - 10}, 100%, 20%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="stage fire-stage">
      <canvas ref={canvasRef} className="fire-canvas" />
      <p className="fire-label">PASS THROUGH FIRE</p>
    </div>
  );
}
