import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def generate_otp_code():
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp_code, student_name="Student", purpose="Login"):
    """
    Sends a 6-digit OTP email using Gmail SMTP settings.
    Supports both Registration and Login OTP verification flows.
    """
    smtp_server = current_app.config.get('SMTP_SERVER')
    smtp_port = current_app.config.get('SMTP_PORT')
    smtp_email = current_app.config.get('SMTP_EMAIL')
    smtp_password = current_app.config.get('SMTP_PASSWORD')
    require_realtime = current_app.config.get('REQUIRE_REALTIME_OTP', False)

    action_text = "confirm your registration" if purpose.lower() == "register" else "complete your login"
    subject_text = f"{otp_code} is your Smart Job Portal {purpose.capitalize()} Code"

    if not (smtp_email and smtp_password):
        print(f"\n==========================================")
        print(f"[OTP REALTIME LOG] {purpose.capitalize()} OTP for {to_email}: {otp_code}")
        print(f"==========================================\n")
        if require_realtime:
            return False, "SMTP server credentials not configured in .env"
        return True, f"OTP generated for {purpose.lower()} (logged to server console in dev mode)"

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject_text
        msg['From'] = f"Smart Job Portal <{smtp_email}>"
        msg['To'] = to_email

        html_body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800;">Smart Job Portal</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Student Part-Time Job Portal</p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 16px; color: #1e293b;">Hello <strong>{student_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Use the following 6-digit verification code to <strong>{action_text}</strong>. This code will expire in <strong>5 minutes</strong>.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px 28px; border-radius: 10px; border: 1px dashed #bfdbfe; display: inline-block;">
                    {otp_code}
                </span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                If you did not request this code, please ignore this email.
            </p>
        </div>
        """

        text_body = f"Hello {student_name},\nYour OTP to {action_text} is: {otp_code}\nValid for 5 minutes."

        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())
        server.quit()

        return True, f"OTP sent successfully to {to_email}"
    except Exception as e:
        print(f"[SMTP Error] Failed to send email to {to_email}: {str(e)}")
        if require_realtime:
            return False, f"Failed to send email via SMTP: {str(e)}"
        return True, f"OTP generated (SMTP fallback log active: {str(e)})"


def send_status_update_email(to_email, student_name, job_title, company_name, status):
    """
    Sends an automated email notification when a student's application status is updated (Accepted / Rejected).
    """
    smtp_server = current_app.config.get('SMTP_SERVER')
    smtp_port = current_app.config.get('SMTP_PORT')
    smtp_email = current_app.config.get('SMTP_EMAIL')
    smtp_password = current_app.config.get('SMTP_PASSWORD')

    if not (smtp_email and smtp_password):
        print(f"[STATUS EMAIL LOG] Status for {to_email} updated to {status} for job '{job_title}'")
        return True, "Logged status update locally"

    status_color = "#166534" if status == "Accepted" else "#991b1b"
    status_bg = "#dcfce7" if status == "Accepted" else "#fee2e2"
    subject_text = f"Application Update: {job_title} at {company_name} - {status}"

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject_text
        msg['From'] = f"Smart Job Portal <{smtp_email}>"
        msg['To'] = to_email

        html_body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800;">Smart Job Portal</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Application Status Notification</p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 16px; color: #1e293b;">Dear <strong>{student_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Your part-time job application for <strong>{job_title}</strong> at <strong>{company_name}</strong> has been updated.
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 18px; font-weight: 800; color: {status_color}; background-color: {status_bg}; padding: 10px 24px; border-radius: 8px; display: inline-block;">
                    Status: {status}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center;">
                Log into your Smart Job Portal student dashboard to view full details.
            </p>
        </div>
        """

        msg.attach(MIMEText(html_body, 'html'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())
        server.quit()

        return True, "Email notification sent"
    except Exception as e:
        print(f"[Status Email Error] {str(e)}")
        return False, str(e)
