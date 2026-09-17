#!/usr/bin/env python3
"""Generate 44 original fantasy-oil card scenes via Pollinations (rate-limit friendly)."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "cards"
OUT.mkdir(parents=True, exist_ok=True)
LOG = ROOT / "scripts" / "art-progress.log"

STYLE = (
    "epic fantasy oil painting, dramatic chiaroscuro, rich saturated oils, "
    "cinematic fantasy realism, stormy sky, painterly brushwork, "
    "1970s 1980s fantasy paperback cover style, original character, no text, no watermark"
)

CARDS = [
    (1, "ash-covered herald messenger with glowing ember scroll, cinders falling, fiery storm"),
    (2, "skeletal sacred abbess in cathedral gloom, bone rosary, moonlight stained glass"),
    (3, "hollow ornate crown floating above shadowed throne, violet mist, ruined palace"),
    (4, "mourning widow in ash veils in burnt garden, ember tears, night remembrance"),
    (5, "armored warden cupping fragile green ember flame, night watch tower"),
    (6, "hooded veil reaper harvesting glowing threads, twilight field, light scythe"),
    (7, "iron-masked confessor with scales, torchlit confession chamber"),
    (8, "blood geometer drawing crimson geometry, ritual chalk circles"),
    (9, "night orchard of luminous forbidden fruit, underworld garden"),
    (10, "pale cartographer with erased-road map, cold moon, exile cliffs"),
    (11, "thorn-crowned diplomat at table of blades and blood roses"),
    (12, "ghost choir of skull singers in graveyard mist"),
    (13, "salt-scarred mercenary with curved blade, crystal salt armor"),
    (14, "saint before cracked sacred mirror, dual faces, silver violet light"),
    (15, "smoke ambassador in foggy warring corridors"),
    (16, "ruin midwife delivering light from collapsing stone temple"),
    (17, "obsidian scribe carving runes into black glass, green ember glow"),
    (18, "fever prophet glowing veins burning eyes, crimson heat haze"),
    (19, "chain alchemist melting bondage into gold alloy, forge sparks"),
    (20, "dust sovereign on crumbling ash throne, late autumn empire"),
    (21, "mourning bell ringing over foggy cemetery, rings of light"),
    (22, "fang archivist in predatory library of biting scrolls"),
    (23, "cobalt hangman under blue justice scaffold, cold moonlight"),
    (24, "lantern betrayer lighting false path, amber treachery"),
    (25, "living marble hunger statue, classical divine muscular form"),
    (26, "wraith gardener tending glowing plants in haunted soil"),
    (27, "amber inquisitor with golden resin moment, hard questions"),
    (28, "scarlet ledger dripping iron-red ink, candlelit blood-debt study"),
    (29, "frost hierophant in icy robes, frozen cathedral discipline"),
    (30, "gallows dove on beam, peace after sharp ending, ash dawn"),
    (31, "pitch ambassador with glowing eyes in absolute darkness"),
    (32, "ivory executioner pale precise blade, clean mercy cut"),
    (33, "bramble queen thorn crown tangled vines blood roses"),
    (34, "coffin merchant twilight bazaar selling rest to the living"),
    (35, "eclipse child under shadowed sun, tender cosmic omen"),
    (36, "rust cardinal oxidized ceremonial armor, iron oxide faith"),
    (37, "whisper foundry forging secrets into glowing tools"),
    (38, "blackthorn nurse thorny care, medicine and poison vials"),
    (39, "pyre scholar beside burning books, knowledge through fire"),
    (40, "crypt diplomat at underground table with the buried dead"),
    (41, "severed compass on stormy cliff, lost north under stars"),
    (42, "ashen twin doppelgangers meeting in firelight"),
    (43, "massive last door carved wood and iron at world's edge"),
    (44, "unnamed witness cosmic eye in veil of stars and ash"),
]


def log(msg: str) -> None:
    print(msg, flush=True)
    with LOG.open("a") as f:
        f.write(msg + "\n")


def url_for(n: int, scene: str) -> str:
    prompt = f"{scene}, {STYLE}"
    path = urllib.parse.quote(prompt, safe="")
    q = urllib.parse.urlencode(
        {"width": "720", "height": "1200", "nologo": "true", "seed": str(3000 + n)}
    )
    return f"https://image.pollinations.ai/prompt/{path}?{q}"


def is_done(n: int) -> bool:
    return (OUT / f".done-{n:02d}").exists() and (OUT / f"veil-{n:02d}.jpg").exists()


def fetch_one(n: int, scene: str) -> tuple[bool, str]:
    dest = OUT / f"veil-{n:02d}.jpg"
    last_err = ""
    for attempt in range(8):
        try:
            req = urllib.request.Request(
                url_for(n, scene),
                headers={"User-Agent": "Mozilla/5.0 (compatible; OracleArt/3)"},
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = resp.read()
            if len(data) < 12000 or data[:3] != b"\xff\xd8\xff":
                last_err = f"bad payload {len(data)}"
                time.sleep(3 + attempt * 2)
                continue
            dest.write_bytes(data)
            (OUT / f".done-{n:02d}").write_text("ok\n")
            return True, f"{len(data)}b"
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}"
            wait = 20 + attempt * 15 if e.code == 429 else 4 + attempt * 3
            log(f"  retry veil-{n:02d} {last_err}, sleep {wait}s")
            time.sleep(wait)
        except Exception as e:
            last_err = str(e)
            time.sleep(4 + attempt * 2)
    return False, last_err


def main():
    if os.environ.get("FORCE") == "1":
        for p in OUT.glob(".done-*"):
            p.unlink(missing_ok=True)
    LOG.write_text("")
    fails = []
    remaining = [(n, s) for n, s in CARDS if not is_done(n)]
    log(f"Need {len(remaining)} / {len(CARDS)} cards")
    for i, (n, scene) in enumerate(remaining, 1):
        log(f"[{i}/{len(remaining)}] veil-{n:02d}...")
        success, msg = fetch_one(n, scene)
        if success:
            log(f"OK veil-{n:02d} ({msg})")
        else:
            fails.append((n, msg))
            log(f"FAIL veil-{n:02d}: {msg}")
        time.sleep(5)
    if fails:
        log(f"Second pass for {len(fails)} fails...")
        again = list(fails)
        fails = []
        for n, _ in again:
            scene = next(s for num, s in CARDS if num == n)
            time.sleep(10)
            success, msg = fetch_one(n, scene)
            if success:
                log(f"OK veil-{n:02d} ({msg})")
            else:
                fails.append((n, msg))
                log(f"FAIL veil-{n:02d}: {msg}")
    summary = {"ok_markers": sum(1 for n, _ in CARDS if is_done(n)), "fail": fails}
    log(json.dumps(summary))
    if fails:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
