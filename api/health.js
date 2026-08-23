module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const enabled = process.env.AI_COACH_ENABLED !== "false";
  const hasKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    ok: true,
    service: "103-arcade-game-hub",
    aiConfigured: enabled && hasKey,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  });
};
