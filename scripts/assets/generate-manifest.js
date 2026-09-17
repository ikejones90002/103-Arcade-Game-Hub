/**
 * Build / refresh asset manifests from the docs/assets tree + curated metadata.
 * Run: node scripts/assets/generate-manifest.js
 */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "..", "docs", "assets");
const MANIFESTS = path.join(ASSETS, "manifests");

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

function entry(partial) {
  return Object.assign(
    {
      source: "generated",
      license: "proprietary"
    },
    partial
  );
}

const avatars = [
  entry({ id: "child-01", name: "Explorer A", category: "avatar-base", path: "/assets/images/avatars/base/child-01.svg", layer: "body" }),
  entry({ id: "child-02", name: "Explorer B", category: "avatar-base", path: "/assets/images/avatars/base/child-02.svg", layer: "body" }),
  entry({ id: "child-03", name: "Explorer C", category: "avatar-base", path: "/assets/images/avatars/base/child-03.svg", layer: "body" }),
  entry({ id: "hair-01", name: "Hair Wave", category: "avatar-hair", path: "/assets/images/avatars/hair/hair-01.svg", layer: "hair" }),
  entry({ id: "hair-02", name: "Hair Flip", category: "avatar-hair", path: "/assets/images/avatars/hair/hair-02.svg", layer: "hair" }),
  entry({ id: "hair-03", name: "Hair Sweep", category: "avatar-hair", path: "/assets/images/avatars/hair/hair-03.svg", layer: "hair" }),
  entry({ id: "explorer", name: "Explorer Outfit", category: "avatar-outfit", path: "/assets/images/avatars/outfits/explorer.svg", layer: "outfit", unlock: { type: "default" } }),
  entry({ id: "wizard", name: "Wizard Outfit", category: "avatar-outfit", path: "/assets/images/avatars/outfits/wizard.svg", layer: "outfit", unlock: { type: "stars", value: 5 } }),
  entry({ id: "scientist", name: "Scientist Outfit", category: "avatar-outfit", path: "/assets/images/avatars/outfits/scientist.svg", layer: "outfit", unlock: { type: "lessons", value: 4 } }),
  entry({ id: "knight", name: "Knight Outfit", category: "avatar-outfit", path: "/assets/images/avatars/outfits/knight.svg", layer: "outfit", unlock: { type: "boss" } }),
  entry({ id: "glasses", name: "Glasses", category: "avatar-accessory", path: "/assets/images/avatars/accessories/glasses.svg", layer: "accessory", unlock: { type: "stars", value: 2 } }),
  entry({ id: "hat", name: "Adventure Hat", category: "avatar-accessory", path: "/assets/images/avatars/accessories/hat.svg", layer: "accessory", unlock: { type: "lessons", value: 2 } }),
  entry({ id: "backpack", name: "Backpack", category: "avatar-accessory", path: "/assets/images/avatars/accessories/backpack.svg", layer: "accessory", unlock: { type: "stars", value: 8 } }),
  entry({ id: "crown", name: "Crown", category: "avatar-accessory", path: "/assets/images/avatars/accessories/crown.svg", layer: "accessory", unlock: { type: "boss" } }),
  entry({ id: "smile", name: "Smile", category: "avatar-expression", path: "/assets/images/avatars/expressions/smile.svg", layer: "expression" }),
  // aliases for engagement.avatar.outfit starter
  entry({ id: "starter", name: "Starter Outfit", category: "avatar-outfit", path: "/assets/images/avatars/outfits/explorer.svg", layer: "outfit", unlock: { type: "default" } })
];

const companions = [
  entry({ id: "book-owl", name: "Book Owl", category: "companion", world: "reading", path: "/assets/images/companions/reading/book-owl.svg", fallbackEmoji: "🦉" }),
  entry({ id: "story-fox", name: "Story Fox", category: "companion", world: "reading", path: "/assets/images/companions/reading/story-fox.svg", fallbackEmoji: "🦊" }),
  entry({ id: "word-rabbit", name: "Word Rabbit", category: "companion", world: "reading", path: "/assets/images/companions/reading/word-rabbit.svg", fallbackEmoji: "🐰" }),
  entry({ id: "page-dragon", name: "Page Dragon", category: "companion", world: "reading", path: "/assets/images/companions/reading/page-dragon.svg", fallbackEmoji: "🐉" }),
  entry({ id: "buzzbee", name: "Buzzbee", category: "companion", world: "spelling", path: "/assets/images/companions/spelling/buzzbee.svg", fallbackEmoji: "🐝" }),
  entry({ id: "letter-owl", name: "Letter Owl", category: "companion", world: "spelling", path: "/assets/images/companions/spelling/letter-owl.svg", fallbackEmoji: "🦉" }),
  entry({ id: "sound-fox", name: "Sound Fox", category: "companion", world: "spelling", path: "/assets/images/companions/spelling/sound-fox.svg", fallbackEmoji: "🦊" }),
  entry({ id: "word-frog", name: "Word Frog", category: "companion", world: "spelling", path: "/assets/images/companions/spelling/word-frog.svg", fallbackEmoji: "🐸" }),
  entry({ id: "number-turtle", name: "Number Turtle", category: "companion", world: "math", path: "/assets/images/companions/math/number-turtle.svg", fallbackEmoji: "🐢" }),
  entry({ id: "countbot", name: "Countbot", category: "companion", world: "math", path: "/assets/images/companions/math/countbot.svg", fallbackEmoji: "🤖" }),
  entry({ id: "fraction-fox", name: "Fraction Fox", category: "companion", world: "math", path: "/assets/images/companions/math/fraction-fox.svg", fallbackEmoji: "🦊" }),
  entry({ id: "equation-dragon", name: "Equation Dragon", category: "companion", world: "math", path: "/assets/images/companions/math/equation-dragon.svg", fallbackEmoji: "🐉" })
];

