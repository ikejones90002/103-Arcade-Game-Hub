const fs = require("fs");

const files = ["docs/wordquest.html", "docs/spellbuzz.html", "docs/numbuzz.html"];

const actionsBlock = `      <div class="engage-actions">
        <button id="btn-daily" class="btn secondary" type="button">Today's Adventure</button>
        <button id="btn-lab" class="btn secondary" type="button">Secret Lab</button>
        <button id="btn-companions" class="btn secondary" type="button">Companions</button>
      </div>

`;

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes(actionsBlock)) {
    console.log("actions miss", f);
    return;
  }
  // Remove actions from above map
  s = s.replace(actionsBlock, "");
  // Insert after world-map div (before review-map)
  const needle = '      <div class="world-map" id="world-map" role="list"></div>\n';
  if (!s.includes(needle)) {
    console.log("map miss", f);
    return;
  }
  // Also move next-mission + stage to sit with map: keep stage + next-mission before map (hero chrome), actions after map
  s = s.replace(
    needle,
    needle + "\n" + actionsBlock
  );
  fs.writeFileSync(f, s);
  console.log("reordered", f);
});

// Add node-mastered celebration hook in finishLesson (all three)
const oldMark =
  "      Engine.markNodeCompleteIfReady(profile, currentWorldId, currentNodeId);\n      let engageInfo";
const newMark =
  "      const nodeJustMastered = Engine.markNodeCompleteIfReady(profile, currentWorldId, currentNodeId);\n      if (nodeJustMastered && Engine.markCelebration(profile, \"node-\" + currentWorldId + \":\" + currentNodeId)) showCelebration(\"Node mastered!\");\n      let engageInfo";

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (s.includes("nodeJustMastered")) {
    console.log("node cele already", f);
    return;
  }
  if (!s.includes(oldMark)) {
    console.log("mark miss", f);
    return;
  }
  s = s.replace(oldMark, newMark);
  fs.writeFileSync(f, s);
  console.log("node cele", f);
});
