# MoPilot
**KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum**
**Prototyp v0.7**

Betreiber: ZEO Carsharing (Region Bruchsal) | Car&RideSharing Community eG (cc)
Datum: 6. März 2026

---

## Inhaltsverzeichnis

1. Zusammenfassung
2. IT-Umfeld
   - 2.1 Genutzte Werkzeuge und Technologien
   - 2.2 Server-Infrastruktur
   - 2.3 Admin und Deployment
   - 2.4 IT-Übersichtsgrafik
   - 2.5 IT-Detailgrafik
3. Deployment-Prozess (CI/CD)
   - 3.1 Übersicht
   - 3.2 Komponenten der Pipeline
   - 3.3 Ablauf eines Deployments
   - 3.4 GitHub Actions Workflow
   - 3.5 Deployment-Diagramm
4. Infrastruktur-Stabilisierung (v0.5)
   - 4.1 Analysierte Probleme
   - 4.2 Durchgeführte Maßnahmen
   - 4.3 Ergebnis
5. Bugfixes und Sicherheitsupdates (v0.6)
   - 5.1 502 Bad Gateway – ZEO-Kunden Frontend
   - 5.2 Next.js Sicherheitsupdate (14.1.0 → 14.2.35)
   - 5.3 Docker Health-Checks für alle Container
   - 5.4 ZEO-Kunden Login-Credentials
   - 5.5 UI-Anpassungen Hauptsystem
   - 5.6 Ergebnis
6. Monitoring mit Uptime Kuma (v0.6)
   - 6.1 Übersicht
   - 6.2 Installation
   - 6.3 Konfigurierte Monitore
   - 6.4 Status-Seite
   - 6.5 Zugang
7. MoPilot Ideenplattform – NEU in v0.7
   - 7.1 Projektbeschreibung und Funktionsumfang
   - 7.2 Technische Architektur
   - 7.3 Datenbank-Modelle (mopilot_ideen)
   - 7.4 API-Endpunkte
   - 7.5 Rollen und Zugriffskontrolle
   - 7.6 E-Mail-Service (SMTP)
   - 7.7 Docker Compose und Traefik-Routing
   - 7.8 Frontend
   - 7.9 Serverpfade und Dateien
8. Benutzerverwaltung und Authentifizierung – NEU in v0.7
   - 8.1 Übersicht: Plattformübergreifende Authentifizierung
   - 8.2 Registrierung (zentral über Ideenplattform)
   - 8.3 E-Mail-Verifizierung und Passwort-Reset
   - 8.4 User-Sync (Ideenplattform → mopilot DB)
   - 8.5 Login auf mopilot.website (Real Auth + Demo-Fallback)
   - 8.6 Login auf zeo-kunden.mopilot.website (Backend-Proxy)
   - 8.7 Middleware und Cookie-basierter Zugangschutz
   - 8.8 Header-Anzeige des eingeloggten Users
   - 8.9 JWT-Token und Passwort-Hashing
   - 8.10 Demo-Accounts (Seeded Users)
   - 8.11 Zusammenfassung: Auth-Architektur-Diagramm
9. ZEO Kundenassistent – Entwicklung und Deployment
   - 9.1 Projektbeschreibung und Ziel
   - 9.2 Technische Architektur
   - 9.3 Entwicklungsprozess
   - 9.4 Deployment-Ablauf
   - 9.5 Live-System
10. Nächste Schritte
11. Nächstes Sub-Projekt: hotline.mopilot.website
    - 11.1 Konzept und Zielgruppe
    - 11.2 Technische Anforderungen
    - 11.3 Entwicklungsschritte
    - 11.4 Deployment-Checkliste
    - 11.5 Zeitplan

---

## 1. Zusammenfassung

MoPilot ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum. Der Prototyp v0.7 erweitert das System um eine vollständige **Ideenplattform** (ideen.mopilot.website) mit Benutzerverwaltung, eine **plattformübergreifende Authentifizierung** mit User-Sync, sowie **echte E-Mail/Passwort-Logins** auf allen drei Websites.

### Projektkontext

E-Carsharing im ländlichen Raum steht vor besonderen Herausforderungen: geringe Bevölkerungsdichte, weite Entfernungen und heterogene Nutzergruppen. MoPilot adressiert diese Herausforderungen durch einen KI-Assistenten auf Basis von Anthropics Claude (Sonnet), der als zentrale Schnittstelle zwischen Nutzern, Betreibern und strategischen Partnern fungiert.

### Betreiber

- **ZEO Carsharing**: Region Bruchsal – primärer Betreiber
- **Car&RideSharing Community eG (cc)**: Genossenschaftliches Modell – Zweitbetreiber

### Plattformen

| Plattform | URL | Funktion |
|-----------|-----|----------|
| MoPilot Hauptsystem | https://mopilot.website | Rollenbasiertes Demo-Cockpit mit KI-Chat |
| MoPilot Ideenplattform | https://ideen.mopilot.website | Ideen, Bewertungen, Kommentare, Admin |
| ZEO Kundenassistent | https://zeo-kunden.mopilot.website | KI-Chat für ZEO-Endkunden |
| Hotline (geplant) | https://hotline.mopilot.website | Internes Hotline-Tool |

### Zugangschutz (aktualisiert in v0.7)

Alle Plattformen sind durch Login geschützt. Es gibt zwei Zugangsarten:

| Methode | Beschreibung | Gilt für |
|---------|-------------|----------|
| **E-Mail/Passwort** | Echte Authentifizierung gegen mopilot-Backend | Alle 3 Plattformen |
| **Demo-Login** | Benutzername `mopilot` / Passwort `mopilot2027` | Nur mopilot.website (Fallback) |

Neue Benutzer registrieren sich auf **ideen.mopilot.website/register** und können sich nach Verifizierung mit denselben Zugangsdaten auf allen Plattformen anmelden (User-Sync, kein SSO — separater Login pro Plattform erforderlich).

### Rollensystem

Der Prototyp implementiert 10 verschiedene Nutzerrollen in 3 Kategorien. Jede Rolle erhält einen individuell angepassten KI-Kontext:

| Kategorie | Rolle | Slug | E-Mail (Demo) | Beschreibung |
|-----------|-------|------|----------------|--------------|
| Kundennah | Endkunde | endkunde | endkunde@mopilot.website | Buchung, FAQs, Standorte |
| | Stationspate | stationspate | stationspate@mopilot.website | Standortbetreuung, Meldungen |
| | Hotline | hotline | hotline@mopilot.website | Gesprächsleitfaden, Kundenhilfe |
| Betrieb | Betreiber | betreiber | betreiber@mopilot.website | Dashboard, Kennzahlen, Strategie |
| | Flottenmanagement | flottenmanagement | flotte@mopilot.website | Fahrzeuge, Wartung, Zuweisung |
| | Fahrzeugbetreuer | fahrzeugbetreuer | fahrzeug@mopilot.website | Zustandsprüfung, Laden |
| | Plattform-Support | plattform-support | support@mopilot.website | Technik, Tickets, Systeme |
| Strategie | Projektträger | projekttraeger | traeger@mopilot.website | KPIs, Förderung, Strategie |
| | Fahrzeugsteller | fahrzeugsteller | steller@mopilot.website | Fahrzeugintegration, Verträge |
| | Validierungsstelle | validierungsstelle | validierung@mopilot.website | Führerscheinprüfung, Dokumente |

### Funktionsumfang v0.7

**Neu in v0.7 (Ideenplattform & Benutzerverwaltung)**
- MoPilot Ideenplattform (ideen.mopilot.website) – vollständige Webanwendung
- Ideen einreichen, bewerten (1–5), kommentieren, Tags zuweisen
- Hierarchische Zugriffskontrolle: Stakeholder sehen nur Ideen ihrer Rollenkategorie
- E-Mail-Verifizierung bei Registrierung (IONOS SMTP)
- Passwort-Reset via E-Mail-Link
- User-Sync: Registrierte User werden automatisch in mopilot-DB synchronisiert
- Echte E-Mail/Passwort-Logins auf mopilot.website und zeo-kunden.mopilot.website
- Demo-Login-Fallback (mopilot/mopilot2027) auf mopilot.website erhalten
- Header-Anzeige des eingeloggten Users auf allen 3 Plattformen
- Admin-Bereich: Benutzerverwaltung, CSV-Export, Statistiken
- Datei-Upload (Bilder, PDF, DOCX) an Ideen
- E-Mail-Benachrichtigung bei neuen Kommentaren
- 504 Gateway Timeout Fix (traefik.docker.network=coolify Label)

**In v0.6 (Bugfixes, Sicherheit & Monitoring)**
- 502 Bad Gateway behoben – Next.js Standalone HOSTNAME-Binding korrigiert
- Next.js Sicherheitsupdate 14.1.0 → 14.2.35 (CVE-2025-55184, CVE-2025-55183)
- Docker Health-Checks für alle Container
- Uptime Kuma Monitoring installiert und konfiguriert

**In v0.5 (Infrastruktur-Stabilisierung)**
- 4 GB Swap-Speicher, Docker restart-policies, Error Boundary
- ZEO-Kunden in CI/CD-Pipeline integriert

