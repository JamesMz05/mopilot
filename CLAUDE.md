# MoPilot – Projektkontext für Claude

> Zuletzt aktualisiert: 2026-04-07 (v1.0)

## Projektbeschreibung

**MoPilot** ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum.
Prototyp v1.0 – 5 Plattformen auf einem Server mit rollenspezifischen Dashboards, integriertem KI-Chat, DB-Authentifizierung und vereinheitlichter Infrastruktur.

- **Betreiber:** ZEO Carsharing (Region Bruchsal, BW) + Car&RideSharing Community eG (Overath, NRW)
- **Zweck:** Intelligenter Assistent, der Tonalität, Wissen und Funktionen an die jeweilige Nutzerrolle anpasst
- **KI-Model:** Claude Sonnet (`claude-sonnet-4-6`) via Anthropic API
- **GitHub:** JamesMz05/mopilot (Branch: master)

## Sprache & Konventionen

- **Antwortsprache:** Deutsch
- **Code-Kommentare:** Englisch
- **Variablen/Funktionen:** Englisch
- **Python Backend:** FastAPI-Router, Pydantic-Models, async/await (Hauptsystem), sync (Ideen)
- **TypeScript Frontend:** Next.js App Router, Server Components wo möglich
- **API-Keys:** Immer über `.env` + `env_file` in docker-compose.yml (NIE in `environment:`)
- **Niemals .env-Dateien ändern ohne Rückfrage**
- **Immer Backup vorschlagen vor Datenbankmigrationen**

## Plattformen

| Plattform | URL | Funktion |
|-----------|-----|----------|
| Hauptsystem | https://mopilot.website | Rollenbasiertes Demo-Cockpit mit KI-Chat |
| Ideenplattform | https://ideen.mopilot.website | Ideen, Bewertungen, Kommentare, Admin |
| ZEO Kundenassistent | https://zeo-kunden.mopilot.website | KI-Chat für ZEO-Endkunden |
| CC Kundenassistent | https://cc-kunden.mopilot.website | KI-Chat für CC-Endkunden |
| CC Fuhrpark | https://ccfuhrpark.vianova.website | Digitale Fuhrparkverwaltung (separates Repo) |
| VIANOVA Verwaltung | https://verwaltung.vianova.website | Genossenschaftsverwaltung (separates Repo) |
| Hotline (geplant) | https://hotline.mopilot.website | Internes Hotline-Tool |

## Infrastruktur

| Komponente | Details |
|------------|---------|
| Server | Hetzner CX33 (7.6 GB RAM, 38 GB Disk) – IP: `142.132.232.211` |
| OS | Ubuntu + Docker CE |
| Deployment | Docker Compose + Traefik v3.1 (Coolify nur noch als Traefik-Proxy) |
| Monitoring | Uptime Kuma (11 Monitore, Port 3001 via SSH-Tunnel) |
| SSH-Zugang | `ssh root@142.132.232.211` |
| Projektpfad Server | `/opt/mopilot/` |
| Projektpfad lokal | `C:\Users\james\Projekte\MoPilot` |

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend (alle) | Next.js 14.2, React 18.2, Tailwind CSS 3.4, TypeScript 5.3, Node 20 Alpine |
| Shared Design System | `/opt/mopilot/shared-ui/` (Tailwind Preset, globals.css, 11 TSX-Komponenten) |
| Typografie | Plus Jakarta Sans (font-display), DM Sans (font-body) |
| Backend (Hauptsystem) | FastAPI 0.109, Python 3.11, async SQLAlchemy 2.0 + asyncpg, Uvicorn |
| Backend (Ideenplattform) | FastAPI, Python 3.11, sync SQLAlchemy 2.0 + psycopg2, Uvicorn |
| Backend (ZEO/CC-Kunden) | FastAPI, Python 3.11, SSE-Streaming, Anthropic SDK (stateless, keine DB) |
| Datenbank | PostgreSQL 16 – DBs: `mopilot`, `mopilot_ideen`, `cc_fuhrpark`, `vianova_verwaltung` |
| Cache | Redis 7 Alpine, 256 MB, LRU |
| Reverse Proxy | Traefik v3.1 (via Coolify), SSL via Let's Encrypt |
| E-Mail | IONOS SMTP (smtp.ionos.de:587, STARTTLS) |
| CI/CD | GitHub Actions → SSH → `git fetch && docker compose build && up -d` |

## Docker Services & Netzwerke

**10 Services in einem docker-compose.yml (`/opt/mopilot/docker-compose.yml`):**

