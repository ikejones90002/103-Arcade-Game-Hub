/**
 * Validate asset manifests, files, IDs, and content references.
 * Run: node scripts/assets/validate.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const ASSETS = path.join(ROOT, "docs", "assets");
const MANIFESTS = path.join(ASSETS, "manifests");
const MAX_SVG = 80 * 1024;
const MAX_MP3 = 500 * 1024;

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error("ERROR:", msg);
  errors++;
}
function warn(msg) {
  console.warn("WARN:", msg);
  warnings++;
}
function ok(msg) {
  console.log("OK:", msg);
}

function readJson(name) {
  const p = path.join(MANIFESTS, name);
  if (!fs.existsSync(p)) {
    err("Missing manifest " + name);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function diskFromUrl(urlPath) {
  if (!urlPath) return null;
  if (/^https?:\/\//i.test(urlPath)) {
    err("Hotlink not allowed: " + urlPath);
    return null;
  }
  return path.join(ASSETS, urlPath.replace(/^\/assets\//, "").replace(/\//g, path.sep));
}

function checkFile(urlPath, maxBytes) {
  const disk = diskFromUrl(urlPath);
  if (!disk) return;
  if (!fs.existsSync(disk)) {
    err("File missing for " + urlPath);
    return;
  }
  const st = fs.statSync(disk);
  if (st.size > maxBytes) err("File too large (" + st.size + "): " + urlPath);
  const ext = path.extname(disk).toLowerCase();
  if (ext !== ".svg" && ext !== ".mp3" && ext !== ".json") {
    err("Unexpected extension: " + urlPath);
  }
}

const ids = new Set();
function trackId(id, where) {
  if (!id) {
    err("Empty id in " + where);
    return;
  }
  if (ids.has(id) && id !== "starter") {
    // starter aliases explorer — allow duplicate path but unique id needed
    // starter is a separate id pointing at explorer path — OK
  }
  if (ids.has(id)) {
    err("Duplicate id: " + id + " (" + where + ")");
  }
  ids.add(id);
}

const avatars = readJson("avatars.json");
const companions = readJson("companions.json");
const worlds = readJson("worlds.json");
const audio = readJson("audio.json");
const sources = readJson("sources.json");
const ui = readJson("ui.json");

function checkItems(list, label) {
  (list || []).forEach(function (item) {
    trackId(item.id, label);
    if (!item.name) warn(label + " " + item.id + " missing name");
    if (!item.category) warn(label + " " + item.id + " missing category");
    if (item.path) {
      checkFile(item.path, item.path.endsWith(".mp3") ? MAX_MP3 : MAX_SVG);
    }
    if (!sources || !sources.assets || !sources.assets[item.id]) {
      err("sources.json missing entry for " + item.id);
    }
  });
}

if (avatars) checkItems(avatars.items, "avatars");
if (companions) checkItems(companions.items, "companions");
if (ui) checkItems(ui.items, "ui");
if (audio) {
  audio.items.forEach(function (item) {
    trackId(item.id, "audio");
    if (item.path) checkFile(item.path, MAX_MP3);
    else if (!item.synth) warn("audio " + item.id + " has no path and no synth flag");
    if (!sources.assets[item.id]) err("sources.json missing audio " + item.id);
  });
}
if (worlds && worlds.worlds) {
  Object.keys(worlds.worlds).forEach(function (key) {
    checkItems(worlds.worlds[key], "worlds:" + key);
  });
}

// Content companion IDs must resolve
function extractCompanionIds(file) {
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/const COMPANIONS = (\[[\s\S]*?\]);/);
  if (!m) return [];
  try {
    // eslint-disable-next-line no-new-func
    return Function("return (" + m[1] + ")")().map(function (c) {
      return c.assetId || c.id;
    });
  } catch (e) {
    warn("Could not parse COMPANIONS in " + file + ": " + e.message);
    return [];
  }
}

[
  "docs/wordquest-content.js",
  "docs/spellbuzz-content.js",
  "docs/numbuzz-content.js"
].forEach(function (rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    warn("Content file missing: " + rel);
    return;
  }
  extractCompanionIds(full).forEach(function (id) {
    if (!ids.has(id) && !(companions && companions.items.some(function (c) { return c.id === id; }))) {
      err(rel + " companion assetId/id not in manifests: " + id);
    } else {
      ok(rel + " → companion " + id);
    }
  });
});

console.log("");
console.log("Validation complete. errors=" + errors + " warnings=" + warnings);
process.exitCode = errors ? 1 : 0;
