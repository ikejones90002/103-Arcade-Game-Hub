const fs = require("fs");
const checks = [
  "next-mission-card",
  "btn-daily",
  "lab-screen",
  "companions-screen",
  "celebration-toast",
  "renderEngageChrome",
  "startBoss",
  "startDailyAdventure",
  "nodeJustMastered",
  'name === "lab"',
  "withParentGate",
  "btn-ask-ai"
];
["wordquest", "spellbuzz", "numbuzz"].forEach(function (g) {
  const s = fs.readFileSync("docs/" + g + ".html", "utf8");
  const miss = checks.filter(function (c) { return s.indexOf(c) === -1; });
  console.log(g, miss.length ? "MISS " + miss.join(",") : "OK");
  const mapAt = s.indexOf('id="world-map"');
  const stageAt = s.indexOf('id="stage-strip"');
  const nmAt = s.indexOf('id="next-mission-card"');
  const actAt = s.indexOf("engage-actions");
  console.log("  order map<stage<nm<actions", mapAt < stageAt && stageAt < nmAt && nmAt < actAt);
});
function hasWq(path) {
  return /wordquest-(engine|content)/.test(fs.readFileSync(path, "utf8"));
}
console.log("spell html wq", hasWq("docs/spellbuzz.html"));
console.log("spell eng wq", hasWq("docs/spellbuzz-engine.js"));
console.log("num html wq", hasWq("docs/numbuzz.html"));
console.log("num eng wq", hasWq("docs/numbuzz-engine.js"));
console.log("readme engagement", fs.readFileSync("README.md", "utf8").includes("World Engagement Layer"));
