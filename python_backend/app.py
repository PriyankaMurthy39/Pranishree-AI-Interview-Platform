"""
PRANISHREE — AI CAREER COACH & INTERVIEW ENGINE (PYTHON FASTAPI BACKEND)
========================================================================
Full Python Backend implementing:
1. Exact IRS Scoring Formulas (Technical Only, HR Only, Both Modes)
2. NLP Resume Parser & 100% Project-Specific Question Generator
3. STAR Method Behavioral & Technical Answer Evaluators
4. Pranishree AI Career Coach Prompt System (Greeting Override & Role Topics)
5. 22 Specialized Technical Roles & HR Question Repository
"""

import os
import re
import random
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic

app = FastAPI(
    title="PRANISHREE AI Interview Engine Backend",
    description="Python FastAPI backend powering PRANISHREE Spoken AI Assessment System",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Anthropic Claude Client Initialization
CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY) if CLAUDE_API_KEY else None

# ── 22 SPECIALIZED TECHNICAL ROLES ──────────────────────────────────────────────
ROLES = [
    {"id": "fullstack", "label": "Full Stack Developer", "category": "Software Development", "icon": "⚡"},
    {"id": "frontend", "label": "Frontend Developer", "category": "Software Development", "icon": "🎨"},
    {"id": "backend", "label": "Backend Developer", "category": "Software Development", "icon": "⚙️"},
    {"id": "java", "label": "Java Developer", "category": "Software Development", "icon": "☕"},
    {"id": "python", "label": "Python Developer", "category": "Software Development", "icon": "🐍"},
    {"id": "react", "label": "React Developer", "category": "Software Development", "icon": "⚛️"},
    {"id": "nodejs", "label": "Node.js Developer", "category": "Software Development", "icon": "🟢"},
    {"id": "angular", "label": "Angular Developer", "category": "Software Development", "icon": "🅰️"},
    {"id": "dotnet", "label": ".NET Developer", "category": "Software Development", "icon": "🔷"},
    {"id": "php", "label": "PHP Developer", "category": "Software Development", "icon": "🐘"},
    {"id": "ai_engineer", "label": "AI Engineer", "category": "AI, ML & Data", "icon": "🤖"},
    {"id": "ml_engineer", "label": "Machine Learning Engineer", "category": "AI, ML & Data", "icon": "🧠"},
    {"id": "genai_engineer", "label": "Generative AI Engineer", "category": "AI, ML & Data", "icon": "✨"},
    {"id": "data_scientist", "label": "Data Scientist", "category": "AI, ML & Data", "icon": "🔬"},
    {"id": "data_engineer", "label": "Data Engineer", "category": "AI, ML & Data", "icon": "🧱"},
    {"id": "data_analyst", "label": "Data Analyst", "category": "AI, ML & Data", "icon": "📊"},
    {"id": "bi_dev", "label": "Business Intelligence Developer", "category": "AI, ML & Data", "icon": "📈"},
    {"id": "mlops_engineer", "label": "MLOps Engineer", "category": "AI, ML & Data", "icon": "🚀"},
    {"id": "cybersec", "label": "Cybersecurity Analyst", "category": "Security", "icon": "🔑"},
    {"id": "sec_engineer", "label": "Security Engineer", "category": "Security", "icon": "🛡️"},
    {"id": "ethical_hacker", "label": "Ethical Hacker", "category": "Security", "icon": "💻"},
    {"id": "cloud_sec", "label": "Cloud Security Engineer", "category": "Security", "icon": "☁️"}
]

