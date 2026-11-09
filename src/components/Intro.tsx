import { useCallback, useEffect, useRef, useState } from 'react';

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
// Tat2face Oracle voice — it "wasn't doing that before" because narration
// sat behind a second "Tap to enter" gate nobody expected. Now the chain
// starts on its own the moment this screen appears (the BEGIN RITUAL tap
// just before it is the user gesture phone audio rules need). Tapping the
// screen restarts the narration if it was interrupted.

export function Intro({ onComplete, speak, stop }: Props) {
  const [captionIdx, setCaptionIdx] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);

  const finish = useCallback(() => {
    cancelledRef.current = true;
    stop();
    onComplete();
  }, [onComplete, stop]);

  const startNarration = useCallback(() => {
    cancelledRef.current = false;
    const speakNext = (i: number) => {
      if (cancelledRef.current) return;
      if (i >= NARRATION.length) {
        finish();
        return;
      }
      setCaptionIdx(i);
      speak(NARRATION[i], () => speakNext(i + 1));
    };
    speakNext(0);
  }, [speak, finish]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const skipT = window.setTimeout(() => setCanSkip(true), 3000);
    startNarration();
    return () => {
      clearTimeout(skipT);
      cancelledRef.current = true;
    };
  }, [startNarration]);

  const handleTap = () => {
    // A tap while captions are up restarts the spoken narration from the
    // top — the recovery if a browser swallowed the first attempt.
    stop();
    startNarration();
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
