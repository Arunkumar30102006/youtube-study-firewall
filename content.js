/*
 * Strict Study Zone — Content Script
 * YouTube Educational Content Firewall
 *
 * Responsibilities:
 *   1. Dynamically filter non-educational content on the homepage and search results
 *      - Supports BLUR mode (preserves feed structure, blurs distractions)
 *      - Supports HIDE mode (completely removes distractions)
 *   2. Block Shorts page navigation with a redirect overlay
 *   3. Inject a study-mode top banner with real-time stats
 *   4. Allow click-to-unblur on false positives
 *
 * Security notes:
 *   - All DOM injection uses textContent / createElement (no innerHTML)
 *   - Keywords are sanitized on load from storage
 *   - MutationObserver is safely guarded for document_start
 */

"use strict";

// ============================================================
//  DEFAULT KEYWORD LIST — Comprehensive academic coverage
// ============================================================
const DEFAULT_STUDY_KEYWORDS = [

  // ============================================================
  //  CYBERSECURITY, ETHICAL HACKING & APPLICATION SECURITY
  // ============================================================
  "cybersecurity", "cyber security", "infosec", "information security",
  "burpsuite", "burp suite", "burp suite tutorial", "burp suite community", "burp suite professional", "portswigger",
  "penetration testing", "penetration test", "pentesting", "pentest", "web app pentesting",
  "ethical hacking", "ethical hacker", "certified ethical hacker", "ceh",
  "nmap", "nmap tutorial", "nmap scanning", "wireshark", "wireshark tutorial", "packet analysis", "network sniffing",
  "metasploit", "metasploitable", "meterpreter", "metasploit tutorial",
  "kali linux", "parrot security", "parrot os", "blackarch",
  "vulnerability", "vulnerability assessment", "vulnerability scanning", "vulnerabilities",
  "cve", "cvss", "exploit", "exploitation", "payload", "zero day", "0-day",
  "xss", "cross-site scripting", "cross site scripting", "stored xss", "reflected xss", "dom xss",
  "csrf", "cross-site request forgery", "cross site request forgery", "ssrf", "server side request forgery",
  "sql injection", "sqli", "blind sql injection", "nosql injection",
  "owasp", "owasp top 10", "owasp zap", "zap proxy", "web application security", "appsec", "application security",
  "reverse engineering", "ghidra", "ida pro", "radare2", "x64dbg", "decompiler", "disassembler", "binary analysis",
  "malware analysis", "malware development", "ransomware analysis", "sandbox analysis",
  "cryptography", "crypto", "public key cryptography", "asymmetric encryption", "symmetric encryption",
  "rsa encryption", "aes encryption", "hashing", "sha256", "md5", "digital signature", "pki", "public key infrastructure",
  "network security", "firewall", "ids/ips", "snort", "suricata", "siem", "splunk", "soc analyst", "security operations",
  "ctf", "capture the flag", "ctf challenge", "ctf walkthrough", "ctf writeup", "tryhackme", "hack the box", "hackthebox", "vulnhub",
  "privilege escalation", "privesc", "linux privilege escalation", "windows privilege escalation",
  "web security", "api security", "api penetration testing", "postman security",
  "oauth", "oauth 2.0", "oauth2", "openid", "openid connect", "oidc", "jwt", "json web token", "jwt authentication",
  "authentication vs authorization", "user authentication", "authorization", "auth0", "iam", "identity access management",
  "active directory", "kerberos", "bloodhound", "mimikatz", "active directory attack",
  "buffer overflow", "stack overflow", "memory corruption", "binary exploitation", "pwn",
  "bug bounty", "bug hunting", "hackerone", "bugcrowd", "web vulnerability",
  "osint", "open source intelligence", "reconnaissance",
  "incident response", "digital forensics", "blue team", "red team", "purple team",
  "zero trust", "endpoint security", "edr", "security compliance", "cissp", "comptia security+",

  // ============================================================
  //  LLM, GENERATIVE AI, CLAUDE & MACHINE LEARNING
  // ============================================================
  "llm", "llms", "large language model", "large language models", "trained an llm", "train an llm", "build an llm",
  "claude", "claude 3", "claude 3.5", "claude sonnet", "claude opus", "claude haiku", "anthropic", "claude code",
  "chatgpt", "gpt-4", "gpt-4o", "gpt-4o mini", "gpt-5", "openai", "chatgpt tutorial",
  "gemini", "google gemini", "google deepmind", "gemma",
  "llama", "llama 2", "llama 3", "llama 3.1", "ollama", "mistral", "deepseek", "deepseek r1", "qwen", "phi-3",
  "hugging face", "huggingface", "transformers", "pytorch", "tensorflow", "keras",
  "rag", "retrieval augmented generation", "rag pipeline", "rag tutorial",
  "langchain", "langflow", "llamaindex", "crewai", "autogen", "semantic kernel",
  "ai agent", "ai agents", "autonomous agents", "multi agent systems", "agentic ai",
  "fine-tuning", "finetuning", "lora", "qlora", "peft", "model training",
  "prompt engineering", "prompt design", "system prompt", "in-context learning",
  "vector database", "pinecone", "chromadb", "qdrant", "faiss", "weaviate", "milvus",
  "embeddings", "vector embeddings", "tokenization", "tokenizer", "attention mechanism", "transformer architecture",
  "generative ai", "gen ai", "artificial intelligence", "machine learning", "deep learning",
  "neural network", "neural networks", "convolutional neural network", "cnn", "recurrent neural network", "rnn", "lstm",
  "diffusion models", "stable diffusion", "gan", "generative adversarial networks",
  "reinforcement learning", "rlhf", "reinforcement learning from human feedback",
  "nlp", "natural language processing", "computer vision", "object detection", "yolo",
  "data science", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",

  // ============================================================
  //  CLOUD COMPUTING, DEVOPS & SYSTEM ADMINISTRATION
  // ============================================================
  "aws", "amazon web services", "aws tutorial", "aws certified", "cloud practitioner", "solutions architect",
  "ec2", "amazon ec2", "aws ec2", "s3", "amazon s3", "aws s3", "lambda", "aws lambda", "iam role", "vpc", "route 53",
  "ssh", "putty", "ssh into ec2", "remote server", "linux terminal", "bash scripting", "shell scripting", "ubuntu server",
  "azure", "microsoft azure", "azure tutorial", "gcp", "google cloud platform",
  "cloud computing", "cloud architecture", "serverless architecture",
  "docker", "docker tutorial", "docker container", "docker compose", "dockerfile",
  "kubernetes", "k8s", "helm", "containerization", "orchestration",
  "devops", "ci/cd", "continuous integration", "continuous deployment", "github actions", "jenkins", "gitlab ci",
  "terraform", "infrastructure as code", "ansible",
  "linux command line", "linux commands", "terminal commands", "unix commands",

  // ============================================================
  //  PROGRAMMING, DATA STRUCTURES & WEB DEVELOPMENT
  // ============================================================
  "leetcode", "neetcode", "hackerrank", "codeforces", "codechef", "codewars", "geeksforgeeks",
  "dsa", "data structures and algorithms", "data structures", "algorithms", "time complexity", "space complexity",
  "dynamic programming", "graph algorithms", "tree traversal", "recursion",
  "coding interview", "technical interview", "coding problem", "problem solving techniques",
  "mern", "mern stack", "mean stack", "full stack", "fullstack", "web developer", "developer portfolio",
  "react", "react js", "react.js", "reactjs", "react tutorial", "react hooks",
  "three.js", "three js", "threejs", "3d web", "webgl", "3d portfolio", "portfolio website",
  "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "solidjs",
  "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django", "spring boot", "asp.net",
  "javascript", "typescript", "python", "c++", "c programming", "java", "golang", "rust", "c#", "ruby", "php", "swift", "kotlin",
  "html", "css", "tailwind", "tailwind css", "sass", "bootstrap",
  "mongodb", "postgresql", "mysql", "sqlite", "redis", "prisma", "supabase", "firebase", "sql tutorial", "sql query",
  "rest api", "restful api", "graphql", "grpc", "api development", "api tutorial", "system design", "microservices",
  "git", "github", "git tutorial", "version control", "software engineering", "clean code", "design patterns",

  // ============================================================
  //  MATHEMATICS, QUANTITATIVE SCIENCES & EXAMS
  // ============================================================
  "12th maths", "10th maths", "11th maths", "class 12 maths", "class 10 maths", "class 12 physics", "class 12 chemistry",
  "board exam", "public exam", "marking scheme", "public correction", "question paper", "answer key", "model question",
  "mathematics", "maths", "calculus", "linear algebra", "discrete mathematics", "differential equations",
  "probability", "statistics", "trigonometry", "geometry", "matrices and determinants", "fourier series", "laplace transform",
  "neet exam", "jee mains", "jee advanced", "gate exam", "upsc", "ssc exam", "bank exam preparation",
  "physics", "chemistry", "biology", "human anatomy explained", "cell biology", "organic chemistry",

  // ============================================================
  //  REGIONAL & GLOBAL EDUCATIONAL FORMATS & CREATORS
  // ============================================================
  "in tamil", "tutorial in tamil", "explained in tamil", "tamil tutorial", "tamil study", "tamil class",
  "in hindi", "in telugu", "in malayalam",
  "simply byte", "btree systems", "green code", "hackerrank", "javascript mastery", "freecodecamp",
  "traversy media", "fireship", "the cyber mentor", "networkchuck", "john hammond", "david bombal",
  "computerphile", "3blue1brown", "khan academy", "mit opencourseware", "cs50",
  "crash course", "full course", "complete tutorial", "tutorial for beginners", "explained simply",
  "concept explained", "theory explained", "lecture series", "study material", "study guide",
  "academic lecture", "course overview", "syllabus", "textbook solutions", "revision notes",
  "cheat sheet", "important questions", "solved examples", "stepwise solution", "theorem",
  "educational documentary", "university lecture", "professor lecture", "technical seminar",
  "webinar", "virtual classroom", "course walkthrough", "from scratch", "build from scratch"

];

