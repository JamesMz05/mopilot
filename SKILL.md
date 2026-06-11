---
name: mopilot-project-knowledge
description: "Complete technical reference for the MoPilot project – a KI-gestützter Mobilitätsassistent for E-Carsharing in rural areas. Use this skill whenever working on ANY MoPilot task: deploying, debugging, configuring, extending, or developing features for mopilot.website, ideen.mopilot.website, zeo-kunden.mopilot.website, cc-kunden.mopilot.website, or hotline.mopilot.website. Also trigger when the user mentions MoPilot infrastructure (Hetzner, Coolify, Traefik, Docker Compose), MoPilot roles (Endkunde, Stationspate, Hotline, Betreiber, Flottenmanagement, Fahrzeugbetreuer, Plattform-Support, Projektträger, Fahrzeugsteller, Validierungsstelle), MoPilot databases (mopilot, mopilot_ideen), ZEO Carsharing, or any of the MoPilot subdomains. Use this skill BEFORE making assumptions about server paths, Docker services, database schemas, API endpoints, or deployment procedures."
---

# MoPilot Project Knowledge (Prototype v1.3)

> Updated: June 2026

## When to Use

Consult this skill whenever you need to:
- Deploy, debug, or configure any MoPilot service
- Extend or develop new features for any MoPilot platform
- Understand the database schema, API endpoints, or auth flow
- Work with Docker, Traefik, or CI/CD for MoPilot
- Develop the planned hotline.mopilot.website sub-project
- Understand role-based access, user sync, or email configuration

## Quick Reference

### Platforms

| Platform | URL | Function |
|----------|-----|----------|
| Hauptsystem | https://mopilot.website | Role-based demo cockpit with KI-Chat |
| Ideenplattform | https://ideen.mopilot.website | Ideas, ratings, comments, admin |
| ZEO Kundenassistent | https://zeo-kunden.mopilot.website | KI-Chat for ZEO end customers |
| CC Kundenassistent | https://cc-kunden.mopilot.website | KI-Chat for CC end customers, öffentliche Embed-Seiten (`/embed/tarife`) |
| CC Quiz (Mobilitats-Check) | https://cc-kunden.mopilot.website/quiz | 14-Fragen-Quiz mit Gutscheincode (öffentlich) |
| CC Quiz Embed | https://cc-kunden.mopilot.website/embed/quiz | iframe-Variante für sharing-community.de |
| Quiz Stats Dashboard | https://mopilot.website/admin/quiz-stats | KPIs, Trichter, Heatmap, CSV-Export (Plattform-Support+) |
| Workshops & Projekte | https://mopilot.website/doku/workshops | Doku-Bereich: Schulprojekte, Praxisworkshops, Kooperationen |
| A-to-B Projektseite | https://mopilot.website/doku/workshops/a-to-b | Detailseite New:Mobility Award 2026 Gewinnerprojekt |
| Hotline (planned) | https://hotline.mopilot.website | Internal hotline tool |
| Monitoring | http://localhost:3001 (via SSH tunnel) | Uptime Kuma (11 monitors) |
| Coolify | http://localhost:8000 (via SSH tunnel) | Traefik proxy only |

### Server

| Property | Value |
|----------|-------|
| Provider | Hetzner Cloud CX33 |
| IP | 142.132.232.211 |
| OS | Ubuntu + Docker CE |
| RAM | 7.6 GB + 4 GB Swap |
| Disk | 38 GB (~23 GB used) |
| SSH | root@142.132.232.211 |

### Key Server Paths

