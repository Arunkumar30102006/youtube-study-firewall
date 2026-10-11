# Strict Study Zone (YouTube Study Firewall) 🛡️

**Strict Study Zone** is a Chrome extension (Manifest V3) that transforms YouTube into a distraction-free educational workstation. It filters non-academic content from feeds and search results, blocks Shorts, removes recommendations, and keeps students focused on their learning goals.

---

## 🚀 Key Features

- 🎯 **Dynamic Study Firewall**:
  - Automatically filters non-educational videos on the YouTube homepage and search results.
  - Supports **Blur Mode** (blurs distractions while keeping feed layout intact with a click-to-unblur badge) and **Hide Mode** (completely collapses non-study cards and empty rows).
- 🧠 **Expanded 350+ Subject Keyword Library**:
  - **Cybersecurity & AppSec**: Burp Suite, Penetration Testing, Ethical Hacking, CVE, OWASP, XSS, CSRF, SQL Injection, Nmap, Wireshark, Metasploit, Cryptography, CTF, OAuth 2.0, OpenID, JWT, etc.
  - **Generative AI & LLMs**: Claude (3.5 Sonnet / Opus), ChatGPT, OpenAI, Gemini, Llama, Ollama, DeepSeek, RAG, LangChain, Transformers, Fine-Tuning, Prompt Engineering, AI Agents, etc.
  - **Programming & Cloud**: LeetCode, HackerRank, DSA, React, Three.js, MERN stack, Next.js, AWS (EC2, S3, IAM, Lambda), SSH, Putty, Docker, Kubernetes, etc.
  - **Exams & Academics**: 12th / 10th Maths, Board Exam Marking Schemes, Public Correction, Calculus, Physics, Chemistry, Biology, Regional Tutorial formats (e.g. Tamil tech tutorials).
- 🏷️ **Intelligent Metadata & Word-Boundary Detection**:
  - Accurately matches short technical acronyms (`llm`, `aws`, `ssh`, `ec2`, `cve`, `xss`, `dsa`, `sql`, `api`, `maths`) without false-positive substrings.
  - Inspects video titles, verified channel creators, and accessibility labels.
- 🚫 **Shorts Blocking & Redirection**:
  - Intercepts Shorts URLs using Declarative Net Request rules and redirects to search.
  - Removes Shorts navigation links and shelf carousels.
- 📐 **Pixel-Perfect Header Layout**:
  - Top study banner automatically shifts YouTube's masthead, category chips bar, and sidebar down with zero visual overlap.
- ⚙️ **Customizable Popup**:
  - Toggle firewall ON/OFF.
  - Switch between Blur and Hide mode.
  - Add custom study topics (automatically merged with the built-in library).
  - Real-time blocked vs. allowed statistics counter.

---

## 🛠️ Installation (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Arunkumar30102006/youtube-study-firewall.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `youtube-study-firewall` folder.
5. Open [YouTube](https://www.youtube.com/) and enjoy a distraction-free study environment!

---

## 📂 Project Structure

```
youtube-study-firewall/
├── manifest.json         # Extension Manifest V3 configuration
├── background.js         # Service worker for badge indicators and state
├── content.js            # Video detection engine, keyword matcher & DOM observer
├── strict-clean.css      # Layout offsets, interface sanitization & blur styling
├── icons/                # Extension icons
├── popup/
│   ├── popup.html        # Settings popup interface
│   ├── popup.css         # Dark cyberpunk glassmorphism theme
│   └── popup.js          # Popup controller & storage sync
└── rules/
    └── shorts_rules.json # Declarative Net Request rules for blocking Shorts
```

---

## 📄 License

MIT License. Free for educational and personal use.
