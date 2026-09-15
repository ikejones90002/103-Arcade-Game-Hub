const fs = require("fs");
const files = ["docs/wordquest.html", "docs/spellbuzz.html", "docs/numbuzz.html"];

const oldRender = `  function renderCompanions() {
    const list = document.getElementById("companions-list");
    list.replaceChildren();
    Engine.availableCompanions(profile).forEach(function (c) {
      const row = document.createElement("div");
      row.className = "cosmetic-row";
      row.innerHTML = "<div><strong>" + c.emoji + " " + c.name + "</strong><div class='muted'>" + (c.owned ? "Unlocked" : "Keep learning to unlock") + "</div></div>";
      const actions = document.createElement("div");
      if (c.owned) {
        const btn = document.createElement("button");
        btn.className = "btn secondary";
        btn.type = "button";
        btn.textContent = c.equipped ? "Equipped" : "Equip";
        btn.onclick = function () {
          profile.engagement.equippedCompanion = c.id;
          Engine.saveProfile(profile);
          renderCompanions();
          renderEngageChrome();
        };
        actions.appendChild(btn);
      }
      row.appendChild(actions);
      list.appendChild(row);
    });
  }`;

const newRender = `  function renderCompanions() {
    const list = document.getElementById("companions-list");
    list.replaceChildren();
    const avatarRow = document.createElement("div");
    avatarRow.className = "cosmetic-row";
    avatarRow.innerHTML = "<div><strong>Avatar look</strong><div class='muted'>Outfits unlock as you learn—never required.</div></div>";
    const avatarActions = document.createElement("div");
    avatarActions.className = "avatar-equip-row";
    [["explorer","Explorer"],["wizard","Wizard"],["scientist","Scientist"],["knight","Knight"]].forEach(function (pair) {
      const btn = document.createElement("button");
      btn.className = "btn secondary";
      btn.type = "button";
      btn.textContent = pair[1];
      btn.onclick = function () {
        Engine.ensureEngagement(profile);
        profile.engagement.avatar.outfit = pair[0];
        Engine.saveProfile(profile);
        renderEngageChrome();
        renderCompanions();
      };
      avatarActions.appendChild(btn);
    });
    [["","None"],["glasses","Glasses"],["hat","Hat"],["backpack","Pack"],["crown","Crown"]].forEach(function (pair) {
      const btn = document.createElement("button");
      btn.className = "btn secondary";
      btn.type = "button";
      btn.textContent = pair[1];
      btn.onclick = function () {
        Engine.ensureEngagement(profile);
        profile.engagement.avatar.accessory = pair[0];
        Engine.saveProfile(profile);
        renderEngageChrome();
        renderCompanions();
      };
      avatarActions.appendChild(btn);
    });
    avatarRow.appendChild(avatarActions);
    list.appendChild(avatarRow);
    Engine.availableCompanions(profile).forEach(function (c) {
      const row = document.createElement("div");
      row.className = "cosmetic-row";
      const left = document.createElement("div");
      left.className = "companion-row-left";
      const mount = document.createElement("div");
      mount.className = "asset-companion";
      if (Assets) Assets.mountCompanion(mount, c.assetId || c.id, c.emoji);
      else {
        const span = document.createElement("span");
        span.className = "emoji";
        span.textContent = c.emoji || "✨";
        mount.appendChild(span);
      }
      left.appendChild(mount);
      const meta = document.createElement("div");
      meta.innerHTML = "<strong>" + c.name + "</strong><div class='muted'>" + (c.owned ? "Unlocked" : "Keep learning to unlock") + "</div>";
      left.appendChild(meta);
      row.appendChild(left);
      const actions = document.createElement("div");
      if (c.owned) {
        const btn = document.createElement("button");
        btn.className = "btn secondary";
        btn.type = "button";
        btn.textContent = c.equipped ? "Equipped" : "Equip";
        btn.onclick = function () {
          profile.engagement.equippedCompanion = c.id;
          Engine.saveProfile(profile);
          renderCompanions();
          renderEngageChrome();
        };
        actions.appendChild(btn);
      }
      row.appendChild(actions);
      list.appendChild(row);
    });
  }`;

files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (s.indexOf("avatar-equip-row") !== -1) {
    console.log("already", f);
    return;
  }
  if (s.indexOf(oldRender) === -1) {
    console.log("MISS renderCompanions", f);
    return;
  }
  fs.writeFileSync(f, s.replace(oldRender, newRender));
  console.log("companions+avatar", f);
});

// mute sync on updateMuteUi
files.forEach(function (f) {
  let s = fs.readFileSync(f, "utf8");
  if (s.indexOf("if (Assets) Assets.setMuted(muted);") !== -1 && s.split("if (Assets) Assets.setMuted(muted);").length > 2) {
    console.log("mute ok", f);
    return;
  }
  const re = /(function updateMuteUi\([^)]*\)\s*\{[\s\S]*?localStorage\.setItem\([^;]+;)/;
  if (!re.test(s)) {
    // try toggle mute handler
    const re2 = /(muted = !muted;\s*localStorage\.setItem\([^;]+;)/;
    if (re2.test(s) && s.indexOf("Assets.setMuted(muted)") === -1) {
      s = s.replace(re2, "$1\n    if (Assets) Assets.setMuted(muted);");
      fs.writeFileSync(f, s);
      console.log("mute toggle", f);
    } else console.log("mute skip", f);
    return;
  }
});
