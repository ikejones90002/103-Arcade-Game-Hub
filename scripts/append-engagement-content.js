/* Append engagement content packs to each world's content file independently */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "docs");

function appendPack(file, globalName, pack) {
  let s = fs.readFileSync(path.join(root, file), "utf8");
  if (s.includes("COMPANIONS: COMPANIONS")) {
    console.log("skip content", file);
    return;
  }
  const marker = "  global." + globalName + " = {";
  if (!s.includes(marker)) throw new Error("missing " + marker);
  const consts =
    "\n  const COMPANIONS = " + JSON.stringify(pack.companions, null, 2) + ";\n" +
    "  const MISSIONS = " + JSON.stringify(pack.missions, null, 2) + ";\n" +
    "  const BOSSES = " + JSON.stringify(pack.bosses, null, 2) + ";\n" +
    "  const WORLD_STAGES = " + JSON.stringify(pack.stages, null, 2) + ";\n" +
    "  const LAB_PROMPTS = " + JSON.stringify(pack.labPrompts, null, 2) + ";\n" +
    "  const DAILY_POOL = " + JSON.stringify(pack.dailyPool, null, 2) + ";\n\n";
  const replacement =
    consts +
    marker +
    "\n    COMPANIONS: COMPANIONS,\n    MISSIONS: MISSIONS,\n    BOSSES: BOSSES,\n    WORLD_STAGES: WORLD_STAGES,\n    LAB_PROMPTS: LAB_PROMPTS,\n    DAILY_POOL: DAILY_POOL,";
  s = s.replace(marker, replacement);
  fs.writeFileSync(path.join(root, file), s);
  console.log("content", file);
}

const readingStages = {
  "alphabet-forest": [
    { icon: "🌱", label: "Story Sprout" },
    { icon: "🌲", label: "Story Forest" },
    { icon: "🏡", label: "Book Village" },
    { icon: "📚", label: "Library Grove" },
    { icon: "🏰", label: "Story Kingdom" }
  ],
  "cvc-meadow": [
    { icon: "🌱", label: "Word Seeds" },
    { icon: "🌼", label: "CVC Meadow" },
    { icon: "🏡", label: "Sentence Farm" },
    { icon: "🏰", label: "Word Keep" }
  ],
  "sight-word-town": [
    { icon: "🌱", label: "Tiny Town" },
    { icon: "🏘️", label: "Sight Word Town" },
    { icon: "🏙️", label: "Fluent City" },
    { icon: "🏰", label: "Sight Castle" }
  ],
  "fluency-castle": [
    { icon: "🌱", label: "Slow Stream" },
    { icon: "🌊", label: "Reading River" },
    { icon: "🏰", label: "Fluency Castle" },
    { icon: "👑", label: "Flow Throne" }
  ],
  "vocabulary-map": [
    { icon: "🌱", label: "Word Trails" },
    { icon: "🗺️", label: "Vocabulary Map" },
    { icon: "🏞️", label: "Meaning Valley" },
    { icon: "🏰", label: "Lexicon Keep" }
  ],
  "quest-highlands": [
    { icon: "🌱", label: "Campfire" },
    { icon: "⛰️", label: "Quest Highlands" },
    { icon: "🏔️", label: "Detail Peaks" },
    { icon: "🏰", label: "Summit Hall" }
  ],
  "inference-peaks": [
    { icon: "🌱", label: "Clue Camp" },
    { icon: "🔮", label: "Inference Peaks" },
    { icon: "🏔️", label: "Insight Ridge" },
    { icon: "🏰", label: "Oracle Tower" }
  ],
  "crown-library": [
    { icon: "🌱", label: "Quiet Stacks" },
    { icon: "📚", label: "Crown Library" },
    { icon: "🏛️", label: "Analysis Hall" },
    { icon: "👑", label: "Crown Chamber" }
  ]
};