**mopilot.website (Hauptsystem)**
- Rollenbasierter Login mit 12 Demo-Accounts (10 ZEO + 2 CC)
- KI-Chat mit Claude Sonnet – rollenspezifische Tonalität und Wissen
- REST-API mit JWT-Authentifizierung (8h Token-Gültigkeit)
- Wissensbasis mit FAQs pro Betreiber und Rolle
- Standort-, Fahrzeug- und Tarifverwaltung
- Swagger UI für API-Dokumentation

**zeo-kunden.mopilot.website (ZEO Kundenassistent)**
- KI-Chat mit SSE-Streaming (wortweise Ausgabe)
- Kostenrechner, ÖPNV-Karte, Reichweiten-Guide, Fahrzeugkatalog, Onboarding

---

## 2. IT-Umfeld

### 2.1 Genutzte Werkzeuge und Technologien

| Bereich | Technologie | Details |
|---------|-------------|---------|
| Frontend (alle) | Next.js 14 | React-basiert, App Router, SSR, Node 20 Alpine |
| | Tailwind CSS | Utility-First CSS Framework |
| | Leaflet.js | Interaktive Karte (OpenStreetMap) für ZEO-Stationen |
| Backend (Hauptsystem) | FastAPI | Python 3.11, async, Uvicorn, SQLAlchemy 2.0 async |
| Backend (Ideenplattform) | FastAPI | Python 3.11, sync, Uvicorn, SQLAlchemy 2.0 sync |
| Backend (ZEO-Kunden) | FastAPI | Python 3.11, SSE-Streaming |
| KI-Modell | Claude Sonnet | `claude-sonnet-4-6` via Anthropic API |
| Datenbank | PostgreSQL 16 | 1 Server, 2 Datenbanken: `mopilot` + `mopilot_ideen` |
| Cache | Redis 7 | Alpine-Image, 256MB, LRU-Eviction |
| Auth (Hauptsystem) | JWT (python-jose) | 8h Token, bcrypt Passwort-Hashing (passlib) |
| Auth (Ideenplattform) | JWT (PyJWT) | 24h Verify-Token, 1h Reset-Token, bcrypt (passlib) |
| E-Mail | IONOS SMTP | smtp.ionos.de:587, STARTTLS, admin@mopilot.website |
| User-Sync | psycopg2 | Direkte DB-Verbindung Ideen → mopilot |
| Containerisierung | Docker | Multi-Stage Builds, Docker Compose, Health-Checks |
| Reverse Proxy | Traefik v3.1 | Via Coolify, SSL-Terminierung, Host-basiertes Routing |
| SSL/TLS | Let's Encrypt | Automatische Zertifikate via Traefik (certresolver) |
| Deployment | Coolify 4.0.0-beta.442 | Self-hosted PaaS, verwaltet Traefik + Container |
| CI/CD | GitHub Actions | Automatisches Deployment bei Push auf master |
| Versionskontrolle | Git + GitHub | Private Repository, Branch-basierter Workflow |
| DNS | IONOS | Domain-Verwaltung für mopilot.website (A-Records) |
| API-Dokumentation | Swagger UI | `/docs` (Hauptsystem), `/api/docs` (Ideenplattform) |
| KI-Entwicklung | Claude Code | KI-gestütztes Pair Programming (lokal + remote, CLI) |
| Monitoring | Uptime Kuma | Self-hosted, Docker, Port 3001, Status-Seite |

### 2.2 Server-Infrastruktur

| Eigenschaft | Wert |
|-------------|------|
| Anbieter | Hetzner Cloud |
| Server-Typ | CX33 (Shared vCPU) |
| IPv4 | 142.132.232.211 |
| IPv6 | 2a01:4f8:c17:b65c::1 |
| Standort | Falkenstein (FSN1), Deutschland |
| Betriebssystem | Ubuntu (Docker CE) |
| SSH-Zugang | root@142.132.232.211 (Passwort-Auth) |
| RAM | 7.6 GB |
| Swap | 4 GB (/swapfile, swappiness=10) |
| Disk | 38 GB (ca. 23 GB belegt) |
| Frontend-Domain (Hauptsystem) | https://mopilot.website |
| Backend-Domain (Hauptsystem) | https://api.mopilot.website |
| API-Dokumentation (Hauptsystem) | https://api.mopilot.website/docs |
| Frontend-Domain (Ideenplattform) | https://ideen.mopilot.website |
| API-Dokumentation (Ideenplattform) | https://ideen.mopilot.website/api/docs |
| Frontend-Domain (ZEO-Kunden) | https://zeo-kunden.mopilot.website |
| Backend-Domain (ZEO-Kunden) | https://api.zeo-kunden.mopilot.website |
| Frontend-Domain (Hotline, geplant) | https://hotline.mopilot.website |
| Coolify-Dashboard | http://localhost:8000 (via SSH-Tunnel) |
| Uptime Kuma | http://localhost:3001 (via SSH-Tunnel) |
| GitHub-Repository | github.com/JamesMz05/mopilot (privat) |

### 2.3 Admin und Deployment

**Datenbanken (PostgreSQL 16, 1 Server-Instanz)**

| Datenbank | Zweck | Zugriff |
|-----------|-------|---------|
| `mopilot` | Hauptsystem – Users, Stations, Vehicles, Tariffs, FAQs, ChatMessages | Hauptsystem-Backend (async), Ideen-Backend (sync, für User-Sync) |
| `mopilot_ideen` | Ideenplattform – Users, Roles, Ideas, Ratings, Comments, Tags, Attachments | Ideen-Backend |

**Docker Compose Services – Hauptsystem (Coolify-managed)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| frontend-ns8wok04s4sgkcggwg48okcg | Next.js (Node 20 Alpine) | unless-stopped | node fetch http://localhost:3000 | Web-Oberfläche, Auth-Middleware, API-Proxy |
| backend-ns8wok04s4sgkcggwg48okcg | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, KI-Chat, JWT-Auth |
| postgres-ns8wok04s4sgkcggwg48okcg | postgres:16-alpine | unless-stopped | pg_isready | Relationale Datenbank (mopilot + mopilot_ideen) |
| redis-ns8wok04s4sgkcggwg48okcg | redis:7-alpine | unless-stopped | — | Cache, Session-Store |

**Docker Compose Services – Ideenplattform (direkt)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| ideen-ideen-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, Auth, User-Sync |
| ideen-ideen-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | node fetch http://localhost:3000 | Web-Oberfläche, SPA |

**Docker Compose Services – ZEO-Kunden (direkt)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| mopilot_zeo_kunden-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | wget http://127.0.0.1:3000/ | Web-Oberfläche, Auth-Proxy |
| mopilot_zeo_kunden-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, SSE-Streaming |

**Docker-Sonstiges**

| Container | Image | Restart | Funktion |
|-----------|-------|---------|----------|
| uptime-kuma | louislam/uptime-kuma:1 | unless-stopped | System-Monitoring, Status-Seite |
| coolify | ghcr.io/coollabsio/coolify:4.0.0-beta.442 | unless-stopped | PaaS-Management |
| coolify-proxy | traefik:v3.1 | unless-stopped | Reverse Proxy, SSL |
| coolify-db | postgres:15-alpine | unless-stopped | Coolify-interne DB |
| coolify-redis | redis | unless-stopped | Coolify-interner Cache |
| coolify-realtime | coolify-realtime:1.0.10 | unless-stopped | Coolify Websockets |
| coolify-sentinel | sentinel:0.0.18 | unless-stopped | Coolify Monitoring-Agent |

**Serverpfade**

| System | Pfad |
|--------|------|
| Hauptsystem (Git-Repo + Build-Quelle) | `/opt/mopilot/` |
| Hauptsystem Frontend-Quellcode | `/opt/mopilot/frontend/` |
| Hauptsystem Backend-Quellcode | `/opt/mopilot/backend/` |
| Ideenplattform (komplett) | `/opt/mopilot/ideen/` |
| Ideenplattform Backend | `/opt/mopilot/ideen/backend/` |
| Ideenplattform Frontend | `/opt/mopilot/ideen/frontend/` |
| ZEO-Kunden (Git-Quelle) | `/opt/mopilot/MoPilot_ZEO_Kunden/` |
| ZEO-Kunden (laufende Instanz, rsync) | `/opt/zeo-kunden/` |
| Coolify-Konfiguration | `/data/coolify/` |
| Coolify Hauptsystem Compose | `/data/coolify/services/ns8wok04s4sgkcggwg48okcg/docker-compose.yml` |
| Uptime Kuma Daten | Docker Volume `uptime-kuma-data` |

### 2.4 IT-Übersichtsgrafik

