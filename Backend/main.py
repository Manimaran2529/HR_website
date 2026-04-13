from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
from PyPDF2 import PdfReader

app = FastAPI()

# ===============================
# ✅ CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# ✅ UPLOAD FOLDER
# ===============================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# ===============================
# ✅ TEMP DATABASE
# ===============================
candidates = []

# ===============================
# 🚀 UPLOAD RESUME
# ===============================
@app.post("/upload")
async def upload_resume(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    domain: str = Form(...),
    resume: UploadFile = File(...)
):

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # Prevent duplicate email
    for c in candidates:
        if c["email"] == email:
            raise HTTPException(status_code=400, detail="Email already applied")

    file_id = str(uuid.uuid4())
    file_name = f"{file_id}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    candidate = {
        "id": file_id,
        "name": name,
        "email": email,
        "phone": phone,
        "domain": domain,  # user selected
        "detected_domain": None,  # AI detected
        "resume_url": f"http://127.0.0.1:8000/uploads/{file_name}",
        "status": "Pending",
        "score": 0,
        "reason": ""
    }

    candidates.append(candidate)

    return {"message": "✅ Resume uploaded successfully"}


# ===============================
# 📋 GET CANDIDATES
# ===============================
@app.get("/candidates")
def get_candidates():
    return {
        "total": len(candidates),
        "data": candidates
    }


# ===============================
# ✏️ UPDATE STATUS
# ===============================
@app.put("/candidate/{candidate_id}")
def update_status(candidate_id: str, status: str = Form(...)):

    for c in candidates:
        if c["id"] == candidate_id:
            c["status"] = status
            return {"message": f"Status updated to {status}"}

    raise HTTPException(status_code=404, detail="Candidate not found")


# ===============================
# ❌ DELETE CANDIDATE
# ===============================
@app.delete("/candidate/{candidate_id}")
def delete_candidate(candidate_id: str):

    global candidates

    candidate = next((c for c in candidates if c["id"] == candidate_id), None)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # delete file
    file_name = candidate["resume_url"].split("/")[-1]
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    if os.path.exists(file_path):
        os.remove(file_path)

    candidates = [c for c in candidates if c["id"] != candidate_id]

    return {"message": "Candidate deleted successfully"}


# ===============================
# 🔍 EXTRACT TEXT FROM PDF
# ===============================
def extract_text(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()


# ===============================
# 🧠 AUTO DOMAIN DETECTION
# ===============================
def detect_domain(text):

    if "machine learning" in text or "model" in text:
        return "ML"

    elif "react" in text or "javascript" in text or "frontend" in text:
        return "Web"

    elif "data analysis" in text or "sql" in text:
        return "Data Science"

    return "Unknown"


# ===============================
# 🤖 RESUME ANALYSIS
# ===============================
def analyze_resume(text, domain):

    score = 0
    reasons = []

    # Common checks
    if "project" in text:
        score += 20
        reasons.append("Projects")

    if "internship" in text:
        score += 20
        reasons.append("Internship")

    # Domain-specific checks
    if domain == "ML":
        if "python" in text:
            score += 20
            reasons.append("Python")
        if "model" in text:
            score += 20
            reasons.append("ML Model")
        if "dataset" in text:
            score += 20
            reasons.append("Dataset")

    elif domain == "Web":
        if "react" in text:
            score += 20
            reasons.append("React")
        if "javascript" in text:
            score += 20
            reasons.append("JavaScript")
        if "api" in text:
            score += 20
            reasons.append("API")

    elif domain == "Data Science":
        if "python" in text:
            score += 20
            reasons.append("Python")
        if "sql" in text:
            score += 20
            reasons.append("SQL")
        if "analysis" in text:
            score += 20
            reasons.append("Analysis")

    decision = "Selected" if score >= 60 else "Rejected"

    return score, decision, ", ".join(reasons)


# ===============================
# 🚀 AI SMART SELECTION
# ===============================
@app.post("/ai-select")
def ai_select():

    for c in candidates:

        file_name = c["resume_url"].split("/")[-1]
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        text = extract_text(file_path)

        # 🔥 Detect actual domain
        detected = detect_domain(text)
        c["detected_domain"] = detected

        # 🔥 Analyze
        score, decision, reason = analyze_resume(text, detected)

        c["score"] = score
        c["status"] = decision
        c["reason"] = reason

    return {"message": "🤖 AI selection completed"}