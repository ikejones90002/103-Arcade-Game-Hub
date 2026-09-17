# 103 Arcade — Generate Now Prompt Pack

**Master reference (always attach):** `docs/assets/canon/dashboard-reference.jpg`

**Audio pack (SFX / voice script / beds / stingers):** [`GENERATE-NOW-AUDIO.md`](GENERATE-NOW-AUDIO.md) — Audio YES, Video NO this batch.

**Global rules (prepend to every prompt):**

```text
Style lock: cinematic children's storybook illustration matching the 103 Arcade dashboard.
Soft lighting, depth, painterly detail. NO text, NO UI, NO watermarks, NO "EG", NO neon cyberpunk.
NO new mascots — only the canonical Reading Owl, Spelling Bee, Math Turtle from the dashboard.
Prefer transparent background for characters/props/effects. Environments: full-bleed or soft edges for layering.
```

Aspect tips: characters `1:1` or sheet `16:9` · env layers `3:4` · hub bg `16:9` · FlipMatch cards `3:4`

---

## Batch 1 — Canonical character sheets (do first)

### 1A · Reading Owl sheet → `reading-owl-sheet.png`

```text
Character sprite SHEET, 2 rows × 3 columns, plain transparent or solid soft gray backdrop.
Canonical 103 Arcade Reading Owl from the dashboard: fluffy tan/brown owl, LARGE amber/gold eyes, BLUE bandana/vest with small emblem (NOT a satchel-only redesign).
Six poses in order:
1 idle perched  2 happy smile  3 thinking  4 flying wings out  5 celebrating  6 gentle soft-miss (no shame)
Same character identity in every panel. Premium children's 3D/storybook render. No text, no frames, no labels.
```

**Crop to:** `reading-owl-{idle,happy,thinking,flying,celebrating,gentle-error}.png` (512×512, alpha)

### 1B · Spelling Bee sheet → `spelling-bee-sheet.png`

```text
Character sprite SHEET, 2×3 grid, transparent/soft gray backdrop.
Canonical 103 Arcade Spelling Bee from the dashboard: round yellow-and-black bee, big friendly eyes, translucent cyan wings, soft antennae.
Six poses: idle, happy, thinking, flying, celebrating, gentle soft-miss.
Optional: one panel may hold a wooden letter block "A" (carrying-letter) instead of flying if preferred.
Consistent design across all panels. No text labels, no ornate card frames.
```

**Crop to:** `spelling-bee-{idle,happy,thinking,flying,celebrating,gentle-error}.png`

### 1C · Math Turtle sheet → `math-turtle-sheet.png`

```text
Character sprite SHEET, 2×3 grid, transparent/soft gray backdrop.
Canonical 103 Arcade Math Turtle from the dashboard: bright green sea turtle, large blue eyes, small brown backpack.
Six poses: idle, happy, thinking, walking, celebrating, gentle soft-miss.
Consistent design. No number blocks required on every pose. No text, no frames.
```

**Crop to:** `math-turtle-{idle,happy,thinking,walking,celebrating,gentle-error}.png`

---

## Batch 2 — Reading World transparent layers

Generate separately. Each must be stackable (empty/alpha where other layers show through).

### 2A · `reading-sky.webp` (opaque OK)

```text
FULL-BLEED sky LAYER only for Reading World: bright blue storybook sky, soft white clouds, gentle haze.
Match dashboard Reading World lighting. NO mountains, NO trees, NO castle, NO owl, NO UI.
```

### 2B · `reading-mountains.webp` (alpha preferred)

```text
Transparent midground LAYER: distant soft blue mountains along the LOWER half only; UPPER half empty/transparent for sky.
Reading World dashboard palette. NO castle, NO forest detail, NO characters, NO UI.
```

### 2C · `reading-forest.webp` (alpha)

```text
Transparent midground LAYER: lush rounded storybook forest / treeline in the mid-lower band; upper area empty/transparent.
Match Reading World greens. NO castle, NO owl, NO UI.
```

### 2D · `reading-castle.webp` (alpha)

```text
Transparent landmark LAYER: blue-and-white fantasy castle on a green hill with stone bridge over a stream — matching dashboard Reading World.
Centered landmark, soft edges. NO owl, NO UI, NO text. Leave sky mostly empty/transparent.
```

### 2E · `reading-foreground.webp` (alpha)

```text
Transparent FOREGROUND LAYER only: near-camera grass, bushes, wildflowers along the BOTTOM edge; upper 60% empty/transparent.
Soft depth-of-field. NO characters, NO castle, NO UI.
```

---

## Batch 3 — Hub fidelity

### 3A · Hub world cards (preferred: crop from dashboard)

Manual crop from `dashboard-reference.jpg` — illustration only, no chrome:

- `reading-hub-card.webp`
- `spelling-hub-card.webp`
- `math-hub-card.webp`

Target ~768×1024, cover-friendly, no stretched smear fills.

### 3B · `arcade-hub-background.webp`

