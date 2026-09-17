import { useEffect } from 'react';
import { FORTUNE_TELLER_EPITHET, FORTUNE_TELLER_TITLE } from '../types';

interface Props {
  onRitual: () => void;
  onDaily: () => void;
  onPlus: () => void;
  plusUnlocked: boolean;
  speak?: (text: string, onEnd?: () => void) => void;
}

const TAGLINE = 'The Ash Realms do not flatter. Choose your path through the veil.';

export function Hub({ onRitual, onDaily, onPlus, plusUnlocked, speak }: Props) {
  useEffect(() => {
    speak?.(TAGLINE);
  }, [speak]);

  return (
    <div className="stage hub-stage fade-in">
      <div className="intro-orb hub-orb" aria-hidden />
      <h1 className="title-oracle">Oracle</h1>
      <p className="deck-subtitle">Veil of the Ash Realms</p>
      <p className="teller-credit">
        {FORTUNE_TELLER_TITLE} · {FORTUNE_TELLER_EPITHET}
      </p>
      <p className="caption" style={{ marginBottom: '1.75rem', opacity: 0.75 }}>
        {TAGLINE}
      </p>
      <div className="hub-actions">
        <button type="button" className="btn-primary" onClick={onRitual}>
          Begin Ritual
        </button>
        <button type="button" className="btn-ghost" onClick={onDaily}>
          Daily Transmission
        </button>
        <button type="button" className="btn-ghost" onClick={onPlus}>
          {plusUnlocked ? 'Oracle+ · Skins' : 'Oracle+'}
        </button>
      </div>
    </div>
  );
}