// ============================================================
//  SHORT WORD BOUNDARY SET & COMPILER
//  Terms <= 4 chars that require exact word-boundary matching
//  so they match short technical acronyms without false-positives
// ============================================================
const SHORT_WORD_SET = new Set([
  "llm", "llms", "ai", "ml", "nlp", "rag", "lora", "qlora",
  "aws", "ec2", "s3", "iam", "vpc", "ssh", "putty",
  "burp", "cve", "cvss", "xss", "csrf", "ssrf", "sqli", "owasp", "ctf", "soc", "siem", "edr",
  "jwt", "oidc", "auth", "oauth", "oauth2",
  "dsa", "mern", "mean", "sql", "api", "apis", "git", "k8s",
  "math", "maths", "neet", "jee", "gate", "upsc", "ssc", "cat",
  "rust", "cpp", "php"
]);

let wordBoundaryRegex = null;

function compileWordBoundaryRegex() {
  const terms = Array.from(SHORT_WORD_SET).map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  wordBoundaryRegex = new RegExp(`\\b(?:${terms.join("|")})\\b`, "i");
}

compileWordBoundaryRegex();

// ============================================================
//  APPLICATION STATE
// ============================================================
let studyKeywords = [...DEFAULT_STUDY_KEYWORDS];
let extensionEnabled = true;
let filterMode = "blur"; // "blur" or "hide"
let statsBlocked = 0;
let statsAllowed = 0;
let filterScheduled = false;
let bannerElement = null;

