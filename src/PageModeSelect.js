import { useState } from "react";

export const AVATAR_OPTIONS = [
  {
    id: "sophia",
    name: "Sophia",
    gender: "female",
    roleTitle: "Lead Technical Interviewer",
    icon: "👩‍💼",
    image: "/avatars/sophia.png",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    voicePitch: 1.05,
    accent: "#60a5fa"
  },
  {
    id: "alex",
    name: "Alex",
    gender: "male",
    roleTitle: "Engineering Manager",
    icon: "👨‍💻",
    image: "/avatars/alex.png",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #164e63, #0891b2)",
    voicePitch: 0.82,
    accent: "#38bdf8"
  },
  {
    id: "elena",
    name: "Elena",
    gender: "female",
    roleTitle: "Principal Data Architect",
    icon: "👩‍🔬",
    image: "/avatars/elena.png",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #4c1d95, #7c3aed)",
    voicePitch: 1.10,
    accent: "#c084fc"
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    roleTitle: "Corporate Tech Director",
    icon: "👨‍💼",
    image: "/avatars/david.png",
    color: "#059669",
    gradient: "linear-gradient(135deg, #064e3b, #059669)",
    voicePitch: 0.88,
    accent: "#34d399"
  }
];

export const DURATION_OPTIONS = [
  { label: "3 Mins", seconds: 180, desc: "Quick Warmup (3-4 Qs)" },
  { label: "5 Mins", seconds: 300, desc: "Standard Practice (6 Qs)" },
  { label: "7 Mins", seconds: 420, desc: "Recommended (8-10 Qs)" },
  { label: "10 Mins", seconds: 600, desc: "Deep Dive (12 Qs)" },
  { label: "15 Mins", seconds: 900, desc: "Enterprise Mock (15 Qs)" }
];

export function PageModeSelect({ role, onBack, onSelectMode }) {
  const [mode, setMode] = useState("full");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[2]); // Default 7 Mins (420s)

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", background: "transparent"
    }}>
      <div style={{
        maxWidth: 720, width: "100%", padding: "36px 32px",
        background: "rgba(15,23,42,0.85)", borderRadius: 24,
        border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(16px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 6 }}>{role.icon}</div>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{role.label}</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
            Customize your session mode, AI interviewer avatar, and interview time limit.
          </p>
        </div>

        {/* 1. Assessment Mode Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={sectionHeaderStyle}>1. CHOOSE ASSESSMENT MODE</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                id: "full",
                title: "🏆 Full Pipeline (Both HR & Technical)",
                desc: "Complete 2-round assessment: HR Behavioral Questions + Technical Questions."
              },
              {
                id: "technical",
                title: "⚙️ Technical Round Only",
                desc: "Domain & Architecture questions assessing technical accuracy and problem solving."
              },
              {
                id: "hr",
                title: "🤝 HR Behavioral Round Only",
                desc: "Behavioral questions assessing leadership, STAR method structure, and soft skills."
              }
            ].map(m => (
              <div key={m.id} onClick={() => setMode(m.id)}
                style={{
                  padding: "14px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  background: mode === m.id ? "rgba(37,99,235,0.2)" : "rgba(2,6,23,0.6)",
                  border: mode === m.id ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s"
                }}>
                <div style={{ color: mode === m.id ? "#60a5fa" : "#fff", fontSize: 14, fontWeight: 800 }}>{m.title}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Choose AI Avatar (Removed Male/Female voice text tags) */}
        <div style={{ marginBottom: 24 }}>
          <label style={sectionHeaderStyle}>2. CHOOSE YOUR AI INTERVIEWER AVATAR</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {AVATAR_OPTIONS.map(av => (
              <div key={av.id} onClick={() => setSelectedAvatar(av)}
                style={{
                  padding: "14px 10px", borderRadius: 16, cursor: "pointer", textAlign: "center",
                  background: selectedAvatar.id === av.id ? "rgba(37,99,235,0.25)" : "rgba(2,6,23,0.6)",
                  border: selectedAvatar.id === av.id ? `2px solid ${av.accent}` : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center"
                }}>
                <div style={{
                  width: 76, height: 76, borderRadius: "50%", overflow: "hidden", marginBottom: 8,
                  border: `2px solid ${av.accent}`, boxShadow: `0 4px 16px ${av.color}55`
                }}>
                  <img src={av.image} alt={av.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{av.name}</div>
                <div style={{ color: av.accent, fontSize: 11, fontWeight: 600, marginTop: 2 }}>{av.roleTitle}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Choose Interview Time Duration */}
        <div style={{ marginBottom: 28 }}>
          <label style={sectionHeaderStyle}>3. CHOOSE INTERVIEW TIME LIMIT</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {DURATION_OPTIONS.map(d => (
              <div key={d.seconds} onClick={() => setSelectedDuration(d)}
                style={{
                  padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                  background: selectedDuration.seconds === d.seconds ? "rgba(251,191,36,0.2)" : "rgba(2,6,23,0.6)",
                  border: selectedDuration.seconds === d.seconds ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s"
                }}>
                <div style={{ color: selectedDuration.seconds === d.seconds ? "#fbbf24" : "#fff", fontSize: 14, fontWeight: 800 }}>
                  ⏱️ {d.label}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={{
            padding: "14px 20px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", borderRadius: 10,
            cursor: "pointer", fontSize: 14, fontWeight: 600
          }}>
            ← Back
          </button>

          <button onClick={() => onSelectMode({
            mode,
            avatar: selectedAvatar,
            durationSeconds: selectedDuration.seconds,
            durationLabel: selectedDuration.label
          })} style={{
            flex: 1, padding: "14px 24px",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff", border: "none", borderRadius: 10, cursor: "pointer",
            fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(37,99,235,0.4)"
          }}>
            Proceed to Device Check ({selectedDuration.label}) →
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionHeaderStyle = {
  display: "block", color: "#60a5fa", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", marginBottom: 10, textAlign: "left"
};
