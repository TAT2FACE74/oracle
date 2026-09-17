import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function EyesGate({ onComplete }: Props) {
  const [showFace, setShowFace] = useState(false);
  const [green, setGreen] = useState(false);

  useEffect(() => {
    const faceT = window.setTimeout(() => setShowFace(true), 5000);
    const greenT = window.setTimeout(() => setGreen(true), 10000);
    const doneT = window.setTimeout(() => onComplete(), 11000);
    return () => {
      clearTimeout(faceT);
      clearTimeout(greenT);
      clearTimeout(doneT);
    };
  }, [onComplete]);

  return (
    <div className="stage eyes-stage">
      <div className={`shadow-face ${showFace ? 'visible' : ''}`} aria-hidden>
        <svg className="face-svg" viewBox="0 0 200 240" fill="none">
          <ellipse cx="100" cy="120" rx="70" ry="90" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="2" />
          {/* left eye */}
          <g className="eye-ball">
            <ellipse cx="72" cy="105" rx="14" ry="8" fill="#111" stroke="#2a2a2a" strokeWidth="1" />
            <circle cx="72" cy="105" r="4.5" fill="#1a0508" />
            <circle cx="73" cy="104" r="1.5" fill="#3a1018" />
          </g>
          {/* right eye */}
          <g className="eye-ball right">
            <ellipse cx="128" cy="105" rx="14" ry="8" fill="#111" stroke="#2a2a2a" strokeWidth="1" />
            <circle cx="128" cy="105" r="4.5" fill="#1a0508" />
            <circle cx="129" cy="104" r="1.5" fill="#3a1018" />
          </g>
          <path
            d="M85 145 Q100 155 115 145"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
      <div className={`eyes-orb ${green ? 'green' : 'red'}`} />
      <p className="eyes-copy">
        Eyes are windows into the soul.
        <br />
        Stare at the center until green.
      </p>
    </div>
  );
}