```
+============================================================+
|                    NUTZER (Browser)                        |
|   mopilot.website / ideen.mopilot.website /               |
|   zeo-kunden.mopilot.website                               |
+==================+=========+===============================+
                   |         |
              HTTPS|    HTTPS|
                   v         v
+============================================================+
|              HETZNER CX33  (142.132.232.211)               |
|  +------------------------------------------------------+  |
|  |         COOLIFY / TRAEFIK v3.1 (Reverse Proxy)       |  |
|  |         SSL/TLS Termination + Host-based Routing      |  |
|  +--------+----------+----------+----------+------------+  |
|           |          |          |          |               |
|  +--------+----+ +---+------+ +---+------+ +----------+   |
|  | HAUPTSYSTEM | | IDEEN-   | | ZEO-     | | COOLIFY  |   |
|  | Next.js     | | PLATTFORM| | KUNDEN   | | MGMT     |   |
|  | FastAPI     | | Next.js  | | Next.js  | |          |   |
|  | PostgreSQL  | | FastAPI  | | FastAPI  | |          |   |
|  | Redis       | |          | |          | |          |   |
|  +-------------+ +----------+ +----------+ +----------+   |
|                                                           |
|  +---------------------+  +----------------------------+  |
|  | UPTIME KUMA  :3001  |  | ANTHROPIC CLOUD API (ext.) |  |
|  | Monitoring + Status |  | Claude Sonnet – KI-Modell  |  |
|  +---------------------+  +----------------------------+  |
|                                                           |
|  +-------[ PostgreSQL 16 ]----------------------------+   |
|  |  DB: mopilot       (Hauptsystem + synced Users)    |   |
|  |  DB: mopilot_ideen (Ideenplattform)                |   |
|  +----------------------------------------------------+   |
|                                                           |
|  SWAP: 4 GB  |  RAM: 7.6 GB  |  Disk: 38 GB             |
+============================================================+
```

### 2.5 IT-Detailgrafik

```
+--[ Browser ]---------------------------------------------+
|  mopilot.website/login    → E-Mail/PW oder Demo-Login   |
|  ideen.mopilot.website    → E-Mail/PW (Registrierung)   |
|  zeo-kunden.../login      → E-Mail/PW (Proxy zu mopilot)|
+-----+----------------------------------------------------+
      |  HTTPS
      v
+--[ Coolify Reverse Proxy / Traefik v3.1 ]----------------+
|  mopilot.website             → frontend:3000              |
|  api.mopilot.website         → backend:8000               |
|  ideen.mopilot.website       → ideen-frontend:3000        |
|  ideen.mopilot.website/api/* → ideen-backend:8000 (prio20)|
|  zeo-kunden.mopilot.website  → zeo-frontend:3000          |
|  api.zeo-kunden...           → zeo-backend:8000           |
+-----+----------------------------------------------------+
      |
      v
+--[ Next.js Frontends :3000 ]-----------------------------+
|  middleware.ts: Cookie-Check (demo_auth Cookie)           |
|  /api/auth/login: Server-Side Proxy → Backend             |
|  app/error.tsx: Error Boundary (Deployment-Schutz)        |
|  HOSTNAME=0.0.0.0 (Docker-Binding)                        |
+-----+----------------------------------------------------+
      |
      v
+--[ FastAPI Backends :8000 ]------------------------------+
|  Hauptsystem:                                             |
|    /api/auth/login → JWT Token (8h), bcrypt verify        |
|    /api/chat/send  → Claude Sonnet (non-streaming)        |
|    /api/chat/stream → Claude Sonnet (SSE-Streaming)       |
|    /api/health, /api/knowledge/, /api/stations/           |
|                                                           |
|  Ideenplattform:                                          |
|    /api/auth/register → User anlegen + Verify-Mail        |
|    /api/auth/login → JWT Token, E-Mail-Verify-Check       |
|    /api/ideas/ → CRUD + Ratings + Comments + Tags         |
|    /api/roles/, /api/tags/, /api/users/, /api/export/     |
|    User-Sync → INSERT in mopilot-DB via psycopg2          |
|                                                           |
|  ZEO-Kunden:                                              |
|    /api/chat → Claude Sonnet (SSE-Streaming)              |
|    /api/health                                            |
+------+-----------------------+---------------------------+
       |                       |
       v                       v
+--[ PostgreSQL 16 ]---+  +--[ Anthropic Cloud ]---+
|  DB: mopilot         |  |  Claude Sonnet         |
|    Users (12 seed +  |  |  Rollenspez. Prompt    |
|     synced from Ideen)|  +------------------------+
|    ChatMessages      |
|    Stations, Vehicles|  +--[ IONOS SMTP ]--------+
|    Tariffs, FAQs     |  |  smtp.ionos.de:587     |
|                      |  |  Verify + Reset Mails  |
|  DB: mopilot_ideen   |  |  Kommentar-Benachr.    |
|    Users, Roles      |  +------------------------+
|    Ideas, Ratings    |
|    Comments, Tags    |
|    Attachments       |
+----------------------+
```

---

## 3. Deployment-Prozess (CI/CD)

### 3.1 Übersicht

Die CI/CD-Pipeline deckt Hauptsystem und ZEO-Kunden ab. Die Ideenplattform wird aktuell manuell deployed (`docker compose up -d --build` in `/opt/mopilot/ideen/`). Jeder Push auf `master` deployt automatisch Hauptsystem und ZEO-Kunden.

### 3.2 Komponenten der Pipeline

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| Versionskontrolle | Git + GitHub | Quellcode aller Systeme in einem Repository |
| CI/CD-Runner | GitHub Actions | Automatisierte Pipeline bei Push auf master |
| Server-Zugriff | SSH (appleboy/ssh-action) | Code-Synchronisation + ZEO-Kunden Rebuild |
| Hauptsystem Rebuild | Coolify API | Container-Rebuild via Webhook |
| ZEO-Kunden Rebuild | docker compose | Direkter Rebuild auf dem Server |
| Code-Sync ZEO-Kunden | rsync | Synchronisiert `MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/` |

**GitHub Secrets**

| Secret | Zweck |
|--------|-------|
| SERVER_SSH_PASSWORD | SSH-Passwort für root@142.132.232.211 |
| GH_PAT | GitHub Personal Access Token (repo-Scope) |
| COOLIFY_TOKEN | API-Token für Coolify Rebuild |

### 3.3 Ablauf eines Deployments

1. **Lokale Entwicklung**: Code bearbeiten in `C:\Projekte\MoPilot`
2. **Git Commit & Push** auf master
3. **GitHub Actions startet** automatisch
4. **SSH auf Server**: `git reset --hard FETCH_HEAD` – beide Systeme aktuell
5. **rsync**: ZEO-Kunden Code von `/opt/mopilot/MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/`
6. **ZEO-Kunden Rebuild**: `docker compose up -d --build`
7. **Coolify Rebuild**: Hauptsystem-Container werden neu gebaut
8. **Live**: beide Systeme aktualisiert, typisch in unter 3 Minuten

**Ideenplattform (manuell):**
```bash
cd /opt/mopilot/ideen
docker compose up -d --build
```

### 3.4 GitHub Actions Workflow

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Pull code + deploy ZEO-Kunden
        uses: appleboy/ssh-action@v1
        with:
          host: 142.132.232.211
          username: root
          password: ${{ secrets.SERVER_SSH_PASSWORD }}
          script: |
            cd /opt/mopilot
            git fetch https://${{ secrets.GH_PAT }}@github.com/JamesMz05/mopilot.git master
            git reset --hard FETCH_HEAD
            echo "Hauptsystem: $(git rev-parse --short HEAD)"
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/frontend/ /opt/zeo-kunden/frontend/
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/backend/ /opt/zeo-kunden/backend/
            echo "ZEO-Kunden Code synchronisiert"
            cd /opt/zeo-kunden
            docker compose up -d --build
            echo "ZEO-Kunden deployed"

      - name: Coolify Rebuild (Hauptsystem)
        run: |
          curl -s -X GET \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            "https://coolify.pydna.de/api/v1/deploy?uuid=ns8wok04s4sgkcggwg48okcg&force=true"
```

### 3.5 Deployment-Diagramm

```
+--[ Entwickler-PC ]-----+
|  C:\Projekte\MoPilot   |
|  Code bearbeiten       |
|  git commit + push     |
+----------+-------------+
           |
           | git push (HTTPS)
           v
+--[ GitHub ]---------------------------------------+
|  Repository: JamesMz05/mopilot (privat)           |
|  Branch: master                                   |
|                                                   |
|  +--[ GitHub Actions ]-------------------------+  |
|  |  Trigger: push auf master                  |  |
|  |                                            |  |
|  |  Step 1: SSH auf Server                    |  |
|  |    → git reset --hard (alle Systeme)       |  |
|  |    → rsync ZEO-Kunden Code                 |  |
|  |    → docker compose up --build (ZEO)       |  |
|  |                                            |  |
|  |  Step 2: Coolify API                       |  |
|  |    → Hauptsystem Rebuild                   |  |
|  +--------------------------------------------+  |
+-------+--------------------+----------------------+
        |                    |
   SSH  |          HTTPS API |
        v                    v
