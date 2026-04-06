# MoPilot v1.0 – Technische Projektdokumentation

**KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum**
Version 1.0 | 6. April 2026 | Server: Hetzner CX33 (142.132.232.211)

---

## 1. Funktionen

### 1.1 Plattformübersicht

MoPilot betreibt 5 Plattformen auf einem einzigen Server:

| Plattform | URL | Kernfunktion |
|-----------|-----|--------------|
| **Hauptsystem** | mopilot.website | Rollenbasiertes Dashboard mit KI-Chat |
| **Ideenplattform** | ideen.mopilot.website | Ideen einreichen, bewerten, kommentieren |
| **ZEO Kundenassistent** | zeo-kunden.mopilot.website | KI-Chat für ZEO-Endkunden |
| **CC Kundenassistent** | cc-kunden.mopilot.website | KI-Chat für CC-Endkunden |
| **CC Fuhrpark** | ccfuhrpark.vianova.website | Digitale Fuhrparkverwaltung |

### 1.2 Funktionsbereiche

**Authentifizierung:**
Zentrale Registrierung auf Ideenplattform, DB-Auth (kein Demo-Login seit v0.9), JWT-Token (8h Access / 24h Refresh), User-Sync zwischen Datenbanken, Passwort-Reset per E-Mail (IONOS SMTP).

**Landing Page:**
10 Rollenkarten in 3 Zonen (Kundennah / Betrieb / Strategie), klickbar nach Login (Link zu Dashboard), öffentlich sichtbar, farbcodierte Zonenstile.

**Rollenspezifische Dashboards:**
10 individuelle Dashboard-Seiten, Schnellaktionen pro Rolle, Sidebar mit rollenspezifischen Infos, Operator-spezifische Inhalte, gemeinsames Layout mit KI-Chat.

**KI-Chat (SSE-Streaming):**
Claude Sonnet 4 (Anthropic API), rollenspezifische System-Prompts, Server-Sent Events Streaming, FAQ-Kontext aus Datenbank, Chat-Historie + Session-Management.

**Ideenplattform:**
CRUD für Ideen mit Kategorien, Bewertungen (1–5 Sterne), Kommentare + Tags + Anhänge, CSV/JSON-Export, Admin-Verwaltung + Self-Service.

**Stationskarte + Monitoring:**
GBFS 2.3 Live-Daten, Leaflet-Karte mit Markern, Verfügbarkeits-KPIs, Health-Check Script (11 Services), DB-Backup täglich + Hetzner Snapshots.

### 1.3 Rollensystem (10 Rollen + Team)

MoPilot passt Inhalte, Tonalität und Funktionen an die jeweilige Nutzerrolle an:

| Zone | Rolle | URL-Slug | Schnellaktionen |
|------|-------|----------|-----------------|
| 🟢 Kundennah | Endkunde | endkunde | Buchung, Kosten, Standorte, E-Auto laden |
| | Stationspate | stationspate | Stationsmeldungen, Ladezustand, Kontakt |
| | Hotline | hotline | Gesprächsleitfaden, häufige Probleme |
| 🔵 Betrieb | Betreiber | betreiber | Nutzungszahlen, Tarifvergleich, Planung |
| | Flottenmanagement | flottenmanagement | Fahrzeugstatus, Wartungsplan, Zuweisung |
| | Fahrzeugbetreuer | fahrzeugbetreuer | Zustandsprüfung, Ladeprotokoll, Schaden |
| | Plattform-Support | plattform-support | Systemstatus, Tickets, Nutzerfeedback |
| 🟡 Strategie | Projektträger | projekttraeger | KPIs, Fördernachweis, Strategiepapier |
| | Fahrzeugsteller | fahrzeugsteller | Fahrzeugstatus, Vertragslaufzeiten |
| | Validierungsstelle | validierungsstelle | Prüfungen, Führerschein, Dokumente |
| ⚪ Team | MOPILOT_TEAM | — | Admin-Zugang, alle Funktionen |

### 1.4 Authentifizierungsfluss

1. **Registrierung** auf ideen.mopilot.website (Rolle + Operator wählen)
2. **E-Mail-Verifizierung** (IONOS SMTP → Token-Link)
3. **User-Sync** in Hauptdatenbank (psycopg2, INSERT ON CONFLICT DO UPDATE, gleicher bcrypt-Hash)
4. **Login** auf mopilot.website (DB-Auth, JWT Cookie `demo_auth`)
5. **Landing Page** mit klickbaren Rollenkarten
6. **Dashboard** mit KI-Chat und Schnellaktionen

