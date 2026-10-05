import { useState, useEffect, useRef } from "react";
import { ROLES, ALL_QUESTIONS } from "./questionsData";
import { PageResume } from "./PageResume";
import { PageInterview } from "./PageInterview";
import { PageResults } from "./PageResults";
import { PageRoleMatching } from "./PageRoleMatching";
import { ResumeBuilder } from "./ResumeBuilder";
import { PageModeSelect } from "./PageModeSelect";
import { generateResumeQuestions } from "./hrQuestions";

// ── Root App Component ────────────────────────────────────────
export default function App() {
  const [nickname, setNickname] = useState("");
  const [page, setPage] = useState("home"); // Page 1: Welcome Home Page

  const [role, setRole] = useState(null);
  const [isDirectPractice, setIsDirectPractice] = useState(false);

  const [sessionConfig, setSessionConfig] = useState({
    resumeText: "",
    resumeFileName: "",
    mode: "full",
    personalizedQuestions: []
  });
  const [results, setResults] = useState(null);

  const goHome = () => {
    window.speechSynthesis && window.speechSynthesis.cancel();
    setPage("home");
    setRole(null);
    setResults(null);
    setIsDirectPractice(false);
  };

  const handleSwitchUser = () => {
    window.speechSynthesis && window.speechSynthesis.cancel();
    localStorage.removeItem("pranishree_current_user");
    setNickname("");
    setRole(null);
    setResults(null);
    setPage("nickname");
  };

  // Helper to save session to localStorage
  const saveSessionToHistory = (sessionResults) => {
    if (!nickname || nickname.toLowerCase().includes("guest")) return;
    const sessionKey = `pranishree_sessions_${nickname}`;
    const existing = JSON.parse(localStorage.getItem(sessionKey) || "[]");

    const newSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: sessionResults.role?.label || "Technical Candidate",
      roleIcon: sessionResults.role?.icon || "⚡",
      roleId: sessionResults.role?.id || "fullstack",
      mode: sessionResults.mode || "full",
      combinedIRS: sessionResults.combinedIRS || 0,
      recommendation: sessionResults.recommendation || "Not Recommended",
      hrIRS: sessionResults.hrIRS || 0,
      techIRS: sessionResults.techIRS || 0,
      totalFillers: sessionResults.totalFillers || 0,
      warnings: sessionResults.warnings || 0,
      questionsAsked: sessionResults.totalAsked || 10,
      answered: sessionResults.answeredCount || 0,
      rounds: [...(sessionResults.hrLog || []), ...(sessionResults.techLog || [])]
    };

    const updated = [newSession, ...existing];
    // Keep max 50 sessions per user
    if (updated.length > 50) {
      updated.length = 50;
    }
    localStorage.setItem(sessionKey, JSON.stringify(updated));
  };

  return (
    <div style={{ position:"relative", minHeight:"100vh", color:"#e2e8f0", fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", overflowX:"hidden" }}>
      <MovingFogBackground />

      {/* Persistent Top Navigation Bar */}
      {nickname && page !== "nickname" && page !== "interview" && (
        <AppHeader
          nickname={nickname}
          onGoHome={goHome}
          onOpenHistory={() => setPage("history")}
          onSwitchUser={handleSwitchUser}
          showHistory={page !== "home"}
        />
      )}

      <div style={{ position:"relative", zIndex:1, minHeight:"100vh" }}>
        {/* Page 1: Welcome Home Screen */}
        {page === "home" && (
          <PageHome
            nickname={nickname}
            onStart={() => setPage("nickname")}
          />
        )}

        {/* Page 2: Who is practicing today? Nickname Screen */}
        {page === "nickname" && (
          <PageNickname
            onSetNickname={(name) => {
              setNickname(name);
              setPage("options"); // Page 3: Interview Options Page
            }}
          />
        )}

        {page === "options" && (
          <PageOptions
            onBack={() => setPage("home")}
            onSelectPractice={() => {
              setIsDirectPractice(true);
              setPage("roles");
            }}
            onSelectMatching={() => {
              setIsDirectPractice(false);
              setPage("matching");
            }}
            onSelectBuilder={() => {
              setIsDirectPractice(false);
              setPage("builder");
            }}
          />
        )}

        {page === "roles" && (
          <PageRoles
            onBack={() => setPage("options")}
            onPick={r => {
              setRole(r);
              if (isDirectPractice) {
                setPage("modeselect");
              } else {
                setPage("resume");
              }
            }}
          />
        )}

        {page === "modeselect" && role && (
          <PageModeSelect
            role={role}
            onBack={() => setPage("roles")}
            onSelectMode={modeConfig => {
              const { mode: selectedMode, avatar, durationSeconds } = typeof modeConfig === "object" ? modeConfig : { mode: modeConfig };
              setSessionConfig({
                resumeText: "",
                resumeFileName: "",
                mode: selectedMode || "full",
                avatar,
                durationSeconds: durationSeconds || 420,
                personalizedQuestions: []
              });
              setPage("ready");
            }}
          />
        )}

        {page === "matching" && (
          <PageRoleMatching
            onBack={() => setPage("options")}
            onStartMatchedInterview={({ role: r, sessionConfig: cfg }) => {
              setRole(r);
              setSessionConfig(cfg);
              setPage("ready");
            }}
          />
        )}

        {page === "builder" && (
          <ResumeBuilder
            onBack={() => setPage("options")}
            onStartInterviewWithBuiltResume={async (builtText) => {
              const matchedRole = ROLES[0];
              const genQs = await generateResumeQuestions(builtText, matchedRole.label);
              setRole(matchedRole);
              setSessionConfig({
                resumeText: builtText,
                resumeFileName: "built_resume.txt",
                mode: "full",
                personalizedQuestions: genQs
              });
              setPage("ready");
            }}
          />
        )}

        {page === "resume" && role && (
          <PageResume
            role={role}
            onBack={() => setPage("roles")}
            onProceed={cfg => {
              setSessionConfig(cfg);
              setPage("ready");
            }}
          />
        )}

        {page === "ready" && role && (
          <PageReady
            role={role}
            sessionConfig={sessionConfig}
            onBegin={() => setPage("interview")}
            onBack={() => setPage(isDirectPractice ? "modeselect" : "resume")}
          />
        )}

        {page === "interview" && role && (
          <PageInterview
            role={role}
            sessionConfig={sessionConfig}
            onDone={r => {
              const fullResults = { ...r, role };
              setResults(fullResults);
              saveSessionToHistory(fullResults);
              setPage("results");
            }}
          />
        )}

        {page === "results" && results && (
          <PageResults results={results} onHome={goHome} />
        )}

        {page === "history" && (
          <PageHistory
            nickname={nickname}
            onBack={goHome}
            onRetryRole={(selectedRoleId) => {
              const foundRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
              setRole(foundRole);
              setIsDirectPractice(true);
              setPage("modeselect");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Persistent Top App Header ────────────────────────────────
function AppHeader({ nickname, onGoHome, onOpenHistory, onSwitchUser, showHistory = true }) {
  return (
    <div style={{
      position: "relative", zIndex: 10, padding: "12px 24px",
      background: "rgba(15,23,42,0.85)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)", display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#fff", fontWeight: 900
        }}>✥</div>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: "0.05em" }}>
          PRANISHREE
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          padding: "6px 14px", borderRadius: 20, background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", fontSize: 13, fontWeight: 700
        }}>
          👋 Hi, {nickname}!
        </div>

        {showHistory && (
          <button onClick={onOpenHistory} style={{
            padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>
            📊 My History
          </button>
        )}

        <button onClick={onSwitchUser} style={{
          padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>
          👤 Switch User
        </button>
      </div>
    </div>
  );
}

// ── 1. NICKNAME SCREEN ───────────────────────────────────────
function PageNickname({ onSetNickname }) {
  const [inputName, setInputName] = useState("");
  const [error, setError] = useState("");
  const [recentNames, setRecentNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pranishree_recent_names") || "[]");
    } catch (e) {
      return [];
    }
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = inputName.trim();
    if (clean.length < 2) {
      setError("Nickname must be at least 2 characters long.");
      return;
    }

    // Save active nickname
    localStorage.setItem("pranishree_current_user", clean);

    // Save to recent names (max 5)
    const updatedRecent = [clean, ...recentNames.filter(n => n !== clean)].slice(0, 5);
    localStorage.setItem("pranishree_recent_names", JSON.stringify(updatedRecent));

    onSetNickname(clean);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", background: "transparent"
    }}>
      <div style={{
        maxWidth: 460, width: "100%", padding: "40px 32px", textAlign: "center",
        background: "rgba(15,23,42,0.85)", borderRadius: 24,
        border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(16px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
      }}>
        {/* PRANISHREE Corporate Logo */}
        <div style={{
          width: 76, height: 76, borderRadius: 20,
          background: "linear-gradient(135deg,#3b82f6,#1d4ed8,#0f766e)",
          margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 38, color: "#fff", boxShadow: "0 10px 30px rgba(59,130,246,0.4)"
        }}>✥</div>

        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>
          Who is practicing today?
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 28px" }}>
          Enter your nickname to save your interview history and track progress over time.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputName}
            onChange={(e) => { setInputName(e.target.value); setError(""); }}
            placeholder="Enter your nickname..."
            autoFocus
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 12,
              background: "rgba(2,6,23,0.8)", border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 15, outline: "none", marginBottom: 12, textAlign: "center"
            }}
          />

          {error && (
            <div style={{ color: "#f87171", fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" style={{
            width: "100%", padding: "15px", borderRadius: 12,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
            border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(37,99,235,0.4)", transition: "transform 0.15s"
          }}>
            Save History &amp; Start →
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Guest Practice Mode Option */}
        <button
          onClick={() => {
            localStorage.removeItem("pranishree_current_user");
            onSetNickname("Guest Candidate");
          }}
          style={{
            width: "100%", padding: "13px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)",
            color: "#93c5fd", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            transition: "all 0.2s"
          }}
        >
          <span>🕵️ Attend Interview Without Storing History</span>
          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 400 }}>
            Incognito Mode — Full interview evaluation shown, zero saved history
          </span>
        </button>

        {/* Recent Nickname Chips */}
        {recentNames.length > 0 && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
              RECENT PROFILES
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {recentNames.map(name => (
                <button key={name} onClick={() => { setInputName(name); setError(""); }}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#93c5fd", cursor: "pointer"
                  }}>
                  👤 {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 4. HISTORY PAGE ──────────────────────────────────────────
function PageHistory({ nickname, onBack, onRetryRole }) {
  const [sessions, setSessions] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "best" | "worst"
  const [selectedDetailSession, setSelectedDetailSession] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`pranishree_sessions_${nickname}`) || "[]");
      setSessions(stored);
    } catch (e) {
      setSessions([]);
    }
  }, [nickname]);

  // Handle Export History JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pranishree_${nickname}_history.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Clear History
  const handleClearHistory = () => {
    if (window.confirm(`Are you sure you want to clear all interview history for "${nickname}"? This action cannot be undone.`)) {
      localStorage.removeItem(`pranishree_sessions_${nickname}`);
      setSessions([]);
    }
  };

  // Calculate Aggregated Metrics
  const totalSessions = sessions.length;
  const avgIRS = totalSessions > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.combinedIRS || 0), 0) / totalSessions) : 0;
  
  let bestSession = null;
  if (totalSessions > 0) {
    bestSession = [...sessions].sort((a, b) => (b.combinedIRS || 0) - (a.combinedIRS || 0))[0];
  }

  // Calculate Streak
  let streak = 0;
  if (totalSessions > 0) {
    const uniqueDates = [...new Set(sessions.map(s => s.date))];
    streak = uniqueDates.length; // Simplified active practice days counter
  }

  // Filter & Sort Sessions
  let filtered = sessions.filter(s => {
    if (roleFilter !== "All" && s.role !== roleFilter) return false;
    if (modeFilter !== "All" && s.mode !== modeFilter) return false;
    return true;
  });

  if (sortBy === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sortBy === "best") {
    filtered.sort((a, b) => (b.combinedIRS || 0) - (a.combinedIRS || 0));
  } else if (sortBy === "worst") {
    filtered.sort((a, b) => (a.combinedIRS || 0) - (b.combinedIRS || 0));
  }

  // Aggregate Role-Wise Performance
  const roleStats = {};
  sessions.forEach(s => {
    if (!roleStats[s.role]) {
      roleStats[s.role] = { role: s.role, icon: s.roleIcon, roleId: s.roleId, list: [] };
    }
    roleStats[s.role].list.push(s);
  });

  const roleWiseSummary = Object.values(roleStats).map(rObj => {
    const count = rObj.list.length;
    const avg = Math.round(rObj.list.reduce((acc, curr) => acc + curr.combinedIRS, 0) / count);
    const lastSessionScore = rObj.list[0].combinedIRS;
    let trend = "● Stable";
    if (count > 1) {
      trend = lastSessionScore >= avg ? "↑ Improving" : "↓ Declining";
    }
    return { ...rObj, count, avg, trend };
  });

  // Aggregate Weak Questions (Score <= 2)
  const weakQuestionsMap = {};
  sessions.forEach(s => {
    (s.rounds || []).forEach(qObj => {
      if (qObj.score && qObj.score <= 2 && qObj.q) {
        if (!weakQuestionsMap[qObj.q]) {
          weakQuestionsMap[qObj.q] = { question: qObj.q, failCount: 0, totalAttempts: 0 };
        }
        weakQuestionsMap[qObj.q].failCount++;
        weakQuestionsMap[qObj.q].totalAttempts++;
      }
    });
  });

  const topWeakQuestions = Object.values(weakQuestionsMap)
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, 5);

  const uniqueRolesInHistory = ["All", ...new Set(sessions.map(s => s.role))];

  return (
    <div style={{ minHeight: "100vh", padding: "28px 20px", background: "transparent" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
              SESSION HISTORY &amp; PERFORMANCE ANALYTICS
            </div>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "4px 0 0" }}>
              {nickname}'s Interview History
            </h2>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {totalSessions > 0 && (
              <>
                <button onClick={handleExportJSON} style={{
                  padding: "10px 16px", borderRadius: 10, background: "rgba(52,211,153,0.15)",
                  border: "1px solid #34d399", color: "#34d399", fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>
                  📥 Export JSON
                </button>
                <button onClick={handleClearHistory} style={{
                  padding: "10px 16px", borderRadius: 10, background: "rgba(239,68,68,0.15)",
                  border: "1px solid #f87171", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>
                  🗑️ Clear History
                </button>
              </>
            )}
            <button onClick={onBack} style={{
              padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              ← Back to Home
            </button>
          </div>
        </div>

        {totalSessions === 0 ? (
          <div style={{
            padding: "60px 20px", textAlign: "center", borderRadius: 20,
            background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
              No Interview History Found
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              Complete your first interview session to unlock progress charts, analytics, and session history!
            </p>
            <button onClick={onBack} style={{
              padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              Start an Interview Session →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* A) STATS SUMMARY BAR */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <div style={historyStatCardStyle}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>TOTAL SESSIONS</div>
                <div style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginTop: 4 }}>{totalSessions}</div>
              </div>
              <div style={historyStatCardStyle}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>AVERAGE IRS SCORE</div>
                <div style={{ color: "#60a5fa", fontSize: 28, fontWeight: 900, marginTop: 4 }}>{avgIRS}%</div>
              </div>
              <div style={historyStatCardStyle}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>BEST IRS EVER</div>
                <div style={{ color: "#34d399", fontSize: 24, fontWeight: 900, marginTop: 4 }}>
                  {bestSession ? `${bestSession.combinedIRS}%` : "0%"}
                  <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{bestSession?.role}</div>
                </div>
              </div>
              <div style={historyStatCardStyle}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>PRACTICE STREAK</div>
                <div style={{ color: "#fbbf24", fontSize: 28, fontWeight: 900, marginTop: 4 }}>
                  🔥 {streak} {streak === 1 ? "Day" : "Days"}
                </div>
              </div>
            </div>

            {/* B) PROGRESS SVG LINE CHART */}
            <div style={{
              padding: "24px", borderRadius: 20, background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(12px)"
            }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                📈 IRS Progress Chart (Last 10 Sessions)
              </div>
              <PureSvgProgressChart sessions={sessions.slice(0, 10).reverse()} />
            </div>

            {/* 5. ROLE-WISE PERFORMANCE */}
            <div style={{
              padding: "24px", borderRadius: 20, background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>
                🎯 Performance by Role
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {roleWiseSummary.map(r => (
                  <div key={r.role} style={{
                    padding: "16px", borderRadius: 14, background: "rgba(2,6,23,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{r.icon} {r.role}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{r.count} {r.count === 1 ? "session" : "sessions"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#60a5fa", fontSize: 18, fontWeight: 800 }}>Avg {r.avg}%</div>
                      <div style={{
                        color: r.trend.includes("↑") ? "#34d399" : r.trend.includes("↓") ? "#f87171" : "#94a3b8",
                        fontSize: 11, fontWeight: 700
                      }}>{r.trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. WEAK TOPICS TRACKER */}
            {topWeakQuestions.length > 0 && (
              <div style={{
                padding: "24px", borderRadius: 20, background: "rgba(15,23,42,0.85)",
                border: "1px solid rgba(251,191,36,0.3)"
              }}>
                <h3 style={{ color: "#fbbf24", fontSize: 16, fontWeight: 800, margin: "0 0 14px" }}>
                  ⚠️ Questions You Keep Struggling With (Score ≤ 2/5)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {topWeakQuestions.map((wq, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", borderRadius: 12, background: "rgba(2,6,23,0.5)",
                      border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>"{wq.question}"</div>
                      <div style={{ color: "#f87171", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 12 }}>
                        Failed {wq.failCount} {wq.failCount === 1 ? "time" : "times"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C) FILTER & SORT CONTROLS */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, marginRight: 6 }}>Filter Role:</label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={selectFilterStyle}>
                  {uniqueRolesInHistory.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, marginRight: 6 }}>Filter Mode:</label>
                <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} style={selectFilterStyle}>
                  <option value="All">All Modes</option>
                  <option value="full">Full Pipeline</option>
                  <option value="technical">Technical Only</option>
                  <option value="hr">HR Only</option>
                </select>
              </div>

              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, marginRight: 6 }}>Sort By:</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectFilterStyle}>
                  <option value="newest">Newest First</option>
                  <option value="best">Best Score</option>
                  <option value="worst">Worst Score</option>
                </select>
              </div>
            </div>

            {/* C) SESSION LIST CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map(s => {
                const badgeColor = s.combinedIRS >= 75 ? "#34d399" : s.combinedIRS >= 50 ? "#fbbf24" : "#f87171";
                return (
                  <div key={s.id} style={{
                    padding: "20px", borderRadius: 16, background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 32 }}>{s.roleIcon}</div>
                      <div>
                        <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{s.role}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                          {s.date} at {s.time} · <span style={{ color: "#60a5fa", fontWeight: 700 }}>{s.mode.toUpperCase()} MODE</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: badgeColor, fontSize: 24, fontWeight: 900 }}>{s.combinedIRS}%</div>
                        <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{s.recommendation}</div>
                      </div>

                      <button onClick={() => setSelectedDetailSession(s)} style={{
                        padding: "10px 18px", borderRadius: 10, background: "rgba(37,99,235,0.2)",
                        border: "1px solid #60a5fa", color: "#60a5fa", fontSize: 13, fontWeight: 700, cursor: "pointer"
                      }}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* D) DETAIL VIEW MODAL */}
        {selectedDetailSession && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 100,
            background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}>
            <div style={{
              maxWidth: 720, width: "100%", maxHeight: "85vh", overflowY: "auto",
              padding: "28px", background: "#0f172a", borderRadius: 20,
              border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700 }}>SESSION TRANSCRIPT DETAIL</div>
                  <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "2px 0 0" }}>
                    {selectedDetailSession.roleIcon} {selectedDetailSession.role} ({selectedDetailSession.combinedIRS}%)
                  </h3>
                </div>
                <button onClick={() => setSelectedDetailSession(null)} style={{
                  background: "transparent", border: "none", color: "#94a3b8", fontSize: 24, cursor: "pointer"
                }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                <div style={subDetailBoxStyle}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Fillers Detected</div>
                  <div style={{ color: "#fbbf24", fontSize: 18, fontWeight: 800 }}>{selectedDetailSession.totalFillers}</div>
                </div>
                <div style={subDetailBoxStyle}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Questions Attempted</div>
                  <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{selectedDetailSession.answered} / {selectedDetailSession.questionsAsked}</div>
                </div>
                <div style={subDetailBoxStyle}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Warnings</div>
                  <div style={{ color: "#f87171", fontSize: 18, fontWeight: 800 }}>{selectedDetailSession.warnings}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {(selectedDetailSession.rounds || []).map((rItem, i) => (
                  <div key={i} style={{
                    padding: "16px", borderRadius: 12, background: "rgba(2,6,23,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    <div style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Q{i + 1}: {rItem.q}
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 8, fontStyle: "italic" }}>
                      Spoken Answer: "{rItem.a}"
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Feedback: {rItem.feedback}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => {
                  const roleIdToRetry = selectedDetailSession.roleId;
                  setSelectedDetailSession(null);
                  onRetryRole(roleIdToRetry);
                }} style={{
                  flex: 1, padding: "14px", borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}>
                  🔄 Retry This Role Interview
                </button>
                <button onClick={() => setSelectedDetailSession(null)} style={{
                  padding: "14px 24px", borderRadius: 12, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── B) PURE SVG PROGRESS LINE CHART COMPONENT ────────────────
function PureSvgProgressChart({ sessions }) {
  if (!sessions || sessions.length === 0) return null;

  const W = 600, H = 160;
  const padding = 30;

  const scores = sessions.map(s => s.combinedIRS || 0);
  const isTrendingUp = scores.length > 1 ? scores[scores.length - 1] >= scores[0] : true;
  const strokeColor = isTrendingUp ? "#34d399" : "#f87171";

  const points = scores.map((val, idx) => {
    const x = padding + (idx / Math.max(1, scores.length - 1)) * (W - padding * 2);
    const y = H - padding - (val / 100) * (H - padding * 2);
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width={W} height={H} style={{ width: "100%", height: "auto" }}>
        {/* Horizontal Gridlines */}
        {[25, 50, 75, 100].map(gridVal => {
          const y = H - padding - (gridVal / 100) * (H - padding * 2);
          return (
            <g key={gridVal}>
              <line x1={padding} y1={y} x2={W - padding} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <text x={10} y={y + 4} fill="#64748b" fontSize="10">{gridVal}%</text>
            </g>
          );
        })}

        {/* Line Path */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />

        {/* Data Circles */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={strokeColor} stroke="#0f172a" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
              {p.val}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const historyStatCardStyle = {
  padding: "18px", borderRadius: 16, background: "rgba(15,23,42,0.8)",
  border: "1px solid rgba(255,255,255,0.08)", textAlign: "center"
};

const subDetailBoxStyle = {
  padding: "12px", borderRadius: 10, background: "rgba(2,6,23,0.5)",
  border: "1px solid rgba(255,255,255,0.06)", textAlign: "center"
};

const selectFilterStyle = {
  padding: "8px 14px", borderRadius: 10, background: "rgba(15,23,42,0.8)",
  border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none"
};

// ── Home Page ─────────────────────────────────────────────────
function PageHome({ nickname, onStart }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"transparent", position:"relative", overflow:"hidden"
    }}>
      <div style={{ textAlign:"center", maxWidth:560, padding:"0 24px", position:"relative", zIndex:1 }}>

        {/* Corporate Logo Badge */}
        <div style={{
          width:92, height:92, borderRadius:24,
          background:"linear-gradient(135deg,#3b82f6,#1d4ed8,#0f766e)",
          margin:"0 auto 24px", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:44, boxShadow:"0 12px 40px rgba(59,130,246,0.4)",
          border:"1px solid rgba(255,255,255,0.2)"
        }}>✥</div>

        <p style={{
          color:"#60a5fa", fontSize:13, fontWeight:700, letterSpacing:"0.22em",
          textTransform:"uppercase", margin:"0 0 6px"
        }}>Welcome back, {nickname || "Candidate"}</p>

        <h1 style={{
          color:"#fff", fontSize:44, fontWeight:900, margin:"0 0 8px",
          letterSpacing:"0.04em"
        }}>PRANISHREE</h1>

        <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, margin:"0 0 32px" }}>
          Your AI-powered interview coach that evaluates communication, confidence, and technical skills.
        </p>

        {/* Feature grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:32 }}>
          {[
            ["🤖","AI-Spoken Questions"],
            ["🎤","Voice Answer Evaluation"],
            ["👥","Multi-Person Detection"],
            ["📱","Mobile Phone Hardware Detection"],
          ].map(([ic,t]) => (
            <div key={t} style={{
              display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
              background:"rgba(15,23,42,0.65)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12, backdropFilter:"blur(8px)"
            }}>
              <span style={{ fontSize:20 }}>{ic}</span>
              <span style={{ color:"#cbd5e1", fontSize:13, fontWeight:600 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button onClick={onStart} style={{
            padding:"16px 40px",
            background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
            color:"#fff", border:"none", borderRadius:12, cursor:"pointer",
            fontSize:16, fontWeight:700, letterSpacing:"0.04em",
            boxShadow:"0 8px 30px rgba(37,99,235,0.4)"
          }}>
            Start Assessment →
          </button>
        </div>

        <p style={{ color:"#64748b", fontSize:12, marginTop:20 }}>
          Best experienced on Chrome · Camera &amp; Microphone required
        </p>
      </div>
    </div>
  );
}

// ── Entry Options Page ───────────────────────────────────────
function PageOptions({ onBack, onSelectPractice, onSelectMatching, onSelectBuilder }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", background: "transparent"
    }}>
      <div style={{ maxWidth: 860, width: "100%" }}>
        <BtnSmall onClick={onBack} label="← Back to Welcome" />

        <div style={{ textAlign: "center", margin: "20px 0 32px" }}>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>
            Choose Your Interview Experience
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Select how you would like to begin your AI interview assessment session today.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {/* Option 1 */}
          <div onClick={onSelectPractice}
            style={{
              padding: "28px 20px", borderRadius: 20, textAlign: "left", cursor: "pointer",
              background: "rgba(15,23,42,0.75)", border: "1px solid rgba(59,130,246,0.3)",
              backdropFilter: "blur(12px)", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div>
              <div style={{ fontSize: 38, marginBottom: 14 }}>🎯</div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                1. Direct Role Interview
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Select directly from <strong>22 specialized technical roles</strong>. Select HR, Technical, or Both modes. No resume needed.
              </p>
            </div>
            <button style={{
              marginTop: 24, padding: "10px 16px", borderRadius: 10,
              background: "rgba(37,99,235,0.2)", border: "1px solid #60a5fa", color: "#60a5fa",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              Select Role &amp; Mode →
            </button>
          </div>

          {/* Option 2 */}
          <div onClick={onSelectMatching}
            style={{
              padding: "28px 20px", borderRadius: 20, textAlign: "left", cursor: "pointer",
              background: "rgba(15,23,42,0.75)", border: "1px solid rgba(52,211,153,0.3)",
              backdropFilter: "blur(12px)", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div>
              <div style={{ fontSize: 38, marginBottom: 14 }}>📄</div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                2. AI Resume Matching
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Upload your resume. AI matches your skills to top roles and asks <strong>100% project-tailored interview questions</strong>.
              </p>
            </div>
            <button style={{
              marginTop: 24, padding: "10px 16px", borderRadius: 10,
              background: "rgba(52,211,153,0.15)", border: "1px solid #34d399", color: "#34d399",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              Upload &amp; Match Role →
            </button>
          </div>

          {/* Option 3 */}
          <div onClick={onSelectBuilder}
            style={{
              padding: "28px 20px", borderRadius: 20, textAlign: "left", cursor: "pointer",
              background: "rgba(15,23,42,0.75)", border: "1px solid rgba(251,191,36,0.3)",
              backdropFilter: "blur(12px)", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div>
              <div style={{ fontSize: 38, marginBottom: 14 }}>📝</div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                3. Build Your Resume
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Build an ATS-friendly resume with Summary, Skills, Projects, Achievements &amp; Certificates. Chat with Resume AI Coach.
              </p>
            </div>
            <button style={{
              marginTop: 24, padding: "10px 16px", borderRadius: 10,
              background: "rgba(251,191,36,0.15)", border: "1px solid #fbbf24", color: "#fbbf24",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              Build ATS Resume →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Roles Page ────────────────────────────────────────────────
function PageRoles({ onBack, onPick }) {
  const [hov, setHov] = useState(null);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const baseList = cat === "All" ? ROLES : ROLES.filter(r => r.category === cat);
  const list = search.trim() === ""
    ? baseList
    : ROLES.filter(r =>
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        (r.category || "").toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div style={{ minHeight:"100vh", padding:"28px 20px", background:"transparent" }}>
      <BtnSmall onClick={onBack} label="← Back to Options" />
      <div style={{ maxWidth:960, margin:"20px auto 0" }}>

        {/* Search Input Bar for 100 Roles */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search 100+ target roles (e.g. Security, React, Python, Data Engineer, QA, Full Stack)..."
              style={{
                width: "100%", padding: "14px 20px", paddingRight: 40, borderRadius: 14,
                background: "rgba(15,23,42,0.85)", border: "1px solid rgba(59,130,246,0.4)",
                color: "#fff", fontSize: 14, outline: "none", backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", color: "#94a3b8", fontSize: 16,
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tab Selector for 100 Roles */}
        <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
          {["All", "Software Development", "AI, ML & Data", "Cloud & DevOps", "Security", "Mobile & Systems", "Product & Strategy", "QA & Testing", "Web3 & Blockchain", "Finance & Quant", "Frontier Tech 2026"].map(c => (
            <button key={c} onClick={() => { setCat(c); setSearch(""); }}
              style={{
                padding:"8px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
                background: cat === c && !search ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(15,23,42,0.65)",
                color: cat === c && !search ? "#fff" : "#94a3b8",
                border: cat === c && !search ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                backdropFilter:"blur(8px)", transition:"all 0.15s"
              }}>
              {c}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div style={{
            padding: "48px 20px", textAlign: "center", background: "rgba(15,23,42,0.6)",
            borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>No roles matching "{search}" found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try searching for generic keywords like "Engineer", "Data", "Security", or "Developer".</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
            {list.map(r => (
              <button key={r.id} onClick={() => onPick(r)}
                onMouseEnter={() => setHov(r.id)} onMouseLeave={() => setHov(null)}
                style={{ padding:"18px 16px", textAlign:"left", cursor:"pointer", borderRadius:14,
                  background:hov===r.id?"rgba(37,99,235,0.2)":"rgba(15,23,42,0.65)",
                  border:`1px solid ${hov===r.id?"rgba(96,165,250,0.5)":"rgba(255,255,255,0.08)"}`,
                  backdropFilter:"blur(8px)",
                  fontFamily:"inherit", transition:"all 0.15s" }}>
                <div style={{ fontSize:26, marginBottom:8 }}>{r.icon}</div>
                <div style={{ color:hov===r.id?"#60a5fa":"#f1f5f9", fontSize:14, fontWeight:700 }}>{r.label}</div>
                <div style={{ color:"#64748b", fontSize:11, marginTop:4 }}>
                  {(ALL_QUESTIONS[r.id] || []).length} Questions Pool · 10 per session
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ready / Device Check ──────────────────────────────────────
function PageReady({ role, sessionConfig, onBegin, onBack }) {
  const [step, setStep] = useState("idle");
  const [camOk, setCamOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [micErr, setMicErr] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const durationSec = sessionConfig?.durationSeconds || 420;
  const timeMins = Math.round(durationSec / 60);

  useEffect(() => {
    return () => { streamRef.current && streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleCheck = () => {
    setStep("checking");
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch(e) {}

    navigator.mediaDevices.getUserMedia({ video:true, audio:false })
      .then(stream => {
        streamRef.current = stream;
        setCamOk(true); setCamErr("");
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }
      })
      .catch(err => setCamErr(err.name==="NotAllowedError"?"Blocked — allow in browser address bar":err.message));

    navigator.mediaDevices.getUserMedia({ audio:true, video:false })
      .then(s => { s.getTracks().forEach(t=>t.stop()); setMicOk(true); setMicErr(""); })
      .catch(err => setMicErr(err.name==="NotAllowedError"?"Blocked — allow in browser address bar":err.message));

    setTimeout(() => setStep("ready"), 2000);
  };

  const handleBegin = () => {
    streamRef.current && streamRef.current.getTracks().forEach(t => t.stop());
    onBegin();
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", background:"transparent" }}>
      <div style={{ maxWidth:500, width:"100%", textAlign:"center", padding:"30px", background:"rgba(15,23,42,0.75)", borderRadius:18, border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(12px)" }}>
        <div style={{ fontSize:42, marginBottom:8 }}>{role.icon}</div>
        <h2 style={{ color:"#fff", fontSize:22, fontWeight:700, margin:"0 0 8px" }}>{role.label}</h2>
        <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 24px", lineHeight:1.7 }}>
          Click below to initialize camera monitoring &amp; microphone.<br/>
          <strong style={{ color:"#fbbf24" }}>⏱️ Max Session Time: {timeMins} Minutes</strong>
        </p>

        {step==="idle" && (
          <button onClick={handleCheck} style={{ padding:"18px 52px", width:"100%",
            background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff",
            border:"none", borderRadius:12, cursor:"pointer", fontSize:16, fontWeight:700,
            boxShadow:"0 8px 30px rgba(37,99,235,0.4)", marginBottom:14 }}>
            🎤 Allow Devices &amp; Begin
          </button>
        )}

        {(step==="checking"||step==="ready") && (
          <div style={{ marginBottom:20 }}>
            <div style={{ width:"100%", height:190, borderRadius:12, overflow:"hidden",
              background:"#020617", border:"2px solid rgba(59,130,246,0.4)", marginBottom:16,
              position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width:"100%", height:"100%", objectFit:"cover",
                  transform:"scaleX(-1)", display:camOk?"block":"none" }} />
              {!camOk && (
                <div style={{ color:"#64748b", textAlign:"center" }}>
                  <div style={{ fontSize:32 }}>📷</div>
                  <div style={{ fontSize:12, marginTop:6 }}>{camErr||"Initializing camera..."}</div>
                </div>
              )}
              {camOk && (
                <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.75)",
                  padding:"4px 10px", borderRadius:6, color:"#34d399", fontSize:11, fontWeight:600 }}>
                  ✓ Camera active
                </div>
              )}
            </div>

            {[
              { label:"📷  Camera & Multi-Person Monitor", ok:camOk, err:camErr },
              { label:"🎤  Microphone", ok:micOk, err:micErr },
              { label:"🔊  AI Synthesizer", ok:step==="ready", err:"" },
            ].map(item => (
              <div key={item.label} style={{ display:"flex", alignItems:"center",
                justifyContent:"space-between", padding:"11px 16px", marginBottom:8,
                background:"rgba(255,255,255,0.04)",
                border:`1px solid ${item.ok?"rgba(52,211,153,0.3)":item.err?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.08)"}`,
                borderRadius:8 }}>
                <span style={{ color:"#94a3b8", fontSize:14 }}>{item.label}</span>
                <span style={{ fontSize:13, fontWeight:600,
                  color:item.ok?"#34d399":item.err?"#f87171":"#fbbf24" }}>
                  {item.ok?"✓ Ready":item.err?"✗ "+item.err:"⏳ Checking..."}
                </span>
              </div>
            ))}
          </div>
        )}

        {step==="ready" && (
          <button onClick={handleBegin} style={{ padding:"15px 48px", width:"100%",
            background:camOk&&micOk?"linear-gradient(135deg,#059669,#047857)":"linear-gradient(135deg,#2563eb,#1d4ed8)",
            color:"#fff", border:"none", borderRadius:10, cursor:"pointer",
            fontSize:16, fontWeight:700, marginBottom:12,
            boxShadow:"0 8px 24px rgba(5,150,105,0.4)" }}>
            ▶ Begin {timeMins}-Minute Interview Session
          </button>
        )}

        <BtnSmall onClick={onBack} label="← Back" />
      </div>
    </div>
  );
}

function BtnSmall({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ padding:"7px 14px", background:"rgba(255,255,255,0.05)",
      border:"1px solid rgba(255,255,255,0.12)", color:"#cbd5e1", cursor:"pointer",
      borderRadius:8, fontSize:12, fontFamily:"inherit" }}>{label}</button>
  );
}

// ── Dynamic Background Canvas ───────────────────────────────
function MovingFogBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const STAR_COUNT = 500;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2400,
      y: (Math.random() - 0.5) * 2400,
      z: Math.random() * 1000 + 1,
      baseSize: Math.random() * 1.0 + 0.4,
      color: ["#ffffff", "#e2e8f0", "#cbd5e1", "#93c5fd", "#7dd3fc"][Math.floor(Math.random() * 5)],
      twinkleSpeed: Math.random() * 0.03 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2
    }));

    const DUST_COUNT = 75;
    const dustParticles = Array.from({ length: DUST_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.10 + 0.04),
      opacity: Math.random() * 0.35 + 0.15,
      phase: Math.random() * Math.PI * 2,
      color: ["#7dd3fc", "#e2e8f0", "#93c5fd", "#38bdf8"][Math.floor(Math.random() * 4)]
    }));

    const gasClouds = [
      { xRatio: 0.50, yRatio: 0.40, radiusRatio: 0.45, color: "rgba(30, 58, 138, 0.22)", pulseSpeed: 0.0004, phase: 0 },
      { xRatio: 0.48, yRatio: 0.36, radiusRatio: 0.35, color: "rgba(56, 189, 248, 0.10)", pulseSpeed: 0.0006, phase: 1.5 },
      { xRatio: 0.54, yRatio: 0.44, radiusRatio: 0.30, color: "rgba(99, 102, 241, 0.08)", pulseSpeed: 0.0005, phase: 3.0 },
      { xRatio: 0.42, yRatio: 0.33, radiusRatio: 0.40, color: "rgba(15, 23, 42, 0.45)",  pulseSpeed: 0.0003, phase: 4.5 },
      { xRatio: 0.50, yRatio: 0.12, radiusRatio: 0.42, color: "rgba(125, 211, 252, 0.12)", pulseSpeed: 0.0005, phase: 2.0 }
    ];

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.016;

      const cx = width / 2;
      const cy = height * 0.42;

      const maxR = Math.max(width, height);
      const bgGrad = ctx.createRadialGradient(cx, cy * 0.7, 40, cx, cy, maxR * 0.85);
      bgGrad.addColorStop(0, "#0a1128");
      bgGrad.addColorStop(0.30, "#050c1e");
      bgGrad.addColorStop(0.70, "#020612");
      bgGrad.addColorStop(1, "#00030a");

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const topLightGrad = ctx.createRadialGradient(cx, 0, 10, cx, 0, Math.max(width * 0.5, 400));
      topLightGrad.addColorStop(0, "rgba(125, 211, 252, 0.14)");
      topLightGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.07)");
      topLightGrad.addColorStop(0.8, "rgba(27, 46, 60, 0.04)");
      topLightGrad.addColorStop(1, "transparent");
      ctx.fillStyle = topLightGrad;
      ctx.fillRect(0, 0, width, height * 0.6);

      gasClouds.forEach(cloud => {
        const cloudX = width * cloud.xRatio + Math.sin(time * 0.2 + cloud.phase) * 12;
        const cloudY = height * cloud.yRatio + Math.cos(time * 0.15 + cloud.phase) * 10;
        const cloudR = Math.min(width, height) * cloud.radiusRatio * (1 + Math.sin(time * cloud.pulseSpeed) * 0.05);

        const gGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudR);
        gGrad.addColorStop(0, cloud.color);
        gGrad.addColorStop(0.6, cloud.color.replace(/[\d\.]+\)$/, "0.04)"));
        gGrad.addColorStop(1, "transparent");

        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudR, 0, Math.PI * 2);
        ctx.fill();
      });

      const speed = 0.3;
      stars.forEach(star => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 2400;
          star.y = (Math.random() - 0.5) * 2400;
        }

        const k = 420 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= -20 && px <= width + 20 && py >= -20 && py <= height + 20) {
          const starSize = Math.max(0.4, (1 - star.z / 1000) * star.baseSize * 2.0);
          const starAlpha = Math.min(0.75, (1 - star.z / 1000) * 1.0);
          const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed * 6 + star.twinklePhase);

          ctx.globalAlpha = Math.max(0.05, starAlpha * twinkle);

          if (starSize > 2.0) {
            const starGlow = ctx.createRadialGradient(px, py, 0, px, py, starSize * 2.5);
            starGlow.addColorStop(0, star.color);
            starGlow.addColorStop(0.4, "rgba(60, 130, 246, 0.15)");
            starGlow.addColorStop(1, "transparent");
            ctx.fillStyle = starGlow;
            ctx.beginPath();
            ctx.arc(px, py, starSize * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(px, py, starSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      dustParticles.forEach(p => {
        p.x += p.vx + Math.sin(time * 0.4 + p.phase) * 0.12;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulseOpacity = p.opacity * (0.6 + 0.4 * Math.sin(time * 1.0 + p.phase));

        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        pGrad.addColorStop(0, p.color);
        pGrad.addColorStop(0.5, "rgba(125, 211, 252, 0.2)");
        pGrad.addColorStop(1, "transparent");

        ctx.fillStyle = pGrad;
        ctx.globalAlpha = pulseOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
}
