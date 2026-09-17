# Oracle — Veil of the Ash Realms

Cinematic dark **oracle** web app (not Rider–Waite tarot).

- **Deck:** original 44-card *Veil of the Ash Realms*
- **Spreads:** Daily Transmission (1 card) · Ritual (5 cards)
- **Voice:** The Fortune Teller / Elder of the Crossroads — mature female neural TTS (en-GB-SoniaNeural via edge-tts / Vercel) + prefetched intros
- **Fortunes:** structured **What's coming · Work on this · Watch out for**
- **Art:** original epic fantasy oil–style card plates
- **Unlocks:** Stripe Payment Links (Oracle+ / Shadow / Gilded skins)

## Scripts

```bash
npm run dev
npm run build
npm run deploy          # GitHub Pages → /oracle/
npm run voice:pregen    # regenerate public/voice/*.mp3
python3 scripts/generate-fantasy-art.py
```

Live: https://tat2face74.github.io/oracle/
