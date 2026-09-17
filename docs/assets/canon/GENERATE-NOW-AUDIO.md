# 103 Arcade — Generate Now Audio Pack

**Decision lock:** Audio YES. Video NO (except one silent Hub/Reading WebM loop later — not this batch).

**Master visual lock (mood only, do not score to picture cuts):** `docs/assets/canon/dashboard-reference.jpg`

**Register later in:** `docs/assets/manifests/audio.json` + `docs/assets/manifests/sources.json`  
**Voice source of truth:** this file + `docs/assets/manifests/voice-script.json`

**Art-first audio rule:** artwork still carries the world. Audio supports pedagogy and immersion. It must never fight speech, never shame a miss, and must duck or stop when mute is on (`arcade_hub_mute` and per-game mutes).

---

## Global rules (prepend to every SFX / bed / stinger prompt)

```text
103 Arcade sonic lock: cinematic children's storybook, warm and safe, never scary.
Soft dynamics. No jumpscares, no buzzer-quiz shame, no cartoon "WAH-WAH" fail trombones.
No lyrics, no sung words, no UI voiceover inside SFX or beds.
No cyberpunk / industrial / horror / meme / 8-bit chiptune as the identity
(tiny arcade sparkle is OK on UI clicks only).
Must sit under a child's spoken letter or word: leave headroom, no busy midrange.
Kid-safe, classroom-safe, phone-speaker-safe.
Deliver dry or lightly sweetened; no huge hall reverb.
Loop beds must be seamless. One-shots must have clean tails (no clicks).
```

**Technical delivery (engineers):**

| Kind | Format | Channels | Length | Loudness | Path |
|---|---|---|---|---|---|
| UI / learning / reward SFX | MP3 128–160 kbps (master WAV 48 kHz 24-bit) | mono | 50–700 ms | peak ≤ −6 dBTP, around −16 LUFS | `docs/assets/audio/ui/{id}.mp3` |
| World beds | MP3 128 kbps stereo or mono | stereo preferred | 20–40 s seamless loop | −20 to −24 LUFS, peak ≤ −8 dBTP | `docs/assets/audio/worlds/{hub,reading,spelling,math}-bed.mp3` |
| Mascot stingers | MP3 128 kbps | mono | 350–500 ms | peak ≤ −8 dBTP | `docs/assets/audio/mascots/{owl,bee,turtle}-stinger.mp3` |
| Learning voice | MP3 96–128 kbps (master WAV) | mono | clip length | peak ≤ −6 dBTP, −16 LUFS | `docs/assets/audio/voice/{id}.mp3` |

Beds play under speech. If a bed and a voice clip overlap, duck the bed ~8–12 dB, do not duck the word.

**Do not generate this batch:** world trailers, in-lesson cutscenes, mascot dialogue, sung alphabet songs, full TTS replacement of prompts.

---

## Production order

1. **Priority 1** — Shared SFX (every World + arcade). Replace synth IDs in `audio.json`.
2. **Priority 2** — Learning Voice script/manifest (record later). Source of truth is this pack; games keep `speechSynthesis` until clips exist.
3. **Priority 3** — Four ambient beds (Hub + Reading + Spelling + Math).
4. **Priority 4** — Three mascot stingers (Owl, Bee, Turtle).
5. **Later, not now** — Silent 4–6 s Hub doorway WebM, then Reading map only.

---

# Priority 1 — Shared SFX pack

Emotional intent for the whole family: **a warm magic storybook that celebrates trying**. Success feels like a bloom of light. A miss feels like a soft puff of air and a second chance. Rewards feel earned and gentle, never casino.

Existing files `correct.mp3`, `error-soft.mp3`, `tick.mp3` may be **replaced** so they match this family. Keep the same IDs.

Use one prompt block per clip (or per tight group). Output: one one-shot, no voice, no melody hook longer than three notes.

### 1A · Ship first (highest frequency)

#### `correct` → `audio/ui/correct.mp3` · ~400 ms · learning

```text
Soft success bloom for a child's correct answer. Bright but gentle: two or three
ascending glass/bell notes with a tiny sparkle tail, like a storybook page
catching sunlight. Warm major, mid-high register, no brass fanfare, no slot-machine
chime, no vocal. Emotional intent: "yes — you did it" with a smile, never a
game-show buzzer win. Short decay so the next word can speak immediately.
```