+--[ Hetzner Server ]-----------------------------+
|  /opt/mopilot/       ← Hauptsystem (Git-Repo)   |
|  /opt/mopilot/ideen/ ← Ideenplattform (manuell) |
|  /opt/zeo-kunden/    ← ZEO-Kunden (rsync)       |
|                                                  |
|  Coolify: Hauptsystem rebuild                    |
|  Docker Compose: ZEO-Kunden rebuild              |
|  Docker Compose: Ideen manuell                   |
+--------------------------------------------------+
```

---

## 4. Infrastruktur-Stabilisierung (v0.5)

### 4.1 Analysierte Probleme

Am 4. März 2026 wurde eine vollständige Systemanalyse per SSH-Direktzugriff auf den Server durchgeführt. Dabei wurden folgende Probleme identifiziert:

| # | Problem | Schwere | Auswirkung |
|---|---------|---------|------------|
| 1 | Kein `restart: unless-stopped` bei ZEO-Kunden | Kritisch | Container nach Crash dauerhaft tot |
| 2 | Kein Swap-Speicher | Kritisch | OOM-Kill bei Speicherdruck ohne Wiederherstellung |
| 3 | Alter Container-Müll (2x Exited) | Gering | Unordnung, Verwirrung |
| 4 | ZEO-Kunden nicht in CI/CD | Mittel | Manuelle Deployments fehleranfällig |
| 5 | Kein Next.js Error Boundary | Mittel | Deployment-Versionskonflikt-Crashes für aktive Nutzer |
| 6 | Viele nicht versionierte Dateien im Git | Mittel | Dateiverlust bei nächstem Deploy möglich |

### 4.2 Durchgeführte Maßnahmen

**Swap-Speicher eingerichtet**

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

**Restart-Policy, Container-Bereinigung, Error Boundary, CI/CD-Erweiterung** – alle wie in v0.5 dokumentiert.

### 4.3 Ergebnis

Alle Maßnahmen erfolgreich umgesetzt. Container laufen stabil mit Restart-Policy. Swap schützt vor OOM-Kills.

---

## 5. Bugfixes und Sicherheitsupdates (v0.6)

### 5.1 502 Bad Gateway – ZEO-Kunden Frontend

**Ursache**: Next.js Standalone-Modus verwendete Docker-HOSTNAME statt `0.0.0.0` als Bind-Adresse.

**Fix**: `HOSTNAME=0.0.0.0` in docker-compose.yml und Dockerfile.

### 5.2 Next.js Sicherheitsupdate (14.1.0 → 14.2.35)

CVE-2025-55184 (DoS) und CVE-2025-55183 (Source Code Leak) behoben.

### 5.3 Docker Health-Checks für alle Container

Alle 6 Container (Frontend, Backend, Postgres, Redis, ZEO-Frontend, ZEO-Backend) haben Health-Checks.

### 5.4 ZEO-Kunden Login-Credentials

Korrektur von `mopilot2016` auf `mopilot2027`.

### 5.5 UI-Anpassungen Hauptsystem

Header-Logos (MoPilot + BMEL-Förderlogo), Demo-Hinweis aktualisiert.

### 5.6 Ergebnis

Alle Endpunkte erreichbar und healthy.

---

## 6. Monitoring mit Uptime Kuma (v0.6)

### 6.1 Übersicht

Uptime Kuma überwacht alle MoPilot-Endpunkte und alarmiert bei Ausfällen.

### 6.2 Installation

```bash
docker run -d \
  --name uptime-kuma \
  --restart unless-stopped \
  --network coolify \
  -p 3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:1
```

### 6.3 Konfigurierte Monitore

| # | Monitor | URL / Ziel | Intervall |
|---|---------|------------|-----------|
| 1 | MoPilot API | https://api.mopilot.website/api/health | 60s |
| 2 | ZEO-Kunden API | https://api.zeo-kunden.mopilot.website/api/health | 60s |
| 3 | MoPilot Frontend | https://mopilot.website | 60s |
| 4 | ZEO-Kunden Frontend | https://zeo-kunden.mopilot.website | 60s |
| 5 | Server Ping | 142.132.232.211 | 60s |

### 6.4 Status-Seite

Öffentliche Status-Seite unter https://status.mopilot.website/status/mopilot

### 6.5 Zugang

```bash
ssh -L 3001:localhost:3001 root@142.132.232.211
# Dann: http://localhost:3001
```

---

## 7. MoPilot Ideenplattform – NEU in v0.7

### 7.1 Projektbeschreibung und Funktionsumfang

Die MoPilot Ideenplattform (ideen.mopilot.website) ist eine Webanwendung, in der alle MoPilot-Stakeholder Ideen einreichen, bewerten und diskutieren können. Jede Rolle sieht nur Ideen aus ihrer Rollenkategorie (hierarchische Zugriffskontrolle).

**Kernfunktionen:**
- Ideen einreichen mit Titel, Beschreibung, Rolle und optionalen Datei-Anhängen
- Bewertung (1–5 Sterne) mit Durchschnittsanzeige
- Kommentare mit E-Mail-Benachrichtigung an den Ideen-Autor
- Tags zur Kategorisierung
- Filtermöglichkeiten: nach Rolle, Status, Sortierung (neueste, beste Bewertung, meiste Kommentare)
- Admin-Bereich: Benutzerverwaltung, Statusänderungen, CSV-Export, Plattform-Statistiken
- Datei-Upload: JPG, PNG, PDF, DOCX (max. 10 MB)

**Seed-Daten:**
- 10 Rollen (je mit Name, Slug, Kategorie, Tagline)
- 1 Admin-User (admin@mopilot.website)
- 30 Seed-Ideen verteilt über alle Rollen

### 7.2 Technische Architektur

```
+============================================================+
|               NUTZER (Browser)                             |
|   https://ideen.mopilot.website                            |
+==========================+=================================+
                           |  HTTPS
                           v
