# Claude-Code-Prompt: Dokumentations-Update CC-Quiz-Feature

> **Ziel:** Alle Dokumentationen, die durch das CC-Quiz-Feature (Migration & Erweiterung, Phasen 0–4) inhaltlich veraltet sind, auf den aktuellen Stand bringen.
>
> **Voraussetzung:** Phasen 0–4 des Quiz-Features sind abgeschlossen, Branch `feat/cc-quiz` gemergt nach `master`, Push erfolgt.
>
> **Anwendung:** Lade dieses Dokument in Claude Code mit `@cc-quiz-doku-update-prompt.md` und arbeite die Phasen nacheinander ab. **Stoppe nach jeder Phase** und warte auf "weiter".

---

## Kontext: Was wurde in Phasen 0–4 umgesetzt?

Das Quiz-Feature führt folgende neue Bausteine in MoPilot ein. Jeder Punkt unten ist ein Doku-relevanter Inhalt, der überall dort auftauchen muss, wo bereits über das jeweilige Thema dokumentiert wird:

**Neue URLs / Routen**
- `https://cc-kunden.mopilot.website/quiz` — Quiz-Player (öffentlich)
- `https://cc-kunden.mopilot.website/embed/quiz` — iframe-fähige Variante
- `https://mopilot.website/admin/quiz-stats` — Admin-Dashboard (Plattform-Support+)
- Verlinkung im Betreiber-Dashboard: `https://mopilot.website/dashboard/betreiber` → "CC Carsharing Quiz mit Gutschein"

**Neue API-Endpoints (main-backend, `https://api.mopilot.website`)**
- `GET  /api/quiz/{slug}` — Quiz-Definition ohne `correct_index`
- `POST /api/quiz/{slug}/start` — Session erzeugen, Cookie setzen
- `POST /api/quiz/sessions/{id}/answer` — Antwort speichern
- `POST /api/quiz/sessions/{id}/complete` — Quiz abschließen, Code, E-Mail
- `POST /api/quiz/sessions/{id}/abandon` — Beacon (sendBeacon)
- `GET  /api/quiz/sessions/{id}/state` — Session-Status (running/completed/expired)
- `GET  /api/quiz/stats/overview` — KPIs (Plattform-Support+)
- `GET  /api/quiz/stats/funnel` — Trichter pro Frage
- `GET  /api/quiz/stats/answer-heatmap` — Antwortverteilung
- `GET  /api/quiz/stats/export.csv` — CSV-Export

**Neue DB-Tabellen (mopilot-DB)**
- `quiz_definitions` (slug, title, operator, voucher_code, voucher_label, registration_url, notification_email, questions_json, is_active, …)
- `quiz_sessions` (id = Cookie-UUID, quiz_id, started_at, completed_at, abandoned_at, correct_count, total_count, referrer, user_agent_class, notification_sent)
- `quiz_events` (BIGSERIAL, session_id, question_index, selected_index, is_correct, event_type, timestamp)

**Cookies & Auth**
- Cookie `mopilot_quiz_session`, Domain `.mopilot.website`, Max-Age 30 Tage, SameSite=Lax, Secure, HttpOnly=false
- 30-Tage-Soft-Lock: Wiederkehr zeigt bestehenden Code, generiert keinen neuen
- Dashboard-Schutz: Rollen Plattform-Support, Projektträger, Fahrzeugsteller, Validierungsstelle

**Externe Schnittstellen**
- E-Mail-Notification an `register@sharing-community.de` bei jedem erfolgreichen Quiz-Abschluss (anonymisiert: Session-UUID, Score, Dauer, Geräteklasse, Referrer)
- Versand asynchron über IONOS SMTP (`smtp.ionos.de:587`)
- Gutscheincode statisch: `ECOBONUS26` (20 Stunden Startguthaben), Ziel-URL `https://cc.evemo.app/registration`
- CSP `frame-ancestors` erlaubt Einbettung von `https://sharing-community.de`

**Quiz-Inhalt**
- 14 Fragen in 8 Kategorien (TARIFE, EIGNUNG, VORAUSSETZUNGEN, REGISTRIERUNG, VORTEILE, UMWELT, BUCHUNG, NUTZUNG, GEMEINSCHAFT, FINANZEN)
- Slug `cc-mobilitaets-check`, Operator `CC`
- Architektur Multi-Quiz-fähig (ZEO-Variante vorbereitet, aber nicht implementiert)

**Architektur-Hinweis (wichtig für Doku)**
- Quiz-Logik läuft im **main-backend**, nicht im stateless cc-backend
- Cross-Origin-Aufruf vom cc-frontend → main-backend mit `credentials: 'include'`
- Build-Arg `NEXT_PUBLIC_QUIZ_API_BASE` im CC-Frontend-Dockerfile (Default `https://api.mopilot.website`)