#### `error-soft` → `audio/ui/error-soft.mp3` · ~350 ms · learning

```text
Gentle miss. A small airy puff plus one low, round wood-block or muted kalimba
tone that falls a half-step, then disappears. Soft, sympathetic, never scolding.
No buzzers, no dissonant stabs, no "wrong answer" quiz horn, no cartoon fail.
Emotional intent: "oops, try again — you are still safe." Must not startle
on phone speakers.
```

#### `tick` → `audio/ui/tick.mp3` · ~80 ms · ui

```text
Tiny timer tick for the last seconds of an arcade round (RhymeTime etc.).
Soft wooden clock tick, high-mid, very short, low volume. Not a metronome
hammer, not a bomb fuse, not a heartbeat of dread. Emotional intent: gentle
urgency, still playful. Classroom-safe.
```

#### `click` → `audio/ui/click.mp3` · ~50 ms · ui

```text
UI button press. Soft glassy tap, like a fingertip on a polished wooden toy.
Extremely short. No mechanical keyboard clack, no wet click, no laser pew.
Emotional intent: responsive and light. Must survive being fired many times
in a row without fatigue.
```

#### `select` → `audio/ui/select.mp3` · ~80 ms · ui

```text
Choosing a world, card, or answer option. A slightly fuller cousin of click:
tiny rising wood-chime, one note, warm. Emotional intent: "this one."
Still quieter than correct.
```

#### `star` → `audio/ui/star.mp3` · ~300 ms · rewards

```text
A single star earned. High twinkle: one bright star-chime with a short glitter
tail. Magical, small, storybook — not an RPG loot explosion. Emotional intent:
delight, bite-sized.
```

#### `xp` → `audio/ui/xp.mp3` · ~250 ms · rewards

```text
XP drip. Soft ascending two-note coin/shimmer, rounded and kind.
Not a metallic arcade coin spam. Emotional intent: progress ticked forward.
```

#### `unlock` → `audio/ui/unlock.mp3` · ~400 ms · rewards

```text
A path, lesson, or world node opening. Gentle golden glow-whoosh into a small
major resolution (two notes max). Feels like a door of light, not a padlock
click or chest slam. Emotional intent: invitation — "you may enter."
```

#### `sparkle` → `audio/ui/sparkle.mp3` · ~260 ms · world

```text
Streak / confetti sparkle overlay. Cluster of tiny high bells, irregular,
like fireflies. Sits on top of correct without masking speech. Emotional
intent: extra joy after a run of success. No whooshing noise floor.
```

### 1B · Learning loop

#### `almost` → `audio/ui/almost.mp3` · ~200 ms

```text
Nearly correct. Neutral-warm suspended chime that doesn't resolve — curious,
not sad. Emotional intent: "so close, keep going."
```

#### `hint` → `audio/ui/hint.mp3` · ~180 ms

```text
A hint appearing. Soft page-turn plus a tiny harp grace note. Helpful,
never mocking. Emotional intent: a friend leaning in.
```

#### `try-again` → `audio/ui/try-again.mp3` · ~220 ms

```text
Retry after a miss. Small hopeful up-turn, quieter than correct.
Emotional intent: "another try is welcome."
```

#### `streak` → `audio/ui/streak.mp3` · ~280 ms

```text
Streak acknowledgement. Quick rising sparkle arpeggio, three notes, still
small. Emotional intent: momentum, not hype-bro energy.
```

#### `mastery` → `audio/ui/mastery.mp3` · ~500 ms

```text
Skill bar / lesson mastery. Warmer and fuller than star: a short storybook
cadence, bells + soft pad, no orchestra stabs. Emotional intent: quiet pride.
```

#### `life` → `audio/ui/life.mp3` · ~280 ms · learning

```text
Arcade life lost (RhymeTime hearts). Soft descending woodwind-like tone,
sympathetic, not grim. Emotional intent: "careful" without panic.
```

#### `wrongBuzz` → `audio/ui/wrongBuzz.mp3` · ~200 ms

```text
Soft insect-wing flutter, very muted — a spelling-bee cousin of error-soft,
not an alarm. Low-mid, round, short. Emotional intent: gentle notice.
If it could be heard as a real buzzer, it is too harsh — rewrite.
```

