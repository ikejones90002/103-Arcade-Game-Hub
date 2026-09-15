/**
 * Wire asset pipeline into engines + content + three world shells.
 */
const fs = require("fs");
const path = require("path");

function patchFile(file, replacements) {
  let s = fs.readFileSync(file, "utf8");
  replacements.forEach(function (r) {
    if (s.indexOf(r.find) === -1) {
      console.log("MISS", file, r.find.slice(0, 60));
      return;
    }
    if (r.once && s.indexOf(r.replace) !== -1) {
      console.log("skip-already", file, r.tag || "");
      return;
    }
    s = r.all ? s.split(r.find).join(r.replace) : s.replace(r.find, r.replace);
    console.log("patched", file, r.tag || "");
  });
  fs.writeFileSync(file, s);
}

// --- Engines: avatar defaults ---
const avatarOld = 'avatar: { outfit: "starter", accessory: "" }';
const avatarNew = 'avatar: { body: "child-01", hair: "hair-01", outfit: "explorer", accessory: "" }';

["docs/wordquest-engine.js", "docs/spellbuzz-engine.js", "docs/numbuzz-engine.js"].forEach(function (f) {
  patchFile(f, [{ find: avatarOld, replace: avatarNew, all: true, tag: "avatar-fields" }]);
});

// --- Content: assetId on companions ---
function addAssetIds(file) {
  let s = fs.readFileSync(file, "utf8");
  if (s.indexOf('"assetId"') !== -1 || s.indexOf("assetId:") !== -1) {
    console.log("assetId already", file);
    return;
  }
  s = s.replace(/("id":\s*")([^"]+)(")/g, function (m, a, id, c) {
    // only inside companions — heuristic: only when next few lines have emoji
    return m;
  });
  // Safer: replace companion blocks by known ids
  const ids = [];
  const re = /"id":\s*"([^"]+)"/g;
  let m;
  const chunk = s.match(/const COMPANIONS = \[[\s\S]*?\];/);
  if (!chunk) {
    console.log("no COMPANIONS", file);
    return;
  }
  let comp = chunk[0];
  comp = comp.replace(/(\{\s*"id":\s*")([^"]+)(")/g, function (_, a, id, c) {
    ids.push(id);
    return a + id + c + ',\n    "assetId": "' + id + '"';
  });
  s = s.replace(chunk[0], comp);
  fs.writeFileSync(file, s);
  console.log("assetIds", file, ids.join(","));
}

["docs/wordquest-content.js", "docs/spellbuzz-content.js", "docs/numbuzz-content.js"].forEach(addAssetIds);

// --- Shell wiring ---
const shellConfig = [
  { file: "docs/wordquest.html", subject: "reading", muteKey: "wordquest_mute", scriptsBefore: '<script src="arcade-ai.js"></script>' },
  { file: "docs/spellbuzz.html", subject: "spelling", muteKey: "spellbuzz_mute", scriptsBefore: '<script src="arcade-ai.js"></script>' },
  { file: "docs/numbuzz.html", subject: "math", muteKey: "numbuzz_mute", scriptsBefore: '<script src="arcade-ai.js"></script>' }
];

