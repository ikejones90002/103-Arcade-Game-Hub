/* 103 Arcade shared asset loader — ID-based visuals + SFX (not a game engine) */
(function (global) {
  "use strict";

  const BASE = (function () {
    try {
      const scripts = document.getElementsByTagName("script");
      for (let i = scripts.length - 1; i >= 0; i--) {
        const src = scripts[i].src || "";
        if (src.indexOf("arcade-assets.js") !== -1) {
          return src.replace(/arcade-assets\.js.*$/, "") + "assets/";
        }
      }
    } catch (e) {}
    return "assets/";
  })();

  const MANIFEST_URLS = {
    avatars: BASE + "manifests/avatars.json",
    companions: BASE + "manifests/companions.json",
    worlds: BASE + "manifests/worlds.json",
    audio: BASE + "manifests/audio.json",
    ui: BASE + "manifests/ui.json"
  };

  let ready = false;
  let readyPromise = null;
  const byId = {};
  const worldStages = { reading: [], spelling: [], math: [] };
  let audioCtx = null;
  let muted = false;

  function toUrl(manifestPath) {
    if (!manifestPath) return null;
    if (/^https?:\/\//i.test(manifestPath)) return null; // never hotlink
    if (manifestPath.indexOf("/assets/") === 0) {
      return BASE.replace(/\/?$/, "/") + manifestPath.replace(/^\/assets\//, "");
    }
    return manifestPath;
  }

  function indexItem(item) {
    if (!item || !item.id) return;
    byId[item.id] = item;
  }

  function ingest(data) {
    if (!data) return;
    if (Array.isArray(data.items)) data.items.forEach(indexItem);
    if (data.worlds) {
      Object.keys(data.worlds).forEach(function (key) {
        worldStages[key] = data.worlds[key] || [];
        worldStages[key].forEach(indexItem);
      });
    }
  }

  function loadManifests() {
    if (readyPromise) return readyPromise;
    readyPromise = Promise.all(
      Object.keys(MANIFEST_URLS).map(function (key) {
        return fetch(MANIFEST_URLS[key])
          .then(function (r) {
            if (!r.ok) throw new Error(key);
            return r.json();
          })
          .then(ingest)
          .catch(function () {
            /* offline / missing — synth + emoji fallbacks still work */
          });
      })
    ).then(function () {
      ready = true;
      return true;
    });
    return readyPromise;
  }

  function resolve(id) {
    const item = byId[id];
    if (!item) return null;
    return toUrl(item.path);
  }

  function get(id) {
    return byId[id] || null;
  }

  function getCtx() {
    const Ctx = global.AudioContext || global.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  }

  function tone(freq, duration, type, gain, startAt) {
    const ctx = getCtx();
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + (startAt || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.06, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  const SYNTH = {
    click: function () { tone(880, 0.05, "triangle", 0.05); },
    select: function () { tone(988, 0.07, "triangle", 0.05); tone(1319, 0.08, "sine", 0.04, 0.05); },
    back: function () { tone(523, 0.06, "triangle", 0.04); },
    open: function () { tone(440, 0.08, "sine", 0.05); tone(660, 0.1, "sine", 0.05, 0.06); },
    close: function () { tone(660, 0.06, "sine", 0.04); tone(440, 0.08, "sine", 0.04, 0.05); },
    almost: function () { tone(392, 0.1, "triangle", 0.05); tone(494, 0.12, "triangle", 0.05, 0.08); },
    hint: function () { tone(740, 0.1, "sine", 0.05); },
    "try-again": function () { tone(330, 0.1, "triangle", 0.05); tone(294, 0.12, "triangle", 0.05, 0.08); },
    streak: function () { tone(784, 0.08, "sine", 0.05); tone(988, 0.1, "sine", 0.05, 0.08); tone(1174, 0.12, "sine", 0.05, 0.16); },
    mastery: function () { tone(523, 0.12, "square", 0.04); tone(659, 0.14, "square", 0.04, 0.1); tone(784, 0.18, "square", 0.04, 0.22); },
    star: function () { tone(880, 0.1, "sine", 0.05); tone(1320, 0.14, "sine", 0.05, 0.08); },
    xp: function () { tone(660, 0.08, "triangle", 0.05); tone(880, 0.1, "triangle", 0.05, 0.06); },
    unlock: function () { tone(392, 0.1, "sine", 0.05); tone(523, 0.12, "sine", 0.05, 0.1); tone(784, 0.16, "sine", 0.05, 0.22); },
    companion: function () { tone(587, 0.1, "sine", 0.05); tone(740, 0.12, "sine", 0.05, 0.1); tone(880, 0.14, "sine", 0.05, 0.2); },
    badge: function () { tone(698, 0.12, "triangle", 0.05); tone(880, 0.14, "triangle", 0.05, 0.1); },
    "level-up": function () { tone(523, 0.1, "square", 0.04); tone(659, 0.1, "square", 0.04, 0.1); tone(784, 0.12, "square", 0.04, 0.2); tone(1046, 0.18, "square", 0.04, 0.32); },
    reward: function () { tone(659, 0.1, "sine", 0.05); tone(831, 0.14, "sine", 0.05, 0.1); },
    complete: function () { tone(523, 0.12, "square", 0.04); tone(784, 0.18, "square", 0.04, 0.14); },
    sparkle: function () { tone(784, 0.1, "sine", 0.05); tone(1174, 0.14, "sine", 0.05, 0.08); },
    magic: function () { tone(440, 0.12, "sine", 0.04); tone(660, 0.14, "sine", 0.04, 0.1); tone(880, 0.16, "sine", 0.04, 0.2); },
    fanfare: function () { tone(523, 0.12, "square", 0.04); tone(659, 0.12, "square", 0.04, 0.12); tone(784, 0.2, "square", 0.04, 0.24); },
    life: function () { tone(330, 0.12, "triangle", 0.05); tone(220, 0.16, "triangle", 0.05, 0.1); },
    buzz: function () { tone(180, 0.08, "sawtooth", 0.03); },
    wrongBuzz: function () { tone(140, 0.16, "sawtooth", 0.04); },
    "boss-intro": function () { tone(196, 0.16, "sawtooth", 0.04); tone(247, 0.18, "triangle", 0.04, 0.14); },
    "boss-success": function () { tone(523, 0.12, "square", 0.04); tone(784, 0.16, "square", 0.04, 0.12); tone(1046, 0.2, "square", 0.04, 0.26); },
    "boss-retry": function () { tone(294, 0.12, "triangle", 0.05); tone(247, 0.14, "triangle", 0.05, 0.1); },
    create: function () { tone(587, 0.08, "sine", 0.05); tone(740, 0.1, "sine", 0.05, 0.06); },
    save: function () { tone(659, 0.1, "triangle", 0.05); tone(523, 0.12, "triangle", 0.05, 0.08); },
    discover: function () { tone(440, 0.1, "sine", 0.05); tone(554, 0.12, "sine", 0.05, 0.08); tone(659, 0.14, "sine", 0.05, 0.16); },
    correct: function () { tone(660, 0.08, "sine", 0.05); tone(880, 0.12, "sine", 0.05, 0.06); },
    "error-soft": function () { tone(220, 0.14, "triangle", 0.05); },
    tick: function () { tone(1000, 0.03, "square", 0.03); }
  };

  const audioCache = {};

  function playFile(url, volume) {
    try {
      let a = audioCache[url];
      if (!a) {
        a = new Audio(url);
        audioCache[url] = a;
      }
      a.pause();
      a.currentTime = 0;
      a.volume = volume == null ? 0.8 : volume;
      const p = a.play();
      if (p && p.catch) p.catch(function () {});
      return true;
    } catch (e) {
      return false;
    }
  }

  function play(id) {
    if (muted) return;
    const item = byId[id];
    const url = item && item.path ? toUrl(item.path) : null;
    if (url && playFile(url, id === "tick" ? 0.55 : id === "error-soft" ? 0.45 : 0.85)) {
      return;
    }
    // aliases used by shells
    const alias = {
      wrong: "error-soft",
      wrongBuzz: "wrongBuzz"
    };
    const synthId = alias[id] || id;
    if (SYNTH[synthId]) SYNTH[synthId]();
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function layerImg(src, z, className) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.draggable = false;
    img.className = className || "asset-layer";
    img.style.zIndex = String(z);
    return img;
  }

  function mountAvatar(el, parts) {
    if (!el) return;
    clearEl(el);
    el.classList.add("asset-avatar");
    const p = parts || {};
    const bodyId = p.body || "child-01";
    const hairId = p.hair || "hair-01";
    const outfitId = p.outfit === "starter" ? "explorer" : (p.outfit || "explorer");
    const accessoryId = p.accessory || "";
    const stack = [
      { id: bodyId, z: 1 },
      { id: outfitId, z: 2 },
      { id: hairId, z: 3 },
      { id: accessoryId, z: 4 }
    ];
    let any = false;
    stack.forEach(function (layer) {
      if (!layer.id) return;
      const url = resolve(layer.id);
      if (!url) return;
      el.appendChild(layerImg(url, layer.z));
      any = true;
    });
    if (!any) {
      const span = document.createElement("span");
      span.className = "emoji";
      span.textContent = "🧒";
      el.appendChild(span);
    }
  }

  function mountCompanion(el, companionId, fallbackEmoji) {
    if (!el) return;
    clearEl(el);
    el.classList.add("asset-companion");
    const item = byId[companionId];
    const url = resolve(companionId);
    if (url) {
      const img = layerImg(url, 1, "asset-companion-img");
      img.alt = (item && item.name) || companionId || "Companion";
      el.appendChild(img);
      return;
    }
    const span = document.createElement("span");
    span.className = "emoji";
    span.textContent = (item && item.fallbackEmoji) || fallbackEmoji || "✨";
    el.appendChild(span);
  }

  function getWorldStageArt(worldKey, stageIndex) {
    const list = worldStages[worldKey] || [];
    if (!list.length) return null;
    const idx = Math.max(0, Math.min(list.length - 1, stageIndex || 0));
    const item = list[idx] || list[0];
    return item ? toUrl(item.path) : null;
  }

  function mountWorldStage(el, worldKey, stageIndex) {
    if (!el) return;
    clearEl(el);
    el.classList.add("asset-stage");
    const url = getWorldStageArt(worldKey, stageIndex);
    if (!url) {
      el.classList.add("hidden");
      return;
    }
    el.classList.remove("hidden");
    const img = document.createElement("img");
    img.src = url;
    img.alt = "World stage";
    img.className = "asset-stage-img";
    img.draggable = false;
    el.appendChild(img);
  }

  function setMuted(on) {
    muted = !!on;
  }

  function isMuted() {
    return muted;
  }

  // Eager load when DOM available
  if (typeof document !== "undefined") {
    loadManifests();
  }

  global.ArcadeAssets = {
    BASE: BASE,
    ready: function () { return ready; },
    load: loadManifests,
    resolve: resolve,
    get: get,
    play: play,
    setMuted: setMuted,
    isMuted: isMuted,
    mountAvatar: mountAvatar,
    mountCompanion: mountCompanion,
    getWorldStageArt: getWorldStageArt,
    mountWorldStage: mountWorldStage,
    _byId: byId
  };
})(typeof window !== "undefined" ? window : globalThis);