// ============================================================
//  SETTINGS LOADER
//  Ensures custom keywords are ALWAYS merged with DEFAULT keywords
// ============================================================
function loadSettings() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(
      ["sszEnabled", "sszFilterMode", "sszKeywords", "sszStats"],
      (result) => {
        if (chrome.runtime.lastError) {
          console.warn("[SSZ] Storage read error:", chrome.runtime.lastError.message);
          return;
        }

        if (typeof result.sszEnabled === "boolean") {
          extensionEnabled = result.sszEnabled;
        }

        if (result.sszFilterMode === "hide" || result.sszFilterMode === "blur") {
          filterMode = result.sszFilterMode;
        }

        // Always retain all DEFAULT_STUDY_KEYWORDS and merge custom keywords
        const custom = (Array.isArray(result.sszKeywords) ? result.sszKeywords : [])
          .filter((kw) => typeof kw === "string")
          .map((kw) => kw.replace(/<[^>]*>/g, "").trim().toLowerCase())
          .filter((kw) => kw.length > 0 && kw.length < 100);

        studyKeywords = Array.from(new Set([...DEFAULT_STUDY_KEYWORDS, ...custom]));

        // Register any short custom keywords into SHORT_WORD_SET
        custom.forEach((kw) => {
          if (kw.length <= 4 && !kw.includes(" ")) {
            SHORT_WORD_SET.add(kw);
          }
        });
        compileWordBoundaryRegex();

        if (result.sszStats && typeof result.sszStats === "object") {
          statsBlocked = Number(result.sszStats.blocked) || 0;
          statsAllowed = Number(result.sszStats.allowed) || 0;
        }

        applyEnabledState();
        scheduleFilter();
      }
    );
  }
}

