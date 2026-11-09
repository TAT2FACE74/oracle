import { useEffect, useState } from 'react';
import type { DeckId, OracleCard } from '../types';
import { cardNumeral } from '../data/deck';

interface Props {
  card?: OracleCard;
  flipped?: boolean;
  reversed?: boolean;
  size?: 'full' | 'reading' | 'mini';
  className?: string;
  deckId?: DeckId;
  premiumArt?: boolean;
}

export function CardVisual({
  card,
  flipped = false,
  reversed = false,
  size = 'full',
  className = '',
  deckId = 'veil',
  premiumArt = false,
}: Props) {
  const sizeClass =
    size === 'mini' ? 'mini' : size === 'reading' ? 'reading-size' : '';

  // Mount face-down, then flip on the next frames — a card that mounts already
  // wearing .flipped never animates, which reads as "the cards don't flip."
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!flipped) {
      setShown(false);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, [flipped]);

  const artSrc = card
    ? `${import.meta.env.BASE_URL}${card.image.replace(/^\//, '')}`
    : '';

  return (
    <div
      className={`card deck-${deckId} ${premiumArt ? 'premium-art' : ''} ${sizeClass} ${
        shown ? 'flipped' : ''
      } ${reversed && shown ? 'reversed-face' : ''} ${className}`}
    >
      <div className="card-back">
        <div className="card-border" />
        <span className="card-ornament tl" />
        <span className="card-ornament tr" />
        <span className="card-ornament bl" />
        <span className="card-ornament br" />
        <div className="back-sigil">⟐</div>
        {premiumArt && <div className="card-shimmer" aria-hidden />}
      </div>
      {card && (
        <div className="card-face oracle-face">
          <div className="card-border" />
          <span className="card-ornament tl" />
          <span className="card-ornament tr" />
          <span className="card-ornament bl" />
          <span className="card-ornament br" />
          {premiumArt && <div className="card-shimmer" aria-hidden />}
          <div className="card-face-inner">
            <img
              className="card-art"
              src={artSrc}
              alt={card.name}
              draggable={false}
              loading="lazy"
            />
            <div className="card-art-vignette" aria-hidden />
            <div className="oracle-chrome">
              <div className="oracle-chrome-top">
                <span className="card-number">{cardNumeral(card.number)}</span>
                <span className="card-sigil" aria-hidden>
                  {card.glyph}
                </span>
              </div>
              <div className="oracle-chrome-title">{card.name}</div>
              <div className="oracle-chrome-keywords">
                {card.keywords[0]} · {card.keywords[1]}
              </div>
              {reversed && <div className="orient-badge">SHADOW</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
