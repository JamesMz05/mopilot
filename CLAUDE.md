# MoPilot – Projektkontext für Claude

> Zuletzt aktualisiert: 2026-04-06 (v0.9)

## Projektbeschreibung

**MoPilot** ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum.
Prototyp v0.9 – 5 Plattformen auf einem Server mit rollenspezifischen Dashboards, integriertem KI-Chat und DB-Authentifizierung.

- **Betreiber:** ZEO Carsharing (Region Bruchsal, BW) + Car&RideSharing Community eG (Overath, NRW)
- **Zweck:** Intelligenter Assistent, der Tonalität, Wissen und Funktionen an die jeweilige Nutzerrolle anpasst
- **KI-Model:** Claude Sonnet (`claude-sonnet-4-6`) via Anthropic API

## Plattformen

| Plattform | URL | Funktion |
|-----------|-----|----------|
| Hauptsystem | https://mopilot.website | Rollenbasiertes Demo-Cockpit mit KI-Chat |
| Ideenplattform | https://ideen.mopilot.website | Ideen, Bewertungen, Kommentare, Admin |
| ZEO Kundenassistent | https://zeo-kunden.mopilot.website | KI-Chat für ZEO-Endkunden |
| CC Kundenassistent | https://cc-kunden.mopilot.website | KI-Chat für CC-Endkunden |
| CC Fuhrpark | https://ccfuhrpark.vianova.website | Digitale Fuhrparkverwaltung |
| VIANOVA Verwaltung | https://verwaltung.vianova.website | Genossenschaftsverwaltung |

## Infrastruktur

| Komponente | Details |
|------------|---------|
| Server | Hetzner CX33 – IP: `142.132.232.211` |
| OS | Ubuntu + Docker CE |
| Deployment | **Coolify 4.0** mit Docker Compose + Traefik v3.1 |
| Coolify-Dashboard | `http://localhost:8000` (via SSH-Tunnel) |
| Monitoring | Uptime Kuma (11 Monitore, Port 3001 via SSH-Tunnel) |
| SSH-Zugang | `ssh root@142.132.232.211` |
| Projektpfad Server | `/opt/mopilot/` |
| Projektpfad lokal | `C:\Users\james\Projekte\MoPilot` |

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend (alle) | Next.js 14, React 18, Tailwind CSS, TypeScript, Node 20 Alpine |
| Shared Design System | `/opt/mopilot/shared-ui/` (Tailwind Preset, globals.css, TSX-Komponenten) |
| Typografie | Plus Jakarta Sans (font-display), DM Sans (font-body) |
| Backend (Hauptsystem) | FastAPI, Python 3.11, async SQLAlchemy 2.0, Uvicorn |
| Backend (Ideenplattform) | FastAPI, Python 3.11, sync SQLAlchemy 2.0, Uvicorn |
| Backend (ZEO/CC-Kunden) | FastAPI, Python 3.11, SSE-Streaming |
| Datenbank | PostgreSQL 16 – DBs: `mopilot` + `mopilot_ideen` + `cc_fuhrpark` + `vianova_verwaltung` |
| Cache | Redis 7 Alpine, 256 MB, LRU |
| Reverse Proxy | Traefik v3.1 (via Coolify), SSL via Let's Encrypt |
| E-Mail | IONOS SMTP (smtp.ionos.de:587, STARTTLS) |
| CI/CD | GitHub Actions → SSH + rsync + Coolify API |

## Docker Services

**Hauptsystem (Coolify-managed):** frontend, backend, postgres, redis
**Ideenplattform (manuell):** ideen-backend, ideen-frontend
**ZEO-Kunden (CI/CD via rsync):** zeo-frontend, zeo-backend
**CC-Kunden (manuell via rsync):** cc-kunden-frontend, cc-kunden-backend

## Serverpfade

| System | Pfad |
|--------|------|
| Hauptsystem | `/opt/mopilot/` (Git-Repo) |
| Shared Design System | `/opt/mopilot/shared-ui/` |
| Sync-Script | `/opt/mopilot/sync-shared-ui.sh` |
| Ideenplattform | `/opt/mopilot/ideen/` |
| ZEO-Kunden (Git) | `/opt/mopilot/MoPilot_ZEO_Kunden/` |
| ZEO-Kunden (laufend) | `/opt/zeo-kunden/` |
| CC-Kunden (Git) | `/opt/mopilot/cc-kunden/` |
| CC-Kunden (laufend) | `/opt/cc-kunden/` |
| Coolify Hauptsystem | `/data/coolify/services/ns8wok04s4sgkcggwg48okcg/` |
| Backups | `/opt/backups/db/` |
| Health-Check | `/opt/mopilot/scripts/health-check-all.sh` |