+============================================================+
|         HETZNER CX33  (142.132.232.211)                    |
|                                                            |
|  +------------------------------------------------------+  |
|  |  TRAEFIK – Host: ideen.mopilot.website               |  |
|  |  PathPrefix(/api) → Backend (Prio 20)                |  |
|  |  Alles andere    → Frontend (Prio 10)                |  |
|  +-------------+----------------------------+-----------+  |
|                |                            |               |
|  +-------------+----------+  +--------------+-----------+   |
|  |  FRONTEND  :3000        |  |  BACKEND  :8000          |  |
|  |  Next.js 14.2.21        |  |  FastAPI (Python 3.11)   |  |
|  |  React 18, Tailwind     |  |  SQLAlchemy 2.0 (sync)   |  |
|  |  Custom useAuth hook    |  |  PyJWT, Passlib/bcrypt   |  |
|  |  HOSTNAME=0.0.0.0      |  |  psycopg2 (User-Sync)    |  |
|  +------------------------+  +-----------+--------------+   |
|                                          |                  |
|               +----------+----------+----+----+             |
|               |          |          |         |             |
|               v          v          v         v             |
|   +----------+   +------+---+  +---+------+  +----------+  |
|   | PG: mopi-|   | PG: mopi-|  | IONOS   |  | Uploads  |  |
|   | lot_ideen|   | lot (sync|  | SMTP    |  | Volume   |  |
|   | (eigene  |   | Ziel-DB) |  | :587    |  |          |  |
|   | DB)      |   |          |  |         |  |          |  |
|   +----------+   +----------+  +---------+  +----------+  |
+============================================================+
```

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14.2.21, React 18, Tailwind CSS | Custom Auth-Hook, deutschsprachig |
| Backend | FastAPI 0.115.6, Uvicorn 0.34.0 | Sync SQLAlchemy, strukturiertes JSON-Logging |
| ORM | SQLAlchemy 2.0.36 | Sync, psycopg2-binary als Driver |
| Auth | PyJWT 2.10.1, Passlib 1.7.4 (bcrypt) | JWT HS256, 24h Verify-Token, 1h Reset-Token |
| DB | PostgreSQL 16 | Eigene DB `mopilot_ideen` auf gemeinsamem Server |
| E-Mail | smtplib, IONOS SMTP | Verifizierung, Passwort-Reset, Kommentar-Benachrichtigung |
| User-Sync | psycopg2 (direkt) | INSERT ON CONFLICT in mopilot-DB |
| Datei-Upload | python-multipart | Max 10 MB, JPG/PNG/PDF/DOCX |
| Migrations | Alembic 1.14.1 | DB-Schema-Versionierung |

### 7.3 Datenbank-Modelle (mopilot_ideen)

**Enums:**

| Enum | Werte |
|------|-------|
| UserType | `stakeholder`, `team`, `admin` |
| RoleCategory | `kundennah`, `betrieb`, `strategie` |
| IdeaStatus | `neu`, `in_diskussion`, `geplant`, `umgesetzt`, `abgelehnt` |

**Tabellen:**

| Tabelle | Felder | Beziehungen |
|---------|--------|-------------|
| **users** | id, email (unique), name, role_id (FK→roles), user_type, password_hash, email_verified, created_at | → Role, → Ideas, → Ratings, → Comments |
| **roles** | id, name (unique), slug (unique), category, description, email_alias, tagline | → Users, → Ideas |
| **ideas** | id, title, description, author_id (FK→users), role_id (FK→roles), status, created_at, updated_at | → Author, → Role, → Ratings, → Comments, → Attachments |
| **ratings** | id, idea_id (FK→ideas, cascade), user_id (FK→users), score (1-5), created_at | UniqueConstraint(idea_id, user_id) |
| **comments** | id, idea_id (FK→ideas, cascade), user_id (FK→users), text, created_at | |
| **attachments** | id, idea_id (FK→ideas, cascade), filename, original_filename, content_type, size, created_at | |
| **tags** | id, name (unique), slug (unique) | |
| **idea_tags** | id, idea_id (FK→ideas, cascade), tag_id (FK→tags, cascade) | UniqueConstraint(idea_id, tag_id) |

### 7.4 API-Endpunkte

**Auth (/api/auth)**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| POST | /api/auth/register | Nein | Registrierung + Verify-Mail |
| POST | /api/auth/login | Nein | Login → JWT |
| GET | /api/auth/verify?token= | Nein | E-Mail-Verifizierung |
| POST | /api/auth/forgot-password | Nein | Reset-Mail senden |
| POST | /api/auth/reset-password | Nein | Passwort zurücksetzen |
| POST | /api/auth/resend-verification | Nein | Verify-Mail erneut senden |
| GET | /api/auth/me | JWT | Eigenes Profil |

**Ideas (/api/ideas)**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| GET | /api/ideas | JWT | Liste (Filter: role, status; Sort: newest, best_rating, most_comments) |
| GET | /api/ideas/{id} | JWT | Detail mit Aggregaten |
| POST | /api/ideas | JWT | Erstellen (Rollenzugriff geprüft) |
| PUT | /api/ideas/{id} | JWT | Bearbeiten (Autor/Admin; Status nur Admin) |
| DELETE | /api/ideas/{id} | JWT (Admin) | Löschen |
| POST | /api/ideas/{id}/rate | JWT | Bewerten 1-5 (Upsert) |
| GET | /api/ideas/{id}/ratings | JWT | Bewertungsübersicht |
| POST | /api/ideas/{id}/comments | JWT | Kommentar + E-Mail-Benachrichtigung |
| GET | /api/ideas/{id}/comments | JWT | Kommentare auflisten |
| POST | /api/ideas/{id}/attachments | JWT | Datei hochladen (max 10MB) |
| GET | /api/ideas/{id}/attachments | JWT | Anhänge auflisten |
| DELETE | /api/ideas/{id}/attachments/{aid} | JWT | Anhang löschen |
| GET | /api/ideas/{id}/attachments/{aid}/download | Nein | Datei herunterladen |
| POST | /api/ideas/{id}/tags/{tid} | JWT | Tag zuweisen |
| DELETE | /api/ideas/{id}/tags/{tid} | JWT | Tag entfernen |
| GET | /api/ideas/{id}/tags | Nein | Tags der Idee |

**Weitere**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| GET | /api/roles | Nein | Alle Rollen mit Ideen-Anzahl |
| GET | /api/roles/{slug} | Nein | Rollen-Detail |
| GET | /api/tags | Nein | Alle Tags |
| POST | /api/tags | JWT (Team/Admin) | Tag erstellen |
| DELETE | /api/tags/{id} | JWT (Admin) | Tag löschen |
| GET | /api/users | JWT (Admin) | Alle Benutzer |
| DELETE | /api/users/{id} | JWT (Admin) | Benutzer löschen (Cascade) |
| DELETE | /api/comments/{id} | JWT (Autor/Admin) | Kommentar löschen |
| GET | /api/export/ideas | JWT (Admin) | CSV-Export |
| GET | /api/export/stats | JWT (Admin) | Plattform-Statistiken |
| GET | /api/health | Nein | Health-Check |

### 7.5 Rollen und Zugriffskontrolle

**User-Typen:**

| Typ | Rechte |
|-----|--------|
| stakeholder | Sieht nur Ideen aus zugänglichen Rollenkategorien; muss eine Rolle haben |
| team | Sieht alle Ideen; kann Tags erstellen |
| admin | Vollzugriff: User verwalten, Status ändern, löschen, exportieren |

**Hierarchische Kategorie-Zugriffskontrolle:**

Stakeholder sehen Ideen aus ihrer eigenen Rollenkategorie plus alle darunterliegenden. Die Hierarchie ist: `strategie` > `betrieb` > `kundennah`.

| Benutzer-Kategorie | Sieht Ideen aus |
|---------------------|-----------------|
| kundennah | nur kundennah |
| betrieb | betrieb + kundennah |
| strategie | strategie + betrieb + kundennah (alles) |

**Rollen mit Taglines:**

| Slug | Name | Kategorie | Tagline |
|------|------|-----------|---------|
| endkunde | Endkunde | kundennah | "Ideen für bessere Mobilität im Alltag" |
| stationspate | Stationspate | kundennah | "Standorte verbessern, Community stärken" |
| hotline | Hotline | kundennah | "Erfahrungen aus dem direkten Kundenkontakt" |
| betreiber | Betreiber | betrieb | "Strategie und Weiterentwicklung gestalten" |
| flottenmanagement | Flottenmanagement | betrieb | "Fahrzeugflotte optimal einsetzen" |
| fahrzeugbetreuer | Fahrzeugbetreuer | betrieb | "Qualität und Verfügbarkeit sichern" |
| plattform-support | Plattform-Support | betrieb | "Technik und Prozesse verbessern" |
| projekttraeger | Projektträger | strategie | "Förderziele erreichen, Wirkung messen" |
| fahrzeugsteller | Fahrzeugsteller | strategie | "Integration und Partnerschaften stärken" |
| validierungsstelle | Validierungsstelle | strategie | "Compliance und Qualitätssicherung" |

### 7.6 E-Mail-Service (SMTP)

| Einstellung | Wert |
|-------------|------|
| SMTP-Host | smtp.ionos.de |
| SMTP-Port | 587 (STARTTLS) |
| SMTP-User | admin@mopilot.website |
| SMTP-Passwort | Verrueckte1Normalitaet |
| Absender | noreply@mopilot.website |
| BASE_URL | https://ideen.mopilot.website |

**Gesendete E-Mails:**

| Typ | Betreff | Trigger |
|-----|---------|---------|
| Verifizierung | "E-Mail-Adresse bestätigen – MoPilot Ideenplattform" | Registrierung |
| Passwort-Reset | "Passwort zurücksetzen – MoPilot Ideenplattform" | Forgot-Password |
| Kommentar-Benachrichtigung | "Neuer Kommentar zu Ihrer Idee: {Titel}" | Neuer Kommentar |

Alle E-Mails verwenden MoPilot-gebrandete HTML-Templates mit grünem Header (#2D6A4F).

### 7.7 Docker Compose und Traefik-Routing

**Datei:** `/opt/mopilot/ideen/docker-compose.yml`

```yaml
services:
  ideen-backend:
    build: ./backend
    expose: ["8000"]
    environment:
      DATABASE_URL: postgresql+psycopg2://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot_ideen
      JWT_SECRET: <secret>
      CORS_ORIGINS: https://ideen.mopilot.website
      SMTP_HOST: smtp.ionos.de
      SMTP_PORT: "587"
      SMTP_USER: admin@mopilot.website
      SMTP_PASSWORD: <password>
      SMTP_FROM: noreply@mopilot.website
      BASE_URL: https://ideen.mopilot.website
    volumes: [uploads:/app/uploads]
    networks: [ideen-net, coolify]
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - traefik.http.routers.ideen-backend.rule=Host(`ideen.mopilot.website`) && PathPrefix(`/api`)
      - traefik.http.routers.ideen-backend.priority=20
      - traefik.http.routers.ideen-backend.tls.certresolver=letsencrypt

  ideen-frontend:
    build: ./frontend
    expose: ["3000"]
    environment:
      BACKEND_URL: http://ideen-backend:8000
    networks: [ideen-net, coolify]
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - traefik.http.routers.ideen-frontend.rule=Host(`ideen.mopilot.website`)
      - traefik.http.routers.ideen-frontend.priority=10
      - traefik.http.routers.ideen-frontend.tls.certresolver=letsencrypt

networks:
  ideen-net: { driver: bridge }
  coolify: { external: true }

volumes:
  uploads:
```

**Traefik-Routing-Logik:** PathPrefix `/api` → Backend (Priorität 20), alles andere → Frontend (Priorität 10). Beide auf derselben Domain `ideen.mopilot.website`.

**Wichtig:** Das Label `traefik.docker.network=coolify` ist erforderlich, da die Container in mehreren Netzwerken sind. Ohne dieses Label kann Traefik die IP-Adresse nicht finden (504 Gateway Timeout).

### 7.8 Frontend

| Eigenschaft | Wert |
|-------------|------|
| Framework | Next.js 14.2.21 (App Router) |
| UI | React 18.3, Tailwind CSS 3.4 |
| Sprache | TypeScript 5, deutschsprachig |
| Auth | Custom `useAuth` Hook (JWT in localStorage) |
| Branding | "MoPilot – Ideenplattform", Farbe `#2D6A4F` (mopilot-green) |
| Admin | Eigener `/admin`-Bereich (nur für user_type=admin sichtbar) |

