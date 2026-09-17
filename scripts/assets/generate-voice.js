/**
 * Generate learning-voice MP3s from docs/assets/manifests/voice-script.json.
 *
 * OpenAI (default, uses the same OPENAI_API_KEY as the coach):
 *   npm run assets:voice -- --dry-run
 *   npm run assets:voice -- --limit 5
 *   npm run assets:voice -- --ids word-cat,phoneme-short-a
 *   npm run assets:voice -- --group words --force
 *
 * ElevenLabs:
 *   npm run assets:voice -- --provider elevenlabs --voice-id YOUR_VOICE_ID
 *
 * Files land at docs/assets/audio/voice/{id}.mp3
 * ArcadeAssets.playVoice(id) picks them up automatically; TTS is the fallback.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const MANIFEST = path.join(ROOT, "docs", "assets", "manifests", "voice-script.json");
const OUT_DIR = path.join(ROOT, "docs", "assets", "audio", "voice");

const INSTRUCTIONS =
  "Warm adult American storyteller. Smile in the voice, never baby-talk. " +
  "Say only the given text. No extra words, no spelling the letters unless that is the text. " +
  "Clear preschool phonics. Medium pitch, gentle, confident. Dry studio, no music.";

/** Isolated phoneme respellings — tts-1 will mangle ă/ĕ/IPA. QC these first. */
const PHONEME_SAY = {
  "phoneme-short-a": "aaa",
  "phoneme-short-e": "eh",
  "phoneme-short-i": "ih",
  "phoneme-short-o": "ah",
  "phoneme-short-u": "uh",
  "phoneme-long-a": "ay",
  "phoneme-long-e": "ee",
  "phoneme-long-i": "eye",
  "phoneme-long-o": "oh",
  "phoneme-long-u": "yoo",
  "phoneme-b": "b",
  "phoneme-c-k": "k",
  "phoneme-d": "d",
  "phoneme-f": "fff",
  "phoneme-g": "g",
  "phoneme-h": "h",
  "phoneme-j": "j",
  "phoneme-k": "k",
  "phoneme-l": "lll",
  "phoneme-m": "mmm",
  "phoneme-n": "nnn",
  "phoneme-p": "p",
  "phoneme-q": "kw",
  "phoneme-r": "rrr",
  "phoneme-s": "sss",
  "phoneme-t": "t",
  "phoneme-v": "vvv",
  "phoneme-w": "w",
  "phoneme-x": "ks",
  "phoneme-y": "y",
  "phoneme-z": "zzz",
  "phoneme-sh": "shh",
  "phoneme-ch": "ch",
  "phoneme-th-unvoiced": "th",
  "phoneme-th-voiced": "th",
  "phoneme-wh": "wh",
  "phoneme-ng": "ng",
  "phoneme-ph": "fff",
  "phoneme-ck": "k"
};

function loadDotEnv() {
  [".env.local", ".env"].forEach(function (name) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) return;
    fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.charAt(0) === "#") return;
      const eq = trimmed.indexOf("=");
      if (eq < 1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
          (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  });
}

function parseArgs(argv) {
  const opts = {
    provider: "openai",
    model: "tts-1",
    voice: "shimmer",
    voiceId: "",
    speed: 0.85,
    delay: 250,
    dryRun: false,
    force: false,
    skipStems: false,
    ssml: false,
    limit: 0,
    ids: [],
    kind: "",
    group: ""
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = function () { return argv[++i]; };
    if (a === "--provider") opts.provider = next();
    else if (a === "--model") opts.model = next();
    else if (a === "--voice") opts.voice = next();
    else if (a === "--voice-id") opts.voiceId = next();
    else if (a === "--speed") opts.speed = Number(next());
    else if (a === "--delay") opts.delay = Number(next());
    else if (a === "--limit") opts.limit = Number(next());
    else if (a === "--ids") opts.ids = String(next()).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    else if (a === "--kind") opts.kind = next();
    else if (a === "--group") opts.group = next();
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--skip-stems") opts.skipStems = true;
    else if (a === "--ssml") opts.ssml = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else throw new Error("Unknown flag: " + a);
  }
  return opts;
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function speakable(clip, opts) {
  if (clip.tts) return clip.tts;
  if (clip.kind && clip.kind.indexOf("phoneme") === 0) {
    if (opts.ssml && clip.ipa) {
      const ph = String(clip.ipa).replace(/\//g, "");
      return '<phoneme alphabet="ipa" ph="' + ph + '">' + (clip.text || "a") + "</phoneme>";
    }
    return PHONEME_SAY[clip.id] || clip.cue || clip.text;
  }
  if (clip.kind === "letter-name") return clip.cue || clip.text;
  return clip.text;
}

function outPath(clip) {
  return path.join(OUT_DIR, clip.id + ".mp3");
}

function usesInstructions(model) {
  return /gpt-4o|mini-tts/i.test(model || "");
}

async function openaiSpeech(opts, text, clip) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set (.env / .env.local)");
  const speed = clip.kind && clip.kind.indexOf("phoneme") === 0
    ? Math.min(opts.speed, 0.8)
    : opts.speed;
  const body = {
    model: opts.model,
    voice: opts.voice,
    input: text,
    response_format: "mp3",
    speed: speed
  };
  if (usesInstructions(opts.model)) body.instructions = INSTRUCTIONS;
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (res.status === 429) {
    const err = new Error("rate limited");
    err.retry = true;
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error("OpenAI TTS " + res.status + ": " + detail.slice(0, 400));
  }
  return Buffer.from(await res.arrayBuffer());
}

async function elevenLabsSpeech(opts, text) {
  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = opts.voiceId || process.env.ELEVENLABS_VOICE_ID;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  if (!voiceId) throw new Error("Pass --voice-id or set ELEVENLABS_VOICE_ID");
  const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(voiceId), {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text: text,
      model_id: opts.model === "tts-1" ? "eleven_multilingual_v2" : opts.model,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15 }
    })
  });
  if (res.status === 429) {
    const err = new Error("rate limited");
    err.retry = true;
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error("ElevenLabs " + res.status + ": " + detail.slice(0, 400));
  }
  return Buffer.from(await res.arrayBuffer());
}

