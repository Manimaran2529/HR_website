from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

import shutil
import os
import uuid
import sqlite3
from PyPDF2 import PdfReader

from mail import send_email, selected_template, rejected_template

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
    reason TEXT,
    created_at TEXT
)
""")
conn.commit()

# ===============================
# ✅ UPLOAD
# ===============================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# ===============================
# 🚀 UPLOAD RESUME
# ===============================
from datetime import datetime

@app.post("/upload")
async def upload_resume(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    domain: str = Form(...),
    resume: UploadFile = File(...)
):

    print(name, email, phone, domain, resume.filename)  # DEBUG

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

    # 🔥 IMPORTANT FIX
    created_at = datetime.now().strftime("%Y-%m")

    cursor.execute("""
    INSERT INTO candidates 
    (id, name, email, phone, domain, resume_url, status, score, reason, round, batch, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        file_id,
        name,
        email,
        phone,
        domain,
        f"http://127.0.0.1:8000/uploads/{file_name}",
        "Pending",
        0,
        "",
        "Resume",
        "",
        created_at
    ))

    conn.commit()

    return {"message": "✅ Resume uploaded successfully"}

# ===============================
# 📋 GET CURRENT MONTH ONLY
# ===============================
@app.get("/candidates")
def get_candidates():

    current_month = datetime.now().strftime("%Y-%m")

    cursor.execute("""
    SELECT * FROM candidates WHERE created_at=?
    """, (current_month,))

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
# 🤖 AI ANALYSIS
# ===============================
def extract_text(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()


def analyze_resume(text):

    score = 50

    if "python" in text:
        score += 10
    if "react" in text:
        score += 10
    if "sql" in text:
        score += 10
    if "internship" in text:
        score += 10

    decision = "Selected" if score >= 70 else "Rejected"

    return score, decision


# ===============================
# 🤖 AI SELECT
# ===============================
@app.post("/ai-select")
def ai_select():

    cursor.execute("SELECT * FROM candidates")
    rows = cursor.fetchall()

    for r in rows:
        id = r[0]
        resume_url = r[5]

        file_name = resume_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        if not os.path.exists(file_path):
            continue

        text = extract_text(file_path)
        score, status = analyze_resume(text)

        cursor.execute("""
        UPDATE candidates SET status=?, score=? WHERE id=?
        """, (status, score, id))

    conn.commit()

    return {"message": "AI Done"}

# ===============================
# ✏️ MANUAL UPDATE
# ===============================
@app.put("/candidate/{id}")
def update_status(id: str, status: str = Form(...)):

    cursor.execute("UPDATE candidates SET status=? WHERE id=?", (status, id))
    conn.commit()

    return {"message": "Updated"}

# ===============================
# 📧 MONTH END AUTO MAIL
# ===============================
def month_end_auto_mail():

    today = datetime.now()

    # check last day
    tomorrow = today + timedelta(days=1)

    if tomorrow.day == 1:
        print("🚀 Month End - Sending Mails")

        cursor.execute("SELECT * FROM candidates")
        rows = cursor.fetchall()

        for r in rows:
            id, name, email, phone, domain, resume_url, status, score, reason, created_at = r

            if status == "Selected":
                subject = "🎉 Selected - Nikitha Build Tech"
                body = selected_template(name, domain)

            elif status == "Rejected":
                subject = "Application Update"
                body = rejected_template(name, domain)

            else:
                continue

            try:
                send_email("yourgmail@gmail.com", "your_app_password", email, subject, body)
            except Exception as e:
                print(e)

        # delete rejected
        cursor.execute("DELETE FROM candidates WHERE status='Rejected'")
        conn.commit()

        print("✅ Month End Completed")


# ===============================
# ⏰ SCHEDULER
# ===============================
scheduler = BackgroundScheduler()
scheduler.add_job(month_end_auto_mail, "cron", hour=23, minute=59)
scheduler.start()