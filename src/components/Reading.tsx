import { useEffect, useMemo, useRef } from 'react';
import {
  POSITION_DESCRIPTIONS,
  SPREAD_POSITIONS,
  type DrawnCard,
  type SpreadPosition,
} from '../types';
import { saveReading } from '../hooks/useOraclePlus';
import { CardVisual } from './CardVisual';
import type { DeckId } from '../types';

interface Props {
  drawn: DrawnCard[];
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
  onDrawAgain: () => void;
  onUpsell: () => void;
  plusUnlocked: boolean;
  deckId?: DeckId;
  premiumArt?: boolean;
  onHome?: () => void;
}

function meaningOf(d: DrawnCard): string {
  return d.reversed ? d.card.reversed : d.card.upright;
}

function buildSynthesis(drawn: DrawnCard[]): string {
  const names = drawn.map((d) => d.card.name);
  const revCount = drawn.filter((d) => d.reversed).length;
  const shadow = drawn[0];
  const ascension = drawn[4];

  const tone =
    revCount >= 3
      ? 'The spread leans into shadow work — inverted forces ask for honesty before ascent.'
      : revCount === 0
        ? 'The forces stand upright; momentum favors conscious alignment.'
        : 'Light and shadow braid together; neither can be ignored.';

  return `${tone} Your Shadow (${shadow.card.name}${
    shadow.reversed ? ', reversed' : ''
  }) colors the field, while the Ascension Path (${ascension.card.name}${
    ascension.reversed ? ', reversed' : ''
  }) names the higher trajectory. Between them — ${names[1]}, ${names[2]}, and ${
    names[3]
  } — the near work is clear: name what binds you, choose at the crossroads, follow the hidden thread, and walk the timeline with intention. The Oracle does not decide for you. It reveals the current. You steer.`;
}

export function Reading({
  drawn,
  speak,
  stop,
  onDrawAgain,
  onUpsell,
  plusUnlocked,
  deckId = 'rws',
  premiumArt = false,
  onHome,
}: Props) {
  const synthesis = useMemo(() => buildSynthesis(drawn), [drawn]);
  const spokenRef = useRef(false);

  useEffect(() => {
    saveReading({
      cards: drawn.map((d) => ({
        id: d.card.id,
        name: d.card.name,
        reversed: d.reversed,
        position: SPREAD_POSITIONS[d.position],
        meaning: meaningOf(d),
      })),
      synthesis,
    });
  }, [drawn, synthesis]);

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    let cancelled = false;
    const lines: string[] = [];

    drawn.forEach((d, i) => {
      const pos = SPREAD_POSITIONS[i] as SpreadPosition;
      const orient = d.reversed ? 'reversed' : 'upright';
      lines.push(
        `${pos}. ${d.card.name}, ${orient}. ${meaningOf(d)}`,
      );
    });
    lines.push(`Synthesis. ${synthesis}`);

    const speakNext = (i: number) => {
      if (cancelled || i >= lines.length) return;
      speak(lines[i], () => speakNext(i + 1));
    };
    speakNext(0);

    return () => {
      cancelled = true;
      stop();
    };
  }, [drawn, synthesis, speak, stop]);

  return (
    <div className="stage reading-stage fade-in">
      <h2
        className="title-oracle"
        style={{ fontSize: '0.85rem', marginBottom: '1.25rem', letterSpacing: '0.35em' }}
      >
        The Reading
      </h2>

      <div className="spread-grid">
        {drawn.map((d, i) => (
          <div key={d.card.id} className="spread-item">
            <span className="pos-label">{SPREAD_POSITIONS[i]}</span>
            <CardVisual
              card={d.card}
              flipped
              reversed={d.reversed}
              size="reading"
              deckId={deckId}
              premiumArt={premiumArt}
            />
          </div>
        ))}
      </div>

      {drawn.map((d, i) => {
        const pos = SPREAD_POSITIONS[i] as SpreadPosition;
        return (
          <article key={d.card.id} className="reading-detail">
            <h3>
              {d.card.name}
              {d.reversed ? ' · Reversed' : ''}
            </h3>
            <div className="pos">
              {pos} — {POSITION_DESCRIPTIONS[pos]}
            </div>
            <p>{meaningOf(d)}</p>
          </article>
        );
      })}

      <div className="synthesis">
        <h3>Synthesis</h3>
        <p>{synthesis}</p>
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
