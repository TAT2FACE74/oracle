import { useCallback, useEffect, useState } from 'react';

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

export function Intro({ onComplete, speak, stop }: Props) {
  const [entered, setEntered] = useState(false);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  const finish = useCallback(() => {
    stop();
    onComplete();
  }, [onComplete, stop]);

  useEffect(() => {
    if (!entered) return;
    const t = window.setTimeout(() => setCanSkip(true), 3000);
    return () => clearTimeout(t);
  }, [entered]);

  useEffect(() => {
    if (!entered) return;
    let cancelled = false;

    const speakNext = (i: number) => {
      if (cancelled || i >= NARRATION.length) {
        if (!cancelled) finish();
        return;
      }
      setCaptionIdx(i);
      speak(NARRATION[i], () => {
        if (!cancelled) speakNext(i + 1);
      });
    };

    speakNext(0);
    return () => {
      cancelled = true;
    };
  }, [entered, speak, finish]);

  const handleEnter = () => {
    if (entered) return;
    setEntered(true);
  };

  return (
    <div className="stage intro" onClick={entered ? undefined : handleEnter}>
      <div className="intro-orb" aria-hidden />
      <h1 className="title-oracle">Oracle</h1>
      <p className="deck-subtitle">Veil of the Ash Realms</p>
      <p className="teller-credit">The Fortune Teller · Elder of the Crossroads</p>
      {!entered ? (
        <p className="tap-enter">Tap to enter</p>
      ) : (
        <>
          <div className="caption-box fade-in">
            <p className="caption">{NARRATION[captionIdx]}</p>
          </div>
          {canSkip && (
            <button type="button" className="skip-hint btn-ghost" onClick={finish}>
              Skip
            </button>
          )}
        </>
      )}
    </div>
  );
}