---

## Globale Verhaltensregeln

- **Sprache:** Deutsche UI-Texte / deutsche Doku, du-Form. Code-Beispiele auf Englisch.
- **Versionierung:** Doku-Update wird Versionsstand **v1.2** der Plattform widerspiegeln.
- **Branch:** Neuer Branch `docs/quiz-v1.2` von `master` abzweigen.
- **Sicherheit:** Keine API-Keys, Tokens oder Passwörter in der Doku.
- **Stand-Datum:** Heute (`date +"%d. %B %Y"`).
- **Verifikation:** Jede Phase hat explizite Kriterien.

---

# Phase 0 — Bestandsaufnahme

**Ziel:** Klares Bild, welche Doku-Dateien existieren und wo. Erst dann gezielt schreiben.

## Schritte

### 0.1 Branch anlegen

```bash
cd /opt/mopilot
git fetch origin
git checkout master
git pull origin master
git checkout -b docs/quiz-v1.2
```

### 0.2 Doku-Dateien im Repo finden

```bash
cd /opt/mopilot

# Alle Markdown-Dateien im Repo-Root + ein Level tiefer
find . -maxdepth 3 -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./*/node_modules/*" 2>/dev/null | sort

# Spezifisch nach den vermuteten Hauptdateien suchen
ls -la MoPilot_Prototype_v*.md README.md CLAUDE.md 2>/dev/null

# Skill-Dateien (falls im Repo gepflegt)
find . -maxdepth 4 -name "SKILL.md" 2>/dev/null
```

Notiere:

- Existiert `MoPilot_Prototype_v1.1.md`? Welche Versionen liegen vor?
- Gibt es ein `CLAUDE.md` im Repo-Root (für Claude Code)?
- Gibt es separate READMEs in `backend/`, `frontend/`, `cc-kunden/frontend/`, `MoPilot_CC_Kunden/`?
- Liegen Skill-Dateien im Repo (z. B. `.claude/skills/` oder `docs/skills/`)?
- Gibt es ein Diagramm-Verzeichnis (`docs/diagrams/`, `docs/architecture/`)?

### 0.3 Inhalte prüfen — was steht zum Quiz noch nicht drin?

```bash
# Quick-Check: Erwähnt eine bestehende Doku schon "quiz"?
grep -ril "quiz\|Quiz\|ECOBONUS\|Mobilit.ts-Check" \
  --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  /opt/mopilot/ 2>/dev/null
```

Erwartet: nichts oder nur die Planungs-Docs (`cc-quiz-implementation-prompt.md`, `cc-quiz-konzept.docx`). Falls bestehende Hauptdokumentation schon Quiz-Treffer hat, lies die jeweiligen Stellen und prüfe, ob sie konsistent zum aktuellen Implementierungsstand sind.

### 0.4 Versions-Header der Hauptdokumente lesen

```bash
head -30 /opt/mopilot/MoPilot_Prototype_v1.1.md 2>/dev/null
head -30 /opt/mopilot/README.md 2>/dev/null
head -30 /opt/mopilot/CLAUDE.md 2>/dev/null
```

So bekommst du den exakten Stil-Kontext: Versionsschema, Datumsformat, Kapitelnummerierung.

## Verifikation

- [ ] Branch `docs/quiz-v1.2` aktiv
- [ ] Liste aller Doku-Dateien (Pfad, ungefähre Zeilenzahl, letztes Update) ist erstellt
- [ ] Identifiziert: welches ist die "Hauptdokumentation"? (vermutlich `MoPilot_Prototype_v1.1.md`)
- [ ] Klar, ob Skill-Files im Repo gepflegt werden oder nur als Project-Files in claude.ai
- [ ] Bestehende Doku enthält noch keine Quiz-Inhalte (oder Stellen sind identifiziert)

## STOP

**Berichte dem Anwender die gefundene Doku-Struktur als Tabelle (Pfad · Zweck · Update-Bedarf · ungefähre Zeilen). Erst auf "weiter" Phase 1 starten.**

---

# Phase 1 — Hauptdokumentation: Prototyp-Doc auf v1.2

**Ziel:** `MoPilot_Prototype_v1.1.md` wird zur `MoPilot_Prototype_v1.2.md` mit vollständigem Quiz-Kapitel.

## Schritte

### 1.1 Datei kopieren und Versionsstempel setzen

```bash
cd /opt/mopilot
cp MoPilot_Prototype_v1.1.md MoPilot_Prototype_v1.2.md
```

Aktualisiere im neuen File:

- Titel und Versionsbezeichnung: `v1.1` → `v1.2`
- Datum: heute
- Im Inhaltsverzeichnis ein neues Top-Level-Kapitel **"20. Quiz-Feature (Mobilitäts-Check)"** ergänzen (bzw. die nächste freie Kapitelnummer im bestehenden Doc)

