import { DECK } from '../data/deck';
import type { DrawnCard, OracleCard } from '../types';
import { aspectOf, speakFortune } from './fortune';

/** Deterministic hash of a string → unsigned 32-bit. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dailyStorageKey(date = todayKey()): string {
  return `oracle_daily_${date}`;
}

export interface DailyPayload {
  date: string;
  cardId: string;
  reversed: boolean;
  fortune: string;
}

export function loadDaily(date = todayKey()): DailyPayload | null {
  try {
    const raw = localStorage.getItem(dailyStorageKey(date));
    if (!raw) return null;
    return JSON.parse(raw) as DailyPayload;
  } catch {
    return null;
  }
}

export function saveDaily(payload: DailyPayload): void {
  try {
    localStorage.setItem(dailyStorageKey(payload.date), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function drawDailyCard(date = todayKey()): { card: OracleCard; reversed: boolean } {
  const h = hashString(`oracle-daily:${date}`);
  const idx = h % DECK.length;
  const reversed = (h >>> 16) % 2 === 1;
  return { card: DECK[idx], reversed };
}

export function buildDailyFortune(card: OracleCard, reversed: boolean): string {
  const orient = reversed ? 'reversed' : 'upright';
  const punch = reversed
    ? 'Today the messenger leans into shadow — do not flinch.'
    : 'Today the messenger favors conscious motion — claim the cost.';
  const aspect = aspectOf(card, reversed);
  return speakFortune(
    aspect,
    `Daily Transmission: ${card.name} (${orient}). ${punch}`,
  ) + ' Carry this transmission until midnight. The Ash Realms do not repeat themselves lightly.';
}

export function getOrCreateDaily(): {
  drawn: DrawnCard;
  fortune: string;
  date: string;
  fresh: boolean;
} {
  const date = todayKey();
  const existing = loadDaily(date);
  if (existing) {
    const card = DECK.find((c) => c.id === existing.cardId) || DECK[0];
    // Rebuild fortune from current structured deck so TTS/UI stay in sync after upgrades
    const fortune = buildDailyFortune(card, existing.reversed);
    return {
      drawn: { card, reversed: existing.reversed, position: 0 },
      fortune,
      date,
      fresh: false,
    };
  }
  const { card, reversed } = drawDailyCard(date);
  const fortune = buildDailyFortune(card, reversed);
  saveDaily({ date, cardId: card.id, reversed, fortune });
  return {
    drawn: { card, reversed, position: 0 },
    fortune,
    date,
    fresh: true,
  };
}