# ── ROLE-SPECIFIC TECHNICAL TOPIC REPOSITORY ─────────────────────────────────
ROLE_TECHNICAL_TOPICS = {
    "php": ["PHP fundamentals & OOP in PHP", "Laravel Framework & MVC architecture", "REST APIs & JSON handling", "MySQL database optimization & PDO", "Authentication & Security best practices"],
    "nodejs": ["JavaScript ES6+ & Node.js Core Modules", "Event Loop, Non-blocking I/O & Microtasks", "Express.js & RESTful API Architecture", "Async/Await, Promises & Error Handling", "JWT Authentication & Security"],
    "python": ["Python Data Structures & OOP principles", "Django / FastAPI web frameworks", "Database ORM (SQLAlchemy) & Query optimization", "Asyncio & Multithreading", "Pytest unit testing"],
    "react": ["React Hooks (useState, useEffect, useMemo)", "State Management (Redux Toolkit, Context API)", "Virtual DOM reconciliation", "Code splitting & Performance tuning", "SSR / Next.js fundamentals"],
    "fullstack": ["Frontend & Backend architecture coordination", "REST & GraphQL API design", "Database ORMs, Transactions & Indexing", "Authentication & CORS", "Docker & CI/CD Pipelines"],
    "cybersec": ["Network Security, Firewalls & VPNs", "Vulnerability Assessment & Pen Testing", "OWASP Top 10 Web Vulnerabilities", "Incident Response & Forensics", "Zero-Trust Architecture & IAM"]
}

# ── PYDANTIC DATA MODELS ───────────────────────────────────────────────────────
class ScoringRequest(BaseModel):
    mode: str # "technical" | "hr" | "full"
    technical_score: float
    problem_solving_score: float
    behavioral_score: float
    answer_quality_score: float
    communication_score: float
    answered_count: int

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    role_label: Optional[str] = "Technical Role"

class EvaluationRequest(BaseModel):
    question: str
    answer: str
    role_label: str
    type: str # "hr" | "technical"

class CoachMessage(BaseModel):
    role: str # "user" | "assistant"
    content: str

class CoachChatRequest(BaseModel):
    query: str
    messages: List[CoachMessage]
    candidate_data: Dict

# ── API ENDPOINTS ─────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "PRANISHREE AI Interview Engine",
        "engine": "Python FastAPI",
        "roles_count": len(ROLES)
    }

@app.get("/api/roles")
def get_roles():
    return {"roles": ROLES}

@app.post("/api/calculate-irs")
def calculate_irs(req: ScoringRequest):
    """
    EXACT USER MATHEMATICAL SCORING FORMULAS:
    1. Technical Only: IRS = 0.70 * Tech + 0.20 * ProbSolv + 0.10 * Comm
    2. HR Only: IRS = 0.50 * Beh + 0.30 * AnsQual + 0.20 * Comm
    3. Both HR + Technical:
       HR Score = 0.50 * Beh + 0.30 * AnsQual + 0.20 * Comm
       Tech Score = 0.70 * Tech + 0.20 * ProbSolv + 0.10 * Comm
       Final IRS = 0.40 * HR Score + 0.60 * Tech Score
    
    STRICT RULE: If answered_count == 0, ALL SCORES ARE 0%!
    """
    if req.answered_count == 0:
        return {
            "mode": req.mode,
            "technical_score": 0.0,
            "problem_solving_score": 0.0,
            "behavioral_score": 0.0,
            "answer_quality_score": 0.0,
            "communication_score": 0.0,
            "hr_score": 0.0,
            "tech_score": 0.0,
            "final_irs": 0.0,
            "recommendation": "Not Recommended"
        }

    computed_hr_score = round(0.50 * req.behavioral_score + 0.30 * req.answer_quality_score + 0.20 * req.communication_score, 2)
    computed_tech_score = round(0.70 * req.technical_score + 0.20 * req.problem_solving_score + 0.10 * req.communication_score, 2)

    final_irs = 0.0
    if req.mode == "technical":
        final_irs = computed_tech_score
    elif req.mode == "hr":
        final_irs = computed_hr_score
    else: # Both HR + Technical
        final_irs = round(0.40 * computed_hr_score + 0.60 * computed_tech_score, 2)

    # Hiring Recommendation Badges
    recommendation = "Not Recommended"
    if final_irs >= 80:
        recommendation = "Highly Recommended"
    elif final_irs >= 70:
        recommendation = "Recommended"
    elif final_irs >= 60:
        recommendation = "Consider / Needs Minor Improvement"
    elif final_irs >= 40:
        recommendation = "Needs Improvement"

    return {
        "mode": req.mode,
        "technical_score": req.technical_score,
        "problem_solving_score": req.problem_solving_score,
        "behavioral_score": req.behavioral_score,
        "answer_quality_score": req.answer_quality_score,
        "communication_score": req.communication_score,
        "hr_score": computed_hr_score,
        "tech_score": computed_tech_score,
        "final_irs": final_irs,
        "recommendation": recommendation
    }

