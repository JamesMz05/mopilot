# Claude-Code-Prompt: CC-Quiz Migration & Erweiterung

> **Ziel:** Migration des CC-Quiz von sharing-community.de/quiz/ auf cc-kunden.mopilot.website/quiz mit erweiterten Auswertungen, anonymem Tracking und Admin-Dashboard.
>
> **Stand:** 03. Mai 2026 · **Laufzeit:** ca. 2–3 Arbeitswochen, in 4 Phasen
>
> **Anwendung:** Lade dieses Dokument in Claude Code mit `@cc-quiz-implementation-prompt.md` und arbeite die Phasen nacheinander ab. **Stoppe nach jeder Phase** und warte auf "weiter" vom Anwender, bevor du die nächste Phase beginnst.

---

## Architektur-Übersicht

| Komponente | Wo | Rolle |
|------------|-----|-------|
| Frontend Quiz-Player | `/opt/mopilot/cc-kunden/frontend/` + `/opt/mopilot/MoPilot_CC_Kunden/frontend/` | `/quiz` und `/embed/quiz` Seiten |
| Frontend Stats-Dashboard | `/opt/mopilot/frontend/` | `/admin/quiz-stats` (rollengeschützt) |
| Backend (alles) | `/opt/mopilot/backend/` (main-backend) | `/api/quiz/*` Endpoints — die mopilot-DB ist hier bereits async angebunden |
| Datenbank | mopilot-DB | 3 neue Tabellen: `quiz_definitions`, `quiz_sessions`, `quiz_events` |

**Wichtig:** Das cc-backend ist stateless und bekommt KEINE Quiz-Logik. Cross-Origin-Aufruf vom cc-frontend zum main-backend wird über CORS-Headers + Cookie-Domain `.mopilot.website` gelöst.

**Zwei-Verzeichnisse-Falle bei CC-Frontend:** Änderungen am CC-Frontend müssen IMMER in beiden Verzeichnissen erfolgen — `cc-kunden/frontend/` (Entwicklung) UND `MoPilot_CC_Kunden/frontend/` (Docker-Build). Verifiziere mit `grep -A 3 "cc-frontend:" /opt/mopilot/docker-compose.yml | grep context`, welches Verzeichnis tatsächlich gebaut wird.

---

## Globale Verhaltensregeln

- **Sprache:** Deutsche UI-Texte, du-Form. Code-Kommentare auf Englisch, Variablennamen in Englisch (Standard für FastAPI/Next.js-Code).
- **Git-Workflow:** Jede Phase endet mit einem aussagekräftigen Commit. Branch `feat/cc-quiz` von `master` abzweigen.
- **Sicherheit:** Wenn du im Verlauf API-Keys, Passwörter oder Tokens siehst — niemals in Chat oder Commits ausgeben. Bei versehentlicher Exposition: sofort den Anwender warnen und Rotation empfehlen.
- **Verifikation:** Jede Phase hat explizite Verifikationskriterien. Erst weiter, wenn alle erfüllt sind.
- **Docker-Reload:** Nach Code- oder .env-Änderungen niemals `docker compose restart`, immer `docker compose down && docker compose up -d --build`.
- **Healthcheck-IP:** In Docker-Healthchecks immer `127.0.0.1`, nicht `localhost` (Alpine löst zu IPv6 auf).

---

# Phase 0 — Vorbereitung & Backup

**Ziel:** Sauberer Start. Backup angelegt, Branch erzeugt, Architektur verifiziert.

## Schritte

1. **Manuelles DB-Backup der mopilot-DB:**

   ```bash
   # PostgreSQL-Container-Name ermitteln
   docker ps --format '{{.Names}}' | grep postgres

   # Backup mit Zeitstempel
   docker exec <postgres-container-name> \
     pg_dump -U mopilot mopilot | gzip > /opt/backups/db/mopilot_pre_quiz_$(date +%Y%m%d_%H%M).sql.gz

   # Größe prüfen
   ls -lh /opt/backups/db/mopilot_pre_quiz_*.sql.gz
   ```

2. **Branch anlegen:**

   ```bash
   cd /opt/mopilot
   git fetch origin
   git checkout master
   git pull origin master
   git checkout -b feat/cc-quiz
   ```