// ============================================================
//  PERSIST STATS (debounced)
// ============================================================
let statsSaveTimer = null;

function saveStats() {
  if (statsSaveTimer) clearTimeout(statsSaveTimer);
  statsSaveTimer = setTimeout(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        sszStats: { blocked: statsBlocked, allowed: statsAllowed }
      });
    }
  }, 1500);
}

// ============================================================
//  EDUCATIONAL CONTENT DETECTION
// ============================================================

/**
 * Checks whether extracted video signals match any educational keyword.
 * Uses word-boundary regex for short acronyms and substring matching for phrases.
 *
 * @param {{ title: string, channel: string, ariaLabel: string }} info
 * @returns {boolean}
 */
function isEducational(info) {
  if (!info) return false;
  const { title, channel, ariaLabel } = info;

  const normalizedTitle = (title || "").toLowerCase();
  const normalizedChannel = (channel || "").toLowerCase();
  const normalizedAria = (ariaLabel || "").toLowerCase();
  const combined = `${normalizedTitle} ${normalizedChannel} ${normalizedAria}`;

  // 1. Fast word-boundary test for short acronyms (LLM, AWS, SSH, EC2, CVE, etc.)
  if (wordBoundaryRegex) {
    if (wordBoundaryRegex.test(normalizedTitle) || wordBoundaryRegex.test(combined)) {
      return true;
    }
  }

  // 2. Comprehensive check against all studyKeywords (built-in + custom)
  for (const keyword of studyKeywords) {
    if (keyword.length <= 4 && !keyword.includes(" ")) {
      const rx = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (rx.test(combined)) return true;
    } else {
      if (combined.includes(keyword)) return true;
    }
  }

  return false;
}

// ============================================================
//  VIDEO FILTERING (BLUR OR HIDE)
// ============================================================

/** Selectors for video cards across YouTube (homepage & search) */
const VIDEO_RENDERERS = [
  "ytd-rich-item-renderer",                 // Homepage cards
  "ytd-video-renderer",                     // Search results
  "ytd-grid-video-renderer",                // Channel grids
  "ytd-compact-video-renderer",             // Sidebar suggestions
  "ytd-reel-item-renderer"                  // Shorts shelf items
].join(", ");