appendPack("wordquest-content.js", "WQContent", {
  companions: [
    { id: "book-owl", name: "Book Owl", emoji: "🦉", unlock: "first-lesson", lines: { correct: "Owl: Wise choice!", miss: "Owl: Let's look again together.", complete: "Owl: I found a clue!", boss: "Owl: You read like a champion!" } },
    { id: "story-fox", name: "Story Fox", emoji: "🦊", unlock: "lessons", unlockAt: 4, lines: { correct: "Fox: That detail sparkled!", miss: "Fox: Try another trail.", complete: "Fox: Onward through the pages!", boss: "Fox: The story is safe!" } },
    { id: "word-rabbit", name: "Word Rabbit", emoji: "🐰", unlock: "stars", unlockAt: 6, lines: { correct: "Rabbit: Hop-yes!", miss: "Rabbit: Soft landing—try again.", complete: "Rabbit: Another page hopped!", boss: "Rabbit: Mastery hop!" } },
    { id: "page-dragon", name: "Page Dragon", emoji: "🐉", unlock: "boss", lines: { correct: "Dragon: Roar of approval!", miss: "Dragon: Breathe, then try.", complete: "Dragon: Treasure unlocked!", boss: "Dragon: You bested me kindly!" } }
  ],
  missions: {
    "alphabet-forest:letter-camp:lc-a-e": { title: "Meet the Letters", blurb: "The forest needs its first alphabet friends.", emoji: "🌲" },
    "alphabet-forest:sound-grove:sg-1": { title: "Sound Quest", blurb: "Help the owl hear beginning sounds.", emoji: "🦉" }
  },
  bosses: {
    "alphabet-forest:story-trail": {
      title: "The Story Dragon",
      blurb: "Answer a few questions to protect the forest tales.",
      emoji: "🐉",
      reward: { xp: 20, stars: 2 },
      activities: [
        { type: "letter", prompt: "Find the letter S", speak: "S", answer: "S", options: ["S", "A", "T", "M"], skill: "letterRecognition" },
        { type: "sound", prompt: "What letter starts SUN?", speak: "Sun", answer: "S", options: ["S", "B", "C", "D"], skill: "phonics" },
        { type: "sentence", prompt: "The ___ can run.", speak: "dog", answer: "dog", options: ["dog", "dig", "dot"], skill: "comprehension" }
      ]
    }
  },
  stages: readingStages,
  labPrompts: [
    "Write a tiny story about a dragon who lost a book.",
    "Invent a hero and one problem they must solve.",
    "Describe a magical library in three sentences."
  ],
  dailyPool: [
    { type: "letter", prompt: "Find the letter M", speak: "M", answer: "M", options: ["M", "N", "W", "A"], skill: "letterRecognition" },
    { type: "sound", prompt: "What letter starts MAP?", speak: "Map", answer: "M", options: ["M", "P", "S", "T"], skill: "phonics" },
    { type: "sentence", prompt: "I see a ___.", speak: "cat", answer: "cat", options: ["cat", "cup", "cap"], skill: "comprehension" },
    { type: "sprint", prompt: "The sun is up.", speak: "The sun is up.", answer: "The sun is up.", skill: "fluency" }
  ]
});

