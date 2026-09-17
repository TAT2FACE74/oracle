import { useRef, useState } from 'react';

const LINES = [
  'By shadow and by flame I call,',
  'Through veil and void, through rise and fall,',
  'I open sight beyond the known,',
  'I claim the thread that is my own.',
  'What sleeps beneath, now wake and speak,',
  'What hides in silence, find the weak.',
  'I stand between the worlds tonight —',
  'Reveal the truth. Align the light.',
];

const HOLD_MS = 2000;

interface Props {
  onComplete: () => void;
}

export function Incantation({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const clear = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setHolding(false);
    setProgress(0);
  };

  const tick = (now: number) => {
    if (startRef.current == null) startRef.current = now;
    const elapsed = now - startRef.current;
    const p = Math.min(100, (elapsed / HOLD_MS) * 100);
    setProgress(p);
    if (p >= 100 && !doneRef.current) {
      doneRef.current = true;
      clear();
      onComplete();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startHold = (e: React.PointerEvent) => {
    e.preventDefault();
    if (doneRef.current) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setHolding(true);
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (doneRef.current) return;
    clear();
  };

  return (
    <div className="stage fade-in">
      <h2 className="title-oracle" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        Incantation
      </h2>
      <p className="caption" style={{ opacity: 0.7, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        Speak aloud. Then hold to confirm.
      </p>
      <div className="incantation-text">
        {LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button
        type="button"
        className={`hold-btn ${holding ? 'holding' : ''}`}
        style={{ ['--hold-progress' as string]: `${progress}%` }}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        aria-label="Hold to confirm: I have spoken"
      >
        <div className="hold-ring" aria-hidden />
        <span className="label">I have spoken</span>
        <span className="label" style={{ opacity: 0.5, fontSize: '0.55rem' }}>
          hold
        </span>
      </button>
    </div>
  );
}
