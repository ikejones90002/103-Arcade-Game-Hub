const fs = require("fs");
const files = ["docs/wordquest.html", "docs/spellbuzz.html", "docs/numbuzz.html"];
const oldHide =
  '[mapScreen, pathScreen, nodeScreen, playScreen, parentScreen, rewardsScreen, exportScreen, document.getElementById("grade-screen")]';
const newHide =
  '[mapScreen, pathScreen, nodeScreen, playScreen, parentScreen, rewardsScreen, exportScreen, document.getElementById("grade-screen"), document.getElementById("lab-screen"), document.getElementById("companions-screen")]';
const oldShow =
  'else if (name === "grade") document.getElementById("grade-screen").classList.remove("hidden");\n  }';
const newShow =
  'else if (name === "grade") document.getElementById("grade-screen").classList.remove("hidden");\n    else if (name === "lab") document.getElementById("lab-screen").classList.remove("hidden");\n    else if (name === "companions") document.getElementById("companions-screen").classList.remove("hidden");\n  }';

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes(oldHide)) console.log("hide miss", f);
  else s = s.replace(oldHide, newHide);
  if (!s.includes('name === "lab"')) {
    if (!s.includes(oldShow)) console.log("show miss", f);
    else s = s.replace(oldShow, newShow);
  }
  fs.writeFileSync(f, s);
  console.log("ok", f);
});
