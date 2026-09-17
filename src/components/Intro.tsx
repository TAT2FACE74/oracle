import { useCallback, useEffect, useState } from 'react';

const NARRATION = [
  'Beyond ordinary sight, the Ash Realms keep their own ledger. Fate does not ask permission — it sends messengers.',
  'You stand at a threshold of bone and cinder, where veiled courts weigh what you will not admit.',
  'Here, Source speaks in consequence, heat, and silence. Timelines harden. Soft lies go first into the fire.',
  'Ascension is not escape. It is surviving the truth with your spine intact. Enter. The Oracle is already watching.',
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
