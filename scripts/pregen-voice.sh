#!/usr/bin/env bash
# Regenerate the static intro clips in the ONE app voice: Fish Audio "Odin".
# Requires FISH_API_KEY and FISH_VOICE_ID in the environment (never in code).
# Until these clips are regenerated AND STATIC_ENABLED is flipped back on in
# src/hooks/useSpeech.ts, the app speaks every line live through /api/tts.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/voice"
MODEL="${FISH_MODEL:-s2.1-pro-free}"

if [[ -z "${FISH_API_KEY:-}" || -z "${FISH_VOICE_ID:-}" ]]; then
  echo "SKIP: set FISH_API_KEY and FISH_VOICE_ID to regenerate clips in the Odin voice." >&2
  exit 1
fi

mkdir -p "$OUT"
gen() {
  local file="$1" text="$2"
  curl -sS -X POST "https://api.fish.audio/v1/tts" \
    -H "Authorization: Bearer ${FISH_API_KEY}" \
    -H "Content-Type: application/json" \
    -H "model: ${MODEL}" \
    -d "{\"text\": $(printf '%s' "$text" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'), \"reference_id\": \"${FISH_VOICE_ID}\", \"format\": \"mp3\", \"normalize\": true}" \
    --output "$OUT/$file"
  echo "wrote $OUT/$file"
}
gen intro-0.mp3 "Beyond ordinary sight, the Ash Realms keep their own ledger. Fate does not ask permission — it sends messengers."
gen intro-1.mp3 "You stand at a threshold of bone and cinder, where veiled courts weigh what you will not admit."
gen intro-2.mp3 "Here, Source speaks in consequence, heat, and silence. Timelines harden. Soft lies go first into the fire."
gen intro-3.mp3 "Ascension is not escape. It is surviving the truth with your spine intact. Enter. The Oracle is already watching."
gen hub-tagline.mp3 "The Ash Realms do not flatter. Choose your path through the veil."
echo "Voice clips written to $OUT (Fish Audio Odin: $FISH_VOICE_ID, model $MODEL)"
