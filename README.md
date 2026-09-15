# 103 Arcade Hub

Offline educational mini-games from **103 Software Solutions LLC**. Open [`docs/index.html`](docs/index.html) (or GitHub Pages `/docs`) to pick a title.

## Live games

| Game | File | Skill |
|---|---|---|
| SpellBuzz | [`docs/spellbuzz.html`](docs/spellbuzz.html) | Spelling World (curriculum adventure) |
| NumBuzz | [`docs/numbuzz.html`](docs/numbuzz.html) | Math World (curriculum adventure) |
| Word Quest | [`docs/wordquest.html`](docs/wordquest.html) | Reading World (curriculum adventure) |
| FlipMatch | [`docs/flipmatch.html`](docs/flipmatch.html) | Memory pairs |
| PatternPop | [`docs/patternpop.html`](docs/patternpop.html) | Patterns / logic |
| RhymeTime | [`docs/rhymetime.html`](docs/rhymetime.html) | Phonemic awareness |

Shared look: [`docs/theme.css`](docs/theme.css), sounds in [`docs/sounds/`](docs/sounds/), company mark in the footer (`docs/logo.png`). The hub hero is the **103 Arcade** logo (`docs/arcade-logo.svg`). Shared AI client: [`docs/arcade-ai.js`](docs/arcade-ai.js) → `/api/coach`, `/api/hint`, `/api/health`.

## Architecture: three independent Worlds

Reading World is the **reference product pattern**, not a runtime dependency. Spelling World and Math World are sibling games that mirror the same experience (grade bands, map, lessons, placement, parent PIN, AI) with their own files and profiles.

| | Reading | Spelling | Math |
|---|---|---|---|
| Shell | `wordquest.html` | `spellbuzz.html` | `numbuzz.html` |
| Content | `wordquest-content.js` | `spellbuzz-content.js` | `numbuzz-content.js` |
| Engine | `wordquest-engine.js` | `spellbuzz-engine.js` | `numbuzz-engine.js` |
| Profile key | `wordquest_profile` | `spellbuzz_profile` | `numbuzz_profile` |

Do **not** import `wordquest-engine.js` / `wordquest-content.js` into SpellBuzz or NumBuzz.

## World Engagement Layer

Each Learning World pairs a **curriculum engine** with a local **engagement layer** (map-first motivation). Patterns are copied per world—there is no shared `engagement-engine.js` and no cross-game profile.

```text
Curriculum Engine  +  Engagement Layer  →  Learning World
Discover → Next Mission → Learn → Practice → Master → Soft Boss → Reward → World grows
```

**Per-world profile namespace** `engagement`: avatar, companions, worldStages, currentMission, daily, missionsSeen, bossesCleared, celebrationsSeen, labUnlocked, labCreations, lastPlayedAt.

**Features (all three worlds):** persistent avatar chrome · visible world stages · always-on **Next Mission** card · collectible companions with local encouragement lines · soft mastery bosses (retry/review, never wipe progress) · optional **Today's Adventure** · **Secret Lab** creative sandbox after milestones · short milestone celebrations only.

**Child-experience rules:** never remove earned progress, never reset for inactivity, never shame mistakes, no countdown pressure on core curriculum, no required daily attendance, no gambling rewards, no hiding lessons behind engagement, no purchases for progression, no streak punishment (friendly “learning garden” welcome-back instead). Deferred: leaderboards, multiplayer, chat, energy/lives, FOMO streaks, elaborate inventories.

**Independence:** Spell/Math engagement state lives only in `spellbuzz_profile` / `numbuzz_profile`. Companion chatter is local; Ask AI Coach / AI Hint / parent PIN / placement / export stay unchanged.

Light shared CSS only in [`docs/theme.css`](docs/theme.css) (`.next-mission`, `.stage-strip`, `.companion-line`, `.celebration-toast`, lab chrome)—still using existing `wq-*` tokens.

