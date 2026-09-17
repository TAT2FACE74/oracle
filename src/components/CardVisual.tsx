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
            <div className="card-roman">{numeral}</div>
            <div className="card-glyph">{card.glyph}</div>
            <div className="card-suit-line" />
            <div className="card-name">{card.name}</div>
            <div className="card-keywords">
              {card.keywords.slice(0, 3).join(' · ')}
            </div>
            {reversed && <div className="orient-badge">REVERSED</div>}
          </div>
        </div>
      )}
    </div>
  );
}