const TITLE_SELECTORS = [
  "#video-title",
  "a#video-title",
  "#video-title-link",
  "h3 a",
  ".title",
  "span#video-title"
];

/**
 * Extracts title, channel name, and aria-label from video renderer
 * @param {Element} renderer
 * @returns {{ title: string, channel: string, ariaLabel: string } | null}
 */
function extractVideoInfo(renderer) {
  let title = "";
  for (const selector of TITLE_SELECTORS) {
    const el = renderer.querySelector(selector);
    if (el) {
      const text = (el.textContent || el.getAttribute("title") || "").trim();
      if (text.length > 0) {
        title = text;
        break;
      }
    }
  }

  // Aria label (often on #video-title or renderer card)
  const titleEl = renderer.querySelector("#video-title") || renderer.querySelector("a#video-title");
  const ariaLabel = (
    titleEl?.getAttribute("aria-label") ||
    renderer.getAttribute("aria-label") ||
    ""
  ).trim();

  // Channel Name
  const channelEl = renderer.querySelector(
    "ytd-channel-name #text, ytd-channel-name a, #channel-name a, #byline a, #channel-info #text, .ytd-channel-name"
  );
  const channel = (channelEl?.textContent || "").trim();

  if (!title && !ariaLabel) return null;

  return { title, channel, ariaLabel };
}

/**
 * Adds an interactive unblur badge to a blurred video item.
 * Allows student to unblur in case of a false positive.
 */
function attachUnblurBadge(renderer) {
  if (renderer.querySelector(".ssz-blur-badge")) return;

  const badge = document.createElement("button");
  badge.className = "ssz-blur-badge";
  badge.type = "button";
  badge.textContent = "🛡️ Filtered: Non-Study (Click to Unblur)";

  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    renderer.classList.remove("ssz-blurred-video");
    renderer.classList.add("ssz-unblurred");
    renderer.setAttribute("data-ssz-unblurred", "true");
    badge.remove();
  });

  renderer.classList.add("ssz-filter-container");
  renderer.appendChild(badge);
}

/**
 * Removes any attached badge from renderer.
 */
function removeUnblurBadge(renderer) {
  const badge = renderer.querySelector(".ssz-blur-badge");
  if (badge) badge.remove();
  renderer.classList.remove("ssz-filter-container");
}

/**
 * Main filter function:
 * - Scans all video elements on current page (homepage + search)
 * - Evaluates title, channel name, and aria-label against study keywords
 * - Keeps educational videos fully visible
 * - Blurs or hides non-educational items based on filterMode
 * - Preserves user-unblurred items
 */
function filterVideos() {
  if (!extensionEnabled) return;

  // Don't filter the primary player on watch page
  const currentPath = window.location.pathname;
  if (currentPath.startsWith("/watch")) return;

  const renderers = document.querySelectorAll(VIDEO_RENDERERS);

  renderers.forEach((renderer) => {
    // Shorts shelf items are always hidden
    if (renderer.tagName.toLowerCase() === "ytd-reel-item-renderer") {
      renderer.classList.add("ssz-hidden-video");
      renderer.classList.remove("ssz-blurred-video");
      return;
    }

    const info = extractVideoInfo(renderer);
    if (!info) return; // Wait until title DOM is ready

    const isEdu = isEducational(info);
    const prevStatus = renderer.getAttribute("data-ssz-status");

    // Track statistics uniquely per element
    if (!prevStatus) {
      if (isEdu) {
        statsAllowed++;
        renderer.setAttribute("data-ssz-status", "allowed");
      } else {
        statsBlocked++;
        renderer.setAttribute("data-ssz-status", "blocked");
      }
      updateBannerStats();
      saveStats();
    }

    if (isEdu) {
      // Educational content: fully visible and clear
      renderer.classList.remove("ssz-hidden-video", "ssz-blurred-video");
      renderer.classList.add("ssz-unblurred");
      removeUnblurBadge(renderer);
    } else {
      // Non-educational content: apply blur or hide
      if (renderer.getAttribute("data-ssz-unblurred") === "true") {
        // User manually unblurred this item
        renderer.classList.remove("ssz-hidden-video", "ssz-blurred-video");
        renderer.classList.add("ssz-unblurred");
        return;
      }

      if (filterMode === "blur") {
        renderer.classList.remove("ssz-hidden-video", "ssz-unblurred");
        renderer.classList.add("ssz-blurred-video");
        attachUnblurBadge(renderer);
      } else {
        // "hide" mode
        renderer.classList.remove("ssz-blurred-video", "ssz-unblurred");
        renderer.classList.add("ssz-hidden-video");
        removeUnblurBadge(renderer);
      }
    }
  });
}