3. **Architektur verifizieren (welches CC-Frontend-Verzeichnis baut Docker?):**

   ```bash
   cd /opt/mopilot
   grep -B 1 -A 5 "cc-frontend:" docker-compose.yml | head -30
   grep -B 1 -A 5 "main-backend:" docker-compose.yml | head -30
   ```

   Notiere die `context:`-Pfade — die werden in Phase 2 wichtig.

4. **DB-Verbindung des main-backend prüfen:** Schau in `/opt/mopilot/backend/` und finde die SQLAlchemy-Konfiguration (vermutlich `app/database.py` oder `app/db.py`). Notiere Modul-Pfad und Async-Pattern für Phase 1.

## Verifikation

- [ ] Backup-Datei existiert in `/opt/backups/db/` und ist > 1 KB
- [ ] Branch `feat/cc-quiz` ist aktiv: `git branch --show-current` zeigt `feat/cc-quiz`
- [ ] Docker-Compose-Pfade sind notiert (cc-frontend Build-Kontext, main-backend Pfad)
- [ ] DB-Modul des main-backend ist identifiziert (Datei-Pfad, Engine-Variable)

## STOP

**Bestätige dem Anwender den Backup-Pfad und die identifizierten Komponenten. Warte auf "weiter" vor Phase 1.**

---

# Phase 1 — Backend & Datenmodell

**Ziel:** Vollständige Backend-API. Quiz-Daten in der DB, alle Endpoints funktionieren via curl.

## Schritte

### 1.1 Datenbank-Migration

Wähle den im main-backend etablierten Migrationsweg (Alembic, falls vorhanden — sonst direktes SQL-Skript). Ablageort:

- Mit Alembic: `/opt/mopilot/backend/alembic/versions/<timestamp>_add_quiz_tables.py`
- Ohne Alembic: `/opt/mopilot/backend/migrations/<timestamp>_add_quiz_tables.sql` und manuell ausführen

**Schema:**

```sql
CREATE TABLE quiz_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  operator VARCHAR(20) NOT NULL,                  -- 'CC' | 'ZEO'
  voucher_code VARCHAR(50) NOT NULL,
  voucher_label VARCHAR(200) NOT NULL,
  registration_url VARCHAR(500) NOT NULL,
  notification_email VARCHAR(200) NOT NULL,
  questions_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY,                            -- explizit gesetzt = Cookie-Wert
  quiz_id UUID NOT NULL REFERENCES quiz_definitions(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  correct_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  referrer VARCHAR(255),
  user_agent_class VARCHAR(20),                   -- 'mobile' | 'desktop' | 'tablet'
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_started_at ON quiz_sessions(started_at);
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);

CREATE TABLE quiz_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_index INT,
  selected_index INT,
  is_correct BOOLEAN,
  event_type VARCHAR(20) NOT NULL,                -- 'start' | 'answer' | 'next' | 'finish' | 'abandon'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_events_session_id ON quiz_events(session_id);
CREATE INDEX idx_quiz_events_event_type ON quiz_events(event_type);
CREATE INDEX idx_quiz_events_timestamp ON quiz_events(timestamp);
```

### 1.2 Seed-Daten — das CC-Quiz

Lege ein Seed-Skript in `/opt/mopilot/backend/scripts/seed_cc_quiz.py` an. Das Quiz hat **14 Fragen** in folgenden Kategorien:

```
TARIFE        (2 Fragen)   - CC eco Erstattung, CC go Regelung
EIGNUNG       (1 Frage)    - Zielgruppe Carsharing
VORAUSSETZUNGEN (1 Frage)  - Wer sollte sich NICHT registrieren
REGISTRIERUNG (1 Frage)    - Was passiert nach Online-Registrierung
VORTEILE      (2 Fragen)   - Kostenersparnis, CC-Card Partnervorteile
UMWELT        (2 Fragen)   - Privat-PKW-Ersatz, Antriebsart
BUCHUNG       (1 Frage)    - Wie öffnet man das Auto
NUTZUNG       (2 Fragen)   - Abstellort, Mindestbuchungsdauer
GEMEINSCHAFT  (1 Frage)    - Wer entscheidet (Genossenschaft)
FINANZEN      (1 Frage)    - Was ist im Tarif enthalten
```

