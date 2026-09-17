#!/usr/bin/env python3
"""Generate 44 original Veil of the Ash Realms card faces (Pillow compositing)."""
from __future__ import annotations

import math
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "cards"
W, H = 720, 1200

# Palette: charcoal, dried blood, sickly green ember, bone
CHARCOAL = (12, 10, 14)
CHARCOAL2 = (22, 18, 24)
BLOOD = (110, 22, 36)
BLOOD_BRIGHT = (160, 36, 52)
EMBER_GREEN = (72, 120, 58)
EMBER_GLOW = (140, 200, 90)
BONE = (220, 208, 186)
BONE_DIM = (160, 148, 128)
STONE = (58, 52, 48)
STONE_LT = (90, 82, 74)
GOLD_RUST = (140, 110, 60)

CARDS = [
    (1, "The Cinder Herald", "Summons / Warning", "ash"),
    (2, "The Bone Abbess", "Silence / Relic", "bone"),
    (3, "The Hollow Crown", "Dominion / Emptiness", "veil"),
    (4, "The Ash Widow", "Grief / Remembrance", "ash"),
    (5, "The Ember Warden", "Vigil / Heat", "ember"),
    (6, "The Veil Reaper", "Threshold / Harvest", "veil"),
    (7, "The Iron Confessor", "Truth / Weight", "bone"),
    (8, "The Blood Geometer", "Pattern / Sacrifice", "blood"),
    (9, "The Night Orchard", "Temptation / Fruit", "ember"),
    (10, "The Pale Cartographer", "Map / Exile", "veil"),
    (11, "The Thorn Consul", "Pact / Boundary", "blood"),
    (12, "The Grave Choir", "Echo / Consensus", "bone"),
    (13, "The Salt Mercenary", "Debt / Blade", "ash"),
    (14, "The Mirror Saint", "Reflection / Judgment", "veil"),
    (15, "The Smoke Ambassador", "Diplomacy / Obscurity", "ash"),
    (16, "The Ruin Midwife", "Birth / Collapse", "bone"),
    (17, "The Obsidian Scribe", "Record / Permanence", "ember"),
    (18, "The Fever Prophet", "Vision / Illness", "blood"),
    (19, "The Chain Alchemist", "Binding / Transmutation", "bone"),
    (20, "The Dust Sovereign", "Rule / Decay", "ash"),
    (21, "The Mourning Bell", "Call / Ending", "bone"),
    (22, "The Fang Archivist", "Memory / Bite", "blood"),
    (23, "The Cobalt Hangman", "Consequence / Justice", "veil"),
    (24, "The Lantern Betrayer", "Guide / Treachery", "ember"),
    (25, "The Marble Hunger", "Appetite / Stone", "bone"),
    (26, "The Wraith Gardener", "Cultivate / Haunt", "veil"),
    (27, "The Amber Inquisitor", "Question / Preserve", "ember"),
    (28, "The Scarlet Ledger", "Account / Blood-debt", "blood"),
    (29, "The Frost Hierophant", "Cold rite / Authority", "bone"),
    (30, "The Gallows Dove", "Peace / Execution", "ash"),
    (31, "The Pitch Ambassador", "Bargain / Blackness", "ash"),
    (32, "The Ivory Executioner", "Clean death / Mercy", "bone"),
    (33, "The Bramble Queen", "Entanglement / Rule", "blood"),
    (34, "The Coffin Merchant", "Trade / Rest", "veil"),
    (35, "The Eclipse Child", "Innocence / Omen", "ember"),
    (36, "The Rust Cardinal", "Faith / Corrosion", "ash"),
    (37, "The Whisper Foundry", "Forge / Secrets", "ember"),
    (38, "The Blackthorn Nurse", "Care / Poison", "blood"),
    (39, "The Pyre Scholar", "Study / Burning", "ember"),
    (40, "The Crypt Diplomat", "Negotiation / Dead", "bone"),
    (41, "The Severed Compass", "Direction / Loss", "veil"),
    (42, "The Ashen Twin", "Duality / Mirror-self", "ash"),
    (43, "The Last Door", "Passage / Finality", "veil"),
    (44, "The Unnamed Witness", "Observation / Fate", "veil"),
]

REALM_TINT = {
    "ash": (40, 28, 24),
    "bone": (36, 34, 32),
    "blood": (48, 16, 22),
    "ember": (32, 40, 22),
    "veil": (28, 24, 40),
}


