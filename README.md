# VAWA — Voice Academic Viva Assessor & Universal Defense Chamber

**VAWA** is an enterprise-grade, high-security AI Oral Examination (Viva Voce) Agent designed to test candidates on **any academic topic** across multiple levels of difficulty, listen and speak with authentic academic cadence, track the candidate's answers, and display a **drastically better, simplified, and intuitive model answer** ("The Good & Simple Answer").

---

## 🏛️ Key Features

### 1. Universal Knowledge & Dynamic Difficulty Engine
- **Topic Agnostic**: Examines candidates on *any* topic—either by speaking `"Ask me about [Topic]"` or typing in the terminal.
- **12 Built-in Flagship Disciplines**:
  - 💻 Computer Science & Distributed Systems
  - 🧠 Artificial Intelligence & Deep Learning
  - 🩺 Clinical Medicine & Human Physiology
  - ⚖️ Jurisprudence & Constitutional Law
  - 🔬 Quantum Physics & Thermodynamics
  - 📈 Quantitative Finance & Economics
  - 🛡️ Cybersecurity & Cryptography
  - 🧬 Molecular Biology & Genetics
  - 🏛️ Philosophy & Epistemology
  - 🚀 Aerospace & Mechanical Engineering
  - 🌍 Geopolitics & Modern History
  - ♟️ Game Theory & Strategic Decision Making
- **Dynamic Topic Synthesizer**: If an unlisted or novel topic is queried, VAWA procedurally constructs a 4-tier viva inquiry curriculum with evaluation rubrics and simplified models.
- **4-Tier Scrutiny (Difficulty)**:
  - 🟢 **Foundation (Novice)**: Conceptual intuition, primary definitions, core purpose.
  - 🟡 **Standard (Practitioner)**: Applied mechanics, operational trade-offs, concrete scenarios.
  - 🟠 **Rigorous (Advanced)**: Stress conditions, edge cases, failure regimes, pathological states.
  - 🔴 **Crucible (PhD Defense)**: Dialectical confrontation, theoretical limits, defense against counter-arguments.

### 2. Viva Voice Interaction System (Speaking & Hearing)
- **Authoritative Speech Synthesis (TTS)**:
  - The Examiner speaks inquiries and feedback out loud using `window.speechSynthesis`.
  - Authoritative academic vocal cadence (tuned pitch, rate, and intonation).
  - Synchronized speech visualizer with pulsing concentric rings and audio wave animations.
- **Attentive Speech Recognition (STT)**:
  - Listens to the candidate's voice via Web Speech Recognition (`webkitSpeechRecognition` / `SpeechRecognition`).
  - Real-time vocal transcript streaming as the candidate speaks.
  - Push-to-Talk (Tap/Hold to speak) and Hands-Free Viva Mode (automatic silence detection).
- **Procedural Acoustic Sound FX**:
  - Synthesized via Web Audio API oscillators:
    - 🔨 Wooden Gavel Strike for examination inauguration & conclusion.
    - 🔔 Metallic Chime for inquiry prompts.
    - 🎵 Harmonious Triad Chord for high distinction scores.
    - ⚠️ Staccato Warning Tone for security or anti-cheat flags.
- **Live HTML5 Canvas FFT Spectrum Visualizer**:
  - Connects to candidate microphone to draw real-time frequency bars and bronze oscilloscope waves.

### 3. Answer Tracking & "The Good and Simple Answer" Engine
- **Session Transcript Tracking**: Every inquiry, candidate defense, score, and examiner analysis is tracked chronologically in the viva dossier.
- **Rubric Scoring (0–100%)**:
  - Key technical concepts grasped vs. missed blind spots.
  - Honors classification: *Summa Cum Laude (First Class)*, *Magna Cum Laude*, *Merit Pass*, *Conditional Pass*, or *Revision Required*.
- **The Good & Simple Answer Breakdown (The Star Feature)**:
  - ⚡ **30-Second Mental Model**: Plain English, zero unnecessary jargon.
  - 💡 **Real-World Analogy**: Relatable, memorable mental model.
  - 📌 **3 Core Pillars**: The 3 essential points needed to score full marks on any defense.
- **Official Viva Dossier**: Full downloadable Markdown transcript and printable report.

### 4. Strong & High-Security Implementation
- **Cryptographic Key Vault (AES-256-GCM)**:
  - Zero-knowledge client-side storage for optional Google Gemini API key.
  - Derives keys using Web Crypto PBKDF2 (100,000 iterations) with SHA-256 and AES-256-GCM encryption.
  - Emergency **Panic Wipe** button to instantly zeroize all in-memory keys and storage.
  - 100% functional offline without an API key using the comprehensive built-in knowledge engine.
- **Multi-Vector Prompt Injection & Adversarial Defense**:
  - Real-time heuristic scanning of spoken and typed inputs.
  - Intercepts instruction overrides (`ignore previous instructions`), role-hijacks (`DAN`, `act as`), system delimiter poisoning (`<|im_start|>`), and XSS/script vectors.
- **Academic Integrity & Anti-Cheat Monitor**:
  - SHA-256 cryptographic session fingerprint.
  - Window blur and tab-switching monitor with automatic logging in the viva dossier.
  - Rate limiting via token-bucket algorithm to prevent flood attacks.
- **Enterprise Security Headers**:
  - Strict Content Security Policy (CSP), Cross-Origin-Opener-Policy (COOP: same-origin-allow-popups), Cross-Origin-Resource-Policy (CORP: same-origin), and `X-Content-Type-Options: nosniff`.

---

## 🎨 Theme & Aesthetic: Brown and Black with Bold Features
- **Palette**: Deep Obsidian Black (`#080605`, `#0E0B08`), Roasted Espresso & Dark Walnut (`#16100C`, `#271D16`), Burnished Bronze & Warm Caramel Gold (`#A86E35`, `#C99355`, `#E6B272`).
- **Bold Features**:
  - Heavy 2px solid bronze bevel borders.
  - High-contrast typography (`Syne` 800/900 weight, `Outfit`, `JetBrains Mono`).
  - Tactile physical buttons with press states and amber glows.
  - High-visibility scoring dial and dual-perspective comparative cards.

---

## 🚀 Running Locally

The project includes a zero-dependency local Node.js server with enterprise security headers.

```bash
# Start the secure server
node server.js
```

Open your browser at:
```
http://localhost:3000
```
*(Permissions Note: Allow microphone access when prompted to enable real-time speech recognition and acoustic spectrum visualization).*
