import { useState } from "react";
import { CoachingChat } from "./CoachingChat";

export function PageResults({ results, onHome }) {
  const [activeTab, setActiveTab] = useState("report"); // "report" | "breakdown" | "coach"

  const {
    mode = "full",
    role = { label: "Technical Candidate" },
    combinedIRS = 0,
    technicalScore = 0,
    problemSolvingScore = 0,
    behavioralScore = 0,
    answerQualityScore = 0,
    communicationScore = 0,
    recommendation = "Consider",
    hrLog = [],
    techLog = [],
    totalFillers = 0,
    totalAsked = 10,
    answeredCount = 0,
    warnings = 0,
    terminated = false,
    terminationReason = ""
  } = results || {};

  // DYNAMIC COMMUNICATION & FLUENCY TEXT ENGINE BASED ON USER RULES
  let commSentence = "";
  if (answeredCount === 0) {
    commSentence = "⚠️ Communication could not be reliably assessed because no questions were answered.";
  } else if (totalFillers === 0) {
    commSentence = "✅ Strong verbal control with no significant filler-word usage detected.";
  } else if (totalFillers <= 3) {
    commSentence = `👍 Good verbal articulation with minimal filler words (${totalFillers} detected). Keep maintaining this steady delivery!`;
  } else {
    commSentence = `⚠️ Try reducing filler words such as "um", "actually", and "like" (${totalFillers} detected) to make your responses more confident and concise.`;
  }

  // STUDENT PRACTICE PERFORMANCE TIERS BADGE MAP
  const recommendationColorMap = {
    "Excellent / Outstanding Performance": { bg: "rgba(52,211,153,0.2)", border: "#34d399", text: "#34d399", icon: "🌟", label: "Excellent Performance" },
    "Great / Very Good Performance": { bg: "rgba(59,130,246,0.2)", border: "#60a5fa", text: "#60a5fa", icon: "🚀", label: "Great Performance" },
    "Good / Solid Effort": { bg: "rgba(251,191,36,0.2)", border: "#fbbf24", text: "#fbbf24", icon: "👍", label: "Good Effort" },
    "Fair Attempt / Needs Practice": { bg: "rgba(249,115,22,0.2)", border: "#f97316", text: "#f97316", icon: "💡", label: "Fair Attempt" },
    "Keep Practicing / Room for Growth": { bg: "rgba(239,68,68,0.2)", border: "#f87171", text: "#f87171", icon: "📈", label: "Keep Practicing" },
    "Terminated / Malpractice Violation": { bg: "rgba(239,68,68,0.25)", border: "#ef4444", text: "#ef4444", icon: "🛑", label: "Session Terminated" },

    // Backward compatibility mapping for older session labels
    "Highly Recommended": { bg: "rgba(52,211,153,0.2)", border: "#34d399", text: "#34d399", icon: "🌟", label: "Excellent Performance" },
    "Recommended": { bg: "rgba(59,130,246,0.2)", border: "#60a5fa", text: "#60a5fa", icon: "🚀", label: "Great Performance" },
    "Consider / Needs Minor Improvement": { bg: "rgba(251,191,36,0.2)", border: "#fbbf24", text: "#fbbf24", icon: "👍", label: "Good Effort" },
    "Needs Improvement": { bg: "rgba(249,115,22,0.2)", border: "#f97316", text: "#f97316", icon: "💡", label: "Fair Attempt" },
    "Not Recommended": { bg: "rgba(239,68,68,0.2)", border: "#f87171", text: "#f87171", icon: "📈", label: "Keep Practicing" }
  };

  const recBadge = recommendationColorMap[recommendation] || recommendationColorMap["Keep Practicing / Room for Growth"];
  const displayBadgeText = recBadge.label || recommendation;

  // Dynamic next target score calculation
  const nextTargetScore = Math.min(95, Math.max(80, Math.ceil((combinedIRS + 8) / 5) * 5));

  return (
    <div style={{ minHeight: "100vh", padding: "28px 20px", background: "transparent" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Top Header */}
        <div style={{
          padding: "20px 24px", borderRadius: 20, background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(12px)",
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20
        }}>
          <div>
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
              ASSESSMENT COMPLETE · {mode.toUpperCase()} MODE
            </div>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "4px 0 0" }}>
              {role.label} Performance Evaluation
            </h2>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {[
              { id: "report", label: "📊 AI Performance Feedback" },
              { id: "breakdown", label: "📋 Question Log" }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: activeTab === t.id ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "rgba(255,255,255,0.05)",
                  color: activeTab === t.id ? "#fff" : "#94a3b8",
                  border: activeTab === t.id ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)"
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Malpractice Termination Alert Banner */}
        {terminated && (
          <div style={{
            padding: "20px 24px", borderRadius: 16, background: "rgba(239,68,68,0.2)",
            border: "2px solid #f87171", color: "#f87171", marginBottom: 20,
            backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(239,68,68,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>🛑</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#f87171" }}>
                INTERVIEW AUTOMATICALLY TERMINATED DUE TO MALPRACTICE VIOLATIONS
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#fca5a5", lineHeight: 1.6 }}>
              {terminationReason || `The session was automatically terminated because candidate accumulated ${warnings} Malpractice Warnings (tab switching, window blur, mobile device detection, multiple people, or missing from camera window).`}
            </p>
          </div>
        )}

        {/* Main Tab Views */}
        {activeTab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Score & Recommendation Banner */}
            <div style={{
              display: "grid", gridTemplateColumns: "240px 1fr", gap: 20,
              padding: "24px", borderRadius: 20, background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)"
            }}>
              {/* IRS Gauge Card */}
              <div style={{
                textAlign: "center", padding: "20px", borderRadius: 16,
                background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
              }}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
                  FINAL IRS SCORE
                </div>
                <div style={{ color: "#fff", fontSize: 52, fontWeight: 900, margin: "6px 0" }}>
                  {combinedIRS}<span style={{ fontSize: 24, color: "#60a5fa" }}>%</span>
                </div>
                <div style={{
                  padding: "6px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800,
                  background: recBadge.bg, border: `1px solid ${recBadge.border}`, color: recBadge.text
                }}>
                  {recBadge.icon} {displayBadgeText}
                </div>
              </div>

              {/* Sub-Score Breakdown Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "center" }}>
                {mode !== "hr" && (
                  <div style={subCardStyle}>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>Technical Accuracy</div>
                    <div style={{ color: "#60a5fa", fontSize: 22, fontWeight: 800 }}>{technicalScore}%</div>
                  </div>
                )}
                {mode !== "hr" && (
                  <div style={subCardStyle}>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>Problem Solving</div>
                    <div style={{ color: "#38bdf8", fontSize: 22, fontWeight: 800 }}>{problemSolvingScore}%</div>
                  </div>
                )}
                {mode !== "technical" && (
                  <div style={subCardStyle}>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>Behavioral (STAR)</div>
                    <div style={{ color: "#34d399", fontSize: 22, fontWeight: 800 }}>{behavioralScore}%</div>
                  </div>
                )}
                {mode !== "technical" && (
                  <div style={subCardStyle}>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>Answer Quality</div>
                    <div style={{ color: "#a7f3d0", fontSize: 22, fontWeight: 800 }}>{answerQualityScore}%</div>
                  </div>
                )}
                <div style={subCardStyle}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Communication</div>
                  <div style={{ color: "#fbbf24", fontSize: 22, fontWeight: 800 }}>{communicationScore}%</div>
                </div>
                <div style={subCardStyle}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Questions Answered</div>
                  <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{answeredCount} / {totalAsked}</div>
                </div>
              </div>
            </div>

            {/* AI INTERVIEW FEEDBACK REPORT SECTIONS */}
            <div style={{
              padding: "32px", borderRadius: 20, background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(59,130,246,0.25)", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column", gap: 24
            }}>
              {/* Section 1: Executive Summary */}
              <div>
                <h3 style={sectionTitleStyle}>🎯 Executive Summary</h3>
                <p style={sectionTextStyle}>
                  {answeredCount === 0
                    ? `The candidate attempted 0 out of ${totalAsked} questions. Performance could not be reliably assessed because no spoken responses were recorded.`
                    : `The candidate completed the ${mode.toUpperCase()} practice session for ${role.label} with a Final Performance Score (IRS) of ${combinedIRS}%, achieving a performance status of "${displayBadgeText}". Overall, ${answeredCount} out of ${totalAsked} questions were completed.`
                  }
                </p>
              </div>

              {/* Section 2: Key Strengths */}
              <div>
                <h3 style={sectionTitleStyle}>💪 Key Strengths</h3>
                {answeredCount === 0 ? (
                  <p style={sectionTextStyle}>• No strength data available as no questions were answered.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {communicationScore >= 70 && <p style={sectionTextStyle}>• <strong>Strong Communication &amp; Articulation:</strong> Clear verbal delivery with effective explanation structure.</p>}
                    {mode !== "hr" && technicalScore >= 70 && <p style={sectionTextStyle}>• <strong>Technical Accuracy:</strong> Demonstrated solid domain knowledge and correct technical principles.</p>}
                    {mode !== "technical" && behavioralScore >= 70 && <p style={sectionTextStyle}>• <strong>Structured STAR Method:</strong> Effectively framed behavioral responses with clear Situations, Actions, and Results.</p>}
                    {totalFillers <= 2 && <p style={sectionTextStyle}>• <strong>Controlled Verbal Pace:</strong> Minimal reliance on filler words during answers.</p>}
                    {answeredCount > 0 && <p style={sectionTextStyle}>• <strong>Active Engagement:</strong> Successfully attempted and completed spoken answers under timed conditions.</p>}
                  </div>
                )}
              </div>

              {/* Section 3: Areas to Improve */}
              <div>
                <h3 style={sectionTitleStyle}>⚠️ Areas to Improve</h3>
                {answeredCount === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={sectionTextStyle}>• <strong>What went wrong:</strong> Candidate did not record any spoken answers during the session.</p>
                    <p style={sectionTextStyle}>• <strong>Why it matters:</strong> Interview evaluation requires spoken responses to assess technical competency.</p>
                    <p style={sectionTextStyle}>• <strong>How to improve:</strong> Ensure microphone permissions are active and answer each question clearly.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mode !== "hr" && technicalScore < 75 && (
                      <div>
                        <div style={{ color: "#f87171", fontSize: 14, fontWeight: 700 }}>1. Technical Explanation Depth ({technicalScore}%)</div>
                        <p style={sectionTextStyle}>• <strong>What went wrong:</strong> Technical answers lacked architectural depth and quantitative metrics.</p>
                        <p style={sectionTextStyle}>• <strong>Why it matters:</strong> Engineering roles require explaining design trade-offs and production constraints.</p>
                        <p style={sectionTextStyle}>• <strong>How to improve:</strong> Study core domain architecture and mention tools and trade-offs explicitly.</p>
                      </div>
                    )}
                    {mode !== "technical" && behavioralScore < 75 && (
                      <div>
                        <div style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700 }}>2. STAR Method Result Quantifiable Metrics ({behavioralScore}%)</div>
                        <p style={sectionTextStyle}>• <strong>What went wrong:</strong> Behavioral answers omitted clear quantitative results and impact metrics.</p>
                        <p style={sectionTextStyle}>• <strong>Why it matters:</strong> HR managers evaluate candidates based on measurable impact.</p>
                        <p style={sectionTextStyle}>• <strong>How to improve:</strong> Conclude behavioral answers with specific metrics (e.g. "improved speed by 35%").</p>
                      </div>
                    )}
                    {totalFillers > 3 && (
                      <div>
                        <div style={{ color: "#f97316", fontSize: 14, fontWeight: 700 }}>3. Verbal Filler Word Control ({totalFillers} Fillers)</div>
                        <p style={sectionTextStyle}>• <strong>What went wrong:</strong> Frequent use of filler words ("um", "like", "basically") during pauses.</p>
                        <p style={sectionTextStyle}>• <strong>Why it matters:</strong> Fillers detract from authority and clarity during technical delivery.</p>
                        <p style={sectionTextStyle}>• <strong>How to improve:</strong> Pause silently for 2 seconds before speaking instead of filling silences.</p>
                      </div>
                    )}
                    {(mode === "technical" ? technicalScore >= 75 : mode === "hr" ? behavioralScore >= 75 : technicalScore >= 75 && behavioralScore >= 75) && totalFillers <= 3 && (
                      <p style={sectionTextStyle}>✅ Outstanding session! No major weaknesses identified across evaluation metrics.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Section 4: Recommended Topics to Practice */}
              <div>
                <h3 style={sectionTitleStyle}>📚 Recommended Topics to Practice</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={sectionTextStyle}>• <strong>Domain Architecture for {role.label}:</strong> Core design patterns, scalability, and error handling.</p>
                  {mode !== "technical" && <p style={sectionTextStyle}>• <strong>STAR Method Framework:</strong> Practice 45-second structured behavioral responses.</p>}
                  <p style={sectionTextStyle}>• <strong>Quantifiable Metrics Presentation:</strong> Practice framing project outcomes with percentage improvements.</p>
                </div>
              </div>

              {/* Section 5: Communication & Fluency */}
              <div>
                <h3 style={sectionTitleStyle}>🗣️ Communication &amp; Fluency</h3>
                <p style={sectionTextStyle}>{commSentence}</p>
              </div>

              {/* Section 6: Action Plan */}
              <div>
                <h3 style={sectionTitleStyle}>🚀 Action Plan</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={sectionTextStyle}><strong>1. What to study:</strong> Core technical principles and architecture trade-offs for {role.label}.</p>
                  <p style={sectionTextStyle}><strong>2. What to practice:</strong> Practice silent 2-second pauses before speaking to eliminate filler words.</p>
                  <p style={sectionTextStyle}><strong>3. How to prepare for next session:</strong> Re-run a mock practice session and target a minimum score of {nextTargetScore}%+.</p>
                </div>
              </div>

              {/* Section 7: Next Interview Goal */}
              <div>
                <h3 style={sectionTitleStyle}>🎯 Next Practice Goal</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={sectionTextStyle}>• Complete at least {Math.max(90, Math.round((answeredCount / Math.max(1, totalAsked)) * 100))}% of questions thoroughly.</p>
                  {mode === "technical" && (
                    <p style={sectionTextStyle}>• Target a Technical Accuracy Score of <strong>{nextTargetScore}%+</strong> (Currently {technicalScore}%).</p>
                  )}
                  {mode === "hr" && (
                    <p style={sectionTextStyle}>• Target a Behavioral STAR Score of <strong>{nextTargetScore}%+</strong> (Currently {behavioralScore}%).</p>
                  )}
                  {mode === "full" && (
                    <p style={sectionTextStyle}>• Target an overall Performance Score of <strong>{nextTargetScore}%+</strong> (Currently {combinedIRS}%).</p>
                  )}
                  <p style={sectionTextStyle}>
                    {mode === "technical"
                      ? "• Articulate architectural trade-offs, scalability bottlenecks, and production tool choices."
                      : mode === "hr"
                      ? "• Structure all HR answers with clear Situation, Action, and Quantifiable Impact."
                      : "• Balance technical architectural depth with structured STAR behavioral metrics."
                    }
                  </p>
                </div>
              </div>

            </div>

            <button onClick={onHome} style={{
              padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 30px rgba(37,99,235,0.4)"
            }}>
              Start Another Session
            </button>
          </div>
        )}

        {activeTab === "breakdown" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[...hrLog, ...techLog].map((item, i) => (
              <div key={i} style={{
                padding: "20px", borderRadius: 14, background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  Q{i + 1}: {item.q}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 10, fontStyle: "italic" }}>
                  Candidate Spoken Answer: "{item.a}"
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: 8, background: "rgba(37,99,235,0.2)",
                    color: "#60a5fa", fontSize: 12, fontWeight: 700
                  }}>
                    Score: {item.score} / 5 ({item.label})
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    Fillers detected: {item.fillers || 0}
                  </span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>
                  Feedback: {item.feedback}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const subCardStyle = {
  padding: "14px", borderRadius: 12, background: "rgba(2,6,23,0.5)",
  border: "1px solid rgba(255,255,255,0.06)", textAlign: "center"
};

const sectionTitleStyle = {
  color: "#fff", fontSize: 16, fontWeight: 800, margin: "0 0 8px", letterSpacing: "0.02em"
};

const sectionTextStyle = {
  color: "#cbd5e1", fontSize: 13.5, lineHeight: 1.65, margin: 0
};
