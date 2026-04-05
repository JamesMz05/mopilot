"""
Seed-Script für Taglines und Beispiel-Ideen.
Ausführung: python -m app.seed_content
"""

import logging
import sys

from sqlalchemy.orm import Session

from .auth import hash_password
from .database import SessionLocal
from .models import Idea, IdeaStatus, Role, User, UserType

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SYSTEM_USER_EMAIL = "ideengeber@mopilot.website"
SYSTEM_USER_NAME = "MoPilot Ideengeber"
SYSTEM_USER_PASSWORD = "mopilot2026"

TAGLINES = {
    "endkunde": "Gestalte die Mobilität in Gemeinschaft.",
    "stationspate": "Mache jede Station zum Treffpunkt der Zukunft.",
    "hotline": "Deine Idee wird zur Verbesserung für alle.",
    "betreiber": "Deine Strategie formt die Mobilität von morgen.",
    "flottenmanagement": "Dein Ideen bringen die Flotte in Bewegung.",
    "fahrzeugbetreuer": "Deine Praxisnähe macht den Unterschied.",
    "plattform-support": "Deine technischen Ideen zählen.",
    "projekttraeger": "Von der Kennzahl zur Wirkung.",
    "fahrzeugsteller": "Vom Vertrag zur Innovationen.",
    "validierungsstelle": "Deine Ideen machen Prüfprozesse schlauer.",
}

