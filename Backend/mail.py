import smtplib
from email.mime.text import MIMEText
import sqlite3

# DB
conn = sqlite3.connect("candidates.db", check_same_thread=False)
cursor = conn.cursor()


# ===============================
# ✅ SEND MAIL FUNCTION
# ===============================
def send_email(sender, password, receiver, subject, body):

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender, password)

    server.sendmail(sender, receiver, msg.as_string())
    server.quit()


# ===============================
# ✅ SEND SELECTED MAILS
# ===============================
def send_selected(sender, password):

    cursor.execute("SELECT name, email FROM candidates WHERE status='Selected'")
    rows = cursor.fetchall()

    for name, email in rows:

        subject = "Congratulations! You are Selected 🎉"
        body = f"""
Dear {name},

We are happy to inform you that you have been selected.

We will contact you soon with further details.

Best Regards,
HR Team
"""

        send_email(sender, password, email, subject, body)

    return "Selected mails sent"


# ===============================
# ❌ SEND REJECTED MAILS + DELETE
# ===============================
def send_rejected(sender, password):

    cursor.execute("SELECT name, email FROM candidates WHERE status='Rejected'")
    rows = cursor.fetchall()

    for name, email in rows:

        subject = "Application Update"
        body = f"""
Dear {name},

Thank you for applying.

Unfortunately, you are not selected.

We wish you all the best.

Best Regards,
HR Team
"""

        send_email(sender, password, email, subject, body)

    # 🔥 DELETE AFTER MAIL
    cursor.execute("DELETE FROM candidates WHERE status='Rejected'")
    conn.commit()

    return "Rejected mails sent & removed"

def selected_template(name):
    return f"""
Dear {name},

Congratulations! You are selected 🎉

Best Regards,
HR Team
"""

def rejected_template(name):
    return f"""
Dear {name},

Thank you for applying.

Unfortunately, you are not selected.

Best Regards,
HR Team
"""