# AI Interview Coach — Setup Guide

## Why it doesn't work inside Claude's preview
Claude's artifact preview runs inside a sandboxed iframe that **blocks**:
- Camera access
- Microphone access  
- Browser Text-to-Speech (speechSynthesis)

This is a browser security restriction — not a code bug. The exact same code works perfectly in a normal browser tab.

---

## Run locally in 3 steps

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Set up the project
Open a terminal / command prompt and run:

```bash
# Create a new React app
npx create-react-app ai-interview-coach
cd ai-interview-coach

# Delete the default src files
rm src/App.js src/App.css src/App.test.js src/logo.svg src/reportWebVitals.js src/setupTests.js
```

### Step 3 — Add the app file
Copy `App.js` from this download into the `src/` folder, then run:

```bash
npm start
```

Your browser will open at **http://localhost:3000** — camera, mic, and AI voice will all work.

---

## Browser requirements
- **Chrome** or **Edge** recommended (best Speech Recognition support)
- Firefox works for camera/mic but Speech Recognition may not work
- Safari: limited support

## How the interview works
1. Click **Start Interview**
2. Choose your role (15 options)
3. Click **Allow Devices & Start** — this unlocks your camera, mic, and AI voice
4. The AI avatar speaks your first question out loud
5. Answer by speaking — your words appear live on screen
6. After a 5-second pause, your answer auto-submits
7. AI speaks the next question
8. After 10 questions, view your full results and feedback

## Features
- 15 interview roles with 10 questions each
- AI speaks every question using browser Text-to-Speech
- Live speech-to-text transcription of your answers
- Auto-submit after silence detection
- Tab-switch monitoring (3 violations = session terminated)
- Camera feed shown during interview
- Interview Readiness Score + full transcript in results