SEED_IDEAS = {
    "endkunde": [
        {
            "title": "\U0001f680 Multimodale Reiseplanung von Tür zu Tür",
            "description": "Eine integrierte Routenplanung, die E-Carsharing nahtlos mit Bus, Bahn und Fahrrad kombiniert. Der Nutzer gibt Start und Ziel ein und erhält einen Gesamtplan inklusive Buchung, Umstiegszeiten und CO\u2082-Bilanz \u2013 alles in einer App. Dafür wäre eine tiefe Integration mit ÖPNV-Schnittstellen und Echtzeitdaten nötig.",
        },
        {
            "title": "\U0001f916 KI-Chat für Buchungsfragen rund um die Uhr",
            "description": "Ein intelligenter Chatbot auf der MoPilot-Website, der häufige Fragen beantwortet: \u201eWo ist die nächste Station?\u201c, \u201eWie storniere ich?\u201c, \u201eWas kostet eine Stunde?\u201c. Der Bot lernt aus echten FAQ-Daten und kann bei komplexen Fällen an die Hotline weiterleiten. Reduziert Wartezeiten und entlastet das Team.",
        },
        {
            "title": "\U0001f916 Smarte Standortvorschläge basierend auf Nutzungsverhalten",
            "description": "Die App analysiert anonymisiert, welche Stationen zu welchen Zeiten stark nachgefragt werden, und schlägt dem Nutzer proaktiv die beste Station und den besten Zeitpunkt vor. \u201eUm 8:15 Uhr ist an Station Marktplatz mit hoher Wahrscheinlichkeit ein Fahrzeug frei.\u201c Basiert auf historischen Buchungsdaten und einfachem ML-Modell.",
        },
    ],
    "stationspate": [
        {
            "title": "\U0001f680 Digitaler Zwilling jeder Station",
            "description": "Ein 3D-Modell jeder Carsharing-Station im Verwaltungsportal, das Echtzeit-Infos zeigt: Belegung, Ladezustand der Fahrzeuge, Zustand der Infrastruktur (Ladesäule, Beschilderung, Sauberkeit). Stationspaten könnten direkt im Modell Mängel markieren. Technisch sehr anspruchsvoll, aber langfristig ein Gamechanger für die Stationsbetreuung.",
        },
        {
            "title": "\U0001f916 KI-gestützte Zustandserkennung per Foto",
            "description": "Der Stationspate fotografiert die Station mit dem Smartphone. Eine Bilderkennung (KI) erkennt automatisch Probleme: verschmutzte Ladesäule, beschädigtes Schild, zugeparkter Stellplatz. Der Befund wird automatisch als Meldung mit Kategorie und Dringlichkeit erstellt. Spart Zeit und standardisiert die Dokumentation.",
        },
        {
            "title": "\U0001f916 Automatische Wochenberichte per KI-Zusammenfassung",
            "description": "Statt manueller Berichte fasst eine KI alle Zustandsmeldungen der Woche zu einem kurzen Report zusammen: Was wurde gemeldet? Was ist offen? Was hat sich verbessert? Der Bericht wird automatisch an den Betreiber geschickt. Basiert auf einfacher Textgenerierung aus strukturierten Meldungsdaten.",
        },
    ],
    "hotline": [
        {
            "title": "\U0001f680 Echtzeit-Stimmungsanalyse während des Gesprächs",
            "description": "Ein KI-System analysiert während des Hotline-Gesprächs die Stimme des Anrufers in Echtzeit und zeigt dem Mitarbeiter an, ob der Kunde frustriert, verwirrt oder zufrieden ist. Bei eskalierender Stimmung erscheinen automatisch De-Eskalations-Tipps. Technisch komplex (Sprach-KI + Echtzeit-Verarbeitung), aber enormes Potenzial für die Gesprächsqualität.",
        },
        {
            "title": "\U0001f916 KI-Gesprächsleitfaden mit dynamischen Vorschlägen",
            "description": "Der bestehende Gesprächsleitfaden wird intelligent: Basierend auf dem Anliegen des Kunden (Buchungsproblem, Fahrzeugdefekt, Storno etc.) schlägt die KI dem Hotline-Mitarbeiter die passenden nächsten Schritte, Textbausteine und Lösungen vor. Lernfähig aus abgeschlossenen Fällen. Gut umsetzbar mit einem RAG-System auf den bestehenden Leitfäden.",
        },
        {
            "title": "\U0001f916 Automatische Gesprächsprotokollierung und Kategorisierung",
            "description": "Nach jedem Hotline-Gespräch erstellt eine KI automatisch ein strukturiertes Protokoll: Anliegen, Lösung, offene Punkte, Kategorie (z.\u202fB. \u201eBuchung\u201c, \u201eTechnik\u201c, \u201eBeschwerde\u201c). Das spart dem Mitarbeiter die manuelle Nachbereitung und liefert wertvolle Daten für die Verbesserung des Services.",
        },
    ],
    "betreiber": [
        {
            "title": "\U0001f680 Prädiktives Nachfragemodell für strategische Standortplanung",
            "description": "Ein KI-Modell, das auf Basis von Bevölkerungsdaten, ÖPNV-Abdeckung, Pendlerströmen und bisherigen Buchungen vorhersagt, wo neue Carsharing-Stationen den größten Effekt hätten. Inklusive Simulation: \u201eWas passiert, wenn wir Station X eröffnen?\u201c Erfordert umfangreiche Datenintegration, wäre aber ein strategischer Meilenstein.",
        },
        {
            "title": "\U0001f916 KI-Dashboard mit automatischen Handlungsempfehlungen",
            "description": "Das Management-Dashboard zeigt nicht nur Kennzahlen, sondern eine KI generiert täglich konkrete Empfehlungen: \u201eAuslastung Station Ost unter 20\u202f% seit 2 Wochen \u2013 Preisanpassung oder Standortverlegung prüfen.\u201c Basiert auf Regelwerk + einfachem ML auf bestehenden KPIs. Sofort umsetzbar.",
        },
        {
            "title": "\U0001f916 Automatisierte Monatsberichte für Fördermittelgeber",
            "description": "Eine KI erstellt monatlich einen formatierten Bericht mit den wichtigsten KPIs, Nutzungstrends und Meilensteinen \u2013 im Format, das Fördermittelgeber erwarten. Der Betreiber prüft und gibt frei, statt stundenlang selbst zu schreiben. Basiert auf Template-Generierung und automatischer Datenaufbereitung.",
        },
    ],
    "flottenmanagement": [
        {
            "title": "\U0001f680 Autonome Fahrzeugumverteilung per Relocation-Algorithmus",
            "description": "Ein Algorithmus erkennt Nachfrage-Ungleichgewichte zwischen Stationen und beauftragt automatisch Fahrzeugumverteilungen \u2013 inklusive optimierter Routenplanung für Relocation-Fahrer. Langfristig sogar mit autonomen Fahrzeugen denkbar. Komplex, aber würde das Grundproblem ungleicher Fahrzeugverteilung im ländlichen Raum adressieren.",
        },
        {
            "title": "\U0001f916 KI-basierte Wartungsvorhersage pro Fahrzeug",
            "description": "Anhand von Kilometern, Ladedaten, Buchungshäufigkeit und Alter des Fahrzeugs prognostiziert eine KI, wann die nächste Wartung fällig wird \u2013 bevor ein Problem auftritt. \u201eFahrzeug E-Golf #7 \u2013 Bremsenwartung empfohlen in ca. 2 Wochen.\u201c Spart ungeplante Ausfälle und verlängert die Fahrzeuglebensdauer.",
        },
        {
            "title": "\U0001f916 Intelligente Ladezeitoptimierung nach Stromtarif",
            "description": "Die Fahrzeuge werden bevorzugt dann geladen, wenn der Strompreis niedrig ist (z.\u202fB. nachts oder bei Solarüberschuss). Eine KI berücksichtigt dabei die Buchungen des nächsten Tages: Welches Fahrzeug braucht wann welchen Ladestand? Einfache Optimierung mit großem Einsparpotenzial.",
        },
    ],
    "fahrzeugbetreuer": [
        {
            "title": "\U0001f680 AR-Brille für geführte Fahrzeuginspektion",
            "description": "Eine Augmented-Reality-Brille führt den Fahrzeugbetreuer Schritt für Schritt durch die Inspektion: Prüfpunkte werden im Sichtfeld eingeblendet, Fotos automatisch aufgenommen, Checkliste per Sprachbefehl abgehakt. Technisch ambitioniert (AR-Hardware + Softwareentwicklung), aber würde die Inspektionsqualität und -geschwindigkeit erheblich steigern.",
        },
        {
            "title": "\U0001f916 KI-Schadenserkennung durch Fahrzeugfotos",
            "description": "Der Betreuer fotografiert das Fahrzeug nach jeder Rückgabe. Eine Bilderkennung vergleicht automatisch mit dem Zustand bei der Ausgabe und markiert neue Schäden: Kratzer, Dellen, Verschmutzungen. Das spart die manuelle Prüfung und dokumentiert den Schadensverlauf lückenlos.",
        },
        {
            "title": "\U0001f916 Intelligente Reinigungs- und Servicetouren-Planung",
            "description": "Eine KI plant die tägliche Tour des Fahrzeugbetreuers optimal: Welche Fahrzeuge brauchen Reinigung? Welche haben niedrigen Ladestand? Wo steht eine Sichtprüfung an? Die Route wird nach Dringlichkeit und Entfernung optimiert. Spart Fahrzeit und stellt sicher, dass kein Fahrzeug vergessen wird.",
        },
    ],
    "plattform-support": [
        {
            "title": "\U0001f680 Selbstheilendes System mit automatischer Fehlerbehebung",
            "description": "Eine KI überwacht alle Systemkomponenten und behebt bekannte Fehler automatisch: Neustart hängender Services, Bereinigung voller Logs, Skalierung bei Lastspitzen. Bei unbekannten Fehlern erstellt sie automatisch ein Diagnose-Ticket mit Log-Analyse. Erfordert tiefe Systemintegration, wäre aber ein Quantensprung für die Betriebssicherheit.",
        },
        {
            "title": "\U0001f916 KI-gestütztes Log-Monitoring mit Anomalieerkennung",
            "description": "Statt manuell Logs zu durchsuchen, erkennt eine KI automatisch ungewöhnliche Muster: plötzlicher Anstieg von 500-Fehlern, ungewöhnliche Login-Versuche, Performance-Einbrüche. Alerts werden mit Kontext geliefert: \u201eWas ist passiert?\u201c, \u201eWelche Nutzer sind betroffen?\u201c, \u201eMögliche Ursache.\u201c Gut umsetzbar mit bestehenden ML-Tools.",
        },
        {
            "title": "\U0001f916 Chatbot für First-Level-IT-Support intern",
            "description": "Ein interner KI-Chatbot beantwortet technische Fragen der Teammitglieder: \u201eWie setze ich ein Passwort zurück?\u201c, \u201eWarum ist die Synchronisation fehlgeschlagen?\u201c, \u201eWo finde ich die API-Dokumentation?\u201c Trainiert auf den internen Wissensdokumenten. Entlastet den Support und beschleunigt die Problemlösung.",
        },
    ],
    "projekttraeger": [
        {
            "title": "\U0001f680 KI-Wirkungsmodell: Gesellschaftlicher Impact in Echtzeit",
            "description": "Ein Modell, das den gesellschaftlichen Nutzen von MoPilot quantifiziert: eingesparte CO\u2082-Tonnen, erschlossene Mobilitätsräume, vermiedene PKW-Neuanschaffungen, Effekt auf die lokale Wirtschaft. Die KI verknüpft Nutzungsdaten mit sozioökonomischen Daten und erstellt ein \u201eImpact-Dashboard\u201c für Förderanträge und Öffentlichkeitsarbeit.",
        },
        {
            "title": "\U0001f916 Automatisches KPI-Tracking mit Zielerreichungs-Alerts",
            "description": "Die definierten Projekt-KPIs werden automatisch getrackt. Eine KI erkennt Trends: \u201eNutzerzuwachs liegt 15\u202f% unter Plan \u2013 Gegenmaßnahmen empfohlen\u201c oder \u201eCO\u2082-Einsparung übertrifft Jahresziel bereits im Oktober.\u201c Alerts gehen per E-Mail an den Projektträger. Basiert auf einfachen Schwellenwerten und Trendanalyse.",
        },
        {
            "title": "\U0001f916 KI-generierte Förderantrags-Entwürfe",
            "description": "Auf Basis der aktuellen KPIs, Meilensteine und Wirkungsdaten generiert eine KI Entwürfe für Zwischen- und Abschlussberichte an Fördermittelgeber. Der Projektträger ergänzt und finalisiert. Spart erheblich Zeit bei der oft aufwändigen Förderdokumentation.",
        },
    ],
    "fahrzeugsteller": [
        {
            "title": "\U0001f680 Dynamisches Vertragsmodell mit nutzungsbasierter Vergütung",
            "description": "Statt fixer Leasingraten ein KI-gestütztes Modell, bei dem die Vergütung an die tatsächliche Auslastung des Fahrzeugs gekoppelt ist. Höhere Nutzung = höhere Vergütung für den Fahrzeugsteller, niedrigere Nutzung = geringere Kosten für den Betreiber. Erfordert neue Vertragsstrukturen und Echtzeit-Nutzungsdaten, wäre aber ein Win-Win-Modell.",
        },
        {
            "title": "\U0001f916 KI-Matching: Optimale Fahrzeugtypen pro Standort",
            "description": "Eine KI analysiert Buchungsmuster und empfiehlt, welcher Fahrzeugtyp an welchem Standort am besten passt: Kleinwagen für Kurzstrecken in der Stadt, Kombi für Familien am Ortsrand, Transporter am Gewerbegebiet. Unterstützt den Fahrzeugsteller bei der Flottenplanung und maximiert die Auslastung.",
        },
        {
            "title": "\U0001f916 Automatisierte Vertragsverlängerungs-Empfehlungen",
            "description": "Vor Vertragsende analysiert eine KI die Nutzungsdaten des Fahrzeugs und empfiehlt: Verlängern (hohe Auslastung), Ersetzen (häufige Wartung, niedrige Zufriedenheit) oder Standortwechsel (bessere Auslastung anderswo). Der Fahrzeugsteller erhält datenbasierte Entscheidungshilfen statt Bauchgefühl.",
        },
    ],
    "validierungsstelle": [
        {
            "title": "\U0001f680 Vollautomatische Identitätsprüfung mit Biometrie",
            "description": "Ein System, das Identität und Führerschein vollautomatisch prüft: Foto-Abgleich mit Ausweisbild (Face Match), Echtheitsprüfung des Dokuments per KI (Hologramme, Sicherheitsmerkmale), Abfrage von Sperrdatenbanken. Der Nutzer macht alles per Smartphone-Kamera \u2013 ohne manuellen Prüfaufwand. Regulatorisch und technisch sehr anspruchsvoll, aber Standard-Ziel der Branche.",
        },
        {
            "title": "\U0001f916 KI-Vorprüfung hochgeladener Führerscheinfotos",
            "description": "Bevor ein Mitarbeiter den Führerschein manuell prüft, analysiert eine KI das hochgeladene Foto: Ist das Bild scharf genug? Ist es ein Führerschein (kein Personalausweis)? Sind alle Pflichtfelder lesbar? Ist das Ablaufdatum gültig? Offensichtliche Fehler werden sofort zurückgewiesen mit Hinweis zur Korrektur. Reduziert den manuellen Prüfaufwand um bis zu 60\u202f%.",
        },
        {
            "title": "\U0001f916 Automatische Erinnerung bei ablaufenden Dokumenten",
            "description": "Eine KI überwacht die Gültigkeitsdaten aller hinterlegten Führerscheine und Ausweise. 8 Wochen vor Ablauf erhält der Nutzer eine freundliche Erinnerung per E-Mail und App-Benachrichtigung. Bei Ablauf wird die Buchungsfunktion automatisch gesperrt, bis ein neues Dokument hochgeladen ist. Einfach und wirkungsvoll.",
        },
    ],
}