**Wichtige Seiten:**
- `/` – Rollenübersicht mit Ideenanzahlen
- `/ideen` – Ideenliste mit Filtern
- `/idee/{id}` – Ideen-Detail mit Bewertungen, Kommentaren, Anhängen
- `/neue-idee` – Neue Idee einreichen
- `/login` – Login
- `/register` – Registrierung mit Rollenauswahl
- `/verify` – E-Mail-Verifizierung
- `/passwort-zuruecksetzen` – Passwort-Reset
- `/admin` – Admin-Bereich (Benutzer, Statistiken, Export)

### 7.9 Serverpfade und Dateien

| Pfad | Inhalt |
|------|--------|
| `/opt/mopilot/ideen/docker-compose.yml` | Docker Compose Konfiguration |
| `/opt/mopilot/ideen/.env` | Umgebungsvariablen (SMTP-Credentials etc.) |
| `/opt/mopilot/ideen/backend/app/main.py` | FastAPI App-Initialisierung, Seeding |
| `/opt/mopilot/ideen/backend/app/models.py` | SQLAlchemy Modelle |
| `/opt/mopilot/ideen/backend/app/schemas.py` | Pydantic Schemas (inkl. UserOut mit role_name) |
| `/opt/mopilot/ideen/backend/app/database.py` | DB-Session und Engine |
| `/opt/mopilot/ideen/backend/app/auth.py` | JWT-Hilfsfunktionen, Token-Erstellung |
| `/opt/mopilot/ideen/backend/app/email.py` | SMTP E-Mail-Service |
| `/opt/mopilot/ideen/backend/app/user_sync.py` | User-Sync in mopilot-DB |
| `/opt/mopilot/ideen/backend/app/routers/auth.py` | Auth-Endpunkte (Register, Login, Verify, Reset) |
| `/opt/mopilot/ideen/backend/app/routers/ideas.py` | Ideas CRUD + Ratings + Comments |
| `/opt/mopilot/ideen/backend/app/routers/roles.py` | Rollen-Endpunkte |
| `/opt/mopilot/ideen/backend/app/routers/tags.py` | Tags-Endpunkte |
| `/opt/mopilot/ideen/backend/app/routers/users.py` | User-Verwaltung (Admin) |
| `/opt/mopilot/ideen/backend/app/routers/export.py` | CSV-Export und Statistiken |
| `/opt/mopilot/ideen/backend/app/seed.py` | Rollen, Admin-User, 30 Seed-Ideen |
| `/opt/mopilot/ideen/frontend/src/lib/auth.tsx` | useAuth Hook, User Interface (inkl. role_name) |
| `/opt/mopilot/ideen/frontend/src/components/Header.tsx` | Header mit User-Anzeige |

---

## 8. Benutzerverwaltung und Authentifizierung – NEU in v0.7

### 8.1 Übersicht: Plattformübergreifende Authentifizierung

In v0.7 wurde ein plattformübergreifendes Authentifizierungssystem implementiert:

```
+---[ Registrierung ]---+
|  ideen.mopilot.website |  ← Einziger Ort für neue Accounts
|  /register             |
+-----------+------------+
            |
   (1) User in mopilot_ideen DB
   (2) Verify-E-Mail senden
   (3) Nach Verifizierung: Sync → mopilot DB
            |
+-----------v-------------------------------------------+
|              mopilot PostgreSQL DB                     |
|  User mit gleichem E-Mail + Passwort-Hash + Rolle     |
+-------+------------------+------------------+---------+
        |                  |                  |
   Login mit           Login mit           Login mit
   gleichen            gleichen            gleichen
   Credentials         Credentials         Credentials
        |                  |                  |
+-------v------+  +-------v-------+  +------v---------+
| mopilot      |  | ideen.mopilot |  | zeo-kunden     |
| .website     |  | .website      |  | .mopilot       |
| /login       |  | /login        |  | .website/login |
+--------------+  +---------------+  +----------------+
```

**Wichtig:** Dies ist **kein Single Sign-On (SSO)**. Benutzer müssen sich auf jeder Plattform separat anmelden, verwenden aber überall dieselben Zugangsdaten.

### 8.2 Registrierung (zentral über Ideenplattform)

Neue Benutzer registrieren sich ausschließlich auf `ideen.mopilot.website/register`:

1. Formular: E-Mail, Name, Passwort, Rolle (Dropdown mit allen 10 Rollen)
2. User wird in `mopilot_ideen.users` angelegt mit `email_verified=false`
3. Verifizierungs-E-Mail wird gesendet (Link gültig 24 Stunden)
4. Nach Klick auf Verify-Link: `email_verified=true` + User-Sync in mopilot-DB

Auf den Login-Seiten von mopilot.website und zeo-kunden.mopilot.website gibt es jeweils einen Link:
> "Noch kein Konto? Auf der Ideenplattform registrieren" → https://ideen.mopilot.website/register

### 8.3 E-Mail-Verifizierung und Passwort-Reset

**E-Mail-Verifizierung:**

| Schritt | Details |
|---------|---------|
| Trigger | Registrierung (wenn SMTP konfiguriert) |
| Token | JWT mit purpose="verify", 24h Gültigkeit |
| Link | `https://ideen.mopilot.website/verify?token=...` |
| Aktion | `email_verified=true` setzen, User-Sync auslösen |
| Anti-Enumeration | `/resend-verification` gibt immer 200 zurück |

**Passwort-Reset:**

| Schritt | Details |
|---------|---------|
| Trigger | POST /api/auth/forgot-password mit E-Mail |
| Token | JWT mit purpose="reset", 1h Gültigkeit |
| Link | `https://ideen.mopilot.website/passwort-zuruecksetzen?token=...` |
| Aktion | Neues Passwort setzen in Ideen-DB + Sync neuer Hash in mopilot-DB |
| Anti-Enumeration | Gibt immer 200 zurück, auch bei unbekannter E-Mail |

### 8.4 User-Sync (Ideenplattform → mopilot DB)

**Datei:** `/opt/mopilot/ideen/backend/app/user_sync.py`

Der User-Sync schreibt Benutzer aus der Ideenplattform in die mopilot-Datenbank, damit dieselben Zugangsdaten auf allen Plattformen funktionieren.

**Verbindung:** Direkte psycopg2-Verbindung zur mopilot-DB:
```
postgresql://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot
```

**Rollen-Mapping (Ideen-Slug → mopilot PostgreSQL ENUM):**

| Ideen-Slug | mopilot-DB Enum (UPPERCASE!) |
|------------|------|
| endkunde | ENDKUNDE |
| stationspate | STATIONSPATE |
| hotline | HOTLINE |
| betreiber | BETREIBER |
| flottenmanagement | FLOTTENMANAGEMENT |
| fahrzeugbetreuer | FAHRZEUGBETREUER |
| plattform-support | PLATTFORM_SUPPORT |
| projekttraeger | PROJEKTTRAEGER |
| fahrzeugsteller | FAHRZEUGSTELLER |
| validierungsstelle | VALIDIERUNGSSTELLE |

**Wichtig:** Die mopilot-DB verwendet PostgreSQL ENUM-Typen mit GROSSBUCHSTABEN. Ein Mismatch (z.B. `betreiber` statt `BETREIBER`) führt zu `InvalidTextRepresentation`-Fehlern.

**Sync-Funktionen:**

| Funktion | Trigger | SQL-Operation |
|----------|---------|---------------|
| `sync_user_to_mopilot(email, name, hash, role_slug, operator)` | Registrierung (ohne SMTP), E-Mail-Verifizierung | INSERT ... ON CONFLICT(email) DO UPDATE |
| `update_password_in_mopilot(email, hash)` | Passwort-Reset | UPDATE users SET hashed_password WHERE email |

**Regeln:**
- Admin/Team-User ohne Rolle werden NICHT synchronisiert
- Unbekannte Rollen-Slugs werden übersprungen
- Sync-Fehler sind nicht-blockierend (geloggt, aber kein Abbruch)
- bcrypt-Hashes sind direkt kompatibel (passlib in beiden Systemen)
- Default-Operator: `"zeo"`

### 8.5 Login auf mopilot.website (Real Auth + Demo-Fallback)

**Datei:** `/opt/mopilot/frontend/app/api/auth/login/route.ts`

Die Login-API-Route auf mopilot.website hat eine Dual-Path-Strategie:

```
Browser → POST /api/auth/login (Next.js API Route)
  |
  |── loginId enthält '@' → Proxy an mopilot-Backend
  |     |── Backend 200 OK → JWT + User + Cookie setzen
  |     |── Backend Fehler  → "E-Mail oder Passwort falsch"
  |
  |── loginId = 'mopilot' && PW = 'mopilot2027' → Demo-Login
  |     |── Cookie setzen, kein JWT
  |     |── User: { name: 'Demo User', role: 'demo' }
  |
  |── Sonst → "Ungültige Anmeldedaten"
```

**Login-Seite** (`/opt/mopilot/frontend/app/login/page.tsx`):
- Feld: "E-Mail oder Benutzername" (type="text")
- Sendet als `{ email }` wenn `@` enthalten, sonst als `{ username }`
- Bei Erfolg: Token + User in localStorage, Redirect zu `/dashboard`
- Link zu ideen.mopilot.website/register