#### `buzz` → `audio/ui/buzz.mp3` · ~120 ms · ui

```text
Tiny friendly bee-wing accent for Spelling/AbcBuzz UI only. Playful, high,
dry. Not a fly, not a phone vibrate.
```

### 1C · Rewards, chrome, world magic

#### `open` / `close` / `back` → `audio/ui/{open,close,back}.mp3` · 70–120 ms

```text
Panel chrome family. Open: soft whoosh-in like a storybook cover lifting.
Close: the cover settling. Back: a smaller reverse of open.
Wooden + air, no UI "Windows error." Emotional intent: navigation is calm.
```

#### `companion` → `audio/ui/companion.mp3` · ~450 ms

```text
Companion unlock. Heartfelt little flourish: warm chime + tiny wing/page
flutter. Emotional intent: you made a friend. No fanfare overkill.
```

#### `badge` → `audio/ui/badge.mp3` · ~350 ms

```text
Badge stamp. Soft wax-seal thunk plus a gold sparkle. Satisfying, small.
Emotional intent: a sticker in a scrapbook, not a military medal.
```

#### `level-up` → `audio/ui/level-up.mp3` · ~600 ms

```text
Player level up on the hub. Short magical lift — rising pad and bells,
major, still under 1 second. Emotional intent: growing, not dominating.
No dubstep drop, no RPG level-up choir.
```

#### `reward` / `complete` → `audio/ui/{reward,complete}.mp3` · 400–500 ms

```text
Reward: gift-box sparkle, modest. Complete: lesson/path finished — slightly
longer cousin of mastery, resolved and restful. Emotional intent: finished
the page, close the book with a smile.
```

#### `fanfare` → `audio/ui/fanfare.mp3` · ~700 ms

```text
Arcade party / champion. The biggest cue in the pack and still child-safe:
short storybook trumpet-bell hybrid, major, playful, no stadium stinger.
Emotional intent: celebration that can play over confetti without drowning
the room. Cap energy at "birthday candle," not "esports."
```

#### `magic` → `audio/ui/magic.mp3` · ~350 ms

```text
World magic accent (blooms, unlock glow). Airy chime-swell, fairy-dust,
mid-high. Emotional intent: the illustrated universe is alive.
```

### 1D · Can wait (same sonic family, lower frequency)

#### `boss-intro` / `boss-success` / `boss-retry` → `audio/ui/boss-*.mp3`

```text
Soft mastery "boss" — never threatening. Intro: curious drum-free swell,
a question in music. Success: warm complete. Retry: same language as
try-again, a little braver. No boss-fight metal, no dark choir, no health-bar
tension. Emotional intent: a puzzle guardian, not an enemy.
```

#### `create` / `save` / `discover` → `audio/ui/{create,save,discover}.mp3` · lab

```text
Secret Lab family. Create: pencil/spark invention tick. Save: page settled
in a book. Discover: small wonder chime. Curious workshop, not sci-fi lab.
Emotional intent: making is joyful and private.
```

---

# Priority 2 — Learning Voice (script / manifest)

**This is the source of truth.** Do not invent a second phonics set in a game file. Align `wordquest-content.js`, `spellbuzz-content.js`, `abcbuzz.html`, and `RhymeTime` speak strings to these IDs when clips ship.

Games keep browser `speechSynthesis` as fallback until a clip exists for that ID.

**Do not record** full lesson prompts, stories, coach lines, or parent copy. Record **isolated letter names, phonemes, and target words** only. The engine plays `word-cat`, not “Build the word cat.”

Machine-readable twin: [`../manifests/voice-script.json`](../manifests/voice-script.json) — **232 clips** (26 letter names, 39 phonemes, 162 words, 5 optional stems). `blue`/`red` live in the word banks; they are not duplicated as extra color files.

### Voice talent spec (for the recording team)

```text
Warm adult storyteller, American English, smile in the voice, never baby-talk.
Clear enough for preschool phonics. Medium pitch, gentle, confident.
Rate: slightly slow (about 0.85 of conversation) on words; clipped on phonemes.
Dry studio, no music bed, no character voices (not the owl/bee/turtle).
No vocal fry, no shout, no whisper that dies on phone speakers.
Same person for the entire manifest. Neutral and kind.
```