appendPack("spellbuzz-content.js", "SBContent", {
  companions: [
    { id: "buzzbee", name: "Buzzbee", emoji: "🐝", unlock: "first-lesson", lines: { correct: "Buzzbee: That spelling buzzed!", miss: "Buzzbee: Sound it out with me.", complete: "Buzzbee: Hive high-five!", boss: "Buzzbee: Sweet mastery!" } },
    { id: "letter-owl", name: "Letter Owl", emoji: "🦉", unlock: "lessons", unlockAt: 4, lines: { correct: "Owl: Perfect letters!", miss: "Owl: Listen again.", complete: "Owl: Words returning!", boss: "Owl: Machine humming!" } },
    { id: "sound-fox", name: "Sound Fox", emoji: "🦊", unlock: "stars", unlockAt: 6, lines: { correct: "Fox: I heard that ending!", miss: "Fox: Try the sounds slowly.", complete: "Fox: Pattern found!", boss: "Fox: Spelling victory!" } },
    { id: "word-frog", name: "Word Frog", emoji: "🐸", unlock: "boss", lines: { correct: "Frog: Ribbit-right!", miss: "Frog: Hop back and retry.", complete: "Frog: Leap complete!", boss: "Frog: Boss beaten!" } }
  ],
  missions: {
    "letter-sound-camp:sound-circle:ls-1": { title: "Fix the Sound Circle", blurb: "Letters lost their voices—help them speak.", emoji: "🔤" },
    "cvc-hatchery:cvc-nest:cvc-1": { title: "Hatch the CVC Eggs", blurb: "Spell three-letter words to wake the hatchery.", emoji: "🐣" }
  },
  bosses: {
    "letter-sound-camp:first-letters": {
      title: "The Silent Letter Beast",
      blurb: "Spell and choose to restore the Word Machine.",
      emoji: "🐉",
      reward: { xp: 20, stars: 2 },
      activities: [
        { type: "choice", prompt: "What letter starts SUN?", speak: "sun", answer: "S", options: ["S", "M", "T", "P"], skill: "letterSounds" },
        { type: "spell", prompt: "Spell: cat", speak: "cat", answer: "cat", skill: "phonicsSpelling" },
        { type: "spell", prompt: "Spell: dog", speak: "dog", answer: "dog", skill: "phonicsSpelling" }
      ]
    }
  },
  stages: {
    "letter-sound-camp": [
      { icon: "🌱", label: "Empty Sound Meadow" },
      { icon: "🌼", label: "Letters Appear" },
      { icon: "🏠", label: "Word Workshop" },
      { icon: "🏘️", label: "Spelling Village" },
      { icon: "🏰", label: "Pattern Castle" }
    ],
    "cvc-hatchery": [
      { icon: "🌱", label: "Quiet Nest" },
      { icon: "🐣", label: "CVC Hatchery" },
      { icon: "🏡", label: "Word Barn" },
      { icon: "🏰", label: "Phonics Keep" }
    ],
    "sight-meadow": [
      { icon: "🌱", label: "Blank Meadow" },
      { icon: "🌼", label: "Sight Meadow" },
      { icon: "🏘️", label: "Sight Village" },
      { icon: "🏰", label: "Fluent Keep" }
    ],
    "blends-town": [
      { icon: "🌱", label: "Quiet Crossroads" },
      { icon: "🚦", label: "Blends Town" },
      { icon: "🏙️", label: "Digraph District" },
      { icon: "🏰", label: "Blend Castle" }
    ],
    "pattern-castle": [
      { icon: "🌱", label: "Silent Gate" },
      { icon: "🏰", label: "Pattern Castle" },
      { icon: "🏯", label: "Long Vowel Hall" },
      { icon: "👑", label: "Pattern Crown" }
    ],
    "vocab-spell-map": [
      { icon: "🌱", label: "Word Trails" },
      { icon: "🗺️", label: "Vocab Map" },
      { icon: "🏞️", label: "Meaning Valley" },
      { icon: "🏰", label: "Lexicon Keep" }
    ],
    "multi-highlands": [
      { icon: "🌱", label: "Syllable Camp" },
      { icon: "⛰️", label: "Multisyllable Highlands" },
      { icon: "🏔️", label: "Chunk Peaks" },
      { icon: "🏰", label: "Syllable Castle" }
    ],
    "challenge-peaks": [
      { icon: "🌱", label: "Tricky Trail" },
      { icon: "🏔️", label: "Challenge Peaks" },
      { icon: "🌋", label: "Homophone Ridge" },
      { icon: "🏰", label: "Mastery Spire" }
    ],
    "mastery-library": [
      { icon: "🌱", label: "Root Shelf" },
      { icon: "📚", label: "Mastery Library" },
      { icon: "🏛️", label: "Affix Hall" },
      { icon: "👑", label: "Word Crown" }
    ]
  },
  labPrompts: [
    "Invent three silly words and spell them.",
    "Make a rhyming pair of made-up words.",
    "Write a password for a secret club using a blend."
  ],
  dailyPool: [
    { type: "spell", prompt: "Spell: cat", speak: "cat", answer: "cat", skill: "phonicsSpelling" },
    { type: "spell", prompt: "Spell: the", speak: "the", answer: "the", skill: "sightSpelling" },
    { type: "choice", prompt: "Listen: ship", speak: "ship", answer: "ship", options: ["ship", "sip", "shop"], skill: "patternSpelling" },
    { type: "spell", prompt: "Spell: cake", speak: "cake", answer: "cake", skill: "patternSpelling" }
  ]
});

