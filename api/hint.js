function systemPromptFor(subject) {
  const s = subject || "reading";
  if (s === "spelling") {
    return (
      "You help kids in a spelling game. Give ONE short hint (max 2 sentences) that guides sounding out " +
      "or noticing patterns WITHOUT revealing the correct spelling or listing the answer letters. No markdown."
    );
  }
  if (s === "math") {
    return (
      "You help kids in a math game. Give ONE short hint (max 2 sentences) that guides strategy " +
      "(count on, break apart, draw) WITHOUT revealing the numeric answer. No markdown."
    );
  }
  return (
    "You help kids in a reading game. Give ONE short hint (max 2 sentences) that guides thinking " +
    "without revealing the correct answer or spelling it out. No markdown."
  );
}

function buildPrompt(body) {
  const subject = body.subject || "reading";
  const activity = body.activity || {};
  const profile = body.profile || {};
  return [
    "Subject: " + subject,
    "Grade band: " + (profile.gradeBand || 1),
    "Activity type: " + (activity.type || "unknown"),
    "Skill: " + (activity.skill || subject),
    "Prompt shown to child: " + String(activity.prompt || activity.speak || "").slice(0, 280),
    "Extra text (if any): " + String((activity.payload && (activity.payload.text || activity.payload.equation)) || "").slice(0, 280),
    "Give a helpful hint only. Do not state the answer."
  ].join("\n");
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
      temperature: 0.5,
      max_tokens: 90,
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
    return res.status(503).json({ ok: false, error: "OPENAI_API_KEY is not set", code: "missing_key" });
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

  if (!body.activity || (!body.activity.prompt && !body.activity.speak && !(body.activity.payload && (body.activity.payload.text || body.activity.payload.equation)))) {
    return res.status(400).json({ ok: false, error: "activity.prompt required" });
  }

  try {
    const message = await callOpenAI(systemPromptFor(body.subject), buildPrompt(body));
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
      error: err.message || "Hint request failed",
      code: "upstream"
    });
  }
};