### 1.2 Neues Kapitel "Quiz-Feature" schreiben

Strukturiere das Kapitel parallel zum existierenden Stil der Doku. Folgender Aufbau ist Pflicht-Inhalt:

**20.1 Übersicht & Zweck**
- Was: 14-Fragen-Quiz auf cc-kunden.mopilot.website/quiz, Migration von sharing-community.de/quiz/
- Warum: Tracking-Lücke schließen — jeder erfolgreiche Abschluss wird gemeldet, unabhängig davon ob der Code eingelöst wird
- Zielgruppe: CC-Interessenten, Stationspaten, Vorstand (über Dashboard)

**20.2 Architektur**
- Diagramm in ASCII oder Mermaid: Browser → cc-frontend → main-backend → mopilot-DB
- Wichtig: Quiz-Logik im **main-backend** (das ist der DB-Anker), cc-backend bleibt stateless
- Cookie-Domain `.mopilot.website` für Subdomain-übergreifende Sessions

**20.3 Datenmodell**
- Drei neue Tabellen mit kompletter Spaltenliste (Typen, Constraints, Indizes)
- Beziehungen: quiz_sessions.quiz_id → quiz_definitions, quiz_events.session_id → quiz_sessions
- Format identisch zum bestehenden Stil der Doku (Markdown-Tabellen)

**20.4 API-Referenz**
- 6 Quiz-Endpoints + 4 Stats-Endpoints
- Pro Endpoint: Methode, Pfad, Auth, Request-Body-Schema, Response-Schema, Status-Codes
- CORS-Hinweis: cc-kunden.mopilot.website ist erlaubter Origin, allow_credentials=True

**20.5 Frontend-Komponenten**
- Liste der Quiz-Komponenten unter `src/components/quiz/`: QuizContainer, QuestionCard, ProgressBar, MotivationButton, ResultScreen, CookieConsentBanner
- Hinweis: Dateien existieren in **beiden** CC-Frontend-Verzeichnissen (`cc-kunden/frontend/` + `MoPilot_CC_Kunden/frontend/`)
- Admin-Dashboard-Komponenten unter `frontend/app/admin/quiz-stats/`

**20.6 Cookie & Tracking**
- Cookie `mopilot_quiz_session`: Domain, Max-Age, Flags
- Was wird getrackt: anonymisiert (UUID, Geräteklasse, Referrer, Score)
- Was NICHT: IP-Adresse, voller User-Agent, Personenbezug
- DSGVO-Hinweis: Cookie-Banner einmalig, Funktionscookie

**20.7 E-Mail-Notification**
- Empfänger: `register@sharing-community.de`
- SMTP: IONOS, asynchron via FastAPI BackgroundTasks
- Inhalt der E-Mail: anonymisierte Metriken (Beispiel-Body abdrucken)

**20.8 Admin-Dashboard**
- URL `/admin/quiz-stats`, Rollen-Schutz
- Vier Bereiche: KPI-Kacheln, Trichter, Heatmap, CSV-Export
- Filter: Zeitraum, Gerät, Referrer
- Verlinkt aus dem Betreiber-Dashboard unter `/dashboard/betreiber`

**20.9 Quiz-Inhalt (14 Fragen)**
- Tabelle mit allen 14 Fragen, Kategorien und korrekten Antworten als Anhang
- Quelle: `quiz_definitions.questions_json` für Slug `cc-mobilitaets-check`
- Hinweis: Bearbeitung aktuell nur via DB-Update (Admin-UI für Inhalts-Pflege ist Folge-Phase)

**20.10 Operative Hinweise**
- Build-Arg `NEXT_PUBLIC_QUIZ_API_BASE` im CC-Frontend-Dockerfile
- Middleware-Ausnahme: `/quiz` und `/embed` ohne Login erreichbar
- Embed-CSP: `frame-ancestors` erlaubt sharing-community.de
- Uptime-Kuma-Monitore: noch ausstehend (Phase 4 des Implementation-Plans)

**20.11 Bekannte Einschränkungen / Folge-Phasen**
- Statischer Code ECOBONUS26 — individuelle Codes als Folge-Phase möglich
- ZEO-Variante: Architektur vorbereitet, Inhalte noch zu erarbeiten
- Frage-Bearbeitung: aktuell nur per DB, Admin-UI als Folge-Phase
- A/B-Testing: nicht enthalten

### 1.3 Bestehende Kapitel punktuell aktualisieren

Folgende bestehende Stellen brauchen kleine Updates:

**Kapitel "Architektur-Übersicht / Services"**
- main-backend hat jetzt zusätzlich Quiz-Routes
- Hinweis ergänzen: Quiz-Logik im main-backend, cc-backend weiterhin stateless

