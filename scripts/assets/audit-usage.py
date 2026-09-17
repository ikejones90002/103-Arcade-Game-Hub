from pathlib import Path
import json

root = Path("docs")
rasters = sorted(
    p for p in (root / "assets").rglob("*")
    if p.suffix.lower() in {".webp", ".png", ".jpg", ".jpeg"} and "canon" not in p.parts
)

wq = (root / "wordquest.html").read_text(encoding="utf-8", errors="ignore")
spell = (root / "spellbuzz.html").read_text(encoding="utf-8", errors="ignore")
abc = (root / "abcbuzz.html").read_text(encoding="utf-8", errors="ignore")
num = (root / "numbuzz.html").read_text(encoding="utf-8", errors="ignore") if (root / "numbuzz.html").exists() else ""
idx = (root / "index.html").read_text(encoding="utf-8", errors="ignore")
fm = (root / "flipmatch.html").read_text(encoding="utf-8", errors="ignore")
css = (root / "theme.css").read_text(encoding="utf-8", errors="ignore")
all_code = wq + spell + abc + num + idx + fm + css

def status(rel: str) -> str:
    name = Path(rel).name
    stem = Path(rel).stem
    path = "assets/" + rel

    if path in all_code or name in all_code and "flipmatch" in rel:
        if "flipmatch" in rel:
            return "WIRED — FlipMatch gameplay/start"
        if "hub-card" in rel:
            return "WIRED — Hub Enter World card"
        if "arcade-hub-background" in rel:
            return "WIRED — Hub page background"
        if "reading-scene-master" in rel or stem.startswith("reading-") and stem in wq:
            return "WIRED — Word Quest map scene"
        if path in all_code:
            return "WIRED — direct path in code"

    if rel.startswith("hub/") and "background" not in rel:
        return "STORED — hub parallax layers (not mounted yet)"

    if rel.startswith("worlds/reading/backgrounds/"):
        if "hub-card" in rel:
            return "WIRED — Hub"
        if f'data-layer="{stem}"' in wq or "scene-master" in rel:
            return "WIRED — Word Quest layered map"
        return "STORED — Reading inventory"

    if rel.startswith("worlds/reading/characters/"):
        return "WIRED — Word Quest owl (ArcadeAssets mountWorldMascot)"

    if rel.startswith("worlds/spelling/backgrounds/"):
        if "hub-card" in rel:
            return "WIRED — Hub"
        return "STORED — SpellBuzz/AbcBuzz still use older meadow SVG layers"

    if rel.startswith("worlds/spelling/characters/"):
        return "WIRED — SpellBuzz/AbcBuzz bee (ArcadeAssets)"

    if rel.startswith("worlds/math/backgrounds/"):
        if "hub-card" in rel:
            return "WIRED — Hub"
        return "STORED — NumBuzz map chrome not rebuilt yet"

    if rel.startswith("worlds/math/characters/"):
        if "mountWorldMascot" in num:
            return "WIRED — NumBuzz"
        return "STORED — NumBuzz does not mount turtle yet"

    if "/props/" in rel or rel.startswith("ui/"):
        return "STORED — prop/effect sheets (not cropped or hooked into gameplay)"

    if "flipmatch" in rel:
        return "WIRED — FlipMatch" if name in fm else "STORED — FlipMatch file unused?"

    return "STORED — inventory only"

wired = stored = 0
print(f"{'STATUS':55} FILE")
print("-" * 100)
for p in rasters:
    rel = p.relative_to(root / "assets").as_posix()
    st = status(rel)
    if st.startswith("WIRED"):
        wired += 1
    else:
        stored += 1
    print(f"{st:55} {rel}")

print("-" * 100)
print(f"WIRED now: {wired}")
print(f"ON DISK only (inventory / later wiring): {stored}")

# Missing from GENERATE-NOW intent
missing = [
    "arcade-hub-clouds.webp (optional; sparkles/foreground cover some of this)",
    "Individual prop crops from props sheets (books, blocks, etc.)",
    "Individual effect crops from effects-sheet.png",
    "FlipMatch card faces are old sheet crops — owl/back were replaced; other faces still prior pack",
    "NumBuzz layered map scene (math layers exist but unused)",
    "SpellBuzz/AbcBuzz still on SVG meadow — new spelling WebP layers unused in-game",
    "Happy/thinking/celebrating poses exist but games mostly mount idle only",
]
print("\nMISSING / NOT FULLY USED YET:")
for m in missing:
    print(" -", m)