def noise_layer(w: int, h: int, rng: random.Random, alpha: int = 40) -> Image.Image:
    n = Image.new("L", (w, h), 0)
    px = n.load()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            v = rng.randint(0, 255)
            px[x, y] = v
            if x + 1 < w:
                px[x + 1, y] = v
            if y + 1 < h:
                px[x, y + 1] = v
                if x + 1 < w:
                    px[x + 1, y + 1] = v
    n = n.filter(ImageFilter.GaussianBlur(0.8))
    rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rgba.putalpha(n.point(lambda p: int(p * alpha / 255)))
    return rgba


def draw_arch(draw: ImageDraw.ImageDraw, cx: int, top: int, aw: int, ah: int) -> None:
    """Stone/bone arch frame around central artwork."""
    left, right = cx - aw // 2, cx + aw // 2
    bottom = top + ah
    # Outer arch fill (matte)
    # Pillars
    for i in range(18):
        c = (
            STONE[0] + i,
            STONE[1] + i // 2,
            STONE[2],
        )
        draw.rectangle([left + i, top + ah // 3, left + i + 2, bottom], fill=c)
        draw.rectangle([right - i - 2, top + ah // 3, right - i, bottom], fill=c)
    # Arch semicircle
    bbox = [left, top, right, top + aw]
    for t in range(14):
        c = (STONE_LT[0] - t, STONE_LT[1] - t, STONE_LT[2] - t // 2)
        draw.arc([bbox[0] + t, bbox[1] + t, bbox[2] - t, bbox[3] - t], 180, 0, fill=c, width=3)
    # Inner dark matte
    inset = 22
    draw.pieslice(
        [left + inset, top + inset, right - inset, top + aw - inset],
        180,
        0,
        fill=(8, 6, 10),
    )
    draw.rectangle(
        [left + inset, top + aw // 2, right - inset, bottom - 8],
        fill=(8, 6, 10),
    )
    # Bone edge highlight
    draw.arc([left + 4, top + 4, right - 4, top + aw - 4], 180, 0, fill=BONE_DIM, width=2)
    draw.line([(left + 8, top + ah // 3), (left + 8, bottom - 6)], fill=BONE_DIM, width=2)
    draw.line([(right - 8, top + ah // 3), (right - 8, bottom - 6)], fill=BONE_DIM, width=2)
    # Crimson inner rim
    draw.arc(
        [left + inset - 2, top + inset - 2, right - inset + 2, top + aw - inset + 2],
        180,
        0,
        fill=BLOOD,
        width=2,
    )


def scene_geometry(draw: ImageDraw.ImageDraw, n: int, realm: str, box: tuple[int, int, int, int], rng: random.Random) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    tint = REALM_TINT[realm]
    # Background wash inside arch
    draw.rectangle([x0, y0, x1, y1], fill=(tint[0] // 2, tint[1] // 2, tint[2] // 2))

    accent = {
        "ash": BLOOD,
        "bone": BONE_DIM,
        "blood": BLOOD_BRIGHT,
        "ember": EMBER_GREEN,
        "veil": (90, 70, 120),
    }[realm]

    glow = {
        "ash": BLOOD_BRIGHT,
        "bone": BONE,
        "blood": (200, 50, 70),
        "ember": EMBER_GLOW,
        "veil": (140, 110, 180),
    }[realm]

    kind = (n - 1) % 11

    if kind == 0:  # herald flame / vertical rays
        for i in range(12):
            ang = -90 + (i - 6) * 8
            rad = math.radians(ang)
            l = 180 + rng.randint(0, 40)
            x2 = cx + int(math.cos(rad) * l)
            y2 = cy + 40 + int(math.sin(rad) * l)
            draw.line([(cx, cy + 60), (x2, y2)], fill=accent + (180,), width=2)
        draw.ellipse([cx - 40, cy - 20, cx + 40, cy + 60], outline=glow, width=3)
        draw.polygon(
            [(cx, cy - 80), (cx - 28, cy + 20), (cx + 28, cy + 20)],
            fill=accent,
        )
    elif kind == 1:  # bone cross / abbey
        draw.rectangle([cx - 12, cy - 100, cx + 12, cy + 100], fill=BONE_DIM)
        draw.rectangle([cx - 70, cy - 40, cx + 70, cy - 16], fill=BONE_DIM)
        draw.ellipse([cx - 50, cy + 40, cx + 50, cy + 120], outline=accent, width=2)
    elif kind == 2:  # hollow crown
        draw.arc([cx - 70, cy - 40, cx + 70, cy + 40], 200, 340, fill=glow, width=5)
        for dx in (-50, -25, 0, 25, 50):
            draw.polygon(
                [(cx + dx, cy - 70), (cx + dx - 10, cy - 20), (cx + dx + 10, cy - 20)],
                fill=accent,
            )
        draw.ellipse([cx - 35, cy - 10, cx + 35, cy + 50], outline=BONE_DIM, width=2)
    elif kind == 3:  # widow veil / crescent
        draw.arc([cx - 80, cy - 90, cx + 80, cy + 70], 200, 340, fill=BONE, width=4)
        draw.ellipse([cx - 55, cy - 40, cx + 55, cy + 80], outline=accent, width=2)
        draw.line([(cx, cy - 20), (cx, cy + 90)], fill=glow, width=2)
    elif kind == 4:  # ember ring / warden
        for r in range(30, 120, 18):
            draw.ellipse([cx - r, cy - r + 20, cx + r, cy + r + 20], outline=accent, width=2)
        draw.ellipse([cx - 25, cy - 5, cx + 25, cy + 45], fill=glow)
    elif kind == 5:  # reaper scythe arc
        draw.arc([cx - 100, cy - 100, cx + 40, cy + 100], 40, 220, fill=BONE, width=6)
        draw.line([(cx - 20, cy + 20), (cx + 90, cy + 110)], fill=STONE_LT, width=8)
        draw.ellipse([cx + 70, cy + 90, cx + 100, cy + 120], fill=accent)
    elif kind == 6:  # scales / confessor
        draw.line([(cx, cy - 90), (cx, cy + 90)], fill=BONE_DIM, width=4)
        draw.line([(cx - 80, cy - 40), (cx + 80, cy - 40)], fill=BONE_DIM, width=3)
        draw.ellipse([cx - 100, cy - 20, cx - 40, cy + 40], outline=accent, width=3)
        draw.ellipse([cx + 40, cy - 20, cx + 100, cy + 40], outline=glow, width=3)
    elif kind == 7:  # geometric blood pattern
        for i in range(6):
            r = 30 + i * 18
            draw.regular_polygon((cx, cy + 10, r), 6, outline=accent)
        draw.ellipse([cx - 20, cy - 10, cx + 20, cy + 30], fill=BLOOD_BRIGHT)
    elif kind == 8:  # orchard tree / fruit
        draw.rectangle([cx - 8, cy + 20, cx + 8, cy + 110], fill=STONE)
        for i in range(8):
            ang = rng.random() * math.pi * 2
            rr = 40 + rng.randint(0, 50)
            fx = cx + int(math.cos(ang) * rr)
            fy = cy - 20 + int(math.sin(ang) * rr * 0.7)
            draw.ellipse([fx - 12, fy - 12, fx + 12, fy + 12], fill=accent)
        draw.ellipse([cx - 70, cy - 90, cx + 70, cy + 20], outline=EMBER_GREEN, width=2)
    elif kind == 9:  # map / compass rose
        for i in range(8):
            ang = math.radians(i * 45)
            x2 = cx + int(math.cos(ang) * 110)
            y2 = cy + int(math.sin(ang) * 110)
            draw.line([(cx, cy), (x2, y2)], fill=accent if i % 2 == 0 else BONE_DIM, width=2)
        draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], outline=glow, width=3)
        draw.polygon([(cx, cy - 70), (cx - 14, cy), (cx + 14, cy)], fill=BLOOD)
    else:  # thorns / bramble
        for i in range(16):
            x = x0 + 20 + (i * (x1 - x0 - 40) // 15)
            y = y0 + 40 + int(40 * math.sin(i * 0.9 + n))
            draw.line([(x, y), (x + rng.randint(-20, 20), y + 80)], fill=accent, width=2)
            draw.polygon(
                [(x, y), (x - 8, y + 16), (x + 8, y + 16)],
                fill=glow,
            )

    # Extra floating particles
    for _ in range(28):
        px = rng.randint(x0 + 10, x1 - 10)
        py = rng.randint(y0 + 10, y1 - 10)
        s = rng.randint(1, 3)
        draw.ellipse([px, py, px + s, py + s], fill=glow + (rng.randint(80, 180),))


def try_font(size: int, italic: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf" if italic else "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf" if italic else "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    return ImageFont.load_default()


def make_card(n: int, title: str, keywords: str, realm: str) -> Image.Image:
    rng = random.Random(n * 9973 + 17)
    img = Image.new("RGBA", (W, H), CHARCOAL + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    # Textured border field
    for y in range(H):
        shade = 10 + int(8 * math.sin(y * 0.02))
        draw.line([(0, y), (W, y)], fill=(shade, shade - 2, shade + 2))

    # Outer frame
    draw.rectangle([18, 18, W - 18, H - 18], outline=BLOOD, width=3)
    draw.rectangle([28, 28, W - 28, H - 28], outline=GOLD_RUST, width=1)
    draw.rectangle([36, 36, W - 36, H - 36], outline=STONE_LT, width=2)

    # Corner ornaments
    for ox, oy in [(48, 48), (W - 64, 48), (48, H - 64), (W - 64, H - 64)]:
        draw.rectangle([ox, oy, ox + 16, oy + 16], outline=GOLD_RUST, width=1)
        draw.line([(ox, oy + 8), (ox + 16, oy + 8)], fill=BLOOD, width=1)
        draw.line([(ox + 8, oy), (ox + 8, oy + 16)], fill=BLOOD, width=1)

    # Number + sigil upper corner
    font_num = try_font(36)
    font_sig = try_font(28)
    num_s = f"{n:02d}"
    draw.text((52, 72), num_s, font=font_num, fill=BONE)
    # Sigil circle
    sx, sy = W - 100, 78
    draw.ellipse([sx, sy, sx + 48, sy + 48], outline=EMBER_GREEN, width=2)
    draw.ellipse([sx + 8, sy + 8, sx + 40, sy + 40], outline=BLOOD, width=1)
    # unique sigil mark
    draw.line([(sx + 24, sy + 10), (sx + 24, sy + 38)], fill=BONE, width=2)
    draw.line([(sx + 12, sy + 24), (sx + 36, sy + 24)], fill=accent_for(realm), width=2)
    ang = math.radians(n * 17)
    draw.line(
        [
            (sx + 24 + int(math.cos(ang) * 14), sy + 24 + int(math.sin(ang) * 14)),
            (sx + 24 - int(math.cos(ang) * 14), sy + 24 - int(math.sin(ang) * 14)),
        ],
        fill=EMBER_GLOW,
        width=2,
    )

    # Title
    font_title = try_font(34)
    # wrap title if needed
    tw = draw.textlength(title, font=font_title)
    tx = (W - tw) / 2
    draw.text((tx, 140), title, font=font_title, fill=BONE)

    # Keywords in script/italic under title
    font_kw = try_font(26, italic=True)
    kw = keywords
    kw_w = draw.textlength(kw, font=font_kw)
    draw.text(((W - kw_w) / 2, 190), kw, font=font_kw, fill=BLOOD_BRIGHT)

    # Divider
    draw.line([(120, 230), (W - 120, 230)], fill=GOLD_RUST, width=1)
    draw.ellipse([W // 2 - 5, 225, W // 2 + 5, 235], fill=BLOOD)

    # Arch + scene
    arch_top = 260
    arch_w = 520
    arch_h = 720
    cx = W // 2
    draw_arch(draw, cx, arch_top, arch_w, arch_h)

    # Scene inside arch opening
    inset = 48
    left = cx - arch_w // 2 + inset
    right = cx + arch_w // 2 - inset
    top = arch_top + inset + 40
    bottom = arch_top + arch_h - 40
    scene_box = (left, top, right, bottom)

    # Draw scene on separate layer for glow
    scene = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(scene, "RGBA")
    scene_geometry(sdraw, n, realm, scene_box, rng)
    # Clip-ish vignette: darken outside by overlaying again... simpler: paste scene
    img = Image.alpha_composite(img, scene)
    draw = ImageDraw.Draw(img, "RGBA")

    # Grain
    img = Image.alpha_composite(img, noise_layer(W, H, rng, alpha=55))

    # Bottom banner strip
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle([48, H - 110, W - 48, H - 48], fill=(8, 6, 10, 200), outline=STONE_LT)
    font_foot = try_font(18)
    foot = "VEIL OF THE ASH REALMS"
    fw = draw.textlength(foot, font=font_foot)
    draw.text(((W - fw) / 2, H - 88), foot, font=font_foot, fill=BONE_DIM)

    # Color grade
    rgb = img.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
    rgb = ImageEnhance.Color(rgb).enhance(0.85)
    # slight crimson cast
    r, g, b = rgb.split()
    r = r.point(lambda p: min(255, int(p * 1.05)))
    g = g.point(lambda p: int(p * 0.96))
    rgb = Image.merge("RGB", (r, g, b))
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.2, percent=80, threshold=3))
    return rgb


def accent_for(realm: str):
    return {
        "ash": BLOOD_BRIGHT,
        "bone": BONE,
        "blood": BLOOD_BRIGHT,
        "ember": EMBER_GLOW,
        "veil": (150, 120, 190),
    }[realm]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    # remove old RWS jpgs
    for p in OUT.glob("*.jpg"):
        if not p.name.startswith("veil-"):
            p.unlink()
            print("removed", p.name)
    for n, title, kw, realm in CARDS:
        path = OUT / f"veil-{n:02d}.jpg"
        card = make_card(n, title, kw, realm)
        card.save(path, "JPEG", quality=88, optimize=True)
        print("wrote", path.name)
    print("Done:", len(CARDS), "cards")


if __name__ == "__main__":
    main()
