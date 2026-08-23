/* Word Quest — optional cloud AI coach (Vercel /api/*). Falls back silently when offline. */
(function (global) {
  "use strict";

  var STATUS = { checked: false, available: false, model: "" };

  function apiBase() {
    return "";
  }

  function profilePayload(profile) {
    return {
      name: profile.name || "",
      gradeBand: profile.gradeBand || 1,
      xp: profile.xp || 0,
      stars: profile.stars || 0,
      skills: profile.skills || {}
    };
  }

  function activityPayload(activity) {
    if (!activity) return null;
    return {
      type: activity.type || "",
      prompt: activity.prompt || "",
      speak: activity.speak || "",
      skill: activity.skill || "",
      payload: activity.payload
        ? { text: String(activity.payload.text || "").slice(0, 280) }
        : undefined
    };
  }

  function checkHealth() {
    return fetch(apiBase() + "/api/health", { method: "GET" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        STATUS.checked = true;
        STATUS.available = !!(data && data.ok && data.aiConfigured);
        STATUS.model = (data && data.model) || "";
        return STATUS;
      })
      .catch(function () {
        STATUS.checked = true;
        STATUS.available = false;
        return STATUS;
      });
  }

  function ensureStatus() {
    if (STATUS.checked) return Promise.resolve(STATUS);
    return checkHealth();
  }

  function postJson(path, body) {
    return fetch(apiBase() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }

  function coach(profile, context, extra, activity) {
    if (!profile || profile.coachEnabled === false) {
      return Promise.resolve({ ok: false, fallback: true, message: "" });
    }
    return ensureStatus().then(function (st) {
      if (!st.available) {
        return { ok: false, fallback: true, message: "" };
      }
      var weak = "";
      try {
        if (global.WQEngine && global.WQEngine.weakestSkills) {
          var w = global.WQEngine.weakestSkills(profile, 1)[0];
          if (w) weak = w.label || w.skill || "";
        }
      } catch (err) {}
      return postJson("/api/coach", {
        context: context || "ask",
        profile: profilePayload(profile),
        activity: activityPayload(activity),
        extra: Object.assign({}, extra || {}, { weakSkill: weak })
      }).then(function (result) {
        if (result.data && result.data.ok && result.data.message) {
          return {
            ok: true,
            message: result.data.message,
            source: result.data.source || "openai",
            model: result.data.model || st.model
          };
        }
        return {
          ok: false,
          fallback: true,
          message: "",
          error: (result.data && result.data.error) || "unavailable"
        };
      });
    }).catch(function () {
      return { ok: false, fallback: true, message: "" };
    });
  }

  function hint(profile, activity) {
    return ensureStatus().then(function (st) {
      if (!st.available) {
        return { ok: false, fallback: true, message: "" };
      }
      return postJson("/api/hint", {
        profile: profilePayload(profile),
        activity: activityPayload(activity)
      }).then(function (result) {
        if (result.data && result.data.ok && result.data.message) {
          return {
            ok: true,
            message: result.data.message,
            source: result.data.source || "openai"
          };
        }
        return { ok: false, fallback: true, message: "", error: (result.data && result.data.error) || "unavailable" };
      });
    }).catch(function () {
      return { ok: false, fallback: true, message: "" };
    });
  }

  function getStatus() {
    return STATUS;
  }

  global.WQAI = {
    checkHealth: checkHealth,
    ensureStatus: ensureStatus,
    coach: coach,
    hint: hint,
    getStatus: getStatus
  };
})(typeof window !== "undefined" ? window : globalThis);