| Service | Build-Context | Port | Abhängigkeiten |
|---------|--------------|------|----------------|
| postgres | PostgreSQL 16-alpine | 5432 | — |
| redis | Redis 7-alpine | 6379 | — |
| main-backend | `./backend` | 8000 | postgres (healthy), redis (healthy) |
| main-frontend | `./frontend` | 3000 | main-backend |
| ideen-backend | `./ideen/backend` | 8000 | postgres (healthy) |
| ideen-frontend | `./ideen/frontend` | 3000 | ideen-backend |
| zeo-backend | `./MoPilot_ZEO_Kunden/backend` | 8000 | — |
| zeo-frontend | `./MoPilot_ZEO_Kunden/frontend` | 3000 | zeo-backend |
| cc-backend | `./MoPilot_CC_Kunden/backend` | 8000 | — |
| cc-frontend | `./cc-kunden/frontend` | 3000 | cc-backend |

**Netzwerke:**
- `internal` (mopilot-internal): Kommunikation zwischen postgres/redis/backends
- `coolify` (extern): Traefik Reverse-Proxy-Anbindung

Alle Services: `restart: unless-stopped` + Healthchecks.

## Serverpfade

| System | Pfad |
|--------|------|
| Hauptsystem (Git-Repo) | `/opt/mopilot/` |
| Hauptsystem Backend | `/opt/mopilot/backend/` |
| Hauptsystem Frontend | `/opt/mopilot/frontend/` |
| Shared Design System | `/opt/mopilot/shared-ui/` |
| Ideenplattform | `/opt/mopilot/ideen/` (backend + frontend) |
| ZEO-Kunden | `/opt/mopilot/MoPilot_ZEO_Kunden/` (backend + frontend) |
| CC-Kunden Backend | `/opt/mopilot/MoPilot_CC_Kunden/backend/` |
| CC-Kunden Frontend | `/opt/mopilot/cc-kunden/frontend/` (Entwicklung) / `MoPilot_CC_Kunden/frontend/` (Docker-Build) |
| CC-Kunden Embed-Seiten | `MoPilot_CC_Kunden/frontend/src/app/embed/` (öffentlich, ohne Login) |
| PostgreSQL Init | `/opt/mopilot/postgres/init.sql` |
| Scripts | `/opt/mopilot/scripts/` |
| Backups | `/opt/backups/db/` |
| Archiv | `/opt/mopilot/_archiv/` |

## Backend API-Routen

**Hauptsystem (`/api/`):**
`/api/health`, `/api/auth` (login, /me), `/api/chat` (SSE-Streaming), `/api/knowledge`, `/api/stations`, `/api/vehicles`, `/api/tariffs`, `/api/users`, `/api/admin`

**Ideenplattform (`/api/`):**
`/api/health`, `/api/auth` (login, register, passwort-reset), `/api/users`, `/api/roles`, `/api/ideas`, `/api/ratings`, `/api/comments`, `/api/tags`, `/api/attachments`, `/api/export`

**ZEO/CC-Kunden (`/api/`):**
`/api/health`, `/api/chat`, `/api/chat/stream`, `/api/tariffs` (nur CC)

**CC-Kunden Embed-Seiten (öffentlich, ohne Login):**
`/embed/tarife` – Tarifübersicht (TariffOverview-Komponente), einbettbar per iframe

## Frontend-Struktur (Hauptsystem)

```
frontend/app/
├── page.tsx          # Landing Page (10 Rollenkarten in 3 Zonen)
├── login/            # DB-Auth Login
├── dashboard/        # Rollenspezifische Dashboards (/dashboard/{rolle})
├── admin/            # User-Verwaltung
├── stationen/        # Stationsinformationen
├── doku/             # Dokumentation
├── datenschutz/      # Datenschutz
└── impressum/        # Impressum
```

## Shared Design System

**Komponenten** (`/opt/mopilot/shared-ui/components/`):
Badge, Button, Card, ChatBubble, Footer, Header, Input, LoadingSpinner, MoPilotLogo, PageTransition, TopographyBg

