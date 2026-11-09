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
const REVEAL_HOLD_MS = 3200;
/** Release past this distance (px) and the swipe turns the card. */
const SWIPE_THRESHOLD = 55;
/** Movement under this (px) counts as a tap, not a drag. */
const TAP_THRESHOLD = 10;

function stepForViewport(): number {
  if (typeof window === 'undefined') return 190;
  return Math.round(Math.min(215, Math.max(150, window.innerWidth * 0.52)));
}

export function CardSelect({ onComplete, deckId = 'veil', premiumArt = false }: Props) {
  const deck = useMemo(() => shuffleDeck(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [pending, setPending] = useState<{ card: OracleCard; reversed: boolean } | null>(
    null,
  );
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(stepForViewport);
  const wrapRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startT: number;
    startOffset: number;
  }>({ active: false, pointerId: null, startX: 0, startY: 0, startT: 0, startOffset: 0 });

  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const selectedCountRef = useRef(selected.length);
  selectedCountRef.current = selected.length;

  const available = useMemo(() => {
    const ids = new Set(selected.map((s) => s.card.id));
    if (pending) ids.add(pending.card.id);
    return deck.filter((c) => !ids.has(c.id));
  }, [deck, selected, pending]);

  const availableRef = useRef(available);
  availableRef.current = available;

  useEffect(() => {
    const onResize = () => setStep(stepForViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Clamp index after removals only — never fight a drag in progress
  useEffect(() => {
    if (pending || dragRef.current.active) return;
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

  const go = useCallback((dir: number) => {
    if (pendingRef.current || !availableRef.current.length) return;
    const len = availableRef.current.length;
    setIndex((i) => (((i + dir) % len) + len) % len);
  }, []);

  const selectAt = useCallback(
    (cardIndex: number) => {
      if (pendingRef.current || selectedCountRef.current >= MAX) return;
      const avail = availableRef.current;
      if (!avail.length) return;
      const len = avail.length;
      const i = ((cardIndex % len) + len) % len;
      const card = avail[i];
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
    [onComplete],
  );

  const selectCurrent = useCallback(() => {
    if (pendingRef.current) return;
    const avail = availableRef.current;
    if (!avail.length) return;
    const idx =
      ((index % avail.length) + avail.length) % avail.length;
    selectAt(idx);
  }, [index, selectAt]);

  const selectCurrentRef = useRef(selectCurrent);
  selectCurrentRef.current = selectCurrent;
  const goRef = useRef(go);
  goRef.current = go;

  /* ——— One gesture system: Pointer Events (touch + mouse), capture on the wrap ——— */

  const onPointerDown = (e: React.PointerEvent) => {
    if (pendingRef.current) return;
    if (e.button !== undefined && e.button !== 0) return;
    const slot = (e.target as HTMLElement).closest('[data-offset]');
    const startOffset = slot ? Number(slot.getAttribute('data-offset')) || 0 : 0;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startT: performance.now(),
      startOffset,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(true);
    setDragX(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    setDragX(e.clientX - d.startX);
  };

  const endDrag = (e: React.PointerEvent, cancelled: boolean) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    d.active = false;
    d.pointerId = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(false);

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const dt = performance.now() - d.startT;
    setDragX(0);
    if (cancelled || pendingRef.current) return;

    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) >= Math.abs(dy)) {
      goRef.current(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD && dt < 600) {
      // A tap: center card selects; a side card slides to center
      if (d.startOffset === 0) {
        selectCurrentRef.current();
      } else {
        goRef.current(d.startOffset > 0 ? 1 : -1);
      }
    }
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
        <div
          ref={wrapRef}
          className={`carousel-wrap${dragging ? ' is-dragging' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          <div className="carousel-track">
            {visible.map(({ card, offset }) => {
              const isPending = pending?.card.id === card.id && offset === 0;
              const x = offset * step + dragX;
              const scale = offset === 0 ? 1 : 0.8 - Math.abs(offset) * 0.07;
              const opacity = offset === 0 ? 1 : 0.5 - Math.abs(offset) * 0.12;
              const rot = offset * 5;
              return (
                <div
                  key={`${card.id}-${offset}`}
                  data-offset={offset}
                  className={`card-slot ${offset === 0 ? 'center' : ''}`}
                  style={{
                    transform: `translateX(${x}px) scale(${scale}) rotate(${rot}deg)`,
                    opacity: Math.max(0.12, opacity),
                    zIndex: 5 - Math.abs(offset),
                    transition: dragging ? 'none' : undefined,
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
      </div>

      <p className="hint-swipe">Swipe to browse · Tap the card to choose it</p>

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