**Kapitel "Datenbank-Schema mopilot-DB"**
- Drei neue Tabellen ergänzen
- Beziehungs-Diagramm oder -Liste aktualisieren

**Kapitel "API-Routing / CORS"**
- Origin `cc-kunden.mopilot.website` mit allow_credentials=True ergänzen

**Kapitel "Cookies & Sessions"**
- Cookie `mopilot_quiz_session` erwähnen, Domain `.mopilot.website`

**Kapitel "Versionshistorie" / "Release Notes"**
- Neuer Abschnitt **v1.2 (heute)** mit Stichpunkten

**Kapitel "URL-Übersicht / Plattformen"**
- `cc-kunden.mopilot.website/quiz`, `/embed/quiz`, `mopilot.website/admin/quiz-stats` ergänzen

**Kapitel "DNS / Domain-Setup"** (falls vorhanden)
- Keine Änderung nötig (Quiz nutzt bestehende Subdomains)

### 1.4 Anhang Quiz-Fragen extrahieren

Hilfsskript zum Extrahieren der Fragen aus der DB:

```bash
docker exec <postgres-container> psql -U mopilot -d mopilot -c "
SELECT jsonb_pretty(questions_json)
FROM quiz_definitions
WHERE slug = 'cc-mobilitaets-check';
" > /tmp/quiz_questions.json

# Als Markdown-Tabelle umformatieren und am Ende des neuen Kapitels einfügen
```

### 1.5 Verifikation der Inhalte

```bash
# Sicherstellen dass alle 14 Fragen dokumentiert sind
grep -c "category" MoPilot_Prototype_v1.2.md  # ≥ 14

# Sicherstellen dass alle 10 Endpoints dokumentiert sind
grep -c "/api/quiz/" MoPilot_Prototype_v1.2.md  # ≥ 10

# Sicherstellen dass alle 3 Tabellen dokumentiert sind
grep -c "quiz_definitions\|quiz_sessions\|quiz_events" MoPilot_Prototype_v1.2.md  # ≥ 3
```

## Verifikation

- [ ] `MoPilot_Prototype_v1.2.md` existiert, Header zeigt v1.2 und heutiges Datum
- [ ] Inhaltsverzeichnis enthält neues Kapitel "Quiz-Feature"
- [ ] Alle 11 Unterkapitel (20.1 – 20.11) sind ausgefüllt, kein Platzhalter
- [ ] Alle 10 API-Endpoints sind als Tabelle dokumentiert
- [ ] Alle 3 Tabellen-Schemas sind vollständig
- [ ] Anhang mit 14 Quiz-Fragen ist enthalten
- [ ] Bestehende Kapitel (Architektur, DB-Schema, API, Cookies, Versionshistorie, URL-Übersicht) sind ergänzt
- [ ] `MoPilot_Prototype_v1.1.md` bleibt als historischer Referenzstand erhalten

**Git-Commit:** `docs: MoPilot Prototype v1.2 with quiz feature chapter`

## STOP

**Liste dem Anwender die wichtigsten Stellen, wo bestehende Kapitel angefasst wurden. Warte auf "weiter" vor Phase 2.**

---

# Phase 2 — README & CLAUDE.md im Repo-Root

**Ziel:** Repo-Einstiegspunkte (README für Menschen, CLAUDE.md für Claude Code) zeigen das Quiz-Feature.

## Schritte

### 2.1 README.md aktualisieren

Falls `README.md` existiert:

- **Feature-Liste / Überblick** ergänzen: "CC Mobilitäts-Check – interaktives 14-Fragen-Quiz mit anonymem Tracking und Admin-Dashboard"
- **Plattform-Tabelle** ergänzen mit den drei neuen URLs
- **Architektur-Diagramm** (falls vorhanden) — Hinweis auf neue Routen im main-backend ergänzen
- **Versionsstand** auf v1.2 setzen

### 2.2 CLAUDE.md im Repo-Root aktualisieren

Falls `CLAUDE.md` im Repo existiert (Claude-Code-Konfiguration für das Projekt):

- **Wichtige Pfade** ergänzen:
  - `backend/app/api/quiz.py`, `backend/app/api/quiz_stats.py`
  - `backend/app/models/quiz.py`, `backend/app/schemas/quiz.py`
  - `backend/app/services/quiz_mail.py`
  - `cc-kunden/frontend/src/components/quiz/` UND `MoPilot_CC_Kunden/frontend/src/components/quiz/`
  - `cc-kunden/frontend/src/lib/quiz-api.ts` (in beiden Verzeichnissen)
  - `frontend/app/admin/quiz-stats/page.tsx`
