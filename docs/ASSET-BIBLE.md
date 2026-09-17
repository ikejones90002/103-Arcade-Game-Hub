# 103 Arcade — Asset Bible

## Folder map

```text
docs/assets/
  canon/                 # dashboard-reference + production sheet
  hub/                   # arcade-hub-* layers
  worlds/{reading,spelling,math}/
    backgrounds/         # opaque WebP layers
    characters/          # transparent PNG poses
    props/
    effects/
  arcade/{abcbuzz,sentencequest,rhymetime,flipmatch,patternpop}/
  ui/
  audio/{ui,voice,worlds,mascots,reading,spelling,math}/
  manifests/
```

Legacy `environments/*.svg` hub cards are **deprecated** once raster cards/layers exist.

## Naming

- Environments: `{world}-{layer}.webp` (e.g. `reading-sky.webp`)
- Characters: `{world}-{mascot}-{pose}.png`
- Props/effects: `{world}-{name}.png`
- Hub: `arcade-hub-{layer}.webp`

## Sheet vs crop

Generate **character sheets** (one image, multiple poses), then crop to individual PNGs. Do not run hundreds of one-off generations for the full inventory—see [`canon/PRODUCTION-SHEET.md`](assets/canon/PRODUCTION-SHEET.md).

## Consumption

```js
ArcadeAssets.mountWorldLayer(el, "reading-sky");
ArcadeAssets.mountCharacter(el, "reading-owl-idle");
ArcadeAssets.mountWorldScene(el, "reading", ["sky","mountains","forest","castle","foreground"]);
```

IDs resolve via manifests. Every production file needs a `sources.json` entry. No hotlinks.

## Formats & size

| Kind | Format | Notes |
|---|---|---|
| Opaque env layers | WebP (or PNG if WebP unavailable) | Full-bleed landscape |
| Characters / props | PNG | Transparency required |
| UI icons | SVG preferred | Neon chrome OK |
| SFX / beds / voice | MP3 (WAV masters off-repo or same family) | See [`canon/GENERATE-NOW-AUDIO.md`](assets/canon/GENERATE-NOW-AUDIO.md); IDs in `manifests/audio.json` + `manifests/voice-script.json` |

Validate with `npm run assets:validate`.