```text
Wide 16:9 cinematic hub backdrop matching 103 Arcade dashboard: starry upper sky fading to dawn, distant fantasy mountains, floating islands, winding river toward a grand castle peak.
Soft children's film look. NO UI panels, NO world cards, NO characters in foreground, NO text.
```

### 3C · `arcade-hub-mountains.webp` (alpha)

```text
Transparent mountain silhouette LAYER for hub, soft blue/purple peaks across lower half; upper transparent. Match hub backdrop. NO UI.
```

### 3D · `arcade-hub-floating-islands.webp` (alpha)

```text
Transparent LAYER: a few soft floating islands with tiny trees/structures, mid-sky placement, matching dashboard hub fantasy. NO UI, NO text.
```

### 3E · `arcade-hub-foreground.webp` (alpha)

```text
Transparent LAYER: out-of-focus green foliage and soft purple/pink flowers along bottom edge (bokeh), like dashboard bottom. Upper transparent. NO UI.
```

### 3F · `arcade-hub-sparkles.webp` (alpha)

```text
Transparent sparkle/particle LAYER only: soft gold and cyan magical sparkles scattered, no solid shapes, no text. For overlay animation.
```

---

## Batch 4 — Spelling / Math layers (after Reading QA)

### Spelling

| File | Prompt focus |
|---|---|
| `spelling-sky.webp` | Warm golden-hour sky only |
| `spelling-hills.webp` | Rolling green hills, alpha top |
| `spelling-meadow.webp` | Flower meadow band, alpha top |
| `spelling-village.webp` | Colorful cottages / red roofs landmark, alpha sky |
| `spelling-foreground.webp` | Bottom flowers/grass, alpha upper |

### Math

| File | Prompt focus |
|---|---|
| `math-sky.webp` | Purple/blue magical sky only |
| `math-mountains.webp` | Snowy peaks, alpha top |
| `math-valley.webp` | Cool valley mid band |
| `math-castle.webp` | Crystal/purple-roof castle + floating island cue |
| `math-foreground.webp` | Crystals/rocks/grass bottom, alpha upper |

Use same global rules + “match dashboard [Spelling/Math] World card.”

---

## Batch 5 — FlipMatch fixes

### 5A · Card back (no EG) → `flipmatch-card-back.png`

```text
Single playing card back, 3:4, cream/gold ornate outer frame.
Deep navy field with gold vine filigree. Center: gold compass rose with "103 Arcade" wordmark ONLY.
NO "EG", NO other initials, NO watermarks. Match existing FlipMatch card family style.
```

### 5B · Owl face (canonical) → `flipmatch-card-owl.png`

```text
Single FlipMatch card face, 3:4: cream field, thin ornate brown frame, bottom label "Reading Owl".
Illustration: canonical dashboard Reading Owl with BLUE bandana/vest (not satchel redesign), soft blue forest behind.
Storybook children's illustration. No other logos.
```

(Optional later: regenerate other faces only if frame language drifts.)

---

## Batch 6 — Props sheets (Phase 2)

### 6A · Reading props sheet

```text
Transparent PROP SHEET for Reading World: open book, glowing magic book, lantern, small treasure chest, story scroll, wooden signpost — arranged in a clean grid on transparent background.
Match Reading World blues/golds. No characters, no text labels on the sheet.
```

### 6B · Spelling props sheet

```text
Transparent PROP SHEET: wooden alphabet blocks A B C, honeycomb, beehive, flower with letter, small word book — grid on transparent background.
Warm Spelling World honey palette. No bee character, no UI text.
```

### 6C · Math props sheet

```text
Transparent PROP SHEET: number blocks 1 2 3, plus minus times divide symbols, glowing crystal, fraction pie — grid on transparent background.
Math World purple/cyan accents. No turtle, no UI chrome.
```

---

## Batch 7 — Effects sheet

```text
Transparent EFFECTS SHEET grid: soft sparkle burst, flower bloom, letter/number pop flash, golden unlock glow, celebration confetti puff, gentle miss cloud.
Soft magical children's VFX, no text, no characters. High contrast on transparent so they read at small size.
```

**Crop later to:** `*-sparkle.png`, `*-bloom.png`, `*-pop.png`, `*-unlock.png`, `*-celebrate.png`, `*-soft-miss.png`

---

## Do not generate yet

- Full SentenceQuest sentence scenes
- PatternPop workshop set
- Full UI icon set (unless blocking)
- New owl/bee/turtle variants per game
- Video / WebM (silent Hub/Reading loop is later; see the audio pack)

---

## After each batch

1. Save under `docs/assets/worlds/...` or `docs/assets/arcade/...` / `docs/assets/hub/`
2. Crop sheets → individual PNGs
3. Register IDs in `manifests/characters.json` + `sources.json`
4. Run `npm run assets:validate`
5. Visual QA against `dashboard-reference.jpg` before the next franchise

**Reading gate:** do not rebuild Spelling/Math play scenes until Batch 1 + Batch 2 pass the eyeball test.
