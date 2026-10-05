// ── 20 Core HR / Behavioral Questions Bank ─────────────────────────────
export const HR_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "Describe a situation where you resolved a difficult conflict with a teammate.",
  "Tell me about a time you led a team or project under tight deadlines.",
  "Where do you see yourself in five years?",
  "Describe a time you failed and what you learned from it.",
  "How do you handle high-pressure or stressful situations at work?",
  "Why do you want to join our organization?",
  "Describe a time you had to persuade stakeholders to adopt your idea.",
  "How do you prioritize competing tasks when everything seems urgent?",
  "Describe a situation where you had to adapt quickly to an unexpected change.",
  "Tell me about a time you took initiative beyond your job responsibilities.",
  "How do you give and receive critical feedback?",
  "Describe a complex problem you solved using creative thinking.",
  "What is your biggest professional weakness and how are you working on it?",
  "Tell me about a time you mentored or helped a colleague succeed.",
  "How do you ensure ethical standards when making tough workplace decisions?",
  "Describe a project you are most proud of and your exact contribution.",
  "How do you handle working with a difficult coworker or manager?",
  "Tell me about a time you had to deliver bad news to a team or customer.",
  "What motivates you to perform at your best every day?"
];

// ── Role-Specific Behavioral / HR Questions for ALL 22 Roles ─────────
export const ROLE_HR_QUESTIONS = {
  fullstack: [
    "Tell me about a time you had to balance frontend UX priorities with backend database constraints.",
    "Describe how you coordinate delivery between frontend and backend teammates under tight sprint deadlines.",
    "How do you handle architectural disagreements regarding API contract design between client and server developers?",
    "Describe a production issue in a full stack application and how you communicated status to stakeholders."
  ],
  frontend: [
    "How do you handle situations where UX designs are technically difficult to implement within project timelines?",
    "Describe how you collaborate with backend developers when API responses are delayed or incomplete.",
    "Tell me about a time you advocated for web accessibility or performance optimization to non-technical managers."
  ],
  backend: [
    "Describe a situation where a database performance issue impacted production users and how you handled team communication.",
    "How do you convince product managers to prioritize technical debt and backend refactoring?",
    "Tell me about a time you had to make an architectural trade-off under high traffic pressure."
  ],
  java: [
    "Describe how you mentor junior developers in enterprise Java design patterns and clean coding standards.",
    "Tell me about a time you managed a major Java version upgrade or framework migration across teams."
  ],
  python: [
    "Tell me about a time you used Python to automate a repetitive team process and save engineering hours.",
    "Describe how you handle code reviews when teammates use overly complex Pythonic syntax."
  ],
  react: [
    "How do you handle disagreements on React state management architecture within a development team?",
    "Describe a time you refactored legacy React components while maintaining continuous feature delivery."
  ],
  nodejs: [
    "Tell me about a time a non-blocking I/O event loop bottleneck occurred and how you led resolution under pressure.",
    "Describe how you explain Node.js asynchronous architecture trade-offs to stakeholders."
  ],
  angular: [
    "Describe how you manage large enterprise Angular codebase migrations while training new team members."
  ],
  dotnet: [
    "Tell me about a time you coordinated enterprise C# .NET deployments with cross-functional infrastructure teams."
  ],
  php: [
    "Describe how you handled security hardening or legacy code refactoring in a PHP web production system."
  ],
  ai_engineer: [
    "Tell me about a time you had to explain AI model limitations and hallucinations to non-technical business leaders.",
    "How do you handle ethical considerations and data privacy when designing AI applications?"
  ],
  ml_engineer: [
    "Describe a situation where a machine learning model underperformed in production and how you managed expectations.",
    "How do you prioritize model accuracy versus inference latency when collaborating with product teams?"
  ],
  genai_engineer: [
    "Tell me about how you handle prompt safety, guardrails, and compliance when releasing Generative AI features.",
    "Describe how you evaluate trade-offs between open-source LLMs and proprietary APIs under budget constraints."
  ],
  data_scientist: [
    "Describe how you present complex statistical insights to executives who prefer simple actionable summaries.",
    "Tell me about a time your data hypothesis was proven wrong and how you pivoted your research approach."
  ],
  data_engineer: [
    "Describe a scenario where data pipeline failure corrupted downstream analytics and how you handled incident post-mortem.",
    "How do you negotiate data schema changes with upstream application development teams?"
  ],
  data_analyst: [
    "Tell me about a time you uncovered an unexpected business trend in data and persuaded leadership to take action.",
    "How do you handle tight deadline requests for ad-hoc reports from multiple department heads?"
  ],
  bi_dev: [
    "Describe how you gather dashboard requirements from non-technical business users who have conflicting needs.",
    "Tell me about a time you improved business intelligence report adoption across an organization."
  ],
  mlops_engineer: [
    "Describe how you handle emergencies when automated model retraining pipelines fail in production.",
    "Tell me about a time you established MLOps CI/CD standards across resistant data science teams."
  ],
  cybersec: [
    "Describe a security incident response situation and how you maintained calm communication under intense crisis.",
    "How do you balance strict cybersecurity policies with developer productivity when teams push back?"
  ],
  sec_engineer: [
    "Tell me about a time you identified a critical vulnerability in a production system and convinced engineering to patch immediately.",
    "Describe how you integrate security threat modeling into agile sprint planning."
  ],
  ethical_hacker: [
    "Describe how you communicate high-risk penetration test findings to executive leadership without causing panic.",
    "How do you ensure ethical boundaries and legal compliance during authorized security assessments?"
  ],
  cloud_sec: [
    "Tell me about a time you detected a cloud infrastructure misconfiguration and remediated it across multi-cloud environments.",
    "How do you educate engineering teams on cloud zero-trust security best practices?"
  ]
};

