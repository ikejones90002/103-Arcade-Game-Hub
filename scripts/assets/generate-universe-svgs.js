/**
 * Generate Phase-1 universe vignettes: world cards, bee/owl/turtle, spelling meadow layers.
 * Run: node scripts/assets/generate-universe-svgs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "docs", "assets");

function write(rel, body) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body.trim() + "\n");
}

function svg(w, h, inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${inner}
</svg>`;
}

// --- World hub cards ---
write(
  "worlds/reading/environments/hub-card.svg",
  svg(
    480,
    320,
    `  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7ec8ff"/>
      <stop offset="100%" stop-color="#3a7bd5"/>
    </linearGradient>
  </defs>
  <rect width="480" height="320" fill="url(#sky)"/>
  <ellipse cx="240" cy="300" rx="260" ry="60" fill="#3d8b5a"/>
  <path d="M280 200 L320 120 L360 200 Z" fill="#e8f4ff" stroke="#1a3a5c" stroke-width="3"/>
  <rect x="300" y="160" width="80" height="90" fill="#cfe8ff" stroke="#1a3a5c" stroke-width="3"/>
  <rect x="318" y="110" width="18" height="50" fill="#cfe8ff" stroke="#1a3a5c" stroke-width="2"/>
  <rect x="348" y="110" width="18" height="50" fill="#cfe8ff" stroke="#1a3a5c" stroke-width="2"/>
  <rect x="90" y="210" width="70" height="18" rx="3" fill="#f4c95f" stroke="#1a3a5c" stroke-width="2"/>
  <rect x="100" y="192" width="70" height="18" rx="3" fill="#ffe08a" stroke="#1a3a5c" stroke-width="2"/>
  <ellipse cx="150" cy="175" rx="42" ry="36" fill="#c4a574" stroke="#1a3a5c" stroke-width="3"/>
  <circle cx="150" cy="145" r="28" fill="#c4a574" stroke="#1a3a5c" stroke-width="3"/>
  <circle cx="140" cy="142" r="4" fill="#1a3a5c"/>
  <circle cx="160" cy="142" r="4" fill="#1a3a5c"/>
  <path d="M138 155 Q150 162 162 155" stroke="#1a3a5c" stroke-width="2" fill="none"/>
  <path d="M128 128 L140 108 L148 130" fill="#8d5524" stroke="#1a3a5c" stroke-width="2"/>
  <path d="M172 128 L160 108 L152 130" fill="#8d5524" stroke="#1a3a5c" stroke-width="2"/>
  <path d="M150 165 Q168 185 150 200 Q132 185 150 165" fill="#3a7bd5" stroke="#1a3a5c" stroke-width="2"/>`
  )
);

write(
  "worlds/spelling/environments/hub-card.svg",
  svg(
    480,
    320,
    `  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9ad4ff"/>
      <stop offset="55%" stop-color="#ffe6a8"/>
      <stop offset="100%" stop-color="#7dce82"/>
    </linearGradient>
  </defs>
  <rect width="480" height="320" fill="url(#sky2)"/>
  <ellipse cx="240" cy="310" rx="280" ry="55" fill="#5fbf66"/>
  <rect x="300" y="150" width="110" height="90" rx="8" fill="#f5d0a0" stroke="#6b3f1f" stroke-width="3"/>
  <path d="M290 150 L355 105 L420 150" fill="#e07a2f" stroke="#6b3f1f" stroke-width="3"/>
  <circle cx="120" cy="210" r="18" fill="#ff8c00"/>
  <circle cx="160" cy="220" r="14" fill="#ff00ff"/>
  <circle cx="200" cy="205" r="16" fill="#ffff00"/>
  <ellipse cx="200" cy="160" rx="38" ry="30" fill="#ffcc33" stroke="#1a1a28" stroke-width="3"/>
  <circle cx="200" cy="128" r="26" fill="#ffcc33" stroke="#1a1a28" stroke-width="3"/>
  <circle cx="192" cy="124" r="4" fill="#1a1a28"/>
  <circle cx="210" cy="124" r="4" fill="#1a1a28"/>
  <path d="M192 136 Q200 142 208 136" stroke="#1a1a28" stroke-width="2" fill="none"/>
  <ellipse cx="168" cy="130" rx="16" ry="8" fill="#87f0ff" opacity=".85" stroke="#1a1a28" stroke-width="2"/>
  <ellipse cx="232" cy="130" rx="16" ry="8" fill="#87f0ff" opacity=".85" stroke="#1a1a28" stroke-width="2"/>
  <rect x="230" y="155" width="44" height="44" rx="6" fill="#fff6d6" stroke="#1a1a28" stroke-width="3"/>
  <text x="252" y="186" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="28" font-weight="800" fill="#e07a2f">A</text>`
  )
);

write(
  "worlds/math/environments/hub-card.svg",
  svg(
    480,
    320,
    `  <defs>
    <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2b1b4d"/>
      <stop offset="50%" stop-color="#5b3d9e"/>
      <stop offset="100%" stop-color="#8ec5ff"/>
    </linearGradient>
  </defs>
  <rect width="480" height="320" fill="url(#sky3)"/>
  <ellipse cx="340" cy="120" rx="90" ry="28" fill="#6a4caf"/>
  <rect x="300" y="70" width="80" height="70" fill="#b9a7e0" stroke="#2b1b4d" stroke-width="3"/>
  <path d="M290 70 L340 35 L390 70" fill="#d4c4ff" stroke="#2b1b4d" stroke-width="3"/>
  <ellipse cx="140" cy="240" rx="70" ry="28" fill="#4a7c59"/>
  <ellipse cx="160" cy="210" rx="48" ry="34" fill="#32cd32" stroke="#1a3a28" stroke-width="3"/>
  <circle cx="160" cy="175" r="28" fill="#32cd32" stroke="#1a3a28" stroke-width="3"/>
  <circle cx="150" cy="172" r="4" fill="#1a3a28"/>
  <circle cx="170" cy="172" r="4" fill="#1a3a28"/>
  <path d="M150 185 Q160 192 170 185" stroke="#1a3a28" stroke-width="2" fill="none"/>
  <rect x="220" y="160" width="40" height="40" rx="6" fill="#7cf0ff" stroke="#1a1a28" stroke-width="2"/>
  <text x="240" y="188" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="800" fill="#1a1a28">1</text>
  <rect x="270" y="145" width="40" height="40" rx="6" fill="#ffd24d" stroke="#1a1a28" stroke-width="2"/>
  <text x="290" y="173" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="800" fill="#1a1a28">2</text>
  <rect x="320" y="175" width="40" height="40" rx="6" fill="#ff7bd5" stroke="#1a1a28" stroke-width="2"/>
  <text x="340" y="203" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="800" fill="#1a1a28">3</text>`
  )
);

// --- Canonical characters ---
write(
  "worlds/spelling/characters/spelling-bee.svg",
  svg(
    160,
    160,
    `  <ellipse cx="80" cy="145" rx="40" ry="8" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="48" cy="70" rx="22" ry="12" fill="#9ef0ff" opacity=".9" stroke="#1a1a28" stroke-width="2"/>
  <ellipse cx="112" cy="70" rx="22" ry="12" fill="#9ef0ff" opacity=".9" stroke="#1a1a28" stroke-width="2"/>
  <ellipse cx="80" cy="95" rx="40" ry="34" fill="#ffcc33" stroke="#1a1a28" stroke-width="3"/>
  <path d="M48 88 H112 M48 102 H112 M48 116 H112" stroke="#1a1a28" stroke-width="5" stroke-linecap="round"/>
  <circle cx="80" cy="58" r="28" fill="#ffcc33" stroke="#1a1a28" stroke-width="3"/>
  <circle cx="70" cy="55" r="5" fill="#1a1a28"/>
  <circle cx="92" cy="55" r="5" fill="#1a1a28"/>
  <circle cx="72" cy="53" r="1.5" fill="#fff"/>
  <circle cx="94" cy="53" r="1.5" fill="#fff"/>
  <path d="M72 68 Q80 74 88 68" stroke="#1a1a28" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M80 30 Q78 18 80 12" stroke="#1a1a28" stroke-width="2"/>
  <circle cx="80" cy="10" r="4" fill="#ff8c00" stroke="#1a1a28" stroke-width="1.5"/>`
  )
);

write(
  "worlds/reading/characters/reading-owl.svg",
  svg(
    160,
    160,
    `  <ellipse cx="80" cy="145" rx="40" ry="8" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="80" cy="100" rx="42" ry="38" fill="#c4a574" stroke="#1a3a5c" stroke-width="3"/>
  <circle cx="80" cy="58" r="32" fill="#c4a574" stroke="#1a3a5c" stroke-width="3"/>
  <circle cx="68" cy="55" r="5" fill="#1a3a5c"/>
  <circle cx="94" cy="55" r="5" fill="#1a3a5c"/>
  <path d="M70 70 Q80 78 90 70" stroke="#1a3a5c" stroke-width="2.5" fill="none"/>
  <path d="M55 40 L68 22 L74 42" fill="#8d5524" stroke="#1a3a5c" stroke-width="2"/>
  <path d="M105 40 L92 22 L86 42" fill="#8d5524" stroke="#1a3a5c" stroke-width="2"/>
  <path d="M80 78 Q100 100 80 118 Q60 100 80 78" fill="#3a7bd5" stroke="#1a3a5c" stroke-width="2"/>
  <rect x="108" y="100" width="28" height="20" rx="2" fill="#ffe08a" stroke="#1a3a5c" stroke-width="2"/>`
  )
);

write(
  "worlds/math/characters/math-turtle.svg",
  svg(
    160,
    160,
    `  <ellipse cx="80" cy="145" rx="44" ry="8" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="80" cy="100" rx="48" ry="32" fill="#2d8a4e" stroke="#1a3a28" stroke-width="3"/>
  <ellipse cx="80" cy="100" rx="34" ry="22" fill="#3cb371" stroke="#1a3a28" stroke-width="2"/>
  <circle cx="80" cy="58" r="28" fill="#32cd32" stroke="#1a3a28" stroke-width="3"/>
  <circle cx="70" cy="55" r="4.5" fill="#1a3a28"/>
  <circle cx="92" cy="55" r="4.5" fill="#1a3a28"/>
  <path d="M70 68 Q80 74 90 68" stroke="#1a3a28" stroke-width="2.5" fill="none"/>
  <text x="80" y="108" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="18" font-weight="800" fill="#ffff00">7</text>`
  )
);

// Spelling meadow layers for AbcBuzz / SpellBuzz
write(
  "worlds/spelling/environments/meadow-sky.svg",
  svg(
    800,
    480,
    `  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8ecfff"/>
      <stop offset="60%" stop-color="#ffe9b5"/>
      <stop offset="100%" stop-color="#9ad67a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#s)"/>
  <circle cx="650" cy="90" r="48" fill="#ffe566" opacity=".95"/>
  <ellipse cx="180" cy="90" rx="70" ry="28" fill="#fff" opacity=".55"/>
  <ellipse cx="400" cy="70" rx="90" ry="32" fill="#fff" opacity=".4"/>`
  )
);

write(
  "worlds/spelling/environments/meadow-hills.svg",
  svg(
    800,
    480,
    `  <ellipse cx="200" cy="420" rx="280" ry="90" fill="#5fbf66"/>
  <ellipse cx="560" cy="430" rx="320" ry="100" fill="#4eae55"/>
  <ellipse cx="400" cy="460" rx="420" ry="70" fill="#6dce73"/>
  <circle cx="120" cy="360" r="14" fill="#ff8c00"/>
  <circle cx="170" cy="350" r="12" fill="#ff00ff"/>
  <circle cx="220" cy="365" r="13" fill="#ffff00"/>
  <circle cx="620" cy="355" r="14" fill="#ff8c00"/>
  <circle cx="670" cy="370" r="11" fill="#b14dff"/>`
  )
);

write(
  "worlds/spelling/environments/meadow-village.svg",
  svg(
    800,
    480,
    `  <rect x="560" y="240" width="140" height="100" rx="8" fill="#f5d0a0" stroke="#6b3f1f" stroke-width="3"/>
  <path d="M545 240 L630 175 L715 240" fill="#e07a2f" stroke="#6b3f1f" stroke-width="3"/>
  <rect x="600" y="280" width="36" height="50" fill="#6b3f1f"/>
  <rect x="575" y="260" width="28" height="28" fill="#87f0ff" stroke="#6b3f1f" stroke-width="2"/>
  <rect x="655" y="260" width="28" height="28" fill="#87f0ff" stroke="#6b3f1f" stroke-width="2"/>
  <rect x="80" y="300" width="70" height="55" rx="6" fill="#ffe08a" stroke="#6b3f1f" stroke-width="2"/>
  <path d="M70 300 L115 265 L160 300" fill="#ff8c00" stroke="#6b3f1f" stroke-width="2"/>`
  )
);

write(
  "arcade/abcbuzz/letter-block.svg",
  svg(
    96,
    96,
    `  <rect x="8" y="8" width="80" height="80" rx="12" fill="#fff6d6" stroke="#1a1a28" stroke-width="4"/>
  <text id="letter" x="48" y="66" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="48" font-weight="800" fill="#e07a2f">A</text>`
  )
);

write(
  "arcade/abcbuzz/flower.svg",
  svg(
    64,
    64,
    `  <circle cx="32" cy="32" r="10" fill="#ffff00" stroke="#1a1a28" stroke-width="2"/>
  <circle cx="32" cy="14" r="10" fill="#ff00ff" stroke="#1a1a28" stroke-width="2"/>
  <circle cx="32" cy="50" r="10" fill="#ff8c00" stroke="#1a1a28" stroke-width="2"/>
  <circle cx="14" cy="32" r="10" fill="#00ffff" stroke="#1a1a28" stroke-width="2"/>
  <circle cx="50" cy="32" r="10" fill="#32cd32" stroke="#1a1a28" stroke-width="2"/>`
  )
);

["reading", "spelling", "math"].forEach(function (w) {
  write(`worlds/${w}/props/.gitkeep`, "");
  write(`worlds/${w}/effects/.gitkeep`, "");
});
["sentencequest", "rhymetime", "flipmatch", "patternpop"].forEach(function (a) {
  write(`arcade/${a}/.gitkeep`, "");
});

console.log("Universe SVGs written");
