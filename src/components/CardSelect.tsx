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
const REVEAL_HOLD_MS = 3500;
const SWIPE_THRESHOLD = 45;
const TAP_THRESHOLD = 12;

type DragState = {
  x: number;
  y: number;
  active: boolean;
  /** 'touch' | 'pointer' — ignore the other modality while one is active */
  mode: 'touch' | 'pointer' | null;
  pointerId: number | null;
};

export function CardSelect({ onComplete, deckId = 'veil', premiumArt = false }: Props) {
  const deck = useMemo(() => shuffleDeck(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [pending, setPending] = useState<{ card: OracleCard; reversed: boolean } | null>(
    null,
  );
  const dragRef = useRef<DragState>({
    x: 0,
    y: 0,
    active: false,
    mode: null,
    pointerId: null,
  });
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep latest callbacks/values for native listeners without rebinding mid-gesture
  const pendingRef = useRef(pending);
  const availableRef = useRef<OracleCard[]>([]);
  const indexRef = useRef(index);
  const goRef = useRef<(dir: number) => void>(() => {});
  const selectCurrentRef = useRef<() => void>(() => {});

  const available = useMemo(() => {
    const ids = new Set(selected.map((s) => s.card.id));
    if (pending) ids.add(pending.card.id);
    return deck.filter((c) => !ids.has(c.id));
  }, [deck, selected, pending]);

  pendingRef.current = pending;
  availableRef.current = available;
  indexRef.current = index;

  // Clamp index after removals only — never fight go() mid-drag
  useEffect(() => {
    if (pending) return;
    if (dragRef.current.active) return;
    if (!available.length) {
      setIndex(0);
      return;
    }
    setIndex((i) => {
      if (i >= 0 && i < available.length) return i;
      return ((i % available.length) + available.length) % available.length;
    });
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
      if (pendingRef.current || !availableRef.current.length) return;
      const len = availableRef.current.length;
      setIndex((i) => ((i + dir) % len + len) % len);
      setDragX(0);
      setDragging(false);
    },
    [],
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
      setDragging(false);

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

  goRef.current = go;
  selectCurrentRef.current = selectCurrent;

  const finishDrag = useCallback((clientX: number, clientY: number) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = clientX - d.x;
    const dy = clientY - d.y;
    d.active = false;
    d.mode = null;
    d.pointerId = null;
    setDragging(false);

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 0.6) {
      // Swipe only changes index — never selects
      goRef.current(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
      selectCurrentRef.current();
    } else {
      setDragX(0);
    }
  }, []);

  const cancelDrag = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    dragRef.current.mode = null;
    dragRef.current.pointerId = null;
    setDragging(false);
    setDragX(0);
  }, []);

  // Native touch listeners — mobile-proof (passive: false so preventDefault works)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (pendingRef.current) return;
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragRef.current = {
        x: t.clientX,
        y: t.clientY,
        active: true,
        mode: 'touch',
        pointerId: null,
      };
      setDragging(true);
      setDragX(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      const d = dragRef.current;
      if (!d.active || d.mode !== 'touch') return;
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - d.x;
      const dy = t.clientY - d.y;
      // Lock horizontal carousel; stop page scroll while dragging sideways
      if (Math.abs(dx) > Math.abs(dy) || Math.abs(dx) > 8) {
        e.preventDefault();
      }
      setDragX(dx);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const d = dragRef.current;
      if (!d.active || d.mode !== 'touch') return;
      const t = e.changedTouches[0];
      if (!t) {
        cancelDrag();
        return;
      }
      finishDrag(t.clientX, t.clientY);
    };

    const onTouchCancel = () => {
      if (dragRef.current.mode === 'touch') cancelDrag();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [cancelDrag, finishDrag]);

  // Pointer fallback (mouse / pen / desktop)
  const onPointerDown = (e: React.PointerEvent) => {
    if (pending) return;
    if (e.pointerType === 'touch') return; // native touch handlers own this
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
      mode: 'pointer',
      pointerId: e.pointerId,
    };
    setDragging(true);
    setDragX(0);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active || d.mode !== 'pointer') return;
    setDragX(e.clientX - d.x);
  };

  const endPointer = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active || d.mode !== 'pointer') return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    finishDrag(e.clientX, e.clientY);
  };

  const onSideClick = (offset: number) => {
    if (pending) return;
    if (offset === 0) {
      selectCurrent();
      return;
    }
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
          className={`carousel-wrap${dragging ? ' is-dragging' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={(e) => {
            if (dragRef.current.mode !== 'pointer') return;
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
            cancelDrag();
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
                    pointerEvents: dragging ? 'none' : 'auto',
                    transition: dragging && offset === 0 ? 'none' : undefined,
                  }}
                  onClick={(ev) => {
                    if (offset === 0) return;
                    ev.stopPropagation();
                    if (pending || dragging) return;
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
