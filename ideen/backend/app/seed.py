"""Seed script: Insert the 10 roles into the database."""

import logging

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import Role, RoleCategory, User, UserType

logger = logging.getLogger(__name__)

ROLES = [
    {
        "name": "Endkunde",
        "slug": "endkunde",
        "category": RoleCategory.kundennah,
        "description": "Buchungsprozesse, FAQs, Standortsuche",
        "email_alias": "endkunde@mopilot.website",
        "tagline": "Gestalte die Mobilität in Gemeinschaft.",
    },
    {
        "name": "Stationspate",
        "slug": "stationspate",
        "category": RoleCategory.kundennah,
        "description": "Lokale Standortbetreuung, Zustandsmeldungen",
        "email_alias": "stationspate@mopilot.website",
        "tagline": "Mache jede Station zum Treffpunkt der Zukunft.",
    },
    {
        "name": "Hotline",
        "slug": "hotline",
        "category": RoleCategory.kundennah,
        "description": "Unterstützung via Gesprächsleitfaden",
        "email_alias": "hotline@mopilot.website",
        "tagline": "Deine Idee wird zur Verbesserung für alle.",
    },
    {
        "name": "Betreiber",
        "slug": "betreiber",
        "category": RoleCategory.betrieb,
        "description": "Management-Dashboard, Kennzahlen, Strategie",
        "email_alias": "betreiber@mopilot.website",
        "tagline": "Deine Strategie formt die Mobilität von morgen.",
    },
    {
        "name": "Flottenmanagement",
        "slug": "flottenmanagement",
        "category": RoleCategory.betrieb,
        "description": "Fahrzeugdisposition, Wartung, Zuweisung",
        "email_alias": "flotte@mopilot.website",
        "tagline": "Dein Ideen bringen die Flotte in Bewegung.",
    },
    {
        "name": "Fahrzeugbetreuer",
        "slug": "fahrzeugbetreuer",
        "category": RoleCategory.betrieb,
        "description": "Vor-Ort-Service, Ladezustandsprüfung",
        "email_alias": "fahrzeug@mopilot.website",
        "tagline": "Deine Praxisnähe macht den Unterschied.",
    },
    {
        "name": "Plattform-Support",
        "slug": "plattform-support",
        "category": RoleCategory.betrieb,
        "description": "Technische Systemadministration",
        "email_alias": "support@mopilot.website",
        "tagline": "Deine technischen Ideen zählen.",
    },
    {
        "name": "Projektträger",
        "slug": "projekttraeger",
        "category": RoleCategory.strategie,
        "description": "KPI-Monitoring, Förderungsmanagement",
        "email_alias": "traeger@mopilot.website",
        "tagline": "Von der Kennzahl zur Wirkung.",
    },
    {
        "name": "Fahrzeugsteller",
        "slug": "fahrzeugsteller",
        "category": RoleCategory.strategie,
        "description": "Vertragswesen, Fahrzeugintegration",
        "email_alias": "steller@mopilot.website",
        "tagline": "Vom Vertrag zur Innovationen.",
    },
    {
        "name": "Validierungsstelle",
        "slug": "validierungsstelle",
        "category": RoleCategory.strategie,
        "description": "Dokumenten- und Führerscheinprüfung",
        "email_alias": "validierung@mopilot.website",
        "tagline": "Deine Ideen machen Prüfprozesse schlauer.",
    },
]


def seed_roles(db: Session) -> None:
    """Insert roles if they don't exist yet."""
    existing = db.query(Role).count()
    if existing > 0:
        logger.info("Roles already seeded (%d found), skipping.", existing)
        return

    for role_data in ROLES:
        db.add(Role(**role_data))

    db.commit()
    logger.info("Seeded %d roles.", len(ROLES))


ADMIN_EMAIL = "admin@mopilot.website"
ADMIN_PASSWORD = "admin2026!"


def seed_admin(db: Session) -> None:
    """Create admin user if not exists."""
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        logger.info("Admin user already exists, skipping.")
        return

    admin = User(
        email=ADMIN_EMAIL,
        name="Admin",
        password_hash=hash_password(ADMIN_PASSWORD),
        user_type=UserType.admin,
        role_id=None,
    )
    db.add(admin)
    db.commit()
    logger.info("Seeded admin user: %s", ADMIN_EMAIL)