**Phoneme performance:** consonants should be as pure as a child can still hear. Avoid a long trailing “uh.” If a stop needs a hint of vowel to be audible, keep it microscopic. Vowels are the American short/long pair used in the tables below — **short vowels drive CVC**, not letter names.

### Prototype generation (OpenAI / ElevenLabs)

Do not wait on a recording session for a first pass. `scripts/assets/generate-voice.js` reads `voice-script.json` and writes `docs/assets/audio/voice/{id}.mp3`. `ArcadeAssets.playVoice(id)` uses the file when it exists.

```bash
# Preview what would be sent (no API calls)
npm run assets:voice:dry

# Smoke test 3 clips, then the full 232
npm run assets:voice -- --ids letter-name-a,phoneme-short-a,word-cat
npm run assets:voice

# Better phoneme control (still OpenAI, uses instructions)
npm run assets:voice -- --model gpt-4o-mini-tts --voice shimmer --force --kind phoneme

# ElevenLabs (set ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID)
npm run assets:voice -- --provider elevenlabs --ssml --kind phoneme
```

Uses `OPENAI_API_KEY` from `.env` / `.env.local` (same key as the coach). Default voice is **Shimmer**, model **tts-1**, speed **0.85**. Existing files are skipped unless `--force`. QC phonemes first — `tts-1` cannot read IPA; the script sends respellings (`aaa` for short A, `sss` for /s/). Studio talent still wins for production.

**Canonical split (fixes current app drift):**

| Layer | Meaning | Example A |
|---|---|---|
| Letter **name** | Alphabet name | A = “ay” `/eɪ/` |
| Letter **sound** (short) | CVC / beginning sound | A = ă in *apple* `/æ/` |
| Letter **sound** (long) | Silent-e / vowel teams | A = ā in *cake* `/eɪ/` |

AbcBuzz currently speaks A as “ay” for sounds. When clips ship, **sound items use `phoneme-short-*`**, name items use `letter-name-*`.

### 2A · Letter names (26)

Speak the common American alphabet name. Filename `letter-name-{a-z}`.

| ID | Speak | Cue for talent |
|---|---|---|
| `letter-name-a` | A | “ay” |
| `letter-name-b` | B | “bee” |
| `letter-name-c` | C | “see” |
| `letter-name-d` | D | “dee” |
| `letter-name-e` | E | “ee” |
| `letter-name-f` | F | “eff” |
| `letter-name-g` | G | “jee” |
| `letter-name-h` | H | “aych” |
| `letter-name-i` | I | “eye” |
| `letter-name-j` | J | “jay” |
| `letter-name-k` | K | “kay” |
| `letter-name-l` | L | “ell” |
| `letter-name-m` | M | “em” |
| `letter-name-n` | N | “en” |
| `letter-name-o` | O | “oh” |
| `letter-name-p` | P | “pee” |
| `letter-name-q` | Q | “cue” |
| `letter-name-r` | R | “ar” |
| `letter-name-s` | S | “ess” |
| `letter-name-t` | T | “tee” |
| `letter-name-u` | U | “you” |
| `letter-name-v` | V | “vee” |
| `letter-name-w` | W | “double-you” |
| `letter-name-x` | X | “ex” |
| `letter-name-y` | Y | “why” |
| `letter-name-z` | Z | “zee” (US, not zed) |

Used by: Word Quest letter items, AbcBuzz letter items, SpellBuzz letter camp.

### 2B · Isolated phonemes

#### Short vowels (CVC engine — required)

| ID | Phoneme | IPA | Talent cue | CVC proof |
|---|---|---|---|---|
| `phoneme-short-a` | ă | `/æ/` | apple, cat | cat, map, hat |
| `phoneme-short-e` | ĕ | `/ɛ/` | egg, bed | bed, red, pen |
| `phoneme-short-i` | ĭ | `/ɪ/` | igloo, pig | pig, sit, win |
| `phoneme-short-o` | ŏ | `/ɑ/` | octopus, hop (US “ah”) | hop, dog, box |
| `phoneme-short-u` | ŭ | `/ʌ/` | umbrella, cup | cup, sun, bug |

