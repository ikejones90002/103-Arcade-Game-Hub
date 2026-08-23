# 103 Arcade Hub

Offline educational mini-games from **103 Software Solutions LLC**. Open [`docs/index.html`](docs/index.html) (or GitHub Pages `/docs`) to pick a title.

## Live games

| Game | File | Skill |
|---|---|---|
| SpellBuzz | [`docs/spellbuzz.html`](docs/spellbuzz.html) | Spelling / listening |
| NumBuzz | [`docs/numbuzz.html`](docs/numbuzz.html) | Arithmetic |
| Word Quest | [`docs/wordquest.html`](docs/wordquest.html) | Reading World (curriculum adventure) |
| FlipMatch | [`docs/flipmatch.html`](docs/flipmatch.html) | Memory pairs |
| PatternPop | [`docs/patternpop.html`](docs/patternpop.html) | Patterns / logic |
| RhymeTime | [`docs/rhymetime.html`](docs/rhymetime.html) | Phonemic awareness |

Shared look: [`docs/theme.css`](docs/theme.css), sounds in [`docs/sounds/`](docs/sounds/), company mark in the footer (`docs/logo.png`). The hub hero is the **103 Arcade** logo (`docs/arcade-logo.svg`).

## Word Quest — Reading World

Word Quest is the hub’s reading title: a **Reading World** map with nine regions (preschool through ~6th–7th grade focus). Progress, skills, and unlocks save in `localStorage` (`wordquest_profile`).

| File | Role |
|---|---|
| [`docs/wordquest.html`](docs/wordquest.html) | Game shell (map, path, lessons, parent/rewards) |
| [`docs/wordquest-content.js`](docs/wordquest-content.js) | Worlds, lessons, placement items |
| [`docs/wordquest-engine.js`](docs/wordquest-engine.js) | Profile, evaluate, XP, adaptive, coach |

**Play loop:** Pick grade → map → world path → node lessons → activities → XP/stars → unlock next node.

**Grade-based access:** On first launch, pick grades 1–9 (preschool through ~6th–7th). Your grade opens that world on the map. Younger worlds stay hidden unless you tap **Review earlier skills** (or a parent enables review in the Parent panel). Worlds above your grade stay locked until the **Placement** quiz shows readiness or a parent moves grade up. Node order inside each world is unchanged (finish prior node to unlock the next).

**Features shipped:** Alphabet Forest through Crown Library (expanded upper worlds); grade picker; placement quiz; skill bars; adaptive remediation; parent panel with grade controls; cosmetics; profile export/import; weekly self-challenge; rule-based reading coach; **optional OpenAI coach/hints via Vercel API** (`/api/coach`, `/api/hint`, `/api/health`).

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

Local API testing: `npx vercel dev` (after `vercel link`), with `.env.local` copied from `.env.example`.

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
