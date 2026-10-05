import { useState } from "react";
import { ROLES } from "./questionsData";
import { generateResumeQuestions } from "./hrQuestions";

// ── PDF & Text File Parser ─────────────────────────────────────
export function parseResumeFileText(file) {
  return new Promise((resolve) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      const textReader = new FileReader();
      textReader.onload = (e) => resolve(e.target?.result || "");
      textReader.readAsText(file);
      return;
    }

    // Read PDF file as ArrayBuffer to extract binary and stream text
    const bufferReader = new FileReader();
    bufferReader.onload = async (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          resolve("");
          return;
        }

        const uint8 = new Uint8Array(buffer);
        const latin1 = Array.from(uint8).map(b => String.fromCharCode(b)).join("");

        // Extract text tokens from PDF BT ... ET text blocks
        const textTokens = [];
        const btBlocks = latin1.match(/BT[\s\S]*?ET/g) || [];
        btBlocks.forEach(block => {
          const tjRegex = /\(([^)]+)\)\s*T[jJ]/g;
          let m;
          while ((m = tjRegex.exec(block)) !== null) {
            if (m[1] && m[1].length > 1) textTokens.push(m[1]);
          }
          const tjArrRegex = /\[\s*([\s\S]*?)\s*\]\s*TJ/g;
          while ((m = tjArrRegex.exec(block)) !== null) {
            const clean = m[1].replace(/\(([^)]+)\)/g, "$1 ").replace(/[^\w\s.,+\-@]/g, " ");
            textTokens.push(clean);
          }
        });

        // Filter valid resume text tokens (exclude PDF metadata headers)
        const pdfMetaRegex = /^(pdf|canva|adobe|creationdate|moddate|producer|winansi|identity|font|mediabox|catalog|page|stream|flatedecode)/i;
        const validTokens = textTokens.filter(t => t.trim().length > 1 && !pdfMetaRegex.test(t.trim()));

        if (validTokens.length > 3) {
          resolve(validTokens.join(" "));
          return;
        }

        // Fallback: Strip PDF internal dictionary keys (/Key) and filter noise words
        const pdfHeadersClean = latin1.replace(/\/[A-Za-z0-9+#.\-]+/g, " ");
        const cleanAscii = pdfHeadersClean.replace(/[\x00-\x1F\x7F-\xFF]/g, " ");
        const words = cleanAscii.match(/[A-Za-z0-9+#.\-@\/]{2,}/g) || [];
        const pdfKeywords = new Set([
          "obj", "endobj", "stream", "endstream", "xref", "trailer", "startxref",
          "font", "mediabox", "parent", "catalog", "pages", "page", "type", "encoding",
          "fontdescriptor", "subtype", "flatedecode", "filter", "length", "contents",
          "uifont", "designer", "spatial", "goto", "ruby", "helvetica", "arial", "truetype",
          "cidfont", "procset", "winansiencoding", "macromanencoding", "fontname", "basefont",
          "widths", "firstchar", "lastchar", "fontmatrix", "adobestdencoding", "standardencoding",
          "creationdate", "moddate", "producer", "creator", "title", "author", "subject"
        ]);
        const filtered = words.filter(w => !pdfKeywords.has(w.toLowerCase()) && !w.startsWith("/"));
        resolve(filtered.join(" "));
      } catch (err) {
        resolve("");
      }
    };

    bufferReader.readAsArrayBuffer(file);
  });
}