#### Long vowels (silent-e + teams)

| ID | Phoneme | IPA | Talent cue | Proof words |
|---|---|---|---|---|
| `phoneme-long-a` | ā | `/eɪ/` | cake, rain | cake, name, rain |
| `phoneme-long-e` | ē | `/i/` | feet, seed | feet, leaf, keep |
| `phoneme-long-i` | ī | `/aɪ/` | bike, time | bike, like, light |
| `phoneme-long-o` | ō | `/oʊ/` | home, boat | home, rope, boat |
| `phoneme-long-u` | ū / yoo | `/u/` or `/ju/` | cute, moon-adjacent “oo” in *cute* | cute |

#### Consonants (default = hard C / hard G)

| ID | Phoneme | IPA | Talent cue |
|---|---|---|---|
| `phoneme-b` | b | `/b/` | ball — clipped, not “buhhh” |
| `phoneme-c-k` | c (hard) | `/k/` | cat, can |
| `phoneme-d` | d | `/d/` | dog |
| `phoneme-f` | f | `/f/` | fan — hold the hiss briefly |
| `phoneme-g` | g (hard) | `/g/` | go, pig |
| `phoneme-h` | h | `/h/` | hat — airy |
| `phoneme-j` | j | `/dʒ/` | jam |
| `phoneme-k` | k | `/k/` | kite (same sound as hard C) |
| `phoneme-l` | l | `/l/` | leaf — “lll” |
| `phoneme-m` | m | `/m/` | map — “mmm” |
| `phoneme-n` | n | `/n/` | net — “nnn” |
| `phoneme-p` | p | `/p/` | pig |
| `phoneme-q` | qu | `/kw/` | queen — “kw” |
| `phoneme-r` | r | `/ɹ/` | red — “rrr” American |
| `phoneme-s` | s | `/s/` | sun — “sss” |
| `phoneme-t` | t | `/t/` | top |
| `phoneme-v` | v | `/v/` | van — “vvv” |
| `phoneme-w` | w | `/w/` | win |
| `phoneme-x` | x | `/ks/` | box — “ks” |
| `phoneme-y` | y (onset) | `/j/` | yellow |
| `phoneme-z` | z | `/z/` | zip — “zzz” |

#### Digraph / pattern sounds

| ID | Phoneme | IPA | Talent cue | Proof |
|---|---|---|---|---|
| `phoneme-sh` | sh | `/ʃ/` | ship, fish | ship, wish |
| `phoneme-ch` | ch | `/tʃ/` | chair, chip | chair, chip, chat |
| `phoneme-th-unvoiced` | th | `/θ/` | thin, path | thin, path |
| `phoneme-th-voiced` | th | `/ð/` | the, them | the |
| `phoneme-wh` | wh | `/w/` or `/hw/` | when (soft “w/hw”) | when |
| `phoneme-ng` | ng | `/ŋ/` | ring | ring |
| `phoneme-ph` | ph | `/f/` | phone | phone |
| `phoneme-ck` | ck | `/k/` | duck, kick | duck, kick |

SpellBuzz letter-camp `speak: "a"` maps to `phoneme-short-a`, `speak: "k"` to `phoneme-c-k`, `speak: "kw"` to `phoneme-q`, `speak: "ks"` to `phoneme-x`.

### 2C · Word reads (isolated lemma, natural pace)

One file per word: `word-{slug}`. Speak **only the word**, lowercase meaning, natural stress. Slug is the word itself except:

- `word-i` → spoken “I”
- `word-a` → spoken article “a” (`/ə/` or `/eɪ/` — use clear “ay” for beginning readers)
- `word-theyre` → “they’re”
- `word-their` / `word-there` stay distinct

#### CVC (union of Word Quest + SpellBuzz + AbcBuzz starters + RhymeTime easy)

`bag, bat, bed, box, bug, bus, cab, cat, cup, dog, fan, fin, fox, hat, hen, hop, jam, leg, log, man, map, mop, mud, net, pen, pig, red, rim, rug, run, sip, sit, sun, top, van, win, zip`

#### Sight (union of Word Quest + SpellBuzz)

`a, all, and, are, but, can, for, go, had, her, I, in, is, me, my, not, on, see, the, to, was, we, you`