- **Kritische Konventionen** ergänzen (eine Zeile pro Punkt):
  - Quiz-Logik im **main-backend**, nicht im cc-backend (cc-backend bleibt stateless)
  - CC-Frontend-Änderungen IMMER in beiden Verzeichnissen pflegen (cc-kunden/frontend + MoPilot_CC_Kunden/frontend)
  - Cookie-Domain `.mopilot.website` für subdomain-übergreifenden 30-Tage-Soft-Lock
  - CORS: `allow_credentials=True` und Origin `https://cc-kunden.mopilot.website`
  - Admin-Dashboard `/admin/quiz-stats` ist rollengeschützt (Plattform-Support+)
- **Aktive Projekt-Version**: v1.2

### 2.3 Sub-READMEs prüfen

Falls in den Unterverzeichnissen READMEs liegen, ergänzen:

- `backend/README.md` — Quiz-Module-Übersicht
- `frontend/README.md` — Admin-Dashboard-Route
- `cc-kunden/frontend/README.md` — Quiz-Routen
- `MoPilot_CC_Kunden/README.md` — analog

Falls nicht vorhanden: NICHT neu anlegen (out-of-scope).

## Verifikation

- [ ] README.md im Repo-Root erwähnt das Quiz-Feature in Feature-Liste und URL-Übersicht
- [ ] CLAUDE.md (falls vorhanden) enthält die neuen Pfade und Konventionen
- [ ] Versionsstand v1.2 in beiden Dateien
- [ ] Sub-READMEs (falls vorhanden) sind ergänzt

**Git-Commit:** `docs: README and CLAUDE.md updated for quiz v1.2`

## STOP

**Warte auf "weiter" vor Phase 3.**

---

# Phase 3 — Skill-Datei für Claude.ai-Project

**Ziel:** Die `mopilot-project-knowledge` SKILL-Datei (sowohl im Repo gepflegt als auch als Project-File in claude.ai) wird so aktualisiert, dass Claude in zukünftigen Konversationen automatisch das Quiz-Feature kennt und korrekt anwendet.

## Vorgehen

Es gibt zwei mögliche Speicherorte für die SKILL.md:

1. **Im Repo gepflegt** (z. B. `docs/skills/mopilot-project-knowledge.md` oder `.claude/skills/`) — dann hier ändern und committen
2. **Nur als Project-File in claude.ai** — dann erstellen wir die aktualisierte Version als Datei im Repo zum Hochladen, und der Anwender lädt sie manuell hoch

Aus der Bestandsaufnahme in Phase 0 ist klar, welcher Fall vorliegt.

## Schritte

### 3.1 Aktualisierte SKILL.md erstellen

Lege an: `/opt/mopilot/docs/skills/mopilot-project-knowledge.md` (falls noch nicht vorhanden) oder editiere die existierende Variante. Verwende den bestehenden Stil als Vorlage. Inhaltliche Updates:

**Im Frontmatter / Header**
- Versionsstempel auf v1.2 + heutiges Datum

**Abschnitt "Quick Reference / Platforms"** — Tabelle erweitern um:

| Platform | URL | Function |
|----------|-----|----------|
| Quiz Player | https://cc-kunden.mopilot.website/quiz | 14-Fragen-Mobilitäts-Check mit Code-Ausgabe |
| Quiz Embed | https://cc-kunden.mopilot.website/embed/quiz | iframe-fähige Variante für sharing-community.de |
| Quiz Stats Dashboard | https://mopilot.website/admin/quiz-stats | KPIs, Trichter, Heatmap, CSV-Export |

**Abschnitt "Key Server Paths"** — ergänzen:

| System | Path |
|--------|------|
| Quiz-Module Backend | `/opt/mopilot/backend/app/api/quiz.py`, `quiz_stats.py`, `app/models/quiz.py`, `app/services/quiz_mail.py` |
| Quiz-Komponenten CC-Frontend | `/opt/mopilot/cc-kunden/frontend/src/components/quiz/` (Entwicklung) + `/opt/mopilot/MoPilot_CC_Kunden/frontend/src/components/quiz/` (Docker-Build) |
| Quiz Stats Frontend | `/opt/mopilot/frontend/app/admin/quiz-stats/page.tsx` |

**Abschnitt "Databases"** — bei `mopilot` ergänzen: "Users, Stations, Vehicles, Tariffs, FAQs, ChatMessages, **Quiz (definitions, sessions, events)**"

**Neuer Abschnitt: "Quiz Architecture"** (analog zur bestehenden CC-Kunden-Tarif-Architektur)

