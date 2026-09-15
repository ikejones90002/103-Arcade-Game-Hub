# 103 Arcade Worlds — Art Direction

Shared visual/audio bible for Reading, Spelling, and Math Worlds.  
**Consistency matters more than individual image polish.**

## Character style

- Friendly rounded shapes, clean silhouettes
- Simple expressive faces (dot eyes, soft smile)
- Thick readable outlines (~3–4px at 128 viewBox)
- Minimal texture; flat fills with one soft highlight max
- Transparent backgrounds for characters/UI
- Head ~40–45% of total height for avatars; companions slightly chibi
- SVG-first; no photo realism

## Color rules

Align with hub tokens (not a second design system):

| Role | Hex |
|---|---|
| Ink / outline | `#1a1a28` |
| Skin tones | `#f5c99a`, `#d4a574`, `#8d5524` |
| Accent orange | `#ff8c00` |
| Accent cyan | `#00ffff` |
| Accent magenta | `#ff00ff` |
| Accent lime | `#32cd32` |
| Accent yellow | `#ffff00` |
| Soft fill | `#f4f7ff` |

Avoid cream/terracotta brochure looks and generic purple-on-white gradients as the world identity.

## World identity

| World | Emotion | Motifs |
|---|---|---|
| Reading | Storybook fantasy | books, owl, forest → kingdom |
| Spelling | Sound/word workshop | letters, bee/fox, meadow → pattern castle |
| Math | Number adventure | numerals, turtle, forest → equation peaks |

Shared UI chrome; different world art.

## Icon / badge style

- Stroke 3–4px, corner radius generous
- Low visual complexity (readable at 32–48px)
- No drop-shadow clutter in SVG source (CSS may add glow)

## Audio style

- Playful, warm, short (UI ≤150ms; rewards ≤700ms)
- No harsh alarms, no casino jackpot loops
- Soft miss feedback (`error-soft`), never shaming
- Educational speech is **not** part of this SFX library (use TTS)

## License rule

**No asset may enter production without an entry in `assets/manifests/sources.json`.**

- Generated/internal SVG & synth: `source: generated`, `license: proprietary`
- Migrated hub MP3s: document origin as `internal-legacy`

## Motion

Prefer CSS/SVG: idle bob, companion bounce, cloud drift, reward sparkle.  
Respect `prefers-reduced-motion`.
