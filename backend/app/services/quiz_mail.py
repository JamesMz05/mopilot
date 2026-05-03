"""Quiz completion email notification service."""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, formatdate, make_msgid

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@mopilot.website")


def is_smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)


def send_quiz_completion_email(
    to: str,
    session_id: str,
    started_at: str,
    completed_at: str,
    duration_seconds: int,
    score: int,
    total: int,
    device_class: str,
    referrer: str,
    voucher_code: str,
) -> bool:
    """Send quiz completion notification with anonymous metrics."""
    if not is_smtp_configured():
        logger.warning("SMTP not configured, skipping quiz notification")
        return False

    subject = f"Quiz erfolgreich abgeschlossen — Mobilitäts-Check ({score}/{total})"

    html = f"""
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">MoPilot · CC-Quiz</h2>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Automatische Benachrichtigung</p>
        </div>
        <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">Ein Besucher hat den Mobilitäts-Check erfolgreich abgeschlossen.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666; width: 40%;">Session-ID</td>
                    <td style="padding: 10px 8px; font-family: monospace; font-size: 12px;">{session_id}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666;">Start</td>
                    <td style="padding: 10px 8px;">{started_at}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666;">Ende</td>
                    <td style="padding: 10px 8px;">{completed_at}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666;">Dauer</td>
                    <td style="padding: 10px 8px;">{duration_seconds} Sekunden</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666;">Score</td>
                    <td style="padding: 10px 8px; font-weight: 600;">{score} / {total}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 8px; color: #666;">Gerät</td>
                    <td style="padding: 10px 8px;">{device_class or 'unbekannt'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 8px; color: #666;">Referrer</td>
                    <td style="padding: 10px 8px;">{referrer or 'direkt'}</td>
                </tr>
            </table>

            <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #854d0e;">
                Diese Person hat den Gutscheincode <strong>{voucher_code}</strong> erhalten.
                Eine Registrierung ist möglich, aber nicht garantiert.
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px; margin-bottom: 0;">
                Automatisch versendet von MoPilot · Keine personenbezogenen Daten enthalten.
            </p>
        </div>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr(("MoPilot Quiz", SMTP_FROM))
        msg["To"] = to
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="mopilot.website")
        msg["X-Mailer"] = "MoPilot Quiz Notification"
        msg["Auto-Submitted"] = "auto-generated"

        # Plaintext fallback
        plaintext = (
            f"Quiz abgeschlossen — Mobilitäts-Check ({score}/{total})\n\n"
            f"Session: {session_id}\n"
            f"Start: {started_at}\n"
            f"Ende: {completed_at}\n"
            f"Dauer: {duration_seconds}s\n"
            f"Score: {score}/{total}\n"
            f"Gerät: {device_class or 'unbekannt'}\n"
            f"Referrer: {referrer or 'direkt'}\n\n"
            f"Gutscheincode {voucher_code} wurde ausgegeben.\n"
        )
        msg.attach(MIMEText(plaintext, "plain", "utf-8"))
        msg.attach(MIMEText(html, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.ehlo("mopilot.website")
            server.starttls()
            server.ehlo("mopilot.website")
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to], msg.as_string())

        logger.info("Quiz notification sent to %s (session %s)", to, session_id)
        return True
    except Exception as e:
        logger.error("Failed to send quiz notification: %s", str(e))
        return False
