import { useEffect, useMemo, useRef, useState } from 'react';
import {
  POSITION_DESCRIPTIONS,
  SPREAD_POSITIONS,
  type DrawnCard,
  type SpreadPosition,
} from '../types';
import { saveReading } from '../hooks/useOraclePlus';
import { CardVisual } from './CardVisual';
import type { DeckId } from '../types';
import { aspectOfDrawn, speakFortune } from '../lib/fortune';

interface Props {
  drawn: DrawnCard[];
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
  prefetch: (text: string) => void;
  onDrawAgain: () => void;
  onUpsell: () => void;
  plusUnlocked: boolean;
  deckId?: DeckId;
  premiumArt?: boolean;
  onHome?: () => void;
}

function buildSynthesis(drawn: DrawnCard[]): string {
  const names = drawn.map((d) => d.card.name);
  const revCount = drawn.filter((d) => d.reversed).length;
  const shadow = drawn[0];
  const ascension = drawn[4];

  const tone =
    revCount >= 3
      ? 'Shadow falls across most of this spread — not as punishment, but as inventory. What stands inverted here is what you have been carrying unnamed.'
      : revCount === 0
        ? 'Every messenger stands upright. The current favors the one who finally acts on what they already know.'
        : 'Light and shadow are braided through this spread, the way they are in every real life. Neither side is lying to you.';

  return `${tone} Your Shadow (${shadow.card.name}${
    shadow.reversed ? ', in shadow' : ''
  }) is the weight under the floorboards — the thing you feel before you can say it. Your Ascension Path (${ascension.card.name}${
    ascension.reversed ? ', in shadow' : ''
  }) is not the easy road; it is the honest one. Between them — ${names[1]}, ${names[2]}, and ${
    names[3]
  } — the near work is plain: name what stalks you, choose at the crossroads without bargaining, follow the thread you keep pretending not to see, and walk your coming days without soft lies. The Oracle does not carry you out of your life. It shows you the current. You steer — or you are steered.`;
}

// Chad's control (2026-11-08): the reading does NOT auto-play anymore.
// The cards lie on the table; when the user touches one, ITS message
// starts playing in the Tat2face Oracle voice. Every message is
// prefetched silently when the table opens, so a touch starts the voice
// instantly — no generation delay. The synthesis has its own button.

export function Reading({
  drawn,
  speak,
  stop,
  prefetch,
  onDrawAgain,
  onUpsell,
  plusUnlocked,
  deckId = 'veil',
  premiumArt = false,
  onHome,
}: Props) {
  const synthesis = useMemo(() => buildSynthesis(drawn), [drawn]);
  const [active, setActive] = useState<number | 'synthesis' | null>(null);
  const activeRef = useRef<typeof active>(null);
  activeRef.current = active;

  const lines = useMemo(
    () =>
      drawn.map((d, i) => {
        const pos = SPREAD_POSITIONS[i] as SpreadPosition;
        const orient = d.reversed ? 'in shadow aspect' : 'upright';
        const a = aspectOfDrawn(d);
        return speakFortune(a, `${pos}. ${d.card.name}, ${orient}.`);
      }),
    [drawn],
  );
  const synthesisLine = useMemo(() => `Synthesis. ${synthesis}`, [synthesis]);

  useEffect(() => {
    saveReading({
      cards: drawn.map((d) => {
        const a = aspectOfDrawn(d);
        return {
          id: d.card.id,
          name: d.card.name,
          reversed: d.reversed,
          position: SPREAD_POSITIONS[d.position],
          meaning: speakFortune(a),
        };
      }),
      synthesis,
    });
  }, [drawn, synthesis]);

  // Silent warm-up: fetch every message's audio in the background so a
  // touch plays instantly.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const line of [...lines, synthesisLine]) {
        if (cancelled) return;
        prefetch(line);
        // Small stagger so the warm-up never floods the TTS endpoint.
        await new Promise((r) => window.setTimeout(r, 350));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lines, synthesisLine, prefetch]);

  // Leaving the table silences the Oracle.
  useEffect(() => () => stop(), [stop]);

  const playCard = (i: number) => {
    stop();
    setActive(i);
    speak(lines[i], () => {
      if (activeRef.current === i) setActive(null);
    });
  };

  const playSynthesis = () => {
    stop();
    setActive('synthesis');
    speak(synthesisLine, () => {
      if (activeRef.current === 'synthesis') setActive(null);
    });
  };

  return (
    <div className="stage reading-stage fade-in">
      <h2
        className="title-oracle"
        style={{ fontSize: '0.85rem', marginBottom: '0.35rem', letterSpacing: '0.35em' }}
      >
        The Reading
      </h2>
      <p className="teller-credit">The Fortune Teller · Elder of the Crossroads</p>
      <p className="hint-swipe" style={{ marginBottom: '0.75rem' }}>
        Touch a card to hear its message
      </p>

      <div className="spread-grid">
        {drawn.map((d, i) => (
          <div
            key={d.card.id}
            className={`spread-item${active === i ? ' speaking' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Hear the message of ${d.card.name}`}
            onClick={() => playCard(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playCard(i);
              }
            }}
          >
            <span className="pos-label">{SPREAD_POSITIONS[i]}</span>
            <CardVisual
              card={d.card}
              flipped
              reversed={d.reversed}
              size="reading"
              deckId={deckId}
              premiumArt={premiumArt}
            />
            <span className="tap-play-hint" aria-hidden>
              {active === i ? '🔊' : '▶'}
            </span>
          </div>
        ))}
      </div>

      {drawn.map((d, i) => {
        const pos = SPREAD_POSITIONS[i] as SpreadPosition;
        const message = aspectOfDrawn(d);
        return (
          <article key={d.card.id} className="reading-detail">
            <h3>
              {d.card.name}
              {d.reversed ? ' · Shadow' : ''}
            </h3>
            <div className="pos">
              {pos} — {POSITION_DESCRIPTIONS[pos]}
            </div>
            <p className="kw-line">
              {d.card.keywords[0]} · {d.card.keywords[1]}
            </p>
            <p className="fortune-message">{message}</p>
          </article>
        );
      })}

      <div className="synthesis">
        <h3>Synthesis</h3>
        <p>{synthesis}</p>
        <button
          type="button"
          className="btn-ghost hear-synthesis"
          onClick={playSynthesis}
        >
          {active === 'synthesis' ? '🔊 Speaking…' : '🔊 Hear the Synthesis'}
        </button>
      </div>

      <div className="reading-actions">
        <button type="button" className="btn-primary" onClick={onDrawAgain}>
          Draw again
        </button>
        <button type="button" className="btn-ghost" onClick={onUpsell}>
          {plusUnlocked ? 'Oracle+ features' : 'Unlock Oracle+'}
        </button>
        {onHome && (
          <button type="button" className="btn-ghost" onClick={onHome}>
            Hub
          </button>
        )}
      </div>
    </div>
  );
}