---

## 2. IT-Architektur

### 2.1 Server-Infrastruktur

```
HETZNER CX33 | 142.132.232.211 | Ubuntu + Docker CE
4 vCPU | 8 GB RAM | 80 GB SSD | Falkenstein/Vogtland

┌──────────────────────────────────────────────────────────────┐
│                 TRAEFIK v3.1 (Reverse Proxy)                  │
│           Let's Encrypt SSL | Host-basiertes Routing          │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────┘
       │          │          │          │          │
  mopilot.   ideen.     zeo-kunden  cc-kunden  ccfuhrpark.
  website    mopilot.   .mopilot.   .mopilot.  vianova.
             website    website     website    website
  (Coolify)  (manuell)  (CI/CD)    (manuell)  (sep. Repo)
       │          │          │          │          │
┌──────┴──────────┴──────────┴──────────┴──────────┴───────────┐
│                Docker Network: coolify                         │
├───────────────────────────────────────────────────────────────┤
│  PostgreSQL 16 (4 DBs)  │  Redis 7 (256 MB)  │  Uptime Kuma │
└─────────────────────────┴────────────────────┴───────────────┘
```

### 2.2 Docker-Services

| Plattform | Frontend | Backend | Deployment | Datenbank |
|-----------|----------|---------|------------|-----------|
| **Hauptsystem** | Next.js :3000 | FastAPI :8000 | Coolify API | mopilot |
| **Ideenplattform** | Next.js :3000 | FastAPI :8000 | Manuell | mopilot_ideen |
| **ZEO-Kunden** | Next.js :3000 | FastAPI :8000 | CI/CD (rsync) | mopilot |
| **CC-Kunden** | Next.js :3000 | FastAPI :8000 | Manuell (rsync) | mopilot |
| **CC Fuhrpark** | Next.js :3000 | FastAPI :8000 | Separates Repo | cc_fuhrpark |

### 2.3 Tech-Stack

| Schicht | Technologien |
|---------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.3, Tailwind CSS 3.4, Leaflet, Lucide Icons |
| **Backend (Haupt)** | FastAPI, Python 3.11, Uvicorn, Async SQLAlchemy 2.0, asyncpg, JWT |
| **Backend (Ideen)** | FastAPI, Python 3.11, Sync SQLAlchemy 2.0, psycopg2, Alembic |
| **KI-Engine** | Claude Sonnet 4 (claude-sonnet-4-6), Anthropic API, SSE-Streaming |
| **Datenbank** | PostgreSQL 16 (4 Datenbanken), Redis 7 (Cache, 256 MB LRU) |
| **Infrastruktur** | Docker CE, Docker Compose, Coolify 4.0, Traefik v3.1, Let's Encrypt |
| **CI/CD** | GitHub Actions, SSH Deploy, rsync, Coolify API Webhook |
| **E-Mail** | IONOS SMTP (smtp.ionos.de:587, STARTTLS), Verifizierung + Passwort-Reset |
| **Monitoring** | Uptime Kuma (11 Checks), Health-Check Script, Hetzner Snapshots |

### 2.4 Datenbank-Architektur

Eine PostgreSQL-Instanz hostet 4 Datenbanken:

**DB: mopilot (Hauptsystem)**
- `users` – email, hashed_password, role (UserRole Enum), operator (zeo/cc)
- `chat_messages` – session_id, role (user/assistant), content
- `stations` – lat, lon, vehicles_count
- `vehicles` – model, status, station_id
- `tariffs` – name, price_per_min/km
- `faqs` – question, answer, category, operator

**DB: mopilot_ideen (Ideenplattform)**
- `users` – email, password_hash, role_id (FK), email_verified
- `roles` – slug, category, zone
- `ideas` – title, description, status (Enum)
- `ratings` – score (1–5), user_id, idea_id
- `comments`, `tags`, `attachments`, `idea_tags`

**DB: cc_fuhrpark**
- `fahrzeuge`, `termine`, `schaeden`, `zustaendigkeiten`

