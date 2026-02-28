"""Seed demo data for all roles, stations, vehicles, tariffs, and FAQs."""
from sqlalchemy import select
from app.core.database import async_session
from app.core.auth import hash_password
from app.models.models import User, UserRole, Station, Vehicle, Tariff, FAQ

DEMO_USERS = [
    {"email": "endkunde@mopilot.website", "name": "Maria Müller", "role": UserRole.ENDKUNDE, "operator": "zeo"},
    {"email": "stationspate@mopilot.website", "name": "Thomas Weber", "role": UserRole.STATIONSPATE, "operator": "zeo"},
    {"email": "hotline@mopilot.website", "name": "Sarah Schmidt", "role": UserRole.HOTLINE, "operator": "zeo"},
    {"email": "betreiber@mopilot.website", "name": "Christian Will", "role": UserRole.BETREIBER, "operator": "zeo"},
    {"email": "flotte@mopilot.website", "name": "Michael Braun", "role": UserRole.FLOTTENMANAGEMENT, "operator": "zeo"},
    {"email": "fahrzeug@mopilot.website", "name": "Lisa Klein", "role": UserRole.FAHRZEUGBETREUER, "operator": "zeo"},
    {"email": "support@mopilot.website", "name": "Jan Neumann", "role": UserRole.PLATTFORM_SUPPORT, "operator": "zeo"},
    {"email": "traeger@mopilot.website", "name": "Dr. Petra Lang", "role": UserRole.PROJEKTTRAEGER, "operator": "zeo"},
    {"email": "steller@mopilot.website", "name": "Frank Hoffmann", "role": UserRole.FAHRZEUGSTELLER, "operator": "zeo"},
    {"email": "validierung@mopilot.website", "name": "Anna Fischer", "role": UserRole.VALIDIERUNGSSTELLE, "operator": "zeo"},
    # CC operator users
    {"email": "endkunde-cc@mopilot.website", "name": "Klaus Becker", "role": UserRole.ENDKUNDE, "operator": "cc"},
    {"email": "betreiber-cc@mopilot.website", "name": "Sabine Richter", "role": UserRole.BETREIBER, "operator": "cc"},
]

DEMO_STATIONS = [
    # ZEO stations
    {"name": "ZEO Bruchsal Bahnhof", "address": "Bahnhofsplatz 1", "city": "Bruchsal", "operator": "zeo", "vehicles_count": 3},
    {"name": "ZEO Bruchsal Rathaus", "address": "Kaiserstraße 66", "city": "Bruchsal", "operator": "zeo", "vehicles_count": 2},
    {"name": "ZEO Gondelsheim", "address": "Hauptstraße 20", "city": "Gondelsheim", "operator": "zeo", "vehicles_count": 1},
    {"name": "ZEO Ubstadt-Weiher", "address": "Bahnhofstraße 5", "city": "Ubstadt-Weiher", "operator": "zeo", "vehicles_count": 1},
    {"name": "ZEO Kraichtal", "address": "Marktplatz 1", "city": "Kraichtal", "operator": "zeo", "vehicles_count": 1},
    {"name": "ZEO Forst", "address": "Kronauer Str. 2", "city": "Forst", "operator": "zeo", "vehicles_count": 1},
    # CC stations
    {"name": "CC Overath Bahnhof", "address": "Dr.-Ringens-Str.", "city": "Overath", "operator": "cc", "vehicles_count": 2},
    {"name": "CC Overath Zentrum", "address": "Weberstraße", "city": "Overath", "operator": "cc", "vehicles_count": 1},
    {"name": "CC Bad Honnef Rathaus", "address": "Rathausplatz 1", "city": "Bad Honnef", "operator": "cc", "vehicles_count": 1},
    {"name": "CC Gummersbach", "address": "Hindenburgstr.", "city": "Gummersbach", "operator": "cc", "vehicles_count": 1},
    {"name": "CC Köln Clouth-Quartier", "address": "Clouth-Gelände", "city": "Köln", "operator": "cc", "vehicles_count": 2},
]

DEMO_VEHICLES = [
    {"model": "Renault ZOE", "manufacturer": "Renault", "vehicle_type": "BEV", "operator": "zeo", "range_km": 390, "seats": 5},
    {"model": "Fiat 500e", "manufacturer": "Fiat", "vehicle_type": "BEV", "operator": "zeo", "range_km": 320, "seats": 4},
    {"model": "Fiat E-Scudo", "manufacturer": "Fiat", "vehicle_type": "BEV", "operator": "zeo", "range_km": 330, "seats": 8},
    {"model": "MG5 Electric", "manufacturer": "MG", "vehicle_type": "BEV", "operator": "cc", "range_km": 400, "seats": 5},
    {"model": "VW Tiguan TSI", "manufacturer": "VW", "vehicle_type": "Verbrenner", "operator": "cc", "range_km": 700, "seats": 5},
    {"model": "VW Multivan T6", "manufacturer": "VW", "vehicle_type": "Verbrenner", "operator": "cc", "range_km": 800, "seats": 7},
]

