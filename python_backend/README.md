# PRANISHREE AI Interview Engine — Python Backend

This is the complete Python backend service for **PRANISHREE**, built using **FastAPI**.

## 🚀 How to Run the Python Backend

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set your Anthropic API Key (Optional)
```bash
export ANTHROPIC_API_KEY="your_actual_anthropic_api_key"
# On Windows PowerShell:
$env:ANTHROPIC_API_KEY="your_actual_anthropic_api_key"
```

### 3. Start the Python Server
```bash
python app.py
```
or
```bash
uvicorn app:app --reload --port 8000
```

The Python server will be live at `http://localhost:8000`.

---

## 📡 Available API Endpoints

- `GET /api/roles`: Returns all 22 specialized technical roles.
- `POST /api/calculate-irs`: Calculates exact IRS scores using weighted formulas.
- `POST /api/resume-match`: Parses resume text, matches top roles, and generates 100% project-tailored technical questions.
- `POST /api/pranishree-coach`: Executes the exact **Pranishree AI Career Coach** system prompt logic.