appendPack("numbuzz-content.js", "NBContent", {
  companions: [
    { id: "number-turtle", name: "Number Turtle", emoji: "🐢", unlock: "first-lesson", lines: { correct: "Turtle: Steady and true!", miss: "Turtle: One step at a time.", complete: "Turtle: Shell of pride!", boss: "Turtle: Slow and mastered!" } },
    { id: "countbot", name: "Countbot", emoji: "🤖", unlock: "lessons", unlockAt: 4, lines: { correct: "Countbot: Beep—correct!", miss: "Countbot: Recalculating…", complete: "Countbot: Quest logged!", boss: "Countbot: Systems restored!" } },
    { id: "fraction-fox", name: "Fraction Fox", emoji: "🦊", unlock: "stars", unlockAt: 6, lines: { correct: "Fox: Nice split!", miss: "Fox: Break it into parts.", complete: "Fox: Pieces in place!", boss: "Fox: Whole again!" } },
    { id: "equation-dragon", name: "Equation Dragon", emoji: "🐉", unlock: "boss", lines: { correct: "Dragon: Fire of yes!", miss: "Dragon: Cool down, retry.", complete: "Dragon: Numbers aligned!", boss: "Dragon: You solved the realm!" } }
  ],
  missions: {
    "count-forest:count-path:cf-1": { title: "Count the Forest Lights", blurb: "The forest numbers went dark—count them back.", emoji: "🌲" },
    "add-hatchery:add-hatchery-camp:add-hatchery-1": { title: "Repair the Add Nest", blurb: "Solve facts to wake the hatchery.", emoji: "🐣" }
  },
  bosses: {
    "count-forest:count-more": {
      title: "The Number Scrambler",
      blurb: "Solve a few to unscramble the kingdom.",
      emoji: "🐉",
      reward: { xp: 20, stars: 2 },
      activities: [
        { type: "choice", prompt: "Which is more: 3 or 7?", speak: "more 3 or 7", answer: "7", options: ["3", "7"], skill: "counting" },
        { type: "equation", prompt: "4 + 3 = ?", speak: "4 plus 3", answer: "7", skill: "addition", payload: { equation: "4 + 3 = ?" } },
        { type: "equation", prompt: "9 − 2 = ?", speak: "9 minus 2", answer: "7", skill: "subtraction", payload: { equation: "9 − 2 = ?" } }
      ]
    }
  },
  stages: {
    "count-forest": [
      { icon: "🌱", label: "Quiet Clearing" },
      { icon: "🌲", label: "Counting Forest" },
      { icon: "🏡", label: "Number Village" },
      { icon: "🏰", label: "Count Keep" }
    ],
    "add-hatchery": [
      { icon: "🌱", label: "Empty Nest" },
      { icon: "🐣", label: "Add Hatchery" },
      { icon: "🏘️", label: "Fact Town" },
      { icon: "🏰", label: "Sum Castle" }
    ],
    "facts-meadow": [
      { icon: "🌱", label: "Soft Grass" },
      { icon: "🌿", label: "Facts Meadow" },
      { icon: "🏡", label: "Twenty Farm" },
      { icon: "🏰", label: "Fact Fortress" }
    ],
    "place-town": [
      { icon: "🌱", label: "Ones Lane" },
      { icon: "🏘️", label: "Place Value Town" },
      { icon: "🏙️", label: "Tens City" },
      { icon: "🏰", label: "Hundred Hall" }
    ],
    "mul-castle": [
      { icon: "🌱", label: "Quiet Gate" },
      { icon: "🏰", label: "Multiply Castle" },
      { icon: "🏯", label: "Divide Wing" },
      { icon: "👑", label: "Factor Crown" }
    ],
    "fractions-map": [
      { icon: "🌱", label: "Whole Pie" },
      { icon: "🍕", label: "Fractions Map" },
      { icon: "🏞️", label: "Half Valley" },
      { icon: "🏰", label: "Fraction Keep" }
    ],
    "multi-highlands": [
      { icon: "🌱", label: "Digit Camp" },
      { icon: "⚔️", label: "Multi-digit Highlands" },
      { icon: "🏔️", label: "Ops Summit" },
      { icon: "🏰", label: "Calc Castle" }
    ],
    "word-peaks": [
      { icon: "🌱", label: "Story Base" },
      { icon: "📖", label: "Word-Problem Peaks" },
      { icon: "🏔️", label: "Two-Step Ridge" },
      { icon: "🏰", label: "Problem Spire" }
    ],
    "prealg-library": [
      { icon: "🌱", label: "Symbol Shelf" },
      { icon: "📐", label: "Pre-Algebra Library" },
      { icon: "🏛️", label: "Equation Hall" },
      { icon: "👑", label: "Algebra Crown" }
    ]
  },
  labPrompts: [
    "Make a puzzle: ___ + 5 = 12. What is ___?",
    "Invent a word problem about sharing cookies.",
    "Write three equations that all equal 10."
  ],
  dailyPool: [
    { type: "equation", prompt: "3 + 4 = ?", speak: "3 plus 4", answer: "7", skill: "addition", payload: { equation: "3 + 4 = ?" } },
    { type: "equation", prompt: "10 − 3 = ?", speak: "10 minus 3", answer: "7", skill: "subtraction", payload: { equation: "10 − 3 = ?" } },
    { type: "choice", prompt: "Which is more: 5 or 2?", speak: "more 5 or 2", answer: "5", options: ["5", "2"], skill: "counting" },
    { type: "equation", prompt: "2 × 4 = ?", speak: "2 times 4", answer: "8", skill: "multiplication", payload: { equation: "2 × 4 = ?" } }
  ]
});

console.log("content packs done");