**DB: vianova_verwaltung**
- `mitglieder`, `geschaeftsanteile`, `anteilsbewegungen`, `versammlungen`, `beschluesse`

**User-Sync (Richtung: Ideen → Haupt):**
Trigger nach Registrierung + E-Mail-Verifizierung. Methode: psycopg2, INSERT ON CONFLICT DO UPDATE. Gleicher bcrypt-Hash wird kopiert (keine Neu-Hashung). Ergebnis: Gleiche Credentials auf allen Plattformen.

### 2.5 Shared Design System

```
/opt/mopilot/shared-ui/  (Single Source of Truth)
├── tailwind.preset.js    → Farben, Fonts, Schatten, Radii
├── globals.css           → Globale Styles, Animationen
└── components/           → Button, Card, Header, Footer

    sync-shared-ui.sh  (rsync → 4 Frontends)
         │
    ┌────┼──────────┬──────────────┬──────────────┐
    │    │          │              │              │
    frontend/   ideen/frontend/  ZEO/frontend/  cc-kunden/frontend/
    shared-ui/  shared-ui/       shared-ui/     shared-ui/
```

Jedes Frontend referenziert: `presets: [require('./shared-ui/tailwind.preset.js')]`

### 2.6 CI/CD Pipeline

```
Entwickler → git push master → GitHub Actions (deploy.yml)
                                     │
                                     ▼ SSH
                              Hetzner Server
                              1. git fetch + merge
                              2. sync-shared-ui.sh
                              3. rsync ZEO → /opt/zeo-kunden/
                              4. docker compose up -d --build
                              5. Coolify API → Hauptsystem rebuild
                              6. Health-Check (HTTP 200?)
```

| Plattform | Deployment-Methode |
|-----------|-------------------|
| **Hauptsystem** | git push → GitHub Actions → Coolify API → Auto-Rebuild |
| **ZEO-Kunden** | git push → GitHub Actions → rsync → docker compose up --build |
| **CC-Kunden** | rsync → /opt/cc-kunden/ → docker compose down && up --build |
| **Ideenplattform** | cd /opt/mopilot/ideen → docker compose down && up -d --build |
| **CC Fuhrpark** | Separates Git-Repo, eigener Coolify-Service |

### 2.7 KI-Chat Datenfluss

```
Browser (React)     Next.js Frontend     FastAPI Backend      Anthropic API
     │                    │                    │                    │
     │ User tippt         │                    │                    │
     │ Nachricht          │                    │                    │
     ├──POST /api/chat/──▶│                    │                    │
     │  stream + Bearer   ├──POST /chat/──────▶│                    │
     │                    │  stream + JWT       │ 1. JWT prüfen     │
     │                    │                    │ 2. Rolle erkennen  │
     │                    │                    │ 3. FAQs laden (DB) │
     │                    │                    │ 4. System-Prompt   │
     │                    │                    ├──messages[]────────▶│
     │                    │                    │                    │ Claude Sonnet 4
     │◀──SSE Stream──────│◀──SSE Stream───────│◀──SSE Stream───────│ Streaming
     │ Token für Token    │                    │ 5. In DB speichern │
```

### 2.8 Verzeichnisstruktur

```
/opt/mopilot/                          ← Git-Repo (master)
├── frontend/                          ← Hauptsystem Frontend
│   ├── app/                           ← Next.js App Router
│   │   ├── page.tsx                   ← Landing Page (10 Rollenkarten)
│   │   ├── login/page.tsx             ← DB-Auth Login
│   │   ├── dashboard/                 ← Geschützter Bereich
│   │   │   ├── layout.tsx             ← Shared Layout + KI-Chat
│   │   │   ├── endkunde/page.tsx      ← Rollenspez. Dashboard
│   │   │   ├── betreiber/page.tsx     ← ... (10 Rollen)
│   │   │   └── ...
│   │   ├── admin/page.tsx             ← User-Verwaltung
│   │   ├── stationen/page.tsx         ← GBFS Live-Karte
│   │   └── api/auth/                  ← Next.js API Routes
│   ├── components/                    ← StationenKarte, DokuSection
│   ├── shared-ui/                     ← Kopie des Design Systems
│   ├── middleware.ts                  ← Route Protection
│   └── tailwind.config.js            ← + shared preset
│
├── backend/app/                       ← Hauptsystem Backend
│   ├── main.py                        ← FastAPI Entry Point
│   ├── core/                          ← Config, DB, Auth, Seed
│   ├── models/models.py              ← 6 SQLAlchemy Models
│   ├── api/                           ← auth, chat, knowledge, stations...
│   ├── prompts/roles.py              ← 11 Rollen-Prompts
│   └── services/
│
├── shared-ui/                         ← Design System (Single Source)
├── ideen/                             ← Ideenplattform (komplett)
│   ├── backend/app/                   ← FastAPI + Alembic + SMTP
│   │   ├── routers/                   ← auth, ideas, ratings, comments...
│   │   ├── user_sync.py              ← Sync → mopilot DB
│   │   └── models.py                 ← 8 Models
│   └── frontend/src/app/             ← Register, Login, Ideen-CRUD
│
├── MoPilot_ZEO_Kunden/               ← ZEO-Kunden Git-Source
├── cc-kunden/                         ← CC-Kunden Git-Source
├── .github/workflows/deploy.yml      ← CI/CD Pipeline
├── scripts/health-check-all.sh       ← Monitoring Script
└── sync-shared-ui.sh                 ← Design System Sync
```

