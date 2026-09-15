function systemPromptFor(subject) {
  const s = subject || "reading";
  if (s === "spelling") {
    return (
      "You are a warm, brief spelling coach for kids (preschool through 7th grade) in Spelling World. " +
      "Reply in 1–2 short kid-friendly sentences. Encourage effort. Never shame. " +
      "Do not reveal the correct spelling or letters of the answer. Give sound/pattern strategies only. " +
      "Do not use markdown. Keep language simple for the child's grade."
    );
  }
  if (s === "math") {
    return (
      "You are a warm, brief math coach for kids (preschool through 7th grade) in Math World. " +
      "Reply in 1–2 short kid-friendly sentences. Encourage effort. Never shame. " +
      "Do not reveal the numeric answer. Give strategies (count on, break apart, draw, estimate). " +
      "Do not use markdown. Keep language simple for the child's grade."
    );
  }
  return (
    "You are a warm, brief reading coach for kids (preschool through 7th grade) in Word Quest Reading World. " +
    "Reply in 1–2 short kid-friendly sentences. Encourage effort. Never shame. " +
    "Do not reveal quiz answers. Do not use markdown or emojis unless the user already used them. " +
    "Keep language simple for the child's grade."
  );
}

function subjectLabel(subject) {
  if (subject === "spelling") return "spelling";
  if (subject === "math") return "math";
  return "reading";
}

function skillSummary(skills) {
  if (!skills || typeof skills !== "object") return "none";
  return Object.keys(skills)
    .map(function (k) {
      return k + ":" + Math.round(Number(skills[k]) || 0);
    })
    .join(", ");
}

function buildUserPrompt(body) {
  const subject = body.subject || "reading";
  const context = body.context || "map";
  const profile = body.profile || {};
  const activity = body.activity || null;
  const extra = body.extra || {};
  const label = subjectLabel(subject);
  const lines = [
    "Subject: " + label,
    "Context: " + context,
    "Player name: " + (profile.name || "Player"),
    "Grade band: " + (profile.gradeBand || 1),
    "XP: " + (profile.xp || 0) + ", stars: " + (profile.stars || 0),
    "Skills (0–100): " + skillSummary(profile.skills),
    "Weak skill hint: " + (extra.weakSkill || "unknown")
  ];
  if (activity) {
    lines.push(
      "Current activity type: " + (activity.type || "unknown"),
      "Prompt (no answer): " + String(activity.prompt || activity.speak || "").slice(0, 240),
      "Skill focus: " + (activity.skill || "general")
    );
  }
  if (context === "miss") lines.push("The child just missed an item. Encourage and give a gentle " + label + " strategy tip.");
  if (context === "correct") lines.push("The child answered correctly. Celebrate briefly. Streak: " + (extra.streak || 0));
  if (context === "lesson-complete") lines.push("The child finished a lesson. Suggest what to practice next in " + label + ".");
  if (context === "map") lines.push("The child is on the world map. Motivate the weekly challenge.");
  if (context === "parent") lines.push("Write a short tip for a parent/teacher about next " + label + " focus skills.");
  if (context === "ask") lines.push("The child tapped Ask AI Coach. Give one helpful " + label + " tip for their level.");
  return lines.join("\n");
}

async function callOpenAI(systemPrompt, userPrompt) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.7,
      max_tokens: 120,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    const msg = (data && data.error && data.error.message) || "OpenAI request failed";
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  const text =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;

  return String(text || "").trim();
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (process.env.AI_COACH_ENABLED === "false") {
    return res.status(503).json({ ok: false, error: "AI coach disabled", code: "disabled" });
  }
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
    return res.status(503).json({
      ok: false,
      error: "OPENAI_API_KEY is not set",
      code: "missing_key"
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ ok: false, error: "Invalid JSON body" });
    }
  }
  body = body || {};

  try {
    const message = await callOpenAI(systemPromptFor(body.subject), buildUserPrompt(body));
    if (!message) {
      return res.status(502).json({ ok: false, error: "Empty AI response", code: "empty" });
    }
    return res.status(200).json({
      ok: true,
      message: message,
      source: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    });
  } catch (err) {
    return res.status(err.status && err.status < 500 ? err.status : 502).json({
      ok: false,
      error: err.message || "Coach request failed",
      code: "upstream"
    });
  }
};
