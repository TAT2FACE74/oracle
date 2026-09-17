import type { DeckId, TarotCard } from '../types';
import { courtLabel, romanNumeral } from '../data/deck';

interface Props {
  card?: TarotCard;
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
  deckId = 'rws',
  premiumArt = false,
}: Props) {
  const sizeClass =
    size === 'mini' ? 'mini' : size === 'reading' ? 'reading-size' : '';

  const numeral =
    card?.suit === 'major'
      ? romanNumeral(card.number)
      : courtLabel(card?.number ?? 0) || String(card?.number ?? '');

  const artSrc = card
    ? `${import.meta.env.BASE_URL}${card.image.replace(/^\//, '')}`
    : '';

  return (
    <div
      className={`card deck-${deckId} ${premiumArt ? 'premium-art' : ''} ${sizeClass} ${
        flipped ? 'flipped' : ''
      } ${reversed && flipped ? 'reversed-face' : ''} ${className}`}
    >
      <div className="card-back">
        <div className="card-border" />
        <span className="card-ornament tl" />
        <span className="card-ornament tr" />
        <span className="card-ornament bl" />
        <span className="card-ornament br" />
        <div className="back-sigil">✦</div>
        {premiumArt && <div className="card-shimmer" aria-hidden />}
      </div>
      {card && (
        <div className="card-face">
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
            <div className="card-art-meta">
              <div className="card-roman">{numeral}</div>
              <div className="card-name">{card.name}</div>
              {reversed && <div className="orient-badge">REVERSED</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
