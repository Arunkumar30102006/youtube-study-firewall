/*
 * Strict Study Zone — Background Service Worker
 *
 * Responsibilities:
 *   1. Handle extension install/update — set default settings
 *   2. Manage Shorts URL redirect via webNavigation
 *   3. Relay messages between popup and content scripts
 *   4. Badge icon management (ON/OFF indicator)
 */

"use strict";

// ============================================================
//  INSTALL / UPDATE HANDLER
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Set default state
    chrome.storage.local.set({
      sszEnabled: true,
      sszFilterMode: "blur",
      sszKeywords: [],  // Empty = use built-in defaults in content.js
      sszStats: { blocked: 0, allowed: 0 }
    });

    console.log("[SSZ] Extension installed — defaults set.");
  }

  if (details.reason === "update") {
    console.log("[SSZ] Extension updated to version", chrome.runtime.getManifest().version);
  }

  // Update badge
  updateBadge(true);
});

// ============================================================
//  BADGE MANAGEMENT
// ============================================================

function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#00d4aa" });
    chrome.action.setBadgeTextColor({ color: "#0f0c29" });
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#ff4757" });
    chrome.action.setBadgeTextColor({ color: "#ffffff" });
  }
}

// ============================================================
//  LISTEN FOR TOGGLE MESSAGES FROM POPUP
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "badgeUpdate") {
    updateBadge(!!message.enabled);
    sendResponse({ success: true });
  }
  return true;
});

// ============================================================
//  ON STARTUP — Restore badge state
// ============================================================

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["sszEnabled"], (result) => {
    const enabled = result.sszEnabled !== false; // Default true
    updateBadge(enabled);
  });
});

// Initialize badge on load
chrome.storage.local.get(["sszEnabled"], (result) => {
  const enabled = result.sszEnabled !== false;
  updateBadge(enabled);
});
