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
import { aspectOfDrawn, speakFortune } from '../lib/fortune';

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

function FortuneSections({ coming, workOn, watchFor }: { coming: string; workOn: string; watchFor: string }) {
  return (
    <div className="fortune-sections">
      <div className="fortune-block">
        <h4>What&apos;s coming</h4>
        <p>{coming}</p>
      </div>
      <div className="fortune-block">
        <h4>Work on this</h4>
        <p>{workOn}</p>
      </div>
      <div className="fortune-block">
        <h4>Watch out for</h4>
        <p>{watchFor}</p>
      </div>
    </div>
  );
}

function buildSynthesis(drawn: DrawnCard[]): string {
  const names = drawn.map((d) => d.card.name);
  const revCount = drawn.filter((d) => d.reversed).length;
  const shadow = drawn[0];
  const ascension = drawn[4];

  const tone =
    revCount >= 3
      ? 'The messengers lean into shadow — inverted forces demand honesty before any rise.'
      : revCount === 0
        ? 'The messengers stand upright; the current favors deliberate, costly alignment.'
        : 'Upright and shadow braid together; neither will be bargained away.';

  return `${tone} Your Shadow (${shadow.card.name}${
    shadow.reversed ? ', in shadow' : ''
  }) stains the field, while the Ascension Path (${ascension.card.name}${
    ascension.reversed ? ', in shadow' : ''
  }) names the harder trajectory. Between them — ${names[1]}, ${names[2]}, and ${
    names[3]
  } — the near work is mercilessly clear: name what stalks you, choose at the crossroads, follow the hidden thread, and walk the timeline without soft lies. The Fortune Teller does not rescue you. She reveals the current. You steer — or you are steered.`;
}

export function Reading({
  drawn,
  speak,
  stop,
  onDrawAgain,
  onUpsell,
  plusUnlocked,
  deckId = 'veil',
  premiumArt = false,
  onHome,
}: Props) {
  const synthesis = useMemo(() => buildSynthesis(drawn), [drawn]);
  const spokenRef = useRef(false);

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

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    let cancelled = false;
    const lines: string[] = [];

    drawn.forEach((d, i) => {
      const pos = SPREAD_POSITIONS[i] as SpreadPosition;
      const orient = d.reversed ? 'in shadow aspect' : 'upright';
      const a = aspectOfDrawn(d);
      lines.push(
        speakFortune(a, `${pos}. ${d.card.name}, ${orient}.`),
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
        style={{ fontSize: '0.85rem', marginBottom: '0.35rem', letterSpacing: '0.35em' }}
      >
        The Reading
      </h2>
      <p className="teller-credit">The Fortune Teller · Elder of the Crossroads</p>

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
        const a = aspectOfDrawn(d);
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
            <FortuneSections coming={a.coming} workOn={a.workOn} watchFor={a.watchFor} />
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
