import { useCallback, useEffect, useRef, useState } from 'react';

/** Prefetched cinematic clips — keys must match spoken strings exactly. */
const STATIC_VOICE: Record<string, string> = {
  'Beyond ordinary sight, the Ash Realms keep their own ledger. Fate does not ask permission — it sends messengers.':
    'voice/intro-0.mp3',
  'You stand at a threshold of bone and cinder, where veiled courts weigh what you will not admit.':
    'voice/intro-1.mp3',
  'Here, Source speaks in consequence, heat, and silence. Timelines harden. Soft lies go first into the fire.':
    'voice/intro-2.mp3',
  'Ascension is not escape. It is surviving the truth with your spine intact. Enter. The Oracle is already watching.':
    'voice/intro-3.mp3',
  'The Ash Realms do not flatter. Choose your path through the veil.': 'voice/hub-tagline.mp3',
};

function ttsEndpoint(): string | null {
  const env = (import.meta.env.VITE_TTS_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, '');
  // Dev convenience: local server
  if (import.meta.env.DEV) return 'http://127.0.0.1:8787';
  return null;
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const memoryCache = new Map<string, string>();

async function cacheGet(key: string): Promise<Blob | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const c = await caches.open('oracle-tts-v1');
    const res = await c.match(`tts://${key}`);
    return res ? await res.blob() : null;
  } catch {
    return null;
  }
}

async function cachePut(key: string, blob: Blob) {
  if (typeof caches === 'undefined') return;
  try {
    const c = await caches.open('oracle-tts-v1');
    await c.put(
      `tts://${key}`,
      new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }),
    );
  } catch {
    /* ignore */
  }
}

async function fetchNeuralAudio(text: string): Promise<string | null> {
  const staticPath = STATIC_VOICE[text];
  if (staticPath) {
    return `${import.meta.env.BASE_URL}${staticPath}`;
  }

  const key = await sha256(text);
  if (memoryCache.has(key)) return memoryCache.get(key)!;

  const cached = await cacheGet(key);
  if (cached) {
    const url = URL.createObjectURL(cached);
    memoryCache.set(key, url);
    return url;
  }

  const endpoint = ttsEndpoint();
  if (!endpoint) return null;

  const res = await fetch(`${endpoint}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}`);
  const blob = await res.blob();
  await cachePut(key, blob);
  const url = URL.createObjectURL(blob);
  memoryCache.set(key, url);
  return url;
}

export function useSpeech() {
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const cancelledRef = useRef(false);
  const genRef = useRef(0);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    genRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    setSpeaking(false);
    queueRef.current = Promise.resolve();
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (muted) {
        setCaption(text);
        onEnd?.();
        return;
      }

      cancelledRef.current = false;
      const myGen = genRef.current;
      setCaption(text);

      queueRef.current = queueRef.current.then(async () => {
        if (cancelledRef.current || myGen !== genRef.current) {
          onEnd?.();
          return;
        }
        try {
          const url = await fetchNeuralAudio(text);
          if (cancelledRef.current || myGen !== genRef.current) {
            onEnd?.();
            return;
          }
          if (!url) {
            // Caption-only fallback — never speechSynthesis
            onEnd?.();
            return;
          }
          await new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audioRef.current = audio;
            setSpeaking(true);
            const done = () => {
              setSpeaking(false);
              if (audioRef.current === audio) audioRef.current = null;
              resolve();
            };
            audio.onended = done;
            audio.onerror = done;
            void audio.play().catch(done);
          });
        } catch {
          setSpeaking(false);
        }
        if (!cancelledRef.current && myGen === genRef.current) onEnd?.();
      });
    },
    [muted],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) {
        cancelledRef.current = true;
        genRef.current += 1;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setSpeaking(false);
      }
      return !m;
    });
  }, []);

  return { speak, stop, muted, toggleMute, speaking, caption, voicesReady: true };
}
