from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
import sqlite3
from PyPDF2 import PdfReader
from mail import send_email, selected_template, rejected_template
from mail import send_selected, send_rejected
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
# ✅ DATABASE
# ===============================
conn = sqlite3.connect("candidates.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS candidates (
    id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    domain TEXT,
    resume_url TEXT,
    status TEXT,
    score INTEGER,
    reason TEXT
)
""")
conn.commit()

# ===============================
# ✅ UPLOAD FOLDER
# ===============================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

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
        raise HTTPException(status_code=400, detail="Only PDF allowed")

    # prevent duplicate
    cursor.execute("SELECT * FROM candidates WHERE email=?", (email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already applied")

    file_id = str(uuid.uuid4())
    file_name = f"{file_id}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    cursor.execute("""
    INSERT INTO candidates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        file_id,
        name,
        email,
        phone,
        domain,
        f"http://127.0.0.1:8000/uploads/{file_name}",
        "Pending",
        0,
        ""
    ))
    conn.commit()

    return {"message": "✅ Resume uploaded successfully"}


# ===============================
# 📋 GET CANDIDATES
# ===============================
@app.get("/candidates")
def get_candidates():

    cursor.execute("SELECT * FROM candidates")
    rows = cursor.fetchall()

    data = []
    for r in rows:
        data.append({
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "phone": r[3],
            "domain": r[4],
            "resume_url": r[5],
            "status": r[6],
            "score": r[7],
            "reason": r[8]
        })

    return {"data": data}


# ===============================
# 🔍 PDF TEXT
# ===============================
def extract_text(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()


# ===============================
# 🤖 ATS ANALYSIS
# ===============================
def analyze_resume(text):

    score = 0
    reasons = []

    # ❌ reject basic
    if "basic" in text:
        return 30, "Rejected", "Only basic knowledge"

    # ❌ must have project
    if "project" not in text:
        return 30, "Rejected", "No projects"

    score += 25
    reasons.append("Projects")

    # 🔥 strong project
    if "api" in text or "model" in text or "full stack" in text:
        score += 20
        reasons.append("Strong project")
    else:
        score += 5
        reasons.append("Basic project")

    # 🔥 skills
    skills = ["python", "react", "node", "sql"]
    count = sum(1 for s in skills if s in text)

    if count >= 3:
        score += 20
        reasons.append("Strong skills")
    elif count >= 1:
        score += 10
        reasons.append("Limited skills")
    else:
        return 40, "Rejected", "No strong skills"

    # 🔥 internship
    if "internship" in text:
        score += 10
        reasons.append("Internship")

    # 🎯 final
    decision = "Selected" if score >= 75 else "Rejected"

    return score, decision, ", ".join(reasons)


# ===============================
# 🚀 AI SELECT
# ===============================
@app.post("/ai-select")
def ai_select():

    cursor.execute("SELECT * FROM candidates")
    rows = cursor.fetchall()

    for r in rows:

        id, name, email, phone, domain, resume_url, _, _, _ = r

        file_name = resume_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        if not os.path.exists(file_path):
            continue

        text = extract_text(file_path)

        score, decision, reason = analyze_resume(text)

        cursor.execute("""
        UPDATE candidates
        SET status=?, score=?, reason=?
        WHERE id=?
        """, (decision, score, reason, id))

        conn.commit()

    return {"message": "🤖 ATS selection completed"}

@app.post("/send-selected-mails")
def send_selected(sender: str = Form(...), password: str = Form(...)):

    cursor.execute("SELECT name, email FROM candidates WHERE status='Selected'")
    rows = cursor.fetchall()

    count = 0

    for name, email in rows:
        subject = "🎉 Congratulations - Selected"
        body = selected_template(name)

        if send_email(sender, password, email, subject, body):
            count += 1

    return {"message": f"{count} selected mails sent"}

@app.post("/send-rejected-mails")
def send_rejected(sender: str = Form(...), password: str = Form(...)):

    cursor.execute("SELECT name, email FROM candidates WHERE status='Rejected'")
    rows = cursor.fetchall()

    count = 0

    for name, email in rows:
        subject = "Application Update"
        body = rejected_template(name)

        if send_email(sender, password, email, subject, body):
            count += 1

    return {"message": f"{count} rejected mails sent"}

@app.post("/send-selected-mails")
def send_selected_api(sender: str = Form(...), password: str = Form(...)):
    return {"message": send_selected(sender, password)}


@app.post("/send-rejected-mails")
def send_rejected_api(sender: str = Form(...), password: str = Form(...)):
    return {"message": send_rejected(sender, password)}

@app.put("/candidate/{candidate_id}")
def update_status(candidate_id: str, status: str = Form(...)):

    cursor.execute("""
    UPDATE candidates
    SET status=?
    WHERE id=?
    """, (status, candidate_id))

    conn.commit()

    return {"message": "Status updated"}