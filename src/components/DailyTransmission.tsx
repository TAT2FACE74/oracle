import { useEffect, useMemo, useRef } from 'react';
import { getOrCreateDaily } from '../lib/daily';
import { CardVisual } from './CardVisual';
import type { DeckId } from '../types';

interface Props {
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
  onBack: () => void;
  onRitual: () => void;
  deckId: DeckId;
  premiumArt: boolean;
}

export function DailyTransmission({
  speak,
  stop,
  onBack,
  onRitual,
  deckId,
  premiumArt,
}: Props) {
  const data = useMemo(() => getOrCreateDaily(), []);
  const spokenRef = useRef(false);

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;
    speak(data.fortune);
    return () => stop();
  }, [data.fortune, speak, stop]);

  return (
    <div className="stage reading-stage fade-in">
      <h2
        className="title-oracle"
        style={{ fontSize: '0.8rem', marginBottom: '0.5rem', letterSpacing: '0.3em' }}
      >
        Daily Transmission
      </h2>
      <p className="caption" style={{ marginBottom: '1.25rem', fontSize: '0.95rem', opacity: 0.65 }}>
        {data.date} · one card for this device today
      </p>

      <div className="daily-card-wrap">
        <CardVisual
          card={data.drawn.card}
          flipped
          reversed={data.drawn.reversed}
          size="full"
          deckId={deckId}
          premiumArt={premiumArt}
        />
      </div>

      <div className="synthesis" style={{ marginTop: '1.5rem' }}>
        <h3>Messenger Line</h3>
        <p>{data.fortune}</p>
      </div>

      <div className="reading-actions">
        <button type="button" className="btn-primary" onClick={onRitual}>
          Begin Ritual
        </button>
        <button type="button" className="btn-ghost" onClick={onBack}>
          Back to hub
        </button>
      </div>
    </div>
  );
}