// ── 20 Allowed Target Roles for Resume Matching ──────────────────
export const ALLOWED_RESUME_ROLES = [
  { id: "ai_engineer", label: "AI Engineer", category: "AI, ML & Data", icon: "🤖" },
  { id: "ml_engineer", label: "Machine Learning Engineer", category: "AI, ML & Data", icon: "🧠" },
  { id: "software_engineer", label: "Software Engineer", category: "Software Development", icon: "💻" },
  { id: "data_scientist", label: "Data Scientist", category: "AI, ML & Data", icon: "🔬" },
  { id: "data_engineer", label: "Data Engineer", category: "AI, ML & Data", icon: "🧱" },
  { id: "genai_engineer", label: "Generative AI Engineer", category: "AI, ML & Data", icon: "✨" },
  { id: "cybersec_engineer", label: "Cybersecurity Engineer", category: "Security", icon: "🛡️" },
  { id: "cloud_engineer", label: "Cloud Engineer", category: "Cloud & DevOps", icon: "☁️" },
  { id: "fullstack", label: "Full-Stack Developer", category: "Software Development", icon: "⚡" },
  { id: "devops", label: "DevOps Engineer", category: "Cloud & DevOps", icon: "♾️" },
  { id: "data_analyst", label: "Data Analyst", category: "AI, ML & Data", icon: "📊" },
  { id: "biz_analyst", label: "Business Analyst", category: "Product & Strategy", icon: "📋" },
  { id: "product_manager", label: "Product Manager", category: "Product & Strategy", icon: "🎯" },
  { id: "mlops_engineer", label: "MLOps Engineer", category: "AI, ML & Data", icon: "🚀" },
  { id: "bi_analyst", label: "Business Intelligence Analyst", category: "AI, ML & Data", icon: "📈" },
  { id: "ai_researcher", label: "AI Research Scientist", category: "AI, ML & Data", icon: "🔮" },
  { id: "solutions_architect", label: "Solutions Architect", category: "Cloud & DevOps", icon: "📐" },
  { id: "fintech_engineer", label: "FinTech Engineer", category: "Software Development", icon: "💳" },
  { id: "uiux_designer", label: "UI/UX Designer", category: "Product & Strategy", icon: "🎨" },
  { id: "database_engineer", label: "Database Engineer", category: "Software Development", icon: "🗄️" }
];

// ── Domain Skill Taxonomy & Role Matching Algorithm ───────────
const GENERIC_TITLE_WORDS = new Set([
  "engineer", "engineering", "developer", "development", "analyst", "architect",
  "lead", "senior", "junior", "specialist", "manager", "director", "associate",
  "consultant", "tester", "programmer", "software", "system", "systems",
  "designer", "product", "ui", "ux"
]);

const DOMAIN_TAXONOMIES = {
  fullstack: [
    "full stack", "fullstack", "full-stack", "react", "react.js", "node", "node.js",
    "express", "express.js", "angular", "angular.js", "vue", "vue.js", "javascript",
    "typescript", "html", "html5", "css", "css3", "mongodb", "sql", "postgresql",
    "rest api", "backend", "frontend", "jquery"
  ],
  security: [
    "security", "cyber", "cybersecurity", "penetration", "pentest", "vulnerability", "vulnerabilities",
    "firewall", "firewalls", "siem", "dlp", "ids/ips", "ids", "ips", "endpoint",
    "incident response", "ethical hacking", "threat modeling", "iam", "identity",
    "access management", "soc", "cissp", "ceh", "red team", "blue team", "encryption",
    "infosec", "zero trust", "threat", "compliance", "mitre", "nist", "pci-dss",
    "subnetting", "wireshark", "burp suite", "metasploit", "defender", "crowdstrike",
    "splunk", "qradar", "sentinel", "phishing"
  ],
  data_engineering: [
    "data engineering", "data engineer", "data pipeline", "spark", "pyspark",
    "hadoop", "etl", "elt", "airflow", "kafka", "dbt", "snowflake", "bigquery",
    "redshift", "data lake", "data warehouse", "databricks", "delta lake"
  ],
  database_eng: [
    "database engineer", "database administrator", "dba", "postgresql", "mysql",
    "oracle", "sql server", "mongodb", "database design", "indexing", "query optimization",
    "replication", "sharding", "schema design", "stored procedures"
  ],
  data_science_ai: [
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "nlp", "llm", "large language model", "neural network", "computer vision",
    "model deployment", "xgboost", "pandas", "numpy", "transformers", "research",
    "generative ai", "genai", "prompt engineering", "langchain"
  ],
  data_analytics: [
    "data analyst", "powerbi", "tableau", "looker", "sql queries", "dashboards",
    "data visualization", "excel pivot", "statistical analysis", "metrics", "reporting"
  ],
  bi_analyst: [
    "business intelligence", "bi analyst", "bi developer", "power bi", "tableau",
    "looker", "dax", "ssis", "ssrs", "data modeling", "star schema", "data marts"
  ],
  product_mgr: [
    "product manager", "product management", "product strategy", "product roadmap",
    "user stories", "prd", "backlog", "prioritization", "feature scoping", "agile", "scrum"
  ],
  biz_analyst: [
    "business analyst", "requirements gathering", "brd", "gap analysis", "process mapping",
    "stakeholder management", "use cases", "functional requirements", "business process"
  ],
  frontend: [
    "frontend", "front-end", "react", "react.js", "vue", "vue.js", "angular",
    "typescript", "javascript", "html5", "css3", "tailwind", "redux", "next.js"
  ],
  backend: [
    "backend", "back-end", "microservices", "rest api", "graphql", "spring boot",
    "django", "express.js", "fastapi", "golang", "c++", "c#", ".net", "postgresql",
    "mongodb", "redis", "software engineer", "software development"
  ],
  cloud_devops: [
    "devops", "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "gitlab ci",
    "github actions", "terraform", "ansible", "cloud engineer", "cloud architecture",
    "site reliability", "aws", "azure", "gcp", "solutions architect", "mlops"
  ],
  ui_ux: [
    "figma", "wireframe", "wireframing", "adobe xd", "prototyping", "user research",
    "user experience", "user interface", "design system", "usability", "sketch",
    "balsamiq", "interaction design", "information architecture", "product design", "ui/ux"
  ],
  fintech: [
    "fintech", "payment", "banking", "trading", "stripe", "financial", "ledger",
    "fraud detection", "blockchain", "smart contract", "crypto", "transaction"
  ]
};

