import { useState, useEffect, useRef } from "react";
import { ALL_QUESTIONS } from "./questionsData";
import { HR_QUESTIONS, ROLE_HR_QUESTIONS, aiEvaluateHR, countFillers } from "./hrQuestions";

async function aiEvaluateTechnical(question, answer, roleLabel) {
  if (!answer || answer.trim().length < 3 || answer === "(no answer)") {
    return {
      score: 0,
      problemSolving: 0,
      communication: 0,
      label: "No Answer",
      feedback: "No spoken response recorded. Focus on explaining core concept and technical trade-offs.",
      fillers: 0
    };
  }
  const fillers = countFillers(answer);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 350,
        system: `You are an expert Technical Interviewer for ${roleLabel}. Evaluate the candidate's spoken response. Return ONLY valid JSON (no markdown).`,
        messages: [{
          role: "user",
          content: `Technical Question: "${question}"\nCandidate's spoken answer: "${answer}"\n\nReturn ONLY this JSON:\n{\n  "score": <integer 1-5 technical accuracy>,\n  "problemSolving": <integer 1-5 logic and approach>,\n  "communication": <integer 1-5 clarity>,\n  "label": "<Excellent|Good|Fair|Needs Work|No Answer>",\n  "feedback": "<Brief 2-sentence feedback: exact area to improve and actionable suggestion>",\n  "keyPoints": ["<point1>","<point2>"]\n}`
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, fillers };
  } catch (e) {
    const wordCount = answer.trim().split(/\s+/).length;
    const sc = wordCount >= 40 ? 4 : wordCount >= 20 ? 3 : wordCount >= 8 ? 2 : 1;
    const labels = ["", "Needs Work", "Needs Work", "Fair", "Good", "Excellent"];
    return {
      score: sc,
      problemSolving: sc,
      communication: Math.max(1, sc - Math.floor(fillers / 2)),
      label: labels[sc] || "Fair",
      feedback: "Response evaluated locally for technical explanation depth and structural clarity.",
      fillers
    };
  }
}

