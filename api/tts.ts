import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = process.env.TTS_VOICE || 'en-US-ChristopherNeural';
const RATE = process.env.TTS_RATE || '-12%';
const mem = new Map<string, Buffer>();

function hashText(text: string) {
  return createHash('sha256').update(`${VOICE}|${RATE}|${text}`).digest('hex');
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function synthesize(text: string): Promise<Buffer> {
  const key = hashText(text);
  if (mem.has(key)) return mem.get(key)!;

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: RATE });
  const buf = await streamToBuffer(audioStream as NodeJS.ReadableStream);

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
    return res.status(200).json({ ok: true, voice: VOICE, rate: RATE });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const text = String(req.body?.text ?? '').trim().slice(0, 2500);
    if (!text) return res.status(400).json({ error: 'text required' });
    const audio = await synthesize(text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(audio);
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
