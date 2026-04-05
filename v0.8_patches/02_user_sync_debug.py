# =============================================================================
# PATCH 02: User-Sync Debug & Fix
# Ziel-Datei: /opt/mopilot/ideen/backend/app/user_sync.py
#
# Problem: Login auf zeo-kunden.mopilot.website funktioniert nicht mehr.
# Der User-Sync von ideen.mopilot.website → mopilot-DB scheint unterbrochen.
#
# Mögliche Ursachen:
# 1. PostgreSQL-Container-Name geändert (nach Coolify-Update oder Neustart)
# 2. Netzwerk-Konnektivität zwischen ideen-backend und postgres-Container
# 3. Passwort/Credentials der mopilot-DB geändert
# 4. ENUM-Mismatch nach DB-Migration
#
# Dieser Patch fügt verbessertes Logging und Error-Handling hinzu.
# =============================================================================

import psycopg2
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Connection string to mopilot database
# WICHTIG: Container-Name muss mit dem tatsächlich laufenden PostgreSQL-Container übereinstimmen
MOPILOT_DB_URL = "postgresql://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot"

# Role mapping: ideen slug → mopilot ENUM (UPPERCASE!)
ROLE_MAPPING = {
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
        logger.info(f"[USER-SYNC] DB connection OK. {count} users in mopilot DB.")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"[USER-SYNC] DB connection FAILED: {e}")
        return False


def sync_user_to_mopilot(
    email: str,
    name: str,
    password_hash: str,
    role_slug: Optional[str] = None,
    operator: str = "zeo"
) -> bool:
    """
    Sync a user from the Ideenplattform to the mopilot database.
    Uses UPSERT (INSERT ... ON CONFLICT DO UPDATE) to handle both new and existing users.

    Returns True on success, False on failure (non-blocking).
    """
    # Special handling for admin
    if email == "admin@mopilot.website":
        mopilot_role = "MOPILOT_TEAM"
        logger.info(f"[USER-SYNC] Admin user detected, using role MOPILOT_TEAM")
    elif role_slug:
        mopilot_role = ROLE_MAPPING.get(role_slug)
        if not mopilot_role:
            logger.warning(f"[USER-SYNC] Unknown role slug '{role_slug}' for {email}. Skipping sync.")
            return False
    else:
        logger.warning(f"[USER-SYNC] No role for {email}. Skipping sync.")
        return False

    try:
        logger.info(f"[USER-SYNC] Syncing user {email} with role {mopilot_role} (operator={operator})")

        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=10)
        cur = conn.cursor()

        # UPSERT: Insert or update on conflict
        cur.execute("""
            INSERT INTO users (email, name, hashed_password, role, operator, is_active)
            VALUES (%s, %s, %s, %s, %s, true)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                hashed_password = EXCLUDED.hashed_password,
                role = EXCLUDED.role,
                operator = EXCLUDED.operator,
                is_active = true
        """, (email, name, password_hash, mopilot_role, operator))

        conn.commit()
        rows = cur.rowcount
        logger.info(f"[USER-SYNC] Successfully synced {email} to mopilot DB ({rows} row(s) affected)")

        cur.close()
        conn.close()
        return True

    except psycopg2.errors.InvalidTextRepresentation as e:
        logger.error(f"[USER-SYNC] ENUM ERROR for {email}: {e}")
        logger.error(f"[USER-SYNC] Check that role '{mopilot_role}' exists in the PostgreSQL ENUM type.")
        logger.error(f"[USER-SYNC] Fix: ALTER TYPE userrole ADD VALUE '{mopilot_role}';")
        return False
    except psycopg2.OperationalError as e:
        logger.error(f"[USER-SYNC] CONNECTION ERROR: {e}")
        logger.error(f"[USER-SYNC] Check: 1) PostgreSQL container running? 2) Container name correct? 3) Network connected?")
        logger.error(f"[USER-SYNC] Verify with: docker exec ideen-backend python -c \"import psycopg2; psycopg2.connect('${MOPILOT_DB_URL}')\"")
        return False
    except Exception as e:
        logger.error(f"[USER-SYNC] UNEXPECTED ERROR syncing {email}: {e}")
        return False
