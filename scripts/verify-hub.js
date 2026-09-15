const fs = require("fs");
const h = fs.readFileSync("docs/index.html", "utf8");
const games = ["spellbuzz", "numbuzz", "wordquest", "flipmatch", "patternpop", "rhymetime"];
games.forEach(function (g) {
  console.log(g, h.indexOf('href="' + g + '.html"') !== -1);
});
console.log("hub-page", h.indexOf('class="hub-page"') !== -1);
console.log("no competing title", h.indexOf("Select from the 103 Arcade Hub") === -1);
console.log("magenta cards", (h.match(/pick-card--magenta/g) || []).length);
console.log("cyan cards", (h.match(/pick-card--cyan/g) || []).length);
console.log(
  "wq unaffected",
  fs.readFileSync("docs/wordquest.html", "utf8").indexOf("hub-page") === -1
);
console.log(
  "spell unaffected",
  fs.readFileSync("docs/spellbuzz.html", "utf8").indexOf("hub-page") === -1
);
