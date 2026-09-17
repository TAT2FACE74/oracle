import { useCallback, useState } from 'react';

const KEY = 'oracle_plus';

export function useOraclePlus() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setUnlocked(false);
  }, []);

  return { unlocked, unlock, lock };
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
