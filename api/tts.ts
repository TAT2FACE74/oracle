import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

/** Free deep male stand-in for Odin (no ElevenLabs credits). */
const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-ChristopherNeural';
const EDGE_RATE = process.env.EDGE_TTS_RATE || '-15%';
const EDGE_PITCH = process.env.EDGE_TTS_PITCH || '-6Hz';
const mem = new Map<string, Buffer>();

function hashText(text: string) {
  return createHash('sha256')
    .update(`msedge|${EDGE_VOICE}|${EDGE_RATE}|${EDGE_PITCH}|${text}`)
    .digest('hex');
}

async function synthesizeEdge(text: string): Promise<Buffer> {
  const key = hashText(text);
  if (mem.has(key)) return mem.get(key)!;

  // Dynamic import so cold starts stay light
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
      provider: 'msedge',
      voice_id: EDGE_VOICE,
      rate: EDGE_RATE,
      pitch: EDGE_PITCH,
      configured: true,
      persona: 'Odin (free) — Oracle of the Ash Realms',
      note: 'Free Microsoft Edge neural voice; no ElevenLabs quota',
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const text = String(req.body?.text ?? '').trim().slice(0, 2500);
    if (!text) return res.status(400).json({ error: 'text required' });
    const audio = await synthesizeEdge(text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-TTS-Provider', 'msedge');
    res.setHeader('X-TTS-Voice', EDGE_VOICE);
    return res.status(200).send(audio);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
