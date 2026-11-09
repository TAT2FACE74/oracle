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
/** Hold the revealed face before it flips back (time to actually read it). */
const REVEAL_HOLD_MS = 3200;
/** Time for the flip-back animation before the river resumes. */
const FLIP_BACK_MS = 780;
/** Seconds for one card-width of travel — brisk, but tappable. */
const SECONDS_PER_CARD = 0.85;

function pitchForViewport(): number {
  if (typeof window === 'undefined') return 326;
  return Math.round(Math.min(310, window.innerWidth * 0.76)) + 16;
}

type Phase = 'flowing' | 'settling' | 'revealed' | 'returning';

/**
 * The River (Chad's design, 2026-11-08): card backs fly right → left on
 * their own, almost full-screen. The user taps TAP TO CHOOSE (or the river
 * itself) — the stream settles the nearest card dead-center, a shimmer ring
 * runs around its edges, it flips and shows its face, holds, flips back,
 * tucks into the chosen row, and the river runs again. No swiping, no
 * arrows — his phone never liked the swipe, so the river replaced it.
 */
export function CardSelect({ onComplete, deckId = 'veil', premiumArt = false }: Props) {
  const deck = useMemo(() => shuffleDeck(), []);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [phase, setPhase] = useState<Phase>('flowing');
  const [scroll, setScroll] = useState(0);
  const [pitch, setPitch] = useState(pitchForViewport);
  const [caught, setCaught] = useState<{
    abs: number;
    card: OracleCard;
    reversed: boolean;
  } | null>(null);

  const scrollRef = useRef(0);
  const phaseRef = useRef<Phase>('flowing');
  phaseRef.current = phase;
  const targetRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const available = useMemo(() => {
    const ids = new Set(selected.map((s) => s.card.id));
    return deck.filter((c) => !ids.has(c.id));
  }, [deck, selected]);
  const availableRef = useRef(available);
  availableRef.current = available;

  useEffect(() => {
    const onResize = () => setPitch(pitchForViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  // The river engine: one rAF loop drives flow and the settle tween.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const p = phaseRef.current;
      if (p === 'flowing') {
        scrollRef.current += (pitch / SECONDS_PER_CARD) * (dt / 1000);
        setScroll(scrollRef.current);
      } else if (p === 'settling' && targetRef.current != null) {
        const target = targetRef.current;
        const diff = target - scrollRef.current;
        const step = diff * Math.min(1, dt / 70);
        scrollRef.current = Math.abs(diff) < 0.7 ? target : scrollRef.current + step;
        setScroll(scrollRef.current);
        if (scrollRef.current === target) {
          targetRef.current = null;
          setPhase('revealed');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pitch]);

  // Revealed → flip back → commit the catch → river runs again.
  useEffect(() => {
    if (phase !== 'revealed' || !caught) return;
    const hold = window.setTimeout(() => setPhase('returning'), REVEAL_HOLD_MS);
    timersRef.current.push(hold);
    return () => window.clearTimeout(hold);
  }, [phase, caught]);

  useEffect(() => {
    if (phase !== 'returning' || !caught) return;
    const t = window.setTimeout(() => {
      const next: DrawnCard[] = [
        ...selectedRef.current,
        { card: caught.card, reversed: caught.reversed, position: selectedRef.current.length },
      ];
      setSelected(next);
      setCaught(null);
      if (next.length >= MAX) {
        window.setTimeout(() => onComplete(next), 450);
      } else {
        setPhase('flowing');
      }
    }, FLIP_BACK_MS);
    timersRef.current.push(t);
    return () => window.clearTimeout(t);
  }, [phase, caught, onComplete]);

  const beginStop = useCallback(() => {
    if (phaseRef.current !== 'flowing') return;
    const avail = availableRef.current;
    if (!avail.length) return;
    const abs = Math.round(scrollRef.current / pitch);
    targetRef.current = abs * pitch;
    const card = avail[((abs % avail.length) + avail.length) % avail.length];
    setCaught({ abs, card, reversed: Math.random() < 0.3 });
    setPhase('settling');
  }, [pitch]);

  const centerAbs = Math.round(scroll / pitch);
  const slots: number[] = [];
  for (let a = centerAbs - 2; a <= centerAbs + 2; a++) slots.push(a);

  return (
    <div className="stage select-stage fade-in">
      <div className="select-header">
        <h2>Choose five</h2>
        <div className="counter">
          {selected.length}/{MAX}
        </div>
      </div>

      <div className="stream-wrap" onClick={beginStop}>
        {slots.map((a) => {
          const isCaught = caught?.abs === a;
          const x = a * pitch - scroll;
          const dist = Math.abs(x) / pitch;
          const scale = Math.max(0.78, 1 - dist * 0.09);
          const opacity = Math.max(0.25, 1 - dist * 0.28);
          return (
            <div
              key={`s${a}`}
              className={`card-slot${isCaught ? ' slot-chosen' : ''}`}
              style={{
                transform: `translateX(${x}px) scale(${scale})`,
                opacity: isCaught ? 1 : opacity,
                zIndex: isCaught ? 9 : 5 - Math.min(4, Math.round(dist)),
                transition: 'none',
              }}
            >
              <CardVisual
                card={isCaught ? caught!.card : undefined}
                flipped={isCaught && phase === 'revealed'}
                reversed={isCaught ? caught!.reversed : false}
                deckId={deckId}
                premiumArt={premiumArt}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-primary tap-choose"
        disabled={phase !== 'flowing' || selected.length >= MAX || !available.length}
        onClick={beginStop}
      >
        Tap to choose
      </button>
      <p className="hint-swipe">The river runs — tap when it feels right</p>

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