| System | Path |
|--------|------|
| Hauptsystem (Git repo + build source) | `/opt/mopilot/` |
| Hauptsystem Frontend | `/opt/mopilot/frontend/` |
| Hauptsystem Backend | `/opt/mopilot/backend/` |
| Shared Design System | `/opt/mopilot/shared-ui/` |
| Ideenplattform (complete) | `/opt/mopilot/ideen/` |
| Ideenplattform Backend | `/opt/mopilot/ideen/backend/` |
| Ideenplattform Frontend | `/opt/mopilot/ideen/frontend/` |
| ZEO-Kunden (Git source) | `/opt/mopilot/MoPilot_ZEO_Kunden/` |
| CC-Kunden (Git source) | `/opt/mopilot/cc-kunden/` |
| Quiz-Module Backend | `/opt/mopilot/backend/app/api/quiz.py`, `quiz_stats.py`, `app/models/quiz.py`, `app/services/quiz_mail.py` |
| Quiz-Komponenten CC-Frontend | `/opt/mopilot/cc-kunden/frontend/src/components/quiz/` (Entwicklung) + `/opt/mopilot/MoPilot_CC_Kunden/frontend/src/components/quiz/` (Docker-Build) |
| Quiz Stats Frontend | `/opt/mopilot/frontend/app/admin/quiz-stats/page.tsx` |
| Workshops Doku | `/opt/mopilot/frontend/app/doku/workshops/` (Übersicht + Detailseiten) |
| Workshop-Bilder | `/opt/mopilot/frontend/public/doku/workshops/a-to-b/` (10 JPGs) |
| Backups | `/opt/backups/db/` |

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend (all) | Next.js 14, React 18, Tailwind CSS, TypeScript, Node 20 Alpine |
| Shared Design System | `/opt/mopilot/shared-ui/` (Tailwind Preset, globals.css, TSX components) |
| Backend (Hauptsystem) | FastAPI, Python 3.11, async SQLAlchemy 2.0, Uvicorn |
| Backend (Ideenplattform) | FastAPI, Python 3.11, sync SQLAlchemy 2.0, Uvicorn |
| Backend (ZEO/CC-Kunden) | FastAPI, Python 3.11, SSE-Streaming, `/api/tariffs` (CC) |
| KI Model | Claude Sonnet (`claude-sonnet-4-6`) via Anthropic API |
| Database | PostgreSQL 16 – DBs: `mopilot` + `mopilot_ideen` + `cc_fuhrpark` + `vianova_verwaltung` |
| Cache | Redis 7 Alpine, 256 MB, LRU |
| Reverse Proxy | Traefik v3.1 (via Coolify), SSL via Let's Encrypt |
| Deployment | Docker Compose + Traefik v3.1 (Coolify only as Traefik proxy) |
| CI/CD | GitHub Actions → SSH + docker compose build |
| Email | IONOS SMTP (smtp.ionos.de:587, STARTTLS) |
| Monitoring | Uptime Kuma (Docker, Port 3001, 11 monitors) |

### Docker Services

**All services in one docker-compose.yml (`/opt/mopilot/docker-compose.yml`):**

postgres, redis, main-backend, main-frontend, ideen-backend, ideen-frontend, zeo-backend, zeo-frontend, cc-backend, cc-frontend

All with `unless-stopped` + health checks. No Coolify service management – Coolify only runs Traefik.

### Databases

| Database | Purpose | Accessed by |
|----------|---------|-------------|
| `mopilot` | Users, Stations, Vehicles, Tariffs, FAQs, ChatMessages, **Quiz (quiz_definitions, quiz_sessions, quiz_events)** | Hauptsystem (async), Ideen-Backend (sync, User-Sync) |
| `mopilot_ideen` | Users, Roles, Ideas, Ratings, Comments, Tags, Attachments | Ideen-Backend |

### 10 Roles (3 Categories)

| Category | Role | Slug |
|----------|------|------|
| Kundennah | Endkunde | endkunde |
| Kundennah | Stationspate | stationspate |
| Kundennah | Hotline | hotline |
| Betrieb | Betreiber | betreiber |
| Betrieb | Flottenmanagement | flottenmanagement |
| Betrieb | Fahrzeugbetreuer | fahrzeugbetreuer |
| Betrieb | Plattform-Support | plattform-support |
| Strategie | Projektträger | projekttraeger |
| Strategie | Fahrzeugsteller | fahrzeugsteller |
| Strategie | Validierungsstelle | validierungsstelle |

**Hierarchical access:** strategie > betrieb > kundennah (higher sees all below)

### Authentication Architecture

- Registration: centrally on ideen.mopilot.website/register
- User-Sync: Ideen-DB → mopilot-DB via psycopg2 (INSERT ON CONFLICT)
- Same credentials work on all platforms (separate login required per platform, no SSO)
- JWT tokens: Hauptsystem 8h, Ideenplattform 24h
- Password hashing: bcrypt via passlib
- DB-Auth only since v0.9 (demo login removed)

### API-Key & Secrets Management

All services use one central `.env` file: `/opt/mopilot/.env` – no scattered .env files.

