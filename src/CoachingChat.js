import { useState, useRef, useEffect } from "react";

// ROLE-SPECIFIC TECHNICAL TOPIC REPOSITORY
const ROLE_TECHNICAL_TOPICS = {
  php: [
    "PHP fundamentals & OOP in PHP",
    "Laravel Framework & MVC architecture",
    "REST APIs & JSON handling",
    "MySQL database optimization & PDO",
    "Authentication, Sessions & Cookies",
    "Composer package management & Security best practices"
  ],
  nodejs: [
    "JavaScript ES6+ & Node.js Core Modules",
    "Event Loop, Non-blocking I/O & Microtasks",
    "Express.js & RESTful API Architecture",
    "Async/Await, Promises & Error Handling",
    "MongoDB / PostgreSQL database integration",
    "Authentication (JWT, OAuth) & Security hardening"
  ],
  python: [
    "Python Data Structures & OOP principles",
    "Django / FastAPI web frameworks",
    "Database ORM (SQLAlchemy) & Query optimization",
    "Asynchronous programming (asyncio)",
    "API Development & Testing (pytest)",
    "Virtual environments & dependency management"
  ],
  react: [
    "React Hooks (useState, useEffect, useMemo, useCallback)",
    "State Management (Redux Toolkit, Context API)",
    "Component Lifecycle & Virtual DOM reconciliation",
    "Code splitting, Lazy loading & Performance tuning",
    "Next.js / SSR fundamentals",
    "REST API integration & Error Boundaries"
  ],
  fullstack: [
    "Frontend & Backend architecture coordination",
    "REST & GraphQL API design",
    "Database ORMs, Transactions & Indexing",
    "Authentication, Security & CORS",
    "CI/CD Pipelines & Containerization (Docker)"
  ],
  cybersec: [
    "Network Security, Firewalls & VPNs",
    "Vulnerability Assessment & Penetration Testing",
    "OWASP Top 10 Web Vulnerabilities",
    "Incident Response & Forensics",
    "Zero-Trust Architecture & Identity Access Management (IAM)"
  ]
};