```markdown
## Quiz-Architektur (CC Mobilitäts-Check)

**Ziel:** Spielerischer Wissens-Check mit Gutschein-Ausgabe + anonymes Tracking.

### Wichtige Eckpunkte

- Quiz-Logik läuft im **main-backend** (das hat die mopilot-DB-Anbindung).
  Das cc-backend bleibt stateless (nur KI-Chat-Proxy).
- Quiz-Frontend (cc-frontend) ruft das main-backend per CORS auf:
  Origin `https://cc-kunden.mopilot.website` ist whitelisted, `allow_credentials=True`.
- Cookie-Domain `.mopilot.website` ermöglicht subdomain-übergreifenden 30-Tage-Soft-Lock.

### Fundstellen für häufige Aufgaben

| Aufgabe | Datei |
|---------|-------|
| Quiz-Endpoints anpassen | backend/app/api/quiz.py |
| Stats-Endpoints anpassen | backend/app/api/quiz_stats.py |
| Quiz-Inhalt (14 Fragen) ändern | DB: quiz_definitions.questions_json WHERE slug='cc-mobilitaets-check' |
| Player-UI ändern | cc-kunden/frontend/src/components/quiz/ + MoPilot_CC_Kunden/... (BEIDES!) |
| Dashboard-UI ändern | frontend/app/admin/quiz-stats/page.tsx |
| Cookie-Verhalten | backend/app/api/quiz.py (set_cookie-Aufrufe) |
| E-Mail-Inhalt | backend/app/services/quiz_mail.py |

### Lessons Learned

- **Zwei CC-Frontend-Verzeichnisse synchron halten** — gilt auch für Quiz-Komponenten.
- **Build-Arg `NEXT_PUBLIC_QUIZ_API_BASE`** muss im Dockerfile durchgereicht werden (Default `https://api.mopilot.website`).
- **Middleware-Ausnahme** für `/quiz` zusätzlich zu `/embed/*` nötig — sonst Login-Redirect.
- **CSP frame-ancestors** im next.config.js erlaubt sharing-community.de.
- **Statischer Code ECOBONUS26** in Phase 1; individuelle Codes als Folge-Phase abgegrenzt.
- **Notification-Empfänger** in `quiz_definitions.notification_email` konfigurierbar — keine Code-Änderung für Empfängerwechsel nötig.
```

**Abschnitt "Version History"** — neue Zeile:

```
| v1.2 | <heutiges Datum> | CC Quiz Migration & Analytics — 14-Fragen-Mobilitäts-Check, anonymes Tracking, Admin-Dashboard mit Trichter und Heatmap, E-Mail-Notification an register@sharing-community.de, Embed-Variante für sharing-community.de |
```

**Abschnitt "Full Documentation" am Ende** — Verweis auf das neue Hauptdokument:

```
→ MoPilot_Prototype_v1.2.md (statt v1.1)
```

### 3.2 Versions-Hinweis fürs Hochladen

Wenn die SKILL.md im Repo gepflegt ist: committen, der Anwender muss zusätzlich die aktualisierte Datei manuell als Project-File in claude.ai hochladen, damit zukünftige Konversationen den neuen Stand sehen. Schreibe dem Anwender am Ende dieser Phase eine klare Anleitung:

```
ANLEITUNG FÜR DEN ANWENDER (manueller Schritt):

1. In claude.ai → Projekt "MoPilot" öffnen
2. Bei "Project knowledge" die alte mopilot-project-knowledge SKILL.md löschen
3. Aktualisierte Datei aus /opt/mopilot/docs/skills/mopilot-project-knowledge.md hochladen
4. Bei "Project knowledge" auch das alte MoPilot_Prototype_v1.1.md durch v1.2 ersetzen