**Rollenauswahl auf Home-Page** (`/opt/mopilot/frontend/app/page.tsx`):
- 10 Rollenkarten mit direktem Login
- Rufen `https://api.mopilot.website/api/auth/login` direkt auf (nicht die Next.js API Route)
- Verwenden Demo-E-Mails (z.B. `betreiber@mopilot.website`) + Passwort `mopilot2026`
- Endkunde-Karte verlinkt extern auf zeo-kunden.mopilot.website

### 8.6 Login auf zeo-kunden.mopilot.website (Backend-Proxy)

**Datei:** `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/api/auth/login/route.ts`

Gleiche Proxy-Architektur wie mopilot.website, aber ohne Demo-Fallback:

```
Browser → POST /api/auth/login (Next.js API Route)
  |
  |── Proxy an mopilot-Backend (AUTH_API_URL)
  |     |── Backend 200 OK → JWT + User + Cookie setzen
  |     |── Backend Fehler  → "Ungültige Anmeldedaten"
  |
  |── Backend nicht erreichbar → "Server nicht erreichbar"
```

**Umgebungsvariable:**
```
AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000
```

### 8.7 Middleware und Cookie-basierter Zugangschutz

Alle drei Frontends (mopilot.website, zeo-kunden.mopilot.website) verwenden dasselbe Middleware-Pattern:

**Cookie-Details:**

| Eigenschaft | Wert |
|-------------|------|
| Name | `demo_auth` |
| Wert | `mopilot_demo_authenticated` |
| httpOnly | true |
| secure | true (Production) |
| sameSite | lax |
| maxAge | 8 Stunden |

**Middleware-Logik:**
1. Erlaubte Pfade (kein Cookie nötig): `/login`, `/api/auth/*`, `/impressum`, `/datenschutz`
2. Alle anderen Pfade: Cookie `demo_auth` muss den Wert `mopilot_demo_authenticated` haben
3. Fehlender/falscher Cookie → Redirect zu `/login`

**Wichtig:** Die Middleware prüft NICHT den JWT-Token. Sie ist ein einfacher Boolean-Gate. Die eigentliche Autorisierung (JWT-Prüfung) findet auf Backend-Ebene statt.

Die Ideenplattform (ideen.mopilot.website) hat ihre eigene Auth-Logik im Frontend (`useAuth` Hook), die direkt JWT-basiert arbeitet, ohne Cookie-Middleware.

### 8.8 Header-Anzeige des eingeloggten Users

Auf allen drei Plattformen wird der eingeloggte User im Header angezeigt:

**mopilot.website** (`/opt/mopilot/frontend/app/page.tsx`):
```
Rollenbasiertes Demo Cockpit · {name} ({Rolle})
```
- Liest `user` aus localStorage
- ROLE_LABELS-Mapping für deutsche Rollennamen

**ideen.mopilot.website** (`/opt/mopilot/ideen/frontend/src/components/Header.tsx`):
```
Ideenplattform · {name} ({role_name || user_type})
```
- Nutzt `useAuth` Hook, User-Objekt hat `role_name` Property
- role_name kommt vom Backend (UserOut Schema mit `role_name` Feld)

**zeo-kunden.mopilot.website** (`/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/components/Header.tsx`):
```
powered by MoPilot · {name} ({Rolle})
```
- Liest `user` aus localStorage
- ROLE_LABELS-Mapping für deutsche Rollennamen

### 8.9 JWT-Token und Passwort-Hashing

**JWT-Konfiguration:**

| Eigenschaft | Hauptsystem | Ideenplattform |
|-------------|-------------|----------------|
| Bibliothek | python-jose | PyJWT |
| Algorithmus | HS256 | HS256 |
| Gültigkeit | 8 Stunden | (Standard) |
| Claims | sub, email, role, operator, name | sub (user-id), purpose |
| Secret Key | mopilot-jwt-secret-change-in-production | (aus .env) |

**Passwort-Hashing:**

Beide Systeme verwenden `passlib[bcrypt]` mit bcrypt-Hashing. Die Hashes sind **direkt kompatibel** — ein in der Ideenplattform gesetztes Passwort kann ohne Neuberechnung in der mopilot-DB verwendet werden.

### 8.10 Demo-Accounts (Seeded Users)

**In der mopilot-DB (seed.py):** 12 Demo-Accounts mit Passwort `mopilot2026`:

| Rolle | E-Mail | Name | Operator |
|-------|--------|------|----------|
| ENDKUNDE | endkunde@mopilot.website | Maria Muller | zeo |
| STATIONSPATE | stationspate@mopilot.website | Thomas Weber | zeo |
| HOTLINE | hotline@mopilot.website | Sarah Schmidt | zeo |
| BETREIBER | betreiber@mopilot.website | Christian Will | zeo |
| FLOTTENMANAGEMENT | flotte@mopilot.website | Michael Braun | zeo |
| FAHRZEUGBETREUER | fahrzeug@mopilot.website | Lisa Klein | zeo |
| PLATTFORM_SUPPORT | support@mopilot.website | Jan Neumann | zeo |
| PROJEKTTRAEGER | traeger@mopilot.website | Dr. Petra Lang | zeo |
| FAHRZEUGSTELLER | steller@mopilot.website | Frank Hoffmann | zeo |
| VALIDIERUNGSSTELLE | validierung@mopilot.website | Anna Fischer | zeo |
| ENDKUNDE | endkunde-cc@mopilot.website | Klaus Becker | cc |
| BETREIBER | betreiber-cc@mopilot.website | Sabine Richter | cc |

**In der mopilot_ideen-DB (seed.py):**
- 1 Admin-Account: admin@mopilot.website
- 10 Rollen mit Taglines
- 30 Seed-Ideen

**Demo-Login auf mopilot.website:**
- Benutzername: `mopilot` / Passwort: `mopilot2027` (setzt nur Cookie, kein JWT)
- Alternativ: jede der 12 Demo-E-Mails mit Passwort `mopilot2026`

### 8.11 Zusammenfassung: Auth-Architektur-Diagramm

```
+--[ Registrierung ]--------------------------------------+
|                                                          |
|  ideen.mopilot.website/register                          |
|  → User in mopilot_ideen DB (email_verified=false)       |
|  → Verify-Mail (IONOS SMTP)                              |
|  → Nach Verify: Sync → mopilot DB                        |
|                                                          |
+--[ Passwort-Reset ]--------------------------------------+
|                                                          |
|  ideen.mopilot.website/passwort-zuruecksetzen            |
|  → Neuer Hash in mopilot_ideen DB                        |
|  → Sync neuer Hash → mopilot DB                          |
|                                                          |
+--[ Login mopilot.website ]-------------------------------+
|                                                          |
|  /login (Next.js)                                        |
|  → API Route proxyt an mopilot-Backend                   |
|  → Fallback: Demo-Login (mopilot/mopilot2027)           |
|  → Setzt demo_auth Cookie + JWT in localStorage          |
|                                                          |
+--[ Login zeo-kunden.mopilot.website ]--------------------+
|                                                          |
|  /login (Next.js)                                        |
|  → API Route proxyt an mopilot-Backend                   |
|  → Setzt demo_auth Cookie + JWT in localStorage          |
|                                                          |
+--[ Login ideen.mopilot.website ]-------------------------+
|                                                          |
|  /login (React)                                          |
|  → Direkt an Ideen-Backend /api/auth/login               |
|  → JWT in localStorage (useAuth Hook)                    |
|  → Kein Cookie-Middleware (eigenes Auth-System)          |
|                                                          |
+--[ Datenbanken ]----------------------------------------+
|                                                          |
|  PostgreSQL 16 (1 Server, 2 Datenbanken):                |
|                                                          |
|  mopilot_ideen:                                          |
|    users (email, name, password_hash, role_id,           |
|           email_verified, user_type)                     |
|                                                          |
|  mopilot:                                                |
|    users (email, name, hashed_password, role [ENUM],     |
|           operator, is_active)                           |
|    → Seeded: 12 Demo-Accounts (PW: mopilot2026)         |
|    → Synced: Alle verifizierten Ideen-User               |
|                                                          |
+----------------------------------------------------------+
```

---

## 9. ZEO Kundenassistent – Entwicklung und Deployment

### 9.1 Projektbeschreibung und Ziel

Der ZEO Kundenassistent richtet sich ausschließlich an Endkunden von ZEO Carsharing. Er beantwortet alle ZEO-relevanten Fragen via KI-Chat (SSE-Streaming) und bietet fünf interaktive Module:

- **KI-Chat (Hero-Element)**: SSE-Streaming-Assistent mit ZEO-Systemkontext
- **Modul 1 – Kostenrechner**: Optimaler Tarif (eco vs. eco plus)
- **Modul 2 – ÖPNV-Karte**: Leaflet/OpenStreetMap mit 12 ZEO-Stationen
- **Modul 3 – Reichweiten-Guide**: Temperaturabhängige Reichweite für 9 Fahrzeugmodelle
- **Modul 4 – Fahrzeugkatalog**: Filterbare Kacheln mit Specs
- **Modul 5 – Onboarding**: 6-Schritt-Guide und FAQ-Akkordeon

