const fs = require("fs");
const files = ["docs/wordquest.html", "docs/spellbuzz.html", "docs/numbuzz.html"];

const block = `      <p class="stage-strip" id="stage-strip"><strong>World growth:</strong> <span id="stage-text">Begin your adventure</span></p>
      <button type="button" class="next-mission" id="next-mission-card" aria-label="Start next mission">
        <div class="nm-label">Next Mission</div>
        <div class="nm-title" id="nm-title">Pick a level to begin</div>
        <div class="nm-blurb" id="nm-blurb">Your next adventure will appear here.</div>
      </button>
      <div class="world-map" id="world-map" role="list"></div>`;

const better = `      <div class="world-map" id="world-map" role="list"></div>
      <p class="stage-strip" id="stage-strip"><strong>World growth:</strong> <span id="stage-text">Begin your adventure</span></p>
      <button type="button" class="next-mission" id="next-mission-card" aria-label="Start next mission">
        <div class="nm-label">Next Mission</div>
        <div class="nm-title" id="nm-title">Pick a level to begin</div>
        <div class="nm-blurb" id="nm-blurb">Your next adventure will appear here.</div>
      </button>`;

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes(block)) {
    console.log("block miss", f);
    return;
  }
  s = s.replace(block, better);
  fs.writeFileSync(f, s);
  console.log("map-first", f);
});
