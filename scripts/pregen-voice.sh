#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EDGE="$ROOT/.venv/bin/edge-tts"
OUT="$ROOT/public/voice"
# Prefer mature female: Nancy if present, else Sonia / Michelle
VOICE="${TTS_VOICE:-en-GB-SoniaNeural}"
if [[ -z "$VOICE" ]]; then
  if "$EDGE" --list-voices 2>/dev/null | grep -q 'en-US-NancyNeural'; then
    VOICE='en-US-NancyNeural'
  elif "$EDGE" --list-voices 2>/dev/null | grep -q 'en-GB-SoniaNeural'; then
    VOICE='en-GB-SoniaNeural'
  else
    VOICE='en-US-MichelleNeural'
  fi
fi
RATE="${TTS_RATE:--10%}"
PITCH="${TTS_PITCH:--2Hz}"
mkdir -p "$OUT"
echo "Pregen voice=$VOICE rate=$RATE pitch=$PITCH"
gen() { "$EDGE" --voice "$VOICE" --rate="$RATE" --pitch="$PITCH" --text "$2" --write-media "$OUT/$1"; }
gen intro-0.mp3 "Beyond ordinary sight, the Ash Realms keep their own ledger. Fate does not ask permission — it sends messengers."
gen intro-1.mp3 "You stand at a threshold of bone and cinder, where veiled courts weigh what you will not admit."
gen intro-2.mp3 "Here, Source speaks in consequence, heat, and silence. Timelines harden. Soft lies go first into the fire."
gen intro-3.mp3 "Ascension is not escape. It is surviving the truth with your spine intact. Enter. The Oracle is already watching."
gen hub-tagline.mp3 "The Ash Realms do not flatter. Choose your path through the veil."
echo "Voice clips written to $OUT ($VOICE)"