**Farben:** Primary: Petrol/Teal (#14B8A6), Accent: Amber (#F59E0B), Surface: Warm Grays

**Einbindung:** Via Docker Build-Stage + Symlink (kein manuelles sync-shared-ui.sh mehr seit v1.0)

## Authentifizierung

- **Registrierung:** Zentral auf ideen.mopilot.website/register
- **User-Sync:** Ideen-DB → mopilot-DB via psycopg2 (INSERT ON CONFLICT)
- **Gleiche Credentials** auf allen Plattformen (separater Login, kein SSO)
- **Passwort-Reset:** `/passwort-vergessen` (Anforderung) → `/passwort-zuruecksetzen?token=...` (Reset)
- **Login-Seiten (ZEO/CC):** Links "Passwort vergessen?" und "Noch kein Konto?"
- **JWT-Token:** Hauptsystem 8h, Ideenplattform 24h
- **Passwort-Hashing:** bcrypt via passlib
- **Seit v0.9:** Nur DB-Auth (Demo-Login entfernt)

## Rollen-System (10 Rollen + MOPILOT_TEAM)

| Kategorie | Rolle | E-Mail | Operator |
|-----------|-------|--------|----------|
| Kundennah | Endkunde | endkunde@mopilot.website | zeo |
| Kundennah | Stationspate | stationspate@mopilot.website | zeo |
| Kundennah | Hotline | hotline@mopilot.website | zeo |
| Betrieb | Betreiber | betreiber@mopilot.website | zeo |
| Betrieb | Flottenmanagement | flotte@mopilot.website | zeo |
| Betrieb | Fahrzeugbetreuer | fahrzeug@mopilot.website | zeo |
| Betrieb | Plattform-Support | support@mopilot.website | zeo |
| Strategie | Projektträger | traeger@mopilot.website | zeo |
| Strategie | Fahrzeugsteller | steller@mopilot.website | zeo |
| Strategie | Validierungsstelle | validierung@mopilot.website | zeo |
| CC | Endkunde | endkunde-cc@mopilot.website | cc |
| CC | Betreiber | betreiber-cc@mopilot.website | cc |

**Hierarchie:** Strategie > Betrieb > Kundennah (höhere Rolle sieht alles darunter)
**Demo-Passwort:** `mopilot2026`

## Secrets-Management

**Eine zentrale `.env`** in `/opt/mopilot/.env` für alle 10 Services.

**Wichtige Variablen:** `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `DOMAIN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `MAIN_SECRET_KEY`, `IDIEN_JWT_SECRET`, `SMTP_*`, `*_CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `ZEO_BACKEND_URL`, `CC_BACKEND_URL`, `CC_AUTH_API_URL`

**KRITISCH:** `ANTHROPIC_API_KEY` darf NIE in `environment:` stehen (überschreibt env_file).

## CI/CD Pipeline

**Trigger:** Push auf `master` → GitHub Actions (`.github/workflows/deploy.yml`)

**Ablauf:**
1. SSH auf 142.132.232.211
2. `cd /opt/mopilot && git fetch` (via GH_PAT)
3. `git merge --ff-only FETCH_HEAD`
4. `docker compose build && docker compose up -d --remove-orphans`
5. Health-Check nach 20s

**Secrets:** `SERVER_SSH_PASSWORD`, `GH_PAT`

## Backup & Monitoring

- **DB-Backup:** Täglich 03:00, 14-Tage-Retention, 4 Datenbanken
- **Secrets-Backup:** Wöchentlich Sonntag 03:30
- **Hetzner-Snapshots:** 7 rotierende automatische Backups
- **Health-Check:** `bash /opt/mopilot/scripts/health-check-all.sh` (prüft 6 Web-Services + PostgreSQL + Disk + RAM)
- **Uptime Kuma:** 11 Monitore (SSH-Tunnel Port 3001)

## Versionshistorie

| Version | Datum | Schwerpunkt |
|---------|-------|-------------|
| v0.7 | — | Hauptsystem, Ideenplattform, Auth, User-Sync |
| v0.71 | — | User-Sync Bugfix, Admin-Seite, Login/Logout, DKIM |
| v0.72 | — | CC Kundenassistent, API-Key Management |
| v0.73 | — | UI/UX-Redesign, Shared Design System |
| v0.74 | 01.04.2026 | CC-Kunden Monorepo, MOPILOT_TEAM Bugfix, Backup-System |
| v0.8 | 05.04.2026 | User-Sync Fix, Login Self-Service, Dashboard Vianova |
| v0.8.1 | 05.04.2026 | ZEO Login DB-Auth, Passwort-Link Fix, Sentinel Sync |
| v0.9 | 06.04.2026 | Rollenspezifische Dashboards, Landing Page, DB-Auth only |
| **v1.0** | **06.04.2026** | **Infrastruktur-Vereinheitlichung: 1 Compose, 1 .env, shared-ui via Docker Build** |

**Git-Tags:** v0.73, v0.74-pre-v0.8, v0.8, v0.9

## Kritische Hinweise

- **Ein docker-compose.yml** für alle 10 Services – kein Coolify Service-Management, nur Traefik
- **Zentrale .env** – keine verstreuten .env-Dateien
- **`docker compose restart` lädt .env NICHT** – immer `down && up -d`
- **`HOSTNAME=0.0.0.0`** in Next.js Docker-Container erforderlich (sonst 502)
- **`127.0.0.1` statt `localhost`** in Docker-Healthchecks (IPv6-Trap)
- **Shared-UI via Docker Build-Stage** – kein sync-shared-ui.sh mehr
- **Config prüfen:** `docker compose config | grep KEY_NAME` zeigt aufgelöste Werte
- **Kein `rsync --delete`** verwenden
- **Vollständige Doku:** `/opt/mopilot/MoPilot_Prototype_v1.0.md`