Die vollständigen Frage-/Antwort-Texte und korrekten Indizes sind im Konzeptdokument `cc-quiz-konzept.docx` (Abschnitt 3.3) und in der Vorlage `260503_ccQuiz.docx` enthalten — übernimm sie 1:1 ins JSONB-Format:

```python
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
}
```

Quiz-Eintrag-Felder für CC:

```python
slug = "cc-mobilitaets-check"
title = "Mobilitäts-Check"
operator = "CC"
voucher_code = "ECOBONUS26"
voucher_label = "20 Stunden Startguthaben"
registration_url = "https://cc.evemo.app/registration"
notification_email = "register@sharing-community.de"
```

### 1.3 SQLAlchemy-Modelle

Lege `/opt/mopilot/backend/app/models/quiz.py` an mit Modellen `QuizDefinition`, `QuizSession`, `QuizEvent`. Folge dem bestehenden async-SQLAlchemy-2.0-Pattern des main-backend (Mapped-Style). Schau in den vorhandenen Modellen nach (z. B. User), um den Stil zu treffen.

### 1.4 Pydantic-Schemas

Lege `/opt/mopilot/backend/app/schemas/quiz.py` an:

- `QuizDefinitionPublic` — Quiz für den Player, **ohne `correct_index`** (Schutz vor Spoiling)
- `QuizStartRequest` — Body für POST /start (referrer, user_agent_class)
- `QuizStartResponse` — { session_id, quiz }
- `QuizAnswerRequest` — { question_index, selected_index }
- `QuizAnswerResponse` — { is_correct, correct_index, explanation, progress }
- `QuizCompleteResponse` — { score, total, voucher_code, voucher_label, registration_url }

### 1.5 API-Router

Lege `/opt/mopilot/backend/app/routers/quiz.py` an mit folgenden Endpoints:

| Methode | Pfad | Rolle |
|---------|------|-------|
| GET | `/api/quiz/{slug}` | Quiz-Definition ohne correct_index |
| POST | `/api/quiz/{slug}/start` | Session erzeugen, UUID setzen |
| POST | `/api/quiz/sessions/{session_id}/answer` | Antwort speichern, Korrektheit zurück |
| POST | `/api/quiz/sessions/{session_id}/complete` | Quiz abschließen, Code ausgeben, E-Mail asynchron |
| POST | `/api/quiz/sessions/{session_id}/abandon` | Beacon-Endpoint, falls User abbricht (sendBeacon) |

**Cookie-Setzung beim /start:**

- Cookie-Name: `mopilot_quiz_session`
- Wert: Session-UUID
- Max-Age: 30 Tage
- Domain: `.mopilot.website` (subdomain-übergreifend)
- SameSite: `Lax`
- Secure: `True`
- HttpOnly: `False` (Frontend muss UUID lesen können für API-Aufrufe)

**Wiederkehr-Handling:** Wenn `/start` mit existierendem Cookie aufgerufen wird, prüfe ob die Session noch lebt und ob bereits abgeschlossen. Wenn abgeschlossen und < 30 Tage alt: bestehende `voucher_code` direkt zurückgeben statt neuer Session.

### 1.6 E-Mail-Notification

Lege `/opt/mopilot/backend/app/services/quiz_mail.py` an. Verwende das bestehende SMTP-Setup (IONOS, smtp.ionos.de:587). E-Mail-Template:

```
Subject: Quiz erfolgreich abgeschlossen — Mobilitäts-Check ({score}/{total})

Empfänger: register@sharing-community.de

Body (HTML):
- Header: Petrol-Gradient, "MoPilot · CC-Quiz"
- Inhalt: Anonyme Metriken
  - Session-ID (UUID)
  - Zeitstempel Start/Ende, Dauer in Sekunden
  - Score: {correct}/{total}
  - Geräteklasse, Referrer
- Hinweis: "Diese Person hat den Gutscheincode ECOBONUS26 erhalten. Eine Registrierung ist möglich, aber nicht garantiert."
```

Versand asynchron via `BackgroundTasks` von FastAPI. Erfolg/Fehlschlag in `quiz_sessions.notification_sent` festhalten.

### 1.7 CORS-Konfiguration

