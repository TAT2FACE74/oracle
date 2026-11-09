import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

// Chad's own intro video (16s, portrait, with sound) is the opening of the
// app — it replaced the old "Tat2Face Presents" logo card on 2026-11-08 at
// his direction. Phones only allow autoplay while muted, so it starts muted
// with a "tap for sound" chip; tapping unmutes in place. Skip appears after
// 1.5s; any video error falls through to the app so nobody is ever trapped.

const SKIP_AFTER_MS = 1500;
const HARD_CAP_MS = 22000; // safety net if the video stalls

export function Cinematic({ onComplete }: Props) {
  const [phase, setPhase] = useState<'play' | 'out'>('play');
  const [canSkip, setCanSkip] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const doneRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('out');
    window.setTimeout(onComplete, 400);
  }, [onComplete]);

  useEffect(() => {
    const skipT = window.setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    const capT = window.setTimeout(finish, HARD_CAP_MS);
    return () => {
      clearTimeout(skipT);
      clearTimeout(capT);
    };
  }, [finish]);

  const enableSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setSoundOn(true);
    if (v.paused) void v.play().catch(() => undefined);
  };

  return (
    <div className={`stage cinematic-stage cinematic-${phase}`} role="presentation">
      <video
        ref={videoRef}
        className="cinematic-video"
        src={`${import.meta.env.BASE_URL}oracle-intro.mp4`}
        poster={`${import.meta.env.BASE_URL}oracle-intro-poster.jpg`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      />
      {!soundOn && (
        <button type="button" className="sound-chip" onClick={enableSound}>
          🔊 Tap for sound
        </button>
      )}
      {canSkip && (
        <button type="button" className="skip-chip" onClick={finish}>
          Skip ›
        </button>
      )}
    </div>
  );
}