DEMO_TARIFFS = [
    {"name": "Eco-Tarif", "operator": "zeo", "base_fee_monthly": "0,00 €", "price_per_km": "ab 0,27 €", "price_per_hour": "ab 1,90 €",
     "description": "Flexibler Tarif ohne Grundgebühr. Ideal für Gelegenheitsnutzer."},
    {"name": "Eco-plus-Tarif", "operator": "zeo", "base_fee_monthly": "9,90 €", "price_per_km": "ab 0,19 €", "price_per_hour": "ab 1,70 €",
     "description": "Vielfahrer-Tarif mit Grundgebühr als Freistunden. Ab 50 km reduzierte Preise."},
    {"name": "Standard-Tarif", "operator": "cc", "base_fee_monthly": "Genossenschaftsanteil", "price_per_km": "individuell", "price_per_hour": "individuell",
     "description": "Tarif für Genossenschaftsmitglieder der Car&RideSharing Community eG."},
]

DEMO_FAQS = [
    {"question": "Wie registriere ich mich bei ZEO?", "answer": "Besuchen Sie mein.zeo-carsharing.de und folgen Sie dem Registrierungsprozess. Sie benötigen einen gültigen Führerschein und eine E-Mail-Adresse.", "category": "Registrierung", "operator": "zeo", "target_role": "endkunde"},
    {"question": "Wie öffne ich das Fahrzeug?", "answer": "Über die 'mein zeo' App oder mit der RFID-Karte. Stellen Sie sicher, dass Ihre Buchung aktiv ist und Sie sich in Reichweite des Fahrzeugs befinden.", "category": "Fahrzeugnutzung", "operator": "zeo", "target_role": "endkunde"},
    {"question": "Was kostet eine Fahrt?", "answer": "Die Kosten setzen sich aus Zeit- und Kilometerpreis zusammen. Im Eco-Tarif ab 1,90 €/h und 0,27 €/km. Im Eco-plus-Tarif ab 1,70 €/h und 0,19 €/km bei 9,90 € Grundgebühr/Monat.", "category": "Kosten", "operator": "zeo", "target_role": "endkunde"},
    {"question": "Wo kann ich das E-Auto unterwegs laden?", "answer": "An allen öffentlichen Ladestationen. Die Ladekarte liegt im Fahrzeug. Bitte laden Sie das Fahrzeug nach längeren Fahrten wieder auf, damit es für den nächsten Nutzer bereit ist.", "category": "Laden", "operator": "zeo", "target_role": "endkunde"},
    {"question": "Was ist ein Stationspate?", "answer": "Stationspaten kümmern sich ehrenamtlich um einen ZEO-Standort: Sie melden Schäden, halten die Station sauber und sind Ansprechpartner für Nutzer vor Ort.", "category": "Community", "operator": "general", "target_role": "stationspate"},
    {"question": "Wie melde ich einen Schaden am Fahrzeug?", "answer": "Melden Sie Schäden sofort über die App unter 'Schaden melden' oder rufen Sie die Hotline an. Dokumentieren Sie den Schaden mit Fotos.", "category": "Schadenmanagement", "operator": "general", "target_role": "endkunde"},
    {"question": "Wie werde ich Mitglied der Genossenschaft?", "answer": "Besuchen Sie sharing-community.de/mitgliedschaft-beantragen. Ein Genossenschaftsanteil berechtigt zur Nutzung aller Fahrzeuge und Mitbestimmung.", "category": "Mitgliedschaft", "operator": "cc", "target_role": "endkunde"},
    {"question": "Was tun bei einer Panne?", "answer": "Rufen Sie die Carsharing-Hotline an. Die Nummer finden Sie in der App und im Fahrzeug. Bei Unfällen zusätzlich die Polizei verständigen.", "category": "Notfall", "operator": "general", "target_role": "endkunde"},
    {"question": "Wie erstelle ich ein Support-Ticket?", "answer": "Über das Info Portal unter support.evemo.de → 'Ticket erstellen'. Beschreiben Sie das Problem so genau wie möglich und fügen Sie Screenshots hinzu.", "category": "Support", "operator": "general", "target_role": "betreiber"},
    {"question": "Wie füge ich ein neues Fahrzeug zum System hinzu?", "answer": "Im Admin Center unter 'Fahrzeuge' → 'Neues Fahrzeug'. Geben Sie Fahrzeugdaten, Standort und Hardware-ID ein. Nach Freischaltung durch den Plattform-Support ist das Fahrzeug buchbar.", "category": "Flottenmanagement", "operator": "general", "target_role": "flottenmanagement"},
]


async def seed_demo_data():
    """Seed the database with demo data if empty."""
    async with async_session() as session:
        # Check if already seeded
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            return  # Already seeded

        # Seed users
        default_pw = hash_password("mopilot2026")
        for u in DEMO_USERS:
            session.add(User(hashed_password=default_pw, **u))

        # Seed stations
        for s in DEMO_STATIONS:
            session.add(Station(**s))

        # Seed vehicles
        for v in DEMO_VEHICLES:
            session.add(Vehicle(**v))

        # Seed tariffs
        for t in DEMO_TARIFFS:
            session.add(Tariff(**t))

        # Seed FAQs
        for f in DEMO_FAQS:
            session.add(FAQ(**f))

        await session.commit()
        print("✅ Demo-Daten erfolgreich angelegt.")
