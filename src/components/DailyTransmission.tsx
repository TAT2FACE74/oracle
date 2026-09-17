import { useEffect, useMemo, useRef } from 'react';
import { getOrCreateDaily } from '../lib/daily';
import { CardVisual } from './CardVisual';
import type { DeckId } from '../types';
import { aspectOfDrawn } from '../lib/fortune';

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
  const message = aspectOfDrawn(data.drawn);

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
        style={{ fontSize: '0.8rem', marginBottom: '0.35rem', letterSpacing: '0.3em' }}
      >
        Daily Transmission
      </h2>
      <p className="teller-credit">The Fortune Teller · Elder of the Crossroads</p>
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

      <article className="reading-detail" style={{ marginTop: '1.5rem' }}>
        <h3>
          {data.drawn.card.name}
          {data.drawn.reversed ? ' · Shadow' : ''}
        </h3>
        <p className="kw-line">
          {data.drawn.card.keywords[0]} · {data.drawn.card.keywords[1]}
        </p>
        <p className="fortune-message">{message}</p>
      </article>

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
