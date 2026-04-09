"""Synchronize Ideen users to the mopilot main database."""

import logging

import psycopg2
import psycopg2.errors

logger = logging.getLogger(__name__)

MOPILOT_DB_URL = (
    "postgresql://mopilot:mopilot_secret_2026"
    "@mopilot-postgres:5432/mopilot"
)

ADMIN_EMAIL = "admin@mopilot.website"

ROLE_SLUG_TO_ENUM = {
    "endkunde": "ENDKUNDE",
    "stationspate": "STATIONSPATE",
    "hotline": "HOTLINE",
    "betreiber": "BETREIBER",
    "flottenmanagement": "FLOTTENMANAGEMENT",
    "fahrzeugbetreuer": "FAHRZEUGBETREUER",
    "plattform-support": "PLATTFORM_SUPPORT",
    "projekttraeger": "PROJEKTTRAEGER",
    "fahrzeugsteller": "FAHRZEUGSTELLER",
    "validierungsstelle": "VALIDIERUNGSSTELLE",
    "mopilot-team": "MOPILOT_TEAM",
}


def test_mopilot_db_connection() -> bool:
    """Test connectivity to the mopilot database. Call this for debugging."""
    try:
        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=5)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        count = cur.fetchone()[0]
        logger.info("[USER-SYNC] DB connection OK. %d users in mopilot DB.", count)
        print(f"[USER-SYNC] DB connection OK. {count} users in mopilot DB.")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        logger.error("[USER-SYNC] DB connection FAILED: %s", e)
        print(f"[USER-SYNC] DB connection FAILED: {e}")
        return False


def sync_user_to_mopilot(
    email: str,
    name: str,
    password_hash: str,
    role_slug: str | None = None,
    operator: str = "zeo",
) -> bool:
    """Upsert a user in the mopilot main database. Reuses bcrypt hash directly.

    Returns True on success, False on failure (non-blocking).
    """
    if not role_slug:
        if email == ADMIN_EMAIL:
            role_slug = "mopilot-team"
        else:
            logger.warning("[USER-SYNC] No role for %s. Skipping sync.", email)
            return False

    role_enum = ROLE_SLUG_TO_ENUM.get(role_slug)
    if not role_enum:
        logger.warning("[USER-SYNC] Unknown role slug '%s' for %s. Skipping sync.", role_slug, email)
        return False

    try:
        logger.info("[USER-SYNC] Syncing user %s with role %s (operator=%s)", email, role_enum, operator)

        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=10)
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, name, hashed_password, role, operator, is_active)
                    VALUES (%s, %s, %s, %s, %s, true)
                    ON CONFLICT (email) DO UPDATE SET
                        name = EXCLUDED.name,
                        hashed_password = EXCLUDED.hashed_password,
                        role = EXCLUDED.role
                    """,
                    (email, name, password_hash, role_enum, operator),
                )
            conn.commit()
            logger.info("[USER-SYNC] Successfully synced %s to mopilot DB (role=%s)", email, role_enum)
            return True
        finally:
            conn.close()

    except psycopg2.errors.InvalidTextRepresentation as e:
        logger.error("[USER-SYNC] ENUM ERROR for %s: %s", email, e)
        logger.error("[USER-SYNC] Check that role '%s' exists in the PostgreSQL ENUM type.", role_enum)
        return False
    except psycopg2.OperationalError as e:
        logger.error("[USER-SYNC] CONNECTION ERROR for %s: %s", email, e)
        logger.error("[USER-SYNC] Check: 1) PostgreSQL container running? 2) Container name correct? 3) Network connected?")
        return False
    except Exception:
        logger.exception("[USER-SYNC] UNEXPECTED ERROR syncing %s to mopilot DB", email)
        return False


def update_password_in_mopilot(email: str, password_hash: str) -> None:
    """Update a user's password hash in the mopilot main database."""
    try:
        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=10)
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE users SET hashed_password = %s WHERE email = %s",
                    (password_hash, email),
                )
            conn.commit()
            logger.info("[USER-SYNC] Updated password for %s in mopilot DB", email)
        finally:
            conn.close()
    except Exception:
        logger.exception("[USER-SYNC] Failed to update password for %s in mopilot DB", email)


def delete_user_from_mopilot(email: str) -> bool:
    """Delete a user from the mopilot main database. Returns True on success."""
    try:
        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=10)
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users WHERE email = %s", (email,))
                deleted = cur.rowcount
            conn.commit()
            if deleted:
                logger.info("[USER-SYNC] Deleted %s from mopilot DB", email)
            return deleted > 0
        finally:
            conn.close()
    except Exception:
        logger.exception("[USER-SYNC] Failed to delete %s from mopilot DB", email)
        return False
