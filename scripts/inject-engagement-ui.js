/* Inject map-first engagement UI into each world shell independently */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "docs");

const MAP_CHROME = `
      <div class="engage-bar" id="engage-bar">
        <div class="engage-avatar"><span class="emoji" id="avatar-emoji">🧒</span><span id="avatar-label">Explorer</span></div>
        <div class="engage-companion"><span class="emoji" id="companion-emoji">✨</span><span id="companion-label">No companion yet</span></div>
      </div>
      <p class="stage-strip" id="stage-strip"><strong>World growth:</strong> <span id="stage-text">Begin your adventure</span></p>
      <button type="button" class="next-mission" id="next-mission-card" aria-label="Start next mission">
        <div class="nm-label">Next Mission</div>
        <div class="nm-title" id="nm-title">Pick a level to begin</div>
        <div class="nm-blurb" id="nm-blurb">Your next adventure will appear here.</div>
      </button>
      <div class="engage-actions">
        <button id="btn-daily" class="btn secondary" type="button">Today's Adventure</button>
        <button id="btn-lab" class="btn secondary" type="button">Secret Lab</button>
        <button id="btn-companions" class="btn secondary" type="button">Companions</button>
      </div>
`;

const EXTRA_SCREENS = `
    <section id="lab-screen" class="card hidden" aria-label="Secret Lab">
      <h2 style="color:var(--yellow);margin-bottom:0.4rem;">Secret Lab</h2>
      <p class="howto" id="lab-prompt">Create something with what you learned.</p>
      <textarea id="lab-input" class="lab-box" maxlength="800" placeholder="Create here..."></textarea>
      <div class="actions">
        <button id="lab-save" class="btn" type="button">Save creation</button>
        <button id="lab-back" class="btn secondary" type="button">Back</button>
      </div>
      <div id="lab-list" class="muted" style="width:100%;margin-top:0.8rem;text-align:left;"></div>
    </section>

    <section id="companions-screen" class="card hidden" aria-label="Companions">
      <h2 style="color:var(--yellow);margin-bottom:0.4rem;">Companions</h2>
      <p class="howto">Learning friends unlock as you grow. Equip one for encouragement.</p>
      <div id="companions-list" class="cosmetic-list"></div>
      <div class="actions" style="margin-top:1rem;">
        <button id="companions-back" class="btn secondary" type="button">Back</button>
      </div>
    </section>

    <div id="celebration-toast" class="celebration-toast" aria-live="polite"></div>
`;