Im main-backend in der FastAPI-App: erlaubte Origins erweitern um `https://cc-kunden.mopilot.website`. CORS muss `allow_credentials=True` haben (sonst kommen Cookies nicht durch). Nur die Quiz-Routen exposen, nicht die internen.

### 1.8 Router registrieren & rebuild

```bash
cd /opt/mopilot
docker compose down
docker compose up -d --build main-backend
docker compose logs -f main-backend  # auf Errors prüfen
```

## Verifikation

```bash
# 1) Definition abrufen
curl -s https://mopilot.website/api/quiz/cc-mobilitaets-check | jq '.title, (.questions | length)'
# Erwartet: "Mobilitäts-Check", 14

# 2) Session starten
SESSION=$(curl -s -X POST https://mopilot.website/api/quiz/cc-mobilitaets-check/start \
  -H 'Content-Type: application/json' \
  -d '{"referrer":"test","user_agent_class":"desktop"}' | jq -r '.session_id')
echo "Session: $SESSION"

# 3) Antwort senden
curl -s -X POST "https://mopilot.website/api/quiz/sessions/$SESSION/answer" \
  -H 'Content-Type: application/json' \
  -d '{"question_index":0,"selected_index":1}' | jq

# 4) Quiz abschließen (alle 14 Fragen vorher beantworten)
# (Schreib ein kleines Test-Skript dafür)

# 5) DB-Check
docker exec <postgres-container> psql -U mopilot -d mopilot -c \
  "SELECT count(*) FROM quiz_sessions; SELECT count(*) FROM quiz_events;"
```

- [ ] `GET /api/quiz/cc-mobilitaets-check` liefert 14 Fragen, OHNE `correct_index`-Felder
- [ ] `POST /start` setzt Cookie `mopilot_quiz_session` mit Domain `.mopilot.website`
- [ ] `POST /answer` speichert Event in `quiz_events` und liefert korrekten Erklärungstext
- [ ] `POST /complete` erzeugt E-Mail an `register@sharing-community.de` (in Maildir oder reale Inbox prüfen)
- [ ] `quiz_sessions.notification_sent = true` nach erfolgreichem Versand
- [ ] CORS-Header bei OPTIONS-Preflight korrekt (Origin `https://cc-kunden.mopilot.website` erlaubt)

**Git-Commit:** `feat(backend): quiz API endpoints, models, mail notification`

## STOP

**Bericht: alle Verifikationen grün? Welche Endpoints reagieren? Wo liegen die Test-E-Mails? Warte auf "weiter" vor Phase 2.**

---

# Phase 2 — Frontend Quiz-UI

**Ziel:** Funktionsfähige Quiz-Oberfläche unter cc-kunden.mopilot.website/quiz und /embed/quiz, im MoPilot-Design.

## Schritte

### 2.1 Verzeichnis-Strategie verifizieren

```bash
# Welches CC-Frontend-Verzeichnis wird gebaut?
grep -A 3 "cc-frontend:" /opt/mopilot/docker-compose.yml | grep context
```

Identifiziere das **Build-Verzeichnis** (vermutlich `MoPilot_CC_Kunden/frontend/`) und das **Entwicklungs-Verzeichnis** (vermutlich `cc-kunden/frontend/`). Alle Änderungen müssen in beiden Verzeichnissen erfolgen — andernfalls funktioniert die UI im Browser nicht (Docker baut nicht aus dem Entwicklungs-Verzeichnis).

### 2.2 Routing & Seiten

Erstelle in **beiden Verzeichnissen** (Pfade ab `frontend/`):

- `src/app/quiz/page.tsx` — Haupt-Quiz-Seite
- `src/app/embed/quiz/page.tsx` — iframe-fähige Variante (ohne Header/Footer der CC-Plattform)
- `src/app/quiz/layout.tsx` — schmaler Container, kein Login-Schutz

### 2.3 Quiz-Komponenten

Lege unter `src/components/quiz/` an (in beiden Verzeichnissen):