export function calculateResumeRoleMatches(text, allRoles = ALLOWED_RESUME_ROLES) {
  const rolesToMatch = (allRoles && allRoles.length > 0) ? allRoles : ALLOWED_RESUME_ROLES;
  if (!text || text.trim().length < 20) return [];

  // Normalize hyphenated terms for robust pattern matching
  const tLower = text.toLowerCase()
    .replace(/full-stack/g, "full stack")
    .replace(/front-end/g, "frontend")
    .replace(/back-end/g, "backend");

  // Determine domain match counts in candidate's resume
  const domainHits = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_TAXONOMIES)) {
    let hits = 0;
    keywords.forEach(kw => {
      if (tLower.includes(kw)) hits++;
    });
    domainHits[domain] = hits;
  }

  const scoredRoles = rolesToMatch.map(r => {
    let score = 0;
    const labelLower = r.label.toLowerCase().replace(/full-stack/g, "full stack");
    const idLower = r.id.toLowerCase();
    const categoryLower = (r.category || "").toLowerCase();

    // 1. Direct Job Title Match in Resume
    if (tLower.includes(labelLower)) {
      score += 80;
    }

    // 2. Specific Non-Generic Title Keywords Match
    const titleWords = labelLower.split(/[\s&/()]+/).filter(w => w.length > 1);
    const domainTitleWords = titleWords.filter(w => !GENERIC_TITLE_WORDS.has(w));

    let matchedDomainTitleWords = 0;
    domainTitleWords.forEach(word => {
      const cleanWord = word.toLowerCase();
      if (cleanWord.includes("+") || cleanWord.includes(".") || cleanWord.includes("#")) {
        if (tLower.includes(cleanWord)) {
          matchedDomainTitleWords++;
          score += 25;
        }
      } else {
        const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        if (regex.test(tLower)) {
          matchedDomainTitleWords++;
          score += 25;
        }
      }
    });

    // 3. Category & Taxonomy Domain Alignment
    let relevantDomainHits = 0;

    if (idLower.includes("fullstack") || labelLower.includes("full-stack") || labelLower.includes("full stack")) {
      relevantDomainHits = (domainHits.fullstack || 0) + (domainHits.frontend || 0) + (domainHits.backend || 0);
      if (tLower.includes("full stack") || tLower.includes("fullstack")) score += 70;
    } else if (idLower.includes("software_engineer") || labelLower.includes("software engineer")) {
      relevantDomainHits = (domainHits.backend || 0) + (domainHits.fullstack || 0);
    } else if (idLower.includes("cybersec") || labelLower.includes("cybersecurity") || labelLower.includes("security")) {
      relevantDomainHits = domainHits.security || 0;
    } else if (idLower.includes("database_engineer") || labelLower.includes("database engineer")) {
      relevantDomainHits = domainHits.database_eng || domainHits.data_engineering || 0;
    } else if (idLower.includes("data_engineer") || labelLower.includes("data engineer")) {
      relevantDomainHits = domainHits.data_engineering || 0;
    } else if (idLower.includes("bi_analyst") || labelLower.includes("business intelligence")) {
      relevantDomainHits = domainHits.bi_analyst || domainHits.data_analytics || 0;
    } else if (idLower.includes("data_analyst") || labelLower.includes("data analyst")) {
      relevantDomainHits = domainHits.data_analytics || 0;
    } else if (idLower.includes("biz_analyst") || labelLower.includes("business analyst")) {
      relevantDomainHits = domainHits.biz_analyst || 0;
    } else if (idLower.includes("product_manager") || labelLower.includes("product manager")) {
      relevantDomainHits = domainHits.product_mgr || 0;
    } else if (categoryLower.includes("ai") || idLower.includes("ai") || idLower.includes("ml")) {
      relevantDomainHits = domainHits.data_science_ai || 0;
    } else if (categoryLower.includes("cloud") || idLower.includes("devops") || idLower.includes("cloud") || idLower.includes("architect") || idLower.includes("mlops")) {
      relevantDomainHits = domainHits.cloud_devops || 0;
    } else if (idLower.includes("uiux") || labelLower.includes("ui/ux") || labelLower.includes("designer")) {
      relevantDomainHits = domainHits.ui_ux || 0;
    } else if (idLower.includes("fintech") || labelLower.includes("fintech")) {
      relevantDomainHits = domainHits.fintech || 0;
    }

    score += relevantDomainHits * 12;

    // 4. Exact Technology / Skill ID Matching
    if (idLower.includes("python") && tLower.includes("python")) score += 20;
    if (idLower.includes("react") && tLower.includes("react")) score += 20;
    if (idLower.includes("java") && (tLower.includes("java") || tLower.includes("spring"))) score += 20;
    if ((idLower.includes("security") || idLower.includes("cyber")) && (tLower.includes("security") || tLower.includes("cyber"))) score += 25;

    // 5. Mismatch Penalty: If resume has ZERO domain hits for a role's category, penalize score
    if ((categoryLower.includes("security") || labelLower.includes("security") || labelLower.includes("cyber")) && (domainHits.security || 0) === 0) {
      score = Math.max(0, score - 50);
    }
    if ((labelLower.includes("data engineer") || labelLower.includes("database engineer")) && (domainHits.data_engineering || 0) === 0 && (domainHits.database_eng || 0) === 0) {
      score = Math.max(0, score - 60);
    }
    if ((labelLower.includes("ui/ux") || labelLower.includes("designer") || idLower.includes("uiux")) && (domainHits.ui_ux || 0) === 0) {
      score = Math.max(0, score - 80);
    }
    if (idLower.includes("fintech") && (domainHits.fintech || 0) === 0) {
      score = Math.max(0, score - 60);
    }
    if ((labelLower.includes("devops") || labelLower.includes("cloud engineer")) && (domainHits.cloud_devops || 0) === 0) {
      score = Math.max(0, score - 60);
    }

    return {
      role: r,
      rawScore: score,
      domainHits: relevantDomainHits + matchedDomainTitleWords
    };
  });

  // Sort by rawScore descending
  scoredRoles.sort((a, b) => b.rawScore - a.rawScore);

  const topScored = scoredRoles.slice(0, 5);

  if (topScored.length === 0 || topScored[0].rawScore === 0) {
    return [];
  }

  const highestRaw = Math.max(topScored[0].rawScore, 100);
  let prevScore = 98;

  return topScored.map((item, idx) => {
    let scaled = Math.round((item.rawScore / highestRaw) * 98);
    if (idx === 0) {
      scaled = Math.max(95, scaled);
    } else {
      scaled = Math.min(prevScore - 2, Math.max(70, scaled));
    }

    const finalScore = Math.min(98, Math.max(65, scaled));
    prevScore = finalScore;

    return {
      ...item.role,
      score: finalScore
    };
  });
}

