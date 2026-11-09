import { useCallback, useEffect, useRef, useState } from 'react';
import { DECK, cardNumeral } from '../data/deck';

interface Props {
  onBack: () => void;
}

// The Full Deck (Chad's design, 2026-11-09): a real card in your hand.
// FRONT — the artwork, full-screen and sharp (HD plates in cards-hd/).
// Flip it over — BACK — the writing: both meanings, Upright and Shadow.
// Swipe or use the arrows to walk the deck; every new card starts face-up.

function hdSrc(image: string): string {
  return `${import.meta.env.BASE_URL}${image.replace('cards/', 'cards-hd/')}`;
}

export function DeckGallery({ onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = DECK[idx];
  const total = DECK.length;

  const goTo = useCallback(
    (next: number) => {
      setFlipped(false);
      setIdx(((next % total) + total) % total);
    },
    [total],
  );

  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // Preload the neighbours so swiping never waits on the network.
  useEffect(() => {
    [idx - 1, idx + 1, idx + 2].forEach((i) => {
      const c = DECK[((i % total) + total) % total];
      const img = new Image();
      img.src = hdSrc(c.image);
    });
  }, [idx, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(idx + 1);
      if (e.key === 'ArrowLeft') goTo(idx - 1);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, goTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      goTo(dx < 0 ? idx + 1 : idx - 1);
      return;
    }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setFlipped((f) => !f);
    }
  };

  return (
    <div className="stage deck-stage fade-in">
      <div className="deck-topbar">
        <button type="button" className="btn-ghost deck-back-btn" onClick={onBack}>
          ‹ Hub
        </button>
        <span className="deck-counter">
          {idx + 1} / {total}
        </span>
      </div>

      <div
        className="gallery-cardwrap"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className={`gallery-inner${flipped ? ' flipped' : ''}`}>
          <div className="gallery-front">
            <img
              className="gallery-art"
              src={hdSrc(card.image)}
              alt={card.name}
              draggable={false}
            />
          </div>
          <div className="gallery-back">
            <div className="gallery-back-head">
              <span className="card-number">{cardNumeral(card.number)}</span>
              <span className="gallery-back-glyph" aria-hidden>
                {card.glyph}
              </span>
            </div>
            <h3 className="gallery-back-name">{card.name}</h3>
            <p className="gallery-back-kw">
              {card.keywords[0]} · {card.keywords[1]}
            </p>
            <div className="gallery-back-text">
              <h4>Upright</h4>
              <p>{card.upright}</p>
              <h4>Shadow</h4>
              <p>{card.reversed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="deck-namebar">
        <div className="deck-card-name">{card.name}</div>
        <div className="deck-card-kw">
          {cardNumeral(card.number)} · {card.keywords[0]} · {card.keywords[1]}
        </div>
      </div>

      <div className="deck-controls">
        <button
          type="button"
          className="carousel-nav"
          aria-label="Previous card"
          onClick={() => goTo(idx - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="btn-primary deck-flip-btn"
          onClick={() => setFlipped((f) => !f)}
        >
          {flipped ? 'See the art' : 'Flip — read the meanings'}
        </button>
        <button
          type="button"
          className="carousel-nav"
          aria-label="Next card"
          onClick={() => goTo(idx + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
