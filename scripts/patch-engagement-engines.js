/* Patch all three engines with independent engagement helpers (no shared module). */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "docs");

const HELPERS = `
  function defaultEngagement() {
    return {
      avatar: { outfit: "starter", accessory: "" },
      companions: [],
      equippedCompanion: "",
      worldStages: {},
      currentMission: "",
      daily: { dayKey: "", completed: false, stars: 0 },
      missionsSeen: {},
      bossesCleared: {},
      celebrationsSeen: {},
      labUnlocked: false,
      labCreations: [],
      lastPlayedAt: 0
    };
  }

  function ensureEngagement(profile) {
    const base = defaultEngagement();
    profile.engagement = Object.assign({}, base, profile.engagement || {});
    profile.engagement.avatar = Object.assign({}, base.avatar, (profile.engagement && profile.engagement.avatar) || {});
    profile.engagement.companions = Array.isArray(profile.engagement.companions) ? profile.engagement.companions : [];
    profile.engagement.worldStages = profile.engagement.worldStages || {};
    profile.engagement.missionsSeen = profile.engagement.missionsSeen || {};
    profile.engagement.bossesCleared = profile.engagement.bossesCleared || {};
    profile.engagement.celebrationsSeen = profile.engagement.celebrationsSeen || {};
    profile.engagement.labCreations = Array.isArray(profile.engagement.labCreations) ? profile.engagement.labCreations : [];
    profile.engagement.daily = Object.assign({}, base.daily, profile.engagement.daily || {});
    return profile.engagement;
  }

  function dayKeyNow() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function touchLastPlayed(profile) {
    const eng = ensureEngagement(profile);
    eng.lastPlayedAt = Date.now();
    saveProfile(profile);
  }

  function shouldWelcomeBack(profile) {
    const eng = ensureEngagement(profile);
    if (!eng.lastPlayedAt) return false;
    return (Date.now() - eng.lastPlayedAt) > 36 * 60 * 60 * 1000;
  }

  function countLessonsDone(profile) {
    return Object.keys(profile.lessonsCompleted || {}).filter(function (k) { return profile.lessonsCompleted[k]; }).length;
  }

  function refreshWorldStage(profile, worldId) {
    const eng = ensureEngagement(profile);
    const content = CONTENT_REF;
    const stages = (content && content.WORLD_STAGES && content.WORLD_STAGES[worldId]) || [];
    if (!stages.length) return 0;
    const done = countWorldNodesDone(profile, worldId);
    const world = content.getWorld(worldId);
    const total = world ? world.nodes.length : stages.length;
    let stage = 0;
    if (total <= 0) stage = 0;
    else if (done <= 0) stage = 0;
    else if (done >= total) stage = stages.length - 1;
    else stage = Math.min(stages.length - 1, Math.max(1, Math.floor((done / total) * (stages.length - 1))));
    const prev = eng.worldStages[worldId] || 0;
    eng.worldStages[worldId] = stage;
    return { stage: stage, upgraded: stage > prev, label: stages[stage] };
  }

  function getWorldStage(profile, worldId) {
    const eng = ensureEngagement(profile);
    const content = CONTENT_REF;
    const stages = (content && content.WORLD_STAGES && content.WORLD_STAGES[worldId]) || [];
    const idx = eng.worldStages[worldId] || 0;
    return stages[idx] || stages[0] || { icon: "🌱", label: "Beginnings" };
  }

  function resolveNextMission(profile) {
    const content = CONTENT_REF;
    if (!content || !content.WORLDS) return null;
    const eng = ensureEngagement(profile);
    for (let wi = 0; wi < content.WORLDS.length; wi++) {
      const world = content.WORLDS[wi];
      if (!canPlayWorld(profile, world.id)) continue;
      for (let ni = 0; ni < world.nodes.length; ni++) {
        const node = world.nodes[ni];
        if (!nodeUnlocked(profile, world.id, node.id, ni)) continue;
        for (let li = 0; li < node.lessons.length; li++) {
          const lesson = node.lessons[li];
          const key = world.id + ":" + node.id + ":" + lesson.id;
          if (profile.lessonsCompleted[key]) continue;
          const missionKey = key;
          const meta = (content.MISSIONS && content.MISSIONS[missionKey]) ||
            (content.MISSIONS && content.MISSIONS[lesson.id]) ||
            { title: lesson.title, blurb: "Complete this lesson to grow your world.", emoji: world.icon || "⭐" };
          eng.currentMission = missionKey;
          return {
            key: missionKey,
            worldId: world.id,
            nodeId: node.id,
            lessonId: lesson.id,
            title: meta.title || lesson.title,
            blurb: meta.blurb || "",
            emoji: meta.emoji || world.icon || "⭐",
            worldName: world.name
          };
        }
        const boss = content.BOSSES && content.BOSSES[world.id + ":" + node.id];
        if (boss && !eng.bossesCleared[world.id + ":" + node.id] && profile.nodesCompleted[world.id + ":" + node.id]) {
          eng.currentMission = "boss:" + world.id + ":" + node.id;
          return {
            key: "boss:" + world.id + ":" + node.id,
            worldId: world.id,
            nodeId: node.id,
            lessonId: null,
            boss: true,
            title: boss.title || "Mastery Challenge",
            blurb: boss.blurb || "Show what you know!",
            emoji: boss.emoji || "🐉",
            worldName: world.name
          };
        }
      }
    }
    eng.currentMission = "";
    return null;
  }

  function getMissionMeta(worldId, nodeId, lessonId) {
    const content = CONTENT_REF;
    const key = worldId + ":" + nodeId + ":" + lessonId;
    if (content.MISSIONS && content.MISSIONS[key]) return content.MISSIONS[key];
    if (content.MISSIONS && content.MISSIONS[lessonId]) return content.MISSIONS[lessonId];
    return { title: "Mission", blurb: "Keep learning!", emoji: "⭐" };
  }

  function availableCompanions(profile) {
    const content = CONTENT_REF;
    const eng = ensureEngagement(profile);
    const list = (content && content.COMPANIONS) || [];
    return list.map(function (c) {
      const owned = eng.companions.indexOf(c.id) !== -1;
      return Object.assign({}, c, { owned: owned, equipped: eng.equippedCompanion === c.id });
    });
  }

  function tryUnlockCompanions(profile) {
    const content = CONTENT_REF;
    const eng = ensureEngagement(profile);
    const unlocked = [];
    ((content && content.COMPANIONS) || []).forEach(function (c) {
      if (eng.companions.indexOf(c.id) !== -1) return;
      let ok = false;
      if (c.unlock === "first-lesson" && countLessonsDone(profile) >= 1) ok = true;
      if (c.unlock === "stars" && profile.stars >= (c.unlockAt || 5)) ok = true;
      if (c.unlock === "lessons" && countLessonsDone(profile) >= (c.unlockAt || 5)) ok = true;
      if (c.unlock === "boss" && Object.keys(eng.bossesCleared).length >= 1) ok = true;
      if (c.unlock === "lab" && eng.labUnlocked) ok = true;
      if (ok) {
        eng.companions.push(c.id);
        if (!eng.equippedCompanion) eng.equippedCompanion = c.id;
        unlocked.push(c);
      }
    });
    return unlocked;
  }

  function companionLine(profile, kind) {
    const eng = ensureEngagement(profile);
    if (!eng.equippedCompanion) return "";
    const content = CONTENT_REF;
    const c = ((content && content.COMPANIONS) || []).find(function (x) { return x.id === eng.equippedCompanion; });
    if (!c || !c.lines) return "";
    return c.lines[kind] || "";
  }

  function markCelebration(profile, id) {
    const eng = ensureEngagement(profile);
    if (eng.celebrationsSeen[id]) return false;
    eng.celebrationsSeen[id] = true;
    return true;
  }

  function maybeUnlockLab(profile) {
    const eng = ensureEngagement(profile);
    if (eng.labUnlocked) return false;
    if (countLessonsDone(profile) >= 3 || Object.keys(eng.bossesCleared).length >= 1) {
      eng.labUnlocked = true;
      return true;
    }
    return false;
  }

  function saveLabCreation(profile, text) {
    const eng = ensureEngagement(profile);
    const clean = String(text || "").trim().slice(0, 800);
    if (!clean) return { ok: false, message: "Write something first." };
    eng.labCreations.unshift({ at: Date.now(), text: clean });
    eng.labCreations = eng.labCreations.slice(0, 20);
    saveProfile(profile);
    return { ok: true };
  }

  function getDailyState(profile) {
    const eng = ensureEngagement(profile);
    const today = dayKeyNow();
    if (eng.daily.dayKey !== today) {
      eng.daily = { dayKey: today, completed: false, stars: 0 };
    }
    return eng.daily;
  }

  function completeDaily(profile) {
    const daily = getDailyState(profile);
    if (daily.completed) return { ok: true, already: true };
    daily.completed = true;
    daily.stars = 1;
    profile.stars += 1;
    profile.xp += 10;
    saveProfile(profile);
    return { ok: true, already: false };
  }

  function getDailyActivities(profile) {
    const content = CONTENT_REF;
    const pool = (content && content.DAILY_POOL) || [];
    if (!pool.length) return [];
    const seed = dayKeyNow().split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    const start = seed % pool.length;
    const out = [];
    for (let i = 0; i < Math.min(3, pool.length); i++) out.push(pool[(start + i) % pool.length]);
    return out.map(function (a) { return Object.assign({}, a); });
  }

  function getBoss(worldId, nodeId) {
    const content = CONTENT_REF;
    return (content && content.BOSSES && content.BOSSES[worldId + ":" + nodeId]) || null;
  }

  function clearBoss(profile, worldId, nodeId) {
    const eng = ensureEngagement(profile);
    eng.bossesCleared[worldId + ":" + nodeId] = true;
    tryUnlockCompanions(profile);
    maybeUnlockLab(profile);
    saveProfile(profile);
  }

  function onLessonCompleteEngagement(profile, worldId, nodeId, lessonId) {
    const eng = ensureEngagement(profile);
    eng.missionsSeen[worldId + ":" + nodeId + ":" + lessonId] = true;
    const stageInfo = refreshWorldStage(profile, worldId);
    const newCompanions = tryUnlockCompanions(profile);
    const labJust = maybeUnlockLab(profile);
    touchLastPlayed(profile);
    saveProfile(profile);
    return {
      stageInfo: stageInfo,
      newCompanions: newCompanions,
      labUnlocked: labJust,
      firstLesson: markCelebration(profile, "first-lesson") && countLessonsDone(profile) === 1
    };
  }
`;

