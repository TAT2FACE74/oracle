#!/usr/bin/env node
import http from 'node:http';
import { createHash } from 'node:crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const EDGE_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-ChristopherNeural';
const EDGE_RATE = process.env.EDGE_TTS_RATE || '-15%';
const EDGE_PITCH = process.env.EDGE_TTS_PITCH || '-6Hz';
const PORT = Number(process.env.PORT || 8787);
const cache = new Map();

function hashText(text) {
  return createHash('sha256')
    .update(`msedge|${EDGE_VOICE}|${EDGE_RATE}|${EDGE_PITCH}|${text}`)
    .digest('hex');
}

async function synthesize(text) {
  const key = hashText(text);
  if (cache.has(key)) return cache.get(key);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(EDGE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: EDGE_RATE, pitch: EDGE_PITCH });
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buf = Buffer.concat(chunks);
  if (!buf.length) throw new Error('Edge TTS returned empty audio');
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
        provider: 'msedge',
        voice_id: EDGE_VOICE,
        rate: EDGE_RATE,
        pitch: EDGE_PITCH,
        configured: true,
        persona: 'Odin (free) — Oracle of the Ash Realms',
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
      'X-TTS-Provider': 'msedge',
      'X-TTS-Voice': EDGE_VOICE,
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
    `Oracle TTS on :${PORT} provider=msedge voice=${EDGE_VOICE} rate=${EDGE_RATE} pitch=${EDGE_PITCH}`,
  );
});