#### Blends

`clap, crab, drum, flag, frog, grip, plan, slip, snap, stop, swim, trap, tree`

#### Digraphs / RhymeTime hard

`chair, chat, chip, dish, duck, fish, kick, much, path, phone, ring, ship, thin, when, wish`

#### Silent-e

`bike, bone, cake, cute, home, hope, like, made, name, rope, time`

#### Long-vowel teams + rhyme extras

`blue, boat, coat, feet, hair, keep, leaf, light, mail, night, rain, road, seed, shoe, team`

#### Vocabulary (SpellBuzz)

`ancient, brave, eager, gentle, hidden, narrow, quiet, rapid, sturdy, vivid`

#### Multisyllable

`basket, garden, helmet, magnet, picnic, pencil, rabbit, rocket, sunset, window`

#### Tricky

`because, beautiful, enough, friend, people, their, there, theyre, though, through`

#### Roots / affix

`careful, complete, construct, helpful, inspect, predict, preview, rewrite, transport, unhappy`

#### Extra action lemmas (Word Quest)

`jump, wave`

#### Color names (AbcBuzz) — skip `red` (already CVC)

`blue, green, orange, pink, purple, white, yellow`

(`blue` already listed under long-vowel; do not duplicate files.)

### 2D · Optional stems (record only if the team wants less TTS in prompts)

Not required for v1. If recorded, still do **not** bake the target letter/word into the stem.

| ID | Speak |
|---|---|
| `stem-find-letter` | Find the letter |
| `stem-the-sound` | The sound |
| `stem-build-word` | Build the word |
| `stem-spell` | Spell |
| `stem-which-letter-starts` | What letter starts |

### 2E · Playback contract (implementation team)

```text
playVoice("phoneme-short-a")     → phonics item
playVoice("letter-name-s")       → "find the letter S"
playVoice("word-cat")            → decode / spell / rhyme prompt
missing clip                   → speechSynthesis of manifest.text
mute on                        → no voice, no bed, no SFX
```

RhymeTime currently speaks the **prompt word** (`p`), not the rhyme answer. Map `current.p` → `word-{p}`.

Do not record shame lines (“wrong”, “you missed”). Overlay copy stays visual + `error-soft`.

---

# Priority 3 — World beds (ambient loops)

Four loops only. **No melody that a child would hum over a phoneme.** Think air, space, and place. Mix as if the illustration is breathing.

Loop 20–40 seconds, seamless, stereo, −20 to −24 LUFS. No percussion grid, no vocals, no leitmotif that fights SFX chimes (SFX already owns sparkle).

### 3A · Hub doorway → `audio/worlds/hub-bed.mp3`

```text
103 Arcade hub ambient bed, 30-second seamless loop.
Emotional intent: standing on a floating storybook doorway at dawn —
wonder, safety, invitation. You have not chosen a world yet.
Sonic character: very soft high-air pad, distant wind-chime grains,
faint twinkle like far sparkles on islands. Slow, almost still.
No bass rumble, no melody hook, no choir, no synthwave, no city noise.
Must disappear under UI clicks and the learning voice.
Quiet enough to leave on: a night-light, not a title theme.
```

### 3B · Reading World → `audio/worlds/reading-bed.mp3`

```text
Reading World (Word Quest, SentenceQuest, RhymeTime, FlipMatch) ambient bed,
30-second seamless loop.
Place: blue storybook forest, stream, bridge, blue-white castle, wise owl.
Emotional intent: hush of a library inside a living forest — calm focus,
pages and water, never sleepy-to-the-point-of-snoring.
Sonic character: distant brook, very soft woodwinds-as-air (no tune),
light leaf rustle, occasional far bird that is not a cartoon cue.
Cool-blue timbre. No harp melody, no choir "Once upon a time" motif,
no owl hoots (the mascot stinger owns the owl).
Ducks under spoken words. Classroom-safe, loop-forever.
```

### 3C · Spelling World → `audio/worlds/spelling-bed.mp3`

