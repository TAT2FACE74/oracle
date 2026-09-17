import { useCallback, useMemo, useRef, useState } from 'react';
import { shuffleDeck } from '../data/deck';
import type { DrawnCard, TarotCard } from '../types';
import { CardVisual } from './CardVisual';

interface Props {
  onComplete: (drawn: DrawnCard[]) => void;
}

const MAX = 5;

export function CardSelect({ onComplete }: Props) {
  const deck = useMemo(() => shuffleDeck(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [pending, setPending] = useState<{ card: TarotCard; reversed: boolean } | null>(
    null,
  );
  const dragRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const [dragX, setDragX] = useState(0);

  const available = useMemo(() => {
    const ids = new Set(selected.map((s) => s.card.id));
    if (pending) ids.add(pending.card.id);
    return deck.filter((c) => !ids.has(c.id));
  }, [deck, selected, pending]);

  // Include pending card in carousel as center flip target
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
      setIndex((i) => i + dir);
      setDragX(0);
    },
    [available.length, pending],
  );

  const selectCurrent = () => {
    if (pending || selected.length >= MAX || !available.length) return;
    const card = available[
      ((index % available.length) + available.length) % available.length
    ];
    const reversed = Math.random() < 0.3;
    setPending({ card, reversed });

    window.setTimeout(() => {
      const next: DrawnCard[] = [
        ...selected,
        { card, reversed, position: selected.length },
      ];
      setSelected(next);
      setPending(null);
      setDragX(0);
      if (next.length >= MAX) {
        window.setTimeout(() => onComplete(next), 400);
      }
    }, 750);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (pending) return;
    dragRef.current = { x: e.clientX, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setDragX(e.clientX - dragRef.current.x);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    dragRef.current.active = false;
    if (Math.abs(dx) > 60) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 12) {
      selectCurrent();
    } else {
      setDragX(0);
    }
  };

  const visible: { card: TarotCard; offset: number }[] = [];
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

      <div
        className="carousel-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current.active = false;
          setDragX(0);
        }}
      >
        <div className="carousel-track">
          {visible.map(({ card, offset }) => {
            const isPending = pending?.card.id === card.id && offset === 0;
            const x = offset * 118 + (offset === 0 ? dragX * 0.4 : 0);
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
                  pointerEvents: offset === 0 ? 'auto' : 'none',
                }}
              >
                <CardVisual
                  card={isPending ? card : undefined}
                  flipped={!!isPending}
                  reversed={isPending ? pending!.reversed : false}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="hint-swipe">Swipe · Tap to select</p>

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
              <CardVisual card={s.card} flipped reversed={s.reversed} />
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
