# Gemini import map (sorted into production folders)

Source files remain in this `canon/` folder. Processed copies live under `docs/assets/{hub,worlds,arcade,ui}/`.

| Role | Production path |
|---|---|
| Hub background | `hub/arcade-hub-background.webp` |
| Hub mountains / islands / foreground / sparkles | `hub/arcade-hub-*.webp` |
| Reading layers + scene master + hub card | `worlds/reading/backgrounds/` |
| Spelling layers + scene master + hub card | `worlds/spelling/backgrounds/` |
| Math layers + scene master + hub card | `worlds/math/backgrounds/` |
| Owl / Bee / Turtle sheets + pose crops | `worlds/*/characters/` |
| Props sheets | `worlds/*/props/` |
| Effects sheet | `ui/effects-sheet.png` |
| FlipMatch owl + back | `arcade/flipmatch/flipmatch-card-*.png` |

Hub Enter World cards now use the new `*-hub-card.webp` derived from scene masters.

`npm run assets:validate` — passing after import.
