from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

import shutil, os, uuid, sqlite3
from PyPDF2 import PdfReader

from mail import send_email, selected_template, rejected_template

app = FastAPI()

# ===============================
# 🔐 GLOBAL HR EMAIL STORAGE
# ===============================
HR_EMAIL = None
HR_PASSWORD = None

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
    aptitude_score INTEGER DEFAULT 0,
    aptitude_status TEXT DEFAULT 'Pending',
    aptitude_link_sent INTEGER DEFAULT 0
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

    file_id = str(uuid.uuid4())
    file_name = f"{file_id}.pdf"
    path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    cursor.execute("""
    INSERT INTO candidates (
        id, name, email, phone, domain, resume_url,
        status, score, stage, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        file_id, name, email, phone, domain,
        f"http://127.0.0.1:8000/uploads/{file_name}",
        "Pending", 0, "Resume",
        datetime.now().strftime("%Y-%m")
    ))

    conn.commit()
    return {"message": "✅ Uploaded"}

# ===============================
# 📋 GET RESUME
# ===============================
@app.get("/candidates")
def get_candidates():
    cursor.execute("""
    SELECT * FROM candidates 
    WHERE stage='Resume'
    ORDER BY score DESC
    """)
    rows = cursor.fetchall()

    return {
        "data": [
            {
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "phone": r[3],
                "domain": r[4],
                "resume_url": r[5],
                "status": r[6],
                "score": r[7]
            }
            for r in rows
        ]
    }

# ===============================
# 📄 EXTRACT TEXT
# ===============================
def extract_text(path):
    reader = PdfReader(path)
    text = ""
    for p in reader.pages:
        text += p.extract_text() or ""
    return text.lower()

# ===============================
# 🤖 ATS LOGIC
# ===============================
def analyze_resume(text, domain):
    score = 0

    if domain == "ML":
        if "python" in text: score += 20
        if "machine learning" in text: score += 25
        if "tensorflow" in text: score += 20

    elif domain == "Web":
        if "html" in text and "css" in text: score += 15
        if "javascript" in text: score += 20
        if "react" in text: score += 25

    elif domain == "Data Science":
        if "python" in text: score += 15
        if "pandas" in text: score += 20
        if "numpy" in text: score += 20

    if "internship" in text: score += 20
    if "project" in text: score += 15

    score = min(score, 100)

    if score >= 80:
        return score, "Selected"
    elif score >= 60:
        return score, "Review"
    else:
        return score, "Rejected"

# ===============================
# 🤖 AI SELECT
# ===============================
@app.post("/ai-select")
def ai_select():
    cursor.execute("SELECT * FROM candidates WHERE stage='Resume'")
    rows = cursor.fetchall()

    for r in rows:
        file_path = os.path.join(UPLOAD_FOLDER, r[5].split("/")[-1])

        if not os.path.exists(file_path):
            continue

        text = extract_text(file_path)
        score, status = analyze_resume(text, r[4])

        cursor.execute(
            "UPDATE candidates SET score=?, status=? WHERE id=?",
            (score, status, r[0])
        )

    conn.commit()
    return {"message": "🎯 ATS Completed"}

# ===============================
# 📧 SEND MAIL + MOVE
# ===============================
@app.post("/send-mails")
def send_mails(sender: str = Form(...), password: str = Form(...)):

    cursor.execute("SELECT id, name, email, domain, status FROM candidates WHERE stage='Resume'")
    rows = cursor.fetchall()

    for id, name, email, domain, status in rows:

        if status == "Selected":
            send_email(sender, password, email, "Selected", selected_template(name, domain))
            cursor.execute("UPDATE candidates SET stage='Aptitude' WHERE id=?", (id,))

        elif status == "Rejected":
            send_email(sender, password, email, "Rejected", rejected_template(name, domain))
            cursor.execute("DELETE FROM candidates WHERE id=?", (id,))

    conn.commit()
    return {"message": "Emails processed"}

# ===============================
# 📅 SCHEDULE APTITUDE
# ===============================
@app.put("/schedule-aptitude")
def schedule_aptitude(
    test_date: str = Form(...),
    sender: str = Form(...),
    password: str = Form(...)
):
    global HR_EMAIL, HR_PASSWORD
    HR_EMAIL = sender
    HR_PASSWORD = password

    cursor.execute("""
    UPDATE candidates
    SET aptitude_date=?, aptitude_link_sent=0
    WHERE stage='Aptitude'
    """, (test_date,))
    conn.commit()

    cursor.execute("SELECT name, email FROM candidates WHERE stage='Aptitude'")
    candidates = cursor.fetchall()

    for name, email in candidates:

        subject = "📢 Aptitude Test Schedule – Nikitha Build Tech"

        body = f"""
Dear {name},

Greetings from Nikitha Build Tech.

We are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

🧠 APTITUDE TEST DETAILS
----------------------------------------
📅 Date & Time : {test_date}
🌐 Mode        : Online Assessment

🔔 IMPORTANT INSTRUCTIONS
----------------------------------------
• Please join the test 20 minutes before the scheduled time  
• Ensure a stable internet connection  
• Your camera must remain ON throughout the test  
• Do NOT switch tabs or windows during the assessment  
• Any suspicious activity may lead to immediate disqualification  
• Do not use mobile phones or external help  

🔗 The test link will be shared 1 hour before the test

⚠️ NOTE
----------------------------------------
Failure to follow the instructions may result in disqualification.

We wish you all the best for your assessment.

Best regards,  
HR Team  
Nikitha Build Tech
"""

        send_email(sender, password, email, subject, body)

    return {"message": "✅ Scheduled"}

# ===============================
# ⏰ AUTO TEST LINK
# ===============================
def send_test_links():

    if not HR_EMAIL or not HR_PASSWORD:
        return

    now = datetime.now()

    cursor.execute("""
    SELECT id, name, email, aptitude_date, aptitude_link_sent
    FROM candidates WHERE stage='Aptitude'
    """)

    for id, name, email, date, sent in cursor.fetchall():

        if not date or sent == 1:
            continue

        test_time = datetime.fromisoformat(date)

        if now >= test_time - timedelta(hours=1):

            send_email(
                HR_EMAIL,
                HR_PASSWORD,
                email,
                "Aptitude Test Link",
                f"""Dear {name},

Your test is starting soon.

🔗 http://localhost:5173/test/aptitude

Best of luck!

HR Team
"""
            )

            cursor.execute("""
            UPDATE candidates SET aptitude_link_sent=1 WHERE id=?
            """, (id,))

    conn.commit()

# ===============================
# 📊 PROGRESS
# ===============================
@app.get("/aptitude-candidates")
def get_aptitude_candidates():

    cursor.execute("""
    SELECT id, name, email, domain, aptitude_score, aptitude_status
    FROM candidates WHERE stage='Aptitude'
    """)

    rows = cursor.fetchall()

    return {
        "data": [
            {
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "domain": r[3],
                "score": r[4],
                "status": r[5]
            }
            for r in rows
        ]
    }

# ===============================
# 🔥 SCHEDULER
# ===============================
scheduler = BackgroundScheduler()
scheduler.add_job(send_test_links, "interval", minutes=1)
scheduler.start()