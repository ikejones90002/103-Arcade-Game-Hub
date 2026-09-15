/* Back-compat shim — prefer arcade-ai.js */
(function (global) {
  "use strict";
  if (!global.ArcadeAI) {
    console.warn("Load arcade-ai.js before wordquest-ai.js");
  }
})(typeof window !== "undefined" ? window : globalThis);