function help() {
  console.log("Generate voice MP3s from voice-script.json\n");
  console.log("  npm run assets:voice -- --dry-run");
  console.log("  npm run assets:voice -- --limit 8 --ids letter-name-a,phoneme-short-a,word-cat");
  console.log("  npm run assets:voice -- --group letter_names");
  console.log("  npm run assets:voice -- --provider openai --model gpt-4o-mini-tts --voice shimmer");
  console.log("  npm run assets:voice -- --provider elevenlabs --voice-id <id> --ssml\n");
  console.log("Flags: --provider --model --voice --voice-id --speed --delay --limit --ids --kind --group");
  console.log("       --dry-run --force --skip-stems --ssml");
}

async function main() {
  loadDotEnv();
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    help();
    return;
  }

  const pack = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  let clips = pack.clips || [];
  if (opts.ids.length) {
    const want = new Set(opts.ids);
    clips = clips.filter(function (c) { return want.has(c.id); });
  }
  if (opts.group) {
    const group = (pack.groups && pack.groups[opts.group]) || [];
    const want = new Set(group);
    if (!want.size) throw new Error("Unknown group: " + opts.group + " (letter_names|phonemes|words|stems)");
    clips = clips.filter(function (c) { return want.has(c.id); });
  }
  if (opts.kind) {
    clips = clips.filter(function (c) { return c.kind === opts.kind || String(c.kind).indexOf(opts.kind) === 0; });
  }
  if (opts.skipStems) {
    clips = clips.filter(function (c) { return c.kind !== "stem-optional"; });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const jobs = [];
  clips.forEach(function (clip) {
    const dest = outPath(clip);
    const exists = fs.existsSync(dest);
    if (exists && !opts.force) {
      jobs.push({ clip: clip, dest: dest, skip: true, reason: "exists" });
      return;
    }
    jobs.push({
      clip: clip,
      dest: dest,
      skip: false,
      text: speakable(clip, opts)
    });
  });

  const todo = jobs.filter(function (j) { return !j.skip; });
  const limited = opts.limit > 0 ? todo.slice(0, opts.limit) : todo;
  const skippedByLimit = todo.length - limited.length;
  const chars = limited.reduce(function (n, j) { return n + String(j.text || "").length; }, 0);

  console.log("provider=" + opts.provider + " model=" + opts.model + " voice=" + (opts.voiceId || opts.voice));
  console.log("clips=" + clips.length + " generate=" + limited.length + " skip-existing=" + (jobs.length - todo.length) + " skip-limit=" + skippedByLimit);
  console.log("characters≈" + chars + "  (tts-1 is ~$15 / 1M chars; this batch is cents)");

  if (opts.dryRun) {
    limited.slice(0, 12).forEach(function (j) {
      console.log("  " + j.clip.id + "  →  \"" + j.text + "\"  →  " + path.relative(ROOT, j.dest));
    });
    if (limited.length > 12) console.log("  … " + (limited.length - 12) + " more");
    console.log("Dry run. Re-run without --dry-run to write MP3s.");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < limited.length; i++) {
    const job = limited[i];
    process.stdout.write("[" + (i + 1) + "/" + limited.length + "] " + job.clip.id + " \"" + job.text + "\" … ");
    let attempt = 0;
    while (true) {
      try {
        const buf = opts.provider === "elevenlabs"
          ? await elevenLabsSpeech(opts, job.text)
          : await openaiSpeech(opts, job.text, job.clip);
        fs.writeFileSync(job.dest, buf);
        console.log("wrote " + buf.length + " bytes");
        ok++;
        break;
      } catch (err) {
        if (err.retry && attempt < 4) {
          attempt++;
          const wait = 1000 * Math.pow(2, attempt);
          console.log("429, retry in " + wait + "ms");
          await sleep(wait);
          continue;
        }
        console.log("FAIL " + err.message);
        failed++;
        break;
      }
    }
    if (i < limited.length - 1 && opts.delay > 0) await sleep(opts.delay);
  }

  console.log("done. wrote=" + ok + " failed=" + failed);
  if (failed) process.exitCode = 1;
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exitCode = 1;
});
