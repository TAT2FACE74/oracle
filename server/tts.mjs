#!/usr/bin/env node
import http from 'node:http';
import { createHash } from 'node:crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = process.env.TTS_VOICE || 'en-US-ChristopherNeural';
const RATE = process.env.TTS_RATE || '-12%';
const PORT = Number(process.env.PORT || 8787);
const cache = new Map();

function hashText(text) {
  return createHash('sha256').update(`${VOICE}|${RATE}|${text}`).digest('hex');
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function synthesize(text) {
  const key = hashText(text);
  if (cache.has(key)) return cache.get(key);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: RATE });
  const buf = await streamToBuffer(audioStream);
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
    res.end(JSON.stringify({ ok: true, voice: VOICE, rate: RATE }));
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
    });
    res.end(audio);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Oracle TTS on :${PORT} voice=${VOICE} rate=${RATE}`);
});