const worlds = {
  reading: [
    entry({ id: "reading-stage-0", name: "Story Sprout", category: "world-stage", world: "reading", stageIndex: 0, path: "/assets/images/worlds/reading/stage-0-sprout.svg" }),
    entry({ id: "reading-stage-1", name: "Story Forest", category: "world-stage", world: "reading", stageIndex: 1, path: "/assets/images/worlds/reading/stage-1-forest.svg" }),
    entry({ id: "reading-stage-2", name: "Book Village", category: "world-stage", world: "reading", stageIndex: 2, path: "/assets/images/worlds/reading/stage-2-village.svg" }),
    entry({ id: "reading-stage-3", name: "Story Kingdom", category: "world-stage", world: "reading", stageIndex: 3, path: "/assets/images/worlds/reading/stage-3-kingdom.svg" })
  ],
  spelling: [
    entry({ id: "spelling-stage-0", name: "Sound Meadow", category: "world-stage", world: "spelling", stageIndex: 0, path: "/assets/images/worlds/spelling/stage-0-meadow.svg" }),
    entry({ id: "spelling-stage-1", name: "Word Workshop", category: "world-stage", world: "spelling", stageIndex: 1, path: "/assets/images/worlds/spelling/stage-1-workshop.svg" }),
    entry({ id: "spelling-stage-2", name: "Word Town", category: "world-stage", world: "spelling", stageIndex: 2, path: "/assets/images/worlds/spelling/stage-2-village.svg" }),
    entry({ id: "spelling-stage-3", name: "Pattern Castle", category: "world-stage", world: "spelling", stageIndex: 3, path: "/assets/images/worlds/spelling/stage-3-castle.svg" })
  ],
  math: [
    entry({ id: "math-stage-0", name: "Quiet Clearing", category: "world-stage", world: "math", stageIndex: 0, path: "/assets/images/worlds/math/stage-0-clearing.svg" }),
    entry({ id: "math-stage-1", name: "Count Forest", category: "world-stage", world: "math", stageIndex: 1, path: "/assets/images/worlds/math/stage-1-forest.svg" }),
    entry({ id: "math-stage-2", name: "Number Village", category: "world-stage", world: "math", stageIndex: 2, path: "/assets/images/worlds/math/stage-2-village.svg" }),
    entry({ id: "math-stage-3", name: "Equation Peaks", category: "world-stage", world: "math", stageIndex: 3, path: "/assets/images/worlds/math/stage-3-peaks.svg" })
  ]
};

