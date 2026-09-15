/**
 * Generate starter SVG library + manifests for World Asset Pipeline.
 * Run: node scripts/assets/generate-starter-svgs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "docs", "assets");

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + "\n");
}

function svg(w, h, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">
${body}
</svg>`;
}

const OUT = "#1a1a28";
const SKIN = ["#f5c99a", "#d4a574", "#8d5524"];

// --- Avatar bases ---
SKIN.forEach(function (skin, i) {
  const n = String(i + 1).padStart(2, "0");
  write(
    `images/avatars/base/child-${n}.svg`,
    svg(
      128,
      128,
      `  <ellipse cx="64" cy="108" rx="28" ry="10" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
  <rect x="44" y="70" width="40" height="38" rx="12" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
  <circle cx="64" cy="46" r="28" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
  <circle cx="54" cy="44" r="3.5" fill="${OUT}"/>
  <circle cx="74" cy="44" r="3.5" fill="${OUT}"/>
  <path d="M54 56 Q64 62 74 56" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round"/>`
    )
  );
});

const hairs = [
  { id: "hair-01", fill: "#2b1d0e", path: "M36 42 Q64 8 92 42 Q88 28 64 22 Q40 28 36 42Z" },
  { id: "hair-02", fill: "#c45c26", path: "M34 48 Q48 12 64 18 Q80 12 94 48 Q90 30 64 26 Q38 30 34 48Z" },
  { id: "hair-03", fill: "#1a3a5c", path: "M38 40 Q64 4 90 40 L86 50 Q64 28 42 50Z" }
];
hairs.forEach(function (h) {
  write(
    `images/avatars/hair/${h.id}.svg`,
    svg(128, 128, `  <path d="${h.path}" fill="${h.fill}" stroke="${OUT}" stroke-width="3"/>`)
  );
});

const outfits = [
  { id: "explorer", fill: "#32cd32", detail: "#ff8c00" },
  { id: "wizard", fill: "#b14dff", detail: "#00ffff" },
  { id: "scientist", fill: "#f4f7ff", detail: "#00ffff" },
  { id: "knight", fill: "#8899aa", detail: "#ffff00" }
];
outfits.forEach(function (o) {
  write(
    `images/avatars/outfits/${o.id}.svg`,
    svg(
      128,
      128,
      `  <path d="M40 72 Q64 64 88 72 L84 108 Q64 114 44 108Z" fill="${o.fill}" stroke="${OUT}" stroke-width="3"/>
  <circle cx="64" cy="86" r="5" fill="${o.detail}" stroke="${OUT}" stroke-width="2"/>`
    )
  );
});

const accessories = [
  {
    id: "glasses",
    body: `  <circle cx="54" cy="46" r="10" stroke="${OUT}" stroke-width="3" fill="none"/>
  <circle cx="74" cy="46" r="10" stroke="${OUT}" stroke-width="3" fill="none"/>
  <path d="M64 46 H68" stroke="${OUT}" stroke-width="3"/>`
  },
  {
    id: "hat",
    body: `  <ellipse cx="64" cy="28" rx="34" ry="8" fill="#ff8c00" stroke="${OUT}" stroke-width="3"/>
  <path d="M48 28 Q64 0 80 28" fill="#ff8c00" stroke="${OUT}" stroke-width="3"/>`
  },
  {
    id: "backpack",
    body: `  <rect x="86" y="72" width="22" height="30" rx="6" fill="#00ffff" stroke="${OUT}" stroke-width="3"/>
  <path d="M88 78 H106" stroke="${OUT}" stroke-width="2"/>`
  },
  {
    id: "crown",
    body: `  <path d="M44 28 L52 14 L64 26 L76 14 L84 28 Z" fill="#ffff00" stroke="${OUT}" stroke-width="3"/>
  <circle cx="52" cy="16" r="3" fill="#ff00ff"/>
  <circle cx="76" cy="16" r="3" fill="#00ffff"/>`
  }
];
accessories.forEach(function (a) {
  write(`images/avatars/accessories/${a.id}.svg`, svg(128, 128, a.body));
});

write(
  "images/avatars/expressions/smile.svg",
  svg(128, 128, `  <path d="M54 56 Q64 64 74 56" stroke="${OUT}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`)
);

function companionSvg(opts) {
  return svg(
    128,
    128,
    `  <ellipse cx="64" cy="108" rx="36" ry="8" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="64" cy="70" rx="36" ry="32" fill="${opts.body}" stroke="${OUT}" stroke-width="3"/>
  <circle cx="64" cy="42" r="26" fill="${opts.body}" stroke="${OUT}" stroke-width="3"/>
  <circle cx="54" cy="40" r="4" fill="${OUT}"/>
  <circle cx="74" cy="40" r="4" fill="${OUT}"/>
  <path d="M56 52 Q64 58 72 52" stroke="${OUT}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  ${opts.extra || ""}`
  );
}

const companions = [
  { world: "reading", id: "book-owl", body: "#c4a574", extra: `<path d="M40 28 L52 18 L56 30" fill="#8d5524" stroke="${OUT}" stroke-width="2"/><path d="M88 28 L76 18 L72 30" fill="#8d5524" stroke="${OUT}" stroke-width="2"/><rect x="78" y="78" width="22" height="16" rx="2" fill="#ffff00" stroke="${OUT}" stroke-width="2"/>` },
  { world: "reading", id: "story-fox", body: "#ff8c00", extra: `<path d="M40 28 L48 8 L58 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><path d="M88 28 L80 8 L70 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><ellipse cx="64" cy="52" rx="8" ry="5" fill="#f4f7ff"/>` },
  { world: "reading", id: "word-rabbit", body: "#f4f7ff", extra: `<ellipse cx="50" cy="10" rx="8" ry="22" fill="#f4f7ff" stroke="${OUT}" stroke-width="2"/><ellipse cx="78" cy="10" rx="8" ry="22" fill="#f4f7ff" stroke="${OUT}" stroke-width="2"/>` },
  { world: "reading", id: "page-dragon", body: "#32cd32", extra: `<path d="M90 60 Q110 50 108 72 Q100 68 90 70" fill="#32cd32" stroke="${OUT}" stroke-width="2"/><path d="M40 70 L28 78 L40 82" fill="#ff00ff" stroke="${OUT}" stroke-width="2"/>` },
  { world: "spelling", id: "buzzbee", body: "#ffff00", extra: `<ellipse cx="40" cy="50" rx="14" ry="8" fill="#00ffff" opacity=".7" stroke="${OUT}" stroke-width="2"/><ellipse cx="88" cy="50" rx="14" ry="8" fill="#00ffff" opacity=".7" stroke="${OUT}" stroke-width="2"/><path d="M50 70 H78" stroke="${OUT}" stroke-width="4"/>` },
  { world: "spelling", id: "letter-owl", body: "#b9c0d4", extra: `<path d="M40 28 L52 16 L56 30" fill="#8899aa" stroke="${OUT}" stroke-width="2"/><path d="M88 28 L76 16 L72 30" fill="#8899aa" stroke="${OUT}" stroke-width="2"/><text x="64" y="78" text-anchor="middle" font-size="16" font-family="Segoe UI,sans-serif" fill="${OUT}" font-weight="700">A</text>` },
  { world: "spelling", id: "sound-fox", body: "#ff8c00", extra: `<path d="M38 26 L48 6 L58 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><path d="M90 26 L80 6 L70 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><circle cx="96" cy="44" r="8" fill="none" stroke="#00ffff" stroke-width="2"/>` },
  { world: "spelling", id: "word-frog", body: "#32cd32", extra: `<circle cx="48" cy="28" r="10" fill="#32cd32" stroke="${OUT}" stroke-width="2"/><circle cx="80" cy="28" r="10" fill="#32cd32" stroke="${OUT}" stroke-width="2"/>` },
  { world: "math", id: "number-turtle", body: "#32cd32", extra: `<ellipse cx="64" cy="78" rx="34" ry="22" fill="#2d8a4e" stroke="${OUT}" stroke-width="3"/><text x="64" y="84" text-anchor="middle" font-size="18" font-family="Segoe UI,sans-serif" fill="#ffff00" font-weight="700">7</text>` },
  { world: "math", id: "countbot", body: "#00ffff", extra: `<rect x="48" y="28" width="32" height="22" rx="4" fill="#0b0b12" stroke="${OUT}" stroke-width="2"/><circle cx="56" cy="40" r="3" fill="#32cd32"/><circle cx="72" cy="40" r="3" fill="#32cd32"/><rect x="58" y="88" width="12" height="16" fill="#b9c0d4" stroke="${OUT}" stroke-width="2"/>` },
  { world: "math", id: "fraction-fox", body: "#ff8c00", extra: `<path d="M38 26 L48 6 L58 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><path d="M90 26 L80 6 L70 28" fill="#ff8c00" stroke="${OUT}" stroke-width="2"/><text x="64" y="78" text-anchor="middle" font-size="14" font-family="Segoe UI,sans-serif" fill="${OUT}" font-weight="700">1/2</text>` },
  { world: "math", id: "equation-dragon", body: "#b14dff", extra: `<path d="M92 58 Q112 48 110 70" fill="#b14dff" stroke="${OUT}" stroke-width="2"/><text x="64" y="78" text-anchor="middle" font-size="16" font-family="Segoe UI,sans-serif" fill="#ffff00" font-weight="700">x</text>` }
];

companions.forEach(function (c) {
  write(`images/companions/${c.world}/${c.id}.svg`, companionSvg(c));
});

function stageSvg(label, colors) {
  return svg(
    240,
    120,
    `  <rect width="240" height="120" rx="12" fill="${colors.sky}"/>
  <ellipse cx="120" cy="110" rx="110" ry="24" fill="${colors.ground}"/>
  <circle cx="200" cy="28" r="16" fill="${colors.sun}" opacity=".9"/>
  ${colors.extra || ""}
  <text x="120" y="64" text-anchor="middle" font-size="14" font-family="Segoe UI,sans-serif" fill="${OUT}" font-weight="700">${label}</text>`
  );
}

const stageSets = {
  reading: [
    { file: "stage-0-sprout.svg", label: "Sprout", sky: "#c8f0ff", ground: "#32cd32", sun: "#ffff00", extra: `<path d="M60 100 L60 70 L48 55" stroke="#1a1a28" stroke-width="3" fill="none"/><circle cx="48" cy="50" r="10" fill="#32cd32" stroke="#1a1a28" stroke-width="2"/>` },
    { file: "stage-1-forest.svg", label: "Forest", sky: "#a8e0ff", ground: "#2d8a4e", sun: "#ffff00", extra: `<path d="M50 100 L50 55 L30 55 L50 30 L70 55 L50 55" fill="#2d8a4e" stroke="#1a1a28" stroke-width="2"/><path d="M100 100 L100 50 L80 50 L100 22 L120 50 L100 50" fill="#32cd32" stroke="#1a1a28" stroke-width="2"/>` },
    { file: "stage-2-village.svg", label: "Village", sky: "#b8e8ff", ground: "#88aa66", sun: "#ffff00", extra: `<rect x="70" y="60" width="40" height="40" fill="#f4f7ff" stroke="#1a1a28" stroke-width="2"/><path d="M65 60 L90 40 L115 60" fill="#ff8c00" stroke="#1a1a28" stroke-width="2"/>` },
    { file: "stage-3-kingdom.svg", label: "Kingdom", sky: "#9ad4ff", ground: "#668866", sun: "#ffff00", extra: `<rect x="90" y="45" width="60" height="55" fill="#b9c0d4" stroke="#1a1a28" stroke-width="2"/><rect x="100" y="25" width="14" height="25" fill="#b9c0d4" stroke="#1a1a28" stroke-width="2"/><rect x="126" y="25" width="14" height="25" fill="#b9c0d4" stroke="#1a1a28" stroke-width="2"/><path d="M100 25 L107 12 L114 25" fill="#ff00ff"/><path d="M126 25 L133 12 L140 25" fill="#00ffff"/>` }
  ],
  spelling: [
    { file: "stage-0-meadow.svg", label: "Meadow", sky: "#d4ffe8", ground: "#7dce82", sun: "#ffff00", extra: `<text x="70" y="90" font-size="22" fill="#1a1a28" font-weight="700">Aa</text>` },
    { file: "stage-1-workshop.svg", label: "Workshop", sky: "#ffe8c8", ground: "#c4a574", sun: "#ff8c00", extra: `<rect x="80" y="55" width="80" height="45" rx="6" fill="#f4f7ff" stroke="#1a1a28" stroke-width="2"/><circle cx="100" cy="75" r="8" fill="#00ffff"/><circle cx="140" cy="75" r="8" fill="#ff00ff"/>` },
    { file: "stage-2-village.svg", label: "Word Town", sky: "#e0f0ff", ground: "#88aa88", sun: "#ffff00", extra: `<rect x="60" y="58" width="36" height="42" fill="#ffff00" stroke="#1a1a28" stroke-width="2"/><rect x="110" y="50" width="40" height="50" fill="#00ffff" stroke="#1a1a28" stroke-width="2"/>` },
    { file: "stage-3-castle.svg", label: "Pattern Castle", sky: "#d8c8ff", ground: "#8899aa", sun: "#b14dff", extra: `<rect x="85" y="40" width="70" height="60" fill="#b14dff" stroke="#1a1a28" stroke-width="2"/><text x="120" y="78" text-anchor="middle" font-size="18" fill="#ffff00" font-weight="700">abc</text>` }
  ],
  math: [
    { file: "stage-0-clearing.svg", label: "Clearing", sky: "#c8ffe0", ground: "#66bb6a", sun: "#ffff00", extra: `<circle cx="80" cy="85" r="8" fill="#ff8c00" stroke="#1a1a28" stroke-width="2"/><circle cx="110" cy="85" r="8" fill="#ff8c00" stroke="#1a1a28" stroke-width="2"/><circle cx="140" cy="85" r="8" fill="#ff8c00" stroke="#1a1a28" stroke-width="2"/>` },
    { file: "stage-1-forest.svg", label: "Count Forest", sky: "#b0e8ff", ground: "#2d8a4e", sun: "#ffff00", extra: `<text x="120" y="78" text-anchor="middle" font-size="28" fill="#1a1a28" font-weight="700">123</text>` },
    { file: "stage-2-village.svg", label: "Number Village", sky: "#d0e8ff", ground: "#88aa66", sun: "#ffff00", extra: `<rect x="75" y="55" width="90" height="45" rx="8" fill="#f4f7ff" stroke="#1a1a28" stroke-width="2"/><text x="120" y="85" text-anchor="middle" font-size="20" fill="#00b8b8" font-weight="700">+ −</text>` },
    { file: "stage-3-peaks.svg", label: "Equation Peaks", sky: "#a8c8ff", ground: "#668899", sun: "#00ffff", extra: `<path d="M40 100 L80 40 L120 100" fill="#b9c0d4" stroke="#1a1a28" stroke-width="2"/><path d="M100 100 L150 30 L200 100" fill="#8899aa" stroke="#1a1a28" stroke-width="2"/><text x="150" y="70" text-anchor="middle" font-size="16" fill="#ffff00" font-weight="700">x=</text>` }
  ]
};

Object.keys(stageSets).forEach(function (world) {
  stageSets[world].forEach(function (s) {
    write(`images/worlds/${world}/${s.file}`, stageSvg(s.label, s));
  });
});

write(
  "images/ui/sparkle.svg",
  svg(64, 64, `  <path d="M32 4 L36 28 L60 32 L36 36 L32 60 L28 36 L4 32 L28 28 Z" fill="#ffff00" stroke="#1a1a28" stroke-width="2"/>`)
);
write(
  "images/badges/star-badge.svg",
  svg(64, 64, `  <circle cx="32" cy="32" r="28" fill="#ff8c00" stroke="#1a1a28" stroke-width="3"/>
  <path d="M32 12 L36 26 L50 26 L39 34 L43 48 L32 40 L21 48 L25 34 L14 26 L28 26 Z" fill="#ffff00" stroke="#1a1a28" stroke-width="2"/>`)
);

// gitkeeps for empty audio subject dirs
["reading", "spelling", "math"].forEach(function (w) {
  write(`audio/${w}/.gitkeep`, "");
});

console.log("SVGs generated under docs/assets/");