## Asset & Audio Pipeline

Shared **platform** library (like theme + AI)—not a shared game engine. Served from [`docs/assets/`](docs/assets/) at URLs `/assets/...` via the existing Vercel rewrite.

| Piece | Path |
|---|---|
| Art bible | [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md) |
| Loader | [`docs/arcade-assets.js`](docs/arcade-assets.js) (`window.ArcadeAssets`) |
| Manifests | [`docs/assets/manifests/`](docs/assets/manifests/) (`avatars`, `companions`, `worlds`, `audio`, `sources`) |
| Tooling | `npm run assets:validate` · `assets:manifest` · `assets:svgs` |

**Contract:** content and shells reference assets by **stable ID** (`ArcadeAssets.play("unlock")`, `mountAvatar`, `mountCompanion`, `mountWorldStage`). No hotlinks, no random internet downloads. Every production asset needs a `sources.json` entry.

**Visuals:** layered SVG avatars (body/hair/outfit/accessory), subject companions, world-stage vignettes. Emoji fallback if a file is missing.

**Audio:** curated SFX IDs in `audio.json`. Existing `correct` / `error-soft` / `tick` MP3s live under `assets/audio/ui/`; other IDs use an internal Web Audio synth bank until real files are added. Educational speech stays on browser TTS—not this library.

**Independence:** shared assets ≠ shared profiles. Spell/Math still do not import `wordquest-engine.js`.

## Word Quest — Reading World

Word Quest is the hub’s reading title: a **Reading World** map with nine regions (preschool through ~6th–7th grade focus). Progress, skills, and unlocks save in `localStorage` (`wordquest_profile`).

| File | Role |
|---|---|
| [`docs/wordquest.html`](docs/wordquest.html) | Game shell (map, path, lessons, parent/rewards) |
| [`docs/wordquest-content.js`](docs/wordquest-content.js) | Worlds, lessons, placement items |
| [`docs/wordquest-engine.js`](docs/wordquest-engine.js) | Profile, evaluate, XP, adaptive, coach |

**Play loop:** Pick grade → map → world path → node lessons → activities → XP/stars → unlock next node.

**Grade-based access:** On first launch, pick a reading band (Preschool through ~6th–7th). Your band opens that world on the map. Younger worlds stay hidden unless you tap **Review earlier skills** (or a parent enables review in the Parent panel). Worlds above your band stay locked until **Placement** shows readiness or a parent moves the level up. **Phonics Hatchery** opens Alphabet Forest at Sound Grove (not Letter Camp). Parent grade/reset controls use a 4-digit PIN.

**Features shipped:** Alphabet Forest through Crown Library (expanded upper worlds, 3 nodes each on 6–9); grade picker with age labels; placement quiz through band 9; skill bars; adaptive remediation; parent PIN + panel; cosmetics; profile export/import; weekly self-challenge; rule-based + optional OpenAI coach (ask, hint, miss/correct/lesson/parent tips via Vercel API); World Engagement Layer (Next Mission, stages, companions, soft bosses, daily adventure, Secret Lab).

## SpellBuzz — Spelling World

Independent spelling curriculum (same UX pattern as Reading World). Profile: `spellbuzz_profile`.

| File | Role |
|---|---|
| [`docs/spellbuzz.html`](docs/spellbuzz.html) | Spelling World shell |
| [`docs/spellbuzz-content.js`](docs/spellbuzz-content.js) | 9 bands: Letter Camp → Mastery Library |
| [`docs/spellbuzz-engine.js`](docs/spellbuzz-engine.js) | Own progression / placement / parent PIN |

**Skills:** letterSounds, phonicsSpelling, sightSpelling, patternSpelling, vocabularySpelling, multisyllable, trickyWords. AI subject: `spelling`.

## NumBuzz — Math World

Independent math curriculum (same UX pattern as Reading World). Profile: `numbuzz_profile`.