Begründung: Skill-Files in claude.ai sind nicht Git-synchronisiert.
```

## Verifikation

- [ ] SKILL.md zeigt v1.2 und heutiges Datum
- [ ] Drei neue Plattform-Einträge (Quiz, Embed, Stats Dashboard)
- [ ] Neuer Abschnitt "Quiz-Architektur" mit Fundstellen-Tabelle und Lessons Learned
- [ ] Version-History-Tabelle hat v1.2-Zeile
- [ ] Verweis auf v1.2 (statt v1.1) in "Full Documentation"
- [ ] Anleitung für manuellen Upload in claude.ai ist dem Anwender erklärt

**Git-Commit:** `docs: SKILL.md updated to v1.2 with quiz feature reference`

## STOP

**Warte auf "weiter" vor Phase 4.**

---

# Phase 4 — Optionale Anwender- und IT-Handbücher

**Ziel:** Falls für andere Plattformen (CC Fuhrpark, VIANOVA) bereits separate `HANDBUCH_ANWENDER.md` und `HANDBUCH_IT.md` existieren, gleicher Stil für das Quiz: ein kurzes Handbuch für Vorstand/Anwender und ein technisches Handbuch.

> **Diese Phase ist optional.** Falls der Anwender keine separaten Handbücher pflegt, überspringen.

## Schritte (falls beauftragt)

### 4.1 HANDBUCH_QUIZ_ANWENDER.md

Zielgruppe: Vorstand, Stationspaten, Marketing.

Aufbau (am Stil bestehender Handbücher orientieren):

- Teil A: Management-Zusammenfassung
  - Was ist der Mobilitäts-Check?
  - Wie funktioniert der Conversion-Trichter?
  - Wie sehe ich die Auswertungen?
  - Wer kann das Dashboard sehen?
- Teil B: Anwenderhandbuch
  - Anmeldung am Dashboard
  - Erklärung KPI-Kacheln
  - Trichter-Diagramm interpretieren
  - Heatmap nutzen (welche Fragen sind besonders schwer?)
  - CSV-Export für Excel
  - Filter (Datum, Gerät, Referrer)
  - Häufige Fragen (FAQ)
  - Datenschutz: Was wird getrackt, was nicht?

### 4.2 HANDBUCH_QUIZ_IT.md

Zielgruppe: IT-Verantwortliche, künftige Entwickler.

Aufbau:

- Teil A: IT-Zusammenfassung für den Vorstand
  - Wo läuft was?
  - Sicherheit auf einen Blick
  - Kosten/Abhängigkeiten
  - Backup-Strategie (folgt der bestehenden mopilot-DB-Backup-Routine)
- Teil B: Technische Dokumentation
  - Architektur-Diagramm
  - DB-Schema (3 Tabellen)
  - API-Referenz (alle Endpoints)
  - Auth & CORS
  - Cookie-Lock-Mechanismus
  - E-Mail-System
  - Deployment / Build-Args
  - Monitoring (Uptime-Kuma)
  - Häufige Probleme & Lösungen
  - Code-Konventionen (analog zu bestehenden IT-Handbüchern)

### 4.3 Querverweise

Beide neuen Handbücher in `MoPilot_Prototype_v1.2.md` und in `SKILL.md` als ergänzende Quellen verlinken.

## Verifikation

- [ ] Handbücher sind im Stil der bestehenden Anwender-/IT-Handbücher (z. B. der CC-Fuhrpark-Handbücher)
- [ ] Datenschutz-Abschnitt ist DSGVO-konform formuliert
- [ ] Querverweise im Hauptdokument und in der Skill-Datei

**Git-Commit:** `docs: separate user and IT handbooks for quiz feature`

## STOP

**Phase 4 abgeschlossen. Warte auf "weiter" vor Phase 5.**

---

# Phase 5 — Konzept-Dokument & Tag setzen

**Ziel:** Das ursprüngliche Konzept-Dokument als historisches Referenzstück sichern, Versions-Tag setzen, alles pushen.

## Schritte

### 5.1 Planungs-Dokumente archivieren

```bash
mkdir -p /opt/mopilot/docs/archive/quiz-v1.2
mv /opt/mopilot/cc-quiz-implementation-prompt.md /opt/mopilot/docs/archive/quiz-v1.2/ 2>/dev/null
mv /opt/mopilot/cc-quiz-konzept.docx /opt/mopilot/docs/archive/quiz-v1.2/ 2>/dev/null
mv /opt/mopilot/cc-quiz-doku-update-prompt.md /opt/mopilot/docs/archive/quiz-v1.2/ 2>/dev/null
```

(Falls die Dateien nicht existieren: ignorieren — sie waren nur lokale Planungs-Notizen.)

### 5.2 Git-Tag v1.2 setzen

Falls Phase 4 des Implementation-Prompts den Tag noch nicht gesetzt hat:

```bash
cd /opt/mopilot
git checkout master
git pull origin master
git tag -l v1.2

# Falls Tag fehlt:
git tag -a v1.2 -m "feat: CC Quiz migration & expanded analytics + documentation"
git push origin v1.2
```

### 5.3 Doku-Branch mergen

```bash
git checkout master
git merge docs/quiz-v1.2 --no-ff -m "docs: comprehensive quiz feature documentation v1.2"
git push origin master
```

### 5.4 Stand verifizieren

```bash
# Sicherstellen dass auf master alles ist
git log --oneline -10

