import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

/**
 * ONE voice everywhere: the Fish Audio "Odin" voice (Chad's pick, 2026-11-08).
 * Set in Vercel env:
 *   FISH_API_KEY   — his Fish Audio API key (secret, never in code)
 *   FISH_VOICE_ID  — the Odin voice model id (reference_id)
 *   FISH_MODEL     — optional, defaults to s2.1-pro-free (same engine, no API
 *                    balance needed; set s2.1-pro later for production SLAs)
 * Until FISH_API_KEY + FISH_VOICE_ID exist, the endpoint falls back to the
 * previous Edge voice so the app never goes silent mid-switch.
 */
const FISH_API_KEY = process.env.FISH_API_KEY || '';
const FISH_VOICE_ID =
  process.env.FISH_VOICE_ID || '468ed781b03c4961b43f307055df5575'; // ODIN by 7C MAFIA YT
const FISH_MODEL = process.env.FISH_MODEL || 's2.1-pro-free';
const FISH_CONFIGURED = Boolean(FISH_API_KEY && FISH_VOICE_ID);

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-EricNeural';
const EDGE_RATE = process.env.EDGE_TTS_RATE || '-18%';
const EDGE_PITCH = process.env.EDGE_TTS_PITCH || '-10Hz';

const mem = new Map<string, Buffer>();

function hashText(text: string) {
  const tag = FISH_CONFIGURED
    ? `fish|${FISH_VOICE_ID}|${FISH_MODEL}`
    : `msedge|${EDGE_VOICE}|${EDGE_RATE}|${EDGE_PITCH}`;
  return createHash('sha256').update(`${tag}|${text}`).digest('hex');
}

async function synthesizeFish(text: string): Promise<Buffer> {
  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FISH_API_KEY}`,
      'Content-Type': 'application/json',
      model: FISH_MODEL,
    },
    body: JSON.stringify({
      text,
      reference_id: FISH_VOICE_ID,
      format: 'mp3',
      latency: 'balanced',
      normalize: true,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Fish Audio TTS ${res.status}: ${detail.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error('Fish Audio returned empty audio');
  return buf;
}

async function synthesizeEdge(text: string): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const tts = new MsEdgeTTS();
  await tts.setMetadata(EDGE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: EDGE_RATE, pitch: EDGE_PITCH });
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buf = Buffer.concat(chunks);
  if (!buf.length) throw new Error('Edge TTS returned empty audio');
  return buf;
}

async function synthesize(text: string): Promise<Buffer> {
  const key = hashText(text);
  if (mem.has(key)) return mem.get(key)!;
  const buf = FISH_CONFIGURED ? await synthesizeFish(text) : await synthesizeEdge(text);
  if (mem.size > 120) mem.delete(mem.keys().next().value!);
  mem.set(key, buf);
  return buf;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      provider: FISH_CONFIGURED ? 'fish' : 'msedge',
      voice_id: FISH_CONFIGURED ? FISH_VOICE_ID : EDGE_VOICE,
      voice_name: FISH_CONFIGURED ? 'Odin (Fish Audio)' : EDGE_VOICE,
      model: FISH_CONFIGURED ? FISH_MODEL : undefined,
      rate: FISH_CONFIGURED ? undefined : EDGE_RATE,
      pitch: FISH_CONFIGURED ? undefined : EDGE_PITCH,
      configured: true,
      fish_configured: FISH_CONFIGURED,
      fish_voice_id: FISH_VOICE_ID,
      fish_voice_name: 'ODIN by 7C MAFIA YT (Oracle Odin)',
      persona: 'Odin — Oracle of the Ash Realms',
      note: FISH_CONFIGURED
        ? 'Single voice: Fish Audio Odin, used for every line.'
        : 'Fish Audio voice selected (ODIN, 468ed781b03c4961b43f307055df5575) but FISH_API_KEY is not set yet — temporary Edge fallback voice.',
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const text = String(req.body?.text ?? '').trim().slice(0, 2500);
    if (!text) return res.status(400).json({ error: 'text required' });
    const audio = await synthesize(text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-TTS-Provider', FISH_CONFIGURED ? 'fish' : 'msedge');
    res.setHeader('X-TTS-Voice', FISH_CONFIGURED ? FISH_VOICE_ID : EDGE_VOICE);
    return res.status(200).send(audio);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
