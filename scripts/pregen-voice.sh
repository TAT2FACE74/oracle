#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EDGE="$ROOT/.venv/bin/edge-tts"
OUT="$ROOT/public/voice"
VOICE="${TTS_VOICE:-en-US-ChristopherNeural}"
RATE="${TTS_RATE:--12%}"
mkdir -p "$OUT"
gen() { "$EDGE" --voice "$VOICE" --rate="$RATE" --text "$2" --write-media "$OUT/$1"; }
gen intro-0.mp3 "Beyond ordinary sight, the Ash Realms keep their own ledger. Fate does not ask permission — it sends messengers."
gen intro-1.mp3 "You stand at a threshold of bone and cinder, where veiled courts weigh what you will not admit."
gen intro-2.mp3 "Here, Source speaks in consequence, heat, and silence. Timelines harden. Soft lies go first into the fire."
gen intro-3.mp3 "Ascension is not escape. It is surviving the truth with your spine intact. Enter. The Oracle is already watching."
gen hub-tagline.mp3 "The Ash Realms do not flatter. Choose your path through the veil."
echo "Voice clips written to $OUT"
