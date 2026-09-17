import { useRef, useState } from 'react';

const LINES = [
  'By cinder, bone, and veiled decree,',
  'I call the courts that judge through me.',
  'No soft lie holds. No pretty mask.',
  'I claim the cost. I do the task.',
  'What stalks beneath, now stand and speak,',
  'What feeds on silence, find the weak.',
  'I stand between the worlds tonight —',
  'Cut clean the false. Align the right.',
];

const HOLD_MS = 2000;

interface Props {
  onComplete: () => void;
}

export function Incantation({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const heldRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setHolding(false);
    setProgress(100);
    onComplete();
  };

  const clear = (countAsFail = false) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setHolding(false);
    setProgress(0);
    if (countAsFail && heldRef.current && !doneRef.current) {
      setFailedAttempts((n) => n + 1);
    }
    heldRef.current = false;
  };

  const tick = (now: number) => {
    if (doneRef.current) return;
    if (startRef.current == null) startRef.current = now;
    const elapsed = now - startRef.current;
    const p = Math.min(100, (elapsed / HOLD_MS) * 100);
    setProgress(p);
    if (p >= 100) {
      finish();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (doneRef.current) return;
    const el = btnRef.current;
    if (el) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    heldRef.current = true;
    setHolding(true);
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (doneRef.current) return;
    clear(true);
  };

  const showFallback = failedAttempts >= 1;

  return (
    <div className="stage fade-in">
      <h2 className="title-oracle" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        Incantation
      </h2>
      <p className="caption" style={{ opacity: 0.7, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        Speak aloud. Then hold to seal the call.
      </p>
      <div className="incantation-text">
        {LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button
        ref={btnRef}
        type="button"
        className={`hold-btn ${holding ? 'holding' : ''}`}
        style={{
          ['--hold-progress' as string]: `${progress}%`,
          touchAction: 'none',
        }}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onLostPointerCapture={endHold}
        aria-label="Hold to confirm: I have spoken"
      >
        <div className="hold-ring" aria-hidden />
        <span className="label" style={{ pointerEvents: 'none' }}>
          I have spoken
        </span>
        <span
          className="label"
          style={{ opacity: 0.5, fontSize: '0.55rem', pointerEvents: 'none' }}
        >
          hold
        </span>
      </button>

      {(
        <button
          type="button"
          className="btn-ghost continue-spoken"
          onClick={finish}
          style={{
            marginTop: '1.5rem',
            opacity: showFallback ? 1 : 0.55,
          }}
        >
          I have spoken — continue
        </button>
      )}
    </div>
  );
}
