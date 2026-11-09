import { useEffect, useRef, useState } from 'react';

const NARRATION = [
  'You did not come here for decoration. You came because something in your life is asking to be seen clearly — and what is seen clearly can finally be carried.',
  'I am Odin, keeper of the Ash Realms. I traded an eye for wisdom, so hear me: the truth is almost never the heaviest thing a person carries. The hiding is.',
  'Here there are no soft lies and no theater. Only the pattern under your days, spoken plainly — your work, your love, your money, your grief — and what they are quietly asking of you.',
  'Bring your real question — the one beneath the question. The cards will speak as messengers. I will speak as witness. Enter. The Oracle is already watching.',
];

interface Props {
  onComplete: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
}

// Chad's direction (2026-11-08): the intro must be READ ALOUD in the
// Tat2face Oracle voice, advancing on its own. Two traps killed earlier
// versions: (1) narration sat behind a second "Tap to enter" gate, and
// (2) the speak chain lived in an effect whose dependencies changed
// identity every time the speech hook updated state — the effect cleanup
// cancelled the chain after line 1, every time. This version keeps every
// callback in refs and runs the chain from a mount-only effect, so state
// churn can never cancel it. Tapping the screen restarts the narration.

export function Intro({ onComplete, speak, stop }: Props) {
  const [captionIdx, setCaptionIdx] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const cancelledRef = useRef(false);
  const startedRef = useRef(false);

  const startNarrationRef = useRef<() => void>(() => undefined);
  startNarrationRef.current = () => {
    cancelledRef.current = false;
    const speakNext = (i: number) => {
      if (cancelledRef.current) return;
      if (i >= NARRATION.length) {
        stopRef.current();
        completeRef.current();
        return;
      }
      setCaptionIdx(i);
      speakRef.current(NARRATION[i], () => speakNext(i + 1));
    };
    speakNext(0);
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const skipT = window.setTimeout(() => setCanSkip(true), 3000);
    startNarrationRef.current();
    return () => clearTimeout(skipT);
    // Mount-only by design — see the note above. Unmount cancels below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      cancelledRef.current = true;
    },
    [],
  );

  const finish = () => {
    cancelledRef.current = true;
    stopRef.current();
    completeRef.current();
  };

  const handleTap = () => {
    stopRef.current();
    startNarrationRef.current();
  };

  return (
    <div className="stage intro" onClick={handleTap}>
      <div className="intro-orb" aria-hidden />
      <h1 className="title-oracle">Oracle</h1>
      <p className="deck-subtitle">Veil of the Ash Realms</p>
      <p className="teller-credit">The Fortune Teller · Elder of the Crossroads</p>
      <div className="caption-box fade-in">
        <p className="caption">{NARRATION[captionIdx]}</p>
      </div>
      {canSkip && (
        <button
          type="button"
          className="skip-hint btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