const audio = [
  entry({ id: "correct", name: "Correct", category: "learning", type: "sfx", path: "/assets/audio/ui/correct.mp3", source: "internal-legacy", license: "proprietary", volume: 1.0, durationMs: 400 }),
  entry({ id: "error-soft", name: "Soft miss", category: "learning", type: "sfx", path: "/assets/audio/ui/error-soft.mp3", source: "internal-legacy", license: "proprietary", volume: 0.9, durationMs: 350 }),
  entry({ id: "tick", name: "Tick", category: "ui", type: "sfx", path: "/assets/audio/ui/tick.mp3", source: "internal-legacy", license: "proprietary", volume: 0.6, durationMs: 80 }),
  entry({ id: "click", name: "Click", category: "ui", type: "sfx", path: "/assets/audio/ui/click.mp3", synth: true, volume: 0.5, durationMs: 50 }),
  entry({ id: "select", name: "Select", category: "ui", type: "sfx", path: "/assets/audio/ui/select.mp3", synth: true, volume: 0.6, durationMs: 80 }),
  entry({ id: "back", name: "Back", category: "ui", type: "chrome", path: "/assets/audio/ui/back.mp3", synth: true, volume: 0.7, durationMs: 70 }),
  entry({ id: "open", name: "Open", category: "ui", type: "chrome", path: "/assets/audio/ui/open.mp3", synth: true, volume: 0.7, durationMs: 120 }),
  entry({ id: "close", name: "Close", category: "ui", type: "chrome", path: "/assets/audio/ui/close.mp3", synth: true, volume: 0.7, durationMs: 100 }),
  entry({ id: "almost", name: "Almost", category: "learning", type: "learning", path: "/assets/audio/ui/almost.mp3", synth: true, volume: 0.8, durationMs: 200 }),
  entry({ id: "hint", name: "Hint", category: "learning", type: "learning", path: "/assets/audio/ui/hint.mp3", synth: true, volume: 0.8, durationMs: 180 }),
  entry({ id: "try-again", name: "Try again", category: "learning", type: "learning", path: "/assets/audio/ui/try-again.mp3", synth: true, volume: 0.9, durationMs: 220 }),
  entry({ id: "streak", name: "Streak", category: "rewards", type: "reward", path: "/assets/audio/ui/streak.mp3", synth: true, volume: 1.0, durationMs: 280 }),
  entry({ id: "mastery", name: "Mastery", category: "rewards", type: "reward", path: "/assets/audio/ui/mastery.mp3", synth: true, volume: 1.0, durationMs: 500 }),
  entry({ id: "star", name: "Star", category: "rewards", type: "reward", path: "/assets/audio/ui/star.mp3", synth: true, volume: 1.0, durationMs: 300 }),
  entry({ id: "xp", name: "XP", category: "rewards", type: "reward", path: "/assets/audio/ui/xp.mp3", synth: true, volume: 0.8, durationMs: 250 }),
  entry({ id: "unlock", name: "Unlock", category: "rewards", type: "reward", path: "/assets/audio/ui/unlock.mp3", synth: true, volume: 1.0, durationMs: 400 }),
  entry({ id: "companion", name: "Companion unlock", category: "rewards", type: "reward", path: "/assets/audio/ui/companion.mp3", synth: true, volume: 1.0, durationMs: 450 }),
  entry({ id: "badge", name: "Badge", category: "rewards", type: "reward", path: "/assets/audio/ui/badge.mp3", synth: true, volume: 1.0, durationMs: 350 }),
  entry({ id: "level-up", name: "Level up", category: "rewards", type: "reward", path: "/assets/audio/ui/level-up.mp3", synth: true, volume: 1.0, durationMs: 600 }),
  entry({ id: "reward", name: "Reward", category: "rewards", type: "reward", path: "/assets/audio/ui/reward.mp3", synth: true, volume: 1.0, durationMs: 400 }),
  entry({ id: "complete", name: "Complete", category: "rewards", type: "reward", path: "/assets/audio/ui/complete.mp3", synth: true, volume: 1.0, durationMs: 500 }),
  entry({ id: "sparkle", name: "Sparkle", category: "world", type: "world", path: "/assets/audio/ui/sparkle.mp3", synth: true, volume: 0.8, durationMs: 260 }),
  entry({ id: "magic", name: "Magic", category: "world", type: "world", path: "/assets/audio/ui/magic.mp3", synth: true, volume: 0.8, durationMs: 350 }),
  entry({ id: "fanfare", name: "Fanfare", category: "rewards", type: "reward", path: "/assets/audio/ui/fanfare.mp3", synth: true, volume: 1.0, durationMs: 700 }),
  entry({ id: "life", name: "Life lost soft", category: "learning", type: "learning", path: "/assets/audio/ui/life.mp3", synth: true, volume: 0.9, durationMs: 280 }),
  entry({ id: "buzz", name: "Buzz", category: "ui", type: "ui", path: "/assets/audio/ui/buzz.mp3", synth: true, volume: 0.6, durationMs: 120 }),
  entry({ id: "wrongBuzz", name: "Wrong soft buzz", category: "learning", type: "learning", path: "/assets/audio/ui/wrongBuzz.mp3", synth: true, volume: 0.7, durationMs: 200 }),
  entry({ id: "hub-bed", name: "Hub doorway bed", category: "world-bed", type: "bed", path: "/assets/audio/worlds/hub-bed.mp3", synth: true, loop: true, volume: 0.5, durationMs: 30000 }),
  entry({ id: "reading-bed", name: "Reading World bed", category: "world-bed", type: "bed", path: "/assets/audio/worlds/reading-bed.mp3", synth: true, loop: true, volume: 0.45, durationMs: 30000 }),
  entry({ id: "spelling-bed", name: "Spelling World bed", category: "world-bed", type: "bed", path: "/assets/audio/worlds/spelling-bed.mp3", synth: true, loop: true, volume: 0.45, durationMs: 30000 }),
  entry({ id: "math-bed", name: "Math World bed", category: "world-bed", type: "bed", path: "/assets/audio/worlds/math-bed.mp3", synth: true, loop: true, volume: 0.45, durationMs: 30000 }),
  entry({ id: "owl-stinger", name: "Reading Owl stinger", category: "mascot", type: "stinger", path: "/assets/audio/mascots/owl-stinger.mp3", synth: true, volume: 0.9, durationMs: 400 }),
  entry({ id: "bee-stinger", name: "Spelling Bee stinger", category: "mascot", type: "stinger", path: "/assets/audio/mascots/bee-stinger.mp3", synth: true, volume: 0.9, durationMs: 400 }),
  entry({ id: "turtle-stinger", name: "Math Turtle stinger", category: "mascot", type: "stinger", path: "/assets/audio/mascots/turtle-stinger.mp3", synth: true, volume: 0.9, durationMs: 450 }),
  entry({ id: "boss-intro", name: "Boss intro", category: "boss", type: "learning", path: null, synth: true, volume: 0.8, durationMs: 500 }),
  entry({ id: "boss-success", name: "Boss success", category: "boss", type: "reward", path: null, synth: true, volume: 1.0, durationMs: 650 }),
  entry({ id: "boss-retry", name: "Boss retry", category: "boss", type: "learning", path: null, synth: true, volume: 0.8, durationMs: 350 }),
  entry({ id: "create", name: "Lab create", category: "lab", type: "chrome", path: null, synth: true, volume: 0.7, durationMs: 220 }),
  entry({ id: "save", name: "Lab save", category: "lab", type: "chrome", path: null, synth: true, volume: 0.7, durationMs: 280 }),
  entry({ id: "discover", name: "Discover", category: "lab", type: "learning", path: null, synth: true, volume: 0.8, durationMs: 400 })
];

