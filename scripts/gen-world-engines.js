/* One-shot generator: spell + math engines from wordquest-engine.js */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const base = fs.readFileSync(path.join(root, "docs", "wordquest-engine.js"), "utf8");

function makeEngine(cfg) {
  let s = base;
  s = s.replace("/* Word Quest Reading World — lesson engine, profile, adaptive, coach */", cfg.header);
  s = s.replace(/const PROFILE_KEY = "wordquest_profile";/, 'const PROFILE_KEY = "' + cfg.profileKey + '";');
  s = s.replace(/const DEFAULT_SKILLS = \{[\s\S]*?\n  \};/, "const DEFAULT_SKILLS = " + cfg.skillsBlock + ";");
  s = s.replace(/unlockedWorlds: \["alphabet-forest"\]/g, 'unlockedWorlds: ["' + cfg.startWorld + '"]');
  s = s.replace(/\? \["alphabet-forest"\]/g, '? ["' + cfg.startWorld + '"]');
  s = s.replace(/: \["alphabet-forest"\];/g, ': ["' + cfg.startWorld + '"];');
  s = s.replace(/type: "wordquest_profile_export"/, 'type: "' + cfg.exportType + '"');
  s = s.replace(/global\.WQContent/g, "global." + cfg.content);
  s = s.replace(/return band \? band\.worldId : "alphabet-forest";/, 'return band ? band.worldId : "' + cfg.startWorld + '";');
  s = s.replace("Your reading brain is warming up.", cfg.streakMsg);
  s = s.replace(
    "Try a short practice on \" + weak.label + \". Read slowly and say the sounds out loud.\"",
    cfg.askWeak
  );
  s = s.replace(
    "Pick a world at your grade and finish one lesson — small steps add up!",
    cfg.askStrong
  );
  s = s.replace("I'm your reading coach. Play, read, and grow!", cfg.defaultCoach);
  s = s.replace(/global\.WQEngine = \{/, "global." + cfg.engine + " = {");
  return s;
}

const spellSkills = `{
    letterSounds: 0,
    phonicsSpelling: 0,
    sightSpelling: 0,
    patternSpelling: 0,
    vocabularySpelling: 0,
    multisyllable: 0,
    trickyWords: 0
  }`;

const mathSkills = `{
    counting: 0,
    addition: 0,
    subtraction: 0,
    placeValue: 0,
    multiplication: 0,
    division: 0,
    fractions: 0,
    wordProblems: 0,
    preAlgebra: 0
  }`;

fs.writeFileSync(
  path.join(root, "docs", "spellbuzz-engine.js"),
  makeEngine({
    header: "/* SpellBuzz Spelling World — lesson engine, profile, adaptive, coach */",
    profileKey: "spellbuzz_profile",
    exportType: "spellbuzz_profile_export",
    content: "SBContent",
    engine: "SBEngine",
    startWorld: "letter-sound-camp",
    skillsBlock: spellSkills,
    streakMsg: "Great streak! Your spelling brain is warming up.",
    askWeak: "Try a short practice on \" + weak.label + \". Say each sound, then write the word.\"",
    askStrong: "Pick a world at your level and finish one spelling lesson — small steps add up!",
    defaultCoach: "I'm your spelling coach. Listen, sound it out, and grow!"
  })
);

fs.writeFileSync(
  path.join(root, "docs", "numbuzz-engine.js"),
  makeEngine({
    header: "/* NumBuzz Math World — lesson engine, profile, adaptive, coach */",
    profileKey: "numbuzz_profile",
    exportType: "numbuzz_profile_export",
    content: "NBContent",
    engine: "NBEngine",
    startWorld: "count-forest",
    skillsBlock: mathSkills,
    streakMsg: "Great streak! Your math brain is warming up.",
    askWeak: "Try a short practice on \" + weak.label + \". Take it one step at a time.\"",
    askStrong: "Pick a world at your level and finish one math lesson — small steps add up!",
    defaultCoach: "I'm your math coach. Think, try, and grow!"
  })
);

console.log("engines written ok");