def run_seed():
    """Execute the content seeding."""
    db: Session = SessionLocal()
    try:
        _seed_taglines(db)
        system_user = _ensure_system_user(db)
        _seed_ideas(db, system_user)
        logger.info("Content seeding complete.")
    finally:
        db.close()


def _seed_taglines(db: Session):
    """Update taglines for all roles."""
    updated = 0
    for slug, tagline in TAGLINES.items():
        role = db.query(Role).filter(Role.slug == slug).first()
        if role and role.tagline != tagline:
            role.tagline = tagline
            updated += 1
    if updated:
        db.commit()
        logger.info("Updated taglines for %d roles.", updated)
    else:
        logger.info("All taglines already up to date.")


def _ensure_system_user(db: Session) -> User:
    """Create or find the system user for seed ideas."""
    user = db.query(User).filter(User.email == SYSTEM_USER_EMAIL).first()
    if user:
        logger.info("System user already exists: %s", SYSTEM_USER_EMAIL)
        return user

    user = User(
        email=SYSTEM_USER_EMAIL,
        name=SYSTEM_USER_NAME,
        password_hash=hash_password(SYSTEM_USER_PASSWORD),
        user_type=UserType.team,
        role_id=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created system user: %s", SYSTEM_USER_EMAIL)
    return user


def _seed_ideas(db: Session, author: User):
    """Insert seed ideas per role (idempotent by title)."""
    created = 0
    skipped = 0

    for role_slug, ideas in SEED_IDEAS.items():
        role = db.query(Role).filter(Role.slug == role_slug).first()
        if not role:
            logger.warning("Role '%s' not found, skipping ideas.", role_slug)
            continue

        for idea_data in ideas:
            existing = db.query(Idea).filter(Idea.title == idea_data["title"]).first()
            if existing:
                skipped += 1
                continue

            idea = Idea(
                title=idea_data["title"],
                description=idea_data["description"],
                author_id=author.id,
                role_id=role.id,
                status=IdeaStatus.in_diskussion,
            )
            db.add(idea)
            created += 1

    if created:
        db.commit()
    logger.info("Seed ideas: %d created, %d already existed.", created, skipped)


if __name__ == "__main__":
    run_seed()
