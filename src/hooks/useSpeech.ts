import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERRED_VOICE_HINTS = [
  'daniel',
  'david',
  'james',
  'mark',
  'alex',
  'fred',
  'bruce',
  'lee',
  'rishi',
  'thomas',
  'google uk english male',
  'microsoft david',
  'microsoft mark',
  'microsoft guy',
];

function pickDeepMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const lower = (s: string) => s.toLowerCase();
  const english = voices.filter(
    (v) => lower(v.lang).startsWith('en') || lower(v.lang).includes('en-'),
  );
  const pool = english.length ? english : voices;

  for (const hint of PREFERRED_VOICE_HINTS) {
    const found = pool.find((v) => lower(v.name).includes(hint));
    if (found) return found;
  }

  const male = pool.find(
    (v) =>
      lower(v.name).includes('male') && !lower(v.name).includes('female'),
  );
  if (male) return male;

  // Prefer lower-index / deeper-sounding en-GB / en-US
  return pool.find((v) => lower(v.lang).includes('en-gb')) || pool[0] || null;
}

export function useSpeech() {
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const load = () => {
      voiceRef.current = pickDeepMaleVoice();
      setVoicesReady(true);
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return;
      }
      if (muted) {
        onEnd?.();
        return;
      }

      cancelledRef.current = false;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.pitch = 0.65;
      utter.rate = 0.8;
      utter.volume = 1;
      if (voiceRef.current) utter.voice = voiceRef.current;

      utter.onstart = () => setSpeaking(true);
      utter.onend = () => {
        setSpeaking(false);
        if (!cancelledRef.current) onEnd?.();
      };
      utter.onerror = () => {
        setSpeaking(false);
        if (!cancelledRef.current) onEnd?.();
      };

      window.speechSynthesis.speak(utter);
    },
    [muted],
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
      return !m;
    });
  }, []);

  return { speak, stop, muted, toggleMute, speaking, voicesReady };
}
