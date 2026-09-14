/* Word Quest Reading World — curriculum content (data only) */
(function (global) {
  "use strict";

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const LETTER_SOUNDS = {
    A: "ah", B: "buh", C: "kuh", D: "duh", E: "eh", F: "fff", G: "guh",
    H: "huh", I: "ih", J: "juh", K: "kuh", L: "lll", M: "mmm", N: "nnn",
    O: "ah", P: "puh", Q: "kwuh", R: "rrr", S: "sss", T: "tuh", U: "uh",
    V: "vvv", W: "wuh", X: "ks", Y: "yuh", Z: "zzz"
  };

  const CVC_WORDS = [
    { word: "cat", emoji: "🐱" }, { word: "dog", emoji: "🐶" }, { word: "sun", emoji: "☀️" },
    { word: "pig", emoji: "🐷" }, { word: "bed", emoji: "🛏️" }, { word: "red", emoji: "🔴" },
    { word: "hop", emoji: "🐰" }, { word: "run", emoji: "🏃" }, { word: "map", emoji: "🗺️" },
    { word: "hat", emoji: "🎩" }, { word: "bat", emoji: "🦇" }, { word: "cup", emoji: "☕" },
    { word: "bus", emoji: "🚌" }, { word: "fox", emoji: "🦊" }, { word: "box", emoji: "📦" },
    { word: "hen", emoji: "🐔" }, { word: "pen", emoji: "🖊️" }, { word: "fan", emoji: "🪭" },
    { word: "jam", emoji: "🍓" }, { word: "net", emoji: "🥅" }, { word: "log", emoji: "🪵" },
    { word: "mud", emoji: "🟤" }, { word: "bug", emoji: "🐛" }, { word: "rug", emoji: "🧶" },
    { word: "sip", emoji: "🧃" }, { word: "zip", emoji: "🤐" }, { word: "mop", emoji: "🧹" },
    { word: "top", emoji: "🔝" }, { word: "fin", emoji: "🐟" }, { word: "win", emoji: "🏆" }
  ];

  const SIGHT_WORDS = ["the", "is", "you", "can", "and", "a", "I", "to", "we", "see", "my", "me", "go", "on", "in"];
  const BLENDS = [
    { word: "frog", emoji: "🐸" }, { word: "clap", emoji: "👏" }, { word: "swim", emoji: "🏊" },
    { word: "stop", emoji: "🛑" }, { word: "flag", emoji: "🚩" }, { word: "crab", emoji: "🦀" },
    { word: "trap", emoji: "🪤" }, { word: "slip", emoji: "🍌" }, { word: "drum", emoji: "🥁" }
  ];
  const DIGRAPHS = [
    { word: "ship", emoji: "🚢" }, { word: "fish", emoji: "🐟" }, { word: "duck", emoji: "🦆" },
    { word: "path", emoji: "🛤️" }, { word: "chair", emoji: "🪑" }, { word: "phone", emoji: "📱" },
    { word: "thin", emoji: "➖" }, { word: "chip", emoji: "🍟" }, { word: "wish", emoji: "✨" }
  ];
  const ACTIONS = ["sit", "run", "wave", "hop", "jump", "clap", "swim", "stop"];

  function shuffleCopy(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = copy[i];
      copy[i] = copy[j];
      copy[j] = t;
    }
    return copy;
  }

  function letterChoices(correct, count) {
    const pool = LETTERS.filter((L) => L !== correct);
    return shuffleCopy([correct].concat(shuffleCopy(pool).slice(0, count - 1)));
  }

  function wordChoices(correct, bank, count) {
    const others = bank.filter((w) => (w.word || w) !== (correct.word || correct));
    const picks = shuffleCopy(others).slice(0, count - 1).map((w) => w.word || w);
    return shuffleCopy([correct.word || correct].concat(picks));
  }

  function makeLetterActs(start, end) {
    const slice = LETTERS.slice(start, end);
    const acts = [];
    slice.forEach((L) => {
      acts.push({
        type: "letter",
        prompt: "Find the letter " + L,
        speak: L,
        answer: L,
        options: letterChoices(L, 4),
        skill: "letterRecognition"
      });
      acts.push({
        type: "sound",
        prompt: "Which letter makes the /" + LETTER_SOUNDS[L] + "/ sound?",
        speak: "The sound " + LETTER_SOUNDS[L],
        answer: L,
        options: letterChoices(L, 4),
        payload: { soundHint: LETTER_SOUNDS[L] },
        skill: "letterSounds"
      });
    });
    return acts;
  }

  function makeBuildActs(words) {
    return words.map((item) => ({
      type: "build",
      prompt: "Build the word " + item.word.toUpperCase(),
      speak: "Build the word " + item.word,
      answer: item.word,
      payload: { letters: item.word.toUpperCase().split(""), emoji: item.emoji },
      skill: "wordDecoding"
    }));
  }

  function makePictureActs(bank) {
    return bank.map((item) => ({
      type: "picture",
      prompt: item.word,
      speak: item.word,
      answer: item.word,
      options: wordChoices(item, bank, 3).map((w) => {
        const found = bank.find((b) => b.word === w) || item;
        return { word: found.word, emoji: found.emoji };
      }),
      skill: "wordDecoding"
    }));
  }

  function makeSentenceActs(items) {
    return items.map((s) => ({
      type: "sentence",
      prompt: s.text,
      speak: s.text.replace("___", s.answer),
      answer: s.answer,
      options: s.options,
      skill: s.skill || "comprehension"
    }));
  }

  function makeSprintActs(words) {
    return words.map((w) => ({
      type: "sprint",
      prompt: w,
      speak: w,
      answer: w,
      skill: "fluency"
    }));
  }

  function makeStoryAct(story) {
    return {
      type: "story",
      prompt: story.title,
      speak: story.text,
      answer: story.answer,
      options: story.options,
      payload: { emoji: story.emoji, text: story.text, question: story.question },
      skill: "comprehension"
    };
  }

  function lesson(id, title, skillTags, activities, reward) {
    return {
      id: id,
      title: title,
      skillTags: skillTags,
      activities: activities,
      reward: reward || { xp: 15, stars: 1 }
    };
  }

  const forestStories = [
    {
      title: "The Cat",
      emoji: "🐱",
      text: "A cat sat on a mat. The cat saw a hat.",
      question: "Where did the cat sit?",
      answer: "on a mat",
      options: ["on a mat", "in a box", "on a bus"]
    },
    {
      title: "Sunny Day",
      emoji: "☀️",
      text: "The sun is up. A dog runs in the mud.",
      question: "What is up?",
      answer: "the sun",
      options: ["the sun", "the moon", "a pig"]
    },
    {
      title: "Bug Hunt",
      emoji: "🐛",
      text: "A little bug is on a log. The bug can hop.",
      question: "What can the bug do?",
      answer: "hop",
      options: ["hop", "swim", "drive"]
    },
    {
      title: "Red Cup",
      emoji: "☕",
      text: "Sam has a red cup. Sam takes a sip.",
      question: "What color is the cup?",
      answer: "red",
      options: ["red", "blue", "green"]
    },
    {
      title: "The Map",
      emoji: "🗺️",
      text: "We look at a map. The map shows a path to a fox.",
      question: "What does the map show?",
      answer: "a path",
      options: ["a path", "a boat", "a cake"]
    },
    {
      title: "Hen and Pen",
      emoji: "🐔",
      text: "A hen sits by a pen. The hen can see the sun.",
      question: "Who sits by the pen?",
      answer: "a hen",
      options: ["a hen", "a dog", "a fish"]
    },
    {
      title: "Bus Ride",
      emoji: "🚌",
      text: "We hop on a bus. The bus can go fast.",
      question: "What can the bus do?",
      answer: "go fast",
      options: ["go fast", "fly", "swim"]
    },
    {
      title: "Mud Fun",
      emoji: "🟤",
      text: "A pig plays in the mud. The pig is happy.",
      question: "Where does the pig play?",
      answer: "in the mud",
      options: ["in the mud", "in a cup", "on a ship"]
    },
    {
      title: "Night Wish",
      emoji: "✨",
      text: "I make a wish. I wish for a big red hat.",
      question: "What do I wish for?",
      answer: "a big red hat",
      options: ["a big red hat", "a blue bus", "a wet dog"]
    },
    {
      title: "Win Day",
      emoji: "🏆",
      text: "We run and we win. We clap and we hop.",
      question: "What do we do after we win?",
      answer: "clap and hop",
      options: ["clap and hop", "sit and nap", "hide"]
    }
  ];

  const alphabetForest = {
    id: "alphabet-forest",
    level: 1,
    name: "Alphabet Forest",
    focus: "Letters, sounds & first words",
    age: "Preschool–K",
    icon: "🌲",
    nodes: [
      {
        id: "letter-camp",
        name: "Letter Camp",
        blurb: "Meet the letters",
        lessons: [
          lesson("lc-a-e", "Letters A–E", ["letterRecognition", "letterSounds"], makeLetterActs(0, 5), { xp: 15, stars: 1 }),
          lesson("lc-f-j", "Letters F–J", ["letterRecognition", "letterSounds"], makeLetterActs(5, 10), { xp: 15, stars: 1 }),
          lesson("lc-k-o", "Letters K–O", ["letterRecognition", "letterSounds"], makeLetterActs(10, 15), { xp: 15, stars: 1 }),
          lesson("lc-p-t", "Letters P–T", ["letterRecognition", "letterSounds"], makeLetterActs(15, 20), { xp: 15, stars: 1 }),
          lesson("lc-u-z", "Letters U–Z", ["letterRecognition", "letterSounds"], makeLetterActs(20, 26), { xp: 20, stars: 1, unlock: "sound-grove" })
        ]
      },
      {
        id: "sound-grove",
        name: "Sound Grove",
        blurb: "Hear beginning sounds",
        lessons: [
          lesson("sg-begin", "Beginning Sounds", ["phonics", "letterSounds"], [
            { type: "sound", prompt: "What letter starts CAT?", speak: "Cat", answer: "C", options: letterChoices("C", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts DOG?", speak: "Dog", answer: "D", options: letterChoices("D", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts SUN?", speak: "Sun", answer: "S", options: letterChoices("S", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts MAP?", speak: "Map", answer: "M", options: letterChoices("M", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts PIG?", speak: "Pig", answer: "P", options: letterChoices("P", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts HAT?", speak: "Hat", answer: "H", options: letterChoices("H", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts BUG?", speak: "Bug", answer: "B", options: letterChoices("B", 4), skill: "phonics" },
            { type: "sound", prompt: "What letter starts FOX?", speak: "Fox", answer: "F", options: letterChoices("F", 4), skill: "phonics" }
          ].concat(makeLetterActs(0, 6).filter((a) => a.type === "sound").slice(0, 4)), { xp: 20, stars: 1, unlock: "build-bridge" })
        ]
      },
      {
        id: "build-bridge",
        name: "Build Bridge",
        blurb: "Build CVC words",
        lessons: [
          lesson("bb-build-1", "Build Words 1", ["wordDecoding"], makeBuildActs(CVC_WORDS.slice(0, 10)), { xp: 30, stars: 1 }),
          lesson("bb-build-2", "Build Words 2", ["wordDecoding"], makeBuildActs(CVC_WORDS.slice(10, 20)), { xp: 30, stars: 1 }),
          lesson("bb-pics", "Picture Match", ["wordDecoding"], makePictureActs(CVC_WORDS.slice(0, 12)), { xp: 25, stars: 1, unlock: "story-trail" })
        ]
      },
      {
        id: "story-trail",
        name: "Story Trail",
        blurb: "Read short stories",
        lessons: [
          lesson("st-stories-1", "Forest Tales 1", ["comprehension"], forestStories.slice(0, 5).map(makeStoryAct), { xp: 35, stars: 2 }),
          lesson("st-stories-2", "Forest Tales 2", ["comprehension"], forestStories.slice(5, 10).map(makeStoryAct), { xp: 35, stars: 2 }),
          lesson("st-sentences", "Fill the Blank", ["comprehension", "wordDecoding"], makeSentenceActs([
            { text: "The ___ can run.", answer: "dog", options: ["dog", "sun", "bed"] },
            { text: "The ___ is red.", answer: "pig", options: ["pig", "hop", "cat"] },
            { text: "I can ___.", answer: "hop", options: ["hop", "map", "the"] },
            { text: "A ___ sits on a mat.", answer: "cat", options: ["cat", "bus", "jam"] },
            { text: "We look at a ___.", answer: "map", options: ["map", "mud", "zip"] }
          ]), { xp: 30, stars: 1 })
        ]
      }
    ]
  };

  const cvcMeadow = {
    id: "cvc-meadow",
    level: 3,
    name: "CVC Meadow",
    focus: "CVC words & sentences",
    age: "K–1",
    icon: "🌳",
    nodes: [
      {
        id: "meadow-words",
        name: "Word Field",
        blurb: "Decode CVC words",
        lessons: [
          lesson("cm-build", "More Building", ["wordDecoding"], makeBuildActs(CVC_WORDS.slice(20, 30)), { xp: 30, stars: 1 }),
          lesson("cm-pics", "Meadow Pictures", ["wordDecoding"], makePictureActs(CVC_WORDS.slice(12, 24)), { xp: 25, stars: 1 }),
          lesson("cm-sprint", "Read Aloud", ["fluency"], makeSprintActs(CVC_WORDS.slice(0, 12).map((w) => w.word)), { xp: 20, stars: 1, unlock: "meadow-sentences" })
        ]
      },
      {
        id: "meadow-sentences",
        name: "Sentence Stream",
        blurb: "Short sentences",
        lessons: [
          lesson("cm-sent", "Sentence Practice", ["comprehension"], makeSentenceActs([
            { text: "The cat can ___.", answer: "run", options: ["run", "ship", "the"] },
            { text: "___ can hop.", answer: "You", options: ["You", "and", "to"] },
            { text: "The ___ is big.", answer: "bus", options: ["bus", "jam", "pen"] },
            { text: "I see a ___.", answer: "fox", options: ["fox", "the", "and"] },
            { text: "The hen is on a ___.", answer: "log", options: ["log", "zip", "cup"] }
          ]), { xp: 30, stars: 1 }),
          lesson("cm-story", "Meadow Story", ["comprehension"], [
            makeStoryAct({
              title: "Across the Yard",
              emoji: "🏡",
              text: "The little cat runs across the yard. It sees a red cup on a log.",
              question: "What does the cat see?",
              answer: "a red cup",
              options: ["a red cup", "a blue ship", "a big bus"]
            }),
            makeStoryAct({
              title: "Pig and Mud",
              emoji: "🐷",
              text: "A pig jumps in the mud. Then the pig sits in the sun.",
              question: "Where does the pig sit after the mud?",
              answer: "in the sun",
              options: ["in the sun", "on a bus", "in a box"]
            })
          ], { xp: 35, stars: 2 })
        ]
      }
    ]
  };

  const sightTown = {
    id: "sight-word-town",
    level: 4,
    name: "Sight Word Town",
    focus: "Sight words & stories",
    age: "1st–2nd",
    icon: "🏡",
    nodes: [
      {
        id: "town-square",
        name: "Town Square",
        blurb: "Sight words",
        lessons: [
          lesson("sw-sprint", "Sight Sprint", ["fluency", "wordDecoding"], makeSprintActs(SIGHT_WORDS), { xp: 25, stars: 1 }),
          lesson("sw-sent", "Sight Sentences", ["comprehension"], makeSentenceActs([
            { text: "I ___ jump.", answer: "can", options: ["can", "the", "is"] },
            { text: "___ can run.", answer: "You", options: ["You", "and", "to"] },
            { text: "We ___ a dog.", answer: "see", options: ["see", "the", "my"] },
            { text: "Go ___ the path.", answer: "on", options: ["on", "me", "a"] },
            { text: "___ cat is on the mat.", answer: "The", options: ["The", "And", "To"] }
          ]), { xp: 30, stars: 1, unlock: "town-library" })
        ]
      },
      {
        id: "town-library",
        name: "Town Library",
        blurb: "Short stories",
        lessons: [
          lesson("sw-stories", "Library Tales", ["comprehension"], [
            makeStoryAct({
              title: "Maya Runs",
              emoji: "👧",
              text: "Maya can see the sun. She can go on the path. Maya runs to see her dog.",
              question: "Why did Maya run outside?",
              answer: "to see her dog",
              options: ["to see her dog", "to find a ship", "to eat jam"]
            }),
            makeStoryAct({
              title: "We Can Help",
              emoji: "🤝",
              text: "You and I can help. We can see what to do. We go and we can win.",
              question: "What can you and I do?",
              answer: "help",
              options: ["help", "hide", "sleep"]
            }),
            makeStoryAct({
              title: "My Map",
              emoji: "🗺️",
              text: "I have my map. I can see the path. You can go with me.",
              question: "What do I have?",
              answer: "my map",
              options: ["my map", "my bus", "my duck"]
            })
          ], { xp: 40, stars: 2 }),
          lesson("sw-action", "Act It Out", ["fluency"], ACTIONS.slice(0, 6).map((w) => ({
            type: "action",
            prompt: w,
            speak: w,
            answer: w,
            skill: "fluency"
          })), { xp: 20, stars: 1 })
        ]
      }
    ]
  };

  const fluencyCastle = {
    id: "fluency-castle",
    level: 5,
    name: "Fluency Castle",
    focus: "Reading fluency",
    age: "2nd–3rd",
    icon: "🏰",
    nodes: [
      {
        id: "castle-gate",
        name: "Castle Gate",
        blurb: "Speed & accuracy",
        lessons: [
          lesson("fc-blend", "Blend Sprint", ["fluency", "phonics"], makeSprintActs(BLENDS.map((b) => b.word)), { xp: 25, stars: 1 }),
          lesson("fc-digraph", "Digraph Sprint", ["fluency", "phonics"], makeSprintActs(DIGRAPHS.map((d) => d.word)), { xp: 25, stars: 1 }),
          lesson("fc-sent-read", "Sentence Fluency", ["fluency"], makeSprintActs([
            "I can jump.",
            "The dog can run.",
            "You can hop.",
            "The cat is red.",
            "We see the flag.",
            "The frog can swim."
          ]), { xp: 30, stars: 1, unlock: "castle-hall" })
        ]
      },
      {
        id: "castle-hall",
        name: "Great Hall",
        blurb: "Match & fill",
        lessons: [
          lesson("fc-pics", "Blend Pictures", ["wordDecoding"], makePictureActs(BLENDS), { xp: 25, stars: 1 }),
          lesson("fc-fill", "Castle Cloze", ["comprehension"], makeSentenceActs([
            { text: "The ___ can swim.", answer: "frog", options: ["frog", "flag", "stop"] },
            { text: "I can ___.", answer: "clap", options: ["clap", "crab", "flag"] },
            { text: "The ___ is big.", answer: "ship", options: ["ship", "path", "duck"] },
            { text: "Sit on the ___.", answer: "chair", options: ["chair", "phone", "fish"] }
          ]), { xp: 30, stars: 1 })
        ]
      }
    ]
  };

  const vocabMap = {
    id: "vocabulary-map",
    level: 6,
    name: "Vocabulary Map",
    focus: "Vocabulary & comprehension",
    age: "3rd–4th",
    icon: "🗺️",
    nodes: [
      {
        id: "vocab-trail",
        name: "Word Trail",
        blurb: "Context clues",
        lessons: [
          lesson("vm-clues-1", "Context Clues 1", ["vocabulary"], [
            { type: "sentence", prompt: "The path was narrow, so we walked in a thin line. Narrow means ___", speak: "Narrow means", answer: "thin", options: ["thin", "wide", "loud"], skill: "vocabulary" },
            { type: "sentence", prompt: "Maya was eager to start. Eager means ___", speak: "Eager means", answer: "excited", options: ["excited", "sleepy", "angry"], skill: "vocabulary" },
            { type: "sentence", prompt: "The treasure was hidden. Hidden means ___", speak: "Hidden means", answer: "not easy to see", options: ["not easy to see", "very loud", "brand new"], skill: "vocabulary" },
            { type: "sentence", prompt: "The river was rapid. Rapid means ___", speak: "Rapid means", answer: "fast", options: ["fast", "frozen", "empty"], skill: "vocabulary" },
            { type: "sentence", prompt: "Her voice was faint. Faint means ___", speak: "Faint means", answer: "quiet and hard to hear", options: ["quiet and hard to hear", "very angry", "colorful"], skill: "vocabulary" },
            { type: "sentence", prompt: "The cave was dim. Dim means ___", speak: "Dim means", answer: "not bright", options: ["not bright", "very hot", "full of food"], skill: "vocabulary" },
            { type: "sentence", prompt: "He felt brave. Brave means ___", speak: "Brave means", answer: "not afraid", options: ["not afraid", "very tired", "always late"], skill: "vocabulary" }
          ], { xp: 25, stars: 1 }),
          lesson("vm-clues-2", "Context Clues 2", ["vocabulary", "comprehension"], [
            { type: "sentence", prompt: "The scent of bread was strong. Scent means ___", speak: "Scent means", answer: "smell", options: ["smell", "sound", "color"], skill: "vocabulary" },
            { type: "sentence", prompt: "They used a sturdy rope. Sturdy means ___", speak: "Sturdy means", answer: "strong", options: ["strong", "wet", "invisible"], skill: "vocabulary" },
            makeStoryAct({ title: "The Bright Lantern", emoji: "🏮", text: "At dusk the trail grew dim. Sam lit a lantern so the path glowed. The lantern helped them find the bridge.", question: "Why did Sam light the lantern?", answer: "to see the path", options: ["to see the path", "to cook food", "to scare a frog"] }),
            makeStoryAct({ title: "A Gentle Giant", emoji: "🐘", text: "The giant was huge but gentle. It stepped carefully so it would not crush the flowers.", question: "What does gentle mean here?", answer: "careful and kind", options: ["careful and kind", "angry and loud", "tiny and fast"] }),
            makeStoryAct({ title: "The Ancient Map", emoji: "🗺️", text: "The map was ancient, with faded ink and torn edges. Still, it showed a path to the old tower.", question: "Ancient most nearly means ___", answer: "very old", options: ["very old", "brand new", "made of metal"] }),
            { type: "sentence", prompt: "The feast was enormous. Enormous means ___", speak: "Enormous means", answer: "very big", options: ["very big", "very cold", "very quiet"], skill: "vocabulary" }
          ], { xp: 30, stars: 1, unlock: "vocab-stories" })
        ]
      },
      {
        id: "vocab-stories",
        name: "Story Valley",
        blurb: "Vocabulary in stories",
        lessons: [
          lesson("vm-read-1", "Story Words 1", ["vocabulary", "comprehension"], [
            makeStoryAct({ title: "Storm Shelter", emoji: "⛈️", text: "Dark clouds gathered. The hikers sought shelter under a rocky ledge until the storm passed.", question: "Shelter means ___", answer: "a safe place", options: ["a safe place", "a loud song", "a fast run"] }),
            makeStoryAct({ title: "Clever Fox", emoji: "🦊", text: "The fox was clever. It waited until the gate opened, then slipped through without being seen.", question: "Clever most nearly means ___", answer: "smart", options: ["smart", "sleepy", "heavy"] }),
            makeStoryAct({ title: "Silent Forest", emoji: "🌲", text: "Snow muffled every sound. The forest seemed silent except for our boots crunching on the path.", question: "Muffled means ___", answer: "made quieter", options: ["made quieter", "made brighter", "made taller"] }),
            makeStoryAct({ title: "Rescue Team", emoji: "🚁", text: "The rescue team arrived quickly. They carried supplies and helped the hikers cross the river.", question: "What did the rescue team do?", answer: "helped the hikers", options: ["helped the hikers", "started a festival", "built a castle"] }),
            { type: "sentence", prompt: "The cliff was perilous. Perilous means ___", speak: "Perilous means", answer: "dangerous", options: ["dangerous", "delicious", "distant"], skill: "vocabulary" },
            { type: "sentence", prompt: "She gave a vivid description. Vivid means ___", speak: "Vivid means", answer: "clear and detailed", options: ["clear and detailed", "very short", "impossible to see"], skill: "vocabulary" }
          ], { xp: 35, stars: 2 }),
          lesson("vm-read-2", "Story Words 2", ["comprehension"], [
            makeStoryAct({ title: "Library Quest", emoji: "📚", text: "Jules searched the library for a book about stars. The librarian pointed to a shelf labeled Astronomy.", question: "What was Jules looking for?", answer: "a book about stars", options: ["a book about stars", "a pet frog", "a red hat"] }),
            makeStoryAct({ title: "Market Day", emoji: "🧺", text: "The market buzzed with voices. Vendors sold fruit, bread, and bright scarves from colorful stalls.", question: "Where did this story happen?", answer: "at a market", options: ["at a market", "on the moon", "under the sea"] }),
            makeStoryAct({ title: "Team Plan", emoji: "📋", text: "Before the hike, the team made a plan. They listed water, maps, and warm layers in their packs.", question: "Why did they make a plan?", answer: "to prepare for the hike", options: ["to prepare for the hike", "to skip school", "to hide treasure"] }),
            { type: "sentence", prompt: "The rumor spread quickly. Rumor means ___", speak: "Rumor means", answer: "a story people tell", options: ["a story people tell", "a type of shoe", "a math problem"], skill: "vocabulary" },
            { type: "sentence", prompt: "The view was spectacular. Spectacular means ___", speak: "Spectacular means", answer: "amazing to see", options: ["amazing to see", "hard to find", "easy to break"], skill: "vocabulary" }
          ].concat(makeSentenceActs([
              { text: "The trail was steep, so we moved ___.", answer: "slowly", options: ["slowly", "never", "backward"], skill: "comprehension" },
              { text: "The guide was helpful and ___.", answer: "kind", options: ["kind", "invisible", "empty"], skill: "comprehension" }
            ])), { xp: 35, stars: 2 })
        ]
      }
    ]
  };

  const questHighlands = {
    id: "quest-highlands",
    level: 7,
    name: "Quest Highlands",
    focus: "Advanced comprehension",
    age: "4th–5th",
    icon: "⚔️",
    nodes: [
      {
        id: "highland-camp",
        name: "Highland Camp",
        blurb: "Who, what, why",
        lessons: [
          lesson("qh-main-1", "Comprehension 1", ["comprehension"], [
            makeStoryAct({ title: "The Missing Flag", emoji: "🚩", text: "Jordan climbed the ridge to find the missing flag. Wind had blown it behind a rock. Jordan returned it to the village square.", question: "Why did Jordan climb the ridge?", answer: "to find the flag", options: ["to find the flag", "to swim", "to bake bread"] }),
            makeStoryAct({ title: "Shared Bread", emoji: "🍞", text: "After a long hike, the team was hungry. Mira shared her bread so everyone could eat. The team thanked Mira and rested.", question: "What is the main idea?", answer: "Mira shared food with the team", options: ["Mira shared food with the team", "They built a ship", "The wind was cold"] }),
            makeStoryAct({ title: "Bridge Choice", emoji: "🌉", text: "Two bridges crossed the river. One looked new but shaky. The old stone bridge felt steady, so the group chose it.", question: "Why did they choose the stone bridge?", answer: "it felt steady", options: ["it felt steady", "it was prettier", "it was shorter"] }),
            { type: "sentence", prompt: "Cause: The wind was strong. Effect: ___", speak: "What was the effect?", answer: "The flag blew away", options: ["The flag blew away", "The sun set early", "Jordan baked bread"], skill: "comprehension" },
            makeStoryAct({ title: "Camp Rules", emoji: "⛺", text: "At camp, everyone took turns cooking and cleaning. The captain said shared work keeps the team strong.", question: "What lesson does the captain share?", answer: "shared work helps the team", options: ["shared work helps the team", "never eat bread", "hide from rain"] }),
            { type: "sentence", prompt: "What is the main idea of Shared Bread?", speak: "Main idea", answer: "sharing helps the team", options: ["sharing helps the team", "bread is bad", "hiking is impossible"], skill: "comprehension" }
          ], { xp: 30, stars: 1 }),
          lesson("qh-main-2", "Comprehension 2", ["comprehension"], [
            makeStoryAct({ title: "Morning Mist", emoji: "🌫️", text: "Thick mist covered the valley at dawn. The scouts waited until they could see the trail markers before moving on.", question: "Why did the scouts wait?", answer: "they could not see the trail", options: ["they could not see the trail", "they had no boots", "they lost their food"] }),
            makeStoryAct({ title: "Signal Fire", emoji: "🔥", text: "When the signal fire lit up on the hill, the village knew the explorers had reached the pass safely.", question: "What did the fire tell the village?", answer: "the explorers were safe", options: ["the explorers were safe", "it was time to sleep", "a storm was coming"] }),
            makeStoryAct({ title: "River Crossing", emoji: "🌊", text: "The team linked arms in the shallow water. Together they crossed without anyone slipping on the smooth stones.", question: "How did they cross safely?", answer: "they worked together", options: ["they worked together", "they flew over", "they turned back"] }),
            { type: "sentence", prompt: "Where did the team store extra water?", speak: "Where was the water stored?", answer: "in their packs", options: ["in their packs", "on the moon", "in a tree"], skill: "comprehension" },
            { type: "sentence", prompt: "When did they reach the summit?", speak: "When did they reach the summit?", answer: "at noon", options: ["at noon", "never", "before breakfast"], skill: "comprehension" },
            makeStoryAct({ title: "Summit View", emoji: "🏔️", text: "From the summit they could see three valleys and a silver lake. The map finally made sense.", question: "What could they see from the summit?", answer: "valleys and a lake", options: ["valleys and a lake", "only fog", "a shopping mall"] })
          ], { xp: 35, stars: 2, unlock: "highland-pass" })
        ]
      },
      {
        id: "highland-pass",
        name: "Summit Pass",
        blurb: "Main idea and details",
        lessons: [
          lesson("qh-pass-1", "Detail Quest 1", ["comprehension"], [
            makeStoryAct({ title: "Lost Pack", emoji: "🎒", text: "Tina noticed her pack was missing at lunch. She retraced her steps to the stream where she had rested.", question: "What did Tina do first?", answer: "retraced her steps", options: ["retraced her steps", "built a boat", "went to sleep"] }),
            makeStoryAct({ title: "Bird Guide", emoji: "🦅", text: "A hawk circled above the ridge. The old guide said hawks often mark good wind currents for climbers.", question: "According to the guide, what do hawks mark?", answer: "good wind currents", options: ["good wind currents", "hidden caves", "broken bridges"] }),
            makeStoryAct({ title: "Storm Plan B", emoji: "⛈️", text: "Rain started at dusk. The team switched to Plan B and set camp in a sheltered grove instead of the open ridge.", question: "Why did they use Plan B?", answer: "rain started", options: ["rain started", "they found gold", "they lost their map"] }),
            { type: "sentence", prompt: "The main idea is the ___", speak: "The main idea is", answer: "big point of the passage", options: ["big point of the passage", "smallest word", "page number"], skill: "comprehension" },
            makeStoryAct({ title: "Trail Markers", emoji: "🪧", text: "Blue markers led to the lake. Red markers warned of loose rocks. The team followed blue markers all afternoon.", question: "Which markers did the team follow?", answer: "blue markers", options: ["blue markers", "red markers", "no markers"] }),
            { type: "sentence", prompt: "A detail supports the main idea by ___", speak: "A detail supports by", answer: "giving more information", options: ["giving more information", "changing the title", "deleting the story"], skill: "comprehension" }
          ], { xp: 35, stars: 2 }),
          lesson("qh-pass-2", "Detail Quest 2", ["comprehension"], [
            makeStoryAct({ title: "Night Watch", emoji: "🌙", text: "Each hour a different teammate kept watch by the fire. They logged the wind and any strange sounds in a small notebook.", question: "What did the watch team record?", answer: "wind and sounds", options: ["wind and sounds", "recipes", "video games"] }),
            makeStoryAct({ title: "Gift of Rope", emoji: "🪢", text: "When the rope frayed, an elder from the village gifted a new one woven from strong fibers.", question: "Who gave the new rope?", answer: "an elder from the village", options: ["an elder from the village", "a fish", "nobody"] }),
            makeStoryAct({ title: "Final Descent", emoji: "🥾", text: "On the final descent, the team moved slowly and checked each foothold. Everyone reached the base camp before dark.", question: "How did they stay safe on the descent?", answer: "moved slowly and checked footholds", options: ["moved slowly and checked footholds", "ran in the dark", "skipped lunch"] }),
            { type: "sentence", prompt: "Compare: Sam read maps; Lee read stars. They ___", speak: "They differ because", answer: "used different tools", options: ["used different tools", "never met", "both slept"], skill: "comprehension" },
            makeStoryAct({ title: "Homecoming", emoji: "🏡", text: "Back in the village, the team hung the flag and shared their journal. Children asked questions about the lake.", question: "What did the team share?", answer: "their journal", options: ["their journal", "a broken compass", "nothing"] }),
            { type: "sentence", prompt: "Summarize: The team planned, climbed, and returned safely. This summary is ___", speak: "This summary is", answer: "short and covers the main events", options: ["short and covers the main events", "only one word", "unrelated"], skill: "comprehension" }
          ], { xp: 40, stars: 2 })
        ]
      }
    ]
  };

  const inferencePeaks = {
    id: "inference-peaks",
    level: 8,
    name: "Inference Peaks",
    focus: "Inference & analysis",
    age: "5th–6th",
    icon: "🔮",
    nodes: [
      {
        id: "peak-lookout",
        name: "Peak Lookout",
        blurb: "Read between the lines",
        lessons: [
          lesson("ip-infer-1", "Inference 1", ["comprehension", "inference"], [
            makeStoryAct({ title: "Wet Boots", emoji: "🥾", text: "Alex stomped inside, boots dripping. A muddy trail led from the door to the sink. Mom handed over a towel without asking what happened.", question: "What most likely happened?", answer: "Alex walked through mud or rain", options: ["Alex walked through mud or rain", "Alex baked cookies", "Alex slept all day"] }),
            makeStoryAct({ title: "Quiet Library", emoji: "📚", text: "Priya whispered even though no one else was nearby. She kept glancing at the clock and tapping her pencil.", question: "How is Priya feeling?", answer: "nervous or waiting for something", options: ["nervous or waiting for something", "bored at a party", "angry at a game"] }),
            { type: "sentence", prompt: "The author says the forest 'held its breath.' This most likely means ___", speak: "What does held its breath mean?", answer: "it was very still and quiet", options: ["it was very still and quiet", "trees were literally breathing", "someone sneezed"], skill: "inference" },
            makeStoryAct({ title: "Two Characters", emoji: "🧭", text: "Sam rushed ahead without a map. Riley stopped to check landmarks and waited. They reached the peak at the same time, but Riley was calmer.", question: "How do Sam and Riley differ?", answer: "Riley plans; Sam rushes", options: ["Riley plans; Sam rushes", "Sam is older", "Riley cannot read"] }),
            makeStoryAct({ title: "Empty Plate", emoji: "🍽️", text: "The dog sat by the empty plate and wagged its tail whenever someone walked toward the kitchen.", question: "What can you infer about the dog?", answer: "it wants food", options: ["it wants food", "it hates kitchens", "it can read"] }),
            { type: "sentence", prompt: "Dark clouds + closed windows most likely mean ___", speak: "Dark clouds and closed windows mean", answer: "a storm may be coming", options: ["a storm may be coming", "a parade is starting", "it is midnight"], skill: "inference" }
          ], { xp: 35, stars: 2 }),
          lesson("ip-infer-2", "Inference 2", ["inference"], [
            makeStoryAct({ title: "Late Bell", emoji: "🔔", text: "The school bell rang once, unusually late. Teachers hurried students inside and locked the front gates.", question: "What probably happened?", answer: "there was an emergency or drill", options: ["there was an emergency or drill", "school was canceled forever", "it was summer break"] }),
            makeStoryAct({ title: "Paint Stains", emoji: "🎨", text: "Colorful stains dotted Marco's shirt. A half-finished canvas sat on the table beside open jars of blue and yellow.", question: "What was Marco doing?", answer: "painting", options: ["painting", "swimming", "sleeping"] }),
            makeStoryAct({ title: "Cold Bench", emoji: "🪑", text: "No one sat on the park bench even though the sun was out. A thin layer of ice shimmered on the seat.", question: "Why did no one sit there?", answer: "the bench was icy", options: ["the bench was icy", "it was made of gold", "birds forbid it"] }),
            { type: "sentence", prompt: "She smiled but her eyes looked tired. She is probably ___", speak: "She is probably", answer: "happy but worn out", options: ["happy but worn out", "a robot", "underwater"], skill: "inference" },
            makeStoryAct({ title: "Footprints", emoji: "👣", text: "Small footprints in the snow led to the shed and back. The back door was slightly open and wet gloves lay on the step.", question: "Who likely went to the shed?", answer: "a child from the house", options: ["a child from the house", "a flying whale", "nobody ever"] }),
            { type: "sentence", prompt: "Context clue: 'The arid land cracked under the sun.' Arid means ___", speak: "Arid means", answer: "very dry", options: ["very dry", "very wet", "very cold"], skill: "inference" }
          ], { xp: 40, stars: 2, unlock: "peak-clues" })
        ]
      },
      {
        id: "peak-clues",
        name: "Clue Ridge",
        blurb: "Evidence and inference",
        lessons: [
          lesson("ip-clue-1", "Clue Quest 1", ["inference"], [
            makeStoryAct({ title: "Missing Key", emoji: "🔑", text: "The key was gone from its hook. The back door was unlocked and muddy shoes sat by the mat.", question: "What most likely happened?", answer: "someone went outside and forgot the key", options: ["someone went outside and forgot the key", "the key turned into soup", "the door was never there"] }),
            makeStoryAct({ title: "Crowd Noise", emoji: "📣", text: "Cheering erupted from the gym. Streamers hung from the ceiling and a banner read 'Champions.'", question: "What event is happening?", answer: "a celebration or victory", options: ["a celebration or victory", "a silent test", "a nap time"] }),
            makeStoryAct({ title: "Bent Branch", emoji: "🌿", text: "A fresh bend in the low branch caught the ranger's eye. Tiny fibers clung to the bark at the same height as a backpack strap.", question: "What passed through recently?", answer: "a hiker with a backpack", options: ["a hiker with a backpack", "a submarine", "a snowstorm only"] }),
            { type: "sentence", prompt: "If the text says 'her hands trembled,' she may feel ___", speak: "She may feel", answer: "nervous or scared", options: ["nervous or scared", "always hungry", "made of stone"], skill: "inference" },
            makeStoryAct({ title: "Fog Horn", emoji: "🌁", text: "The fog horn sounded twice. Ships slowed and lights blinked on along the harbor wall.", question: "Why did ships slow down?", answer: "thick fog made travel dangerous", options: ["thick fog made travel dangerous", "it was a holiday", "fish requested it"] }),
            { type: "sentence", prompt: "Inference uses ___ to figure out what the text does not say directly.", speak: "Inference uses", answer: "clues and evidence", options: ["clues and evidence", "random guesses", "page color"], skill: "inference" }
          ], { xp: 40, stars: 2 }),
          lesson("ip-clue-2", "Clue Quest 2", ["inference", "comprehension"], [
            makeStoryAct({ title: "Old Photograph", emoji: "📷", text: "In the photo, the house had no porch. Today a wide porch wraps around the front. Grandma said the family added it after the flood.", question: "Why was the porch added?", answer: "after the flood", options: ["after the flood", "before the town existed", "by magic only"] }),
            makeStoryAct({ title: "Science Fair", emoji: "🔬", text: "Judges leaned close to Nina's display. Her notes were neat and her model lit up when she flipped the switch.", question: "What can you infer about Nina's project?", answer: "she prepared carefully", options: ["she prepared carefully", "she forgot everything", "she did not build it"] }),
            makeStoryAct({ title: "Wind Shift", emoji: "💨", text: "Sailors watched the flag snap toward the east. They adjusted the ropes and turned the boat slightly south.", question: "Why did they adjust the ropes?", answer: "the wind direction changed", options: ["the wind direction changed", "they saw a whale", "the map was blank"] }),
            { type: "sentence", prompt: "Cause and effect: Because the bridge closed, drivers ___", speak: "Drivers", answer: "took a longer route", options: ["took a longer route", "flew to space", "lost their names"], skill: "inference" },
            makeStoryAct({ title: "Journal Entry", emoji: "📓", text: "The last page read: 'Tomorrow we test the raft.' The next entry was dated three days later and mentioned calm water.", question: "What likely happened between entries?", answer: "they waited for better conditions", options: ["they waited for better conditions", "they moved to Mars", "they erased the river"] }),
            makeStoryAct({ title: "Character Change", emoji: "🌱", text: "At first, Kai refused to speak in class. After joining the reading club, Kai volunteered to read aloud.", question: "How did Kai change?", answer: "became more confident reading", options: ["became more confident reading", "stopped reading forever", "became a statue"] })
          ], { xp: 45, stars: 2 })
        ]
      }
    ]
  };

  const crownLibrary = {
    id: "crown-library",
    level: 9,
    name: "Crown Library",
    focus: "Critical thinking",
    age: "6th–7th",
    icon: "👑",
    nodes: [
      {
        id: "royal-stacks",
        name: "Royal Stacks",
        blurb: "Theme and purpose",
        lessons: [
          lesson("cl-theme-1", "Theme & Purpose 1", ["comprehension", "criticalThinking"], [
            makeStoryAct({ title: "The Broken Compass", emoji: "🧭", text: "Lina's compass cracked on day one. Instead of quitting, she learned the stars and led the group home. Later she said the broken tool taught her to trust her mind.", question: "What is a theme of this passage?", answer: "Challenges can build new skills", options: ["Challenges can build new skills", "Compasses are useless", "Stars are dangerous"] }),
            { type: "sentence", prompt: "Author's purpose for the broken-compass story is most likely to ___", speak: "What is the author's purpose?", answer: "inspire readers to adapt", options: ["inspire readers to adapt", "sell compasses", "explain astronomy formulas"], skill: "criticalThinking" },
            makeStoryAct({ title: "Two Reports", emoji: "📰", text: "Report A: 'The festival was a noisy mess.' Report B: 'The festival buzzed with joyful music and dancing.' Both describe the same event.", question: "What do the reports show?", answer: "Point of view changes tone", options: ["Point of view changes tone", "The festival was canceled", "Music is illegal"] }),
            { type: "sentence", prompt: "'The wind whispered secrets' is an example of ___", speak: "What figurative language is this?", answer: "personification", options: ["personification", "a timeline", "a recipe"], skill: "criticalThinking" },
            makeStoryAct({ title: "Evidence Check", emoji: "🔍", text: "Claim: The team succeeded because they prepared. Evidence in the text: they packed maps, practiced signals, and checked the weather twice.", question: "Which sentence best supports the claim?", answer: "They packed maps and practiced signals", options: ["They packed maps and practiced signals", "The mountain was tall", "Someone liked soup"] }),
            { type: "sentence", prompt: "A theme is the story's ___", speak: "A theme is", answer: "big idea or lesson", options: ["big idea or lesson", "longest word", "cover color"], skill: "criticalThinking" }
          ], { xp: 40, stars: 2 }),
          lesson("cl-theme-2", "Theme & Purpose 2", ["criticalThinking"], [
            makeStoryAct({ title: "Two Paths", emoji: "🛤️", text: "One poem praised the city lights; another mourned the missing stars. Both writers loved the place but saw it differently.", question: "What is the author comparing?", answer: "different viewpoints of the same place", options: ["different viewpoints of the same place", "two different planets", "recipes for bread"] }),
            { type: "sentence", prompt: "Hyperbole means ___", speak: "Hyperbole means", answer: "an extreme exaggeration", options: ["an extreme exaggeration", "a type of map", "a quiet whisper"], skill: "criticalThinking" },
            makeStoryAct({ title: "Debate Club", emoji: "🎤", text: "In debate, Maya argued with evidence while Jordan appealed to emotions. The judge asked both to cite sources for their claims.", question: "What makes an argument stronger?", answer: "evidence and sources", options: ["evidence and sources", "talking loudest", "ignoring questions"] }),
            { type: "sentence", prompt: "Compare texts: same topic, different details means ___", speak: "Different details mean", answer: "authors focus on different aspects", options: ["authors focus on different aspects", "one text is blank", "words are illegal"], skill: "criticalThinking" },
            makeStoryAct({ title: "Letter to Editor", emoji: "✉️", text: "The letter urged the town to plant trees along the river. The writer used flood data and photos from other towns as proof.", question: "Why did the writer include data and photos?", answer: "to support the argument", options: ["to support the argument", "to hide the river", "to sell shoes"] }),
            { type: "sentence", prompt: "Critical reading asks you to ___", speak: "Critical reading asks you to", answer: "think about evidence and meaning", options: ["think about evidence and meaning", "skip every other word", "only read titles"], skill: "criticalThinking" }
          ], { xp: 45, stars: 2, unlock: "royal-analysis" })
        ]
      },
      {
        id: "royal-analysis",
        name: "Analysis Hall",
        blurb: "Compare and evaluate",
        lessons: [
          lesson("cl-analyze-1", "Analysis 1", ["criticalThinking"], [
            makeStoryAct({ title: "Primary Source", emoji: "📜", text: "A sailor's journal from 1842 described the harbor. A modern guidebook adds photos and notes about new bridges built in 1990.", question: "How are the two sources different?", answer: "one is old firsthand account, one is modern guide", options: ["one is old firsthand account, one is modern guide", "both are identical", "neither mentions water"] }),
            { type: "sentence", prompt: "Bias in a text means the author ___", speak: "Bias means", answer: "favors one side or view", options: ["favors one side or view", "uses no words", "always tells jokes"], skill: "criticalThinking" },
            makeStoryAct({ title: "Chart vs Story", emoji: "📊", text: "The chart showed rainfall by month. The memoir described one family's flooded garden after a storm in May.", question: "What does the chart provide that the memoir may not?", answer: "data across many months", options: ["data across many months", "character feelings only", "a recipe"] }),
            { type: "sentence", prompt: "A reliable source usually includes ___", speak: "A reliable source includes", answer: "evidence you can check", options: ["evidence you can check", "secret codes only", "no author"], skill: "criticalThinking" },
            makeStoryAct({ title: "Film vs Book", emoji: "🎬", text: "The movie skipped two chapters but added a new ending. Readers debated which version captured the hero's courage better.", question: "What are readers comparing?", answer: "how each version tells the story", options: ["how each version tells the story", "the price of tickets only", "weather forecasts"] }),
            { type: "sentence", prompt: "Synthesizing means ___", speak: "Synthesizing means", answer: "combining ideas from sources", options: ["combining ideas from sources", "deleting every page", "reading one letter"], skill: "criticalThinking" }
          ], { xp: 45, stars: 2 }),
          lesson("cl-analyze-2", "Analysis 2", ["criticalThinking", "comprehension"], [
            makeStoryAct({ title: "Editor's Note", emoji: "📝", text: "The editor cut a long paragraph and moved the quote to the opening. She said readers needed the main claim sooner.", question: "Why did the editor change the layout?", answer: "to highlight the main claim early", options: ["to highlight the main claim early", "to remove all facts", "to add more ads"] }),
            { type: "sentence", prompt: "An author's tone can be described as ___", speak: "Tone can be", answer: "serious, playful, or urgent", options: ["serious, playful, or urgent", "only one word long", "always invisible"], skill: "criticalThinking" },
            makeStoryAct({ title: "Peer Review", emoji: "👥", text: "Students swapped essays and asked: Is the thesis clear? Does each paragraph support it? Are sources cited?", question: "What is the goal of peer review?", answer: "improve clarity and support", options: ["improve clarity and support", "hide the essay", "change the topic randomly"] }),
            makeStoryAct({ title: "Counterclaim", emoji: "⚖️", text: "The essay argued for more parks, then addressed worries about cost by showing health benefits saved money long term.", question: "Why include the counterclaim?", answer: "to answer opposing views", options: ["to answer opposing views", "to confuse readers", "to remove evidence"] }),
            { type: "sentence", prompt: "The best summary of two texts ___", speak: "The best summary", answer: "captures shared and different ideas", options: ["captures shared and different ideas", "copies one sentence only", "ignores both texts"], skill: "criticalThinking" },
            makeStoryAct({ title: "Crown Reader", emoji: "👑", text: "The librarian said strong readers question, compare, and explain their thinking with evidence from the page.", question: "What habit makes a 'crown reader'?", answer: "explaining thinking with evidence", options: ["explaining thinking with evidence", "never turning pages", "guessing without reading"] })
          ], { xp: 50, stars: 3 })
        ]
      }
    ]
  };

  /* Extra nodes to deepen upper worlds (~40+ activities each) */
  vocabMap.nodes[1].lessons[1].reward = vocabMap.nodes[1].lessons[1].reward || { xp: 35, stars: 2 };
  vocabMap.nodes[1].lessons[1].reward.unlock = "vocab-summit";
  vocabMap.nodes.push({
    id: "vocab-summit",
    name: "Summit Words",
    blurb: "Nuance & precision",
    lessons: [
      lesson("vm-summit-1", "Precise Words 1", ["vocabulary"], [
        { type: "sentence", prompt: "Reluctant most nearly means ___", speak: "Reluctant means", answer: "unwilling", options: ["unwilling", "excited", "hungry"], skill: "vocabulary" },
        { type: "sentence", prompt: "Scarce means ___", speak: "Scarce means", answer: "hard to find", options: ["hard to find", "very loud", "brand new"], skill: "vocabulary" },
        { type: "sentence", prompt: "A polite refusal is still a ___", speak: "A polite refusal is", answer: "no", options: ["no", "yes", "maybe forever"], skill: "vocabulary" },
        makeStoryAct({ title: "Sparse Forest", emoji: "🌲", text: "Trees grew sparse near the ridge. Hikers could see far because trunks were few and far between.", question: "Sparse means ___", answer: "few and spread out", options: ["few and spread out", "crowded", "invisible"] }),
        makeStoryAct({ title: "Keen Listener", emoji: "👂", text: "Jordan was a keen listener. She noticed tiny changes in the guide's voice when the trail got risky.", question: "Keen most nearly means ___", answer: "sharp and alert", options: ["sharp and alert", "sleepy", "angry"] }),
        { type: "sentence", prompt: "Abrupt means ___", speak: "Abrupt means", answer: "sudden", options: ["sudden", "slow", "colorful"], skill: "vocabulary" },
        { type: "sentence", prompt: "To restore something is to ___", speak: "Restore means", answer: "bring it back", options: ["bring it back", "throw it away", "hide it forever"], skill: "vocabulary" }
      ], { xp: 35, stars: 2 }),
      lesson("vm-summit-2", "Precise Words 2", ["vocabulary", "comprehension"], [
        makeStoryAct({ title: "Modest Hero", emoji: "🦸", text: "After the rescue, Kai stayed modest. He thanked the team and refused to take all the credit.", question: "Modest means ___", answer: "not boastful", options: ["not boastful", "very loud", "absent"] }),
        makeStoryAct({ title: "Vital Supply", emoji: "💧", text: "Water was vital on the desert trail. Without it, the hikers could not continue safely.", question: "Vital means ___", answer: "necessary", options: ["necessary", "optional", "decorative"] }),
        { type: "sentence", prompt: "To hesitate is to ___", speak: "Hesitate means", answer: "pause before acting", options: ["pause before acting", "run faster", "forget your name"], skill: "vocabulary" },
        { type: "sentence", prompt: "A firm decision is ___", speak: "A firm decision is", answer: "strong and clear", options: ["strong and clear", "confused", "silent forever"], skill: "vocabulary" },
        makeStoryAct({ title: "Meager Meal", emoji: "🥣", text: "Their meal was meager: one piece of bread shared three ways. Still, they ate gratefully.", question: "Meager means ___", answer: "very small amount", options: ["very small amount", "huge feast", "made of gold"] }),
        makeStoryAct({ title: "Word Choice", emoji: "✍️", text: "The writer changed 'walked' to 'trudged' to show how tired the travelers felt.", question: "Why change the word?", answer: "to show more feeling", options: ["to show more feeling", "to make it shorter", "to hide the story"] }),
        { type: "sentence", prompt: "Context clues help you ___", speak: "Context clues help you", answer: "figure out word meaning", options: ["figure out word meaning", "skip reading", "erase the page"], skill: "vocabulary" }
      ], { xp: 40, stars: 2 })
    ]
  });

  questHighlands.nodes[1].lessons[1].reward = questHighlands.nodes[1].lessons[1].reward || { xp: 40, stars: 2 };
  questHighlands.nodes[1].lessons[1].reward.unlock = "highland-archive";
  questHighlands.nodes.push({
    id: "highland-archive",
    name: "Archive Ridge",
    blurb: "Compare & summarize",
    lessons: [
      lesson("qh-arch-1", "Compare Texts 1", ["comprehension"], [
        makeStoryAct({ title: "Two Guides", emoji: "🧭", text: "Guide A listed every water stop. Guide B told stories about wildlife. Both helped hikers, but in different ways.", question: "How do the guides differ?", answer: "one focuses on logistics, one on stories", options: ["one focuses on logistics, one on stories", "both are identical", "neither helps"] }),
        makeStoryAct({ title: "Short vs Long", emoji: "📄", text: "The short report named three facts. The long article explained why each fact mattered to the village.", question: "What does the long article add?", answer: "reasons and explanation", options: ["reasons and explanation", "only jokes", "blank pages"] }),
        { type: "sentence", prompt: "A summary should be ___", speak: "A summary should be", answer: "short and cover main points", options: ["short and cover main points", "longer than the text", "random words"], skill: "comprehension" },
        makeStoryAct({ title: "Cause Chain", emoji: "🔗", text: "Rain filled the creek. The creek flooded the path. The team took the high trail instead.", question: "What caused the team to change trails?", answer: "the flooded path", options: ["the flooded path", "a festival", "lost boots"] }),
        makeStoryAct({ title: "Author Focus", emoji: "🎯", text: "One paragraph described gear. The next described teamwork. Together they explained a successful climb.", question: "What is the overall focus?", answer: "how preparation and teamwork helped", options: ["how preparation and teamwork helped", "only weather", "only lunch"] }),
        { type: "sentence", prompt: "Sequence words like first, then, finally help you track ___", speak: "They help track", answer: "order of events", options: ["order of events", "font size", "cover art"], skill: "comprehension" },
        makeStoryAct({ title: "Key Detail", emoji: "🔑", text: "Only one bridge could hold the heavy packs. The team waited until that bridge was clear.", question: "Which detail mattered most?", answer: "the bridge strength", options: ["the bridge strength", "the sky color", "a bird song"] })
      ], { xp: 40, stars: 2 }),
      lesson("qh-arch-2", "Compare Texts 2", ["comprehension"], [
        makeStoryAct({ title: "Diary vs Map", emoji: "🗺️", text: "The diary told how the climb felt. The map showed distances and elevation. Readers used both.", question: "Why use both sources?", answer: "feelings and facts together", options: ["feelings and facts together", "to confuse readers", "maps are useless"] }),
        { type: "sentence", prompt: "When two texts disagree, a careful reader ___", speak: "A careful reader", answer: "checks evidence in each", options: ["checks evidence in each", "picks the louder one", "stops reading"], skill: "comprehension" },
        makeStoryAct({ title: "Headline Check", emoji: "📰", text: "The headline said 'Miracle Rescue.' The article showed a planned practice drill that went well.", question: "What should a reader notice?", answer: "headline tone vs article facts", options: ["headline tone vs article facts", "nothing important", "only the photos"] }),
        makeStoryAct({ title: "Timeline", emoji: "⏱️", text: "Dawn: leave camp. Noon: reach ridge. Dusk: return with samples.", question: "What happened at noon?", answer: "they reached the ridge", options: ["they reached the ridge", "they slept", "they quit"] }),
        { type: "sentence", prompt: "Paraphrasing means ___", speak: "Paraphrasing means", answer: "restating in your own words", options: ["restating in your own words", "copying exactly", "deleting the text"], skill: "comprehension" },
        makeStoryAct({ title: "Audience", emoji: "👥", text: "A kids' magazine used short sentences. A science journal used precise terms for the same hike.", question: "Why do the styles differ?", answer: "different audiences", options: ["different audiences", "one is wrong", "hiking changed"] }),
        makeStoryAct({ title: "Best Summary", emoji: "✅", text: "The team prepared carefully, adapted to weather, and returned with useful notes.", question: "This summary works because it ___", answer: "covers the main events", options: ["covers the main events", "lists every word", "ignores the climb"] })
      ], { xp: 45, stars: 2 })
    ]
  });

  inferencePeaks.nodes[1].lessons[1].reward = inferencePeaks.nodes[1].lessons[1].reward || { xp: 45, stars: 2 };
  inferencePeaks.nodes[1].lessons[1].reward.unlock = "peak-summit";
  inferencePeaks.nodes.push({
    id: "peak-summit",
    name: "Summit Signals",
    blurb: "Subtle inference",
    lessons: [
      lesson("ip-sum-1", "Subtle Clues 1", ["inference"], [
        makeStoryAct({ title: "Closed Curtains", emoji: "🪟", text: "At noon the curtains stayed shut and the porch light was still on. Newspapers piled by the door.", question: "What can you infer?", answer: "nobody has been home recently", options: ["nobody has been home recently", "a parade is inside", "it is midnight outside forever"] }),
        makeStoryAct({ title: "Half Smile", emoji: "🙂", text: "Lee congratulated the winner with a half smile and looked away quickly.", question: "How might Lee feel?", answer: "polite but disappointed", options: ["polite but disappointed", "asleep", "invisible"] }),
        { type: "sentence", prompt: "Sarcasm often means the speaker ___", speak: "Sarcasm often means", answer: "says the opposite of what they mean", options: ["says the opposite of what they mean", "never speaks", "only whispers"], skill: "inference" },
        makeStoryAct({ title: "Packed Bag", emoji: "🧳", text: "A packed bag sat by the door with a bus ticket on top. The house key hung on its usual hook.", question: "What is likely about to happen?", answer: "someone is leaving for a trip", options: ["someone is leaving for a trip", "the bag is empty forever", "keys are broken"] }),
        makeStoryAct({ title: "Quiet Classroom", emoji: "🏫", text: "Even the chatterboxes went silent when the principal entered with a clipboard.", question: "Why did the room go quiet?", answer: "students became careful or nervous", options: ["students became careful or nervous", "recess started", "the lights failed"] }),
        { type: "sentence", prompt: "An implied idea is ___", speak: "An implied idea is", answer: "suggested but not stated directly", options: ["suggested but not stated directly", "printed in bold only", "always false"], skill: "inference" },
        makeStoryAct({ title: "Warm Oven", emoji: "🍪", text: "The kitchen smelled like cinnamon. A warm oven light glowed and flour dusted the counter.", question: "What was happening?", answer: "someone was baking", options: ["someone was baking", "someone was swimming", "the house was empty of people forever"] })
      ], { xp: 45, stars: 2 }),
      lesson("ip-sum-2", "Subtle Clues 2", ["inference", "comprehension"], [
        makeStoryAct({ title: "Two Texts", emoji: "📚", text: "Text A called the hike 'easy.' Text B listed steep cliffs and warnings. Both described the same trail.", question: "What should a reader conclude?", answer: "difficulty depends on viewpoint or audience", options: ["difficulty depends on viewpoint or audience", "the trail does not exist", "both texts are blank"] }),
        { type: "sentence", prompt: "Character motivation is ___", speak: "Motivation is", answer: "the reason someone acts", options: ["the reason someone acts", "the font choice", "the page number"], skill: "inference" },
        makeStoryAct({ title: "Skipped Lines", emoji: "📖", text: "The letter jumped from 'Dear Sam' to 'See you next month' with a torn middle. Ink smudges suggested water damage.", question: "What most likely happened to the letter?", answer: "part was damaged or lost", options: ["part was damaged or lost", "it was never written", "Sam invented mail"] }),
        makeStoryAct({ title: "Changed Plans", emoji: "📅", text: "Yesterday the flyer said picnic. Today it says indoor games, and rain taps the window.", question: "Why did plans change?", answer: "weather", options: ["weather", "the flyer cannot change", "games dislike sun"] }),
        { type: "sentence", prompt: "To infer theme from actions, look at ___", speak: "Look at", answer: "what characters do and learn", options: ["what characters do and learn", "only the cover color", "word count alone"], skill: "inference" },
        makeStoryAct({ title: "Unspoken Thank You", emoji: "🎁", text: "No speech was given. Instead, the team left a repaired lantern on the guide's porch.", question: "What does the lantern suggest?", answer: "gratitude shown through action", options: ["gratitude shown through action", "anger at the guide", "the porch needed light only"] }),
        makeStoryAct({ title: "Predict Next", emoji: "🔮", text: "Clouds thickened and thunder rolled closer. The leader pointed toward the shelter cave.", question: "What will likely happen next?", answer: "the team will take shelter", options: ["the team will take shelter", "they will start a parade", "they will ignore the storm"] })
      ], { xp: 50, stars: 2 })
    ]
  });

  crownLibrary.nodes[1].lessons[1].reward = crownLibrary.nodes[1].lessons[1].reward || { xp: 50, stars: 3 };
  crownLibrary.nodes[1].lessons[1].reward.unlock = "royal-crown";
  crownLibrary.nodes.push({
    id: "royal-crown",
    name: "Crown Chamber",
    blurb: "Argue & evaluate",
    lessons: [
      lesson("cl-crown-1", "Argument Lab 1", ["criticalThinking"], [
        makeStoryAct({ title: "Claim Check", emoji: "⚖️", text: "Claim: Parks improve health. Evidence: clinic visits dropped after new trails opened, according to a city report.", question: "Is the evidence relevant?", answer: "yes, it connects parks to health outcomes", options: ["yes, it connects parks to health outcomes", "no, it talks about unrelated food", "evidence never matters"] }),
        { type: "sentence", prompt: "A counterclaim is ___", speak: "A counterclaim is", answer: "an opposing viewpoint", options: ["an opposing viewpoint", "a book title", "a silent page"], skill: "criticalThinking" },
        makeStoryAct({ title: "Weak Support", emoji: "📉", text: "Someone claimed the lake was unsafe because 'my cousin said so once.' No tests or reports were cited.", question: "Why is this support weak?", answer: "it lacks checkable evidence", options: ["it lacks checkable evidence", "cousins cannot speak", "lakes are always safe"] }),
        makeStoryAct({ title: "Purpose Shift", emoji: "🎭", text: "An ad used cheerful music to sell boots. A news piece used the same storm photos to warn about floods.", question: "How do purposes differ?", answer: "persuade to buy vs inform about risk", options: ["persuade to buy vs inform about risk", "both are identical", "neither has a purpose"] }),
        { type: "sentence", prompt: "Evaluating a source means asking ___", speak: "Evaluating means asking", answer: "who wrote it and what proof they give", options: ["who wrote it and what proof they give", "only how long it is", "if the font is fancy"], skill: "criticalThinking" },
        makeStoryAct({ title: "Quote in Context", emoji: "💬", text: "A poster quoted 'We must act now' from a scientist, but cut the next line: 'after reviewing the full data.'", question: "What problem does this create?", answer: "it may mislead by leaving out context", options: ["it may mislead by leaving out context", "quotes are illegal", "scientists cannot speak"] }),
        { type: "sentence", prompt: "Logical reasoning connects ___", speak: "Logical reasoning connects", answer: "claims to evidence clearly", options: ["claims to evidence clearly", "random opinions only", "page numbers to titles"], skill: "criticalThinking" }
      ], { xp: 50, stars: 3 }),
      lesson("cl-crown-2", "Argument Lab 2", ["criticalThinking", "comprehension"], [
        makeStoryAct({ title: "Two Conclusions", emoji: "🧠", text: "From the same test scores, Writer A concluded 'more tutoring helps.' Writer B concluded 'the test was unfair.'", question: "What does this show?", answer: "same data can support different claims", options: ["same data can support different claims", "data is useless", "only one writer can exist"] }),
        { type: "sentence", prompt: "A rebuttal responds to ___", speak: "A rebuttal responds to", answer: "an opposing argument", options: ["an opposing argument", "the table of contents", "a blank page"], skill: "criticalThinking" },
        makeStoryAct({ title: "Credibility", emoji: "🏅", text: "Article A lists authors, dates, and linked studies. Article B has no author and uses all-caps warnings.", question: "Which is more credible and why?", answer: "Article A, because it shows transparent sources", options: ["Article A, because it shows transparent sources", "Article B, because it is louder", "neither can be judged"] }),
        makeStoryAct({ title: "Audience Appeal", emoji: "📣", text: "A flyer for teens used slang and memes. A city memo used formal terms for the same recycling plan.", question: "Why change the language?", answer: "to fit different audiences", options: ["to fit different audiences", "recycling changed meaning", "memes are required by law"] }),
        { type: "sentence", prompt: "Critical thinkers revise views when ___", speak: "They revise when", answer: "stronger evidence appears", options: ["stronger evidence appears", "fonts change", "pages get longer"], skill: "criticalThinking" },
        makeStoryAct({ title: "Crown Challenge", emoji: "👑", text: "The librarian asked readers to state a claim, cite two pieces of evidence, and answer one counterclaim before posting.", question: "What skill is practiced?", answer: "building a reasoned argument", options: ["building a reasoned argument", "avoiding all evidence", "guessing without reading"] }),
        makeStoryAct({ title: "Synthesis", emoji: "🧩", text: "After reading a memoir and a chart, students combined both to explain how one storm affected a town.", question: "Synthesis here means ___", answer: "combining ideas from sources", options: ["combining ideas from sources", "deleting both sources", "reading titles only"] })
      ], { xp: 55, stars: 3 })
    ]
  });

  /* Vision Level 2 sits inside Alphabet Forest; map still shows nine regions */
  const worldTeasers = [
    { id: "phonics-hatchery", level: 2, name: "Phonics Hatchery", focus: "Phonics & simple words", age: "Pre-K/K", icon: "🐣", aliasOf: "alphabet-forest" }
  ];

  const WORLDS = [
    alphabetForest,
    cvcMeadow,
    sightTown,
    fluencyCastle,
    vocabMap,
    questHighlands,
    inferencePeaks,
    crownLibrary
  ];

  const GRADE_BANDS = [
    { grade: 1, worldId: "alphabet-forest", startNode: "letter-camp", label: "Preschool", name: "Alphabet Forest", age: "Preschool" },
    { grade: 2, worldId: "alphabet-forest", startNode: "sound-grove", label: "Pre-K/K", name: "Phonics Hatchery", age: "Pre-K/K" },
    { grade: 3, worldId: "cvc-meadow", startNode: null, label: "K–1", name: "CVC Meadow", age: "K–1" },
    { grade: 4, worldId: "sight-word-town", startNode: null, label: "1st–2nd", name: "Sight Word Town", age: "1st–2nd" },
    { grade: 5, worldId: "fluency-castle", startNode: null, label: "2nd–3rd", name: "Fluency Castle", age: "2nd–3rd" },
    { grade: 6, worldId: "vocabulary-map", startNode: null, label: "3rd–4th", name: "Vocabulary Map", age: "3rd–4th" },
    { grade: 7, worldId: "quest-highlands", startNode: null, label: "4th–5th", name: "Quest Highlands", age: "4th–5th" },
    { grade: 8, worldId: "inference-peaks", startNode: null, label: "5th–6th", name: "Inference Peaks", age: "5th–6th" },
    { grade: 9, worldId: "crown-library", startNode: null, label: "6th–7th", name: "Crown Library", age: "6th–7th" }
  ];

  const MAP_REGIONS = [
    { id: "alphabet-forest", level: 1, name: "Alphabet Forest", focus: "Letters & sounds", age: "Preschool", icon: "🌲", startNode: "letter-camp" },
    { id: "alphabet-forest", level: 2, name: "Phonics Hatchery", focus: "Phonics & simple words", age: "Pre-K/K", icon: "🐣", startNode: "sound-grove", mapKey: "phonics-hatchery" },
    { id: "cvc-meadow", level: 3, name: "CVC Meadow", focus: "CVC & sentences", age: "K–1", icon: "🌳" },
    { id: "sight-word-town", level: 4, name: "Sight Word Town", focus: "Sight words & stories", age: "1st–2nd", icon: "🏡" },
    { id: "fluency-castle", level: 5, name: "Fluency Castle", focus: "Reading fluency", age: "2nd–3rd", icon: "🏰" },
    { id: "vocabulary-map", level: 6, name: "Vocabulary Map", focus: "Vocab & comprehension", age: "3rd–4th", icon: "🗺️" },
    { id: "quest-highlands", level: 7, name: "Quest Highlands", focus: "Advanced comprehension", age: "4th–5th", icon: "⚔️" },
    { id: "inference-peaks", level: 8, name: "Inference Peaks", focus: "Inference & analysis", age: "5th–6th", icon: "🔮" },
    { id: "crown-library", level: 9, name: "Crown Library", focus: "Critical thinking", age: "6th–7th", icon: "👑" }
  ];

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
    return countWorldActivities(worldId) < 15;
  }

  const PLACEMENT_QUESTIONS = [
    { type: "letter", prompt: "Find the letter B", speak: "B", answer: "B", options: letterChoices("B", 4), skill: "letterRecognition", tier: 1 },
    { type: "sound", prompt: "What letter starts SUN?", speak: "Sun", answer: "S", options: letterChoices("S", 4), skill: "phonics", tier: 1 },
    { type: "build", prompt: "Build the word CAT", speak: "Cat", answer: "cat", payload: { letters: ["C", "A", "T"], emoji: "🐱" }, skill: "wordDecoding", tier: 2 },
    { type: "picture", prompt: "dog", speak: "dog", answer: "dog", options: [
      { word: "dog", emoji: "🐶" }, { word: "cat", emoji: "🐱" }, { word: "sun", emoji: "☀️" }
    ], skill: "wordDecoding", tier: 2 },
    { type: "sentence", prompt: "The ___ can swim.", speak: "The frog can swim", answer: "frog", options: ["frog", "flag", "stop"], skill: "comprehension", tier: 3 },
    { type: "sprint", prompt: "The dog can run.", speak: "The dog can run.", answer: "The dog can run.", skill: "fluency", tier: 3 },
    {
      type: "story",
      prompt: "Quick Read",
      speak: "Maya ran to the forest to find her map.",
      answer: "to find her map",
      options: ["to find her map", "to bake bread", "to sleep"],
      payload: { emoji: "👧", text: "Maya ran to the forest to find her map.", question: "Why did Maya run?" },
      skill: "comprehension",
      tier: 4
    },
    {
      type: "sentence",
      prompt: "Eager most nearly means ___",
      speak: "Eager means",
      answer: "excited",
      options: ["excited", "sleepy", "broken"],
      skill: "vocabulary",
      tier: 4
    },
    {
      type: "story",
      prompt: "Detail Check",
      speak: "The scouts waited for the mist to clear before climbing.",
      answer: "they waited for better visibility",
      options: ["they waited for better visibility", "they flew over the peak", "they sold the map"],
      payload: { emoji: "🌫️", text: "The scouts waited for the mist to clear before climbing the ridge.", question: "What did the scouts do?" },
      skill: "comprehension",
      tier: 5
    },
    {
      type: "sentence",
      prompt: "Sturdy most nearly means ___",
      speak: "Sturdy means",
      answer: "strong",
      options: ["strong", "tiny", "invisible"],
      skill: "vocabulary",
      tier: 5
    },
    {
      type: "story",
      prompt: "Main Idea",
      speak: "Mira shared her bread so everyone could eat.",
      answer: "sharing helped the team",
      options: ["sharing helped the team", "bread was expensive", "hiking is impossible"],
      payload: { emoji: "🍞", text: "After a long hike the team was hungry. Mira shared her bread so everyone could eat.", question: "What is the main idea?" },
      skill: "comprehension",
      tier: 6
    },
    {
      type: "sentence",
      prompt: "A detail supports the main idea by ___",
      speak: "A detail supports by",
      answer: "giving more information",
      options: ["giving more information", "erasing the title", "ending the book"],
      skill: "comprehension",
      tier: 6
    },
    {
      type: "story",
      prompt: "Inference",
      speak: "Alex stomped inside with dripping muddy boots.",
      answer: "Alex walked through mud or rain",
      options: ["Alex walked through mud or rain", "Alex baked cookies", "Alex never went outside"],
      payload: { emoji: "🥾", text: "Alex stomped inside, boots dripping. A muddy trail led from the door to the sink.", question: "What most likely happened?" },
      skill: "inference",
      tier: 7
    },
    {
      type: "sentence",
      prompt: "If the text says 'her hands trembled,' she may feel ___",
      speak: "She may feel",
      answer: "nervous or scared",
      options: ["nervous or scared", "made of stone", "always hungry"],
      skill: "inference",
      tier: 7
    },
    {
      type: "story",
      prompt: "Theme",
      speak: "Lina learned the stars after her compass broke.",
      answer: "Challenges can build new skills",
      options: ["Challenges can build new skills", "Compasses are useless", "Stars are dangerous"],
      payload: { emoji: "🧭", text: "Lina's compass cracked on day one. Instead of quitting, she learned the stars and led the group home.", question: "What is a theme of this passage?" },
      skill: "criticalThinking",
      tier: 8
    },
    {
      type: "sentence",
      prompt: "A strong argument usually includes ___",
      speak: "A strong argument includes",
      answer: "evidence and sources",
      options: ["evidence and sources", "only loud opinions", "no facts"],
      skill: "criticalThinking",
      tier: 8
    },
    {
      type: "sentence",
      prompt: "Bias in a text means the author ___",
      speak: "Bias means",
      answer: "favors one side or view",
      options: ["favors one side or view", "uses no words", "always jokes"],
      skill: "criticalThinking",
      tier: 9
    },
    {
      type: "story",
      prompt: "Evaluate",
      speak: "The letter used flood data and photos as proof.",
      answer: "to support the argument",
      options: ["to support the argument", "to hide the river", "to sell shoes"],
      payload: { emoji: "✉️", text: "The letter urged the town to plant trees. The writer used flood data and photos from other towns as proof.", question: "Why include data and photos?" },
      skill: "criticalThinking",
      tier: 9
    }
  ];

  const SKILL_LABELS = {
    letterRecognition: "Letter recognition",
    letterSounds: "Letter sounds",
    phonics: "Phonics",
    wordDecoding: "Word decoding",
    fluency: "Fluency",
    vocabulary: "Vocabulary",
    comprehension: "Comprehension",
    inference: "Inference",
    criticalThinking: "Critical thinking"
  };

  const MASTERY = {
    letterRecognition: 70,
    letterSounds: 70,
    phonics: 65,
    wordDecoding: 65,
    fluency: 60,
    vocabulary: 60,
    comprehension: 60,
    inference: 55,
    criticalThinking: 55
  };

  const UNLOCK_RULES = [
    { worldId: "alphabet-forest", requires: [] },
    { worldId: "cvc-meadow", requires: [{ type: "nodes", worldId: "alphabet-forest", min: 3 }, { type: "skill", skill: "wordDecoding", min: 40 }] },
    { worldId: "sight-word-town", requires: [{ type: "worldComplete", worldId: "cvc-meadow" }, { type: "skill", skill: "comprehension", min: 40 }] },
    { worldId: "fluency-castle", requires: [{ type: "worldComplete", worldId: "sight-word-town" }, { type: "skill", skill: "fluency", min: 35 }] },
    { worldId: "vocabulary-map", requires: [{ type: "worldComplete", worldId: "fluency-castle" }, { type: "skill", skill: "comprehension", min: 50 }] },
    { worldId: "quest-highlands", requires: [{ type: "worldComplete", worldId: "vocabulary-map" }, { type: "skill", skill: "comprehension", min: 55 }] },
    { worldId: "inference-peaks", requires: [{ type: "worldComplete", worldId: "quest-highlands" }, { type: "skill", skill: "comprehension", min: 60 }] },
    { worldId: "crown-library", requires: [{ type: "worldComplete", worldId: "inference-peaks" }, { type: "skill", skill: "criticalThinking", min: 40 }] }
  ];

  const COSMETICS = [
    { id: "frame-leaf", name: "Leaf Frame", cost: 20, unlockAtStars: 3 },
    { id: "frame-sun", name: "Sun Frame", cost: 40, unlockAtStars: 8 },
    { id: "frame-crown", name: "Crown Frame", cost: 80, unlockAtStars: 15 },
    { id: "sticker-star", name: "Star Sticker", cost: 10, unlockAtStars: 1 },
    { id: "sticker-book", name: "Book Sticker", cost: 25, unlockAtStars: 5 }
  ];

  const REMEDIATION_BANK = {
    letterRecognition: makeLetterActs(0, 8).filter((a) => a.type === "letter").slice(0, 6),
    letterSounds: makeLetterActs(0, 8).filter((a) => a.type === "sound").slice(0, 6),
    phonics: [
      { type: "sound", prompt: "What letter starts CAT?", speak: "Cat", answer: "C", options: letterChoices("C", 4), skill: "phonics" },
      { type: "sound", prompt: "What letter starts MAP?", speak: "Map", answer: "M", options: letterChoices("M", 4), skill: "phonics" },
      { type: "sound", prompt: "What letter starts TOP?", speak: "Top", answer: "T", options: letterChoices("T", 4), skill: "phonics" }
    ],
    wordDecoding: makeBuildActs(CVC_WORDS.slice(0, 6)),
    fluency: makeSprintActs(["cat", "dog", "sun", "the", "can", "run"]),
    vocabulary: [
      { type: "sentence", prompt: "Huge means ___", speak: "Huge means", answer: "very big", options: ["very big", "very small", "very quiet"], skill: "vocabulary" }
    ],
    comprehension: forestStories.slice(0, 3).map(makeStoryAct),
    inference: [
      {
        type: "story",
        prompt: "Clue Read",
        speak: "Boots were muddy and wet.",
        answer: "It rained or was muddy outside",
        options: ["It rained or was muddy outside", "Someone baked cake", "The sun exploded"],
        payload: { emoji: "🌧️", text: "Boots were muddy and wet by the door.", question: "What can you infer?" },
        skill: "inference"
      }
    ],
    criticalThinking: [
      {
        type: "sentence",
        prompt: "A theme is ___",
        speak: "A theme is",
        answer: "the big idea or lesson",
        options: ["the big idea or lesson", "the page number", "the author's email"],
        skill: "criticalThinking"
      }
    ]
  };

  global.WQContent = {
    LETTERS: LETTERS,
    LETTER_SOUNDS: LETTER_SOUNDS,
    CVC_WORDS: CVC_WORDS,
    SIGHT_WORDS: SIGHT_WORDS,
    BLENDS: BLENDS,
    DIGRAPHS: DIGRAPHS,
    ACTIONS: ACTIONS,
    WORLDS: WORLDS,
    GRADE_BANDS: GRADE_BANDS,
    MAP_REGIONS: MAP_REGIONS,
    countWorldActivities: countWorldActivities,
    isWorldPreview: isWorldPreview,
    PLACEMENT_QUESTIONS: PLACEMENT_QUESTIONS,
    SKILL_LABELS: SKILL_LABELS,
    MASTERY: MASTERY,
    UNLOCK_RULES: UNLOCK_RULES,
    COSMETICS: COSMETICS,
    REMEDIATION_BANK: REMEDIATION_BANK,
    worldTeasers: worldTeasers,
    getWorld: function (id) {
      return WORLDS.find((w) => w.id === id) || null;
    },
    getNode: function (worldId, nodeId) {
      const world = this.getWorld(worldId);
      if (!world) return null;
      return world.nodes.find((n) => n.id === nodeId) || null;
    },
    getLesson: function (worldId, nodeId, lessonId) {
      const node = this.getNode(worldId, nodeId);
      if (!node) return null;
      return node.lessons.find((l) => l.id === lessonId) || null;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