// ============================================================
//  REAPPLY FILTERS ON MODE OR KEYWORDS CHANGE
// ============================================================
function reapplyFilters() {
  document.querySelectorAll(VIDEO_RENDERERS).forEach((renderer) => {
    renderer.removeAttribute("data-ssz-status");
    renderer.removeAttribute("data-ssz-unblurred");
    renderer.classList.remove("ssz-hidden-video", "ssz-blurred-video", "ssz-unblurred");
    removeUnblurBadge(renderer);
  });

  statsBlocked = 0;
  statsAllowed = 0;
  filterVideos();
}

// ============================================================
//  DEBOUNCED SCHEDULER
// ============================================================
function scheduleFilter() {
  if (filterScheduled) return;
  filterScheduled = true;

  requestAnimationFrame(() => {
    filterScheduled = false;
    filterVideos();
  });
}

// ============================================================
//  SHORTS PAGE BLOCKING
// ============================================================
function checkShortsPage() {
  if (!extensionEnabled) return;

  const isShorts = window.location.pathname.startsWith("/shorts");

  if (isShorts && !document.getElementById("ssz-shorts-block")) {
    const overlay = document.createElement("div");
    overlay.id = "ssz-shorts-block";

    const emoji = document.createElement("h1");
    emoji.textContent = "🛡️";
    overlay.appendChild(emoji);

    const heading = document.createElement("h2");
    heading.textContent = "Shorts Blocked — Study Mode Active";
    overlay.appendChild(heading);

    const msg = document.createElement("p");
    msg.textContent = "YouTube Shorts are disabled while Strict Study Zone is active. Stay focused on your learning goals!";
    overlay.appendChild(msg);

    const btn = document.createElement("button");
    btn.textContent = "🔍 Go to YouTube Search";
    btn.addEventListener("click", () => {
      window.location.href = "https://www.youtube.com/results?search_query=";
    });
    overlay.appendChild(btn);

    document.body.appendChild(overlay);
  } else if (!isShorts) {
    const existing = document.getElementById("ssz-shorts-block");
    if (existing) existing.remove();
  }
}

// ============================================================
//  STUDY MODE BANNER
// ============================================================
function injectBanner() {
  if (bannerElement || !extensionEnabled) return;
  if (!document.body) return;

  bannerElement = document.createElement("div");
  bannerElement.id = "ssz-study-banner";

  const shield = document.createElement("span");
  shield.className = "ssz-shield";
  shield.textContent = "🛡️";
  bannerElement.appendChild(shield);

  const title = document.createElement("span");
  title.className = "ssz-banner-title";
  title.textContent = "STRICT STUDY ZONE";
  bannerElement.appendChild(title);

  const badge = document.createElement("span");
  badge.className = "ssz-badge-indicator";
  badge.textContent = `${filterMode.toUpperCase()} MODE`;
  bannerElement.appendChild(badge);

  const stats = document.createElement("span");
  stats.className = "ssz-stats";
  stats.textContent = `Filtered: ${statsBlocked} | Allowed: ${statsAllowed}`;
  bannerElement.appendChild(stats);

  document.body.prepend(bannerElement);
  document.body.classList.add("ssz-active");
}

