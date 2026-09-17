import { useCallback, useEffect, useState } from 'react';

const NARRATION = [
  'Beyond the veil of ordinary sight, fate and destiny braid themselves into the fabric of all that is.',
  'You stand at the threshold of the shadow realm — a place of mysticism, where other-dimensional planes touch this one.',
  'Here, Source speaks in energy, vibration, and frequency. Timelines shimmer. Enlightenment waits for those who listen.',
  'Ascension is not escape. It is remembering. Enter, seeker. The Oracle awaits.',
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