# Tag prüfen
git tag --list "v*"
git show v1.2 --stat | head -50
```

## Verifikation

- [ ] Planungs-Dokumente sind in `docs/archive/quiz-v1.2/` verschoben (oder gelöscht, falls nicht im Repo)
- [ ] Git-Tag `v1.2` existiert und ist gepusht
- [ ] Doku-Commits sind auf `master`
- [ ] `master` ist mit `origin/master` synchron
- [ ] Anwender kann durch `git log` und `MoPilot_Prototype_v1.2.md` den vollständigen Doku-Stand nachvollziehen

## Schluss-Bericht an den Anwender

Liefere am Ende eine kompakte Zusammenfassung:

- Welche Dateien wurden angefasst (mit Zeilen-Diff)?
- Welche neuen Dokumente sind entstanden?
- Was muss der Anwender NOCH manuell tun?
  - SKILL.md und MoPilot_Prototype_v1.2.md in claude.ai-Project hochladen
  - Falls gewünscht: Doku-Update an Vorstand / Fördergeber kommunizieren
  - Optional: Uptime-Kuma-Monitore für Quiz-Feature nachholen (war Phase 4 des Implementation-Plans, ggf. noch offen)

---

## Anhang A — Doku-Übersicht (Referenz)

| Datei | Pfad | Update-Bedarf | Phase |
|-------|------|--------------|-------|
| MoPilot_Prototype_v1.2.md | `/opt/mopilot/` (neu, Kopie von v1.1) | Vollständig — neues Kapitel "Quiz", Updates in Architektur/DB/API/Cookies/Versionshistorie | 1 |
| MoPilot_Prototype_v1.1.md | `/opt/mopilot/` | Bleibt als historischer Stand erhalten | – |
| README.md | `/opt/mopilot/` | Feature-Liste, URL-Tabelle, Versionsstand | 2 |
| CLAUDE.md | `/opt/mopilot/` | Pfade, Konventionen, Versionsstand | 2 |
| Sub-READMEs | `backend/`, `frontend/`, `cc-kunden/frontend/`, `MoPilot_CC_Kunden/` | Falls vorhanden: ergänzen | 2 |
| SKILL.md (mopilot-project-knowledge) | `/opt/mopilot/docs/skills/` (oder analog) | Plattformen, Pfade, neuer Abschnitt "Quiz-Architektur", Version-History | 3 |
| HANDBUCH_QUIZ_ANWENDER.md | `/opt/mopilot/` (neu, optional) | Falls beauftragt: vollständig neu anlegen | 4 |
| HANDBUCH_QUIZ_IT.md | `/opt/mopilot/` (neu, optional) | Falls beauftragt: vollständig neu anlegen | 4 |
| Archiv-Ordner | `docs/archive/quiz-v1.2/` | Planungs-Docs verschieben | 5 |

## Anhang B — Quiz-Inhaltsmatrix (für Anhang in v1.2)

| # | Kategorie | Frage | Korrekte Antwort |
|---|-----------|-------|-----------------|
| 1 | TARIFE | Wie funktioniert die Erstattung im Tarif 'CC eco'? | Teil der Grundgebühr wird als 5 Std. Fahrtguthaben/Monat erstattet |
| 2 | TARIFE | Welche Regelung gilt für den Tarif 'CC go'? | Keine Grundgebühr und keine Erstattung |
| 3 | EIGNUNG | Für wen ist CC-Carsharing eine besonders prüfenswerte Alternative? | Besitzer von wenig genutzten Zweitwagen |
| 4 | VORAUSSETZUNGEN | Wer sollte sich laut unseren Kriterien NICHT registrieren? | Personen ohne gültige Fahrerlaubnis oder Einmal-Nutzer (z.B. Werkstatt-Ersatz) |
| 5 | REGISTRIERUNG | Was passiert nach deiner Online-Registrierung? | Persönliche Einweisung durch einen Standortpaten |
| 6 | VORTEILE | Welche Kosten sparst du durch das Carsharing-Angebot? | Wertverlust, Steuer, Versicherung & Wartung |
| 7 | UMWELT | Wie viele Privat-PKW ersetzt ein Sharing-Auto statistisch? | Bis zu 15 |
| 8 | BUCHUNG | Wie öffnest du das Auto an der Station? | Per Smartphone-App |
| 9 | UMWELT | Welchen Antrieb nutzen unsere Fahrzeuge? | Reiner Elektroantrieb |
| 10 | NUTZUNG | Wo musst du das Fahrzeug nach der Fahrt abstellen? | An der festen Abholstation |
| 11 | VORTEILE | Was bietet die CC-Card bei unseren Partnern? | Individuelle Vorteile und Rabatte im lokalen Handel |
| 12 | NUTZUNG | Was ist die Mindestbuchungsdauer? | 30 Minuten |
| 13 | GEMEINSCHAFT | Wer entscheidet über die Zukunft der Genossenschaft? | Die Mitglieder (Ein Kopf, eine Stimme) |
| 14 | FINANZEN | Was ist in den Zeit- und Kilometertarifen bereits enthalten? | Strom, Versicherung, Steuer & Wartung |

(Quelle: `quiz_definitions.questions_json` für Slug `cc-mobilitaets-check`. Bei Diskrepanzen ist die DB die maßgebliche Quelle.)

---

*Bei Unklarheiten oder unerwarteten Fundstellen: STOPPE und frage den Anwender, statt zu raten.*