const JS_HELPERS = `
  let bossMode = false;
  let dailyMode = false;
  let currentBossKey = null;

  function showCelebration(text) {
    const el = document.getElementById("celebration-toast");
    if (!el || !text) return;
    el.textContent = text;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, reduceMotionOn() ? 900 : 2200);
  }

  function renderEngageChrome() {
    Engine.ensureEngagement(profile);
    Engine.touchLastPlayed(profile);
    const name = profile.name || "Explorer";
    document.getElementById("avatar-label").textContent = name;
    const comps = Engine.availableCompanions(profile);
    const equipped = comps.find(function (c) { return c.equipped; });
    document.getElementById("companion-emoji").textContent = equipped ? equipped.emoji : "✨";
    document.getElementById("companion-label").textContent = equipped ? equipped.name : "No companion yet";
    const band = Engine.getGradeBandConfig(profile.gradeBand || 1);
    const worldId = band && band.worldId;
    if (worldId) {
      Engine.refreshWorldStage(profile, worldId);
      const stage = Engine.getWorldStage(profile, worldId);
      const stages = (Content.WORLD_STAGES && Content.WORLD_STAGES[worldId]) || [];
      const strip = stages.map(function (s, i) {
        const cur = (profile.engagement.worldStages[worldId] || 0) === i;
        return (cur ? "[" : "") + s.icon + (cur ? "]" : "");
      }).join(" → ");
      document.getElementById("stage-text").textContent = (stage.icon || "") + " " + (stage.label || "") + (strip ? " · " + strip : "");
    }
    const mission = Engine.resolveNextMission(profile);
    const nmTitle = document.getElementById("nm-title");
    const nmBlurb = document.getElementById("nm-blurb");
    const nmCard = document.getElementById("next-mission-card");
    if (!mission) {
      nmTitle.textContent = "All clear for now!";
      nmBlurb.textContent = "Explore the map, try Today's Adventure, or visit the Secret Lab.";
      nmCard.onclick = null;
    } else {
      nmTitle.textContent = (mission.emoji || "⭐") + " " + mission.title;
      nmBlurb.textContent = mission.blurb + (mission.worldName ? " · " + mission.worldName : "");
      nmCard.onclick = function () {
        playSfx("click");
        if (mission.boss) startBoss(mission.worldId, mission.nodeId);
        else startLesson(mission.worldId, mission.nodeId, mission.lessonId);
      };
    }
    const daily = Engine.getDailyState(profile);
    document.getElementById("btn-daily").textContent = daily.completed ? "Adventure done ✓" : "Today's Adventure";
    document.getElementById("btn-lab").disabled = !profile.engagement.labUnlocked;
    document.getElementById("btn-lab").title = profile.engagement.labUnlocked ? "Secret Lab" : "Unlock by completing lessons";
    if (Engine.shouldWelcomeBack(profile) && Engine.markCelebration(profile, "welcome-" + Engine.dayKeyNow())) {
      showCelebration("Welcome back! Your garden kept growing.");
      Engine.saveProfile(profile);
    }
  }

  function setCompanionLine(kind) {
    const line = Engine.companionLine(profile, kind);
    let el = document.getElementById("companion-line");
    if (!el) {
      el = document.createElement("div");
      el.id = "companion-line";
      el.className = "companion-line";
      const play = document.getElementById("play-screen");
      if (play) play.insertBefore(el, play.querySelector(".hud") ? play.querySelector(".hud").nextSibling : play.firstChild);
    }
    el.textContent = line || "";
  }

  function startBoss(worldId, nodeId) {
    const boss = Engine.getBoss(worldId, nodeId);
    if (!boss) return;
    bossMode = true;
    dailyMode = false;
    currentBossKey = worldId + ":" + nodeId;
    currentWorldId = worldId;
    currentNodeId = nodeId;
    currentLesson = { id: "boss-" + nodeId, title: boss.title, reward: boss.reward || { xp: 15, stars: 1 }, activities: boss.activities };
    activityQueue = (boss.activities || []).slice();
    activityIndex = 0;
    score = 0; lives = 3; streak = 0; stars = 0;
    lessonStartedAt = Date.now();
    showScreen("play");
    const banner = document.getElementById("mission-banner");
    if (banner) {
      banner.classList.remove("hidden");
      banner.innerHTML = "<strong>" + (boss.emoji || "🐉") + " " + boss.title + "</strong> — " + (boss.blurb || "Show what you know!");
    }
    nextActivity();
  }

  function startDailyAdventure() {
    const daily = Engine.getDailyState(profile);
    if (daily.completed) {
      showOverlay({ title: "Already done", message: "You finished Today's Adventure. Come back tomorrow—no pressure!", button: "OK" });
      return;
    }
    const acts = Engine.getDailyActivities(profile);
    if (!acts.length) {
      showOverlay({ title: "Rest day", message: "No adventure ready—play a mission on the map!", button: "OK" });
      return;
    }
    dailyMode = true;
    bossMode = false;
    currentLesson = { id: "daily", title: "Today's Adventure", reward: { xp: 10, stars: 1 }, activities: acts };
    activityQueue = acts.slice();
    activityIndex = 0;
    score = 0; lives = 3; streak = 0; stars = 0;
    lessonStartedAt = Date.now();
    showScreen("play");
    const banner = document.getElementById("mission-banner");
    if (banner) {
      banner.classList.remove("hidden");
      banner.innerHTML = "<strong>🌟 Today's Adventure</strong> — A short optional challenge. Learning only!";
    }
    nextActivity();
  }

  function renderCompanions() {
    const list = document.getElementById("companions-list");
    list.replaceChildren();
    Engine.availableCompanions(profile).forEach(function (c) {
      const row = document.createElement("div");
      row.className = "cosmetic-row";
      row.innerHTML = "<div><strong>" + c.emoji + " " + c.name + "</strong><div class='muted'>" + (c.owned ? "Unlocked" : "Keep learning to unlock") + "</div></div>";
      const actions = document.createElement("div");
      if (c.owned) {
        const btn = document.createElement("button");
        btn.className = "btn secondary";
        btn.type = "button";
        btn.textContent = c.equipped ? "Equipped" : "Equip";
        btn.onclick = function () {
          profile.engagement.equippedCompanion = c.id;
          Engine.saveProfile(profile);
          renderCompanions();
          renderEngageChrome();
        };
        actions.appendChild(btn);
      }
      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  function renderLab() {
    const prompts = Content.LAB_PROMPTS || ["Create something you learned today."];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    document.getElementById("lab-prompt").textContent = prompt;
    document.getElementById("lab-input").value = "";
    const list = document.getElementById("lab-list");
    list.replaceChildren();
    (profile.engagement.labCreations || []).slice(0, 5).forEach(function (item) {
      const p = document.createElement("p");
      p.textContent = "• " + item.text;
      list.appendChild(p);
    });
  }
`;