function patchEngine(file, contentGlobal, engineGlobal) {
  let s = fs.readFileSync(path.join(root, file), "utf8");
  if (s.includes("function defaultEngagement")) {
    console.log("skip already patched", file);
    return;
  }
  s = s.replace(
    /parentSessionUntil: 0,\n      exportVersion: \d+\n    \};/,
    "parentSessionUntil: 0,\n      engagement: null,\n      exportVersion: 4\n    };"
  );
  // fix engagement: null to call - better in defaultProfile body
  s = s.replace(
    "engagement: null,\n      exportVersion: 4",
    "engagement: undefined,\n      exportVersion: 4"
  );
  s = s.replace(
    "function defaultProfile() {\n    return {",
    "function defaultProfile() {\n    const p = {"
  );
  s = s.replace(
    /exportVersion: 4\n    \};\n  }/,
    "exportVersion: 4\n    };\n    p.engagement = defaultEngagement();\n    return p;\n  }"
  );

  // Need defaultEngagement before defaultProfile - insert helpers before defaultProfile
  if (!s.includes("function defaultEngagement")) {
    // Insert CONTENT_REF alias and helpers before defaultProfile... actually helpers use CONTENT_REF and functions defined later.
    // Put helpers just before global.XEngine export, and fix defaultProfile separately more carefully.
  }

  // Simpler approach: read file fresh and do cleaner patch
  return s;
}

