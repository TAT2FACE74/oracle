import { useCallback, useEffect, useState } from 'react';
import type { DeckId } from '../types';
import type { UnlockKind } from '../lib/stripe';

const KEY_PLUS = 'oracle_plus';
const KEY_SHADOW = 'oracle_deck_shadow';
const KEY_GILDED = 'oracle_deck_gilded';
const KEY_DECK = 'oracle_selected_deck';
const KEY_PREMIUM_ART = 'oracle_premium_art';

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string, on: boolean) {
  try {
    if (on) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readDeck(): DeckId {
  try {
    const v = localStorage.getItem(KEY_DECK);
    if (v === 'veil' || v === 'shadow' || v === 'gilded' || v === 'abyss') return v;
  } catch {
    /* ignore */
  }
  return 'veil';
}

export interface Entitlements {
  plus: boolean;
  shadow: boolean;
  gilded: boolean;
}

export function loadEntitlements(): Entitlements {
  return {
    plus: readFlag(KEY_PLUS),
    shadow: readFlag(KEY_SHADOW),
    gilded: readFlag(KEY_GILDED),
  };
}

export function grantUnlock(kind: UnlockKind) {
  if (kind === 'plus') writeFlag(KEY_PLUS, true);
  if (kind === 'shadow') writeFlag(KEY_SHADOW, true);
  if (kind === 'gilded') writeFlag(KEY_GILDED, true);
}

export function useOraclePlus() {
  const [entitlements, setEntitlements] = useState<Entitlements>(loadEntitlements);
  const [deckId, setDeckIdState] = useState<DeckId>(readDeck);
  const [premiumArt, setPremiumArtState] = useState(() => readFlag(KEY_PREMIUM_ART));

  const refresh = useCallback(() => {
    setEntitlements(loadEntitlements());
    setDeckIdState(readDeck());
    setPremiumArtState(readFlag(KEY_PREMIUM_ART));
  }, []);

  const unlock = useCallback((kind: UnlockKind) => {
    grantUnlock(kind);
    setEntitlements(loadEntitlements());
  }, []);

  const setDeckId = useCallback((id: DeckId) => {
    try {
      localStorage.setItem(KEY_DECK, id);
    } catch {
      /* ignore */
    }
    setDeckIdState(id);
  }, []);

  const setPremiumArt = useCallback((on: boolean) => {
    writeFlag(KEY_PREMIUM_ART, on);
    setPremiumArtState(on);
  }, []);

  const canUseDeck = useCallback(
    (id: DeckId) => {
      if (id === 'veil') return true;
      if (id === 'shadow') return entitlements.shadow || entitlements.plus;
      if (id === 'gilded') return entitlements.gilded || entitlements.plus;
      if (id === 'abyss') return entitlements.plus;
      return false;
    },
    [entitlements],
  );

  // If selected deck is no longer allowed, fall back
  useEffect(() => {
    if (!canUseDeck(deckId)) {
      setDeckId('veil');
    }
  }, [canUseDeck, deckId, setDeckId]);

  return {
    unlocked: entitlements.plus,
    entitlements,
    unlock,
    refresh,
    deckId,
    setDeckId,
    premiumArt,
    setPremiumArt,
    canUseDeck,
  };
}

export function saveReading(payload: unknown) {
  try {
    const prev = JSON.parse(localStorage.getItem('oracle_readings') || '[]');
    const next = [
      { id: Date.now(), at: new Date().toISOString(), ...((payload as object) || {}) },
      ...prev,
    ].slice(0, 20);
    localStorage.setItem('oracle_readings', JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
