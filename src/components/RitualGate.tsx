import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

// Chad's ritual sequence (his direction, 2026-11-08): after the incantation
// the screen goes BLACK, then his second video plays (it replaces the old
// stare-orb and fire screens), then the screen holds BLACK for a full three
// seconds, then the card draw opens. He remade the video in PORTRAIT after
// the first landscape cut, specifically so it fills the whole screen.
// Phones force muted autoplay: starts muted with a tap-for-sound chip.

const BLACK_IN_MS = 1500;
const BLACK_OUT_MS = 3000;
const HARD_CAP_MS = 24000;

export function RitualGate({ onComplete }: Props) {
  const [phase, setPhase] = useState<'black-in' | 'video' | 'black-out'>('black-in');
  const [soundOn, setSoundOn] = useState(false);
  const doneRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toBlackOut = useCallback(() => {
    setPhase((p) => (p === 'video' ? 'black-out' : p));
  }, []);

  useEffect(() => {
    if (phase === 'black-in') {
      const t = window.setTimeout(() => setPhase('video'), BLACK_IN_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'black-out') {
      const t = window.setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        onComplete();
      }, BLACK_OUT_MS);
      return () => clearTimeout(t);
    }
    // Video phase: safety cap so a stalled video never traps the user.
    const cap = window.setTimeout(toBlackOut, HARD_CAP_MS);
    return () => clearTimeout(cap);
  }, [phase, onComplete, toBlackOut]);

  const enableSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setSoundOn(true);
    if (v.paused) void v.play().catch(() => undefined);
  };

  return (
    <div className="stage ritual-stage" role="presentation">
      {phase === 'video' && (
        <>
          <video
            ref={videoRef}
            className="ritual-video"
            src={`${import.meta.env.BASE_URL}oracle-ritual2.mp4`}
            poster={`${import.meta.env.BASE_URL}oracle-ritual2-poster.jpg`}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={toBlackOut}
            onError={toBlackOut}
          />
          {!soundOn && (
            <button type="button" className="sound-chip" onClick={enableSound}>
              🔊 Tap for sound
            </button>
          )}
          <button type="button" className="skip-chip" onClick={toBlackOut}>
            Skip ›
          </button>
        </>
      )}
    </div>
  );
}