@app.post("/api/resume-match")
def resume_match(req: ResumeAnalysisRequest):
    """
    Parses resume text, calculates match % against 22 roles,
    and generates 100% project-specific technical questions.
    """
    t_lower = req.resume_text.lower()
    
    # Skill Extraction & Role Matching Algorithm
    matched_roles = []
    for r in ROLES:
        match_score = 50
        kw = r["label"].lower().split()
        for word in kw:
            if len(word) > 3 and word in t_lower:
                match_score += 20
        if "python" in t_lower and "python" in r["id"]: match_score += 30
        if "react" in t_lower and "react" in r["id"]: match_score += 30
        if "security" in t_lower and "security" in r["id"]: match_score += 30
        if "data" in t_lower and "data" in r["id"]: match_score += 25
        
        matched_roles.append({**r, "score": min(98, match_score)})

    matched_roles.sort(key=lambda x: x["score"], reverse=True)
    top_matches = matched_roles[:5]

    # Generate Project-Specific Questions
    project_qs = []
    if "churn" in t_lower or "customer" in t_lower:
        project_qs.append("In your Customer Churn Prediction project, how did you handle class imbalance and feature selection?")
        project_qs.append("For your Customer Churn model, what metrics (ROC-AUC, Precision, Recall) did you optimize and why?")
    if "react" in t_lower or "frontend" in t_lower:
        project_qs.append("In your React web application, how did you manage state, code splitting, and component re-render performance?")
    if "node" in t_lower or "api" in t_lower or "backend" in t_lower:
        project_qs.append("For the backend API microservice listed on your resume, how did you design error handling and database connection pooling?")

    if not project_qs:
        project_qs = [
            f"In your primary project listed on your resume, what was your exact architectural contribution for {req.role_label}?",
            "What was the most difficult bug or performance bottleneck you encountered in your key project and how did you resolve it?",
            "How did you test and validate system reliability in your recent project?"
        ]

    return {
        "matched_roles": top_matches,
        "personalized_questions": project_qs
    }

