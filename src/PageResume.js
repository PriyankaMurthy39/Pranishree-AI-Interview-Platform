import { useState } from "react";
import { generateResumeQuestions } from "./hrQuestions";
import { parseResumeFileText } from "./PageRoleMatching";

export function PageResume({ role, onBack, onProceed }) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState("full"); // "hr", "technical", "full"
  const [showPaste, setShowPaste] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [personalizedQuestions, setPersonalizedQuestions] = useState([]);
  const [aiGeneratedMsg, setAiGeneratedMsg] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await parseResumeFileText(file);
    setResumeText(text);
    if (text.trim().length > 30) {
      triggerAiAnalysis(text);
    }
  };

  async function triggerAiAnalysis(textToAnalyze) {
    const txt = textToAnalyze || resumeText;
    if (!txt || txt.trim().length < 30) return;
    setLoadingAi(true);
    setAiGeneratedMsg("Analyzing resume & generating tailored questions...");
    const genQs = await generateResumeQuestions(txt, role.label);
    if (genQs && genQs.length > 0) {
      setPersonalizedQuestions(genQs);
      setAiGeneratedMsg(`✨ Generated ${genQs.length} personalized questions referencing your resume!`);
    } else {
      setAiGeneratedMsg("Resume uploaded! Standard question pool ready.");
    }
    setLoadingAi(false);
  }

  const handleContinue = () => {
    onProceed({
      resumeText,
      resumeFileName: fileName,
      mode,
      personalizedQuestions
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      background: "transparent"
    }}>
      <div style={{
        maxWidth: 640,
        width: "100%",
        padding: "32px",
        background: "rgba(15,23,42,0.75)",
        borderRadius: 20,
        border: "1px solid rgba(59,130,246,0.3)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)"
      }}>
        {/* Role Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>{role.icon}</span>
          <div>
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>ROLE SELECTED</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{role.label}</h2>
          </div>
        </div>

        {/* Section 1: Resume Upload */}
        <div style={{
          marginBottom: 26, padding: "20px", borderRadius: 14,
          background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
              📄 1. Upload Resume (Optional)
            </div>
            <button onClick={() => setShowPaste(!showPaste)}
              style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              {showPaste ? "Upload File" : "Paste Text Directly"}
            </button>
          </div>

          {!showPaste ? (
            <div style={{
              border: "2px dashed rgba(59,130,246,0.4)",
              borderRadius: 12, padding: "20px", textAlign: "center",
              background: "rgba(37,99,235,0.04)"
            }}>
              <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} id="resumeFile" style={{ display: "none" }} />
              <label htmlFor="resumeFile" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📤</div>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>Click to upload resume (.txt, .pdf, .doc)</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                  {fileName ? `File: ${fileName}` : "Extracts context to generate personalized questions"}
                </div>
              </label>
            </div>
          ) : (
            <textarea
              rows={4}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (projects, skills, past experience)..."
              style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical"
              }}
            />
          )}

          {/* AI Resume status */}
          {resumeText && (
            <div style={{ marginTop: 12 }}>
              {!loadingAi && personalizedQuestions.length === 0 && (
                <button onClick={() => triggerAiAnalysis()}
                  style={{
                    padding: "8px 16px", borderRadius: 8, background: "rgba(37,99,235,0.2)",
                    border: "1px solid #60a5fa", color: "#60a5fa", fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>
                  ✨ Generate Tailored Questions from Resume
                </button>
              )}
              {loadingAi && (
                <div style={{ color: "#fbbf24", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>⏳</span> {aiGeneratedMsg}
                </div>
              )}
              {aiGeneratedMsg && !loadingAi && (
                <div style={{ color: "#34d399", fontSize: 12, fontWeight: 600, background: "rgba(52,211,153,0.1)", padding: "8px 12px", borderRadius: 8 }}>
                  {aiGeneratedMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Interview Mode Selection */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            🎯 2. Select Interview Mode
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {[
              {
                id: "full",
                title: "Full Pipeline (HR + Technical)",
                badge: "Recommended",
                desc: "Complete 2-round assessment: HR Behavioral Round (8 Qs) followed by Technical Round (10 Qs) with combined IRS score."
              },
              {
                id: "hr",
                title: "HR Round Only",
                badge: "Behavioral",
                desc: "8 behavioral questions focusing on leadership, conflict resolution,STAR method, and soft skills."
              },
              {
                id: "technical",
                title: "Technical Round Only",
                badge: "Role-Specific",
                desc: "10 technical questions tailored to your selected role's domain and technical stack."
              }
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{
                  padding: "16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  background: mode === m.id ? "rgba(37,99,235,0.2)" : "rgba(15,23,42,0.6)",
                  border: mode === m.id ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s", fontFamily: "inherit"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ color: mode === m.id ? "#60a5fa" : "#fff", fontSize: 15, fontWeight: 700 }}>
                    {m.title}
                  </div>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: mode === m.id ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.06)",
                    color: mode === m.id ? "#93c5fd" : "#94a3b8", fontWeight: 600
                  }}>{m.badge}</span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={{
            padding: "14px 20px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", borderRadius: 10,
            cursor: "pointer", fontSize: 14, fontWeight: 600
          }}>
            ← Back to Roles
          </button>

          <button onClick={handleContinue} style={{
            flex: 1, padding: "14px 24px",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
            border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700,
            boxShadow: "0 8px 24px rgba(37,99,235,0.4)"
          }}>
            ▶ Continue to Device Check →
          </button>
        </div>
      </div>
    </div>
  );
}