function inject(file, cfg) {
  let html = fs.readFileSync(path.join(root, file), "utf8");
  if (html.includes('id="next-mission-card"')) {
    console.log("ui already", file);
    return;
  }

  // Insert map chrome before world-map
  html = html.replace(
    '<div class="world-map" id="world-map" role="list"></div>',
    MAP_CHROME + '\n      <div class="world-map" id="world-map" role="list"></div>'
  );

  // Mission banner in play screen
  html = html.replace(
    '<section id="play-screen" class="card hidden" aria-label="Lesson">',
    '<section id="play-screen" class="card hidden" aria-label="Lesson">\n' +
      '      <div class="mission-banner hidden" id="mission-banner"></div>\n' +
      '      <div class="companion-line" id="companion-line"></div>'
  );

  // Extra screens before footer
  html = html.replace(
    /<footer class="site-footer">/,
    EXTRA_SCREENS + "\n    <footer class=\"site-footer\">"
  );

  // Inject JS helpers after AI const / Engine const block - after "let muted"
  if (!html.includes("function renderEngageChrome")) {
    html = html.replace(
      /let muted = localStorage\.getItem\("[^"]+"\) === "1";/,
      function (m) { return m + "\n" + JS_HELPERS; }
    );
  }

  // Call renderEngageChrome from renderWorldMap end
  html = html.replace(
    "reviewMap.classList.toggle(\"hidden\", !profile.reviewModeEnabled || reviewMap.childElementCount === 0);\n    refreshHeaderStats();\n  }",
    "reviewMap.classList.toggle(\"hidden\", !profile.reviewModeEnabled || reviewMap.childElementCount === 0);\n    refreshHeaderStats();\n    renderEngageChrome();\n  }"
  );

  // Companion lines on correct/miss
  html = html.replace(
    "honeyConfetti();\n    flashCard(\"ok\");\n    playSound(\"correct\");",
    "honeyConfetti();\n    flashCard(\"ok\");\n    playSound(\"correct\");\n    setCompanionLine(\"correct\");"
  );
  html = html.replace(
    "flashCard(\"bad\");\n    playSound(\"wrong\");",
    "flashCard(\"bad\");\n    playSound(\"wrong\");\n    setCompanionLine(\"miss\");"
  );

  // startLesson mission banner
  html = html.replace(
    "showScreen(\"play\");\n    nextActivity();\n  }\n\n  function startPlacement()",
    "showScreen(\"play\");\n" +
      "    bossMode = false; dailyMode = false;\n" +
      "    const meta = Engine.getMissionMeta(worldId, nodeId, lessonId);\n" +
      "    const banner = document.getElementById(\"mission-banner\");\n" +
      "    if (banner) {\n" +
      "      banner.classList.remove(\"hidden\");\n" +
      "      banner.innerHTML = \"<strong>\" + (meta.emoji || \"⭐\") + \" \" + (meta.title || lesson.title) + \"</strong> — \" + (meta.blurb || \"\");\n" +
      "    }\n" +
      "    nextActivity();\n  }\n\n  function startPlacement()"
  );

  // finishLesson engagement hooks - after success applyReward block
  html = html.replace(
    "Engine.markNodeCompleteIfReady(profile, currentWorldId, currentNodeId);\n      launchCelebration(score >= 8 ? \"champion\" : \"milestone\");\n      playSfx(\"fanfare\");",
    "Engine.markNodeCompleteIfReady(profile, currentWorldId, currentNodeId);\n" +
      "      let engageInfo = { newCompanions: [], stageInfo: null, labUnlocked: false };\n" +
      "      if (bossMode && currentBossKey) {\n" +
      "        const parts = currentBossKey.split(\":\");\n" +
      "        Engine.clearBoss(profile, parts[0], parts[1]);\n" +
      "        if (Engine.markCelebration(profile, \"boss-\" + currentBossKey)) showCelebration(\"Boss cleared! Mastery shines.\");\n" +
      "        setCompanionLine(\"boss\");\n" +
      "        bossMode = false; currentBossKey = null;\n" +
      "      } else if (dailyMode) {\n" +
      "        const dres = Engine.completeDaily(profile);\n" +
      "        if (!dres.already && Engine.markCelebration(profile, \"daily-\" + Engine.dayKeyNow())) showCelebration(\"Adventure Star earned!\");\n" +
      "        dailyMode = false;\n" +
      "      } else if (currentWorldId && currentNodeId && currentLesson) {\n" +
      "        engageInfo = Engine.onLessonCompleteEngagement(profile, currentWorldId, currentNodeId, currentLesson.id) || engageInfo;\n" +
      "        setCompanionLine(\"complete\");\n" +
      "        if (engageInfo.firstLesson || Engine.countLessonsDone(profile) === 1) showCelebration(\"First lesson complete!\");\n" +
      "        if (engageInfo.stageInfo && engageInfo.stageInfo.upgraded) showCelebration(\"World grew: \" + (engageInfo.stageInfo.label && engageInfo.stageInfo.label.label));\n" +
      "        (engageInfo.newCompanions || []).forEach(function (c) { showCelebration(\"New companion: \" + c.emoji + \" \" + c.name); });\n" +
      "        if (engageInfo.labUnlocked && Engine.markCelebration(profile, \"lab-unlock\")) showCelebration(\"Secret Lab unlocked!\");\n" +
      "      }\n" +
      "      launchCelebration(score >= 8 ? \"champion\" : \"milestone\");\n" +
      "      playSfx(\"fanfare\");"
  );

  // Soft boss fail - when finishLesson false and bossMode
  html = html.replace(
    "} else {\n      showOverlay({\n        title: \"Lesson paused\",\n        message: (extraMessage || \"Out of lives.\") + \" Progress on skills was still saved. \" +\n          Engine.coachMessage(profile, \"miss\"),",
    "} else if (bossMode) {\n" +
      "      bossMode = false;\n" +
      "      showOverlay({\n" +
      "        title: \"Not yet — let's practice\",\n" +
      "        message: \"This mastery check is for learning, not losing. Skills were saved. Try a lesson, then retry the challenge anytime.\",\n" +
      "        button: \"Back to map\",\n" +
      "        onContinue: function () { renderWorldMap(); showScreen(\"map\"); }\n" +
      "      });\n" +
      "    } else {\n      showOverlay({\n        title: \"Lesson paused\",\n        message: (extraMessage || \"Out of lives.\") + \" Progress on skills was still saved. \" +\n          Engine.coachMessage(profile, \"miss\"),"
  );

  // Wire buttons near btn-export
  html = html.replace(
    'document.getElementById("btn-export").onclick = function () {',
    'document.getElementById("btn-daily").onclick = function () { playSfx("click"); startDailyAdventure(); };\n' +
      '  document.getElementById("btn-lab").onclick = function () {\n' +
      '    playSfx("click");\n' +
      "    if (!profile.engagement.labUnlocked) {\n" +
      '      showOverlay({ title: "Lab locked", message: "Complete a few lessons to open the Secret Lab.", button: "OK" });\n' +
      "      return;\n" +
      "    }\n" +
      "    renderLab();\n" +
      '    showScreen("lab");\n' +
      "  };\n" +
      '  document.getElementById("btn-companions").onclick = function () {\n' +
      '    playSfx("click"); renderCompanions(); showScreen("companions");\n' +
      "  };\n" +
      '  document.getElementById("lab-back").onclick = function () { renderWorldMap(); showScreen("map"); };\n' +
      '  document.getElementById("companions-back").onclick = function () { renderWorldMap(); showScreen("map"); };\n' +
      '  document.getElementById("lab-save").onclick = function () {\n' +
      "    const res = Engine.saveLabCreation(profile, document.getElementById(\"lab-input\").value);\n" +
      '    showOverlay({ title: res.ok ? "Saved!" : "Hmm", message: res.ok ? "Your creation is in the lab." : res.message, button: "OK", onContinue: renderLab });\n' +
      "  };\n" +
      '  document.getElementById("btn-export").onclick = function () {'
  );

  // showScreen must know lab/companions - check showScreen function
  if (html.includes('function showScreen(name)')) {
    // usually toggles by id name+"-screen"
  }

  fs.writeFileSync(path.join(root, file), html);
  console.log("injected", file, cfg.label);
}

inject("wordquest.html", { label: "reading" });
inject("spellbuzz.html", { label: "spelling" });
inject("numbuzz.html", { label: "math" });
console.log("done");
