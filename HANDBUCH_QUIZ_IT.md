# CC Mobilitats-Check (Quiz) — Handbuch IT & Software

**Dokument-Version:** 1.0 | **Software-Version:** 1.2
**Stand:** 3. Mai 2026
**System:** https://cc-kunden.mopilot.website/quiz

> **Änderungshistorie:**
> - v1.0 (03.05.2026): Erstversion

---

# Teil A — IT-Zusammenfassung fur den Vorstand

## 1. Wo lauft was?

| Aspekt | Detail |
|--------|--------|
| **Quiz-Frontend** | cc-kunden.mopilot.website/quiz (Next.js, lauft als Docker-Container) |
| **Quiz-Backend** | api.mopilot.website (FastAPI, Teil des main-backend) |
| **Datenbank** | PostgreSQL 16 auf demselben Server (mopilot-DB) |
| **E-Mail-Versand** | IONOS SMTP (smtp.ionos.de:587, STARTTLS) |
| **Server** | Hetzner-Rechenzentrum Falkenstein, Deutschland (DSGVO-konform) |
| **Verschlusselung** | TLS/HTTPS (Let's Encrypt, automatische Erneuerung via Traefik) |

## 2. Sicherheit auf einen Blick

- **Keine personenbezogenen Daten** werden gespeichert — nur anonyme Session-UUIDs
- **Cookie-basierter Soft-Lock** verhindert Mehrfach-Nutzung (30 Tage)
- **Admin-Dashboard** ist rollengeschutzt (nur Plattform-Support, Strategie-Rollen, Admin)
- **CORS-Schutz**: Nur Anfragen von cc-kunden.mopilot.website werden akzeptiert
- **CSP frame-ancestors**: Embed-Variante nur von sharing-community.de einbettbar
- **Kein correct_index im Frontend**: Korrekte Antworten werden nie an den Browser gesendet

## 3. Kosten & Abhangigkeiten

| Posten | Kosten | Anbieter |
|--------|--------|----------|
| Server (Hetzner) | Bestandteil MoPilot-Infrastruktur | Hetzner |
| E-Mail (IONOS) | Bestandteil IONOS-Vertrag | IONOS |
| Software-Lizenzen | **0 EUR** (100% Open Source) | — |
| Domain/SSL | Automatisch via Traefik | Let's Encrypt |
| Anthropic API | **0 EUR** (Quiz nutzt keine KI) | — |

## 4. Backup-Strategie

Die Quiz-Daten (3 Tabellen) liegen in der `mopilot`-Datenbank und werden durch die bestehende Backup-Routine abgedeckt:

- **Tagliches Backup** um 03:00 Uhr, 14-Tage-Retention
- **Hetzner-Snapshots**: 7 rotierende automatische Server-Backups
- **Secrets-Backup**: Wochentlich Sonntag 03:30

---

# Teil B — Technische Dokumentation fur IT & Entwicklung

---

## 1. Architektur-Uberblick

```
Browser (cc-kunden.mopilot.website/quiz)
    |
    |  CORS: credentials: 'include'
    v
cc-frontend (Next.js, Port 3000)
    |
    |  NEXT_PUBLIC_QUIZ_API_BASE = https://api.mopilot.website
    v
main-backend (FastAPI, Port 8000)        cc-backend (stateless, NUR KI-Chat)
    |                                         |
    |  async SQLAlchemy 2.0                   |  Kein DB-Zugriff
    v                                         v
PostgreSQL 16 (mopilot DB)              Anthropic API
    |-- quiz_definitions
    |-- quiz_sessions
    +-- quiz_events
```

**Wichtig:** Die Quiz-Logik lauft im **main-backend**, nicht im cc-backend. Das cc-backend bleibt stateless und dient nur als KI-Chat-Proxy. Diese Entscheidung wurde getroffen, weil das main-backend die einzige Komponente mit mopilot-DB-Anbindung ist.

## 2. Datenbank-Schema (3 Tabellen)

### quiz_definitions

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|-------------|
| id | UUID | PK, default uuid4 | Primarschlussel |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-Slug (z.B. `cc-mobilitaets-check`) |
| title | VARCHAR(200) | NOT NULL | Anzeige-Titel |
| operator | VARCHAR(20) | NOT NULL | Betreiber (`CC` / `ZEO`) |
| voucher_code | VARCHAR(50) | NOT NULL | Gutscheincode |
| voucher_label | VARCHAR(200) | NOT NULL | Beschreibung des Gutscheins |
| registration_url | VARCHAR(500) | NOT NULL | Link zur Registrierung |
| notification_email | VARCHAR(200) | NOT NULL | E-Mail-Empfanger |
| questions_json | JSONB | NOT NULL | Array mit Fragen, Antworten, correct_index |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Quiz aktiv/inaktiv |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Erstellungszeitpunkt |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Letztes Update |

### quiz_sessions

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|-------------|
| id | UUID | PK (= Cookie-Wert) | Session-ID |
| quiz_id | UUID | FK → quiz_definitions.id (CASCADE) | Zugehoriges Quiz |
| started_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Start |
| completed_at | TIMESTAMPTZ | nullable | Abschluss |
| abandoned_at | TIMESTAMPTZ | nullable | Abbruch |
| correct_count | INTEGER | NOT NULL, DEFAULT 0 | Richtige Antworten |
| total_count | INTEGER | NOT NULL, DEFAULT 0 | Beantwortete Fragen |
| referrer | VARCHAR(255) | nullable | HTTP-Referrer |
| user_agent_class | VARCHAR(20) | nullable | mobile/desktop/tablet |
| notification_sent | BOOLEAN | NOT NULL, DEFAULT false | E-Mail versendet? |

### quiz_events

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | Sequenz-ID |
| session_id | UUID | FK → quiz_sessions.id (CASCADE), INDEX | Session |
| question_index | INTEGER | nullable | Frage-Index (0-basiert) |
| selected_index | INTEGER | nullable | Gewahlte Antwort (0-basiert) |
| is_correct | BOOLEAN | nullable | Antwort korrekt? |
| event_type | VARCHAR(20) | NOT NULL | start/answer/next/finish/abandon |
| timestamp | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Event-Zeitpunkt |

**Beziehungen:**
- quiz_sessions.quiz_id → quiz_definitions.id (ON DELETE CASCADE)
- quiz_events.session_id → quiz_sessions.id (ON DELETE CASCADE)

## 3. API-Referenz

Basis-URL: `https://api.mopilot.website`

### Quiz-Endpoints (offentlich, kein Auth)

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/quiz/{slug}` | Quiz-Definition ohne correct_index |
| POST | `/api/quiz/{slug}/start` | Session erzeugen, Cookie setzen |
| POST | `/api/quiz/sessions/{id}/answer` | Antwort speichern, Feedback zuruckgeben |
| POST | `/api/quiz/sessions/{id}/complete` | Quiz abschliessen, Code + E-Mail |
| POST | `/api/quiz/sessions/{id}/abandon` | Abbruch (sendBeacon) |
| GET | `/api/quiz/sessions/{id}/state` | Session-Status (running/completed/expired) |

### Stats-Endpoints (Auth: Plattform-Support+)

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/quiz/stats/overview` | KPIs (Sessions, Rate, Score, Gerate, Referrer) |
| GET | `/api/quiz/stats/funnel` | Trichter pro Frage |
| GET | `/api/quiz/stats/answer-heatmap` | Antwortverteilung |
| GET | `/api/quiz/stats/export.csv` | CSV-Export (Semikolon-Delimiter) |

**Query-Parameter fur Stats:** `slug` (Default: cc-mobilitaets-check), `from` (ISO-Datum), `to` (ISO-Datum)

## 4. Auth & CORS

**Quiz-Endpoints:** Kein Auth — offentlich zuganglich.

**Stats-Endpoints:** JWT-Token erforderlich. Erlaubte Rollen:
`plattform_support`, `plattform-support`, `projekttraeger`, `fahrzeugsteller`, `validierungsstelle`, `mopilot_team`, `admin`

**CORS-Konfiguration (main-backend):**
- Origin: `https://cc-kunden.mopilot.website`
- `allow_credentials: True` (fur Cookie-Ubertragung)
- Methods: GET, POST

## 5. Cookie-Lock-Mechanismus

| Eigenschaft | Wert |
|-------------|------|
| Name | `mopilot_quiz_session` |
| Domain | `.mopilot.website` (subdomain-ubergreifend) |
| Max-Age | 30 Tage (2.592.000 Sekunden) |
| SameSite | Lax |
| Secure | true |
| HttpOnly | false (Frontend braucht Lesezugriff fur Session-ID) |

**Ablauf:**
1. Neuer Besucher → kein Cookie → Quiz startet normal
2. Start-Request → Backend erzeugt Session, setzt Cookie
3. Wiederkehr innerhalb 30 Tagen → Cookie vorhanden → Frontend pruft `/sessions/{id}/state`
4. Status `completed` → Ergebnis-Screen mit bestehendem Code wird direkt angezeigt
5. Status `running` → Quiz wird fortgesetzt
6. Status `expired` / Cookie abgelaufen → neues Quiz moglich

## 6. E-Mail-System

**Service:** `backend/app/services/quiz_mail.py`

| Einstellung | Wert |
|-------------|------|
| SMTP-Server | smtp.ionos.de:587 (STARTTLS) |
| Absender | MoPilot Quiz <noreply@mopilot.website> |
| Empfanger | quiz_definitions.notification_email (aktuell: register@sharing-community.de) |
| Versand | Asynchron via FastAPI BackgroundTasks |
| Format | HTML + Plaintext-Fallback |

**E-Mail-Inhalt (anonymisiert):**
- Session-ID (UUID)
- Start/Ende-Zeitstempel
- Dauer in Sekunden
- Score (x/14)
- Gerateklasse
- Referrer
- Ausgegebener Gutscheincode

**Empfanger andern:** UPDATE in quiz_definitions.notification_email — keine Code-Anderung notig.

## 7. Deployment / Build-Args

**Relevante Docker-Konfiguration (docker-compose.yml):**

Das Quiz nutzt bestehende Services (main-backend, cc-frontend). Kein separater Container notig.

**Build-Arg im CC-Frontend-Dockerfile:**
```dockerfile
ARG NEXT_PUBLIC_QUIZ_API_BASE=https://api.mopilot.website
```

Dieses Build-Arg muss im `docker-compose.yml` unter `cc-frontend.build.args` stehen.

**Middleware-Ausnahmen (Next.js, cc-frontend):**
- `/quiz` — offentlich, kein Login
- `/embed/*` — offentlich, kein Login

**CSP-Header (next.config.js, cc-frontend):**
```
frame-ancestors 'self' https://sharing-community.de
```

## 8. Monitoring

**Bestehende Monitore (Uptime Kuma):**
- cc-kunden.mopilot.website (Frontend) — vorhanden
- api.mopilot.website (Backend) — vorhanden

**Empfohlene zusatzliche Monitore (noch einzurichten):**
- `GET https://api.mopilot.website/api/quiz/cc-mobilitaets-check` — Quiz-Definition erreichbar
- `GET https://cc-kunden.mopilot.website/quiz` — Quiz-Seite erreichbar

## 9. Haufige Probleme & Losungen

| Problem | Ursache | Losung |
|---------|---------|--------|
| Quiz-Seite zeigt 401/Login-Redirect | Middleware-Ausnahme fur `/quiz` fehlt | `matcher`-Pattern in cc-frontend `middleware.ts` prufen |
| Cookie wird nicht gesetzt | CORS-Problem: credentials nicht erlaubt | `allow_credentials=True` und Origin im main-backend prufen |
| E-Mail wird nicht versendet | SMTP-Credentials | `docker compose config | grep SMTP` prufen |
| embed/quiz zeigt "Refused to frame" | CSP frame-ancestors fehlt | `next.config.js` Headers prufen |
| Quiz ladt nicht (CORS-Fehler) | Origin nicht whitelisted | `MAIN_CORS_ORIGINS` in `.env` prufen |
| Stats-Dashboard zeigt 403 | Falsche Rolle | Benutzerrolle in mopilot-DB prufen |
| Quiz-Fragen sind falsch/veraltet | DB-Inhalt | `SELECT questions_json FROM quiz_definitions WHERE slug='cc-mobilitaets-check'` |

## 10. Code-Konventionen

| Konvention | Details |
|------------|---------|
| Sprache Code/Kommentare | Englisch |
| Sprache UI-Texte | Deutsch, du-Form |
| Backend-Framework | FastAPI (async), Pydantic-Schemas |
| ORM | SQLAlchemy 2.0 async (asyncpg) |
| Frontend-Framework | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS (Shared Design System) |
| API-Kommunikation | fetch mit credentials: 'include' |
| Zwei-Verzeichnis-Regel | Quiz-Anderungen IMMER in cc-kunden/frontend/ UND MoPilot_CC_Kunden/frontend/ |

## 11. Dateiubersicht

### Backend (main-backend)

| Datei | Funktion |
|-------|----------|
| `backend/app/api/quiz.py` | 6 Quiz-Endpoints (Router) |
| `backend/app/api/quiz_stats.py` | 4 Stats-Endpoints (Router) |
| `backend/app/models/quiz.py` | SQLAlchemy-Modelle (3 Tabellen) |
| `backend/app/schemas/quiz.py` | Pydantic-Schemas (8 Klassen) |
| `backend/app/services/quiz_mail.py` | E-Mail-Notification-Service |

### CC-Frontend (in BEIDEN Verzeichnissen)

| Datei | Funktion |
|-------|----------|
| `src/components/quiz/QuizContainer.tsx` | Hauptcontainer, State-Management |
| `src/components/quiz/QuestionCard.tsx` | Frage-Darstellung mit 4 Optionen |
| `src/components/quiz/ProgressBar.tsx` | Fortschrittsbalken (x/14) |
| `src/components/quiz/MotivationButton.tsx` | Animierter Weiter-Button |
| `src/components/quiz/ResultScreen.tsx` | Ergebnis + Gutscheincode |
| `src/components/quiz/CookieConsentBanner.tsx` | Cookie-Hinweis |
| `src/lib/quiz-api.ts` | API-Client (fetch-Wrapper) |
| `src/app/quiz/page.tsx` | Quiz-Route |
| `src/app/embed/quiz/page.tsx` | Embed-Route |

### Hauptsystem-Frontend

| Datei | Funktion |
|-------|----------|
| `frontend/app/admin/quiz-stats/page.tsx` | Admin-Dashboard |

---

*Erstellt im Rahmen des MoPilot-Projekts | v1.2 — 3. Mai 2026*
