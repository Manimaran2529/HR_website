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
# ✅ MAIL TEMPLATES
# ===============================
# ===============================
# 🎯 AUTO ROLE MAPPING
# ===============================
def get_role(domain):
    mapping = {
        "ML": "Machine Learning Engineer",
        "Web": "Full Stack Developer",
        "Data Science": "Data Analyst"
    }
    return mapping.get(domain, "Software Engineer")


# ===============================
# ✅ SELECTED MAIL TEMPLATE
# ===============================
def selected_template(name, domain):
    role = get_role(domain)
    company = "Nikitha Build Tech"

    return f"""
Dear {name},

Thank you for your interest in the {role} position at {company}.

We are pleased to inform you that your profile has been shortlisted, and you have been selected to move forward to the next stage of our recruitment process.

Our team will share further details regarding the next round, including the schedule and instructions, shortly.

We appreciate your effort and look forward to continuing the process with you.

Best regards,  
HR Team  
{company}
"""


# ===============================
# ❌ REJECTED MAIL TEMPLATE
# ===============================
def rejected_template(name, domain):
    role = get_role(domain)
    company = "Nikitha Build Tech"

    return f"""
Dear {name},

Thank you for your interest in the {role} position at {company}.

We appreciate the time and effort you invested in your application. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.

We encourage you to apply again in the future for roles that match your skills and experience.

We wish you all the best in your career.

Best regards,  
HR Team  
{company}
"""

# ===============================
# 🚀 SEND ALL MAILS (MAIN FUNCTION)
# ===============================
def send_all_mails(sender, password):

    cursor.execute("SELECT id, name, email, status FROM candidates")
    rows = cursor.fetchall()

    sent_count = 0

    for id, name, email, status in rows:

        if status == "Selected":
            subject = "🎉 Congratulations! You are Selected"
            body = selected_template(name)

        elif status == "Rejected":
            subject = "Application Update"
            body = rejected_template(name)

        else:
            continue  # skip pending

        success = send_email(sender, password, email, subject, body)

        if success:
            sent_count += 1

    # 🔥 DELETE REJECTED AFTER MAIL
    cursor.execute("DELETE FROM candidates WHERE status='Rejected'")
    conn.commit()

    return f"✅ {sent_count} mails sent successfully"