---

## 3. Entwicklungsschritte für neue Funktionen

### 3.1 Übersicht des Entwicklungsprozesses

Der Prozess folgt 6 Schritten: **Planen → Vorbereiten → Entwickeln → Testen → Deployen → Verifizieren**

### 3.2 Schritt 1: Planung und Einordnung

**Checkliste vor dem Start:**
- Welche Plattform ist betroffen? (Hauptsystem, Ideen, ZEO, CC, Fuhrpark)
- Ist eine Datenbank-Schema-Änderung nötig? → Backup zuerst!
- Muss das shared-ui-System aktualisiert werden?
- Sind mehrere Rollen oder Operators betroffen?
- Wird der ANTHROPIC_API_KEY benötigt? (nur Chat-Features)

### 3.3 Schritt 2: Entwicklungsumgebung vorbereiten

```bash
# 1. SSH auf den Server
ssh root@142.132.232.211

# 2. In das Projektverzeichnis wechseln
cd /opt/mopilot

# 3. Aktuellen Stand holen
git pull origin master

# 4. Shared UI synchronisieren (IMMER vor Änderungen!)
bash sync-shared-ui.sh

# 5. Aktuellen Zustand prüfen
bash scripts/health-check-all.sh
```

### 3.4 Schritt 3: Änderungen implementieren

**3.4.1 Neues Frontend-Feature (Hauptsystem)**

Betroffene Dateien:
- `frontend/app/neue-seite/page.tsx` – neue Seite anlegen
- `frontend/app/dashboard/layout.tsx` – Layout/Chat anpassen
- `frontend/middleware.ts` – ggf. Route freigeben
- `frontend/components/NeueKomponente.tsx` – neue Komponente

Worauf achten: `'use client'` Direktive für interaktive Komponenten, Middleware aktualisieren bei neuen öffentlichen Routen, `useDashboard()` Hook für Rollen-Kontext, Tailwind-Klassen aus shared-ui verwenden.

**3.4.2 Neues Backend-Feature (Hauptsystem)**

Betroffene Dateien:
- `backend/app/api/neuer_endpoint.py` – neuer Router
- `backend/app/models/models.py` – ggf. neues Model
- `backend/app/main.py` – Router registrieren
- `backend/app/core/seed.py` – ggf. Demo-Daten
- `backend/app/prompts/roles.py` – ggf. Prompts erweitern

Worauf achten: Async SQLAlchemy im Hauptsystem (nicht sync!), JWT-Auth via `get_current_user` Dependency, CORS-Origins prüfen bei neuen Subdomains, FAQs als Kontext für den KI-Chat nutzen.

**3.4.3 Ideenplattform-Feature**

Betroffene Dateien:
- `ideen/backend/app/routers/neuer_router.py`
- `ideen/backend/app/models.py` – Sync SQLAlchemy (nicht async!)
- `ideen/backend/alembic/` – Migration erstellen bei Schema-Änderung
- `ideen/frontend/src/app/neue-seite/page.tsx`

Worauf achten: Sync SQLAlchemy (nicht async!), Alembic-Migration bei Schema-Änderung, User-Sync in `user_sync.py` prüfen, User-Sync geht nur in eine Richtung (Ideen → Haupt).

