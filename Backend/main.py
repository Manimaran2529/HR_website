from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import shutil
import os
import uuid
import sqlite3
from PyPDF2 import PdfReader

from mail import (
    send_email,
    selected_template,
    rejected_template,
    send_aptitude_mails
)

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
    stage TEXT DEFAULT 'Resume',
    created_at TEXT,

    aptitude_date TEXT,
    technical_date TEXT,
    coding_date TEXT
)
""")
conn.commit()

# ===============================
# 📂 UPLOAD
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

    cursor.execute("SELECT * FROM candidates WHERE email=?", (email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Already applied")

    file_id = str(uuid.uuid4())
    file_name = f"{file_id}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    cursor.execute("""
    INSERT INTO candidates 
    (id, name, email, phone, domain, resume_url, status, score, stage, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        file_id,
        name,
        email,
        phone,
        domain,
        f"http://127.0.0.1:8000/uploads/{file_name}",
        "Pending",
        0,
        "Resume",
        datetime.now().strftime("%Y-%m")
    ))

    conn.commit()

    return {"message": "✅ Resume uploaded"}

# ===============================
# 📋 GET RESUME PAGE
# ===============================
@app.get("/candidates")
def get_candidates():

    cursor.execute("SELECT * FROM candidates WHERE stage='Resume'")
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
            "score": r[7]
        })

    return {"data": data}

# ===============================
# 🤖 AI SELECT
# ===============================
def extract_text(path):
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()

def analyze(text):
    score = 50
    if "python" in text: score += 10
    if "react" in text: score += 10
    if "sql" in text: score += 10
    if "internship" in text: score += 10
    return score, "Selected" if score >= 70 else "Rejected"

@app.post("/ai-select")
def ai_select():

    cursor.execute("SELECT * FROM candidates WHERE stage='Resume'")
    rows = cursor.fetchall()

    for r in rows:
        file_path = os.path.join(UPLOAD_FOLDER, r[5].split("/")[-1])

        if not os.path.exists(file_path):
            continue

        text = extract_text(file_path)
        score, status = analyze(text)

        cursor.execute(
            "UPDATE candidates SET score=?, status=? WHERE id=?",
            (score, status, r[0])
        )

    conn.commit()
    return {"message": "AI Done"}

# ===============================
# ✏️ MANUAL STATUS UPDATE
# ===============================
@app.put("/candidate/{id}")
def update_status(id: str, status: str = Form(...)):

    cursor.execute("UPDATE candidates SET status=? WHERE id=?", (status, id))
    conn.commit()

    return {"message": "Updated"}

# ===============================
# 📧 SEND MAIL + MOVE / DELETE
# ===============================
@app.post("/send-mails")
def send_mails(sender: str = Form(...), password: str = Form(...)):

    cursor.execute("""
    SELECT id, name, email, domain, status 
    FROM candidates 
    WHERE stage='Resume'
    """)

    rows = cursor.fetchall()

    selected_ids = []
    rejected_ids = []

    for id, name, email, domain, status in rows:

        if status == "Selected":
            send_email(sender, password, email,
                       "🎉 Selected",
                       selected_template(name, domain))
            selected_ids.append(id)

        elif status == "Rejected":
            send_email(sender, password, email,
                       "Application Update",
                       rejected_template(name, domain))
            rejected_ids.append(id)

    # ✅ MOVE TO APTITUDE
    for id in selected_ids:
        cursor.execute("UPDATE candidates SET stage='Aptitude' WHERE id=?", (id,))

    # ❌ DELETE REJECTED
    for id in rejected_ids:
        cursor.execute("DELETE FROM candidates WHERE id=?", (id,))

    conn.commit()

    return {
        "selected_moved": len(selected_ids),
        "rejected_removed": len(rejected_ids)
    }

# ===============================
# 📅 SCHEDULE APTITUDE
# ===============================
@app.put("/schedule-aptitude")
def schedule_aptitude(
    domain: str = Form(...),
    test_date: str = Form(...),
    sender: str = Form(...),
    password: str = Form(...)
):

    cursor.execute("""
    UPDATE candidates
    SET aptitude_date=?
    WHERE stage='Aptitude' AND domain=?
    """, (test_date, domain))

    conn.commit()

    result = send_aptitude_mails(sender, password, test_date)

    return {"message": result}

# ===============================
# 📊 PROGRESS PAGE DATA
# ===============================
@app.get("/progress-data")
def progress_data():

    data = {
        "aptitude": [],
        "technical": [],
        "coding": [],
        "hr": []
    }

    cursor.execute("SELECT * FROM candidates")
    rows = cursor.fetchall()

    for r in rows:

        stage = r[8]  # ✅ correct index for stage

        candidate = {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "domain": r[4],
            "status": r[6],
            "score": r[7],
            "aptitude_date": r[11],   # ✅ correct column
            "technical_date": r[14],
            "coding_date": r[17]
        }

        if stage == "Aptitude":
            data["aptitude"].append(candidate)

        elif stage == "Technical":
            data["technical"].append(candidate)

        elif stage == "Coding":
            data["coding"].append(candidate)

        elif stage == "HR":
            data["hr"].append(candidate)

    return data

@app.get("/aptitude-candidates")
def get_aptitude_candidates():

    cursor.execute("""
    SELECT id, name, email, domain, aptitude_score, aptitude_status
    FROM candidates
    WHERE stage='Aptitude'
    """)

    rows = cursor.fetchall()

    data = []
    for r in rows:
        data.append({
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "domain": r[3],
            "score": r[4],
            "status": r[5]
        })

    return {"data": data}

@app.put("/update-aptitude/{id}")
def update_aptitude(
    id: str,
    score: int = Form(...),
    status: str = Form(...)
):
    cursor.execute("""
    UPDATE candidates
    SET aptitude_score=?, aptitude_status=?
    WHERE id=?
    """, (score, status, id))

    conn.commit()

    return {"message": "Updated"}

@app.put("/move-to-technical")
def move_to_technical():

    cursor.execute("""
    UPDATE candidates
    SET stage='Technical'
    WHERE aptitude_status='Pass'
    """)

    conn.commit()

    return {"message": "Moved to Technical"}