- `QuizContainer.tsx` — State-Management, fetched Definition vom main-backend, koordiniert Phasen (start → questions → result)
- `QuestionCard.tsx` — Einzelne Frage mit 4 Antwort-Buttons. Nach Klick: gewählte Antwort einfärben (rot bei falsch, grün bei richtig), korrekte Antwort grün hervorheben, Erklärungstext einblenden, "Nächste Frage"-Button erscheint
- `ProgressBar.tsx` — Animierte Petrol-Leiste oben, "Frage X von 14"
- `MotivationButton.tsx` — Wechselnder Text je nach Fortschritt (siehe Konzept §4.3)
- `ResultScreen.tsx` — Score-Anzeige, bei 14/14: Konfetti-Animation (CSS, ohne externe Lib) + Code `ECOBONUS26` + Button "Jetzt registrieren & 20h sichern" → cc.evemo.app/registration
- `CookieConsentBanner.tsx` — schmale Zeile "Wir speichern deinen Quiz-Fortschritt anonym in einem Cookie. [OK]"

### 2.4 API-Client

Lege `src/lib/quiz-api.ts` an mit Funktionen:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_QUIZ_API_BASE || 'https://mopilot.website';

export async function fetchQuiz(slug: string) { ... }      // GET /api/quiz/{slug}
export async function startSession(slug: string) { ... }    // POST /start, mit credentials: 'include'
export async function submitAnswer(...) { ... }
export async function completeQuiz(...) { ... }
```

Alle Aufrufe **mit `credentials: 'include'`** für Cookie-Übertragung.

### 2.5 Design

Verwende das Shared Design System:

- Farben: Primary Petrol/Teal `#14B8A6`, Accent Amber `#F59E0B`
- Fonts: Plus Jakarta Sans (Display), DM Sans (Body)
- Buttons: aus shared-ui (`@mopilot/shared-ui` falls als Package referenziert, sonst aus `/opt/mopilot/shared-ui/`)
- Antwort-Buttons: min. 56px Höhe, abgerundet 16px, Hover/Active-State, Tab-Index für Tastaturnavigation

### 2.6 Cookie-Lock-Logik

Beim Initial-Load auf `/quiz`:

1. Prüfe ob `mopilot_quiz_session` Cookie existiert
2. Falls ja: rufe `GET /api/quiz/sessions/{cookie}/state` auf
3. Backend liefert: `{ status: 'running' | 'completed' | 'expired', voucher_code? }`
4. Bei `completed`: zeige direkt Result-Screen mit dem bereits erhaltenen Code
5. Bei `running`: Resume-Möglichkeit oder Neustart anbieten
6. Bei `expired` oder kein Cookie: neue Session starten

(Falls dieser State-Endpoint in Phase 1 fehlt: ergänze ihn jetzt im main-backend.)

### 2.7 Embed-Variante

`/embed/quiz` rendert nur das Quiz selbst (keine Navigation, keine CC-Header/Footer), damit die Seite per `<iframe>` einbettbar ist. Setze CSP-Header so, dass die Einbettung in `sharing-community.de` erlaubt ist:

```
Content-Security-Policy: frame-ancestors https://sharing-community.de https://*.sharing-community.de;
```

Konfiguration im `next.config.js`.

### 2.8 Responsive Tests

Teste in Chrome DevTools Device-Mode:

- iPhone 12 (390 × 844)
- Galaxy S21 (360 × 800)
- iPad (768 × 1024)
- Desktop 1440 × 900

Auf Mobil: Sticky "Nächste Frage"-Button am unteren Rand.

### 2.9 Build & Deploy

```bash
cd /opt/mopilot
docker compose down
docker compose up -d --build cc-frontend
docker compose logs -f cc-frontend
```

## Verifikation

- [ ] `https://cc-kunden.mopilot.website/quiz` lädt das Quiz, zeigt Frage 1
- [ ] Falsche Antwort: rot markiert, korrekte Antwort grün hervorgehoben, Erklärung sichtbar
- [ ] Fortschrittsbalken aktualisiert sich nach jeder Frage
- [ ] Bei 14 richtigen Antworten: Code `ECOBONUS26` + Button zum evemo-Link
- [ ] Cookie `mopilot_quiz_session` ist im Browser gesetzt, Domain `.mopilot.website`, MaxAge ~30 Tage
- [ ] Erneuter Aufruf von `/quiz` mit gesetztem Cookie zeigt direkt das Ergebnis (Lock funktioniert)
- [ ] Mobile-Ansicht: Antwort-Buttons sind voll tap-bar, kein Overflow
- [ ] `https://cc-kunden.mopilot.website/embed/quiz` rendert ohne CC-Header/Footer
- [ ] Embed lässt sich testweise in einer lokalen HTML-Datei mit `<iframe>` von einem `localhost`-Server einbetten
- [ ] Lighthouse-Score auf Mobile ≥ 90 (Performance, Accessibility)