### 9.2 Technische Architektur

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14, TailwindCSS (custom zeo-Palette) | Cookie-Middleware, Auth-Proxy, HOSTNAME=0.0.0.0 |
| Backend | FastAPI (Python 3.11) | SSE-Streaming, /api/health Endpoint |
| KI-Modell | Claude claude-sonnet-4-6 | Anthropic API |
| Datenhaltung | Statische JSON-Dateien | vehicles, tariffs, stations, faq |
| Auth | Proxy an mopilot-Backend | AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000 |
| Reverse Proxy | Traefik (via Coolify) | SSL, Routing, traefik.docker.network=coolify |
| Deployment | Docker Compose | restart: unless-stopped, Health-Checks, ab v0.5 via CI/CD |

**ZEO Custom Tailwind-Palette:**
```
zeo-50: #f0fdf4, zeo-100: #dcfce7, ..., zeo-600: #00a651 (Primär), ..., zeo-800: #006b33, zeo-900: #14532d
```

### 9.3 Entwicklungsprozess

Die Applikation wurde in einer einzigen Session mit Claude Code entwickelt (35 Dateien, 2.736 Codezeilen). Datenbasis aus vier PDF-Dateien extrahiert.

### 9.4 Deployment-Ablauf

Ab v0.5 automatisch via CI/CD:
```
git push master
  → rsync MoPilot_ZEO_Kunden/ → /opt/zeo-kunden/
  → docker compose up -d --build
  → Live unter zeo-kunden.mopilot.website
```

### 9.5 Live-System

| Ort | Pfad / URL |
|-----|------------|
| Lokal | C:\Projekte\MoPilot\MoPilot_ZEO_Kunden\ |
| GitHub | github.com/JamesMz05/mopilot (master) |
| Server (Git-Quelle) | /opt/mopilot/MoPilot_ZEO_Kunden/ |
| Server (laufend) | /opt/zeo-kunden/ |
| Frontend | https://zeo-kunden.mopilot.website |
| Backend | https://api.zeo-kunden.mopilot.website/api/health |

---

## 10. Nächste Schritte

### Schritt 1: Ideenplattform in CI/CD integrieren
**Priorität: Hoch | Aufwand: 0,5 Tage | Status: Offen**

Die Ideenplattform wird aktuell manuell deployed. Integration in die GitHub Actions Pipeline (rsync + docker compose rebuild).

### Schritt 2: SSE-Streaming im Hauptsystem-Chat aktivieren
**Priorität: Hoch | Aufwand: 1 Tag | Status: Offen**

Das Backend hat bereits einen `/api/chat/stream` Endpoint (SSE), aber das Frontend nutzt aktuell nur den synchronen `/api/chat/send` Endpoint.

### Schritt 3: hotline.mopilot.website entwickeln
**Priorität: Hoch | Aufwand: 3–4 Tage | Status: Bereit**

Internes Tool für ZEO Carsharing Hotline-Mitarbeiter (siehe Kapitel 11).

### Schritt 4: Rollenspezifische System-Prompts verfeinern
**Priorität: Mittel | Aufwand: 2–3 Tage | Status: Offen**

### Schritt 5: Monitoring-Alerting + Ideen-Monitore
**Priorität: Mittel | Aufwand: 0,5 Tage | Status: Offen**

Uptime Kuma um Monitore für ideen.mopilot.website erweitern. E-Mail-Alerting einrichten.

### Schritt 6: SSH-Key-Auth einrichten
**Priorität: Niedrig | Aufwand: 0,5 Tage | Status: Offen**

### Zeitplan-Übersicht

| Schritt | Aufwand | Priorität | Status |
|---------|---------|-----------|--------|
| CI/CD + Swap + Restart | 1–2 Tage | Kritisch | Erledigt (v0.4/v0.5) |
| Bugfixes, Sicherheit & Monitoring | 1 Tag | Kritisch | Erledigt (v0.6) |
| Ideenplattform + Benutzerverwaltung | 2 Tage | Hoch | Erledigt (v0.7) |
| Ideen in CI/CD | 0,5 Tage | Hoch | Offen |
| SSE-Streaming (Hauptsystem) | 1 Tag | Hoch | Offen |
| hotline.mopilot.website | 3–4 Tage | Hoch | Bereit |
| System-Prompts | 2–3 Tage | Mittel | Offen |
| Monitoring-Alerting | 0,5 Tage | Mittel | Offen |
| SSH-Keys | 0,5 Tage | Niedrig | Offen |

**Verbleibender Aufwand: 7,5–10 Arbeitstage**

---

## 11. Nächstes Sub-Projekt: hotline.mopilot.website

### 11.1 Konzept und Zielgruppe

hotline.mopilot.website ist ein internes Arbeitsmittel für Hotline-Mitarbeiter der ZEO Carsharing Hotline (Vianova eG):

- **Zielgruppe**: Hotline-Mitarbeiter (kein öffentlicher Zugang)
- **Kernfunktion**: KI-Assistent bei eingehenden Anrufen in Echtzeit
- **Wissensquelle**: Vollständige ZEO-Wissensbasis
- **Zusatzfunktionen**: Gesprächsleitfaden, Eskalationspfade, Problemszenarien

### 11.2 Technische Anforderungen

| Anforderung | Beschreibung | Priorität |
|-------------|--------------|-----------|
| Zugangsschutz | E-Mail/Passwort (User-Sync) | Hoch |
| Schnelle Antworten | < 3 Sekunden, SSE-Streaming | Hoch |
| Gesprächs-Kontext | Session-Gedächtnis | Hoch |
| Geräteoptimierung | Desktop-Browser (Headset) | Mittel |
| Datenaktualität | JSON-Dateien im Git pflegbar | Mittel |

### 11.3 Entwicklungsschritte

**Schritt 1: Inhaltsvorbereitung (0,5 Tage)**
- ZEO-Wissensbasis zusammenstellen
- Hotline-System-Prompt entwickeln
- Gesprächs-Szenarien definieren

**Schritt 2: Projektstruktur (0,5 Tage)**
```
C:\Projekte\MoPilot\MoPilot_Hotline\
  frontend/    # Next.js 14 (aus ZEO-App kopieren)
  backend/     # FastAPI (System-Prompt anpassen)
  docker-compose.yml
```

**Schritt 3: Frontend (1–2 Tage)**
- Zweispaltiges Layout: Links Chat, rechts Schnellreferenz
- Schnellzugriff-Buttons für häufigste Anrufgründe
- Gesprächs-Protokoll mit Export
- Dunkel-Modus für Headset-Arbeitsplatz

**Schritt 4: Backend (0,5 Tage)**
- System-Prompt auf Hotline-Rolle anpassen
- CORS auf hotline.mopilot.website beschränken
- Session-ID für Gesprächsgedächtnis

**Schritt 5: Deployment (0,5 Tage)**
```bash
# DNS bei IONOS
hotline.mopilot.website     A  142.132.232.211
api.hotline.mopilot.website A  142.132.232.211

# Auth: Proxy an mopilot-Backend (wie ZEO-Kunden)
# Traefik-Labels + docker compose up -d --build
```

### 11.4 Deployment-Checkliste

- [ ] Inhalt: ZEO-Wissensbasis vollständig
- [ ] Inhalt: System-Prompt mit Hotline-Team getestet
- [ ] Technik: DNS-Einträge gesetzt
- [ ] Technik: Traefik-Labels korrekt + `traefik.docker.network=coolify`
- [ ] Technik: AUTH_API_URL → mopilot-Backend (User-Sync Auth)
- [ ] Technik: `restart: unless-stopped` in docker-compose.yml
- [ ] Technik: HOSTNAME=0.0.0.0 in docker-compose.yml und Dockerfile
- [ ] Technik: Health-Checks für Frontend und Backend
- [ ] Technik: CORS auf hotline.mopilot.website beschränkt
- [ ] Technik: CI/CD Workflow um Hotline erweitert
- [ ] Technik: Uptime Kuma Monitore hinzufügen
- [ ] Test: Chat mit Beispiel-Anrufszenarien
- [ ] Test: SSL-Zertifikat aktiv
- [ ] Test: `/api/health` positiv
- [ ] Abnahme: Demo mit Hotline-Team

### 11.5 Zeitplan

| Phase | Aufwand | Voraussetzung |
|-------|---------|---------------|
| Inhaltsvorbereitung & Prompt | 0,5 Tage | Abstimmung mit Hotline-Team |
| Projektstruktur & Code | 0,5 Tage | ZEO-Kunden-App als Vorlage |
| Frontend-Entwicklung | 1–2 Tage | UX-Anforderungen bekannt |
| Backend-Anpassung | 0,5 Tage | System-Prompt fertig |
| Deployment & Test | 0,5 Tage | DNS & Server-Zugang |
| **GESAMT** | **3–4 Tage** | |

---

*Erstellt mit Claude Code | v0.7 – 6. März 2026*
*Änderungen gegenüber v0.6: MoPilot Ideenplattform (Kap. 7), Benutzerverwaltung & plattformübergreifende Authentifizierung (Kap. 8), User-Sync, E-Mail-Verifizierung, Passwort-Reset, echte Logins auf allen Plattformen, Header-User-Anzeige, aktualisierte Architektur-Diagramme und Container-Liste*
