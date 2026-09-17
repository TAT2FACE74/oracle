import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const TOTAL_MS = 4200;
const SKIP_AFTER_MS = 1500;

export function Cinematic({ onComplete }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [canSkip, setCanSkip] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('out');
    window.setTimeout(onComplete, 400);
  }, [onComplete]);

  useEffect(() => {
    const skipT = window.setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    const holdT = window.setTimeout(() => setPhase('hold'), 900);
    const endT = window.setTimeout(finish, TOTAL_MS);
    return () => {
      clearTimeout(skipT);
      clearTimeout(holdT);
      clearTimeout(endT);
    };
  }, [finish]);

  return (
    <div
      className={`stage cinematic-stage cinematic-${phase}`}
      onClick={canSkip ? finish : undefined}
      role="presentation"
    >
      <div className="cinematic-vignette" aria-hidden />
      <div className="cinematic-embers" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="ember" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <img
        className="cinematic-logo"
        src={`${import.meta.env.BASE_URL}tat2face-presents.png`}
        alt="Tat2Face Presents"
        draggable={false}
      />
      {canSkip && <p className="skip-hint">Tap to continue</p>}
    </div>
  );
}
