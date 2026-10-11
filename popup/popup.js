/*
 * Strict Study Zone — Popup Script
 *
 * Controls the popup user interface:
 *   - Toggle extension ON/OFF
 *   - Switch Filter Mode: Blur vs Hide
 *   - Display live blocked/allowed statistics
 *   - Custom study keywords management
 *   - Reset controls
 *
 * Security:
 *   - All DOM updates use textContent (no innerHTML)
 *   - Keywords are sanitized before storage
 *   - Validates all chrome.storage and message data
 */

"use strict";

// ============================================================
//  DOM REFERENCES
// ============================================================
const toggleCheckbox = document.getElementById("toggle-enabled");
const statusText = document.getElementById("status-text");
const radioBlur = document.getElementById("radio-blur");
const radioHide = document.getElementById("radio-hide");
const statBlockedEl = document.getElementById("stat-blocked");
const statAllowedEl = document.getElementById("stat-allowed");
const keywordsTextarea = document.getElementById("custom-keywords");
const saveKeywordsBtn = document.getElementById("save-keywords");
const saveFeedback = document.getElementById("save-feedback");
const resetStatsBtn = document.getElementById("reset-stats");
const resetKeywordsBtn = document.getElementById("reset-keywords");

// ============================================================
//  LOAD SAVED STATE
// ============================================================
function loadState() {
  chrome.storage.local.get(
    ["sszEnabled", "sszFilterMode", "sszKeywords", "sszStats"],
    (result) => {
      if (chrome.runtime.lastError) {
        console.warn("[SSZ Popup] Storage read error:", chrome.runtime.lastError.message);
        return;
      }

      // Master Toggle
      const enabled = result.sszEnabled !== false; // Default true
      toggleCheckbox.checked = enabled;
      updateStatusUI(enabled);

      // Filter Mode (default: "blur")
      const mode = result.sszFilterMode || "blur";
      if (mode === "hide") {
        radioHide.checked = true;
      } else {
        radioBlur.checked = true;
      }

      // Stats
      if (result.sszStats && typeof result.sszStats === "object") {
        statBlockedEl.textContent = formatNumber(Number(result.sszStats.blocked) || 0);
        statAllowedEl.textContent = formatNumber(Number(result.sszStats.allowed) || 0);
      }

      // Custom keywords
      if (Array.isArray(result.sszKeywords) && result.sszKeywords.length > 0) {
        keywordsTextarea.value = result.sszKeywords.join("\n");
      }
    }
  );

  // Poll live stats from content script if active on YouTube
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getStats" }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
          statBlockedEl.textContent = formatNumber(response.blocked || 0);
          statAllowedEl.textContent = formatNumber(response.allowed || 0);
          if (response.mode === "hide") {
            radioHide.checked = true;
          } else {
            radioBlur.checked = true;
          }
        }
      });
    }
  });
}

// ============================================================
//  MASTER TOGGLE HANDLER
// ============================================================
toggleCheckbox.addEventListener("change", () => {
  const enabled = toggleCheckbox.checked;

  chrome.storage.local.set({ sszEnabled: enabled });
  updateStatusUI(enabled);

  // Notify background for badge indicator
  chrome.runtime.sendMessage({ action: "badgeUpdate", enabled });

  // Notify active YouTube tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleExtension",
        enabled
      });
    }
  });
});

function updateStatusUI(enabled) {
  if (enabled) {
    statusText.textContent = "Active";
    statusText.className = "status-active";
    document.body.classList.remove("disabled");
  } else {
    statusText.textContent = "Paused";
    statusText.className = "status-inactive";
    document.body.classList.add("disabled");
  }
}

// ============================================================
//  FILTER MODE HANDLER (BLUR VS HIDE)
// ============================================================
function handleModeChange(mode) {
  chrome.storage.local.set({ sszFilterMode: mode });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setFilterMode",
        mode
      });
    }
  });
}

radioBlur.addEventListener("change", () => {
  if (radioBlur.checked) handleModeChange("blur");
});

radioHide.addEventListener("change", () => {
  if (radioHide.checked) handleModeChange("hide");
});

// ============================================================
//  SAVE CUSTOM KEYWORDS
// ============================================================
saveKeywordsBtn.addEventListener("click", () => {
  const raw = keywordsTextarea.value;

  const keywords = raw
    .split("\n")
    .map((line) => line.replace(/<[^>]*>/g, "").trim().toLowerCase())
    .filter((line) => line.length > 0 && line.length < 100);

  const unique = [...new Set(keywords)];

  chrome.storage.local.set({ sszKeywords: unique }, () => {
    if (chrome.runtime.lastError) {
      showFeedback("❌ Save failed", true);
      return;
    }

    showFeedback("✅ Saved!");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateKeywords",
          keywords: unique
        });
      }
    });
  });
});

function showFeedback(message, isError) {
  saveFeedback.textContent = message;
  saveFeedback.classList.add("show");
  saveFeedback.style.color = isError ? "#ff4757" : "#00d4aa";

  setTimeout(() => {
    saveFeedback.classList.remove("show");
  }, 2000);
}

// ============================================================
//  RESET HANDLERS
// ============================================================
resetStatsBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    sszStats: { blocked: 0, allowed: 0 }
  }, () => {
    statBlockedEl.textContent = "0";
    statAllowedEl.textContent = "0";
  });
});

resetKeywordsBtn.addEventListener("click", () => {
  chrome.storage.local.set({ sszKeywords: [] }, () => {
    keywordsTextarea.value = "";
    showFeedback("✅ Reset to default keywords!");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateKeywords",
          keywords: []
        });
      }
    });
  });
});

// ============================================================
//  NUMBER FORMATTER
// ============================================================
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num);
}

// ============================================================
//  INITIALIZE
// ============================================================
loadState();