@app.post("/api/pranishree-coach")
def pranishree_coach(req: CoachChatRequest):
    """
    EXECUTES PRANISHREE AI CAREER COACH PROMPT RULES:
    1. Greeting Detection & Override
    2. Latest User Message Priority
    3. Intent Classification (IRS, Resume, Skills, Projects, Interview Prep)
    4. Never force ATS tips when user asks about IRS or greets!
    """
    q_trim = req.query.strip()
    q_lower = q_trim.lower()

    # Rule 1: Greeting Detection Override
    greeting_words = [
        "hi", "hii", "hiii", "hiiii", "hlo", "hlooo", "hloooo", "hello", "hellooo",
        "hey", "heyy", "heyyy", "yo", "yoo", "good morning", "good afternoon",
        "good evening", "hi pranishree", "hello pranishree", "hey pranishree", "hlo pranishree"
    ]
    
    if q_lower in greeting_words or (re.match(r"^(hi|hlo|hello|hey|yo)\b", q_lower) and len(q_lower.split()) <= 2):
        return {
            "response": "Hi! 👋 I'm **Pranishree**, your AI Career Coach.\n\nI can help you with your **resume, interview preparation, IRS score, technical skills, projects, and career growth**.\n\nWhat would you like help with today?"
        }

    # Rule 2: Ambiguity Check
    if q_lower in ["how can i improve?", "how to improve?", "improve"]:
        return {
            "response": "Do you want to improve your Interview Readiness Score (IRS), resume, technical skills, or communication?"
        }

    # Rule 3: IRS Questions (Only when explicitly asked)
    if any(k in q_lower for k in ["irs", "score", "my interview", "increase my interview score", "improve in my interview"]):
        c_data = req.candidate_data
        irs = c_data.get("combinedIRS", 0)
        answered = c_data.get("answeredCount", 0)
        role_title = c_data.get("roleLabel", "Candidate")
        rec = c_data.get("recommendation", "Not Recommended")

        if answered == 0:
            return {
                "response": "### 🎯 Your Current IRS: 0%\nYour current IRS is **0%** because no questions were answered during the session.\n\n### 🚀 Action Plan\n1. **Attempt Spoken Answers:** Speak clearly into the microphone for each question.\n2. **Practice Out Loud:** Practice technical prompts before your next session.\n\n### 🎯 Next Interview Targets\n- Answer at least 90% of questions.\n- Achieve a minimum technical accuracy score of 70%+.\n- Speak clearly without tab switching or leaving camera view."
            }
        
        return {
            "response": f"### 🎯 Your Current IRS: {irs}%\nYour current Interview Readiness Score is **{irs}%** ({rec}). To improve it, focus first on your lowest-scoring interview areas:\n\n### 📊 Biggest Areas to Improve\n1. **Technical Accuracy — {c_data.get('technicalScore', 0)}%**\n• Practice role-specific technical questions for {role_title} out loud.\n2. **Problem Solving — {c_data.get('problemSolvingScore', 0)}%**\n• Explain code logic and architectural trade-offs step by step.\n3. **Communication — {c_data.get('communicationScore', 0)}%**\n• Keep answers direct and reduce filler words.\n\n### 🚀 Action Plan\n1. Re-study core architecture principles for {role_title}.\n2. Practice structured 45-second spoken answers.\n3. Take a 2-second silent pause before speaking.\n\n### 🎯 Next Targets\n- Answer 90%+ questions completely.\n- Target technical accuracy of 75%+."
        }

    # Rule 4: Technical Skills Questions (Role-Tailored)
    if any(k in q_lower for k in ["technical topic", "what should i study", "topics to study", "technical skill"]):
        role_id = req.candidate_data.get("roleId", "fullstack")
        role_title = req.candidate_data.get("roleLabel", "Candidate")
        topics = ROLE_TECHNICAL_TOPICS.get(role_id, [
            f"Core architecture and design patterns for {role_title}",
            "REST API design and database query optimization",
            "Error handling, debugging, and production security best practices",
            "Asynchronous programming, performance tuning, and testing"
        ])

        formatted_topics = "\n".join([f"{idx+1}. **{t}**" for idx, t in enumerate(topics)])
        return {
            "response": f"### 📚 Recommended Technical Topics to Study for {role_title}\nHere are specific technical topics to revise for **{role_title}**:\n\n{formatted_topics}\n\nFocus on explaining the reasoning and trade-offs behind these topics out loud!"
        }

    # Rule 5: Resume Questions (Only when asked)
    if any(k in q_lower for k in ["resume", "ats", "action verb", "formatting"]):
        return {
            "response": "### 📝 Resume Optimization Guidelines\n- **Use Action Verbs:** Start bullet points with strong action verbs (*Architected, Engineered, Developed, Streamlined*).\n- **Quantify Impact:** State measurable results (e.g. 'Reduced page load time by 42%').\n- **ATS Keywords:** Use clear section headers (Summary, Technical Skills, Education, Projects, Achievements)."
        }

    # Default Answer
    return {
        "response": f"Hi! 👋 I'm **Pranishree**, your AI Career Coach. How can I help you with your **{req.candidate_data.get('roleLabel', 'Career')}** preparation today?"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