const uiExtras = [
  entry({ id: "sparkle-icon", name: "Sparkle icon", category: "ui", path: "/assets/images/ui/sparkle.svg" }),
  entry({ id: "star-badge", name: "Star badge", category: "badge", path: "/assets/images/badges/star-badge.svg" })
];

function diskPath(urlPath) {
  if (!urlPath) return null;
  return path.join(ASSETS, urlPath.replace(/^\/assets\//, "").replace(/\//g, path.sep));
}

function writeJson(name, data) {
  fs.mkdirSync(MANIFESTS, { recursive: true });
  fs.writeFileSync(path.join(MANIFESTS, name), JSON.stringify(data, null, 2) + "\n");
}

const sources = {};
function addSource(e) {
  sources[e.id] = {
    source: e.source || "generated",
    license: e.license || "proprietary",
    path: e.path || null,
    category: e.category
  };
}

avatars.forEach(addSource);
companions.forEach(addSource);
Object.keys(worlds).forEach(function (k) {
  worlds[k].forEach(addSource);
});
audio.forEach(addSource);
uiExtras.forEach(addSource);

writeJson("avatars.json", { version: 1, items: avatars });
writeJson("companions.json", { version: 1, items: companions });
writeJson("worlds.json", { version: 1, worlds: worlds });
writeJson("audio.json", {
  version: 1,
  pack: "1.0.0",
  category: "103-arcade-audio",
  groups: {
    ui: audio.filter(function (e) { return e.category !== "world-bed" && e.category !== "mascot" && e.category !== "boss" && e.category !== "lab"; }).map(function (e) { return e.id; }),
    worlds: ["hub-bed", "reading-bed", "spelling-bed", "math-bed"],
    mascots: ["owl-stinger", "bee-stinger", "turtle-stinger"]
  },
  items: audio
});
writeJson("ui.json", { version: 1, items: uiExtras });
writeJson("sources.json", { version: 1, assets: sources });

// sanity: required files on disk
let missing = 0;
[...avatars, ...companions, ...uiExtras]
  .concat(worlds.reading, worlds.spelling, worlds.math)
  .forEach(function (e) {
    if (!e.path) return;
    if (!exists(diskPath(e.path))) {
      console.warn("MISSING", e.path);
      missing++;
    }
  });
audio.forEach(function (e) {
  if (e.path && !exists(diskPath(e.path))) {
    if (e.synth) console.warn("RESERVED audio (synth until recorded)", e.path);
    else {
      console.warn("MISSING audio", e.path);
      missing++;
    }
  }
});

console.log("Manifests written to docs/assets/manifests/");
if (missing) {
  console.error("Missing files:", missing);
  process.exitCode = 1;
} else {
  console.log("All path-backed assets present.");
}
