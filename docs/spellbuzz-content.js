/* SpellBuzz Spelling World — curriculum data */
(function (global) {
  "use strict";

  function lesson(id, title, skillTags, activities, reward) {
    return { id: id, title: title, skillTags: skillTags, activities: activities, reward: reward || { xp: 15, stars: 1 } };
  }

  function letterChoices(correct, n) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const opts = [correct];
    while (opts.length < n) {
      const L = letters[Math.floor(Math.random() * letters.length)];
      if (opts.indexOf(L) === -1) opts.push(L);
    }
    return opts.sort(function () { return Math.random() - 0.5; });
  }

  function makeLetterActs(pairs) {
    return pairs.map(function (p) {
      return {
        type: "choice",
        prompt: "Which letter says /" + p.sound + "/?",
        speak: p.sound,
        answer: p.letter,
        options: letterChoices(p.letter, 4),
        skill: "letterSounds"
      };
    });
  }

  function makeSpellActs(words, skill) {
    return words.map(function (w) {
      return {
        type: "spell",
        prompt: "Spell: " + w.toUpperCase(),
        speak: w,
        answer: w.toLowerCase(),
        skill: skill || "phonicsSpelling"
      };
    });
  }

  function makeChoiceSpell(items, skill) {
    return items.map(function (it) {
      return {
        type: "choice",
        prompt: it.prompt,
        speak: it.speak || it.answer,
        answer: it.answer,
        options: it.options,
        skill: skill || "sightSpelling"
      };
    });
  }

  const CVC = ["cat", "dog", "sun", "map", "pig", "bed", "hop", "run", "sit", "cup", "pen", "box"];
  const SIGHT = ["the", "and", "you", "for", "are", "but", "not", "all", "can", "had", "her", "was"];
  const BLENDS = ["flag", "stop", "crab", "swim", "tree", "frog", "plan", "clap", "grip", "snap"];
  const DIGRAPHS = ["ship", "chat", "thin", "when", "fish", "much", "path", "ring", "duck", "kick"];
  const SILENTE = ["cake", "bike", "home", "cute", "name", "rope", "time", "hope", "made", "like"];
  const LONGVOWEL = ["rain", "boat", "feet", "team", "road", "leaf", "seed", "mail", "coat", "keep"];
  const VOCAB = ["brave", "quiet", "rapid", "gentle", "ancient", "sturdy", "narrow", "eager", "hidden", "vivid"];
  const MULTI = ["basket", "sunset", "rabbit", "pencil", "window", "garden", "helmet", "magnet", "picnic", "rocket"];
  const TRICKY = ["their", "there", "they're", "because", "friend", "enough", "though", "people", "through", "beautiful"];
  const ROOTS = ["preview", "rewrite", "unhappy", "careful", "helpful", "transport", "construct", "inspect", "predict", "complete"];

  const letterCamp = {
    id: "letter-sound-camp",
    level: 1,
    name: "Letter & Sound Camp",
    focus: "Letters and sounds",
    age: "Preschool",
    icon: "🔤",
    nodes: [
      {
        id: "sound-circle",
        name: "Sound Circle",
        blurb: "Hear the letter",
        lessons: [
          lesson("ls-1", "Sounds A–M", ["letterSounds"], makeLetterActs([
            { letter: "A", sound: "a" }, { letter: "B", sound: "b" }, { letter: "C", sound: "k" },
            { letter: "D", sound: "d" }, { letter: "E", sound: "e" }, { letter: "F", sound: "f" },
            { letter: "G", sound: "g" }, { letter: "H", sound: "h" }, { letter: "I", sound: "i" },
            { letter: "J", sound: "j" }, { letter: "K", sound: "k" }, { letter: "L", sound: "l" }, { letter: "M", sound: "m" }
          ]), { xp: 20, stars: 1 }),
          lesson("ls-2", "Sounds N–Z", ["letterSounds"], makeLetterActs([
            { letter: "N", sound: "n" }, { letter: "O", sound: "o" }, { letter: "P", sound: "p" },
            { letter: "Q", sound: "kw" }, { letter: "R", sound: "r" }, { letter: "S", sound: "s" },
            { letter: "T", sound: "t" }, { letter: "U", sound: "u" }, { letter: "V", sound: "v" },
            { letter: "W", sound: "w" }, { letter: "X", sound: "ks" }, { letter: "Y", sound: "y" }, { letter: "Z", sound: "z" }
          ]), { xp: 20, stars: 1, unlock: "first-letters" })
        ]
      },
      {
        id: "first-letters",
        name: "First Letters",
        blurb: "Beginning sounds",
        lessons: [
          lesson("fl-1", "Starts with…", ["letterSounds"], [
            { type: "choice", prompt: "What letter starts SUN?", speak: "sun", answer: "S", options: letterChoices("S", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts MAP?", speak: "map", answer: "M", options: letterChoices("M", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts DOG?", speak: "dog", answer: "D", options: letterChoices("D", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts CAT?", speak: "cat", answer: "C", options: letterChoices("C", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts PIG?", speak: "pig", answer: "P", options: letterChoices("P", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts BED?", speak: "bed", answer: "B", options: letterChoices("B", 4), skill: "letterSounds" }
          ], { xp: 25, stars: 1 }),
          lesson("fl-2", "More starters", ["letterSounds"], [
            { type: "choice", prompt: "What letter starts FISH?", speak: "fish", answer: "F", options: letterChoices("F", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts HAT?", speak: "hat", answer: "H", options: letterChoices("H", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts NET?", speak: "net", answer: "N", options: letterChoices("N", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts LEG?", speak: "leg", answer: "L", options: letterChoices("L", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts VAN?", speak: "van", answer: "V", options: letterChoices("V", 4), skill: "letterSounds" },
            { type: "choice", prompt: "What letter starts ZIP?", speak: "zip", answer: "Z", options: letterChoices("Z", 4), skill: "letterSounds" }
          ], { xp: 25, stars: 1 })
        ]
      }
    ]
  };

  const cvcHatchery = {
    id: "cvc-hatchery",
    level: 2,
    name: "CVC Hatchery",
    focus: "Spell CVC words",
    age: "Pre-K/K",
    icon: "🐣",
    nodes: [
      {
        id: "cvc-nest",
        name: "CVC Nest",
        blurb: "Three-letter words",
        lessons: [
          lesson("cvc-1", "Spell CVC 1", ["phonicsSpelling"], makeSpellActs(CVC.slice(0, 6), "phonicsSpelling"), { xp: 25, stars: 1 }),
          lesson("cvc-2", "Spell CVC 2", ["phonicsSpelling"], makeSpellActs(CVC.slice(6), "phonicsSpelling"), { xp: 25, stars: 1, unlock: "cvc-choice" })
        ]
      },
      {
        id: "cvc-choice",
        name: "Pick the Spelling",
        blurb: "Choose the word",
        lessons: [
          lesson("cvcc-1", "Which spelling?", ["phonicsSpelling"], makeChoiceSpell([
            { prompt: "Listen: cat — pick the spelling", speak: "cat", answer: "cat", options: ["cat", "cot", "cut"] },
            { prompt: "Listen: dog — pick the spelling", speak: "dog", answer: "dog", options: ["dog", "dig", "dug"] },
            { prompt: "Listen: sun — pick the spelling", speak: "sun", answer: "sun", options: ["sun", "son", "sin"] },
            { prompt: "Listen: map — pick the spelling", speak: "map", answer: "map", options: ["map", "mop", "mud"] },
            { prompt: "Listen: pig — pick the spelling", speak: "pig", answer: "pig", options: ["pig", "peg", "pug"] },
            { prompt: "Listen: bed — pick the spelling", speak: "bed", answer: "bed", options: ["bed", "bad", "bid"] }
          ], "phonicsSpelling"), { xp: 30, stars: 1 }),
          lesson("cvcc-2", "More choices", ["phonicsSpelling"], makeChoiceSpell([
            { prompt: "Listen: hop — pick the spelling", speak: "hop", answer: "hop", options: ["hop", "hip", "hap"] },
            { prompt: "Listen: run — pick the spelling", speak: "run", answer: "run", options: ["run", "ran", "rin"] },
            { prompt: "Listen: sit — pick the spelling", speak: "sit", answer: "sit", options: ["sit", "sat", "set"] },
            { prompt: "Listen: cup — pick the spelling", speak: "cup", answer: "cup", options: ["cup", "cap", "cop"] },
            { prompt: "Listen: pen — pick the spelling", speak: "pen", answer: "pen", options: ["pen", "pan", "pin"] },
            { prompt: "Listen: box — pick the spelling", speak: "box", answer: "box", options: ["box", "bax", "bex"] }
          ], "phonicsSpelling"), { xp: 30, stars: 1 })
        ]
      }
    ]
  };

  function twoNodeWorld(id, level, name, focus, age, icon, skill, wordsA, wordsB, choiceItems) {
    return {
      id: id,
      level: level,
      name: name,
      focus: focus,
      age: age,
      icon: icon,
      nodes: [
        {
          id: id + "-a",
          name: "Practice Path",
          blurb: "Spell it out",
          lessons: [
            lesson(id + "-a1", "Spell set 1", [skill], makeSpellActs(wordsA, skill), { xp: 25, stars: 1 }),
            lesson(id + "-a2", "Spell set 2", [skill], makeSpellActs(wordsB, skill), { xp: 25, stars: 1, unlock: id + "-b" })
          ]
        },
        {
          id: id + "-b",
          name: "Challenge Path",
          blurb: "Choose or spell",
          lessons: [
            lesson(id + "-b1", "Pick spellings", [skill], makeChoiceSpell(choiceItems, skill), { xp: 30, stars: 1 }),
            lesson(id + "-b2", "Spell challenge", [skill], makeSpellActs(wordsA.concat(wordsB).slice(0, 8), skill), { xp: 35, stars: 2 })
          ]
        }
      ]
    };
  }

  const sightMeadow = twoNodeWorld(
    "sight-meadow", 3, "Sight Spelling Meadow", "High-frequency words", "K–1", "🏡",
    "sightSpelling", SIGHT.slice(0, 6), SIGHT.slice(6),
    SIGHT.slice(0, 6).map(function (w) {
      return { prompt: "Spell of \"" + w + "\"", speak: w, answer: w, options: [w, w + "e", w.slice(0, -1) + "a"].slice(0, 3) };
    })
  );

  const blendsTown = twoNodeWorld(
    "blends-town", 4, "Blends & Digraphs Town", "Blends and digraphs", "1st–2nd", "🚦",
    "patternSpelling", BLENDS.slice(0, 5), DIGRAPHS.slice(0, 5),
    BLENDS.slice(0, 6).map(function (w) {
      return { prompt: "Listen: " + w, speak: w, answer: w, options: [w, w.replace(/.$/, "e"), w.slice(0, -1)].filter(Boolean).slice(0, 3) };
    })
  );

  const patternCastle = twoNodeWorld(
    "pattern-castle", 5, "Pattern Castle", "Silent-e and long vowels", "2nd–3rd", "🏰",
    "patternSpelling", SILENTE.slice(0, 5), LONGVOWEL.slice(0, 5),
    SILENTE.slice(0, 6).map(function (w) {
      return { prompt: "Listen: " + w, speak: w, answer: w, options: [w, w.replace("e", ""), w + "e"].slice(0, 3) };
    })
  );

  const vocabMap = twoNodeWorld(
    "vocab-spell-map", 6, "Vocabulary Spelling Map", "Meaning + spelling", "3rd–4th", "🗺️",
    "vocabularySpelling", VOCAB.slice(0, 5), VOCAB.slice(5),
    [
      { prompt: "Brave means not afraid — spell it", speak: "brave", answer: "brave", options: ["brave", "braiv", "brabe"] },
      { prompt: "Quiet means not loud — spell it", speak: "quiet", answer: "quiet", options: ["quiet", "quieet", "kwiet"] },
      { prompt: "Rapid means fast — spell it", speak: "rapid", answer: "rapid", options: ["rapid", "rappid", "raped"] },
      { prompt: "Gentle means kind — spell it", speak: "gentle", answer: "gentle", options: ["gentle", "gentel", "jentle"] },
      { prompt: "Narrow means thin — spell it", speak: "narrow", answer: "narrow", options: ["narrow", "narow", "naro"] },
      { prompt: "Eager means excited — spell it", speak: "eager", answer: "eager", options: ["eager", "eeger", "egar"] }
    ]
  );

  const multiHighlands = twoNodeWorld(
    "multi-highlands", 7, "Multisyllable Highlands", "Chunk big words", "4th–5th", "⛰️",
    "multisyllable", MULTI.slice(0, 5), MULTI.slice(5),
    MULTI.slice(0, 6).map(function (w) {
      return { prompt: "Listen: " + w, speak: w, answer: w, options: [w, w + "s", w.slice(0, -1)].slice(0, 3) };
    })
  );

  const challengePeaks = twoNodeWorld(
    "challenge-peaks", 8, "Challenge Peaks", "Homophones and tricky words", "5th–6th", "🏔️",
    "trickyWords", TRICKY.slice(0, 5), TRICKY.slice(5),
    [
      { prompt: "Belonging to them — their / there / they're", speak: "their", answer: "their", options: ["their", "there", "they're"] },
      { prompt: "A place — their / there / they're", speak: "there", answer: "there", options: ["their", "there", "they're"] },
      { prompt: "They are — their / there / they're", speak: "they're", answer: "they're", options: ["their", "there", "they're"] },
      { prompt: "Spell: because", speak: "because", answer: "because", options: ["because", "becaus", "becuase"] },
      { prompt: "Spell: friend", speak: "friend", answer: "friend", options: ["friend", "freind", "frend"] },
      { prompt: "Spell: people", speak: "people", answer: "people", options: ["people", "peaple", "peopel"] }
    ]
  );

  const masteryLibrary = twoNodeWorld(
    "mastery-library", 9, "Mastery Library", "Roots and affixes", "6th–7th", "📚",
    "trickyWords", ROOTS.slice(0, 5), ROOTS.slice(5),
    [
      { prompt: "pre + view = ?", speak: "preview", answer: "preview", options: ["preview", "prevue", "prevew"] },
      { prompt: "re + write = ?", speak: "rewrite", answer: "rewrite", options: ["rewrite", "rewrit", "riwrite"] },
      { prompt: "un + happy = ?", speak: "unhappy", answer: "unhappy", options: ["unhappy", "unhapy", "unhappie"] },
      { prompt: "care + ful = ?", speak: "careful", answer: "careful", options: ["careful", "carful", "carefull"] },
      { prompt: "help + ful = ?", speak: "helpful", answer: "helpful", options: ["helpful", "helpfull", "helpfulll"] },
      { prompt: "Spell: complete", speak: "complete", answer: "complete", options: ["complete", "compleet", "complet"] }
    ]
  );

  const WORLDS = [letterCamp, cvcHatchery, sightMeadow, blendsTown, patternCastle, vocabMap, multiHighlands, challengePeaks, masteryLibrary];

  const GRADE_BANDS = [
    { grade: 1, worldId: "letter-sound-camp", startNode: null, label: "Preschool", name: "Letter & Sound Camp", age: "Preschool" },
    { grade: 2, worldId: "cvc-hatchery", startNode: null, label: "Pre-K/K", name: "CVC Hatchery", age: "Pre-K/K" },
    { grade: 3, worldId: "sight-meadow", startNode: null, label: "K–1", name: "Sight Spelling Meadow", age: "K–1" },
    { grade: 4, worldId: "blends-town", startNode: null, label: "1st–2nd", name: "Blends & Digraphs Town", age: "1st–2nd" },
    { grade: 5, worldId: "pattern-castle", startNode: null, label: "2nd–3rd", name: "Pattern Castle", age: "2nd–3rd" },
    { grade: 6, worldId: "vocab-spell-map", startNode: null, label: "3rd–4th", name: "Vocabulary Spelling Map", age: "3rd–4th" },
    { grade: 7, worldId: "multi-highlands", startNode: null, label: "4th–5th", name: "Multisyllable Highlands", age: "4th–5th" },
    { grade: 8, worldId: "challenge-peaks", startNode: null, label: "5th–6th", name: "Challenge Peaks", age: "5th–6th" },
    { grade: 9, worldId: "mastery-library", startNode: null, label: "6th–7th", name: "Mastery Library", age: "6th–7th" }
  ];

  const MAP_REGIONS = GRADE_BANDS.map(function (b, i) {
    const w = WORLDS[i];
    return { id: w.id, level: b.grade, name: w.name, focus: w.focus, age: w.age, icon: w.icon, startNode: b.startNode };
  });

  const PLACEMENT_QUESTIONS = [
    { type: "choice", prompt: "What letter starts SUN?", speak: "sun", answer: "S", options: letterChoices("S", 4), skill: "letterSounds", tier: 1 },
    { type: "choice", prompt: "What letter starts MAP?", speak: "map", answer: "M", options: letterChoices("M", 4), skill: "letterSounds", tier: 1 },
    { type: "spell", prompt: "Spell: cat", speak: "cat", answer: "cat", skill: "phonicsSpelling", tier: 2 },
    { type: "spell", prompt: "Spell: dog", speak: "dog", answer: "dog", skill: "phonicsSpelling", tier: 2 },
    { type: "spell", prompt: "Spell: the", speak: "the", answer: "the", skill: "sightSpelling", tier: 3 },
    { type: "spell", prompt: "Spell: and", speak: "and", answer: "and", skill: "sightSpelling", tier: 3 },
    { type: "spell", prompt: "Spell: flag", speak: "flag", answer: "flag", skill: "patternSpelling", tier: 4 },
    { type: "spell", prompt: "Spell: ship", speak: "ship", answer: "ship", skill: "patternSpelling", tier: 4 },
    { type: "spell", prompt: "Spell: cake", speak: "cake", answer: "cake", skill: "patternSpelling", tier: 5 },
    { type: "spell", prompt: "Spell: rain", speak: "rain", answer: "rain", skill: "patternSpelling", tier: 5 },
    { type: "spell", prompt: "Spell: brave", speak: "brave", answer: "brave", skill: "vocabularySpelling", tier: 6 },
    { type: "choice", prompt: "Quiet means not loud — pick spelling", speak: "quiet", answer: "quiet", options: ["quiet", "quieet", "kwiet"], skill: "vocabularySpelling", tier: 6 },
    { type: "spell", prompt: "Spell: basket", speak: "basket", answer: "basket", skill: "multisyllable", tier: 7 },
    { type: "spell", prompt: "Spell: window", speak: "window", answer: "window", skill: "multisyllable", tier: 7 },
    { type: "choice", prompt: "Belonging to them", speak: "their", answer: "their", options: ["their", "there", "they're"], skill: "trickyWords", tier: 8 },
    { type: "spell", prompt: "Spell: because", speak: "because", answer: "because", skill: "trickyWords", tier: 8 },
    { type: "spell", prompt: "Spell: preview", speak: "preview", answer: "preview", skill: "trickyWords", tier: 9 },
    { type: "choice", prompt: "care + ful = ?", speak: "careful", answer: "careful", options: ["careful", "carful", "carefull"], skill: "trickyWords", tier: 9 }
  ];

  const SKILL_LABELS = {
    letterSounds: "Letter sounds",
    phonicsSpelling: "Phonics spelling",
    sightSpelling: "Sight spelling",
    patternSpelling: "Pattern spelling",
    vocabularySpelling: "Vocabulary spelling",
    multisyllable: "Multisyllable",
    trickyWords: "Tricky words"
  };

  const MASTERY = {
    letterSounds: 70,
    phonicsSpelling: 65,
    sightSpelling: 65,
    patternSpelling: 60,
    vocabularySpelling: 60,
    multisyllable: 55,
    trickyWords: 55
  };

  const COSMETICS = [
    { id: "frame-bee", name: "Bee Frame", cost: 20, unlockAtStars: 3 },
    { id: "frame-book", name: "Book Frame", cost: 40, unlockAtStars: 8 },
    { id: "frame-quill", name: "Quill Frame", cost: 80, unlockAtStars: 15 },
    { id: "sticker-star", name: "Star Sticker", cost: 10, unlockAtStars: 1 },
    { id: "sticker-abc", name: "ABC Sticker", cost: 25, unlockAtStars: 5 }
  ];

  const REMEDIATION_BANK = {
    letterSounds: makeLetterActs([{ letter: "S", sound: "s" }, { letter: "M", sound: "m" }, { letter: "T", sound: "t" }, { letter: "P", sound: "p" }]),
    phonicsSpelling: makeSpellActs(["cat", "dog", "sun", "map"], "phonicsSpelling"),
    sightSpelling: makeSpellActs(["the", "and", "you", "for"], "sightSpelling"),
    patternSpelling: makeSpellActs(["flag", "ship", "cake", "rain"], "patternSpelling"),
    vocabularySpelling: makeSpellActs(["brave", "quiet", "rapid"], "vocabularySpelling"),
    multisyllable: makeSpellActs(["basket", "sunset", "rabbit"], "multisyllable"),
    trickyWords: makeSpellActs(["because", "friend", "people"], "trickyWords")
  };

  function countWorldActivities(worldId) {
    const world = WORLDS.find(function (w) { return w.id === worldId; });
    if (!world) return 0;
    let n = 0;
    world.nodes.forEach(function (node) {
      node.lessons.forEach(function (l) { n += l.activities.length; });
    });
    return n;
  }

  function isWorldPreview(worldId) {
    return countWorldActivities(worldId) < 10;
  }


  const COMPANIONS = [
  {
    "id": "buzzbee",
    "assetId": "buzzbee",
    "name": "Buzzbee",
    "emoji": "🐝",
    "unlock": "first-lesson",
    "lines": {
      "correct": "Buzzbee: That spelling buzzed!",
      "miss": "Buzzbee: Sound it out with me.",
      "complete": "Buzzbee: Hive high-five!",
      "boss": "Buzzbee: Sweet mastery!"
    }
  },
  {
    "id": "letter-owl",
    "assetId": "letter-owl",
    "name": "Letter Owl",
    "emoji": "🦉",
    "unlock": "lessons",
    "unlockAt": 4,
    "lines": {
      "correct": "Owl: Perfect letters!",
      "miss": "Owl: Listen again.",
      "complete": "Owl: Words returning!",
      "boss": "Owl: Machine humming!"
    }
  },
  {
    "id": "sound-fox",
    "assetId": "sound-fox",
    "name": "Sound Fox",
    "emoji": "🦊",
    "unlock": "stars",
    "unlockAt": 6,
    "lines": {
      "correct": "Fox: I heard that ending!",
      "miss": "Fox: Try the sounds slowly.",
      "complete": "Fox: Pattern found!",
      "boss": "Fox: Spelling victory!"
    }
  },
  {
    "id": "word-frog",
    "assetId": "word-frog",
    "name": "Word Frog",
    "emoji": "🐸",
    "unlock": "boss",
    "lines": {
      "correct": "Frog: Ribbit-right!",
      "miss": "Frog: Hop back and retry.",
      "complete": "Frog: Leap complete!",
      "boss": "Frog: Boss beaten!"
    }
  }
];
  const MISSIONS = {
  "letter-sound-camp:sound-circle:ls-1": {
    "title": "Fix the Sound Circle",
    "blurb": "Letters lost their voices—help them speak.",
    "emoji": "🔤"
  },
  "cvc-hatchery:cvc-nest:cvc-1": {
    "title": "Hatch the CVC Eggs",
    "blurb": "Spell three-letter words to wake the hatchery.",
    "emoji": "🐣"
  }
};
  const BOSSES = {
  "letter-sound-camp:first-letters": {
    "title": "The Silent Letter Beast",
    "blurb": "Spell and choose to restore the Word Machine.",
    "emoji": "🐉",
    "reward": {
      "xp": 20,
      "stars": 2
    },
    "activities": [
      {
        "type": "choice",
        "prompt": "What letter starts SUN?",
        "speak": "sun",
        "answer": "S",
        "options": [
          "S",
          "M",
          "T",
          "P"
        ],
        "skill": "letterSounds"
      },
      {
        "type": "spell",
        "prompt": "Spell: cat",
        "speak": "cat",
        "answer": "cat",
        "skill": "phonicsSpelling"
      },
      {
        "type": "spell",
        "prompt": "Spell: dog",
        "speak": "dog",
        "answer": "dog",
        "skill": "phonicsSpelling"
      }
    ]
  }
};
  const WORLD_STAGES = {
  "letter-sound-camp": [
    {
      "icon": "🌱",
      "label": "Empty Sound Meadow"
    },
    {
      "icon": "🌼",
      "label": "Letters Appear"
    },
    {
      "icon": "🏠",
      "label": "Word Workshop"
    },
    {
      "icon": "🏘️",
      "label": "Spelling Village"
    },
    {
      "icon": "🏰",
      "label": "Pattern Castle"
    }
  ],
  "cvc-hatchery": [
    {
      "icon": "🌱",
      "label": "Quiet Nest"
    },
    {
      "icon": "🐣",
      "label": "CVC Hatchery"
    },
    {
      "icon": "🏡",
      "label": "Word Barn"
    },
    {
      "icon": "🏰",
      "label": "Phonics Keep"
    }
  ],
  "sight-meadow": [
    {
      "icon": "🌱",
      "label": "Blank Meadow"
    },
    {
      "icon": "🌼",
      "label": "Sight Meadow"
    },
    {
      "icon": "🏘️",
      "label": "Sight Village"
    },
    {
      "icon": "🏰",
      "label": "Fluent Keep"
    }
  ],
  "blends-town": [
    {
      "icon": "🌱",
      "label": "Quiet Crossroads"
    },
    {
      "icon": "🚦",
      "label": "Blends Town"
    },
    {
      "icon": "🏙️",
      "label": "Digraph District"
    },
    {
      "icon": "🏰",
      "label": "Blend Castle"
    }
  ],
  "pattern-castle": [
    {
      "icon": "🌱",
      "label": "Silent Gate"
    },
    {
      "icon": "🏰",
      "label": "Pattern Castle"
    },
    {
      "icon": "🏯",
      "label": "Long Vowel Hall"
    },
    {
      "icon": "👑",
      "label": "Pattern Crown"
    }
  ],
  "vocab-spell-map": [
    {
      "icon": "🌱",
      "label": "Word Trails"
    },
    {
      "icon": "🗺️",
      "label": "Vocab Map"
    },
    {
      "icon": "🏞️",
      "label": "Meaning Valley"
    },
    {
      "icon": "🏰",
      "label": "Lexicon Keep"
    }
  ],
  "multi-highlands": [
    {
      "icon": "🌱",
      "label": "Syllable Camp"
    },
    {
      "icon": "⛰️",
      "label": "Multisyllable Highlands"
    },
    {
      "icon": "🏔️",
      "label": "Chunk Peaks"
    },
    {
      "icon": "🏰",
      "label": "Syllable Castle"
    }
  ],
  "challenge-peaks": [
    {
      "icon": "🌱",
      "label": "Tricky Trail"
    },
    {
      "icon": "🏔️",
      "label": "Challenge Peaks"
    },
    {
      "icon": "🌋",
      "label": "Homophone Ridge"
    },
    {
      "icon": "🏰",
      "label": "Mastery Spire"
    }
  ],
  "mastery-library": [
    {
      "icon": "🌱",
      "label": "Root Shelf"
    },
    {
      "icon": "📚",
      "label": "Mastery Library"
    },
    {
      "icon": "🏛️",
      "label": "Affix Hall"
    },
    {
      "icon": "👑",
      "label": "Word Crown"
    }
  ]
};
  const LAB_PROMPTS = [
  "Invent three silly words and spell them.",
  "Make a rhyming pair of made-up words.",
  "Write a password for a secret club using a blend."
];
  const DAILY_POOL = [
  {
    "type": "spell",
    "prompt": "Spell: cat",
    "speak": "cat",
    "answer": "cat",
    "skill": "phonicsSpelling"
  },
  {
    "type": "spell",
    "prompt": "Spell: the",
    "speak": "the",
    "answer": "the",
    "skill": "sightSpelling"
  },
  {
    "type": "choice",
    "prompt": "Listen: ship",
    "speak": "ship",
    "answer": "ship",
    "options": [
      "ship",
      "sip",
      "shop"
    ],
    "skill": "patternSpelling"
  },
  {
    "type": "spell",
    "prompt": "Spell: cake",
    "speak": "cake",
    "answer": "cake",
    "skill": "patternSpelling"
  }
];

  global.SBContent = {
    COMPANIONS: COMPANIONS,
    MISSIONS: MISSIONS,
    BOSSES: BOSSES,
    WORLD_STAGES: WORLD_STAGES,
    LAB_PROMPTS: LAB_PROMPTS,
    DAILY_POOL: DAILY_POOL,
    WORLDS: WORLDS,
    GRADE_BANDS: GRADE_BANDS,
    MAP_REGIONS: MAP_REGIONS,
    PLACEMENT_QUESTIONS: PLACEMENT_QUESTIONS,
    SKILL_LABELS: SKILL_LABELS,
    MASTERY: MASTERY,
    COSMETICS: COSMETICS,
    REMEDIATION_BANK: REMEDIATION_BANK,
    countWorldActivities: countWorldActivities,
    isWorldPreview: isWorldPreview,
    getWorld: function (id) { return WORLDS.find(function (w) { return w.id === id; }) || null; },
    getNode: function (worldId, nodeId) {
      const world = this.getWorld(worldId);
      if (!world) return null;
      return world.nodes.find(function (n) { return n.id === nodeId; }) || null;
    },
    getLesson: function (worldId, nodeId, lessonId) {
      const node = this.getNode(worldId, nodeId);
      if (!node) return null;
      return node.lessons.find(function (l) { return l.id === lessonId; }) || null;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
