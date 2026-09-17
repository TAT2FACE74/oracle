import type { DrawnCard, FortuneAspect, OracleCard } from '../types';

export function aspectOf(card: OracleCard, reversed: boolean): FortuneAspect {
  return reversed ? card.reversed : card.upright;
}

export function aspectOfDrawn(d: DrawnCard): FortuneAspect {
  return aspectOf(d.card, d.reversed);
}

/** Plain prose for TTS — three labeled sections in order. */
export function speakFortune(aspect: FortuneAspect, intro?: string): string {
  const body = [
    `What's coming. ${aspect.coming}`,
    `Work on this. ${aspect.workOn}`,
    `Watch out for. ${aspect.watchFor}`,
  ].join(' ');
  return intro ? `${intro} ${body}` : body;
}

export function formatFortunePlain(aspect: FortuneAspect): string {
  return `${aspect.coming} ${aspect.workOn} ${aspect.watchFor}`;
}
