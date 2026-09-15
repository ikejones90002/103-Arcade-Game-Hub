const fs = require("fs");
const files = ["docs/wordquest.html", "docs/spellbuzz.html", "docs/numbuzz.html"];
const oldFail = `    } else if (bossMode) {
      bossMode = false;
      showOverlay({
        title: "Not yet — let's practice",
        message: "This mastery check is for learning, not losing. Skills were saved. Try a lesson, then retry the challenge anytime.",
        button: "Back to map",
        onContinue: function () { renderWorldMap(); showScreen("map"); }
      });
    } else {`;
const newFail = `    } else if (bossMode) {
      bossMode = false;
      currentBossKey = null;
      showOverlay({
        title: "Not yet — let's practice",
        message: "This mastery check is for learning, not losing. Skills were saved. Try a lesson, then retry the challenge anytime.",
        button: "Back to map",
        onContinue: function () { renderWorldMap(); showScreen("map"); }
      });
    } else if (dailyMode) {
      dailyMode = false;
      showOverlay({
        title: "Adventure paused",
        message: (extraMessage || "That's okay!") + " Today's Adventure is optional—try again anytime. Progress was saved.",
        button: "Back to map",
        onContinue: function () { renderWorldMap(); showScreen("map"); }
      });
    } else {`;

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (s.includes("Adventure paused")) {
    console.log("already", f);
    return;
  }
  if (!s.includes(oldFail)) {
    console.log("miss", f);
    return;
  }
  fs.writeFileSync(f, s.replace(oldFail, newFail));
  console.log("soft-fail", f);
});
