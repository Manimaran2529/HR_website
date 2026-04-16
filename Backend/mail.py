import smtplib
from email.mime.text import MIMEText
import sqlite3

# ===============================
# ✅ DATABASE
# ===============================
conn = sqlite3.connect("candidates.db", check_same_thread=False)
cursor = conn.cursor()


# ===============================
# ✅ EMAIL SENDER
# ===============================
def send_email(sender, password, receiver, subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = receiver

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)

        server.sendmail(sender, receiver, msg.as_string())
        server.quit()

        return True

    except Exception as e:
        print("❌ Mail failed:", e)
        return False


# ===============================
# 🎯 ROLE MAPPING
# ===============================
def get_role(domain):
    mapping = {
        "ML": "Machine Learning Engineer",
        "Web": "Full Stack Developer",
        "Data Science": "Data Analyst"
    }
    return mapping.get(domain, "Software Engineer")


# ===============================
# ✅ SELECTED MAIL
# ===============================
def selected_template(name, domain):
    role = get_role(domain)

    return f"""
Dear {name},

Congratulations! 🎉

You have been shortlisted for the {role} position.

Our team will contact you with the next round details soon.

Best regards,  
HR Team  
Nikitha Build Tech
"""


# ===============================
# ❌ REJECTED MAIL
# ===============================
def rejected_template(name, domain):
    role = get_role(domain)

    return f"""
Dear {name},

Thank you for applying for the {role} position.

After careful review, we regret to inform you that we will not proceed further with your application.

We wish you success in your future career.

Best regards,  
HR Team  
Nikitha Build Tech
"""


# ===============================
# 📘 APTITUDE SCHEDULE MAIL
# ===============================
def aptitude_schedule_template(name, domain, test_date):
    role = get_role(domain)

    return f"""
Dear {name},

Congratulations! 🎉

You are selected for the Aptitude Round for the {role} role.

📅 Test Date: {test_date}

🔗 Test link will be shared 1 hour before the exam.

Please be ready and ensure:
- Stable internet
- No tab switching
- Camera ON

All the best! 🚀

HR Team  
Nikitha Build Tech
"""


# ===============================
# 🔗 APTITUDE TEST LINK MAIL
# ===============================
def aptitude_link_template(name):
    return f"""
Hi {name},

Your Aptitude Test is starting now.

🔗 Start Test:
http://localhost:5173/test/aptitude

⚠️ Rules:
- Do not switch tabs
- Camera must be ON
- Any cheating → disqualification

Best of luck 🚀

HR Team
"""


# ===============================
# 🚀 SEND ALL (RESUME RESULT MAIL)
# ===============================
def send_all_mails(sender, password):

    cursor.execute("SELECT id, name, email, status, domain FROM candidates")
    rows = cursor.fetchall()

    sent_count = 0

    for id, name, email, status, domain in rows:

        if status == "Selected":
            subject = "🎉 Congratulations! You are Selected"
            body = selected_template(name, domain)

        elif status == "Rejected":
            subject = "Application Update"
            body = rejected_template(name, domain)

        else:
            continue

        success = send_email(sender, password, email, subject, body)

        if success:
            sent_count += 1

    # 🔥 Remove rejected after mail
    cursor.execute("DELETE FROM candidates WHERE status='Rejected'")
    conn.commit()

    return f"✅ {sent_count} mails sent successfully"


# ===============================
# 🚀 SEND APTITUDE MAIL
# ===============================
def send_aptitude_mails(sender, password, test_date):

    cursor.execute("""
    SELECT name, email, domain 
    FROM candidates 
    WHERE stage='Aptitude'
    """)

    rows = cursor.fetchall()

    sent = 0

    for name, email, domain in rows:

        subject = "🧠 Aptitude Test Scheduled"
        body = aptitude_schedule_template(name, domain, test_date)

        if send_email(sender, password, email, subject, body):
            sent += 1

    return f"✅ {sent} aptitude mails sent"


# ===============================
# 🚀 AUTO SEND TEST LINK
# ===============================
def send_aptitude_links():

    from datetime import datetime

    now = datetime.now()

    cursor.execute("""
    SELECT name, email, aptitude_date 
    FROM candidates 
    WHERE stage='Aptitude'
    """)

    rows = cursor.fetchall()

    for name, email, test_date in rows:

        if not test_date:
            continue

        try:
            test_time = datetime.strptime(test_date, "%Y-%m-%d %H:%M")

            # 1 hour before trigger
            diff = (test_time - now).total_seconds()

            if 0 <= diff <= 60:

                subject = "🧠 Aptitude Test Link"
                body = aptitude_link_template(name)

                send_email("yourgmail@gmail.com", "app_password", email, subject, body)

        except Exception as e:
            print("Link mail error:", e)