function updateBannerStats() {
  if (!bannerElement) return;
  const badge = bannerElement.querySelector(".ssz-badge-indicator");
  if (badge) {
    badge.textContent = `${filterMode.toUpperCase()} MODE`;
  }
  const stats = bannerElement.querySelector(".ssz-stats");
  if (stats) {
    stats.textContent = `Filtered: ${statsBlocked} | Allowed: ${statsAllowed}`;
  }
}

function removeBanner() {
  if (bannerElement) {
    bannerElement.remove();
    bannerElement = null;
  }
  document.body?.classList.remove("ssz-active");
}

// ============================================================
//  ENABLED / DISABLED TOGGLE
// ============================================================
function applyEnabledState() {
  if (extensionEnabled) {
    document.body?.classList.remove("ssz-disabled");
    injectBanner();
    checkShortsPage();
    scheduleFilter();
  } else {
    document.body?.classList.add("ssz-disabled");
    removeBanner();

    // Clear all filter classes and badges
    document.querySelectorAll(VIDEO_RENDERERS).forEach((renderer) => {
      renderer.classList.remove("ssz-hidden-video", "ssz-blurred-video", "ssz-unblurred");
      removeUnblurBadge(renderer);
    });
  }
}

// ============================================================
//  POPUP MESSAGING INTERFACE
// ============================================================
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggleExtension") {
      extensionEnabled = !!message.enabled;
      applyEnabledState();
      sendResponse({ success: true, enabled: extensionEnabled });
    }

    if (message.action === "setFilterMode") {
      filterMode = message.mode === "hide" ? "hide" : "blur";
      updateBannerStats();
      reapplyFilters();
      sendResponse({ success: true, mode: filterMode });
    }

    if (message.action === "updateKeywords") {
      const custom = (Array.isArray(message.keywords) ? message.keywords : [])
        .filter((kw) => typeof kw === "string")
        .map((kw) => kw.replace(/<[^>]*>/g, "").trim().toLowerCase())
        .filter((kw) => kw.length > 0 && kw.length < 100);

      studyKeywords = Array.from(new Set([...DEFAULT_STUDY_KEYWORDS, ...custom]));

      custom.forEach((kw) => {
        if (kw.length <= 4 && !kw.includes(" ")) {
          SHORT_WORD_SET.add(kw);
        }
      });
      compileWordBoundaryRegex();

      reapplyFilters();
      sendResponse({ success: true, count: studyKeywords.length });
    }

    if (message.action === "getStats") {
      sendResponse({
        blocked: statsBlocked,
        allowed: statsAllowed,
        enabled: extensionEnabled,
        mode: filterMode
      });
    }

    return true;
  });
}

// ============================================================
//  SPA NAVIGATION HANDLER
// ============================================================
let lastUrl = window.location.href;

function onNavigate() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(() => {
      checkShortsPage();
      scheduleFilter();
    }, 400);
  }
}

// ============================================================
//  MUTATION OBSERVER
// ============================================================
function startObserver() {
  const target = document.documentElement || document.body;
  if (!target) {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
    return;
  }

  const observer = new MutationObserver(() => {
    scheduleFilter();
    onNavigate();
  });

  observer.observe(target, {
    childList: true,
    subtree: true
  });
}

// ============================================================
//  BOOT
// ============================================================
function boot() {
  loadSettings();
  startObserver();

  if (document.body) {
    applyEnabledState();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      applyEnabledState();
    }, { once: true });
  }

  window.addEventListener("popstate", onNavigate);
  window.addEventListener("yt-navigate-finish", () => {
    setTimeout(() => {
      checkShortsPage();
      scheduleFilter();
    }, 300);
  });
}

boot();
