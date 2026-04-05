"""Email notification utilities."""

import logging
import os
import re
import smtplib
import uuid
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, formatdate, make_msgid

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@mopilot.website")
BASE_URL = os.getenv("BASE_URL", "https://ideen.mopilot.website")

SENDER_NAME = "MoPilot Ideenplattform"
REPLY_TO = "admin@mopilot.website"


def is_email_configured() -> bool:
    """Check if SMTP settings are configured."""
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)


def _html_to_plaintext(html: str) -> str:
    """Convert HTML to a readable plaintext version for multipart emails."""
    text = html
    # Convert links: <a href="URL">TEXT</a> → TEXT (URL)
    text = re.sub(
        r'<a\s[^>]*href="([^"]*)"[^>]*>(.*?)</a>',
        r"\2 ( \1 )",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    # Convert <br> and closing block tags to newlines
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</(?:p|div|h[1-6]|li|tr|blockquote)>", "\n", text, flags=re.IGNORECASE)
    # Convert <blockquote> content to "> " prefixed lines
    def _blockquote(m: re.Match) -> str:
        inner = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        return "\n".join(f"> {line}" for line in inner.splitlines()) + "\n"

    text = re.sub(
        r"<blockquote[^>]*>(.*?)</blockquote>",
        _blockquote,
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    # Strip remaining HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode common HTML entities
    text = text.replace("&bdquo;", "\u201e").replace("&ldquo;", "\u201c")
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&nbsp;", " ")
    # Collapse whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email with proper headers for deliverability. Returns True on success."""
    if not is_email_configured():
        logger.debug("SMTP not configured, skipping email to %s", to)
        return False

    try:
        msg = MIMEMultipart("alternative")

        # --- Required headers ---
        msg["Subject"] = subject
        msg["From"] = formataddr((SENDER_NAME, SMTP_FROM))
        msg["To"] = to
        msg["Reply-To"] = formataddr((SENDER_NAME, REPLY_TO))
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="mopilot.website")

        # --- Spam-filter friendly headers ---
        msg["X-Mailer"] = "MoPilot Ideenplattform"
        msg["Precedence"] = "bulk"
        msg["Auto-Submitted"] = "auto-generated"
        msg["MIME-Version"] = "1.0"

        # --- Plaintext part first (fallback), then HTML ---
        plaintext = _html_to_plaintext(html_body)
        msg.attach(MIMEText(plaintext, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.ehlo("mopilot.website")
            server.starttls()
            server.ehlo("mopilot.website")
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to], msg.as_string())

        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, str(e))
        return False


def notify_new_comment(
    author_email: str,
    author_name: str,
    idea_title: str,
    idea_id: int,
    commenter_name: str,
    comment_text: str,
) -> None:
    """Notify idea author about a new comment."""
    subject = f"Neuer Kommentar zu Ihrer Idee: {idea_title}"
    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D6A4F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">MoPilot Ideenplattform</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hallo {author_name},</p>
            <p><strong>{commenter_name}</strong> hat einen neuen Kommentar zu Ihrer Idee
               &bdquo;{idea_title}&ldquo; hinterlassen:</p>
            <blockquote style="border-left: 3px solid #2D6A4F; padding-left: 12px; color: #555; margin: 16px 0;">
                {comment_text}
            </blockquote>
            <p>
                <a href="{BASE_URL}/idee/{idea_id}"
                   style="display: inline-block; background: #2D6A4F; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                    Idee ansehen
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">
                Diese Nachricht wurde automatisch von der MoPilot Ideenplattform versendet.
            </p>
        </div>
    </div>
    """
    send_email(author_email, subject, html)


def send_verification_email(to: str, name: str, token: str) -> bool:
    """Send email verification link to newly registered user."""
    subject = "E-Mail-Adresse bestätigen – MoPilot Ideenplattform"
    verify_url = f"{BASE_URL}/verify?token={token}"
    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D6A4F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">MoPilot Ideenplattform</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hallo {name},</p>
            <p>vielen Dank für Ihre Registrierung! Bitte bestätigen Sie Ihre E-Mail-Adresse,
               indem Sie auf den folgenden Button klicken:</p>
            <p style="text-align: center; margin: 24px 0;">
                <a href="{verify_url}"
                   style="display: inline-block; background: #2D6A4F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    E-Mail bestätigen
                </a>
            </p>
            <p style="color: #666; font-size: 14px;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
                <a href="{verify_url}" style="color: #2D6A4F; word-break: break-all;">{verify_url}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">
                Dieser Link ist 24 Stunden gültig. Falls Sie sich nicht registriert haben,
                können Sie diese E-Mail ignorieren.
            </p>
        </div>
    </div>
    """
    return send_email(to, subject, html)


def send_password_reset_email(to: str, name: str, token: str) -> bool:
    """Send password reset link."""
    subject = "Passwort zurücksetzen – MoPilot Ideenplattform"
    reset_url = f"{BASE_URL}/passwort-zuruecksetzen?token={token}"
    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D6A4F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">MoPilot Ideenplattform</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hallo {name},</p>
            <p>Sie haben angefordert, Ihr Passwort zurückzusetzen.
               Klicken Sie auf den folgenden Button, um ein neues Passwort zu vergeben:</p>
            <p style="text-align: center; margin: 24px 0;">
                <a href="{reset_url}"
                   style="display: inline-block; background: #2D6A4F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Passwort zurücksetzen
                </a>
            </p>
            <p style="color: #666; font-size: 14px;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
                <a href="{reset_url}" style="color: #2D6A4F; word-break: break-all;">{reset_url}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">
                Dieser Link ist 1 Stunde gültig. Falls Sie kein neues Passwort angefordert haben,
                können Sie diese E-Mail ignorieren.
            </p>
        </div>
    </div>
    """
    return send_email(to, subject, html)