```text
Spelling World (SpellBuzz, AbcBuzz) ambient bed, 30-second seamless loop.
Place: warm golden meadow, honey village, alphabet flowers, curious bee.
Emotional intent: sunny garden morning — busy in a gentle way, inviting
a child to try letters. Warm, never frantic.
Sonic character: soft breeze in tall grass, far village life as texture
(no voices, no market calls), tiny insect-wing shimmer buried very low,
golden midrange air. No sung alphabet, no xylophone melody riff,
no cartoon bee kazoo (the mascot stinger owns the bee).
Must stay out of the way of phoneme clips. Loop-forever, honey-warm.
```

### 3D · Math World → `audio/worlds/math-bed.mp3`

```text
Math World (NumBuzz, PatternPop) ambient bed, 30-second seamless loop.
Place: purple-blue number kingdom, snow peaks, crystals, castle, steady turtle.
Emotional intent: clear mountain magic — thinking room, wonder, patience.
Sonic character: crystalline air, slow distant shimmer like ice and stars,
very low soft pad in lavender-cyan register, almost no movement.
No ticking clocks, no calculator blips, no odd-time puzzle music,
no marching drums. The turtle stinger owns any "character" motion.
Crystal sparkle must be quieter than UI sparkle SFX so they do not clash.
Loop-forever, spacious, cold-warm not icy-hostile.
```

---

# Priority 4 — Mascot stingers

Play on world-map enter and on celebrate. **0.35–0.50 s. No spoken words. Not a jingle chorus.** Each must be identifiable as that animal without becoming a meme sound.

Same storybook family as Priority 1. Quieter than `fanfare`. Can layer with `correct` / `complete` if EQ leaves a hole (stinger = character motion, SFX = reward).

### 4A · Reading Owl → `audio/mascots/owl-stinger.mp3`

```text
Reading Owl stinger, ~400 ms. Canonical wise, gentle, encouraging owl
(tan owl, blue vest) — not a real barn-owl screech, not a Halloween hoot.
Sonic character: a soft two-note "coo-woo" suggestion made of muted woodwind
or rounded tone, plus a tiny page/feather flutter.
Emotional intent: a kind teacher arriving; "I'm with you."
Celebrate variant is the same clip (do not make a second hoot).
No vocals, no cartoon "whooo" syllable that is a spoken word.
```

### 4B · Spelling Bee → `audio/mascots/bee-stinger.mp3`

```text
Spelling Bee stinger, ~400 ms. Canonical curious, encouraging, energetic
round bee — friendly, never a pest.
Sonic character: a light wing shimmer (fast soft flutter) resolving into
one warm major honey-chime. Playful, small.
Emotional intent: "let's try a word!" Happy hover, not a sting, not a
fly-swat, not a kazoo joke.
No spoken "bzz" phoneme that could confuse letter sound /z/ or /s/.
Keep distinct from UI `buzz.mp3` (that one is a tiny tap; this is character).
```

### 4C · Math Turtle → `audio/mascots/turtle-stinger.mp3`

```text
Math Turtle stinger, ~450 ms. Canonical steady, cheerful, helpful turtle.
Sonic character: a slow, round, two-note shell-bloom — low-mid wooden
marimba or soft plucked tone with a tiny crystal overtone.
Emotional intent: "we have time; we can think." Grounded joy, not slapstick
boing, not a cartoon turtle slide-whistle.
No footsteps marching. Patience is the personality.
```

---

## After each audio batch

1. Drop files on the paths in the tables above.
2. Set `path` on the matching ID in `docs/assets/manifests/audio.json` and clear `synth: true`.
3. Add a `sources.json` row (license: proprietary, source: session recording or house designer).
4. Wire `ArcadeAssets.play(id)` (already the contract). Voice uses `voice-script.json` IDs, not TTS, when the file exists.
5. Verify: mute kills everything; beds duck under a phoneme; `error-soft` does not startle; phone speaker + laptop.

**Reading gate does not block audio.** Shared SFX and the voice manifest may ship before Spelling/Math scene rebuilds. Beds may ship per franchise as soon as that world’s stills are on screen.

---

## Explicitly out of this pack

- Video / WebM (Hub doorway silent loop is a later, separate stills-motion pass)
- Mascot dialogue (“Great job!” in character)
- Full sentence / story reads (stay on TTS)
- Math number-name bank (optional later; not Priority 2)
- Unique SFX per arcade title (FlipMatch / PatternPop reuse the shared pack)
