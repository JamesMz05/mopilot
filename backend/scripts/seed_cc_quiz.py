"""Seed script for CC Mobilitäts-Check quiz.

Run inside the main-backend container:
  docker exec mopilot-main-backend python -m scripts.seed_cc_quiz

Or called from app/core/seed.py during startup.
"""

CC_QUIZ_QUESTIONS = [
    {
        "category": "TARIFE",
        "question": "Wie funktioniert die Erstattung im Tarif 'CC eco'?",
        "answers": [
            "Keine Erstattung möglich",
            "Teil der Grundgebühr wird als 5 Std. Fahrtguthaben/Monat erstattet",
            "Man erhält Bargeld zurück",
            "Die Folgemonatsgebühr entfällt"
        ],
        "correct_index": 1,
        "explanation": "Im CC eco Tarif profitierst du von 5 Freistunden pro Monat, die über die Grundgebühr verrechnet werden."
    },
    {
        "category": "TARIFE",
        "question": "Welche Regelung gilt für den Tarif 'CC go'?",
        "answers": [
            "5 Stunden Erstattung pro Monat",
            "Keine Grundgebühr und keine Erstattung",
            "Monatliche Kündigungsfrist mit 100€ Bonus",
            "Kostenlose Wochenendnutzung"
        ],
        "correct_index": 1,
        "explanation": "Der CC go Tarif ist perfekt für Gelegenheitsfahrer: Du zahlst nur, wenn du fährst – ohne Fixkosten."
    },
    {
        "category": "EIGNUNG",
        "question": "Für wen ist CC-Carsharing eine besonders prüfenswerte Alternative?",
        "answers": [
            "Nur für Langstreckenpendler über 500km",
            "Besitzer von wenig genutzten Zweitwagen",
            "Menschen ohne Smartphone",
            "LKW-Fahrer"
        ],
        "correct_index": 1,
        "explanation": "Besonders wenn das eigene Auto oft steht, ist Sharing deutlich günstiger als der Unterhalt eines Zweitwagens."
    },
    {
        "category": "VORAUSSETZUNGEN",
        "question": "Wer sollte sich laut unseren Kriterien NICHT registrieren?",
        "answers": [
            "Personen mit Elektroauto-Interesse",
            "Personen ohne gültige Fahrerlaubnis oder Einmal-Nutzer (z.B. Werkstatt-Ersatz)",
            "Anwohner in Overath",
            "Rentner"
        ],
        "correct_index": 1,
        "explanation": "Unser Modell setzt auf dauerhafte Gemeinschaftsnutzung und erfordert zwingend eine gültige Fahrerlaubnis."
    },
    {
        "category": "REGISTRIERUNG",
        "question": "Was passiert nach deiner Online-Registrierung?",
        "answers": [
            "Sofortige Freischaltung ohne Prüfung",
            "Persönliche Einweisung durch einen Standortpaten",
            "Zusendung der Schlüssel per Post",
            "Man muss ein Formular beim Amt abgeben"
        ],
        "correct_index": 1,
        "explanation": "Ein Standortpate zeigt dir alles Wichtige am Fahrzeug und in der App, damit du sicher starten kannst."
    },
    {
        "category": "VORTEILE",
        "question": "Welche Kosten sparst du durch das Carsharing-Angebot?",
        "answers": [
            "Nur die Parkgebühren",
            "Wertverlust, Steuer, Versicherung & Wartung",
            "Die Kosten für den Führerschein",
            "Keine"
        ],
        "correct_index": 1,
        "explanation": "Die hohen Fixkosten eines eigenen Autos übernimmt die Genossenschaft für dich."
    },
    {
        "category": "VORTEILE",
        "question": "Was bietet die CC-Card bei unseren Partnern?",
        "answers": [
            "Gratis Hotelzimmer",
            "Individuelle Vorteile und Rabatte im lokalen Handel",
            "Freifahrten mit der Bahn",
            "Kostenloses Tanken weltweit"
        ],
        "correct_index": 1,
        "explanation": "Wir fördern die lokale Gemeinschaft durch exklusive Boni bei Partnern in der Region."
    },
    {
        "category": "UMWELT",
        "question": "Wie viele Privat-PKW ersetzt ein Sharing-Auto statistisch?",
        "answers": [
            "Keines",
            "Bis zu 15",
            "Über 100",
            "Nur Motorräder"
        ],
        "correct_index": 1,
        "explanation": "Das schafft Platz für Menschen und Grünflächen statt für Blechlawinen in unseren Quartieren."
    },
    {
        "category": "UMWELT",
        "question": "Welchen Antrieb nutzen unsere Fahrzeuge?",
        "answers": [
            "Diesel-Hybrid",
            "Reiner Elektroantrieb",
            "Wasserstoff",
            "Benzin"
        ],
        "correct_index": 1,
        "explanation": "Wir fahren konsequent elektrisch – leise und ohne Abgase vor Ort."
    },
    {
        "category": "BUCHUNG",
        "question": "Wie öffnest du das Auto an der Station?",
        "answers": [
            "Mit einem Magneten",
            "Per Smartphone-App",
            "Mit dem Personalausweis",
            "Der Standortpate kommt jedes Mal vorbei"
        ],
        "correct_index": 1,
        "explanation": "Die App ist dein Schlüssel – einfach buchen, zum Auto gehen und per Klick öffnen."
    },
    {
        "category": "NUTZUNG",
        "question": "Wo musst du das Fahrzeug nach der Fahrt abstellen?",
        "answers": [
            "Überall im Stadtgebiet",
            "An der festen Abholstation",
            "Vor der eigenen Haustür",
            "Am nächsten Waldrand"
        ],
        "correct_index": 1,
        "explanation": "Stationsbasiertes Sharing bedeutet Verlässlichkeit für dich und den nächsten Nutzer."
    },
    {
        "category": "NUTZUNG",
        "question": "Was ist die Mindestbuchungsdauer?",
        "answers": [
            "5 Minuten",
            "30 Minuten",
            "1 Tag",
            "4 Stunden"
        ],
        "correct_index": 1,
        "explanation": "Schon für kurze Erledigungen ab 30 Minuten lohnt sich das Sharing."
    },
    {
        "category": "GEMEINSCHAFT",
        "question": "Wer entscheidet über die Zukunft der Genossenschaft?",
        "answers": [
            "Ein einzelner Investor",
            "Die Mitglieder (Ein Kopf, eine Stimme)",
            "Der Fahrzeughersteller",
            "Niemand"
        ],
        "correct_index": 1,
        "explanation": "Als Mitglied bist du Miteigentümer und hast volles Mitbestimmungsrecht."
    },
    {
        "category": "FINANZEN",
        "question": "Was ist in den Zeit- und Kilometertarifen bereits enthalten?",
        "answers": [
            "Nur die Nutzung",
            "Strom, Versicherung, Steuer & Wartung",
            "Nichts davon",
            "Nur die Reinigung"
        ],
        "correct_index": 1,
        "explanation": "Rundum sorglos: Du zahlst den Tarif und wir kümmern uns um den gesamten Unterhalt."
    },
]

CC_QUIZ_DEFINITION = {
    "slug": "cc-mobilitaets-check",
    "title": "Mobilitäts-Check",
    "operator": "CC",
    "voucher_code": "ECOBONUS26",
    "voucher_label": "20 Stunden Startguthaben",
    "registration_url": "https://cc.evemo.app/registration",
    "notification_email": "register@sharing-community.de",
    "questions_json": CC_QUIZ_QUESTIONS,
}


async def seed_quiz_data():
    """Seed the CC quiz definition if it doesn't exist yet."""
    from app.core.database import async_session
    from app.models.quiz import QuizDefinition
    from sqlalchemy import select

    async with async_session() as db:
        result = await db.execute(
            select(QuizDefinition).where(QuizDefinition.slug == CC_QUIZ_DEFINITION["slug"])
        )
        existing = result.scalar_one_or_none()
        if existing:
            return

        quiz = QuizDefinition(**CC_QUIZ_DEFINITION)
        db.add(quiz)
        await db.commit()
        print(f"Seeded quiz: {CC_QUIZ_DEFINITION['title']} ({len(CC_QUIZ_QUESTIONS)} questions)")
