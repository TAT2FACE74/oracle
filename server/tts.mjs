#!/usr/bin/env node
import http from 'node:http';
import { createHash } from 'node:crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/**
 * Local dev mirror of api/tts.ts — ONE voice: Fish Audio "Odin".
 * Needs FISH_API_KEY + FISH_VOICE_ID in env; falls back to the old Edge
 * voice until both are set so the app never goes silent mid-switch.
 */
const FISH_API_KEY = process.env.FISH_API_KEY || '';
const FISH_VOICE_ID =
  process.env.FISH_VOICE_ID || '468ed781b03c4961b43f307055df5575'; // ODIN by 7C MAFIA YT
const FISH_MODEL = process.env.FISH_MODEL || 's2.1-pro-free';
const FISH_CONFIGURED = Boolean(FISH_API_KEY && FISH_VOICE_ID);

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-EricNeural';
const EDGE_RATE = process.env.EDGE_TTS_RATE || '-18%';
const EDGE_PITCH = process.env.EDGE_TTS_PITCH || '-10Hz';
const PORT = Number(process.env.PORT || 8787);
const cache = new Map();

function hashText(text) {
  const tag = FISH_CONFIGURED
    ? `fish|${FISH_VOICE_ID}|${FISH_MODEL}`
    : `msedge|${EDGE_VOICE}|${EDGE_RATE}|${EDGE_PITCH}`;
  return createHash('sha256').update(`${tag}|${text}`).digest('hex');
}

async function synthesizeFish(text) {
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

async function synthesizeEdge(text) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(EDGE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: EDGE_RATE, pitch: EDGE_PITCH });
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buf = Buffer.concat(chunks);
  if (!buf.length) throw new Error('Edge TTS returned empty audio');
  return buf;
}

async function synthesize(text) {
  const key = hashText(text);
  if (cache.has(key)) return cache.get(key);
  const buf = FISH_CONFIGURED ? await synthesizeFish(text) : await synthesizeEdge(text);
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  cache.set(key, buf);
  return buf;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url === '/health' || (req.url === '/api/tts' && req.method === 'GET')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        provider: FISH_CONFIGURED ? 'fish' : 'msedge',
        voice_id: FISH_CONFIGURED ? FISH_VOICE_ID : EDGE_VOICE,
        voice_name: FISH_CONFIGURED ? 'Odin (Fish Audio)' : EDGE_VOICE,
        model: FISH_CONFIGURED ? FISH_MODEL : undefined,
        configured: true,
        fish_configured: FISH_CONFIGURED,
        persona: 'Odin — Oracle of the Ash Realms',
      }),
    );
    return;
  }
  if (!(req.url === '/api/tts' || req.url === '/tts') || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const text = String(body.text || '').trim().slice(0, 2500);
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'text required' }));
      return;
    }
    const audio = await synthesize(text);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': audio.length,
      'X-TTS-Provider': FISH_CONFIGURED ? 'fish' : 'msedge',
      'X-TTS-Voice': FISH_CONFIGURED ? FISH_VOICE_ID : EDGE_VOICE,
    });
    res.end(audio);
  } catch (e) {
    const msg = String(e.message || e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    FISH_CONFIGURED
      ? `Oracle TTS on :${PORT} provider=fish voice=${FISH_VOICE_ID} model=${FISH_MODEL}`
      : `Oracle TTS on :${PORT} provider=msedge (Fish not configured) voice=${EDGE_VOICE} rate=${EDGE_RATE} pitch=${EDGE_PITCH}`,
  );
});