export function CoachingChat({ results, role }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! 👋 I'm **Pranishree**, your AI Career Coach.\n\nI can help you with your **resume, interview preparation, IRS score, technical skills, projects, and career growth**.\n\nWhat would you like help with today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const {
    mode = "full",
    combinedIRS = 0,
    technicalScore = 0,
    problemSolvingScore = 0,
    behavioralScore = 0,
    answerQualityScore = 0,
    communicationScore = 0,
    recommendation = "Not Recommended",
    hrLog = [],
    techLog = [],
    totalFillers = 0,
    totalAsked = 10,
    answeredCount = 0
  } = results || {};

  const starterPrompts = [
    "👋 hlooo",
    "📈 How can I improve my IRS?",
    "📚 What technical topics should I study?",
    "📝 How can I improve my resume?"
  ];

  // DETECT GREETINGS (HIGH PRIORITY OVERRIDE)
  function isGreeting(text) {
    const qLower = text.trim().toLowerCase();
    const greetingWords = [
      "hi", "hii", "hiii", "hiiii", "hlo", "hlooo", "hloooo", "hello", "hellooo",
      "hey", "heyy", "heyyy", "yo", "yoo", "good morning", "good afternoon",
      "good evening", "hi pranishree", "hello pranishree", "hey pranishree", "hlo pranishree"
    ];
    if (greetingWords.includes(qLower)) return true;
    if (/^(hi|hlo|hello|hey|yo)\b/i.test(qLower) && qLower.split(/\s+/).length <= 2) return true;
    return false;
  }

  // PRANISHREE LOCAL INTENT ENGINE (LATEST MESSAGE PRIORITY)
  function generatePranishreeResponse(query) {
    const qTrim = query.trim();
    const qLower = qTrim.toLowerCase();

    // RULE 1: GREETING OVERRIDE (ALWAYS GREET WITHOUT INTERVIEW/IRS METRICS)
    if (isGreeting(qTrim)) {
      return `Hi! 👋 I'm **Pranishree**, your AI Career Coach.\n\nI can help you with your **resume, interview preparation, IRS score, technical skills, projects, and career growth**.\n\nWhat would you like help with today?`;
    }

    // RULE 2: AMBIGUITY CHECK
    if (qLower === "how can i improve?" || qLower === "how to improve?" || qLower === "improve") {
      return `Do you want to improve your Interview Readiness Score (IRS), resume, technical skills, or communication?`;
    }

    // RULE 3: IRS / INTERVIEW QUESTIONS (ONLY WHEN ASKED)
    if (
      qLower.includes("irs") ||
      qLower.includes("score") ||
      qLower.includes("my interview") ||
      qLower.includes("increase my interview score") ||
      qLower.includes("improve in my interview")
    ) {
      if (answeredCount === 0) {
        return `### 🎯 Your Current IRS: 0%\nYour current IRS is **0%** because no questions were answered during the session.\n\n### 🚀 Action Plan\n1. **Attempt Spoken Answers:** Speak clearly into the microphone for each question.\n2. **Practice Out Loud:** Answer technical prompts before your next session.\n\n### 🎯 Next Interview Targets\n- Answer at least 90% of questions.\n- Achieve a minimum technical accuracy score of 70%+.\n- Speak clearly without tab switching or leaving camera view.`;
      }

      const subScores = [];
      if (mode !== "hr") subScores.push({ name: "Technical Accuracy", val: technicalScore, why: "Technical accuracy reflects your grasp of core principles." });
      if (mode !== "hr") subScores.push({ name: "Problem Solving", val: problemSolvingScore, why: "Problem solving evaluates logic and architectural trade-offs." });
      if (mode !== "technical") subScores.push({ name: "Behavioral STAR Structure", val: behavioralScore, why: "STAR structure validates personal actions and measurable results." });
      if (mode !== "technical") subScores.push({ name: "Answer Quality", val: answerQualityScore, why: "Answer quality measures response completeness." });
      subScores.push({ name: "Communication Score", val: communicationScore, why: "Communication measures speech clarity and filler word control." });

      subScores.sort((a, b) => a.val - b.val);
      const weakAreas = subScores.slice(0, 3);

      return `### 🎯 Your Current IRS: ${combinedIRS}%\nYour current Interview Readiness Score is **${combinedIRS}%** (${recommendation}). To improve it, focus first on your lowest-scoring interview areas:\n\n### 📊 Biggest Areas to Improve\n${weakAreas.map((w, idx) => `**${idx + 1}. ${w.name} — ${w.val}%**\n• *Why it matters:* ${w.why}\n• *Action:* Review core concepts and practice structured responses out loud.`).join("\n\n")}\n\n### 🚀 Personalized Action Plan\n1. **Technical Depth:** Practice explaining concepts out loud for ${role?.label || "your role"}.\n2. **STAR Framework:** Structure HR answers with Situation, Task, Action, and Result.\n3. **Verbal Pacing:** Take a 2-second silent pause before answering instead of using filler words.\n\n### 🎯 Next Interview Targets\n- Answer at least 90% of questions completely.\n- Improve technical accuracy to 75%+.\n- Reduce filler word count to under 3 per session.`;
    }

    // RULE 4: TECHNICAL SKILLS QUESTIONS (TAILORED TO ROLE)
    if (qLower.includes("technical topic") || qLower.includes("what should i study") || qLower.includes("topics to study") || qLower.includes("technical skill")) {
      const roleId = role?.id || "fullstack";
      const topics = ROLE_TECHNICAL_TOPICS[roleId] || [
        `Core architecture and design patterns for ${role?.label || "your role"}`,
        `REST API design and database query optimization`,
        `Error handling, debugging, and production security best practices`,
        `Asynchronous programming, performance tuning, and testing`
      ];

      return `### 📚 Recommended Technical Topics to Study for ${role?.label || "Candidate"}\nHere are specific technical topics to revise for **${role?.label || "your role"}**:\n\n${topics.map((t, idx) => `${idx + 1}. **${t}**`).join("\n")}\n\nFocus on explaining the reasoning and trade-offs behind these topics out loud!`;
    }

    // RULE 5: RESUME QUESTIONS (ONLY WHEN ASKED)
    if (qLower.includes("resume") || qLower.includes("ats") || qLower.includes("action verb") || qLower.includes("formatting")) {
      return `### 📝 Resume Optimization Guidelines\n- **Use Action Verbs:** Start bullet points with strong action verbs (*Architected, Engineered, Developed, Streamlined*).\n- **Quantify Impact:** State measurable results (e.g. "Reduced page load time by 42%").\n- **ATS Keywords:** Use clear section headers (Summary, Technical Skills, Education, Projects, Achievements).`;
    }

    // RULE 6: PROJECT QUESTIONS
    if (qLower.includes("project")) {
      return `### 🛠️ Project Description Guidelines\n- **Project Title:** Use a clear descriptive title.\n- **Technologies:** Mention exact frameworks, tools, and databases.\n- **Impact:** Quantify the outcome or efficiency gain.`;
    }

    // DEFAULT ANSWER FOR GENERAL QUESTIONS
    return `Hi! 👋 I'm **Pranishree**, your AI Career Coach. How can I help you with your **${role?.label || "Career"}** preparation today?`;
  }

  async function handleSend(textToSend) {
    const query = textToSend || input;
    if (!query || !query.trim() || loading) return;

    const newMsg = { role: "user", content: query.trim() };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    if (!textToSend) setInput("");
    setLoading(true);

    // GREETING OVERRIDE (FAST LOCAL RESPONSE FOR GREETINGS)
    if (isGreeting(query)) {
      setTimeout(() => {
        setMessages([...updatedMsgs, {
          role: "assistant",
          content: `Hi! 👋 I'm **Pranishree**, your AI Career Coach.\n\nI can help you with your **resume, interview preparation, IRS score, technical skills, projects, and career growth**.\n\nWhat would you like help with today?`
        }]);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const candidateContextPrompt = `
PRANISHREE — AI CAREER COACH SYSTEM PROMPT

You are Pranishree, an intelligent AI Career, Resume, and Interview Coach.
Your primary job is to understand the user's LATEST MESSAGE and respond specifically to what they are asking.

🚨 HIGHEST PRIORITY RULE:
ALWAYS RESPOND TO THE LATEST USER MESSAGE FIRST.
Do NOT automatically mention candidate's IRS, role, score, or interview results UNLESS the user specifically asks about them.

👋 GREETING OVERRIDE RULE:
If the latest message is a greeting (e.g., "hi", "hii", "hello", "hlooo", "hey", "good morning"), respond ONLY with:
"Hi! 👋 I'm Pranishree, your AI Career Coach. I can help you with your resume, interview preparation, IRS score, technical skills, projects, and career growth. What would you like help with today?"
Do NOT mention IRS, scores, or previous interview performance when the user only greets you!

📚 ROLE-SPECIFIC TECHNICAL TOPICS RULE:
If the user asks "What technical topics should I study?", tailor topics specifically to: ${role?.label || "Technical Role"}.

CANDIDATE INTERVIEW DATA (USE ONLY WHEN EXPLICITLY ASKED ABOUT IRS / INTERVIEW PERFORMANCE):
- Role: ${role?.label}
- Mode: ${mode}
- Final IRS: ${combinedIRS}%
- Technical Score: ${technicalScore}%
- Problem Solving Score: ${problemSolvingScore}%
- Behavioral Score: ${behavioralScore}%
- Answer Quality Score: ${answerQualityScore}%
- Communication Score: ${communicationScore}%
- Questions Asked: ${totalAsked}
- Questions Answered: ${answeredCount}
- Filler Words: ${totalFillers}
- Hiring Recommendation: ${recommendation}
`;

      const apiMessages = updatedMsgs.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 650,
          system: candidateContextPrompt,
          messages: apiMessages
        })
      });

      const data = await res.json();
      const aiResponseText = data.content?.[0]?.text;
      if (aiResponseText) {
        setMessages([...updatedMsgs, { role: "assistant", content: aiResponseText }]);
      } else {
        throw new Error("No API response");
      }
    } catch (e) {
      const pranishreeAns = generatePranishreeResponse(query);
      setMessages([...updatedMsgs, { role: "assistant", content: pranishreeAns }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      background: "rgba(15,23,42,0.85)",
      borderRadius: 18,
      border: "1px solid rgba(59,130,246,0.3)",
      backdropFilter: "blur(12px)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: 620
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        background: "rgba(30,58,138,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Pranishree AI Career Coach</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>Natural Conversational AI &amp; Career Guidance</div>
          </div>
        </div>
        <span style={{
          fontSize: 11, padding: "4px 10px", borderRadius: 12,
          background: "rgba(52,211,153,0.15)", color: "#34d399", fontWeight: 600
        }}>
          ● Pranishree Online
        </span>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justify: m.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "82%",
              padding: "14px 18px",
              borderRadius: 16,
              background: m.role === "user"
                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                : "rgba(30,41,59,0.85)",
              color: "#fff",
              border: m.role === "user"
                ? "1px solid rgba(96,165,250,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              fontSize: 13.5,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap"
            }}>
              {m.role === "assistant" && (
                <div style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                  🤖 Pranishree AI Coach
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "12px 18px", borderRadius: 16,
              background: "rgba(30,41,59,0.85)", color: "#94a3b8",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8
            }}>
              <span style={{ animation: "spin 1s linear infinite", fontSize: 16 }}>⏳</span>
              Pranishree is typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Starter Suggestions */}
      <div style={{
        padding: "10px 16px",
        background: "rgba(2,6,23,0.4)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        gap: 8,
        overflowX: "auto"
      }}>
        {starterPrompts.map((sp, idx) => (
          <button key={idx} onClick={() => handleSend(sp)}
            disabled={loading}
            style={{
              padding: "6px 12px",
              borderRadius: 14,
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#93c5fd",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
            {sp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{
        padding: "14px 16px",
        background: "rgba(15,23,42,0.9)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        gap: 10
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Say hi or ask Pranishree a career/interview question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(2,6,23,0.8)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 13.5,
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            background: loading || !input.trim()
              ? "rgba(255,255,255,0.1)"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer"
          }}>
          Send
        </button>
      </form>

      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