export function PageRoleMatching({ onBack, onStartMatchedInterview }) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [mode, setMode] = useState("full");
  const [generatingQs, setGeneratingQs] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await parseResumeFileText(file);
    setResumeText(text);
    analyzeResumeForRoles(text);
  };

  const analyzeResumeForRoles = (text) => {
    if (!text || text.trim().length < 30) return;
    setAnalyzing(true);

    setTimeout(() => {
      const matched = calculateResumeRoleMatches(text, ALLOWED_RESUME_ROLES);
      setMatchedRoles(matched);
      if (matched.length > 0) setSelectedRole(matched[0]);
      setAnalyzing(false);
    }, 600);
  };

  const handleProceed = async () => {
    if (!selectedRole) return;
    setGeneratingQs(true);

    // Generate questions tailored to projects listed in candidate's resume
    const tailoredQs = await generateResumeQuestions(resumeText, selectedRole.label);

    setGeneratingQs(false);

    onStartMatchedInterview({
      role: selectedRole,
      sessionConfig: {
        resumeText,
        resumeFileName: fileName,
        mode,
        personalizedQuestions: tailoredQs
      }
    });
  };

  return (
    <div style={{
      minHeight: "100vh", padding: "32px 20px", display: "flex",
      alignItems: "center", justifyContent: "center", background: "transparent"
    }}>
      <div style={{
        maxWidth: 720, width: "100%", padding: "32px",
        background: "rgba(15,23,42,0.8)", borderRadius: 22,
        border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>🤖</span>
          <div>
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>AI RESUME ROLE MATCHING</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Analyze Resume &amp; Generate Tailored Interview</h2>
          </div>
        </div>

        {/* Step 1: Upload Resume */}
        <div style={{
          padding: "20px", borderRadius: 14, background: "rgba(2,6,23,0.6)",
          border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>📄 1. Upload Candidate Resume</div>
            <button onClick={() => setShowPaste(!showPaste)} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              {showPaste ? "Upload File" : "Paste Text Directly"}
            </button>
          </div>

          {!showPaste ? (
            <div style={{ border: "2px dashed rgba(59,130,246,0.4)", borderRadius: 12, padding: "20px", textAlign: "center", background: "rgba(37,99,235,0.04)" }}>
              <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} id="resumeFileMatch" style={{ display: "none" }} />
              <label htmlFor="resumeFileMatch" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📤</div>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>Click to upload resume (.txt, .pdf, .doc)</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{fileName ? `File: ${fileName}` : "Extracts technologies, skills, and projects"}</div>
              </label>
            </div>
          ) : (
            <div>
              <textarea
                rows={4}
                value={resumeText}
                onChange={e => { setResumeText(e.target.value); analyzeResumeForRoles(e.target.value); }}
                placeholder="Paste your resume text here..."
                style={{
                  width: "100%", padding: "12px", borderRadius: 10,
                  background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit"
                }}
              />
            </div>
          )}
        </div>

        {/* Analyzing Spinner */}
        {analyzing && (
          <div style={{ textAlign: "center", padding: "20px", color: "#fbbf24" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⏳</div>
            AI is analyzing projects &amp; skills in your resume to find top role matches...
          </div>
        )}

        {/* Step 2: Matched Roles */}
        {!analyzing && resumeText && matchedRoles.length === 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", color: "#fef08a", fontSize: 13, marginBottom: 20 }}>
            ⚠️ <strong>Notice:</strong> Could not automatically detect text keywords from this file layout. Please click <strong>"Paste Text Directly"</strong> above for AI matching, or select your target role below:
          </div>
        )}

        {(matchedRoles.length > 0 ? matchedRoles : (resumeText ? ALLOWED_RESUME_ROLES.slice(0, 8) : [])).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              🎯 2. Select Your Preferred Role Match ({matchedRoles.length > 0 ? `${matchedRoles.length} Matches Found` : "Target Roles"})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {(matchedRoles.length > 0 ? matchedRoles : ALLOWED_RESUME_ROLES.slice(0, 8)).map(r => (
                <button key={r.id} onClick={() => setSelectedRole(r)}
                  style={{
                    padding: "14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                    background: selectedRole?.id === r.id ? "rgba(37,99,235,0.25)" : "rgba(15,23,42,0.6)",
                    border: selectedRole?.id === r.id ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "inherit", transition: "all 0.15s"
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    {r.score && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "rgba(52,211,153,0.15)", color: "#34d399", fontWeight: 700 }}>
                        {r.score}% Match
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Mode */}
        {selectedRole && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
              ⚙️ 3. Select Interview Mode (Max 7 Mins)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { id: "full", title: "Full Pipeline", desc: "HR + Technical" },
                { id: "hr", title: "HR Round Only", desc: "Behavioral STAR" },
                { id: "technical", title: "Technical Round", desc: "Domain Specific" },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{
                    padding: "12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    background: mode === m.id ? "rgba(37,99,235,0.2)" : "rgba(15,23,42,0.6)",
                    border: mode === m.id ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                    color: mode === m.id ? "#60a5fa" : "#cbd5e1"
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{m.title}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={{
            padding: "14px 20px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", borderRadius: 10,
            cursor: "pointer", fontSize: 14, fontWeight: 600
          }}>
            ← Back
          </button>

          <button onClick={handleProceed} disabled={!selectedRole || generatingQs}
            style={{
              flex: 1, padding: "14px 24px",
              background: !selectedRole || generatingQs ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff", border: "none", borderRadius: 10, cursor: !selectedRole || generatingQs ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(37,99,235,0.4)"
            }}>
            {generatingQs ? "✨ Generating Tailored Resume Questions..." : "▶ Start 100% Resume Project Interview →"}
          </button>
        </div>
      </div>
    </div>
  );
}