**Git-Commit:** `feat(cc-frontend): quiz player UI with progress, motivation, embed variant`

## STOP

**Demonstriere den Anwender den Quiz-Flow per Screenshot oder Browser-Test. Warte auf "weiter" vor Phase 3.**

---

# Phase 3 — Admin-Dashboard

**Ziel:** Statistik-Sicht im Hauptsystem unter `/admin/quiz-stats`, geschützt durch Rolle Plattform-Support oder höher.

## Schritte

### 3.1 Stats-API-Endpoints

Erweitere `/opt/mopilot/backend/app/routers/quiz.py` (oder eigener `quiz_stats.py`-Router) um:

| Methode | Pfad | Auth |
|---------|------|------|
| GET | `/api/quiz/stats/overview?from=&to=` | Plattform-Support+ |
| GET | `/api/quiz/stats/funnel?slug=&from=&to=` | Plattform-Support+ |
| GET | `/api/quiz/stats/answer-heatmap?slug=&from=&to=` | Plattform-Support+ |
| GET | `/api/quiz/stats/export.csv?slug=&from=&to=` | Plattform-Support+ |

**Auth:** Bestehender Auth-Decorator des main-backend wiederverwenden (vermutlich `Depends(require_role("plattform-support"))`).

**Datenstruktur Overview:**

```json
{
  "sessions_total": 1234,
  "sessions_completed": 678,
  "completion_rate": 0.549,
  "avg_score": 11.3,
  "vouchers_issued": 678,
  "by_device": { "mobile": 456, "desktop": 700, "tablet": 78 },
  "by_referrer": { "sharing-community.de": 800, "direct": 400, "other": 34 }
}
```

**Datenstruktur Funnel:**

```json
{
  "questions": [
    { "index": 0, "reached": 1200, "answered_correct": 1100, "abandoned": 50 },
    { "index": 1, "reached": 1150, "answered_correct": 920, "abandoned": 80 }
    /* ... */
  ]
}
```

**Datenstruktur Heatmap:**

```json
{
  "questions": [
    {
      "index": 0,
      "question": "Wie funktioniert die Erstattung im Tarif 'CC eco'?",
      "correct_index": 1,
      "answers": [
        { "index": 0, "text": "Keine Erstattung möglich", "count": 120 },
        { "index": 1, "text": "Teil der Grundgebühr...", "count": 800 },
        { "index": 2, "text": "Man erhält Bargeld zurück", "count": 60 },
        { "index": 3, "text": "Die Folgemonatsgebühr entfällt", "count": 220 }
      ]
    }
  ]
}
```

### 3.2 Frontend-Seite im Hauptsystem

Lege `/opt/mopilot/frontend/src/app/admin/quiz-stats/page.tsx` an. Komponenten unter `src/components/quiz-stats/`:

- `KpiCards.tsx` — 4 Kacheln (Aufrufe, Abschlussquote, Avg Score, Codes)
- `FunnelChart.tsx` — Recharts BarChart, x-Achse = Frage 1–14, gestapelt: erreicht / korrekt / abgebrochen
- `AnswerHeatmap.tsx` — HTML-Tabelle, Zellen mit Hintergrund-Opacity proportional zur Häufigkeit, ✓-Marker bei korrekter Antwort
- `FilterBar.tsx` — Datepicker (von/bis), Geräte-Dropdown, Referrer-Dropdown
- `ExportButton.tsx` — CSV-Download

### 3.3 Rollen-Schutz

In `page.tsx`:

```typescript
const session = await getServerSession(authOptions);
if (!session) redirect('/login');
const allowedRoles = ['plattform-support', 'projekttraeger', 'fahrzeugsteller', 'validierungsstelle'];
if (!allowedRoles.includes(session.user.role)) {
  return <div>Zugriff verweigert</div>;
}
```

### 3.4 Build & Deploy

```bash
cd /opt/mopilot
docker compose up -d --build main-backend main-frontend
```

## Verifikation

