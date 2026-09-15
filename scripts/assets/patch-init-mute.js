const fs = require("fs");
["wordquest", "spellbuzz", "numbuzz"].forEach(function (g) {
  const file = "docs/" + g + ".html";
  let s = fs.readFileSync(file, "utf8");
  const re = /let muted = localStorage\.getItem\([^)]+\) === "1";/;
  const m = s.match(re);
  if (!m) {
    console.log("no muted", g);
    return;
  }
  const insert = m[0] + "\n  if (Assets) Assets.setMuted(muted);";
  if (s.indexOf(insert) !== -1) {
    console.log("init mute ok", g);
    return;
  }
  s = s.replace(m[0], insert);
  fs.writeFileSync(file, s);
  console.log("init mute", g);
});
