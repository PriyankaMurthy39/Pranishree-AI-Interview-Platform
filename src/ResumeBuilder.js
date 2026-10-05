import { useState, useRef, useEffect } from "react";

export function ResumeBuilder({ onBack, onStartInterviewWithBuiltResume }) {
  const [activeTab, setActiveTab] = useState("builder"); // "builder" | "preview" | "coach"

  const [form, setForm] = useState({
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    title: "Senior Full Stack & AI Engineer",
    summary: "Results-oriented Engineer with 5+ years of experience building scalable web applications, machine learning pipelines, and real-time microservices.",
    skills: "JavaScript, TypeScript, React, Node.js, Python, PyTorch, PostgreSQL, Docker, AWS, GraphQL",
    education: "B.S. in Computer Science — California State University (2016–2020)\n• GPA: 3.8/4.0 · Dean's Honor List",
    projects: "Customer Churn Prediction Model: Built XGBoost model achieving 92% ROC-AUC to identify churn risks.\n\nAI Interview Coach App: Full stack voice assessment app built with React, Web Speech API, & Claude AI.",
    achievements: "• Winner, Regional Hackathon 2023 out of 120 teams.\n• Published technical paper on Real-Time Microservice Optimization.",
    experience: "Senior Software Engineer — TechCorp (2022–Present)\n• Architected real-time streaming pipeline processing 10M+ daily events.\n• Reduced frontend bundle load time by 42% via React code-splitting.",
    certifications: "• AWS Certified Solutions Architect – Associate (2023)\n• Oracle Certified Professional Java SE Programmer"
  });

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-builder-container" style={{ minHeight: "100vh", padding: "24px 20px", background: "transparent" }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .resume-printable-doc, .resume-printable-doc * {
            visibility: visible !important;
          }
          .resume-printable-doc {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="no-print" style={{
        maxWidth: 1100, margin: "0 auto 20px", padding: "16px 20px", borderRadius: 16,
        background: "rgba(15,23,42,0.85)", border: "1px solid rgba(59,130,246,0.3)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            padding: "8px 14px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", borderRadius: 8, cursor: "pointer"
          }}>
            ← Back
          </button>
          <div>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>📝 ATS Professional Resume Builder</h2>
            <div style={{ color: "#60a5fa", fontSize: 11 }}>Summary · Skills · Education · Projects · Achievements · Certificates</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "builder", label: "✏️ Edit Details" },
            { id: "preview", label: "📄 Live Professional Resume" },
            { id: "coach", label: "💬 Chat with Resume AI Coach" }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: activeTab === t.id ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "rgba(255,255,255,0.05)",
                color: activeTab === t.id ? "#fff" : "#94a3b8",
                border: activeTab === t.id ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)"
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {activeTab === "builder" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Form */}
            <div className="no-print" style={{
              padding: "24px", borderRadius: 18, background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 14
            }}>
              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>1. Personal &amp; Contact Info</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input placeholder="Full Name" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} style={inputStyle} />
                <input placeholder="Job Title" value={form.title} onChange={e => handleChange("title", e.target.value)} style={inputStyle} />
                <input placeholder="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} style={inputStyle} />
                <input placeholder="Phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} style={inputStyle} />
              </div>

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>2. Executive Summary</h3>
              <textarea rows={3} value={form.summary} onChange={e => handleChange("summary", e.target.value)} style={inputStyle} />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>3. Technical Skills</h3>
              <input value={form.skills} onChange={e => handleChange("skills", e.target.value)} style={inputStyle} />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>4. Education</h3>
              <textarea rows={3} value={form.education} onChange={e => handleChange("education", e.target.value)} style={inputStyle} />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>5. Key Projects</h3>
              <textarea rows={3} value={form.projects} onChange={e => handleChange("projects", e.target.value)} style={inputStyle} />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>6. Achievements (Optional)</h3>
              <textarea rows={2} value={form.achievements} onChange={e => handleChange("achievements", e.target.value)} style={inputStyle} placeholder="Awards, hackathons, publications..." />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>7. Work Experience (Optional)</h3>
              <textarea rows={4} value={form.experience} onChange={e => handleChange("experience", e.target.value)} style={inputStyle} placeholder="Company, title, bullet points..." />

              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "8px 0 0" }}>8. Certifications &amp; Certificates</h3>
              <textarea rows={2} value={form.certifications} onChange={e => handleChange("certifications", e.target.value)} style={inputStyle} placeholder="Certifications, courses..." />

              <button onClick={() => {
                const fullText = `${form.fullName}\n${form.title}\nSummary: ${form.summary}\nTechnical Skills: ${form.skills}\nEducation: ${form.education}\nProjects: ${form.projects}\nAchievements: ${form.achievements}\nExperience: ${form.experience}\nCertifications: ${form.certifications}`;
                onStartInterviewWithBuiltResume(fullText);
              }}
                style={{
                  marginTop: 14, padding: "14px", borderRadius: 10,
                  background: "linear-gradient(135deg,#059669,#047857)", color: "#fff",
                  border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}>
                ▶ Start 100% Project Interview From This Resume →
              </button>
            </div>

            {/* Live Preview */}
            <div className="resume-printable-doc" style={{
              background: "#ffffff", color: "#0f172a", padding: "36px", borderRadius: 8,
              boxShadow: "0 12px 30px rgba(0,0,0,0.3)", fontFamily: "'Helvetica Neue', Arial, sans-serif"
            }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: 12, marginBottom: 16 }}>
                <h1 style={{ margin: 0, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", fontWeight: 800 }}>{form.fullName}</h1>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginTop: 2 }}>{form.title}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{form.email} | {form.phone} | {form.location}</div>
              </div>

              {form.summary && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>SUMMARY</h4>
                  <p style={bodyTextStyle}>{form.summary}</p>
                </div>
              )}

              {form.skills && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>TECHNICAL SKILLS</h4>
                  <p style={bodyTextStyle}>{form.skills}</p>
                </div>
              )}

              {form.education && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>EDUCATION</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.education}</p>
                </div>
              )}

              {form.projects && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>KEY PROJECTS</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.projects}</p>
                </div>
              )}

              {form.achievements && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>ACHIEVEMENTS</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.achievements}</p>
                </div>
              )}

              {form.experience && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={sectionHeaderStyle}>WORK EXPERIENCE</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.experience}</p>
                </div>
              )}

              {form.certifications && (
                <div>
                  <h4 style={sectionHeaderStyle}>CERTIFICATIONS &amp; CERTIFICATES</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.certifications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div style={{ textAlign: "center" }}>
            <div className="no-print" style={{ marginBottom: 20 }}>
              <button onClick={handlePrint} style={{
                padding: "12px 28px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                boxShadow: "0 8px 24px rgba(37,99,235,0.4)"
              }}>
                🖨️ Download Clean PDF Resume
              </button>
            </div>

            <div className="resume-printable-doc" style={{
              maxWidth: 800, margin: "0 auto", background: "#ffffff", color: "#0f172a",
              padding: "48px", borderRadius: 8, textAlign: "left", boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              fontFamily: "'Helvetica Neue', Arial, sans-serif"
            }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: 14, marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 26, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", fontWeight: 800 }}>{form.fullName}</h1>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>{form.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{form.email} | {form.phone} | {form.location}</div>
              </div>

              {form.summary && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>PROFESSIONAL SUMMARY</h4>
                  <p style={bodyTextStyle}>{form.summary}</p>
                </div>
              )}

              {form.skills && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>TECHNICAL SKILLS</h4>
                  <p style={bodyTextStyle}>{form.skills}</p>
                </div>
              )}

              {form.education && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>EDUCATION</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.education}</p>
                </div>
              )}

              {form.projects && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>PROJECTS</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.projects}</p>
                </div>
              )}

              {form.achievements && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>ACHIEVEMENTS</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.achievements}</p>
                </div>
              )}

              {form.experience && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={sectionHeaderStyle}>EXPERIENCE</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.experience}</p>
                </div>
              )}

              {form.certifications && (
                <div>
                  <h4 style={sectionHeaderStyle}>CERTIFICATIONS &amp; CERTIFICATES</h4>
                  <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{form.certifications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "coach" && (
          <div className="no-print">
            <ResumeCoachChat form={form} />
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized AI Resume Advisor Chat for Resume Builder
function ResumeCoachChat({ form }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm Pranishree, your AI Resume Coach. How can I help you refine and perfect your resume today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const starterPrompts = [
    "⚡ Critique My Live Resume Draft",
    "✨ Suggest High-Impact Bullet Points",
    "📈 Help Quantify My Metrics (percentages, stats)",
    "🎯 Recommend Technical Keywords for ATS",
    "💡 Give 5 Action Verbs for my Role"
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hello! I'm Pranishree, your AI Resume Coach. Chat cleared! How can I help you refine and perfect your resume today?`
      }
    ]);
  };

  async function handleSend(textToSend) {
    const query = textToSend || input;
    if (!query || !query.trim() || loading) return;

    const newMsg = { role: "user", content: query.trim() };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    if (!textToSend) setInput("");
    setLoading(true);

    const liveResumeContext = `
Candidate Resume Context:
- Full Name: ${form.fullName || "Candidate"}
- Target Job Title: ${form.title || "Software Engineer"}
- Professional Summary: ${form.summary || "Not specified"}
- Technical Skills: ${form.skills || "Not specified"}
- Key Projects: ${form.projects || "Not specified"}
- Work Experience: ${form.experience || "Not specified"}
- Education: ${form.education || "Not specified"}
`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: `You are Pranishree, a warm, supportive human career mentor and senior tech recruiter. Speak naturally, warmly, and conversationally like a real human advisor talking to a candidate in plain, friendly English. Do NOT sound like an automated script, bot, or machine. Do NOT output raw lists of asterisks or colons. Give thoughtful, personal, step-by-step career advice based on the candidate's resume context:\n${liveResumeContext}`,
          messages: updatedMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const aiResponseText = data.content?.[0]?.text;
      if (aiResponseText) {
        setMessages([...updatedMsgs, { role: "assistant", content: aiResponseText }]);
      } else {
        throw new Error("API Offline");
      }
    } catch(e) {
      // Warm, Natural Human Response Engine for Pranishree
      const fallbackText = generateHumanCoachResponse(query, form);
      setMessages([...updatedMsgs, { role: "assistant", content: fallbackText }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      background: "rgba(15,23,42,0.85)", borderRadius: 18, border: "1px solid rgba(59,130,246,0.3)",
      backdropFilter: "blur(12px)", overflow: "hidden", display: "flex", flexDirection: "column", height: 600
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", background: "rgba(30,58,138,0.35)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>👩‍💼</span>
          <div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>Pranishree · AI Resume Coach</div>
            <div style={{ color: "#60a5fa", fontSize: 11.5 }}>
              Target Role: <strong>{form.title || "Software Engineer"}</strong>
            </div>
          </div>
        </div>

        <button onClick={handleClear} style={{
          padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#cbd5e1", borderRadius: 8, fontSize: 11.5, cursor: "pointer"
        }}>
          🗑️ Clear Chat
        </button>
      </div>

      {/* Chat Messages Log */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "14px 18px", borderRadius: 16,
              background: m.role === "user" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(30,41,59,0.85)",
              color: "#fff", border: m.role === "user" ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
              fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap", position: "relative"
            }}>
              {m.role === "assistant" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ color: "#60a5fa", fontSize: 11, fontWeight: 800 }}>👩‍💼 Pranishree (AI Resume Coach)</div>
                  <button
                    onClick={() => handleCopy(m.content, i)}
                    style={{
                      background: "rgba(255,255,255,0.08)", border: "none", color: copiedIdx === i ? "#34d399" : "#94a3b8",
                      fontSize: 10.5, padding: "2px 8px", borderRadius: 6, cursor: "pointer"
                    }}
                  >
                    {copiedIdx === i ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: "#94a3b8", fontSize: 13, padding: "10px" }}>⏳ Pranishree is typing a response...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Starter Chips */}
      <div style={{ padding: "10px 16px", background: "rgba(2,6,23,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, overflowX: "auto" }}>
        {starterPrompts.map((sp, idx) => (
          <button key={idx} onClick={() => handleSend(sp)} disabled={loading} style={{
            padding: "7px 14px", borderRadius: 14, background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", fontSize: 11.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.15s"
          }}>
            {sp}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ padding: "14px 16px", background: "rgba(15,23,42,0.9)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10 }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Pranishree any question about your resume..." disabled={loading} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(2,6,23,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13.5, outline: "none" }} />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: "12px 24px", borderRadius: 12, background: loading || !input.trim() ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Send</button>
      </form>
    </div>
  );
}

// Warm, Conversational Natural Human Response Engine for Pranishree
function generateHumanCoachResponse(query, form) {
  const q = (query || "").toLowerCase();
  const rawTitle = (form.title || "").trim() || "Software Engineer";
  const titleLower = rawTitle.toLowerCase();
  const userSkills = (form.skills || "").trim();

  // Dynamic Skill & Domain Adaptation based on candidate's exact Job Title
  let activeSkills = "Python, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, MLOps, Docker, AWS SageMaker";
  let domainDesc = "building scalable machine learning models, deep learning architectures, feature engineering, and MLOps deployment pipelines";
  let verbs = "Trained, Deployed, Fine-Tuned, Optimized, Engineered";

  if (titleLower.includes("machine learning") || titleLower.includes("machne learning") || titleLower.includes("ml") || titleLower.includes("ai ") || titleLower.endsWith("ai") || titleLower.includes("data sci") || titleLower.includes("deep learning")) {
    activeSkills = "Python, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, MLOps, Docker, AWS SageMaker";
    domainDesc = "building scalable machine learning models, deep learning architectures, feature engineering, and MLOps deployment pipelines";
    verbs = "Trained, Deployed, Fine-Tuned, Optimized, Engineered";
  } else if (titleLower.includes("python")) {
    activeSkills = "Python, Django, FastAPI, Flask, PostgreSQL, Redis, Docker, Celery, PyTest";
    domainDesc = "developing robust Python backend microservices, asynchronous API architectures, and data pipelines";
    verbs = "Engineered, Optimized, Automated, Architected, Refactored";
  } else if (titleLower.includes("security") || titleLower.includes("cyber")) {
    activeSkills = "Penetration Testing, SIEM, Firewalls, IDS/IPS, Python, Wireshark, Linux, SOC, Vulnerability QA";
    domainDesc = "identifying application vulnerabilities, hardening infrastructure, and managing security incident response";
    verbs = "Remediated, Hardened, Audited, Mitigated, Secured";
  } else if (titleLower.includes("data eng") || titleLower.includes("data pipeline")) {
    activeSkills = "Python, SQL, Apache Spark, Airflow, Snowflake, PostgreSQL, AWS Redshift, ETL Pipelines";
    domainDesc = "building high-throughput ETL data pipelines, data warehousing, and distributed data architectures";
    verbs = "Architected, Orchestrated, Optimized, Streamlined, Modeled";
  } else if (titleLower.includes("data anal") || titleLower.includes("analytics")) {
    activeSkills = "SQL, Python, Pandas, Tableau, Power BI, Excel, Data Visualization, A/B Testing";
    domainDesc = "extracting actionable business insights, building interactive dashboards, and statistical data modeling";
    verbs = "Analyzed, Visualized, Modeled, Forecasted, Extracted";
  } else if (titleLower.includes("devops") || titleLower.includes("cloud") || titleLower.includes("sre")) {
    activeSkills = "AWS, Docker, Kubernetes, Terraform, CI/CD Pipelines, Linux, Python, Ansible, Prometheus";
    domainDesc = "architecting cloud infrastructure, automating CI/CD pipelines, container orchestration, and system reliability";
    verbs = "Automated, Provisioned, Orchestrated, Deployed, Scaled";
  } else if (titleLower.includes("qa") || titleLower.includes("test") || titleLower.includes("automation")) {
    activeSkills = "Selenium, Cypress, PyTest, Playwright, Postman, Java, Python, CI/CD, Test Automation";
    domainDesc = "designing automated test frameworks, regression testing pipelines, and API validation suites";
    verbs = "Automated, Tested, Validated, Executed, Streamlined";
  } else if (titleLower.includes("mobile") || titleLower.includes("android") || titleLower.includes("ios") || titleLower.includes("flutter")) {
    activeSkills = "Swift, Kotlin, React Native, Flutter, iOS, Android SDK, REST APIs, Mobile UI/UX";
    domainDesc = "developing high-performance mobile applications, native integrations, and mobile UI workflows";
    verbs = "Developed, Architected, Published, Optimized, Built";
  } else if (titleLower.includes("frontend") || titleLower.includes("react")) {
    activeSkills = "JavaScript, TypeScript, React, HTML5, CSS3/Tailwind, Next.js, Redux, Webpack";
    domainDesc = "crafting responsive user interfaces, optimizing frontend render performance, and state management";
    verbs = "Designed, Implemented, Refactored, Optimized, Spearheaded";
  } else if (titleLower.includes("backend") || titleLower.includes("java") || titleLower.includes("c++")) {
    activeSkills = "Node.js, Python, Java, PostgreSQL, MongoDB, Redis, Docker, Microservices, REST APIs";
    domainDesc = "building scalable server-side microservices, database schemas, and high-availability REST APIs";
    verbs = "Architected, Engineered, Scaled, Integrated, Hardened";
  } else if (titleLower.includes("full stack") || titleLower.includes("fsd")) {
    activeSkills = userSkills.length > 5 ? userSkills : "JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, GraphQL";
    domainDesc = "building end-to-end web applications, responsive UIs, and robust server microservices";
    verbs = "Architected, Engineered, Developed, Streamlined, Deployed";
  }

  // 1. HOW TO IMPROVE MY RESUME / CRITIQUE
  if (q.includes("improve my resume") || q.includes("improve resume") || q.includes("critique") || q.includes("review") || q.includes("feedback")) {
    return `I would love to help you refine your resume for **${rawTitle}**!

Here are the top 3 high-impact improvements I recommend right now:

1. **Executive Summary:** Focus your summary on domain-specific architecture and performance metrics rather than generic terms.
   *Example:* "Results-driven ${rawTitle} with experience ${domainDesc}. Proficient in ${activeSkills.split(",").slice(0, 4).join(", ")}."

2. **Project Bullet Points:** Make sure every bullet point starts with a strong action verb (${verbs.split(",").slice(0, 3).join(", ")}) and ends with a quantifiable result.
   *Example:* "Engineered asynchronous backend microservices, reducing API response latency by 38% across production workloads."

3. **ATS Technical Keywords:** Ensure core tools like ${activeSkills.split(",").slice(0, 5).join(", ")} are listed clearly in plain text under your Technical Skills section.

Which section would you like to polish first? (Summary, Projects, or Skills?)`;
  }

  // 2. HOW TO BUILD AN ATS RESUME
  if (q.includes("how to build") || q.includes("how to make") || q.includes("build ats") || q.includes("create ats") || q.includes("ats resume")) {
    return `Building an ATS-friendly resume for a **${rawTitle}** role is much simpler than most people think! The secret is keeping your format clean so computer software can read it easily, while making your technical accomplishments stand out for the recruiter.

Here is my step-by-step guide:

1. Keep the Layout Clean & Simple: Use a standard single-column layout. Avoid multi-column tables, text boxes, or graphics because ATS screeners often scramble them.

2. Structure with Standard Headings: Use standard section titles like Summary, Technical Skills, Key Projects, Work Experience, and Education.

3. List Your Technical Skills Clearly: List your core languages, tools, and frameworks separated by commas (such as ${activeSkills}). Make sure these match the exact keywords in job postings you are targeting.

4. Focus on Achievements with Metrics: Begin your project bullet points with strong action verbs (like ${verbs.split(",").slice(0, 3).join(", ")}) and include measurable results like "improved processing speed by 35%".

5. Save as a Clean PDF: Export your resume as a clean PDF or Word document with standard fonts like Arial or Helvetica.

Would you like me to help you refine your current Executive Summary or Project section for ${rawTitle} right now?`;
  }

  // 3. SUMMARY / PROFILE REWRITE
  if (q.includes("summary") || q.includes("profile") || q.includes("about me")) {
    return `Here is a strong, natural executive summary tailored specifically for your **${rawTitle}** draft:

"Results-driven ${rawTitle} with experience ${domainDesc}. Proficient in ${activeSkills.split(",").slice(0, 4).join(", ")}, with a strong focus on code quality, technical reliability, and system performance."

You can copy and paste this directly into your Summary field! How does this sound to you?`;
  }

  // 4. PROJECTS / BULLET POINTS
  if (q.includes("project") || q.includes("experience") || q.includes("bullet point")) {
    return `When writing project bullet points for **${rawTitle}** roles, recruiters look for what you built, how you built it, and your impact.

Here is a great structure tailored for ${rawTitle}:

• ${verbs.split(",")[0] || "Engineered"} & Built: Developed core backend and system features using ${activeSkills.split(",").slice(0, 3).join(", ")} to improve key workflows.
• Performance & Scalability: ${verbs.split(",")[1] || "Optimized"} system execution speed and database queries, cutting response latency by 35%.
• Reliability & Quality: Implemented automated test suites and error handling pipelines ensuring 95%+ service stability.

Starting each point with an action verb and ending with a quantifiable metric makes your resume look super professional!`;
  }

  // 5. KEYWORDS
  if (q.includes("keyword")) {
    return `For **${rawTitle}** roles, recruiters and ATS scanners look for core domain tools and best practices.

I recommend organizing your skills section like this:
• Core Languages & Tools: ${activeSkills}
• Core Architecture: System Design, REST APIs, Microservices, CI/CD, Database Indexing
• Best Practices: Code Review, Testing, Agile Development, Clean Code Standards

Listing these exact terms in plain text ensures your resume passes automated screenings smoothly!`;
  }

  // 6. GENERAL / CUSTOM QUESTION
  return `That is a great question about building your resume for **${rawTitle}**!

My main advice for ${rawTitle} candidates is to keep your resume clean, concise, and focused on technical impact. Highlight the key tools you used (${activeSkills.split(",").slice(0, 4).join(", ")}) and mention specific quantifiable results whenever possible.

Let me know if you would like me to help you rewrite any section or draft new project bullet points!`;
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(2,6,23,0.8)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit"
};

const sectionHeaderStyle = {
  margin: "0 0 6px", fontSize: 12, textTransform: "uppercase",
  color: "#1e3a8a", borderBottom: "1px solid #cbd5e1", fontWeight: 700, letterSpacing: "0.05em"
};

const bodyTextStyle = {
  margin: 0, fontSize: 11, lineHeight: 1.6, color: "#334155"
};
