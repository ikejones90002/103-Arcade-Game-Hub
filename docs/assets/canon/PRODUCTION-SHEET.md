# 103 Arcade — Production Sheet

Master lock: [`dashboard-reference.jpg`](dashboard-reference.jpg)  
Style: cinematic children’s 3D/storybook illustration (Pixar-like lighting, soft depth).  
**Do not** invent a different art language.

Generate in **sheets + crops**, not 260 separate one-offs. Phases below.

---

## Phase 1 — Core (this build)

### Hub

| Asset | Aspect | Alpha | Prompt lock |
|---|---|---|---|
| `arcade-hub-background.webp` | 16:9 | no | Starry-to-dawn sky + distant kingdom from dashboard backdrop |
| `arcade-hub-mountains.webp` | 16:9 | yes | Soft mountain silhouettes matching hub backdrop |
| `arcade-hub-foreground.webp` | 16:9 | yes | Out-of-focus foliage/flowers like dashboard bottom |

### Reading (consume: Word Quest, hub card)

| Asset | Aspect | Alpha | Prompt lock |
|---|---|---|---|
| `reading-sky.webp` | 3:4 | no | Bright blue storybook sky from Reading World card |
| `reading-mountains.webp` | 3:4 | yes | Distant blue mountains |
| `reading-forest.webp` | 3:4 | yes | Lush forest midground |
| `reading-castle.webp` | 3:4 | yes | Blue/white castle on hill + stream/bridge |
| `reading-foreground.webp` | 3:4 | yes | Near grass/flowers/trees |
| `reading-owl-sheet.png` | 16:9 | yes | Owl with blue vest — 6 poses in a row: idle, happy, thinking, flying, celebrating, gentle-error |

Crop sheet → `reading-owl-{idle,happy,thinking,flying,celebrating,gentle-error}.png`

### Spelling

| Asset | Aspect | Alpha | Prompt lock |
|---|---|---|---|
| `spelling-sky.webp` | 3:4 | no | Warm golden-hour sky |
| `spelling-hills.webp` | 3:4 | yes | Rolling green hills |
| `spelling-meadow.webp` | 3:4 | yes | Flower meadow |
| `spelling-village.webp` | 3:4 | yes | Colorful cottages / red roofs |
| `spelling-foreground.webp` | 3:4 | yes | Flowers + grass near camera |
| `spelling-bee-sheet.png` | 16:9 | yes | Round bee — poses: idle, happy, thinking, flying, celebrating, gentle-error |

### Math

| Asset | Aspect | Alpha | Prompt lock |
|---|---|---|---|
| `math-sky.webp` | 3:4 | no | Purple/blue magical sky |
| `math-mountains.webp` | 3:4 | yes | Snowy peaks |
| `math-valley.webp` | 3:4 | yes | Cool valley midground |
| `math-castle.webp` | 3:4 | yes | Crystal/number castle |
| `math-foreground.webp` | 3:4 | yes | Crystals / rocks / grass |
| `math-turtle-sheet.png` | 16:9 | yes | Green turtle + backpack — same 6 poses |

### Hub world cards

Prefer crops from dashboard panels, or composites of P1 layers:

- `reading-hub-card.webp`
- `spelling-hub-card.webp`
- `math-hub-card.webp`

---

## Later phases (inventory — generate when needed)

### Phase 2 — Props (~10 each world)

Reading books/scrolls/lantern/chest · Spelling letter-blocks/hive/honeycomb · Math number-blocks/symbols/crystals

### Phase 3 — Arcade micro-worlds

AbcBuzz reuses Spelling bee + meadow family · RhymeTime/FlipMatch/SentenceQuest reuse Reading · PatternPop reuses Math

### Phase 4 — Effects

sparkle, glow, bloom, pop, unlock, celebration (shared + per-world)

### Phase 5 — SentenceQuest scene illustrations

Meaning-bearing images (cat-chair, dog-park, etc.)

Full filename inventory: see agent chat / master list sections A–J. Naming rules in [`ASSET-BIBLE.md`](../ASSET-BIBLE.md).

---

## Dimensions guide

| Use | Size target |
|---|---|
| Env layer / hub bg | 1920×1080 or 1024×1536 (3:4 cards) |
| Character pose crop | ≥512×512 transparent |
| Hub world card | ~768×1024 |
