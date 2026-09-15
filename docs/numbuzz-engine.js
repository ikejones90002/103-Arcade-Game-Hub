/* NumBuzz Math World — lesson engine, profile, adaptive, coach */
(function (global) {
  "use strict";

  const PROFILE_KEY = "numbuzz_profile";

  function store() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
      if (global.localStorage) return global.localStorage;
    } catch (err) {}
    return null;
  }

  const DEFAULT_SKILLS = {
    counting: 0,
    addition: 0,
    subtraction: 0,
    placeValue: 0,
    multiplication: 0,
    division: 0,
    fractions: 0,
    wordProblems: 0,
    preAlgebra: 0
  };

  function defaultProfile() {
    return {
      name: "",
      xp: 0,
      stars: 0,
      unlockedWorlds: ["count-forest"],
      nodesCompleted: {},
      lessonsCompleted: {},
      skills: Object.assign({}, DEFAULT_SKILLS),
      skillAttempts: {},
      history: [],
      cosmetics: [],
      equippedFrame: "",
      personalBest: { weeklyReads: 0, bestStreak: 0, challengeTarget: 3, challengeProgress: 0, challengeWeek: "" },
      placementDone: false,
      placementTier: 1,
      gradeBand: 1,
      gradeBandSet: false,
      reviewModeEnabled: false,
      earlyUnlock: {},
      remediationQueue: [],
      timeSpentMs: 0,
      coachEnabled: true,
      parentPin: "",
      parentSessionUntil: 0,
      exportVersion: 4,
      engagement: {
      avatar: { body: "child-01", hair: "hair-01", outfit: "explorer", accessory: "" },
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
      }
    };
  }

  function loadProfile() {
    try {
      const s = store();
      const raw = s ? s.getItem(PROFILE_KEY) : null;
      if (!raw) return defaultProfile();
      const parsed = JSON.parse(raw);
      const base = defaultProfile();
      const merged = Object.assign(base, parsed);
      merged.skills = Object.assign({}, DEFAULT_SKILLS, parsed.skills || {});
      merged.skillAttempts = parsed.skillAttempts || {};
      merged.nodesCompleted = parsed.nodesCompleted || {};
      merged.lessonsCompleted = parsed.lessonsCompleted || {};
      merged.history = Array.isArray(parsed.history) ? parsed.history : [];
      merged.unlockedWorlds = parsed.unlockedWorlds && parsed.unlockedWorlds.length
        ? parsed.unlockedWorlds
        : ["count-forest"];
      merged.personalBest = Object.assign(base.personalBest, parsed.personalBest || {});
      merged.remediationQueue = Array.isArray(parsed.remediationQueue) ? parsed.remediationQueue : [];
      merged.gradeBand = parsed.gradeBand || parsed.placementTier || 1;
      merged.gradeBandSet = !!parsed.gradeBandSet;
      merged.reviewModeEnabled = !!parsed.reviewModeEnabled;
      merged.earlyUnlock = parsed.earlyUnlock || {};
      merged.parentPin = typeof parsed.parentPin === "string" ? parsed.parentPin : "";
      merged.parentSessionUntil = Number(parsed.parentSessionUntil) || 0;
      if (!merged.gradeBandSet && merged.placementDone) merged.gradeBandSet = true;
      ensureEngagement(merged);
      return merged;
    } catch (err) {
      return defaultProfile();
    }
  }

  function saveProfile(profile) {
    const s = store();
    if (s) s.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function exportProfile(profile) {
    return JSON.stringify({
      type: "numbuzz_profile_export",
      version: 1,
      exportedAt: Date.now(),
      profile: profile
    }, null, 2);
  }

  function importProfile(jsonText) {
    const data = JSON.parse(jsonText);
    const profile = data.profile || data;
    if (!profile || typeof profile !== "object") throw new Error("Invalid profile");
    const merged = Object.assign(defaultProfile(), profile);
    merged.skills = Object.assign({}, DEFAULT_SKILLS, profile.skills || {});
    merged.earlyUnlock = profile.earlyUnlock || {};
    merged.gradeBand = profile.gradeBand || profile.placementTier || 1;
    merged.gradeBandSet = !!profile.gradeBandSet;
    merged.reviewModeEnabled = !!profile.reviewModeEnabled;
    saveProfile(merged);
    return merged;
  }

  function normalizeAnswer(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function evaluateActivity(activity, response) {
    if (!activity) return { correct: false, message: "Missing activity." };
    const type = activity.type;
    if (type === "sprint" || type === "action") {
      const ok = response === true || normalizeAnswer(response) === "gotit" || normalizeAnswer(response) === normalizeAnswer(activity.answer);
      return {
        correct: ok,
        message: ok ? "Nice reading!" : ("Keep trying. It was: " + (activity.answer || activity.prompt))
      };
    }
    const expected = normalizeAnswer(activity.answer);
    const got = normalizeAnswer(response);
    const correct = expected === got;
    return {
      correct: correct,
      message: correct ? "Correct!" : ("Not quite. The answer was " + activity.answer + ".")
    };
  }

  function bumpSkill(profile, skill, correct) {
    if (!skill) return;
    if (profile.skills[skill] == null) profile.skills[skill] = 0;
    if (!profile.skillAttempts[skill]) profile.skillAttempts[skill] = { correct: 0, total: 0 };
    profile.skillAttempts[skill].total += 1;
    if (correct) {
      profile.skillAttempts[skill].correct += 1;
      profile.skills[skill] = Math.min(100, profile.skills[skill] + 3);
    } else {
      profile.skills[skill] = Math.max(0, profile.skills[skill] - 1);
    }
  }

  function skillAccuracy(profile, skill) {
    const a = profile.skillAttempts[skill];
    if (!a || !a.total) return profile.skills[skill] || 0;
    return Math.round((a.correct / a.total) * 100);
  }

  function weakestSkills(profile, limit) {
    const labels = (global.NBContent && global.NBContent.SKILL_LABELS) || {};
    return Object.keys(profile.skills)
      .map((skill) => ({
        skill: skill,
        label: labels[skill] || skill,
        score: profile.skills[skill],
        accuracy: skillAccuracy(profile, skill)
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit || 3);
  }

  function recordHistory(profile, entry) {
    profile.history.unshift(Object.assign({ at: Date.now() }, entry));
    profile.history = profile.history.slice(0, 80);
  }

  function weekKey() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + week;
  }

  function ensureChallengeWeek(profile) {
    const key = weekKey();
    if (profile.personalBest.challengeWeek !== key) {
      profile.personalBest.challengeWeek = key;
      profile.personalBest.challengeProgress = 0;
      profile.personalBest.challengeTarget = Math.max(3, (profile.personalBest.weeklyReads || 0) + 1);
    }
  }

  function applyReward(profile, reward, meta) {
    reward = reward || { xp: 10, stars: 1 };
    profile.xp += reward.xp || 0;
    profile.stars += reward.stars || 0;
    if (meta && meta.lessonKey) profile.lessonsCompleted[meta.lessonKey] = true;
    if (meta && meta.nodeKey) {
      profile.nodesCompleted[meta.nodeKey] = true;
    }
    ensureChallengeWeek(profile);
    profile.personalBest.challengeProgress += 1;
    profile.personalBest.weeklyReads = Math.max(
      profile.personalBest.weeklyReads || 0,
      profile.personalBest.challengeProgress
    );
    if (meta && meta.streak) {
      profile.personalBest.bestStreak = Math.max(profile.personalBest.bestStreak || 0, meta.streak);
    }
    refreshUnlocks(profile);
    saveProfile(profile);
    return profile;
  }

  function countWorldNodesDone(profile, worldId) {
    const world = global.NBContent && global.NBContent.getWorld(worldId);
    if (!world) return 0;
    let n = 0;
    world.nodes.forEach((node) => {
      if (profile.nodesCompleted[worldId + ":" + node.id]) n += 1;
    });
    return n;
  }

  function isWorldComplete(profile, worldId) {
    const world = global.NBContent && global.NBContent.getWorld(worldId);
    if (!world) return false;
    return world.nodes.every((node) => profile.nodesCompleted[worldId + ":" + node.id]);
  }

  function requirementMet(profile, req) {
    if (req.type === "nodes") return countWorldNodesDone(profile, req.worldId) >= req.min;
    if (req.type === "skill") return (profile.skills[req.skill] || 0) >= req.min;
    if (req.type === "worldComplete") return isWorldComplete(profile, req.worldId);
    return false;
  }

  function refreshUnlocks(profile) {
    /* Legacy field kept for exports; map access uses gradeBand. */
    const content = global.NBContent;
    if (!content) return;
    content.WORLDS.forEach(function (w) {
      if (canPlayWorld(profile, w.id) && profile.unlockedWorlds.indexOf(w.id) === -1) {
        profile.unlockedWorlds.push(w.id);
      }
    });
  }

  function getGradeBandConfig(grade) {
    const bands = (global.NBContent && global.NBContent.GRADE_BANDS) || [];
    return bands.find(function (b) { return b.grade === grade; }) || bands[0];
  }

  function worldIdForGrade(grade) {
    const band = getGradeBandConfig(grade);
    return band ? band.worldId : "count-forest";
  }

  function getRegionAccessState(profile, regionLevel) {
    const g = profile.gradeBand || 1;
    if (regionLevel === g) return "your-level";
    if (regionLevel < g) return profile.reviewModeEnabled ? "review" : "review-hidden";
    const worldId = worldIdForGrade(regionLevel);
    if (profile.earlyUnlock && profile.earlyUnlock[worldId]) return "early";
    return "locked";
  }

  function isRegionAccessible(profile, regionLevel) {
    const state = getRegionAccessState(profile, regionLevel);
    return state === "your-level" || state === "review" || state === "early";
  }

  function canPlayWorld(profile, worldId) {
    const content = global.NBContent;
    if (!content) return false;
    return content.MAP_REGIONS.some(function (r) {
      return r.id === worldId && isRegionAccessible(profile, r.level);
    });
  }

  function isWorldUnlocked(profile, worldId) {
    return canPlayWorld(profile, worldId);
  }

  function isWorldLockedAbove(profile, regionLevel) {
    return getRegionAccessState(profile, regionLevel) === "locked";
  }

  function setGradeBand(profile, grade) {
    profile.gradeBand = Math.max(1, Math.min(9, grade));
    profile.gradeBandSet = true;
    refreshUnlocks(profile);
    saveProfile(profile);
    return profile;
  }

  function bumpGradeUp(profile) {
    return setGradeBand(profile, (profile.gradeBand || 1) + 1);
  }

  function bumpGradeDown(profile) {
    return setGradeBand(profile, (profile.gradeBand || 1) - 1);
  }

  function setReviewMode(profile, enabled) {
    profile.reviewModeEnabled = !!enabled;
    refreshUnlocks(profile);
    saveProfile(profile);
    return profile;
  }

  function grantEarlyUnlock(profile, worldId) {
    profile.earlyUnlock = profile.earlyUnlock || {};
    profile.earlyUnlock[worldId] = true;
    refreshUnlocks(profile);
    saveProfile(profile);
    return profile;
  }

  function getPathNodes(worldId, pathStartNodeId) {
    const world = global.NBContent && global.NBContent.getWorld(worldId);
    if (!world) return [];
    let startIndex = 0;
    if (pathStartNodeId) {
      const found = world.nodes.findIndex(function (n) { return n.id === pathStartNodeId; });
      if (found >= 0) startIndex = found;
    }
    return world.nodes.slice(startIndex).map(function (node, pathIndex) {
      return {
        node: node,
        worldIndex: startIndex + pathIndex,
        pathIndex: pathIndex,
        pathStartIndex: startIndex
      };
    });
  }

  function nodeUnlocked(profile, worldId, nodeId, nodeIndex, options) {
    options = options || {};
    if (!canPlayWorld(profile, worldId)) return false;
    const world = global.NBContent.getWorld(worldId);
    if (!world) return false;
    const pathStart = options.pathStartIndex != null ? options.pathStartIndex : 0;
    if (nodeIndex < pathStart) return false;
    if (nodeIndex === pathStart) return true;
    const prev = world.nodes[nodeIndex - 1];
    return !!(prev && profile.nodesCompleted[worldId + ":" + prev.id]);
  }

  function normalizePin(pin) {
    return String(pin || "").replace(/\D/g, "").slice(0, 4);
  }

  function hasParentPin(profile) {
    return normalizePin(profile.parentPin).length === 4;
  }

  function setParentPin(profile, pin) {
    const clean = normalizePin(pin);
    if (clean.length !== 4) return { ok: false, message: "PIN must be 4 digits." };
    profile.parentPin = clean;
    saveProfile(profile);
    return { ok: true };
  }

  function verifyParentPin(profile, pin) {
    return hasParentPin(profile) && normalizePin(profile.parentPin) === normalizePin(pin);
  }

  function parentSessionActive(profile) {
    return Date.now() < (Number(profile.parentSessionUntil) || 0);
  }

  function unlockParentSession(profile, minutes) {
    profile.parentSessionUntil = Date.now() + Math.max(1, minutes || 5) * 60 * 1000;
    saveProfile(profile);
    return profile;
  }

  function clearParentSession(profile) {
    profile.parentSessionUntil = 0;
    saveProfile(profile);
    return profile;
  }

  function markNodeCompleteIfReady(profile, worldId, nodeId) {
    const node = global.NBContent.getNode(worldId, nodeId);
    if (!node) return false;
    const allDone = node.lessons.every((lesson) => profile.lessonsCompleted[worldId + ":" + nodeId + ":" + lesson.id]);
    if (allDone) {
      profile.nodesCompleted[worldId + ":" + nodeId] = true;
      refreshUnlocks(profile);
      saveProfile(profile);
      return true;
    }
    return false;
  }

  function availableCosmetics(profile) {
    const list = (global.NBContent && global.NBContent.COSMETICS) || [];
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      cost: c.cost,
      unlocked: profile.stars >= c.unlockAtStars || profile.cosmetics.indexOf(c.id) !== -1,
      owned: profile.cosmetics.indexOf(c.id) !== -1
    }));
  }

  function unlockCosmetic(profile, cosmeticId) {
    const item = ((global.NBContent && global.NBContent.COSMETICS) || []).find((c) => c.id === cosmeticId);
    if (!item) return { ok: false, message: "Unknown reward." };
    if (profile.cosmetics.indexOf(cosmeticId) !== -1) return { ok: true, message: "Already owned." };
    if (profile.stars < item.unlockAtStars) return { ok: false, message: "Earn more stars first." };
    if (profile.xp < item.cost) return { ok: false, message: "Need more XP." };
    profile.xp -= item.cost;
    profile.cosmetics.push(cosmeticId);
    saveProfile(profile);
    return { ok: true, message: "Unlocked " + item.name + "!" };
  }

  function queueRemediation(profile, skill) {
    const bank = global.NBContent && global.NBContent.REMEDIATION_BANK[skill];
    if (!bank || !bank.length) return;
    const pick = bank[Math.floor(Math.random() * bank.length)];
    profile.remediationQueue.push({
      id: "rem-" + skill + "-" + Date.now(),
      skill: skill,
      activity: pick
    });
    profile.remediationQueue = profile.remediationQueue.slice(0, 12);
  }

  function afterActivityResult(profile, activity, correct, streak) {
    const skill = activity.skill || (activity.skillTags && activity.skillTags[0]);
    bumpSkill(profile, skill, correct);
    recordHistory(profile, {
      type: activity.type,
      skill: skill,
      correct: correct,
      prompt: activity.prompt
    });
    if (!correct && skill) queueRemediation(profile, skill);
    else if (correct && skill && profile.skills[skill] < 50 && Math.random() < 0.25) {
      queueRemediation(profile, skill);
    }
    if (streak) profile.personalBest.bestStreak = Math.max(profile.personalBest.bestStreak || 0, streak);
    saveProfile(profile);
  }

  function nextRemediation(profile) {
    if (!profile.remediationQueue.length) return null;
    return profile.remediationQueue.shift();
  }

  function injectAdaptiveActivities(lesson, profile) {
    const acts = (lesson.activities || []).slice();
    const weak = weakestSkills(profile, 2).filter((s) => s.score < 55);
    weak.forEach((w) => {
      const bank = global.NBContent.REMEDIATION_BANK[w.skill];
      if (!bank || !bank.length) return;
      const extra = bank[Math.floor(Math.random() * bank.length)];
      acts.splice(Math.min(2, acts.length), 0, Object.assign({}, extra, { adaptive: true }));
    });
    while (profile.remediationQueue.length && acts.length < (lesson.activities.length + 2)) {
      const rem = profile.remediationQueue.shift();
      if (rem && rem.activity) acts.push(Object.assign({}, rem.activity, { adaptive: true, remediation: true }));
    }
    return Object.assign({}, lesson, { activities: acts });
  }

  function runPlacement(results) {
    results = Array.isArray(results) ? results : [];
    let score = 0;
    let highTierCorrect = 0;
    let answered = results.length;
    results.forEach(function (r) {
      if (r.correct) {
        score += r.tier || 1;
        if ((r.tier || 1) >= 5) highTierCorrect += 1;
      }
    });
    let tier = 1;
    if (score >= 36) tier = 9;
    else if (score >= 30) tier = 8;
    else if (score >= 25) tier = 7;
    else if (score >= 20) tier = 6;
    else if (score >= 15) tier = 5;
    else if (score >= 11) tier = 4;
    else if (score >= 8) tier = 3;
    else if (score >= 5) tier = 2;
    else tier = 1;
    const reliable = answered >= 4;
    const startWorld = worldIdForGrade(tier);
    const earlyUnlockWorld = (reliable && highTierCorrect >= 2 && tier < 9) ? worldIdForGrade(tier + 1) : null;
    return {
      startWorld: startWorld,
      tier: tier,
      score: score,
      answered: answered,
      reliable: reliable,
      earlyUnlockWorld: earlyUnlockWorld
    };
  }

  function applyPlacement(profile, placement) {
    profile.placementDone = true;
    profile.placementTier = placement.tier;
    profile.gradeBand = placement.tier;
    profile.gradeBandSet = true;
    if (placement.earlyUnlockWorld) grantEarlyUnlock(profile, placement.earlyUnlockWorld);
    refreshUnlocks(profile);
    saveProfile(profile);
    return profile;
  }

  function coachMessage(profile, context, extra) {
    if (!profile.coachEnabled) return "";
    const weak = weakestSkills(profile, 1)[0];
    extra = extra || {};
    if (context === "miss" && weak) {
      return "Let's strengthen " + weak.label + ". You've got this — try one more carefully.";
    }
    if (context === "correct") {
      if ((extra.streak || 0) >= 3) return "Great streak! Great streak! Your math brain is warming up.";
      return "Great job! Ready for the next challenge?";
    }
    if (context === "lesson-complete") {
      return weak && weak.score < 50
        ? "Awesome progress. Next time we can practice more " + weak.label + "."
        : "Quest complete! Your skills are looking strong.";
    }
    if (context === "map") {
      ensureChallengeWeek(profile);
      const pb = profile.personalBest;
      return "This week's challenge: " + pb.challengeProgress + "/" + pb.challengeTarget +
        " lessons (beat your best of " + (pb.weeklyReads || 0) + ").";
    }
    if (context === "parent") {
      return weak
        ? "Focus suggestion: " + weak.label + " (" + weak.score + "% mastery)."
        : "Keep exploring new worlds.";
    }
    if (context === "ask") {
      return weak
        ? "Try a short practice on " + weak.label + ". Take it one step at a time."
        : "Pick a world at your level and finish one math lesson — small steps add up!";
    }
    return "I'm your math coach. Think, try, and grow!";
  }

  function parentReport(profile) {
    const content = global.NBContent;
    const skills = Object.keys(profile.skills).map((skill) => ({
      skill: skill,
      label: (content && content.SKILL_LABELS[skill]) || skill,
      score: profile.skills[skill],
      accuracy: skillAccuracy(profile, skill),
      mastery: content && content.MASTERY[skill] ? profile.skills[skill] >= content.MASTERY[skill] : false
    }));
    const worlds = (content && content.WORLDS || []).map((w) => ({
      id: w.id,
      name: w.name,
      unlocked: isWorldUnlocked(profile, w.id),
      complete: isWorldComplete(profile, w.id),
      nodesDone: countWorldNodesDone(profile, w.id),
      nodesTotal: w.nodes.length
    }));
    const band = getGradeBandConfig(profile.gradeBand || 1);
    const minutes = Math.round((profile.timeSpentMs || 0) / 60000);
    return {
      name: profile.name || "Player",
      xp: profile.xp,
      stars: profile.stars,
      minutes: minutes,
      skills: skills,
      worlds: worlds,
      recent: profile.history.slice(0, 10),
      challenge: profile.personalBest,
      coachTip: coachMessage(profile, "parent"),
      placementTier: profile.placementTier,
      placementDone: profile.placementDone,
      gradeBand: profile.gradeBand || 1,
      gradeLabel: band ? band.label : "",
      gradeName: band ? band.name : "",
      reviewModeEnabled: !!profile.reviewModeEnabled
    };
  }

  function estimateLessonMs(activityCount) {
    return Math.max(1, activityCount) * 20000;
  }

  function addTime(profile, ms) {
    profile.timeSpentMs = (profile.timeSpentMs || 0) + ms;
    saveProfile(profile);
  }


  function defaultEngagement() {
    return {
      avatar: { body: "child-01", hair: "hair-01", outfit: "explorer", accessory: "" },
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
    const content = global.NBContent;
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
    const content = global.NBContent;
    const stages = (content && content.WORLD_STAGES && content.WORLD_STAGES[worldId]) || [];
    const idx = eng.worldStages[worldId] || 0;
    return stages[idx] || stages[0] || { icon: "🌱", label: "Beginnings" };
  }

  function resolveNextMission(profile) {
    const content = global.NBContent;
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
    const content = global.NBContent;
    const key = worldId + ":" + nodeId + ":" + lessonId;
    if (content.MISSIONS && content.MISSIONS[key]) return content.MISSIONS[key];
    if (content.MISSIONS && content.MISSIONS[lessonId]) return content.MISSIONS[lessonId];
    return { title: "Mission", blurb: "Keep learning!", emoji: "⭐" };
  }

  function availableCompanions(profile) {
    const content = global.NBContent;
    const eng = ensureEngagement(profile);
    const list = (content && content.COMPANIONS) || [];
    return list.map(function (c) {
      const owned = eng.companions.indexOf(c.id) !== -1;
      return Object.assign({}, c, { owned: owned, equipped: eng.equippedCompanion === c.id });
    });
  }

  function tryUnlockCompanions(profile) {
    const content = global.NBContent;
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
    const content = global.NBContent;
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
    const content = global.NBContent;
    const pool = (content && content.DAILY_POOL) || [];
    if (!pool.length) return [];
    const seed = dayKeyNow().split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    const start = seed % pool.length;
    const out = [];
    for (let i = 0; i < Math.min(3, pool.length); i++) out.push(pool[(start + i) % pool.length]);
    return out.map(function (a) { return Object.assign({}, a); });
  }

  function getBoss(worldId, nodeId) {
    const content = global.NBContent;
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

  global.NBEngine = {
    PROFILE_KEY: PROFILE_KEY,
    loadProfile: loadProfile,
    saveProfile: saveProfile,
    exportProfile: exportProfile,
    importProfile: importProfile,
    defaultProfile: defaultProfile,
    evaluateActivity: evaluateActivity,
    bumpSkill: bumpSkill,
    skillAccuracy: skillAccuracy,
    weakestSkills: weakestSkills,
    recordHistory: recordHistory,
    applyReward: applyReward,
    refreshUnlocks: refreshUnlocks,
    isWorldUnlocked: isWorldUnlocked,
    canPlayWorld: canPlayWorld,
    getRegionAccessState: getRegionAccessState,
    isRegionAccessible: isRegionAccessible,
    isWorldLockedAbove: isWorldLockedAbove,
    getGradeBandConfig: getGradeBandConfig,
    setGradeBand: setGradeBand,
    bumpGradeUp: bumpGradeUp,
    bumpGradeDown: bumpGradeDown,
    setReviewMode: setReviewMode,
    grantEarlyUnlock: grantEarlyUnlock,
    worldIdForGrade: worldIdForGrade,
    isWorldComplete: isWorldComplete,
    getPathNodes: getPathNodes,
    nodeUnlocked: nodeUnlocked,
    hasParentPin: hasParentPin,
    setParentPin: setParentPin,
    verifyParentPin: verifyParentPin,
    parentSessionActive: parentSessionActive,
    unlockParentSession: unlockParentSession,
    clearParentSession: clearParentSession,
    markNodeCompleteIfReady: markNodeCompleteIfReady,
    countWorldNodesDone: countWorldNodesDone,
    availableCosmetics: availableCosmetics,
    unlockCosmetic: unlockCosmetic,
    afterActivityResult: afterActivityResult,
    nextRemediation: nextRemediation,
    injectAdaptiveActivities: injectAdaptiveActivities,
    runPlacement: runPlacement,
    applyPlacement: applyPlacement,
    coachMessage: coachMessage,
    parentReport: parentReport,
    addTime: addTime,
    estimateLessonMs: estimateLessonMs,
    ensureChallengeWeek: ensureChallengeWeek,
    weekKey: weekKey,
    ensureEngagement: ensureEngagement,
    resolveNextMission: resolveNextMission,
    getMissionMeta: getMissionMeta,
    getWorldStage: getWorldStage,
    refreshWorldStage: refreshWorldStage,
    availableCompanions: availableCompanions,
    tryUnlockCompanions: tryUnlockCompanions,
    companionLine: companionLine,
    markCelebration: markCelebration,
    maybeUnlockLab: maybeUnlockLab,
    saveLabCreation: saveLabCreation,
    getDailyState: getDailyState,
    completeDaily: completeDaily,
    getDailyActivities: getDailyActivities,
    getBoss: getBoss,
    clearBoss: clearBoss,
    onLessonCompleteEngagement: onLessonCompleteEngagement,
    shouldWelcomeBack: shouldWelcomeBack,
    touchLastPlayed: touchLastPlayed,
    countLessonsDone: countLessonsDone,
    dayKeyNow: dayKeyNow
  };
})(typeof window !== "undefined" ? window : globalThis);