## Authentifizierung

- **Registrierung:** Zentral auf ideen.mopilot.website/register
- **User-Sync:** Ideen-DB → mopilot-DB via psycopg2 (INSERT ON CONFLICT)
- **Gleiche Credentials** auf allen 4 Plattformen (separater Login pro Plattform, kein SSO)
- **Passwort-Reset (Ideenplattform):**
  - `/passwort-vergessen` → User gibt E-Mail ein → erhält Reset-Link per Mail
  - `/passwort-zuruecksetzen?token=...` → User setzt neues Passwort
- **Login-Seiten (ZEO/CC):** Enthalten Links "Passwort vergessen?" und "Noch kein Konto?" (NEU v0.8)
- **JWT-Token:** Hauptsystem 8h, Ideenplattform 24h
- **Cookie:** `demo_auth = mopilot_demo_authenticated` (httpOnly, secure, 8h)
- **Demo:** mopilot/mopilot2027 (nur mopilot.website)

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

**Passwort für alle Demo-Accounts:** `mopilot2026`

## API-Key & Secrets-Management

| Projekt | `.env`-Pfad | Pattern |
|---------|-------------|---------|
| ZEO-Kunden | `/opt/zeo-kunden/.env` | env_file: .env |
| CC-Kunden | `/opt/cc-kunden/.env` | env_file: .env |
| Hauptsystem | Coolify-managed | Coolify UI |
| Ideenplattform | `/opt/mopilot/ideen/.env` | Kein Anthropic-Key |

**KRITISCH:** ANTHROPIC_API_KEY darf NIE in `environment:` stehen (überschreibt env_file).

## Dashboard-Features (NEU v0.9)

- **Rollenspezifische Dashboards:** 10 individuelle Seiten unter `/dashboard/{rolle}` mit Schnellaktionen
- **Gemeinsames Dashboard-Layout:** Header, KI-Chat (SSE-Streaming), Sidebar mit rollenspezifischen Inhalten
- **Landing Page (`/`):** Öffentlich, zeigt 10 Rollenkarten in 3 Zonen (Kundennah/Betrieb/Strategie)
- **Kein Demo-Login mehr:** Nur DB-Authentifizierung per E-Mail/Passwort
- **Vianova Fahrzeugverwaltung:** Link im Flottenmanagement-Dashboard zu ccfuhrpark.vianova.website

## Backup & Monitoring

- **DB-Backup:** täglich 03:00, 14-Tage-Retention, 4 Datenbanken
- **Secrets-Backup:** wöchentlich Sonntag 03:30, 6 .env-Dateien
- **Hetzner-Snapshots:** 7 rotierende automatische Backups
- **Health-Check:** `bash /opt/mopilot/scripts/health-check-all.sh`
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
| **v0.9** | **06.04.2026** | **Rollenspezifische Dashboards, Landing Page, DB-Auth only** |

## Wichtige Hinweise

- **Coolify überschreibt ENV-Variablen** – Änderungen in Coolify UI, nicht in docker-compose.yml
- **sync-shared-ui.sh vor jedem Build** ausführen
- **docker compose restart lädt .env NICHT** – immer `down && up -d`
- **HOSTNAME=0.0.0.0** in Next.js Docker-Container erforderlich
- **127.0.0.1 statt localhost** in Docker-Healthchecks (IPv6-Trap)
- **Hauptsystem Login** seit v0.9 nur noch DB-Auth (Demo-Login entfernt), Login → Landing Page → Dashboard
- **ZEO Login-Route** war bis v0.8.1 nur Demo-Login – seit v0.8.1 DB-Auth Proxy
- **Ideenplattform Passwort-Seiten:** `/passwort-vergessen` (Anforderung) ≠ `/passwort-zuruecksetzen` (Token-Reset)
- **Git-Tags:** v0.74, v0.8 auf origin/master (GitHub: JamesMz05/mopilot)
