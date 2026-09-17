# Oracle

A cinematic, dark-themed tarot web app. Mobile-first. Crimson on obsidian.

## Journey

`intro → incantation → eyes → fire → select → reveal → reading → upsell`

1. **Intro** — Tap to unlock audio, then Web Speech narration with captions (skip after 3s).
2. **Incantation** — Recite the occult verse; hold “I have spoken” ~2s to continue.
3. **Eyes** — Stare at the red orb (10s → green); shadowed face fades in at 5s.
4. **Fire** — Canvas flame transition (~2s).
5. **Select** — Swipe/drag ornate card backs; tap to select 5. ~30% reversed. 3D flip reveal.
6. **Reading** — Shadow · Crossroads · Hidden Thread · Near Timeline · Ascension Path. Spoken aloud. Saved to `localStorage`.
7. **Oracle+** — Mock $9.99 unlock sets `oracle_plus` and gates premium features.

## Stack

Vite + React + TypeScript. Pure CSS (no Tailwind). All 78 RWS cards with upright/reversed meanings.

## Run

```bash
cd /workspace/oracle
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Open **http://localhost:5173** (or this machine’s LAN IP on port 5173).

## Build

```bash
npm run build
```

Output: `dist/`

## Notes

- First tap is required so browsers allow Web Speech / audio context.
- Narration: pitch `0.65`, rate `0.8`, prefers deepest available male English voice.
- Mute toggle (top-right) on most stages.
- Readings persist under `localStorage` key `oracle_readings`; Plus unlock under `oracle_plus`.