### 3.5 Schritt 4: Testen

```bash
# Frontend lokal bauen und prüfen
cd /opt/mopilot/frontend
npm run build

# Backend-Syntax prüfen
cd /opt/mopilot/backend
python -c "from app.main import app; print('OK')"

# Docker-Build testen
cd /opt/mopilot/ideen
docker compose build --no-cache
docker compose up -d

# Logs prüfen
docker compose logs -f --tail=50

# Health-Check aller Services
bash /opt/mopilot/scripts/health-check-all.sh
```

### 3.6 Schritt 5: Deployment

| Plattform | Deployment-Methode |
|-----------|-------------------|
| **Hauptsystem** | `git push origin master` → GitHub Actions → Coolify API → Auto-Rebuild |
| **ZEO-Kunden** | `git push` → GitHub Actions → rsync → `docker compose up --build` |
| **CC-Kunden** | `rsync` → `/opt/cc-kunden/` → `docker compose down && up -d --build` |
| **Ideenplattform** | `cd /opt/mopilot/ideen` → `docker compose down && up -d --build` |
| **CC Fuhrpark** | Separates Git-Repo, eigener Coolify-Service |

### 3.7 Schritt 6: Verifizierung nach Deployment

```bash
# 1. Health-Check aller Services
bash /opt/mopilot/scripts/health-check-all.sh

# 2. Container-Status prüfen
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 3. Logs auf Fehler prüfen
docker logs <container-name> --tail=20

# 4. Manuell im Browser testen
# → https://mopilot.website
# → https://ideen.mopilot.website
# → https://zeo-kunden.mopilot.website
# → https://cc-kunden.mopilot.website
```

### 3.8 Kritische Regeln und Fallstricke

| # | Regel | Begründung |
|---|-------|-----------|
| 1 | `.env` NIE in docker-compose `environment:` setzen | ANTHROPIC_API_KEY wird überschrieben! Immer `env_file: .env` |
| 2 | `docker compose restart` lädt `.env` NICHT | Immer: `docker compose down && docker compose up -d` |
| 3 | `sync-shared-ui.sh` VOR jedem Frontend-Build | Sonst veraltetes Design System |
| 4 | `HOSTNAME=0.0.0.0` in Next.js Container | Ohne: 502 Bad Gateway (bindet nur auf 127.0.0.1) |
| 5 | `127.0.0.1` statt `localhost` in Healthchecks | IPv6-Trap: localhost → ::1, Container antwortet nicht |
| 6 | Coolify überschreibt ENV-Variablen | Hauptsystem-ENV nur über Coolify UI ändern |
| 7 | DB-Backup VOR Schema-Migrationen | `pg_dump -h localhost -U mopilot mopilot > backup.sql` |
| 8 | Ideen = Sync SQLAlchemy, Haupt = Async | Nicht verwechseln! Unterschiedliches Session-Handling |
| 9 | User-Sync nur in eine Richtung | Ideen DB → Haupt DB (nie umgekehrt) |
| 10 | Zwei Container mit gleichem Port = Chaos | Immer prüfen: `docker ps \| grep <port>` |

### 3.9 Beispiel: Neue Rolle hinzufügen

| # | Datei | Änderung |
|---|-------|---------|
| 1 | `backend/models/models.py` | UserRole Enum erweitern |
| 2 | `backend/prompts/roles.py` | Neuen System-Prompt definieren |
| 3 | `backend/core/seed.py` | Demo-Account hinzufügen |
| 4 | `frontend/dashboard/neue-rolle/page.tsx` | Dashboard-Seite mit Schnellaktionen |
| 5 | `frontend/app/page.tsx` | ROLES Array erweitern (Icon, Label, Zone, Slug) |
| 6 | `frontend/dashboard/layout.tsx` | SLUG_TO_PAGE_NAME Mapping ergänzen |
| 7 | `ideen/backend/seed.py` | Neue Rolle in Rollen-Tabelle |
| 8 | `ideen/backend/user_sync.py` | Slug-Mapping für neue Rolle |

Abschließend testen: Registrierung mit neuer Rolle auf ideen.mopilot.website, Login auf mopilot.website, Dashboard + KI-Chat prüfen.

---

*Erstellt mit Claude (Anthropic) | MoPilot v1.0 – 6. April 2026*