- [ ] `/admin/quiz-stats` ist als Plattform-Support sichtbar
- [ ] Als Endkunde: 403 / Zugriff verweigert
- [ ] KPI-Kacheln zeigen plausible Werte (entweder Echtdaten oder Test-Sessions aus Phase 1/2)
- [ ] Trichter-Diagramm rendert korrekt mit 14 Balken
- [ ] Heatmap-Tabelle zeigt korrekte Antwort mit ✓
- [ ] CSV-Export öffnet sich in Excel mit Spalten Session-ID, Datum, Score, Gerät, Referrer
- [ ] Filter-Leiste reduziert die KPIs entsprechend (z. B. nur Mobile)

**Git-Commit:** `feat(main-frontend, backend): quiz stats dashboard with filters and CSV export`

## STOP

**Zeige Screenshot des Dashboards oder beschreibe die KPI-Werte. Warte auf "weiter" vor Phase 4.**

---

# Phase 4 — Polish & Go-Live

**Ziel:** Produktions-Reife. Soft-Launch, Monitoring, Cut-over von der alten Quiz-Seite.

## Schritte

### 4.1 End-to-End-Tests

- Komplettes Quiz auf 3 Geräten durchspielen (Mobile, Desktop, Tablet)
- E-Mail-Empfang an register@sharing-community.de mehrfach prüfen
- Cookie-Verhalten: 30-Tage-Lock testen (Datum manipulieren oder Cookie-Edit)
- Embed-Variante in einer Test-HTML-Datei einbetten
- Stats-Dashboard nach mehreren Test-Durchläufen aktualisieren

### 4.2 Performance & Polish

- Konfetti-Animation: CSS-only (z. B. mit `@keyframes` und absolut positionierten div-Particles)
- Lighthouse: ≥ 90 Performance, Accessibility, SEO auf Mobile
- Bilder: WebP, lazy loaded, korrekte Größen
- Mikro-Interaktionen: Button-Hover, Card-Tap-Feedback
- Konsistenz: Alle Texte du-Form, keine Anglizismen wo deutsche Begriffe natürlich sind

### 4.3 Uptime-Kuma-Monitor

Im Uptime-Kuma (SSH-Tunnel auf localhost:3001) zwei neue Monitore anlegen:

- **mopilot-quiz-api** — HTTP, `https://mopilot.website/api/quiz/cc-mobilitaets-check`, Status 200, alle 5 Min
- **cc-quiz-frontend** — HTTP, `https://cc-kunden.mopilot.website/quiz`, Status 200, alle 5 Min

### 4.4 Soft-Launch

1. Quiz auf cc-kunden.mopilot.website/quiz öffentlich, sharing-community.de bleibt zunächst auf alter Variante
2. **5–7 Tage Beobachtungsfenster:**
   - Stats-Dashboard checken (täglich)
   - E-Mail-Empfang (täglich)
   - Uptime-Kuma-Alarme (kein Alert sollte aufgetreten sein)
   - Vergleichsmetriken: alte vs. neue Quiz-Conversion

### 4.5 Cut-over (nach Beobachtungsfenster)

Optionen für den Übergang von sharing-community.de:

- **Option A — iframe:** Auf sharing-community.de/quiz/ wird `<iframe src="https://cc-kunden.mopilot.website/embed/quiz" />` eingebettet (CSP wurde in Phase 2 vorbereitet)
- **Option B — Redirect:** sharing-community.de/quiz/ leitet per HTTP 302 auf cc-kunden.mopilot.website/quiz um

Empfehlung: Option A für nahtlosen Übergang, Option B falls die WordPress-Seite das nicht unterstützt.

### 4.6 Dokumentations-Update

- `/opt/mopilot/MoPilot_Prototype_v1.1.md` — neue Sektion "Quiz" einfügen
- `SKILL.md` für Claude (`/mnt/skills/user/mopilot-project-knowledge/SKILL.md` lokal beim Anwender) — Quiz-Routen, neue Tabellen, Empfänger-Adresse
- README.md im Repo — Kurz-Beschreibung des Quiz-Features

### 4.7 Git-Tag & Merge

```bash
cd /opt/mopilot
git checkout master
git merge feat/cc-quiz --no-ff
git tag -a v1.2 -m "feat: CC Quiz migration & expanded analytics"
git push origin master --tags
```

