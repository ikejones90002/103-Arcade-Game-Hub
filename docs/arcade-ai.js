/* Shared arcade AI coach client (Vercel /api/*). subject: reading | spelling | math */
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
        ? {
            text: String(activity.payload.text || activity.payload.equation || "").slice(0, 280)
          }
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

  function resolveWeak(profile, engine) {
    var weak = "";
    try {
      if (engine && engine.weakestSkills) {
        var w = engine.weakestSkills(profile, 1)[0];
        if (w) weak = w.label || w.skill || "";
      }
    } catch (err) {}
    return weak;
  }

  function createClient(options) {
    options = options || {};
    var subject = options.subject || "reading";
    var getEngine = options.getEngine || function () {
      return global.WQEngine;
    };

    function coach(profile, context, extra, activity) {
      if (!profile || profile.coachEnabled === false) {
        return Promise.resolve({ ok: false, fallback: true, message: "" });
      }
      return ensureStatus().then(function (st) {
        if (!st.available) {
          return { ok: false, fallback: true, message: "" };
        }
        var weak = resolveWeak(profile, getEngine());
        return postJson("/api/coach", {
          subject: subject,
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
          subject: subject,
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

    return {
      subject: subject,
      checkHealth: checkHealth,
      ensureStatus: ensureStatus,
      coach: coach,
      hint: hint,
      getStatus: function () {
        return STATUS;
      }
    };
  }

  var readingClient = createClient({
    subject: "reading",
    getEngine: function () {
      return global.WQEngine;
    }
  });

  global.ArcadeAI = {
    createClient: createClient,
    checkHealth: checkHealth,
    ensureStatus: ensureStatus,
    getStatus: function () {
      return STATUS;
    },
    reading: readingClient
  };

  /* Back-compat for Word Quest */
  global.WQAI = readingClient;
})(typeof window !== "undefined" ? window : globalThis);
