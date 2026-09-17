import type { DrawnCard, FortuneMessage, OracleCard } from '../types';

export function aspectOf(card: OracleCard, reversed: boolean): FortuneMessage {
  return reversed ? card.reversed : card.upright;
}

export function aspectOfDrawn(d: DrawnCard): FortuneMessage {
  return aspectOf(d.card, d.reversed);
}

/** Plain prose for TTS — message only (no category labels). */
export function speakFortune(message: FortuneMessage, intro?: string): string {
  return intro ? `${intro} ${message}` : message;
}

export function formatFortunePlain(message: FortuneMessage): string {
  return message;
}