**CRITICAL:** `ANTHROPIC_API_KEY` must NEVER be in `environment:` (overrides env_file).

### Shared Design System Build Workflow

shared-ui is included via Docker build stage automatically – no manual sync needed. (sync-shared-ui.sh removed in v1.0)

### CI/CD Pipeline

Push to master → GitHub Actions → SSH to server → git pull → docker compose build && up -d. All services (main, ideen, ZEO, CC) are in the same Compose stack – no manual deployment needed.

### Critical Lessons Learned

- **One docker-compose.yml for all services** – no Coolify service management anymore, only Traefik proxy.
- **Central .env** – `docker compose restart` does NOT reload `.env`. Always use `docker compose down && docker compose up -d`.
- **HOSTNAME=0.0.0.0**: Required in docker-compose.yml for Next.js standalone to bind correctly (prevents 502).
- **127.0.0.1 instead of localhost** in Docker healthchecks (IPv6 trap).
- **Traefik labels**: Must include `traefik.enable=true`, `traefik.docker.network=coolify`, and proper router/service labels.
- **API key format**: Anthropic API key in `.env` must be stored without quotes or spaces. NEVER put in `environment:` (overrides env_file).
- **Verify effective config**: Use `docker compose config | grep KEY_NAME` to confirm resolved values.
- **shared-ui via Docker build stage** – no manual sync-shared-ui.sh needed anymore.

### Version History

| Version | Date | Focus |
|---------|------|-------|
| v0.7 | — | Hauptsystem, Ideenplattform, Auth, User-Sync |
| v0.71 | — | User-Sync Bugfix, Admin page, Login/Logout, DKIM |
| v0.72 | — | CC Kundenassistent, API-Key Management |
| v0.73 | — | UI/UX-Redesign, Shared Design System |
| v0.74 | 01.04.2026 | CC-Kunden Monorepo, MOPILOT_TEAM Bugfix, Backup-System |
| v0.8 | 05.04.2026 | User-Sync Fix, Login Self-Service, Dashboard Vianova |
| v0.8.1 | 05.04.2026 | ZEO Login DB-Auth, Passwort-Link Fix, Sentinel Sync |
| v0.9 | 06.04.2026 | Rollenspezifische Dashboards, Landing Page, DB-Auth only |
| v1.0 | 06.04.2026 | Infrastruktur-Vereinheitlichung: 1 Compose, 1 .env, kein rsync/sync-shared-ui |
| v1.1 | 09.04.2026 | Admin-Benutzerverwaltung: Einladungssystem, Freischaltung, Login-Guard |
| v1.2 | 03.05.2026 | CC Quiz Migration & Analytics — 14-Fragen-Mobilitats-Check, anonymes Tracking, Admin-Dashboard mit Trichter und Heatmap, E-Mail-Notification an register@sharing-community.de, Embed-Variante für sharing-community.de |
| **v1.3** | **11.06.2026** | **Workshops & Projekte Doku-Bereich — Übersichtsseite mit datengetriebenem Projekt-Grid, A-to-B Detailseite (New:Mobility Award 2026), 10 Projektbilder, DokuSection-Link** |

## Quiz-Architektur (CC Mobilitats-Check)

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

## Full Documentation

For complete details (database schemas, all API endpoints, Docker Compose configs, deployment diagrams, email setup, DNS records, hotline.mopilot.website specification), read:

→ **`MoPilot_Prototype_v1.2.md`** (aktuell)
→ `HANDBUCH_QUIZ_ANWENDER.md` (Quiz-Anwenderhandbuch fur Vorstand/Marketing)
→ `HANDBUCH_QUIZ_IT.md` (Quiz-IT-Handbuch fur Entwickler)
→ `references/MoPilot_Prototype_v1.0.md` (historisch)

The v1.3 reference contains all previous chapters plus:
- Chapter 21: Quiz-Feature — Architektur, Datenmodell (3 Tabellen), API-Referenz (10 Endpoints), Frontend-Komponenten, Cookie & Tracking, E-Mail-Notification, Admin-Dashboard, 14 Quiz-Fragen, operative Hinweise
- Chapter 22: Workshops & Projekte — Doku-Routen, Datenstruktur (projects-Array), Bilderpfad, A-to-B-Inhalt, Erweiterungsanleitung
