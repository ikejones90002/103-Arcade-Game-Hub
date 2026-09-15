/* Adapt copied Reading World shells into independent Spelling/Math Worlds.
   Reading World is reference only — no runtime import of wordquest-*. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "docs");

function adapt(cfg) {
  let html = fs.readFileSync(path.join(root, "wordquest.html"), "utf8");

  html = html.replace(/Word Quest — Reading World — 103 Software Solutions LLC/g, cfg.pageTitle);
  html = html.replace(/href="wordquest\.svg"/g, 'href="' + cfg.icon + '"');
  html = html.replace(/src="wordquest\.svg"/g, 'src="' + cfg.icon + '"');
  html = html.replace(/<h1>Word Quest<\/h1>/g, "<h1>" + cfg.brand + "</h1>");
  html = html.replace(/<p class="wq-sub">Reading World<\/p>/g, '<p class="wq-sub">' + cfg.sub + "</p>");
  html = html.replace(/aria-label="Reading World map"/g, 'aria-label="' + cfg.sub + ' map"');
  html = html.replace(/alt="Word Quest"/g, 'alt="' + cfg.brand + '"');
  html = html.replace(
    /A reading adventure that grows with you\. Explore worlds, complete challenges, earn XP\./g,
    cfg.howto
  );
  html = html.replace(/© 2026 Word Quest\./g, "© 2026 " + cfg.brand + ".");
  html = html.replace(/Pick your reading level/g, "Pick your " + cfg.levelWord + " level");
  html = html.replace(
    /Choose the band that fits you \(Preschool through ~6th–7th\)\. You start there — earlier worlds stay optional review\./g,
    "Choose the band that fits you (Preschool through ~6th–7th). You start there — earlier worlds stay optional review."
  );
  html = html.replace(/This clears Reading World progress/g, "This clears " + cfg.sub + " progress");
  html = html.replace(/reading tip/gi, cfg.levelWord + " tip");

  html = html.replace(
    /<script src="wordquest-content\.js"><\/script>\s*<script src="wordquest-engine\.js"><\/script>\s*<script src="arcade-ai\.js"><\/script>\s*<script src="wordquest-ai\.js"><\/script>/,
    '<script src="' + cfg.contentFile + '"></script>\n' +
      '  <script src="' + cfg.engineFile + '"></script>\n' +
      '  <script src="arcade-ai.js"></script>'
  );

  html = html.replace(
    /const Content = window\.WQContent;\s*const AI = window\.WQAI;\s*const Engine = window\.WQEngine;/,
    "const Content = window." + cfg.contentGlobal + ";\n" +
      "  const Engine = window." + cfg.engineGlobal + ";\n" +
      "  const AI = window.ArcadeAI.createClient({\n" +
      '    subject: "' + cfg.subject + '",\n' +
      "    getEngine: function () { return Engine; }\n" +
      "  });"
  );

  html = html.replace(/wordquest_mute/g, cfg.muteKey);
  html = html.replace(/wordquest_lb/g, cfg.lbKey);

  /* Add answer input UI before honor-actions */
  if (!html.includes('id="answer-input"')) {
    html = html.replace(
      '<div class="actions" id="honor-actions">',
      '<div id="answer-area" class="hidden" style="width:100%;margin:0.6rem 0;">\n' +
        '        <label class="visually-hidden" for="answer-input">Your answer</label>\n' +
        '        <input id="answer-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false"\n' +
        '          style="width:100%;max-width:320px;padding:12px;border-radius:12px;border:1px solid var(--magenta);background:#05050a;color:var(--ink);font-size:1.2rem;text-align:center;">\n' +
        '        <div class="actions" style="margin-top:0.5rem;">\n' +
        '          <button id="answer-submit" class="btn" type="button">Check</button>\n' +
        "        </div>\n" +
        "      </div>\n" +
        '      <div class="actions" id="honor-actions">'
    );
  }

  /* Patch clearPlayUi to hide answer area */
  html = html.replace(
    'document.getElementById("build-area").classList.add("hidden");',
    'document.getElementById("build-area").classList.add("hidden");\n' +
      '    const answerArea = document.getElementById("answer-area");\n' +
      '    if (answerArea) answerArea.classList.add("hidden");'
  );

  /* Inject spell/equation handlers after renderChoices function area — replace nextActivity branch for unknown types */
  const inject = `
  function showAnswerInput(placeholder) {
    const area = document.getElementById("answer-area");
    const input = document.getElementById("answer-input");
    area.classList.remove("hidden");
    input.value = "";
    input.placeholder = placeholder || "Type your answer";
    input.focus();
  }

  function submitTypedAnswer() {
    if (!roundActive || !currentItem) return;
    const input = document.getElementById("answer-input");
    const raw = (input && input.value) || "";
    if (!String(raw).trim()) return;
    judgeResponse(raw);
  }
`;

  if (!html.includes("function showAnswerInput")) {
    html = html.replace("  function nextActivity() {", inject + "\n  function nextActivity() {");
  }

  /* After clearPlayUi at start of nextActivity, add spell/equation branches before build */
  html = html.replace(
    '    if (type === "build") {\n      renderBuild(item);\n      return;\n    }',
    '    if (type === "spell" || type === "equation") {\n' +
      '      promptEl.textContent = item.prompt || "";\n' +
      '      showAnswerInput(type === "spell" ? "Type the spelling" : "Type the answer");\n' +
      '      if (item.speak) speakText(item.speak);\n' +
      "      return;\n" +
      "    }\n" +
      '    if (type === "build") {\n      renderBuild(item);\n      return;\n    }'
  );

  /* Wire submit button near speakBtn bindings */
  if (!html.includes('answer-submit')) {
    /* already have id in HTML; wire onclick */
  }
  html = html.replace(
    "  speakBtn.onclick = function () {",
    '  const answerSubmit = document.getElementById("answer-submit");\n' +
      "  if (answerSubmit) answerSubmit.onclick = function () { playSfx(\"click\"); submitTypedAnswer(); };\n" +
      '  const answerInput = document.getElementById("answer-input");\n' +
      "  if (answerInput) answerInput.addEventListener(\"keydown\", function (e) {\n" +
      '    if (e.key === "Enter") { e.preventDefault(); submitTypedAnswer(); }\n' +
      "  });\n\n" +
      "  speakBtn.onclick = function () {"
  );

  /* For spelling: speak current word on Speak */
  html = html.replace(
    '    if (currentItem.type === "story" && currentItem.payload) speakText(currentItem.payload.text);\n' +
      "    else speakText(currentItem.speak || currentItem.prompt);",
    '    if (currentItem.type === "story" && currentItem.payload) speakText(currentItem.payload.text);\n' +
      '    else if (currentItem.type === "equation" && currentItem.payload && currentItem.payload.equation) speakText(currentItem.speak || currentItem.payload.equation);\n' +
      "    else speakText(currentItem.speak || currentItem.prompt);"
  );

  fs.writeFileSync(path.join(root, cfg.out), html);
  console.log("wrote", cfg.out);
}

adapt({
  out: "spellbuzz.html",
  pageTitle: "SpellBuzz — Spelling World — 103 Software Solutions LLC",
  brand: "SpellBuzz",
  sub: "Spelling World",
  icon: "bee.svg",
  howto: "A spelling adventure that grows with you. Explore worlds, sound out words, earn XP.",
  levelWord: "spelling",
  contentFile: "spellbuzz-content.js",
  engineFile: "spellbuzz-engine.js",
  contentGlobal: "SBContent",
  engineGlobal: "SBEngine",
  subject: "spelling",
  muteKey: "spellbee_mute",
  lbKey: "spellbee_lb"
});

adapt({
  out: "numbuzz.html",
  pageTitle: "NumBuzz — Math World — 103 Software Solutions LLC",
  brand: "NumBuzz",
  sub: "Math World",
  icon: "numbuzz.svg",
  howto: "A math adventure that grows with you. Explore worlds, solve challenges, earn XP.",
  levelWord: "math",
  contentFile: "numbuzz-content.js",
  engineFile: "numbuzz-engine.js",
  contentGlobal: "NBContent",
  engineGlobal: "NBEngine",
  subject: "math",
  muteKey: "numbuzz_mute",
  lbKey: "numbuzz_lb"
});

console.log("done");