| File | Role |
|---|---|
| [`docs/numbuzz.html`](docs/numbuzz.html) | Math World shell |
| [`docs/numbuzz-content.js`](docs/numbuzz-content.js) | 9 bands: Count Forest → Pre-Algebra Library |
| [`docs/numbuzz-engine.js`](docs/numbuzz-engine.js) | Own progression / placement / parent PIN |

**Skills:** counting, addition, subtraction, placeValue, multiplication, division, fractions, wordProblems, preAlgebra. AI subject: `math`.

## Deploy on Vercel (frontend + API)

This repo is ready for Vercel: static games under `docs/`, serverless API under `api/`.

1. Import [ikejones90002/103-Arcade-Game-Hub](https://github.com/ikejones90002/103-Arcade-Game-Hub) in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: **Other**. Root directory: repo root (default).
3. Add Environment Variables (Production + Preview):

| Variable | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | Yes for AI | Your OpenAI secret key |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `AI_COACH_ENABLED` | No | Set `false` to disable AI even with a key |

4. Deploy. Hub opens at `/` (rewritten to `docs/index.html`).
5. Test endpoints:
   - `GET /api/health` → `{ ok, aiConfigured, model }`
   - `POST /api/coach` with JSON `{ "context": "ask", "profile": { "gradeBand": 3 } }`
   - `POST /api/hint` with JSON `{ "activity": { "prompt": "The cat sat on the ___", "type": "sentence" } }`
6. In **Word Quest**, use **Ask AI Coach** on the map and **AI Hint** during a lesson. Without a key, the local rule-based coach still works.

Local API testing: copy `.env.example` to `.env.local` (Vercel CLI reads that), then `npx vercel dev`. A plain `.env` file is gitignored and is not used by Vercel hosting until you add the same keys in the project Environment Variables UI.

## How to add a game later

1. Copy the chrome from [`docs/numbuzz.html`](docs/numbuzz.html): topbar, **103 Arcade** back link, mute, start card, play card, overlays, leaderboard + Clear, footer.
2. Link `theme.css` only. Do not invent a second color system or use Comic Sans.
3. Add an ASCII-only neon SVG icon (`docs/yourgame.svg`) in the same glow/grid language as `bee.svg` / `numbuzz.svg`.
4. Use the icon on the hub card, topbar, start hero, and favicon.
5. Use a unique `localStorage` key for scores and mute (example: `yourgame_lb`, `yourgame_mute`).
6. Add a picker card in [`docs/index.html`](docs/index.html).
7. Footer line: `© 2026 [Title]. Built by 103 Software Solutions LLC. All Rights Reserved.`

Keep `alert` / `prompt` out. Use overlays. Tick sounds only in the last few seconds. Honor `prefers-reduced-motion`.

## Backlog (not built yet)

Ideas from the arcade expansion list. **Action Cards** is already partly covered by Word Quest Action Mode.

### Memory and matching
- Shadow Match — object to silhouette
- Sound Match — play a sound, pick the picture

### Logic and thinking
- Odd One Out
- Sequence Sorter (small to big, first to last)

### Reaction and speed
- Tap the Target
- Color Dash (Stroop: tap the color that matches the word)
- Quick Count

### Sound and phonics
- Sound to Letter
- Beginning Sound Blast

### Knowledge mini-games
- Animal Facts Quiz
- Flag Match
- State or Country Match
- Science Basics (weather, planets, habitats)

### Creativity
- Build-a-Creature
- Color Fill
- Sticker Scene

### Movement
- Follow the Path (simple maze)
- Jump Count

### Sorting
- Sort by Color / Shape / Size / Type (animals, foods, tools)

### Mini adventure
- Treasure Hunt
- Path Finder
- Puzzle Island

### Social and emotional learning
- Face Match (emotions)
- Good Choice / Bad Choice
- Feelings Sort

## License / credit

Built by **103 Software Solutions LLC**. Gaming division branding: 103 Arcade.