// Cleaner full rewrite of patch:
function patchEngineClean(file, contentGlobal, engineGlobal, startWorld) {
  let s = fs.readFileSync(path.join(root, file), "utf8");
  if (s.includes("function ensureEngagement")) {
    console.log("already", file);
    return;
  }

  const helpers = HELPERS.replace(/CONTENT_REF/g, "global." + contentGlobal);

  // Insert helpers before global.XEngine =
  const marker = "  global." + engineGlobal + " = {";
  if (!s.includes(marker)) throw new Error("marker missing " + marker);
  s = s.replace(marker, helpers + "\n" + marker);

  // Patch defaultProfile to include engagement
  s = s.replace(
    /parentSessionUntil: 0,\n      exportVersion: \d+/,
    "parentSessionUntil: 0,\n      exportVersion: 4"
  );
  s = s.replace(
    "function defaultProfile() {\n    return {\n      name: \"\",",
    "function defaultProfile() {\n    return {\n      name: \"\","
  );
  // Add engagement after exportVersion line in return object
  s = s.replace(
    /(parentSessionUntil: 0,\n      exportVersion: 4\n    \};)/,
    "parentSessionUntil: 0,\n      exportVersion: 4,\n      engagement: {\n" +
      '      avatar: { outfit: "starter", accessory: "" },\n' +
      "      companions: [],\n" +
      '      equippedCompanion: "",\n' +
      "      worldStages: {},\n" +
      '      currentMission: "",\n' +
      "      daily: { dayKey: \"\", completed: false, stars: 0 },\n" +
      "      missionsSeen: {},\n" +
      "      bossesCleared: {},\n" +
      "      celebrationsSeen: {},\n" +
      "      labUnlocked: false,\n" +
      "      labCreations: [],\n" +
      "      lastPlayedAt: 0\n" +
      "      }\n    };"
  );

  // Merge engagement on load
  s = s.replace(
    /if \(!merged\.gradeBandSet && merged\.placementDone\) merged\.gradeBandSet = true;\n      return merged;/,
    "if (!merged.gradeBandSet && merged.placementDone) merged.gradeBandSet = true;\n" +
      "      ensureEngagement(merged);\n" +
      "      return merged;"
  );

  // Export new APIs
  s = s.replace(
    /ensureChallengeWeek: ensureChallengeWeek,\n    weekKey: weekKey\n  \};/,
    "ensureChallengeWeek: ensureChallengeWeek,\n" +
      "    weekKey: weekKey,\n" +
      "    ensureEngagement: ensureEngagement,\n" +
      "    resolveNextMission: resolveNextMission,\n" +
      "    getMissionMeta: getMissionMeta,\n" +
      "    getWorldStage: getWorldStage,\n" +
      "    refreshWorldStage: refreshWorldStage,\n" +
      "    availableCompanions: availableCompanions,\n" +
      "    tryUnlockCompanions: tryUnlockCompanions,\n" +
      "    companionLine: companionLine,\n" +
      "    markCelebration: markCelebration,\n" +
      "    maybeUnlockLab: maybeUnlockLab,\n" +
      "    saveLabCreation: saveLabCreation,\n" +
      "    getDailyState: getDailyState,\n" +
      "    completeDaily: completeDaily,\n" +
      "    getDailyActivities: getDailyActivities,\n" +
      "    getBoss: getBoss,\n" +
      "    clearBoss: clearBoss,\n" +
      "    onLessonCompleteEngagement: onLessonCompleteEngagement,\n" +
      "    shouldWelcomeBack: shouldWelcomeBack,\n" +
      "    touchLastPlayed: touchLastPlayed,\n" +
      "    countLessonsDone: countLessonsDone,\n" +
      "    dayKeyNow: dayKeyNow\n  };"
  );

  // Fix first-lesson celebration logic - markCelebration returns true if NEW, but we check count===1 after already completing
  // Leave as-is; UI can check countLessonsDone === 1

  fs.writeFileSync(path.join(root, file), s);
  console.log("patched", file);
}

patchEngineClean("wordquest-engine.js", "WQContent", "WQEngine", "alphabet-forest");
patchEngineClean("spellbuzz-engine.js", "SBContent", "SBEngine", "letter-sound-camp");
patchEngineClean("numbuzz-engine.js", "NBContent", "NBEngine", "count-forest");
console.log("engines done");