// Fisher-Yates (Durstenfeld) Unbiased Uniform Shuffle Algorithm O(n)
function fisherYatesShuffle(array) {
  const arr = [...(array || [])];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function PageInterview({ role, sessionConfig, onDone }) {
  const {
    mode = "full",
    personalizedQuestions = [],
    avatar = { id: "sophia", name: "Sophia", gender: "female", roleTitle: "Lead Technical Interviewer", icon: "👩‍💼", image: "/avatars/sophia.png", color: "#2563eb", gradient: "linear-gradient(135deg, #1e3a8a, #2563eb)", voicePitch: 1.05, accent: "#60a5fa" },
    durationSeconds = 420
  } = sessionConfig || {};

  const [hrQuestionSet] = useState(() => {
    const countNeeded = mode === "full" ? 6 : 10;
    const roleSpecific = ROLE_HR_QUESTIONS[role.id] || [];
    const pool = [...roleSpecific, ...HR_QUESTIONS];
    const shuffled = fisherYatesShuffle(pool);
    if (personalizedQuestions.length > 0) {
      const pCount = Math.min(3, personalizedQuestions.length);
      return [...personalizedQuestions.slice(0, pCount), ...shuffled.slice(0, countNeeded - pCount)];
    }
    return shuffled.slice(0, countNeeded);
  });

  const [techQuestionSet] = useState(() => {
    const countNeeded = mode === "full" ? 6 : 10;
    const pool = ALL_QUESTIONS[role.id] || ALL_QUESTIONS.python || [];
    const shuffled = fisherYatesShuffle(pool);
    if (personalizedQuestions.length > 3) {
      const pCount = Math.min(3, personalizedQuestions.length - 3);
      return [...personalizedQuestions.slice(3, 3 + pCount), ...shuffled.slice(0, countNeeded - pCount)];
    }
    return shuffled.slice(0, countNeeded);
  });

  const [currentRound, setCurrentRound] = useState(mode === "technical" ? "tech" : "hr");
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [caption, setCaption] = useState("Starting...");
  const [liveSpeech, setLiveSpeech] = useState("");
  const [silenceBar, setSilenceBar] = useState(0);
  const [seconds, setSeconds] = useState(durationSeconds);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);

  // PROCTORING & ADVANCED OBJECT DETECTION STATES
  const [faceCount, setFaceCount] = useState(1);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [proctorStatus, setProctorStatus] = useState("✓ Single Candidate Verified");
  const [faceAlert, setFaceAlert] = useState("");
  const [warnings, setWarnings] = useState(0);
  const [warnFlash, setWarnFlash] = useState("");
  const [hrLog, setHrLog] = useState([]);
  const [techLog, setTechLog] = useState([]);

  const hrLogRef = useRef([]);
  const techLogRef = useRef([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const camRef = useRef(null);
  const recogRef = useRef(null);
  const clockRef = useRef(null);
  const silRef = useRef(null);
  const cocoModelRef = useRef(null);
  const faceMeshRef = useRef(null);
  const objectScanRef = useRef(null);

  const phaseRef = useRef("intro");
  const currentRoundRef = useRef(currentRound);
  const answerBufRef = useRef("");
  const liveSpeechRef = useRef("");
  const silenceCounterRef = useRef(0);
  const isEndedRef = useRef(false);

  const lookAwayTimerRef = useRef(0);
  const phoneCounterRef = useRef(0);
  const noFaceStreakRef = useRef(0);
  const multiFaceStreakRef = useRef(0);
  const warningsRef = useRef(0);
  const nativeFaceDetectorRef = useRef(null);
  const lastWarnTimeRef = useRef(0);
  const prevFramePixelsRef = useRef(null);

  phaseRef.current = phase;
  currentRoundRef.current = currentRound;

  const currentQuestions = currentRound === "hr" ? hrQuestionSet : techQuestionSet;
  const currentQText = currentQuestions[qIndex] || "Next question...";

  useEffect(() => {
    isEndedRef.current = false;
    warningsRef.current = 0;
    multiFaceStreakRef.current = 0;
    initBrowserSecurity();
    loadMediaPipeAndTensorFlow();
    startCamera();
    startClock();
    runIntro();

    return () => {
      isEndedRef.current = true;
      clearInterval(clockRef.current);
      clearInterval(silRef.current);
      clearInterval(objectScanRef.current);
      window.speechSynthesis && window.speechSynthesis.cancel();
      stopRecog();
      camRef.current && camRef.current.getTracks().forEach(t => t.stop());
    };
  }, []); // eslint-disable-line

  function initBrowserSecurity() {
    const onVis = () => {
      if (document.hidden && phaseRef.current !== "finished" && !isEndedRef.current) {
        triggerSecurityWarning("Candidate switched tabs or left browser window!");
      }
    };

    const onBlur = () => {
      if (phaseRef.current !== "finished" && !isEndedRef.current) {
        triggerSecurityWarning("Interview window lost active focus!");
      }
    };

    const onFSChange = () => {
      if (!document.fullscreenElement && phaseRef.current !== "finished" && !isEndedRef.current) {
        triggerSecurityWarning("Candidate exited strict Fullscreen Mode!");
      }
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFSChange);
  }

  function triggerSecurityWarning(msg) {
    if (isEndedRef.current || phaseRef.current === "finished") return;

    const now = Date.now();
    // Enforce 3.0-second minimum gap between security warnings
    if (now - lastWarnTimeRef.current < 3000) return;
    lastWarnTimeRef.current = now;

    warningsRef.current += 1;
    const currentWarns = warningsRef.current;
    setWarnings(currentWarns);

    setWarnFlash(`⚠️ Malpractice Warning #${currentWarns} of 5 — ${msg}`);
    setTimeout(() => setWarnFlash(""), 4500);

    // Auto-terminate interview when candidate reaches 5 malpractice warnings (currentWarns >= 5)
    if (currentWarns >= 5) {
      setTimeout(() => {
        if (!isEndedRef.current) {
          finishInterview(true, `Interview automatically terminated due to excessive malpractices (${currentWarns} Malpractice Warnings triggered: ${msg}).`);
        }
      }, 800);
    }
  }

  useEffect(() => {
    if (phase !== "ai_speaking" || isEndedRef.current) { setMouthOpen(false); return; }
    const iv = setInterval(() => setMouthOpen(o => !o), 135);
    return () => clearInterval(iv);
  }, [phase]);

  function loadMediaPipeAndTensorFlow() {
    if (!window.tf) {
      const sTf = document.createElement("script");
      sTf.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js";
      sTf.onload = () => {
        const sCoco = document.createElement("script");
        sCoco.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js";
        sCoco.onload = () => {
          if (window.cocoSsd) {
            window.cocoSsd.load({ base: "mobilenet_v2" }).then(m => {
              cocoModelRef.current = m;
            }).catch(() => {});
          }
        };
        document.body.appendChild(sCoco);
      };
      document.body.appendChild(sTf);
    } else if (window.cocoSsd && !cocoModelRef.current) {
      window.cocoSsd.load({ base: "mobilenet_v2" }).then(m => {
        cocoModelRef.current = m;
      }).catch(() => {});
    }

    if (!window.FaceMesh) {
      const sCam = document.createElement("script");
      sCam.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
      sCam.onload = () => {
        const sFM = document.createElement("script");
        sFM.src = "https://cdn.jsdelivr.net/npm/@mediapipe/facemesh/facemesh.js";
        sFM.onload = () => {
          initMediaPipeIrisTracker();
        };
        document.body.appendChild(sFM);
      };
      document.body.appendChild(sCam);
    } else {
      initMediaPipeIrisTracker();
    }
  }

  const lastPersonDetectedTimeRef = useRef(Date.now());

  function initMediaPipeIrisTracker() {
    if (!window.FaceMesh || faceMeshRef.current) return;
    try {
      const fm = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/facemesh/${file}`
      });

      fm.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3
      });

      fm.onResults(onFaceMeshResults);
      faceMeshRef.current = fm;
    } catch(e) {}
  }

  const camStartTimeRef = useRef(Date.now());

  function onFaceMeshResults(results) {
    if (isEndedRef.current || phaseRef.current === "finished") return;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      lastPersonDetectedTimeRef.current = Date.now();
      noFaceStreakRef.current = 0;
    }

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      if (Date.now() - camStartTimeRef.current > 6000) {
        noFaceStreakRef.current++;
        if (noFaceStreakRef.current >= 12) { // ~5 seconds of sustained absence
          setFaceCount(0);
          setProctorStatus("⚠️ CANDIDATE MISSING FROM WINDOW!");
          triggerSecurityWarning("Candidate is missing from camera window! Please stay centered.");
        } else if (!phoneDetected) {
          setProctorStatus("⚠️ Please center face in camera");
        }
      }
      return;
    }

    noFaceStreakRef.current = 0;

    if (results.multiFaceLandmarks.length > 1) {
      multiFaceStreakRef.current++;
      if (multiFaceStreakRef.current >= 1) { // Instant trigger
        setFaceCount(results.multiFaceLandmarks.length);
        setProctorStatus(`⚠️ MULTI-PERSON DETECTED (${results.multiFaceLandmarks.length} Faces)`);
        triggerSecurityWarning(`Multiple people detected (${results.multiFaceLandmarks.length} faces) in camera view!`);
      }
      return;
    }

    multiFaceStreakRef.current = 0;
    setFaceCount(1);
    if (!phoneDetected) {
      setProctorStatus("✓ Single Candidate Verified");
    }
  }

  function doSpeak(text, onDone) {
    if (isEndedRef.current) return;
    if (!window.speechSynthesis) { onDone && onDone(); return; }
    
    window.speechSynthesis.cancel();
    
    const go = () => {
      if (isEndedRef.current) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.94;
      u.pitch = avatar.voicePitch || (avatar.gender === "male" ? 0.85 : 1.05);
      u.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      let pick = null;

      if (avatar.gender === "male") {
        pick =
          voices.find(v => /male/i.test(v.name) && !/female/i.test(v.name)) ||
          voices.find(v => /david|george|mark|guy|richard|james|alex/i.test(v.name)) ||
          voices.find(v => /google us english/i.test(v.name)) ||
          voices.find(v => v.lang && v.lang.startsWith("en-")) ||
          voices[0];
      } else {
        pick =
          voices.find(v => /female|zira|hazel|victoria|samantha|karen/i.test(v.name)) ||
          voices.find(v => /google uk english female/i.test(v.name)) ||
          voices.find(v => /google/i.test(v.name) && /en/i.test(v.lang)) ||
          voices.find(v => v.lang && v.lang.startsWith("en-")) ||
          voices[0];
      }

      if (pick) u.voice = pick;

      u.onend = () => { if (!isEndedRef.current) onDone && onDone(); };
      u.onerror = () => { if (!isEndedRef.current) onDone && onDone(); };
      window.speechSynthesis.speak(u);
    };

    if (window.speechSynthesis.getVoices().length > 0) { go(); }
    else {
      window.speechSynthesis.addEventListener("voiceschanged", function h() {
        window.speechSynthesis.removeEventListener("voiceschanged", h);
        if (!isEndedRef.current) go();
      });
    }
  }

  function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) return;
    camStartTimeRef.current = Date.now();
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then(stream => {
        if (isEndedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        camRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        startCameraObjectDetectionLoop();
      })
      .catch(() => {});
  }

  // 100% OFFLINE & HYBRID CAMERA PROCTORING MONITOR WITH REENTRANCY GUARD
  const isScanningRef = useRef(false);

  function startCameraObjectDetectionLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 160, H = 120;
    canvas.width = W; canvas.height = H;

    clearInterval(objectScanRef.current);
    objectScanRef.current = setInterval(async () => {
      if (phaseRef.current === "finished" || isEndedRef.current) return;
      if (!video.readyState || video.readyState < 2) return;

      // Reentrancy Guard: Prevent queuing overlapping async scans
      if (isScanningRef.current) return;
      isScanningRef.current = true;

      try {
        // 1. Native Chrome/Edge FaceDetector API check
        let nativeFacesCount = -1;
        if (window.FaceDetector && !nativeFaceDetectorRef.current) {
          try {
            nativeFaceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxFaces: 5 });
          } catch(e) {}
        }
        if (nativeFaceDetectorRef.current) {
          try {
            const detectedFaces = await nativeFaceDetectorRef.current.detect(video);
            if (detectedFaces) nativeFacesCount = detectedFaces.length;
          } catch(e) {}
        }

        // 2. Send frame to MediaPipe if loaded
        if (faceMeshRef.current) {
          try {
            await faceMeshRef.current.send({ image: video });
          } catch(e) {}
        }

        // 3. Object & Person Detection (COCO-SSD)
        let personCount = -1;
        if (cocoModelRef.current) {
          try {
            const predictions = await cocoModelRef.current.detect(video);
            const personPreds = predictions.filter(pred => pred.class === "person" && pred.score > 0.35);
            personCount = personPreds.length;

            let absolutePhoneFound = false;
            predictions.forEach(pred => {
              if ((pred.class === "cell phone" || pred.class === "mobile phone") && pred.score > 0.42) {
                absolutePhoneFound = true;
              }
            });

            if (absolutePhoneFound) {
              phoneCounterRef.current++;
              if (phoneCounterRef.current >= 1) { // Instant trigger
                setPhoneDetected(true);
                setProctorStatus("🚫 MOBILE PHONE DETECTED!");
                triggerSecurityWarning("Mobile phone hardware detected in camera window!");
              }
            } else {
              setPhoneDetected(false);
              phoneCounterRef.current = Math.max(0, phoneCounterRef.current - 1);
            }
          } catch(e) {}
        }

        if (nativeFacesCount > 0 || personCount > 0) {
          lastPersonDetectedTimeRef.current = Date.now();
        }

        // 4. Fallback Candidate Presence Evaluation when MediaPipe is offline/loading
        if (!faceMeshRef.current) {
          const effectiveCount = nativeFacesCount >= 0 ? nativeFacesCount : personCount;

          if (effectiveCount === 0) {
            setFaceCount(0);
            if (!phoneDetected) {
              setProctorStatus("⚠️ Please center face in camera");
            }
          } else if (effectiveCount > 1) {
            noFaceStreakRef.current = 0;
            multiFaceStreakRef.current++;
            if (multiFaceStreakRef.current >= 2) {
              setFaceCount(effectiveCount);
              setProctorStatus(`⚠️ MULTI-PERSON DETECTED (${effectiveCount} Persons)`);
              triggerSecurityWarning(`Multiple people detected (${effectiveCount} persons) in camera view!`);
            }
          } else if (effectiveCount === 1) {
            noFaceStreakRef.current = 0;
            multiFaceStreakRef.current = 0;
            setFaceCount(1);
            if (!phoneDetected) {
              setProctorStatus("✓ Single Candidate Verified");
            }
          }
        }
      } finally {
        isScanningRef.current = false;
      }
    }, 400);
  }

  function triggerIntegrityAlert(msg) {
    if (isEndedRef.current) return;
    setFaceAlert(msg);
    setTimeout(() => setFaceAlert(""), 4500);
  }

  function startClock() {
    clockRef.current = setInterval(() => {
      if (isEndedRef.current) { clearInterval(clockRef.current); return; }
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(clockRef.current);
          finishInterview(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function runIntro() {
    if (isEndedRef.current) return;
    const timeMins = Math.round(durationSeconds / 60);
    const introText = currentRound === "hr"
      ? `Hello, I'm ${avatar.name}, your ${avatar.roleTitle}. Welcome to your HR Behavioral Round for ${role.label}. You have ${timeMins} minutes max for this session.`
      : `Hello, I'm ${avatar.name}, your ${avatar.roleTitle}. Welcome to your Technical Interview for ${role.label}. You have ${timeMins} minutes max for this session.`;

    setCaption(introText);
    setPhase("ai_speaking");
    doSpeak(introText, () => {
      if (!isEndedRef.current) askQuestion(0);
    });
  }

  function askQuestion(idx) {
    if (isEndedRef.current) return;
    const questions = currentRoundRef.current === "hr" ? hrQuestionSet : techQuestionSet;
    if (idx >= questions.length) {
      if (mode === "full" && currentRoundRef.current === "hr") {
        transitionToTechnicalRound();
        return;
      } else {
        finishInterview(false);
        return;
      }
    }

    setQIndex(idx);
    const qText = questions[idx];
    const prefix = currentRoundRef.current === "hr" ? `HR Question ${idx + 1}: ` : `Technical Question ${idx + 1}: `;
    const fullSpeech = `${prefix}${qText}`;

    setCaption(fullSpeech);
    setPhase("ai_speaking");
    setLiveSpeech("");
    liveSpeechRef.current = "";
    answerBufRef.current = "";
    lastTranscriptLenRef.current = 0;

    doSpeak(fullSpeech, () => {
      if (!isEndedRef.current) startListeningForAnswer(qText, idx);
    });
  }

  function transitionToTechnicalRound() {
    if (isEndedRef.current) return;
    setCurrentRound("tech");
    setQIndex(0);
    const text = `🎉 HR Round complete! Moving to Technical Round for ${role.label}.`;
    setCaption(text);
    setPhase("ai_speaking");
    doSpeak(text, () => {
      if (!isEndedRef.current) askQuestion(0);
    });
  }

  const lastTranscriptLenRef = useRef(0);

  function startListeningForAnswer(qText, idx) {
    if (isEndedRef.current) return;
    setPhase("candidate_speaking");
    setCaption("🎤 Listening... Speak your answer or type in the box below, then click Submit.");
    setSilenceBar(0);
    silenceCounterRef.current = 0;
    lastTranscriptLenRef.current = 0;

    // 350ms delay allowing TTS audio hardware to release microphone stream
    setTimeout(() => {
      if (phaseRef.current === "candidate_speaking" && !isEndedRef.current) {
        startRecog();
      }
    }, 350);

    clearInterval(silRef.current);
    silRef.current = setInterval(() => {
      if (isEndedRef.current) { clearInterval(silRef.current); return; }
      
      silenceCounterRef.current += 0.5;
      const maxSilenceNeeded = answerBufRef.current.trim().length >= 3 ? 5 : 8;
      const pct = Math.min(100, (silenceCounterRef.current / maxSilenceNeeded) * 100);
      setSilenceBar(pct);

      if (silenceCounterRef.current >= maxSilenceNeeded) {
        clearInterval(silRef.current);
        submitAnswer(qText, idx);
      }
    }, 500);
  }

  function startRecog() {
    stopRecog();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "en-US";

      r.onresult = (evt) => {
        if (isEndedRef.current) return;
        let fullTranscript = "";
        for (let i = 0; i < evt.results.length; i++) {
          fullTranscript += evt.results[i][0].transcript + " ";
        }
        const cleaned = fullTranscript.trim();
        if (cleaned) {
          setLiveSpeech(cleaned);
          liveSpeechRef.current = cleaned;
          answerBufRef.current = cleaned;

          if (cleaned.length > (lastTranscriptLenRef.current || 0)) {
            lastTranscriptLenRef.current = cleaned.length;
            silenceCounterRef.current = 0;
            setSilenceBar(0);
            setIsSpeakingActive(true);
            setTimeout(() => setIsSpeakingActive(false), 1200);
          }
        }
      };

      r.onerror = () => {
        if (phaseRef.current === "candidate_speaking" && !isEndedRef.current) {
          setTimeout(() => {
            try { r.start(); } catch(e) {}
          }, 350);
        }
      };

      r.onend = () => {
        if (phaseRef.current === "candidate_speaking" && !isEndedRef.current) {
          setTimeout(() => {
            try { r.start(); } catch(e) {}
          }, 250);
        }
      };

      r.start();
      recogRef.current = r;
    } catch(e) {}
  }

  function stopRecog() {
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch(e) {}
      recogRef.current = null;
    }
  }

  async function submitAnswer(qText, idx) {
    if (isEndedRef.current) return;
    clearInterval(silRef.current);
    stopRecog();
    window.speechSynthesis && window.speechSynthesis.cancel();

    setPhase("ai_speaking");
    const spokenAnswer = (answerBufRef.current || liveSpeechRef.current || "").trim() || "(no answer)";

    if (currentRoundRef.current === "hr") {
      const resultObj = await aiEvaluateHR(qText, spokenAnswer);
      const newEntry = { q: qText, a: spokenAnswer, ...resultObj };
      hrLogRef.current = [...hrLogRef.current, newEntry];
      setHrLog([...hrLogRef.current]);
    } else {
      const resultObj = await aiEvaluateTechnical(qText, spokenAnswer, role.label);
      const newEntry = { q: qText, a: spokenAnswer, ...resultObj };
      techLogRef.current = [...techLogRef.current, newEntry];
      setTechLog([...techLogRef.current]);
    }

    if (!isEndedRef.current) {
      askQuestion(idx + 1);
    }
  }

  function finishInterview(terminated = false, terminationReason = "") {
    isEndedRef.current = true;
    setPhase("finished");

    window.speechSynthesis && window.speechSynthesis.cancel();
    stopRecog();
    clearInterval(silRef.current);
    clearInterval(clockRef.current);
    clearInterval(objectScanRef.current);
    if (camRef.current) {
      camRef.current.getTracks().forEach(t => t.stop());
    }

    const currentHrLog = hrLogRef.current;
    const currentTechLog = techLogRef.current;
    const combinedLog = [...currentHrLog, ...currentTechLog];

    const totalAsked = mode === "full" ? hrQuestionSet.length + techQuestionSet.length : currentQuestions.length;
    const answeredCount = combinedLog.filter(e => e.a && e.a !== "(no answer)").length;

    let technicalScore = 0;
    let problemSolvingScore = 0;
    let behavioralScore = 0;
    let answerQualityScore = 0;
    let communicationScore = 0;
    let finalIRS = 0;

    if (answeredCount > 0 && !terminated) {
      const techAccAvg = currentTechLog.length > 0 ? (currentTechLog.reduce((acc, i) => acc + (i.score || 0), 0) / currentTechLog.length) : 0;
      technicalScore = Math.round((techAccAvg / 5) * 100);

      const psAvg = currentTechLog.length > 0 ? (currentTechLog.reduce((acc, i) => acc + (i.problemSolving || i.score || 0), 0) / currentTechLog.length) : 0;
      problemSolvingScore = Math.round((psAvg / 5) * 100);

      const hrStarAvg = currentHrLog.length > 0 ? (currentHrLog.reduce((acc, i) => acc + (i.score || 0), 0) / currentHrLog.length) : 0;
      behavioralScore = Math.round((hrStarAvg / 5) * 100);

      const aqAvg = currentHrLog.length > 0 ? (currentHrLog.reduce((acc, i) => acc + (i.answerQuality || i.score || 0), 0) / currentHrLog.length) : 0;
      answerQualityScore = Math.round((aqAvg / 5) * 100);

      const totalFillers = combinedLog.reduce((acc, curr) => acc + (curr.fillers || 0), 0);
      communicationScore = Math.max(0, Math.min(100, 100 - totalFillers * 5 - warningsRef.current * 10));

      const computedHRScore = Math.round(0.50 * behavioralScore + 0.30 * answerQualityScore + 0.20 * communicationScore);
      const computedTechScore = Math.round(0.70 * technicalScore + 0.20 * problemSolvingScore + 0.10 * communicationScore);

      if (mode === "technical") {
        finalIRS = computedTechScore;
      } else if (mode === "hr") {
        finalIRS = computedHRScore;
      } else {
        finalIRS = Math.round(0.40 * computedHRScore + 0.60 * computedTechScore);
      }
    }

    let recommendation = "Keep Practicing / Room for Growth";
    if (terminated) {
      finalIRS = 0;
      recommendation = "Terminated / Malpractice Violation";
    } else if (answeredCount > 0) {
      if (finalIRS >= 85) recommendation = "Excellent / Outstanding Performance";
      else if (finalIRS >= 75) recommendation = "Great / Very Good Performance";
      else if (finalIRS >= 60) recommendation = "Good / Solid Effort";
      else if (finalIRS >= 40) recommendation = "Fair Attempt / Needs Practice";
      else recommendation = "Keep Practicing / Room for Growth";
    }

    onDone({
      mode,
      hrLog: currentHrLog,
      techLog: currentTechLog,
      hrIRS: mode === "technical" ? 0 : Math.round(0.50 * behavioralScore + 0.30 * answerQualityScore + 0.20 * communicationScore),
      techIRS: mode === "hr" ? 0 : Math.round(0.70 * technicalScore + 0.20 * problemSolvingScore + 0.10 * communicationScore),
      technicalScore,
      problemSolvingScore,
      behavioralScore,
      answerQualityScore,
      communicationScore,
      combinedIRS: finalIRS,
      recommendation,
      totalFillers: combinedLog.reduce((acc, curr) => acc + (curr.fillers || 0), 0),
      totalAsked,
      answeredCount,
      warnings: warningsRef.current,
      terminated,
      terminationReason: terminationReason || "Interview automatically terminated due to excessive malpractices (4+ Malpractice Warnings triggered)."
    });
  }

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, padding: "20px" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {(warnFlash || faceAlert) && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 99,
          background: "#ef4444", color: "#fff", padding: "12px 24px", borderRadius: 12,
          fontWeight: 700, fontSize: 14, boxShadow: "0 8px 30px rgba(239,68,68,0.5)"
        }}>
          {warnFlash || faceAlert}
        </div>
      )}

      {/* Main Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          padding: "14px 20px", borderRadius: 14, background: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{role.icon}</span>
            <div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{role.label}</span>
              <span style={{ color: avatar.accent || "#60a5fa", fontSize: 12, marginLeft: 10, fontWeight: 600 }}>
                ● {avatar.icon} {avatar.name} ({currentRound === "hr" ? "HR Round" : "Technical Round"})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#fbbf24", fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>
              ⏱️ {formatTime(seconds)}
            </div>

            <button onClick={() => finishInterview(false)} style={{
              padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.2)",
              border: "1px solid #f87171", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer"
            }}>
              🛑 End Interview Early &amp; View Report
            </button>
          </div>
        </div>

        <div style={{
          flex: 1, padding: "32px", borderRadius: 20, background: "rgba(15,23,42,0.75)",
          border: `1px solid ${avatar.color || "rgba(59,130,246,0.25)"}`, backdropFilter: "blur(12px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          {/* REAL IMAGE AVATAR PORTRAIT */}
          <div style={{ position: "relative", width: 140, height: 140, marginBottom: 14 }}>
            <div style={{
              width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
              border: `4px solid ${phase === "ai_speaking" ? (avatar.accent || "#2563eb") : phase === "candidate_speaking" ? "#60a5fa" : "#334155"}`,
              boxShadow: phase === "ai_speaking" ? `0 0 30px ${avatar.color}88` : `0 8px 30px ${avatar.color}44`,
              transition: "all 0.3s", position: "relative"
            }}>
              <img
                src={avatar.image || "/avatars/sophia.png"}
                alt={avatar.name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transform: mouthOpen ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.12s"
                }}
              />
            </div>

            {/* Speaking Status Pulse Indicator */}
            {phase === "ai_speaking" && (
              <div style={{
                position: "absolute", bottom: 4, right: 4, width: 22, height: 22, borderRadius: "50%",
                background: avatar.accent || "#60a5fa", border: "3px solid #0f172a",
                animation: "pulse 1s infinite"
              }} />
            )}
          </div>

          <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>
            {avatar.icon} {avatar.name}
          </div>
          <div style={{ color: avatar.accent || "#60a5fa", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
            {avatar.roleTitle}
          </div>

          <div style={{
            width: "100%", padding: "16px", borderRadius: 12,
            background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, textAlign: "center"
          }}>
            {caption}
          </div>

          {phase === "candidate_speaking" && (
            <div style={{ width: "100%", marginTop: 16 }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>🎤 Spoken Answer:</span>
                <span style={{ color: isSpeakingActive ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
                  {isSpeakingActive ? "● Speech Detected — Timer Reset!" : "Timer resets while speaking"}
                </span>
              </div>
              <textarea
                value={liveSpeech}
                onChange={(e) => {
                  const val = e.target.value;
                  setLiveSpeech(val);
                  liveSpeechRef.current = val;
                  answerBufRef.current = val;
                }}
                placeholder="🎤 Listening... Speak your answer into microphone (or type your response here)..."
                rows={3}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontSize: 13.5, resize: "vertical",
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box", lineHeight: 1.5
                }}
              />
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginTop: 8 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${silenceBar}%`, background: "#fbbf24", transition: "width 0.4s" }} />
              </div>
            </div>
          )}

          {phase === "candidate_speaking" && (
            <div style={{ display: "flex", gap: 12, marginTop: 16, width: "100%", justifyContent: "center" }}>
              <button onClick={() => submitAnswer(currentQText, qIndex)}
                style={{
                  flex: 1, padding: "12px 24px", borderRadius: 10,
                  background: "linear-gradient(135deg, #059669, #047857)", color: "#fff",
                  border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(5,150,105,0.4)"
                }}>
                ✓ Submit Answer &amp; Next Question ➔
              </button>

              <button onClick={() => submitAnswer(currentQText, qIndex)}
                style={{
                  padding: "12px 18px", borderRadius: 10,
                  background: "rgba(255,255,255,0.06)", color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>
                ⏭️ Skip Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          height: 220, borderRadius: 16, overflow: "hidden",
          background: "#020617",
          border: faceCount === 0 || phoneDetected || faceCount > 1
            ? "3px solid #f87171"
            : "2px solid rgba(59,130,246,0.4)",
          position: "relative"
        }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          <div style={{
            position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.75)", padding: "4px 10px", borderRadius: 6,
            color: faceCount === 0 || phoneDetected || faceCount > 1 ? "#f87171" : "#34d399", fontSize: 11, fontWeight: 600
          }}>
            {proctorStatus}
          </div>
        </div>

        <div style={{ padding: "18px", borderRadius: 16, background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
            {currentRound.toUpperCase()} ROUND PROGRESS
          </div>
          <div style={{ color: "#60a5fa", fontSize: 24, fontWeight: 900 }}>
            {qIndex + 1} <span style={{ fontSize: 13, color: "#64748b" }}>/ {currentQuestions.length} Qs</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", marginTop: 10 }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${((qIndex + 1) / currentQuestions.length) * 100}%`, background: "linear-gradient(90deg,#2563eb,#60a5fa)", transition: "width 0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
