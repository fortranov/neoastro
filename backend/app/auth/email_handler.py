import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from ..config import settings

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, token: str, frontend_url: str = None) -> bool:
    """Send email verification link."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not configured, skipping email send")
        return False

    base_url = frontend_url or settings.FRONTEND_URL
    verification_url = f"{base_url}/auth/verify-email?token={token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "NeoAstro - Подтверждение email"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    text_body = f"""
Добро пожаловать в NeoAstro!

Для подтверждения вашего email перейдите по ссылке:
{verification_url}

Ссылка действительна 24 часа.
    """

    html_body = f"""
    <html>
    <body style="background:#0f0a1e;color:#fff;font-family:sans-serif;padding:40px;">
        <h1 style="color:#d4af37;">NeoAstro</h1>
        <p>Добро пожаловать!</p>
        <p>Для подтверждения вашего email нажмите на кнопку:</p>
        <a href="{verification_url}"
           style="background:#7c3aed;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;margin:16px 0;">
            Подтвердить email
        </a>
        <p style="color:#aaa;font-size:12px;">Ссылка действительна 24 часа.</p>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
        logger.info(f"Verification email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
