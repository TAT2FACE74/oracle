#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EDGE="$ROOT/.venv/bin/edge-tts"
OUT="$ROOT/public/voice"
VOICE="${TTS_VOICE:-en-US-ChristopherNeural}"
RATE="${TTS_RATE:--12%}"
mkdir -p "$OUT"
gen() { "$EDGE" --voice "$VOICE" --rate="$RATE" --text "$2" --write-media "$OUT/$1"; }
gen intro-0.mp3 "Beyond the veil of ordinary sight, fate and destiny braid themselves into the fabric of all that is."
gen intro-1.mp3 "You stand at the threshold of the shadow realm — a place of mysticism, where other-dimensional planes touch this one."
gen intro-2.mp3 "Here, Source speaks in energy, vibration, and frequency. Timelines shimmer. Enlightenment waits for those who listen."
gen intro-3.mp3 "Ascension is not escape. It is remembering. Enter, seeker. The Oracle awaits."
gen hub-tagline.mp3 "Choose your path through the veil."
echo "Voice clips written to $OUT"
