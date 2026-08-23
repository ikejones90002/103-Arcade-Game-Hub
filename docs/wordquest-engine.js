/* Word Quest Reading World — lesson engine, profile, adaptive, coach */
(function (global) {
  "use strict";

  const PROFILE_KEY = "wordquest_profile";

  function store() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
      if (global.localStorage) return global.localStorage;
    } catch (err) {}
    return null;
  }

  const DEFAULT_SKILLS = {
    letterRecognition: 0,
    letterSounds: 0,
    phonics: 0,
    wordDecoding: 0,
    fluency: 0,
    vocabulary: 0,
    comprehension: 0,
    inference: 0,
    criticalThinking: 0
  };

  function defaultProfile() {
    return {
      name: "",
      xp: 0,
      stars: 0,
      unlockedWorlds: ["alphabet-forest"],
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
      exportVersion: 2
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
        : ["alphabet-forest"];
      merged.personalBest = Object.assign(base.personalBest, parsed.personalBest || {});
      merged.remediationQueue = Array.isArray(parsed.remediationQueue) ? parsed.remediationQueue : [];
      merged.gradeBand = parsed.gradeBand || parsed.placementTier || 1;
      merged.gradeBandSet = !!parsed.gradeBandSet;
      merged.reviewModeEnabled = !!parsed.reviewModeEnabled;
      merged.earlyUnlock = parsed.earlyUnlock || {};
      if (!merged.gradeBandSet && merged.placementDone) merged.gradeBandSet = true;
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
      type: "wordquest_profile_export",
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
    const labels = (global.WQContent && global.WQContent.SKILL_LABELS) || {};
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
    const world = global.WQContent && global.WQContent.getWorld(worldId);
    if (!world) return 0;
    let n = 0;
    world.nodes.forEach((node) => {
      if (profile.nodesCompleted[worldId + ":" + node.id]) n += 1;
    });
    return n;
  }

  function isWorldComplete(profile, worldId) {
    const world = global.WQContent && global.WQContent.getWorld(worldId);
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
    const content = global.WQContent;
    if (!content) return;
    content.WORLDS.forEach(function (w) {
      if (canPlayWorld(profile, w.id) && profile.unlockedWorlds.indexOf(w.id) === -1) {
        profile.unlockedWorlds.push(w.id);
      }
    });
  }

  function getGradeBandConfig(grade) {
    const bands = (global.WQContent && global.WQContent.GRADE_BANDS) || [];
    return bands.find(function (b) { return b.grade === grade; }) || bands[0];
  }

  function worldIdForGrade(grade) {
    const band = getGradeBandConfig(grade);
    return band ? band.worldId : "alphabet-forest";
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
    const content = global.WQContent;
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

  function nodeUnlocked(profile, worldId, nodeId, nodeIndex) {
    if (!canPlayWorld(profile, worldId)) return false;
    const world = global.WQContent.getWorld(worldId);
    if (!world) return false;
    if (worldId === "alphabet-forest" && profile.gradeBand === 2 && nodeIndex <= 1) return true;
    if (nodeIndex === 0) return true;
    const prev = world.nodes[nodeIndex - 1];
    return !!(prev && profile.nodesCompleted[worldId + ":" + prev.id]);
  }

  function markNodeCompleteIfReady(profile, worldId, nodeId) {
    const node = global.WQContent.getNode(worldId, nodeId);
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
    const list = (global.WQContent && global.WQContent.COSMETICS) || [];
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      cost: c.cost,
      unlocked: profile.stars >= c.unlockAtStars || profile.cosmetics.indexOf(c.id) !== -1,
      owned: profile.cosmetics.indexOf(c.id) !== -1
    }));
  }

  function unlockCosmetic(profile, cosmeticId) {
    const item = ((global.WQContent && global.WQContent.COSMETICS) || []).find((c) => c.id === cosmeticId);
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
    const bank = global.WQContent && global.WQContent.REMEDIATION_BANK[skill];
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
      const bank = global.WQContent.REMEDIATION_BANK[w.skill];
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
    let score = 0;
    let highTierCorrect = 0;
    results.forEach(function (r) {
      if (r.correct) {
        score += r.tier || 1;
        if ((r.tier || 1) >= 3) highTierCorrect += 1;
      }
    });
    let tier = 1;
    if (score >= 18) tier = 6;
    else if (score >= 14) tier = 5;
    else if (score >= 11) tier = 4;
    else if (score >= 8) tier = 3;
    else if (score >= 5) tier = 2;
    else tier = 1;
    const startWorld = worldIdForGrade(tier);
    const earlyUnlockWorld = (highTierCorrect >= 2 && tier < 9) ? worldIdForGrade(tier + 1) : null;
    return { startWorld: startWorld, tier: tier, score: score, earlyUnlockWorld: earlyUnlockWorld };
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
      if ((extra.streak || 0) >= 3) return "Great streak! Your reading brain is warming up.";
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
    return "I'm your reading coach. Play, read, and grow!";
  }

  function parentReport(profile) {
    const content = global.WQContent;
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

  global.WQEngine = {
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
    nodeUnlocked: nodeUnlocked,
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
    weekKey: weekKey
  };
})(typeof window !== "undefined" ? window : globalThis);