const FILLER_WORDS = [
  "um","uh","like","you know","basically","actually","literally",
  "so","right","okay","kind of","sort of","i mean","you see",
  "hmm","er","ah","well","anyway","honestly","clearly","obviously"
];

export function countFillers(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((count, fw) => {
    const regex = new RegExp("\\b" + fw.replace(/\s+/g,"\\s+") + "\\b", "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function quickScore(text) {
  if (!text || text.trim().length < 3) return 0;
  const w = text.trim().split(/\s+/).length;
  const fil = countFillers(text);
  const noAns = ["i don't know","no idea","not sure","i have no idea","skip","pass"]
    .some(p => text.toLowerCase().includes(p));
  if (noAns) return 1;
  let sc = w >= 50 ? 5 : w >= 30 ? 4 : w >= 15 ? 3 : w >= 6 ? 2 : 1;
  return Math.max(1, sc - Math.floor(fil / 3));
}

// Evaluate HR answer using STAR Method with brief actionable suggestions
export async function aiEvaluateHR(question, answer) {
  if (!answer || answer.trim().length < 3 || answer === "(no answer)") {
    return {
      score: 0,
      answerQuality: 0,
      label: "No Answer",
      feedback: "Brief: No spoken response recorded. Focus on explaining situation and personal action taken.",
      starBreakdown: { situation: false, task: false, action: false, result: false },
      keyPoints: ["No answer provided"],
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
        system: `You are an expert HR interviewer. Evaluate the candidate's spoken response using the STAR Method. Return concise, brief feedback highlighting exact areas to improve and concrete suggestions. Return ONLY valid JSON.`,
        messages: [{
          role: "user",
          content: `HR Question: "${question}"
Candidate's spoken answer: "${answer}"

Return ONLY this JSON:
{
  "score": <integer 1-5 STAR adherence>,
  "answerQuality": <integer 1-5 completeness & metrics>,
  "label": "<Excellent|Good|Fair|Needs Work|No Answer>",
  "starBreakdown": {
    "situation": <boolean>,
    "task": <boolean>,
    "action": <boolean>,
    "result": <boolean>
  },
  "feedback": "<Brief 2-sentence feedback: exact area to improve & 1 clear suggestion>",
  "keyPoints": ["<point1>","<point2>"]
}`
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g,"").trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, fillers };
  } catch(e) {
    const sc = quickScore(answer);
    const labels = ["","Needs Work","Needs Work","Fair","Good","Excellent"];
    return {
      score: sc,
      answerQuality: sc,
      label: labels[sc] || "Fair",
      starBreakdown: { situation: true, task: true, action: sc >= 3, result: sc >= 4 },
      feedback: "Brief: Answer covers key points. Suggestion: Include explicit quantitative results for higher impact.",
      keyPoints: ["Answer recorded", "State quantifiable outcome"],
      fillers
    };
  }
}

// Generate 100% PROJECT-SPECIFIC Resume Questions
export async function generateResumeQuestions(resumeText, roleLabel) {
  if (!resumeText || resumeText.trim().length < 30) return [];
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: `You are a Lead Hiring Manager interviewing a candidate. Read the candidate's resume text carefully. Identify specific project names, technologies, architectures, and achievements listed (for example, if candidate built 'Customer Churn Prediction' or 'E-commerce API'). Generate 6 highly specific technical and project questions tailored 100% directly to the candidate's projects listed in their resume! Do NOT generate generic questions. Return ONLY a JSON array of strings.`,
        messages: [{
          role: "user",
          content: `Candidate Resume Content:\n"""\n${resumeText.substring(0, 3000)}\n"""\n\nReturn ONLY a JSON array of 6 project-specific question strings, no markdown:\n["In your [Project Name] project, how did you...", "For the [Project Name] system, what...", ...]`
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g,"").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;

    return generateProjectFallbackQuestions(resumeText, roleLabel);
  } catch(e) {
    return generateProjectFallbackQuestions(resumeText, roleLabel);
  }
}

function generateProjectFallbackQuestions(resumeText, roleLabel) {
  const textLower = (resumeText || "").toLowerCase();
  const qs = [];

  if (textLower.includes("churn") || textLower.includes("customer")) {
    qs.push("In your Customer Churn Prediction project, how did you handle class imbalance and feature selection?");
    qs.push("For your Customer Churn model, what metrics (ROC-AUC, Precision, Recall) did you optimize and why?");
  }
  if (textLower.includes("react") || textLower.includes("frontend")) {
    qs.push("In your React web application, how did you manage state, code splitting, and component re-render performance?");
  }
  if (textLower.includes("node") || textLower.includes("python") || textLower.includes("api") || textLower.includes("backend")) {
    qs.push("For the backend API microservice listed on your resume, how did you design error handling and database connection pooling?");
  }
  if (textLower.includes("data") || textLower.includes("pipeline") || textLower.includes("postgres")) {
    qs.push("In the data pipeline project listed on your resume, how did you optimize SQL query execution and schema indexing?");
  }

  if (qs.length === 0) {
    qs.push(`In your primary project listed on your resume, what was your exact architectural contribution for ${roleLabel}?`);
    qs.push("What was the most difficult bug or performance bottleneck you encountered in your key resume project and how did you resolve it?");
    qs.push("How did you test and validate system reliability in your recent project?");
  }

  return qs;
}