## Verifikation

- [ ] Lighthouse-Mobile ≥ 90 in allen Kategorien
- [ ] Beide Uptime-Kuma-Monitore grün, > 99% Uptime über das Beobachtungsfenster
- [ ] Mindestens 10 Test-Sessions im Stats-Dashboard sichtbar
- [ ] Mindestens 5 Notifications an register@sharing-community.de empfangen
- [ ] sharing-community.de/quiz/ leitet/embedded auf cc-kunden.mopilot.website/quiz
- [ ] Doku in MoPilot_Prototype_v1.x.md aktualisiert
- [ ] Git-Tag v1.2 gesetzt und gepusht

**Git-Commit:** `chore: docs and monitoring for quiz feature, v1.2`

## STOP — Go-Live abgeschlossen

**Schlussbericht an den Anwender:**

- Anzahl Sessions in der Beobachtungswoche
- Conversion-Rate (Abschluss / Aufrufe)
- Anzahl ausgegebener Codes
- Hinweise auf auffällige Abbruchquoten an einzelnen Fragen
- Empfehlung für Folge-Phase 5 (z. B. individuelle Codes, Admin-UI für Frage-Bearbeitung, ZEO-Variante)

---

## Anhang A — Datei-Übersicht (was wird angelegt/geändert)

### Backend (`/opt/mopilot/backend/`)

```
app/
  models/quiz.py                          [neu]
  schemas/quiz.py                         [neu]
  routers/quiz.py                         [neu]
  routers/quiz_stats.py                   [neu, in Phase 3]
  services/quiz_mail.py                   [neu]
  main.py                                 [Router registrieren, CORS-Origins erweitern]
alembic/versions/<ts>_add_quiz_tables.py  [neu, falls Alembic]
scripts/seed_cc_quiz.py                   [neu]
```

### Frontend CC-Player — IN BEIDEN VERZEICHNISSEN!

```
# /opt/mopilot/cc-kunden/frontend/   UND   /opt/mopilot/MoPilot_CC_Kunden/frontend/
src/
  app/quiz/page.tsx                       [neu]
  app/quiz/layout.tsx                     [neu]
  app/embed/quiz/page.tsx                 [neu]
  components/quiz/QuizContainer.tsx       [neu]
  components/quiz/QuestionCard.tsx        [neu]
  components/quiz/ProgressBar.tsx         [neu]
  components/quiz/MotivationButton.tsx    [neu]
  components/quiz/ResultScreen.tsx        [neu]
  components/quiz/CookieConsentBanner.tsx [neu]
  lib/quiz-api.ts                         [neu]
next.config.js                            [CSP-frame-ancestors für /embed/quiz]
```

### Frontend Hauptsystem (`/opt/mopilot/frontend/`)

```
src/
  app/admin/quiz-stats/page.tsx           [neu]
  components/quiz-stats/KpiCards.tsx      [neu]
  components/quiz-stats/FunnelChart.tsx   [neu]
  components/quiz-stats/AnswerHeatmap.tsx [neu]
  components/quiz-stats/FilterBar.tsx     [neu]
  components/quiz-stats/ExportButton.tsx  [neu]
  lib/quiz-stats-api.ts                   [neu]
```

---

## Anhang B — Sicherheits-Checkliste

- [ ] Keine API-Keys, Passwörter oder Tokens in Commits oder Chat-Ausgaben
- [ ] `.env`-Dateien werden nicht modifiziert ohne Rückfrage
- [ ] CORS exposed nur die Quiz-Routen, nicht alle Endpoints
- [ ] SQL-Queries via SQLAlchemy ORM (keine String-Konkatenation)
- [ ] Pydantic-Validierung auf allen POST-Bodies
- [ ] User-Agent wird klassifiziert gespeichert (mobile/desktop/tablet), NICHT der volle UA-String
- [ ] IP-Adressen werden NICHT gespeichert
- [ ] E-Mail-Notification enthält keine Klartext-Personendaten
- [ ] Stats-Endpoints sind durch Rollen-Check geschützt

---

*Bei Unklarheiten oder unerwarteten Komplikationen: STOPPE und frage den Anwender. Lieber einmal mehr nachfragen als eine falsche Architekturentscheidung.*
