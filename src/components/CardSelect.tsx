import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shuffleDeck } from '../data/deck';
import type { DeckId, DrawnCard, OracleCard } from '../types';
import { CardVisual } from './CardVisual';

interface Props {
  onComplete: (drawn: DrawnCard[]) => void;
  deckId?: DeckId;
  premiumArt?: boolean;
}

const MAX = 5;
/** Hold revealed face before tucking into the selected row (cinematic). */
const REVEAL_HOLD_MS = 3800;
const SWIPE_THRESHOLD = 55;
const TAP_THRESHOLD = 12;

export function CardSelect({ onComplete, deckId = 'veil', premiumArt = false }: Props) {
  const deck = useMemo(() => shuffleDeck(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [pending, setPending] = useState<{ card: OracleCard; reversed: boolean } | null>(
    null,
  );
  const dragRef = useRef<{ x: number; y: number; active: boolean; pointerId: number | null }>({
    x: 0,
    y: 0,
    active: false,
    pointerId: null,
  });
  const [dragX, setDragX] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const available = useMemo(() => {
    const ids = new Set(selected.map((s) => s.card.id));
    if (pending) ids.add(pending.card.id);
    return deck.filter((c) => !ids.has(c.id));
  }, [deck, selected, pending]);

  // After removals, keep index valid against remaining backs
  useEffect(() => {
    if (pending) return;
    if (!available.length) {
      setIndex(0);
      return;
    }
    setIndex((i) => ((i % available.length) + available.length) % available.length);
  }, [available.length, pending]);

  const carouselCards = useMemo(() => {
    if (pending) return [pending.card, ...available];
    return available;
  }, [available, pending]);

  const safeIndex = carouselCards.length
    ? pending
      ? 0
      : ((index % carouselCards.length) + carouselCards.length) % carouselCards.length
    : 0;

  const go = useCallback(
    (dir: number) => {
      if (pending || !available.length) return;
      setIndex((i) => {
        const len = available.length;
        return ((i + dir) % len + len) % len;
      });
      setDragX(0);
    },
    [available.length, pending],
  );

  const selectAt = useCallback(
    (cardIndex: number) => {
      if (pending || selected.length >= MAX || !available.length) return;
      const len = available.length;
      const i = ((cardIndex % len) + len) % len;
      const card = available[i];
      if (!card) return;
      const reversed = Math.random() < 0.3;
      setPending({ card, reversed });
      setDragX(0);

      window.setTimeout(() => {
        setSelected((prev) => {
          const next: DrawnCard[] = [
            ...prev,
            { card, reversed, position: prev.length },
          ];
          if (next.length >= MAX) {
            window.setTimeout(() => onComplete(next), 450);
          }
          return next;
        });
        setPending(null);
        setIndex(0);
        setDragX(0);
      }, REVEAL_HOLD_MS);
    },
    [available, onComplete, pending, selected.length],
  );

  const selectCurrent = useCallback(() => {
    selectAt(safeIndex);
  }, [safeIndex, selectAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (pending) return;
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
      pointerId: e.pointerId,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setDragX(e.clientX - dragRef.current.x);
  };

  const endPointer = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 0.6) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
      selectCurrent();
    } else {
      setDragX(0);
    }
  };

  const onSideClick = (offset: number) => {
    if (pending) return;
    if (offset === 0) {
      selectCurrent();
      return;
    }
    // Drag side card into center, then allow select
    go(offset > 0 ? 1 : -1);
  };

  const visible: { card: OracleCard; offset: number }[] = [];
  for (let o = -2; o <= 2; o++) {
    if (!carouselCards.length) break;
    const i = (safeIndex + o + carouselCards.length * 10) % carouselCards.length;
    visible.push({ card: carouselCards[i], offset: o });
  }

  return (
    <div className="stage select-stage fade-in">
      <div className="select-header">
        <h2>Choose five</h2>
        <div className="counter">
          {selected.length}/{MAX}
        </div>
      </div>

      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-nav"
          aria-label="Previous card"
          disabled={!!pending || available.length < 2}
          onClick={() => go(-1)}
        >
          ‹
        </button>

        <div
          ref={wrapRef}
          className="carousel-wrap"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={(e) => {
            dragRef.current.active = false;
            setDragX(0);
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
        >
          <div className="carousel-track">
            {visible.map(({ card, offset }) => {
              const isPending = pending?.card.id === card.id && offset === 0;
              const x = offset * 118 + (offset === 0 ? dragX * 0.45 : 0);
              const scale = offset === 0 ? 1 : 0.78 - Math.abs(offset) * 0.06;
              const opacity = offset === 0 ? 1 : 0.45 - Math.abs(offset) * 0.1;
              const rot = offset * 6;
              return (
                <div
                  key={`${card.id}-${offset}`}
                  className={`card-slot ${offset === 0 ? 'center' : ''}`}
                  style={{
                    transform: `translateX(${x}px) scale(${scale}) rotate(${rot}deg)`,
                    opacity: Math.max(0.15, opacity),
                    zIndex: 5 - Math.abs(offset),
                    pointerEvents: 'auto',
                    transition: dragRef.current.active && offset === 0 ? 'none' : undefined,
                  }}
                  onClick={(ev) => {
                    if (offset === 0) return;
                    ev.stopPropagation();
                    if (pending) return;
                    onSideClick(offset);
                  }}
                >
                  <CardVisual
                    card={isPending ? card : undefined}
                    flipped={!!isPending}
                    reversed={isPending ? pending!.reversed : false}
                    deckId={deckId}
                    premiumArt={premiumArt}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="carousel-nav"
          aria-label="Next card"
          disabled={!!pending || available.length < 2}
          onClick={() => go(1)}
        >
          ›
        </button>
      </div>

      <p className="hint-swipe">Swipe or use arrows · Tap center to select</p>

      <button
        type="button"
        className="btn-primary select-confirm"
        disabled={!!pending || selected.length >= MAX || !available.length}
        onClick={selectCurrent}
      >
        Select this card
      </button>

      <div className="selected-row">
        {selected.map((s) => (
          <div
            key={s.card.id}
            className="selected-thumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div style={{ transform: 'scale(0.19)', transformOrigin: 'center center' }}>
              <CardVisual
                card={s.card}
                flipped
                reversed={s.reversed}
                deckId={deckId}
                premiumArt={premiumArt}
              />
            </div>
          </div>
        ))}
        {Array.from({ length: MAX - selected.length }).map((_, i) => (
          <div key={`empty-${i}`} className="selected-thumb" />
        ))}
      </div>
    </div>
  );
}
