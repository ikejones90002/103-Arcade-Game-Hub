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
    characters: BASE + "manifests/characters.json",
    audio: BASE + "manifests/audio.json",
    ui: BASE + "manifests/ui.json",
    voice: BASE + "manifests/voice-script.json"
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

  const voiceById = {};

  const voiceByText = {};
  const LETTER_PHONEME = {
    A: "phoneme-short-a", B: "phoneme-b", C: "phoneme-c-k", D: "phoneme-d",
    E: "phoneme-short-e", F: "phoneme-f", G: "phoneme-g", H: "phoneme-h",
    I: "phoneme-short-i", J: "phoneme-j", K: "phoneme-k", L: "phoneme-l",
    M: "phoneme-m", N: "phoneme-n", O: "phoneme-short-o", P: "phoneme-p",
    Q: "phoneme-q", R: "phoneme-r", S: "phoneme-s", T: "phoneme-t",
    U: "phoneme-short-u", V: "phoneme-v", W: "phoneme-w", X: "phoneme-x",
    Y: "phoneme-y", Z: "phoneme-z"
  };
  const SOUND_TOKEN = {
    aaa: "phoneme-short-a", "ă": "phoneme-short-a", ae: "phoneme-short-a",
    eh: "phoneme-short-e", "ĕ": "phoneme-short-e",
    ih: "phoneme-short-i", "ĭ": "phoneme-short-i",
    ah: "phoneme-short-o", "ŏ": "phoneme-short-o",
    uh: "phoneme-short-u", "ŭ": "phoneme-short-u",
    ay: "phoneme-long-a", "ā": "phoneme-long-a",
    ee: "phoneme-long-e", "ē": "phoneme-long-e",
    eye: "phoneme-long-i", "ī": "phoneme-long-i",
    oh: "phoneme-long-o", "ō": "phoneme-long-o",
    yoo: "phoneme-long-u", "ū": "phoneme-long-u",
    buh: "phoneme-b", kuh: "phoneme-c-k", k: "phoneme-c-k", duh: "phoneme-d",
    fff: "phoneme-f", f: "phoneme-f", guh: "phoneme-g", huh: "phoneme-h", h: "phoneme-h",
    juh: "phoneme-j", lll: "phoneme-l", l: "phoneme-l", mmm: "phoneme-m", m: "phoneme-m",
    nnn: "phoneme-n", n: "phoneme-n", puh: "phoneme-p", p: "phoneme-p",
    kwuh: "phoneme-q", kw: "phoneme-q", rrr: "phoneme-r", r: "phoneme-r",
    sss: "phoneme-s", s: "phoneme-s", tuh: "phoneme-t", t: "phoneme-t",
    vvv: "phoneme-v", v: "phoneme-v", wuh: "phoneme-w", w: "phoneme-w",
    ks: "phoneme-x", x: "phoneme-x", yuh: "phoneme-y", y: "phoneme-y",
    zzz: "phoneme-z", z: "phoneme-z", shh: "phoneme-sh", sh: "phoneme-sh",
    ch: "phoneme-ch", th: "phoneme-th-unvoiced", ng: "phoneme-ng",
    ph: "phoneme-ph", ck: "phoneme-ck", b: "phoneme-b", d: "phoneme-d",
    g: "phoneme-g", j: "phoneme-j", a: "phoneme-short-a", e: "phoneme-short-e",
    i: "phoneme-short-i", o: "phoneme-short-o", u: "phoneme-short-u"
  };

  function ingestVoice(data) {
    if (!data || !Array.isArray(data.clips)) return;
    data.clips.forEach(function (clip) {
      if (!clip || !clip.id) return;
      voiceById[clip.id] = clip;
      const key = String(clip.text || "").trim().toLowerCase();
      if (key && String(clip.kind).indexOf("word-") === 0 && !voiceByText[key]) {
        voiceByText[key] = clip.id;
      }
    });
  }

  function ingest(data) {
    if (!data) return;
    if (Array.isArray(data.clips) && !data.items) {
      ingestVoice(data);
      return;
    }
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
    tick: function () { tone(1000, 0.03, "square", 0.03); },
    "owl-stinger": function () { tone(392, 0.12, "sine", 0.05); tone(330, 0.18, "sine", 0.045, 0.12); },
    "bee-stinger": function () { tone(988, 0.05, "triangle", 0.03); tone(1174, 0.07, "triangle", 0.03, 0.05); tone(784, 0.14, "sine", 0.05, 0.12); },
    "turtle-stinger": function () { tone(196, 0.16, "triangle", 0.05); tone(247, 0.2, "triangle", 0.05, 0.14); }
  };

  const ALIAS = { wrong: "error-soft" };
  const audioCache = {};
  let bedEl = null;
  let bedNodes = null;
  let bedId = null;

  function itemVolume(item, fallback) {
    if (item && typeof item.volume === "number") return item.volume;
    return fallback;
  }

  function playFile(url, volume, opts) {
    opts = opts || {};
    try {
      let a = audioCache[url];
      if (!a) {
        a = new Audio(url);
        audioCache[url] = a;
      }
      let failed = false;
      function failOnce() {
        if (failed) return;
        failed = true;
        if (opts.onFail) opts.onFail();
      }
      a.loop = !!opts.loop;
      a.onerror = failOnce;
      a.pause();
      try { a.currentTime = 0; } catch (e) {}
      a.volume = volume == null ? 0.8 : Math.max(0, Math.min(1, volume));
      const p = a.play();
      if (p && p.catch) p.catch(failOnce);
      return true;
    } catch (e) {
      if (opts.onFail) opts.onFail();
      return false;
    }
  }

  function playSynth(id) {
    if (SYNTH[id]) SYNTH[id]();
  }

  function stopBed() {
    if (bedEl) {
      try { bedEl.pause(); } catch (e) {}
      bedEl = null;
    }
    if (bedNodes) {
      bedNodes.forEach(function (node) {
        try { if (node.stop) node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      bedNodes = null;
    }
    bedId = null;
  }

  function startSynthBed(id, volume) {
    if (bedNodes) return;
    const ctx = getCtx();
    if (!ctx || muted) return;
    const spec = {
      "hub-bed": { a: 196, b: 392, type: "sine", filter: 1200 },
      "reading-bed": { a: 174.6, b: 220, type: "sine", filter: 900 },
      "spelling-bed": { a: 220, b: 277.2, type: "triangle", filter: 1100 },
      "math-bed": { a: 164.8, b: 246.9, type: "sine", filter: 1400 }
    }[id] || { a: 196, b: 247, type: "sine", filter: 1000 };
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = spec.filter;
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0.02, (volume || 0.45) * 0.07);
    function osc(freq, detune) {
      const o = ctx.createOscillator();
      o.type = spec.type;
      o.frequency.value = freq;
      o.detune.value = detune || 0;
      o.connect(filter);
      o.start();
      return o;
    }
    const o1 = osc(spec.a, 0);
    const o2 = osc(spec.b, 6);
    filter.connect(gain);
    gain.connect(ctx.destination);
    bedNodes = [o1, o2, filter, gain];
  }

  function playBed(id) {
    if (muted) return;
    const resolved = ALIAS[id] || id;
    if (bedId === resolved && (bedEl || bedNodes)) return;
    stopBed();
    bedId = resolved;
    const item = byId[resolved];
    const url = item && item.path ? toUrl(item.path) : null;
    const vol = itemVolume(item, 0.45);
    if (!url) {
      startSynthBed(resolved, vol);
      return;
    }
    const a = new Audio(url);
    a.loop = true;
    a.volume = vol;
    function fallback() {
      if (bedEl === a) bedEl = null;
      try { a.pause(); } catch (e) {}
      startSynthBed(resolved, vol);
    }
    a.onerror = fallback;
    const p = a.play();
    if (p && p.catch) p.catch(fallback);
    bedEl = a;
  }

  let voiceEl = null;

  function stopVoice() {
    if (voiceEl) {
      try { voiceEl.pause(); } catch (e) {}
      voiceEl.onended = null;
      voiceEl.onerror = null;
      voiceEl = null;
    }
    if (global.speechSynthesis) {
      try { speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function speakText(text) {
    if (muted || !text || !global.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.lang = "en-US";
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function wordSlug(raw) {
    let s = String(raw || "").trim().toLowerCase();
    if (s === "they're" || s === "they’re") return "theyre";
    return s.replace(/[^a-z0-9]/g, "");
  }

  function clipIdForWord(raw) {
    const slug = wordSlug(raw);
    if (!slug) return null;
    if (voiceById["word-" + slug]) return "word-" + slug;
    const byText = voiceByText[String(raw || "").trim().toLowerCase()];
    return byText || null;
  }

  function isSoundItem(opts) {
    return opts && (opts.type === "sound" || opts.kind === "sound" || opts.skill === "letterSounds");
  }

  function isLetterItem(opts) {
    return opts && (opts.type === "letter" || opts.kind === "letter" || opts.skill === "letterRecognition");
  }

  function planVoice(idOrText, opts) {
    opts = opts || {};
    const ids = [];
    function push(id) {
      if (id && voiceById[id] && ids.indexOf(id) === -1) ids.push(id);
    }

    if (opts.voiceId) push(opts.voiceId);
    if (ids.length) return ids;

    const raw = String(idOrText || "").trim();
    if (!raw) return ids;
    if (voiceById[raw]) {
      push(raw);
      return ids;
    }

    const lower = raw.toLowerCase();
    let m = lower.match(/^find the letter\s+([a-z])$/);
    if (m) {
      push("stem-find-letter");
      push("letter-name-" + m[1]);
      return ids;
    }
    m = lower.match(/^build the word\s+(.+)$/);
    if (m) {
      push("stem-build-word");
      push(clipIdForWord(m[1]));
      return ids;
    }
    m = lower.match(/^spell:?\s+(.+)$/);
    if (m) {
      push("stem-spell");
      push(clipIdForWord(m[1]));
      return ids;
    }
    m = lower.match(/^what letter starts\s+(.+?)\??$/);
    if (m) {
      push("stem-which-letter-starts");
      push(clipIdForWord(m[1]));
      return ids;
    }
    m = lower.match(/^the sound\s+(.+)$/) || lower.match(/^which letter makes the sound\s+(.+?)\??$/);
    if (m) {
      push("stem-the-sound");
      const letter = String(opts.answer || opts.key || "").replace(/[^A-Za-z]/g, "").charAt(0);
      if (letter) push(LETTER_PHONEME[letter.toUpperCase()]);
      else push(SOUND_TOKEN[m[1].trim().toLowerCase()]);
      return ids;
    }

    if (/^[A-Za-z]$/.test(raw)) {
      const L = raw.toUpperCase();
      if (isSoundItem(opts)) push(LETTER_PHONEME[L]);
      else if (isLetterItem(opts)) push("letter-name-" + raw.toLowerCase());
      else if (opts.skill === "letterSounds") push(LETTER_PHONEME[L]);
      else {
        const asWord = clipIdForWord(raw);
        if (asWord && (opts.type === "sprint" || opts.type === "spell" || opts.type === "picture" || opts.type === "build")) push(asWord);
        else push("letter-name-" + raw.toLowerCase());
      }
      return ids;
    }

    if (isSoundItem(opts) && SOUND_TOKEN[lower]) {
      push(SOUND_TOKEN[lower]);
      return ids;
    }

    const wordId = clipIdForWord(raw);
    if (wordId) {
      push(wordId);
      return ids;
    }

    if (SOUND_TOKEN[lower]) push(SOUND_TOKEN[lower]);
    return ids;
  }

  function playVoiceFile(url, onEnded, onFail) {
    const a = new Audio(url);
    voiceEl = a;
    a.volume = 1;
    let failed = false;
    function fail() {
      if (failed) return;
      failed = true;
      if (voiceEl === a) voiceEl = null;
      if (onFail) onFail();
    }
    a.onerror = fail;
    a.onended = function () {
      if (voiceEl === a) voiceEl = null;
      if (onEnded) onEnded();
    };
    const p = a.play();
    if (p && p.catch) p.catch(fail);
  }

  function playClipSequence(ids, fallbackText) {
    function next(i) {
      if (i >= ids.length) return;
      const clip = voiceById[ids[i]];
      const url = clip && clip.path ? toUrl(clip.path) : null;
      if (!url) {
        next(i + 1);
        return;
      }
      playVoiceFile(url, function () { next(i + 1); }, function () {
        if (i === 0 && fallbackText) speakText(fallbackText);
        else next(i + 1);
      });
    }
    next(0);
  }

  function playVoice(idOrText, opts) {
    if (muted) return;
    stopVoice();
    const ids = planVoice(idOrText, opts);
    if (ids.length) {
      playClipSequence(ids, idOrText);
      return;
    }
    speakText(idOrText);
  }

  function play(id) {
    if (muted) return;
    const resolved = ALIAS[id] || id;
    const item = byId[resolved];
    if (item && item.loop) {
      playBed(resolved);
      return;
    }
    const url = item && item.path ? toUrl(item.path) : null;
    const vol = itemVolume(item, resolved === "tick" ? 0.55 : resolved === "error-soft" ? 0.45 : 0.85);
    if (url) {
      playFile(url, vol, { onFail: function () { playSynth(resolved); } });
      return;
    }
    playSynth(resolved);
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

  const MASCOT_BY_WORLD = {
    reading: "reading-owl",
    spelling: "spelling-bee",
    math: "math-turtle"
  };

  function mountCharacter(el, characterId, opts) {
    opts = opts || {};
    if (!el) return;
    clearEl(el);
    el.classList.add("asset-mascot");
    const item = byId[characterId];
    if (!item || !item.path) {
      el.textContent = (item && item.fallbackEmoji) || "✨";
      el.classList.add("asset-mascot--fallback");
      return;
    }
    const img = document.createElement("img");
    img.src = toUrl(item.path);
    img.alt = item.name || characterId;
    img.className = "asset-mascot-img";
    if (opts.mood) img.dataset.mood = opts.mood;
    img.draggable = false;
    el.appendChild(img);
  }

  function mountWorldMascot(el, worldKey, opts) {
    const id = MASCOT_BY_WORLD[worldKey] || MASCOT_BY_WORLD.spelling;
    const pose = (opts && opts.pose) || "idle";
    const posed = id + "-" + pose;
    if (byId[posed]) mountCharacter(el, posed, opts);
    else mountCharacter(el, id, opts);
  }

  function mountWorldLayer(el, layerId) {
    if (!el) return;
    clearEl(el);
    el.classList.add("world-layer");
    const item = byId[layerId];
    const url = item && item.path ? toUrl(item.path) : null;
    if (!url) {
      el.classList.add("world-layer--missing");
      return;
    }
    el.style.backgroundImage = "url('" + url + "')";
    el.setAttribute("data-layer", layerId);
  }

  /** Build a stacked scene inside el from ordered layer IDs or shorthand keys. */
  function mountWorldScene(el, worldKey, layerKeys) {
    if (!el) return;
    clearEl(el);
    el.classList.add("world-scene");
    el.setAttribute("data-world", worldKey);
    const keys = layerKeys || ["sky", "mountains", "forest", "castle", "foreground"];
    keys.forEach(function (key, i) {
      const id = key.indexOf(worldKey + "-") === 0 ? key : worldKey + "-" + key;
      const layer = document.createElement("div");
      layer.className = "world-scene-layer world-scene-layer--" + key.replace(/^.*-/, "");
      layer.style.zIndex = String(i + 1);
      mountWorldLayer(layer, id);
      el.appendChild(layer);
    });
  }

  const VFX = {
    "success-sparkle": "fx-sparkle-success",
    "soft-error-puff": "fx-soft-miss-puff",
    "level-unlock": "fx-unlock-glow",
    celebration: "fx-celebrate-burst",
    "flower-bloom": "fx-flower-bloom",
    "letter-pop": "fx-letter-pop"
  };

  function resolveVfx(name) {
    const id = VFX[name] || name;
    const item = byId[id];
    if (item && item.path) return toUrl(item.path);
    // direct path fallback for crops
    const map = {
      "fx-sparkle-success": "ui/vfx/fx-sparkle-success.png",
      "fx-soft-miss-puff": "ui/vfx/fx-soft-miss-puff.png",
      "fx-unlock-glow": "ui/vfx/fx-unlock-glow.png",
      "fx-celebrate-burst": "ui/vfx/fx-celebrate-burst.png",
      "fx-flower-bloom": "ui/vfx/fx-flower-bloom.png",
      "fx-letter-pop": "ui/vfx/fx-letter-pop.png"
    };
    const rel = map[id];
    return rel ? BASE.replace(/\/?$/, "/") + rel : null;
  }

  function playVfx(hostEl, name, opts) {
    opts = opts || {};
    if (!hostEl) return;
    const url = resolveVfx(name);
    if (!url) return;
    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.className = "arcade-vfx " + (opts.className || "");
    img.style.left = (opts.left != null ? opts.left : 20 + Math.random() * 55) + "%";
    img.style.bottom = (opts.bottom != null ? opts.bottom : 10 + Math.random() * 35) + "%";
    hostEl.appendChild(img);
    setTimeout(function () { if (img.parentNode) img.parentNode.removeChild(img); }, opts.ms || 1000);
  }

  function setMuted(on) {
    muted = !!on;
    if (muted) {
      stopBed();
      stopVoice();
      Object.keys(audioCache).forEach(function (url) {
        try { audioCache[url].pause(); } catch (e) {}
      });
    }
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
    playBed: playBed,
    stopBed: stopBed,
    playVoice: playVoice,
    stopVoice: stopVoice,
    setMuted: setMuted,
    isMuted: isMuted,
    mountAvatar: mountAvatar,
    mountCompanion: mountCompanion,
    mountCharacter: mountCharacter,
    mountWorldMascot: mountWorldMascot,
    mountWorldLayer: mountWorldLayer,
    mountWorldScene: mountWorldScene,
    playVfx: playVfx,
    resolveVfx: resolveVfx,
    getWorldStageArt: getWorldStageArt,
    mountWorldStage: mountWorldStage,
    MASCOT_BY_WORLD: MASCOT_BY_WORLD,
    VFX: VFX,
    _byId: byId
  };

  // Thin alias matching Phase 2 wiring script naming
  global.ArcadeVFX = {
    initialize: function () { /* manifests load via ArcadeAssets */ },
    play: function (host, name, opts) { playVfx(host, name, opts); }
  };
})(typeof window !== "undefined" ? window : globalThis);
