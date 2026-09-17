import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

/**
 * Black-screen stare gate: center orb red → green.
 * At ~5s a shadowed face fades in behind the orb (creepy, visible on phones).
 * Green at 10s; complete ~11.2s.
 */
export function EyesGate({ onComplete }: Props) {
  const [showFace, setShowFace] = useState(false);
  const [green, setGreen] = useState(false);

  useEffect(() => {
    const faceT = window.setTimeout(() => setShowFace(true), 5000);
    const greenT = window.setTimeout(() => setGreen(true), 10000);
    const doneT = window.setTimeout(() => onComplete(), 11200);
    return () => {
      clearTimeout(faceT);
      clearTimeout(greenT);
      clearTimeout(doneT);
    };
  }, [onComplete]);

  return (
    <div className="stage eyes-stage">
      <div className={`shadow-face ${showFace ? 'visible' : ''}`} aria-hidden>
        <div className="shadow-face-inner">
          <div className="sf-skull" />
          <div className="sf-eye sf-eye-l">
            <span className="sf-iris" />
            <span className="sf-glint" />
          </div>
          <div className="sf-eye sf-eye-r">
            <span className="sf-iris" />
            <span className="sf-glint" />
          </div>
          <div className="sf-brow sf-brow-l" />
          <div className="sf-brow sf-brow-r" />
          <div className="sf-nose" />
          <div className="sf-mouth" />
        </div>
      </div>
      <div
        className={`eyes-orb ${green ? 'green' : 'red'}${showFace ? ' with-presence' : ''}`}
      />
      <p className="eyes-copy">
        Eyes are windows into the soul.
        <br />
        Stare at the center until green.
      </p>
    </div>
  );
}