shellConfig.forEach(function (cfg) {
  const reps = [];

  // script tag
  if (!fs.readFileSync(cfg.file, "utf8").includes("arcade-assets.js")) {
    reps.push({
      tag: "script",
      find: cfg.scriptsBefore,
      replace: '<script src="arcade-assets.js"></script>\n  ' + cfg.scriptsBefore
    });
  }

  // audio paths
  reps.push({
    tag: "audio-paths",
    find: 'src="sounds/correct.mp3"',
    replace: 'src="assets/audio/ui/correct.mp3"',
    all: true
  });
  reps.push({
    tag: "audio-wrong",
    find: 'src="sounds/wrong.mp3"',
    replace: 'src="assets/audio/ui/error-soft.mp3"',
    all: true
  });
  reps.push({
    tag: "audio-tick",
    find: 'src="sounds/tick.mp3"',
    replace: 'src="assets/audio/ui/tick.mp3"',
    all: true
  });

  // engage-bar mounts
  reps.push({
    tag: "engage-bar",
    find: `<div class="engage-avatar"><span class="emoji" id="avatar-emoji">🧒</span><span id="avatar-label">Explorer</span></div>
        <div class="engage-companion"><span class="emoji" id="companion-emoji">✨</span><span id="companion-label">No companion yet</span></div>`,
    replace: `<div class="engage-avatar"><div class="asset-avatar" id="avatar-mount" aria-hidden="true"></div><span id="avatar-label">Explorer</span></div>
        <div class="engage-companion"><div class="asset-companion" id="companion-mount" aria-hidden="true"></div><span id="companion-label">No companion yet</span></div>`
  });

  // stage vignette after stage-strip open
  reps.push({
    tag: "stage-art",
    find: '<p class="stage-strip" id="stage-strip"><strong>World growth:</strong> <span id="stage-text">Begin your adventure</span></p>',
    replace: `<div class="stage-art hidden" id="stage-art" aria-hidden="true"></div>
      <p class="stage-strip" id="stage-strip"><strong>World growth:</strong> <span id="stage-text">Begin your adventure</span></p>`
  });

  patchFile(cfg.file, reps);

  // JS wiring: subject constant + renderEngageChrome mounts + playSfx bridge
  let s = fs.readFileSync(cfg.file, "utf8");

  if (s.indexOf("ASSET_SUBJECT") === -1) {
    s = s.replace(
      'const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;',
      'const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n  const Assets = window.ArcadeAssets;\n  const ASSET_SUBJECT = "' + cfg.subject + '";\n  if (Assets) Assets.load();'
    );
  }

  // renderEngageChrome avatar/companion
  const oldChromeStart = `    document.getElementById("avatar-label").textContent = name;
    const comps = Engine.availableCompanions(profile);
    const equipped = comps.find(function (c) { return c.equipped; });
    document.getElementById("companion-emoji").textContent = equipped ? equipped.emoji : "✨";
    document.getElementById("companion-label").textContent = equipped ? equipped.name : "No companion yet";`;

  const newChromeStart = `    document.getElementById("avatar-label").textContent = name;
    if (Assets) {
      Assets.mountAvatar(document.getElementById("avatar-mount"), profile.engagement.avatar);
    }
    const comps = Engine.availableCompanions(profile);
    const equipped = comps.find(function (c) { return c.equipped; });
    if (Assets) {
      Assets.mountCompanion(document.getElementById("companion-mount"), equipped ? (equipped.assetId || equipped.id) : "", equipped ? equipped.emoji : "✨");
    }
    document.getElementById("companion-label").textContent = equipped ? equipped.name : "No companion yet";`;

  if (s.indexOf(oldChromeStart) !== -1) {
    s = s.replace(oldChromeStart, newChromeStart);
    console.log("chrome mounts", cfg.file);
  } else if (s.indexOf("avatar-mount") !== -1 && s.indexOf("mountAvatar") !== -1) {
    console.log("chrome already", cfg.file);
  } else {
    console.log("MISS chrome", cfg.file);
  }

  // stage art after stage text update
  const stageHook = `document.getElementById("stage-text").textContent = (stage.icon || "") + " " + (stage.label || "") + (strip ? " · " + strip : "");
    }`;
  const stageHookNew = `document.getElementById("stage-text").textContent = (stage.icon || "") + " " + (stage.label || "") + (strip ? " · " + strip : "");
      if (Assets) {
        const idx = (profile.engagement.worldStages && profile.engagement.worldStages[worldId]) || 0;
        Assets.mountWorldStage(document.getElementById("stage-art"), ASSET_SUBJECT, idx);
      }
    }`;
  if (s.indexOf("mountWorldStage") === -1 && s.indexOf(stageHook) !== -1) {
    s = s.replace(stageHook, stageHookNew);
    console.log("stage art", cfg.file);
  }

  // playSfx → ArcadeAssets
  const playSfxFn = s.match(/function playSfx\(kind\) \{[\s\S]*?\n  \}/);
  if (playSfxFn && s.indexOf("Assets.play(kind)") === -1) {
    s = s.replace(
      playSfxFn[0],
      `function playSfx(kind) {
    if (muted) return;
    if (Assets) {
      Assets.setMuted(muted);
      Assets.play(kind);
      return;
    }
    if (kind === "click") tone(880, 0.05, "triangle", 0.05);
    else if (kind === "sparkle") { tone(784, 0.1, "sine", 0.06); tone(1174, 0.16, "sine", 0.07, 0.1); }
    else if (kind === "fanfare") { tone(523, 0.12, "square", 0.05); tone(784, 0.2, "square", 0.05, 0.14); }
    else if (kind === "life") { tone(330, 0.12, "triangle", 0.07); tone(220, 0.18, "triangle", 0.07, 0.1); }
    else if (kind === "wrongBuzz") tone(140, 0.2, "sawtooth", 0.05);
    else if (kind === "buzz") tone(180, 0.08, "sawtooth", 0.04);
  }`
    );
    console.log("playSfx", cfg.file);
  }

  // playSound correct/wrong via Assets when possible
  const oldPlaySound = `  function playSound(name) {
    if (name === "correct") { playMp3("snd-correct", 0.85); if (streak >= 3) playSfx("sparkle"); }
    else if (name === "wrong") { playMp3("snd-wrong", 0.45); playSfx("wrongBuzz"); }
    else if (name === "tick") playMp3("snd-tick", 0.55);
    else playSfx(name);
  }`;
  const newPlaySound = `  function playSound(name) {
    if (muted) return;
    if (Assets) {
      Assets.setMuted(muted);
      if (name === "correct") { Assets.play("correct"); if (streak >= 3) Assets.play("sparkle"); }
      else if (name === "wrong") { Assets.play("error-soft"); Assets.play("wrongBuzz"); }
      else if (name === "tick") Assets.play("tick");
      else Assets.play(name);
      return;
    }
    if (name === "correct") { playMp3("snd-correct", 0.85); if (streak >= 3) playSfx("sparkle"); }
    else if (name === "wrong") { playMp3("snd-wrong", 0.45); playSfx("wrongBuzz"); }
    else if (name === "tick") playMp3("snd-tick", 0.55);
    else playSfx(name);
  }`;
  if (s.indexOf(oldPlaySound) !== -1) {
    s = s.replace(oldPlaySound, newPlaySound);
    console.log("playSound", cfg.file);
  }

  // mute sync
  const muteSet = 'localStorage.setItem("' + cfg.muteKey + '", muted ? "1" : "0");';
  if (s.indexOf("Assets.setMuted(muted)") === -1 && s.indexOf(muteSet) !== -1) {
    s = s.replace(muteSet, muteSet + "\n    if (Assets) Assets.setMuted(muted);");
    console.log("mute sync", cfg.file);
  }

  fs.writeFileSync(cfg.file, s);
});

console.log("wire done");
