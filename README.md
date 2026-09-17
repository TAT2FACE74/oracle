# Oracle — Veil of the Ash Realms

Cinematic dark **oracle** web app (not Rider–Waite tarot).

- **Deck:** original 44-card *Veil of the Ash Realms*
- **Spreads:** Daily Transmission (1 card) · Ritual (5 cards)
- **Voice:** neural TTS (Christopher) via Vercel API + prefetched intros
- **Unlocks:** Stripe Payment Links (Oracle+ / Shadow / Gilded skins)

## Scripts

```bash
npm run dev
npm run build
npm run deploy          # GitHub Pages → /oracle/
npm run voice:pregen    # regenerate public/voice/*.mp3
python3 scripts/generate-veil-cards.py
```

Live: https://tat2face74.github.io/oracle/
